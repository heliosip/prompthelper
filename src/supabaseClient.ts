// src/supabaseClient.ts

import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Use Vite environment variables (ensure these are set in your .env file)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Create the client with the Database type
export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
