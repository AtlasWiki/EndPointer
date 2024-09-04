export interface ExtensionState {
    urlParser: boolean;
    fileDownloader: boolean;
    urlCount: number;
    
  }
  
  export interface Message {
    action: string;
    state?: boolean;
    count?: number;
  }