import browser from 'webextension-polyfill';
import { Parser } from './content/urlParser';
import { Message, MessageResponse } from './constants/message_types';

let isAutoParserEnabled = false;
const parser = new Parser();

// Set up message listener for content script
browser.runtime.onMessage.addListener((message: unknown, sender: browser.Runtime.MessageSender, sendResponse: (response: unknown) => void) => {
  console.log('Content script received message:', message);

  const typedMessage = message as Message;
  const typedSendResponse = (response: MessageResponse) => sendResponse(response);

  switch (typedMessage.action) {
    case 'parseURLs':
      parser.parseURLs().then(() => typedSendResponse({ success: true }));
      break;
    case 'reparse':
      parser.reparse().then(() => typedSendResponse({ success: true }));
      break;
    case 'countURLs':
      Parser.countURLs().then(count => typedSendResponse({ success: true, count }));
      break;
    case 'countJSFiles':
      Parser.countJSFiles().then(count => typedSendResponse({ success: true, count }));
      break;
    case 'getAutoParserState':
      typedSendResponse({ success: true, state: isAutoParserEnabled });
      break;
    case 'setAutoParserState':
      isAutoParserEnabled = typedMessage.state ?? false;
      if (isAutoParserEnabled) {
        parser.parseURLs();
      }
      typedSendResponse({ success: true });
    case 'clearURLs':
      browser.storage.local.set({ "URL-PARSER": {} }).then(() => typedSendResponse({ success: true }));
      break;
    default:
      typedSendResponse({ success: false, error: 'Unknown action' });
  }

  return true; // Keeps the message channel open for asynchronous responses
});

// Initialize content script
browser.runtime.sendMessage({ action: 'getAutoParserState' }).then((response: any) => {
  isAutoParserEnabled = response.state ?? false;
  if (isAutoParserEnabled) {
    parser.parseURLs();
  }
});

// Parse URLs on page load if autoParser is enabled
window.addEventListener('load', function () {
  if (isAutoParserEnabled) {
    parser.parseURLs();
  }
});