import React, { useState, useEffect, useCallback } from 'react';
import { MorningMeetingStepProps } from '../types/morningMeetingTypes';
import { Student } from '../../../types';
import UnifiedDataService from '../../../services/unifiedDataService';

interface AttendanceState {
  presentStudents: Student[];
  absentStudents: Student[];
  manuallyMarkedAbsent: Set<string>;
}

const AttendanceStep: React.FC<MorningMeetingStepProps> = ({
  currentDate,
  onNext,
  onBack,
  onDataUpdate,
  stepData,
  hubSettings,
  students = []
}) => {
  const [attendanceState, setAttendanceState] = useState<AttendanceState>({
    presentStudents: [],
    absentStudents: [],
    manuallyMarkedAbsent: new Set()
  });

  // Get teacher name for dynamic title
  const getTeacherName = (): string => {
    return hubSettings?.welcomePersonalization?.teacherName || '';
  };

  const teacherName = getTeacherName();

  // Create dynamic title
  const getTitle = (): string => {
    if (teacherName) {
      return `Who's in ${teacherName}'s Class Today? 🏫`;
    }
    return "Who's at School Today? 🏫";
  };

  // Load existing attendance data on initial load
  useEffect(() => {
    if (students.length > 0 && stepData) {
      // Load from stepData if available (session state)
      setAttendanceState({
        presentStudents: stepData.presentStudents || [],
        absentStudents: stepData.absentStudents || [],
        manuallyMarkedAbsent: new Set(stepData.manuallyMarkedAbsent || [])
      });
    }
  }, [students, stepData]);

  // Calculate remaining students (not yet marked present or absent)
  const remainingStudents = students.filter(student => 
    !attendanceState.presentStudents.find(s => s.id === student.id) &&
    !attendanceState.absentStudents.find(s => s.id === student.id)
  );

  // Update data whenever attendance changes
  useEffect(() => {
    const stepData = {
      presentStudents: attendanceState.presentStudents,
      absentStudents: attendanceState.absentStudents,
      totalStudents: students.length,
      completedAt: new Date()
    };
    onDataUpdate(stepData);
  }, [attendanceState, students.length, onDataUpdate]);

  const markStudentPresent = useCallback((student: Student) => {
    const dateString = currentDate.toISOString().split('T')[0];
    UnifiedDataService.updateStudentAttendance(student.id, dateString, true);
    
    // Update state - remove from remaining and add to present
    setAttendanceState(prev => ({
      ...prev,
      presentStudents: [...prev.presentStudents.filter(s => s.id !== student.id), student],
      absentStudents: prev.absentStudents.filter(s => s.id !== student.id)
    }));
  }, [currentDate]);

  const markStudentAbsent = useCallback((student: Student) => {
    const dateString = currentDate.toISOString().split('T')[0];
    UnifiedDataService.updateStudentAttendance(student.id, dateString, false);
    
    // Update state - remove from present and add to absent, mark as manually absent
    setAttendanceState(prev => ({
      presentStudents: prev.presentStudents.filter(s => s.id !== student.id),
      absentStudents: [...prev.absentStudents.filter(s => s.id !== student.id), student],
      manuallyMarkedAbsent: new Set([...prev.manuallyMarkedAbsent, student.id])
    }));
  }, [currentDate]);

  const handleNext = () => {
    if (remainingStudents.length > 0) {
      // Mark all remaining as absent automatically
      const dateString = currentDate.toISOString().split('T')[0];
      
      remainingStudents.forEach(student => {
        UnifiedDataService.updateStudentAttendance(student.id, dateString, false);
      });
      
      setAttendanceState(prev => ({
        ...prev,
        absentStudents: [...prev.absentStudents, ...remainingStudents]
      }));
      
      // Small delay to show the change before moving on
      setTimeout(onNext, 500);
    } else {
      onNext();
    }
  };

  const getStudentStatus = (student: Student) => {
    if (attendanceState.presentStudents.find(s => s.id === student.id)) {
      return 'present';
    }
    if (attendanceState.absentStudents.find(s => s.id === student.id)) {
      return attendanceState.manuallyMarkedAbsent.has(student.id) ? 'manually-absent' : 'auto-absent';
    }
    return 'unmarked';
  };

  const renderStudentCard = (student: Student, status: string) => {
    const isUnmarked = status === 'unmarked';
    const isPresent = status === 'present';

    return (
      <div
        key={student.id}
        style={{
          background: isPresent 
            ? 'linear-gradient(135deg, #22c55e, #16a34a)'
            : 'rgba(255, 255, 255, 0.9)',
          borderRadius: '25px',
          padding: '1.2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem',
          transition: 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
          cursor: isUnmarked ? 'pointer' : 'default',
          border: '3px solid rgba(255, 255, 255, 0.5)',
          boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
          width: '140px',
          height: '160px',
          position: 'relative',
          overflow: 'hidden',
          color: isPresent ? 'white' : '#374151'
        }}
        onClick={() => {
          if (isUnmarked) {
            markStudentPresent(student);
          }
        }}
        onMouseEnter={(e) => {
          if (isUnmarked) {
            e.currentTarget.style.transform = 'translateY(-10px) scale(1.05)';
            e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.2)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.8)';
          }
        }}
        onMouseLeave={(e) => {
          if (isUnmarked) {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
          }
        }}
      >
        {/* Student Avatar */}
        <div style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: student.photo 
            ? `url(${student.photo})` 
            : 'linear-gradient(135deg, #fbbf24, #f59e0b)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.8rem',
          border: '3px solid rgba(255, 255, 255, 0.8)',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease',
          transform: isPresent ? 'scale(1.1)' : 'scale(1)'
        }}>
          {!student.photo && (student.name?.[0] || '👤')}
        </div>

        {/* Student Name */}
        <div style={{
          fontWeight: '700',
          fontSize: '0.9rem',
          textAlign: 'center',
          lineHeight: 1.2,
          textShadow: isPresent ? '0 2px 4px rgba(0,0,0,0.3)' : 'none'
        }}>
          {student.name || 'Student'}
        </div>

        {/* Celebration effect for present students */}
        {isPresent && (
          <div style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            fontSize: '1.2rem',
            animation: 'celebrationSpin 2s linear infinite'
          }}>
            ✨
          </div>
        )}
      </div>
    );
  };

  // CSS for animations
  const animationStyles = `
    @keyframes attendanceGradient {
      0%, 100% { filter: hue-rotate(0deg) brightness(1.1); }
      25% { filter: hue-rotate(15deg) brightness(1.2); }
      50% { filter: hue-rotate(-10deg) brightness(1.15); }
      75% { filter: hue-rotate(10deg) brightness(1.1); }
    }
    
    @keyframes headerBounce {
      0% { transform: translateY(-50px); opacity: 0; }
      60% { transform: translateY(10px); opacity: 0.9; }
      100% { transform: translateY(0); opacity: 1; }
    }
    
    @keyframes titleGlow {
      0% { text-shadow: 0 0 20px rgba(255,255,255,0.6), 0 8px 16px rgba(0,0,0,0.3); }
      100% { text-shadow: 0 0 30px rgba(255,255,255,0.9), 0 8px 16px rgba(0,0,0,0.3); }
    }
    
    @keyframes countPulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
    
    @keyframes celebrationSpin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    @keyframes sparkleFloat {
      0%, 100% { 
        transform: translateY(0) rotate(0deg);
        opacity: 0;
      }
      10%, 90% {
        opacity: 1;
      }
      50% { 
        transform: translateY(-40px) rotate(180deg);
        opacity: 0.8;
      }
    }
  `;

  return (
    <>
      {/* Inject CSS animations */}
      <style>{animationStyles}</style>
      
      <div style={{
        height: '100%',
        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 25%, #43e97b 50%, #38f9d7 75%, #ffecd2 100%)',
        animation: 'attendanceGradient 20s ease-in-out infinite',
        display: 'flex',
        flexDirection: 'column',
        padding: '2rem',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Floating sparkles */}
        <div style={{
          position: 'absolute',
          top: '15%',
          left: '5%',
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: '1.2rem',
          animation: 'sparkleFloat 8s ease-in-out infinite',
          pointerEvents: 'none',
          animationDelay: '0s'
        }}>✨</div>
        <div style={{
          position: 'absolute',
          top: '25%',
          right: '8%',
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: '1.2rem',
          animation: 'sparkleFloat 8s ease-in-out infinite',
          pointerEvents: 'none',
          animationDelay: '1.5s'
        }}>🌟</div>
        <div style={{
          position: 'absolute',
          top: '45%',
          left: '12%',
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: '1.2rem',
          animation: 'sparkleFloat 8s ease-in-out infinite',
          pointerEvents: 'none',
          animationDelay: '3s'
        }}>⭐</div>
        <div style={{
          position: 'absolute',
          top: '65%',
          right: '15%',
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: '1.2rem',
          animation: 'sparkleFloat 8s ease-in-out infinite',
          pointerEvents: 'none',
          animationDelay: '4.5s'
        }}>💫</div>
        <div style={{
          position: 'absolute',
          top: '35%',
          right: '25%',
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: '1.2rem',
          animation: 'sparkleFloat 8s ease-in-out infinite',
          pointerEvents: 'none',
          animationDelay: '6s'
        }}>🎉</div>
        <div style={{
          position: 'absolute',
          top: '75%',
          left: '20%',
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: '1.2rem',
          animation: 'sparkleFloat 8s ease-in-out infinite',
          pointerEvents: 'none',
          animationDelay: '7.5s'
        }}>🌈</div>

        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '2rem',
          animation: 'headerBounce 2s ease-out'
        }}>
          <h1 style={{
            fontFamily: "'Comic Sans MS', 'Trebuchet MS', cursive",
            fontSize: 'clamp(2.5rem, 8vw, 4.5rem)',
            color: 'white',
            textShadow: '0 0 20px rgba(255,255,255,0.6), 0 8px 16px rgba(0,0,0,0.3)',
            marginBottom: '1rem',
            animation: 'titleGlow 3s ease-in-out infinite alternate'
          }}>
            {getTitle()}
          </h1>
          <p style={{
            fontSize: 'clamp(1.2rem, 3vw, 1.8rem)',
            color: 'rgba(255,255,255,0.9)',
            fontWeight: '600',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            Tap your friends when you see them! 👋
          </p>
        </div>

        {/* Main attendance area */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '3rem',
          flex: 1,
          maxWidth: '1400px',
          margin: '0 auto',
          width: '100%',
          overflow: 'hidden'
        }}>
          
          {/* LEFT COLUMN: Remaining Students */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.15)',
            borderRadius: '30px',
            padding: '2.5rem',
            backdropFilter: 'blur(15px)',
            border: '3px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column',
            minHeight: '500px'
          }}>
            <div style={{
              textAlign: 'center',
              marginBottom: '2rem',
              position: 'sticky',
              top: 0,
              zIndex: 5
            }}>
              <h2 style={{
                fontFamily: "'Comic Sans MS', 'Trebuchet MS', cursive",
                fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
                color: 'white',
                textShadow: '0 4px 8px rgba(0,0,0,0.3)',
                marginBottom: '1rem'
              }}>
                Everyone 👨‍👩‍👧‍👦
              </h2>
              <div style={{
                background: 'rgba(255, 255, 255, 0.25)',
                borderRadius: '25px',
                padding: '1.5rem 2rem',
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(255, 255, 255, 0.4)',
                animation: 'countPulse 2s ease-in-out infinite'
              }}>
                <div style={{
                  fontFamily: "'Comic Sans MS', 'Trebuchet MS', cursive",
                  fontSize: 'clamp(2rem, 5vw, 3rem)',
                  color: 'white',
                  textShadow: '0 4px 8px rgba(0,0,0,0.3)',
                  lineHeight: 1
                }}>
                  {remainingStudents.length}
                </div>
                <div style={{
                  fontSize: 'clamp(1rem, 2vw, 1.3rem)',
                  color: 'rgba(255,255,255,0.9)',
                  fontWeight: '700',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  marginTop: '0.5rem'
                }}>
                  Still Coming
                </div>
              </div>
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 140px))',
              gap: '1rem',
              justifyContent: 'center',
              flex: 1,
              overflowY: 'auto',
              padding: '1rem 0'
            }}>
              {remainingStudents.map(student => 
                renderStudentCard(student, getStudentStatus(student))
              )}
            </div>
          </div>
          
          {/* RIGHT COLUMN: Present Students */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.15)',
            borderRadius: '30px',
            padding: '2.5rem',
            backdropFilter: 'blur(15px)',
            border: '3px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column',
            minHeight: '500px'
          }}>
            <div style={{
              textAlign: 'center',
              marginBottom: '2rem',
              position: 'sticky',
              top: 0,
              zIndex: 5
            }}>
              <h2 style={{
                fontFamily: "'Comic Sans MS', 'Trebuchet MS', cursive",
                fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
                color: 'white',
                textShadow: '0 4px 8px rgba(0,0,0,0.3)',
                marginBottom: '1rem'
              }}>
                Ready to Learn!
              </h2>
              <div style={{
                background: 'rgba(255, 255, 255, 0.25)',
                borderRadius: '25px',
                padding: '1.5rem 2rem',
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(255, 255, 255, 0.4)',
                animation: 'countPulse 2s ease-in-out infinite'
              }}>
                <div style={{
                  fontFamily: "'Comic Sans MS', 'Trebuchet MS', cursive",
                  fontSize: 'clamp(2rem, 5vw, 3rem)',
                  color: 'white',
                  textShadow: '0 4px 8px rgba(0,0,0,0.3)',
                  lineHeight: 1
                }}>
                  {attendanceState.presentStudents.length}
                </div>
                <div style={{
                  fontSize: 'clamp(1rem, 2vw, 1.3rem)',
                  color: 'rgba(255,255,255,0.9)',
                  fontWeight: '700',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  marginTop: '0.5rem'
                }}>
                  Here & Ready
                </div>
              </div>
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 140px))',
              gap: '1rem',
              justifyContent: 'center',
              flex: 1,
              overflowY: 'auto',
              padding: '1rem 0'
            }}>
              {attendanceState.presentStudents.map(student => 
                renderStudentCard(student, getStudentStatus(student))
              )}
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
          gap: '1rem',
          zIndex: 1000,
          background: 'rgba(0, 0, 0, 0.6)',
          borderRadius: '25px',
          padding: '1.2rem 2.5rem',
          backdropFilter: 'blur(10px)',
          border: '2px solid rgba(255, 255, 255, 0.2)'
        }}>
          <button
            onClick={onBack}
            style={{
              background: 'rgba(156, 163, 175, 0.8)',
              border: 'none',
              borderRadius: '15px',
              color: 'white',
              padding: '1rem 2rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              minHeight: '60px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.background = 'rgba(156, 163, 175, 1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.background = 'rgba(156, 163, 175, 0.8)';
            }}
          >
            ← Back
          </button>
          
          <button
            onClick={handleNext}
            style={{
              background: 'rgba(34, 197, 94, 0.9)',
              border: 'none',
              borderRadius: '15px',
              color: 'white',
              padding: '1rem 2rem',
              fontSize: '1rem',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              minHeight: '60px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(34, 197, 94, 1)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(34, 197, 94, 0.9)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            Attendance Complete! →
          </button>
        </div>
      </div>
    </>
  );
};

export default AttendanceStep;