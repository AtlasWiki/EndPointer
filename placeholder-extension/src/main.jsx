import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import PopUpApp from './PopUpApp.jsx'
import './index.css'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PopUpApp />
  </StrictMode>,
)
