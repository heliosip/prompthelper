export interface Template {
  id: string;
  name: string;
  content: string;
  description?: string;
  user_id?: string;
  ai_model_id?: string;
  is_standard: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PromptSettings {
  id?: string;
  template_id?: string;
  temperature: number;
  tone: string;
  style: string;
  max_tokens?: number;
  created_at?: string;
  updated_at?: string;
}

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  model_type: string;
  version?: string;
  is_active: boolean;
  created_at?: string;
}