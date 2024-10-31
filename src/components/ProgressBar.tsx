export interface ProgressBarElement extends HTMLDivElement {
    setProgress: (progress: number) => void;
    setStatus: (status: string) => void;
  }
  
  export class ProgressBar {
    private element: ProgressBarElement | null = null;
  
    private create(): ProgressBarElement {
      const container = document.createElement('div') as ProgressBarElement;
      container.id = 'parsing-progress-container';
      container.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background-color: #1e2a31; /* Darker background for contrast */
        padding: 15px;
        z-index: 9999;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3); /* Subtle shadow */
        border-bottom: 2px solid #316e7d; /* Bottom border for emphasis */
    `;
  
      const statusText = document.createElement('div');
      statusText.style.cssText = `
        text-align: center;
        margin-bottom: 5px;
        color: #e0e0e0; /* Lighter color for better visibility */
        font-weight: bold; /* Make text bold */
      `;
  
      const progressBar = document.createElement('div');
      progressBar.style.cssText = `
        height: 15px; /* Slightly taller for better visibility */
        background-color: #3b4b54; /* Lighter gray background */
        border-radius: 8px; /* Rounder corners */
        overflow: hidden;
      `;
  
      const progressFill = document.createElement('div');
      progressFill.style.cssText = `
        height: 100%;
        width: 0%;
        background-color: #2ca9b8; /* Brighter color for the fill */
        transition: width 0.4s ease; /* Slightly slower transition */
      `;
  
      progressBar.appendChild(progressFill);
      container.appendChild(statusText);
      container.appendChild(progressBar);
  
      container.setProgress = (progress: number) => {
        progressFill.style.width = `${Math.min(100, Math.max(0, progress))}%`;
      };
  
      container.setStatus = (status: string) => {
        statusText.textContent = status;
      };
  
      document.body.insertBefore(container, document.body.firstChild);
      return container;
    }
  
    update(progress: number, status: string): void {
      if (!this.element) {
        this.element = this.create();
      }
      this.element.setProgress(progress);
      this.element.setStatus(status);
    }
  
    remove(): void {
      if (this.element) {
        this.element.remove();
        this.element = null;
      }
    }
  }
  