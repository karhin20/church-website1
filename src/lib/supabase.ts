import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://jnxtsgjbuoafrehgnffl.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpueHRzZ2pidW9hZnJlaGduZmZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyMzUwMjEsImV4cCI6MjA2NDgxMTAyMX0.NKWWn9axSysj3AuqkGv2j6JYex0AvBOi1TiiZaGEZjA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export interface SermonItem {
  id: string;
  title: string;
  preacher: string;
  date: string;
  description: string;
  audio_url: string;
  created_at?: string;
}

export interface AnnouncementItem {
  id: string;
  title: string;
  content?: string;
  created_at?: string;
}

export interface GalleryItem {
  id: string;
  image_url: string;
  title?: string;
  created_at?: string;
}

export interface LiveEventItem {
  id: string;
  title: string;
  speaker?: string;
  description?: string;
  status: 'live' | 'ended';
  agora_channel: string;
  started_at?: string;
  ended_at?: string;
}

export interface LiveChatMessageItem {
  id: string;
  event_id: string;
  user_name: string;
  message: string;
  created_at?: string;
}
