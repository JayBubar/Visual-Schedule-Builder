import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/index.css'

// Error boundary for the entire application
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Application error:', error, errorInfo)
    
    // In production, you might want to send this to a logging service
    if (window.electronAPI) {
      window.electronAPI.logError({
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack
      })
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-content">
            <h1>Something went wrong</h1>
            <p>We're sorry, but something unexpected happened.</p>
            <details>
              <summary>Error Details</summary>
              <pre>{this.state.error?.stack}</pre>
            </details>
            <button 
              onClick={() => window.location.reload()}
              className="error-reload-button"
            >
              Reload Application
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Accessibility announcer function
function announceToScreenReader(message: string) {
  const announcer = document.getElementById('a11y-announcer')
  if (announcer) {
    announcer.textContent = message
    // Clear after a short delay to allow multiple announcements
    setTimeout(() => {
      announcer.textContent = ''
    }, 1000)
  }
}

// Make announcer available globally for components to use
declare global {
  interface Window {
    announceToScreenReader: (message: string) => void
    electronAPI?: {
      logError: (error: any) => void
    }
  }
}

window.announceToScreenReader = announceToScreenReader

// Remove loading screen when React mounts
function removeLoadingScreen() {
  const loadingScreen = document.getElementById('loading-screen')
  if (loadingScreen) {
    loadingScreen.style.display = 'none'
    document.body.classList.add('app-loaded')
  }
}

// Initialize the React application
function initializeApp() {
  const rootElement = document.getElementById('root')
  
  if (!rootElement) {
    throw new Error('Root element not found')
  }

  const root = ReactDOM.createRoot(rootElement)
  
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  )
  
  // Remove loading screen after a brief delay to ensure smooth transition
  setTimeout(removeLoadingScreen, 100)
}

// Start the application
try {
  initializeApp()
  
  // Announce app ready to screen readers
  setTimeout(() => {
    announceToScreenReader('Visual Schedule Builder application loaded and ready')
  }, 500)
} catch (error) {
  console.error('Failed to initialize application:', error)
  
  // Show error in loading screen if React fails to mount
  const loadingText = document.querySelector('.loading-text')
  const loadingSubtitle = document.querySelector('.loading-subtitle')
  
  if (loadingText && loadingSubtitle) {
    loadingText.textContent = 'Application Error'
    loadingSubtitle.textContent = 'Failed to load Visual Schedule Builder. Please try restarting the application.'
  }
}
