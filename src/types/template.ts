export interface PromptSettings {
  temperature: number;
  tone: string;
  style: string;
  max_tokens?: number;
}

export interface Template {
  id: string;
  name: string;
  content: string;
  description?: string;
  user_id?: string;
  ai_model_id?: string;
  is_standard: boolean;
  settings?: PromptSettings;
  created_at?: string;
  updated_at?: string;
}

export interface PromptHistory {
  id: string;
  content: string;
  user_id: string;
  template_id: string;
  created_at: string;
  settings?: PromptSettings;
}

export interface PromptInstance {
  templateId: string;
  content: string;
  saveToHistory: boolean;
  settings?: PromptSettings;
}

export interface TemplateWithSettings extends Template {
  settings?: PromptSettings;
  ai_model?: {
    id: string;
    name: string;
    provider: string;
  };
}

export const createPromptInstance = (
  template: Template,
  content: string,
  saveToHistory: boolean
): PromptInstance => ({
  templateId: template.id,
  content,
  saveToHistory,
  settings: template.settings
});