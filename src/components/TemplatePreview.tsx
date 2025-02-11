// src/components/TemplatePreview.tsx

import React from 'react';
import { 
  Box, 
  Typography, 
  TextField,
  IconButton,
  Tooltip,
  Chip,
  alpha,
  Theme
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import type { Template, PromptHistory } from '../types/template';

interface TemplatePreviewProps {
  template: Template;
  content?: string;
  isHistory?: boolean;
  onClose: () => void;
  onInsert: (content: string) => void;
  onEdit?: () => void;
  onSaveAsTemplate?: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

const toolbarButtonStyle = {
  color: 'action.active',
  '&:hover': {
    color: 'primary.main',
    backgroundColor: (theme: Theme) => alpha(theme.palette.primary.main, 0.08)
  }
} as const;

const TemplatePreview: React.FC<TemplatePreviewProps> = ({ 
  template,
  content: initialContent,
  isHistory,
  onClose,
  onInsert,
  onEdit,
  onSaveAsTemplate,
  isFavorite,
  onToggleFavorite
}) => {
  const [content, setContent] = React.useState(initialContent || template.content);

  return (
    <Box 
      sx={{ 
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        bgcolor: 'background.paper'
      }}
    >
      <Box sx={{ 
        px: 2, 
        py: 1.5, 
        borderBottom: 1,
        borderColor: 'divider',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%'
      }}>
        <Box>
          <Typography
            sx={{
              fontSize: '1rem',
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
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {isHistory && onToggleFavorite && (
            <Tooltip title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}>
              <IconButton
                size="small"
                onClick={onToggleFavorite}
                sx={{
                  ...toolbarButtonStyle,
                  color: isFavorite ? 'warning.main' : 'action.active',
                  '&:hover': {
                    color: 'warning.main',
                    backgroundColor: (theme: Theme) => alpha(theme.palette.warning.main, 0.08)
                  }
                }}
              >
                {isFavorite ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
          )}
          {onEdit && (
            <Tooltip title="Edit">
              <IconButton
                size="small"
                onClick={onEdit}
                sx={toolbarButtonStyle}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Close">
            <IconButton
              size="small"
              onClick={onClose}
              sx={toolbarButtonStyle}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Box sx={{ 
        flex: 1, 
        display: 'flex',
        flexDirection: 'column',
        p: 2,
        width: '100%',
        maxWidth: '100%',
        overflow: 'hidden'
      }}>
        <TextField
          fullWidth
          multiline
          value={content}
          onChange={(e) => setContent(e.target.value)}
          variant="outlined"
          placeholder="Template content"
          sx={{
            flex: 1,
            width: '100%',
            '& .MuiInputBase-root': {
              height: '100%',
              backgroundColor: 'background.default',
              fontFamily: 'monospace',
              fontSize: '0.875rem',
              width: '100%',
              maxWidth: '100%',
              '& textarea': {
                height: '100% !important'
              }
            }
          }}
        />

        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: 1,
          mt: 2,
          width: '100%'
        }}>
          {isHistory && onSaveAsTemplate && (
            <Tooltip title="Save as Template">
              <IconButton
                onClick={onSaveAsTemplate}
                sx={toolbarButtonStyle}
              >
                <StarIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Send to Chat">
            <IconButton
              onClick={() => onInsert(content)}
              sx={{
                ...toolbarButtonStyle,
                color: 'primary.main',
                backgroundColor: (theme: Theme) => alpha(theme.palette.primary.main, 0.08),
                '&:hover': {
                  backgroundColor: (theme: Theme) => alpha(theme.palette.primary.main, 0.16)
                }
              }}
            >
              <SendIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );
};

export default TemplatePreview;