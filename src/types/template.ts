// src/types/template.ts

import type { Template, PromptHistory } from './database.types';

// Re-export types
export type { Template, PromptHistory };

// Define component prop interfaces
export interface TemplateListProps {
  templates: Template[];
  onSelectTemplate: (template: Template) => void;
}

export interface TemplatePreviewProps {
  template: Template;
  content?: string;  // Added to support history content preview
  isHistory?: boolean;  // Added to differentiate between template and history previews
  onClose: () => void;
  onInsert: (content: string) => Promise<void>;
  onEdit?: () => void;
  onSaveAsTemplate?: () => void;  // Added for saving history items as templates
}

export interface TemplateEditorProps {
  template: Template | null | undefined;
  historyItem?: PromptHistory;  // Added to support editing from history
  onSave: (template: Omit<Template, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onDelete?: (templateId: string) => Promise<void>;
  onCancel: () => void;
  existingTemplateNames?: string[];
}

// Added for history view
export interface PromptHistoryViewProps {
  history: PromptHistory[];
  onSelectHistory: (item: PromptHistory) => void;
  onToggleFavorite: (historyId: string) => void;
  onDeleteHistory: (historyIds: string[]) => void;
  onClearHistory: (keepFavorites: boolean) => void;
}