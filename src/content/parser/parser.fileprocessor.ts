import { PARSER_CONFIG } from './parser.config';
import { StorageService } from './storage.service';
import { REL_REGEX, ABS_REGEX } from '../../constants/regex_constants';
import { ProgressBar } from '../../components/ProgressBar';

export class JSFileProcessor {
  private parsedJSFiles: Set<string> = new Set();
  private successfullyFetchedFiles: Set<string> = new Set();
  private failedFetchAttempts: Map<string, number> = new Map();
  private concurrentRequests: number = 1;
  private progressBar: ProgressBar;

  constructor(progressBar: ProgressBar) {
    this.progressBar = progressBar;
  }

  async processBatch(js_files: string[]): Promise<void> {
    const processingStart = Date.now();
    let lastLogTime = processingStart;
    const totalFiles = Math.min(js_files.length, PARSER_CONFIG.MAX_FILES_TO_PROCESS);
    let processedFiles = 0;

    while (this.parsedJSFiles.size < js_files.length && 
           this.parsedJSFiles.size < PARSER_CONFIG.MAX_FILES_TO_PROCESS && 
           (Date.now() - processingStart) < PARSER_CONFIG.MAX_PROCESSING_TIME) {
      
      const unparsedFiles = js_files
        .filter(file => !this.parsedJSFiles.has(file) && 
                (!this.failedFetchAttempts.has(file) || 
                 this.failedFetchAttempts.get(file)! < PARSER_CONFIG.MAX_RETRY_ATTEMPTS))
        .slice(0, PARSER_CONFIG.MAX_FILES_TO_PROCESS - this.parsedJSFiles.size);

      for (let i = 0; i < unparsedFiles.length; i += this.concurrentRequests) {
        const batch = unparsedFiles.slice(i, i + this.concurrentRequests);
        await Promise.all(batch.map(js_file => this.processFile(js_file)));

        processedFiles += batch.length;
        const progress = (processedFiles / totalFiles) * 100;

        if (Date.now() - lastLogTime > 100 || processedFiles >= totalFiles) {
          console.log(`Processed ${processedFiles} out of ${totalFiles} JS files. ${this.successfullyFetchedFiles.size} successful, ${this.failedFetchAttempts.size} failed.`);
          this.progressBar.update(progress, `Parsing... (${processedFiles}/${totalFiles})`);  // Call on instance
          lastLogTime = Date.now();
        }
      }
    }

    await StorageService.updateJSFileCount(this.successfullyFetchedFiles.size);
  }

  private async processFile(js_file: string): Promise<void> {
    if (!this.parsedJSFiles.has(js_file)) {
      try {
        const code = await this.fetchWithTimeout(js_file);
        this.successfullyFetchedFiles.add(js_file);
        
        const jsFileRelURLs = Array.from(code.matchAll(REL_REGEX), match => match[1]);
        const jsFileAbURLs = Array.from(code.matchAll(ABS_REGEX), match => match[1]);
        const jsFileURLs = new Set([...jsFileRelURLs, ...jsFileAbURLs]);
        
        const encodedURL = encodeURIComponent(js_file);
        await StorageService.saveToStorage(encodedURL, Array.from(jsFileURLs));

        this.parsedJSFiles.add(js_file);
      } catch (error) {
        const attempts = (this.failedFetchAttempts.get(js_file) || 0) + 1;
        this.failedFetchAttempts.set(js_file, attempts);
      }
    }
  }

  private async fetchWithTimeout(file: string): Promise<string> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), PARSER_CONFIG.FETCH_TIMEOUT);

    try {
      const response = await fetch(file, { signal: controller.signal });
      clearTimeout(id);
      const text = await response.text();
      return text;
    } catch (error) {
      clearTimeout(id);
      throw error;
    }
  }

  async setConcurrentRequests(): Promise<void> {
    this.concurrentRequests = await StorageService.getConcurrencySetting();
  }

  getStats(): { processed: number; successful: number; failed: number } {
    return {
      processed: this.parsedJSFiles.size,
      successful: this.successfullyFetchedFiles.size,
      failed: this.failedFetchAttempts.size
    };
  }
}
