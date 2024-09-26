
import browser from 'webextension-polyfill';
import { parseURLs, countURLs, countJSFiles, parseURLsManually } from './components/content/urlParser';
import { ExtensionState, Message, MessageResponse } from './components/sharedTypes/message_types';


// Set up message listener for content script
browser.runtime.onMessage.addListener((message: unknown, sender: any, sendResponse: any) => {
  console.log('Content script received message:', message);

  const typedMessage = message as Message;

  let response: Promise<MessageResponse>;

  switch (typedMessage.action) {
    case 'parseURLs':
      response = handleParseURLs();
      break;
    case 'parseURLsManually':
      response = handleParseURLsManually();
      break;
    case 'countURLs':
      response = handleCountURLs();
      break;
    case 'countJSFiles':
      response = handleCountJSFiles();
      break;
    case 'urlParserStateChanged':
      response = handleUrlParserStateChanged(typedMessage.state);
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

async function handleParseURLsManually(): Promise<MessageResponse> {
  try {
    await parseURLsManually();
    return { success: true };
  } catch (error) {
    console.error('Failed to parse URLs manually:', error);
    return { success: false, error: 'Failed to parse URLs manually' };
  }
}

async function handleCountURLs(): Promise<MessageResponse> {
  try {
    await countURLs();
    return { success: true };
  } catch (error) {
    console.error('Failed to count URLs:', error);
    return { success: false, error: 'Failed to count URLs' };
  }
}

async function handleCountJSFiles(): Promise<MessageResponse> {
  try {
    await countJSFiles();
    return { success: true };
  } catch (error) {
    console.error('Failed to count JS files:', error);
    return { success: false, error: 'Failed to count JS files' };
  }
}

async function handleUrlParserStateChanged(state?: boolean): Promise<MessageResponse> {
  if (state === true) {
    try {
      await parseURLs();
      return { success: true };
    } catch (error) {
      console.error('Failed to parse URLs after state change:', error);
      return { success: false, error: 'Failed to parse URLs after state change' };
    }
  }
  return { success: true };
}


// Initialize content script
// Type guard function
function isExtensionState(obj: unknown): obj is Partial<ExtensionState> {
  return typeof obj === 'object' && obj !== null && 'urlParser' in obj;
}

// Initialize content script
browser.runtime.sendMessage({ action: 'getInitialState' }).then((response: unknown) => {
  if (isExtensionState(response) && response.urlParser) {
    parseURLs();
  } else {
    console.error('Received invalid state:', response);
  }
  // Add any other initialization based on state if needed
}).catch((error:any) => {
  console.error('Failed to get initial state:', error);
});

// Parse URLs on page load if urlParser is enabled
window.addEventListener('load', function () {
  browser.runtime.sendMessage({ action: 'getUrlParserState' }).then(enabled => {
    if (enabled) {
      parseURLs();
    }
  }).catch((error: any) => {
    console.error('Failed to get URL parser state:', error);
  });
});

browser.runtime.onMessage.addListener((message: unknown, sender: any, sendResponse: any) => {
  if (typeof message === 'object' && message !== null && 'action' in message && message.action === 'parseURLs') {
    parseURLs().then(() => {
      sendResponse({ success: true });
    }).catch((error) => {
      console.error('Error parsing URLs:', error);
      sendResponse({ success: false, error: error.message });
    });
    return true;
  }
});