import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

// Components (will be created in next steps)
import Navigation from './components/common/Navigation'
import ScheduleBuilder from './components/builder/ScheduleBuilder'
import SmartboardDisplay from './components/display/SmartboardDisplay'
import StudentManagement from './components/management/StudentManagement'
import Settings from './components/management/Settings'
import ActivityLibrary from './components/common/ActivityLibrary'

// Types
interface AppState {
  currentView: 'builder' | 'display' | 'management'
  isFullscreen: boolean
  theme: 'light' | 'dark' | 'high-contrast'
}

function App() {
  const [appState, setAppState] = useState<AppState>({
    currentView: 'builder',
    isFullscreen: false,
    theme: 'light'
  })

  // Handle menu commands from Electron
  useEffect(() => {
    // Listen for menu commands if in Electron environment
    if (window.electronAPI) {
      const handleMenuCommand = (command: string) => {
        switch (command) {
          case 'menu-view-builder':
            setAppState(prev => ({ ...prev, currentView: 'builder' }))
            break
          case 'menu-view-display':
            setAppState(prev => ({ ...prev, currentView: 'display' }))
            break
          case 'menu-view-management':
            setAppState(prev => ({ ...prev, currentView: 'management' }))
            break
          default:
            console.log('Unhandled menu command:', command)
        }
      }

      // In a real implementation, you'd set up IPC listeners here
      // For now, this is a placeholder
      console.log('Menu handlers would be set up here')
    }
  }, [])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (event: KeyboardEvent) => {
      // Handle global keyboard shortcuts
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case '1':
            event.preventDefault()
            setAppState(prev => ({ ...prev, currentView: 'builder' }))
            window.announceToScreenReader('Switched to Schedule Builder')
            break
          case '2':
            event.preventDefault()
            setAppState(prev => ({ ...prev, currentView: 'display' }))
            window.announceToScreenReader('Switched to Smartboard Display')
            break
          case '3':
            event.preventDefault()
            setAppState(prev => ({ ...prev, currentView: 'management' }))
            window.announceToScreenReader('Switched to Student Management')
            break
        }
      }

      // Handle F11 for fullscreen (when not in Electron)
      if (event.key === 'F11' && !window.electronAPI) {
        event.preventDefault()
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen()
          setAppState(prev => ({ ...prev, isFullscreen: true }))
        } else {
          document.exitFullscreen()
          setAppState(prev => ({ ...prev, isFullscreen: false }))
        }
      }
    }

    document.addEventListener('keydown', handleKeyboard)
    return () => document.removeEventListener('keydown', handleKeyboard)
  }, [])

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setAppState(prev => ({ 
        ...prev, 
        isFullscreen: !!document.fullscreenElement 
      }))
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  return (
    <DndProvider backend={HTML5Backend}>
      <Router>
        <div 
          className={`app ${appState.theme} ${appState.isFullscreen ? 'fullscreen' : ''}`}
          role="application"
          aria-label="Visual Schedule Builder"
        >
          {/* Skip to main content link for screen readers */}
          <a 
            href="#main-content" 
            className="skip-link"
            onFocus={() => window.announceToScreenReader('Skip to main content link focused')}
          >
            Skip to main content
          </a>

          {/* Navigation - hidden in fullscreen display mode */}
          {!(appState.isFullscreen && appState.currentView === 'display') && (
            <Navigation 
              currentView={appState.currentView}
              onViewChange={(view) => {
                setAppState(prev => ({ ...prev, currentView: view }))
                window.announceToScreenReader(`Switched to ${view}`)
              }}
            />
          )}

          {/* Main content area */}
          <main 
            id="main-content"
            className="main-content"
            role="main"
            tabIndex={-1}
          >
            <Routes>
              <Route path="/" element={<Navigate to="/builder" replace />} />
              <Route 
                path="/builder" 
                element={
                  <ScheduleBuilder 
                    isActive={appState.currentView === 'builder'}
                  />
                } 
              />
              <Route 
                path="/display" 
                element={
                  <SmartboardDisplay 
                    isActive={appState.currentView === 'display'}
                    isFullscreen={appState.isFullscreen}
                  />
                } 
              />
              <Route 
                path="/management" 
                element={
                  <StudentManagement 
                    isActive={appState.currentView === 'management'}
                  />
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <Settings 
                    theme={appState.theme}
                    onThemeChange={(theme) => 
                      setAppState(prev => ({ ...prev, theme }))
                    }
                  />
                } 
              />
              <Route 
                path="/library" 
                element={<ActivityLibrary />} 
              />
            </Routes>
          </main>

          {/* Global keyboard shortcut hints - only show when not in display mode */}
          {appState.currentView !== 'display' && (
            <div className="keyboard-hints" role="complementary" aria-label="Keyboard shortcuts">
              <span className="keyboard-hint">Ctrl+1: Builder</span>
              <span className="keyboard-hint">Ctrl+2: Display</span>
              <span className="keyboard-hint">Ctrl+3: Management</span>
            </div>
          )}
        </div>
      </Router>
    </DndProvider>
  )
}

export default App
