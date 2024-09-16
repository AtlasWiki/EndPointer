import { ExtensionState } from '../sharedTypes/message_types';

// Initializes the extension state
export function initializeState() {
  const initialState: ExtensionState = {
    urlParser: false,
    urlCount: 0,
    jsFileCount: 0
  };

  chrome.storage.local.set(initialState, () => {
    console.log("Default values set on installation");
  });
}

// Updates a specific state value
export function updateState(key: keyof ExtensionState, value: any): Promise<void> {
  return new Promise((resolve, reject) => {
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

// Retrieves the current state or a specific state value
export function getState(key?: keyof ExtensionState): Promise<any> {
  return new Promise((resolve) => {
    chrome.storage.local.get(key || null, (result: Partial<ExtensionState>) => {
      if (chrome.runtime.lastError) {
        console.error('Error getting state:', chrome.runtime.lastError);
        resolve(key ? undefined : {});
      } else {
        resolve(key ? result[key] : result);
      }
    });
  });
}