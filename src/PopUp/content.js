// // content.ts

// interface Message {
//   action: string;
//   state?: boolean;
// }

// let isURLParsingEnabled = false;
// let isJSFileCountingEnabled = false;

// const countURLs = (): number => {
//   const links = document.getElementsByTagName('a');
//   return Array.from(links).filter(link => link.href && link.href.startsWith('http')).length;
// };

// const countJSFiles = (): number => {
//   const scripts = document.getElementsByTagName('script');
//   return Array.from(scripts).filter(script => script.src).length;
// };

// const sendURLCount = (): void => {
//   if (isURLParsingEnabled) {
//     const count = countURLs();
//     chrome.runtime.sendMessage({ action: 'updateURLCount', count });
//   }
// };

// const sendJSFileCount = (): void => {
//   if (isJSFileCountingEnabled) {
//     const count = countJSFiles();
//     chrome.runtime.sendMessage({ action: 'updateJSFileCount', count });
//   }
// };

// const observer = new MutationObserver((mutations: MutationRecord[]) => {
//   let shouldCountURLs = false;
//   let shouldCountJSFiles = false;

//   for (const mutation of mutations) {
//     if (mutation.type === 'childList') {
//       for (const node of mutation.addedNodes) {
//         if (node instanceof HTMLElement) {
//           if (node.tagName === 'A') {
//             shouldCountURLs = true;
//           } else if (node.tagName === 'SCRIPT') {
//             shouldCountJSFiles = true;
//           }
//         }
//       }
//     }
//   }

//   if (shouldCountURLs) {
//     sendURLCount();
//   }
//   if (shouldCountJSFiles) {
//     sendJSFileCount();
//   }
// });

// chrome.runtime.onMessage.addListener((message: Message, sender, sendResponse) => {
//   switch (message.action) {
//     case "urlParserStateChanged":
//       handleURLParserStateChange(message.state);
//       break;
//     case "fileDownloaderStateChanged":
//       handleFileDownloaderStateChange(message.state);
//       break;
//     case "countURLs":
//       sendURLCount();
//       break;
//     case "countJSFiles":
//       sendJSFileCount();
//       break;
//   }
// });

// const handleURLParserStateChange = (state: boolean | undefined): void => {
//   isURLParsingEnabled = state ?? false;
//   updateObserver();
//   if (isURLParsingEnabled) {
//     sendURLCount();
//   }
// };

// const handleFileDownloaderStateChange = (state: boolean | undefined): void => {
//   isJSFileCountingEnabled = state ?? false;
//   updateObserver();
//   if (isJSFileCountingEnabled) {
//     sendJSFileCount();
//   }
// };

// const updateObserver = (): void => {
//   if (isURLParsingEnabled || isJSFileCountingEnabled) {
//     observer.observe(document.body, { childList: true, subtree: true });
//   } else {
//     observer.disconnect();
//   }
// };

// // Check the initial state when the content script loads
// chrome.storage.local.get(['urlParser', 'fileDownloader'], (result: { urlParser?: boolean; fileDownloader?: boolean }) => {
//   handleURLParserStateChange(result.urlParser);
//   handleFileDownloaderStateChange(result.fileDownloader);
// });

// export {}; // This empty export makes the file a module

// document.addEventListener("DOMContentLoaded", () => {
//   console.log("loaded from content script: " + document.location.href)
//   alert("from DOMContentLoaded")
// })
// alert(1)

document.addEventListener("DOMContentLoaded", () => {
  console.log("loaded from content script: " + document.location.href);
  alert("from DOMContentLoaded");
});
alert(document.location.href);
prompt("popup");