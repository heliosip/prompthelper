// src/components/Header.tsx
import React from 'react';
import { Box, Typography } from '@mui/material';

interface HeaderProps {
  children?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ children }) => (
  <Box sx={{ 
    px: 3,
    py: 2,
    borderBottom: 1,
    borderColor: 'divider',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    bgcolor: 'background.paper',
    minHeight: '48px'
  }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        <span style={{ color: '#FF0000' }}>★</span>
        <span style={{ color: '#0000FF' }}>★</span>
        <span style={{ color: '#FFD700' }}>★</span>
      </Box>
      <Typography 
        sx={{ 
          fontFamily: "'Poppins', sans-serif",
          fontSize: '1.5rem',
          fontWeight: 700,
          background: 'linear-gradient(45deg, #FF0000 30%, #0000FF 60%, #FFD700 90%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '0.5px'
        }}
      >
        Spaarke
      </Typography>
    </Box>
    {children}
  </Box>
);

export default Header;