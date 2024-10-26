import React from 'react';

interface ItemProps {
  url: string;
  onClick: () => void;
}

function Item({ url, onClick }: ItemProps) {
  return (
    <div
      onClick={onClick}
      className="bg-gray-500 text-white p-2 cursor-pointer text-ellipsis overflow-hidden whitespace-nowrap hover:bg-gray-600"
    >
      {url}
    </div>
  );
}

export function LocationItem(props: ItemProps) {
  return <Item {...props} />;
}

export function WebpageItem(props: ItemProps) {
  return <Item {...props} />;
}