
export type ClassifierType = {
    name: string;
    patterns: RegExp[];
    keywords?: string[];
    extensions?: string[];
}

export interface ClassificationResults<T> {
    matches: T;
    patterns: string[];
}

export type URLClassification = {
    isAPIEndpoint: boolean;
    isUserDataAccess: boolean;
    isDatabaseOperation: boolean;
    isSensitiveData: boolean;
    isUnsecuredAPI: boolean;
    isAuthEndpoint: boolean;
    isDataTransfer: boolean;
    isAdminPanel: boolean;
    isPaymentProcessing: boolean;
    isFileAccess: boolean;
    isLegacyEndpoint: boolean;
    isDynamicContent: boolean;
    isWebSocket: boolean;
    isInternalNetwork: boolean;
    isThirdPartyIntegration: boolean;
    isDebugEndpoint: boolean;
    isPotentiallyVulnerable: boolean;
    isParameterizedEndpoint: boolean;
    isNonStandardPort: boolean;
    isBase64EncodedSegment: boolean;
}