// src/components/TemplateList.tsx

import React from 'react';
import { 
  Box, 
  Card, 
  Typography, 
  IconButton,
  List,
  ListItem,
  Tooltip,
  Chip,
  alpha
} from '@mui/material';
import { motion } from 'framer-motion';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import type { Template } from '../types/template';

interface TemplateListProps {
  templates: Template[];
  onSelectTemplate: (template: Template) => void;
}

const container = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1
  }
};

const TemplateList: React.FC<TemplateListProps> = ({ 
  templates,
  onSelectTemplate
}) => {
  // Group templates by category
  const groupedTemplates = templates.reduce((acc, template) => {
    const category = template.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(template);
    return acc;
  }, {} as Record<string, Template[]>);

  return (
    <Box>
      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
      >
        {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => (
          <Box key={category} sx={{ mb: 3 }}>
            <Typography
              variant="h6"
              sx={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'text.secondary',
                mb: 1,
                px: 1
              }}
            >
              {category}
            </Typography>
            <List sx={{ p: 0 }}>
              {categoryTemplates.map((template) => (
                <motion.div key={template.id} variants={item}>
                  <Card
                    sx={{
                      mb: 1,
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.primary.main, 0.1)}`
                      }
                    }}
                  >
                    <ListItem
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        p: 2,
                        cursor: 'pointer'
                      }}
                      onClick={() => onSelectTemplate(template)}
                    >
                      <Box sx={{ flex: 1, mr: 1 }}>
                        <Box display="flex" alignItems="center" mb={0.5}>
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontSize: '0.95rem',
                              fontWeight: 500,
                              color: 'text.primary',
                              mr: 1
                            }}
                          >
                            {template.name}
                          </Typography>
                          {template.is_standard && (
                            <Chip
                              label="Standard"
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: '0.75rem',
                                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                                color: 'primary.main'
                              }}
                            />
                          )}
                        </Box>
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'text.secondary',
                            fontSize: '0.875rem',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}
                        >
                          {template.description || 'No description'}
                        </Typography>
                      </Box>
                      <Tooltip title="Edit Template">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectTemplate(template);
                          }}
                          sx={{
                            color: 'action.active',
                            '&:hover': {
                              color: 'primary.main',
                              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1)
                            }
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </ListItem>
                  </Card>
                </motion.div>
              ))}
            </List>
          </Box>
        ))}
      </motion.div>

      {templates.length === 0 && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            py: 8,
            px: 2,
            textAlign: 'center'
          }}
        >
          <AddIcon
            sx={{
              fontSize: 48,
              color: 'action.disabled',
              mb: 2
            }}
          />
          <Typography
            variant="h6"
            sx={{
              color: 'text.secondary',
              fontSize: '1rem',
              fontWeight: 500,
              mb: 1
            }}
          >
            No Templates Yet
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'text.disabled',
              maxWidth: 300
            }}
          >
            Create your first template by clicking the + button below
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default TemplateList;