import browser from 'webextension-polyfill';
import { Message } from './constants/message_types';

let isAutoParserEnabled = false;

// Initialize the auto parser state
browser.storage.local.get('autoParserEnabled').then((result) => {
  (isAutoParserEnabled as any)= result.autoParserEnabled || false;
});

// Listen for messages from popup and content scripts
browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
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
          .catch(() =>{
                //Okay this is hacky way to get it to fail silently if the tab doesn't have the content script loaded
                //because obviously it's not gonna be loaded when you turn on the extension. 
          });
        }
      });
    });
    sendResponse({ success: true, state: isAutoParserEnabled });
  }
  return true; // Keeps the message channel open for asynchronous responses
});

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