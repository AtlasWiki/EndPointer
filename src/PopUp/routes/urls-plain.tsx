import { useEffect, useState } from "react";

export function URLsPlain() {

  interface URLEntry {
    currPage: string[];
    externalJSFiles: { [key: string]: string[] };
  }

  interface URLParser {
    [key: string]: URLEntry;
  }

  const [urls, setURLs] = useState<string[]>([]);

  useEffect(() => {
    let allURLs: string[] = [];
    chrome.storage.local.get("URL-PARSER", (data: { [key: string]: URLParser }) => {
      const urlParser = data["URL-PARSER"];

      Object.keys(urlParser).forEach((key) => {
        if (key !== "current") {
          const currURLEndpoints = urlParser[key].currPage;
          const currURLExtJSFiles = urlParser[key].externalJSFiles;

          // Add currPage URLs
          allURLs.push(...currURLEndpoints);

          // Add externalJSFiles URLs
          Object.values(currURLExtJSFiles).forEach((endpoints) => {
            allURLs.push(...endpoints);
          });
        }
      });

      setURLs(allURLs); // Update the state with just URLs
    });
  }, []);

  return (
    <>
      {urls.map((url, index) => (
        <p className="ml-2" key={index}>{url}</p>
      ))}
    </>
  );
}
