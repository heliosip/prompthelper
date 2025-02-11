// src/components/ResizableContainer.tsx
import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';

interface ResizableContainerProps {
  children: React.ReactNode;
  minHeight?: number;
}

const ResizableContainer: React.FC<ResizableContainerProps> = ({
  children,
  minHeight = 48
}) => {
  const [height, setHeight] = useState(600);

  const handleMouseMove = (e: MouseEvent) => {
    const newHeight = Math.max(e.clientY, minHeight);
    setHeight(newHeight);
    
    // Update both body and root dimensions
    document.body.style.height = `${newHeight}px`;
    const root = document.getElementById('root');
    if (root) {
      root.style.height = `${newHeight}px`;
    }
    
    // Trigger resize for embedded content
    window.dispatchEvent(new CustomEvent('resize'));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Set initial height
  useEffect(() => {
    const root = document.getElementById('root');
    if (root) {
      root.style.height = `${height}px`;
      document.body.style.height = `${height}px`;
    }
  }, []);

  return (
    <Box
      sx={{
        height: `${height}px`,
        minHeight: `${minHeight}px`,
        width: '100%',
        maxWidth: '100%',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        bgcolor: 'background.default'
      }}
    >
      {children}
      <Box
        onMouseDown={handleMouseDown}
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '4px',
          cursor: 'ns-resize',
          bgcolor: 'transparent',
          '&:hover': {
            bgcolor: 'action.hover'
          },
          zIndex: 1000
        }}
      />
    </Box>
  );
};

export default ResizableContainer;