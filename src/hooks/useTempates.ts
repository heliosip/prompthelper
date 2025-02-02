// src/hooks/useTemplates.ts

import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Template } from '../types/template';

interface UseTemplatesResult {
  templates: Template[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export const useTemplates = (userId?: string): UseTemplatesResult => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = async () => {
    setLoading(true);
    setError(null);
    try {
      // Build a query that fetches:
      // - Standard templates (is_standard = true)
      // - Custom templates for the logged-in user (user_id equals the provided userId)
      let query = supabase
        .from('templates')
        .select('*');

      if (userId) {
        // Use the `or` filter to fetch either the user's templates or the standard ones
        query = query.or(`user_id.eq.${userId},is_standard.eq.true`);
      } else {
        // If no userId is provided, only show standard templates
        query = query.eq('is_standard', true);
      }

      const { data, error } = await query;
      if (error) throw error;
      setTemplates(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [userId]);

  return { templates, loading, error, refresh: fetchTemplates };
};
