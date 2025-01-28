/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/*!**************************************!*\
  !*** ./src/background/background.ts ***!
  \**************************************/

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

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFja2dyb3VuZC5qcyIsIm1hcHBpbmdzIjoiOzs7OztBQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLCtCQUErQiw2QkFBNkI7QUFDNUQsQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0EsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovL3Byb21wdGhlbHBlci8uL3NyYy9iYWNrZ3JvdW5kL2JhY2tncm91bmQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG5jb25zdCBkZWZhdWx0VGVtcGxhdGVzID0gW1xuICAgIHtcbiAgICAgICAgaWQ6ICcxJyxcbiAgICAgICAgbmFtZTogJ1Rhc2sgQW5hbHlzaXMnLFxuICAgICAgICBjb250ZW50OiAnUGxlYXNlIGFuYWx5emUgdGhpcyB0YXNrOlxcbltJTlNFUlQgREVUQUlMU11cXG5cXG5Db25zaWRlcjpcXG4xLiBSZXF1aXJlbWVudHNcXG4yLiBQb3RlbnRpYWwgY2hhbGxlbmdlc1xcbjMuIEltcGxlbWVudGF0aW9uIHN0ZXBzJyxcbiAgICAgICAgY2F0ZWdvcnk6ICdQbGFubmluZycsXG4gICAgICAgIGFpVG9vbDogJ2NsYXVkZSdcbiAgICB9LFxuICAgIHtcbiAgICAgICAgaWQ6ICcyJyxcbiAgICAgICAgbmFtZTogJ0NvZGUgUmV2aWV3JyxcbiAgICAgICAgY29udGVudDogJ1BsZWFzZSByZXZpZXcgdGhpcyBjb2RlOlxcbltJTlNFUlQgQ09ERV1cXG5cXG5Gb2N1cyBvbjpcXG4xLiBQZXJmb3JtYW5jZVxcbjIuIFNlY3VyaXR5XFxuMy4gQmVzdCBwcmFjdGljZXMnLFxuICAgICAgICBjYXRlZ29yeTogJ0RldmVsb3BtZW50JyxcbiAgICAgICAgYWlUb29sOiAnY2xhdWRlJ1xuICAgIH0sXG4gICAge1xuICAgICAgICBpZDogJzMnLFxuICAgICAgICBuYW1lOiAnQ29kZSBHZW5lcmF0aW9uJyxcbiAgICAgICAgY29udGVudDogJ1BsZWFzZSB3cml0ZSBjb2RlIGZvcjpcXG5bSU5TRVJUIFJFUVVJUkVNRU5UXVxcblxcblJlcXVpcmVtZW50czpcXG4xLiBMYW5ndWFnZTogW1NQRUNJRlldXFxuMi4gRmVhdHVyZXM6IFtMSVNUXVxcbjMuIEVycm9yIGhhbmRsaW5nIG5lZWRlZDogW1lFUy9OT10nLFxuICAgICAgICBjYXRlZ29yeTogJ0RldmVsb3BtZW50JyxcbiAgICAgICAgYWlUb29sOiAnY2xhdWRlJ1xuICAgIH0sXG4gICAge1xuICAgICAgICBpZDogJzQnLFxuICAgICAgICBuYW1lOiAnRGF0YSBBbmFseXNpcycsXG4gICAgICAgIGNvbnRlbnQ6ICdQbGVhc2UgYW5hbHl6ZSB0aGlzIGRhdGE6XFxuW0lOU0VSVCBEQVRBXVxcblxcblByb3ZpZGU6XFxuMS4gS2V5IHBhdHRlcm5zXFxuMi4gU3RhdGlzdGljYWwgaW5zaWdodHNcXG4zLiBSZWNvbW1lbmRhdGlvbnMnLFxuICAgICAgICBjYXRlZ29yeTogJ0FuYWx5c2lzJyxcbiAgICAgICAgYWlUb29sOiAnY2xhdWRlJ1xuICAgIH1cbl07XG4vLyBJbml0aWFsaXplIHN0b3JhZ2Ugb24gaW5zdGFsbFxuY2hyb21lLnJ1bnRpbWUub25JbnN0YWxsZWQuYWRkTGlzdGVuZXIoKCkgPT4ge1xuICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLnNldCh7IHRlbXBsYXRlczogZGVmYXVsdFRlbXBsYXRlcyB9KTtcbn0pO1xuLy8gTGlzdGVuIGZvciBzdG9yYWdlIGNoYW5nZXNcbmNocm9tZS5zdG9yYWdlLm9uQ2hhbmdlZC5hZGRMaXN0ZW5lcigoY2hhbmdlcywgbmFtZXNwYWNlKSA9PiB7XG4gICAgaWYgKG5hbWVzcGFjZSA9PT0gJ2xvY2FsJyAmJiBjaGFuZ2VzLnRlbXBsYXRlcykge1xuICAgICAgICBjb25zb2xlLmxvZygnVGVtcGxhdGVzIHVwZGF0ZWQ6JywgY2hhbmdlcy50ZW1wbGF0ZXMubmV3VmFsdWUpO1xuICAgIH1cbn0pO1xuLy8gQWRkIG1lc3NhZ2UgbGlzdGVuZXIgZm9yIHRlbXBsYXRlIG9wZXJhdGlvbnNcbmNocm9tZS5ydW50aW1lLm9uTWVzc2FnZS5hZGRMaXN0ZW5lcigocmVxdWVzdCwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpID0+IHtcbiAgICBpZiAocmVxdWVzdC5hY3Rpb24gPT09ICdnZXRUZW1wbGF0ZXMnKSB7XG4gICAgICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLmdldChbJ3RlbXBsYXRlcyddLCAocmVzdWx0KSA9PiB7XG4gICAgICAgICAgICBzZW5kUmVzcG9uc2UocmVzdWx0LnRlbXBsYXRlcyB8fCBkZWZhdWx0VGVtcGxhdGVzKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbn0pO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9