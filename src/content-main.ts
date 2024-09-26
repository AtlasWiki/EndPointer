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
    sendResponse({ success: false, error: error.message, stack: error.stack });
  });

  return true; // Keeps the message channel open for asynchronous responses
});

async function handleParseURLs(): Promise<MessageResponse> {
  try {
    await parseURLs();
    return { success: true };
  } catch (error) {
    console.error('Failed to parse URLs:', error);
    return { success: false, error: 'Failed to parse URLs', details: (error as Error).message };
  }
}

async function handleCountURLs(): Promise<MessageResponse> {
  try {
    const count = await countURLs();
    return { success: true, count };
  } catch (error) {
    console.error('Failed to count URLs:', error);
    return { success: false, error: 'Failed to count URLs', details: (error as Error).message };
  }
}

async function handleCountJSFiles(): Promise<MessageResponse> {
  try {
    const count = await countJSFiles();
    return { success: true, count };
  } catch (error) {
    console.error('Failed to count JS files:', error);
    return { success: false, error: 'Failed to count JS files', details: (error as Error).message };
  }
}

async function handleSetAutoParserState(state: boolean): Promise<MessageResponse> {
  try {
    isAutoParserEnabled = state;
    await browser.storage.local.set({ autoParserEnabled: state });
    return { success: true };
  } catch (error) {
    console.error('Failed to set auto parser state:', error);
    return { success: false, error: 'Failed to set auto parser state', details: (error as Error).message };
  }
}

async function handleClearURLs(): Promise<MessageResponse> {
  try {
    await browser.storage.local.remove('URL-PARSER');
    return { success: true };
  } catch (error) {
    console.error('Failed to clear URLs:', error);
    return { success: false, error: 'Failed to clear URLs', details: (error as Error).message };
  }
}

// Initialize content script
browser.storage.local.get('autoParserEnabled').then((result) => {
  (isAutoParserEnabled as {}) = result.autoParserEnabled || false;
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