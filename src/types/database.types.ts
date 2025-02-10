// src/types/database.types.ts

export interface Template {
  id: string;
  user_id: string;
  name: string;
  content: string;
  category: string;
  aitool: string;
  outputtype: string;
  prompttype: string;
  description?: string;
  is_standard: boolean;
  created_at: string;
  updated_at: string;
  category_id?: string;
}

export interface PromptHistory {
  id: string;
  user_id: string;
  template_id?: string;
  content: string;
  created_at: string;
  is_favorite: boolean;
}

export interface PromptSettings {
  id: string;
  template_id: string;
  ai_model_id: string;
  tone: string;
  style: string;
  temperature: number;
  max_tokens: number;
  top_p: number;
  additional_settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  model_type: string;
  version: string;
  description?: string;
  is_active: boolean;
  created_at: string;
}

export interface UserSettings {
  user_id: string;
  default_ai_tool: string;
  theme: string;
  save_history: boolean;
  notifications_enabled: boolean;
  updated_at: string;
}

export interface TemplateCategory {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      templates: {
        Row: Template;
        Insert: Omit<Template, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Template>;
      };
      prompt_history: {
        Row: PromptHistory;
        Insert: Omit<PromptHistory, 'id' | 'created_at'>;
        Update: Partial<PromptHistory>;
      };
      prompt_settings: {
        Row: PromptSettings;
        Insert: Omit<PromptSettings, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<PromptSettings>;
      };
      ai_models: {
        Row: AIModel;
        Insert: Omit<AIModel, 'id' | 'created_at'>;
        Update: Partial<AIModel>;
      };
      user_settings: {
        Row: UserSettings;
        Insert: UserSettings;
        Update: Partial<UserSettings>;
      };
      template_categories: {
        Row: TemplateCategory;
        Insert: Omit<TemplateCategory, 'id' | 'created_at'>;
        Update: Partial<TemplateCategory>;
      };
    };
  };
}