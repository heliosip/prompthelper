// src/services/templateSyncService.ts

import { getSupabase } from '@/utils/supabaseClient';
import type { Template } from '@/types/database.types';

export class TemplateSyncService {
  private static async getLocalTemplates(): Promise<Template[]> {
    const { templates = [] } = await chrome.storage.local.get('templates');
    return templates;
  }

  private static async saveLocalTemplates(templates: Template[]): Promise<void> {
    await chrome.storage.local.set({ templates });
  }

  private static async getRemoteTemplates(userId: string): Promise<Template[]> {
    try {
      const supabase = await getSupabase();
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .or(`user_id.eq.${userId},is_standard.eq.true`);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching remote templates:', error);
      throw error;
    }
  }

  static async syncTemplates(userId: string): Promise<void> {
    try {
      const supabase = await getSupabase(); // Ensure client is initialized
      const [localTemplates, remoteTemplates] = await Promise.all([
        this.getLocalTemplates(),
        this.getRemoteTemplates(userId)
      ]);

      const localMap = new Map(localTemplates.map(t => [t.id, t]));
      const remoteMap = new Map(remoteTemplates.map(t => [t.id, t]));
      
      const mergedTemplates: Template[] = [];
      const allIds = new Set([...localMap.keys(), ...remoteMap.keys()]);
      
      for (const id of allIds) {
        const local = localMap.get(id);
        const remote = remoteMap.get(id);

        if (!local) {
          mergedTemplates.push(remote!);
        } else if (!remote) {
          if (!local.is_standard) {
            await this.syncTemplateToRemote(local, userId);
          }
          mergedTemplates.push(local);
        } else {
          const localDate = new Date(local.updated_at);
          const remoteDate = new Date(remote.updated_at);
          mergedTemplates.push(localDate > remoteDate ? local : remote);
        }
      }

      await this.saveLocalTemplates(mergedTemplates);
      await chrome.storage.local.set({ lastSyncTime: new Date().toISOString() });

    } catch (error) {
      console.error('Error during template sync:', error);
      throw error;
    }
  }

  static async syncTemplateToRemote(template: Template, userId: string): Promise<void> {
    try {
      const supabase = await getSupabase();
      const { error } = await supabase
        .from('templates')
        .upsert({
          ...template,
          user_id: userId,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error syncing template to remote:', {
          message: error.message,
          details: (error as any).details,
          hint: (error as any).hint,
          code: (error as any).code,
          error
        });
      } else {
        console.error('Error syncing template to remote:', error);
      }
      throw error;
    }
  }

  static async createTemplate(
    template: Omit<Template, 'id' | 'created_at' | 'updated_at'>, 
    userId: string
  ): Promise<Template> {
    const newTemplate: Template = {
      ...template,
      id: crypto.randomUUID(),
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_standard: false,
      outputType: template.outputType || 'text',
      prompttype: template.prompttype || 'general'
    };

    try {
      const localTemplates = await this.getLocalTemplates();
      await this.saveLocalTemplates([...localTemplates, newTemplate]);
      await this.syncTemplateToRemote(newTemplate, userId);
      return newTemplate;
    } catch (error) {
      console.error('Error creating template:', error);
      throw error;
    }
  }

  static async updateTemplate(
    templateId: string,
    updates: Partial<Omit<Template, 'id' | 'created_at'>>,
    userId: string
  ): Promise<Template> {
    try {
      const localTemplates = await this.getLocalTemplates();
      const existingTemplate = localTemplates.find(t => t.id === templateId);
      
      if (!existingTemplate) {
        throw new Error('Template not found');
      }

      const updatedTemplate: Template = {
        ...existingTemplate,
        ...updates,
        id: templateId,
        updated_at: new Date().toISOString(),
        created_at: existingTemplate.created_at,
        user_id: userId
      };

      const updatedTemplates = localTemplates.map(t => 
        t.id === templateId ? updatedTemplate : t
      );

      await this.saveLocalTemplates(updatedTemplates);
      await this.syncTemplateToRemote(updatedTemplate, userId);

      return updatedTemplate;
    } catch (error) {
      console.error('Error updating template:', error);
      throw error;
    }
  }

  static async deleteTemplate(templateId: string): Promise<void> {
    try {
      const supabase = await getSupabase();
      const localTemplates = await this.getLocalTemplates();
      const filteredTemplates = localTemplates.filter(t => t.id !== templateId);
      await this.saveLocalTemplates(filteredTemplates);

      const { error } = await supabase
        .from('templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting template:', error);
      throw error;
    }
  }

  static async initializeOfflineSupport(): Promise<void> {
    try {
      const supabase = await getSupabase();
      const { data: standardTemplates } = await supabase
        .from('templates')
        .select('*')
        .eq('is_standard', true);

      if (standardTemplates) {
        await chrome.storage.local.set({ 
          standardTemplates,
          lastStandardTemplatesUpdate: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error initializing offline support:', error);
    }
  }
}