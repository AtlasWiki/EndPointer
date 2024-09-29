import { Runtime } from 'webextension-polyfill';

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
  | 'autoParserStateChanged';
  
export interface Message {
  action: MessageAction;
  state?: boolean;
  count?: number;
  url?: string;
}

export interface MessageResponse {
  success: boolean;
  error?: string;
  details?: any;
  count?: number;
  state?: boolean;
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


// src/types/index.ts

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
  filteredURLs: Endpoint[];
  visibleUrls: Endpoint[];
  setVisibleUrls: React.Dispatch<React.SetStateAction<Endpoint[]>>;
}