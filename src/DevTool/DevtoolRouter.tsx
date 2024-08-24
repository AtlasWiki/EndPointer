/*
ADD CALLS TO THE CHROME API FOR FUTHER ACCESS AND FUNCTIONALITY. 
ENSURE ALL REQUIRED PERMISSONS ARE ADDED TO MANIFEST.JSON
https://developer.chrome.com/docs/extensions/how-to/devtools/extend-devtools
*/

/// <reference types="chrome"/>


import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import DevToolsApp from './DevtoolsApp'
import Example from './routes/example'
import {
  HashRouter as Router,
  Route,
  Routes,
} from 'react-router-dom'
import React from 'react';
import { URLS } from './routes/urls'
import { JSFiles } from './routes/js-files' 

import browser from 'webextension-polyfill';


// Use Chrome API if available, otherwise fall back to browser API
const api = typeof chrome !== 'undefined' ? chrome : browser;

api.devtools.panels.create(
  "JS-Toolkit",  //CHANGE HERE TO ADJUST TAB NAME IN DEV TOOLS
  "",
  "devtools.html",
  (panel) => {
    console.log("DevTools panel created");
    panel.onShown.addListener((panelWindow) => {
      console.log("Panel shown");
      const root = panelWindow.document.getElementById('root');
      if (root && !root.hasChildNodes()) {
        console.log("Root element found, rendering React component");
        createRoot(root).render(
          <StrictMode>
            <Router>
              <Routes>
                <Route path="" element={<DevToolsApp />} />
                <Route path="example" element={<Example />} />
                <Route path="urls" element={<URLS />} />
                <Route path="js-files" element={<JSFiles />} />
              </Routes>
            </Router>
          </StrictMode>
          
        );
      } else {
        console.log("Root element not found or already has children");
      }
    });
  }
);