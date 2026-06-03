import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as Linking from 'expo-linking';
import { supabase } from './supabase';
import { createProfile, getProfileByUserId, updateProfile, Profile, Role, AdminDesignation } from './db';

type User = { id: string; name?: string; email: string } | null;

type AuthCtx = {
  user: User;
  profile: Profile | null;
  loading: boolean;
  role: Role;
  designation?: AdminDesignation;
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

  const role: Role = profile?.role ?? 'student';
  const designation = profile?.designation;

  const refresh = useCallback(async (sessionUser?: any) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = sessionUser || session?.user;

      if (!currentUser) {
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      const u = { id: currentUser.id, name: currentUser.user_metadata?.name, email: currentUser.email! };
      setUser(u);

      let p = await getProfileByUserId(u.id).catch((err) => {
        console.error('getProfile error:', err);
        return null;
      });

      if (!p) {
        // First sign-in
        const detected = detectRoleFromEmail(u.email);
        try {
          if (detected === 'student') {
            const local = u.email.toLowerCase().split('@')[0].toUpperCase();
            p = await createProfile({
              id: u.id, name: u.name || 'Student', email: u.email,
              role: 'student', reg: local, dept: 'CSE',
            });
          } else {
            p = await createProfile({
              id: u.id, name: u.name || 'Staff', email: u.email,
              role: 'student', designation: 'pending_staff'
            });
          }
        } catch (createErr: any) {
          console.error('Profile creation failed:', createErr);
          import('react-native').then(({ Alert }) => {
            Alert.alert('Profile Setup Failed', 'We logged you in, but failed to create your profile. Ensure you ran the Supabase schema correctly. Error: ' + createErr.message);
          });
          // Do not set user to avoid getting stuck in a redirect loop
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }
      } else if (!isStudentEmail(u.email) && p.role === 'student' && !p.designation) {
        // Fix for older test staff accounts created before the pending feature
        const updated = await updateProfile(p.id, { designation: 'pending_staff' }).catch(() => null);
        if (updated) p = updated;
      }

      setProfile(p);
    } catch (e) {
      setUser(null);
      setProfile(null);
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
  };

  const signIn = async (email: string, password: string) => {

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (name: string, email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { 
        data: { name },
        emailRedirectTo: Linking.createURL('/(auth)/login')
      }
    });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <Ctx.Provider value={{
      user, profile, loading, role, designation,
      completeOnboarding,
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
