export interface ExtensionState {
    urlParser: boolean;
    fileDownloader: boolean;
    urlCount: number;
    fileCount: number;
  }
  
  export interface Message {
    action: string;
    state?: boolean;
    count?: number;
  }