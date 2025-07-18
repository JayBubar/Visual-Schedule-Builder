import React from 'react'

interface ScheduleBuilderProps {
  isActive: boolean
}

export default function ScheduleBuilder({ isActive }: ScheduleBuilderProps) {
  if (!isActive) return null

  return (
    <div className="schedule-builder" style={{ padding: '24px', height: '100%' }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{ 
          marginBottom: '24px',
          paddingBottom: '16px',
          borderBottom: '2px solid #e2e8f0'
        }}>
          <h1 style={{ 
            margin: '0 0 8px',
            fontSize: '28px',
            color: '#1e293b',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            🎨 Schedule Builder
          </h1>
          <p style={{ 
            margin: 0,
            color: '#64748b',
            fontSize: '16px'
          }}>
            Create interactive visual schedules with drag-and-drop functionality
          </p>
        </div>

        {/* Main Content Area */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: '300px 1fr',
          gap: '24px',
          flex: 1,
          minHeight: 0
        }}>
          {/* Activity Library Sidebar */}
          <div style={{
            background: '#f8fafc',
            border: '2px solid #e2e8f0',
            borderRadius: '12px',
            padding: '20px',
            overflow: 'auto'
          }}>
            <h3 style={{
              margin: '0 0 16px',
              fontSize: '18px',
              color: '#374151',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              📚 Activity Library
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {['Morning Meeting', 'Math', 'Reading', 'Recess', 'Lunch', 'Science', 'Art', 'Dismissal'].map((activity, index) => (
                <div
                  key={activity}
                  style={{
                    background: 'white',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease',
                    fontSize: '14px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#3b82f6'
                    e.currentTarget.style.color = 'white'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white'
                    e.currentTarget.style.color = 'inherit'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  <span style={{ fontSize: '20px' }}>
                    {['☀️', '🔢', '📚', '🏃', '🍽️', '🔬', '🎨', '👋'][index]}
                  </span>
                  {activity}
                </div>
              ))}
            </div>
          </div>

          {/* Schedule Canvas */}
          <div style={{
            background: 'white',
            border: '2px dashed #cbd5e1',
            borderRadius: '12px',
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            minHeight: '400px'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>📅</div>
            <h2 style={{ 
              margin: '0 0 12px',
              color: '#475569',
              fontSize: '24px'
            }}>
              Schedule Canvas
            </h2>
            <p style={{
              margin: '0 0 20px',
              color: '#64748b',
              fontSize: '16px',
              maxWidth: '400px',
              lineHeight: 1.5
            }}>
              Drag activities from the library to create your daily schedule. 
              This is where the drag-and-drop magic will happen!
            </p>
            
            <div style={{
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '16px',
              fontSize: '14px',
              color: '#64748b'
            }}>
              <strong>Coming Soon:</strong>
              <ul style={{ margin: '8px 0 0', textAlign: 'left', paddingLeft: '20px' }}>
                <li>Drag-and-drop schedule creation</li>
                <li>Time slot management</li>
                <li>Activity customization</li>
                <li>Template saving/loading</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
