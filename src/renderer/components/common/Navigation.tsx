import React from 'react'

interface NavigationProps {
  currentView: 'builder' | 'display' | 'management'
  onViewChange: (view: 'builder' | 'display' | 'management') => void
}

export default function Navigation({ currentView, onViewChange }: NavigationProps) {
  const navItems = [
    { id: 'builder', label: 'Schedule Builder', icon: '🎨' },
    { id: 'display', label: 'Smartboard Display', icon: '📱' },
    { id: 'management', label: 'Student Management', icon: '👥' }
  ] as const

  return (
    <nav 
      className="navigation"
      role="navigation" 
      aria-label="Main navigation"
      style={{
        display: 'flex',
        background: '#1e293b',
        color: 'white',
        padding: '0',
        borderBottom: '2px solid #475569'
      }}
    >
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
          background: '#0f172a',
          borderRight: '1px solid #475569'
        }}
      >
        <h1 style={{ 
          margin: 0, 
          fontSize: '18px', 
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          📅 Visual Schedule Builder
        </h1>
      </div>

      <div style={{ display: 'flex' }}>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={currentView === item.id ? 'nav-item active' : 'nav-item'}
            style={{
              background: currentView === item.id ? '#3b82f6' : 'transparent',
              border: 'none',
              color: 'white',
              padding: '16px 24px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: 500,
              transition: 'background 0.2s ease',
              borderBottom: currentView === item.id ? '3px solid #60a5fa' : '3px solid transparent'
            }}
            onMouseEnter={(e) => {
              if (currentView !== item.id) {
                e.currentTarget.style.background = '#334155'
              }
            }}
            onMouseLeave={(e) => {
              if (currentView !== item.id) {
                e.currentTarget.style.background = 'transparent'
              }
            }}
            aria-current={currentView === item.id ? 'page' : undefined}
          >
            <span style={{ fontSize: '16px' }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>

      <div style={{ 
        marginLeft: 'auto', 
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontSize: '12px',
        opacity: 0.7
      }}>
        <span>v0.1.0</span>
        <span>•</span>
        <span>Development Mode</span>
      </div>
    </nav>
  )
}
