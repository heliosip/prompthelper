// src/components/LoadingSkeleton.tsx

import React from 'react';
import { Box, Skeleton } from '@mui/material';

export const TemplateSkeleton: React.FC = () => (
  <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
    <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
    <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
    <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
  </Box>
);

export const TemplateEditorSkeleton: React.FC = () => (
  <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
    <Skeleton variant="text" height={32} width="60%" />
    <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 1 }} />
    <Box sx={{ display: 'flex', gap: 2 }}>
      <Skeleton variant="rectangular" height={40} width={100} sx={{ borderRadius: 1 }} />
      <Skeleton variant="rectangular" height={40} width={100} sx={{ borderRadius: 1 }} />
    </Box>
  </Box>
);