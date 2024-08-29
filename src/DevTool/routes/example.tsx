import { Link } from 'react-router-dom';
import { NavBar } from '../../components/navbar'
import { useEffect, useState } from "react";
// import { useEffect, useState } from "react"


// export function Example(){

//   function URLProps(endpoint){
//     return(
//         <div>
//             <p>{endpoint.url}</p>
//             <p>{endpoint.foundAt}</p>
//             <p>{endpoint.webpage}</p>
//             <p><a href="#" target="_blank">View here</a></p>
//         </div>
//     )
//   }
  
//   let urlElements = []
  
//   function URLItems(endpoint, webpage, jsFile){
//       urlElements.push( 
//           <URLProps
//               url={endpoint}
//               foundAt={webpage}
//               webpage={jsFile}
//           />
//       )
//   }
  
//   const [urls, setURLs] = useState([])
//   const [webpage, setWebpage] = useState("")
//   const [jsFile, setJSFile] = useState("")
  
//   useEffect(() => {
//       chrome.storage.local.get("URL-PARSER", (data) => {
//           const urlParser = data["URL-PARSER"];
//           Object.keys(urlParser).forEach((key) => {
//               if (key !== "current") {
//                   setWebpage(key);
//                   const currURLEndpoints = urlParser[key]["currPage"];
//                   const currURLExtJSFiles = urlParser[key]["externalJSFiles"];
                  
//                   setJSFile(currURLExtJSFiles)
//                   const endpointsInExtJSFiles = Object.values(currURLExtJSFiles).flat();
//                   const combinedURLs = [...currURLEndpoints, ...endpointsInExtJSFiles];
//                   setURLs(combinedURLs)
  
//                   urls.forEach((url) => {
//                       URLItems(url, webpage, jsFile)
//                   })
                  
//               }
//           });
//       });
//   }, []);
//     return (
//       <div>
//           {urlElements.map((url, index) => url)}
//       </div>
//     )
// }

// Define interfaces for the endpoint and the data from chrome storage
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

// Updated URLProps to accept and display the endpoint object
function URLProps({ endpoint }: { endpoint: Endpoint }) {
  return (
    <tr>
      <td>{endpoint.url}</td>
      <td>{endpoint.webpage}</td>
      <td>{endpoint.webpage}</td>
      {/* <td><a href="#" target="_blank">View here</a></td> */}
    </tr>
  );
}

export function Example() {
  const [urls, setURLs] = useState<Endpoint[]>([]);
  const [webpage, setWebpage] = useState<string>("");
  const [jsFile, setJSFile] = useState<string>("");

  useEffect(() => {
    chrome.storage.local.get("URL-PARSER", (data: { [key: string]: URLParser }) => {
      const urlParser = data["URL-PARSER"];
      let allEndpoints: Endpoint[] = [];

      Object.keys(urlParser).forEach((key) => {
        if (key !== "current") {
          setWebpage(key);
          const currURLEndpoints = urlParser[key].currPage;
          const currURLExtJSFiles = urlParser[key].externalJSFiles;

          setJSFile(JSON.stringify(currURLExtJSFiles));

          // If endpoints are objects with more information, merge them into one list
          const endpointsInExtJSFiles = Object.values(currURLExtJSFiles).flat();
          const combinedEndpoints = [
            ...currURLEndpoints,
            ...endpointsInExtJSFiles
          ];

          // Map combinedEndpoints to the URLProps component
          allEndpoints = combinedEndpoints.map((endpoint): Endpoint => ({
            url: endpoint,
            foundAt: JSON.stringify(currURLExtJSFiles),
            webpage: decodeURIComponent(key),
          }));
        }
      });

      // Set the state with the processed list of endpoints
      setURLs(allEndpoints);
    });
  }, []);

  return (
    <div className="w-full min-h-screen">
      <NavBar />
      <div className="mt-5 flex flex-col w-full gap-5">
        <div className="py-1 w-full flex flex-col gap-10">
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-3xl">
                <th className="border-b-2 pb-10">ENDPOINT</th>
                <th className="border-b-2 pb-10">LOCATION</th>
                <th className="border-b-2 pb-10">ROOT</th>
                {/* <th className="border-b-2 pb-10">CODE</th> */}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div className="w-full"> 
                    <input type="text" className="mt-5 p-1 bg-gray-500/80 text-lg w-full" />
                  </div>
                </td>
                <td>
                  <div className="w-full"> 
                    <select className="mt-5 p-1 bg-gray-500/80 text-lg w-full">
                      <option value="all">ALL</option>
                      <option value={document.location.href}>{document.location.href}</option>
                      <option value={document.location.href}>{document.location.href}</option>
                      <option value={document.location.pathname}>{document.location.pathname}</option>
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


