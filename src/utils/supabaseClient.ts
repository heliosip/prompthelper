import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://isbtrsujnaskvwajzcii.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzYnRyc3VqbmFza3Z3YWp6Y2lpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgwNzUyODQsImV4cCI6MjA1MzY1MTI4NH0.ZdmhiWHVfHrXlpwsHDbcFvCGAvcIiFI8Ph40lS4-R5E';

export const supabase = createClient(supabaseUrl, supabaseKey);