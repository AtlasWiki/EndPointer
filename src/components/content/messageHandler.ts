import { urlParserOrchestrator } from './urlParser_Orcastrator';
import { Message } from '../sharedTypes/message_types';

export function setupMessageListeners() {
  chrome.runtime.onMessage.addListener((message: Message, sender, sendResponse) => {
    console.log('Content script received message:', message);

    switch (message.action) {
      case 'getCurrTabData':
        urlParserOrchestrator.parseURLs();
        sendResponse({ data: 'Parsed URLs' });
        break;
      case 'countURLs':
        urlParserOrchestrator.countURLs();
        break;
      case 'countJSFiles':
        urlParserOrchestrator.countJSFiles();
        break;
    }
  });
}