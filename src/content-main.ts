import browser from 'webextension-polyfill';
import { parseURLs, reparse, countURLs, countJSFiles } from './components/content/urlParser';
import { Message, MessageResponse } from './components/sharedTypes/message_types';

let isAutoParserEnabled = false;

// Set up message listener for content script
browser.runtime.onMessage.addListener((message: unknown, sender: browser.Runtime.MessageSender, sendResponse: (response: unknown) => void) => {
  console.log('Content script received message:', message);

  const typedMessage = message as Message;
  const typedSendResponse = (response: MessageResponse) => sendResponse(response);

  switch (typedMessage.action) {
    case 'parseURLs':
      parseURLs().then(() => typedSendResponse({ success: true }));
      break;
    case 'reparse':
      reparse().then(() => typedSendResponse({ success: true }));
      break;
    case 'countURLs':
      countURLs().then(count => typedSendResponse({ success: true, count }));
      break;
    case 'countJSFiles':
      countJSFiles().then(count => typedSendResponse({ success: true, count }));
      break;
    case 'getAutoParserState':
      typedSendResponse({ success: true, state: isAutoParserEnabled });
      break;
    case 'setAutoParserState':
      isAutoParserEnabled = typedMessage.state ?? false;
      browser.storage.local.set({ autoParserEnabled: isAutoParserEnabled });
      typedSendResponse({ success: true });
      break;
    case 'clearURLs':
      browser.storage.local.remove('URL-PARSER').then(() => typedSendResponse({ success: true }));
      break;
    default:
      typedSendResponse({ success: false, error: 'Unknown action' });
  }

  return true; // Keeps the message channel open for asynchronous responses
});

// Initialize content script
browser.storage.local.get('autoParserEnabled').then((result) => {
(isAutoParserEnabled as any) = result.autoParserEnabled || false;
  if (isAutoParserEnabled) {
    parseURLs();
  }
});

// Parse URLs on page load if autoParser is enabled
window.addEventListener('load', function () {
  if (isAutoParserEnabled) {
    parseURLs();
  }
});