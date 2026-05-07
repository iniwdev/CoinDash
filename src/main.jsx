import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { CryptoProvider } from './context/CryptoContext.jsx'
import { SearchProvider } from './context/SearchContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { AiProvider } from './context/AiContext.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AiProvider>
      <SearchProvider>
        <CryptoProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </CryptoProvider>
      </SearchProvider>
    </AiProvider>
  </BrowserRouter>
)
