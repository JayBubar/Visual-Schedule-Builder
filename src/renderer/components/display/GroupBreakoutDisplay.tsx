import React from 'react';
import { Activity, StaffMember, Student } from '../../types';

interface GroupBreakoutDisplayProps {
  currentActivity: Activity;
  staff: StaffMember[];
  students: Student[];
}

const GroupBreakoutDisplay: React.FC<GroupBreakoutDisplayProps> = ({
  currentActivity,
  staff = [],
  students = []
}) => {
  // Create getStudentById function from provided students prop
  const getStudentById = (id: string) => students.find(s => s.id === id);
  
  // Photo rendering function for students in groups
  const renderStudentInGroup = (studentId: string) => {
    const student = getStudentById(studentId);
    if (!student) return null;
    
    return (
      <div style={{ width: '60px', height: '60px', borderRadius: '50%', overflow: 'hidden', border: '3px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
        {student.photo ? (
          <img src={student.photo} alt={student.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ background: '#667eea', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '1.2rem', fontWeight: '700' }}>
            {student.name.split(' ').map(n => n[0]).join('')}
          </div>
        )}
      </div>
    );
  };
  
  // Enhanced color mapping for group identification
  const colorMap = {
    red: '#e74c3c',
    blue: '#3498db',
    green: '#27ae60',
    yellow: '#f39c12',
    purple: '#9b59b6',
    orange: '#e67e22',
    pink: '#e91e63',
    teal: '#1abc9c',
    indigo: '#6610f2',
    cyan: '#17a2b8'
  };

  // Automatic grid sizing for 1-6 groups (optimized layout)
  const getOptimalGridLayout = (groupCount: number) => {
    if (groupCount === 1) return { 
      cols: 1, 
      rows: 1, 
      gridTemplate: '1fr',
      aspectRatio: 'auto'
    };
    if (groupCount === 2) return { 
      cols: 2, 
      rows: 1, 
      gridTemplate: '1fr 1fr',
      aspectRatio: '1.5/1'
    };
    if (groupCount === 3) return { 
      cols: 3, 
      rows: 1, 
      gridTemplate: '1fr 1fr 1fr',
      aspectRatio: '2/1'
    };
    if (groupCount === 4) return { 
      cols: 2, 
      rows: 2, 
      gridTemplate: '1fr 1fr',
      aspectRatio: '1/1'
    };
    if (groupCount === 5) return { 
      cols: 3, 
      rows: 2, 
      gridTemplate: '1fr 1fr 1fr',
      aspectRatio: '1.5/1'
    };
    if (groupCount === 6) return { 
      cols: 3, 
      rows: 2, 
      gridTemplate: '1fr 1fr 1fr',
      aspectRatio: '1.5/1'
    };
    // For more than 6 groups
    return { 
      cols: 3, 
      rows: Math.ceil(groupCount / 3),
      gridTemplate: 'repeat(3, 1fr)',
      aspectRatio: 'auto'
    };
  };

  // Handle whole class activities
  if (!currentActivity?.groupAssignments || currentActivity.groupAssignments.length === 0) {
    return (
      <div style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(2rem, 5vw, 4rem)'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(10px)',
          borderRadius: '24px',
          padding: 'clamp(3rem, 8vw, 5rem)',
          textAlign: 'center',
          maxWidth: '600px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <div style={{
            fontSize: 'clamp(4rem, 12vw, 8rem)',
            marginBottom: '1.5rem',
            filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))'
          }}>
            👥
          </div>
          <h2 style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: '700',
            margin: '0 0 1rem 0',
            background: 'linear-gradient(45deg, #fff, #f0f0f0)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
          }}>
            Whole Class Activity
          </h2>
          <p style={{
            fontSize: 'clamp(1.2rem, 3vw, 2rem)',
            opacity: 0.9,
            margin: '0',
            fontWeight: '500'
          }}>
            All students participate together
          </p>
        </div>
      </div>
    );
  }

  const groups = currentActivity.groupAssignments;
  const layout = getOptimalGridLayout(groups.length);

  return (
    <div style={{
      height: '100%',
      padding: 'clamp(1rem, 3vw, 2rem)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Optimized Group Bubble Layout - No Scrolling */}
      <div 
        className="group-breakout-grid"
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: layout.gridTemplate,
          gridTemplateRows: `repeat(${layout.rows}, 1fr)`,
          gap: 'clamp(1rem, 3vw, 2rem)',
          alignItems: 'stretch',
          justifyItems: 'stretch',
          minHeight: 0,
          maxHeight: '100%'
        }}
      >
        {groups.map((group, index) => {
          const groupColor = colorMap[group.color] || colorMap.blue;
          
          // Staff and student photo integration
          const staffMember = staff.find(s => s.id === group.staffMember?.id) || group.staffMember;
          const groupStudents = group.studentIds.map(id => 
            students.find(s => s.id === id) || { 
              id, 
              name: `Student ${id}`, 
              photo: undefined,
              avatar: '😊'
            }
          );

          return (
            <div
              key={group.id}
              className="group-bubble"
              style={{
                background: `linear-gradient(135deg, ${groupColor}20 0%, ${groupColor}35 100%)`,
                border: `4px solid ${groupColor}`,
                borderRadius: '24px',
                padding: 'clamp(1rem, 3vw, 2rem)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
                textAlign: 'center',
                boxShadow: `0 12px 40px ${groupColor}30`,
                backdropFilter: 'blur(15px)',
                position: 'relative',
                overflow: 'hidden',
                minHeight: 'clamp(250px, 30vh, 400px)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                aspectRatio: layout.aspectRatio
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.02) translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 16px 50px ${groupColor}40`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1) translateY(0)';
                e.currentTarget.style.boxShadow = `0 12px 40px ${groupColor}30`;
              }}
            >
              {/* Color-coded group identification bar */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '8px',
                background: `linear-gradient(90deg, ${groupColor} 0%, ${groupColor}CC 100%)`,
                borderTopLeftRadius: '20px',
                borderTopRightRadius: '20px'
              }} />

              {/* Group Header */}
              <div style={{
                width: '100%',
                marginBottom: 'clamp(1rem, 2vh, 1.5rem)',
                paddingTop: '0.5rem'
              }}>
                <h3 style={{
                  fontSize: 'clamp(1.1rem, 2.5vw, 1.8rem)',
                  fontWeight: '800',
                  margin: '0 0 0.75rem 0',
                  color: 'white',
                  textShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
                  letterSpacing: '0.5px'
                }}>
                  {group.groupName}
                </h3>
                
                {/* Location and notes display */}
                {group.location && (
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'rgba(255, 255, 255, 0.25)',
                    color: 'white',
                    padding: 'clamp(0.3rem, 1vw, 0.5rem) clamp(0.6rem, 2vw, 1rem)',
                    borderRadius: '16px',
                    fontSize: 'clamp(0.8rem, 1.5vw, 1rem)',
                    fontWeight: '600',
                    backdropFilter: 'blur(5px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)'
                  }}>
                    📍 {group.location}
                  </div>
                )}
              </div>

              {/* Staff Photo Integration */}
              {staffMember && (
                <div style={{
                  width: '100%',
                  marginBottom: 'clamp(1rem, 2vh, 1.5rem)'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 'clamp(0.75rem, 2vw, 1.25rem)',
                    background: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '18px',
                    padding: 'clamp(0.75rem, 2vw, 1.25rem)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)'
                  }}>
                    {/* Staff Photo */}
                    <div style={{
                      width: 'clamp(50px, 8vw, 70px)',
                      height: 'clamp(50px, 8vw, 70px)',
                      borderRadius: '50%',
                      background: staffMember.photo 
                        ? `url(${staffMember.photo}) center/cover`
                        : `linear-gradient(135deg, ${groupColor} 0%, ${groupColor}CC 100%)`,
                      border: '3px solid white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
                      flexShrink: 0,
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                    }}>
                      {!staffMember.photo && (staffMember.avatar || '👨‍🏫')}
                    </div>
                    
                    {/* Staff Info */}
                    <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                      <div style={{
                        fontSize: 'clamp(0.9rem, 2vw, 1.3rem)',
                        fontWeight: '700',
                        color: 'white',
                        marginBottom: '0.2rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'
                      }}>
                        {staffMember.name}
                      </div>
                      <div style={{
                        fontSize: 'clamp(0.7rem, 1.5vw, 1rem)',
                        color: 'rgba(255, 255, 255, 0.9)',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        {staffMember.role}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Student Photo Integration - Enhanced Grid */}
              <div style={{
                width: '100%',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <div style={{
                  fontSize: 'clamp(0.9rem, 1.8vw, 1.1rem)',
                  fontWeight: '700',
                  color: 'white',
                  marginBottom: 'clamp(0.75rem, 1.5vh, 1rem)',
                  textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  👥 Students
                  <span style={{
                    background: 'rgba(255, 255, 255, 0.3)',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '12px',
                    fontSize: '0.8em',
                    fontWeight: '800'
                  }}>
                    {groupStudents.length}
                  </span>
                </div>
                
                {/* Optimized Student Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: groupStudents.length <= 4 
                    ? `repeat(${Math.min(groupStudents.length, 2)}, 1fr)`
                    : groupStudents.length <= 9
                    ? 'repeat(3, 1fr)'
                    : 'repeat(4, 1fr)',
                  gap: 'clamp(0.5rem, 1.5vw, 1rem)',
                  justifyItems: 'center',
                  alignItems: 'center',
                  width: '100%',
                  maxWidth: '300px'
                }}>
                  {groupStudents.slice(0, 12).map((student, idx) => (
                    <div
                      key={student.id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 'clamp(0.3rem, 0.8vw, 0.5rem)',
                        transition: 'transform 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      {/* Student Photo with enhanced styling */}
                      <div style={{
                        width: 'clamp(35px, 5vw, 50px)',
                        height: 'clamp(35px, 5vw, 50px)',
                        borderRadius: '50%',
                        border: '3px solid white',
                        boxShadow: '0 3px 10px rgba(0, 0, 0, 0.2)',
                        position: 'relative',
                        overflow: 'hidden'
                      }}>
                        {student.photo ? (
                          <img 
                            src={student.photo} 
                            alt={student.name} 
                            style={{ 
                              width: '100%', 
                              height: '100%', 
                              objectFit: 'cover' 
                            }} 
                          />
                        ) : (
                          <div style={{
                            background: `linear-gradient(135deg, ${groupColor}60 0%, ${groupColor}90 100%)`,
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 'clamp(1rem, 2vw, 1.4rem)',
                            color: 'white',
                            fontWeight: '700'
                          }}>
                            {student.name.split(' ').map(n => n[0]).join('')}
                          </div>
                        )}
                        
                        {/* Subtle shine effect */}
                        <div style={{
                          position: 'absolute',
                          top: '10%',
                          left: '10%',
                          width: '30%',
                          height: '30%',
                          background: 'rgba(255, 255, 255, 0.4)',
                          borderRadius: '50%',
                          filter: 'blur(2px)'
                        }} />
                      </div>
                      
                      {/* Student Name */}
                      <div style={{
                        fontSize: 'clamp(0.65rem, 1.3vw, 0.85rem)',
                        fontWeight: '700',
                        color: 'white',
                        textAlign: 'center',
                        lineHeight: '1.1',
                        textShadow: '0 1px 3px rgba(0, 0, 0, 0.4)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: 'clamp(50px, 8vw, 70px)'
                      }}>
                        {student.name}
                      </div>
                    </div>
                  ))}
                  
                  {/* Overflow indicator for large groups */}
                  {groupStudents.length > 12 && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 'clamp(35px, 5vw, 50px)',
                      height: 'clamp(35px, 5vw, 50px)',
                      borderRadius: '50%',
                      background: 'rgba(255, 255, 255, 0.4)',
                      color: 'white',
                      fontSize: 'clamp(0.7rem, 1.5vw, 0.9rem)',
                      fontWeight: '800',
                      border: '3px solid white',
                      backdropFilter: 'blur(5px)'
                    }}>
                      +{groupStudents.length - 12}
                    </div>
                  )}
                </div>
              </div>

              {/* Notes Display */}
              {group.notes && (
                <div style={{
                  width: '100%',
                  marginTop: 'clamp(0.75rem, 1.5vh, 1rem)',
                  background: 'rgba(255, 255, 255, 0.15)',
                  borderRadius: '12px',
                  padding: 'clamp(0.6rem, 1.5vw, 1rem)',
                  fontSize: 'clamp(0.7rem, 1.3vw, 0.9rem)',
                  color: 'rgba(255, 255, 255, 0.95)',
                  fontStyle: 'italic',
                  fontWeight: '500',
                  textAlign: 'center',
                  backdropFilter: 'blur(5px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                  💡 {group.notes}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Enhanced Responsive Styles */}
      <style>{`
        .group-breakout-grid {
          container-type: inline-size;
        }
        
        @media (max-width: 768px) {
          .group-breakout-grid {
            grid-template-columns: 1fr !important;
            grid-template-rows: auto !important;
            gap: 1rem !important;
          }
          
          .group-bubble {
            min-height: 300px !important;
            aspect-ratio: auto !important;
          }
        }
        
        @media (max-height: 600px) and (orientation: landscape) {
          .group-breakout-grid {
            gap: 0.75rem !important;
          }
          
          .group-bubble {
            min-height: 200px !important;
            padding: 1rem !important;
          }
        }
        
        @media (min-width: 1400px) {
          .group-breakout-grid {
            gap: 3rem !important;
          }
        }
        
        @container (max-width: 300px) {
          .group-bubble {
            padding: 1rem !important;
            min-height: 250px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default GroupBreakoutDisplay;