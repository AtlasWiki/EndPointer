// background.ts

interface ExtensionState {
  urlParser: boolean;
  fileDownloader: boolean;
  urlCount: number;
  fileCount: number;
}

interface Message {
  action: string;
  state?: boolean;
  count?: number;
}

let urlCount = 0;
let jsFileCount = 0;

chrome.runtime.onInstalled.addListener(() => {
  const initialState: ExtensionState = {
    urlParser: false,
    fileDownloader: false,
    urlCount: 0,
    fileCount: 0
  };

  chrome.storage.local.set(initialState, () => {
    console.log("Default values set on installation");
  });
});

chrome.runtime.onMessage.addListener((message: Message, sender, sendResponse) => {
  console.log('Background script received message:', message);

  switch (message.action) {
    case 'urlParserChanged':
    case 'fileDownloaderChanged':
      handleStateChange(message);
      break;
    case 'updateURLCount':
    case 'updateJSFileCount':
      handleCountUpdate(message);
      break;
  }

  sendResponse({ success: true });
});

const handleStateChange = (message: Message): void => {
  const { action, state } = message;
  const key = action === 'urlParserChanged' ? 'urlParser' : 'fileDownloader';

  chrome.storage.local.set({ [key]: state }, () => {
    console.log(`${key} state saved:`, state);
  });

  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    if (tabs[0]?.id) {
      chrome.tabs.sendMessage(tabs[0].id, { action: `${key}StateChanged`, state });
    }
  });
};

const handleCountUpdate = (message: Message): void => {
  const { action, count } = message;
  const key = action === 'updateURLCount' ? 'urlCount' : 'fileCount';
  const countValue = count ?? 0;

  if (action === 'updateURLCount') {
    urlCount = countValue;
  } else {
    jsFileCount = countValue;
  }

  chrome.storage.local.set({ [key]: countValue }, () => {
    console.log(`${key} updated:`, countValue);
  });

  chrome.runtime.sendMessage({ action: `${key}Updated`, count: countValue });
};

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    chrome.storage.local.get(['urlParser', 'fileDownloader'], (result: Partial<ExtensionState>) => {
      if (result.urlParser) {
        chrome.tabs.sendMessage(tabId, {action: "countURLs"});
      }
      if (result.fileDownloader) {
        chrome.tabs.sendMessage(tabId, {action: "countJSFiles"});
      }
    });
  }
});

export {}; // This empty export makes the file a module