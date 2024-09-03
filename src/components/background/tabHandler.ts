// Sets up tab update listeners
export function setupTabListeners() {
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
      chrome.storage.local.get(['urlParser', 'fileDownloader'], (result) => {
        if (result.urlParser) {
          chrome.tabs.sendMessage(tabId, {action: "countURLs"});
        }
        if (result.fileDownloader) {
          chrome.tabs.sendMessage(tabId, {action: "countJSFiles"});
        }
      });
    }
  });
}