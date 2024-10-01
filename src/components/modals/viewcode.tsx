import React, { useState, useEffect } from 'react';
import { Endpoint } from '../../constants/message_types';
import { sanitizeURL, fetchWithTimeout } from '../../utils/defaultview_utils';
import { FETCH_TIMEOUT } from '../../constants/defaultview_contants';
import { js as beautify } from 'js-beautify';

interface ViewCodeModalProps {
  endpoint: Endpoint;
  onClose: () => void;
}

export const ViewCodeModal: React.FC<ViewCodeModalProps> = ({ endpoint, onClose }) => {
  const [codeSnippet, setCodeSnippet] = useState<string[]>([]);
  const [keywordHits, setKeywordHits] = useState<string[]>([]);

  useEffect(() => {
    fetchCodeSnippet();
  }, [endpoint]);

  const fetchCodeSnippet = async () => {
    try {
      const response = await fetchWithTimeout(endpoint.foundAt, {}, FETCH_TIMEOUT);
      const code = await response.text();
      const beautifiedCode = beautify(code);
      const regex = new RegExp(`(?:^.*?(?:\\n.*?){0,1}(${endpoint.url}).*?(?:\\n.*?){0,1})`, 'gs');
      const keyRegex = new RegExp(`${endpoint.url}`, 'gs');
      
      const matches = beautifiedCode.match(regex);
      const keywordMatches = beautifiedCode.match(keyRegex); 

      setCodeSnippet(matches || []);
      setKeywordHits(keywordMatches || []); 
    } catch (error) {
      console.error("Failed to fetch code snippet:", error);
      setCodeSnippet(["Failed to fetch code snippet"]);
      setKeywordHits([]);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-400 mb-5">View Code Snippet for {sanitizeURL(endpoint)}</h2>
      <p className="mb-5 font-semibold text-purple-200">{keywordHits.length} hits found in {endpoint.foundAt}</p>
      <div>
        {codeSnippet.map((snippet, index) => (
          <pre key={index}>
            <code>{snippet}</code>
          </pre>
        ))}
      </div>
      <button className="mt-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" onClick={onClose}>Close</button>
    </div>
  );
};