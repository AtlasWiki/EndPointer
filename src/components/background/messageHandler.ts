import { Message, ExtensionState } from '../sharedTypes/message_types';
import { updateState, getState } from './stateManager';

export function setupMessageListeners() {
  chrome.runtime.onMessage.addListener((message: Message, sender, sendResponse) => {
    console.log('Background script received message:', message);

    try {
      switch (message.action) {
        case 'toggleUrlParser':
          handleURLParserStateChange(message.state as boolean);
          break;
        case 'getState':
          handleGetState(sendResponse);
          break;
        case 'contentScriptReady':
          handleContentScriptReady(sender.tab?.id);
          break;
        default:
          console.warn('Unknown message action: ', message.action);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      sendResponse({ success: false, error: (error as Error).message });
    }

    // Return true to indicate that the response will be sent asynchronously
    return true;
  });
}

async function handleURLParserStateChange(state: boolean): Promise<void> {
  try {
    await updateState('urlParser', state);
    console.log('URL Parser state updated:', state);
  } catch (error) {
    console.error('Error updating URL Parser state:', error);
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