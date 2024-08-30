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
      <td className="break-words max-w-lg">{endpoint.webpage}</td>
      <td className="break-words max-w-lg">{endpoint.webpage}</td>
    </tr>
  );
}

export function Example() {
  const [urls, setURLs] = useState<Endpoint[]>([]);
  const [webpage, setWebpage] = useState<string>("");
  const [jsFile, setJSFile] = useState<string>("");

  useEffect(() => {
    let allEndpoints: Endpoint[] = [];
    chrome.storage.local.get("URL-PARSER", (data: { [key: string]: URLParser }) => {
      const urlParser = data["URL-PARSER"];

      Object.keys(urlParser).forEach((key) => {
        if (key !== "current") {
          setWebpage(key);
          const currURLEndpoints = urlParser[key].currPage;
          const currURLExtJSFiles = urlParser[key].externalJSFiles;

          setJSFile(JSON.stringify(Object.keys(currURLExtJSFiles)));

          const endpointsInExtJSFiles = Object.values(currURLExtJSFiles).flat();
          const combinedEndpoints = [
            ...currURLEndpoints,
            ...endpointsInExtJSFiles
          ];

          allEndpoints = combinedEndpoints.map((endpoint): Endpoint => ({
            url: endpoint,
            foundAt: JSON.stringify(currURLExtJSFiles),
            webpage: decodeURIComponent(key),
          }));
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
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="text-5xl">
                  <th className="border-b-2 pb-10">ENDPOINT</th>
                  <th className="border-b-2 pb-10">LOCATION</th>
                  <th className="border-b-2 pb-10">ROOT</th>
                </tr>
              </thead>
              <div className="py-2"></div>
              <tbody>
                <tr className="">
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
                <div className="py-5"></div>
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
            <a href={document.location.href} target="_blank" className="bg-gray-950 p-3 rounded-md">Open in New Tab</a>
            <button className="bg-gray-800 p-3 rounded-md">Download as TXT</button>
            <button className="bg-gray-800 p-3 rounded-md">Download as JSON</button>
            <button className="bg-gray-800 p-3 rounded-md">Copy as absolute URLs</button>
            <button className="bg-gray-800 p-3 rounded-md">Copy All</button>
          </div>
        </div>
      </div>
    </div>
  );
}
