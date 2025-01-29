import React, { useEffect, useState, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { supabase } from '../utils/supabaseClient';
import AuthView from './AuthView';
import TemplateEditor from '../components/TemplateEditor';
import { Template, PromptHistory } from '../types/template';
import { Box, Typography, Button, Tabs, Tab, CircularProgress } from '@mui/material';

type TabType = 'templates' | 'custom' | 'history';

export const Popup: React.FC = () => {
  // Supabase Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Extension State
  const [templates, setTemplates] = useState<Template[]>([]);
  const [userTemplates, setUserTemplates] = useState<Template[]>([]);
  const [prompts, setPrompts] = useState<PromptHistory[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('templates');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check session on mount and handle authentication state
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error fetching session:', error.message);
          setIsAuthenticated(false);
          setUserEmail(null);
          return;
        }
        if (data.session && data.session.user) {
          setIsAuthenticated(true);
          setUserEmail(data.session.user.email || null);
        } else {
          setIsAuthenticated(false);
          setUserEmail(null);
        }
      } catch (err) {
        console.error('Error during session check:', error);
        setIsAuthenticated(false);
        setUserEmail(null);
      } finally {
        setLoading(false); // Ensure loading is set to false regardless of success or failure
      }
    };

    checkSession();

    // Listen for login/logout events and handle state updates
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setIsAuthenticated(true);
        setUserEmail(session.user.email || null);
      } else {
        setIsAuthenticated(false);
        setUserEmail(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const loadTemplates = useCallback(async () => {
    try {
      const data = await chrome.storage.local.get(['templates']);
      setTemplates(data.templates || []);
    } catch (error) {
      console.error('Failed to load templates:', error);
      setError('Failed to load templates.');
    }
  }, []);

  const loadUserTemplates = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const response = await fetch(`/api/templates?email=${userEmail}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch user templates: ${response.status}`);
      }
      const data = await response.json();
      setUserTemplates(data);
    } catch (error) {
      console.error('Failed to load user templates:', error);
      setError('Failed to load user templates.');
    }
  }, [userEmail, isAuthenticated]);

  const loadHistory = useCallback(async () => {
    try {
      const response = await fetch(`/api/history?email=${userEmail}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch history: ${response.status}`);
      }
      const data = await response.json();
      setPrompts(data);
    } catch (error) {
      console.error('Failed to load history:', error);
      setError('Failed to load history.');
    }
  }, [userEmail]);

  useEffect(() => {
    if (isAuthenticated) {
      loadTemplates();
      loadUserTemplates();
      loadHistory();
    }
  }, [isAuthenticated, loadTemplates, loadUserTemplates, loadHistory, activeTab]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setUserEmail(null);
    setTemplates([]);
    setUserTemplates([]);
    setPrompts([]);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <AuthView onAuthSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h5" sx={{ marginBottom: 2 }}>
        Welcome, {userEmail}
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={handleSignOut}
        sx={{ marginBottom: 3 }}
      >
        Sign Out
      </Button>
      <Tabs
        value={activeTab}
        onChange={(_e, newValue) => setActiveTab(newValue)}
        textColor="primary"
        indicatorColor="primary"
        sx={{ marginBottom: 2 }}
      >
        <Tab label="Templates" value="templates" />
        <Tab label="Custom" value="custom" />
        <Tab label="History" value="history" />
      </Tabs>
      {activeTab === 'templates' && (
        <Box>
          {templates.length > 0 ? (
            templates.map((template) => (
              <Box
                key={template.id}
                sx={{
                  padding: 2,
                  border: '1px solid #ddd',
                  marginBottom: 1,
                  borderRadius: 1,
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: '#f5f5f5' },
                }}
                onClick={() => setSelectedTemplate(template)}
              >
                {template.name}
              </Box>
            ))
          ) : (
            <Typography>No templates available.</Typography>
          )}
        </Box>
      )}
      {activeTab === 'custom' && (
        <Box>
          {userTemplates.length > 0 ? (
            userTemplates.map((template) => (
              <Box
                key={template.id}
                sx={{
                  padding: 2,
                  border: '1px solid #ddd',
                  marginBottom: 1,
                  borderRadius: 1,
                }}
              >
                {template.name}
              </Box>
            ))
          ) : (
            <Typography>No custom templates available.</Typography>
          )}
        </Box>
      )}
      {activeTab === 'history' && (
        <Box>
          {prompts.length > 0 ? (
            prompts.map((prompt) => (
              <Box
                key={prompt.id}
                sx={{
                  padding: 2,
                  border: '1px solid #ddd',
                  marginBottom: 1,
                  borderRadius: 1,
                }}
              >
                {prompt.content}
              </Box>
            ))
          ) : (
            <Typography>No history available.</Typography>
          )}
        </Box>
      )}
      {selectedTemplate && (
        <TemplateEditor
          template={selectedTemplate}
          onSubmit={() => setSelectedTemplate(null)}
          onCancel={() => setSelectedTemplate(null)}
        />
      )}
    </Box>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<Popup />);
}
