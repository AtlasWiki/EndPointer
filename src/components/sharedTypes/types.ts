// Represents the structure of parsed URL records
export interface ParsedUrlRecords {
    [key: string]: {
      currPage: string[];
      externalJSFiles: {
        [key: string]: string[];
      };
    };
  }
  
  // Represents the possible actions for messages
  export type MessageAction = 
    | 'startUrlParsing'
    | 'urlsParsed'
    | 'urlParsingError'
    | 'getCurrTabData';
  
  // Represents the structure of messages passed between components
  export interface MessageType {
    action: MessageAction;
    data?: ParsedData;
    error?: string;
  }
  
  // Represents the structure of parsed data
  export interface ParsedData {
    urls: string[];
    jsFiles: string[];
    // Add other relevant data fields as needed
  }
  
  // Represents the state of URL parsing
  export interface URLParserState {
    enabled: boolean;
    lastParsed: Date | null;
    // Add other relevant state fields as needed
  }