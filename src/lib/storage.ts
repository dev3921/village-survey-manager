/**
 * Cookie + LocalStorage hybrid storage adapter for Supabase Auth.
 * Ensures the user's login session persists for up to 1 year across browser restarts,
 * tab closures, and mobile browser cache cleanups.
 */

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 365 days in seconds

export const cookieStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === 'undefined') return null;

    // 1. Try localStorage first
    try {
      const localVal = window.localStorage.getItem(key);
      if (localVal) return localVal;
    } catch (e) {
      // localStorage may fail in strict private mode
    }

    // 2. Fallback to Cookie
    try {
      const name = `${encodeURIComponent(key)}=`;
      const cookies = document.cookie.split(';');
      for (let c of cookies) {
        c = c.trim();
        if (c.indexOf(name) === 0) {
          const val = decodeURIComponent(c.substring(name.length));
          // Restore to localStorage for fast access
          try {
            window.localStorage.setItem(key, val);
          } catch (_) {}
          return val;
        }
      }
    } catch (e) {
      console.warn('Cookie read error:', e);
    }

    return null;
  },

  setItem: (key: string, value: string): void => {
    if (typeof window === 'undefined') return;

    // 1. Save in localStorage
    try {
      window.localStorage.setItem(key, value);
    } catch (e) {}

    // 2. Save in long-lived Cookie (1 year)
    try {
      const secure = window.location.protocol === 'https:' ? '; Secure' : '';
      document.cookie = `${encodeURIComponent(key)}=${encodeURIComponent(
        value
      )}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax${secure}`;
    } catch (e) {
      console.warn('Cookie write error:', e);
    }
  },

  removeItem: (key: string): void => {
    if (typeof window === 'undefined') return;

    // 1. Remove from localStorage
    try {
      window.localStorage.removeItem(key);
    } catch (e) {}

    // 2. Remove from Cookie (expire immediately)
    try {
      document.cookie = `${encodeURIComponent(
        key
      )}=; path=/; max-age=0; SameSite=Lax`;
    } catch (e) {}
  },
};
