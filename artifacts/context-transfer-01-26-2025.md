# Prompt Helper Project Status

## Current Project Structure
```
/prompthelper
  /server (running on port 3001)
    - index.ts (Express server with auth working)
    - users.json (contains testuser credentials)
    - createUser.ts
  /src
    /popup
    - popup.tsx
    - content.ts
```

## Working Features
- Server authentication endpoint (/auth) working on port 3001
- Chrome extension can insert templates into Claude's chat
- User authentication working (testuser/password123)

## Key Files

### /server/index.ts
```typescript
import express, { Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';
import bcrypt from 'bcrypt';

const app = express();
app.use(express.json());

const USERS_FILE = path.join(__dirname, 'users.json');
const TEMPLATES_DIR = path.join(__dirname, '..', 'usertemplates');

interface User {
  username: string;
  password: string;
}

// Authentication endpoint
app.post('/auth', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    console.log('Auth request for username:', username);
    
    const usersData = await fs.readFile(USERS_FILE, 'utf-8');
    console.log('Users data:', usersData);
    
    const userData = JSON.parse(usersData);
    console.log('Parsed user data:', userData);
    
    const user = userData.users.find((u: User) => u.username === username);
    console.log('Found user:', user);
    
    if (user && await bcrypt.compare(password, user.password)) {
      console.log('Authentication successful');
      res.json({ success: true });
    } else {
      console.log('Authentication failed');
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error: any) {
    console.error('Server error:', error);
    res.status(500).json({ 
      error: 'Server error', 
      details: error.message || 'Unknown error'
    });
  }
});

// Get templates for a user
app.get('/templates/:username', async (req: Request, res: Response) => {
  try {
    const userDir = path.join(TEMPLATES_DIR, req.params.username);
    const templates = await fs.readFile(path.join(userDir, 'templates.json'), 'utf-8');
    res.json(JSON.parse(templates));
  } catch (error) {
    console.error('Error getting templates:', error);
    res.status(404).json({ error: 'Templates not found' });
  }
});

// Save templates for a user
app.put('/templates/:username', async (req: Request, res: Response) => {
  try {
    const userDir = path.join(TEMPLATES_DIR, req.params.username);
    await fs.mkdir(userDir, { recursive: true });
    await fs.writeFile(
      path.join(userDir, 'templates.json'),
      JSON.stringify(req.body, null, 2)
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving templates:', error);
    res.status(500).json({ error: 'Failed to save templates' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### /server/users.json
```json
{
  "users": [
    {
      "username": "testuser",
      "password": "$2b$10$3JShYzF.jHUylLa0V.Dw6.7KoN3OdhckG4XaggTdNyihXwqxyIMD6"
    }
  ]
}
```

### /src/popup/popup.tsx
```typescript
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

  // Rest of the component implementation...
};

export default Popup;
```

## Next Steps
1. Implement template CRUD operations in server
2. Test template creation and retrieval
3. Connect template operations to Chrome extension UI
4. Add template management features to popup.tsx

## Authentication Details
- Server running on port 3001
- Test user credentials: testuser/password123
- Authentication endpoint: POST http://localhost:3001/auth