import type { URLClassification} from "./classifier.types";

export interface IClassifierService {
    classifyUrl(url: string): URLClassification;
    updateStorageWithClassifications(currentURL: string): Promise<void>;
    getURLClassifications(url?: string): Promise<Record<string, URLClassification> | null>;
}