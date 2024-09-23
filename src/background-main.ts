import { initializeState } from './components/background/stateManager';
import { setupTabListeners } from './components/background/tabHandler';
import { setupMessageListeners } from './components/background/messageHandler';

// Initialize state when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  initializeState();
});

// Set up tab listeners
setupTabListeners();

// Set up message listeners
setupMessageListeners();