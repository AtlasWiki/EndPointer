import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import PopUpApp from './PopUpApp.jsx'
import {
  HashRouter as Router,
  Route,
  Routes,
} from 'react-router-dom'
import './index.css'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="" element={<PopUpApp />} />
      </Routes>
    </Router>
  </StrictMode>

)
