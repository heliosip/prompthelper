import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  CardActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack
} from '@mui/material';
import type { Template } from '../types/template';

interface TemplateEditorProps {
  template: Template | null | undefined;  // Updated type here
  onSave: (template: Omit<Template, 'id'>) => void;
  onCancel: () => void;
}

const CATEGORIES = ['Planning', 'Development', 'Analysis', 'General'];
const VARIABLE_TYPES = ['TEXT', 'CODE', 'NUMBER', 'DATE'];

const TemplateEditor: React.FC<TemplateEditorProps> = ({
  template,
  onSave,
  onCancel
}) => {
  const [name, setName] = useState(template?.name || '');
  const [description, setDescription] = useState(template?.description || '');
  const [content, setContent] = useState(template?.content || '');
  const [category, setCategory] = useState(template?.category || 'General');
  const [selectedVariable, setSelectedVariable] = useState('TEXT');

  const insertVariable = () => {
    const variable = `[${selectedVariable}]`;
    setContent((prev) => prev + variable);
  };

  const handleSave = () => {
    onSave({
      name,
      description,
      content,
      category
    });
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {template ? 'Edit Template' : 'New Template'}
        </Typography>

        <Stack spacing={2}>
          <TextField
            fullWidth
            label="Template Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <TextField
            fullWidth
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={2}
          />

          <FormControl fullWidth>
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

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Variables
            </Typography>
            <Stack direction="row" spacing={1} mb={1}>
              <Select
                size="small"
                value={selectedVariable}
                onChange={(e) => setSelectedVariable(e.target.value)}
              >
                {VARIABLE_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
              <Button 
                variant="outlined" 
                size="small"
                onClick={insertVariable}
              >
                Insert Variable
              </Button>
            </Stack>
            <Typography variant="caption" color="text.secondary">
              Click to insert placeholder variables into your template
            </Typography>
          </Box>

          <TextField
            fullWidth
            label="Template Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            multiline
            rows={6}
            required
          />
        </Stack>
      </CardContent>

      <CardActions>
        <Button size="small" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          size="small" 
          variant="contained"
          onClick={handleSave}
          disabled={!name || !content}
        >
          Save Template
        </Button>
      </CardActions>
    </Card>
  );
};

export default TemplateEditor;