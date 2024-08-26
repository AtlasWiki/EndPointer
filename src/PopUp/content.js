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

let scope_input = prompt("list scopes in spaces.  Ex: example.com github.com OR use a null/blank value for all domains", parse_fqdn())
let scopes = scope_input.split(' ')
let scriptTags = document.getElementsByTagName('script');
let urlBuffer = ''; 
const relRegex = /["'](\/[\w./\-_?=&]*)["']/g;
const abRegex = /(["'])(https?:\/\/(?:www\.)?[\w.-]+(?::\d+)?(?:\/[\w.\/\-_?=&]*)?)\1/g;
const fileRegex = /\.(pdf|docx?|xlsx?|pptx?|js|css|jpg|jpeg|png|gif|bmp|svg|mp3|mp4|avi|mov|txt|csv|json|xml|zip|rar|7z|exe|woff2?|otf)$/i;

parse_curr_page()
function parse_external_files(){
    for (let i = 0; i < scriptTags.length; i++) {
    const js_file = scriptTags[i].src;
    for (let scope of scopes){
        let scope_pattern = `https?://${scope}`
        if (js_file.search(scope_pattern) != -1){
            fetch_file(js_file)
                .then(code => {
                    const jsFileRelURLs = Array.from(code.matchAll(relRegex), match => match[1]);
                    const jsFileAbURLs = Array.from(code.matchAll(abRegex), match => match[1]);
                    // const urls = new Set([...jsFileRelUrls, ...jsFileAbUrls, ...abPageUrls, ...relPageUrls]);
                    const jsFileURLs = new Set([...jsFileRelURLs, ...jsFileAbURLs]);
                    let encodedURL = encodeURIComponent(js_file)
                    document.write(``);
                    
                    setTimeout( () => {
                        let dynamicContent = document.documentElement.outerHTML;
                        let blob = new Blob([dynamicContent], {type: 'text/html'});
                        document.write(`<a href="${URL.createObjectURL(blob)}" download="${parse_fqdn()}.html">Download</a> <br>`)
                        let aHidden = document.createElement('a');
                        dynamicContent = document.documentElement.outerHTML;
                        blob = new Blob([dynamicContent], {type: 'text/html'});
                        aHidden.href=URL.createObjectURL(blob);
                        aHidden.target="_blank";
                        aHidden.click();
                    }, 1000)
                    
                    
                    document.write(`<br><h3>${jsFileURLs.size} URLS FOUND IN: <span style="font-weight:100;">[ <a href="${js_file}">${js_file}</a> ]</span></h3>`);
                    document.write(`<body><table id=${encodedURL} style="border: 1px solid black;width:70%;"></table></body>`)
                    let table = document.getElementById(encodedURL)
                    
                    let endpointTh = document.createElement('th');
                    endpointTh.textContent = "Endpoint";
                    endpointTh.id = encodedURL + '/endpoint-th';
                    endpointTh.style.border = "1px solid black";
                    
                    let mediaTypeTh = document.createElement('th');
                    mediaTypeTh.textContent = "Extension";
                    mediaTypeTh.id = encodedURL + '/media-type-th';
                    mediaTypeTh.style.border = "1px solid black";
                    
                    let locationTh =  document.createElement('th');
                    locationTh.textContent = "Location";
                    locationTh.id = encodedURL + '/location-th';
                    
                    let HeadersRow = document.createElement('tr');
                    HeadersRow.id = encodedURL + '/row1';
                    HeadersRow.appendChild(endpointTh);
                    HeadersRow.appendChild(mediaTypeTh);

                    table.appendChild(HeadersRow);

                    jsFileURLs.forEach((url) => {
                        urlBuffer += url;
                        let dataRow = document.createElement('tr');
                        
                        let urlData = document.createElement('td')
                        urlData.textContent = url
                        urlData.style.border = "1px solid black";
                        
                        let mediaTypeData = document.createElement('td');
                        mediaTypeData.textContent = url.match(fileRegex);
                        mediaTypeData.style.border = "1px solid black";
                                        
                        dataRow.appendChild(urlData)
                        dataRow.appendChild(mediaTypeData)
                        table.appendChild(dataRow);
                       
                    });
                    document.write('<br>')
                    
                })
                .catch(error => {
                    console.error('Error fetching script:', error);
                });
        }
    }
  }
}


function parse_curr_page(){
    const pageContent = document.documentElement.outerHTML;
    const abPageURLs = Array.from(pageContent.matchAll(abRegex), match => match[1]);
    const relPageURLs = Array.from(pageContent.matchAll(relRegex), match => match[1]);
    const pageURLs = new Set([...abPageURLs, ...relPageURLs])
    parse_external_files()
    document.write(`<br><h3>${pageURLs.size} URLS FOUND IN: <span style="font-weight:100;">[ <a href="${document.location}">${document.location}</a> ]  [Inline/Main Page]</span></h3>`);
    document.write(`<table id="mainpage" style="border: 1px solid black;width:70%;"></table>`)
    
    let table = document.getElementById("mainpage")
    let endpointTh = document.createElement('th');
    endpointTh.textContent = "Endpoint";
    endpointTh.id = "mainpage" + '/endpoint-th';
    endpointTh.style.border = "1px solid black";
    
    let mediaTypeTh = document.createElement('th');
    mediaTypeTh.textContent = "Extension";
    mediaTypeTh.id = "mainpage" + '/media-type-th';
    mediaTypeTh.style.border = "1px solid black";
    
    let locationTh =  document.createElement('th');
    locationTh.textContent = "Location";
    locationTh.id = "mainpage" + '/location-th';
    
    let HeadersRow = document.createElement('tr');
    HeadersRow.id = "mainpage" + '/row1';
    HeadersRow.appendChild(endpointTh);
    HeadersRow.appendChild(mediaTypeTh);

    table.appendChild(HeadersRow);

    pageURLs.forEach((url) => {
        console.log(url)
        urlBuffer += url;
        let dataRow = document.createElement('tr');
        
        let urlData = document.createElement('td')
        urlData.textContent = url
        urlData.style.border = "1px solid black";
        
        let mediaTypeData = document.createElement('td');
        mediaTypeData.textContent = url.match(fileRegex);
        mediaTypeData.style.border = "1px solid black";
                        
        dataRow.appendChild(urlData)
        dataRow.appendChild(mediaTypeData)
        table.appendChild(dataRow);
    });
    document.write('<br>')
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

