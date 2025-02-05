// Function to find input elements across different AI chat interfaces
const findInputElement = (): HTMLElement | null => {
  const selectors = [
    // Claude selectors
    '[data-testid="text-input"]',
    '[placeholder="Message Claude..."]',
    // ChatGPT selectors
    '[placeholder="Send a message"]',
    'textarea[tabindex="0"]',
    // Generic fallbacks
    'div[contenteditable="true"]',
    'textarea'
  ];

  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) return element as HTMLElement;
  }
  
  return null;
};

// Function to insert text into input
const insertText = (input: HTMLElement, text: string): void => {
  if (input instanceof HTMLTextAreaElement) {
    // For standard textarea elements
    input.value = text;
    input.dispatchEvent(new Event('input', { bubbles: true }));
  } else if (input instanceof HTMLElement) {
    // For contenteditable divs
    input.textContent = text;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }
};

// Listen for messages from the popup
chrome.runtime.onMessage.addListener(
  (request: any, sender: chrome.runtime.MessageSender, sendResponse: (response: any) => void) => {
    console.log('Content script received message:', request);

    if (request.action === 'insertPrompt') {
      try {
        const input = findInputElement();
        if (!input) {
          console.error('Input element not found');
          sendResponse({ success: false, error: 'Input element not found' });
          return;
        }

        insertText(input, request.prompt);
        console.log('Prompt inserted successfully');
        sendResponse({ success: true });
      } catch (error) {
        console.error('Error inserting prompt:', error);
        sendResponse({ success: false, error: String(error) });
      }
    }

    // Required for async response
    return true;
  }
);

// Set flag that content script is loaded
console.log('AI Prompt Helper content script loaded successfully');