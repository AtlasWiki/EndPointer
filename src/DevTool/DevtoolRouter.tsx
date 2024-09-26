import React, { StrictMode } from 'react'
import browser from 'webextension-polyfill'
import { createRoot } from 'react-dom/client'
import DevToolsApp from './DevtoolsApp'
import {
  HashRouter as Router,
  Route,
  Routes,
} from 'react-router-dom'
import { URLsDefaultView } from './routes/urls-defaultview'
import { URLsTreeView } from './routes/urls-treeview'
import { URLs } from './routes/urls';




// Create the DevTools panel
browser.devtools.panels.create(
  "endPointer",
  "",
  "DevTool/DevTool.html",
).then((panel: any) => {
  console.log("DevTools panel created");
})

// Render the React app
function renderApp() {
  const root = document.getElementById('root');
  if (root) {
    createRoot(root).render(
      <StrictMode>
        <Router>
          <Routes>
            <Route path="/" element={<DevToolsApp />} />
            <Route path="/urls/" element={<URLs />} />
            <Route path="/urls/default" element={<URLsDefaultView />} />
            <Route path="/urls/tree" element={<URLsTreeView />} />
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