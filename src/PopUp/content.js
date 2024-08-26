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


// parse urls on refresh if parser is enabled

window.onload = function(){
  chrome.storage.local.get("urlParser", (urlParserState) => {
    if (urlParserState.urlParser){
      parseURLs()
    }
  })
}


// parse urls when receiving message
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getCurrTabData') {
    parseURLs()
    sendResponse({ data: 'parsed urls' });
  }
});

chrome.storage.local.getBytesInUse(null, function(bytesInUse) {
  console.log('Bytes in use:', bytesInUse);
});

function parseURLs(){
  alert("parsed")
  let scriptTags = document.getElementsByTagName('script');
  const relRegex = /["'](\/[\w./\-_?=&]*)["']/g;
  const abRegex = /(["'])(https?:\/\/(?:www\.)?[\w.-]+(?::\d+)?(?:\/[\w.\/\-_?=&]*)?)\1/g;
  const fileRegex = /\.(pdf|docx?|xlsx?|pptx?|js|css|jpg|jpeg|png|gif|bmp|svg|mp3|mp4|avi|mov|txt|csv|json|xml|zip|rar|7z|exe|woff2?|otf)$/i;

  parse_curr_page()
  function parse_external_files(){
    console.log("script tags: " + scriptTags.length)
    let js_files = []
    let extURLCount = 0
      for (let i = 0; i < scriptTags.length; i++) {
        const js_file = scriptTags[i].src;
        js_files.push(js_file)
        fetch_file(js_file)
            .then(code => {
                const jsFileRelURLs = Array.from(code.matchAll(relRegex), match => match[1]);
                const jsFileAbURLs = Array.from(code.matchAll(abRegex), match => match[1]);
                const jsFileURLs = new Set([...jsFileRelURLs, ...jsFileAbURLs]);
                let currEndpointCount =  (Array.from(jsFileURLs).length).toString() + " urls found in: "+ js_file 
                const encodedURL = encodeURIComponent(js_file)
                console.log(currEndpointCount)

                chrome.storage.local.get("URL-PARSER", (result) => {
                  const urlParser = result["URL-PARSER"] || '';
                  const currentURL = urlParser["current"]
                  urlParser[currentURL].externalJSFiles[encodedURL] = Array.from(jsFileURLs);
                  chrome.storage.local.set({ "URL-PARSER": urlParser }, () => {
                    console.log("Saved endpoints from external files");
                  });
                });


            })
            .catch(error => {
                console.error('Error fetching script:', error);
            });
          
    }
    console.log("js files: " + js_files.length)
    console.log("urls found: " + extURLCount)
  }


  function parse_curr_page(){
      const pageContent = document.documentElement.outerHTML;
      const abPageURLs = Array.from(pageContent.matchAll(abRegex), match => match[1]);
      const relPageURLs = Array.from(pageContent.matchAll(relRegex), match => match[1]);
      const pageURLs = new Set([...abPageURLs, ...relPageURLs])
      const currPage = encodeURIComponent(document.location.href)
      console.log(pageURLs)
      console.log("from current page ^")
      
      chrome.storage.local.get('URL-PARSER', (result) => {
        const urlParser = result['URL-PARSER'] || {};
        if (!urlParser[currPage]) {
          urlParser[currPage] = { currPage: [], externalJSFiles: {} };
        }
        urlParser["current"] = currPage;
        urlParser[currPage].currPage = Array.from(pageURLs);
        chrome.storage.local.set({ 'URL-PARSER': urlParser }, () => {
          console.log("Saved endpoints from current page");
        });
      });
      parse_external_files()
   
  }

  async function fetch_file(file) {
      const response = await fetch(file);
      let js_code = await response.text();
      return js_code;
  }

  function parse_fqdn() {
      url_pieces = document.location.href.split('/');
      return url_pieces[2];
  }
}