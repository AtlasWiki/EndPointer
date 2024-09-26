import browser from 'webextension-polyfill'
import { ExtensionState } from '../sharedTypes/message_types';

export function initializeState() {
  const initialState: ExtensionState = {
    urlParser: false,
    urlCount: 0,
    fileCount: 0
  };

  browser.storage.local.set(initialState as unknown as Record<string, unknown>).then(() => {
    console.log("Default values set on installation");
  });
}

export function updateState(key: keyof ExtensionState, value: unknown): Promise<void> {
  return browser.storage.local.set({ [key]: value })
    .then(() => {
      console.log(`${key} state saved:`, value);
    })
    .catch((error) => {
      console.error(`Error saving ${key} state:`, error);
      throw error;
    });
}

export function getState(): Promise<Partial<ExtensionState>> {
  return browser.storage.local.get(['urlParser', 'urlCount', 'fileCount'])
    .then((result: Partial<ExtensionState>) => {
      return result;
    })
    .catch((error) => {
      console.error('Error getting state:', error);
      return {};
    });
}