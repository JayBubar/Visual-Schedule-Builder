import React from 'react'

interface StudentManagementProps {
  isActive: boolean
}

export default function StudentManagement({ isActive }: StudentManagementProps) {
  if (!isActive) return null

  const mockStudents = [
    { id: 1, name: 'Alex Johnson', grade: '3rd', accommodations: ['Visual supports', 'Extra time'], avatar: '👦' },
    { id: 2, name: 'Sam Chen', grade: '3rd', accommodations: ['Movement breaks', 'Audio cues'], avatar: '👧' },
    { id: 3, name: 'Jordan Smith', grade: '3rd', accommodations: ['Simplified instructions'], avatar: '🧒' },
    { id: 4, name: 'Casey Williams', grade: '3rd', accommodations: ['Visual supports', 'Quiet space'], avatar: '👶' }
  ]

  return (
    <div className="student-management" style={{ padding: '24px', height: '100%' }}>
      <div style={{ 
        maxWidth: '1200px', 
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
            👥 Student Management
          </h1>
          <p style={{ 
            margin: 0,
            color: '#64748b',
            fontSize: '18px'
          }}>
            Manage individual student profiles, accommodations, and schedule preferences
          </p>
        </div>

        {/* Action Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          padding: '16px',
          background: '#f8fafc',
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button style={{
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              ➕ Add Student
            </button>
            <button style={{
              background: 'white',
              color: '#374151',
              border: '1px solid #d1d5db',
              padding: '12px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500'
            }}>
              📊 View Reports
            </button>
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#64748b',
            fontSize: '14px'
          }}>
            <span>👥</span>
            <span>{mockStudents.length} students</span>
          </div>
        </div>

        {/* Student Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '20px',
          flex: 1
        }}>
          {mockStudents.map((student) => (
            <div
              key={student.id}
              style={{
                background: 'white',
                border: '2px solid #e2e8f0',
                borderRadius: '16px',
                padding: '24px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                height: 'fit-content'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#3b82f6'
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              {/* Student Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '16px'
              }}>
                <div style={{
                  fontSize: '48px',
                  background: '#f1f5f9',
                  borderRadius: '50%',
                  width: '72px',
                  height: '72px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {student.avatar}
                </div>
                <div>
                  <h3 style={{
                    margin: '0 0 4px',
                    fontSize: '20px',
                    color: '#1e293b'
                  }}>
                    {student.name}
                  </h3>
                  <p style={{
                    margin: 0,
                    color: '#64748b',
                    fontSize: '14px'
                  }}>
                    {student.grade} Grade
                  </p>
                </div>
              </div>

              {/* Accommodations */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{
                  margin: '0 0 8px',
                  fontSize: '14px',
                  color: '#374151',
                  fontWeight: '600'
                }}>
                  Accommodations:
                </h4>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px'
                }}>
                  {student.accommodations.map((accommodation, index) => (
                    <span
                      key={index}
                      style={{
                        background: '#dbeafe',
                        color: '#1e40af',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}
                    >
                      {accommodation}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                gap: '8px'
              }}>
                <button style={{
                  flex: 1,
                  background: '#f1f5f9',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '500'
                }}>
                  📝 Edit Profile
                </button>
                <button style={{
                  flex: 1,
                  background: '#f1f5f9',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '500'
                }}>
                  📅 View Schedule
                </button>
              </div>
            </div>
          ))}

          {/* Add New Student Card */}
          <div
            style={{
              background: '#f8fafc',
              border: '2px dashed #cbd5e1',
              borderRadius: '16px',
              padding: '24px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              minHeight: '200px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#3b82f6'
              e.currentTarget.style.background = '#f0f9ff'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#cbd5e1'
              e.currentTarget.style.background = '#f8fafc'
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>➕</div>
            <h3 style={{
              margin: '0 0 8px',
              fontSize: '18px',
              color: '#374151'
            }}>
              Add New Student
            </h3>
            <p style={{
              margin: 0,
              color: '#64748b',
              fontSize: '14px'
            }}>
              Create a new student profile with custom accommodations
            </p>
          </div>
        </div>

        {/* Coming Soon Features */}
        <div style={{
          marginTop: '32px',
          padding: '20px',
          background: '#fef3c7',
          border: '1px solid #f59e0b',
          borderRadius: '12px'
        }}>
          <h4 style={{
            margin: '0 0 12px',
            color: '#92400e',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            🚀 Coming Soon
          </h4>
          <ul style={{
            margin: 0,
            color: '#92400e',
            fontSize: '14px',
            paddingLeft: '20px'
          }}>
            <li>Individual schedule customization per student</li>
            <li>Progress tracking and behavior data</li>
            <li>Parent communication and reports</li>
            <li>IEP goal integration</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
