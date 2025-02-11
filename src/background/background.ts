// src/background/background.ts

import { getSupabase } from '@/utils/supabaseClient';
import { ConfigService } from '@/services/config';
import type { Template } from '@/types/database.types';

// Define message types for better type safety
type MessageType = 'INIT_CHECK' | 'GET_CONFIG';

interface ExtensionMessage {
  type: MessageType;
  payload?: any;
}

const defaultTemplates: Omit<Template, 'id' | 'created_at' | 'updated_at' | 'user_id'>[] = [
  {
    name: 'Task Analysis',
    content: 'Please analyze this task:\n[TASK]\n\nConsider:\n1. Requirements\n2. Potential challenges\n3. Implementation steps',
    category: 'Planning',
    outputtype: 'text',
    prompttype: 'analysis',
    description: 'Analyze tasks and break them down into actionable steps',
    is_standard: true,
    aitool: '',
    category_id: ''
  },
  {
    name: 'Code Review',
    content: 'Please review this code:\n[CODE]\n\nCheck for:\n1. Best practices\n2. Potential bugs\n3. Performance issues\n4. Security concerns',
    category: 'Development',
    outputtype: 'text',
    prompttype: 'review',
    description: 'Review code for quality and issues',
    is_standard: true,
    aitool: '',
    category_id: ''
  },
  {
    name: 'API Documentation',
    content: 'Please document this API:\n[API]\n\nInclude:\n1. Endpoints\n2. Parameters\n3. Response format\n4. Example usage',
    category: 'Development',
    outputtype: 'text',
    prompttype: 'documentation',
    description: 'Generate API documentation',
    is_standard: true,
    aitool: '',
    category_id: ''
  }
];

// Initialize extension
const initializeExtension = async () => {
  try {
    // Initialize configuration
    await ConfigService.initialize();
    
    // Initialize Supabase client
    await getSupabase();
    
    // Set up default templates if none exist
    const { templates = [] } = await chrome.storage.local.get('templates');
    if (templates.length === 0) {
      const templatesWithIds = defaultTemplates.map(template => ({
        ...template,
        id: crypto.randomUUID(),
        user_id: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      await chrome.storage.local.set({ 
        templates: templatesWithIds,
        syncEnabled: true
      });
      
      console.log('Default templates initialized:', templatesWithIds.length);
    }
    
    console.log('Extension initialized successfully');
  } catch (error) {
    console.error('Extension initialization failed:', error);
    throw error;
  }
};

// Handle extension lifecycle events
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install' || details.reason === 'update') {
    initializeExtension().catch(error => {
      console.error('Initialization failed:', error);
    });
  }
});

// Handle messages with type safety
chrome.runtime.onMessage.addListener(
  (message: ExtensionMessage, sender: chrome.runtime.MessageSender, sendResponse: (response: any) => void) => {
    console.log('Background script received message:', message);
    
    switch (message.type) {
      case 'INIT_CHECK':
        initializeExtension()
          .then(() => sendResponse({ success: true }))
          .catch((error) => sendResponse({ 
            success: false, 
            error: error instanceof Error ? error.message : String(error)
          }));
        break;
        
      case 'GET_CONFIG':
        ConfigService.getConfig()
          .then(config => sendResponse({ success: true, config }))
          .catch(error => sendResponse({ 
            success: false, 
            error: error instanceof Error ? error.message : String(error)
          }));
        break;
        
      default:
        sendResponse({ 
          success: false, 
          error: `Unknown message type: ${message.type}` 
        });
    }
    
    // Required for async response handling
    return true;
  }
);

export type { ExtensionMessage };
export { defaultTemplates };