import browser from 'webextension-polyfill';
import { Message, MessageListener, MessageResponse } from './constants/message_types';
import { sendRequest, RequestDetails, ResponseData } from './utils/request_Util';

let isAutoParserEnabled = false;

// Initialize the auto parser state
browser.storage.local.get('autoParserEnabled').then((result) => {
  (isAutoParserEnabled as any) = result.autoParserEnabled || false;
});

// Listen for messages from popup and content scripts
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Received message in background script:', message);

  if ((message as Message).action === 'getAutoParserState') {
    sendResponse({ success: true, state: isAutoParserEnabled });
  } else if ((message as Message).action === 'setAutoParserState') {
    isAutoParserEnabled = (message as any).state;
    browser.storage.local.set({ autoParserEnabled: isAutoParserEnabled });
    sendResponse({ success: true });

    // Notify all tabs about the state change
    browser.tabs.query({}).then((tabs) => {
      tabs.forEach((tab) => {
        if (tab.id) {
          browser.tabs.sendMessage(tab.id, { action: 'autoParserStateChanged', state: isAutoParserEnabled })
          .catch(() => {
            // Silent fail if the tab doesn't have the content script loaded
          });
        }
      });
    });
  } else if ((message as any).type === 'sendRequest') {
    handleSendRequest(message as RequestDetails)
      .then(sendResponse)
      .catch(error => {
        console.error('Error in handleSendRequest:', error);
        sendResponse({ success: false, error: error.message });
      });
    return true; // Indicates that the response will be sent asynchronously
  }
});

async function handleSendRequest(details: RequestDetails): Promise<ResponseData> {
  console.log('Handling send request in background script:', details);
  try {
    const response = await sendRequest(details);
    console.log('Request response:', response);
    return response;
  } catch (error) {
    console.error('Error in background script:', error);
    throw error;
  }
}

// Make sure the background script stays active
browser.runtime.onInstalled.addListener(() => {
  console.log('Background script installed');
});

browser.runtime.onStartup.addListener(() => {
  console.log('Background script started');
});