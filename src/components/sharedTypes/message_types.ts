import { Runtime } from 'webextension-polyfill';

export type MessageAction =
  | 'parseURLs'
  | 'countURLs'
  | 'countJSFiles'
  | 'getAutoParserState'
  | 'setAutoParserState'
  | 'clearURLs'
  | 'updateURLCount'
  | 'updateJSFileCount';

export interface Message {
  action: MessageAction;
  state?: boolean;
  count?: number;
}

export interface MessageResponse {
  success: boolean;
  error?: string;
  details?: string;
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


