import browser from 'webextension-polyfill';
import { Message, MessageResponse, HttpMethod, Endpoint, RequestDetails, MessageSender } from './constants/message_types';
import { handleSendRequest, initRequestHandler, clearResponseCache, getRequestDetails } from './background/httpRequestHandler';
import { ClassificationManager } from './background/classification.service';

let isAutoParserEnabled = false;

// Initialize the auto parser state and request handler
browser.storage.local.get('autoParserEnabled').then((result) => {
  (isAutoParserEnabled as any) = result.autoParserEnabled || false;
});


initRequestHandler();

const classificationManager = new ClassificationManager();

// Listen for messages from popup and content scripts
browser.runtime.onMessage.addListener((message: unknown, sender: MessageSender, sendResponse: (response: unknown) => void) => {
  const typedMessage = message as Message;
  
  switch (typedMessage.action) {
    case 'getAutoParserState':
      sendResponse({ success: true, state: isAutoParserEnabled });
      break;
    case 'setAutoParserState':
      if (typeof typedMessage.state === 'boolean') {
        isAutoParserEnabled = typedMessage.state;
        browser.storage.local.set({ autoParserEnabled: isAutoParserEnabled });
        sendResponse({ success: true });
        notifyAllTabs();
      } else {
        sendResponse({ success: false, error: 'Invalid state provided' });
      }
      break;
    case 'sendRequest':
      if (typedMessage.endpoint && typedMessage.method) {
        handleSendRequest(typedMessage.endpoint as Endpoint, typedMessage.method as HttpMethod, typedMessage.customRequest as RequestDetails | null)
          .then(response => {
            sendResponse(response);
          })
          .catch(error => {
            console.error('Error in handleSendRequest:', error);
            sendResponse({
              success: false,
              error: error.message,
              url: typedMessage.customRequest?.url || (typedMessage.endpoint as any).url,
              status: 0,
              statusText: 'Error',
              headers: { 'Error': error.toString() },
              body: 'Failed to fetch'
            });
          });
        return true; // Indicates that the response will be sent asynchronously
      } else {
        sendResponse({ success: false, error: 'Invalid endpoint or method provided' });
      }
      break;
    case 'clearResponseCache':
      clearResponseCache();
      sendResponse({ success: true });
      break;
    case 'getRequestDetails':
      if (typedMessage.url) {
        getRequestDetails(typedMessage.url)
          .then(details => sendResponse({ success: true, details }))
          .catch(error => sendResponse({ success: false, error: error.message }));
        return true; // Indicates that the response will be sent asynchronously
      } else {
        sendResponse({ success: false, error: 'URL not provided' });
      }
      break;
    default:
      sendResponse({ success: false, error: 'Unknown action' });
  }
});

function notifyAllTabs() {
  browser.tabs.query({}).then((tabs) => {
    tabs.forEach((tab) => {
      if (tab.id) {
        browser.tabs.sendMessage(tab.id, { action: 'autoParserStateChanged', state: isAutoParserEnabled })
        .catch(() => {
          // Silent fail if the tab doesn't have the content script loaded
        });
      }
    });
  });
}

// Listen for tab updates to inject content script if necessary
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.startsWith('http')) {
    browser.tabs.sendMessage(tabId, { action: 'checkContentScriptInjected' }).catch(() => {
      // If the content script is not injected, inject it
      browser.tabs.executeScript(tabId, { file: 'content-script.js' }).then(() => {
        // After injection, send the current auto parser state
        browser.tabs.sendMessage(tabId, { action: 'autoParserStateChanged', state: isAutoParserEnabled });
      });
    });
  }
});

// Optional: Add listener for extension install or update
browser.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install' || details.reason === 'update') {
    clearResponseCache();
  }
});