// src/popup/popup.tsx

import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Box, 
  Typography, 
  CircularProgress,
  Alert,
  Fab
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import TemplateList from '../components/TemplateList';
import TemplatePreview from '../components/TemplatePreview';
import TemplateEditor from '../components/TemplateEditor';
import SyncStatus from '@/components/SyncStatus';
import { useSyncStatus } from '@/hooks/useSyncStatus';
import AuthView from '@/components/AuthView';  // Updated import path
import { TemplateSyncService } from '@/services/templateSyncService';
import type { Template } from '@/types/template';

type ViewState = 'list' | 'preview' | 'editor';

const Popup = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [view, setView] = useState<ViewState>('list');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const { 
    syncState, 
    lastSyncTime, 
    error: syncError, 
    startSync 
  } = useSyncStatus({
    onOffline: () => {
      setError('Working offline. Changes will be synced when connection is restored.');
    },
    onOnline: () => {
      // Attempt to sync when coming back online
      if (userId) {
        handleSync();
      }
    }
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
        await loadTemplates(authSession.user.id);
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

  const handleSync = async () => {
    if (!userId) return;
    
    try {
      await startSync(async () => {
        await TemplateSyncService.syncTemplates(userId);
        const localTemplates = await chrome.storage.local.get('templates');
        setTemplates(localTemplates.templates || []);
      });
    } catch (err) {
      setError('Failed to sync templates');
      console.error('Sync error:', err);
    }
  };

  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setView('preview');
  };

  const handleInsertTemplate = async (content: string) => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab?.id) {
        throw new Error('No active tab found');
      }

      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });

      await chrome.tabs.sendMessage(tab.id, { 
        action: 'insertPrompt', 
        prompt: content 
      });

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
      const newTemplate = await TemplateSyncService.createTemplate(template, userId);
      setTemplates(prev => [...prev, newTemplate]);
      setView('list');
      
      // Trigger sync after saving
      await handleSync();
    } catch (err) {
      setError('Failed to save template');
      console.error('Error saving template:', err);
    }
  };

  const handleAuthSuccess = async () => {
    setIsAuthenticated(true);
    await checkAuthAndLoadTemplates();
  };

  const renderContent = () => {
    if (!isAuthenticated) {
      return <AuthView onAuthSuccess={handleAuthSuccess} />;
    }

    switch (view) {
      case 'preview':
        return selectedTemplate ? (
          <TemplatePreview
            template={selectedTemplate}
            onClose={() => {
              setSelectedTemplate(null);
              setView('list');
            }}
            onInsert={handleInsertTemplate}
          />
        ) : null;

      case 'editor':
        return (
          <TemplateEditor
            template={selectedTemplate}
            onSave={handleSaveTemplate}
            onCancel={() => {
              setSelectedTemplate(null);
              setView('list');
            }}
          />
        );

      default:
        return (
          <TemplateList 
            templates={templates}
            onSelectTemplate={handleSelectTemplate}
          />
        );
    }
  };

  return (
    <Box sx={{ 
      width: '600px',
      height: '600px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Box sx={{ 
        p: 2, 
        borderBottom: 1, 
        borderColor: 'divider',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography variant="h6">
          AI Prompt Helper
        </Typography>
        {isAuthenticated && (
          <SyncStatus
            state={syncState}
            lastSyncTime={lastSyncTime}
            onSyncClick={handleSync}
            error={syncError}
          />
        )}
      </Box>

      <Box sx={{ 
        flex: 1, 
        overflow: 'auto',
        p: 2
      }}>
        {loading && (
          <Box display="flex" justifyContent="center" my={2}>
            <CircularProgress size={24} />
          </Box>
        )}

        {error && (
          <Alert 
            severity="error" 
            className="mb-4" 
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        <Box>
          {renderContent()}
        </Box>
      </Box>
      
      {isAuthenticated && view === 'list' && (
        <Fab 
          color="primary" 
          size="medium"
          sx={{
            position: 'absolute',
            bottom: 16,
            right: 16
          }}
          onClick={() => {
            setSelectedTemplate(null);
            setView('editor');
          }}
        >
          <AddIcon />
        </Fab>
      )}
    </Box>
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