import { ParsedUrlRecords, URLParserState } from '../sharedTypes/types';

const URL_PARSER_KEY = 'URL-PARSER';
const URL_PARSER_STATE_KEY = 'URL-PARSER-STATE';

export const getURLParserState = async (): Promise<ParsedUrlRecords> => {
  return new Promise((resolve) => {
    chrome.storage.local.get(URL_PARSER_KEY, (result) => {
      resolve((result[URL_PARSER_KEY] as ParsedUrlRecords) || {});
    });
  });
};

export const setURLParserState = async (state: ParsedUrlRecords): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [URL_PARSER_KEY]: state }, resolve);
  });
};

export const getParserEnabledState = async (): Promise<URLParserState> => {
  return new Promise((resolve) => {
    chrome.storage.local.get(URL_PARSER_STATE_KEY, (result) => {
      resolve((result[URL_PARSER_STATE_KEY] as URLParserState) || { enabled: false, lastParsed: null });
    });
  });
};

export const setParserEnabledState = async (state: URLParserState): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [URL_PARSER_STATE_KEY]: state }, resolve);
  });
};

export const clearURLParserData = async (): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.local.remove([URL_PARSER_KEY, URL_PARSER_STATE_KEY], resolve);
  });
};