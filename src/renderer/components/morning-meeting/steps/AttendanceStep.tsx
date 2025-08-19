import React, { useState, useEffect } from 'react';
import { Student } from '../../../types';
import UnifiedDataService from '../../../services/unifiedDataService';

interface MorningMeetingStepProps {
  students: Student[];
  onNext: () => void;
  onBack: () => void;
  currentDate: Date;
  hubSettings: any; // MorningMeetingSettings
  onDataUpdate: (stepData: any) => void;
  stepData?: any;
}

interface AttendanceState {
  presentStudents: Student[];
  absentStudents: Student[];
  manuallyMarkedAbsent: Set<string>; // Track manual absent markings
}

const AttendanceStep: React.FC<MorningMeetingStepProps> = ({
  students,
  currentDate,
  onNext,
  onDataUpdate,
  stepData
}) => {
  const [attendanceState, setAttendanceState] = useState<AttendanceState>({
    presentStudents: stepData?.presentStudents || [],
    absentStudents: stepData?.absentStudents || [],
    manuallyMarkedAbsent: new Set(stepData?.manuallyMarkedAbsent || [])
  });

  const [remainingStudents, setRemainingStudents] = useState<Student[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  // Initialize remaining students (those not yet marked)
  useEffect(() => {
    const marked = [...attendanceState.presentStudents, ...attendanceState.absentStudents];
    const markedIds = new Set(marked.map(s => s.id));
    const remaining = students.filter(s => !markedIds.has(s.id));
    setRemainingStudents(remaining);
    setIsComplete(remaining.length === 0);
  }, [students, attendanceState]);

  // Save attendance data whenever state changes
  useEffect(() => {
    const stepData = {
      presentStudents: attendanceState.presentStudents,
      absentStudents: attendanceState.absentStudents,
      manuallyMarkedAbsent: Array.from(attendanceState.manuallyMarkedAbsent)
    };
    onDataUpdate(stepData);
  }, [attendanceState]);

  const markPresent = (student: Student) => {
    // Save to data service
    const dateString = currentDate.toISOString().split('T')[0];
    UnifiedDataService.updateStudentAttendance(student.id, dateString, true);
    
    // Update state - remove from any previous lists and add to present
    setAttendanceState(prev => ({
      presentStudents: [...prev.presentStudents.filter(s => s.id !== student.id), student],
      absentStudents: prev.absentStudents.filter(s => s.id !== student.id),
      manuallyMarkedAbsent: new Set([...prev.manuallyMarkedAbsent].filter(id => id !== student.id))
    }));
  };

  const markAbsent = (student: Student) => {
    // Save to data service
    const dateString = currentDate.toISOString().split('T')[0];
    UnifiedDataService.updateStudentAttendance(student.id, dateString, false);
    
    // Update state - remove from present and add to absent, mark as manually absent
    setAttendanceState(prev => ({
      presentStudents: prev.presentStudents.filter(s => s.id !== student.id),
      absentStudents: [...prev.absentStudents.filter(s => s.id !== student.id), student],
      manuallyMarkedAbsent: new Set([...prev.manuallyMarkedAbsent, student.id])
    }));
  };

  const markAllRemainingAbsent = () => {
    const dateString = currentDate.toISOString().split('T')[0];
    
    // Save all remaining as absent
    remainingStudents.forEach(student => {
      UnifiedDataService.updateStudentAttendance(student.id, dateString, false);
    });
    
    // Update state
    setAttendanceState(prev => ({
      ...prev,
      absentStudents: [...prev.absentStudents, ...remainingStudents],
      // Don't mark auto-absent students as manually marked
    }));
  };

  const resetAttendance = () => {
    if (window.confirm('Reset all attendance? This will mark everyone as not yet marked.')) {
      setAttendanceState({
        presentStudents: [],
        absentStudents: [],
        manuallyMarkedAbsent: new Set()
      });
    }
  };

  const handleNext = () => {
    if (remainingStudents.length > 0) {
      markAllRemainingAbsent();
      // Small delay to show the change before moving on
      setTimeout(onNext, 500);
    } else {
      onNext();
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
    const isManuallyAbsent = status === 'manually-absent';
    const isAutoAbsent = status === 'auto-absent';

    return (
      <div
        key={student.id}
        style={{
          background: isPresent 
            ? 'rgba(34, 197, 94, 0.9)' 
            : isManuallyAbsent 
            ? 'rgba(239, 68, 68, 0.9)'
            : isAutoAbsent
            ? 'rgba(156, 163, 175, 0.7)'
            : 'rgba(255, 255, 255, 0.9)',
          borderRadius: '16px',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem',
          transition: 'all 0.3s ease',
          cursor: isUnmarked ? 'pointer' : 'default',
          border: isUnmarked ? '3px solid rgba(255, 255, 255, 0.5)' : 'none',
          transform: isUnmarked ? 'scale(1.02)' : 'scale(1)',
          opacity: isAutoAbsent ? 0.6 : 1
        }}
        onClick={isUnmarked ? () => markPresent(student) : undefined}
      >
        {/* Student Photo */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: student.photo 
            ? `url(${student.photo}) center/cover`
            : 'linear-gradient(45deg, #667eea, #764ba2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem',
          color: 'white',
          fontWeight: 'bold'
        }}>
          {!student.photo && ((student as any).emoji || student.name.charAt(0).toUpperCase())}
        </div>

        {/* Student Name */}
        <div style={{
          fontWeight: '600',
          fontSize: '0.9rem',
          color: isPresent ? 'white' : isManuallyAbsent ? 'white' : '#1f2937',
          textAlign: 'center'
        }}>
          {student.name}
        </div>

        {/* Status Indicator */}
        <div style={{
          fontSize: '0.8rem',
          fontWeight: '500',
          color: isPresent ? 'rgba(255,255,255,0.9)' 
            : isManuallyAbsent ? 'rgba(255,255,255,0.9)'
            : isAutoAbsent ? 'rgba(156, 163, 175, 1)'
            : '#6b7280'
        }}>
          {isPresent && '✅ Present'}
          {isManuallyAbsent && '❌ Absent'}
          {isAutoAbsent && '⏰ Auto-Absent'}
          {isUnmarked && 'Tap when here!'}
        </div>

        {/* Action Buttons for Marked Students */}
        {!isUnmarked && (
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            marginTop: '0.5rem'
          }}>
            {!isPresent && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  markPresent(student);
                }}
                style={{
                  background: 'rgba(34, 197, 94, 0.8)',
                  border: 'none',
                  borderRadius: '6px',
                  color: 'white',
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.7rem',
                  cursor: 'pointer'
                }}
              >
                Mark Present
              </button>
            )}
            {!isManuallyAbsent && !isAutoAbsent && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  markAbsent(student);
                }}
                style={{
                  background: 'rgba(239, 68, 68, 0.8)',
                  border: 'none',
                  borderRadius: '6px',
                  color: 'white',
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.7rem',
                  cursor: 'pointer'
                }}
              >
                Mark Absent
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{
      height: '100%',
      width: '100%',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white'
    }}>
      {/* Header */}
      <div style={{
        padding: '2rem 2rem 1rem 2rem',
        textAlign: 'center'
      }}>
        <h2 style={{
          fontSize: '2.5rem',
          fontWeight: '700',
          color: 'white',
          marginBottom: '0.5rem',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>
          📋 Taking Attendance
        </h2>
        <p style={{
          fontSize: '1.2rem',
          color: 'rgba(255,255,255,0.9)',
          marginBottom: '0.5rem'
        }}>
          {formatDate(currentDate)}
        </p>
        <p style={{
          fontSize: '1rem',
          color: 'rgba(255,255,255,0.8)'
        }}>
          Touch each student's face when they arrive!
        </p>
      </div>

      {/* Stats */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '2rem',
        padding: '0 2rem 1rem 2rem',
        flexWrap: 'wrap'
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '12px',
          padding: '0.75rem 1.5rem',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            {attendanceState.presentStudents.length}
          </div>
          <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Present</div>
        </div>
        <div style={{
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '12px',
          padding: '0.75rem 1.5rem',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            {attendanceState.absentStudents.length}
          </div>
          <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Absent</div>
        </div>
        <div style={{
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '12px',
          padding: '0.75rem 1.5rem',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            {remainingStudents.length}
          </div>
          <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Remaining</div>
        </div>
      </div>

      {/* Main Content Area - Student Grid */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '1rem 2rem',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Unmarked Students */}
        {remainingStudents.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              marginBottom: '1rem',
              color: 'white',
              textAlign: 'center'
            }}>
              Students Not Yet Marked ({remainingStudents.length})
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '1rem'
            }}>
              {remainingStudents.map(student => 
                renderStudentCard(student, 'unmarked')
              )}
            </div>
          </div>
        )}

        {/* Present Students */}
        {attendanceState.presentStudents.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{
              fontSize: '1.3rem',
              fontWeight: '600',
              marginBottom: '1rem',
              color: 'rgba(255,255,255,0.9)',
              textAlign: 'center'
            }}>
              Present ({attendanceState.presentStudents.length})
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '1rem'
            }}>
              {attendanceState.presentStudents.map(student => 
                renderStudentCard(student, 'present')
              )}
            </div>
          </div>
        )}

        {/* Absent Students */}
        {attendanceState.absentStudents.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{
              fontSize: '1.3rem',
              fontWeight: '600',
              marginBottom: '1rem',
              color: 'rgba(255,255,255,0.9)',
              textAlign: 'center'
            }}>
              Absent ({attendanceState.absentStudents.length})
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '1rem'
            }}>
              {attendanceState.absentStudents.map(student => 
                renderStudentCard(student, getStudentStatus(student))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{
        padding: '1rem 2rem 2rem 2rem',
        display: 'flex',
        justifyContent: 'center',
        gap: '1rem',
        flexWrap: 'wrap'
      }}>
        {remainingStudents.length > 0 && (
          <button
            onClick={markAllRemainingAbsent}
            style={{
              background: 'rgba(239, 68, 68, 0.8)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              padding: '1rem 2rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 1)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.8)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            Mark Remaining as Absent ({remainingStudents.length})
          </button>
        )}
        
        <button
          onClick={resetAttendance}
          style={{
            background: 'rgba(156, 163, 175, 0.8)',
            border: 'none',
            borderRadius: '12px',
            color: 'white',
            padding: '1rem 2rem',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(156, 163, 175, 1)';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(156, 163, 175, 0.8)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          Reset All
        </button>
        
        <button
          onClick={handleNext}
          disabled={!isComplete && remainingStudents.length > 0}
          style={{
            background: isComplete || remainingStudents.length === 0
              ? 'rgba(34, 197, 94, 0.8)' 
              : 'rgba(156, 163, 175, 0.5)',
            border: 'none',
            borderRadius: '12px',
            color: 'white',
            padding: '1rem 3rem',
            fontSize: '1.1rem',
            fontWeight: '700',
            cursor: isComplete || remainingStudents.length === 0 ? 'pointer' : 'not-allowed',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            if (isComplete || remainingStudents.length === 0) {
              e.currentTarget.style.background = 'rgba(34, 197, 94, 1)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }
          }}
          onMouseLeave={(e) => {
            if (isComplete || remainingStudents.length === 0) {
              e.currentTarget.style.background = 'rgba(34, 197, 94, 0.8)';
              e.currentTarget.style.transform = 'scale(1)';
            }
          }}
        >
          {remainingStudents.length === 0 ? 'Continue →' : 'Complete Attendance First'}
        </button>
      </div>
    </div>
  );
};

export default AttendanceStep;
