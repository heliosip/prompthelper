# Supabase Implementation Guide

## Setup Steps

### 1. Create Supabase Project
1. Sign up at supabase.com
2. Create new project
3. Save connection details:
   - Project URL
   - anon key
   - service_role key (keep secure)

### 2. Database Schema

```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (handled by Supabase Auth)
-- Supabase automatically manages auth.users

-- Templates table
CREATE TABLE templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR NOT NULL,
  ai_tool VARCHAR NOT NULL,
  output_type VARCHAR NOT NULL,
  prompt_type VARCHAR NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Template versions table
CREATE TABLE template_versions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  template_id UUID REFERENCES templates(id),
  content TEXT NOT NULL,
  changes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- History table
CREATE TABLE prompt_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  template_id UUID REFERENCES templates(id),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Template permissions
CREATE TABLE template_permissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  template_id UUID REFERENCES templates(id),
  user_id UUID REFERENCES auth.users(id),
  can_view BOOLEAN DEFAULT true,
  can_edit BOOLEAN DEFAULT false,
  can_share BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(template_id, user_id)
);

-- Categories table
CREATE TABLE categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR NOT NULL UNIQUE,
  description TEXT,
  parent_id UUID REFERENCES categories(id),
  order_position INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_templates_category ON templates(category);
CREATE INDEX idx_templates_created_by ON templates(created_by);
CREATE INDEX idx_history_user ON prompt_history(user_id);
CREATE INDEX idx_history_template ON prompt_history(template_id);
CREATE INDEX idx_template_permissions_user ON template_permissions(user_id);
```

### 3. Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_permissions ENABLE ROW LEVEL SECURITY;

-- Template policies
CREATE POLICY "templates_select_public" ON templates
  FOR SELECT USING (is_public = true);

CREATE POLICY "templates_select_own" ON templates
  FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "templates_insert_own" ON templates
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "templates_update_own" ON templates
  FOR UPDATE USING (created_by = auth.uid());

-- History policies
CREATE POLICY "history_select_own" ON prompt_history
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "history_insert_own" ON prompt_history
  FOR INSERT WITH CHECK (user_id = auth.uid());
```

### 4. TypeScript Integration

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export type Template = {
  id: string;
  name: string;
  content: string;
  category: string;
  ai_tool: string;
  output_type: string;
  prompt_type: string;
  description?: string;
  is_public: boolean;
  metadata: Record<string, any>;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type PromptHistory = {
  id: string;
  user_id: string;
  template_id: string;
  content: string;
  metadata: {
    success: boolean;
    response_length?: number;
    execution_time?: number;
  };
  created_at: string;
};
```

### 5. API Functions

```typescript
// src/lib/api.ts
import { supabase } from './supabase';

export const templateApi = {
  // Get templates
  async getTemplates() {
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Create template
  async createTemplate(template: Omit<Template, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('templates')
      .insert(template)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get history
  async getHistory() {
    const { data, error } = await supabase
      .from('prompt_history')
      .select(`
        *,
        template:templates(name)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }
};
```

### 6. Authentication Integration

```typescript
// src/contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext<{
  user: any;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}>({
  user: null,
  signIn: async () => {},
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check active sessions
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    user,
    signIn: async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    },
    signOut: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
```

## Implementation Steps

1. **Initial Setup**
   - Create Supabase project
   - Run schema creation scripts
   - Set up RLS policies

2. **Project Updates**
   - Add Supabase client library
   - Configure environment variables
   - Update type definitions

3. **Authentication Migration**
   - Implement AuthContext
   - Update login/logout functionality
   - Add session management

4. **Data Migration**
   - Move templates to Supabase
   - Update API calls
   - Implement real-time subscriptions

5. **Testing**
   - Verify authentication flow
   - Test template operations
   - Validate history tracking