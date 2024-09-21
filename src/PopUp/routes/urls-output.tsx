import { useState } from 'react';
import { URLsPlain } from './urls-plain'
import { URLsCSV } from './urls-csv'

export function URLsOutput() {
    const [selection, setSelection] = useState("txt");

    return (
        <div>
            <div className="flex">
                <button className={`px-10 py-2 font-semibold ${selection == "txt" ? "text-purple-500 bg-black": ""}`} onClick={() => setSelection("txt")}>TXT</button>
                <button className={`px-10 py-2 font-semibold ${selection == "csv" ? "text-purple-500 bg-black": ""}`} onClick={() => setSelection("csv")}>CSV</button>
            </div>
            <div className="py-1"></div>
            {selection === "txt" ? <URLsPlain /> : <URLsCSV />}
        </div>
    );
}
