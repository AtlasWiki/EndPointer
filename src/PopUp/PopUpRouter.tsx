import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  HashRouter as Router,
  Route,
  Routes,
} from 'react-router-dom'
import PopUpApp from './PopUpApp'
import './index.css'
import { URLs } from './routes/urls'
import { URLsPlain } from './routes/urls-plain'
import { URLsCSV } from './routes/urls-csv'
import { URLsOutput } from './routes/urls-output'

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <Router>
        <Routes>
          <Route path="" element={<PopUpApp />} />
          <Route path="/urls" element={<URLs />} />
          <Route path="/urls/output" element={<URLsOutput />} />
        </Routes>
      </Router>
    </StrictMode>
  );
  } else {
  console.error('Root element not found');
}