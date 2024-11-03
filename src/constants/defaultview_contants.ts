// src/constants/index.ts

export const VISIBLE_URL_SIZE = 100;

export const HTTP_METHODS = ['GET', 'POST', 'PUT', 'OPTIONS'] as const;

export const FETCH_TIMEOUT = 5000; // 5 seconds

export const DEBOUNCE_DELAY = 300; // 300 milliseconds

export const MODAL_NAMES = {
    generateReport: 'generateReport',
    viewCode: 'viewCode',
    seeResponse: 'seeResponse',
  } as const;

export const LOCAL_STORAGE_KEYS = {
  URL_PARSER: 'URL-PARSER',
} as const;

export const CSS_CLASSES = {
  BUTTON: 'px-4 py-2 bg-black text-white rounded hover:bg-blue-600',
  INPUT: 'px-2 border-2 border-gray-300 bg-transparent text-lg w-full pb-3 pt-3 rounded-md cursor-pointer text-gray-300 hover:border-gray-500 outline-none focus:border-gray-500 transition-all duration-400',
  MODAL_OVERLAY: 'fixed inset-0 flex items-center justify-center bg-[#141e24] bg-opacity-50',
  MODAL_CONTENT: 'bg-[#141e24] opacity-85 p-5 rounded-lg shadow-lg',
  API_ENDPOINT: 'bg-black text-green-500 py-1 px-2 rounded-md text-sm font-semibold',
  URL_DATA_ACCESS: 'bg-black text-blue-500 py-1 px-2 rounded-md text-sm font-semibold',
  DATABASE_OPERATION: 'bg-black text-purple-500 py-1 px-2 rounded-md text-sm font-semibold',
  SENSITIVE_DATA: 'bg-black text-red-500 py-1 px-2 rounded-md text-sm font-semibold',
  UNSECURED_API: 'bg-black text-red-600 py-1 px-2 rounded-md text-sm font-semibold',
  AUTHENTICATION_ENDPOINT: 'bg-[#0f4c81] text-white py-1 px-2 rounded-md text-sm font-semibold',
  DATA_TRANSFER: 'bg-[#ffbf00] text-white py-1 px-2 rounded-md text-sm font-semibold',
  ADMIN_PANEL: 'bg-[#006400] text-white py-1 px-2 rounded-md text-sm font-semibold',
  PAYMENT_PROCESSING: 'bg-[#3d5a80] text-white py-1 px-2 rounded-md text-sm font-semibold',
  FILE_ACCESS: 'bg-[#ff4500] text-white py-1 px-2 rounded-md text-sm font-semibold',
  LEGACY_ENDPOINT: 'bg-[#808080] text-white py-1 px-2 rounded-md text-sm font-semibold',
  DYNAMIC_CONTENT: 'bg-[#800080] text-white py-1 px-2 rounded-md text-sm font-semibold',
  WEBSOCKET: 'bg-[#b8860b] text-white py-1 px-2 rounded-md text-sm font-semibold',
  INTERNAL_NETWORK: 'bg-[#556b2f] text-white py-1 px-2 rounded-md text-sm font-semibold',
  THIRD_PARTY_INTEGRATION: 'bg-[#6495ed] text-white py-1 px-2 rounded-md text-sm font-semibold',
  DEBUG_ENDPOINT: 'bg-[#708090] text-white py-1 px-2 rounded-md text-sm font-semibold',
  POTENTIALLY_VULNERABLE: 'bg-[#ff6347] text-white py-1 px-2 rounded-md text-sm font-semibold',
  PARAMETERIZED_ENDPOINT: 'bg-[#ff8c00] text-white py-1 px-2 rounded-md text-sm font-semibold',
  NON_STANDARD_PORT: 'bg-[#8b0000] text-white py-1 px-2 rounded-md text-sm font-semibold',
  BASE64_ENCODED_SEGMENT: 'bg-[#4682b4] text-white py-1 px-2 rounded-md text-sm font-semibold'
} as const;

export const FILTER_CATEGORIES = {
  API_ENDPOINT: "text-green-500",
  URL_DATA_ACCESS: "text-blue-500",
  DATABASE_OPERATION: "text-purple-500",
  SENSITIVE_DATA: "text-red-500",
  UNSECURED_API: "text-red-600",
  AUTHENTICATION_ENDPOINT: "text-blue-900",
  DATA_TRANSFER: "text-yellow-500",
  ADMIN_PANEL: "text-green-700",
  PAYMENT_PROCESSING: "text-indigo-700",
  FILE_ACCESS: "text-orange-600",
  LEGACY_ENDPOINT: "text-gray-500",
  DYNAMIC_CONTENT: "text-purple-700",
  WEBSOCKET: "text-yellow-800",
  INTERNAL_NETWORK: "text-green-600",
  THIRD_PARTY_INTEGRATION: "text-blue-400",
  DEBUG_ENDPOINT: "text-gray-600",
  POTENTIALLY_VULNERABLE: "text-orange-700",
  PARAMETERIZED_ENDPOINT: "text-orange-600",
  NON_STANDARD_PORT: "text-red-800",
  BASE64_ENCODED_SEGMENT: "text-blue-600",
};

export enum ClassificationType {
  API_ENDPOINT = 'API_ENDPOINT',
  URL_DATA_ACCESS = 'URL_DATA_ACCESS',
  DATABASE_OPERATION = 'DATABASE_OPERATION',
  SENSITIVE_DATA = 'SENSITIVE_DATA',
  UNSECURED_API = 'UNSECURED_API',
  AUTHENTICATION_ENDPOINT = 'AUTHENTICATION_ENDPOINT',
  DATA_TRANSFER = 'DATA_TRANSFER',
  ADMIN_PANEL = 'ADMIN_PANEL',
  PAYMENT_PROCESSING = 'PAYMENT_PROCESSING',
  FILE_ACCESS = 'FILE_ACCESS',
  LEGACY_ENDPOINT = 'LEGACY_ENDPOINT',
  DYNAMIC_CONTENT = 'DYNAMIC_CONTENT',
  WEBSOCKET = 'WEBSOCKET',
  INTERNAL_NETWORK = 'INTERNAL_NETWORK',
  THIRD_PARTY_INTEGRATION = 'THIRD_PARTY_INTEGRATION',
  DEBUG_ENDPOINT = 'DEBUG_ENDPOINT',
  POTENTIALLY_VULNERABLE = 'POTENTIALLY_VULNERABLE',
  PARAMETERIZED_ENDPOINT = 'PARAMETERIZED_ENDPOINT',
  NON_STANDARD_PORT = 'NON_STANDARD_PORT',
  BASE64_ENCODED_SEGMENT = 'BASE64_ENCODED_SEGMENT'
}

export const ClassificationMapping: Record<string, ClassificationType> = {
  isAPIEndpoint: ClassificationType.API_ENDPOINT,
  isUserDataAccess: ClassificationType.URL_DATA_ACCESS,
  isDatabaseOperation: ClassificationType.DATABASE_OPERATION,
  isSensitiveData: ClassificationType.SENSITIVE_DATA,
  isUnsecuredAPI: ClassificationType.UNSECURED_API,
  isAuthEndpoint: ClassificationType.AUTHENTICATION_ENDPOINT,
  isDataTransfer: ClassificationType.DATA_TRANSFER,
  isAdminPanel: ClassificationType.ADMIN_PANEL,
  isPaymentProcessing: ClassificationType.PAYMENT_PROCESSING,
  isFileAccess: ClassificationType.FILE_ACCESS,
  isLegacyEndpoint: ClassificationType.LEGACY_ENDPOINT,
  isDynamicContent: ClassificationType.DYNAMIC_CONTENT,
  isWebSocket: ClassificationType.WEBSOCKET,
  isInternalNetwork: ClassificationType.INTERNAL_NETWORK,
  isThirdPartyIntegration: ClassificationType.THIRD_PARTY_INTEGRATION,
  isDebugEndpoint: ClassificationType.DEBUG_ENDPOINT,
  isPotentiallyVulnerable: ClassificationType.POTENTIALLY_VULNERABLE,
  isParameterizedEndpoint: ClassificationType.PARAMETERIZED_ENDPOINT,
  isNonStandardPort: ClassificationType.NON_STANDARD_PORT,
  isBase64EncodedSegment: ClassificationType.BASE64_ENCODED_SEGMENT
};