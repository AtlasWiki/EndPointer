import { useEffect, useState } from "react";
import browser from 'webextension-polyfill';
import { Endpoint } from "../constants/message_types";
import { useURLData } from '../hooks/useURLData';

export function URLsCSV() {

  const { 
    urls, 
    jsFiles, 
    filteredURLs, 
    visibleUrls, 
    setVisibleUrls,
    webpages
  } = useURLData("", "", "", 0, 0, {});
  
  // Function to sanitize URLs
  const sanitizedURL = (endpoint: Endpoint) => {
    let verifiedURL: string;
    const cleanedWebpage = endpoint.webpage.replace(/\/$/, '').split('#')[0];

    if (endpoint.url && (endpoint.url.startsWith("http://") || endpoint.url.startsWith("https://"))) {
      verifiedURL = endpoint.url;
    } else if (endpoint.url.startsWith('/')) {
      verifiedURL = cleanedWebpage + endpoint.url;
    } else {
      verifiedURL = cleanedWebpage + '/' + endpoint.url;
    }
    verifiedURL = verifiedURL.replace(/([^:]\/)\/+/g, "$1");

    return verifiedURL;
  };

  // Function to download URLs as a .csv file
  const downloadURLsAsCsv = () => {
    const csvHeader = 'endpoint,parsed from,root webpage\n'; // CSV header
    const csvContent = urls.map((endpoint) => 
      `${sanitizedURL(endpoint)},${endpoint.foundAt},${endpoint.webpage}`
    ).join('\n'); // Join each endpoint row with newline
    const blob = new Blob([csvHeader + csvContent], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'urls.csv';
    link.click();
  };

  return (
    <div className="mt-2 ml-1">
      <button onClick={downloadURLsAsCsv} className="mt-4 p-2 text-white bg-transparent border border-gray-500 mb-5 rounded">
        Download URLs as .csv
      </button>
      {/* CSV Syntax Display */}
      <pre className="bg-gray-500 p-2 mb-4">
        endpoint,parsed from,root webpage
      </pre>
      {/* Display URLs in CSV format */}
      <pre className="text-md p-2">
        {urls.map((endpoint, index) => 
          `${sanitizedURL(endpoint)},${endpoint.foundAt},${endpoint.webpage}`
        ).join('\n')}
      </pre>
    </div>
  );
}
