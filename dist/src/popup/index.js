import { jsx as _jsx } from "react/jsx-runtime";
import { createRoot } from 'react-dom/client';
import { Popup } from './popup';
const container = document.getElementById('root');
if (container) {
    // Check if the root already exists in the global scope
    if (!window._popupRoot) {
        // If it doesn't exist, create the root and store it globally
        window._popupRoot = createRoot(container);
    }
    // Reuse the existing root to render the app
    window._popupRoot.render(_jsx(Popup, {}));
}
