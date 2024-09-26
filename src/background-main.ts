import browser from 'webextension-polyfill';
import { initializeState } from './components/background/stateManager';
import { setupTabListeners } from './components/background/tabHandler';
import { setupMessageListeners } from './components/background/messageHandler';


// Initialize state when extension is installed
browser.runtime.onInstalled.addListener(() => {
  initializeState();
});

// Set up tab listeners
setupTabListeners();

// Set up message listeners
setupMessageListeners();