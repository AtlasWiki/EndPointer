import { useState } from 'react';
import { URLsPlain } from './urls-plain'
import { URLsCSV } from './urls-csv'
import { URLsUnmodified } from './urls-unmodified'

export function URLsOutput() {
    const [selection, setSelection] = useState("txt");

    return (
        <div>
            <div className="flex">
                <button className={`px-10 py-2 font-semibold ${selection == "txt" ? "text-purple-500 bg-black": ""}`} onClick={() => setSelection("txt")}>TXT</button>
                <button className={`px-10 py-2 font-semibold ${selection == "csv" ? "text-purple-500 bg-black": ""}`} onClick={() => setSelection("csv")}>CSV</button>
                <button className={`px-10 py-2 font-semibold ${selection == "unmodified" ? "text-purple-500 bg-black": ""}`} onClick={() => setSelection("unmodified")}>UNMODIFIED</button>
            </div>
            <div className="py-1"></div>
            {selection === "txt" && <URLsPlain />}
            {selection === "csv" && <URLsCSV />}
            {selection === "unmodified" && <URLsUnmodified />}
        </div>
    );
}
