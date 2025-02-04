// src/components/SyncStatus.tsx

import React from 'react';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
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

const SyncStatus: React.FC<SyncStatusProps> = ({ 
  state, 
  lastSyncTime, 
  onSyncClick,
  error 
}) => {
  const getStatusIcon = () => {
    switch (state) {
      case 'offline':
        return <CloudOffIcon className="text-gray-500" />;
      case 'syncing':
        return <CloudSyncIcon className="text-blue-500 animate-spin" />;
      case 'synced':
        return <CloudDoneIcon className="text-green-500" />;
      case 'error':
        return <CloudQueueIcon className="text-red-500" />;
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
    <Box className="flex items-center space-x-2 px-2 py-1 rounded-md bg-gray-100">
      <Tooltip title={getStatusText()}>
        <IconButton 
          size="small" 
          onClick={onSyncClick}
          disabled={state === 'syncing'}
        >
          {getStatusIcon()}
        </IconButton>
      </Tooltip>
      <Typography variant="caption" className="text-gray-600">
        {getStatusText()}
      </Typography>
    </Box>
  );
};

export default SyncStatus;