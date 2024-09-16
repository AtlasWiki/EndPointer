import { ExtensionState } from '../sharedTypes/message_types';

// Initializes the content script state
export function initializeState(): Promise<Partial<ExtensionState>> {
  return new Promise((resolve) => {
    chrome.storage.local.get(['urlParser'], (result: Partial<ExtensionState>) => {
      console.log('Content script state initialized:', result);
      resolve(result);
    });
  });
}

// Updates the content script state
export function updateState(key: keyof ExtensionState, value: any): void {
  chrome.storage.local.set({ [key]: value }, () => {
    console.log(`${key} state updated:`, value);
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