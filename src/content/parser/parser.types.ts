export interface URLParserStorageItem {
  currPage: string[];
  externalJSFiles: {
    [key: string]: string[];
  };
}

export type URLParserStorageWithOptionalCurrent = {
  [key: string]: URLParserStorageItem;
} & {
  current?: string;
};

