// src/services/config.ts

interface ExtensionConfig {
    supabaseUrl: string;
    supabaseAnonKey: string;
    lastSync?: string;
    version: string;
  }
  
  export class ConfigService {
    private static CONFIG_KEY = 'extension_config';
    private static DEFAULT_CONFIG: ExtensionConfig = {
      // These values are from your existing supabaseClient.ts
      supabaseUrl: 'https://isbtrsujnaskvwajzcii.supabase.co',
      supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzYnRyc3VqbmFza3Z3YWp6Y2lpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgwNzUyODQsImV4cCI6MjA1MzY1MTI4NH0.ZdmhiWHVfHrXlpwsHDbcFvCGAvcIiFI8Ph40lS4-R5E',
      version: '1.0.0'
    };
  
    static async initialize(): Promise<void> {
      const existingConfig = await this.getConfig();
      if (!existingConfig) {
        await this.saveConfig(this.DEFAULT_CONFIG);
      }
    }
  
    static async getConfig(): Promise<ExtensionConfig | null> {
      try {
        const result = await chrome.storage.local.get(this.CONFIG_KEY);
        return result[this.CONFIG_KEY] || null;
      } catch (error) {
        console.error('Error getting config:', error);
        return null;
      }
    }
  
    static async saveConfig(config: Partial<ExtensionConfig>): Promise<void> {
      try {
        const currentConfig = await this.getConfig();
        const newConfig = {
          ...this.DEFAULT_CONFIG,
          ...currentConfig,
          ...config,
        };
        await chrome.storage.local.set({ [this.CONFIG_KEY]: newConfig });
      } catch (error) {
        console.error('Error saving config:', error);
        throw error;
      }
    }
  
    static async getSupabaseConfig(): Promise<{ url: string; anonKey: string }> {
      const config = await this.getConfig();
      if (!config) {
        throw new Error('Configuration not initialized');
      }
      return {
        url: config.supabaseUrl,
        anonKey: config.supabaseAnonKey
      };
    }
  
    static async updateLastSync(): Promise<void> {
      await this.saveConfig({
        lastSync: new Date().toISOString()
      });
    }
  }