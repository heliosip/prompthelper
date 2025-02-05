// src/types/template.ts

import type { Template } from './database.types';

// Re-export the Template type
export type { Template };

// Define component prop interfaces
export interface TemplateListProps {
  templates: Template[];
  onSelectTemplate: (template: Template) => void;
}

export interface TemplatePreviewProps {
  template: Template;
  onClose: () => void;
  onInsert: (content: string) => Promise<void>;
}

export interface TemplateEditorProps {
  template: Template | null | undefined;
  onSave: (template: Omit<Template, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onCancel: () => void;
}