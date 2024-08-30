import { NavBar } from '../../components/navbar';
import "../App.css";
import "../index.css";

export function URLS() {
    return (
        <div className="w-full min-h-screen">
            <NavBar />
            <div className="mt-5 flex flex-col w-full gap-5">
                <div className="py-1 w-full flex flex-col gap-10">
                    <table className="w-full mb-5 border-collapse">
                        <thead>
                            <tr className="text-3xl">
                                <th className="border-b-2 pb-10">ENDPOINT</th>
                                <th className="border-b-2 pb-10">LOCATION</th>
                                <th className="border-b-2 pb-10">LINKED</th>
                                <th className="border-b-2 pb-10">CODE</th>
                            </tr>
                        </thead>
                        <div className="mt-20"></div>
                        <tbody>
                            <tr>
                              <td>
                                   <div className="w-full mb-5 px-5"> 
                                        {/* <h1 className="text-2xl">Location:</h1> */}
                                       <input type="text" className="mt-5 p-1 bg-gray-500/80 text-lg w-full" />
                                   </div>
                              </td>
                              <td>
                                   <div className="w-full mb-5 px-5"> 
                                        {/* <h1 className="text-2xl">Location:</h1> */}
                                        <select className="mt-5 p-1 bg-gray-500/80 text-lg w-full">
                                             <option value="all">ALL</option>
                                             <option value={document.location.href}>{document.location.href}</option>
                                             <option value={document.location.href}>{document.location.href}</option>
                                             <option value={document.location.pathname}>{document.location.pathname}</option>
                                        </select>
                                   </div>
                              </td>
                            
                            </tr>
                            <tr>
                                <td>/admin</td>
                                <td>{window.location.href}</td>
                                <td>{window.location.host + window.location.pathname}</td>
                                <td><a href="#" target="_blank">View here</a></td>
                            </tr>
                            <tr>
                                <td>/admin</td>
                                <td>{window.location.href}</td>
                                <td>{window.location.host + window.location.pathname}</td>
                                <td><a href="#" target="_blank">View here</a></td>
                            </tr>
                            <tr>
                                <td>/admin</td>
                                <td>{window.location.href}</td>
                                <td>{window.location.host + window.location.pathname}</td>
                                <td><a href="#" target="_blank">View here</a></td>
                            </tr>
                            <tr>
                                <td>/admin</td>
                                <td>{window.location.href}</td>
                                <td>{window.location.host + window.location.pathname}</td>
                                <td><a href="#" target="_blank">View here</a></td>
                            </tr>
                        </tbody>
                    </table>
                    <div className="text-lg flex items-center space-x-4 px-5">
                        <a href={document.location.origin + "/PopUp/popup.html#example"} target="_blank" className="bg-gray-950 p-3 rounded-md">Open in New Tab</a>
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
