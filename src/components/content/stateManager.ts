import { ExtensionState } from '../sharedTypes/message_types';

// Initializes the content script state
export function initializeState() {
  chrome.storage.local.get(['urlParser', 'fileDownloader'], (result: Partial<ExtensionState>) => {
    if (result.urlParser) {
      // Perform actions based on urlParser state
    }
    if (result.fileDownloader) {
      // Perform actions based on fileDownloader state
    }
  });
}

// Updates the content script state
export function updateState(key: keyof ExtensionState, value: boolean) {
    chrome.storage.local.set({ [key]: value }, () => {
      console.log(`${key} state updated:`, value);
    });
}