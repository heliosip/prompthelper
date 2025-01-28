/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/*!********************************!*\
  !*** ./src/content/content.ts ***!
  \********************************/

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
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Message received in content script:', request);
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

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGVudC5qcyIsIm1hcHBpbmdzIjoiOzs7OztBQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaURBQWlELGVBQWU7QUFDaEU7QUFDQTtBQUNBO0FBQ0EsaURBQWlELGVBQWU7QUFDaEU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwrQkFBK0Isa0RBQWtEO0FBQ2pGO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMkJBQTJCLGVBQWU7QUFDMUM7QUFDQTtBQUNBO0FBQ0EsMkJBQTJCLHNDQUFzQztBQUNqRTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL3Byb21wdGhlbHBlci8uL3NyYy9jb250ZW50L2NvbnRlbnQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG5jb25zb2xlLmxvZygnQUkgUHJvbXB0IEhlbHBlciBjb250ZW50IHNjcmlwdCBsb2FkaW5nLi4uJyk7XG4vLyBGdW5jdGlvbiB0byBmaW5kIHRoZSBpbnB1dCBlbGVtZW50XG5jb25zdCBmaW5kSW5wdXRFbGVtZW50ID0gKCkgPT4ge1xuICAgIGNvbnN0IHNlbGVjdG9ycyA9IFtcbiAgICAgICAgJ1tkYXRhLWlkPVwicm9vdFwiXScsXG4gICAgICAgICdbcGxhY2Vob2xkZXI9XCJNZXNzYWdlIENsYXVkZS4uLlwiXScsXG4gICAgICAgICdbZGF0YS10ZXN0aWQ9XCJ0ZXh0LWlucHV0XCJdJyxcbiAgICAgICAgJ2Rpdltjb250ZW50ZWRpdGFibGU9XCJ0cnVlXCJdJyxcbiAgICAgICAgJ3RleHRhcmVhJ1xuICAgIF07XG4gICAgZm9yIChjb25zdCBzZWxlY3RvciBvZiBzZWxlY3RvcnMpIHtcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xuICAgICAgICBpZiAoZWxlbWVudClcbiAgICAgICAgICAgIHJldHVybiBlbGVtZW50O1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbn07XG4vLyBGdW5jdGlvbiB0byBpbnNlcnQgdGV4dCBpbnRvIGlucHV0XG5jb25zdCBpbnNlcnRUZXh0ID0gKGlucHV0LCB0ZXh0KSA9PiB7XG4gICAgaWYgKGlucHV0IGluc3RhbmNlb2YgSFRNTFRleHRBcmVhRWxlbWVudCkge1xuICAgICAgICBpbnB1dC52YWx1ZSA9IHRleHQ7XG4gICAgICAgIGlucHV0LmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCdpbnB1dCcsIHsgYnViYmxlczogdHJ1ZSB9KSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGlucHV0IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgaW5wdXQudGV4dENvbnRlbnQgPSB0ZXh0O1xuICAgICAgICBpbnB1dC5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnaW5wdXQnLCB7IGJ1YmJsZXM6IHRydWUgfSkpO1xuICAgIH1cbn07XG4vLyBIYW5kbGUgdGhlIG1lc3NhZ2UgZnJvbSBwb3B1cFxuY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKChyZXF1ZXN0LCBzZW5kZXIsIHNlbmRSZXNwb25zZSkgPT4ge1xuICAgIGNvbnNvbGUubG9nKCdNZXNzYWdlIHJlY2VpdmVkIGluIGNvbnRlbnQgc2NyaXB0OicsIHJlcXVlc3QpO1xuICAgIGlmIChyZXF1ZXN0LmFjdGlvbiA9PT0gJ2luc2VydFByb21wdCcpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGlucHV0ID0gZmluZElucHV0RWxlbWVudCgpO1xuICAgICAgICAgICAgaWYgKCFpbnB1dCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0lucHV0IGVsZW1lbnQgbm90IGZvdW5kJyk7XG4gICAgICAgICAgICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnSW5wdXQgZWxlbWVudCBub3QgZm91bmQnIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGluc2VydFRleHQoaW5wdXQsIHJlcXVlc3QucHJvbXB0KTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdDb250ZW50IGluc2VydGVkIHN1Y2Nlc3NmdWxseScpO1xuICAgICAgICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogdHJ1ZSB9KTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGluc2VydGluZyBwcm9tcHQ6JywgZXJyb3IpO1xuICAgICAgICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBTdHJpbmcoZXJyb3IpIH0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8vIFJlcXVpcmVkIGZvciBhc3luYyByZXNwb25zZVxuICAgIHJldHVybiB0cnVlO1xufSk7XG4vLyBTZXQgZmxhZyB0aGF0IGNvbnRlbnQgc2NyaXB0IGlzIGxvYWRlZFxuLy8gQHRzLWlnbm9yZVxud2luZG93Ll9fYWlQcm9tcHRIZWxwZXJMb2FkZWQgPSB0cnVlO1xuY29uc29sZS5sb2coJ0FJIFByb21wdCBIZWxwZXIgY29udGVudCBzY3JpcHQgbG9hZGVkIHN1Y2Nlc3NmdWxseScpO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9