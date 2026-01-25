import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { db, mapDbProfileToUser } from '@/services/database';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (data: { email: string; password: string; fullName: string; phone?: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function loadUserFromSession(supabaseUser: SupabaseUser): Promise<User | null> {
  try {
    const [profile, roles] = await Promise.all([
      db.getProfile(supabaseUser.id),
      db.getUserRoles(supabaseUser.id),
    ]);
    
    if (!profile) {
      // Profile not yet created by trigger, create a minimal user
      return {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        fullName: supabaseUser.user_metadata?.full_name || supabaseUser.email || '',
        role: 'user',
        createdAt: new Date(),
      };
    }
    
    return mapDbProfileToUser(profile, roles);
  } catch (error) {
    console.error('Error loading user profile:', error);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const appUser = await loadUserFromSession(session.user);
        setUser(appUser);
        setIsAdmin(appUser?.role === 'admin');
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setIsLoading(false);
    });

    // Then check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const appUser = await loadUserFromSession(session.user);
        setUser(appUser);
        setIsAdmin(appUser?.role === 'admin');
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) throw error;
  };

  const register = async (data: { email: string; password: string; fullName: string; phone?: string }) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            full_name: data.fullName,
            phone: data.phone,
          },
        },
      });
      if (error) throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;
    
    try {
      await db.updateProfile(user.id, {
        full_name: data.fullName,
        social_name: data.socialName || null,
        phone: data.phone || null,
        cpf: data.cpf || null,
        avatar_url: data.avatarUrl || null,
        address: data.address ? JSON.parse(data.address) : null,
      });
      
      setUser(prev => prev ? { ...prev, ...data } : null);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAdmin,
        login,
        loginWithGoogle,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
