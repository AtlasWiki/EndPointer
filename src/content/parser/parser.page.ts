import { REL_REGEX, ABS_REGEX } from '../../constants/regex_constants';
import { StorageService } from './storage.service';
import browser from 'webextension-polyfill';
import { URLParserStorageWithOptionalCurrent } from './parser.types';

export class PageParser {
  async parseCurrentPage(): Promise<Set<string>> {
    const pageContent = document.documentElement.outerHTML;
    const abPageURLs = Array.from(pageContent.matchAll(ABS_REGEX), match => match[1]);
    const relPageURLs = Array.from(pageContent.matchAll(REL_REGEX), match => match[1]);
    const pageURLs = new Set([...abPageURLs, ...relPageURLs]);

    const currPage = encodeURIComponent(document.location.href);
    await this.saveToBrowser(currPage, pageURLs);
    await StorageService.updateURLCount(pageURLs.size);

    return pageURLs;
  }

  private async saveToBrowser(currPage: string, pageURLs: Set<string>): Promise<void> {
    const result = await browser.storage.local.get('URL-PARSER');
    const urlParser = (result['URL-PARSER'] as URLParserStorageWithOptionalCurrent) || {};
    
    if (!urlParser[currPage]) {
      urlParser[currPage] = { currPage: [], externalJSFiles: {} };
    }

    urlParser.current = currPage;
    urlParser[currPage].currPage = Array.from(pageURLs);

    await browser.storage.local.set({ 'URL-PARSER': urlParser });
  }

  getScriptFiles(): string[] {
    const scriptTags = document.getElementsByTagName('script');
    return Array.from(scriptTags).filter(script => script.src).map(script => script.src);
  }

  setupScriptObserver(onNewScripts: (newScripts: string[]) => void): MutationObserver {
    const observer = new MutationObserver((mutations) => {
      for (let mutation of mutations) {
        if (mutation.type === 'childList') {
          const addedScripts = Array.from(mutation.addedNodes)
            .filter((node): node is HTMLScriptElement => 
              node.nodeName === 'SCRIPT' && 
              node instanceof HTMLScriptElement && 
              node.src !== ''
            )
            .map(script => script.src);
          
          if (addedScripts.length > 0) {
            onNewScripts(addedScripts);
          }
        }
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });

    return observer;
  }
}
