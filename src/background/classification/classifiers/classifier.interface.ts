import type { ClassificationResults, URLClassification} from "./classifier.types";

export interface IClassifierService {
    classifyUrls(urls: string[]): Record<string, ClassificationResults<URLClassification>>;
    updateStorageWithClassifications(currentURL: string): Promise<void>;
    getURLClassifications(url?: string): Promise<Record<string, ClassificationResults<URLClassification>> | null>;

}