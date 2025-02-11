// src/popup/popup.tsx
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Box, 
  CircularProgress,
  Alert,
  Fab,
  Zoom,
  Fade,
  Slide,
  Theme,
  alpha
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import NavTabs from '../components/NavTabs';
import TemplatePreview from '../components/TemplatePreview';
import TemplateEditor from '../components/TemplateEditor';
import SyncStatus, { SyncState } from '@/components/SyncStatus';  // Import SyncState from SyncStatus
import ResizableContainer from '@/components/ResizableContainer';
import Header from '@/components/Header';
import { useSyncStatus } from '@/hooks/useSyncStatus';
import AuthView from '@/components/AuthView';
import { TemplateSyncService } from '@/services/templateSyncService';
import { PromptHistoryService } from '@/services/promptHistoryService';
import type { Template, PromptHistory } from '@/types/database.types';

type ViewState = 'list' | 'preview' | 'editor';

const Popup = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [history, setHistory] = useState<PromptHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [selectedHistory, setSelectedHistory] = useState<PromptHistory | null>(null);
  const [view, setView] = useState<ViewState>('list');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const { syncState, lastSyncTime, error: syncError, startSync } = useSyncStatus({
    onOffline: () => setError('Working offline. Changes will be synced when connection is restored.'),
    onOnline: () => userId && handleSync()
  });

  useEffect(() => {
    checkAuthAndLoadTemplates();
  }, []);

  const checkAuthAndLoadTemplates = async () => {
    try {
      const { authSession } = await chrome.storage.local.get('authSession');
      if (authSession?.user) {
        setIsAuthenticated(true);
        setUserId(authSession.user.id);
        await Promise.all([
          loadTemplates(authSession.user.id),
          loadHistory(authSession.user.id)
        ]);
      } else {
        await loadTemplates();
      }
    } catch (err) {
      console.error('Auth check error:', err);
      setError('Failed to check authentication status');
      setLoading(false);
    }
  };

  const loadTemplates = async (currentUserId?: string) => {
    try {
      setLoading(true);
      if (currentUserId) {
        await startSync(async () => {
          await TemplateSyncService.syncTemplates(currentUserId);
        });
      }
      const localTemplates = await chrome.storage.local.get('templates');
      setTemplates(localTemplates.templates || []);
    } catch (err) {
      setError('Failed to load templates');
      console.error('Error loading templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async (userId: string) => {
    try {
      await PromptHistoryService.syncHistory(userId);
      const history = await PromptHistoryService.getLocalHistory();
      setHistory(history);
    } catch (err) {
      console.error('Error loading history:', err);
    }
  };

  const handleSync = async () => {
    if (!userId) return;
    try {
      await startSync(async () => {
        await Promise.all([
          TemplateSyncService.syncTemplates(userId),
          PromptHistoryService.syncHistory(userId)
        ]);
        const [localTemplates, history] = await Promise.all([
          chrome.storage.local.get('templates'),
          PromptHistoryService.getLocalHistory()
        ]);
        setTemplates(localTemplates.templates || []);
        setHistory(history);
      });
    } catch (err) {
      setError('Failed to sync');
      console.error('Sync error:', err);
    }
  };

  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setView('preview');
  };

  const handleSelectHistory = (historyItem: PromptHistory) => {
    setSelectedHistory(historyItem);
    setView('preview');
  };

  const handleToggleFavorite = async (historyId: string) => {
    if (!userId) return;
    try {
      await PromptHistoryService.toggleFavorite(historyId);
      const updatedHistory = await PromptHistoryService.getLocalHistory();
      setHistory(updatedHistory);
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  const handleDeleteHistory = async (historyIds: string[]) => {
    if (!userId) return;
    try {
      await PromptHistoryService.deleteMultiple(historyIds);
      const updatedHistory = await PromptHistoryService.getLocalHistory();
      setHistory(updatedHistory);
    } catch (err) {
      console.error('Error deleting history:', err);
    }
  };

  const handleClearHistory = async (keepFavorites: boolean) => {
    if (!userId) return;
    try {
      await PromptHistoryService.clearHistory(keepFavorites);
      const updatedHistory = await PromptHistoryService.getLocalHistory();
      setHistory(updatedHistory);
    } catch (err) {
      console.error('Error clearing history:', err);
    }
  };

  const handleInsertTemplate = async (content: string) => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) throw new Error('No active tab found');

      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });

      await chrome.tabs.sendMessage(tab.id, { 
        action: 'insertPrompt', 
        prompt: content 
      });

      if (userId) {
        const templateId = selectedTemplate?.is_standard ? undefined : selectedTemplate?.id;
        await PromptHistoryService.addHistoryEntry(
          content,
          userId,
          templateId
        );
      }

      window.close();
    } catch (err) {
      console.error('Error inserting template:', err);
      setError('Failed to insert template. Make sure you are on a supported chat page.');
    }
  };

  const handleSaveTemplate = async (template: Omit<Template, 'id' | 'created_at' | 'updated_at'>) => {
    if (!userId) {
      setError('Please sign in to save templates');
      return;
    }

    try {
      if (selectedTemplate?.id && !selectedTemplate.is_standard) {
        const updatedTemplate = await TemplateSyncService.updateTemplate(
          selectedTemplate.id,
          template,
          userId
        );
        setTemplates(prev => prev.map(t => 
          t.id === updatedTemplate.id ? updatedTemplate : t
        ));
      } else {
        const newTemplate = await TemplateSyncService.createTemplate(template, userId);
        setTemplates(prev => [...prev, newTemplate]);
      }
      setView('list');
      await handleSync();
    } catch (err) {
      setError('Failed to save template');
      console.error('Error saving template:', err);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!userId) {
      setError('Please sign in to delete templates');
      return;
    }

    try {
      await TemplateSyncService.deleteTemplate(templateId, userId);
      setTemplates(prev => prev.filter(t => t.id !== templateId));
      setView('list');
      await handleSync();
    } catch (err) {
      setError('Failed to delete template');
      console.error('Error deleting template:', err);
    }
  };

  const handleAuthSuccess = async () => {
    setIsAuthenticated(true);
    await checkAuthAndLoadTemplates();
  };

  const renderContent = () => {
    if (!isAuthenticated) {
      return (
        <Fade in={true}>
          <Box>
            <AuthView onAuthSuccess={handleAuthSuccess} />
          </Box>
        </Fade>
      );
    }

    switch (view) {
      case 'preview':
        if (selectedTemplate) {
          return (
            <TemplatePreview
              template={selectedTemplate}
              onClose={() => {
                setSelectedTemplate(null);
                setView('list');
              }}
              onEdit={() => setView('editor')}
              onInsert={handleInsertTemplate}
            />
          );
        }
        if (selectedHistory) {
          return (
            <TemplatePreview
              template={{
                ...selectedHistory,
                name: selectedHistory.content.slice(0, 30) + '...',
                category: 'History',
                is_standard: false,
                aitool: '',
                outputtype: '',
                prompttype: '',
                updated_at: new Date().toISOString()
              }}
              content={selectedHistory.content}
              isHistory={true}
              onClose={() => {
                setSelectedHistory(null);
                setView('list');
              }}
              isFavorite={selectedHistory.is_favorite}
              onToggleFavorite={() => handleToggleFavorite(selectedHistory.id)}
              onInsert={handleInsertTemplate}
            />
          );
        }
        return null;

      case 'editor':
        return (
          <TemplateEditor
            template={selectedTemplate}
            onSave={handleSaveTemplate}
            onDelete={handleDeleteTemplate}
            onCancel={() => {
              setSelectedTemplate(null);
              setView('list');
            }}
            existingTemplateNames={templates.map(t => t.name)}
          />
        );

      default:
        return (
          <NavTabs
            templates={templates}
            history={history}
            onSelectTemplate={handleSelectTemplate}
            onSelectHistory={handleSelectHistory}
            onToggleFavorite={handleToggleFavorite}
            onDeleteHistory={handleDeleteHistory}
            onClearHistory={handleClearHistory}
          />
        );
    }
  };

  return (
    <ResizableContainer>
      <Box 
        sx={{ 
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: (theme: Theme) => theme.palette.background.default
        }}
      >
        <Header>
          {isAuthenticated && (
            <Fade in={true}>
              <Box sx={{ pr: 2 }}>
                <SyncStatus
                  state={syncState as SyncState}
                  lastSyncTime={lastSyncTime}
                  onSyncClick={handleSync}
                  error={syncError}
                />
              </Box>
            </Fade>
          )}
        </Header>

        <Box sx={{ 
          flex: 1, 
          display: 'flex',
          overflow: 'hidden'
        }}>
          {loading ? (
            <Fade in={true}>
              <Box display="flex" justifyContent="center" alignItems="center" width="100%">
                <CircularProgress size={32} />
              </Box>
            </Fade>
          ) : (
            <>
              {error && (
                <Slide direction="down" in={true}>
                  <Alert 
                    severity="error" 
                    sx={{ 
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      zIndex: 1000
                    }}
                    onClose={() => setError(null)}
                  >
                    {error}
                  </Alert>
                </Slide>
              )}
              {renderContent()}
            </>
          )}
        </Box>
        
        {isAuthenticated && view === 'list' && (
          <Zoom 
            in={true}
            style={{
              position: 'absolute',
              bottom: 16,
              right: 16,
              transitionDelay: '200ms'
            }}
          >
            <Fab 
              color="primary" 
              size="medium"
              onClick={() => {
                setSelectedTemplate(null);
                setView('editor');
              }}
              sx={{
                '&:hover': {
                  bgcolor: (theme: Theme) => alpha(theme.palette.primary.main, 0.9)
                }
              }}
            >
              <AddIcon />
            </Fab>
          </Zoom>
        )}
      </Box>
    </ResizableContainer>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <Popup />
    </React.StrictMode>
  );
}

export default Popup;