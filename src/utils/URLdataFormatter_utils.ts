import browser from 'webextension-polyfill';
import { Endpoint, Location, Webpage, URLParserStorage, URLParserStorageItem } from '../constants/message_types';

interface FormattedURLData {
  allEndpoints: Endpoint[];
  locations: Location[];
  webpages: Webpage[];
  hierarchy: {
    [webpage: string]: {
      mainPage: Endpoint[];
      jsFiles: {
        [jsFile: string]: Endpoint[];
      };
    };
  };
}

export async function formatURLData(): Promise<FormattedURLData> {
  const result = await browser.storage.local.get("URL-PARSER");
  const urlParserData = result["URL-PARSER"] as URLParserStorage;

  let allEndpoints: Endpoint[] = [];
  let locations: Location[] = [];
  let webpages: Webpage[] = [];
  let hierarchy: FormattedURLData['hierarchy'] = {};

  if (!urlParserData) {
    return {
      allEndpoints: [],
      locations: ['All'],
      webpages: ['All'],
      hierarchy: {}
    };
  }

  Object.entries(urlParserData).forEach(([key, value]) => {
    if (key !== "current" && typeof value !== 'string' && value !== undefined) {
      const webpage = decodeURIComponent(key);
      const item = value as URLParserStorageItem;
      
      locations.push(webpage);
      webpages.push(webpage);
      hierarchy[webpage] = { mainPage: [], jsFiles: {} };

      // Handle main page endpoints
      const mainPageEndpoints = item.currPage.map((endpoint) => ({
        url: endpoint.url,
        foundAt: webpage,
        webpage: webpage,
        classifications: endpoint.classifications as unknown as Record<string, boolean>
      }));
      allEndpoints.push(...mainPageEndpoints);
      hierarchy[webpage].mainPage = mainPageEndpoints;

      // Handle JS file endpoints
      Object.entries(item.externalJSFiles).forEach(([jsFile, endpoints]) => {
        const decodedJsFile = decodeURIComponent(jsFile);
        if (!locations.includes(decodedJsFile)) {
          locations.push(decodedJsFile);
        }
        
        const jsFileEndpoints = endpoints.map((endpoint) => ({
          url: endpoint.url,
          foundAt: decodedJsFile,
          webpage: webpage,
          classifications: endpoint.classifications as unknown as Record<string, boolean>
        }));
        allEndpoints.push(...jsFileEndpoints);
        hierarchy[webpage].jsFiles[decodedJsFile] = jsFileEndpoints;
      });
    }
  });

  const uniqueLocations = Array.from(new Set(['All', ...locations]));
  const uniqueWebpages = Array.from(new Set(['All', ...webpages]));

  return {
    allEndpoints,
    locations: uniqueLocations,
    webpages: uniqueWebpages,
    hierarchy
  };
}