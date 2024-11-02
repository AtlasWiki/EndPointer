import { URLClassifier } from "./classification/classifer";
import { URLParserStorage } from "../constants/message_types";
import { URLParserStorageItem } from "../content/parser/parser.types";
import browser from 'webextension-polyfill';
import { ClassifierService } from "./classification/classifiers/classifier.service";

export class ClassificationManager {
    private classifierService: ClassifierService;
    private processedUrls: Set<string> = new Set();

    constructor() {
        this.classifierService = new ClassifierService(new URLClassifier());
        this.initializeStorageListener();
        
        this.processStoredUrls().catch(error => {
            console.error('Error in initial URL processing:', error);
        });
    }

    private initializeStorageListener(): void {
        browser.storage.onChanged.addListener((changes, areaName) => {
            if (areaName === 'local' && changes['URL-PARSER']) {
                this.handleStorageChange(changes['URL-PARSER'])
                    .catch(error => {
                        console.error('Error handling storage change:', error);
                    });
            }
        });
    }

    private async handleStorageChange(change: browser.Storage.StorageChange): Promise<void> {
        const newValue = change.newValue as URLParserStorage;
        const oldValue = change.oldValue as URLParserStorage || {};

        if (newValue && JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
            await this.processStoredUrls();
        }
    }

    private async processStoredUrls(): Promise<void> {
        try {
            const storage = await browser.storage.local.get('URL-PARSER');
            const urlParser = storage['URL-PARSER'] as URLParserStorage || {};
            let hasUpdates = false;

            for (const [pageUrl, pageData] of Object.entries(urlParser)) {
                if (pageUrl === 'current') continue;

                const typedPageData = pageData as URLParserStorageItem;
                if (!typedPageData) continue;

                const unprocessedUrls = [
                    ...typedPageData.currPage.filter(item => !this.processedUrls.has(item.url)),
                    ...Object.values(typedPageData.externalJSFiles)
                        .flat()
                        .filter(item => !this.processedUrls.has(item.url))
                ];

                if (unprocessedUrls.length > 0) {
                    try {
                        
                        typedPageData.currPage = typedPageData.currPage.map(item => ({
                            url: item.url,
                            classifications: this.processedUrls.has(item.url) ? 
                                item.classifications : 
                                this.classifierService.classifyUrl(item.url)
                        }));

                        
                        Object.keys(typedPageData.externalJSFiles).forEach(key => {
                            typedPageData.externalJSFiles[key] = typedPageData.externalJSFiles[key].map(item => ({
                                url: item.url,
                                classifications: this.processedUrls.has(item.url) ? 
                                    item.classifications : 
                                    this.classifierService.classifyUrl(item.url)
                            }));
                        });

                        
                        unprocessedUrls.forEach(item => this.processedUrls.add(item.url));
                        hasUpdates = true;

                        urlParser[pageUrl] = typedPageData;
                        console.log(`Classified ${unprocessedUrls.length} new URLs for page: ${pageUrl}`);
                    } catch (error) {
                        console.error(`Error classifying URLs for page ${pageUrl}:`, error);
                        continue;
                    }
                }
            }

            if (hasUpdates) {
                await browser.storage.local.set({ 'URL-PARSER': urlParser });
                console.log('Successfully updated URL-PARSER storage with new classifications');
            }
        } catch (error) {
            console.error('Error processing URLs for classification:', error);
            throw error;
        }
    }

    // Placeholder for clearing processed URLs
    private clearProcessedUrls(): void {
        // Will be implemented later
        this.processedUrls.clear();
        console.log('Cleared processed URLs cache');
    }
}