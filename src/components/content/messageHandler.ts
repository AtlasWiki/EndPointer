import { parseURLs, countURLs, countJSFiles, parseURLsManually } from './urlParser';
import { Message } from '../sharedTypes/message_types';

export function setupMessageListeners() {
  chrome.runtime.onMessage.addListener((message: Message, sender, sendResponse) => {
    console.log('Content script received message:', message);

    switch (message.action) {
      case 'getCurrTabData':
        parseURLs();
        sendResponse({ data: 'Parsed URLs' });
        break;
      case 'countURLs':
        countURLs();
        break;
      case 'countJSFiles':
        countJSFiles();
        break;
      case 'parseURLs':
        // parseURLs();
        parseURLsManually()
        sendResponse({ data: 'Parsed URLs' });
        break;
    }
  });
}