import React, { createContext, useContext, useEffect, useState } from 'react';
import { authApi, setOnSessionExpired, tokenStorage } from '../services/api';
import { UserRole } from '../types';

export interface AuthUserProfile {
  id: string;
  full_name: string;
  email?: string;
  role: string;
  avatar_url?: string;
  phone?: string;
}

interface AuthContextType {
  user: { id: string; email?: string } | null;
  profile: AuthUserProfile | null;
  role: UserRole;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthUserProfile>;
  signup: (payload: {
    email: string;
    password: string;
    full_name: string;
    role: 'student' | 'industry' | 'college';
    phone?: string;
  }) => Promise<{ message: string; emailConfirmationRequired: boolean; profile?: AuthUserProfile }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  setRoleOverride: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [profile, setProfile] = useState<AuthUserProfile | null>(null);
  const [role, setRole] = useState<UserRole>('public');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize session on mount
  useEffect(() => {
    setOnSessionExpired(() => {
      setUser(null);
      setProfile(null);
      setRole('public');
    });

    const initAuth = async () => {
      const token = tokenStorage.getAccessToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const meData = await authApi.getMe();
        if (meData && meData.user) {
          setUser(meData.user);
          if (meData.profile) {
            setProfile(meData.profile);
            const userRole = (meData.profile.role || meData.role || 'public') as UserRole;
            setRole(userRole);
          }
        }
      } catch (err) {
        tokenStorage.clearTokens();
        setUser(null);
        setProfile(null);
        setRole('public');
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<AuthUserProfile> => {
    const res = await authApi.login({ email, password });
    if (res.session?.access_token) {
      tokenStorage.setAccessToken(res.session.access_token);
      if (res.session.refresh_token) {
        tokenStorage.setRefreshToken(res.session.refresh_token);
      }
    }

    if (res.user) {
      setUser(res.user);
    }

    const userProfile = res.profile || {
      id: res.user.id,
      full_name: res.user.email?.split('@')[0] || 'User',
      email: res.user.email,
      role: 'student',
    };

    setProfile(userProfile);
    const userRole = (userProfile.role || 'student') as UserRole;
    setRole(userRole);

    return userProfile;
  };

  const signup = async (payload: {
    email: string;
    password: string;
    full_name: string;
    role: 'student' | 'industry' | 'college';
    phone?: string;
  }) => {
    const res = await authApi.signup(payload);

    if (res.session?.access_token) {
      tokenStorage.setAccessToken(res.session.access_token);
      if (res.session.refresh_token) {
        tokenStorage.setRefreshToken(res.session.refresh_token);
      }
      if (res.user) {
        setUser(res.user);
      }
      if (res.profile) {
        setProfile(res.profile);
        setRole(payload.role as UserRole);
      }
    }

    return {
      message: res.message || 'Registration successful.',
      emailConfirmationRequired: !!res.email_confirmation_required,
      profile: res.profile,
    };
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore network errors on logout
    } finally {
      tokenStorage.clearTokens();
      setUser(null);
      setProfile(null);
      setRole('public');
    }
  };

  const refreshProfile = async () => {
    try {
      const meData = await authApi.getMe();
      if (meData?.user) {
        setUser(meData.user);
      }
      if (meData?.profile) {
        setProfile(meData.profile);
        setRole((meData.profile.role || 'public') as UserRole);
      }
    } catch {
      // Keep existing state
    }
  };

  const setRoleOverride = (newRole: UserRole) => {
    setRole(newRole);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        isLoading,
        isAuthenticated: !!user && role !== 'public',
        login,
        signup,
        logout,
        refreshProfile,
        setRoleOverride,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
