  import { Message } from '../sharedTypes/message_types';
  import { updateState, getState } from './stateManager';

 

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

  async function handleCountUpdate(message: Message): Promise<void> {
    const { action, count } = message;
    const key = action === 'updateURLCount' ? 'urlCount' : 'fileCount';
    const countValue = count ?? 0;
    try{

    const result = await chrome.storage.local.get(['URL-PARSER', key]);
      const urlParser = result['URL-PARSER'] || {};
      let totalCount = result[key] || 0;

    if (action === 'updateURLCount') {
      totalCount  += countValue;
    }

    await chrome.storage.local.set({ [key]: totalCount });
    console.log(`${key} updated to ${totalCount}`);
    chrome.runtime.sendMessage({ action: `${key}Updated`, count: totalCount });
  } catch (error) {
    console.error('Error updating count:', error);
  }
}
