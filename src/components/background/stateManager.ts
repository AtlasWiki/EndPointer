import { ExtensionState } from '../sharedTypes/message_types';

// Initializes the extension state
export function initializeState() {
  const initialState: ExtensionState = {
    urlParser: false,
    fileDownloader: false,
    urlCount: 0,
    fileCount: 0
  };

  chrome.storage.local.set(initialState, () => {
    console.log("Default values set on installation");
  });
}

// Updates a specific state value
export function updateState(key: keyof ExtensionState, value: any) {
  chrome.storage.local.set({ [key]: value }, () => {
    console.log(`${key} state saved:`, value);
  });
}

// Retrieves the current state
export function getState(callback: (state: Partial<ExtensionState>) => void) {
  chrome.storage.local.get(['urlParser', 'fileDownloader', 'urlCount', 'fileCount'], 
    (result: Partial<ExtensionState>) => {
      callback(result);
    }
  );
}