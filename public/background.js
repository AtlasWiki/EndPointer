chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background script received message:', message);
  chrome.storage.local.set({ urlParser: message }).then(() => {
    console.log("Cache has been set");
  });
  chrome.storage.local.get(["urlParser"]).then((result) => {
    console.log("Cache is " + result.urlParser);
  });
  sendResponse({ response: result.urlParser });
});

