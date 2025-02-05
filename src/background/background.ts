// src/background/background.ts

import { initSupabaseAuth, getSupabase } from '@/utils/supabaseClient';
import { ConfigService } from '@/services/config';  // Updated import path
import type { Template } from '@/types/database.types';

const defaultTemplates: Omit<Template, 'id' | 'created_at' | 'updated_at'>[] = [
  {
    name: 'Task Analysis',
    content: 'Please analyze this task:\n[TASK]\n\nConsider:\n1. Requirements\n2. Potential challenges\n3. Implementation steps',
    category: 'Planning',
    outputType: 'text',
    prompttype: 'analysis',
    description: 'Analyze tasks and break them down into actionable steps',
    is_standard: true,
  },
  // ... other templates
];

// Initialize extension
const initializeExtension = async () => {
  try {
    // Initialize configuration
    await ConfigService.initialize();
    
    // Initialize Supabase client and auth
    await getSupabase();
    await initSupabaseAuth();
    
    // Set up default templates
    const { templates = [] } = await chrome.storage.local.get('templates');
    if (templates.length === 0) {
      await chrome.storage.local.set({ 
        templates: defaultTemplates.map(template => ({
          ...template,
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })),
        syncEnabled: true
      });
    }
    
    console.log('Extension initialized successfully');
  } catch (error) {
    console.error('Extension initialization failed:', error);
  }
};

// Handle install/update events
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install' || details.reason === 'update') {
    initializeExtension();
  }
});

// Handle messages
chrome.runtime.onMessage.addListener(
  (request: any, sender: chrome.runtime.MessageSender, sendResponse: (response: any) => void) => {
    console.log('Background script received message:', request);
    
    if (request.type === 'INIT_CHECK') {
      initializeExtension()
        .then(() => sendResponse({ success: true }))
        .catch((error) => sendResponse({ success: false, error: String(error) }));
      return true;
    }
    
    if (request.type === 'GET_CONFIG') {
      ConfigService.getConfig()
        .then(config => sendResponse({ config }))
        .catch(error => sendResponse({ error: String(error) }));
      return true;
    }
    
    sendResponse({ received: true });
    return true;
  }
);

// Export for use in other parts of the extension
export type { Template };
export { defaultTemplates };