/**
 * CampusBridge Centralized API Client
 * Connects React Frontend to FastAPI Backend
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// Token Storage Keys
const ACCESS_TOKEN_KEY = 'campusbridge_token';
const REFRESH_TOKEN_KEY = 'campusbridge_refresh_token';

export const tokenStorage = {
  getAccessToken: (): string | null => localStorage.getItem(ACCESS_TOKEN_KEY),
  setAccessToken: (token: string): void => localStorage.setItem(ACCESS_TOKEN_KEY, token),
  getRefreshToken: (): string | null => localStorage.getItem(REFRESH_TOKEN_KEY),
  setRefreshToken: (token: string): void => localStorage.setItem(REFRESH_TOKEN_KEY, token),
  clearTokens: (): void => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

// Global session expiry handler
let onSessionExpiredCallback: (() => void) | null = null;
export const setOnSessionExpired = (cb: () => void) => {
  onSessionExpiredCallback = cb;
};

/**
 * Generic API request wrapper
 */
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = new Headers(options.headers || {});

  headers.set('Content-Type', 'application/json');

  const token = tokenStorage.getAccessToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (networkErr: any) {
    throw new ApiError(0, 'Unable to connect to the backend server. Please ensure the server is running.', networkErr);
  }

  // 401 Unauthorized handling
  if (response.status === 401) {
    tokenStorage.clearTokens();
    if (onSessionExpiredCallback && endpoint !== '/api/v1/auth/login' && endpoint !== '/api/v1/auth/signup') {
      onSessionExpiredCallback();
    }
  }

  // Parse JSON response body
  let data: any = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    try {
      data = await response.text();
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    let errorMessage = 'An error occurred while processing your request.';

    if (data && typeof data === 'object') {
      if (typeof data.detail === 'string') {
        errorMessage = data.detail;
      } else if (Array.isArray(data.detail)) {
        // FastAPI / Pydantic validation error list
        errorMessage = data.detail.map((d: any) => d.msg || JSON.stringify(d)).join(', ');
      } else if (data.message) {
        errorMessage = data.message;
      }
    } else if (typeof data === 'string' && data.length > 0) {
      errorMessage = data;
    }

    throw new ApiError(response.status, errorMessage, data);
  }

  return data as T;
}

// -----------------------------------------------------------------------------
// 1. Authentication APIs
// -----------------------------------------------------------------------------
export const authApi = {
  signup: (payload: {
    email: string;
    password: string;
    full_name: string;
    role: 'student' | 'industry' | 'college';
    phone?: string;
  }) => request<any>('/api/v1/auth/signup', { method: 'POST', body: JSON.stringify(payload) }),

  login: (payload: { email: string; password: string }) =>
    request<any>('/api/v1/auth/login', { method: 'POST', body: JSON.stringify(payload) }),

  logout: () => request<any>('/api/v1/auth/logout', { method: 'POST' }),

  getMe: () => request<any>('/api/v1/auth/me', { method: 'GET' }),
};

// -----------------------------------------------------------------------------
// 2. Student APIs
// -----------------------------------------------------------------------------
export const studentApi = {
  getProfile: () => request<any>('/api/v1/students/me', { method: 'GET' }),

  updateProfile: (payload: {
    full_name?: string;
    phone?: string;
    avatar_url?: string;
    course?: string;
    branch?: string;
    year?: number;
    graduation_year?: number;
    target_role?: string;
    bio?: string;
    github_url?: string;
    linkedin_url?: string;
    portfolio_url?: string;
  }) => request<any>('/api/v1/students/me', { method: 'PATCH', body: JSON.stringify(payload) }),

  getCatalog: () => request<any[]>('/api/v1/students/skills/catalog', { method: 'GET' }),

  getSkills: () => request<any[]>('/api/v1/students/me/skills', { method: 'GET' }),

  addSkill: (payload: {
    skill_id: string;
    proficiency_level: number;
    source?: string;
    evidence_url?: string;
  }) => request<any>('/api/v1/students/me/skills', { method: 'POST', body: JSON.stringify(payload) }),

  updateSkill: (
    skillId: string,
    payload: {
      proficiency_level?: number;
      source?: string;
      evidence_url?: string;
    }
  ) =>
    request<any>(`/api/v1/students/me/skills/${encodeURIComponent(skillId)}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  deleteSkill: (skillId: string) =>
    request<any>(`/api/v1/students/me/skills/${encodeURIComponent(skillId)}`, {
      method: 'DELETE',
    }),

  getPassport: () => request<any>('/api/v1/students/me/passport', { method: 'GET' }),
};

// -----------------------------------------------------------------------------
// 3. Industry APIs
// -----------------------------------------------------------------------------
export const industryApi = {
  getProfile: () => request<any>('/api/v1/industry/me', { method: 'GET' }),

  updateProfile: (payload: {
    full_name?: string;
    company_name?: string;
    industry_domain?: string;
    website?: string;
    description?: string;
    location?: string;
    company_size?: string;
    phone?: string;
  }) => request<any>('/api/v1/industry/me', { method: 'PATCH', body: JSON.stringify(payload) }),

  getChallenges: () => request<any[]>('/api/v1/industry/challenges', { method: 'GET' }),

  getChallenge: (id: string) =>
    request<any>(`/api/v1/industry/challenges/${encodeURIComponent(id)}`, { method: 'GET' }),

  createChallenge: (payload: {
    title: string;
    description: string;
    domain?: string;
    collaboration_type?: string;
    location?: string;
    deadline?: string;
  }) => request<any>('/api/v1/industry/challenges', { method: 'POST', body: JSON.stringify(payload) }),

  updateChallenge: (
    id: string,
    payload: {
      title?: string;
      description?: string;
      domain?: string;
      collaboration_type?: string;
      location?: string;
      deadline?: string;
    }
  ) =>
    request<any>(`/api/v1/industry/challenges/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  updateChallengeStatus: (id: string, status: string) =>
    request<any>(`/api/v1/industry/challenges/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  deleteChallenge: (id: string) =>
    request<any>(`/api/v1/industry/challenges/${encodeURIComponent(id)}`, { method: 'DELETE' }),

  analyzeChallenge: (id: string) =>
    request<any>(`/api/v1/industry/challenges/${encodeURIComponent(id)}/analyze`, { method: 'POST' }),
};

// -----------------------------------------------------------------------------
// 4. College APIs
// -----------------------------------------------------------------------------
export const collegeApi = {
  getProfile: () => request<any>('/api/v1/colleges/me', { method: 'GET' }),

  updateProfile: (payload: {
    college_name?: string;
    description?: string;
    location?: string;
    website?: string;
    full_name?: string;
    phone?: string;
  }) => request<any>('/api/v1/colleges/me', { method: 'PATCH', body: JSON.stringify(payload) }),

  getCatalog: () => request<any[]>('/api/v1/colleges/skills/catalog', { method: 'GET' }),

  getCapabilities: () => request<any[]>('/api/v1/colleges/me/capabilities', { method: 'GET' }),

  addCapability: (payload: {
    skill_id: string;
    proficiency_level: number;
    faculty_count?: number;
    infrastructure_details?: string;
  }) => request<any>('/api/v1/colleges/me/capabilities', { method: 'POST', body: JSON.stringify(payload) }),

  updateCapability: (
    capabilityId: string,
    payload: {
      proficiency_level?: number;
      faculty_count?: number;
      infrastructure_details?: string;
    }
  ) =>
    request<any>(`/api/v1/colleges/me/capabilities/${encodeURIComponent(capabilityId)}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  deleteCapability: (capabilityId: string) =>
    request<any>(`/api/v1/colleges/me/capabilities/${encodeURIComponent(capabilityId)}`, {
      method: 'DELETE',
    }),
};

// -----------------------------------------------------------------------------
// 5. Matching APIs
// -----------------------------------------------------------------------------
export const matchingApi = {
  runChallengeMatching: (challengeId: string) =>
    request<any>(`/api/v1/matching/challenges/${encodeURIComponent(challengeId)}/run`, {
      method: 'POST',
    }),

  getChallengeMatches: (challengeId: string) =>
    request<any>(`/api/v1/matching/challenges/${encodeURIComponent(challengeId)}`, {
      method: 'GET',
    }),

  getMyCollegeMatches: () => request<any>('/api/v1/matching/college/me', { method: 'GET' }),
};

// -----------------------------------------------------------------------------
// 6. Collaboration APIs (Phase 10 & 11)
// -----------------------------------------------------------------------------
export interface CollaborationRequestPayload {
  challenge_id: string;
  college_id: string;
  message?: string;
}

export interface MilestonePayload {
  title: string;
  description?: string;
  assigned_to?: string;
  due_date?: string;
  status?: string;
  progress?: number;
}

export interface ProjectUpdatePayload {
  content: string;
  milestone_id?: string;
  progress?: number;
}

export interface ProjectOutcomePayload {
  title: string;
  summary?: string;
  repository_url?: string;
  demo_url?: string;
  documentation_url?: string;
  technologies?: any;
  outcome_status?: string;
}

export const collaborationApi = {
  // Requests
  createRequest: (payload: CollaborationRequestPayload) =>
    request<any>('/api/v1/collaborations/requests', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getRequests: (params?: { status?: string; challenge_id?: string }) => {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.challenge_id) query.set('challenge_id', params.challenge_id);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<{ total: number; requests: any[] }>(`/api/v1/collaborations/requests${qs}`, {
      method: 'GET',
    });
  },

  getRequest: (requestId: string) =>
    request<any>(`/api/v1/collaborations/requests/${encodeURIComponent(requestId)}`, {
      method: 'GET',
    }),

  acceptRequest: (requestId: string) =>
    request<any>(`/api/v1/collaborations/requests/${encodeURIComponent(requestId)}/accept`, {
      method: 'PATCH',
    }),

  rejectRequest: (requestId: string) =>
    request<any>(`/api/v1/collaborations/requests/${encodeURIComponent(requestId)}/reject`, {
      method: 'PATCH',
    }),

  // Collaborations Workspace
  getCollaborations: (status?: string) => {
    const qs = status ? `?status=${encodeURIComponent(status)}` : '';
    return request<{ total: number; collaborations: any[] }>(`/api/v1/collaborations${qs}`, {
      method: 'GET',
    });
  },

  getCollaboration: (collaborationId: string) =>
    request<any>(`/api/v1/collaborations/${encodeURIComponent(collaborationId)}`, {
      method: 'GET',
    }),

  updateCollaboration: (
    collaborationId: string,
    payload: {
      title?: string;
      description?: string;
      status?: string;
      end_date?: string;
    }
  ) =>
    request<any>(`/api/v1/collaborations/${encodeURIComponent(collaborationId)}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  // Milestones
  getMilestones: (collaborationId: string) =>
    request<any[]>(`/api/v1/collaborations/${encodeURIComponent(collaborationId)}/milestones`, {
      method: 'GET',
    }),

  createMilestone: (collaborationId: string, payload: MilestonePayload) =>
    request<any>(`/api/v1/collaborations/${encodeURIComponent(collaborationId)}/milestones`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateMilestone: (collaborationId: string, milestoneId: string, payload: Partial<MilestonePayload>) =>
    request<any>(
      `/api/v1/collaborations/${encodeURIComponent(collaborationId)}/milestones/${encodeURIComponent(milestoneId)}`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }
    ),

  deleteMilestone: (collaborationId: string, milestoneId: string) =>
    request<{ status: string; message: string }>(
      `/api/v1/collaborations/${encodeURIComponent(collaborationId)}/milestones/${encodeURIComponent(milestoneId)}`,
      {
        method: 'DELETE',
      }
    ),

  // Project Updates
  getUpdates: (collaborationId: string) =>
    request<any[]>(`/api/v1/collaborations/${encodeURIComponent(collaborationId)}/updates`, {
      method: 'GET',
    }),

  createUpdate: (collaborationId: string, payload: ProjectUpdatePayload) =>
    request<any>(`/api/v1/collaborations/${encodeURIComponent(collaborationId)}/updates`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Project Outcomes
  getOutcome: (collaborationId: string) =>
    request<any>(`/api/v1/collaborations/${encodeURIComponent(collaborationId)}/outcome`, {
      method: 'GET',
    }),

  saveOutcome: (collaborationId: string, payload: ProjectOutcomePayload) =>
    request<any>(`/api/v1/collaborations/${encodeURIComponent(collaborationId)}/outcome`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};

