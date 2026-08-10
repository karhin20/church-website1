import { supabase } from '@/lib/supabase';

export const initializeFirebase = async () => Promise.resolve();
export const getFirebaseAuth = () => supabase.auth;
export const getFirebaseFirestore = () => supabase;
export const getFirebaseStorage = () => supabase.storage;
export const isFirebaseInitialized = () => true;
export const auth = supabase.auth;
export const firestore = supabase;