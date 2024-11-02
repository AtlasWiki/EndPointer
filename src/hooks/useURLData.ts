import { useState, useEffect, useMemo } from 'react';
import { Endpoint, Location, Webpage } from '../constants/message_types';
import { formatURLData } from '../utils/URLdataFormatter_utils';
import browser from 'webextension-polyfill';

export function useURLData(
  selectedLocation: string,
  selectedWebpage: string,
  searchQuery: string,
  startIndex: number,
  visibleUrlSize: number
) {
  const [urls, setURLs] = useState<Endpoint[]>([]);
  const [jsFiles, setJSFiles] = useState<Location[]>([]);
  const [webpages, setWebpages] = useState<Location[]>([]);
  const [visibleUrls, setVisibleUrls] = useState<Endpoint[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { allEndpoints, locations, webpages } = await formatURLData();
      setURLs(allEndpoints);
      setJSFiles(locations);
      setWebpages(webpages);
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

  const filteredURLs = useMemo(() => {
    return urls.filter(endpoint => {
      const matchesLocation = selectedLocation === 'All' || endpoint.foundAt === selectedLocation;
      const matchesWebpage = selectedWebpage === 'All' || endpoint.webpage === selectedWebpage;
      const matchesQuery = endpoint.url.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesLocation && matchesQuery && matchesWebpage;
    });
  }, [urls, selectedLocation, selectedWebpage, searchQuery]);

  useEffect(() => {
    const endIndex = Math.min(startIndex + visibleUrlSize, filteredURLs.length);
    setVisibleUrls(filteredURLs.slice(startIndex, endIndex));
  }, [filteredURLs, startIndex, visibleUrlSize]);

  return {
    urls,
    jsFiles,
    filteredURLs,
    visibleUrls,
    setVisibleUrls,
    webpages,
  };
}