import browser from 'webextension-polyfill';

interface RequestDetails {
    url: string;
    method: string;
    requestHeaders: browser.WebRequest.HttpHeadersItemType[];
    requestBody?: browser.WebRequest.OnBeforeRequestDetailsType['requestBody'];
  }

let pendingRequests: { [key: string]: RequestDetails } = {};

export function initRequestHandler() {
  browser.webRequest.onBeforeSendHeaders.addListener(
    details => {
      const { requestId, url, method, requestHeaders } = details;
      pendingRequests[requestId] = { url, method, requestHeaders: requestHeaders || []  };
      return { requestHeaders };
    },
    { urls: ['<all_urls>'] },
    ['requestHeaders']
  );

  browser.webRequest.onBeforeRequest.addListener(
    (details: browser.WebRequest.OnBeforeRequestDetailsType) => {
      if (pendingRequests[details.requestId]) {
        pendingRequests[details.requestId].requestBody = details.requestBody;
      }
      return {};
    },
    { urls: ['<all_urls>'] },
    ['requestBody']
  );

  browser.webRequest.onCompleted.addListener(
    details => {
      delete pendingRequests[details.requestId];
    },
    { urls: ['<all_urls>'] }
  );

  browser.webRequest.onErrorOccurred.addListener(
    details => {
      delete pendingRequests[details.requestId];
    },
    { urls: ['<all_urls>'] }
  );
}

export function getRequestDetails(url: string): Promise<RequestDetails | null> {
  return new Promise((resolve) => {
    const matchingRequest = Object.values(pendingRequests).find(req => req.url === url);
    if (matchingRequest) {
      resolve(matchingRequest);
    } else {
      resolve(null);
    }
  });
}