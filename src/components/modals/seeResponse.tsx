import React, { useState, useEffect } from 'react';
import { Endpoint, HttpMethod, ResponseDetails } from '../../constants/message_types';
import { sanitizeURL } from '../../utils/defaultview_utils';
import { HTTP_METHODS } from '../../constants/defaultview_contants';
import browser from 'webextension-polyfill';
import { sendRequest } from '../../utils/request_Util';

interface SeeResponseModalProps {
  endpoint: Endpoint;
  onClose: () => void;
}

export const SeeResponseModal: React.FC<SeeResponseModalProps> = ({ endpoint, onClose }) => {
  const [responses, setResponses] = useState<Record<HttpMethod, ResponseDetails>>({} as Record<HttpMethod, ResponseDetails>);
  const [currentMethod, setCurrentMethod] = useState<HttpMethod>("GET");
  const [activeTab, setActiveTab] = useState<'request' | 'response'>('response');
  const [isEditing, setIsEditing] = useState(false);
  const [editableRequest, setEditableRequest] = useState({
    url: sanitizeURL(endpoint),
    method: 'GET' as HttpMethod,
    headers: {} as Record<string, string>,
    body: '',
  });
  const [currentRequest, setCurrentRequest] = useState<{
    url: string;
    method: HttpMethod;
    headers: Record<string, string>;
    body: string;
  }>({
    url: sanitizeURL(endpoint),
    method: 'GET',
    headers: {},
    body: '',
  });

  useEffect(() => {
    HTTP_METHODS.forEach(method => sendHttpRequest(method));
  }, []);

  const sendHttpRequest = async (method: HttpMethod, customRequest?: typeof editableRequest) => {
    try {
      const requestToSend = customRequest || {
        url: sanitizeURL(endpoint),
        method,
        headers: {},
        body: method === 'GET' ? undefined : ''
      };
  
      console.log('Sending request with headers:', requestToSend.headers);  // Debug log
  
      const response = await browser.runtime.sendMessage({
        action: 'sendRequest',
        endpoint,
        method,
        customRequest: requestToSend
      });
  
      console.log('Received response:', response);  // Debug log
  
      setResponses(prev => ({ ...prev, [method]: response }));
    } catch (error) {
      console.error(`Error sending ${method} request:`, error);
      setResponses(prev => ({ 
        ...prev, 
        [method]: {
          success: false,
          url: customRequest?.url || sanitizeURL(endpoint),
          status: 0,
          statusText: 'Error',
          headers: { 'Error': (error as Error).toString() },
          body: 'Failed to fetch'
        }
      }));
    }
  };

  const handleEditRequest = () => {
    setIsEditing(true);
    const currentResponse = responses[currentMethod];
    setEditableRequest({
      url: currentResponse?.url || sanitizeURL(endpoint),
      method: currentMethod,
      headers: currentResponse?.headers ? { ...currentResponse.headers } : {},
      body: currentMethod === 'GET' ? '' : (currentResponse?.body || ''),
    });
  };

  const handleHeaderChange = (index: number, key: string, value: string) => {
    setEditableRequest(prev => {
      const newHeaders = { ...prev.headers };
      const oldKey = Object.keys(newHeaders)[index];
      if (oldKey !== key) {
        delete newHeaders[oldKey];
      }
      newHeaders[key] = value;
      return { ...prev, headers: newHeaders };
    });
  };

  const handleRemoveHeader = (key: string) => {
    setEditableRequest(prev => {
      const newHeaders = { ...prev.headers };
      delete newHeaders[key];
      return { ...prev, headers: newHeaders };
    });
  };

  const handleAddHeader = () => {
    setEditableRequest(prev => {
      const newHeaders = { ...prev.headers, '': '' };
      return { ...prev, headers: newHeaders };
    });
  };

  const handleSaveRequest = async () => {
    setIsEditing(false);
  
    const filteredHeaders = Object.fromEntries(
      Object.entries(editableRequest.headers).filter(([key, value]) => key.trim() !== '' && value.trim() !== '')
    );
  
    const updatedRequest = {
      ...editableRequest,
      headers: filteredHeaders,
    };
  
    setCurrentRequest(updatedRequest);
  
    await sendHttpRequest(updatedRequest.method as HttpMethod, updatedRequest);
    setCurrentMethod(updatedRequest.method as HttpMethod);
  };

  const handleMethodChange = (newMethod: HttpMethod) => {
    setCurrentMethod(newMethod);
    if (newMethod === 'GET') {
      setEditableRequest(prev => ({ ...prev, body: '' }));
    }
    if (!responses[newMethod]) {
      sendHttpRequest(newMethod);
    }
  };

  const currentResponse = responses[currentMethod];

  return (
    <div className="mt-3">
      <h3 className="text-lg font-semibold text-gray-400 mb-5">Request/Response Details for {sanitizeURL(endpoint)}</h3>
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
                className="font-bold text-2xl text-purple-200 mb-4 bg-gray-600 w-full py-2 px-2"
                value={editableRequest.method}
                onChange={(e) => setEditableRequest(prev => ({ ...prev, method: e.target.value as HttpMethod, body: e.target.value === 'GET' ? '' : prev.body }))}
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
                <div key={index} className="flex mb-2 items-center group">
                  <input 
                    className="w-5/12 p-2 bg-gray-700 text-white"
                    value={key}
                    onChange={(e) => handleHeaderChange(index, e.target.value, value)}
                    placeholder="Header name"
                  />
                  <input 
                    className="w-5/12 p-2 bg-gray-700 text-white"
                    value={value}
                    onChange={(e) => handleHeaderChange(index, key, e.target.value)}
                    placeholder="Header value"
                  />
                  <button 
                    className="w-2/12 p-2 bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    onClick={() => handleRemoveHeader(key)}
                  >
                    X
                  </button>
                </div>
              ))}
              <button 
                className="bg-blue-500 text-white p-2 rounded mt-2"
                onClick={handleAddHeader}
              >
                Add Header
              </button>
              <h4 className="text-white font-semibold mb-2 mt-4">Body:</h4>
              <textarea 
                className="w-full p-2 bg-gray-700 text-white min-h-40"
                value={editableRequest.body}
                onChange={(e) => setEditableRequest(prev => ({ ...prev, body: e.target.value }))}
                disabled={editableRequest.method === 'GET'}
                placeholder={editableRequest.method === 'GET' ? 'Body not allowed for GET requests' : ''}
              />
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
              <pre className="text-gray-200 mb-4">{currentRequest.url}</pre>
              <h4 className="text-white font-semibold mb-2">Request Method:</h4>
              <pre className="text-gray-200 mb-4">{currentRequest.method}</pre>
              <h4 className="text-white font-semibold mb-2">Request Headers:</h4>
              <pre className="text-gray-200">
                {Object.entries(currentRequest.headers).map(([key, value]) => `${key}: ${value}`).join('\n')}
              </pre>
              {currentRequest.method !== 'GET' && (
                <>
                  <h4 className="text-white font-semibold mb-2 mt-4">Request Body:</h4>
                  <pre className="text-gray-200">{currentRequest.body || ''}</pre>
                </>
              )}
              <div className="flex gap-1">
                <button 
                  className="mt-4 bg-blue-500 text-white p-2 rounded"
                  onClick={handleEditRequest}
                >
                  Edit Request
                </button>
                <button 
                  className="mt-4 bg-rose-500 text-white p-2 rounded"
                  onClick={() => sendRequest(currentRequest)}
                >
                  Send
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="bg-[#363333] opacity-85 rounded-md p-4">
          <select 
            className="font-bold text-2xl text-purple-200 mb-4 bg-gray-600 w-full py-2 px-2"
            value={currentMethod}
            onChange={(e) => handleMethodChange(e.target.value as HttpMethod)}
          >
            {HTTP_METHODS.map(method => (
              <option key={method} value={method}>
                [{currentResponse?.status || 'N/A'}] {currentResponse?.statusText || 'N/A'} {method}
              </option>
            ))}
          </select>
          <h4 className="text-white font-semibold mb-2">Response URL:</h4>
          <pre className="text-gray-200 mb-4">{currentResponse?.url || 'N/A'}</pre>
          <h4 className="text-white font-semibold mb-2">Response Headers:</h4>
          <pre className="text-gray-200 mb-4">
            {Object.entries(currentResponse?.headers || {}).map(([key, value]) => (
              <div key={key} className="p-1">
                <span className="font-bold text-purple-200">{key}:</span>
                <span className="text-gray-200"> {value}</span>
              </div>
            ))}
          </pre>
          <h4 className="text-white font-semibold mb-2">Response Body:</h4>
          <pre className="text-gray-200 whitespace-pre-wrap">
            {currentResponse?.body || 'N/A'}
          </pre>
        </div>
      )}
      <button className="mt-4 bg-gray-500 text-white p-2 rounded" onClick={onClose}>Close</button>
    </div>
  );
};