import { ExtensionState } from '../sharedTypes/message_types';
import { REL_REGEX, ABS_REGEX } from '../sharedTypes/regex_constants';

export async function parseURLs() {
  console.log("Parsing URLs...");
  await parse_curr_page();
  countURLs();
}


async function parse_curr_page() {
  const pageContent = document.documentElement.outerHTML;
  const abPageURLs = Array.from(pageContent.matchAll(ABS_REGEX), match => match[1]);
  const relPageURLs = Array.from(pageContent.matchAll(REL_REGEX), match => match[1]);
  const pageURLs = new Set([...abPageURLs, ...relPageURLs]);

  const currPage = encodeURIComponent(document.location.href);
  console.log("URLs from current page: ", pageURLs);

  return new Promise<void>((resolve) => {
    chrome.storage.local.get('URL-PARSER', (result) => {
      const urlParser = result['URL-PARSER'] || {};
      if (!urlParser[currPage]) {
        urlParser[currPage] = { currPage: [], externalJSFiles: {} };
      }

      urlParser["current"] = currPage;
      urlParser[currPage].currPage = Array.from(pageURLs);

      chrome.storage.local.set({ 'URL-PARSER': urlParser }, () => {
        console.log("Saved endpoints from the current page.");
        updateURLCount(pageURLs.size);
        resolve();
     });
    });
  });

  await parse_external_files();
}

async function parse_external_files() {
  let scriptTags = document.getElementsByTagName('script');
  console.log("Found script tags: " + scriptTags.length);

  let js_files = Array.from(scriptTags).filter(script => script.src).map(script => script.src);
  console.log("Total JS files: " + js_files.length);

  let extURLCount = 0;
  const batchSize = 5; // Process 5 files at a time

  for (let i = 0; i < scriptTags.length; i++) {
    const js_file = scriptTags[i].src;
    if (js_file) {
      js_files.push(js_file);
      try {
      const code = await fetch_file(js_file);
      const jsFileRelURLs = Array.from(code.matchAll(REL_REGEX), match => match[1]);
      const jsFileAbURLs = Array.from(code.matchAll(ABS_REGEX), match => match[1]);
      const jsFileURLs = new Set([...jsFileRelURLs, ...jsFileAbURLs]);

      extURLCount += jsFileURLs.size;
      console.log(`Found ${jsFileURLs.size} URLs in ${js_file}`);
          
      const encodedURL = encodeURIComponent(js_file);
          
      await new Promise<void>((resolve) => {
        chrome.storage.local.get("URL-PARSER", (result) => {
          const urlParser = result["URL-PARSER"] || {};
          const currentURL = urlParser["current"];
            
          if (!urlParser[currentURL].externalJSFiles) {
            urlParser[currentURL].externalJSFiles = {};
          }
          urlParser[currentURL].externalJSFiles[encodedURL] = Array.from(jsFileURLs);

          chrome.storage.local.set({ "URL-PARSER": urlParser }, () => {
            console.log("Saved endpoints from external JS files.");
            updateJSFileCount(js_files.length);
            resolve();
          });
        });
      });
      } catch(error) {
          console.error('Error fetching script:', error);
        }
    }
  }

  console.log("Total URLs found in external JS files: " + extURLCount);
  updateJSFileCount(js_files.length);
}

async function fetch_file(file: string): Promise<string> {
  const response = await fetch(file);
  const js_code = await response.text();
  return js_code;
}

function updateURLCount(count: number) {
  return new Promise<void>((resolve) => {
  chrome.runtime.sendMessage({ action: 'updateURLCount', count }, () => {
  resolve();
  });
});
}

function updateJSFileCount(count: number) {
  return new Promise<void>((resolve) => {
    chrome.runtime.sendMessage({ action: 'updateJSFileCount', count }, () => {
      resolve();
    });
  });
}

export function countURLs() {
  chrome.storage.local.get('URL-PARSER', (result) => {
    const urlParser = result['URL-PARSER'] || {};
    const currentURL = urlParser["current"];
    if (currentURL && urlParser[currentURL]) {
      const pageURLs = urlParser[currentURL].currPage.length;
      const externalURLs = Object.values(urlParser[currentURL].externalJSFiles)
        .reduce((total, urls) => (total as number) + (urls as string[]).length, 0);
      updateURLCount(pageURLs + externalURLs);
    }
  });
}

export function countJSFiles() {
  const scriptTags = document.getElementsByTagName('script');
  const jsFileCount = Array.from(scriptTags).filter(script => script.src).length;
  updateJSFileCount(jsFileCount);
}