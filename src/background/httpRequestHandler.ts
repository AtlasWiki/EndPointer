import browser from 'webextension-polyfill';
import { sanitizeURL } from '../utils/defaultview_utils';
import { Endpoint, HttpMethod, RequestDetails, ResponseDetails, ResponseCache } from '../constants/message_types';
import { js as beautify } from 'js-beautify';
import { HTTP_METHODS } from '../constants/defaultview_contants';

let responseCache: ResponseCache = {};

function initializeResponseCache(): Record<HttpMethod, ResponseDetails | null> {
  return Object.fromEntries(
    HTTP_METHODS.map(method => [method, null])
  ) as Record<HttpMethod, ResponseDetails | null>;
}

export async function handleSendRequest(endpoint: Endpoint, method: HttpMethod, customRequest: RequestDetails | null = null): Promise<ResponseDetails> {
  const url = customRequest ? customRequest.url : sanitizeURL(endpoint);
  let requestDetails: RequestDetails = customRequest || {
    url,
    method,
    headers: {},
    body: undefined
  };
  

  if (method === 'GET') {
    delete requestDetails.body;
  }

  try {
    const response = await fetch(requestDetails.url, {
      method: requestDetails.method,
      headers: requestDetails.headers,
      ...(method !== 'GET' && { body: requestDetails.body })
    });

    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, name) => {
      responseHeaders[name] = value;
    });

    const responseBody = await response.text();

    const responseDetails: ResponseDetails = {
      success: true,
      url: requestDetails.url,
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      body: beautify(responseBody, {
        indent_size: 2,
        indent_char: ' ',
        max_preserve_newlines: 2,
        preserve_newlines: true,
        keep_array_indentation: false,
        break_chained_methods: false,
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
      } as any)
    };

    // Cache the response
    if (!responseCache[url]) {
      responseCache[url] = initializeResponseCache();
    }
    responseCache[url][method] = responseDetails;

    return responseDetails;
  } catch (error) {
    console.error('Error in HTTP request:', error);
    const errorResponse: ResponseDetails = {
      success: false,
      url: requestDetails.url,
      status: 0,
      statusText: 'Error',
      headers: { 'Error': (error as Error).toString() },
      body: 'Failed to fetch'
    };

    // Cache the error response
    if (!responseCache[url]) {
      responseCache[url] = initializeResponseCache();
    }
    responseCache[url][method] = errorResponse;

    return errorResponse;
  }
}


export function getCachedResponse(url: string, method: HttpMethod): ResponseDetails | null {
  return responseCache[url]?.[method] || null;
}

export function clearResponseCache(): void {
  responseCache = {};
}

export function initRequestHandler(): void {
  clearResponseCache();
}

export async function getRequestDetails(url: string): Promise<RequestDetails | null> {
  // This function can be implemented if you need to retrieve
  // details about a specific request in the future
  return null;
}