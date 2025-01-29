import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { supabase } from '../utils/supabaseClient';
import AuthView from './AuthView';
import TemplateEditor from '../components/TemplateEditor';
import { Box, Typography, Button, Tabs, Tab, CircularProgress } from '@mui/material';
export const Popup = () => {
    // Supabase Auth State
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [userEmail, setUserEmail] = useState(null);
    // Extension State
    const [templates, setTemplates] = useState([]);
    const [userTemplates, setUserTemplates] = useState([]);
    const [prompts, setPrompts] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [activeTab, setActiveTab] = useState('templates');
    const [error, setError] = useState(null);
    useEffect(() => {
        // Check session on mount and handle authentication state
        const checkSession = async () => {
            try {
                const { data, error } = await supabase.auth.getSession();
                if (error) {
                    console.error('Error fetching session:', error.message);
                    setIsAuthenticated(false);
                    setUserEmail(null);
                    return;
                }
                if (data.session && data.session.user) {
                    setIsAuthenticated(true);
                    setUserEmail(data.session.user.email || null);
                }
                else {
                    setIsAuthenticated(false);
                    setUserEmail(null);
                }
            }
            catch (err) {
                console.error('Error during session check:', error);
                setIsAuthenticated(false);
                setUserEmail(null);
            }
            finally {
                setLoading(false); // Ensure loading is set to false regardless of success or failure
            }
        };
        checkSession();
        // Listen for login/logout events and handle state updates
        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                setIsAuthenticated(true);
                setUserEmail(session.user.email || null);
            }
            else {
                setIsAuthenticated(false);
                setUserEmail(null);
            }
        });
        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);
    const loadTemplates = useCallback(async () => {
        try {
            const data = await chrome.storage.local.get(['templates']);
            setTemplates(data.templates || []);
        }
        catch (error) {
            console.error('Failed to load templates:', error);
            setError('Failed to load templates.');
        }
    }, []);
    const loadUserTemplates = useCallback(async () => {
        if (!isAuthenticated)
            return;
        try {
            const response = await fetch(`/api/templates?email=${userEmail}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch user templates: ${response.status}`);
            }
            const data = await response.json();
            setUserTemplates(data);
        }
        catch (error) {
            console.error('Failed to load user templates:', error);
            setError('Failed to load user templates.');
        }
    }, [userEmail, isAuthenticated]);
    const loadHistory = useCallback(async () => {
        try {
            const response = await fetch(`/api/history?email=${userEmail}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch history: ${response.status}`);
            }
            const data = await response.json();
            setPrompts(data);
        }
        catch (error) {
            console.error('Failed to load history:', error);
            setError('Failed to load history.');
        }
    }, [userEmail]);
    useEffect(() => {
        if (isAuthenticated) {
            loadTemplates();
            loadUserTemplates();
            loadHistory();
        }
    }, [isAuthenticated, loadTemplates, loadUserTemplates, loadHistory, activeTab]);
    const handleSignOut = async () => {
        await supabase.auth.signOut();
        setIsAuthenticated(false);
        setUserEmail(null);
        setTemplates([]);
        setUserTemplates([]);
        setPrompts([]);
    };
    if (loading) {
        return (_jsx(Box, { sx: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }, children: _jsx(CircularProgress, {}) }));
    }
    if (!isAuthenticated) {
        return _jsx(AuthView, { onAuthSuccess: () => setIsAuthenticated(true) });
    }
    return (_jsxs(Box, { sx: { padding: 2 }, children: [_jsxs(Typography, { variant: "h5", sx: { marginBottom: 2 }, children: ["Welcome, ", userEmail] }), _jsx(Button, { variant: "contained", color: "primary", onClick: handleSignOut, sx: { marginBottom: 3 }, children: "Sign Out" }), _jsxs(Tabs, { value: activeTab, onChange: (_e, newValue) => setActiveTab(newValue), textColor: "primary", indicatorColor: "primary", sx: { marginBottom: 2 }, children: [_jsx(Tab, { label: "Templates", value: "templates" }), _jsx(Tab, { label: "Custom", value: "custom" }), _jsx(Tab, { label: "History", value: "history" })] }), activeTab === 'templates' && (_jsx(Box, { children: templates.length > 0 ? (templates.map((template) => (_jsx(Box, { sx: {
                        padding: 2,
                        border: '1px solid #ddd',
                        marginBottom: 1,
                        borderRadius: 1,
                        cursor: 'pointer',
                        '&:hover': { backgroundColor: '#f5f5f5' },
                    }, onClick: () => setSelectedTemplate(template), children: template.name }, template.id)))) : (_jsx(Typography, { children: "No templates available." })) })), activeTab === 'custom' && (_jsx(Box, { children: userTemplates.length > 0 ? (userTemplates.map((template) => (_jsx(Box, { sx: {
                        padding: 2,
                        border: '1px solid #ddd',
                        marginBottom: 1,
                        borderRadius: 1,
                    }, children: template.name }, template.id)))) : (_jsx(Typography, { children: "No custom templates available." })) })), activeTab === 'history' && (_jsx(Box, { children: prompts.length > 0 ? (prompts.map((prompt) => (_jsx(Box, { sx: {
                        padding: 2,
                        border: '1px solid #ddd',
                        marginBottom: 1,
                        borderRadius: 1,
                    }, children: prompt.content }, prompt.id)))) : (_jsx(Typography, { children: "No history available." })) })), selectedTemplate && (_jsx(TemplateEditor, { template: selectedTemplate, onSubmit: () => setSelectedTemplate(null), onCancel: () => setSelectedTemplate(null) }))] }));
};
const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(_jsx(Popup, {}));
}
