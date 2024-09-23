// import { parseURLs } from './urlParser';

// window.onload = () => {
//   chrome.storage.local.get("urlParser", (urlParserState) => {
//     if (urlParserState.urlParser) {
//       parseURLs();
//     }
//   });
// };

// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   if (message.action === 'getCurrTabData') {
//     parseURLs().then(() => sendResponse({ data: 'Parsed URLs' }));
//     return true; // Indicates that the response is sent asynchronously
//   }
// });
