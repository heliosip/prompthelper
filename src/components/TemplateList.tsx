// src/components/TemplateList.tsx
import React from 'react';
import { useTemplates } from 'hooks/useTemplates'; // Absolute import based on baseUrl: "src"
import type { Template } from 'database.types';

interface TemplateListProps {
  userId?: string;
  onSelect: (template: Template) => void;
}

const TemplateList: React.FC<TemplateListProps> = ({ userId, onSelect }) => {
  const { templates, loading, error, refresh } = useTemplates(userId);

  if (loading) return <div>Loading templates...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Templates</h2>
      <button onClick={refresh}>Refresh</button>
      <ul>
        {templates.map((template: Template) => (
          <li key={template.id}>
            <button onClick={() => onSelect(template)}>{template.name}</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TemplateList;
