import React, { useState, useEffect } from 'react';

interface Template {
  id: string;
  name: string;
  content: string;
  category: string;
  aiTool: string;
  isUserTemplate?: boolean;
  userId?: string;
}

interface User {
  username: string;
  password: string;
}

const Popup: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [userTemplates, setUserTemplates] = useState<Template[]>([]);
  const [currentAI, setCurrentAI] = useState('');
  const [showNewForm, setShowNewForm] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    content: '',
    category: 'General'
  });

  useEffect(() => {
    loadUser();
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      const url = tab.url || '';
      const ai = url.includes('chat.openai.com') ? 'chatgpt' : 
                 url.includes('claude.ai') ? 'claude' : 'unknown';
      setCurrentAI(ai);
      loadTemplates(ai);
      if (user) {
        loadUserTemplates(ai);
      }
    });
  }, [user]);

  const loadUser = async () => {
    const data = await chrome.storage.local.get(['user']);
    if (data.user) {
      setUser(data.user);
    }
  };

  const loadTemplates = async (ai: string) => {
    const data = await chrome.storage.local.get(['templates']);
    setTemplates(data.templates?.filter((t: Template) => t.aiTool === ai) || []);
  };

  const loadUserTemplates = async (ai: string) => {
    if (!user) return;
    
    try {
      const response = await fetch(
        `YOUR_API_ENDPOINT/usertemplates/${user.username}/templates.json`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${btoa(`${user.username}:${user.password}`)}`
          }
        }
      );

      if (response.ok) {
        const userTemplates = await response.json();
        setUserTemplates(userTemplates.filter((t: Template) => t.aiTool === ai));
      }
    } catch (error) {
      console.error('Failed to load user templates:', error);
    }
  };

  const handleLogin = async () => {
    try {
      const response = await fetch('YOUR_AUTH_ENDPOINT', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });

      if (response.ok) {
        const user = { username: loginForm.username, password: loginForm.password };
        await chrome.storage.local.set({ user });
        setUser(user);
        setShowLogin(false);
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const saveTemplate = async () => {
    if (!user) {
      setShowLogin(true);
      return;
    }

    const newTemplateData: Template = {
      id: Date.now().toString(),
      ...newTemplate,
      aiTool: currentAI,
      isUserTemplate: true,
      userId: user.username
    };

    try {
      const updatedTemplates = [...userTemplates, newTemplateData];
      const response = await fetch(
        `YOUR_API_ENDPOINT/usertemplates/${user.username}/templates.json`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${btoa(`${user.username}:${user.password}`)}`
          },
          body: JSON.stringify(updatedTemplates)
        }
      );

      if (response.ok) {
        setUserTemplates(updatedTemplates);
        setShowNewForm(false);
        setNewTemplate({ name: '', content: '', category: 'General' });
      }
    } catch (error) {
      console.error('Failed to save template:', error);
    }
  };

  const categories = Array.from(new Set([...templates, ...userTemplates].map(t => t.category)));

  return (
    <div className="w-96 p-4">
      {!user && !showLogin && (
        <button 
          onClick={() => setShowLogin(true)}
          className="w-full mb-4 px-4 py-2 bg-gray-800 text-white rounded"
        >
          Login
        </button>
      )}

      {showLogin && (
        <div className="mb-4 p-4 border rounded">
          <input
            type="text"
            placeholder="Username"
            className="w-full p-2 mb-2 border rounded"
            value={loginForm.username}
            onChange={e => setLoginForm({...loginForm, username: e.target.value})}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 mb-2 border rounded"
            value={loginForm.password}
            onChange={e => setLoginForm({...loginForm, password: e.target.value})}
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

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Templates - {currentAI}</h2>
        <button 
          onClick={() => setShowNewForm(true)}
          className="px-2 py-1 bg-blue-500 text-white rounded"
        >
          New Template
        </button>
      </div>

      {showNewForm && (
        <div className="mb-4 p-4 border rounded">
          <input
            type="text"
            placeholder="Template Name"
            className="w-full p-2 mb-2 border rounded"
            value={newTemplate.name}
            onChange={e => setNewTemplate({...newTemplate, name: e.target.value})}
          />
          <textarea
            placeholder="Template Content"
            className="w-full p-2 mb-2 border rounded"
            rows={4}
            value={newTemplate.content}
            onChange={e => setNewTemplate({...newTemplate, content: e.target.value})}
          />
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

      {categories.map(category => (
        <div key={category} className="mb-4">
          <h3 className="font-semibold mb-2">{category}</h3>
          <div className="space-y-2">
            {[...templates, ...userTemplates]
              .filter(t => t.category === category)
              .map((template) => (
                <div key={template.id} className="p-2 border rounded hover:bg-gray-50">
                  <div className="font-medium">{template.name}</div>
                  {template.isUserTemplate && (
                    <div className="text-xs text-gray-500">Custom template</div>
                  )}
                  <button 
                    onClick={() => {
                      chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
                        if (tab.id) {
                          chrome.tabs.sendMessage(tab.id, {
                            action: 'insertPrompt',
                            prompt: template.content
                          });
                        }
                      });
                    }}
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
};

export default Popup;