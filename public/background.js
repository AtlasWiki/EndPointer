
//initliaze the button state on start up
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    urlParser: false,
    fileDownloader: false
  }, () => {
    console.log("Default values set on installation");
  });
});


//Managed the state of the buttons
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background script received message:', message);

  if (message.action === 'urlParserChanged') {
    chrome.storage.local.set({ urlParser: message.state }, () => {
      console.log("URL Parser state saved:", message.state);
    });
  } else if (message.action === 'fileDownloaderChanged') {
    chrome.storage.local.set({ fileDownloader: message.state }, () => {
      console.log("File Downloader state saved:", message.state);
    });
  }

  // Send the response back to the pop up 
  sendResponse({ success: true });
});


