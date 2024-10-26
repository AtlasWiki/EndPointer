
import { StorageService } from './parser/storage.service';
import { PageParser } from './parser/parser.page';
import { JSFileProcessor } from './parser/parser.fileprocessor';
import { URLParserStorage } from '../constants/message_types';
import { URLParserStorageItem } from './parser/parser.types';
import { ProgressBar } from '../components/ProgressBar';
import browser from 'webextension-polyfill'


export class Parser {
  private pageParser: PageParser;
  private jsFileProcessor: JSFileProcessor;
  private progressBar: ProgressBar;
  private scriptFiles: string[] = [];

  constructor() {
    this.pageParser = new PageParser();
    this.progressBar = new ProgressBar();
    this.jsFileProcessor = new JSFileProcessor(this.progressBar);  // Pass the instance
  }

  async parseURLs(): Promise<void> {
    await this.jsFileProcessor.setConcurrentRequests();
    
    const host: string = document.location.hostname;
    if (await StorageService.isInScope(host)) {
      this.progressBar.update(0, 'Parsing...');
      
      try {
        await this.pageParser.parseCurrentPage();
        await this.parseExternalFiles();
        this.progressBar.update(100, 'Done');
      } catch (error) {
        console.error("Error during parsing:", error);
        this.progressBar.update(100, 'Error occurred');
      } finally {
        setTimeout(() => this.progressBar.remove(), 2000);
      }
    }
  }

  private async parseExternalFiles(): Promise<void> {
    // Get initial script files
    this.scriptFiles = this.pageParser.getScriptFiles();
    
    // Setup observer for new scripts
    const observer = this.pageParser.setupScriptObserver((newScripts) => {
      this.scriptFiles = [...this.scriptFiles, ...newScripts];
    });

    try {
      await this.jsFileProcessor.processBatch(this.scriptFiles);
    } finally {
      observer.disconnect();
    }
  }

  async reparse(): Promise<void> {
    this.jsFileProcessor = new JSFileProcessor(this.progressBar);  // Pass the existing progressBar instance
    return this.parseURLs();
  }

  static async countURLs(): Promise<number> {
    const result = await browser.storage.local.get('URL-PARSER');
    const urlParser = result['URL-PARSER'] as URLParserStorage || {};
    const currentURL = urlParser.current;
    
    if (currentURL && urlParser[currentURL]) {
      const currentPageData = urlParser[currentURL] as URLParserStorageItem;
      const pageURLs = currentPageData.currPage.length;
      const externalURLs = Object.values(currentPageData.externalJSFiles)
        .reduce((total, urls) => total + (urls as string[]).length, 0);
      return pageURLs + externalURLs;
    }
    return 0;
  }

  static async countJSFiles(): Promise<number> {
    const scriptTags = document.getElementsByTagName('script');
    return Array.from(scriptTags).filter(script => script.src).length;
  }
}