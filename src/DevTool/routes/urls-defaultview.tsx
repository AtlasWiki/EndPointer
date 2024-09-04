import { useEffect, useState } from "react";
import { NavBar } from '../../components/navbar';

export function URLsDefaultView() {
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
    const regexControlChars = ".^$*+?\\|()[]{}";
    let escapedQuery = '';
    for (const char of searchQuery) {
        if (regexControlChars.includes(char)) {
            escapedQuery += '\\';
        }
        escapedQuery += char;
    }
    const parts = endpoint.url.split(new RegExp(`(${escapedQuery})`, 'gi'));

    const [isGenerateReportOpen, setIsGenerateReportOpen] = useState(false);
    const [isViewCodeOpen, setIsViewCodeOpen] = useState(false);
    const [isSeeResponseOpen, setIsSeeResponseOpen] = useState(false);

    const closeAllModals = () => {
      setIsGenerateReportOpen(false);
      setIsViewCodeOpen(false);
      setIsSeeResponseOpen(false);
    };

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
          <div className="flex mt-2 items-center gap-1">
            <button
              className="i-button"
              onClick={() => setIsGenerateReportOpen(true)}
            >
              <svg className="cursor-pointer hover:opacity-80" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <g fill="none" stroke="#3da28f" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
                  <path d="M8 5H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5.697M18 12V7a2 2 0 0 0-2-2h-2"/>
                  <path d="M8 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2m0 6h4m-4 4h3m3 2.5a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0-5 0m4.5 2L21 22"/>
                </g>
                <title>Generate Report</title>
              </svg>
            </button>
            <button
              className="i-button"
              onClick={() => setIsViewCodeOpen(true)}
            >
              <svg className="cursor-pointer hover:opacity-80" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <path fill="#3da28f" d="m8 18l-6-6l6-6l1.425 1.425l-4.6 4.6L9.4 16.6zm8 0l-1.425-1.425l4.6-4.6L14.6 7.4L16 6l6 6z"/>
                <title>View Code Snippet</title>
              </svg>
            </button>
            <button
              className="i-button"
              onClick={() => setIsSeeResponseOpen(true)}
            >
              <svg className="cursor-pointer hover:opacity-80" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <path fill="#3da28f" d="M20 4H6c-1.103 0-2 .897-2 2v5h2V8l6.4 4.8a1 1 0 0 0 1.2 0L20 8v9h-8v2h8c1.103 0 2-.897 2-2V6c0-1.103-.897-2-2-2m-7 6.75L6.666 6h12.668z"/>
                <path fill="#3da28f" d="M2 12h7v2H2zm2 3h6v2H4zm3 3h4v2H7z"/>
                <title>See Response</title>
              </svg>
            </button>
          </div>

          {/* Modal for Generate Report */}
          {isGenerateReportOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50" onClick={closeAllModals}>
              <div className="bg-white p-5 rounded-lg shadow-lg" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-semibold text-black">Generate Report for {endpoint.url}</h2>
                <p className="text-black">Content for Generate Report modal.</p>
                <button className="mt-3 px-4 py-2 bg-blue-500 text-white rounded" onClick={() => setIsGenerateReportOpen(false)}>Close</button>
              </div>
            </div>
          )}

          {/* Modal for View Code Snippet */}
          {isViewCodeOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50" onClick={closeAllModals}>
              <div className="bg-white p-5 rounded-lg shadow-lg" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-semibold text-black">View Code Snippet for {endpoint.url}</h2>
                <p className="text-black">Content for View Code Snippet modal.</p>
                <button className="mt-3 px-4 py-2 bg-blue-500 text-white rounded" onClick={() => setIsViewCodeOpen(false)}>Close</button>
              </div>
            </div>
          )}

          {/* Modal for See Response */}
          {isSeeResponseOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50" onClick={closeAllModals}>
              <div className="bg-white p-5 rounded-lg shadow-lg" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-semibold text-black">See Response for {endpoint.url}</h2>
                <p className="text-black">Content for See Response modal.</p>
                <button className="mt-3 px-4 py-2 bg-blue-500 text-white rounded" onClick={() => setIsSeeResponseOpen(false)}>Close</button>
              </div>
            </div>
          )}
        </td>
        <td className="break-words max-w-lg">{endpoint.foundAt}</td>
        <td className="break-words max-w-lg text-center">{endpoint.webpage}</td>
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
      window.location.reload();
    }

  return (
    <div className="w-full min-h-screen">
      <div className="ml-2 mt-2">
        <NavBar />
        <button className="a-item a-color mt-2" onClick={() => location.reload()}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="#4d4c4c" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><path d="M19.933 13.041a8 8 0 1 1-9.925-8.788c3.899-1 7.935 1.007 9.425 4.747"/><path d="M20 4v5h-5"/></g></svg>
        </button>
      </div>
      <div className="mt-5 flex">
        <div className="py-1 w-full flex flex-col gap-10">
          <div className="w-full max-h-[760px] overflow-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="text-5xl">
                  <th className="border-b-2 pb-10">ENDPOINT <span className="text-[#3da28f]">({filteredURLs.length})</span></th>
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
                          cursor-pointer text-gray-300 hover:border-gray-500 outline-none focus:border-gray-500 transition-all duration-400"
                        placeholder="Search endpoints..."
                      />
                    </div>
                  </td>

                  <td>
                    <div className="relative w-full max-w-lg mt-5">
                      <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="a-item w-full px-2 border-2 border-gray-300 bg-transparent text-lg rounded-md overflow-hidden text-ellipsis whitespace-nowrap"
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
            <button className="a-item bg-gray-600 p-3 rounded-md" onClick={clearURLs}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="black" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7h16m-10 4v6m4-6v6M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"/></svg>
            </button>
            <button className="a-item bg-gray-600 p-3 rounded-md">Download as TXT</button>
            <button className="a-item bg-gray-600 p-3 rounded-md">Download as JSON</button>
            <button className="a-item bg-gray-600 p-3 rounded-md">Copy as absolute URLs</button>
            <button className="a-item bg-gray-600 p-3 rounded-md">Copy All</button>
          </div>
        </div>
      </div>
    </div>
  );
}