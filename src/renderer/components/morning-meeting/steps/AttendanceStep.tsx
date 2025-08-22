import React, { useState, useEffect, useCallback } from 'react';
import { MorningMeetingStepProps } from '../types/morningMeetingTypes';

// Navigation Component (reused from existing code)
const StepNavigation: React.FC<{
  navigation: any;
  customNextText?: string;
}> = ({ navigation, customNextText }) => {
  if (!navigation) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '30px',
      right: '30px',
      display: 'flex',
      gap: '15px',
      zIndex: 1000
    }}>
      {navigation.canGoBack && (
        <button
          onClick={navigation.goBack}
          style={{
            padding: '12px 24px',
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(10px)',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            color: 'white',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          ← Back
        </button>
      )}

      <button
        onClick={navigation.goNext}
        style={{
          padding: '12px 24px',
          background: navigation.isLastStep 
            ? 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)'
            : 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(10px)',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '12px',
          color: 'white',
          fontSize: '1rem',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
        onMouseOver={(e) => {
          if (navigation.isLastStep) {
            e.currentTarget.style.background = 'linear-gradient(135deg, #45a049 0%, #3d8b40 100%)';
          } else {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
          }
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseOut={(e) => {
          if (navigation.isLastStep) {
            e.currentTarget.style.background = 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)';
          } else {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
          }
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        {navigation.isLastStep ? 'Complete! ✨' : customNextText || 'Next →'}
      </button>
    </div>
  );
};

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
  students = [],
  navigation
}) => {
  // 🔧 DEBUG: Add console logging to diagnose the issue
  console.log('🚀 AttendanceStep Debug Info:');
  console.log('📊 Students prop:', students);
  console.log('📏 Students length:', students?.length || 0);
  console.log('🎯 Students type:', typeof students, Array.isArray(students));
  
  // 🔧 SAFETY CHECK: Ensure students is always an array
  const safeStudents: Student[] = React.useMemo(() => {
    if (!students) {
      console.warn('⚠️ Students prop is null/undefined, using empty array');
      return [];
    }
    if (!Array.isArray(students)) {
      console.warn('⚠️ Students prop is not an array:', typeof students);
      return [];
    }
    console.log('✅ Students processed successfully:', students.length, 'students');
    return students as Student[];
  }, [students]);

  // Initialize from stepData or defaults
  const [presentStudents, setPresentStudents] = useState<string[]>(
    stepData?.presentStudents || []
  );
  const [absentStudents, setAbsentStudents] = useState<string[]>(
    stepData?.absentStudents || []
  );
  const [showCelebration, setShowCelebration] = useState(false);

  // Calculate counts - use safeStudents instead of students
  const totalCount = safeStudents.length;
  const presentCount = presentStudents.length;
  const absentCount = absentStudents.length;
  const isComplete = presentCount + absentCount === totalCount && totalCount > 0;

  // 🔧 DEBUG: Log the counts
  console.log('📈 Calculated counts:', {
    total: totalCount,
    present: presentCount,
    absent: absentCount,
    isComplete
  });

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
      
      console.log('📤 Updating step data:', stepDataUpdate);
      onDataUpdate?.(stepDataUpdate);
    }
  }, [presentStudents, absentStudents, totalCount, presentCount, absentCount, isComplete, onDataUpdate]);

  // Update parent when attendance changes
  useEffect(() => {
    handleDataUpdate();
  }, [handleDataUpdate]);

  // Handle student status toggle
  const toggleStudentStatus = (studentId: string) => {
    const wasPresent = presentStudents.includes(studentId);
    const wasAbsent = absentStudents.includes(studentId);

    if (wasPresent) {
      // Present → Absent
      setPresentStudents(prev => prev.filter(id => id !== studentId));
      setAbsentStudents(prev => [...prev, studentId]);
    } else if (wasAbsent) {
      // Absent → Unmarked
      setAbsentStudents(prev => prev.filter(id => id !== studentId));
    } else {
      // Unmarked → Present
      setPresentStudents(prev => [...prev, studentId]);
      
      // Show celebration after a brief delay
      setTimeout(() => setShowCelebration(true), 100);
      setTimeout(() => setShowCelebration(false), 1500);
    }
  };

  // Quick action: Mark all present
  const markAllPresent = () => {
    const allStudentIds = safeStudents.map(s => s.id);
    setPresentStudents(allStudentIds);
    setAbsentStudents([]);
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 2000);
  };

  // Quick action: Reset attendance
  const resetAttendance = () => {
    setPresentStudents([]);
    setAbsentStudents([]);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '2rem',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '2rem'
      }}>
        <h1 style={{
          fontSize: '3rem',
          fontWeight: 800,
          margin: 0,
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
          background: 'linear-gradient(45deg, #FFD93D, #FF6B6B)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          📋 Let's Count Our Friends!
        </h1>
        <p style={{
          fontSize: '1.3rem',
          margin: '1rem 0 0 0',
          opacity: 0.9,
          fontWeight: 600
        }}>
          {teacherName}'s Class Attendance
        </p>
      </div>

      {/* 🔧 DEBUG INFO - Remove this after fixing */}
      <div style={{
        background: 'rgba(255, 255, 0, 0.1)',
        border: '2px solid rgba(255, 255, 0, 0.3)',
        borderRadius: '10px',
        padding: '1rem',
        marginBottom: '2rem',
        fontSize: '0.9rem'
      }}>
        <strong>🔧 Debug Info:</strong><br/>
        Students Array Length: {safeStudents.length}<br/>
        Students Data: {safeStudents.map(s => s.name).join(', ')}<br/>
        Present: {presentCount} | Absent: {absentCount} | Total: {totalCount}
      </div>

      <div style={{
        flex: 1,
        display: 'flex',
        gap: '2rem'
      }}>
        {/* Student Grid */}
        <div style={{
          flex: 2,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          alignContent: 'start'
        }}>
          {safeStudents.length === 0 ? (
            // 🔧 ENHANCED ERROR STATE
            <div style={{
              gridColumn: '1 / -1',
              background: 'rgba(255, 0, 0, 0.2)',
              border: '2px solid rgba(255, 0, 0, 0.5)',
              borderRadius: '15px',
              padding: '2rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
              <h3 style={{ margin: '0 0 1rem 0' }}>No Students Found!</h3>
              <p style={{ margin: 0, opacity: 0.9 }}>
                Check that students are properly loaded from Hub Settings.
                <br/>
                Students prop type: {typeof students}
                <br/>
                Is array: {Array.isArray(students) ? 'Yes' : 'No'}
              </p>
            </div>
          ) : (
            safeStudents.map((student) => {
              const isPresent = presentStudents.includes(student.id);
              const isAbsent = absentStudents.includes(student.id);
              
              return (
                <div
                  key={student.id}
                  onClick={() => toggleStudentStatus(student.id)}
                  style={{
                    background: isPresent 
                      ? 'rgba(76, 175, 80, 0.4)' 
                      : isAbsent 
                        ? 'rgba(244, 67, 54, 0.4)'
                        : 'rgba(255, 255, 255, 0.15)',
                    border: isPresent 
                      ? '3px solid #4CAF50' 
                      : isAbsent 
                        ? '3px solid #f44336'
                        : '3px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '20px',
                    padding: '1.5rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    backdropFilter: 'blur(10px)',
                    position: 'relative',
                    transition: 'all 0.3s ease',
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
            })
          )}
        </div>

        {/* Stats Panel */}
        <div style={{
          flex: 1,
          minWidth: '300px',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(15px)',
            borderRadius: '20px',
            padding: '2rem',
            border: '2px solid rgba(255, 255, 255, 0.2)'
          }}>
            <h3 style={{
              margin: '0 0 1.5rem 0',
              fontSize: '1.4rem',
              fontWeight: 700,
              textAlign: 'center'
            }}>
              📊 Attendance Count
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
              ? '2px solid rgba(76, 175, 80, 0.6)'
              : '2px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)'
          }}>
            {isComplete ? (
              <div>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🎉</div>
                <div style={{ fontSize: '1rem', fontWeight: 600 }}>
                  Great job counting!
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

      {/* Celebration Animation */}
      {showCelebration && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '4rem',
          animation: 'bounce 1s ease-out',
          zIndex: 9999,
          pointerEvents: 'none'
        }}>
          🎉
        </div>
      )}

      {/* Navigation Component */}
      <StepNavigation 
        navigation={navigation}
        customNextText="Time for Classroom Rules! →"
      />

      <style>{`
        @keyframes bounce {
          0%, 20%, 60%, 100% { transform: translate(-50%, -50%) translateY(0); }
          40% { transform: translate(-50%, -50%) translateY(-30px); }
          80% { transform: translate(-50%, -50%) translateY(-15px); }
        }
      `}</style>
    </div>
  );
};

export default AttendanceStep;