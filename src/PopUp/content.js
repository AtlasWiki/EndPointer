// const relRegex = /["'](\/[\w./\-_?=&]*)["']/g; 
const relRegex = /["']((\/|(\w+\/))[\w./\-_?=&]*)["']/g;

const abRegex = /(https?:\/\/[^\s'"){}(]+)/g;

function parseURLs() {
  parse_curr_page();

  function parse_external_files() {
    let scriptTags = document.getElementsByTagName('script');
    console.log("Found script tags: " + scriptTags.length);

    let js_files = [];
    let extURLCount = 0;

    for (let i = 0; i < scriptTags.length; i++) {
      const js_file = scriptTags[i].src;
      js_files.push(js_file);

      fetch_file(js_file)
        .then(code => {
          const jsFileRelURLs = Array.from(code.matchAll(relRegex), match => match[1]);
          const jsFileAbURLs = Array.from(code.matchAll(abRegex), match => match[1]);
          console.log("Relative URLS: " + jsFileRelURLs)
          console.log(jsFileRelURLs)
          console.log("Absolute URLS: " + jsFileAbURLs)
          console.log(jsFileAbURLs)
          const jsFileURLs = new Set([...jsFileRelURLs, ...jsFileAbURLs]);

          extURLCount += jsFileURLs.size;
          console.log(`Found ${jsFileURLs.size} URLs in ${js_file}`);
          
          const encodedURL = encodeURIComponent(js_file);

          chrome.storage.local.get("URL-PARSER", (result) => {
            const urlParser = result["URL-PARSER"] || {};
            const currentURL = urlParser["current"];
            
            if (!urlParser[currentURL].externalJSFiles) {
              urlParser[currentURL].externalJSFiles = {};
            }

            urlParser[currentURL].externalJSFiles[encodedURL] = Array.from(jsFileURLs);

            chrome.storage.local.set({ "URL-PARSER": urlParser }, () => {
              console.log("Saved endpoints from external JS files.");
            });
          });
        })
        .catch(error => {
          console.error('Error fetching script:', error);
        });
    }

    console.log("Total JS files: " + js_files.length);
    console.log("Total URLs found: " + extURLCount);
  }

  function parse_curr_page() {
    const pageContent = document.documentElement.outerHTML;
    const abPageURLs = Array.from(pageContent.matchAll(abRegex), match => match[1]);
    const relPageURLs = Array.from(pageContent.matchAll(relRegex), match => match[1]);
    const pageURLs = new Set([...abPageURLs, ...relPageURLs]);

    const currPage = encodeURIComponent(document.location.href);
    console.log("URLs from current page: ", pageURLs);

    chrome.storage.local.get('URL-PARSER', (result) => {
      const urlParser = result['URL-PARSER'] || {};
      if (!urlParser[currPage]) {
        urlParser[currPage] = { currPage: [], externalJSFiles: {} };
      }

      urlParser["current"] = currPage;
      urlParser[currPage].currPage = Array.from(pageURLs);

      chrome.storage.local.set({ 'URL-PARSER': urlParser }, () => {
        console.log("Saved endpoints from the current page.");
      });
    });

    parse_external_files();
  }

  async function fetch_file(file) {
    const response = await fetch(file);
    const js_code = await response.text();
    return js_code;
  }
}

window.onload = function () {
  chrome.storage.local.get("urlParser", (urlParserState) => {
    if (urlParserState.urlParser) {
      parseURLs();
    }
  });
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getCurrTabData') {
    parseURLs();
    sendResponse({ data: 'Parsed URLs' });
  }
});
