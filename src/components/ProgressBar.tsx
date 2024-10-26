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
        background-color: #353535;
        padding: 10px;
        z-index: 9999;
        font-family: Arial, sans-serif;
      `;
  
      const statusText = document.createElement('div');
      statusText.style.cssText = `
        text-align: center;
        margin-bottom: 5px;
        color: white;
      `;
  
      const progressBar = document.createElement('div');
      progressBar.style.cssText = `
        height: 20px;
        background-color: #e0e0e0;
        border-radius: 10px;
        overflow: hidden;
      `;
  
      const progressFill = document.createElement('div');
      progressFill.style.cssText = `
        height: 100%;
        width: 0%;
        background-color: #4CAF50;
        transition: width 0.3s ease-in-out;
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
  