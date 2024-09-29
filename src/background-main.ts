import browser from 'webextension-polyfill';
import { Message, MessageResponse, MessageSender } from './constants/message_types';
import { initRequestHandler, getRequestDetails } from './background/httpRequestHandler';

let isAutoParserEnabled = false;

// Initialize the auto parser state and request handler
browser.storage.local.get('autoParserEnabled').then((result) => {
  (isAutoParserEnabled as any) = result.autoParserEnabled || false;
  initRequestHandler();
});

// Listen for messages from popup and content scripts
browser.runtime.onMessage.addListener((message: unknown, sender: MessageSender, sendResponse: (response: MessageResponse) => void) => {
  const typedMessage = message as Message;
  
  switch (typedMessage.action) {
    case 'getAutoParserState':
      sendResponse({ success: true, state: isAutoParserEnabled });
      break;
    case 'setAutoParserState':
      if (typedMessage.state !== undefined) {
        isAutoParserEnabled = typedMessage.state;
        browser.storage.local.set({ autoParserEnabled: isAutoParserEnabled });
        sendResponse({ success: true });

        // Notify all tabs about the state change
        browser.tabs.query({}).then((tabs) => {
          tabs.forEach((tab) => {
            if (tab.id) {
              browser.tabs.sendMessage(tab.id, { action: 'autoParserStateChanged', state: isAutoParserEnabled })
              .catch(() => {
                // Silently fail if the content script isn't loaded
              });
            }
          });
        });
      } else {
        sendResponse({ success: false, error: 'State not provided' });
      }
      break;
    case 'getRequestDetails':
      if (typedMessage.url) {
        getRequestDetails(typedMessage.url).then(details => {
          sendResponse({ success: true, details });
        });
        return true; // Indicates that we will send a response asynchronously
      } else {
        sendResponse({ success: false, error: 'URL not provided' });
      }
      break;
    default:
      sendResponse({ success: false, error: 'Unknown action' });
  }
});

// Listen for tab updates to inject content script if necessary
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.startsWith('http')) {
    browser.tabs.sendMessage(tabId, { action: 'checkContentScriptInjected' } as Message).catch(() => {
      // If the content script is not injected, inject it
      browser.tabs.executeScript(tabId, { file: 'content-script.js' }).then(() => {
        // After injection, send the current auto parser state
        browser.tabs.sendMessage(tabId, { action: 'autoParserStateChanged', state: isAutoParserEnabled } as Message);
      });
    });
  }
});