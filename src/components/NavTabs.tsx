// src/components/NavTabs.tsx

import React, { useState } from 'react';
import {
  Box,
  IconButton,
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
  Theme,
  Tooltip
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

  const handleTabChange = (newValue: number) => {
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
        p: 1.5,
        mb: 1,
        borderRadius: 1,
        cursor: 'pointer',
        '&:hover': {
          bgcolor: 'action.hover',
        },
      }}
      onClick={() => onSelectTemplate(template)}
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
      <IconButton
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          onSelectTemplate(template);
        }}
        sx={{
          color: 'action.active',
          '&:hover': {
            color: template.is_standard ? 'error.main' : 'primary.main',
            bgcolor: (theme: Theme) =>
              alpha(
                theme.palette[template.is_standard ? 'error' : 'primary'].main,
                0.1
              ),
          },
        }}
      >
        <AddIcon fontSize="small" />
      </IconButton>
    </Box>
  );

  const renderHistoryItem = (item: PromptHistory) => (
    <Box
      key={item.id}
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        p: 1.5,
        mb: 1,
        borderRadius: 1,
        cursor: 'pointer',
        bgcolor: selectedItems.includes(item.id) 
          ? (theme: Theme) => alpha(theme.palette.primary.main, 0.1)
          : 'transparent',
        '&:hover': {
          bgcolor: (theme: Theme) => selectedItems.includes(item.id)
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
            bgcolor: (theme: Theme) => alpha(theme.palette.primary.main, 0.1),
          },
        }}
      >
        <AddIcon fontSize="small" />
      </IconButton>
    </Box>
  );

  // Favorites filtered list
  const favorites = history.filter(item => item.is_favorite);

  return (
    <Box
      sx={{
        display: 'flex',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Icon Navigation */}
      <Box
        sx={{
          width: '48px',
          borderRight: 1,
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
          p: 1,
          pt: 2
        }}
      >
        <Tooltip title="Templates" placement="right">
          <IconButton
            onClick={() => handleTabChange(0)}
            sx={{
              mb: 1,
              color: currentTab === 0 ? 'primary.main' : 'text.secondary',
              bgcolor: currentTab === 0 ? 'action.selected' : 'transparent',
              '&:hover': {
                bgcolor: currentTab === 0 
                  ? (theme: Theme) => alpha(theme.palette.primary.main, 0.2)
                  : 'action.hover'
              }
            }}
          >
            <AutoAwesomeIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Favorites" placement="right">
          <IconButton
            onClick={() => handleTabChange(1)}
            sx={{
              mb: 1,
              color: currentTab === 1 ? 'warning.main' : 'text.secondary',
              bgcolor: currentTab === 1 ? 'action.selected' : 'transparent',
              '&:hover': {
                bgcolor: currentTab === 1 
                  ? (theme: Theme) => alpha(theme.palette.warning.main, 0.2)
                  : 'action.hover'
              }
            }}
          >
            <StarIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="History" placement="right">
          <IconButton
            onClick={() => handleTabChange(2)}
            sx={{
              color: currentTab === 2 ? 'primary.main' : 'text.secondary',
              bgcolor: currentTab === 2 ? 'action.selected' : 'transparent',
              '&:hover': {
                bgcolor: currentTab === 2 
                  ? (theme: Theme) => alpha(theme.palette.primary.main, 0.2)
                  : 'action.hover'
              }
            }}
          >
            <HistoryIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Content Area */}
      <Box sx={{ flex: 1, height: '100%', overflow: 'hidden' }}>
        <Box
          sx={{
            height: '100%',
            overflowY: 'scroll',
            scrollbarWidth: 'none',  // Firefox
            msOverflowStyle: 'none', // IE/Edge
            '&::-webkit-scrollbar': {  // Chrome/Safari/Webkit
              display: 'none'
            }
          }}
        >
          {currentTab === 0 && templates.map(renderTemplateItem)}
          {currentTab === 1 && favorites.map(renderHistoryItem)}
          {currentTab === 2 && (
            <>
              {history.map(renderHistoryItem)}
              {history.length === 0 && (
                <Box sx={{ textAlign: 'center', color: 'text.secondary', mt: 4 }}>
                  <HistoryIcon sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
                  <Typography variant="body2">No history yet</Typography>
                </Box>
              )}
            </>
          )}
        </Box>
      </Box>

      {/* Menu and Dialog */}
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