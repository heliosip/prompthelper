// src/utils/supabaseClient.ts

import { createClient } from '@supabase/supabase-js';
import type { Database } from './types/database.types';

// Constants for Supabase connection
const SUPABASE_URL = 'https://isbtrsujnaskvwajzcii.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzYnRyc3VqbmFza3Z3YWp6Y2lpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgwNzUyODQsImV4cCI6MjA1MzY1MTI4NH0.ZdmhiWHVfHrXlpwsHDbcFvCGAvcIiFI8Ph40lS4-R5E';

// Create Supabase client with custom storage adapter for Chrome extension
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

// Initialize Supabase client
export const supabase = createClient<Database>(
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