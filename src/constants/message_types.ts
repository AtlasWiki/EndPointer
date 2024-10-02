import { Runtime } from 'webextension-polyfill';
import React from 'react';

export type MessageAction =
  | 'parseURLs'
  | 'countURLs'
  | 'countJSFiles'
  | 'getAutoParserState'
  | 'setAutoParserState'
  | 'clearURLs'
  | 'updateURLCount'
  | 'updateJSFileCount'
  | 'reparse'
  | 'getRequestDetails'
  | 'checkContentScriptInjected'
  | 'autoParserStateChanged'
  | 'sendRequest'
  | 'clearResponseCache';

export interface Message {
  action: MessageAction;
  state?: boolean;
  count?: number;
  url?: string;
  endpoint?: Endpoint;
  method?: HttpMethod;
  customRequest?: RequestDetails;
}

export interface MessageResponse {
  success: boolean;
  error?: string;
  details?: any;
  count?: number;
  state?: boolean;
  url?: string;
  status?: number;
  statusText?: string;
  headers?: Record<string, string>;
  body?: string;
}

export type MessageSender = Runtime.MessageSender;

export type MessageListener = (
  message: Message,
  sender: MessageSender,
  sendResponse: (response?: MessageResponse) => void
) => boolean | void | Promise<MessageResponse>;

export interface ExtensionState {
  urlParser: boolean;
  urlCount: number;
  fileCount: number;
}

export interface URLParserStorageItem {
  currPage: string[];
  externalJSFiles: {
    [key: string]: string[];
  };
}

export interface URLParserStorage {
  current?: string;
  [key: string]: URLParserStorageItem | string | undefined;
}

export interface Endpoint {
  url: string;
  foundAt: string;
  webpage: string;
}

export interface URLEntry {
  currPage: string[];
  externalJSFiles: { [key: string]: string[] };
}

export interface URLParser {
  [key: string]: URLEntry;
}

export type Location = string;

export type Webpage = string;

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'OPTIONS';

export interface ResponseData {
  status: number;
  statusMessage: string;
  headers: string[];
  body: string;
}

export interface URLPropsState {
  isGenerateReportOpen: boolean;
  isViewCodeOpen: boolean;
  isSeeResponseOpen: boolean;
  respStatus: Record<HttpMethod, number>;
  respStatusMessage: Record<HttpMethod, string>;
  respBody: Record<HttpMethod, string>;
  currentMethod: HttpMethod;
  headers: Record<HttpMethod, string[]>;
  codeSnippet: string[];
  keywordHits: string[];
}

export interface UseURLDataResult {
  urls: Endpoint[];
  jsFiles: Location[];
  webpages: Webpage[];
  filteredURLs: Endpoint[];
  visibleUrls: Endpoint[];
  setVisibleUrls: React.Dispatch<React.SetStateAction<Endpoint[]>>;
}



export interface RequestDetails {
  url: string;
  method: HttpMethod;
  headers: Record<string, string>;
  body?: string;
}

export interface ResponseDetails {
  success: boolean;
  url: string;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
}

export type ResponseCache = Record<string, Record<HttpMethod, ResponseDetails | null>>;