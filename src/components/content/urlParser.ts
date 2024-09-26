import browser from 'webextension-polyfill'
import { ExtensionState } from '../sharedTypes/message_types';
import { REL_REGEX, ABS_REGEX } from '../sharedTypes/regex_constants';

let parsedJSFiles: Set<string> = new Set();
let successfullyFetchedFiles: Set<string> = new Set();
let failedFetchAttempts: Map<string, number> = new Map();
const MAX_RETRY_ATTEMPTS = 3;
const FETCH_TIMEOUT = 3000; // 3 seconds
const MAX_FILES_TO_PROCESS = 300; // Set a hard limit on the number of files to process
const MAX_PROCESSING_TIME = 1000; // 1 second
let CONCURRENT_REQUESTS = 1; // Default to 1, will be updated from storage

interface URLParserStorageItem {
  currPage: string[];
  externalJSFiles: {
    [key: string]: string[];
  };
}

interface URLParserStorage {
  [key: string]: URLParserStorageItem;
}

interface URLParserStorageWithCurrent {
  current: string;
  storage: URLParserStorage;
}

function isURLParserStorageItem(item: any): item is URLParserStorageItem {
  return item && typeof item === 'object' && Array.isArray(item.currPage) && typeof item.externalJSFiles === 'object';
}

async function getConcurrencySetting() {
  const result = await browser.storage.local.get('requests');
  CONCURRENT_REQUESTS = (result.requests as number) || 1;
  console.log(`Loading setting: ${CONCURRENT_REQUESTS} concurrent requests`);
}

async function isInScope(host: string): Promise<boolean> {
  const result = await browser.storage.local.get('scope');
  const scopes: string[] = result.scope as string[] || [];
  const baseDomain: string = host.split('.').slice(-2).join('.');
  return scopes.length === 0 || scopes.some(scope => baseDomain === scope.toLowerCase() || host === scope.toLowerCase());
}

export async function parseURLs(): Promise<void> {
  await getConcurrencySetting();
  console.log("Checking Scope...");
  const host: string = document.location.hostname;
  if (await isInScope(host)) {
    updateProgress(0, 'Parsing...');
    console.log("Parsing URLs...");
    await parse_curr_page();
    await parse_external_files();
    updateProgress(100, 'Done');
    console.log("Parsing completed");
    setTimeout(removeProgressBar, 2000);
  } else {
    removeProgressBar(); // Remove progress bar if not in scope
    console.log("URL not in scope, skipping parsing");
  }
}

export function parseURLsManually(): void {
  parsedJSFiles = new Set();
  parseURLs();
}

async function parse_curr_page() {
  const pageContent = document.documentElement.outerHTML;
  const abPageURLs = Array.from(pageContent.matchAll(ABS_REGEX), match => match[1]);
  const relPageURLs = Array.from(pageContent.matchAll(REL_REGEX), match => match[1]);
  const pageURLs = new Set([...abPageURLs, ...relPageURLs]);

  const currPage = encodeURIComponent(document.location.href);
  console.log("URLs from current page: ", pageURLs);

  const result = await browser.storage.local.get('URL-PARSER');
  const urlParser: URLParserStorageWithCurrent = (result['URL-PARSER'] as URLParserStorageWithCurrent) || { current: currPage, storage: {} };
  if (!urlParser.storage[currPage] || !isURLParserStorageItem(urlParser.storage[currPage])) {
    urlParser.storage[currPage] = { currPage: [], externalJSFiles: {} };
  }

  urlParser.current = currPage;
  urlParser.storage[currPage].currPage = Array.from(pageURLs);

  await browser.storage.local.set({ 'URL-PARSER': urlParser });
  console.log("Saved endpoints from the current page.");
  await updateURLCount(pageURLs.size);
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
    
    // Process files concurrently in batches
    for (let i = 0; i < unparsedFiles.length; i += CONCURRENT_REQUESTS) {
      const batch = unparsedFiles.slice(i, i + CONCURRENT_REQUESTS);
      await Promise.all(batch.map(js_file => processJSFile(js_file)));

      // Log progress every 300 milliseconds
      if (Date.now() - lastLogTime > 200 || i + CONCURRENT_REQUESTS >= unparsedFiles.length) {
        const progress = (parsedJSFiles.size / js_files.length) * 100;
        console.log(`Processed ${parsedJSFiles.size} out of ${js_files.length} JS files. ${successfullyFetchedFiles.size} successful, ${failedFetchAttempts.size} failed.`);
        updateProgress(progress, `Parsing... (${parsedJSFiles.size}/${js_files.length})`);
        lastLogTime = Date.now();
      }
    }
  }

  observer.disconnect();

  console.log("Final statistics:");
  console.log(`Total JS files found: ${js_files.length}`);
  console.log(`Files processed: ${parsedJSFiles.size}`);
  console.log(`Successfully fetched: ${successfullyFetchedFiles.size}`);
  console.log(`Failed to fetch: ${failedFetchAttempts.size}`);
  console.log(`Processing time: ${(Date.now() - processingStart) / 1000} seconds`);
  
  await updateJSFileCount(successfullyFetchedFiles.size);
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
  const result = await browser.storage.local.get("URL-PARSER");
  const urlParser: URLParserStorageWithCurrent = (result["URL-PARSER"] as URLParserStorageWithCurrent) || { current: encodedURL, storage: {} };
  const currentURL = urlParser.current;
  
  if (!urlParser.storage[currentURL] || !isURLParserStorageItem(urlParser.storage[currentURL])) {
    urlParser.storage[currentURL] = { currPage: [], externalJSFiles: {} };
  }
  
  urlParser.storage[currentURL].externalJSFiles[encodedURL] = urls;

  await browser.storage.local.set({ "URL-PARSER": urlParser });
  console.log(`Saved ${urls.length} endpoints from external JS file: ${encodedURL}`);
}

async function updateURLCount(count: number) {
  await browser.runtime.sendMessage({ action: 'updateURLCount', count });
}

async function updateJSFileCount(count: number) {
  await browser.runtime.sendMessage({ action: 'updateJSFileCount', count });
}

export async function countURLs(): Promise<number> {
  const result = await browser.storage.local.get('URL-PARSER');
  const urlParser: URLParserStorageWithCurrent = (result['URL-PARSER'] as URLParserStorageWithCurrent) || { current: '', storage: {} };
  const currentURL = urlParser.current;
  if (currentURL && urlParser.storage[currentURL] && isURLParserStorageItem(urlParser.storage[currentURL])) {
    const pageURLs = urlParser.storage[currentURL].currPage.length;
    const externalURLs = Object.values(urlParser.storage[currentURL].externalJSFiles)
      .reduce((total, urls) => total + urls.length, 0);
    return pageURLs + externalURLs;
  }
  return 0;
}

export async function countJSFiles(): Promise<number> {
  const scriptTags = document.getElementsByTagName('script');
  return Array.from(scriptTags).filter(script => script.src).length;
}

interface ProgressBarElement extends HTMLDivElement {
  setProgress: (progress: number) => void;
  setStatus: (status: string) => void;
}

function createProgressBar(): ProgressBarElement {
  const container = document.createElement('div') as ProgressBarElement;
  container.id = 'parsing-progress-container';
  container.style.cssText = `
    position: fixe  d;
    top: 0;
    left: 0;
    right: 0;
    background-color: #353535;
    padding: 25px;
    z-index: 9999;
    font-family: Arial, sans-serif;
  `;

  const statusText = document.createElement('div');
  statusText.style.cssText = `
    text-align: center;
    margin-bottom: 5px;
    font-weight: bold;
    font-size: 2em;
    color: white;
  `;

  const progressBar = document.createElement('div');
  progressBar.style.cssText = `
    height: 10px;
    background-color: #e5e7eb;
    border-radius: 5px;
    overflow: hidden;
  `;

  const progressFill = document.createElement('div');
  progressFill.style.cssText = `
    height: 100%;
    width: 0%;
    background-color: #3b82f6;
    transition: width 0.3s ease-in-out;
  `;

  progressBar.appendChild(progressFill);
  container.appendChild(statusText);
  container.appendChild(progressBar);

  container.setProgress = (progress: number) => {
    progressFill.style.width = `${Math.min(100, Math.max(0, progress))}%`;
  };

  container.setStatus = (status: string) => {
    statusText.textContent = status;
  };

  document.body.insertBefore(container, document.body.firstChild);
  return container;
}

function updateProgress(progress: number, status: string): void {
  let progressBar = document.getElementById('parsing-progress-container') as ProgressBarElement;
  if (!progressBar) {
    progressBar = createProgressBar();
  }
  progressBar.setProgress(progress);
  progressBar.setStatus(status);
}

function removeProgressBar(): void {
  const progressBar = document.getElementById('parsing-progress-container');
  if (progressBar) {
    progressBar.remove();
  }
}