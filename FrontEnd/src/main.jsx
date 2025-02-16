import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx';
import BookDetails from './pages/NormalUser/BookPage'


import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import Home from './pages/NormalUser/Home'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    {/* <Home /> */}
    {/* <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/book/:bookId" element={<BookDetails />} />
      </Routes>
    </Router> */}
  </StrictMode>,
)
