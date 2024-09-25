import browser from 'webextension-polyfill';

export default browser;

export function setupPolyfill() {
  if (typeof chrome !== 'undefined') {
    // @ts-ignore
    globalThis.browser = browser;
  }
}