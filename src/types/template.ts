// src/types/template.ts

// Basic Template interface matching the database structure
export interface Template {
    id: string;
    name: string;
    content: string;
    description?: string;
    user_id?: string;
    is_standard: boolean;
    created_at?: string;
    updated_at?: string;
  }
  
  // Interface for creating a new prompt from a template
  export interface PromptInstance {
    templateId: string;
    content: string;
    saveToHistory: boolean;
  }
  
  // Utility function to create a new prompt instance
  export const createPromptInstance = (
    template: Template,
    modifiedContent: string,
    saveToHistory: boolean
  ): PromptInstance => {
    return {
      templateId: template.id,
      content: modifiedContent,
      saveToHistory
    };
  };