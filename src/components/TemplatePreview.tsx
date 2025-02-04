import React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  TextField,
  Card,
  CardContent,
  CardActions
} from '@mui/material';
import type { Template } from '../types/template';

interface TemplatePreviewProps {
  template: Template;
  onClose: () => void;
  onInsert: (content: string) => void;
}

const TemplatePreview: React.FC<TemplatePreviewProps> = ({ 
  template, 
  onClose, 
  onInsert 
}) => {
  const [content, setContent] = React.useState(template.content);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {template.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {template.description}
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          variant="outlined"
          margin="normal"
        />
      </CardContent>
      <CardActions>
        <Button 
          size="small" 
          onClick={onClose}
        >
          Back
        </Button>
        <Button 
          size="small" 
          variant="contained" 
          color="primary"
          onClick={() => onInsert(content)}
        >
          Insert
        </Button>
      </CardActions>
    </Card>
  );
};

export default TemplatePreview;