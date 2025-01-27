"use strict";
const defaultTemplates = [
    {
        id: '1',
        name: 'Task Analysis',
        content: 'Please analyze this task:\n[INSERT DETAILS]\n\nConsider:\n1. Requirements\n2. Potential challenges\n3. Implementation steps',
        category: 'Planning',
        aiTool: 'claude'
    },
    {
        id: '2',
        name: 'Code Review',
        content: 'Please review this code:\n[INSERT CODE]\n\nFocus on:\n1. Performance\n2. Security\n3. Best practices',
        category: 'Development',
        aiTool: 'claude'
    },
    {
        id: '3',
        name: 'Code Generation',
        content: 'Please write code for:\n[INSERT REQUIREMENT]\n\nRequirements:\n1. Language: [SPECIFY]\n2. Features: [LIST]\n3. Error handling needed: [YES/NO]',
        category: 'Development',
        aiTool: 'claude'
    },
    {
        id: '4',
        name: 'Data Analysis',
        content: 'Please analyze this data:\n[INSERT DATA]\n\nProvide:\n1. Key patterns\n2. Statistical insights\n3. Recommendations',
        category: 'Analysis',
        aiTool: 'claude'
    }
];
// Initialize storage on install
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({ templates: defaultTemplates });
});
// Listen for storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.templates) {
        console.log('Templates updated:', changes.templates.newValue);
    }
});
// Add message listener for template operations
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getTemplates') {
        chrome.storage.local.get(['templates'], (result) => {
            sendResponse(result.templates || defaultTemplates);
        });
        return true;
    }
});
