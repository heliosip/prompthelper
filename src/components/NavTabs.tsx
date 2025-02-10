// src/components/NavTabs.tsx

import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Typography,
  Menu,
  MenuItem,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Checkbox,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import HistoryIcon from '@mui/icons-material/History';
import AddIcon from '@mui/icons-material/Add';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { format } from 'date-fns';
import type { Template, PromptHistory } from '@/types/database.types';

interface NavTabsProps {
  templates: Template[];
  history: PromptHistory[];
  onSelectTemplate: (template: Template) => void;
  onSelectHistory: (historyItem: PromptHistory) => void;
  onToggleFavorite: (historyId: string) => void;
  onDeleteHistory: (historyIds: string[]) => void;
  onClearHistory: (keepFavorites: boolean) => void;
}

const NavTabs: React.FC<NavTabsProps> = ({
  templates,
  history,
  onSelectTemplate,
  onSelectHistory,
  onToggleFavorite,
  onDeleteHistory,
  onClearHistory,
}) => {
  const [currentTab, setCurrentTab] = useState(0);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [keepFavorites, setKeepFavorites] = useState(true);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
    setSelectedItems([]);
  };

  const handleHistoryItemClick = (event: React.MouseEvent, item: PromptHistory) => {
    if (event.ctrlKey || event.metaKey) {
      setSelectedItems(prev => 
        prev.includes(item.id) 
          ? prev.filter(id => id !== item.id)
          : [...prev, item.id]
      );
    } else {
      onSelectHistory(item);
    }
  };

  const handleClearHistory = () => {
    onClearHistory(keepFavorites);
    setClearDialogOpen(false);
    setSelectedItems([]);
    setMenuAnchor(null);
  };

  const handleDeleteSelected = () => {
    onDeleteHistory(selectedItems);
    setSelectedItems([]);
    setMenuAnchor(null);
  };

  const renderTemplateItem = (template: Template) => (
    <Box
      key={template.id}
      sx={{
        display: 'flex',
        alignItems: 'center',
        p: 1,
        mb: 1,
        borderRadius: 1,
        cursor: 'pointer',
        '&:hover': {
          bgcolor: 'action.hover',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          flex: 1,
          color: template.is_standard ? 'error.main' : 'primary.main',
        }}
      >
        <AutoAwesomeIcon
          sx={{
            mr: 1,
            color: template.is_standard ? 'error.main' : 'primary.main',
          }}
        />
        <Typography
          variant="body2"
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {template.name}
        </Typography>
      </Box>
      <Tooltip title="Add to Editor">
        <IconButton
          size="small"
          onClick={() => onSelectTemplate(template)}
          sx={{
            color: 'action.active',
            '&:hover': {
              color: template.is_standard ? 'error.main' : 'primary.main',
              bgcolor: (theme) =>
                alpha(
                  theme.palette[template.is_standard ? 'error' : 'primary'].main,
                  0.1
                ),
            },
          }}
        >
          <AddIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );

  const renderHistoryItem = (item: PromptHistory) => (
    <Box
      key={item.id}
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        p: 1,
        mb: 1,
        borderRadius: 1,
        cursor: 'pointer',
        bgcolor: selectedItems.includes(item.id) 
          ? (theme) => alpha(theme.palette.primary.main, 0.1)
          : 'transparent',
        '&:hover': {
          bgcolor: (theme) => selectedItems.includes(item.id)
            ? alpha(theme.palette.primary.main, 0.2)
            : 'action.hover',
        },
      }}
      onClick={(e) => handleHistoryItemClick(e, item)}
    >
      <Box sx={{ flex: 1 }}>
        <Box display="flex" alignItems="center" gap={1}>
          <Typography
            variant="body2"
            sx={{
              flex: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {item.content.slice(0, 50)}...
          </Typography>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(item.id);
            }}
            sx={{ 
              color: item.is_favorite ? 'warning.main' : 'action.active',
              p: 0.5
            }}
          >
            {item.is_favorite ? (
              <StarIcon fontSize="small" />
            ) : (
              <StarBorderIcon fontSize="small" />
            )}
          </IconButton>
        </Box>
        <Typography variant="caption" color="text.secondary">
          {format(new Date(item.created_at), 'MMM d, h:mm a')}
        </Typography>
      </Box>
      <Tooltip title="Add to Editor">
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onSelectHistory(item);
          }}
          sx={{
            color: 'action.active',
            '&:hover': {
              color: 'primary.main',
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
            },
          }}
        >
          <AddIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );

  return (
    <Box
      sx={{
        width: 250,
        height: '100%',
        borderRight: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center',
        borderBottom: 1,
        borderColor: 'divider'
      }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          sx={{
            flex: 1,
            minHeight: 48,
            '& .MuiTab-root': {
              minHeight: 48,
              minWidth: 'auto',
              flex: 1,
            },
          }}
        >
          <Tab
            icon={<AutoAwesomeIcon />}
            label="Templates"
            iconPosition="start"
          />
          <Tab
            icon={<HistoryIcon />}
            label="History"
            iconPosition="start"
          />
        </Tabs>
        {currentTab === 1 && (
          <IconButton
            size="small"
            onClick={(e) => setMenuAnchor(e.currentTarget)}
            sx={{ mr: 1 }}
          >
            <MoreVertIcon />
          </IconButton>
        )}
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {currentTab === 0 ? (
          templates.map(renderTemplateItem)
        ) : (
          history.map(renderHistoryItem)
        )}
        {currentTab === 1 && history.length === 0 && (
          <Box sx={{ textAlign: 'center', color: 'text.secondary', mt: 4 }}>
            <HistoryIcon sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
            <Typography variant="body2">No history yet</Typography>
          </Box>
        )}
      </Box>

      {/* History Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        {selectedItems.length > 0 && (
          <MenuItem onClick={handleDeleteSelected}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Delete Selected</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={() => {
          setClearDialogOpen(true);
          setMenuAnchor(null);
        }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Clear History</ListItemText>
        </MenuItem>
      </Menu>

      {/* Clear History Dialog */}
      <Dialog
        open={clearDialogOpen}
        onClose={() => setClearDialogOpen(false)}
      >
        <DialogTitle>Clear History</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" gutterBottom>
              Are you sure you want to clear your prompt history?
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
              <Checkbox
                checked={keepFavorites}
                onChange={(e) => setKeepFavorites(e.target.checked)}
              />
              <Typography variant="body2">Keep favorite prompts</Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleClearHistory}
            color="error"
            variant="contained"
          >
            Clear History
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NavTabs;