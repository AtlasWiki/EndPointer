import { setupMessageListeners } from './components/content/messageHandler';
import { parseURLs } from './components/content/urlParser';

// Set up message listeners
setupMessageListeners();

// Parse URLs on page load if urlParser is enabled
window.onload = function () {
  chrome.storage.local.get("urlParser", (urlParserState) => {
    if (urlParserState.urlParser) {
      parseURLs();
    }
  });
};