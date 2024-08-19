/// <reference types="chrome"/>

import { createRoot } from 'react-dom/client'
import DevToolsApp from './DevtoolsApp'
import React from 'react';

chrome.devtools.panels.create(
  "Placeholder Extension",
  "",
  "devtools.html",
  (panel) => {
    panel.onShown.addListener(() => {
      const root = document.getElementById('root')
      if (root && !root.hasChildNodes()) {
        createRoot(root).render(<DevToolsApp />)
      }
    });
  }
)