// src/components/content/urlParser/urlExtractor.ts

import { REL_REGEX, ABS_REGEX } from '../../sharedTypes/regex_constants';

export class URLExtractor {
  /**
   * Extracts all URLs from the current page's HTML content.
   * @returns A Set of unique URLs found in the page.
   */
  extractURLsFromPage(): Set<string> {
    const pageContent = document.documentElement.outerHTML;
    const abPageURLs = Array.from(pageContent.matchAll(ABS_REGEX), match => match[1]);
    const relPageURLs = Array.from(pageContent.matchAll(REL_REGEX), match => match[1]);
    return new Set([...abPageURLs, ...relPageURLs]);
  }

  /**
   * Extracts all JavaScript file URLs from script tags in the current page.
   * @returns An array of JavaScript file URLs.
   */
  extractJSFilesFromPage(): string[] {
    const scriptTags = document.getElementsByTagName('script');
    return Array.from(scriptTags)
      .filter(script => script.src)
      .map(script => script.src);
  }

  /**
   * Counts the number of JavaScript files in the current page and sends the count to the background script.
   */
  countJSFiles() {
    const jsFileCount = this.extractJSFilesFromPage().length;
    chrome.runtime.sendMessage({ action: 'updateJSFileCount', count: jsFileCount });
  }

  /**
   * Extracts URLs from a given JavaScript code string.
   * @param code - The JavaScript code to extract URLs from.
   * @returns A Set of unique URLs found in the code.
   */
  extractURLsFromJSCode(code: string): Set<string> {
    const jsFileRelURLs = Array.from(code.matchAll(REL_REGEX), match => match[1]);
    const jsFileAbURLs = Array.from(code.matchAll(ABS_REGEX), match => match[1]);
    return new Set([...jsFileRelURLs, ...jsFileAbURLs]);
  }
}