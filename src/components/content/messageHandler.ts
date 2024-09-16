import { Message } from '../sharedTypes/message_types';
import { urlParserOrchestrator } from './urlParser_Orcastrator';
import { updateState } from './stateManager';

export function setupMessageListeners() {
  chrome.runtime.onMessage.addListener((message: Message, sender, sendResponse) => {
    console.log('Content script received message:', message);

    switch (message.action) {
      case 'urlParserStateChanged':
        handleURLParserStateChange(message.state as any);
        break;
      case 'parseURLs':
        urlParserOrchestrator.parseURLs();
        break;
    }

    sendResponse({ success: true });
  });
}

// Handles changes in the URL parser state
function handleURLParserStateChange(state: boolean): void {
  updateState('urlParser', state);
  if (state) {
    urlParserOrchestrator.parseURLs();
  } else {
    urlParserOrchestrator.stopObserving();
  }
}

// Sends URL count updates to the background script
export function sendURLCountUpdate(count: number): void {
  chrome.runtime.sendMessage({ action: 'updateURLCount', count });
}

// Sends JS file count updates to the background script
export function sendJSFileCountUpdate(count: number): void {
  chrome.runtime.sendMessage({ action: 'updateJSFileCount', count });
}