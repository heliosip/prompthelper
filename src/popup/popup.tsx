import React, { useState, useEffect, useCallback } from 'react';
import { Template, PromptInstance, PromptHistory } from '../types/template';
import TemplateEditor from '../components/TemplateEditor';

type TabType = 'templates' | 'custom' | 'history';

const API_BASE_URL = 'http://localhost:3001';

interface User {
  username: string;
  password: string;
}

export const Popup = (): JSX.Element => {
  // State declarations
  const [templates, setTemplates] = useState<Template[]>([]);
  const [userTemplates, setUserTemplates] = useState<Template[]>([]);
  const [currentAI, setCurrentAI] = useState('');
  const [showNewForm, setShowNewForm] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('templates');
  const [prompts, setPrompts] = useState<PromptHistory[]>([]);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    content: '',
    category: 'General',
    outputType: 'blog-post' as const,
    promptType: 'zero-shot' as const
  });

  // Function to send prompt to chat
  const sendToChat = async (prompt: string): Promise<void> => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab?.id) {
        throw new Error('No active tab found');
      }

      // First try to send message
      try {
        const response = await chrome.tabs.sendMessage(tab.id, {
          action: 'insertPrompt',
          prompt: prompt
        });

        if (response?.success) {
          return;
        }
      } catch (error) {
        console.log('Initial message send failed, injecting content script...');
      }

      // If message failed, inject content script and try again
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });

      // Wait a moment for the script to initialize
      await new Promise(resolve => setTimeout(resolve, 100));

      // Try sending message again
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: 'insertPrompt',
        prompt: prompt
      });

      if (!response?.success) {
        throw new Error(response?.error || 'Failed to insert prompt');
      }
    } catch (error) {
      console.error('Error sending to chat:', error);
      throw error;
    }
  };

  const loadTemplates = useCallback(async (ai: string): Promise<void> => {
    const data = await chrome.storage.local.get(['templates']);
    setTemplates(data.templates?.filter((t: Template) => t.aiTool === ai) || []);
  }, []);

  const loadUserTemplates = useCallback(async (ai: string): Promise<void> => {
    if (!user) return;
    
    try {
      setError(null);
      const response = await fetch(`${API_BASE_URL}/templates/${user.username}`);
      
      if (!response.ok) {
        throw new Error(`Failed to load templates: ${response.statusText}`);
      }
      
      const data = await response.json();
      setUserTemplates(data.filter((t: Template) => t.aiTool === ai));
    } catch (error) {
      console.error('Failed to load user templates:', error);
      setError('Failed to load templates. Please try again.');
    }
  }, [user]);

  const loadHistory = useCallback(async (): Promise<void> => {
    if (!user) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/history/${user.username}`);
      if (!response.ok) {
        throw new Error('Failed to load history');
      }
      const data = await response.json();
      setPrompts(data);
    } catch (error) {
      console.error('Failed to load history:', error);
      setError('Failed to load prompt history');
    }
  }, [user]);

  const loadUser = useCallback(async (): Promise<void> => {
    const data = await chrome.storage.local.get(['user']);
    if (data.user) {
      setUser(data.user);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    const initializeTemplates = async (): Promise<void> => {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const url = tab?.url || '';
        const ai = url.includes('chat.openai.com') ? 'chatgpt' : 'claude';
        setCurrentAI(ai);
        await loadTemplates(ai);
        if (user) {
          await loadUserTemplates(ai);
        }
      } catch (error) {
        console.error('Error initializing templates:', error);
        setError('Failed to initialize templates');
      }
    };
  
    initializeTemplates();
  }, [user, loadTemplates, loadUserTemplates]);

  useEffect(() => {
    if (activeTab === 'history') {
      loadHistory();
    }
  }, [activeTab, loadHistory]);

  const handlePromptSubmit = async (promptInstance: PromptInstance): Promise<void> => {
    try {
      await sendToChat(promptInstance.content);

      if (promptInstance.saveToHistory && user && selectedTemplate) {
        const historyEntry = {
          templateId: selectedTemplate.id,
          content: promptInstance.content,
          metadata: {
            templateName: selectedTemplate.name,
            category: selectedTemplate.category,
            aiTool: selectedTemplate.aiTool,
            outputType: selectedTemplate.outputType,
            promptType: selectedTemplate.promptType
          }
        };

        const response = await fetch(`${API_BASE_URL}/history/${user.username}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(historyEntry)
        });

        if (!response.ok) {
          throw new Error('Failed to save to history');
        }
      }

      setSelectedTemplate(null);
    } catch (error) {
      setError('Failed to process prompt');
      console.error(error);
    }
  };

  const handleTemplateSelect = (template: Template): void => {
    setSelectedTemplate(template);
  };

  const handleLogin = async (): Promise<void> => {
    try {
      setError(null);
      const response = await fetch(`${API_BASE_URL}/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const newUser = { username: loginForm.username, password: loginForm.password };
      await chrome.storage.local.set({ user: newUser });
      setUser(newUser);
      setShowLogin(false);
      setLoginForm({ username: '', password: '' });
    } catch (error) {
      console.error('Login failed:', error);
      setError('Login failed. Please check your credentials.');
    }
  };

  const handleLogout = async (): Promise<void> => {
    await chrome.storage.local.remove(['user']);
    setUser(null);
    setUserTemplates([]);
    setError(null);
  };

  const saveTemplate = async (): Promise<void> => {
    if (!user) {
      setShowLogin(true);
      return;
    }

    try {
      const newTemplateData = {
        name: newTemplate.name,
        content: newTemplate.content,
        category: newTemplate.category,
        aiTool: currentAI,
        outputType: newTemplate.outputType,
        promptType: newTemplate.promptType
      };

      const response = await fetch(`${API_BASE_URL}/templates/${user.username}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newTemplateData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save template');
      }

      const savedTemplate = await response.json();
      setUserTemplates(current => [...current, savedTemplate]);
      setShowNewForm(false);
      setNewTemplate({
        name: '',
        content: '',
        category: 'General',
        outputType: 'blog-post',
        promptType: 'zero-shot'
      });
      setError(null);
    } catch (error) {
      console.error('Save template error:', error);
      setError(error instanceof Error ? error.message : 'Failed to save template');
    }
  };

  const TabNavigation = (): JSX.Element => (
    <div className="border-b border-gray-200 mb-4">
      <nav className="flex -mb-px">
        {['Templates', 'Custom', 'History'].map((tab) => {
          const tabKey = tab.toLowerCase() as TabType;
          const isActive = activeTab === tabKey;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tabKey)}
              className={`
                flex-1 px-4 py-2 text-center border-b-2 font-medium text-sm
                ${isActive 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              {tab}
            </button>
          );
        })}
      </nav>
    </div>
  );

  const categories = Array.from(new Set([...templates, ...userTemplates].map(t => t.category)));

  const renderContent = (): JSX.Element => {
    switch (activeTab) {
      case 'templates':
        return (
          <div>
            {categories.map(category => (
              <div key={category} className="mb-4">
                <h3 className="font-semibold mb-2">{category}</h3>
                <div className="space-y-2">
                  {templates
                    .filter(t => t.category === category)
                    .map((template) => (
                      <div key={template.id} className="p-2 border rounded hover:bg-gray-50">
                        <div className="font-medium">{template.name}</div>
                        <div className="text-sm text-gray-600">
                          {template.outputType} • {template.promptType}
                        </div>
                        <button 
                          onClick={() => handleTemplateSelect(template)}
                          className="mt-1 px-2 py-1 text-sm bg-blue-500 text-white rounded"
                        >
                          Use Template
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        );
      
      case 'custom':
        return (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Custom Templates</h2>
              <button 
                onClick={() => setShowNewForm(true)}
                className="px-2 py-1 bg-blue-500 text-white rounded"
              >
                New Template
              </button>
            </div>
            <div className="space-y-2">
              {userTemplates.map((template) => (
                <div key={template.id} className="p-2 border rounded hover:bg-gray-50">
                  <div className="font-medium">{template.name}</div>
                  <div className="text-sm text-gray-600">
                    {template.outputType} • {template.promptType}
                  </div>
                  <button 
                    onClick={() => handleTemplateSelect(template)}
                    className="mt-1 px-2 py-1 text-sm bg-blue-500 text-white rounded"
                  >
                    Use Template
                  </button>
                </div>
              ))}
            </div>
            {showNewForm && (
              <div className="mb-4 p-4 border rounded">
                <input
                  type="text"
                  placeholder="Template Name"
                  className="w-full p-2 mb-2 border rounded"
                  value={newTemplate.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setNewTemplate({...newTemplate, name: e.target.value})}
                />
                <textarea
                  placeholder="Template Content"
                  className="w-full p-2 mb-2 border rounded"
                  rows={4}
                  value={newTemplate.content}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                    setNewTemplate({...newTemplate, content: e.target.value})}
                />
                <select
                  className="w-full p-2 mb-2 border rounded"
                  value={newTemplate.category}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
                    setNewTemplate({...newTemplate, category: e.target.value})}
                >
                  <option value="General">General</option>
                  <option value="Custom">Custom</option>
                </select>
                <select
                  className="w-full p-2 mb-2 border rounded"
                  value={newTemplate.outputType}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
                    setNewTemplate({...newTemplate, outputType: e.target.value as any})}
                >
                  <option value="blog-post">Blog Post</option>
                  <option value="email">Email</option>
                  <option value="code">Code</option>
                  <option value="analysis">Analysis</option>
                  <option value="summary">Summary</option>
                  <option value="social-media">Social Media</option>
                  <option value="documentation">Documentation</option>
                  <option value="other">Other</option>
                </select>
                <select
                  className="w-full p-2 mb-2 border rounded"
                  value={newTemplate.promptType}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
                    setNewTemplate({...newTemplate, promptType: e.target.value as any})}
                >
                  <option value="zero-shot">Zero Shot</option>
                  <option value="one-shot">One Shot</option>
                  <option value="few-shot">Few Shot</option>
                  <option value="chain-of-thought">Chain of Thought</option>
                  <option value="step-by-step">Step by Step</option>
                  <option value="tree-of-thought">Tree of Thought</option>
                  <option value="other">Other</option>
                </select>
                <div className="flex justify-end gap-2">
                  <button 
                    onClick={() => setShowNewForm(false)}
                    className="px-2 py-1 border rounded"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={saveTemplate}
                    className="px-2 py-1 bg-blue-500 text-white rounded"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
          </div>
        );

        case 'history':
          return (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Prompt History</h2>
              {prompts.length === 0 ? (
                <div className="text-gray-500 text-center py-4">
                  No prompt history available
                </div>
              ) : (
                prompts.map((prompt) => (
                  <div key={prompt.id} className="p-3 border rounded">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium">
                          {prompt.metadata?.templateName || 'Untitled Template'}
                        </div>
                        <div className="text-sm text-gray-600">
                          {prompt.metadata?.outputType || 'other'} • {prompt.metadata?.promptType || 'other'}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(prompt.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-sm bg-gray-50 p-2 rounded mt-2">
                      {prompt.content}
                    </div>
                    <button 
                      onClick={() => sendToChat(prompt.content)}
                      className="mt-2 px-2 py-1 text-sm bg-blue-500 text-white rounded"
                    >
                      Reuse Prompt
                    </button>
                  </div>
                ))
              )}
            </div>
          );
      }
    };
  
    if (selectedTemplate) {
      return (
        <div className="w-[600px] p-4">
          <TemplateEditor
            template={selectedTemplate}
            onSubmit={handlePromptSubmit}
            onCancel={() => setSelectedTemplate(null)}
          />
        </div>
      );
    }
  
    return (
      <div className="w-[600px] p-4">
        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
  
        {!user && !showLogin && (
          <button 
            onClick={() => setShowLogin(true)}
            className="w-full mb-4 px-4 py-2 bg-gray-800 text-white rounded"
          >
            Login
          </button>
        )}
  
        {user && (
          <div className="mb-4 flex justify-between items-center">
            <span>Logged in as {user.username}</span>
            <button
              onClick={handleLogout}
              className="px-2 py-1 text-sm bg-gray-200 rounded"
            >
              Logout
            </button>
          </div>
        )}
  
        {showLogin && (
          <div className="mb-4 p-4 border rounded">
            <input
              type="text"
              placeholder="Username"
              className="w-full p-2 mb-2 border rounded"
              value={loginForm.username}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                setLoginForm({...loginForm, username: e.target.value})}
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full p-2 mb-2 border rounded"
              value={loginForm.password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                setLoginForm({...loginForm, password: e.target.value})}
            />
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => setShowLogin(false)}
                className="px-2 py-1 border rounded"
              >
                Cancel
              </button>
              <button 
                onClick={handleLogin}
                className="px-2 py-1 bg-blue-500 text-white rounded"
              >
                Login
              </button>
            </div>
          </div>
        )}
  
        <TabNavigation />
        {renderContent()}
      </div>
    );
  }; 