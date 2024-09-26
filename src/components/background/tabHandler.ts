import browser from 'webextension-polyfill'

export function setupTabListeners() {
  browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
      browser.storage.local.get(['urlParser']).then((result) => {
        if (result.urlParser) {
          browser.tabs.sendMessage(tabId, {action: "countURLs"});
        }
        if (result.fileDownloader) {
          browser.tabs.sendMessage(tabId, {action: "countJSFiles"});
        }
      });
    }
  });
}