// src/api/templates.ts

import { supabase } from '../supabaseClient';
import type { Template } from '../database.types';

// Create a new template
export const createTemplate = async (template: Partial<Template>) => {
  const { data, error } = await supabase
    .from('templates')
    .insert([template])
    .select() // Return the inserted row(s)
    .single();
  if (error) throw error;
  return data;
};

// Update an existing template
export const updateTemplate = async (templateId: string, template: Partial<Template>) => {
  const { data, error } = await supabase
    .from('templates')
    .update(template)
    .eq('id', templateId)
    .select() // Return the updated row
    .single();
  if (error) throw error;
  return data;
};

// Delete a template (optional)
export const deleteTemplate = async (templateId: string) => {
  const { data, error } = await supabase
    .from('templates')
    .delete()
    .eq('id', templateId)
    .select() // Return the deleted row
    .single();
  if (error) throw error;
  return data;
};
