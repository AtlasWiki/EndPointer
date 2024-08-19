import { NavBar } from '../components/navbar'
export function URLS(){
    return(
        <div>
            <NavBar />
            <h1 className="mb-1">URLS</h1>
            <div className="py-1 bg-gray-950/20 overflow-y-auto max-h-40">
                <table className="w-full">
                    <tr>
                        <th>Endpoint</th>
                        <th>Location</th>
                        <th>Code Snippet</th>
                    </tr>
                   <tr>
                        <td>/admin</td>
                        <td>{ window.location.pathname }</td>
                        <a href="#" target="_blank">View here</a>
                   </tr>
                   <tr>
                        <td>/admin</td>
                        <td>{ window.location.pathname }</td>
                        <a href="#" target="_blank">View here</a>
                   </tr>
                   <tr>
                        <td>/admin</td>
                        <td>{ window.location.pathname }</td>
                        <a href="#" target="_blank">View here</a>
                   </tr>
                   <tr>
                        <td>/admin</td>
                        <td>{ window.location.pathname }</td>
                        <a href="#" target="_blank">View here</a>
                   </tr>
                   <tr>
                        <td>/admin</td>
                        <td>{ window.location.pathname }</td>
                        <a href="#" target="_blank">View here</a>
                   </tr>
                   <tr>
                        <td>/admin</td>
                        <td>{ window.location.pathname }</td>
                        <a href="#" target="_blank">View here</a>
                   </tr>
                   <tr>
                        <td>/admin</td>
                        <td>{ window.location.pathname }</td>
                        <a href="#" target="_blank">View here</a>
                   </tr>
                   <tr>
                        <td>/admin</td>
                        <td>{ window.location.pathname }</td>
                        <a href="#" target="_blank">View here</a>
                   </tr>
                   <tr>
                        <td>/admin</td>
                        <td>{ window.location.pathname }</td>
                        <a href="#" target="_blank">View here</a>
                   </tr>
                   <tr>
                        <td>/admin</td>
                        <td>{ window.location.pathname }</td>
                        <a href="#" target="_blank">View here</a>
                   </tr>
                </table>
            </div>
            <div className="m-4">
                <button className="m-0.5">Download as TXT</button>
                <button className="m-0.5">Download as JSON</button>
                <button className="m-0.5">Copy as absolute URLs</button>
                <button className="m-0.5">Copy All</button>
            </div>
          
            <p className="mt-2">
                Located at  { document.location.href }
            </p>
        </div>
    )
}