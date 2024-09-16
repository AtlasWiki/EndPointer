import { ExtensionState, Message } from '../sharedTypes/message_types';
import { updateState, getState } from './stateManager';

export function setupMessageListeners() {
  chrome.runtime.onMessage.addListener((message: Message, sender, sendResponse) => {
    console.log('Background script received message:', message);

    switch (message.action) {
      case 'urlParserStateChanged':
        handleStateChange(message);
        break;
      case 'updateURLCount':
      case 'updateJSFileCount':
        handleCountUpdate(message);
        break;
      case 'getState':
        getState().then((state: Partial<ExtensionState>) => {
          sendResponse(state);
        });
        return true; // Indicates that the response is sent asynchronously
      case 'initiateURLParsing':
        initiateURLParsing(sender.tab?.id);
        break;
      default:
        console.log('Unhandled message action:', message.action);
    }

    sendResponse({ success: true });
    return true;
  });
}

// Handles changes in the URL parser state
function handleStateChange(message: Message): void {
  const { state } = message;
  updateState('urlParser', state);

  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, { action: 'urlParserStateChanged', state });
      }
    });
  });
}

// Handles updates to URL and JS file counts
async function handleCountUpdate(message: Message): Promise<void> {
  const { action, count } = message;
  const key = action === 'updateURLCount' ? 'urlCount' : 'jsFileCount';
  const currentCount = await getState(key) || 0;
  const newCount = currentCount + (count || 0);
  
  await updateState(key, newCount);
  console.log(`${key} updated to ${newCount}`);
  chrome.runtime.sendMessage({ action: `${key}Updated`, count: newCount });
}

// Initiates URL parsing for a specific tab
function initiateURLParsing(tabId: number | undefined): void {
  if (tabId) {
    chrome.tabs.sendMessage(tabId, { action: 'parseURLs' });
  }
}