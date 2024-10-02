
import browser from 'webextension-polyfill';
import React, { useEffect, useState } from "react";
import { formatURLData } from '../utils/URLdataFormatter_utils';
import { Endpoint, Location } from '../constants/message_types';
import { NavBar } from '../components/navbar';

export function URLsTreeView() {
  const [hierarchy, setHierarchy] = useState<{
    [webpage: string]: {
      mainPage: Endpoint[];
      jsFiles: {
        [jsFile: string]: Endpoint[];
      };
    };
  }>({});
  const [jsFiles, setJSFiles] = useState<Location[]>([]);
  const [selected, setSelected] = useState<string>('All');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchData = async () => {
      const { hierarchy: newHierarchy, locations } = await formatURLData();
      setHierarchy(newHierarchy);
      setJSFiles(locations);
    };

    fetchData();

    const handleStorageChange = (changes: { [key: string]: browser.Storage.StorageChange }) => {
      if (changes["URL-PARSER"]) {
        fetchData();
      }
    };

    browser.storage.onChanged.addListener(handleStorageChange);

    return () => {
      browser.storage.onChanged.removeListener(handleStorageChange);
    };
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
  
  function clearURLs(){
    browser.storage.local.set({ 'URL-PARSER': {}}), () => {
      console.log("Clear endpoints");
    };
  }
  return (
    <div className="w-full min-h-screen">
      {(document.location.pathname.toLowerCase().includes("devtool") && <NavBar />)}
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
        <div className="text-lg flex items-center space-x-4 mt-5">
            <a href={document.location.origin + "/PopUp/popup.html#urls"} target="_blank" className="bg-gray-950 p-3 rounded-md font-semibold text-[#646cff]">WEBPAGE PANEL</a>
            <button className="a-item bg-gray-600 p-3 rounded-md" onClick={clearURLs}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="black" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7h16m-10 4v6m4-6v6M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"/></svg>
            </button>
            <a href={document.location.origin + "/PopUp/popup.html#urls/output"} target="_blank" className="a-item bg-gray-600 p-3 rounded-md font-semibold text-gray-300">OUTPUT</a>
        </div>
      </div>
    </div>
  );
}

