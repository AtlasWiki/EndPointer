// src/components/LocationItem.tsx

import React from 'react';

interface LocationItemProps {
  url: string;
  onClick: () => void;
}

export function LocationItem({ url, onClick }: LocationItemProps) {
  return (
    <div
      onClick={onClick}
      className="bg-gray-500 text-white p-2 cursor-pointer text-ellipsis overflow-hidden whitespace-nowrap hover:bg-gray-600"
    >
      {url}
    </div>
  );
}