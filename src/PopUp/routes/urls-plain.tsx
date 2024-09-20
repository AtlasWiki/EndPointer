import { useEffect, useState } from "react";

export function URLsPlain() {
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

  // Function to download URLs as a .txt file
  const downloadURLsAsTxt = () => {
    const urlStrings = urls.map(sanitizedURL).join('\n'); // Join URLs as newline-separated strings
    const blob = new Blob([urlStrings], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'urls.txt';
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
        <button onClick={downloadURLsAsTxt} className="mt-4 p-2 text-white bg-transparent border-2 border-gray-500 mb-5 rounded">
            Download URLs as .txt
        </button>
        {urls.map((endpoint, index) => (
            <p className="" key={index}>{sanitizedURL(endpoint)}</p>
        ))}
    </div>
  );
}
