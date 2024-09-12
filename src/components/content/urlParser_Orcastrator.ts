// src/components/content/urlParser_Orchestrator.ts

import { URLExtractor } from './urlParser/urlExtractor';
import { URLClassifier } from './urlParser/urlClassification';
import { RegexManager } from './urlParser/regexManager';
import { JSFileProcessor } from './urlParser/jsFileProcesser';
import { StorageManager } from './urlParser/storageManager';

export class URLParserOrchestrator {
  private urlExtractor: URLExtractor;
  private urlClassifier: URLClassifier;
  private regexManager: RegexManager;
  private jsFileProcessor: JSFileProcessor;
  private storageManager: StorageManager;

  constructor() {
    this.urlExtractor = new URLExtractor();
    this.regexManager = new RegexManager();
    this.storageManager = new StorageManager();
    this.urlClassifier = new URLClassifier(this.regexManager);
    this.jsFileProcessor = new JSFileProcessor(this.urlExtractor, this.urlClassifier, this.storageManager)
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