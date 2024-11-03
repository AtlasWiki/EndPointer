import browser from 'webextension-polyfill';
import { URLParserStorageWithOptionalCurrent, URLParserStorageItem } from './parser.types';
import { URLClassification } from '../../background/classification/classifiers/classifier.types';
import { decode } from 'punycode';

export class StorageService {
  static async getConcurrencySetting(): Promise<number> {
    const result = await browser.storage.local.get('requests');
    return (result.requests as number) || 1;
  }

  static async isInScope(host: string): Promise<boolean> {
    const result = await browser.storage.local.get('scope');
    const scopes: string[] = result.scope as string[] || [];
    const baseDomain: string = host.split('.').slice(-2).join('.');
    return scopes.length === 0 || scopes.some(scope => 
      baseDomain === scope.toLowerCase() || host === scope.toLowerCase()
    );
  }

  static async saveToStorage(encodedURL: string, urls: string[]): Promise<void> {
    const result = await browser.storage.local.get('URL-PARSER');
    const urlParser = (result['URL-PARSER'] as URLParserStorageWithOptionalCurrent) || {};
    const currentURL = urlParser.current || '';
    const decodedURL = decodeURIComponent(encodedURL);
    
    if (!urlParser[currentURL]) {
      urlParser[currentURL] = { 
        currPage: [],
        externalJSFiles: {}
      };
    }
    
    if (!urlParser[currentURL].externalJSFiles) {
      urlParser[currentURL].externalJSFiles = {};
    }

    urlParser[currentURL].externalJSFiles[encodedURL] = urls.map(url => ({
      url: decodeURIComponent(url),
      classifications: {} as URLClassification
    }));

    await browser.storage.local.set({ 'URL-PARSER': urlParser });
  }


  static async updateURLCount(count: number): Promise<void> {
    await browser.storage.local.set({ urlCount: count });
  }

  static async updateJSFileCount(count: number): Promise<void> {
    await browser.storage.local.set({ jsFileCount: count });
  }
}