import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { Popup } from './popup';

// Create a global variable to persist the root across reloads
declare global {
  interface Window {
    _popupRoot: Root | null;
  }
}

const container = document.getElementById('root');

if (container) {
  // Check if the root already exists in the global scope
  if (!window._popupRoot) {
    // If it doesn't exist, create the root and store it globally
    window._popupRoot = createRoot(container);
  }

  // Reuse the existing root to render the app
  window._popupRoot.render(<Popup />);
}
