import { REL_REGEX, ABS_REGEX } from '../sharedTypes/regex_constants';
import { getURLParserState, setURLParserState } from '../sharedTypes/storage';
import { ParsedUrlRecords, ParsedData } from '../sharedTypes/types';

const fetchFile = async (file: string): Promise<string> => {
  const response = await fetch(file);
  return response.text();
};

const parseExternalFiles = async (currentURL: string, urlParserState: ParsedUrlRecords): Promise<string[]> => {
  const scriptTags = document.getElementsByTagName('script');
  console.log("Found script tags: " + scriptTags.length);

  const jsFiles = Array.from(scriptTags).map(tag => tag.src);
  let extURLs: string[] = [];

  for (const jsFile of jsFiles) {
    try {
      const code = await fetchFile(jsFile);
      const jsFileRelURLs = Array.from(code.matchAll(REL_REGEX), match => match[1]);
      const jsFileAbURLs = Array.from(code.matchAll(ABS_REGEX), match => match[1]);
      const jsFileURLs = [...new Set([...jsFileRelURLs, ...jsFileAbURLs])];

      extURLs = [...extURLs, ...jsFileURLs];
      console.log(`Found ${jsFileURLs.length} URLs in ${jsFile}`);
      
      const encodedURL = encodeURIComponent(jsFile);

      if (!urlParserState[currentURL]) {
        urlParserState[currentURL] = { currPage: [], externalJSFiles: {} };
      }

      urlParserState[currentURL].externalJSFiles[encodedURL] = jsFileURLs;
    } catch (error) {
      console.error('Error fetching script:', error);
    }
  }

  await setURLParserState(urlParserState);
  console.log("Total JS files: " + jsFiles.length);
  console.log("Total URLs found: " + extURLs.length);
  
  return jsFiles;
};

const parseCurrentPage = async (): Promise<ParsedData> => {
  const pageContent = document.documentElement.outerHTML;
  const abPageURLs = Array.from(pageContent.matchAll(ABS_REGEX), match => match[1]);
  const relPageURLs = Array.from(pageContent.matchAll(REL_REGEX), match => match[1]);
  const pageURLs = [...new Set([...abPageURLs, ...relPageURLs])];

  const currentURL = encodeURIComponent(document.location.href);
  console.log("URLs from current page: ", pageURLs);

  const urlParserState = await getURLParserState();
  if (!urlParserState[currentURL]) {
    urlParserState[currentURL] = { currPage: [], externalJSFiles: {} };
  }

  urlParserState[currentURL].currPage = pageURLs;

  await setURLParserState(urlParserState);
  console.log("Saved endpoints from the current page.");

  const jsFiles = await parseExternalFiles(currentURL, urlParserState);

  return {
    urls: pageURLs,
    jsFiles: jsFiles
  };
};

export const parseURLs = async (): Promise<ParsedData> => {
  console.log("Parsing URLs...");
  return parseCurrentPage();
};