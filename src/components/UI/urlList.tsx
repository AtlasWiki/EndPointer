// src/popup/components/URLList.tsx
import React, { useEffect, useState } from 'react';
import { getURLParserState } from '../sharedTypes/storage';
import { ParsedUrlRecords } from '../sharedTypes/types';

interface URLListProps {
  parsedData: ParsedUrlRecords;
}

export const URLList: React.FC<URLListProps> = ({ parsedData }) => {
  const [urlState, setUrlState] = useState<ParsedUrlRecords | null>(null);

  useEffect(() => {
    const fetchURLState = async () => {
      const state = await getURLParserState();
      setUrlState(state);
    };
    fetchURLState();
  }, []);

  if (!urlState) return <div>Loading...</div>;

  return (
    <div>
      {Object.entries(urlState).map(([url, data]) => (
        <div key={url}>
          <h2>{decodeURIComponent(url)}</h2>
          <h3>Current Page URLs:</h3>
          <ul>
            {data.currPage.map((pageUrl, index) => (
              <li key={index}>{pageUrl}</li>
            ))}
          </ul>
          <h3>External JS Files:</h3>
          {Object.entries(data.externalJSFiles).map(([jsFile, urls]) => (
            <div key={jsFile}>
              <h4>{decodeURIComponent(jsFile)}</h4>
              <ul>
                {urls.map((url, index) => (
                  <li key={index}>{url}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};