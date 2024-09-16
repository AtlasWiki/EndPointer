import { Message } from '../sharedTypes/message_types';
import { urlParserOrchestrator } from './urlParser_Orcastrator';
import { updateState } from './stateManager';

export function setupMessageListeners() {
  chrome.runtime.onMessage.addListener((message: Message, sender, sendResponse) => {
    console.log('Content script received message:', message);

    try{
      switch (message.action) {
      case 'urlParserStateChanged':
        handleURLParserStateChange(message.state as boolean);
        break;
      case 'parseURLs':
        urlParserOrchestrator.parseURLs();
        break;
        default:
          console.warn('Unknown message action: ', message.action)
    }
    sendResponse({ success: true });
  } catch (error) {
    console.error('Error processing message:', error);
    sendResponse({ success: false, error: (error as Error).message})
  }

  return true;
});

}

// Handles changes in the URL parser state
function handleURLParserStateChange(state: boolean): void {
  updateState('urlParser', state);
  urlParserOrchestrator.handleStateChange(state);
}

export function sendURLCountUpdate(count: number): void {
  chrome.runtime.sendMessage({ action: 'updateURLCount', count});
}

export function sendJSFileCountUpdate(count: number): void {
  chrome.runtime.sendMessage({ action: 'updateJSFileCount', count });
}