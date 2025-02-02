// src/database.types.ts

export interface Template {
    id: string;
    user_id: string | null;
    name: string;
    content: string;
    category?: string;
    aiTool?: string;
    outputType?: string;
    promptType?: string;
    description?: string;
    is_standard?: boolean;
    created_at?: string;
    updated_at?: string;
  }
  
  // Define the table’s types for row, insert, and update operations.
  export interface TemplatesTable {
    Row: Template;
    Insert: Partial<Template>;
    Update: Partial<Template>;
  }
  
  // A minimal Database interface. In a real project you’d add more tables.
  export interface Database {
    public: {
      Tables: {
        templates: TemplatesTable;
        // ... add other tables here
      };
    };
  }
  