import type { Family } from './types';

const SURVEYS_CACHE_KEY = 'vsm_surveys_cache';
const CACHE_TIMESTAMP_KEY = 'vsm_surveys_cache_time';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes fresh cache

export const surveyCache = {
  get: (): Family[] | null => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(SURVEYS_CACHE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as Family[];
    } catch (e) {
      console.warn('Cache read error:', e);
      return null;
    }
  },

  set: (families: Family[]): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(SURVEYS_CACHE_KEY, JSON.stringify(families));
      localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
    } catch (e) {
      console.warn('Cache write error (storage full?):', e);
    }
  },

  isStale: (): boolean => {
    if (typeof window === 'undefined') return true;
    try {
      const ts = localStorage.getItem(CACHE_TIMESTAMP_KEY);
      if (!ts) return true;
      return Date.now() - Number(ts) > CACHE_TTL_MS;
    } catch {
      return true;
    }
  },

  invalidate: (): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(SURVEYS_CACHE_KEY);
      localStorage.removeItem(CACHE_TIMESTAMP_KEY);
    } catch {}
  },
};
