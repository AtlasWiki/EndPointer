import React from 'react';

interface DisplayStateProps {
    state: boolean;
  }
  

export const DisplayState: React.FC<DisplayStateProps> = ({ state }) => (
    <div className="flex">
        <div className="flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path fill={state ? "#82e467" : "#e63946"} d="M12 18a6 6 0 1 0 0-12a6 6 0 0 0 0 12"/>
        </svg>
        <span className={state ? "text-green-400 font-semibold" : "text-red-400 font-semibold"}>
            {state ? "ON" : "OFF"}
        </span>
        </div>
    </div>
);

interface DisplayScopeProps {
  scope: string;
  onRemove: () => void;
}

export const DisplayScope: React.FC<DisplayScopeProps> = ({ scope, onRemove }) => {
  return (
    <div className="flex">
      <span className="text-teal-500 py-1 px-1">{scope}</span>
      <button className="text-center pl-1 text-rose-500" onClick={onRemove}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <path fill="#df4950" d="M19 12.998H5v-2h14z" />
        </svg>
      </button>
    </div>
  );
};