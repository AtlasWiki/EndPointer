import { BaseClassifier } from "./classifier.base";
import { IClassifierService } from "./classifier.interface";
import type {ClassificationResults, URLClassification} from './classifier.types';
import type { URLParserStorage, URLParserStorageItem } from "../../../constants/message_types";
import browser from 'webextension-polyfill';


export class ClassifierService implements IClassifierService {
    private classifier: BaseClassifier<URLClassification>;

    constructor(classifier: BaseClassifier<URLClassification>) {
        this.classifier = classifier;
    }

    classifyUrl(url: string): URLClassification {
        return this.classifier.classify(url);
    }

    async updateStorageWithClassifications(currentURL: string): Promise<void> {
        const storage = await browser.storage.local.get('URL-PARSER');
        const urlParser = storage['URL-PARSER'] as URLParserStorage || {};

        if (currentURL && urlParser[currentURL]) {
            const currentPageData = urlParser[currentURL] as URLParserStorageItem;
            
            // Update currPage URLs with classifications
            currentPageData.currPage = currentPageData.currPage.map(item => ({
                url: item.url,
                classifications: this.classifyUrl(item.url)
            }));

            // Update externalJSFiles with classifications
            Object.entries(currentPageData.externalJSFiles).forEach(([key, files]) => {
                currentPageData.externalJSFiles[key] = files.map(item => ({
                    url: item.url,
                    classifications: this.classifyUrl(item.url)
                }));
            });

            await browser.storage.local.set({
                'URL-PARSER': {
                    ...urlParser,
                    [currentURL]: currentPageData
                }
            });
        }
    }

    async getURLClassifications(url?: string): Promise<Record<string, URLClassification> | null> {
        const storage = await browser.storage.local.get('URL-PARSER');
        const urlParser = storage['URL-PARSER'] as URLParserStorage;
        const currentURL = url || urlParser.current;

        if (currentURL && urlParser[currentURL]) {
            const currentPageData = urlParser[currentURL] as URLParserStorageItem;
            const classifications: Record<string, URLClassification> = {};
            
            // Collect all URL classifications
            currentPageData.currPage.forEach(item => {
                classifications[item.url] = item.classifications;
            });

            Object.values(currentPageData.externalJSFiles).flat().forEach(item => {
                classifications[item.url] = item.classifications;
            });

            return classifications;
        }
        return null;
    }
}