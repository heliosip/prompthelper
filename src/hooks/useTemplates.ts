// src/hooks/useTemplates.ts

import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import type { Template } from '../types/template';

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
      let query = supabase
        .from('templates')
        .select('*');

      if (userId) {
        query = query.or(`user_id.eq.${userId},is_standard.eq.true`);
      } else {
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