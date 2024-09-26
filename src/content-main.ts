import browser from 'webextension-polyfill';
import { parseURLs, parseURLsManually, countURLs, countJSFiles } from './components/content/urlParser';
import { Message, MessageResponse } from './components/sharedTypes/message_types';

let isAutoParserEnabled = false;

// Set up message listener for content script
browser.runtime.onMessage.addListener((message: unknown, sender: any, sendResponse: any) => {
  console.log('Content script received message:', message);

  const typedMessage = message as Message;

  let response: Promise<MessageResponse>;

  switch (typedMessage.action) {
    case 'parseURLs':
      response = handleParseURLs();
      break;
    case 'countURLs':
      response = handleCountURLs();
      break;
    case 'countJSFiles':
      response = handleCountJSFiles();
      break;
    case 'getAutoParserState':
      response = Promise.resolve({ success: true, state: isAutoParserEnabled });
      break;
    case 'setAutoParserState':
      response = handleSetAutoParserState(typedMessage.state as boolean);
      break;
    case 'clearURLs':
      response = handleClearURLs();
      break;
    default:
      response = Promise.resolve({ success: false, error: 'Unknown action' });
  }

  response.then(sendResponse).catch(error => {
    console.error('Error in message handler:', error);
    sendResponse({ success: false, error: error.message });
  });

  return true; // Keeps the message channel open for asynchronous responses
});

async function handleParseURLs(): Promise<MessageResponse> {
  try {
    await parseURLs();
    return { success: true };
  } catch (error) {
    console.error('Failed to parse URLs:', error);
    return { success: false, error: 'Failed to parse URLs' };
  }
}

async function handleCountURLs(): Promise<MessageResponse> {
  try {
    const count = await countURLs();
    return { success: true, count };
  } catch (error) {
    console.error('Failed to count URLs:', error);
    return { success: false, error: 'Failed to count URLs' };
  }
}

async function handleCountJSFiles(): Promise<MessageResponse> {
  try {
    const count = await countJSFiles();
    return { success: true, count };
  } catch (error) {
    console.error('Failed to count JS files:', error);
    return { success: false, error: 'Failed to count JS files' };
  }
}

async function handleSetAutoParserState(state: boolean): Promise<MessageResponse> {
  isAutoParserEnabled = state;
  await browser.storage.local.set({ autoParserEnabled: state });
  return { success: true };
}

async function handleClearURLs(): Promise<MessageResponse> {
  try {
    await browser.storage.local.set({ 'URL-PARSER': {} });
    return { success: true };
  } catch (error) {
    console.error('Failed to clear URLs:', error);
    return { success: false, error: 'Failed to clear URLs' };
  }
}

// Initialize content script
browser.storage.local.get('autoParserEnabled').then((result) => {
  (isAutoParserEnabled as any) = result.autoParserEnabled || false;
  if (isAutoParserEnabled) {
    parseURLs();
  }
}).catch((error) => {
  console.error('Failed to get initial state:', error);
});

// Parse URLs on page load if autoParser is enabled
window.addEventListener('load', function () {
  if (isAutoParserEnabled) {
    parseURLs();
  }
});