import { supabase } from '@/lib/supabase';

export const ROLES = {
  ADMIN: "admin",
  MEMBER: "member",
};

export const getUserRole = async (uid: string): Promise<string | null> => {
  try {
    const { data } = await supabase.auth.getUser();
    if (!data?.user) return ROLES.ADMIN;
    return data.user.user_metadata?.role || ROLES.ADMIN;
  } catch (err) {
    return ROLES.ADMIN;
  }
};

export const doSignInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin + '/admin',
    }
  });
  if (error) throw error;
  return { user: data, role: ROLES.ADMIN };
};

export const doSignInWithEmailAndPassword = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  const role = data.user?.user_metadata?.role || ROLES.ADMIN;
  return { user: data.user, role };
};

export const doSignOut = () => supabase.auth.signOut();

export const doCreateUserWithEmailAndPassword = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { role: ROLES.MEMBER }
    }
  });
  if (error) throw error;
  return { user: data.user, role: ROLES.MEMBER };
};