import { useEffect, useRef, useState } from "react";
import browser from 'webextension-polyfill';
import { NavBar } from '../../components/navbar';
import { js as beautify } from 'js-beautify';

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

    type HttpMethod = 'GET' | 'POST' | 'PUT' | 'OPTIONS';

    const [isGenerateReportOpen, setIsGenerateReportOpen] = useState(false);
    const [isViewCodeOpen, setIsViewCodeOpen] = useState(false);
    const [isSeeResponseOpen, setIsSeeResponseOpen] = useState(false);
    const [respStatus, setRespStatus] = useState<Record<HttpMethod, number>>({
      GET: 0,
      POST: 0,
      PUT: 0,
      OPTIONS: 0
    });

    const [respStatusMessage, setRespStatusMessage] = useState<Record<HttpMethod, string>>({
      GET: "",
      POST: "",
      PUT: "",
      OPTIONS: ""
    });

    const [respBody, setRespBody] = useState<Record<HttpMethod, string>>({
      GET: "",
      POST: "",
      PUT: "",
      OPTIONS: ""
    });

    const [currentMethod, setCurrentMethod] = useState<HttpMethod>("GET");

    const closeAllModals = () => {
      setIsGenerateReportOpen(false);
      setIsViewCodeOpen(false);
      setIsSeeResponseOpen(false);
    };

    const [headers, setHeaders] = useState<Record<HttpMethod, string[]>>({
      GET: [],
      POST: [],
      PUT: [],
      OPTIONS: []
    });

    // Sanitize urls
    const sanitizedURL = () => {
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

    // Logic for capturing response headers
    useEffect(() => {
      const fetchData = async (method: string) => {
        const verifiedURL = sanitizedURL();
        try {
          const response = await fetch(verifiedURL, { method });
          const fetchedHeaders: string[] = [];
          response.headers.forEach((value, header) => {
            fetchedHeaders.push(`${header}: ${value}`);
          });
          setHeaders(prev => ({ ...prev, [method]: fetchedHeaders }));
          setRespStatus(prev => ({ ...prev, [method]: response.status }));
          setRespStatusMessage(prev => ({ ...prev, [method]: response.statusText }));

          const responseBody = await response.text();
          const beautifiedHTML = beautify(responseBody, {
            indent_size: 2,
            indent_char: ' ',
            preserve_newlines: true,
            max_preserve_newlines: 2,
            end_with_newline: true,
            wrap_line_length: 0,
          });
          setRespBody(prev => ({ ...prev, [method]: beautifiedHTML }));
        } catch (error) {
          const errorMessage = (error as Error).message || 'An unknown error occurred';
          setHeaders(prev => ({ ...prev, [method]: [`Error: ${errorMessage}`] }));
          setRespStatus(prev => ({ ...prev, [method]: 0 }));
          setRespStatusMessage(prev => ({ ...prev, [method]: "Failed to fetch" }));
        }
      };

      if (isSeeResponseOpen) {
        fetchData("GET");
        fetchData("POST");
        fetchData("PUT");
        fetchData("OPTIONS");
      }
    }, [isSeeResponseOpen]);

    const [codeSnippet, setCodeSnippet] = useState<string[]>([]);
      useEffect(() => {
        if (isViewCodeOpen) {
          fetch(endpoint.foundAt)
            .then(res => res.text())
            .then(code => {
              const beautifiedCode = beautify(code);
              const regex = new RegExp(`(?:^.*?(?:\\n.*?){0,1}(${endpoint.url}).*?(?:\\n.*?){0,1})`, 'gs');
              console.log(beautifiedCode)
              // const regex = new RegExp(`(${endpoint.url})`, 'gs');
              const matches = beautifiedCode.match(regex); // Use beautifiedCode for matching
    
              // Handle matches being null
              setCodeSnippet(matches || []); // Set to an empty array if no matches
            })
            .catch(() => {
              console.error("request failed");
            });
        }
      }, [isViewCodeOpen]);

      const logCodeSnippet = () => {
        console.log(codeSnippet);
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
            {/* <button
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
            </button> */}
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
                <h2 className="text-xl font-semibold text-black">Generate Report for {sanitizedURL()}</h2>
                <p className="text-black">Content for Generate Report modal.</p>
                <button className="mt-3 px-4 py-2 bg-blue-500 text-white rounded" onClick={() => setIsGenerateReportOpen(false)}>Close</button>
              </div>
            </div>
          )}

           {/* Modal for View Code Snippet */}
           {isViewCodeOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50" onClick={closeAllModals}>
              <div className="bg-[#363333] opacity-85 p-5 rounded-lg shadow-lg max-w-6xl max-h-screen overflow-auto" onClick={e => e.stopPropagation()}>
                {/* <button onClick={logCodeSnippet}>Log Code Snippet</button> */}
                <h2 className="text-lg font-semibold text-gray-400 mb-5">View Code Snippet for {sanitizedURL()}</h2>
                <p className="font-semibold text-gray-400">Content for View Code Snippet modal.</p>
                <div>
                  {codeSnippet.map((snippet, index) => (
                      <pre key={index}>
                        <code>{snippet}</code>
                      </pre>
                    ))}
                </div>
                <button className="mt-3 px-4 py-2 bg-black text-white rounded" onClick={() => setIsViewCodeOpen(false)}>Close</button>
              </div>
            </div>
          )}

         {/* Modal for See Response */}
        {isSeeResponseOpen && (
          <div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
            onClick={closeAllModals}
          >
            <div
              className="bg-[#363333] opacity-85 p-5 rounded-lg shadow-lg max-w-6xl max-h-screen overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-gray-400">
                See Response for {sanitizedURL()}
              </h2>

              {/* Map and display the fetched headers */}
              <div className="mt-3">
                <h3 className="text-lg font-semibold text-gray-400 mb-5">Response</h3>
                <ul className="text-black overflow-y-auto p-2 bg-[#363333] opacity-85 rounded-md max-h-160">
                  <select 
                    className="font-bold text-2xl text-purple-200 mb-4 bg-gray-600 w-full py-2 px-2"
                    value={currentMethod}
                    onChange={(e) => setCurrentMethod(e.target.value as HttpMethod)}
                  >
                    <option value="GET">[{respStatus.GET}] {respStatusMessage.GET} GET</option>
                    <option value="POST">[{respStatus.POST}] {respStatusMessage.POST} POST</option>
                    <option value="PUT">[{respStatus.PUT}] {respStatusMessage.PUT} PUT</option>
                    <option value="OPTIONS">[{respStatus.OPTIONS}] {respStatusMessage.OPTIONS} OPTIONS</option>
                  </select>
                  {headers[currentMethod].map((header, index) => {
                    const [headerName, ...rest] = header.split(': ');
                    return (
                      <li key={index} className="p-1">
                        <span className="font-bold text-purple-200">{headerName}:</span>
                        <span className="text-gray-200"> {rest.join(': ')}</span>
                      </li>
                    );
                  })}
                  <li>
                    <pre className="mt-5">
                      <span className="text-gray-200">{respBody[currentMethod]}</span>
                    </pre>
                  </li>
                </ul>
              </div>

              <button
                className="mt-3 px-4 py-2 bg-black text-white rounded"
                onClick={() => setIsSeeResponseOpen(false)}
              >
                Close
              </button>
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

  //Right, So I'm going to add lazing loading, I gonna require a some states, one that tracks urls that are visable
  // one that keeps track of the index and one define how many urls we want to see. 
  const [visableUrls, setVisableUrls] = useState<Endpoint[]>([]);
  const [startIndex, setStartIndex] = useState(0);
  const VISABLE_URL_SIZE = 100; // To set how many to display in the sliding window.
  const table_Ref = useRef<HTMLDivElement>(null); //Reference to the scroll window;


  useEffect(() => {
    const fetchData = () => {
      let allEndpoints: Endpoint[] = [];
      let locations: Location[] = [];

      browser.storage.local.get("URL-PARSER").then((data: { [key: string]: any }) => {
        const urlParser = data["URL-PARSER"];

        Object.keys(urlParser).forEach((key) => {
          if (key !== "current") {
            const currURLEndpoints = urlParser[key].currPage;
            const currURLExtJSFiles = urlParser[key].externalJSFiles;
            locations.push(decodeURIComponent(key));

            // Add currPage endpoints
            allEndpoints.push(...currURLEndpoints.map((endpoint: any): Endpoint => ({
              url: endpoint,
              foundAt: decodeURIComponent(key), // Found at the main webpage
              webpage: decodeURIComponent(key),
            })));

            // Add externalJSFiles endpoints
            Object.entries(currURLExtJSFiles).forEach(([jsFile, endpoints]) => {
              const decodedJsFile = decodeURIComponent(jsFile);
              if (!locations.includes(decodedJsFile)) {
                locations.push(decodedJsFile);
              }
              allEndpoints.push(...(endpoints as any).map((endpoint: any): Endpoint => ({
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
    };

    // Initial fetch
    fetchData();

    // Listener for storage changes
    const handleStorageChange = (changes: { [key: string]: browser.Storage.StorageChange }) => {
      if (changes["URL-PARSER"]) {
        fetchData(); // Re-fetch data when URL-PARSER changes
      }
    };

    browser.storage.onChanged.addListener(handleStorageChange);

    // Cleanup listener on component unmount
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

   //I think I need to change this a useEffect, so that I can update it with the search bar???
   const filteredURLs = urls
   .filter(endpoint => {
     const matchesLocation = selected === 'All' || endpoint.foundAt === selected;
     const matchesQuery = endpoint.url.toLowerCase().includes(searchQuery.toLowerCase());
     return matchesLocation && matchesQuery;
   });

  useEffect(() =>{
     //set the visable urls to match the search critera starting for the 0 value to the 
    // maximum of the startIndex+ the amout of urls we want visable at once
    setVisableUrls(filteredURLs.slice(startIndex, startIndex + VISABLE_URL_SIZE));
  },[urls, selected, searchQuery, startIndex]);
  
  //I'm pretty sure these dependecies are all we need, I may need to provide the reference too

  //I also need a function to handle the scroll bar   
  const handleScroll = () => {
    if (table_Ref.current) {
      const { scrollTop, scrollHeight, clientHeight } = table_Ref.current;
      const bottomThreshold = 200; // pixels from bottom to trigger load
      const topThreshold = 200; // pixels from top to trigger load

      if (scrollHeight - scrollTop - clientHeight < bottomThreshold) {
        // Load more items at the bottom
        setStartIndex(prev => Math.min(prev + 20, urls.length - VISABLE_URL_SIZE));
      } else if (scrollTop < topThreshold && startIndex > 0) {
        // Load more items at the top
        setStartIndex(prev => Math.max(prev - 20, 0));
      } 
    }
  };
  
  function clearURLs(){
    browser.storage.local.set({ 'URL-PARSER': {}}).then( () => {
      console.log("Clear endpoints");
    });
  }

  return (
    <div className="w-full min-h-screen">
      <div className="ml-2 mt-2">
        <NavBar />
        <button className="a-item a-color mt-2" onClick={() => location.reload()}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="#4d4c4c" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><path d="M19.933 13.041a8 8 0 1 1-9.925-8.788c3.899-1 7.935 1.007 9.425 4.747"/><path d="M20 4v5h-5"/></g></svg>
        </button>
        <thead>
                <tr className="text-5xl">
                  <th className="border-b-2 pb-10">ENDPOINT <span className="text-[#3da28f]">({filteredURLs.length})</span></th>
                  <th className="border-b-2 pb-10">SOURCE <span className="text-[#3da28f]">({jsFiles.length})</span></th>
                  <th className="border-b-2 pb-10">WEBPAGE</th>
                </tr>
        </thead>
      </div>
      <div className="mt-5 flex">
        <div className="py-1 w-full flex flex-col gap-10">
          <div className="w-full max-h-[760px] overflow-auto"
          ref={table_Ref}
          onScroll={handleScroll}>  {/* I think this is the correct place to add the scrool handler*/}
            <table className="w-full border-collapse">
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
                {visableUrls.map((endpoint, index) => (
                  <URLProps key={startIndex + index} endpoint={endpoint} searchQuery={searchQuery} />
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-lg flex items-center space-x-4 px-5">
            <a href={document.location.origin + "/PopUp/popup.html#urls"} target="_blank" className="bg-gray-950 p-3 rounded-md font-semibold text-[#646cff]">WEBPAGE PANEL</a>
            <button className="a-item bg-gray-600 p-3 rounded-md" onClick={clearURLs}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="black" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7h16m-10 4v6m4-6v6M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"/></svg>
            </button>
            <a href={document.location.origin + "/PopUp/popup.html#urls/output"} target="_blank" className="a-item bg-gray-600 p-3 rounded-md font-semibold text-gray-300">OUTPUT</a>
          </div>
        </div>
      </div>
    </div>
  );
}