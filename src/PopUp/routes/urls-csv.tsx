import { useEffect, useState } from "react";

export function URLsCSV() {
  interface Endpoint {
    url: string;
    foundAt: string;
    webpage: string;
  }

  interface URLEntry {
    currPage: string[];
    externalJSFiles: { [key: string]: string[] };
  }

  interface URLParser {
    [key: string]: URLEntry;
  }

  type Location = string;

  const [urls, setURLs] = useState<Endpoint[]>([]);

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

  useEffect(() => {
    let allEndpoints: Endpoint[] = [];
    let locations: Location[] = [];
    chrome.storage.local.get("URL-PARSER", (data: { [key: string]: URLParser }) => {
      const urlParser = data["URL-PARSER"];

      Object.keys(urlParser).forEach((key) => {
        if (key !== "current") {
          const currURLEndpoints = urlParser[key].currPage;
          const currURLExtJSFiles = urlParser[key].externalJSFiles;
          locations.push(decodeURIComponent(key));

          // Add currPage endpoints, found at the webpage (key)
          allEndpoints.push(...currURLEndpoints.map((endpoint): Endpoint => ({
            url: endpoint,
            foundAt: decodeURIComponent(key),
            webpage: decodeURIComponent(key),
          })));

          // Add externalJSFiles endpoints, found at the specific JS file
          Object.entries(currURLExtJSFiles).forEach(([jsFile, endpoints]) => {
            const decodedJsFile = decodeURIComponent(jsFile);
            if (!locations.includes(decodedJsFile)) {
              locations.push(decodedJsFile);
            }
            allEndpoints.push(...endpoints.map((endpoint): Endpoint => ({
              url: endpoint,
              foundAt: decodedJsFile,
              webpage: decodeURIComponent(key),
            })));
          });
        }
      });

      setURLs(allEndpoints);
    });
  }, []);

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
