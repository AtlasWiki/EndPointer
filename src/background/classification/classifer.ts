import { BaseClassifier } from './classifiers/classifier.base';
import type { URLClassification } from './classifiers/classifier.types';



export class URLClassifier extends BaseClassifier<URLClassification> {
    constructor() {
        super({
            isAPIEndpoint: {
                name: "API Endpoint",
                patterns: [
                    /\/api\//i,
                    /\/v[0-9]+\//i,
                    /\/(graphql|rest)\//i,
                    /\.(json|xml)$/i
                ],
                keywords: ['api', 'service', 'endpoint']
            },
            isUserDataAccess: {
                name: "User Data Access",
                patterns: [
                    /\/users?\/[^\/]+/i,
                    /\/profiles?\//i,
                    /\/accounts?\//i,
                    /\/personal/i
                ],
                keywords: ['user', 'profile', 'account']
            },
            isDatabaseOperation: {
                name: "Database Operation",
                patterns: [
                    /\/(query|insert|update|delete)/i,
                    /\/db\//i,
                    /\/data\//i
                ],
                keywords: ['record', 'entry', 'database']
            },
            isSensitiveData: {
                name: "Sensitive Data",
                patterns: [
                    /\/(password|secret|key|token)/i,
                    /\/secure\//i,
                    /\/private\//i,
                    /\/(ssn|social-security)/i
                ],
                keywords: ['confidential', 'private', 'sensitive']
            },
            isUnsecuredAPI: {
                name: "Unsecured API",
                patterns: [
                    /^http:\/\//i,
                    /\/public-api\//i,
                    /\/open-api\//i,
                    /\/test-api\//i
                ]
            },
            isAuthEndpoint: {
                name: "Authentication Endpoint",
                patterns: [
                    /\/(auth|login|logout|signin|signup|register)/i,
                    /\/oauth/i,
                    /\/jwt\//i,
                    /\/(session|token)/i
                ],
                keywords: ['auth', 'login', 'authenticate']
            },
            isDataTransfer: {
                name: "Data Transfer",
                patterns: [
                    /\/(upload|download|transfer|export|import)/i,
                    /\/stream\//i,
                    /\/webhook/i
                ],
                keywords: ['transfer', 'sync', 'stream']
            },
            isAdminPanel: {
                name: "Admin Panel",
                patterns: [
                    /\/(admin|administrator|manage|console|dashboard)/i,
                    /\/cms\//i,
                    /\/control-panel/i
                ],
                keywords: ['admin', 'manage', 'control']
            },
            isPaymentProcessing: {
                name: "Payment Processing",
                patterns: [
                    /\/(payment|checkout|billing|invoice)/i,
                    /\/transaction/i,
                    /\/(stripe|paypal|square)/i
                ],
                keywords: ['payment', 'bill', 'transaction']
            },
            isFileAccess: {
                name: "File Access",
                patterns: [
                    /\/(files?|documents?|uploads?)/i,
                    /\/storage\//i,
                    /\.(pdf|doc|xls|csv)$/i
                ],
                extensions: ['.pdf', '.doc', '.xls', '.csv', '.txt']
            },
            isLegacyEndpoint: {
                name: "Legacy Endpoint",
                patterns: [
                    /\/legacy\//i,
                    /\/old-api\//i,
                    /\/v[0-9]\./i,
                    /\/deprecated\//i
                ],
                keywords: ['legacy', 'old', 'deprecated']
            },
            isDynamicContent: {
                name: "Dynamic Content",
                patterns: [
                    /\?.*=/,
                    /\/\{.*\}/,
                    /\/:[a-zA-Z]+/
                ]
            },
            isWebSocket: {
                name: "WebSocket",
                patterns: [
                    /^wss?:\/\//i,
                    /\/ws\//i,
                    /\/socket\//i,
                    /\/events?\//i
                ],
                keywords: ['websocket', 'socket', 'real-time']
            },
            isGraphQL: {
                name: "GraphQL",
                patterns: [

                ],
                keywords: ['graphQL']
            },
            isInternalNetwork: {
                name: "Internal Network",
                patterns: [
                    /^https?:\/\/(localhost|127\.0\.0\.1)/i,
                    /\/(internal|intranet|local)\//i,
                    /^https?:\/\/[^\/]+\.internal\./i
                ]
            },
            isThirdPartyIntegration: {
                name: "Third-Party Integration",
                patterns: [
                    /\/(integrate|connector|webhook)/i,
                    /\/callback\//i,
                    /^https?:\/\/(?!(?:localhost|127\.0\.0\.1))/i
                ]
            },
            isDebugEndpoint: {
                name: "Debug Endpoint",
                patterns: [
                    /\/(debug|test|dev)/i,
                    /\/logs?\//i,
                    /\/metrics\//i,
                    /\/health-?check/i
                ],
                keywords: ['debug', 'test', 'development']
            },
            isPotentiallyVulnerable: {
                name: "Potentially Vulnerable",
                patterns: [
                    /\/(admin|config|setup|install)\.php$/i,
                    /\/(sql|shell|cmd)/i,
                    /\/(eval|exec)/i,
                    /\?.*=(https?:\/\/|\/\/)/i  // Potential SSRF
                ]
            },
            isParameterizedEndpoint: {
                name: "Parameterized Endpoint",
                patterns: [
                    /\/:[a-zA-Z]+/,
                    /\/\{[^}]+\}/,
                    /\?.*=.*&/,
                    /\/[0-9a-f]{8,}/i
                ]
            },
            isNonStandardPort: {
                name: "Non-Standard Port",
                patterns: [
                    /:(?!80|443|8080)\d{2,5}/
                ]
            },
            isBase64EncodedSegment: {
                name: "Base64 Encoded Segment",
                patterns: [
                    /[A-Za-z0-9+/]{4}={1,2}/,
                    /[A-Za-z0-9+/]{4,}(?:[A-Za-z0-9+/]{4}|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)/
                ]
            }
    
        });
    }
}

export type { URLClassification };