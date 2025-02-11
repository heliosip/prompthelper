// src/utils/supabaseClient.ts

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

// Constants for Supabase connection
const SUPABASE_URL = 'https://isbtrsujnaskvwajzcii.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzYnRyc3VqbmFza3Z3YWp6Y2lpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgwNzUyODQsImV4cCI6MjA1MzY1MTI4NH0.ZdmhiWHVfHrXlpwsHDbcFvCGAvcIiFI8Ph40lS4-R5E';

// Create custom storage adapter for Chrome extension
const createExtensionStorage = () => ({
  getItem: async (key: string): Promise<string | null> => {
    try {
      const result = await chrome.storage.local.get(key);
      return result[key] || null;
    } catch (error) {
      console.error('Storage getItem error:', error);
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await chrome.storage.local.set({ [key]: value });
    } catch (error) {
      console.error('Storage setItem error:', error);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      await chrome.storage.local.remove(key);
    } catch (error) {
      console.error('Storage removeItem error:', error);
    }
  }
});

class SupabaseService {
  private static instance: SupabaseService | null = null;
  private client: ReturnType<typeof createClient<Database>>;

  private constructor() {
    this.client = createClient<Database>(
      SUPABASE_URL,
      SUPABASE_ANON_KEY,
      {
        auth: {
          storage: createExtensionStorage(),
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false
        },
        global: {
          headers: {
            'X-Client-Info': 'prompthelper-extension'
          }
        }
      }
    );
  }

  public static getInstance(): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService();
    }
    return SupabaseService.instance;
  }

  public getClient() {
    return this.client;
  }
}

// Initialize Supabase auth
export const initSupabaseAuth = async () => {
  try {
    const supabase = getSupabase();
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error initializing Supabase auth:', error);
      throw error;
    }

    if (!session) {
      console.log('No active session found');
    } else {
      console.log('Auth session initialized successfully');
    }

    return session;
  } catch (error) {
    console.error('Failed to initialize Supabase auth:', error);
    throw error;
  }
};

// Export the getSupabase function that returns the client instance
export const getSupabase = () => SupabaseService.getInstance().getClient();

// Optional: Export a type for the Supabase client
export type SupabaseClient = ReturnType<typeof createClient<Database>>;