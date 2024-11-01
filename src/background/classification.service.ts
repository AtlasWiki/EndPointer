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
        
        // Initial processing of stored URLs
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

                
                const allUrls = [
                    ...typedPageData.currPage,
                    ...Object.values(typedPageData.externalJSFiles).flat()
                ].filter(url => !this.processedUrls.has(url));

                if (allUrls.length > 0) {
                    try {
                        
                        const newClassifications = this.classifierService.classifyUrls(allUrls);

                        
                        urlParser[pageUrl] = {
                            ...typedPageData,
                            classifications: {
                                ...typedPageData.classifications,
                                ...newClassifications
                            }
                        };

                        
                        allUrls.forEach(url => this.processedUrls.add(url));
                        hasUpdates = true;

                        console.log(`Classified ${allUrls.length} new URLs for page: ${pageUrl}`);
                    } catch (error) {
                        console.error(`Error classifying URLs for page ${pageUrl}:`, error);
                        
                        continue;
                    }
                }
            }

            if (hasUpdates) {
                try {
                    await browser.storage.local.set({ 'URL-PARSER': urlParser });
                    console.log('Successfully updated URL-PARSER storage with new classifications');
                } catch (error) {
                    console.error('Error updating storage:', error);
                    throw error; 
                }
            }
        } catch (error) {
            console.error('Error processing URLs for classification:', error);
            throw error; 
        }
    }
}