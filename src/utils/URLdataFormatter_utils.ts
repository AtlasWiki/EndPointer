import browser from 'webextension-polyfill';
import { Endpoint, Location, URLParser } from '../constants/message_types';

interface FormattedURLData {
  allEndpoints: Endpoint[];
  locations: Location[];
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
  const urlParser: any = result["URL-PARSER"];

  let allEndpoints: Endpoint[] = [];
  let locations: Location[] = [];
  let hierarchy: FormattedURLData['hierarchy'] = {};

  Object.keys(urlParser).forEach((key) => {
    if (key !== "current") {
      const webpage = decodeURIComponent(key);
      const currURLEndpoints = urlParser[key].currPage;
      const currURLExtJSFiles = urlParser[key].externalJSFiles;

      locations.push(webpage);
      hierarchy[webpage] = { mainPage: [], jsFiles: {} };

      // Add currPage endpoints
      const mainPageEndpoints = currURLEndpoints.map((endpoint: string): Endpoint => ({
        url: endpoint,
        foundAt: webpage,
        webpage: webpage,
      }));
      allEndpoints.push(...mainPageEndpoints);
      hierarchy[webpage].mainPage = mainPageEndpoints;

      // Add externalJSFiles endpoints
      Object.entries(currURLExtJSFiles).forEach(([jsFile, endpoints]) => {
        const decodedJsFile = decodeURIComponent(jsFile);
        if (!locations.includes(decodedJsFile)) {
          locations.push(decodedJsFile);
        }
        const jsFileEndpoints = (endpoints as string[]).map((endpoint: string): Endpoint => ({
          url: endpoint,
          foundAt: decodedJsFile,
          webpage: webpage,
        }));
        allEndpoints.push(...jsFileEndpoints);
        hierarchy[webpage].jsFiles[decodedJsFile] = jsFileEndpoints;
      });
    }
  });

  // Ensure "All" is included only once and other locations are unique
  const uniqueLocations = Array.from(new Set(['All', ...locations]));

  return {
    allEndpoints,
    locations: uniqueLocations,
    hierarchy
  };
}