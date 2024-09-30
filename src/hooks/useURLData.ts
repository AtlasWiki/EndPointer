import { useState, useEffect } from 'react';
import { Endpoint, Location } from '../constants/message_types';
import { formatURLData } from '../utils/URLdataFormatter_utils';
import browser from 'webextension-polyfill';
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
    const fetchData = async () => {
      const { allEndpoints, locations } = await formatURLData();
      setURLs(allEndpoints);
      setJSFiles(locations);
    };

    fetchData();

    const handleStorageChange = (changes: { [key: string]: browser.Storage.StorageChange }) => {
      if (changes["URL-PARSER"]) {
        fetchData();
      }
    };

    browser.storage.onChanged.addListener(handleStorageChange);

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