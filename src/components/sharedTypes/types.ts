export interface parsedUrlRecords {
    [key: string]: {
      currPage: string[];
      externalJSFiles: {
        [key: string]: string[];
      };
    };
  }
  