/// <reference types="chrome"/>


import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import DevToolsApp from './DevTool/DevtoolsApp'
import { URLS } from './PopUp/routes/urls'
import { JSFiles } from './PopUp/routes/js-files'
import {
  HashRouter as Router,
  Route,
  Routes,
} from 'react-router-dom'
import React from 'react';
import "./index.css"

chrome.devtools.panels.create(
  "JS-Toolkit",
  "",
  "devtools.html",  // Change this from "devtools.tsx" to "devtools.html"
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
              <Route path="urls" element={<URLS />} />
              <Route path="js-files" element={<JSFiles />} />
            </Routes>
          </Router>
        </StrictMode>);
      } else {
        console.log("Root element not found or already has children");
      }
    });
  }
);