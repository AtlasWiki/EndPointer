import { Message, ExtensionState } from '../sharedTypes/message_types';
import { updateState, getState } from './stateManager';

let urlCount = 0;
let jsFileCount = 0;

export function setupMessageListeners() {
  chrome.runtime.onMessage.addListener((message: Message, sender, sendResponse) => {
    console.log('Background script received message:', message);

    switch (message.action) {
      case 'urlParserChanged':
      case 'fileDownloaderChanged':
        handleStateChange(message);
        break;
      case 'updateURLCount':
      case 'updateJSFileCount':
        handleCountUpdate(message);
        break;
      case 'getState':
        getState((state) => {
          sendResponse(state);
        });
        return true; // Indicates that the response is sent asynchronously
    }

    sendResponse({ success: true });
  });
}

function handleStateChange(message: Message): void {
  const { action, state } = message;
  const key = action === 'urlParserChanged' ? 'urlParser' : 'fileDownloader';

  updateState(key, state);

  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    if (tabs[0]?.id) {
      chrome.tabs.sendMessage(tabs[0].id, { action: `${key}StateChanged`, state });
    }
  });
}

function handleCountUpdate(message: Message): void {
  const { action, count } = message;
  const key = action === 'updateURLCount' ? 'urlCount' : 'fileCount';
  const countValue = count ?? 0;

  chrome.storage.local.get(['URL-PARSER', key], (result) => {
    const urlParser = result['URL-PARSER'] || {};
    let totalCount = result[key] || 0;

  if (action === 'updateURLCount') {
    totalCount  += countValue;
  } else {
    jsFileCount = countValue;
  }

  updateState(key, countValue);

  chrome.runtime.sendMessage({ action: `${key}Updated`, count: countValue });
});
}
