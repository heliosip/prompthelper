chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message received:', request);

  if (request.action === 'insertPrompt') {
    console.log('Finding textarea...');
    // Try multiple specific selectors for Claude
    const selectors = [
      '[data-id="root"]',
      '[placeholder="Message Claude..."]',
      '[data-testid="text-input"]',
      'div[contenteditable="true"]',
      'textarea'
    ];

    let input = null;
    for (const selector of selectors) {
      input = document.querySelector(selector);
      if (input) break;
    }
    
    console.log('Input element found:', input);
    
    if (input) {
      if (input instanceof HTMLTextAreaElement) {
        input.value = request.prompt;
        input.dispatchEvent(new Event('input', { bubbles: true }));
      } else if (input instanceof HTMLElement) {
        input.textContent = request.prompt;
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
      console.log('Content inserted');
    }
  }
});