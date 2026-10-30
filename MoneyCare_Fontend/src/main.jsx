import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import ErrorBoundary from './components/ErrorBoundary'
import { AppProvider } from './context/AppContext'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AppProvider>
        <App />
      </AppProvider>
    </ErrorBoundary>
  </React.StrictMode>
)
