import { supabase } from '../utils/supabaseClient';
import type { Template, PromptSettings, AIModel } from '../types/database.types';

export interface TemplateWithSettings extends Template {
  settings?: PromptSettings;
  ai_model?: AIModel;
}

export const templateService = {
  async getTemplates(userId?: string): Promise<TemplateWithSettings[]> {
    const query = supabase
      .from('templates')
      .select(`*, prompt_settings (*), ai_models (*)`)
      .eq(userId ? 'user_id' : 'is_standard', userId || true);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async createTemplate(
    template: Omit<Template, 'id' | 'created_at' | 'updated_at'>,
    settings?: Omit<PromptSettings, 'id' | 'template_id' | 'created_at' | 'updated_at'>
  ): Promise<TemplateWithSettings> {
    const { data: templateData, error: templateError } = await supabase
      .from('templates')
      .insert([template])
      .select()
      .single();

    if (templateError) throw templateError;

    if (settings && templateData) {
      const { error: settingsError } = await supabase
        .from('prompt_settings')
        .insert([{ ...settings, template_id: templateData.id }]);

      if (settingsError) throw settingsError;
    }

    return this.getTemplateById(templateData.id);
  },

  async getTemplateById(templateId: string): Promise<TemplateWithSettings> {
    const { data, error } = await supabase
      .from('templates')
      .select(`*, prompt_settings (*), ai_models (*)`)
      .eq('id', templateId)
      .single();

    if (error) throw error;
    return data;
  },

  async updateTemplate(
    templateId: string,
    template: Partial<Template>,
    settings?: Partial<PromptSettings>
  ): Promise<TemplateWithSettings> {
    const { error: templateError } = await supabase
      .from('templates')
      .update(template)
      .eq('id', templateId);

    if (templateError) throw templateError;

    if (settings) {
      const { error: settingsError } = await supabase
        .from('prompt_settings')
        .upsert([{ ...settings, template_id: templateId }]);

      if (settingsError) throw settingsError;
    }

    return this.getTemplateById(templateId);
  },

  async deleteTemplate(templateId: string): Promise<void> {
    const { error } = await supabase
      .from('templates')
      .delete()
      .eq('id', templateId);

    if (error) throw error;
  },

  async getAIModels(): Promise<AIModel[]> {
    const { data, error } = await supabase
      .from('ai_models')
      .select('*')
      .eq('is_active', true);

    if (error) throw error;
    return data || [];
  },

  async processTemplate(
    content: string,
    settings: { temperature: number; tone: string; style: string }
  ): Promise<string> {
    // Add any preprocessing logic here
    const processedContent = content
      .replace('{tone}', settings.tone)
      .replace('{style}', settings.style);
    
    return processedContent;
  }
};