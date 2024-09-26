import { useEffect, useState } from "react";
import browser from 'webextension-polyfill';

export function URLsUnmodified() {
  // Simplified Endpoint interface to only include 'url'
  interface Endpoint {
    url: string;
  }

  interface URLEntry {
    currPage: string[];
    externalJSFiles: { [key: string]: string[] };
  }

  interface URLParser {
    [key: string]: URLEntry;
  }

  const [urls, setURLs] = useState<Endpoint[]>([]);

  // Function to download URLs as a .txt file
  const downloadURLsAsTxt = () => {
    const urlStrings = urls.map((endpoint) => endpoint.url).join('\n'); // Extract only the URLs
    const blob = new Blob([urlStrings], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'urls.txt';
    link.click();
  };

  useEffect(() => {
    const fetchData = () => {
      let allEndpoints: Endpoint[] = [];

      browser.storage.local.get("URL-PARSER"), (data: { [key: string]: URLParser }) => {
        const urlParser = data["URL-PARSER"];

        Object.keys(urlParser).forEach((key) => {
          if (key !== "current") {
            const currURLEndpoints = urlParser[key].currPage;
            const currURLExtJSFiles = urlParser[key].externalJSFiles;

            // Add currPage endpoints (only store URL)
            allEndpoints.push(
              ...currURLEndpoints.map((endpoint): Endpoint => ({
                url: endpoint,
              }))
            );

            // Add externalJSFiles endpoints (only store URL)
            Object.values(currURLExtJSFiles).forEach((endpoints) => {
              allEndpoints.push(
                ...endpoints.map((endpoint): Endpoint => ({
                  url: endpoint,
                }))
              );
            });
          }
        });

        setURLs(allEndpoints); // Update state with URLs only
      };
    };

    // Initial fetch
    fetchData();

    // Listener for storage changes
    const handleStorageChange = (changes: { [key: string]: browser.Storage.StorageChange }) => {
      if (changes["URL-PARSER"]) {
        fetchData(); // Re-fetch data when URL-PARSER changes
      }
    };

    browser.storage.onChanged.addListener(handleStorageChange);

    // Cleanup listener on component unmount
    return () => {
      browser.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

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
