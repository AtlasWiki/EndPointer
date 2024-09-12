// This file serves as the entry point for the background script.
// It initializes the extension state and sets up various listeners.

import { initializeState } from './components/background/stateManager';
import { setupTabListeners } from './components/background/tabHandler';
import { setupMessageListeners } from './components/background/messageHandler';

// Initialize the extension state when installed or updated
chrome.runtime.onInstalled.addListener(() => {
  initializeState();
});

// Set up tab listeners to handle tab updates and URL changes
setupTabListeners();

// Set up message listeners for communication with content scripts and popup
setupMessageListeners();

// Listen for changes in the URL parser state
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.urlParser) {
    const newState = changes.urlParser.newValue;
    console.log('URL Parser state changed:', newState);
    
    // Notify all tabs about the state change
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, { action: 'urlParserStateChanged', state: newState });
        }
      });
    });
  }
});

// Handle extension update
chrome.runtime.onUpdateAvailable.addListener((details) => {
  console.log('Update available:', details);
  chrome.runtime.reload();
});