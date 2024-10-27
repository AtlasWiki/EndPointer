import { URLsDefaultView } from './urls-defaultview';
import { URLsTreeView } from './urls-treeview';
import { useState } from 'react';

export function URLs() {
    const [selection, setSelection] = useState("default");

    return (
        <div className="flex items-center flex-col gap-5 w-full">
        {/* Container for buttons with full width */}
        <div className="p-8 flex w-full gap-2">
  <button 
    className={`w-full px-10 py-3 font-semibold ${selection === "default" ? "bg-customBg border-2 border-customFont text-white" : "bg-customFont text-white"}`} 
    onClick={() => setSelection("default")}
  >
    DEFAULT
  </button>
  <button 
    className={`w-full px-10 py-2 font-semibold ${selection === "tree" ? "bg-customBg border-2 border-customFont text-white" : "bg-customFont text-white"}`} 
    onClick={() => setSelection("tree")}
  >
    TREE
  </button>
</div>
  
        <div className="py-1"></div>
  
        {selection === "default" ? <URLsDefaultView /> : <URLsTreeView />}
      </div>
    );
}
