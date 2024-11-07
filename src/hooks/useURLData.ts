import { useState, useEffect, useMemo } from 'react';
import { Endpoint, Location, Webpage } from '../constants/message_types';
import { formatURLData } from '../utils/URLdataFormatter_utils';
import browser from 'webextension-polyfill';
import { ClassificationMapping } from '../constants/defaultview_contants';
export function useURLData(
  selectedLocation: string,
  selectedWebpage: string,
  searchQuery: string,
  startIndex: number,
  visibleUrlSize: number,
  selectedCategories: Record<string, boolean>,
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

      // Updated category matching logic
      const matchesCategories = Object.keys(selectedCategories).some(category => {
        if (!selectedCategories[category]) return false;
        
        // Find the classification key that maps to this category
        const classificationKey = Object.entries(ClassificationMapping)
          .find(([_, value]) => value === category)?.[0];
        
        return classificationKey ? endpoint.classifications[classificationKey] : true;
      });

      return matchesLocation && matchesQuery && matchesWebpage && (matchesCategories || Object.values(selectedCategories).every(value => value));
    });
  }, [urls, selectedLocation, selectedWebpage, searchQuery, selectedCategories]);

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
    selectedCategories
  };
}