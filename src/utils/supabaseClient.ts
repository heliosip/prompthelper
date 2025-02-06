// src/utils/supabaseClient.ts

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null;
let initializationPromise: Promise<ReturnType<typeof createClient<Database>>> | null = null;

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

const initializeSupabase = async () => {
  const supabaseUrl = 'https://isbtrsujnaskvwajzcii.supabase.co';
  const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzYnRyc3VqbmFza3Z3YWp6Y2lpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgwNzUyODQsImV4cCI6MjA1MzY1MTI4NH0.ZdmhiWHVfHrXlpwsHDbcFvCGAvcIiFI8Ph40lS4-R5E';

  return createClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
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
};

export const getSupabase = async () => {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  if (!initializationPromise) {
    initializationPromise = initializeSupabase().then(client => {
      supabaseInstance = client;
      return client;
    });
  }

  return initializationPromise;
};

export const initSupabaseAuth = async () => {
  try {
    const supabase = await getSupabase();
    
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) throw error;
    
    if (session) {
      await chrome.storage.local.set({ authSession: session });
    }

    supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (event === 'SIGNED_IN' && session) {
          await chrome.storage.local.set({ authSession: session });
        } else if (event === 'SIGNED_OUT') {
          await chrome.storage.local.remove('authSession');
        }
      } catch (err) {
        console.error('Auth state change error:', err);
      }
    });

  } catch (error) {
    console.error('Auth initialization error:', error);
    await chrome.storage.local.remove('authSession');
  }
};