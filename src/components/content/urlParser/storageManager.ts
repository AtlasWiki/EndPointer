// src/components/content/urlParser/storageManager.ts

import { URLCategory } from '../../sharedTypes/urlTypes_enums';

interface ClassifiedURL {
  url: string;
  categories: URLCategory[];
  score: number;
}

interface URLParserStorage {
  [key: string]: {
    currPage: ClassifiedURL[];
    externalJSFiles: {
      [jsFile: string]: ClassifiedURL[];
    };
  };
  current?: string | any; //Type declartion for intitlization? 
}

export class StorageManager {
  private readonly STORAGE_KEY = 'URL-PARSER';

  /**
   * Saves classified URLs from the current page to storage.
   * @param classifiedURLs Array of classified URLs from the current page.
   */
  async saveCurrentPageURLs(classifiedURLs: ClassifiedURL[]): Promise<void> {
    const currentURL = encodeURIComponent(document.location.href);
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(this.STORAGE_KEY, (result) => {
        const urlParser: URLParserStorage = result[this.STORAGE_KEY] || {};
        if (!urlParser[currentURL]) {
          urlParser[currentURL] = { currPage: [], externalJSFiles: {} };
        }
        urlParser[currentURL].currPage = classifiedURLs;
        urlParser["current"] = currentURL as string;

        chrome.storage.local.set({ [this.STORAGE_KEY]: urlParser }, () => {
          if (chrome.runtime.lastError) {
            console.error("Error saving current page URLs:", chrome.runtime.lastError);
            reject(chrome.runtime.lastError);
          } else {
            console.log(`Saved ${classifiedURLs.length} classified endpoints from the current page.`);
            resolve();
          }
        });
      });
    });
  }

  /**
   * Saves classified URLs from an external JS file to storage.
   * @param jsFile The URL of the JS file.
   * @param classifiedURLs Array of classified URLs from the JS file.
   */
  async saveExternalJSURLs(jsFile: string, classifiedURLs: ClassifiedURL[]): Promise<void> {
    const currentURL = encodeURIComponent(document.location.href);
    const encodedJSFile = encodeURIComponent(jsFile);
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(this.STORAGE_KEY, (result) => {
        const urlParser: URLParserStorage = result[this.STORAGE_KEY] || {};
        if (!urlParser[currentURL]) {
          urlParser[currentURL] = { currPage: [], externalJSFiles: {} };
        }
        urlParser[currentURL].externalJSFiles[encodedJSFile] = classifiedURLs;

        chrome.storage.local.set({ [this.STORAGE_KEY]: urlParser }, () => {
          if (chrome.runtime.lastError) {
            console.error("Error saving external JS URLs:", chrome.runtime.lastError);
            reject(chrome.runtime.lastError);
          } else {
            console.log(`Saved ${classifiedURLs.length} classified endpoints from external JS file: ${jsFile}`);
            resolve();
          }
        });
      });
    });
  }

  /**
   * Counts the total number of URLs stored for the current page and its external JS files.
   */
  countURLs(): void {
    chrome.storage.local.get(this.STORAGE_KEY, (result) => {
      const urlParser: URLParserStorage = result[this.STORAGE_KEY] || {};
      const currentURL = urlParser["current"] as string;
      if (currentURL && urlParser[currentURL]) {
        const pageURLs = urlParser[currentURL].currPage.length;
        const externalURLs = Object.values(urlParser[currentURL].externalJSFiles)
          .reduce((total, urls) => total + urls.length, 0);
        const totalURLs = pageURLs + externalURLs;
        console.log(`Total URLs found: ${totalURLs} (Page: ${pageURLs}, External JS: ${externalURLs})`);
        chrome.runtime.sendMessage({ action: 'updateURLCount', count: totalURLs });
      } else {
        console.log("No URLs stored for the current page.");
        chrome.runtime.sendMessage({ action: 'updateURLCount', count: 0 });
      }
    });
  }

  /**
   * Retrieves all stored URLs for the current page.
   * @returns Promise resolving to an object containing all stored URLs.
   */
  async getStoredURLs(): Promise<URLParserStorage | null> {
    return new Promise((resolve) => {
      chrome.storage.local.get(this.STORAGE_KEY, (result) => {
        const urlParser: URLParserStorage = result[this.STORAGE_KEY];
        if (urlParser && urlParser["current"]) {
          resolve(urlParser);
        } else {
          resolve(null);
        }
      });
    });
  }
}