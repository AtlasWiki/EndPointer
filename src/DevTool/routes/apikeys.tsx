import { NavBar } from '../../components/navbar'
import "../App.css"
import "../index.css"

export function APIKeys(){
    return(
        <div className="w-full">
            <NavBar />
            <div className="mt-5 flex flex-col w-full gap-5">
               <div className="py-1 w-full">
                    <table className="w-full">
                         <tr className="text-4xl mb-20">
                              <th className="border-b-2">Identifier</th>
                              <th className="border-b-2">Value</th>
                              <th className="border-b-2">Code Snippet</th>
                         </tr>
                         <div className="mt-20"></div>
                         <tr className="">
                              <td>herokiApiToken</td>
                              <td>flgjhlgfjhmnlfnl</td>
                              <td><a href="#" target="_blank">View here</a></td>
                         </tr>
                         <tr className="">
                              <td>api_token</td>
                              <td>ThisIsNotARealUser</td>
                              <td><a href="#" target="_blank">View here</a></td>
                         </tr>
                         <tr className="">
                              <td>key</td>
                              <td>123456235235</td>
                              <td><a href="#" target="_blank">View here</a></td>
                         </tr>
                         <tr className="">
                              <td>auth_key</td>
                              <td>1233244242456432423533243223523542235</td>
                              <td><a href="#" target="_blank">View here</a></td>
                         </tr>
                    </table>
                    <div className="mt-10 text-lg flex justify-center items-center">
                         <a href={document.location.href} target="_blank" className="m-2 bg-gray-950 p-3 rounded-md">Open in New Tab</a>
                         <button className="m-0.5">Download as TXT</button>
                    </div>
               </div>
              
            </div>
        </div>
    )
}