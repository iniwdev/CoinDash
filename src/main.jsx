import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { CryptoProvider } from './context/CryptoContext.jsx'
import { SearchProvider } from './context/SearchContext.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <SearchProvider>
      <CryptoProvider>
        <App />
      </CryptoProvider>
    </SearchProvider>
  </BrowserRouter>
)
