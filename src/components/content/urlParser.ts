import { ExtensionState } from '../sharedTypes/message_types';
import { REL_REGEX, ABS_REGEX } from '../sharedTypes/regex_constants';

let parsedJSFiles: Set<string> = new Set();
let successfullyFetchedFiles: Set<string> = new Set();
let failedFetchAttempts: Map<string, number> = new Map();
const MAX_RETRY_ATTEMPTS = 3;
const FETCH_TIMEOUT = 3000; // 3 seconds
const MAX_FILES_TO_PROCESS = 300; // Set a hard limit on the number of files to process
const MAX_PROCESSING_TIME = 14000; // 12 seconds

export function parseURLs() {
  console.log("Checking Scope...")
  chrome.storage.local.get("scope", (result) => {
    const scopes = result.scope || [];
    const host = document.location.hostname 
    const baseDomain = host.split('.').slice(-2).join('.');
    if (scopes.length === 0){
      console.log("Parsing URLs...");
      parse_curr_page().then(() => parse_external_files());
    }
    else{
      for (let scope of scopes ){
        if (baseDomain === scope.toLowerCase()){
          console.log("Parsing URLs...");
          parse_curr_page().then(() => parse_external_files());
        } else if ( host === scope.toLowerCase()){
          console.log("Parsing URLs...");
          parse_curr_page().then(() => parse_external_files());
        }
      }
    }
  })
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
}

async function parse_external_files() {
  let scriptTags = document.getElementsByTagName('script');
  console.log("Found initial script tags: " + scriptTags.length);

  let js_files = Array.from(scriptTags).filter(script => script.src).map(script => script.src);
  console.log("Initial JS files: " + js_files.length);

  const observer = new MutationObserver((mutations) => {
    for (let mutation of mutations) {
      if (mutation.type === 'childList') {
        const addedScripts = Array.from(mutation.addedNodes)
          .filter((node): node is HTMLScriptElement => 
            node.nodeName === 'SCRIPT' && 
            node instanceof HTMLScriptElement && 
            node.src !== ''
          )
          .map(script => script.src);
        const newFiles = addedScripts.filter(src => !js_files.includes(src));
        if (newFiles.length > 0) {
          console.log(`Found ${newFiles.length} new script(s):`, newFiles);
          js_files = [...js_files, ...newFiles];
        }
      }
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  const processingStart = Date.now();
  let lastLogTime = processingStart;

  while (parsedJSFiles.size < js_files.length && 
         parsedJSFiles.size < MAX_FILES_TO_PROCESS && 
         (Date.now() - processingStart) < MAX_PROCESSING_TIME) {
    
    const unparsedFiles = js_files
      .filter(file => !parsedJSFiles.has(file) && (!failedFetchAttempts.has(file) || failedFetchAttempts.get(file)! < MAX_RETRY_ATTEMPTS))
      .slice(0, MAX_FILES_TO_PROCESS - parsedJSFiles.size);
    
    for (const js_file of unparsedFiles) {
      try {
        console.log(`Processing file: ${js_file}`);
        await processJSFile(js_file);
      } catch (error) {
        console.error(`Error processing file ${js_file}:`, error);
      }

      // Log progress every 5 seconds
      if (Date.now() - lastLogTime > 5000) {
        console.log(`Processed ${parsedJSFiles.size} out of ${js_files.length} JS files. ${successfullyFetchedFiles.size} successful, ${failedFetchAttempts.size} failed.`);
        lastLogTime = Date.now();
      }

      // Add a small delay between files to avoid overwhelming the browser
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  observer.disconnect();

  console.log("Final statistics:");
  console.log(`Total JS files found: ${js_files.length}`);
  console.log(`Files processed: ${parsedJSFiles.size}`);
  console.log(`Successfully fetched: ${successfullyFetchedFiles.size}`);
  console.log(`Failed to fetch: ${failedFetchAttempts.size}`);
  console.log(`Processing time: ${(Date.now() - processingStart) / 1000} seconds`);
  
  updateJSFileCount(successfullyFetchedFiles.size);
}

async function processJSFile(js_file: string) {
  if (!parsedJSFiles.has(js_file)) {
    try {
      console.log(`Fetching file: ${js_file}`);
      const code = await fetchWithTimeout(js_file);
      successfullyFetchedFiles.add(js_file);
      
      const jsFileRelURLs = Array.from(code.matchAll(REL_REGEX), match => match[1]);
      const jsFileAbURLs = Array.from(code.matchAll(ABS_REGEX), match => match[1]);
      const jsFileURLs = new Set([...jsFileRelURLs, ...jsFileAbURLs]);

      console.log(`Found ${jsFileURLs.size} URLs in ${js_file}`);
      
      const encodedURL = encodeURIComponent(js_file);

      console.log(`Saving to storage: ${encodedURL}`);
      await saveToStorage(encodedURL, Array.from(jsFileURLs));

      parsedJSFiles.add(js_file);
      console.log(`Successfully processed and saved: ${js_file}`);
    } catch (error) {
      console.error(`Error processing script: ${js_file}`, error);
      const attempts = (failedFetchAttempts.get(js_file) || 0) + 1;
      failedFetchAttempts.set(js_file, attempts);
    }
  } else {
    console.log(`File already processed: ${js_file}`);
  }
}

async function fetchWithTimeout(file: string): Promise<string> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const response = await fetch(file, { signal: controller.signal });
    clearTimeout(id);
    return await response.text();
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

async function saveToStorage(encodedURL: string, urls: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get("URL-PARSER", (result) => {
      const urlParser = result["URL-PARSER"] || {};
      const currentURL = urlParser["current"];
      
      if (!urlParser[currentURL]) {
        urlParser[currentURL] = { currPage: [], externalJSFiles: {} };
      }
      
      if (!urlParser[currentURL].externalJSFiles) {
        urlParser[currentURL].externalJSFiles = {};
      }

      urlParser[currentURL].externalJSFiles[encodedURL] = urls;

      chrome.storage.local.set({ "URL-PARSER": urlParser }, () => {
        if (chrome.runtime.lastError) {
          console.error("Error saving to storage:", chrome.runtime.lastError);
          reject(chrome.runtime.lastError);
        } else {
          console.log(`Saved ${urls.length} endpoints from external JS file: ${encodedURL}`);
          resolve();
        }
      });
    });
  });
}

function updateURLCount(count: number) {
  chrome.runtime.sendMessage({ action: 'updateURLCount', count });
}

function updateJSFileCount(count: number) {
  chrome.runtime.sendMessage({ action: 'updateJSFileCount', count });
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