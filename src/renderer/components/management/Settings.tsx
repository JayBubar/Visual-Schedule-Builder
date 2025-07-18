import React from 'react'

interface SettingsProps {
  theme: 'light' | 'dark' | 'high-contrast'
  onThemeChange: (theme: 'light' | 'dark' | 'high-contrast') => void
}

export default function Settings({ theme, onThemeChange }: SettingsProps) {
  return (
    <div className="settings" style={{ padding: '24px', height: '100%' }}>
      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{ 
          marginBottom: '32px',
          paddingBottom: '20px',
          borderBottom: '2px solid #e2e8f0'
        }}>
          <h1 style={{ 
            margin: '0 0 12px',
            fontSize: '32px',
            color: '#1e293b',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            ⚙️ Settings
          </h1>
          <p style={{ 
            margin: 0,
            color: '#64748b',
            fontSize: '18px'
          }}>
            Customize your Visual Schedule Builder experience
          </p>
        </div>

        {/* Settings Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Appearance Settings */}
          <div style={{
            background: 'white',
            border: '2px solid #e2e8f0',
            borderRadius: '12px',
            padding: '24px'
          }}>
            <h3 style={{
              margin: '0 0 16px',
              fontSize: '20px',
              color: '#1e293b',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              🎨 Appearance
            </h3>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151'
              }}>
                Theme
              </label>
              <div style={{ display: 'flex', gap: '12px' }}>
                {(['light', 'dark', 'high-contrast'] as const).map((themeOption) => (
                  <button
                    key={themeOption}
                    onClick={() => onThemeChange(themeOption)}
                    style={{
                      background: theme === themeOption ? '#3b82f6' : 'white',
                      color: theme === themeOption ? 'white' : '#374151',
                      border: '2px solid #e2e8f0',
                      padding: '12px 20px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      textTransform: 'capitalize',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {themeOption.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Accessibility Settings */}
          <div style={{
            background: 'white',
            border: '2px solid #e2e8f0',
            borderRadius: '12px',
            padding: '24px'
          }}>
            <h3 style={{
              margin: '0 0 16px',
              fontSize: '20px',
              color: '#1e293b',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              ♿ Accessibility
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { id: 'large-text', label: 'Large Text', description: 'Increase font sizes for better readability' },
                { id: 'high-contrast', label: 'High Contrast Mode', description: 'Enhanced contrast for visual accessibility' },
                { id: 'screen-reader', label: 'Screen Reader Support', description: 'Enhanced screen reader announcements' },
                { id: 'reduce-motion', label: 'Reduce Motion', description: 'Minimize animations and transitions' }
              ].map((setting) => (
                <div key={setting.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  background: '#f8fafc',
                  borderRadius: '8px'
                }}>
                  <div>
                    <div style={{ fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                      {setting.label}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      {setting.description}
                    </div>
                  </div>
                  <div style={{
                    width: '44px',
                    height: '24px',
                    background: '#cbd5e1',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'background 0.2s ease'
                  }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      background: 'white',
                      borderRadius: '50%',
                      position: 'absolute',
                      top: '2px',
                      left: '2px',
                      transition: 'transform 0.2s ease'
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Smartboard Settings */}
          <div style={{
            background: 'white',
            border: '2px solid #e2e8f0',
            borderRadius: '12px',
            padding: '24px'
          }}>
            <h3 style={{
              margin: '0 0 16px',
              fontSize: '20px',
              color: '#1e293b',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              📱 Smartboard Display
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  Touch Target Size
                </label>
                <select style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}>
                  <option>Standard (44px)</option>
                  <option>Large (56px)</option>
                  <option>Extra Large (72px)</option>
                </select>
              </div>
              
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  Activity Icons per Row
                </label>
                <input
                  type="range"
                  min="2"
                  max="6"
                  defaultValue="4"
                  style={{ width: '100%' }}
                />
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '12px',
                  color: '#64748b',
                  marginTop: '4px'
                }}>
                  <span>2</span>
                  <span>4 (Current)</span>
                  <span>6</span>
                </div>
              </div>
            </div>
          </div>

          {/* Audio Settings */}
          <div style={{
            background: 'white',
            border: '2px solid #e2e8f0',
            borderRadius: '12px',
            padding: '24px'
          }}>
            <h3 style={{
              margin: '0 0 16px',
              fontSize: '20px',
              color: '#1e293b',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              🔊 Audio & Notifications
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  Transition Sounds
                </label>
                <div style={{
                  padding: '12px',
                  background: '#fef3c7',
                  border: '1px solid #f59e0b',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#92400e'
                }}>
                  🚧 Audio features coming in Phase 4
                </div>
              </div>
            </div>
          </div>

          {/* Data & Privacy */}
          <div style={{
            background: 'white',
            border: '2px solid #e2e8f0',
            borderRadius: '12px',
            padding: '24px'
          }}>
            <h3 style={{
              margin: '0 0 16px',
              fontSize: '20px',
              color: '#1e293b',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              🔒 Data & Privacy
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button style={{
                background: '#f3f4f6',
                color: '#374151',
                border: '1px solid #d1d5db',
                padding: '12px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                textAlign: 'left'
              }}>
                📁 Export All Data
              </button>
              <button style={{
                background: '#f3f4f6',
                color: '#374151',
                border: '1px solid #d1d5db',
                padding: '12px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                textAlign: 'left'
              }}>
                🗑️ Clear All Data
              </button>
              <div style={{
                padding: '12px',
                background: '#f0f9ff',
                border: '1px solid #0ea5e9',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#0c4a6e'
              }}>
                ℹ️ All data is stored locally on your device. No information is sent to external servers.
              </div>
            </div>
          </div>

          {/* About */}
          <div style={{
            background: 'white',
            border: '2px solid #e2e8f0',
            borderRadius: '12px',
            padding: '24px'
          }}>
            <h3 style={{
              margin: '0 0 16px',
              fontSize: '20px',
              color: '#1e293b',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              ℹ️ About
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', color: '#64748b' }}>
              <div><strong>Version:</strong> 0.1.0 (Development)</div>
              <div><strong>Built with:</strong> Electron + React + TypeScript</div>
              <div><strong>License:</strong> MIT Open Source</div>
              <div style={{ marginTop: '12px' }}>
                <a 
                  href="https://github.com/JayBubar/visual-schedule-builder" 
                  style={{ color: '#3b82f6', textDecoration: 'none' }}
                >
                  🔗 View on GitHub
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
