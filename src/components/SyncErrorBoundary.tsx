// src/components/SyncErrorBoundary.tsx

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, AlertTitle, Button, Box } from '@mui/material';

interface Props {
  children: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class SyncErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.props.onError?.(error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <Alert 
          severity="error"
          sx={{ my: 2 }}
          action={
            <Button
              color="error"
              size="small"
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              Try Again
            </Button>
          }
        >
          <AlertTitle>Sync Error</AlertTitle>
          {this.state.error?.message || 'An error occurred while syncing templates'}
        </Alert>
      );
    }

    return this.props.children;
  }
}