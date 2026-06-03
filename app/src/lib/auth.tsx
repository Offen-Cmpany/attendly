import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from './supabase';
import { createProfile, getProfileByUserId, updateProfile, Profile, Role, AdminDesignation } from './db';

type User = { id: string; name?: string; email: string } | null;

type AuthCtx = {
  user: User;
  profile: Profile | null;
  loading: boolean;
  role: Role;
  designation?: AdminDesignation;
  needsOnboarding: boolean;
  completeOnboarding: (role: Role, designation?: AdminDesignation) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

const COLLEGE_DOMAIN = 'cekottarakkara.ac.in';

export function detectRoleFromEmail(email: string): Role | null {
  const lower = email.toLowerCase();
  if (!lower.endsWith(`@${COLLEGE_DOMAIN}`)) return null;
  const local = lower.split('@')[0];
  if (local.startsWith('cek')) return 'student';
  return null;
}

export function isCollegeEmail(email: string): boolean {
  return email.toLowerCase().endsWith(`@${COLLEGE_DOMAIN}`);
}

export function isStudentEmail(email: string): boolean {
  return detectRoleFromEmail(email) === 'student';
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  const role: Role = profile?.role ?? 'student';
  const designation = profile?.designation;

  const refresh = useCallback(async (sessionUser?: any) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = sessionUser || session?.user;

      if (!currentUser) {
        setUser(null);
        setProfile(null);
        setNeedsOnboarding(false);
        setLoading(false);
        return;
      }

      const u = { id: currentUser.id, name: currentUser.user_metadata?.name, email: currentUser.email! };
      setUser(u);

      let p = await getProfileByUserId(u.id).catch(() => null);

      if (!p) {
        // First sign-in
        const detected = detectRoleFromEmail(u.email);
        if (detected === 'student') {
          const local = u.email.toLowerCase().split('@')[0].toUpperCase();
          p = await createProfile({
            id: u.id, name: u.name || 'Student', email: u.email,
            role: 'student', reg: local, dept: 'CSE',
          }).catch(() => null);
          setNeedsOnboarding(false);
        } else {
          p = await createProfile({
            id: u.id, name: u.name || 'Staff', email: u.email,
            role: 'student', // temporary until onboarding
          }).catch(() => null);
          setNeedsOnboarding(true);
        }
      } else if (!isStudentEmail(u.email) && p.role === 'student' && !p.designation) {
        setNeedsOnboarding(true);
      } else {
        setNeedsOnboarding(false);
      }

      setProfile(p);
    } catch (e) {
      setUser(null);
      setProfile(null);
      setNeedsOnboarding(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      refresh(session?.user);
    });
    return () => subscription.unsubscribe();
  }, [refresh]);

  const completeOnboarding = async (newRole: Role, newDesignation?: AdminDesignation) => {
    if (!profile) return;
    const data: Partial<Profile> = { role: newRole };
    if (newDesignation) data.designation = newDesignation;
    const updated = await updateProfile(profile.id, data).catch(() => null);
    if (updated) setProfile(updated);
    setNeedsOnboarding(false);
  };

  const signIn = async (email: string, password: string) => {
    // Demo bypass since db might be empty
    if (email === 'demo@cekottarakkara.ac.in' || email.startsWith('teacher') || email.startsWith('admin')) {
        const id = 'demo_' + Date.now();
        setUser({ id, name: email.split('@')[0], email });
        if (email.startsWith('teacher2')) {
          setProfile({ id, name: 'Prof. Smith', email, role: 'teacher', is_class_advisor: false } as Profile);
        } else if (email.startsWith('teacher')) {
          setProfile({ id, name: 'Dr. Rajesh', email, role: 'teacher', is_class_advisor: true, advisor_batch_id: 'b1' } as Profile);
        } else if (email.startsWith('admin')) {
          setProfile({ id, name: 'Admin HOD', email, role: 'admin', designation: 'hod' } as Profile);
        } else {
          setProfile({ id, name: 'Student', email, role: 'student', reg: 'CEK22CS099', dept: 'CSE', program: 'B.Tech CSE', semester: 6, batch_id: 'b1' } as Profile);
        }
        setNeedsOnboarding(false);
        return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (name: string, email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } }
    });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setNeedsOnboarding(false);
  };

  return (
    <Ctx.Provider value={{
      user, profile, loading, role, designation,
      needsOnboarding, completeOnboarding,
      signIn, signUp, signOut, refresh,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth must be used within AuthProvider');
  return v;
}
