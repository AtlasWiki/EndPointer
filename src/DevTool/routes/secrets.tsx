import { NavBar } from '../../components/navbar';
import "../App.css";
import "../index.css";

export function Secrets() {
    return (
        <div className="w-full min-h-screen">
          <div className="ml-2 mt-2">
            <NavBar />
            <button className="a-item a-color mt-2" onClick={() => location.reload()}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="#4d4c4c" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M19.933 13.041a8 8 0 1 1-9.925-8.788c3.899-1 7.935 1.007 9.425 4.747"/><path d="M20 4v5h-5"/></g></svg>
            </button>
          </div>
          <div className="mt-5 flex">
            <div className="py-1 w-full flex flex-col gap-10">
              <div className="w-full max-h-[760px] overflow-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="text-5xl">
                      <th className="secrets-th border-b-2 pb-10">IDENTIFIER <span className="text-[#3da28f]"></span></th>
                      <th className="secrets-th border-b-2 pb-10">VALUE</th>
                      <th className="secrets-th border-b-2 pb-10">LOCATION</th>
                      <th className="secrets-th border-b-2 pb-10">CODE</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                        <td className="secrets-td">AUTH_KEY</td>
                        <td className="secrets-td">123supersecret</td>
                        <td className="secrets-td">http://blah.com/parse.js</td>
                        <td className="secrets-td"><a href="#">View Here</a></td>
                    </tr>
                    <tr>
                        <td className="secrets-td">admin_pw</td>
                        <td className="secrets-td">123supersecretadmin</td>
                        <td className="secrets-td">http://blah.com/parse.js</td>
                        <td className="secrets-td"><a href="#">View Here</a></td>
                    </tr>

                    {/* <tr>
                      <td className="secrets-td">
                        

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
    
                      <td className="secrets-td">
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
                    </tr> */}
                    {/* {filteredURLs.map((endpoint, index) => (
                      <URLProps key={index} endpoint={endpoint} searchQuery={searchQuery} />
                    ))} */}
                  </tbody>
                </table>
              </div>
              <div className="text-lg flex items-center space-x-4 px-5">
                <a href={document.location.origin + "/PopUp/popup.html#urls"} target="_blank" className="bg-gray-950 p-3 rounded-md">Open in New Tab</a>
                {/* <button className="a-item bg-gray-600 p-3 rounded-md" onClick={clearURLs}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="black" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7h16m-10 4v6m4-6v6M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"/></svg>
                </button> */}
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
