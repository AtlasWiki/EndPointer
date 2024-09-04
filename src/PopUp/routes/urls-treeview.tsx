import { NavBar } from '../../components/navbar';
import { useEffect, useState } from "react";

export function URLsTreeView() {
  interface Endpoint {
    url: string;
    foundAt: string;
    webpage: string;
  }

  interface URLHierarchy {
    [webpage: string]: {
      mainPage: Endpoint[];
      jsFiles: {
        [jsFile: string]: Endpoint[];
      };
    };
  }

  const [hierarchy, setHierarchy] = useState<URLHierarchy>({});
  const [jsFiles, setJSFiles] = useState<string[]>([]);
  const [selected, setSelected] = useState<string>('All');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    let newHierarchy: URLHierarchy = {};
    let allJsFiles: string[] = [];

    chrome.storage.local.get("URL-PARSER", (data: { [key: string]: any }) => {
      const urlParser = data["URL-PARSER"];

      Object.keys(urlParser).forEach((key) => {
        if (key !== "current") {
          const webpage = decodeURIComponent(key);
          newHierarchy[webpage] = { mainPage: [], jsFiles: {} };

          // Add currPage endpoints
          newHierarchy[webpage].mainPage = urlParser[key].currPage.map((url: string): Endpoint => ({
            url,
            foundAt: 'Main Page',
            webpage,
          }));

          // Add externalJSFiles endpoints
          Object.entries(urlParser[key].externalJSFiles).forEach(([jsFile, endpoints]) => {
            const decodedJsFile = decodeURIComponent(jsFile);
            allJsFiles.push(decodedJsFile);
            newHierarchy[webpage].jsFiles[decodedJsFile] = (endpoints as string[]).map((url): Endpoint => ({
              url,
              foundAt: decodedJsFile,
              webpage,
            }));
          });
        }
      });

      setHierarchy(newHierarchy);
      setJSFiles(['All', ...Array.from(new Set(allJsFiles))]);
    });
  }, []);

  const handleSelect = (url: string) => {
    setSelected(url);
    setIsOpen(false);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const toggleExpand = (item: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(item)) {
        newSet.delete(item);
      } else {
        newSet.add(item);
      }
      return newSet;
    });
  };

  const filterEndpoints = (endpoints: Endpoint[]): Endpoint[] => {
    return endpoints.filter(endpoint => 
      endpoint.url.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (selected === 'All' || endpoint.foundAt === selected || endpoint.webpage === selected)
    );
  };

  const renderEndpoint = (endpoint: Endpoint) => {
    const parts = endpoint.url.split(new RegExp(`(${searchQuery})`, 'gi'));
    return (
      <div key={endpoint.url} className="ml-8 mt-1 flex items-center">
        <span className="mr-2 text-blue-500">➤</span>
        {parts.map((part, index) =>
          part.toLowerCase() === searchQuery.toLowerCase() ? (
            <span key={index} className="text-red-500 font-semibold">{part}</span>
          ) : (
            <span key={index}>{part}</span>
          )
        )}
      </div>
    );
  };

  const renderHierarchicalView = () => {
    return Object.entries(hierarchy).map(([webpage, { mainPage, jsFiles }]) => {
      const filteredMainPage = filterEndpoints(mainPage);
      const filteredJsFiles = Object.entries(jsFiles).filter(([_, endpoints]) => 
        filterEndpoints(endpoints).length > 0
      );

      if (filteredMainPage.length === 0 && filteredJsFiles.length === 0) return null;

      return (
        <div key={webpage} className="mb-4">
          <div 
            className="text-xl font-bold cursor-pointer flex items-center"
            onClick={() => toggleExpand(webpage)}
          >
            <span className="mr-2 text-green-500">🌐</span>
            <span className="mr-2">{expandedItems.has(webpage) ? '▼' : '▶'}</span>
            {webpage}
          </div>
          {expandedItems.has(webpage) && (
            <>
              {filteredMainPage.length > 0 && (
                <div className="ml-4 mt-2">
                  <div 
                    className="text-lg font-semibold cursor-pointer flex items-center"
                    onClick={() => toggleExpand(`${webpage}-main`)}
                  >
                    <span className="mr-2">{expandedItems.has(`${webpage}-main`) ? '▼' : '▶'}</span>
                    Main Page
                  </div>
                  {expandedItems.has(`${webpage}-main`) && filteredMainPage.map(renderEndpoint)}
                </div>
              )}
              {filteredJsFiles.map(([jsFile, endpoints]) => {
                const filteredEndpoints = filterEndpoints(endpoints);
                
                if (filteredEndpoints.length === 0) return null;

                return (
                  <div key={jsFile} className="ml-4 mt-2">
                    <div 
                      className="text-lg font-semibold cursor-pointer flex items-center"
                      onClick={() => toggleExpand(jsFile)}
                    >
                      <span className="mr-2 text-yellow-500">📄</span>
                      <span className="mr-2">{expandedItems.has(jsFile) ? '▼' : '▶'}</span>
                      {jsFile}
                    </div>
                    {expandedItems.has(jsFile) && filteredEndpoints.map(renderEndpoint)}
                  </div>
                );
              })}
            </>
          )}
        </div>
      );
    });
  };

  return (
    <div className="w-full min-h-screen">
      <NavBar />
      <div className="mt-5 p-5">
        <div className="mb-5 flex gap-4">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            className="px-2 border-2 border-gray-300 bg-transparent text-lg w-full pb-3 pt-3 rounded-md
              cursor-pointer hover:border-gray-500 outline-none focus:border-gray-500 transition-all duration-400"
            placeholder="Search endpoints..."
          />
          <div className="relative w-64">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-full px-2 border-2 border-gray-300 bg-transparent text-lg rounded-md overflow-hidden text-ellipsis whitespace-nowrap"
            >
              {selected}
            </button>
            {isOpen && (
              <div className="absolute mt-1 w-full bg-white border-2 border-gray-500 rounded-md shadow-lg z-10 max-h-60 overflow-auto">
                {jsFiles.map((url, index) => (
                  <div
                    key={index}
                    onClick={() => handleSelect(url)}
                    className="bg-gray-500 text-white p-2 cursor-pointer text-ellipsis overflow-hidden whitespace-nowrap hover:bg-gray-600"
                  >
                    {url}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="border rounded-lg p-4 max-h-[600px] overflow-auto">
          {renderHierarchicalView()}
        </div>
        <div className="text-lg flex items-center space-x-4 mt-5">
          <a href={document.location.origin + "/PopUp/popup.html#urls"} target="_blank" className="bg-gray-950 p-3 rounded-md">Open in New Tab</a>
          <button className="bg-gray-600 p-3 rounded-md">Download as TXT</button>
          <button className="bg-gray-600 p-3 rounded-md">Download as JSON</button>
          <button className="bg-gray-600 p-3 rounded-md">Copy as absolute URLs</button>
          <button className="bg-gray-600 p-3 rounded-md">Copy All</button>
        </div>
      </div>
    </div>
  );
}