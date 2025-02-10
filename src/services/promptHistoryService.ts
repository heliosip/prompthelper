// src/services/promptHistoryService.ts

import { getSupabase } from '@/utils/supabaseClient';
import type { PromptHistory } from '@/types/database.types';

export class PromptHistoryService {
  private static async getLocalHistory(): Promise<PromptHistory[]> {
    const { promptHistory = [] } = await chrome.storage.local.get('promptHistory');
    return promptHistory;
  }

  private static async saveLocalHistory(history: PromptHistory[]): Promise<void> {
    // Keep only last 25 non-favorite entries
    const favorites = history.filter(entry => entry.is_favorite);
    const nonFavorites = history
      .filter(entry => !entry.is_favorite)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 25);

    await chrome.storage.local.set({ 
      promptHistory: [...favorites, ...nonFavorites].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    });
  }

  static async addHistoryEntry(
    content: string,
    userId: string,
    templateId?: string
  ): Promise<PromptHistory> {
    try {
      const supabase = await getSupabase();
      
      const entry: PromptHistory = {
        id: crypto.randomUUID(),
        user_id: userId,
        template_id: templateId,
        content,
        created_at: new Date().toISOString(),
        is_favorite: false
      };

      // Save to Supabase
      const { error } = await supabase
        .from('prompt_history')
        .insert({
          id: entry.id,
          user_id: userId,
          template_id: templateId,
          content,
          created_at: entry.created_at,
          is_favorite: false
        });

      if (error) throw error;

      // Save to local storage
      const history = await this.getLocalHistory();
      await this.saveLocalHistory([entry, ...history]);

      return entry;
    } catch (error) {
      console.error('Error adding history entry:', error);
      throw error;
    }
  }

  static async toggleFavorite(entryId: string): Promise<void> {
    try {
      const supabase = await getSupabase();
      const history = await this.getLocalHistory();
      
      // Find the entry and its current favorite status
      const entry = history.find(e => e.id === entryId);
      if (!entry) return;
      
      const newFavoriteStatus = !entry.is_favorite;

      // Update in Supabase
      const { error } = await supabase
        .from('prompt_history')
        .update({ is_favorite: newFavoriteStatus })
        .eq('id', entryId);

      if (error) throw error;

      // Update local storage
      const updatedHistory = history.map(entry => 
        entry.id === entryId 
          ? { ...entry, is_favorite: newFavoriteStatus }
          : entry
      );
      
      await this.saveLocalHistory(updatedHistory);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      throw error;
    }
  }

  static async deleteEntry(entryId: string): Promise<void> {
    try {
      const supabase = await getSupabase();
      
      // Delete from Supabase
      const { error } = await supabase
        .from('prompt_history')
        .delete()
        .eq('id', entryId);

      if (error) throw error;

      // Delete from local storage
      const history = await this.getLocalHistory();
      await this.saveLocalHistory(history.filter(entry => entry.id !== entryId));
    } catch (error) {
      console.error('Error deleting history entry:', error);
      throw error;
    }
  }

  static async deleteMultiple(entryIds: string[]): Promise<void> {
    try {
      const supabase = await getSupabase();
      
      // Delete from Supabase
      const { error } = await supabase
        .from('prompt_history')
        .delete()
        .in('id', entryIds);

      if (error) throw error;

      // Delete from local storage
      const history = await this.getLocalHistory();
      await this.saveLocalHistory(
        history.filter(entry => !entryIds.includes(entry.id))
      );
    } catch (error) {
      console.error('Error deleting history entries:', error);
      throw error;
    }
  }

  static async clearHistory(keepFavorites: boolean = true): Promise<void> {
    try {
      const supabase = await getSupabase();
      const history = await this.getLocalHistory();
      
      if (keepFavorites) {
        // Delete non-favorite items from Supabase
        const { error } = await supabase
          .from('prompt_history')
          .delete()
          .eq('is_favorite', false);

        if (error) throw error;

        // Keep only favorite items in local storage
        await this.saveLocalHistory(history.filter(entry => entry.is_favorite));
      } else {
        // Delete all items from Supabase
        const { error } = await supabase
          .from('prompt_history')
          .delete()
          .match({ user_id: history[0]?.user_id });

        if (error) throw error;

        await chrome.storage.local.remove('promptHistory');
      }
    } catch (error) {
      console.error('Error clearing history:', error);
      throw error;
    }
  }

  static async syncHistory(userId: string): Promise<void> {
    try {
      const supabase = await getSupabase();
      
      // Fetch remote history
      const { data: remoteHistory, error } = await supabase
        .from('prompt_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get local history
      const localHistory = await this.getLocalHistory();
      
      // Merge histories, preserving local favorite status
      const mergedHistory = (remoteHistory || []).map(remote => ({
        ...remote,
        is_favorite: localHistory.find(local => local.id === remote.id)?.is_favorite || remote.is_favorite
      }));

      await this.saveLocalHistory(mergedHistory);
    } catch (error) {
      console.error('Error syncing history:', error);
      throw error;
    }
  }
}