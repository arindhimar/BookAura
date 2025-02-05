import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx';

import Home from './pages/Home'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* <App /> */}
    <Home />
  </StrictMode>,
)
