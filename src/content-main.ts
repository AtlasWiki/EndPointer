// This file serves as the entry point for the content script.
// It sets up message listeners and initializes the URL parser.

import { setupMessageListeners } from './components/content/messageHandler';
import { urlParserOrchestrator } from './components/content/urlParser_Orcastrator';

// Set up message listeners for communication with the background script and popup
setupMessageListeners();

// Initialize the URL parser orchestrator with the path to regex patterns
urlParserOrchestrator.initialize('./components/content/urlParser/urlTypes.json')
  .then(() => {
    console.log('URL Parser Orchestrator initialized successfully');
  })
  .catch((error) => {
    console.error('Failed to initialize URL Parser Orchestrator:', error);
  });

// Parse URLs when the page loads if URL parsing is enabled
window.addEventListener('load', () => {
  chrome.storage.local.get("urlParser", (result) => {
    if (result.urlParser) {
      urlParserOrchestrator.parseURLs();
    }
  });
});

// Listen for changes in the URL parser state
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.urlParser) {
    if (changes.urlParser.newValue) {
      urlParserOrchestrator.parseURLs();
    }
  } else {
    urlParserOrchestrator.stopObserving();
  }
});

//stop the page observer when the unload signal is sent
window.addEventListener('unload', () => {
  urlParserOrchestrator.stopObserving();
});