import React, { useState, useEffect } from 'react';
import { js as beautify } from 'js-beautify';
import { Endpoint, HttpMethod} from '../constants/message_types';
import { sanitizeURL, highlightSearchQuery, fetchWithTimeout } from '../utils/defaultview_utils';
import { CSS_CLASSES, MODAL_NAMES, HTTP_METHODS, FETCH_TIMEOUT  } from '../constants/defaultview_contants';
import browser from 'webextension-polyfill';
interface URLPropsProps {
  endpoint: Endpoint;
  searchQuery: string;
}

export function URLProps({ endpoint, searchQuery }: URLPropsProps) {
  const [modalState, setModalState] = useState({
    [MODAL_NAMES.generateReport]: false,
    [MODAL_NAMES.viewCode]: false,
    [MODAL_NAMES.seeResponse]: false,
  });

  const [requestDetails, setRequestDetails] = useState<any>(null);
  
  const [respStatus, setRespStatus] = useState<Record<HttpMethod, number>>(
    Object.fromEntries(HTTP_METHODS.map(method => [method, 0])) as Record<HttpMethod, number>
  );

  const [respStatusMessage, setRespStatusMessage] = useState<Record<HttpMethod, string>>(
    Object.fromEntries(HTTP_METHODS.map(method => [method, ""])) as Record<HttpMethod, string>
  );

  const [respBody, setRespBody] = useState<Record<HttpMethod, string>>(
    Object.fromEntries(HTTP_METHODS.map(method => [method, ""])) as Record<HttpMethod, string>
  );

  const [currentMethod, setCurrentMethod] = useState<HttpMethod>("GET");

  const [headers, setHeaders] = useState<Record<HttpMethod, string[]>>({
    GET: [],
    POST: [],
    PUT: [],
    OPTIONS: []
  });

  const [codeSnippet, setCodeSnippet] = useState<string[]>([]);
  const [keywordHits, setKeywordHits] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'request' | 'response'>('response');

  const closeAllModals = () => {
    setModalState(Object.fromEntries(
      Object.keys(modalState).map(key => [key, false])
    ) as typeof modalState);
  };

 
  useEffect(() => {
    if (modalState[MODAL_NAMES.seeResponse]) {
      HTTP_METHODS.forEach(fetchData);
      fetchRequestDetails();
    }
  }, [modalState[MODAL_NAMES.seeResponse], endpoint]);

  const fetchRequestDetails = async () => {
    try {
      const response = await browser.runtime.sendMessage({
        action: 'getRequestDetails',
        url: sanitizeURL(endpoint)
      });
      if ((response as any).success) {
        setRequestDetails((response as any).details);
      }
    } catch (error) {
      console.error("Failed to fetch request details:", error);
    }
  };

  useEffect(() => {
    if (modalState[MODAL_NAMES.viewCode]) {
      fetchCodeSnippet();
    }
  }, [modalState[MODAL_NAMES.viewCode], endpoint]);

  const fetchData = async (method: HttpMethod) => {
    const verifiedURL = sanitizeURL(endpoint);
    try {
      const response = await fetchWithTimeout(verifiedURL, { method }, FETCH_TIMEOUT);
      const fetchedHeaders: string[] = [];
      response.headers.forEach((value, header) => {
        fetchedHeaders.push(`${header}: ${value}`);
      });
      setHeaders(prev => ({ ...prev, [method]: fetchedHeaders }));
      setRespStatus(prev => ({ ...prev, [method]: response.status }));
      setRespStatusMessage(prev => ({ ...prev, [method]: response.statusText }));

      const responseBody = await response.text();
      const beautifiedHTML = beautify(responseBody, {
        indent_size: 2,
        indent_char: ' ',
        preserve_newlines: true,
        max_preserve_newlines: 2,
        end_with_newline: true,
        wrap_line_length: 0,
      });
      setRespBody(prev => ({ ...prev, [method]: beautifiedHTML }));
    } catch (error) {
      const errorMessage = (error as Error).message || 'An unknown error occurred';
      setHeaders(prev => ({ ...prev, [method]: [`Error: ${errorMessage}`] }));
      setRespStatus(prev => ({ ...prev, [method]: 0 }));
      setRespStatusMessage(prev => ({ ...prev, [method]: "Failed to fetch" }));
      setRespBody(prev => ({ ...prev, [method]: "body not found" }));
    }
  };

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

  const renderModal = (modalName: keyof typeof MODAL_NAMES) => {
    if (!modalState[modalName]) return null;

    let content;
    switch (modalName) {
      case MODAL_NAMES.generateReport:
        content = <p>Content for Generate Report modal.</p>;
        break;
      case MODAL_NAMES.viewCode:
        content = (
          <>
            <p className="mb-5 font-semibold text-purple-200">{keywordHits.length} hits found in {endpoint.foundAt}</p>
            <div>
              {codeSnippet.map((snippet, index) => (
                <pre key={index}>
                  <code>{snippet}</code>
                </pre>
              ))}
            </div>
          </>
        );
        break;
      case MODAL_NAMES.seeResponse:
        content = (
          <div className="mt-3">
            <h3 className="text-lg font-semibold text-gray-400 mb-5">Request/Response Details</h3>
            <div className="flex mb-4">
              <button
                className={`px-4 py-2 ${activeTab === 'request' ? 'bg-gray-600 text-white' : 'bg-gray-300 text-gray-700'}`}
                onClick={() => setActiveTab('request')}
              >
                Request
              </button>
              <button
                className={`px-4 py-2 ${activeTab === 'response' ? 'bg-gray-600 text-white' : 'bg-gray-300 text-gray-700'}`}
                onClick={() => setActiveTab('response')}
              >
                Response
              </button>
            </div>
            <select 
              className="font-bold text-2xl text-purple-200 mb-4 bg-gray-600 w-full py-2 px-2"
              value={currentMethod}
              onChange={(e) => setCurrentMethod(e.target.value as HttpMethod)}
            >
              {HTTP_METHODS.map(method => (
                <option key={method} value={method}>
                  [{respStatus[method]}] {respStatusMessage[method]} {method}
                </option>
              ))}
            </select>
            {activeTab === 'request' ? (
              <div className="bg-[#363333] opacity-85 rounded-md p-4">
                <h4 className="text-white font-semibold mb-2">Request URL:</h4>
                <pre className="text-gray-200 mb-4">{sanitizeURL(endpoint)}</pre>
                <h4 className="text-white font-semibold mb-2">Request Method:</h4>
                <pre className="text-gray-200 mb-4">{requestDetails?.method || currentMethod}</pre>
                <h4 className="text-white font-semibold mb-2">Request Headers:</h4>
                <pre className="text-gray-200">
                  {requestDetails?.requestHeaders
                    ? requestDetails.requestHeaders.map((header: any) => `${header.name}: ${header.value}`).join('\n')
                    : 'No headers available'}
                </pre>
                {requestDetails?.requestBody && (
                  <>
                    <h4 className="text-white font-semibold mb-2 mt-4">Request Body:</h4>
                    <pre className="text-gray-200">
                      {JSON.stringify(requestDetails.requestBody, null, 2)}
                    </pre>
                  </>
                )}
              </div>
            ) : (
              <ul className="text-black overflow-y-auto p-2 bg-[#363333] opacity-85 rounded-md max-h-160">
                {headers[currentMethod].map((header, index) => {
                  const [headerName, ...rest] = header.split(': ');
                  return (
                    <li key={index} className="p-1">
                      <span className="font-bold text-purple-200">{headerName}:</span>
                      <span className="text-gray-200"> {rest.join(': ')}</span>
                    </li>
                  );
                })}
                <li>
                  <pre className="mt-5">
                    <span className="text-gray-200">{respBody[currentMethod]}</span>
                  </pre>
                </li>
              </ul>
            )}
          </div>
        );
        break;
    }

    return (
      <div className={CSS_CLASSES.MODAL_OVERLAY} onClick={closeAllModals}>
        <div className={`${CSS_CLASSES.MODAL_CONTENT} max-w-6xl max-h-screen overflow-auto`} onClick={(e) => e.stopPropagation()}>
          <h2 className="text-xl font-bold text-gray-400 mb-5">
            {modalName === MODAL_NAMES.generateReport ? "Generate Report for " :
             modalName === MODAL_NAMES.viewCode ? "View Code Snippet for " :
             "See Request/Response for "}
            {sanitizeURL(endpoint)}
          </h2>
          {content}
          <button className={`${CSS_CLASSES.BUTTON} mt-3`} onClick={closeAllModals}>Close</button>
        </div>
      </div>
    );
  };

  return (
    <tr>
      <td className="break-words max-w-lg">
        {highlightSearchQuery(endpoint.url, searchQuery)}
        <div className="flex mt-2 items-center gap-1">
          <button
            className="i-button"
            onClick={() => setModalState(prev => ({ ...prev, [MODAL_NAMES.viewCode]: true }))}
          >
            <svg className="cursor-pointer hover:opacity-80" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path fill="#3da28f" d="m8 18l-6-6l6-6l1.425 1.425l-4.6 4.6L9.4 16.6zm8 0l-1.425-1.425l4.6-4.6L14.6 7.4L16 6l6 6z"/>
              <title>View Code Snippet</title>
            </svg>
          </button>
          <button
            className="i-button"
            onClick={() => setModalState(prev => ({ ...prev, [MODAL_NAMES.seeResponse]: true }))}
          >
            <svg className="cursor-pointer hover:opacity-80" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path fill="#3da28f" d="M20 4H6c-1.103 0-2 .897-2 2v5h2V8l6.4 4.8a1 1 0 0 0 1.2 0L20 8v9h-8v2h8c1.103 0 2-.897 2-2V6c0-1.103-.897-2-2-2m-7 6.75L6.666 6h12.668z"/>
              <path fill="#3da28f" d="M2 12h7v2H2zm2 3h6v2H4zm3 3h4v2H7z"/>
              <title>See Request/Response</title>
            </svg>
          </button>
        </div>
        {renderModal(MODAL_NAMES.generateReport)}
        {renderModal(MODAL_NAMES.viewCode)}
        {renderModal(MODAL_NAMES.seeResponse)}
      </td>
      <td className="break-words max-w-lg">{endpoint.foundAt}</td>
      <td className="break-words max-w-lg text-center">{endpoint.webpage}</td>
    </tr>
  );
}