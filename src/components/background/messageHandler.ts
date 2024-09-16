import { Message, ExtensionState } from '../sharedTypes/message_types';
import { updateState, getState } from './stateManager';

export function setupMessageListeners() {
  chrome.runtime.onMessage.addListener((message: Message, sender, sendResponse) => {
    console.log('Background script received message:', message);

    switch (message.action) {
      case 'toggleUrlParser':
        handleStateChange('urlParser', sendResponse);
        break;
      case 'updateURLCount':
        handleCountUpdate('urlCount', message.count, sendResponse);
        break;
      case 'updateJSFileCount':
        handleCountUpdate('jsFileCount', message.count, sendResponse);
        break;
      case 'getState':
        handleGetState(sendResponse);
        break;
      case 'contentScriptReady':
        handleContentScriptReady(sender.tab?.id);
        break;
      default:
        console.warn('Unknown message action:', message.action);
        sendResponse({ success: false, error: 'Unknown action' });
    }

    return true; // Indicates that the response is sent asynchronously
  });
}

async function handleStateChange(stateKey: keyof ExtensionState, sendResponse: (response: any) => void) {
  try {
    const currentState = await getState(stateKey) as boolean;
    const newState = !currentState;
    await updateState(stateKey, newState);
    sendResponse({ success: true, state: newState });
  } catch (error) {
    console.error(`Error toggling ${stateKey} state:`, error);
    sendResponse({ success: false, error: (error as Error).message });
  }
}

async function handleCountUpdate(countKey: 'urlCount' | 'jsFileCount', count: number | undefined, sendResponse: (response: any) => void) {
  if (typeof count === 'number') {
    try {
      await updateState(countKey, count);
      sendResponse({ success: true });
    } catch (error) {
      console.error(`Error updating ${countKey}:`, error);
      sendResponse({ success: false, error: (error as Error).message });
    }
  } else {
    sendResponse({ success: false, error: 'Invalid count value' });
  }
}

async function handleGetState(sendResponse: (response: any) => void) {
  try {
    const state = await getState();
    sendResponse({ success: true, state });
  } catch (error) {
    console.error('Error getting state:', error);
    sendResponse({ success: false, error: (error as Error).message });
  }
}

function handleContentScriptReady(tabId: number | undefined) {
  if (tabId) {
    getState().then((state) => {
      chrome.tabs.sendMessage(tabId, { action: 'urlParserStateChanged', state: state.urlParser });
    });
  }
}