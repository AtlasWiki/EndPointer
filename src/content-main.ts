import { setupMessageListeners } from './components/content/messageHandler';
import { urlParserOrchestrator } from './components/content/urlParser_Orcastrator';
import { initializeState } from './components/content/stateManager';

// Initialize the state when the content script loads
initializeState().then(() => {
  console.log('Content script state initialized');

  // Set up message listeners for communication with the background script and popup
  setupMessageListeners();

  // Initialize the URL parser orchestrator
  urlParserOrchestrator.initialize()
    .then(() => {
      console.log('URL Parser Orchestrator initialized successfully');
      // Notify background script that content script is ready
      chrome.runtime.sendMessage({ action: 'contentScriptReady' });
    })
    .catch((error) => {
      console.error('Failed to initialize URL Parser Orchestrator:', error);
    });
});

// Listen for changes in the URL parser state
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.urlParser) {
    const newState = changes.urlParser.newValue;
    urlParserOrchestrator.handleStateChange(newState);
  }
});