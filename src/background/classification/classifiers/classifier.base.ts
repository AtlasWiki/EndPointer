import { ClassifierType, ClassificationResults } from './classifier.types';

export abstract class BaseClassifier<T extends Record<string, boolean>> {
    protected types: Record<keyof T, ClassifierType>;

    constructor(types: Record<keyof T, ClassifierType>) {
        this.types = types;
    }

    classify(url: string): ClassificationResults<T> {
        const matches = {} as T;
        const patterns: string[] = [];

        for (const [key, type] of Object.entries(this.types)) {
            const isMatch = this.matchesType(url, type);
            matches[key as keyof T] = isMatch as T[keyof T];
            if (isMatch) {
                patterns.push(type.name);
            }
        }

        return { matches, patterns };
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
