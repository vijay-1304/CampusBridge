-- ==============================================================================
-- CampusBridge: Supabase / PostgreSQL Database Schema
-- Phase 3: Database & Migration Foundation
-- ==============================================================================
-- Target Architecture:
--   React Frontend -> FastAPI Backend -> Supabase (Auth, Postgres, Storage) + Gemini API
--
-- Tables Defined (17):
--   1.  profiles                  - Common identity linked to auth.users
--   2.  colleges                  - College entity profiles
--   3.  students                  - Student academic profiles
--   4.  industry_profiles         - Industry / enterprise profiles
--   5.  skills                    - Master catalog of verifiable skills
--   6.  student_skills            - Student skill claims with evidence & verification
--   7.  college_capabilities      - Institutional faculty & infrastructure capabilities
--   8.  challenges                - Industry-posted real-world problem statements
--   9.  challenge_requirements   - Explicit & AI-extracted skill requirements
--   10. matches                   - Algorithmic matching between challenges and colleges
--   11. collaboration_requests    - Formal collaboration invitations/proposals
--   12. collaborations            - Active/completed academic-industry collaboration projects
--   13. milestones                - Project deliverables & progress tracking
--   14. project_updates           - Chronological progress reports & check-ins
--   15. project_outcomes          - Verified project outcomes & deliverables
--   16. opportunities             - Real internships, research, jobs, and courses
--   17. applications              - Student applications to posted opportunities
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. EXTENSIONS
-- ------------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 2. HELPER FUNCTIONS & TRIGGERS
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------------------------
-- 3. IDENTITY & CORE PROFILES
-- ------------------------------------------------------------------------------

-- 1. profiles
-- Common identity table referencing Supabase Auth auth.users.
-- No passwords or sensitive auth credentials stored here.
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT,
    role TEXT NOT NULL CHECK (role IN ('student', 'industry', 'college', 'admin')),
    avatar_url TEXT NULL,
    phone TEXT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. colleges
-- Academic institution records. Defined before students so students can reference colleges.
CREATE TABLE IF NOT EXISTS public.colleges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
    college_name TEXT NOT NULL,
    description TEXT,
    location TEXT,
    website TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. students
-- Student academic profiles linked 1:1 with profiles.id.
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    college_id UUID NULL REFERENCES public.colleges(id) ON DELETE SET NULL,
    course TEXT,
    branch TEXT,
    year INTEGER CHECK (year >= 1 AND year <= 6),
    graduation_year INTEGER,
    target_role TEXT,
    bio TEXT,
    github_url TEXT,
    linkedin_url TEXT,
    portfolio_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 4. industry_profiles
-- Enterprise / company profiles linked 1:1 with profiles.id.
CREATE TABLE IF NOT EXISTS public.industry_profiles (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    industry_domain TEXT,
    website TEXT,
    description TEXT,
    location TEXT,
    company_size TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ------------------------------------------------------------------------------
-- 4. SKILLS & CAPABILITIES
-- ------------------------------------------------------------------------------

-- 5. skills
-- Master catalog of distinct technical and professional skills.
CREATE TABLE IF NOT EXISTS public.skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    category TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 6. student_skills
-- Student skill associations with proficiency, source provenance, and verification state.
-- Credibility Rule: AI generation does NOT automatically set is_verified = true.
CREATE TABLE IF NOT EXISTS public.student_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE RESTRICT,
    proficiency_level INTEGER CHECK (proficiency_level BETWEEN 1 AND 5),
    source TEXT CHECK (source IN ('self_reported', 'assessment', 'project', 'certificate', 'collaboration')),
    evidence_url TEXT,
    is_verified BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    CONSTRAINT uq_student_skill UNIQUE (student_id, skill_id)
);

-- 7. college_capabilities
-- Institutional academic capabilities, faculty bandwidth, and lab infrastructure.
CREATE TABLE IF NOT EXISTS public.college_capabilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE RESTRICT,
    proficiency_level INTEGER CHECK (proficiency_level BETWEEN 1 AND 5),
    faculty_count INTEGER CHECK (faculty_count >= 0),
    infrastructure_details TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    CONSTRAINT uq_college_capability UNIQUE (college_id, skill_id)
);

-- ------------------------------------------------------------------------------
-- 5. INDUSTRY CHALLENGES
-- ------------------------------------------------------------------------------

-- 8. challenges
-- Real-world problem statements posted by industry partners.
CREATE TABLE IF NOT EXISTS public.challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    industry_id UUID NOT NULL REFERENCES public.industry_profiles(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    domain TEXT,
    collaboration_type TEXT,
    status TEXT DEFAULT 'draft' NOT NULL CHECK (status IN ('draft', 'published', 'in_review', 'matched', 'collaborating', 'completed', 'closed')),
    location TEXT,
    deadline TIMESTAMPTZ,
    ai_summary TEXT NULL,
    ai_requirements JSONB NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 9. challenge_requirements
-- Structured skill requirements for challenges (manual or AI-extracted).
CREATE TABLE IF NOT EXISTS public.challenge_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE RESTRICT,
    required_level INTEGER CHECK (required_level BETWEEN 1 AND 5),
    importance_weight NUMERIC CHECK (importance_weight >= 0 AND importance_weight <= 1.0),
    is_ai_extracted BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    CONSTRAINT uq_challenge_requirement UNIQUE (challenge_id, skill_id)
);

-- ------------------------------------------------------------------------------
-- 6. MATCHING & COLLABORATION
-- ------------------------------------------------------------------------------

-- 10. matches
-- Scored affinity between industry challenges and institutional capabilities.
-- Weights target: 40% Skill, 25% Domain, 20% Infrastructure, 15% Collaboration Fit.
CREATE TABLE IF NOT EXISTS public.matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
    college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE,
    overall_score NUMERIC CHECK (overall_score >= 0 AND overall_score <= 100),
    skill_score NUMERIC CHECK (skill_score >= 0 AND skill_score <= 100),
    domain_score NUMERIC CHECK (domain_score >= 0 AND domain_score <= 100),
    infrastructure_score NUMERIC CHECK (infrastructure_score >= 0 AND infrastructure_score <= 100),
    collaboration_score NUMERIC CHECK (collaboration_score >= 0 AND collaboration_score <= 100),
    reasoning TEXT,
    status TEXT DEFAULT 'suggested' NOT NULL CHECK (status IN ('suggested', 'shortlisted', 'accepted', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    CONSTRAINT uq_challenge_college_match UNIQUE (challenge_id, college_id)
);

-- 11. collaboration_requests
-- Formal outreach requests initiated between industry and academia.
CREATE TABLE IF NOT EXISTS public.collaboration_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE RESTRICT,
    industry_id UUID NOT NULL REFERENCES public.industry_profiles(id) ON DELETE RESTRICT,
    college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE RESTRICT,
    match_id UUID NULL REFERENCES public.matches(id) ON DELETE SET NULL,
    message TEXT,
    status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    responded_at TIMESTAMPTZ NULL
);

-- 12. collaborations
-- Active agreements executed between industry and college for a challenge.
CREATE TABLE IF NOT EXISTS public.collaborations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE RESTRICT,
    industry_id UUID NOT NULL REFERENCES public.industry_profiles(id) ON DELETE RESTRICT,
    college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE RESTRICT,
    request_id UUID NOT NULL UNIQUE REFERENCES public.collaboration_requests(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active' NOT NULL CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 13. milestones
-- Discrete deliverables and stage gates within an active collaboration.
CREATE TABLE IF NOT EXISTS public.milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collaboration_id UUID NOT NULL REFERENCES public.collaborations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    assigned_to UUID NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
    due_date DATE,
    status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked')),
    progress INTEGER DEFAULT 0 NOT NULL CHECK (progress BETWEEN 0 AND 100),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    completed_at TIMESTAMPTZ NULL
);

-- 14. project_updates
-- Chronological activity feed and progress logs for collaborations.
CREATE TABLE IF NOT EXISTS public.project_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collaboration_id UUID NOT NULL REFERENCES public.collaborations(id) ON DELETE CASCADE,
    milestone_id UUID NULL REFERENCES public.milestones(id) ON DELETE SET NULL,
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    content TEXT NOT NULL,
    progress INTEGER CHECK (progress BETWEEN 0 AND 100),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 15. project_outcomes
-- Final verified outcomes, repositories, documentation, and demonstrator deliverables.
-- Serves as foundation for verifiable Skill Passport records.
CREATE TABLE IF NOT EXISTS public.project_outcomes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collaboration_id UUID NOT NULL REFERENCES public.collaborations(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    summary TEXT,
    repository_url TEXT,
    demo_url TEXT,
    documentation_url TEXT,
    technologies JSONB,
    outcome_status TEXT DEFAULT 'draft' NOT NULL CHECK (outcome_status IN ('draft', 'submitted', 'approved', 'completed')),
    completed_at TIMESTAMPTZ
);

-- ------------------------------------------------------------------------------
-- 7. OPPORTUNITIES & APPLICATIONS
-- ------------------------------------------------------------------------------

-- 16. opportunities
-- Internships, project roles, research grants, and technical certifications.
CREATE TABLE IF NOT EXISTS public.opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    posted_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('internship', 'job', 'project', 'research', 'course', 'certification')),
    domain TEXT,
    location TEXT,
    skills JSONB,
    deadline TIMESTAMPTZ,
    status TEXT DEFAULT 'draft' NOT NULL CHECK (status IN ('draft', 'published', 'closed')),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 17. applications
-- Student submissions to posted opportunities.
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    cover_message TEXT,
    status TEXT DEFAULT 'submitted' NOT NULL CHECK (status IN ('submitted', 'under_review', 'shortlisted', 'accepted', 'rejected', 'withdrawn')),
    applied_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    CONSTRAINT uq_opportunity_student_application UNIQUE (opportunity_id, student_id)
);

-- ------------------------------------------------------------------------------
-- 8. INDEXES (Optimized for Foreign Keys & Query Patterns)
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

CREATE INDEX IF NOT EXISTS idx_students_college_id ON public.students(college_id);

CREATE INDEX IF NOT EXISTS idx_student_skills_student_id ON public.student_skills(student_id);
CREATE INDEX IF NOT EXISTS idx_student_skills_skill_id ON public.student_skills(skill_id);

CREATE INDEX IF NOT EXISTS idx_college_capabilities_college_id ON public.college_capabilities(college_id);
CREATE INDEX IF NOT EXISTS idx_college_capabilities_skill_id ON public.college_capabilities(skill_id);

CREATE INDEX IF NOT EXISTS idx_challenges_industry_id ON public.challenges(industry_id);
CREATE INDEX IF NOT EXISTS idx_challenges_status ON public.challenges(status);

CREATE INDEX IF NOT EXISTS idx_challenge_requirements_challenge_id ON public.challenge_requirements(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_requirements_skill_id ON public.challenge_requirements(skill_id);

CREATE INDEX IF NOT EXISTS idx_matches_challenge_id ON public.matches(challenge_id);
CREATE INDEX IF NOT EXISTS idx_matches_college_id ON public.matches(college_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON public.matches(status);

CREATE INDEX IF NOT EXISTS idx_collaboration_requests_challenge_id ON public.collaboration_requests(challenge_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_requests_college_id ON public.collaboration_requests(college_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_requests_industry_id ON public.collaboration_requests(industry_id);

CREATE INDEX IF NOT EXISTS idx_collaborations_industry_id ON public.collaborations(industry_id);
CREATE INDEX IF NOT EXISTS idx_collaborations_college_id ON public.collaborations(college_id);
CREATE INDEX IF NOT EXISTS idx_collaborations_status ON public.collaborations(status);

CREATE INDEX IF NOT EXISTS idx_milestones_collaboration_id ON public.milestones(collaboration_id);
CREATE INDEX IF NOT EXISTS idx_milestones_assigned_to ON public.milestones(assigned_to);

CREATE INDEX IF NOT EXISTS idx_project_updates_collaboration_id ON public.project_updates(collaboration_id);
CREATE INDEX IF NOT EXISTS idx_project_outcomes_collaboration_id ON public.project_outcomes(collaboration_id);

CREATE INDEX IF NOT EXISTS idx_opportunities_posted_by ON public.opportunities(posted_by);
CREATE INDEX IF NOT EXISTS idx_opportunities_status ON public.opportunities(status);

CREATE INDEX IF NOT EXISTS idx_applications_opportunity_id ON public.applications(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_applications_student_id ON public.applications(student_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);

-- ------------------------------------------------------------------------------
-- 9. UPDATED_AT TRIGGERS
-- ------------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_colleges_updated_at ON public.colleges;
CREATE TRIGGER trg_colleges_updated_at
    BEFORE UPDATE ON public.colleges
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_students_updated_at ON public.students;
CREATE TRIGGER trg_students_updated_at
    BEFORE UPDATE ON public.students
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_industry_profiles_updated_at ON public.industry_profiles;
CREATE TRIGGER trg_industry_profiles_updated_at
    BEFORE UPDATE ON public.industry_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_student_skills_updated_at ON public.student_skills;
CREATE TRIGGER trg_student_skills_updated_at
    BEFORE UPDATE ON public.student_skills
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_challenges_updated_at ON public.challenges;
CREATE TRIGGER trg_challenges_updated_at
    BEFORE UPDATE ON public.challenges
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_collaborations_updated_at ON public.collaborations;
CREATE TRIGGER trg_collaborations_updated_at
    BEFORE UPDATE ON public.collaborations
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_applications_updated_at ON public.applications;
CREATE TRIGGER trg_applications_updated_at
    BEFORE UPDATE ON public.applications
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 10. ROW LEVEL SECURITY (RLS) PREPARATION
-- ------------------------------------------------------------------------------
-- Enable RLS across all tables for defense-in-depth security.
-- Concrete role-based and user-specific security policies will be added in Phase 4
-- after Supabase Auth is completed. Insecure catch-all policies (e.g. USING (true))
-- are intentionally omitted.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.industry_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.college_capabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaboration_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaborations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 11. MINIMAL GENERIC SKILLS SEED (Catalog Baseline)
-- ------------------------------------------------------------------------------
-- Only generic skill keywords are seeded. No fake users, colleges, or companies.
INSERT INTO public.skills (name, category, description)
VALUES
    ('Python', 'Programming', 'General-purpose programming language widely used in AI, data science, and backend development.'),
    ('JavaScript', 'Programming', 'Versatile programming language for web development and asynchronous systems.'),
    ('React', 'Web Development', 'Frontend library for building modern component-based user interfaces.'),
    ('SQL', 'Database', 'Standard language for relational database query and data manipulation.'),
    ('Machine Learning', 'AI/ML', 'Statistical algorithms and predictive modeling methodologies.'),
    ('Computer Vision', 'AI/ML', 'Visual data processing, object detection, and image analysis.'),
    ('Cloud Computing', 'Cloud', 'Design, deployment, and management of cloud-native infrastructure.'),
    ('Cybersecurity', 'Cybersecurity', 'Principles of network security, information assurance, and threat mitigation.'),
    ('IoT', 'IoT', 'Internet of Things sensor networks, embedded devices, and hardware integration.'),
    ('Data Science', 'Data Science', 'Data analysis, statistical modeling, and data visualization pipelines.')
ON CONFLICT (name) DO NOTHING;
