// src/hooks/useURLData.ts

import { useState, useEffect } from 'react';
import browser from 'webextension-polyfill';
import { Endpoint, Location, URLParser } from '../constants/message_types';

export function useURLData(
  selected: string,
  searchQuery: string,
  startIndex: number,
  visibleUrlSize: number
) {
  const [urls, setURLs] = useState<Endpoint[]>([]);
  const [jsFiles, setJSFiles] = useState<Location[]>([]);
  const [visibleUrls, setVisibleUrls] = useState<Endpoint[]>([]);

  useEffect(() => {
    const fetchData = () => {
      let allEndpoints: Endpoint[] = [];
      let locations: Location[] = [];

      browser.storage.local.get("URL-PARSER").then((data: { [key: string]: any }) => {
        const urlParser: URLParser = data["URL-PARSER"];

        Object.keys(urlParser).forEach((key) => {
          if (key !== "current") {
            const currURLEndpoints = urlParser[key].currPage;
            const currURLExtJSFiles = urlParser[key].externalJSFiles;
            locations.push(decodeURIComponent(key));

            // Add currPage endpoints
            allEndpoints.push(...currURLEndpoints.map((endpoint: string): Endpoint => ({
              url: endpoint,
              foundAt: decodeURIComponent(key),
              webpage: decodeURIComponent(key),
            })));

            // Add externalJSFiles endpoints
            Object.entries(currURLExtJSFiles).forEach(([jsFile, endpoints]) => {
              const decodedJsFile = decodeURIComponent(jsFile);
              if (!locations.includes(decodedJsFile)) {
                locations.push(decodedJsFile);
              }
              allEndpoints.push(...(endpoints as string[]).map((endpoint: string): Endpoint => ({
                url: endpoint,
                foundAt: decodedJsFile,
                webpage: decodeURIComponent(key),
              })));
            });
          }
        });

        // Ensure "All" is included only once and other locations are unique
        const uniqueLocations = Array.from(new Set(['All', ...locations]));
        setURLs(allEndpoints);
        setJSFiles(uniqueLocations);
      });
    };

    // Initial fetch
    fetchData();

    // Listener for storage changes
    const handleStorageChange = (changes: { [key: string]: browser.Storage.StorageChange }) => {
      if (changes["URL-PARSER"]) {
        fetchData();
      }
    };

    browser.storage.onChanged.addListener(handleStorageChange);

    // Cleanup listener on hook unmount
    return () => {
      browser.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  const filteredURLs = urls.filter(endpoint => {
    const matchesLocation = selected === 'All' || endpoint.foundAt === selected;
    const matchesQuery = endpoint.url.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLocation && matchesQuery;
  });

  useEffect(() => {
    const endIndex = Math.min(startIndex + visibleUrlSize, filteredURLs.length);
    setVisibleUrls(filteredURLs.slice(startIndex, endIndex));
  }, [urls, selected, searchQuery, startIndex, visibleUrlSize, filteredURLs]);

  return {
    urls,
    jsFiles,
    filteredURLs,
    visibleUrls,
    setVisibleUrls,
  };
}