// src/components/TemplateList.tsx

import React from 'react';
import { Box, Typography, CircularProgress, Alert, Button } from '@mui/material';
import { useTemplates } from '../hooks/useTemplates';
import type { Template } from '../types/template';

interface TemplateListProps {
  userId?: string;
  onSelect: (template: Template) => void;
}

const TemplateList: React.FC<TemplateListProps> = ({ userId, onSelect }) => {
  const { templates, loading, error, refresh } = useTemplates(userId);

  if (loading) {
    return (
      <Box className="flex justify-center items-center p-4">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="p-4">
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={refresh}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  if (templates.length === 0) {
    return (
      <Box className="p-4">
        <Typography color="textSecondary">
          No templates available.
        </Typography>
      </Box>
    );
  }

  return (
    <Box className="space-y-2">
      {templates.map((template) => (
        <Box
          key={template.id}
          onClick={() => onSelect(template)}
          className="p-3 border rounded cursor-pointer hover:bg-gray-50"
        >
          <Typography variant="subtitle1">
            {template.name}
          </Typography>
          {template.description && (
            <Typography variant="body2" color="textSecondary">
              {template.description}
            </Typography>
          )}
        </Box>
      ))}
      
      <Button 
        variant="outlined" 
        fullWidth 
        onClick={refresh}
        className="mt-4"
      >
        Refresh Templates
      </Button>
    </Box>
  );
};

export default TemplateList;