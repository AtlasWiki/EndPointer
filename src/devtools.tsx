/// <reference types="chrome"/>

import { createRoot } from 'react-dom/client'
import DevToolsApp from './DevtoolsApp'
import React from 'react';

chrome.devtools.panels.create(
  "Placeholder Extension",
  "",
  "devtools.html",  // Change this from "devtools.tsx" to "devtools.html"
  (panel) => {
    console.log("DevTools panel created");
    panel.onShown.addListener((panelWindow) => {
      console.log("Panel shown");
      const root = panelWindow.document.getElementById('root');
      if (root && !root.hasChildNodes()) {
        console.log("Root element found, rendering React component");
        createRoot(root).render(<DevToolsApp />);
      } else {
        console.log("Root element not found or already has children");
      }
    });
  }
);