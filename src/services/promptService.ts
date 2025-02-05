// src/services/promptService.ts

import { supabase } from '../utils/supabaseClient';
import type { Template } from '../types/template';

export class PromptService {
  // Insert prompt into active chat
  static async insertPrompt(prompt: string): Promise<boolean> {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab?.id) {
        throw new Error('No active tab found');
      }

      const response = await chrome.tabs.sendMessage(tab.id, {
        action: 'insertPrompt',
        prompt
      });

      return response?.success || false;
    } catch (error) {
      console.error('Error inserting prompt:', error);
      throw error;
    }
  }

  // Save prompt to history
  static async saveToHistory(
    userId: string,
    template: Template,
    content: string
  ): Promise<void> {
    try {
      const { error } = await supabase.client
        .from('prompt_history')
        .insert([
          {
            user_id: userId,
            template_id: template.id,
            content,
            created_at: new Date().toISOString()
          }
        ]);

      if (error) throw error;
    } catch (error) {
      console.error('Error saving to history:', error);
      throw error;
    }
  }

  // Use a template - inserts prompt and optionally saves to history
  static async useTemplate(
    userId: string | undefined,
    template: Template,
    promptContent: string,
    saveToHistory: boolean = true
  ): Promise<void> {
    try {
      // First, try to insert the prompt
      const success = await this.insertPrompt(promptContent);

      // If insertion was successful and we should save to history
      if (success && saveToHistory && userId) {
        await this.saveToHistory(userId, template, promptContent);
      }
    } catch (error) {
      console.error('Error using template:', error);
      throw error;
    }
  }
}