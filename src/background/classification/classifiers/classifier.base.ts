import { ClassifierType, ClassificationResults } from './classifier.types';

export abstract class BaseClassifier<T extends Record<string, boolean>> {
    protected types: Record<keyof T, ClassifierType>;

    constructor(types: Record<keyof T, ClassifierType>) {
        this.types = types;
    }

    classify(url: string): T {
        const matches = {} as T;

        for (const [key, type] of Object.entries(this.types)) {
            matches[key as keyof T] = this.matchesType(url, type) as T[keyof T];
        }

        return matches;
    }

    private matchesType(url: string, type: ClassifierType): boolean {
        return (
            this.matchesPatterns(url, type.patterns) || 
            this.matchesKeywords(url, type.keywords) ||
            this.matchesExtension(url, type.extensions)
        );
    }

    protected matchesPatterns(url: string, patterns?: RegExp[]): boolean {
        if (!patterns) return false;
        return patterns.some(pattern => pattern.test(url));
    }

    protected matchesKeywords(url: string, keywords?: string[]): boolean {
        if (!keywords) return false;
        const urlLower = url.toLowerCase();
        return keywords.some(keyword => urlLower.includes(keyword.toLowerCase()));
    }

    protected matchesExtension(url: string, extensions?: string[]): boolean {
        if (!extensions) return false;
        const urlLower = url.toLowerCase();
        return extensions.some(ext => urlLower.endsWith(ext.toLowerCase()));
    }
}
