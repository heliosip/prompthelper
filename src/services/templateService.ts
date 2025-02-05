// src/services/templateService.ts

import { supabase } from '../utils/supabaseClient';
import type { Template } from '../types/database.types';

export interface TemplateWithSettings extends Template {
  settings?: {
    temperature?: number;
    tone?: string;
    style?: string;
  };
}

export const templateService = {
  async getTemplates(userId?: string): Promise<TemplateWithSettings[]> {
    const query = supabase.client
      .from('templates')
      .select('*')
      .eq(userId ? 'user_id' : 'is_standard', userId || true);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async createTemplate(
    template: Omit<Template, 'id' | 'created_at' | 'updated_at'>,
    settings?: {
      temperature?: number;
      tone?: string;
      style?: string;
    }
  ): Promise<TemplateWithSettings> {
    const { data: templateData, error: templateError } = await supabase.client
      .from('templates')
      .insert([template])
      .select()
      .single();

    if (templateError) throw templateError;

    if (settings && templateData) {
      // Store settings in local storage instead since we don't have a settings table
      await chrome.storage.local.set({
        [`template_settings_${templateData.id}`]: settings
      });
    }

    return {
      ...templateData,
      settings
    };
  },

  async getTemplateById(templateId: string): Promise<TemplateWithSettings> {
    const [templateResult, settings] = await Promise.all([
      supabase.client
        .from('templates')
        .select('*')
        .eq('id', templateId)
        .single(),
      chrome.storage.local.get(`template_settings_${templateId}`)
    ]);

    if (templateResult.error) throw templateResult.error;

    return {
      ...templateResult.data,
      settings: settings[`template_settings_${templateId}`]
    };
  },

  async updateTemplate(
    templateId: string,
    template: Partial<Template>,
    settings?: {
      temperature?: number;
      tone?: string;
      style?: string;
    }
  ): Promise<TemplateWithSettings> {
    const { error: templateError } = await supabase.client
      .from('templates')
      .update(template)
      .eq('id', templateId);

    if (templateError) throw templateError;

    if (settings) {
      await chrome.storage.local.set({
        [`template_settings_${templateId}`]: settings
      });
    }

    return this.getTemplateById(templateId);
  },

  async deleteTemplate(templateId: string): Promise<void> {
    const { error } = await supabase.client
      .from('templates')
      .delete()
      .eq('id', templateId);

    if (error) throw error;

    // Clean up settings from local storage
    await chrome.storage.local.remove(`template_settings_${templateId}`);
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