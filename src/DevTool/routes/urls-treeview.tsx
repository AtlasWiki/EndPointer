import React, { useEffect, useState } from "react";
import { NavBar } from '../../components/navbar';
import { URLCategory } from "../../components/sharedTypes/urlTypes_enums";

// Define types for our data structure
interface ClassifiedURL {
  url: string;
  categories: string[];
  score: number;
}

interface Endpoint extends ClassifiedURL {
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

interface URLEntry {
  currPage: ClassifiedURL[];
  externalJSFiles: { [key: string]: ClassifiedURL[] };
}

interface URLParser {
  [key: string]: URLEntry;
}

const categorySymbols: { [key in URLCategory]: string } = {
  [URLCategory.APIEndpoint]: '🔗',
  [URLCategory.AuthenticationEndpoint]: '🔐',
  [URLCategory.DataTransfer]: '📤',
  [URLCategory.DatabaseOperation]: '💾',
  [URLCategory.AdminPanel]: '👑',
  [URLCategory.UserDataAccess]: '👤',
  [URLCategory.PaymentProcessing]: '💳',
  [URLCategory.FileAccess]: '📁',
  [URLCategory.LegacyEndpoint]: '👴',
  [URLCategory.DynamicContent]: '🔄',
  [URLCategory.WebSocket]: '🔌',
  [URLCategory.InternalNetwork]: '🏢',
  [URLCategory.ThirdPartyIntegration]: '🤝',
  [URLCategory.DebugEndpoint]: '🐛',
  [URLCategory.PotentiallyVulnerable]: '⚠️',
  [URLCategory.SensitiveData]: '🔒',
  [URLCategory.UnsecuredAPI]: '🚨',
  [URLCategory.ParameterizedEndpoint]: '🔧',
  [URLCategory.NonStandardPort]: '🚪',
  [URLCategory.Base64EncodedSegment]: '📟'
};

export function URLsTreeView() {
  const [hierarchy, setHierarchy] = useState<URLHierarchy>({});
  const [jsFiles, setJSFiles] = useState<string[]>([]);
  const [selected, setSelected] = useState<string>('All');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    let newHierarchy: URLHierarchy = {};
    let allJsFiles: string[] = [];

    chrome.storage.local.get("URL-PARSER", (result: { [key: string]: URLParser }) => {
      const urlParser = result["URL-PARSER"];
      if (!urlParser) return;

      Object.entries(urlParser).forEach(([key, value]) => {
        if (key !== "current") {
          const webpage = decodeURIComponent(key);
          newHierarchy[webpage] = { mainPage: [], jsFiles: {} };

          // Add currPage endpoints
          newHierarchy[webpage].mainPage = value.currPage.map((url: ClassifiedURL): Endpoint => ({
            ...url,
            foundAt: 'Main Page',
            webpage,
          }));

          // Add externalJSFiles endpoints
          Object.entries(value.externalJSFiles).forEach(([jsFile, endpoints]) => {
            const decodedJsFile = decodeURIComponent(jsFile);
            allJsFiles.push(decodedJsFile);
            newHierarchy[webpage].jsFiles[decodedJsFile] = endpoints.map((url: ClassifiedURL): Endpoint => ({
              ...url,
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
        <span className="ml-2 text-gray-500">
          (Score: {endpoint.score})
        </span>
        <span className="ml-2">
          {endpoint.categories.map(category => (
            <span key={category} title={category} className="mr-1">
              {categorySymbols[category as URLCategory] || '❓'}
            </span>
          ))}
        </span>
      </div>
    );
  };

  const renderLegend = () => (
    <div className="mt-4 p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Classification Legend</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {Object.entries(categorySymbols).map(([category, symbol]) => (
          <div key={category} className="flex items-center">
            <span className="mr-2">{symbol}</span>
            <span>{category}</span>
          </div>
        ))}
      </div>
    </div>
  );

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

  const downloadAsJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(hierarchy, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "url_hierarchy.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const downloadAsTXT = () => {
    let txt = '';
    Object.entries(hierarchy).forEach(([webpage, { mainPage, jsFiles }]) => {
      txt += `${webpage}\n\nMain Page:\n`;
      mainPage.forEach(endpoint => txt += `${endpoint.url}\n`);
      txt += '\nJS Files:\n';
      Object.entries(jsFiles).forEach(([jsFile, endpoints]) => {
        txt += `${jsFile}:\n`;
        endpoints.forEach(endpoint => txt += `${endpoint.url}\n`);
        txt += '\n';
      });
      txt += '\n\n';
    });
    const dataStr = "data:text/plain;charset=utf-8," + encodeURIComponent(txt);
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "url_hierarchy.txt");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const copyAllURLs = () => {
    let urls: string[] = [];
    Object.values(hierarchy).forEach(({ mainPage, jsFiles }) => {
      urls = urls.concat(mainPage.map(e => e.url), ...Object.values(jsFiles).map(endpoints => endpoints.map(e => e.url)));
    });
    navigator.clipboard.writeText(urls.join('\n')).then(() => {
      alert('All URLs copied to clipboard!');
    }, (err) => {
      console.error('Could not copy text: ', err);
    });
  };

  const clearURLs = () => {
    chrome.storage.local.remove('URL-PARSER', function() {
      console.log('URL-PARSER data has been removed.');
      setHierarchy({});
      setJSFiles(['All']);
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
              className="w-full py-4 px-2 border-2 border-gray-300 bg-transparent text-lg rounded-md overflow-hidden text-ellipsis whitespace-nowrap"
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
        {renderLegend()}
        <div className="text-lg flex items-center space-x-4 mt-5">
          <a href={document.location.origin + "/PopUp/popup.html#urls"} target="_blank" className="bg-gray-950 p-3 rounded-md">Open in New Tab</a>
          <button onClick={clearURLs} className="bg-gray-600 p-3 rounded-md">Clear URLs</button>
          <button onClick={downloadAsTXT} className="bg-gray-600 p-3 rounded-md">Download as TXT</button>
          <button onClick={downloadAsJSON} className="bg-gray-600 p-3 rounded-md">Download as JSON</button>
          <button onClick={copyAllURLs} className="bg-gray-600 p-3 rounded-md">Copy All URLs</button>
        </div>
      </div>
    </div>
  );
}