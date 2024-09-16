import { ExtensionState } from '../sharedTypes/message_types';

const DEFAULT_STATE: ExtensionState = {
  urlParser: false,
  urlCount: 0,
  jsFileCount: 0
};

// Initializes the extension state
export function initializeState(): void {
  chrome.storage.local.get(null, (result) => {
    const newState = { ...DEFAULT_STATE, ...result };
    chrome.storage.local.set(newState, () => {
      console.log('Extension state initialized:', newState);
    });
  });
}

// Updates the extension state
export function updateState(key: keyof ExtensionState, value: any): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [key]: value }, () => {
      if (chrome.runtime.lastError) {
        console.error(`Error updating ${key} state:`, chrome.runtime.lastError);
        reject(chrome.runtime.lastError);
      } else {
        console.log(`${key} state updated:`, value);
        resolve();
      }
    });
  });
}

// Retrieves the current state or a specific state value
export function getState(key?: keyof ExtensionState): Promise<any> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(key || null, (result: Partial<ExtensionState>) => {
      if (chrome.runtime.lastError) {
        console.error('Error getting state:', chrome.runtime.lastError);
        reject(chrome.runtime.lastError);
      } else {
        resolve(key ? result[key] : result);
      }
    });
  });
}