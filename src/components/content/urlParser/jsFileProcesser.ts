// src/components/content/urlParser/jsFileProcessor.ts

import { URLExtractor } from './urlExtractor';
import { URLClassifier } from './urlClassification';
import { StorageManager } from './storageManager';

export class JSFileProcessor {
  private urlExtractor: URLExtractor;
  private urlClassifier: URLClassifier;
  private storageManager: StorageManager;
  private parsedJSFiles: Set<string> = new Set();
  private successfullyFetchedFiles: Set<string> = new Set();
  private failedFetchAttempts: Map<string, number> = new Map();

  private readonly MAX_RETRY_ATTEMPTS = 3;
  private readonly FETCH_TIMEOUT = 10000; // 10 seconds
  private readonly MAX_FILES_TO_PROCESS = 300;
  private readonly MAX_PROCESSING_TIME = 120000; // 2 minutes

  constructor(urlExtractor: URLExtractor, urlClassifier: URLClassifier, storageManager: StorageManager) {
    this.urlExtractor = urlExtractor;
    this.urlClassifier = urlClassifier;
    this.storageManager = storageManager
  }

  async processJSFiles(jsFiles: string[]): Promise<void> {
    const processingStart = Date.now();
    let lastLogTime = processingStart;

    while (this.parsedJSFiles.size < jsFiles.length &&
           this.parsedJSFiles.size < this.MAX_FILES_TO_PROCESS &&
           (Date.now() - processingStart) < this.MAX_PROCESSING_TIME) {
      
      const unparsedFiles = jsFiles
        .filter(file => !this.parsedJSFiles.has(file) && 
                        (!this.failedFetchAttempts.has(file) || 
                         this.failedFetchAttempts.get(file)! < this.MAX_RETRY_ATTEMPTS))
        .slice(0, this.MAX_FILES_TO_PROCESS - this.parsedJSFiles.size);
      
      for (const jsFile of unparsedFiles) {
        try {
          console.log(`Processing file: ${jsFile}`);
          await this.processJSFile(jsFile);
        } catch (error) {
          console.error(`Error processing file ${jsFile}:`, error);
        }

        // Log progress every 5 seconds
        if (Date.now() - lastLogTime > 5000) {
          console.log(`Processed ${this.parsedJSFiles.size} out of ${jsFiles.length} JS files. ${this.successfullyFetchedFiles.size} successful, ${this.failedFetchAttempts.size} failed.`);
          lastLogTime = Date.now();
        }

        // Add a small delay between files to avoid overwhelming the browser
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log("Final statistics:");
    console.log(`Total JS files found: ${jsFiles.length}`);
    console.log(`Files processed: ${this.parsedJSFiles.size}`);
    console.log(`Successfully fetched: ${this.successfullyFetchedFiles.size}`);
    console.log(`Failed to fetch: ${this.failedFetchAttempts.size}`);
    console.log(`Processing time: ${(Date.now() - processingStart) / 1000} seconds`);
  }

  private async processJSFile(jsFile: string): Promise<void> {
    if (!this.parsedJSFiles.has(jsFile)) {
      try {
        console.log(`Fetching file: ${jsFile}`);
        const code = await this.fetchWithTimeout(jsFile);
        this.successfullyFetchedFiles.add(jsFile);
        
        const jsFileURLs = this.urlExtractor.extractURLsFromJSCode(code);
        console.log(`Found ${jsFileURLs.size} URLs in ${jsFile}`);
        
        // Classify the URLs
        const classifiedURLs = this.urlClassifier.classifyMultipleURLs(Array.from(jsFileURLs));

        // Save classified URLs to storage
        await this.storageManager.saveExternalJSURLs(jsFile, classifiedURLs);

        this.parsedJSFiles.add(jsFile);
        console.log(`Successfully processed: ${jsFile}`);
      } catch (error) {
        console.error(`Error processing script: ${jsFile}`, error);
        const attempts = (this.failedFetchAttempts.get(jsFile) || 0) + 1;
        this.failedFetchAttempts.set(jsFile, attempts);
      }
    } else {
      console.log(`File already processed: ${jsFile}`);
    }
  }
  
  private async fetchWithTimeout(file: string): Promise<string> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), this.FETCH_TIMEOUT);

    try {
      const response = await fetch(file, { signal: controller.signal });
      clearTimeout(id);
      return await response.text();
    } catch (error) {
      clearTimeout(id);
      throw error;
    }
  }
}