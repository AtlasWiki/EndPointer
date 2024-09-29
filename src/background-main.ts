import browser from 'webextension-polyfill';
import { Message, MessageListener, MessageResponse } from './constants/message_types';

let isAutoParserEnabled = false;

// Initialize the auto parser state
browser.storage.local.get('autoParserEnabled').then((result) => {
  (isAutoParserEnabled as any) = result.autoParserEnabled || false;
});

// Listen for messages from popup and content scripts
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if ((message as Message).action === 'getAutoParserState') {
    sendResponse({ success: true, state: isAutoParserEnabled });
  } else if ((message as Message).action === 'setAutoParserState') {
    (isAutoParserEnabled as any) = (message as Message).state;
    browser.storage.local.set({ autoParserEnabled: isAutoParserEnabled });
    sendResponse({ success: true });

    // Notify all tabs about the state change
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
  } else if ((message as any).type === 'sendRequest') {
    handleSendRequest(message, sender)
      .then(sendResponse)
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Indicates that the response will be sent asynchronously
  }
});

async function handleSendRequest(message: any, sender: browser.Runtime.MessageSender) {
  try {
    const response = await fetch(message.url, {
      method: message.method,
      headers: message.headers,
      body: message.method !== 'GET' ? message.body : undefined
    });

    const responseHeaders: string[] = [];
    response.headers.forEach((value, name) => {
      responseHeaders.push(`${name}: ${value}`);
    });

    const responseBody = await response.text();

    if (sender.tab && sender.tab.id) {
      await browser.tabs.sendMessage(sender.tab.id, {
        type: 'responseReceived',
        requestId: message.requestId,
        method: message.method,
        status: response.status,
        statusText: response.statusText,
        responseHeaders,
        responseBody
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Error in background script:', error);
    if (sender.tab && sender.tab.id) {
      await browser.tabs.sendMessage(sender.tab.id, {
        type: 'responseReceived',
        requestId: message.requestId,
        method: message.method,
        status: 0,
        statusText: 'Error',
        responseHeaders: [`Error: ${error}`],
        responseBody: 'Failed to fetch'
      });
    }
    throw error;
  }
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