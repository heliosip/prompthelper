// src/popup/popup.tsx

import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Box, 
  Typography, 
  CircularProgress,
  Alert,
  Fab,
  Zoom,
  Fade,
  Slide
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import AddIcon from '@mui/icons-material/Add';
import TemplateList from '../components/TemplateList';
import TemplatePreview from '../components/TemplatePreview';
import TemplateEditor from '../components/TemplateEditor';
import SyncStatus from '@/components/SyncStatus';
import { useSyncStatus } from '@/hooks/useSyncStatus';
import AuthView from '@/components/AuthView';
import { TemplateSyncService } from '@/services/templateSyncService';
import type { Template } from '@/types/template';

type ViewState = 'list' | 'preview' | 'editor';

const ResizeHandle = () => {
  const [isResizing, setIsResizing] = React.useState(false);
  const minWidth = 600;
  const minHeight = 600;
  const maxWidth = 1200;
  const maxHeight = 900;

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      // Calculate dimensions based on left-side dragging
      const width = Math.min(Math.max(window.innerWidth - e.clientX + window.scrollX, minWidth), maxWidth);
      const height = Math.min(Math.max(e.clientY, minHeight), maxHeight);

      document.body.style.width = `${width}px`;
      document.body.style.height = `${height}px`;
      document.getElementById('root')!.style.width = `${width}px`;
      document.getElementById('root')!.style.height = `${height}px`;
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  return (
    <div
      className="resize-handle"
      onMouseDown={(e) => {
        e.preventDefault();
        setIsResizing(true);
      }}
    />
  );
};

// Animation variants for page transitions
const pageVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 }
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.3
};

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
      if (selectedTemplate?.id && !selectedTemplate.is_standard) {
        // Update existing non-standard template
        const updatedTemplate = await TemplateSyncService.updateTemplate(
          selectedTemplate.id,
          template,
          userId
        );
        setTemplates(prev => prev.map(t => 
          t.id === updatedTemplate.id ? updatedTemplate : t
        ));
      } else {
        // Create new template (both for new templates and "Save As" from standard templates)
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

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={pageVariants}
          transition={pageTransition}
          style={{ height: '100%' }}
        >
          {(() => {
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
                    onEdit={() => setView('editor')}
                  />
                ) : null;

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
                  <TemplateList 
                    templates={templates}
                    onSelectTemplate={handleSelectTemplate}
                  />
                );
            }
          })()}
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <Box sx={{ 
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: '#FAFAFA',
      position: 'relative' // Added for resize handle positioning
    }}>
      <Box sx={{ 
        px: 3,
        py: 2,
        borderBottom: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        bgcolor: '#FFFFFF'
      }}>
        <Typography 
          sx={{ 
            fontFamily: "'Poppins', sans-serif",
            fontSize: '1.5rem',
            fontWeight: 700,
            background: 'linear-gradient(45deg, #FF6B6B 30%, #4ECDC4 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '0.5px'
          }}
        >
          Spaarke
        </Typography>
        {isAuthenticated && (
          <Fade in={true}>
            <Box>
              <SyncStatus
                state={syncState}
                lastSyncTime={lastSyncTime}
                onSyncClick={handleSync}
                error={syncError}
              />
            </Box>
          </Fade>
        )}
      </Box>

      <Box sx={{ 
        flex: 1, 
        overflow: 'auto',
        p: 2
      }}>
        {loading ? (
          <Fade in={true}>
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress size={32} />
            </Box>
          </Fade>
        ) : (
          <>
            {error && (
              <Slide direction="down" in={true}>
                <Alert 
                  severity="error" 
                  sx={{ mb: 2 }}
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
          >
            <AddIcon />
          </Fab>
        </Zoom>
      )}

      <ResizeHandle />
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