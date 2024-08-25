import { NavBar } from '../../components/navbar'
import "../App.css"
import "../index.css"

export function URLS(){
    return(
        <div className="w-full">
            <NavBar />
            <div className="mt-5 flex flex-col w-full gap-5">
               <div className="w-full"> 
                    <h1 className="text-2xl">Location:</h1>
                    <select className="mt-5 p-5 bg-gray-500/80 text-lg w-full">
                         <option value="all">ALL</option>
                         <option value={document.location.href}>{document.location.href}</option>
                         <option value={document.location.href}>{document.location.href}</option>
                         <option value={document.location.pathname}>{document.location.pathname}</option>
                    </select>
               </div>
               <div className="py-1 w-full">
                    <table className="w-full">
                         <tr className="text-4xl mb-20">
                              <th className="border-b-2">Endpoint</th>
                              <th className="border-b-2">Location</th>
                              <th className="border-b-2">Code Snippet</th>
                         </tr>
                         <div className="mt-20"></div>
                         <tr>
                              <td><input className="p-1 pb-3 text-lg rounded-md bg-gray-500/80" type="text"/></td>
                         </tr>
                         <tr className="">
                              <td>/admin</td>
                              <td>{ window.location.href }</td>
                              <td><a href="#" target="_blank">View here</a></td>
                         </tr>
                         <tr className="">
                              <td>/admin</td>
                              <td>{ window.location.href }</td>
                              <td><a href="#" target="_blank">View here</a></td>
                         </tr>
                         <tr className="">
                              <td>/admin</td>
                              <td>{ window.location.href }</td>
                              <td><a href="#" target="_blank">View here</a></td>
                         </tr>
                         <tr className="">
                              <td>/admin</td>
                              <td>{ window.location.href }</td>
                              <td><a href="#" target="_blank">View here</a></td>
                         </tr>
                         <tr className="">
                              <td>/admin</td>
                              <td>{ window.location.href }</td>
                              <td><a href="#" target="_blank">View here</a></td>
                         </tr>
                         <tr className="">
                              <td>/admin</td>
                              <td>{ window.location.href }</td>
                              <td><a href="#" target="_blank">View here</a></td>
                         </tr>
                         <tr className="">
                              <td>/admin</td>
                              <td>{ window.location.href }</td>
                              <td><a href="#" target="_blank">View here</a></td>
                         </tr>
                         <tr className="">
                              <td>/admin</td>
                              <td>{ window.location.href }</td>
                              <td><a href="#" target="_blank">View here</a></td>
                         </tr>
                         <tr className="">
                              <td>/admin</td>
                              <td>{ window.location.href }</td>
                              <td><a href="#" target="_blank">View here</a></td>
                         </tr>
                         <tr className="">
                              <td>/admin</td>
                              <td>{ window.location.href }</td>
                              <td><a href="#" target="_blank">View here</a></td>
                         </tr>
                    </table>
                    <div className="text-lg">
                         <a href={document.location.href} target="_blank" className="m-2 bg-gray-950 p-3 rounded-md">Open in New Tab</a>
                         <button className="m-0.5">Download as TXT</button>
                         <button className="m-0.5">Download as JSON</button>
                         <button className="m-0.5">Copy as absolute URLs</button>
                         <button className="m-0.5">Copy All</button>
                    </div>
               </div>
              
            </div>
        </div>
    )
}