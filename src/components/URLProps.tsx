import React, { useState, useEffect } from 'react';
import { js as beautify } from 'js-beautify';
import { Endpoint, HttpMethod } from '../constants/message_types';
import { sanitizeURL, highlightSearchQuery, fetchWithTimeout } from '../utils/defaultview_utils';
import { CSS_CLASSES, MODAL_NAMES, HTTP_METHODS, FETCH_TIMEOUT } from '../constants/defaultview_contants';

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

  const [editableRequest, setEditableRequest] = useState({
    url: sanitizeURL(endpoint),
    method: 'GET' as HttpMethod,
    headers: {} as Record<string, string>,
    body: '',
  });

  const [activeTab, setActiveTab] = useState<'request' | 'response'>('response');
  const [isEditing, setIsEditing] = useState(false);

  const closeAllModals = () => {
    setModalState(Object.fromEntries(
      Object.keys(modalState).map(key => [key, false])
    ) as typeof modalState);
  };

  useEffect(() => {
    if (modalState[MODAL_NAMES.seeResponse]) {
      for (const method of HTTP_METHODS) {
        fetchData(method);
      }
    }
  }, [modalState[MODAL_NAMES.seeResponse], endpoint]);

  const fetchData = async (method: HttpMethod, customRequest?: typeof editableRequest) => {
    const request = customRequest || { url: sanitizeURL(endpoint), method, headers: {}, body: '' };
    try {
      const response = await fetchWithTimeout(request.url, { 
        method: request.method,
        headers: request.headers,
        body: request.method !== 'GET' ? request.body : undefined
      }, FETCH_TIMEOUT);

      const fetchedHeaders: string[] = [];
      response.headers.forEach((value, key) => {
        fetchedHeaders.push(`${key}: ${value}`);
      });
      setHeaders(prev => ({ ...prev, [method]: fetchedHeaders }));
      setRespStatus(prev => ({ ...prev, [method]: response.status }));
      setRespStatusMessage(prev => ({ ...prev, [method]: response.statusText }));

      const responseBody = await response.text();
      const beautifiedBody = beautify(responseBody, {
        indent_size: 2,
        indent_char: ' ',
        max_preserve_newlines: 2,
        preserve_newlines: true,
        keep_array_indentation: false,
        break_chained_methods: false,
        indent_scripts: "separate",
        brace_style: "collapse",
        space_before_conditional: true,
        unescape_strings: false,
        jslint_happy: false,
        end_with_newline: false,
        wrap_line_length: 0,
        indent_inner_html: false,
        comma_first: false,
        e4x: false,
        indent_empty_lines: false
      } as any);
      setRespBody(prev => ({ ...prev, [method]: beautifiedBody }));
    } catch (error) {
      console.error('Error fetching data:', error);
      setHeaders(prev => ({ ...prev, [method]: [`Error: ${error}`] }));
      setRespStatus(prev => ({ ...prev, [method]: 0 }));
      setRespStatusMessage(prev => ({ ...prev, [method]: "Failed to fetch" }));
      setRespBody(prev => ({ ...prev, [method]: "Failed to fetch body" }));
    }
  };

  const handleEditRequest = () => {
    setIsEditing(true);
    setEditableRequest({
      url: sanitizeURL(endpoint),
      method: currentMethod,
      headers: Object.fromEntries(headers[currentMethod].map(header => {
        const [key, value] = header.split(': ');
        return [key, value];
      })),
      body: respBody[currentMethod],
    });
  };

  const handleSaveRequest = async () => {
    setIsEditing(false);
    await fetchData(editableRequest.method as HttpMethod, editableRequest);
    setCurrentMethod(editableRequest.method as HttpMethod);
  };

  const renderModal = (modalName: keyof typeof MODAL_NAMES) => {
    if (!modalState[modalName]) return null;

    let content;
    switch (modalName) {
      case MODAL_NAMES.generateReport:
        content = <p>Content for Generate Report modal.</p>;
        break;
      case MODAL_NAMES.viewCode:
        content = <p>Content for View Code modal.</p>;
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
            {activeTab === 'request' ? (
              <div className="bg-[#363333] opacity-85 rounded-md p-4">
                {isEditing ? (
                  <>
                    <h4 className="text-white font-semibold mb-2">Edit Request:</h4>
                    <select 
                      className="w-full mb-2 p-2 bg-gray-700 text-white"
                      value={editableRequest.method}
                      onChange={(e) => setEditableRequest(prev => ({ ...prev, method: e.target.value as HttpMethod }))}
                    >
                      {HTTP_METHODS.map(method => (
                        <option key={method} value={method}>{method}</option>
                      ))}
                    </select>
                    <input 
                      className="w-full mb-2 p-2 bg-gray-700 text-white"
                      value={editableRequest.url}
                      onChange={(e) => setEditableRequest(prev => ({ ...prev, url: e.target.value }))}
                    />
                    <h4 className="text-white font-semibold mb-2">Headers:</h4>
                    {Object.entries(editableRequest.headers).map(([key, value], index) => (
                      <div key={index} className="flex mb-2">
                        <input 
                          className="w-1/2 p-2 bg-gray-700 text-white"
                          value={key}
                          onChange={(e) => {
                            const newHeaders = { ...editableRequest.headers };
                            delete newHeaders[key];
                            newHeaders[e.target.value] = value;
                            setEditableRequest(prev => ({ ...prev, headers: newHeaders }));
                          }}
                        />
                        <input 
                          className="w-1/2 p-2 bg-gray-700 text-white"
                          value={value}
                          onChange={(e) => setEditableRequest(prev => ({ 
                            ...prev, 
                            headers: { ...prev.headers, [key]: e.target.value } 
                          }))}
                        />
                      </div>
                    ))}
                    <button 
                      className="bg-blue-500 text-white p-2 rounded"
                      onClick={() => setEditableRequest(prev => ({ 
                        ...prev, 
                        headers: { ...prev.headers, '': '' } 
                      }))}
                    >
                      Add Header
                    </button>
                    {editableRequest.method !== 'GET' && (
                      <>
                        <h4 className="text-white font-semibold mb-2 mt-4">Body:</h4>
                        <textarea 
                          className="w-full p-2 bg-gray-700 text-white"
                          value={editableRequest.body}
                          onChange={(e) => setEditableRequest(prev => ({ ...prev, body: e.target.value }))}
                        />
                      </>
                    )}
                    <div className="mt-4">
                      <button 
                        className="bg-green-500 text-white p-2 rounded mr-2"
                        onClick={handleSaveRequest}
                      >
                        Save and Send
                      </button>
                      <button 
                        className="bg-red-500 text-white p-2 rounded"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <h4 className="text-white font-semibold mb-2">Request URL:</h4>
                    <pre className="text-gray-200 mb-4">{sanitizeURL(endpoint)}</pre>
                    <h4 className="text-white font-semibold mb-2">Request Method:</h4>
                    <pre className="text-gray-200 mb-4">{currentMethod}</pre>
                    <h4 className="text-white font-semibold mb-2">Request Headers:</h4>
                    <pre className="text-gray-200">
                      {headers[currentMethod].join('\n')}
                    </pre>
                    <button 
                      className="mt-4 bg-blue-500 text-white p-2 rounded"
                      onClick={handleEditRequest}
                    >
                      Edit Request
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="bg-[#363333] opacity-85 rounded-md p-4">
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
                <h4 className="text-white font-semibold mb-2">Response Headers:</h4>
                <pre className="text-gray-200 mb-4">
                  {headers[currentMethod].join('\n')}
                </pre>
                <h4 className="text-white font-semibold mb-2">Response Body:</h4>
                <pre className="text-gray-200 whitespace-pre-wrap">
                  {respBody[currentMethod]}
                </pre>
              </div>
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