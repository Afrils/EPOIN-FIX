import { createClient } from '@supabase/supabase-js';
import type { Role, TipePoin } from '../types.ts';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          nama: string;
          role: Role;
          kelas_id: string | null;
          nisn: string | null;
        };
        Insert: {
          id: string;
          nama: string;
          role: Role;
          kelas_id?: string | null;
          nisn?: string | null;
        };
        Update: {
          id?: string;
          nama?: string;
          role?: Role;
          kelas_id?: string | null;
          nisn?: string | null;
        };
      };
      kelas: {
        Row: {
          id: string;
          nama: string;
          wali_kelas_id: string;
        };
        Insert: {
          id?: string;
          nama: string;
          wali_kelas_id: string;
        };
        Update: {
          id?: string;
          nama?: string;
          wali_kelas_id?: string;
        };
      };
      siswa: {
        Row: {
          id: string;
          nisn: string;
          nama: string;
          kelas_id: string;
          total_poin_pelanggaran: number;
          total_poin_prestasi: number;
          user_id: string;
        };
        Insert: {
          id?: string;
          nisn: string;
          nama: string;
          kelas_id: string;
          total_poin_pelanggaran?: number;
          total_poin_prestasi?: number;
          user_id: string;
        };
        Update: {
          id?: string;
          nisn?: string;
          nama?: string;
          kelas_id?: string;
          total_poin_pelanggaran?: number;
          total_poin_prestasi?: number;
          user_id?: string;
        };
      };
      poin_records: {
        Row: {
          id: string;
          siswa_id: string;
          guru_id: string;
          deskripsi: string;
          poin: number;
          tipe: TipePoin;
          created_at: string;
        };
        Insert: {
          id?: string;
          siswa_id: string;
          guru_id: string;
          deskripsi: string;
          poin: number;
          tipe: TipePoin;
          created_at?: string;
        };
        Update: {
          id?: string;
          siswa_id?: string;
          guru_id?: string;
          deskripsi?: string;
          poin?: number;
          tipe?: TipePoin;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
  };
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase URL and Anon Key must be provided in environment variables. Using placeholder values to prevent app crash. Supabase functionality will be disabled.");
}

// Use placeholder values if the environment variables are not set to prevent the app from crashing.
// The Supabase client will be initialized, but all API calls will fail until valid credentials are provided.
const finalUrl = supabaseUrl || 'https://fcfvjvthpchrreveuzmb.supabase.co';
const finalKey = supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjZnZqdnRocGNocnJldmV1em1iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3NDg5MDAsImV4cCI6MjA3MTMyNDkwMH0.TL_9CZp0pXZitr5g5FXSkqFfUt7kHp09IJv6gx33kxU';

export const supabase = createClient<Database>(finalUrl, finalKey);