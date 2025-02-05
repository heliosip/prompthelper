// src/types/database.types.ts

export interface Template {
  id: string;
  user_id?: string;
  name: string;
  content: string;
  category: string;
  about?: string;
  outputType: string;
  prompttype: string;
  description?: string;
  is_standard: boolean;
  created_at: string;
  updated_at: string;
  category_id?: string;
}

export interface Database {
  public: {
    Tables: {
      templates: {
        Row: Template;
        Insert: Omit<Template, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Template>;
      };
      // ... other table definitions
    };
  };
}