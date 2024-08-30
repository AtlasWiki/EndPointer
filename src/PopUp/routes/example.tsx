import { NavBar } from '../../components/navbar';
import { useEffect, useState } from "react";

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

function URLProps({ endpoint }: { endpoint: Endpoint }) {
  return (
    <tr>
      <td className="break-words max-w-lg">{endpoint.url}</td>
      <td className="break-words max-w-lg">{endpoint.foundAt}</td>
      <td className="break-words max-w-lg">{endpoint.webpage}</td>
    </tr>
  );
}

export function Example() {
  const [urls, setURLs] = useState<Endpoint[]>([]);

  useEffect(() => {
    let allEndpoints: Endpoint[] = [];
    chrome.storage.local.get("URL-PARSER", (data: { [key: string]: URLParser }) => {
      const urlParser = data["URL-PARSER"];

      Object.keys(urlParser).forEach((key) => {
        if (key !== "current") {
          const currURLEndpoints = urlParser[key].currPage;
          const currURLExtJSFiles = urlParser[key].externalJSFiles;

          // Add currPage endpoints, found at the webpage (key)
          allEndpoints.push(...currURLEndpoints.map((endpoint): Endpoint => ({
            url: endpoint,
            foundAt: decodeURIComponent(key), // Found at the main webpage
            webpage: decodeURIComponent(key),
          })));

          // Add externalJSFiles endpoints, found at the specific JS file
          Object.entries(currURLExtJSFiles).forEach(([jsFile, endpoints]) => {
            allEndpoints.push(...endpoints.map((endpoint): Endpoint => ({
              url: endpoint,
              foundAt: decodeURIComponent(jsFile), // Found at the specific JS file
              webpage: decodeURIComponent(key),
            })));
          });
        }
      });

      setURLs(allEndpoints);
    });
  }, []);

  return (
    <div className="w-full min-h-screen">
      <NavBar />
      <div className="mt-5 flex">
        <div className="py-1 w-full flex flex-col gap-10">
          <div className="w-full">
            <table className="w-full border-collapse">
              <thead>
                <tr className="text-5xl">
                  <th className="border-b-2 pb-10">ENDPOINT</th>
                  <th className="border-b-2 pb-10">LOCATION</th>
                  <th className="border-b-2 pb-10">ROOT</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                    <td>
                        <div className="w-full"> 
                            <input type="text" className="mt-5 px-2 border-2 bg-transparent text-lg w-full pb-3 pt-3 rounded-md" />
                        </div>
                    </td>
                    <td>
                        <div className="w-full"> 
                            <select className="mt-5 px-2 border-2 bg-transparent text-lg w-full pb-3 pt-3 rounded-md">
                            <option className="bg-gray-500 border-2" value="all">ALL</option>
                            <option className="bg-gray-500 border-2" value={document.location.href}>{document.location.href}</option>
                            <option className="bg-gray-500 border-2" value={document.location.href}>{document.location.href}</option>
                            <option className="bg-gray-500 border-2" value={document.location.pathname}>{document.location.pathname}</option>
                            </select>
                        </div>
                    </td>
                </tr>
                {urls.map((endpoint, index) => (
                  <URLProps 
                    key={index} 
                    endpoint={endpoint} 
                  />
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-lg flex items-center space-x-4 px-5">
            <a href={document.location.origin + "/PopUp/popup.html#example"} target="_blank" className="bg-gray-950 p-3 rounded-md">Open in New Tab</a>
            <button className="bg-gray-600 p-3 rounded-md">Download as TXT</button>
            <button className="bg-gray-600 p-3 rounded-md">Download as JSON</button>
            <button className="bg-gray-600 p-3 rounded-md">Copy as absolute URLs</button>
            <button className="bg-gray-600 p-3 rounded-md">Copy All</button>
          </div>
        </div>
      </div>
    </div>
  );
}
