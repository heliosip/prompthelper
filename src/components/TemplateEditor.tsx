// src/components/TemplateEditor.tsx

import React, { useState } from 'react';
import {
  Box,
  TextField,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  alpha,
  Theme
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import PushPinIcon from '@mui/icons-material/PushPin';
import ClearIcon from '@mui/icons-material/Clear';
import type { Template } from '../types/template';

interface TemplateEditorProps {
  template: Template | null | undefined;
  onSave: (template: Omit<Template, 'id'>) => void;
  onDelete?: (templateId: string) => void;
  onCancel: () => void;
  existingTemplateNames?: string[];
}

const CATEGORIES = ['Planning', 'Development', 'Analysis', 'General'];
const VARIABLE_TYPES = ['TEXT', 'CODE', 'NUMBER', 'DATE'];

const toolbarButtonStyle = {
  color: 'action.active',
  '&:hover': {
    color: 'primary.main',
    backgroundColor: (theme: Theme) => alpha(theme.palette.primary.main, 0.08)
  },
  '&.Mui-disabled': {
    color: 'action.disabled'
  }
} as const;

const TemplateEditor: React.FC<TemplateEditorProps> = ({
  template,
  onSave,
  onDelete,
  onCancel,
  existingTemplateNames = []
}) => {
  const [name, setName] = useState(template?.name || '');
  const [content, setContent] = useState(template?.content || '');
  const [category, setCategory] = useState(template?.category || 'General');
  const [selectedVariable, setSelectedVariable] = useState('TEXT');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [isPinned, setIsPinned] = useState(false);

  const isStandardTemplate = template?.is_standard || false;

  const insertVariable = () => {
    const variable = `[${selectedVariable}]`;
    setContent((prev) => prev + variable);
  };

  const validateName = (newName: string) => {
    if (existingTemplateNames.includes(newName) && newName !== template?.name) {
      setNameError('A template with this name already exists');
      return false;
    }
    setNameError(null);
    return true;
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    validateName(newName);
  };

  const handleSave = () => {
    if (!validateName(name)) return;
    onSave({
      name,
      content,
      category,
      description: '',
      is_standard: false,
      created_at: template?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: template?.user_id || '',
      category_id: template?.category_id || '',
      aitool: template?.aitool || '',
      outputtype: template?.outputtype || 'text',
      prompttype: template?.prompttype || 'general'
    });
  };

  return (
    <Box sx={{ 
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      bgcolor: 'background.paper'
    }}>
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
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          flex: 1 
        }}>
          <TextField
            value={name}
            onChange={handleNameChange}
            variant="standard"
            placeholder="Template Name"
            fullWidth
            error={!!nameError}
            helperText={nameError}
            sx={{
              flex: 1,
              '& .MuiInputBase-root': {
                fontSize: '1.1rem'
              }
            }}
          />
          <FormControl sx={{ minWidth: 120 }}>
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              variant="standard"
              size="small"
            >
              {CATEGORIES.map((cat) => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title={isPinned ? "Unpin window" : "Pin window"}>
            <IconButton 
              size="small" 
              onClick={() => setIsPinned(!isPinned)}
              sx={toolbarButtonStyle}
            >
              <PushPinIcon fontSize="small" color={isPinned ? "primary" : "inherit"} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Clear content">
            <IconButton 
              size="small"
              onClick={() => setContent('')}
              sx={toolbarButtonStyle}
            >
              <ClearIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Save">
            <span>
              <IconButton 
                onClick={handleSave}
                disabled={!name || !content || !!nameError}
                size="small"
                sx={toolbarButtonStyle}
              >
                <SaveIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          {template && !isStandardTemplate && onDelete && (
            <Tooltip title="Delete">
              <IconButton 
                onClick={() => setDeleteDialogOpen(true)}
                size="small"
                sx={{
                  ...toolbarButtonStyle,
                  '&:hover': {
                    color: 'error.main',
                    backgroundColor: (theme) => alpha(theme.palette.error.main, 0.08)
                  }
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Close">
            <IconButton 
              onClick={onCancel}
              size="small"
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
        overflow: 'hidden'
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          mb: 2,
          bgcolor: 'background.default',
          p: 1,
          borderRadius: 1
        }}>
          <Select
            size="small"
            value={selectedVariable}
            onChange={(e) => setSelectedVariable(e.target.value)}
            sx={{ minWidth: 100 }}
          >
            {VARIABLE_TYPES.map((type) => (
              <MenuItem key={type} value={type}>{type}</MenuItem>
            ))}
          </Select>
          <Tooltip title="Insert Variable">
            <IconButton 
              onClick={insertVariable}
              size="small"
              sx={toolbarButtonStyle}
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        <TextField
          multiline
          fullWidth
          value={content}
          onChange={(e) => setContent(e.target.value)}
          variant="outlined"
          placeholder="Enter your template content here..."
          sx={{
            flex: 1,
            width: '100%',
            '& .MuiInputBase-root': {
              height: '100%',
              backgroundColor: 'background.default',
              fontFamily: 'monospace',
              fontSize: '0.875rem',
              '& textarea': {
                height: '100% !important'
              }
            }
          }}
        />
      </Box>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 2,
            width: '100%',
            maxWidth: 400
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>Delete Template?</DialogTitle>
        <DialogContent sx={{ pb: 2 }}>
          <DialogContentText>
            Are you sure you want to delete this template? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            sx={{ minWidth: 100 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={() => {
              if (template?.id && onDelete) {
                onDelete(template.id);
              }
              setDeleteDialogOpen(false);
            }} 
            variant="contained"
            color="error"
            autoFocus
            sx={{ minWidth: 100 }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TemplateEditor;