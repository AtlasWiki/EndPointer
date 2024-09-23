import { ExtensionState } from '../sharedTypes/message_types';

// Initializes the extension state
export function initializeState() {
  const initialState: ExtensionState = {
    urlParser: false,
    urlCount: 0,
    fileDownloader: false
  };

  chrome.storage.local.set(initialState, () => {
    console.log("Default values set on installation");
  });
}

// Updates a specific state value
export function updateState(key: keyof ExtensionState, value: any) {
  return new Promise<void>((resolve, reject) => {
    chrome.storage.local.set({ [key]: value }, () => {
      if (chrome.runtime.lastError) {
        console.error(`Error saving ${key} state:`, chrome.runtime.lastError);
        reject(chrome.runtime.lastError);
      } else {
        console.log(`${key} state saved:`, value);
        resolve();
      }
    });
  });
}

// Retrieves the current state
export function getState(callback: (state: Partial<ExtensionState>) => void) {
  chrome.storage.local.get(['urlParser', 'fileDownloader', 'urlCount', 'fileCount'], 
    (result: Partial<ExtensionState>) => {
      if (chrome.runtime.lastError) {
        console.error('Error getting state:', chrome.runtime.lastError);
        callback({});
      } else {
        callback(result);
      }
    }
  );
}