export type UserRole = 'public' | 'student' | 'industry' | 'college' | 'admin';

export type StudentNavView =
  | 'home'
  | 'profile'
  | 'edit-profile'
  | 'skills'
  | 'skill-passport'
  | 'skill-analysis'
  | 'skill-gap'
  | 'opportunities'
  | 'opportunity-detail'
  | 'applications'
  | 'ai-assistant'
  | 'settings';

export type IndustryNavView =
  | 'overview'
  | 'post-challenge'
  | 'ai-extraction'
  | 'ai-matching'
  | 'college-profile'
  | 'collaboration-request'
  | 'collaboration-requests'
  | 'workspace'
  | 'settings';

export type CollegeNavView =
  | 'overview'
  | 'profile'
  | 'opportunities'
  | 'requests'
  | 'workspace'
  | 'outcome'
  | 'settings';

export type AdminNavView =
  | 'overview'
  | 'users'
  | 'organizations'
  | 'challenges'
  | 'collaborations';

export interface SkillItem {
  id: string;
  name: string;
  category: 'Programming' | 'Web Development' | 'AI / Machine Learning' | 'Database' | 'Cloud';
  proficiency: 'Beginner' | 'Intermediate' | 'Advanced';
  verified: boolean;
}

export interface StudentProject {
  id: string;
  title: string;
  description: string;
  role: string;
  technologies: string[];
  link?: string;
  outcomes?: string;
}

export interface StudentCertification {
  id: string;
  name: string;
  issuer: string;
  date: string;
}

export interface StudentProfile {
  name: string;
  title: string;
  institution: string;
  degree: string;
  branch?: string;
  location: string;
  about: string;
  profileCompletion: number;
  targetRole: string;
  skills: SkillItem[];
  strengths: string[];
  developing: string[];
  recommendedSkills: {
    name: string;
    reason: string;
    demandCount: number;
  }[];
  projects: StudentProject[];
  certifications: StudentCertification[];
  achievements: string[];
}

export interface Opportunity {
  id: string;
  title: string;
  company: string;
  type: 'Internship' | 'Project' | 'Job' | 'Workshop' | 'Research';
  location: string;
  duration: string;
  stipend: string;
  matchScore: number; // e.g. 91
  requiredSkills: string[];
  matchingSkills: string[];
  gapSkills: string[];
  description: string;
  whatYouWillDo: string[];
  postedDate: string;
}

export interface ApplicationItem {
  id: string;
  opportunityId: string;
  opportunityTitle: string;
  company: string;
  type: string;
  appliedDate: string;
  status: 'Applied' | 'Under Review' | 'Accepted' | 'Rejected';
  feedback?: string;
}

export interface IndustryChallenge {
  id: string;
  title: string;
  company?: string;
  department?: string;
  description: string;
  requiredSkills: string[];
  domain: string;
  collaborationType: 'Student Project' | 'Academic Collaboration' | 'Research' | 'Internship' | string;
  academicMatchesCount: number;
  status: 'Finding Partners' | 'Collaboration Active' | 'Completed' | 'Draft' | 'published' | 'closed' | string;
}

export interface AcademicMatch {
  id: string;
  collegeName: string;
  matchScore: number; // e.g. 92
  location: string;
  strengths: string[];
  compatibility: {
    skills: number;
    domain: number;
    infrastructure: number;
    collaborationFit: number;
  };
  keyFacilities: string[];
  facultyCount: number;
  activeStudents: number;
  pastCollaborations: number;
}

export interface CollegeDetail {
  id: string;
  name: string;
  tagline: string;
  location?: string;
  website?: string;
  about: string;
  capabilities: {
    faculty: number;
    students: string | number;
    specializedLabs: number;
    relevantProjects: string | number;
  };
  areasOfExpertise: string[];
  facilities: string[];
  industryCollaborationsCompleted: number;
  departments?: string[];
}

export interface WorkspaceMilestone {
  id: string;
  title: string;
  status: 'completed' | 'in-progress' | 'pending';
  targetDate: string;
  deliverable: string;
}

export interface WorkspaceUpdate {
  id: string;
  author: string;
  role: string;
  date: string;
  message: string;
}

export interface CollaborationWorkspace {
  id: string;
  challengeTitle: string;
  industryPartner: string;
  academicPartner: string;
  status: 'In Progress' | 'Completed';
  progressPercentage: number;
  milestones: WorkspaceMilestone[];
  team: {
    name: string;
    role: string;
    organization: string;
  }[];
  updates: WorkspaceUpdate[];
}
