# AI Prompt Helper Project Documentation

## Project Overview
Chrome extension for managing and inserting AI chat prompts, supporting multiple AI platforms (Claude, ChatGPT). Features include template management, history tracking, and prompt customization.

## Current Implementation Status
- ✅ Basic Chrome extension setup
- ✅ React frontend with TypeScript
- ✅ Template management UI (Templates, Custom, History tabs)
- ✅ Content script for chat injection
- ✅ Local storage implementation
- ✅ Basic authentication

## Next Phase: Supabase Integration
Moving from local storage to Supabase for:
- User authentication
- Template storage
- History tracking
- Real-time updates

## Project Architecture

### Directory Structure
```
/prompthelper
├── /server
│   ├── index.ts              # Express server with endpoints
│   ├── db.ts                 # Database connection (to be updated)
│   └── tsconfig.json         # Server TypeScript config
├── /src
│   ├── /types
│   │   └── template.ts       # TypeScript definitions
│   ├── /components
│   │   └── TemplateEditor.tsx
│   ├── /popup
│   │   ├── index.tsx         
│   │   ├── popup.tsx         
│   │   └── popup.html        
│   ├── /content
│   │   └── content.ts        
│   ├── /background
│   │   └── background.ts     
│   └── manifest.json         
├── package.json             
├── tsconfig.json            
└── webpack.config.js        
```

### Data Models

#### Current Template Interface
```typescript
interface Template {
  id: string;
  name: string;
  category: string;
  aiTool: string;
  outputType: OutputType;
  promptType: PromptType;
  content: string;
  description?: string;
  isUserTemplate?: boolean;
  userId?: string;
  createdAt: string;
  updatedAt: string;
}
```

#### History Interface
```typescript
interface PromptHistory {
  id: string;
  templateId: string;
  content: string;
  timestamp: string;
  metadata: {
    templateName: string;
    category: string;
    aiTool: string;
    outputType: OutputType;
    promptType: PromptType;
  };
}
```

### Key Features
1. Template Management
   - Predefined templates
   - Custom template creation
   - Template categorization

2. History Tracking
   - Usage history
   - Template performance
   - Reuse capability

3. Chat Integration
   - Direct prompt insertion
   - Multiple AI platform support

### UI Components
1. Tab Navigation
   - Templates
   - Custom
   - History

2. Template Editor
   - Rich text editing
   - Template metadata
   - Save/update functionality

3. History View
   - Chronological listing
   - Reuse functionality
   - Filtering options

## Development Environment
- Node.js with TypeScript
- React 18.3.1
- Chrome Extensions Manifest V3
- Supabase (pending implementation)

## Build and Development
```bash
# Install dependencies
npm install
cd server && npm install

# Development
npm run dev

# Build
npm run build
```

## Testing
- Current test user: testuser/password123
- Extension loads in Chrome
- Template management functional
- Chat integration working

## Next Steps
1. Supabase Integration
   - Setup database
   - Migrate authentication
   - Implement data models
   - Update API endpoints

2. Enhanced Features
   - Template sharing
   - Advanced categories
   - Search functionality
   - Real-time updates

3. UI Improvements
   - Rich text editing
   - Template preview
   - Better error handling