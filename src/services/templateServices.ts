// src/services/templateService.ts

import { supabase } from '../utils/supabaseClient';
import type { Template, PromptSettings, AIModel } from '../types/database.types';

export interface TemplateWithSettings extends Template {
  settings?: PromptSettings;
  ai_model?: AIModel;
}

export const templateService = {
  // Fetch all templates (both standard and user-specific)
  async getTemplates(userId?: string): Promise<TemplateWithSettings[]> {
    let query = supabase
      .from('templates')
      .select(`
        *,
        prompt_settings (*),
        ai_models (*)
      `);

    // If userId is provided, include user-specific templates
    if (userId) {
      query = query.or(`is_standard.eq.true,user_id.eq.${userId}`);
    } else {
      // Only fetch standard templates if no userId
      query = query.eq('is_standard', true);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching templates:', error);
      throw error;
    }

    return data || [];
  },

  // Create a new template with settings
  async createTemplate(
    template: Omit<Template, 'id' | 'created_at' | 'updated_at'>,
    settings?: Omit<PromptSettings, 'id' | 'template_id' | 'created_at' | 'updated_at'>
  ): Promise<TemplateWithSettings> {
    // Start a transaction
    const { data: templateData, error: templateError } = await supabase
      .from('templates')
      .insert([template])
      .select()
      .single();

    if (templateError) throw templateError;

    if (settings && templateData) {
      const { error: settingsError } = await supabase
        .from('prompt_settings')
        .insert([
          {
            ...settings,
            template_id: templateData.id
          }
        ]);

      if (settingsError) throw settingsError;
    }

    // Fetch the complete template with settings
    const { data: fullTemplate, error: fetchError } = await supabase
      .from('templates')
      .select(`
        *,
        prompt_settings (*),
        ai_models (*)
      `)
      .eq('id', templateData.id)
      .single();

    if (fetchError) throw fetchError;
    return fullTemplate;
  },

  // Update an existing template and its settings
  async updateTemplate(
    templateId: string,
    template: Partial<Template>,
    settings?: Partial<PromptSettings>
  ): Promise<TemplateWithSettings> {
    // Update template
    const { error: templateError } = await supabase
      .from('templates')
      .update(template)
      .eq('id', templateId);

    if (templateError) throw templateError;

    // Update settings if provided
    if (settings) {
      const { error: settingsError } = await supabase
        .from('prompt_settings')
        .update(settings)
        .eq('template_id', templateId);

      if (settingsError) throw settingsError;
    }

    // Fetch updated template with settings
    const { data: updatedTemplate, error: fetchError } = await supabase
      .from('templates')
      .select(`
        *,
        prompt_settings (*),
        ai_models (*)
      `)
      .eq('id', templateId)
      .single();

    if (fetchError) throw fetchError;
    return updatedTemplate;
  },

  // Delete a template and its settings
  async deleteTemplate(templateId: string): Promise<void> {
    // Settings will be automatically deleted due to foreign key constraint
    const { error } = await supabase
      .from('templates')
      .delete()
      .eq('id', templateId);

    if (error) throw error;
  },

  // Fetch available AI models
  async getAIModels(): Promise<AIModel[]> {
    const { data, error } = await supabase
      .from('ai_models')
      .select('*')
      .eq('is_active', true);

    if (error) throw error;
    return data || [];
  },

  // Duplicate a template
  async duplicateTemplate(templateId: string, userId: string): Promise<TemplateWithSettings> {
    // Fetch original template with settings
    const { data: original, error: fetchError } = await supabase
      .from('templates')
      .select(`
        *,
        prompt_settings (*)
      `)
      .eq('id', templateId)
      .single();

    if (fetchError) throw fetchError;

    // Create new template
    const newTemplate = {
      ...original,
      id: undefined,
      user_id: userId,
      name: `${original.name} (Copy)`,
      is_standard: false
    };

    return this.createTemplate(newTemplate, original.prompt_settings);
  }
};

export default templateService;