
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
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background-color: #1e2a31; /* Darker background for contrast */
    padding: 15px;
    z-index: 9999;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3); /* Subtle shadow */
    border-bottom: 2px solid #316e7d; /* Bottom border for emphasis */
  `;

  const statusText = document.createElement('div');
  statusText.style.cssText = `
    text-align: center;
    margin-bottom: 5px;
    color: #e0e0e0; /* Lighter color for better visibility */
    font-weight: bold; /* Make text bold */
  `;

  const progressBar = document.createElement('div');
  progressBar.style.cssText = `
    height: 15px; /* Slightly taller for better visibility */
    background-color: #3b4b54; /* Lighter gray background */
    border-radius: 8px; /* Rounder corners */
    overflow: hidden;
  `;

  const progressFill = document.createElement('div');
  progressFill.style.cssText = `
    height: 100%;
    width: 0%;
    background-color: #2ca9b8; /* Brighter color for the fill */
    transition: width 0.4s ease; /* Slightly slower transition */
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
  let progressBar = document.getElementById('parsing-progress-container') as ProgressBarElement | null;
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