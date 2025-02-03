import React from 'react';
import { Box, Skeleton } from '@mui/material';

export const TemplateSkeleton: React.FC = () => (
  <Box className="space-y-4 p-4">
    <Skeleton variant="rectangular" height={48} className="rounded-lg" />
    <Skeleton variant="rectangular" height={48} className="rounded-lg" />
    <Skeleton variant="rectangular" height={48} className="rounded-lg" />
  </Box>
);

export const TemplateEditorSkeleton: React.FC = () => (
  <Box className="space-y-4 p-4">
    <Skeleton variant="text" height={32} width="60%" />
    <Skeleton variant="rectangular" height={120} className="rounded-lg" />
    <Box className="flex space-x-2">
      <Skeleton variant="rectangular" height={40} width={100} className="rounded-lg" />
      <Skeleton variant="rectangular" height={40} width={100} className="rounded-lg" />
    </Box>
  </Box>
);