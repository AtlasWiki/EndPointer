import { ClassificationResults, URLClassification} from "../../background/classification/classifiers/classifier.types";

export interface URLParserStorageItem {
  currPage: Array<{
    url: string;
    classifications: URLClassification;
  }>;
  externalJSFiles: {
    [key: string]: Array<{
      url: string;
      classifications: URLClassification;
    }>;
  };
}

export type URLParserStorageWithOptionalCurrent = {
  [key: string]: URLParserStorageItem;
} & {
  current?: string;
};

