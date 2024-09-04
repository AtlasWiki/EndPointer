import { URLsDefaultView } from './urls-defaultview';
import { URLsTreeView } from './urls-treeview';
import { useState } from 'react';

export function URLs() {
    const [selection, setSelection] = useState("default");

    return (
        <div>
            <div className="flex">
                <button className={`px-10 py-2 font-semibold ${selection == "default" ? "text-purple-500 bg-black": ""}`} onClick={() => setSelection("default")}>DEFAULT</button>
                <button className={`px-10 py-2 font-semibold ${selection == "tree" ? "text-purple-500 bg-black": ""}`} onClick={() => setSelection("tree")}>TREE</button>
            </div>
            <div className="py-1"></div>
            {selection === "default" ? <URLsDefaultView /> : <URLsTreeView />}
        </div>
    );
}
