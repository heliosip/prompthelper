import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Typography,
  Slider,
  Alert,
  CircularProgress
} from '@mui/material';
import { templateService, type TemplateWithSettings } from '@/services';
import type { AIModel } from '@/types/database.types';

// Rest of the component code remains the same...

interface TemplateEditorProps {
  template: TemplateWithSettings;
  onSave: (template: TemplateWithSettings) => void;
  onCancel: () => void;
}

const TemplateEditor: React.FC<TemplateEditorProps> = ({
  template,
  onSave,
  onCancel
}) => {
  // Form state
  const [formData, setFormData] = useState({
    name: template.name,
    content: template.content,
    description: template.description || '',
    ai_model_id: template.ai_model_id || '',
    settings: {
      temperature: template.settings?.temperature || 0.7,
      tone: template.settings?.tone || 'professional',
      style: template.settings?.style || 'concise'
    }
  });

  // UI state
  const [aiModels, setAIModels] = useState<AIModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAIModels();
  }, []);

  const loadAIModels = async () => {
    try {
      const models = await templateService.getAIModels();
      setAIModels(models);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load AI models');
    }
  };

  const handleChange = (field: string, value: any) => {
    if (field.startsWith('settings.')) {
      const settingField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        settings: {
          ...prev.settings,
          [settingField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    try {
      const updatedTemplate = await templateService.updateTemplate(
        template.id,
        {
          name: formData.name,
          content: formData.content,
          description: formData.description,
          ai_model_id: formData.ai_model_id
        },
        formData.settings
      );

      onSave(updatedTemplate);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save template');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="space-y-4 p-4">
      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}

      <TextField
        fullWidth
        label="Template Name"
        value={formData.name}
        onChange={(e) => handleChange('name', e.target.value)}
        disabled={loading}
      />

      <TextField
        fullWidth
        label="Description"
        value={formData.description}
        onChange={(e) => handleChange('description', e.target.value)}
        disabled={loading}
        multiline
        rows={2}
      />

      <FormControl fullWidth>
        <InputLabel>AI Model</InputLabel>
        <Select
          value={formData.ai_model_id}
          onChange={(e) => handleChange('ai_model_id', e.target.value)}
          disabled={loading}
        >
          {aiModels.map((model) => (
            <MenuItem key={model.id} value={model.id}>
              {model.name} - {model.provider}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box>
        <Typography gutterBottom>
          Temperature: {formData.settings.temperature}
        </Typography>
        <Slider
          value={formData.settings.temperature}
          onChange={(_e, value) => handleChange('settings.temperature', value)}
          min={0}
          max={1}
          step={0.1}
          disabled={loading}
        />
      </Box>

      <FormControl fullWidth>
        <InputLabel>Tone</InputLabel>
        <Select
          value={formData.settings.tone}
          onChange={(e) => handleChange('settings.tone', e.target.value)}
          disabled={loading}
        >
          <MenuItem value="professional">Professional</MenuItem>
          <MenuItem value="casual">Casual</MenuItem>
          <MenuItem value="academic">Academic</MenuItem>
          <MenuItem value="friendly">Friendly</MenuItem>
          <MenuItem value="technical">Technical</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth>
        <InputLabel>Style</InputLabel>
        <Select
          value={formData.settings.style}
          onChange={(e) => handleChange('settings.style', e.target.value)}
          disabled={loading}
        >
          <MenuItem value="concise">Concise</MenuItem>
          <MenuItem value="descriptive">Descriptive</MenuItem>
          <MenuItem value="analytical">Analytical</MenuItem>
          <MenuItem value="creative">Creative</MenuItem>
          <MenuItem value="instructional">Instructional</MenuItem>
        </Select>
      </FormControl>

      <TextField
        fullWidth
        label="Prompt Content"
        value={formData.content}
        onChange={(e) => handleChange('content', e.target.value)}
        disabled={loading}
        multiline
        rows={6}
        className="font-mono"
      />

      <Box className="flex justify-end space-x-2">
        <Button
          variant="outlined"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Save Template'}
        </Button>
      </Box>
    </Box>
  );
};

export default TemplateEditor;