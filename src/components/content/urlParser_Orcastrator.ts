// src/components/content/urlParser_Orchestrator.ts

import { URLExtractor } from './urlParser/urlExtractor';
import { URLClassifier } from './urlParser/urlClassification';
import { RegexManager } from './urlParser/regexManager';
import { JSFileProcessor } from './urlParser/jsFileProcesser';
import { StorageManager } from './urlParser/storageManager';
import { DOMObserver } from './urlParser/DOMobserver';

export class URLParserOrchestrator {
  private urlExtractor: URLExtractor;
  private urlClassifier: URLClassifier;
  private regexManager: RegexManager;
  private jsFileProcessor: JSFileProcessor;
  private storageManager: StorageManager;
  private domObserver: DOMObserver;

  constructor() {
    this.urlExtractor = new URLExtractor();
    this.regexManager = new RegexManager();
    this.storageManager = new StorageManager();
    this.urlClassifier = new URLClassifier(this.regexManager);
    this.jsFileProcessor = new JSFileProcessor(this.urlExtractor, this.urlClassifier, this.storageManager)
    this.domObserver = new DOMObserver();
  }

  async initialize(regexPatternPath: string): Promise<void> {
    try {
      await this.regexManager.loadPatterns();
      this.urlClassifier = new URLClassifier(this.regexManager);
      this.jsFileProcessor = new JSFileProcessor(this.urlExtractor, this.urlClassifier, this.storageManager);
      console.log("URL Parser Orchestrator initialized successfully.");
    } catch (error) {
      console.error("Failed to initialize URL Parser Orchestrator:", error);
      throw error;
    }
  }

  private startObserving(): void{
    this.domObserver.startObserving(async (newJsFiles) => {
      console.log(`Found ${newJsFiles.length} new script(s)`);

      for (const jsFile of newJsFiles) {
        try {
          const code = await this.fetchJSFile(jsFile);
          const newUrls = this.urlExtractor.extractURLsFromJSCode(code);
          const classifiedNewURLs = this.urlClassifier.classifyMultipleURLs(Array.from(newUrls));
          await this.storageManager.saveExternalJSURLs(jsFile, classifiedNewURLs);
        } catch (error) {
          console.error(`error processing new script ${jsFile}: `, error);
        }
      }

      this.countURLs();
    });
  }

  private async fetchJSFile(url: string): Promise<string>{
    const response = await fetch(url);
    return response.text();
  }

  async parseURLs(): Promise<void> {
    console.log("Starting URL parsing process...");
    
    try {
      await this.parseCurrentPage();
      await this.parseExternalFiles();
      this.countURLs();
      console.log("URL parsing process completed.");
    } catch (error) {
      console.error("Error during URL parsing process:", error);
    }
  }

  private async parseCurrentPage(): Promise<void> {
    console.log("Parsing URLs from current page...");
    const pageURLs = this.urlExtractor.extractURLsFromPage();
    const classifiedURLs = this.urlClassifier.classifyMultipleURLs(Array.from(pageURLs));
    await this.storageManager.saveCurrentPageURLs(classifiedURLs);
    console.log(`Parsed and classified ${classifiedURLs.length} URLs from current page.`);
  }

  private async parseExternalFiles(): Promise<void> {
    console.log("Parsing external JavaScript files...");
    const jsFiles = this.urlExtractor.extractJSFilesFromPage();
    await this.jsFileProcessor.processJSFiles(jsFiles);
    console.log(`Completed parsing ${jsFiles.length} external JavaScript files.`);
  }

  countURLs(): void {
    this.storageManager.countURLs();
  }

  countJSFiles(): void {
    this.urlExtractor.countJSFiles();
  }
}

export const urlParserOrchestrator = new URLParserOrchestrator();