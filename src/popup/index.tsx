import { createRoot, Root } from 'react-dom/client';
import { Popup } from './popup';

// ✅ Debugging: Logs App Initialization
console.log('[Popup] Initializing Popup Application...');

declare global {
  interface Window {
    _popupRoot: Root | null;
  }
}

const container = document.getElementById('root');

if (!container) {
  console.error('[Popup] ❌ Error: Could not find #root element.');
} else {
  try {
    if (!window._popupRoot) {
      console.log('[Popup] ✅ Creating React Root...');
      window._popupRoot = createRoot(container);
    } else {
      console.log('[Popup] 🔄 Reusing existing React Root...');
    }

    console.log('[Popup] 🚀 Rendering Popup Component...');
    window._popupRoot.render(<Popup />);
    
  } catch (error) {
    console.error('[Popup] ❌ Error Rendering Popup:', error);
  }
}
