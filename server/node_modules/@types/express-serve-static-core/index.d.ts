import express, { Request, Response, NextFunction } from 'express';
import fs from 'fs/promises';
import path from 'path';
import bcrypt from 'bcrypt';

const app = express();
app.use(express.json());

const USERS_FILE = path.join(__dirname, 'users.json');
const TEMPLATES_DIR = path.join(__dirname, '..', 'usertemplates');

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
  isUserTemplate: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateTemplateRequest {
  name: string;
  content: string;
  category: string;
  aiTool: string;
}

// Parameter types for route handlers
interface TemplateParams {
  username: string;
  templateId?: string;
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
  return null;
};

// Authentication endpoint
app.post('/auth', async (req: Request, res: Response, next: NextFunction) => {
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
  } catch (error) {
    next(error);
  }
});

// Create template
app.post('/templates/:username', 
  async (req: Request<TemplateParams>, res: Response, next: NextFunction) => {
    try {
      // Verify user exists
      const usersData = await fs.readFile(USERS_FILE, 'utf-8');
      const userData = JSON.parse(usersData);
      const user = userData.users.find((u: User) => u.username === req.params.username);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const templateData: CreateTemplateRequest = req.body;
      
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
      await fs.mkdir(userDir, { recursive: true });
      
      let templates: Template[] = [];
      try {
        const existingData = await fs.readFile(path.join(userDir, 'templates.json'), 'utf-8');
        templates = JSON.parse(existingData);
      } catch (error) {
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

      res.status(201).json(newTemplate);
    } catch (error) {
      next(error);
    }
});

// Get all templates for a user
app.get('/templates/:username', 
  async (req: Request<TemplateParams>, res: Response, next: NextFunction) => {
    try {
      const userDir = path.join(TEMPLATES_DIR, req.params.username);
      const templates = await fs.readFile(path.join(userDir, 'templates.json'), 'utf-8');
      res.json(JSON.parse(templates));
    } catch (error) {
      next(error);
    }
});

// Get single template
app.get('/templates/:username/:templateId', 
  async (req: Request<TemplateParams>, res: Response, next: NextFunction) => {
    try {
      const userDir = path.join(TEMPLATES_DIR, req.params.username);
      const templatesData = await fs.readFile(path.join(userDir, 'templates.json'), 'utf-8');
      const templates: Template[] = JSON.parse(templatesData);
      
      const template = templates.find(t => t.id === req.params.templateId);
      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }
      
      res.json(template);
    } catch (error) {
      next(error);
    }
});

// Update template
app.put('/templates/:username/:templateId', 
  async (req: Request<TemplateParams>, res: Response, next: NextFunction) => {
    try {
      const userDir = path.join(TEMPLATES_DIR, req.params.username);
      const templatesData = await fs.readFile(path.join(userDir, 'templates.json'), 'utf-8');
      let templates: Template[] = JSON.parse(templatesData);
      
      const templateIndex = templates.findIndex(t => t.id === req.params.templateId);
      if (templateIndex === -1) {
        return res.status(404).json({ error: 'Template not found' });
      }

      const templateData: CreateTemplateRequest = req.body;
      const validationError = validateTemplate(templateData);
      if (validationError) {
        return res.status(400).json({ error: validationError });
      }

      // Update template while preserving id and creation date
      templates[templateIndex] = {
        ...templates[templateIndex],
        ...templateData,
        updatedAt: new Date().toISOString()
      };

      await fs.writeFile(
        path.join(userDir, 'templates.json'),
        JSON.stringify(templates, null, 2)
      );

      res.json(templates[templateIndex]);
    } catch (error) {
      next(error);
    }
});

// Delete template
app.delete('/templates/:username/:templateId', 
  async (req: Request<TemplateParams>, res: Response, next: NextFunction) => {
    try {
      const userDir = path.join(TEMPLATES_DIR, req.params.username);
      const templatesData = await fs.readFile(path.join(userDir, 'templates.json'), 'utf-8');
      let templates: Template[] = JSON.parse(templatesData);
      
      const templateIndex = templates.findIndex(t => t.id === req.params.templateId);
      if (templateIndex === -1) {
        return res.status(404).json({ error: 'Template not found' });
      }

      // Remove the template
      templates.splice(templateIndex, 1);

      await fs.writeFile(
        path.join(userDir, 'templates.json'),
        JSON.stringify(templates, null, 2)
      );

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
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