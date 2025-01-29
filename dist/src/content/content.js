"use strict";
/// <reference types="chrome" />
console.log('AI Prompt Helper content script loading...');
// Function to find the input element
const findInputElement = () => {
    const selectors = [
        '[data-id="root"]',
        '[placeholder="Message Claude..."]',
        '[data-testid="text-input"]',
        'div[contenteditable="true"]',
        'textarea'
    ];
    for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element)
            return element;
    }
    return null;
};
// Function to insert text into input
const insertText = (input, text) => {
    if (input instanceof HTMLTextAreaElement) {
        input.value = text;
        input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    else if (input instanceof HTMLElement) {
        input.textContent = text;
        input.dispatchEvent(new Event('input', { bubbles: true }));
    }
};
// Handle the message from popup
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    console.log('Message received in content script:', request);
    sendResponse({ received: true });
    if (request.action === 'insertPrompt') {
        try {
            const input = findInputElement();
            if (!input) {
                console.error('Input element not found');
                sendResponse({ success: false, error: 'Input element not found' });
                return;
            }
            insertText(input, request.prompt);
            console.log('Content inserted successfully');
            sendResponse({ success: true });
        }
        catch (error) {
            console.error('Error inserting prompt:', error);
            sendResponse({ success: false, error: String(error) });
        }
    }
    // Required for async response
    return true;
});
// Set flag that content script is loaded
// @ts-ignore
window.__aiPromptHelperLoaded = true;
console.log('AI Prompt Helper content script loaded successfully');
