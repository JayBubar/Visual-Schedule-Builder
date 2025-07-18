import React from 'react'

interface SmartboardDisplayProps {
  isActive: boolean
  isFullscreen: boolean
}

export default function SmartboardDisplay({ isActive, isFullscreen }: SmartboardDisplayProps) {
  if (!isActive) return null

  return (
    <div 
      className="smartboard-display" 
      style={{ 
        padding: isFullscreen ? '40px' : '24px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        height: '100%',
        minHeight: '100vh'
      }}
    >
      <div style={{ 
        maxWidth: isFullscreen ? 'none' : '1200px',
        margin: '0 auto',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        textAlign: 'center'
      }}>
        {/* Header */}
        <div style={{ 
          marginBottom: '32px',
          paddingBottom: isFullscreen ? '32px' : '24px',
          borderBottom: '2px solid rgba(255, 255, 255, 0.3)'
        }}>
          <h1 style={{ 
            margin: '0 0 16px',
            fontSize: isFullscreen ? '48px' : '32px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px'
          }}>
            📱 Today's Schedule
          </h1>
          <p style={{ 
            margin: 0,
            fontSize: isFullscreen ? '24px' : '18px',
            opacity: 0.9
          }}>
            Touch-friendly display optimized for classroom smartboards
          </p>
        </div>

        {/* Schedule Items */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: isFullscreen ? 'repeat(auto-fit, minmax(300px, 1fr))' : 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: isFullscreen ? '24px' : '16px',
          flex: 1
        }}>
          {[
            { time: '8:30 AM', activity: 'Morning Meeting', icon: '☀️', completed: true },
            { time: '9:00 AM', activity: 'Math', icon: '🔢', completed: true },
            { time: '10:00 AM', activity: 'Reading', icon: '📚', completed: false, current: true },
            { time: '11:00 AM', activity: 'Recess', icon: '🏃', completed: false },
            { time: '11:30 AM', activity: 'Science', icon: '🔬', completed: false },
            { time: '12:30 PM', activity: 'Lunch', icon: '🍽️', completed: false }
          ].map((item, index) => (
            <div
              key={index}
              style={{
                background: item.completed 
                  ? 'rgba(34, 197, 94, 0.9)' 
                  : item.current 
                    ? 'rgba(59, 130, 246, 0.9)'
                    : 'rgba(255, 255, 255, 0.9)',
                color: item.completed || item.current ? 'white' : '#1e293b',
                borderRadius: '16px',
                padding: isFullscreen ? '32px' : '24px',
                border: item.current ? '4px solid #fbbf24' : 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: isFullscreen ? '200px' : '160px',
                position: 'relative',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)'
                e.currentTarget.style.boxShadow = '0 12px 48px rgba(0, 0, 0, 0.2)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)'
              }}
            >
              {/* Status indicator */}
              {item.completed && (
                <div style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: '#22c55e',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px'
                }}>
                  ✓
                </div>
              )}
              
              {item.current && (
                <div style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: '#fbbf24',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  animation: 'pulse 2s infinite'
                }}>
                  ▶️
                </div>
              )}

              {/* Activity icon */}
              <div style={{ 
                fontSize: isFullscreen ? '64px' : '48px',
                marginBottom: '16px'
              }}>
                {item.icon}
              </div>

              {/* Time */}
              <div style={{
                fontSize: isFullscreen ? '20px' : '16px',
                fontWeight: 'bold',
                marginBottom: '8px',
                opacity: 0.8
              }}>
                {item.time}
              </div>

              {/* Activity name */}
              <div style={{
                fontSize: isFullscreen ? '24px' : '20px',
                fontWeight: 'bold'
              }}>
                {item.activity}
              </div>
            </div>
          ))}
        </div>

        {/* Footer with instructions */}
        <div style={{ 
          marginTop: '32px',
          padding: isFullscreen ? '24px' : '16px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          fontSize: isFullscreen ? '18px' : '14px',
          opacity: 0.8
        }}>
          <strong>Touch an activity to mark it complete!</strong>
          <br />
          Coming soon: Real-time progress tracking, transition timers, and student check-in features
        </div>
      </div>

      {/* CSS for pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}
