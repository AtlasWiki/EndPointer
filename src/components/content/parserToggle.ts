import { parseURLs } from './urlParser';
import { MessageType, ParsedData } from '../sharedTypes/types';

// Listens for messages from other parts of the extension
chrome.runtime.onMessage.addListener((message: MessageType, sender, sendResponse) => {
  if (message.action === 'startUrlParsing') {
    handleUrlParsing();
    return true; // Indicates async response
  }
  
  if (message.action === 'getCurrTabData') {
    handleGetCurrentTabData(sendResponse);
    return true; // Indicates async response
  }
});

// Handles the URL parsing process
async function handleUrlParsing() {
  try {
    const parsedData = await parseURLs();
    chrome.runtime.sendMessage({
      action: 'urlsParsed',
      data: parsedData
    });
} catch (error) {
    chrome.runtime.sendMessage({
      action: 'urlParsingError',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

// Handles getting data for the current tab
async function handleGetCurrentTabData(sendResponse: (response: any) => void) {
  try {
        const parsedData = await parseURLs();
        chrome.runtime.sendMessage({ action: 'urlsParsed' });
        sendResponse({ data: parsedData });
    } catch (error) {
        sendResponse({ error: error instanceof Error ? error.message : String(error) });
  }
}

// Initializes parsing if enabled on window load
window.onload = () => {
  chrome.storage.local.get("urlParser", (result) => {
    if (result.urlParser) {
      handleUrlParsing();
    }
  });
};