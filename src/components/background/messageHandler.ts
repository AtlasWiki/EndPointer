import browser from 'webextension-polyfill'
import { Message, ExtensionState, MessageResponse, MessageAction } from '../sharedTypes/message_types';
import { updateState, getState } from './stateManager';

export function setupMessageListeners() {
  browser.runtime.onMessage.addListener((message: unknown, sender, sendResponse) => {
    console.log('Background script received message:', message);

    let typedMessage = message as Message;

    let response: Promise<Partial<ExtensionState> | MessageResponse>;

    switch (typedMessage.action) {
      case 'urlParserChanged':
        response = handleStateChange(typedMessage);
        break;
      case 'updateURLCount':
      case 'updateJSFileCount':
        response = handleCountUpdate(typedMessage);
        break;
      case 'getState':
      case 'getInitialState':
      case 'getUrlParserState':
        response = handleGetState(typedMessage);
        break;
      case 'parseURLs':
      case 'parseURLsManually':
      case 'countURLs':
      case 'countJSFiles':
        response = handleContentAction(typedMessage, sender.tab?.id);
        break;
      default:
        response = Promise.resolve({ success: false, error: 'Unknown action' });
    }

    response.then(sendResponse);
    return true; // Keeps the message channel open for asynchronous responses
  });
}

async function handleStateChange(message: Message): Promise<MessageResponse> {
  const { action, state } = message;
  const key = action === 'urlParserChanged' ? 'urlParser' : 'urlParser';

  if (typeof state === 'boolean') {
    await updateState(key, state);
    await broadcastStateChange(key, state);
    return { success: true };
  } else {
    return { success: false, error: 'Invalid state value' };
  }
}

async function handleCountUpdate(message: Message): Promise<MessageResponse> {
  const { action, count } = message;
  const key = action === 'updateURLCount' ? 'urlCount' : 'fileCount';
  const countValue = count ?? 0;

  try {
    const result = await browser.storage.local.get(key);
    let totalCount = (result[key] as number) || 0;
    totalCount += countValue;

    await browser.storage.local.set({ [key]: totalCount });
    console.log(`${key} updated to ${totalCount}`);
    await browser.runtime.sendMessage({ action: `${key}Updated`, count: totalCount });
    return { success: true };
  } catch (error) {
    console.error('Error updating count:', error);
    return { success: false, error: 'Failed to update count' };
  }
}

async function handleGetState(message: Message): Promise<Partial<ExtensionState>> {
  if (message.action === 'getUrlParserState') {
    const state = await getState();
    return { urlParser: state.urlParser };
  }
  return getState();
}

async function handleContentAction(message: Message, tabId?: number): Promise<MessageResponse> {
  if (tabId) {
    await browser.tabs.sendMessage(tabId, message);
    return { success: true };
  }
  return { success: false, error: 'No tab ID provided' };
}

async function broadcastStateChange(key: string, state: boolean): Promise<void> {
  const tabs = await browser.tabs.query({});
  const message = { action: `${key}StateChanged` as MessageAction, state };
  for (const tab of tabs) {
    if (tab.id) {
      await browser.tabs.sendMessage(tab.id, message);
    }
  }
}