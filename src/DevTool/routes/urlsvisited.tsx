import { NavBar } from '../../components/navbar';
import "../App.css";
import "../index.css";

export function URLSVisited(){
    // Have to create logic in "fetching" the date from storage
    const d = new Date();

    // Have to create logic in "fetching" visited urls
    // Have to create logic in "fetching" files
    return (
        <div className="w-full min-h-screen">
            <NavBar />
            <div className="mt-5 flex flex-col w-full gap-5">
                <div className="py-1 w-full flex flex-col gap-10">
                    <table className="w-full mb-5 border-collapse">
                        <thead>
                            <tr className="text-2xl">
                                <th className="border-b-2 pb-10">URLS VISITED</th>
                                <th className="border-b-2 pb-10">FILES</th>
                                <th className="border-b-2 pb-10">FILE CHANGED</th>
                                <th className="border-b-2 pb-10">LAST ACCESSED</th>
                            </tr>
                        </thead>
                        <div className="mt-20"></div>
                        <tbody>
                            <tr>
                                <td>{ document.location.href }</td>
                                <td>cart.js</td>
                                <td>YES</td>
                                <td>{d.toString()}</td>
                            </tr>
                            <tr>
                                <td>{ document.location.href }</td>
                                <td>cart.js</td>
                                <td>YES</td>
                                <td>{d.toString()}</td>
                            </tr>
                            <tr>
                                <td>{ document.location.href }</td>
                                <td>cart.js</td>
                                <td>YES</td>
                                <td>{d.toString()}</td>
                            </tr>
                        </tbody>
                    </table>
                    <div className="text-lg flex items-center space-x-4 px-5">
                        <a href={document.location.href} target="_blank" className="bg-gray-950 p-3 rounded-md">Open in New Tab</a>
                        <button className="bg-gray-800 p-3 rounded-md">Download as TXT</button>
                    </div>
                </div>
            </div>
        </div>
    );
}