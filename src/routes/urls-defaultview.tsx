// src/components/URLsDefaultView.tsx

import React, { useState, useRef } from 'react';
import { URLProps } from '../components/URLProps';
import { LocationItem, WebpageItem } from '../components/Locationitem';
import { useURLData } from '../hooks/useURLData';
import { clearURLs } from '../utils/defaultview_utils';
import { VISIBLE_URL_SIZE, CSS_CLASSES, FILTER_CATEGORIES } from '../constants/defaultview_contants';
import { NavBar } from '../components/navbar';

export function URLsDefaultView() {
  const [selectedLocation, setSelectedLocation] = useState<string>('All');
  const [selectedWebpage, setSelectedWebpage] = useState<string>('All');
  const [isOpenLocation, setIsOpenLocation] = useState<boolean>(false);
  const [isOpenWebpage, setIsOpenWebpage] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [startIndex, setStartIndex] = useState(0);
  const [filterToggle, setFilterToggle] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<Record<string, boolean>>(
    Object.keys(FILTER_CATEGORIES).reduce((acc, category) => {
      acc[category] = true; // Start all as unchecked
      return acc;
    }, {} as Record<string, boolean>)
  );
  const tableRef = useRef<HTMLDivElement>(null);

  const { 
    urls, 
    jsFiles, 
    filteredURLs, 
    visibleUrls, 
    setVisibleUrls,
    webpages
  } = useURLData(selectedLocation, selectedWebpage, searchQuery, startIndex, VISIBLE_URL_SIZE);

  const handleSelectLocation = (url: string) => {
    setSelectedLocation(url);
    setIsOpenLocation(false);
    setStartIndex(0);
  };

  const handleSelectWebpage = (url: string) => {
    setSelectedWebpage(url);
    setIsOpenWebpage(false);
    setStartIndex(0);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setStartIndex(0);
  };

  const handleScroll = () => {
    if (tableRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = tableRef.current;
      const bottomThreshold = 200;
      const topThreshold = 200;

      if (scrollHeight - scrollTop - clientHeight < bottomThreshold) {
        setStartIndex(prev => Math.min(prev + 20, Math.max(0, filteredURLs.length - VISIBLE_URL_SIZE)));
      } else if (scrollTop < topThreshold && startIndex > 0) {
        setStartIndex(prev => Math.max(prev - 20, 0));
      }
    }
  };

  const allSelected = Object.keys(FILTER_CATEGORIES).length > 0 &&
    Object.values(selectedCategories).every(value => value);

  const handleSelectAllChange = () => {
    const newSelectedCategories = Object.keys(FILTER_CATEGORIES).reduce((acc, category) => {
      acc[category] = !allSelected; // Toggle the selection based on current state
      return acc;
    }, {} as Record<string, boolean>);
    
    setSelectedCategories(newSelectedCategories); // Update state with new selections
  };

  const handleCheckboxChange = (category: string) => {
    setSelectedCategories(prev => ({
      ...prev,
      [category]: !prev[category], // Toggle the individual checkbox
    }));
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center px-4 md:px-8">
      {(document.location.pathname.toLowerCase().includes("devtool") && <NavBar />)}
      
      <div className="w-full max-w-7xl mt-5">
        <div className="flex flex-col gap-8">
          <div className="w-full max-h-[760px] overflow-auto rounded-lg" ref={tableRef} onScroll={handleScroll}>
            <div className="min-w-full inline-block align-middle">
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead>
                    <tr className="text-xl md:text-3xl text-white">
                      <th className="border-b-2 pb-6 md:pb-10 px-2 md:px-4">
                        ENDPOINT <span className="text-customFont">({filteredURLs.length})</span>
                      </th>
                      <th className="border-b-2 pb-6 md:pb-10 px-2 md:px-4">
                        SOURCE <span className="text-customFont">({jsFiles.length})</span>
                      </th>
                      <th className="border-b-2 pb-6 md:pb-10 px-2 md:px-4">
                        WEBPAGE <span className="text-customFont">({webpages.length})</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    <tr>
                      <td className="px-2 md:px-4">
                        {/* Search button */}
                        <div className="mt-5 w-full flex gap-6">
                          {/* <button className="bg-transparent border-2 border-customFont hover:border-gray-300 hover:border-2 py-2 px-4 rounded-md">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#316E7D" stroke="#316E7D" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 3h16a1 1 0 0 1 1 1v1.586a1 1 0 0 1-.293.707l-6.414 6.414a1 1 0 0 0-.293.707v6.305a1 1 0 0 1-1.242.97l-2-.5a1 1 0 0 1-.758-.97v-5.805a1 1 0 0 0-.293-.707L3.293 6.293A1 1 0 0 1 3 5.586V4a1 1 0 0 1 1-1"/></svg>
                          </button> */}
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className={`${CSS_CLASSES.INPUT} w-full`}
                            placeholder="Search endpoints..."
                          />
                        {/* Filter button */}
                         <button className={`${ filterToggle ? 'bg-customFont'  : ""} border-2 border-customFont hover:border-gray-300 hover:border-2 py-2 px-4 rounded-md`} onClick={() => {setFilterToggle(!filterToggle)}}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill={`${filterToggle ? '#141e24' : '#316E7D'}`} stroke={`${filterToggle ? '#141e24' : '#316E7D'}`} stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 3h16a1 1 0 0 1 1 1v1.586a1 1 0 0 1-.293.707l-6.414 6.414a1 1 0 0 0-.293.707v6.305a1 1 0 0 1-1.242.97l-2-.5a1 1 0 0 1-.758-.97v-5.805a1 1 0 0 0-.293-.707L3.293 6.293A1 1 0 0 1 3 5.586V4a1 1 0 0 1 1-1"/></svg>
                          </button>
                        </div>
                        {/* Filter menu */}
                        {filterToggle && (
                          <div className="mt-2 border-2 w-full border-customFont bg-transparent grid grid-cols-3 gap-9 p-10 rounded-sm">
                            <label className="font-semibold text-sm flex items-center gap-2">
                              {/* Custom Select All Checkbox */}
                              <div
                                className={`cursor-pointer w-6 h-6 border-2 border-customFont ${allSelected ? 'bg-[#316E7D]' : 'bg-transparent'} flex items-center justify-center`}
                                onClick={handleSelectAllChange}
                              />
                              Toggle All
                            </label>
                            {Object.entries(FILTER_CATEGORIES).map(([category, colorClass]) => (
                              <label key={category} className={`flex items-center w-full gap-2 font-semibold text-sm`}>
                                {/* Custom Checkbox for each category with color codes */}
                                <div
                                  className={`cursor-pointer w-6 h-6 border-2 border-customFont ${selectedCategories[category] ? 'bg-[#316E7D]' : 'bg-transparent'} flex items-center justify-center`}
                                  onClick={() => handleCheckboxChange(category)} // Handle individual checkbox clicks
                                />
                                <span className={colorClass}>{category.replace(/_/g, ' ')}</span> {/* Use color codes for text */}
                              </label>
                            ))}
                          </div>
                        )}
                      </td>
                      {/* Location/Source */}
                      <td className="px-2 md:px-4">
                        <div className="relative mt-5 w-full">
                          <button
                            onClick={() => setIsOpenLocation(!isOpenLocation)}
                            className="w-full px-2 border-2 mt-2 py-3 border-customFont text-white bg-transparent text-sm md:text-lg rounded-md overflow-hidden whitespace-nowrap py-2 mb-2 hover:border-gray-300 hover:border-2"
                          >
                            {selectedLocation}
                          </button>
                          {isOpenLocation && (
                            <div className="absolute mt-1 w-full bg-white border-2 border-gray-500 rounded-md shadow-lg z-10 max-h-60 overflow-auto">
                              {jsFiles.map((url, index) => (
                                <LocationItem key={index} url={url} onClick={() => handleSelectLocation(url)} />
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      {/* Webpage */}
                      <td className="px-2 md:px-4">
                        <div className="relative mt-5 w-full">
                          <button
                            onClick={() => setIsOpenWebpage(!isOpenWebpage)}
                            className="w-full px-2 mt-2 py-3 border-2 border-customFont text-white bg-transparent text-sm md:text-lg rounded-md overflow-hidden whitespace-nowrap py-2 mb-2 hover:border-gray-300 hover:border-2"
                          >
                            {selectedWebpage}
                          </button>
                          {isOpenWebpage && (
                            <div className="absolute mt-1 w-full bg-white border-2 border-gray-500 rounded-md shadow-lg z-10 max-h-60 overflow-auto">
                              {webpages.map((url, index) => (
                                <WebpageItem key={index} url={url} onClick={() => handleSelectWebpage(url)} />
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                    {visibleUrls.map((endpoint, index) => (
                      <URLProps key={startIndex + index} endpoint={endpoint} searchQuery={searchQuery} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="text-lg flex items-start space-x-8 px-4 w-full">
            <a href={document.location.origin + "/PopUp/popup.html#urls"} target="_blank" className="text-sm flex flex-col items-center space-x-2 px-5 rounded-md py-3 bg-customFont text-white border-2 border-customFont">WEBPAGE PANEL</a>
            <button className="text-center border-customFont bg-gradient-to-r from-customFont to-customBg text-white text-sm flex items-center px-5 rounded-md py-3" onClick={clearURLs}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <path fill="none" stroke="red" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7h16m-10 4v6m4-6v6M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"/>
              </svg>
            </button>
            <a href={document.location.origin + "/PopUp/popup.html#urls/output"} target="_blank" className="text-sm flex flex-col items-center px-5 rounded-md py-3 bg-customBg border-2 border-customFont text-white">OUTPUT</a>
          </div>
        </div>
      </div>
    </div>
  );
}
