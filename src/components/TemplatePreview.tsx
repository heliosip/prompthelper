// src/components/TemplatePreview.tsx

import React from 'react';
import { 
  Box, 
  Typography, 
  TextField,
  Card,
  IconButton,
  Tooltip,
  Chip,
  alpha
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import type { Template } from '../types/template';

interface TemplatePreviewProps {
  template: Template;
  onClose: () => void;
  onInsert: (content: string) => void;
  onEdit: () => void;
}

const TemplatePreview: React.FC<TemplatePreviewProps> = ({ 
  template, 
  onClose, 
  onInsert,
  onEdit
}) => {
  const [content, setContent] = React.useState(template.content);

  return (
    <Card sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      bgcolor: '#FFFFFF'
    }}>
      {/* Header */}
      <Box sx={{ 
        px: 2, 
        py: 1.5, 
        borderBottom: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Box>
          <Typography
            sx={{
              fontSize: '1.1rem',
              fontWeight: 500,
              color: 'text.primary',
              mb: 0.5
            }}
          >
            {template.name}
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Chip
              label={template.category}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.75rem',
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                color: 'primary.main'
              }}
            />
            {template.is_standard && (
              <Chip
                label="Standard"
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.75rem',
                  bgcolor: (theme) => alpha(theme.palette.success.main, 0.1),
                  color: 'success.main'
                }}
              />
            )}
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={onEdit}
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
          <Tooltip title="Close">
            <IconButton
              size="small"
              onClick={onClose}
              sx={{
                color: 'action.active',
                '&:hover': {
                  color: 'error.main',
                  bgcolor: (theme) => alpha(theme.palette.error.main, 0.1)
                }
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ 
        flex: 1, 
        p: 2,
        display: 'flex',
        flexDirection: 'column'
      }}>
        {template.description && (
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              mb: 2,
              fontSize: '0.875rem'
            }}
          >
            {template.description}
          </Typography>
        )}

        <TextField
          fullWidth
          multiline
          rows={12}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          variant="outlined"
          placeholder="Template content"
          sx={{
            flex: 1,
            '& .MuiOutlinedInput-root': {
              backgroundColor: '#FAFAFA',
              '&:hover': {
                backgroundColor: '#F5F5F5'
              },
              '&.Mui-focused': {
                backgroundColor: '#FFFFFF'
              }
            }
          }}
        />

        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'flex-end',
          mt: 2
        }}>
          <Tooltip title="Insert Template">
            <IconButton
              onClick={() => onInsert(content)}
              color="primary"
              sx={{
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                '&:hover': {
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.2)
                }
              }}
            >
              <SendIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Card>
  );
};

export default TemplatePreview;