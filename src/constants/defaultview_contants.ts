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
  MODAL_OVERLAY: 'fixed inset-0 flex items-center justify-center bg-black bg-opacity-50',
  MODAL_CONTENT: 'bg-[#363333] opacity-85 p-5 rounded-lg shadow-lg',
} as const;