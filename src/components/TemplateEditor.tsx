// src/components/TemplateEditor.tsx

import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Typography,
  Card,
  CardContent,
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
  Alert
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import type { Template, PromptHistory } from '../types/template';

interface TemplateEditorProps {
  template: Template | null | undefined;
  historyItem?: PromptHistory;
  onSave: (template: Omit<Template, 'id'>) => void;
  onDelete?: (templateId: string) => void;
  onCancel: () => void;
  existingTemplateNames?: string[];
}

const CATEGORIES = ['Planning', 'Development', 'Analysis', 'General'];
const VARIABLE_TYPES = ['TEXT', 'CODE', 'NUMBER', 'DATE'];

// Custom styles
const headerStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '1.1rem',
  fontWeight: 500,
  color: '#2C3E50'
} as const;

const toolbarButtonStyle = {
  backgroundColor: 'transparent',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)'
  }
} as const;

const TemplateEditor: React.FC<TemplateEditorProps> = ({
  template,
  historyItem,
  onSave,
  onDelete,
  onCancel,
  existingTemplateNames = []
}) => {
  const [name, setName] = useState(template?.name || '');
  const [description, setDescription] = useState(template?.description || '');
  const [content, setContent] = useState(template?.content || historyItem?.content || '');
  const [category, setCategory] = useState(template?.category || 'General');
  const [selectedVariable, setSelectedVariable] = useState('TEXT');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  const isStandardTemplate = template?.is_standard || false;
  const isFromHistory = !!historyItem;

  useEffect(() => {
    if (historyItem) {
      setContent(historyItem.content);
      // When creating from history, generate a default name based on content
      if (!template) {
        const defaultName = historyItem.content
          .slice(0, 30)
          .replace(/\[.*?\]/g, '') // Remove variable placeholders
          .trim() + '...';
        setName(defaultName);
      }
    }
  }, [historyItem, template]);

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
      description: description || '',
      is_standard: false,
      created_at: template?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: template?.user_id || '', // Provide empty string as default
      category_id: template?.category_id,
      aitool: template?.aitool || '',
      outputtype: template?.outputtype || 'text',
      prompttype: template?.prompttype || 'general'
    });
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header Toolbar */}
      <Box sx={{ 
        px: 2, 
        py: 1.5, 
        borderBottom: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography sx={headerStyle}>
          {isFromHistory ? 'Save History as Template' : 
           isStandardTemplate ? 'Save Template As' : 
           template ? 'Edit Template' : 'New Template'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Save">
            <IconButton 
              onClick={handleSave}
              disabled={!name || !content || !!nameError}
              size="small"
              sx={toolbarButtonStyle}
            >
              <SaveIcon />
            </IconButton>
          </Tooltip>
          {template && !isStandardTemplate && onDelete && (
            <Tooltip title="Delete">
              <IconButton 
                onClick={() => setDeleteDialogOpen(true)}
                size="small"
                sx={toolbarButtonStyle}
                color="error"
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Close">
            <IconButton 
              onClick={onCancel}
              size="small"
              sx={toolbarButtonStyle}
            >
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Main Content */}
      <CardContent sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {isStandardTemplate && (
          <Alert severity="info" sx={{ mb: 2 }}>
            This is a standard template. You can save a copy with your modifications.
          </Alert>
        )}
        {isFromHistory && (
          <Alert severity="info" sx={{ mb: 2 }}>
            You're creating a new template from a history item.
          </Alert>
        )}

        <Stack spacing={2}>
          <TextField
            fullWidth
            label="Template Name"
            value={name}
            onChange={handleNameChange}
            required
            error={!!nameError}
            helperText={nameError}
            size="small"
          />

          <TextField
            fullWidth
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={2}
            size="small"
          />

          <FormControl fullWidth size="small">
            <InputLabel>Category</InputLabel>
            <Select
              value={category}
              label="Category"
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((cat) => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Variables Section */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            backgroundColor: '#f8f9fa',
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
                <AddIcon />
              </IconButton>
            </Tooltip>
          </Box>

          <TextField
            fullWidth
            label="Template Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            multiline
            rows={12}
            required
            sx={{ flex: 1 }}
          />
        </Stack>
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Template?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this template? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={() => {
              if (template?.id && onDelete) {
                onDelete(template.id);
              }
              setDeleteDialogOpen(false);
            }} 
            color="error" 
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default TemplateEditor;