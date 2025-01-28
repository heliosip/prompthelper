import express from 'express';
import { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import bcrypt from 'bcrypt';

const app = express();

// Add CORS middleware
app.use(cors({
  origin: true, // Allow all origins in development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

const USERS_FILE = path.join(__dirname, 'users.json');
const TEMPLATES_DIR = path.join(__dirname, '..', 'usertemplates');
const HISTORY_DIR = path.join(__dirname, '..', 'userhistory');

// Extended Request type to include body and params
interface ExtendedRequest<
  P extends Record<string, string> = Record<string, string>, 
  ReqBody = any
> extends Request {
  body: ReqBody;
  params: P;
}

// Type definitions
interface User {
  username: string;
  password: string;
}

interface Template {
  id: string;
  name: string;
  content: string;
  category: string;
  aiTool: string;
  outputType: string;
  promptType: string;
  isUserTemplate: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface HistoryEntry {
  id: string;
  templateId: string;
  content: string;
  timestamp: string;
  userId: string;
  metadata: {
    templateName: string;
    category: string;
    aiTool: string;
    outputType: string;
    promptType: string;
  };
}

interface CreateTemplateRequest {
  name: string;
  content: string;
  category: string;
  aiTool: string;
  outputType: string;
  promptType: string;
}

// Helper Functions
const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

const validateTemplate = (template: CreateTemplateRequest): string | null => {
  if (!template.name || template.name.length < 3) {
    return 'Template name must be at least 3 characters long';
  }
  if (!template.content || template.content.length < 10) {
    return 'Template content must be at least 10 characters long';
  }
  if (!template.category) {
    return 'Category is required';
  }
  if (!template.aiTool || !['claude', 'chatgpt'].includes(template.aiTool)) {
    return 'Valid AI tool (claude or chatgpt) is required';
  }
  if (!template.outputType) {
    return 'Output type is required';
  }
  if (!template.promptType) {
    return 'Prompt type is required';
  }
  return null;
};

// Check if directory exists
const ensureDirectoryExists = async (dirPath: string): Promise<void> => {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
};

// Authentication endpoint
app.post('/auth', async (req: ExtendedRequest<{}, { username: string, password: string }>, res: Response, next: NextFunction) => {
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
      return res.status(200).json({ success: true });
    } else {
      console.log('Authentication failed');
      return res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Auth error:', error);
    return next(error);
  }
});

// Template endpoints
app.get('/templates/:username', 
  async (req: ExtendedRequest<{ username: string }>, res: Response, next: NextFunction) => {
    try {
      console.log('Getting templates for user:', req.params.username);
      const userDir = path.join(TEMPLATES_DIR, req.params.username);
      console.log('User directory path:', userDir);

      await ensureDirectoryExists(userDir);
      
      try {
        const templatesPath = path.join(userDir, 'templates.json');
        console.log('Templates file path:', templatesPath);
        
        try {
          await fs.access(templatesPath);
          const templates = await fs.readFile(templatesPath, 'utf-8');
          console.log('Templates found:', templates);
          return res.status(200).json(JSON.parse(templates));
        } catch {
          console.log('No templates file found, creating empty one');
          const emptyTemplates: Template[] = [];
          await fs.writeFile(templatesPath, JSON.stringify(emptyTemplates, null, 2));
          return res.status(200).json(emptyTemplates);
        }
      } catch (error) {
        console.error('Error accessing templates:', error);
        return res.status(200).json([]);
      }
    } catch (error) {
      console.error('Templates GET error:', error);
      return next(error);
    }
});

// Create template
app.post('/templates/:username', 
  async (req: ExtendedRequest<{ username: string }, CreateTemplateRequest>, res: Response, next: NextFunction) => {
    try {
      // Verify user exists
      const usersData = await fs.readFile(USERS_FILE, 'utf-8');
      const userData = JSON.parse(usersData);
      const user = userData.users.find((u: User) => u.username === req.params.username);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const templateData = req.body;
      
      // Validate template data
      const validationError = validateTemplate(templateData);
      if (validationError) {
        return res.status(400).json({ error: validationError });
      }

      // Create new template object
      const newTemplate: Template = {
        id: generateId(),
        ...templateData,
        isUserTemplate: true,
        userId: req.params.username,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Load existing templates
      const userDir = path.join(TEMPLATES_DIR, req.params.username);
      await ensureDirectoryExists(userDir);
      
      let templates: Template[] = [];
      try {
        const existingData = await fs.readFile(path.join(userDir, 'templates.json'), 'utf-8');
        templates = JSON.parse(existingData);
      } catch {
        // File doesn't exist yet, starting with empty array
        templates = [];
      }

      // Add new template
      templates.push(newTemplate);

      // Save updated templates
      await fs.writeFile(
        path.join(userDir, 'templates.json'),
        JSON.stringify(templates, null, 2)
      );

      return res.status(201).json(newTemplate);
    } catch (error) {
      console.error('Template creation error:', error);
      return next(error);
    }
});

// Save prompt to history
app.post('/history/:username', 
  async (req: ExtendedRequest<{ username: string }, HistoryEntry>, res: Response, next: NextFunction) => {
    try {
      const userHistoryDir = path.join(HISTORY_DIR, req.params.username);
      await ensureDirectoryExists(userHistoryDir);
      
      const historyFile = path.join(userHistoryDir, 'history.json');
      let history: HistoryEntry[] = [];
      
      // Load existing history if it exists
      try {
        const existingHistory = await fs.readFile(historyFile, 'utf-8');
        history = JSON.parse(existingHistory);
      } catch {
        history = [];
      }

      // Add new history entry
      const newEntry: HistoryEntry = {
        id: generateId(),
        templateId: req.body.templateId,
        content: req.body.content,
        timestamp: new Date().toISOString(),
        userId: req.params.username,
        metadata: {
          templateName: req.body.metadata.templateName || "Untitled Template",
          category: req.body.metadata.category || "General",
          aiTool: req.body.metadata.aiTool || "claude",
          outputType: req.body.metadata.outputType || "other",
          promptType: req.body.metadata.promptType || "other"
        }
      };

      history.push(newEntry);

      // Save updated history
      await fs.writeFile(
        historyFile,
        JSON.stringify(history, null, 2)
      );

      return res.status(201).json(newEntry);
    } catch (error) {
      console.error('History save error:', error);
      return next(error);
    }
});

// Get user's prompt history
app.get('/history/:username', 
  async (req: ExtendedRequest<{ username: string }>, res: Response, next: NextFunction) => {
    try {
      const userHistoryDir = path.join(HISTORY_DIR, req.params.username);
      const historyFile = path.join(userHistoryDir, 'history.json');
      
      try {
        await fs.access(historyFile);
        const history = await fs.readFile(historyFile, 'utf-8');
        return res.status(200).json(JSON.parse(history));
      } catch {
        return res.status(200).json([]);
      }
    } catch (error) {
      console.error('History GET error:', error);
      return next(error);
    }
});

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Server error', 
    details: err.message || 'Unknown error'
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;