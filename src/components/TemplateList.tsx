import React from 'react';
import { 
  List, 
  ListItem, 
  ListItemText, 
  ListItemButton,
  Typography,
  Chip
} from '@mui/material';
import type { Template, TemplateListProps } from '../types/template';

const TemplateList: React.FC<TemplateListProps> = ({ templates, onSelectTemplate }) => {
  return (
    <List>
      {templates.map((template) => (
        <ListItem 
          key={template.id}
          disablePadding
          secondaryAction={
            <Chip 
              label={template.category}
              size="small"
              color="primary"
              variant="outlined"
            />
          }
        >
          <ListItemButton onClick={() => onSelectTemplate(template)}>
            <ListItemText
              primary={template.name}
              secondary={
                <Typography
                  component="span"
                  variant="body2"
                  color="text.secondary"
                >
                  {template.description}
                </Typography>
              }
            />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
};

export default TemplateList;