import React, { useState, useEffect, useCallback } from 'react';
import { MorningMeetingStepProps } from '../types/morningMeetingTypes';
import UnifiedDataService from '../../../services/unifiedDataService';
import StepNavigation from '../common/StepNavigation';

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
  onStepComplete
}) => {
  // 🔧 FIX: Load students from UnifiedDataService instead of relying on props
  const [loadedStudents, setLoadedStudents] = useState<Student[]>([]);
  
  useEffect(() => {
    const loadStudentsFromService = () => {
      try {
        console.log('🚀 AttendanceStep - Loading students from UnifiedDataService...');
        const unifiedStudents = UnifiedDataService.getAllStudents();
        console.log('📊 Loaded students from UnifiedDataService:', unifiedStudents.length);
        console.log('👥 Student names:', unifiedStudents.map(s => s.name).join(', '));
        
        // Convert UnifiedStudent to the Student format expected by AttendanceStep
        const convertedStudents: Student[] = unifiedStudents.map(student => ({
          id: student.id,
          name: student.name,
          photo: student.photo,
          grade: student.grade || ''
        }));
        
        setLoadedStudents(convertedStudents);
        console.log('✅ Students successfully loaded and converted:', convertedStudents.length);
      } catch (error) {
        console.error('❌ Error loading students from UnifiedDataService:', error);
        // Fallback to props if UnifiedDataService fails
        if (students && students.length > 0) {
          console.log('🔄 Fallback: Using students from props:', students.length);
          setLoadedStudents(students as Student[]);
        } else {
          console.warn('⚠️ No students available from either source');
          setLoadedStudents([]);
        }
      }
    };
    
    loadStudentsFromService();
    
    // Listen for student data updates
    const handleStudentUpdate = () => {
      loadStudentsFromService();
    };
    
    window.addEventListener('studentDataUpdated', handleStudentUpdate);
    return () => {
      window.removeEventListener('studentDataUpdated', handleStudentUpdate);
    };
  }, [students]);
  
  // Use loadedStudents instead of props
  const safeStudents = loadedStudents;

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

  // Call onStepComplete when attendance is complete
  useEffect(() => {
    if (isComplete) {
      // Add a small delay to allow for celebration animation
      const timer = setTimeout(() => {
        onStepComplete?.();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isComplete, onStepComplete]);

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

  // Create navigation object for StepNavigation component
  const navigation = {
    goNext: onNext,
    goBack: onBack,
    canGoBack: !!onBack,
    isLastStep: false
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

      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
      }}>
        {/* Horizontal Attendance Counter */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(15px)',
          borderRadius: '20px',
          padding: '1.5rem',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          gap: '2rem'
        }}>
          {/* Total Count */}
          <div style={{
            background: 'rgba(255, 215, 0, 0.2)',
            borderRadius: '15px',
            padding: '1rem 1.5rem',
            border: '2px solid rgba(255, 215, 0, 0.5)',
            textAlign: 'center',
            minWidth: '140px'
          }}>
            <div style={{
              fontSize: '2.5rem',
              fontWeight: 800,
              marginBottom: '0.25rem',
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
            borderRadius: '15px',
            padding: '1rem 1.5rem',
            border: '2px solid rgba(76, 175, 80, 0.6)',
            textAlign: 'center',
            minWidth: '140px'
          }}>
            <div style={{
              fontSize: '2rem',
              fontWeight: 700,
              color: '#4CAF50',
              marginBottom: '0.25rem'
            }}>
              {presentCount} ✅
            </div>
            <div style={{ fontSize: '1rem', opacity: 0.9, fontWeight: 600 }}>Present</div>
          </div>

          {/* Math Equation */}
          {(presentCount > 0 || absentCount > 0) && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '15px',
              padding: '1rem 1.5rem',
              fontSize: '1.4rem',
              fontWeight: 600,
              border: '2px solid rgba(255, 255, 255, 0.3)',
              textAlign: 'center',
              minWidth: '160px'
            }}>
              {presentCount} + {absentCount} = {presentCount + absentCount}
            </div>
          )}

          {/* Absent Count */}
          <div style={{
            background: 'rgba(244, 67, 54, 0.3)',
            borderRadius: '15px',
            padding: '1rem 1.5rem',
            border: '2px solid rgba(244, 67, 54, 0.6)',
            textAlign: 'center',
            minWidth: '140px'
          }}>
            <div style={{
              fontSize: '2rem',
              fontWeight: 700,
              color: '#f44336',
              marginBottom: '0.25rem'
            }}>
              {absentCount} ❌
            </div>
            <div style={{ fontSize: '1rem', opacity: 0.9, fontWeight: 600 }}>Absent</div>
          </div>
        </div>

        {/* Status Message & Quick Actions Row */}
        <div style={{
          display: 'flex',
          gap: '1.5rem',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {/* Status Message */}
          <div style={{
            background: isComplete 
              ? 'rgba(76, 175, 80, 0.3)' 
              : 'rgba(255, 255, 255, 0.15)',
            borderRadius: '15px',
            padding: '1rem 2rem',
            border: isComplete 
              ? '2px solid rgba(76, 175, 80, 0.6)'
              : '2px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
              {isComplete ? '🎉' : '👀'}
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 600 }}>
              {isComplete ? 'Great job counting!' : 'Keep counting our friends!'}
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{
            display: 'flex',
            gap: '1rem'
          }}>
            <button
              onClick={markAllPresent}
              style={{
                background: 'rgba(76, 175, 80, 0.8)',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                padding: '0.75rem 1.5rem',
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
                padding: '0.75rem 1.5rem',
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

        {/* Student Grid - 2 Rows, Up to 5 Across */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '1rem',
          maxWidth: '1200px',
          margin: '0 auto',
          alignItems: 'end'
        }}>
          {safeStudents.length === 0 ? (
            // 🔧 CLEAN ERROR STATE
            <div style={{
              gridColumn: '1 / -1',
              background: 'rgba(255, 152, 0, 0.2)',
              border: '2px solid rgba(255, 152, 0, 0.5)',
              borderRadius: '15px',
              padding: '2rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
              <h3 style={{ margin: '0 0 1rem 0' }}>No Students Found</h3>
              <p style={{ margin: 0, opacity: 0.9 }}>
                Add students in the Student Management section first,<br/>
                then return to run Morning Meeting.
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
                    borderRadius: '18px',
                    padding: '1.25rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    backdropFilter: 'blur(10px)',
                    position: 'relative',
                    transition: 'all 0.3s ease',
                    transform: isPresent ? 'scale(1.02)' : 'scale(1)',
                    minHeight: '140px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
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
                    width: '45px',
                    height: '45px',
                    borderRadius: '50%',
                    background: student.photo 
                      ? `url(${student.photo}) center/cover`
                      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    margin: '0 auto 0.5rem auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    color: 'white',
                    border: '2px solid rgba(255, 255, 255, 0.4)'
                  }}>
                    {!student.photo && student.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Student Name */}
                  <div style={{
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    marginBottom: '0.25rem',
                    lineHeight: '1.2'
                  }}>
                    {student.name}
                  </div>

                  {/* Status Text */}
                  <div style={{
                    fontSize: '0.75rem',
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

      {/* Step Navigation */}
      <StepNavigation navigation={navigation} />

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
