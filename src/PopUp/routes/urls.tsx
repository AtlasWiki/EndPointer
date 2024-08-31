import { NavBar } from '../../components/navbar';
import { useEffect, useState } from "react";

export function URLs() {
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
  
  type LocationPropsType = {
    url: string;
    onClick: () => void;
  };
  
  function URLProps({ endpoint, searchQuery }: { endpoint: Endpoint, searchQuery: string }) {
    // Split the URL into parts, with the matching part highlighted
    const parts = endpoint.url.split(new RegExp(`(${searchQuery})`, 'gi'));

    return (
      <tr>
        <td className="break-words max-w-lg">
          {parts.map((part, index) =>
            part.toLowerCase() === searchQuery.toLowerCase() ? (
              <span key={index} className="text-red-500 font-semibold">{part}</span>
            ) : (
              <span key={index}>{part}</span>
            )
          )}
        </td>
        <td className="break-words max-w-lg">{endpoint.foundAt}</td>
        <td className="break-words max-w-lg">{endpoint.webpage}</td>
      </tr>
    );
  }
  
  function LocationItem({ url, onClick }: LocationPropsType) {
    return (
      <div
        onClick={onClick}
        className="bg-gray-500 text-white p-2 cursor-pointer text-ellipsis overflow-hidden whitespace-nowrap hover:bg-gray-600"
      >
        {url}
      </div>
    );
  }

  const [urls, setURLs] = useState<Endpoint[]>([]);
  const [jsFiles, setJSFiles] = useState<Location[]>([]);
  const [selected, setSelected] = useState<string>('All');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    let allEndpoints: Endpoint[] = [];
    let locations: Location[] = [];
    chrome.storage.local.get("URL-PARSER", (data: { [key: string]: URLParser }) => {
      const urlParser = data["URL-PARSER"];

      Object.keys(urlParser).forEach((key) => {
        if (key !== "current") {
          const currURLEndpoints = urlParser[key].currPage;
          const currURLExtJSFiles = urlParser[key].externalJSFiles;
          locations.push(decodeURIComponent(key))
          // Add currPage endpoints, found at the webpage (key)
          allEndpoints.push(...currURLEndpoints.map((endpoint): Endpoint => ({
            url: endpoint,
            foundAt: decodeURIComponent(key), // Found at the main webpage
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
              foundAt: decodedJsFile, // Found at the specific JS file
              webpage: decodeURIComponent(key),
            })));
          });
        }
      });

      // Ensure "All" is included only once and other locations are unique
      const uniqueLocations = Array.from(new Set(['All', ...locations]));
      setURLs(allEndpoints);
      setJSFiles(uniqueLocations); 
    });
  }, []);

  const handleSelect = (url: string) => {
    setSelected(url);
    setIsOpen(false);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const filteredURLs = urls
    .filter(endpoint => {
      const matchesLocation = selected === 'All' || endpoint.foundAt === selected;
      const matchesQuery = endpoint.url.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesLocation && matchesQuery;
    });
  
  function clearURLs(){
      chrome.storage.local.remove('URL-PARSER', function() {
          console.log('Key has been removed.');
      });
      window.location.reload()
    }
  return (
    <div className="w-full min-h-screen">
      <NavBar />
      <div className="mt-5 flex">
        <div className="py-1 w-full flex flex-col gap-10">
          <div className="w-full max-h-[760px] overflow-scroll">
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
                    <div className="mt-5 w-full">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="px-2 border-2 border-gray-300 bg-transparent text-lg w-full pb-3 pt-3 rounded-md
                          cursor-pointer text-gray-500 hover:border-gray-500 outline-none focus:border-gray-500 transition-all duration-400"
                        placeholder="Search endpoints..."
                      />
                    </div>
                  </td>

                  <td>
                    <div className="relative w-full max-w-lg mt-5">
                      <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="w-full px-2 border-2 border-gray-300 bg-transparent text-lg rounded-md overflow-hidden text-ellipsis whitespace-nowrap"
                      >
                        {selected}
                      </button>
                      {isOpen && (
                        <div className="absolute mt-1 w-full bg-white border-2 border-gray-500 rounded-md shadow-lg z-10 max-h-60 overflow-auto">
                          {jsFiles.map((url, index) => (
                            <LocationItem
                              key={index}
                              url={url}
                              onClick={() => handleSelect(url)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
                {filteredURLs.map((endpoint, index) => (
                  <URLProps key={index} endpoint={endpoint} searchQuery={searchQuery} />
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-lg flex items-center space-x-4 px-5">
            <a href={document.location.origin + "/PopUp/popup.html#urls"} target="_blank" className="bg-gray-950 p-3 rounded-md">Open in New Tab</a>
            <button className="bg-gray-600 p-3 rounded-md" onClick={clearURLs}>Clear URLs</button>
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
