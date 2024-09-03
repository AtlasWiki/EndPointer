import { NavBar } from '../../components/navbar';
import "../App.css";
import "../index.css";

export function Secrets() {
    return (
        <div className="w-full min-h-screen">
            <NavBar />
            <div className="mt-5 flex flex-col w-full gap-5">
                <div className="py-1 w-full flex flex-col gap-10">
                    <table className="w-full mb-5 border-collapse">
                        <thead>
                            <tr className="text-3xl">
                                <th className="border-b-2 pb-10">IDENTIFIER</th>
                                <th className="border-b-2 pb-10">VALUE</th>
                                <th className="border-b-2 pb-10">HIT</th>
                                <th className="border-b-2 pb-10">CODE</th>
                            </tr>
                        </thead>
                        <div className="mt-20"></div>
                        <tbody>
                            <tr>
                                <td>test_user</td>
                                <td>Rachael</td>
                                <td>{window.location.host + window.location.pathname}</td>
                                <td><a href="#" target="_blank">View here</a></td>
                            </tr>
                            <tr>
                                <td>test_pw</td>
                                <td>DevP@ss123!</td>
                                <td>{window.location.host + window.location.pathname}</td>
                                <td><a href="#" target="_blank">View here</a></td>
                            </tr>
                            <tr>
                                <td>admin_pw</td>
                                <td>123456</td>
                                <td>{window.location.host + window.location.pathname}</td>
                                <td><a href="#" target="_blank">View here</a></td>
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
