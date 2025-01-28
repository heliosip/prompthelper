// Output types that templates can target
export type OutputType = 
  | 'blog-post'
  | 'email'
  | 'code'
  | 'analysis'
  | 'summary'
  | 'social-media'
  | 'documentation'
  | 'other';

// Prompt engineering approaches
export type PromptType = 
  | 'zero-shot'
  | 'one-shot'
  | 'few-shot'
  | 'chain-of-thought'
  | 'step-by-step'
  | 'tree-of-thought'
  | 'other';

// Base template definition
export interface Template {
  id: string;
  name: string;
  category: string;
  aiTool: string;
  outputType: OutputType;
  promptType: PromptType;
  content: string;        // The template content/prompt structure
  description?: string;   // Optional description of when to use this template
  isUserTemplate?: boolean;  // Added for user-specific templates
  userId?: string;          // Added for user ownership
  createdAt: string;
  updatedAt: string;
}

// Represents an actual used/saved prompt instance
export interface PromptHistory {
  id: string;
  templateId: string;     // Reference to original template
  content: string;        // The actual prompt content used
  timestamp: string;      // When this prompt was used
  metadata: {
    templateName: string;
    category: string;
    aiTool: string;
    outputType: OutputType;
    promptType: PromptType;
  };
}

// Interface for creating a new prompt from a template
export interface PromptInstance {
  templateId: string;
  content: string;
  saveToHistory: boolean;  // Whether to save this instance
}

// Utility function to generate unique IDs
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};

// Utility function to create a new prompt instance from a template
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

// Function to save a prompt to history
export const createHistoryEntry = (
  template: Template,
  promptInstance: PromptInstance
): PromptHistory => {
  return {
    id: generateId(),
    templateId: template.id,
    content: promptInstance.content,
    timestamp: new Date().toISOString(),
    metadata: {
      templateName: template.name,
      category: template.category,
      aiTool: template.aiTool,
      outputType: template.outputType,
      promptType: template.promptType
    }
  };
};