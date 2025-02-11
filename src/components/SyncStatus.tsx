// src/components/SyncStatus.tsx

import React from 'react';
import { Box, Typography, IconButton, Tooltip, alpha, Theme } from '@mui/material';
import { 
  CloudOff as CloudOffIcon,
  CloudDone as CloudDoneIcon,
  CloudSync as CloudSyncIcon,
  CloudQueue as CloudQueueIcon
} from '@mui/icons-material';

export type SyncState = 'offline' | 'syncing' | 'synced' | 'error';

interface SyncStatusProps {
  state: SyncState;
  lastSyncTime?: string;
  onSyncClick?: () => void;
  error?: string;
}

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

const SyncStatus: React.FC<SyncStatusProps> = ({ 
  state, 
  lastSyncTime, 
  onSyncClick,
  error 
}) => {
  const getStatusIcon = () => {
    switch (state) {
      case 'offline':
        return <CloudOffIcon fontSize="small" />;
      case 'syncing':
        return <CloudSyncIcon fontSize="small" sx={{ animation: 'spin 1s linear infinite' }} />;
      case 'synced':
        return <CloudDoneIcon fontSize="small" sx={{ color: 'success.main' }} />;
      case 'error':
        return <CloudQueueIcon fontSize="small" sx={{ color: 'error.main' }} />;
    }
  };

  const getStatusText = () => {
    switch (state) {
      case 'offline':
        return 'Working offline';
      case 'syncing':
        return 'Syncing...';
      case 'synced':
        return `Last synced: ${lastSyncTime ? new Date(lastSyncTime).toLocaleTimeString() : 'Never'}`;
      case 'error':
        return error || 'Sync error';
    }
  };

  return (
    <Box sx={{ 
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      px: 1,
      py: 0.5,
      borderRadius: 1,
      bgcolor: 'background.default'
    }}>
      <Tooltip title={getStatusText()}>
        <IconButton 
          size="small" 
          onClick={onSyncClick}
          disabled={state === 'syncing'}
          sx={toolbarButtonStyle}
        >
          {getStatusIcon()}
        </IconButton>
      </Tooltip>
      <Typography 
        variant="caption" 
        sx={{ color: 'text.secondary' }}
      >
        {getStatusText()}
      </Typography>
    </Box>
  );
};

export default SyncStatus;