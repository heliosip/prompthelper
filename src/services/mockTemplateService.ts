import type { Template } from '../types/template';

const mockTemplates: Template[] = [
  {
    id: '1',
    name: 'Task Analysis',
    description: 'Analyze tasks and break them down into steps',
    content: 'Please analyze this task:\n[TASK]\n\nConsider:\n1. Requirements\n2. Challenges\n3. Steps',
    category: 'Planning'
  },
  {
    id: '2',
    name: 'Code Review',
    description: 'Get feedback on code quality and suggestions',
    content: 'Please review this code:\n[CODE]\n\nFocus on:\n1. Performance\n2. Best practices\n3. Potential issues',
    category: 'Development'
  },
  {
    id: '3',
    name: 'Data Analysis',
    description: 'Analyze data and provide insights',
    content: 'Please analyze this data:\n[DATA]\n\nProvide:\n1. Key patterns\n2. Insights\n3. Recommendations',
    category: 'Analysis'
  }
];

export const mockTemplateService = {
  getTemplates: () => Promise.resolve(mockTemplates),
  getTemplateById: (id: string) => Promise.resolve(mockTemplates.find(t => t.id === id)),
  getTemplatesByCategory: (category: string) => 
    Promise.resolve(mockTemplates.filter(t => t.category === category))
};