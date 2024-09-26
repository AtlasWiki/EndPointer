import { Runtime } from 'webextension-polyfill';

export type MessageAction =
  | 'parseURLs'
  | 'countURLs'
  | 'countJSFiles'
  | 'getAutoParserState'
  | 'setAutoParserState'
  | 'clearURLs';

export interface Message {
  action: MessageAction;
  state?: boolean;
}

export interface MessageResponse {
  success: boolean;
  error?: string;
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