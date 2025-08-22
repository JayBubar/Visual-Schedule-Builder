import React, { useState, useEffect, useCallback } from 'react';
import { MorningMeetingStepProps } from '../types/morningMeetingTypes';

interface Student {
  id: string;
  name: string;
  photo?: string;
}

interface AttendanceStepData {
  presentStudents: string[];
  absentStudents: string[];
  totalCount: number;
  presentCount: number;
  absentCount: number;
  completedAt?: string;
}

const AttendanceStep: React.FC<MorningMeetingStepProps> = ({
  onNext,
  onBack,
  onDataUpdate,
  stepData,
  hubSettings,
  students = []
}) => {
  // Initialize from stepData or defaults
  const [presentStudents, setPresentStudents] = useState<string[]>(
    stepData?.presentStudents || []
  );
  const [absentStudents, setAbsentStudents] = useState<string[]>(
    stepData?.absentStudents || []
  );
  const [showCelebration, setShowCelebration] = useState(false);

  // Calculate counts
  const totalCount = students.length;
  const presentCount = presentStudents.length;
  const absentCount = absentStudents.length;
  const isComplete = presentCount + absentCount === totalCount && totalCount > 0;

  // Get teacher name from hub settings
  const teacherName = hubSettings?.welcomePersonalization?.teacherName || 'Teacher';

  // 🔧 FIX: Use useCallback to memoize the data update function
  const handleDataUpdate = useCallback(() => {
    // Only update when we have meaningful attendance data
    if (presentCount > 0 || absentCount > 0) {
      const stepDataUpdate: AttendanceStepData = {
        presentStudents,
        absentStudents,
        totalCount,
        presentCount,
        absentCount,
        completedAt: isComplete ? new Date().toISOString() : undefined
      };
      onDataUpdate(stepDataUpdate);
    }
  }, [presentStudents, absentStudents, totalCount, presentCount, absentCount, isComplete, onDataUpdate]);

  // 🔧 FIX: Only call data update when attendance state actually changes
  useEffect(() => {
    handleDataUpdate();
  }, [handleDataUpdate]);

  // Show celebration when attendance is complete
  useEffect(() => {
    if (isComplete && !showCelebration) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }
  }, [isComplete, showCelebration]);

  const toggleStudentAttendance = (studentId: string) => {
    if (presentStudents.includes(studentId)) {
      // Move from present to absent
      setPresentStudents(prev => prev.filter(id => id !== studentId));
      setAbsentStudents(prev => [...prev, studentId]);
      // Student marked absent
    } else if (absentStudents.includes(studentId)) {
      // Move from absent to present
      setAbsentStudents(prev => prev.filter(id => id !== studentId));
      setPresentStudents(prev => [...prev, studentId]);
      // Student marked present
    } else {
      // First time marking - default to present
      setPresentStudents(prev => [...prev, studentId]);
      // Student marked present
    }
  };

  const markAllPresent = () => {
    const allStudentIds = students.map(student => student.id);
    setPresentStudents(allStudentIds);
    setAbsentStudents([]);
  };

  const resetAttendance = () => {
    setPresentStudents([]);
    setAbsentStudents([]);
  };

  return (
    <div style={{
      height: '100%',
      background: 'linear-gradient(135deg, #FF6B35 0%, #FF8E9B 50%, #C8A8E9 100%)',
      display: 'flex',
      flexDirection: 'column',
      color: 'white',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Floating Sparkles */}
      <div style={{
        position: 'absolute',
        top: '15%',
        left: '8%',
        fontSize: '2rem',
        animation: 'float 4s ease-in-out infinite',
        opacity: 0.6,
        pointerEvents: 'none',
        zIndex: 1
      }}>✨</div>
      <div style={{
        position: 'absolute',
        top: '25%',
        right: '12%',
        fontSize: '2rem',
        animation: 'float 4s ease-in-out infinite 1s',
        opacity: 0.6,
        pointerEvents: 'none',
        zIndex: 1
      }}>⭐</div>
      <div style={{
        position: 'absolute',
        bottom: '20%',
        left: '15%',
        fontSize: '2rem',
        animation: 'float 4s ease-in-out infinite 2s',
        opacity: 0.6,
        pointerEvents: 'none',
        zIndex: 1
      }}>🌟</div>

      {/* Celebration Overlay */}
      {showCelebration && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <div style={{
            textAlign: 'center',
            color: 'white',
            animation: 'scaleIn 0.5s ease-out'
          }}>
            <div style={{
              fontSize: '4rem',
              marginBottom: '1rem',
              animation: 'bounce 1s ease-in-out infinite'
            }}>🎉</div>
            <h2 style={{
              fontSize: '2.5rem',
              margin: '0 0 0.5rem 0',
              fontWeight: 700
            }}>
              Everyone Ready to Learn!
            </h2>
            <p style={{
              fontSize: '1.3rem',
              margin: 0,
              opacity: 0.9,
              fontWeight: 500
            }}>
              {presentCount} amazing students present today! ✨
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{
        padding: '2rem',
        textAlign: 'center',
        background: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(15px)',
        borderBottom: '3px solid rgba(255, 255, 255, 0.3)'
      }}>
        <h1 style={{
          fontSize: 'clamp(2.5rem, 6vw, 4rem)',
          fontWeight: 800,
          textShadow: '3px 3px 6px rgba(0, 0, 0, 0.3)',
          marginBottom: '0.5rem',
          animation: 'glow 3s ease-in-out infinite'
        }}>
          🎊 Let's Count Our Friends!
        </h1>
        <div style={{
          fontSize: '1.3rem',
          color: 'rgba(255, 255, 255, 0.9)',
          fontWeight: 600
        }}>
          Who's here learning with {teacherName} today?
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '1fr 300px',
        gap: '2rem',
        padding: '2rem',
        overflow: 'hidden'
      }}>
        {/* Left Column - Student Grid */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          <h2 style={{
            fontSize: '1.8rem',
            fontWeight: 700,
            marginBottom: '1rem',
            textAlign: 'center',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)'
          }}>
            👥 Click Each Friend!
          </h2>

          {students.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: '1rem',
              overflow: 'auto',
              padding: '0.5rem'
            }}>
              {students.map((student: Student) => {
                const isPresent = presentStudents.includes(student.id);
                const isAbsent = absentStudents.includes(student.id);
                const isUnmarked = !isPresent && !isAbsent;

                return (
                  <div
                    key={student.id}
                    onClick={() => toggleStudentAttendance(student.id)}
                    style={{
                      background: isPresent 
                        ? 'rgba(76, 175, 80, 0.4)' 
                        : isAbsent 
                          ? 'rgba(244, 67, 54, 0.4)' 
                          : 'rgba(255, 255, 255, 0.15)',
                      borderRadius: '16px',
                      padding: '1.5rem 1rem',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      border: isPresent
                        ? '3px solid rgba(76, 175, 80, 0.8)'
                        : isAbsent
                          ? '3px solid rgba(244, 67, 54, 0.8)'
                          : '3px solid rgba(255, 255, 255, 0.3)',
                      textAlign: 'center',
                      position: 'relative',
                      backdropFilter: 'blur(10px)',
                      transform: isPresent ? 'scale(1.02)' : 'scale(1)'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = isPresent ? 'scale(1.05)' : 'scale(1.03)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.2)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = isPresent ? 'scale(1.02)' : 'scale(1)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {/* Status Icon */}
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      fontSize: '1.2rem'
                    }}>
                      {isPresent ? '✅' : isAbsent ? '❌' : '❓'}
                    </div>

                    {/* Student Photo */}
                    <div style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      background: student.photo 
                        ? `url(${student.photo}) center/cover`
                        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      margin: '0 auto 0.75rem auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2rem',
                      fontWeight: 700,
                      color: 'white',
                      border: '2px solid rgba(255, 255, 255, 0.4)'
                    }}>
                      {!student.photo && student.name.charAt(0).toUpperCase()}
                    </div>

                    {/* Student Name */}
                    <div style={{
                      fontSize: '1rem',
                      fontWeight: 600,
                      marginBottom: '0.25rem',
                      lineHeight: '1.2'
                    }}>
                      {student.name}
                    </div>

                    {/* Status Text */}
                    <div style={{
                      fontSize: '0.8rem',
                      opacity: 0.9,
                      fontWeight: 500
                    }}>
                      {isPresent ? 'Here! ✅' : isAbsent ? 'Absent ❌' : 'Tap me!'}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255, 255, 255, 0.15)',
              borderRadius: '20px',
              backdropFilter: 'blur(15px)',
              border: '3px solid rgba(255, 255, 255, 0.2)',
              textAlign: 'center'
            }}>
              <div>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>No Students Found</h3>
                <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>
                  Add students to your classroom to take attendance!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Math Magic & Controls */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}>
          {/* Math Magic Display */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.15)',
            borderRadius: '20px',
            padding: '2rem',
            backdropFilter: 'blur(15px)',
            border: '3px solid rgba(255, 255, 255, 0.2)',
            textAlign: 'center'
          }}>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              marginBottom: '1.5rem',
              color: '#FFD93D',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)'
            }}>
              🧮 Math Magic!
            </h3>

            {/* Live Counting Display */}
            <div style={{
              background: 'rgba(255, 215, 0, 0.2)',
              borderRadius: '15px',
              padding: '1.5rem',
              marginBottom: '1.5rem',
              border: '2px solid rgba(255, 215, 0, 0.5)'
            }}>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: 800,
                marginBottom: '0.5rem',
                color: '#FFD93D'
              }}>
                {totalCount}
              </div>
              <div style={{
                fontSize: '1rem',
                fontWeight: 600,
                opacity: 0.9
              }}>
                Total Students
              </div>
            </div>

            {/* Present Count */}
            <div style={{
              background: 'rgba(76, 175, 80, 0.3)',
              borderRadius: '12px',
              padding: '1rem',
              marginBottom: '1rem',
              border: '2px solid rgba(76, 175, 80, 0.6)'
            }}>
              <div style={{
                fontSize: '2rem',
                fontWeight: 700,
                color: '#4CAF50'
              }}>
                {presentCount} ✅
              </div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Present</div>
            </div>

            {/* Absent Count */}
            <div style={{
              background: 'rgba(244, 67, 54, 0.3)',
              borderRadius: '12px',
              padding: '1rem',
              marginBottom: '1.5rem',
              border: '2px solid rgba(244, 67, 54, 0.6)'
            }}>
              <div style={{
                fontSize: '2rem',
                fontWeight: 700,
                color: '#f44336'
              }}>
                {absentCount} ❌
              </div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Absent</div>
            </div>

            {/* Math Equation */}
            {(presentCount > 0 || absentCount > 0) && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                padding: '1rem',
                fontSize: '1.2rem',
                fontWeight: 600,
                border: '2px solid rgba(255, 255, 255, 0.3)'
              }}>
                {presentCount} + {absentCount} = {presentCount + absentCount}
              </div>
            )}
          </div>

          {/* Status Message */}
          <div style={{
            background: isComplete 
              ? 'rgba(76, 175, 80, 0.3)' 
              : 'rgba(255, 255, 255, 0.15)',
            borderRadius: '15px',
            padding: '1.5rem',
            textAlign: 'center',
            border: isComplete 
              ? '3px solid rgba(76, 175, 80, 0.6)' 
              : '3px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)'
          }}>
            {isComplete ? (
              <div>
                <div style={{
                  fontSize: '2rem',
                  marginBottom: '0.5rem',
                  animation: 'bounce 1s ease-in-out infinite'
                }}>
                  🎉
                </div>
                <div style={{
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  color: '#4CAF50'
                }}>
                  Everyone → Ready to Learn!
                </div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>👀</div>
                <div style={{ fontSize: '1rem', fontWeight: 600 }}>
                  Keep counting our friends!
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            <button
              onClick={markAllPresent}
              style={{
                background: 'rgba(76, 175, 80, 0.8)',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                padding: '0.75rem',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              ✅ All Present
            </button>
            <button
              onClick={resetAttendance}
              style={{
                background: 'rgba(156, 163, 175, 0.8)',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                padding: '0.75rem',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              🔄 Reset
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '2rem',
        zIndex: 1000,
        background: 'rgba(0, 0, 0, 0.2)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '1rem 2rem',
        minWidth: '300px'
      }}>
        <button
          onClick={onBack}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '16px',
            color: 'white',
            padding: '1rem 2rem',
            fontSize: '1.1rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(10px)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          ← Back
        </button>
        
        <button
          onClick={onNext}
          style={{
            background: isComplete 
              ? 'rgba(76, 175, 80, 0.8)' 
              : 'rgba(255, 255, 255, 0.2)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '16px',
            color: 'white',
            padding: '1rem 2rem',
            fontSize: '1.1rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(10px)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = isComplete
              ? 'rgba(76, 175, 80, 0.9)'
              : 'rgba(255, 255, 255, 0.3)';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = isComplete
              ? 'rgba(76, 175, 80, 0.8)'
              : 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          {isComplete ? 'Ready to Learn! →' : 'Continue →'}
        </button>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
          50% { transform: translateY(-20px) rotate(180deg) scale(1.1); }
        }
        
        @keyframes glow {
          0%, 100% { text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.3); }
          50% { text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.3), 0 0 20px rgba(255, 255, 255, 0.3); }
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        
        /* Responsive Design */
        @media (max-width: 1024px) {
          .main-content {
            grid-template-columns: 1fr !important;
            grid-template-rows: 1fr auto !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AttendanceStep;
