
export class DOMObserver {
    private observer: MutationObserver | null = null;
    private jsFiles: Set<string> = new Set();

    /**
     * This will observe the DOM for new script tags
     * Uses a callback function to call when new script tags are found URLs are extracted
     */

    startObserving(callback: (newJsFiles: string[]) => void): void {
        this.observer = new MutationObserver((mutations)=> {
            for (const mutation of mutations) {
                if (mutation.type === 'childList') {
                    const newScript = Array.from(mutation.addedNodes)
                    .filter((node): node is HTMLScriptElement =>
                    node.nodeName === 'SCRIPT' &&
                    node instanceof HTMLScriptElement &&
                    node.src !== '' &&
                    !this.jsFiles.has(node.src)
                )
                .map(script => script.src);

                if (newScript.length > 0) {
                    newScript.forEach(file => this.jsFiles.add(file));
                    callback(newScript);
                }
            }
         }
        });

        this.observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });
    }

    stopObserving(): void{
        this.observer?.disconnect();
        this.observer = null;
    }

    getJSFileCount(): number {
        return this.jsFiles.size;
    }

    addInitialFiles(initialFiles: string[]): void{
        initialFiles.forEach(file => this.jsFiles.add(file));
    }
}