chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background script received message:', message);
  sendResponse({ response: 'Response from background' });
  chrome.storage.local.set({ message: "test" }).then(() => {
    console.log("Cache has been set");
  });
  chrome.storage.local.get(["message"]).then((result) => {
    console.log("Cache is " + result.message);
  });
});

