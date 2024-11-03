import { useEffect, useState } from "react";
import browser from 'webextension-polyfill';
import { CSS_CLASSES } from "../constants/defaultview_contants";
import { Endpoint } from "../constants/message_types";
import { useURLData } from '../hooks/useURLData';


export function URLsPlain() {
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

  // Function to download URLs as a .txt file
  const downloadURLsAsTxt = () => {
    const urlStrings = urls.map(sanitizedURL).join('\n'); // Join URLs as newline-separated strings
    const blob = new Blob([urlStrings], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'urls.txt';
    link.click();
  };

  return (
    <div className="mt-2 w-full ml-1">
        <button onClick={downloadURLsAsTxt} className="mt-4 p-2 text-white bg-transparent border border-gray-500 mb-5 rounded">
            Download URLs as .txt
        </button>
        <pre className="bg-gray-500 p-2 mb-4">
                  {`
          Showing modified relative paths (format: root webpage + relative paths)
          Example: https://www.example.com + /help: https://www.example.com/help
          and absolute urls
          `}
        </pre>
        {urls.map((endpoint, index) => (
            <p className="" key={index}>{sanitizedURL(endpoint)}</p>
        ))}
    </div>
  );
}
