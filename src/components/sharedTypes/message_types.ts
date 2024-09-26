export type MessageAction =
  | 'urlParserChanged'
  | 'updateURLCount'
  | 'updateJSFileCount'
  | 'getState'
  | 'getInitialState'
  | 'getUrlParserState'
  | 'parseURLs'
  | 'parseURLsManually'
  | 'countURLs'
  | 'countJSFiles'
  | 'urlParserStateChanged'


export interface Message {
  action: MessageAction;
  state?: boolean;
  count?: number;
}

export interface ExtensionState {
  urlParser: boolean;
  urlCount: number;
  fileCount: number;
}

export interface MessageResponse {
  success: boolean;
  error?: string;
}