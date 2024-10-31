import { BaseClassifier } from "./classifier.base";
import { IClassifierService } from "./classifier.interface";
import type {ClassificationResults, URLClassification, URLParserStorageItem } from './classifier.types';
import type { URLParserStorage } from "../../../constants/message_types";
import browser from 'webextension-polyfill';


export class ClassifierService implements IClassifierService {
    private classifier: BaseClassifier<URLClassification>;

    constructor(classifier: BaseClassifier<URLClassification>) {
        this.classifier = classifier;
    }

    classifyUrls(urls: string[]): Record<string, ClassificationResults<URLClassification>> {
        const classifications: Record<string, ClassificationResults<URLClassification>> = {};

        for (const url of urls) {
            classifications[url] = this.classifier.classify(url);
        }

        return classifications;
    }

     async updateStorageWithClassifications(currentURL: string): Promise<void> {
        const storage = await browser.storage.local.get('URL-PARSER');
        const urlParser = storage['URL-PARSER'] as URLParserStorage || {};

        if (currentURL && urlParser[currentURL]) {
            const currentPageData = urlParser[currentURL] as URLParserStorageItem;

            const allUrls = [
                ...currentPageData.currPage,
                ...Object.values(currentPageData.externalJSFiles).flat()
            ];

            currentPageData.classifications = this.classifyUrls(allUrls);
            
            await browser.storage.local.set({
                'URL-PARSER': {
                    ...urlParser,
                    [currentURL]: currentPageData
                }
            });
        }
    }

    async getURLClassifications(url?: string): Promise<Record<string, ClassificationResults<URLClassification>> | null> {
        const storage = await browser.storage.local.get('URL-PARSER');
        const urlParser = storage['URL-PARSER'] as URLParserStorage;
        const currentURL = url || urlParser.current;

        if (currentURL && urlParser[currentURL]) {
            const currentPageData = urlParser[currentURL] as URLParserStorageItem;
            return currentPageData.classifications || null;
        }
        return null;
    }
}