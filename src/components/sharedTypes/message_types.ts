export interface ExtensionState {
    urlParser: boolean;
    urlCount: number;
    jsFileCount: number;
  }
  
  export interface Message {
    action: string;
    state?: boolean;
    count?: number;
  }