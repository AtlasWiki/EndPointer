import { ClassificationResults, URLClassification} from "../../background/classification/classifiers/classifier.types";

export interface URLParserStorageItem {
  currPage: string[];
  externalJSFiles: {
      [key: string]: string[];
  };
  classifications?: Record<string, ClassificationResults<URLClassification>>;
}
export type URLParserStorageWithOptionalCurrent = {
  [key: string]: URLParserStorageItem;
} & {
  current?: string;
};

