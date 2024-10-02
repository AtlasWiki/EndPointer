// src/utils/index.ts

import browser from 'webextension-polyfill';
import { Endpoint } from '../constants/message_types';

export function sanitizeURL(endpoint: Endpoint): string {
  const cleanedWebpage = endpoint.webpage.replace(/\/$/, '').split('#')[0];

  if (endpoint.url && (endpoint.url.startsWith("http://") || endpoint.url.startsWith("https://"))) {
    return endpoint.url;
  } else if (endpoint.url.startsWith('/')) {
    return cleanedWebpage + endpoint.url;
  } else {
    return cleanedWebpage + '/' + endpoint.url;
  }
}

export function clearURLs(): void {
  browser.storage.local.set({ 'URL-PARSER': {} }).then(() => {
    console.log("Cleared endpoints");
  }).catch((error) => {
    console.error("Failed to clear endpoints:", error);
  });
}

export function highlightSearchQuery(text: string, query: string): JSX.Element[] {
  if (!query) return [<span key={0}>{text}</span>];

  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escapedQuery})`, 'gi'));

  return parts.map((part, index) => 
    part.toLowerCase() === query.toLowerCase() 
      ? <span key={index} className="text-red-500 font-semibold">{part}</span>
      : <span key={index}>{part}</span>
  );
}

export async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 5000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number): (...args: Parameters<F>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<F>): void => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };
}