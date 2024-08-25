import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import DevToolsApp from './DevtoolsApp'
import Example from './routes/example'
import {
  HashRouter as Router,
  Route,
  Routes,
} from 'react-router-dom'
import { URLS } from './routes/urls'
import { JSFiles } from './routes/js-files'
import { Creds } from './routes/creds'
import { APIKeys } from './routes/apikeys'

// Create the DevTools panel
chrome.devtools.panels.create(
  "JS-Toolkit",
  "",
  "DevTool/DevTool.html",
  (panel) => {
    console.log("DevTools panel created");
  }
);

// Render the React app
function renderApp() {
  const root = document.getElementById('root');
  if (root) {
    createRoot(root).render(
      <StrictMode>
        <Router>
          <Routes>
            <Route path="/" element={<DevToolsApp />} />
            <Route path="/example" element={<Example />} />
            <Route path="/urls" element={<URLS />} />
            <Route path="/js-files" element={<JSFiles />} />
            <Route path="/creds" element={<Creds />} />
            <Route path="/apikeys" element={<APIKeys />} />
            <Route path="/urlsvisited" element={<APIKeys />} />
          </Routes>
        </Router>
      </StrictMode>
    );
  } else {
    console.log("Root element not found");
  }
}

// Wait for the DOM to be fully loaded before rendering
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderApp);
} else {
  renderApp();
}