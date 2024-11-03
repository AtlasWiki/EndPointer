import { useEffect, useState } from "react";
import browser from 'webextension-polyfill';
import { Endpoint } from "../constants/message_types";
import { useURLData } from '../hooks/useURLData';

export function URLsUnmodified() {
  const { 
    urls, 
    jsFiles, 
    filteredURLs, 
    visibleUrls, 
    setVisibleUrls,
    webpages
  } = useURLData("", "", "", 0, 0, {});

  // Function to download URLs as a .txt file
  const downloadURLsAsTxt = () => {
    const urlStrings = urls.map((endpoint) => endpoint.url).join('\n'); // Extract only the URLs
    const blob = new Blob([urlStrings], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'urls-unmodified.txt';
    link.click();
  };

  return (
    <div className="mt-2 ml-1">
        <button onClick={downloadURLsAsTxt} className="mt-4 p-2 text-white bg-transparent border border-gray-500 mb-5 rounded">
            Download URLs as .txt
        </button>
        <pre className="bg-gray-500 p-2 mb-4">
          showing umodified relative paths and absolute paths
        </pre>
        {urls.map((endpoint, index) => (
          <p className="" key={index}>{endpoint.url}</p>
        ))}
    </div>
  );
}
