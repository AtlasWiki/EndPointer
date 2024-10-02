import browser from 'webextension-polyfill';

export interface RequestDetails {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
}

export interface ResponseData {
  status: number;
  statusText: string;
  headers: string[];
  body: string;
}

export async function sendRequest(details: RequestDetails): Promise<ResponseData> {
  console.log('Sending request:', details);
  
  // Check if we're in a content script context
  if (typeof window !== 'undefined' && window.location.protocol !== 'chrome-extension:') {
    // We're in a web context, use the background script
    return sendRequestViaBackground(details);
  } else {
    // We're in a DevTools or background script context, make the request directly
    return sendRequestDirect(details);
  }
}

async function sendRequestViaBackground(details: RequestDetails): Promise<ResponseData> {
  try {
    const response = await browser.runtime.sendMessage({
      type: 'sendRequest',
      ...details
    });
    console.log('Response from background:', response);
    return response as ResponseData;
  } catch (error) {
    console.error('Error sending request via background:', error);
    throw error;
  }
}

async function sendRequestDirect(details: RequestDetails): Promise<ResponseData> {
  try {
    const response = await fetch(details.url, {
      method: details.method,
      headers: details.headers,
      body: details.method !== 'GET' ? details.body : undefined
    });

    const responseHeaders: string[] = [];
    response.headers.forEach((value, name) => {
      responseHeaders.push(`${name}: ${value}`);
    });

    const responseBody = await response.text();

    return {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      body: responseBody
    };
  } catch (error) {
    console.error('Error sending request directly:', error);
    throw error;
  }
}