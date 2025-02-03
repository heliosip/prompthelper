import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Box, Typography, Button, Tabs, Tab, CircularProgress } from '@mui/material';
import { supabase } from '@/utils/supabaseClient';
import AuthView from './AuthView';
import TemplateEditor from '@/components/TemplateEditor';
import type { Template, PromptHistory, TemplateWithSettings } from '@/types/template';

type TabType = 'templates' | 'custom' | 'history';

const Popup: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [userTemplates, setUserTemplates] = useState<Template[]>([]);
  const [prompts, setPrompts] = useState<PromptHistory[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateWithSettings | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('templates');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        setIsAuthenticated(!!session);
        setUserEmail(session?.user?.email ?? null);
      } catch (err) {
        console.error('Session check error:', err);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      setUserEmail(session?.user?.email ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchData = async () => {
      try {
        const [templatesData, userTemplatesData, historyData] = await Promise.all([
          chrome.storage.local.get(['templates']),
          supabase.from('templates').select('*').eq('user_id', (await supabase.auth.getUser()).data.user?.id),
          supabase.from('prompt_history').select('*').eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        ]);

        setTemplates(templatesData.templates || []);
        setUserTemplates(userTemplatesData.data || []);
        setPrompts(historyData.data || []);
      } catch (err) {
        console.error('Data fetch error:', err);
        setError('Failed to load data');
      }
    };

    fetchData();
  }, [isAuthenticated, activeTab]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setTemplates([]);
    setUserTemplates([]);
    setPrompts([]);
  };

  if (loading) {
    return <Box className="flex justify-center items-center h-screen"><CircularProgress /></Box>;
  }

  if (!isAuthenticated) {
    return <AuthView onAuthSuccess={() => setIsAuthenticated(true)} />;
  }

  const renderTemplateList = (items: Template[]) => (
    <Box className="space-y-2">
      {items.length > 0 ? (
        items.map((template) => (
          <Box
            key={template.id}
            onClick={() => setSelectedTemplate(template)}
            className="p-3 border rounded cursor-pointer hover:bg-gray-50"
          >
            <Typography variant="subtitle1">{template.name}</Typography>
            {template.description && (
              <Typography variant="body2" color="text.secondary">
                {template.description}
              </Typography>
            )}
          </Box>
        ))
      ) : (
        <Typography color="text.secondary">No items available</Typography>
      )}
    </Box>
  );

  return (
    <Box className="p-4 w-96">
      <Box className="flex justify-between items-center mb-4">
        <Typography variant="h6">
          {userEmail}
        </Typography>
        <Button variant="outlined" onClick={handleSignOut}>
          Sign Out
        </Button>
      </Box>

      <Tabs
        value={activeTab}
        onChange={(_e, value) => setActiveTab(value as TabType)}
        className="mb-4"
      >
        <Tab label="Templates" value="templates" />
        <Tab label="Custom" value="custom" />
        <Tab label="History" value="history" />
      </Tabs>

      {error && (
        <Typography color="error" className="mb-4">
          {error}
        </Typography>
      )}

      {activeTab === 'templates' && renderTemplateList(templates)}
      {activeTab === 'custom' && renderTemplateList(userTemplates)}
      {activeTab === 'history' && (
        <Box className="space-y-2">
          {prompts.map((prompt) => (
            <Box key={prompt.id} className="p-3 border rounded">
              <Typography>{prompt.content}</Typography>
            </Box>
          ))}
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
  root.render(
    <React.StrictMode>
      <Popup />
    </React.StrictMode>
  );
}

export default Popup;