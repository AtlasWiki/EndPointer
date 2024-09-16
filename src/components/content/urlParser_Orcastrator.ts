// src/components/content/urlParser_Orchestrator.ts

import { URLExtractor } from './urlParser/urlExtractor';
import { URLClassifier } from './urlParser/urlClassification';
import { RegexManager } from './urlParser/regexManager';
import { JSFileProcessor } from './urlParser/jsFileProcesser';
import { StorageManager } from './urlParser/storageManager';
import { DOMObserver } from './urlParser/DOMobserver';
import { getState, updateURLCount, updateJSFileCount } from './stateManager';
import { sendURLCountUpdate, sendJSFileCountUpdate } from './messageHandler';


export class URLParserOrchestrator {
  private urlExtractor: URLExtractor;
  private urlClassifier: URLClassifier;
  private regexManager: RegexManager;
  private jsFileProcessor: JSFileProcessor;
  private storageManager: StorageManager;
  private domObserver: DOMObserver;
  private isEnabled: boolean = false;

  constructor() {
    this.urlExtractor = new URLExtractor();
    this.regexManager = new RegexManager();
    this.storageManager = new StorageManager();
    this.urlClassifier = new URLClassifier(this.regexManager);
    this.jsFileProcessor = new JSFileProcessor(this.urlExtractor, this.urlClassifier, this.storageManager)
    this.domObserver = new DOMObserver();
  }

  async initialize(): Promise<void> {
    try {
      this.regexManager = new RegexManager();
      await this.regexManager.initialize('./urlParser/urlTypes.json');
      this.urlClassifier = new URLClassifier(this.regexManager);
      this.jsFileProcessor = new JSFileProcessor(this.urlExtractor, this.urlClassifier, this.storageManager);
      this.isEnabled = await getState('urlParser') as boolean;
      console.log("URL Parser Orchestrator initialized successfully.");
    } catch (error) {
      console.error("Failed to initialize URL Parser Orchestrator:", error);
      throw error;
    }
  }

  handleStateChange(newState: boolean): void {
    this.isEnabled = newState;
    if (this.isEnabled) {
      this.startParsing();
    } else {
      this.stopParsing()
    }
  }

  //private function to start observer and the parser
  private startParsing(): void{
    this.parseURLs();
    this.domObserver.startObserving(this.handleNewScripts.bind(this));
  }

  //private function to turn off observer and parser
  private stopParsing(): void {
    this.domObserver.stopObserving();
  }

  private async handleNewScripts(newJsFiles: string[]): Promise<void>{
    for (const jsFile of newJsFiles){
      await this.jsFileProcessor.processJSFiles([jsFile]);
    }
    this.countURLs();
    this.countJSFiles();
  }

  async parseURLs(): Promise<void> {
    if (!this.isEnabled) {
      console.log("URL parsing is disabled");
      return;
    }

    console.log("Starting url parsing process...");
    try {
      await this.parseCurrentPage();
      await this.parseExternalFiles();
      this.countURLs();
      console.log("URL parsing process completed");
    } catch (error) {
      console.log("Eorror during the URL parsing process", error);
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
    this.storageManager.countURLs().then(count => {
      updateURLCount(count);
      sendURLCountUpdate(count);
    });
  }
   
  countJSFiles(): void {
    const count = this.domObserver.getJSFileCount();
    updateJSFileCount(count);
    sendJSFileCountUpdate(count);
  }
}

export const urlParserOrchestrator = new URLParserOrchestrator();