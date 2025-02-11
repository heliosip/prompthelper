// src/services/templateSyncService.ts

import { getSupabase } from '@/utils/supabaseClient';
import type { Template } from '@/types/database.types';
import { SyncRetryHandler } from './syncRetryHandler';

export class TemplateSyncService {
  private static async getLocalTemplates(): Promise<Template[]> {
    try {
      const { templates = [] } = await chrome.storage.local.get('templates');
      return templates;
    } catch (error) {
      console.error('Error getting local templates:', error);
      throw error;
    }
  }

  private static async saveLocalTemplates(templates: Template[]): Promise<void> {
    try {
      await chrome.storage.local.set({ templates });
    } catch (error) {
      console.error('Error saving local templates:', error);
      throw error;
    }
  }

  private static async getRemoteTemplates(userId: string): Promise<Template[]> {
    return SyncRetryHandler.retryOperation(async () => {
      try {
        console.log('Fetching remote templates for user:', userId);
        const supabase = await getSupabase();
        const { data, error } = await supabase
          .from('templates')
          .select('*')
          .or('user_id.eq.' + userId + ',is_standard.eq.true');

        if (error) {
          console.error('Supabase query error:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          });
          throw error;
        }

        console.log('Successfully fetched remote templates:', data?.length || 0, 'templates');
        return data || [];
      } catch (error) {
        console.error('Error fetching remote templates:', error);
        throw error;
      }
    });
  }

  private static sanitizeTemplateData(template: Partial<Template>): Partial<Template> {
    const sanitized = { ...template };
    
    // Handle category_id
    if (!sanitized.category_id || sanitized.category_id === '') {
      delete sanitized.category_id;
    }

    // Type-safe field sanitization
    const stringFields = ['name', 'content', 'category', 'description'] as const;
    type StringField = typeof stringFields[number];
    
    stringFields.forEach(field => {
      if (field in sanitized && (sanitized[field] === undefined || sanitized[field] === null)) {
        (sanitized[field as keyof Template] as string) = '';
      }
    });

    return sanitized;
}

  static async syncTemplates(userId: string): Promise<void> {
    return SyncRetryHandler.retryOperation(async () => {
      try {
        if (!userId) {
          throw new Error('User ID is required for template sync');
        }

        console.log('Starting template sync for user:', userId);
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
            console.log('Adding remote template to local:', remote?.id);
            mergedTemplates.push(remote!);
          } else if (!remote) {
            if (!local.is_standard) {
              console.log('Syncing local template to remote:', local.id);
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
        await chrome.storage.local.set({ 
          lastSyncTime: new Date().toISOString(),
          lastSyncStatus: 'success'
        });

        console.log('Template sync completed successfully');
      } catch (error) {
        console.error('Error during template sync:', error);
        await chrome.storage.local.set({ 
          lastSyncStatus: 'error',
          lastSyncError: error instanceof Error ? error.message : 'Unknown sync error'
        });
        throw error;
      }
    });
  }

  static async syncTemplateToRemote(template: Template, userId: string): Promise<void> {
    return SyncRetryHandler.retryOperation(async () => {
      try {
        const supabase = await getSupabase();
        
        // Validate required fields
        const requiredFields: (keyof Template)[] = ['id', 'name', 'content', 'category'];
        for (const field of requiredFields) {
          if (!template[field]) {
            throw new Error(`Missing required field: ${field}`);
          }
        }
        
        console.log('Attempting to sync template:', {
          id: template.id,
          name: template.name,
          userId: userId
        });
        
        const templateToSync = this.sanitizeTemplateData({
          id: template.id,
          name: template.name,
          content: template.content,
          category: template.category,
          description: template.description ?? '',
          is_standard: false,
          user_id: userId,
          updated_at: new Date().toISOString(),
          created_at: template.created_at,
          category_id: template.category_id
        });

        console.log('Template data being sent to Supabase:', templateToSync);

        const { error } = await supabase
          .from('templates')
          .upsert(templateToSync);

        if (error) {
          console.error('Supabase upsert error details:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          });
          
          if (error.code === '23505') {
            throw new Error('A template with this ID already exists');
          } else if (error.code === '23503') {
            throw new Error('Referenced user or category does not exist');
          } else {
            throw new Error(`Template sync failed: ${error.message}`);
          }
        }

        console.log('Template synced successfully:', template.id);
      } catch (err) {
        console.error('Full error object:', err);
        
        if (err instanceof Error) {
          throw err;
        } else {
          throw new Error('Unknown error during template sync');
        }
      }
    });
  }

  static async createTemplate(
    template: Omit<Template, 'id' | 'created_at' | 'updated_at'>, 
    userId: string
  ): Promise<Template> {
    return SyncRetryHandler.retryOperation(async () => {
      try {
        if (!userId) {
          throw new Error('User ID is required to create a template');
        }

        const sanitizedTemplate = this.sanitizeTemplateData(template);
        const newTemplate: Template = {
          ...sanitizedTemplate,
          id: crypto.randomUUID(),
          user_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_standard: false,
          description: template.description || '',
        } as Template;

        console.log('Creating new template:', newTemplate.id);
        
        const localTemplates = await this.getLocalTemplates();
        await this.saveLocalTemplates([...localTemplates, newTemplate]);
        await this.syncTemplateToRemote(newTemplate, userId);
        
        return newTemplate;
      } catch (error) {
        console.error('Error creating template:', error);
        throw error;
      }
    });
  }

  static async updateTemplate(
    templateId: string,
    updates: Partial<Omit<Template, 'id' | 'created_at'>>,
    userId: string
  ): Promise<Template> {
    return SyncRetryHandler.retryOperation(async () => {
      try {
        if (!templateId || !userId) {
          throw new Error('Template ID and User ID are required for update');
        }

        const localTemplates = await this.getLocalTemplates();
        const existingTemplate = localTemplates.find(t => t.id === templateId);
        
        if (!existingTemplate) {
          throw new Error('Template not found');
        }

        if (existingTemplate.is_standard) {
          throw new Error('Cannot modify standard templates');
        }

        const sanitizedUpdates = this.sanitizeTemplateData(updates);
        const updatedTemplate: Template = {
          ...existingTemplate,
          ...sanitizedUpdates,
          id: templateId,
          updated_at: new Date().toISOString(),
          created_at: existingTemplate.created_at,
          user_id: userId
        };

        console.log('Updating template:', templateId);
        
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
    });
  }

  static async deleteTemplate(templateId: string, userId: string): Promise<void> {
    return SyncRetryHandler.retryOperation(async () => {
      try {
        if (!templateId || !userId) {
          throw new Error('Template ID and User ID are required for deletion');
        }

        console.log('Deleting template:', templateId);
        
        const supabase = await getSupabase();
        const localTemplates = await this.getLocalTemplates();
        
        const templateToDelete = localTemplates.find(t => t.id === templateId);
        if (!templateToDelete) {
          throw new Error('Template not found');
        }

        if (templateToDelete.is_standard) {
          throw new Error('Cannot delete standard templates');
        }

        const filteredTemplates = localTemplates.filter(t => t.id !== templateId);
        await this.saveLocalTemplates(filteredTemplates);

        const { error } = await supabase
          .from('templates')
          .delete()
          .eq('id', templateId)
          .eq('user_id', userId);

        if (error) {
          console.error('Error deleting remote template:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          });
          throw error;
        }

        console.log('Template deleted successfully:', templateId);
      } catch (error) {
        console.error('Error deleting template:', error);
        throw error;
      }
    });
  }
}