-- ============================================================================
-- Supabase Schema Migration: 001_schema.sql
-- Village Survey Manager Application
-- ============================================================================

-- Enable pgcrypto extension for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. UTILITY FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to automatically update updated_at timestamp columns
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 2. TABLE DEFINITIONS
-- IMPORTANT: teams is created before profiles because profiles references teams
-- ============================================================================

-- 2.1 TEAMS TABLE
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    referral_code TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.2 PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.3 FAMILIES TABLE
CREATE TABLE IF NOT EXISTS public.families (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
    serial_no INT,
    head_name TEXT NOT NULL,
    total_members INT DEFAULT 1,
    economic_status TEXT CHECK (economic_status IS NULL OR economic_status IN ('APL', 'BPL')),
    caste TEXT,
    shg_name TEXT, -- Self Help Group
    income_source TEXT,
    women_skills TEXT,
    monthly_income NUMERIC(10,2) DEFAULT 0,
    farm_land TEXT,
    water_source TEXT,
    livestock TEXT,
    tools_machines TEXT,
    house_type TEXT,
    electricity BOOLEAN DEFAULT false,
    toilet BOOLEAN DEFAULT false,
    fuel_type TEXT,
    has_disabled BOOLEAN DEFAULT false,
    scheme_benefits TEXT,
    internet_access TEXT,
    village_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.4 FAMILY MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.family_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
    member_name TEXT NOT NULL,
    age INT,
    relationship TEXT,
    marital_status TEXT,
    education TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 3. TRIGGERS FOR UPDATED_AT
-- ============================================================================

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS set_families_updated_at ON public.families;
CREATE TRIGGER set_families_updated_at
    BEFORE UPDATE ON public.families
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- 4. USER SIGNUP TRIGGER (handle_new_user)
-- Auto-creates a profile record in public.profiles when auth.users is created
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    assigned_role TEXT := 'user';
    meta_role TEXT;
BEGIN
    meta_role := NEW.raw_user_meta_data->>'role';
    IF meta_role IN ('admin', 'user') THEN
        assigned_role := meta_role;
    END IF;

    INSERT INTO public.profiles (id, full_name, email, role)
    VALUES (
        NEW.id,
        COALESCE(
            NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
            NULLIF(TRIM(NEW.raw_user_meta_data->>'name'), ''),
            NULLIF(TRIM(SPLIT_PART(NEW.email, '@', 1)), ''),
            'User'
        ),
        NEW.email,
        assigned_role
    )
    ON CONFLICT (id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 5. PERFORMANCE INDEXES
-- ============================================================================

-- Teams indexes
CREATE INDEX IF NOT EXISTS idx_teams_admin_id ON public.teams(admin_id);
CREATE INDEX IF NOT EXISTS idx_teams_created_at ON public.teams(created_at);

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_team_id ON public.profiles(team_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Families indexes
CREATE INDEX IF NOT EXISTS idx_families_user_id ON public.families(user_id);
CREATE INDEX IF NOT EXISTS idx_families_team_id ON public.families(team_id);
CREATE INDEX IF NOT EXISTS idx_families_village_name ON public.families(village_name);
CREATE INDEX IF NOT EXISTS idx_families_serial_no ON public.families(serial_no);
CREATE INDEX IF NOT EXISTS idx_families_economic_status ON public.families(economic_status);
CREATE INDEX IF NOT EXISTS idx_families_head_name ON public.families(head_name);
CREATE INDEX IF NOT EXISTS idx_families_created_at ON public.families(created_at DESC);

-- Family Members indexes
CREATE INDEX IF NOT EXISTS idx_family_members_family_id ON public.family_members(family_id);
CREATE INDEX IF NOT EXISTS idx_family_members_member_name ON public.family_members(member_name);
CREATE INDEX IF NOT EXISTS idx_family_members_relationship ON public.family_members(relationship);

-- ============================================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 6.1 PROFILES POLICIES
-- - Users can manage own profile
-- - Team admins and members can view teammate profiles
-- ----------------------------------------------------------------------------

-- Helper function to fetch current user's team_id safely without recursion
CREATE OR REPLACE FUNCTION public.get_current_user_team_id()
RETURNS UUID AS $$
    SELECT team_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE POLICY "Users can view own profile"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (
        auth.uid() = id
        OR (team_id IS NOT NULL AND team_id = public.get_current_user_team_id())
    );

CREATE POLICY "Users can update own profile"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON public.profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete own profile"
    ON public.profiles
    FOR DELETE
    TO authenticated
    USING (auth.uid() = id);

-- ----------------------------------------------------------------------------
-- 6.2 TEAMS POLICIES
-- - Admins can manage own teams
-- - Users can read teams they belong to
-- ----------------------------------------------------------------------------

CREATE POLICY "Admins can manage own teams"
    ON public.teams
    FOR ALL
    TO authenticated
    USING (admin_id = auth.uid())
    WITH CHECK (admin_id = auth.uid());

CREATE POLICY "Users can read teams they belong to"
    ON public.teams
    FOR SELECT
    TO authenticated
    USING (
        admin_id = auth.uid()
        OR id = public.get_current_user_team_id()
    );

-- ----------------------------------------------------------------------------
-- 6.3 FAMILIES POLICIES
-- - Users manage own families
-- - Admins can manage all families in their team
-- ----------------------------------------------------------------------------

CREATE POLICY "Users can manage own families"
    ON public.families
    FOR ALL
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage team families"
    ON public.families
    FOR ALL
    TO authenticated
    USING (
        team_id IS NOT NULL AND team_id IN (
            SELECT id FROM public.teams WHERE admin_id = auth.uid()
        )
    )
    WITH CHECK (
        team_id IS NOT NULL AND team_id IN (
            SELECT id FROM public.teams WHERE admin_id = auth.uid()
        )
    );

-- ----------------------------------------------------------------------------
-- 6.4 FAMILY MEMBERS POLICIES
-- - Same as families (cascaded through family_id -> team_id)
-- ----------------------------------------------------------------------------

CREATE POLICY "Users can manage own family members"
    ON public.family_members
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.families f
            WHERE f.id = family_members.family_id
            AND f.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.families f
            WHERE f.id = family_members.family_id
            AND f.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage team family members"
    ON public.family_members
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.families f
            JOIN public.teams t ON f.team_id = t.id
            WHERE f.id = family_members.family_id
            AND t.admin_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.families f
            JOIN public.teams t ON f.team_id = t.id
            WHERE f.id = family_members.family_id
            AND t.admin_id = auth.uid()
        )
    );

-- ============================================================================
-- 7. HELPER FUNCTION: JOIN TEAM VIA REFERRAL CODE
-- ============================================================================

CREATE OR REPLACE FUNCTION public.join_team_with_referral_code(code_input TEXT)
RETURNS jsonb AS $$
DECLARE
    target_team public.teams%ROWTYPE;
BEGIN
    SELECT * INTO target_team
    FROM public.teams
    WHERE referral_code = code_input;

    IF target_team.id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Invalid referral code');
    END IF;

    UPDATE public.profiles
    SET team_id = target_team.id
    WHERE id = auth.uid();

    RETURN jsonb_build_object(
        'success', true,
        'team_id', target_team.id,
        'team_name', target_team.name
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================================
-- 8. PERMISSIONS & GRANTS
-- ============================================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.teams TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.families TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.family_members TO authenticated;

GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

GRANT EXECUTE ON FUNCTION public.update_updated_at_column() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_current_user_team_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.join_team_with_referral_code(TEXT) TO authenticated;
