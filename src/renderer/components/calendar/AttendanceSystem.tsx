import React, { useState, useEffect } from 'react';
import { Student } from '../../types';
import UnifiedDataService from '../../services/unifiedDataService';

interface AttendanceSystemProps {
  students: Student[];
  currentDate: Date;
  onAttendanceComplete: (presentStudents: Student[], absentStudents: Student[]) => void;
  onNext: () => void;
}

const AttendanceSystem: React.FC<AttendanceSystemProps> = ({
  students,
  currentDate,
  onAttendanceComplete,
  onNext
}) => {
  const [presentStudents, setPresentStudents] = useState<Student[]>([]);
  const [remainingStudents, setRemainingStudents] = useState<Student[]>(students);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Reset attendance when students or date changes
    setRemainingStudents(students);
    setPresentStudents([]);
    setIsComplete(false);
  }, [students, currentDate]);

  const markPresent = (student: Student) => {
    // Save attendance to UnifiedDataService
    const dateString = currentDate.toISOString().split('T')[0];
    UnifiedDataService.updateStudentAttendance(student.id, dateString, true);
    
    // Add to present list
    setPresentStudents(prev => [...prev, student]);
    
    // Remove from remaining (disappearing effect)
    setRemainingStudents(prev => prev.filter(s => s.id !== student.id));
    
    // Check if all marked
    const newRemainingCount = remainingStudents.length - 1;
    if (newRemainingCount === 0) {
      setTimeout(() => {
        setIsComplete(true);
        onAttendanceComplete(
          [...presentStudents, student], 
          []
        );
      }, 500); // Small delay for visual effect
    }
  };

  const markAllAbsent = () => {
    const absentStudents = [...remainingStudents];
    const dateString = currentDate.toISOString().split('T')[0];
    
    // Save absent students to UnifiedDataService
    absentStudents.forEach(student => {
      UnifiedDataService.updateStudentAttendance(student.id, dateString, false);
    });
    
    setRemainingStudents([]);
    setIsComplete(true);
    onAttendanceComplete(presentStudents, absentStudents);
  };

  const handleNext = () => {
    if (remainingStudents.length > 0) {
      // Auto-mark remaining as absent
      markAllAbsent();
    }
    onNext();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div style={{
      padding: '2rem',
      textAlign: 'center',
      minHeight: '600px',
      display: 'flex',
      flexDirection: 'column',
      gap: '2rem'
    }}>
      {/* Header */}
      <div>
        <h2 style={{
          fontSize: '2.5rem',
          fontWeight: '700',
          color: 'white',
          marginBottom: '1rem',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>
          📋 Taking Attendance
        </h2>
        <p style={{
          fontSize: '1.3rem',
          color: 'rgba(255,255,255,0.9)',
          marginBottom: '0.5rem'
        }}>
          {formatDate(currentDate)}
        </p>
        <p style={{
          fontSize: '1.1rem',
          color: 'rgba(255,255,255,0.8)'
        }}>
          Touch each student's face when they arrive!
        </p>
      </div>

      {/* Progress Indicator */}
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '12px',
        padding: '1rem',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        <div style={{
          fontSize: '1.2rem',
          color: 'white',
          marginBottom: '0.5rem',
          fontWeight: '600'
        }}>
          Present: {presentStudents.length} | Remaining: {remainingStudents.length}
        </div>
        
        {/* Progress Bar */}
        <div style={{
          width: '100%',
          height: '8px',
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${(presentStudents.length / students.length) * 100}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #10B981, #34D399)',
            borderRadius: '4px',
            transition: 'width 0.5s ease'
          }} />
        </div>
      </div>

      {/* Student Faces Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: '1.5rem',
        maxWidth: '800px',
        margin: '0 auto',
        flex: 1
      }}>
        {remainingStudents.map(student => (
          <button
            key={student.id}
            onClick={() => markPresent(student)}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: '3px solid rgba(255,255,255,0.3)',
              borderRadius: '20px',
              padding: '1rem',
              cursor: 'pointer',
              transition: 'all 0.4s ease',
              backdropFilter: 'blur(10px)',
              color: 'white',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
              minHeight: '140px',
              animation: 'float 3s ease-in-out infinite'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05) translateY(-5px)';
              e.currentTarget.style.background = 'rgba(255,255,255,0.25)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1) translateY(0)';
              e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
            }}
          >
            {/* Student Photo or Avatar */}
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: student.photo 
                ? `url(${student.photo}) center/cover`
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.8rem',
              fontWeight: '700',
              color: 'white',
              border: '3px solid rgba(255,255,255,0.5)',
              textShadow: '0 1px 2px rgba(0,0,0,0.5)'
            }}>
              {!student.photo && student.name.charAt(0).toUpperCase()}
            </div>
            
            {/* Student Name */}
            <div style={{
              fontSize: '0.9rem',
              fontWeight: '600',
              textShadow: '0 1px 2px rgba(0,0,0,0.3)',
              lineHeight: '1.2'
            }}>
              {student.name}
            </div>
          </button>
        ))}
      </div>

      {/* Not at School Today Section */}
      {remainingStudents.length === 0 && presentStudents.length < students.length && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.2)',
          border: '2px solid rgba(239, 68, 68, 0.4)',
          borderRadius: '16px',
          padding: '1.5rem',
          backdropFilter: 'blur(10px)'
        }}>
          <h3 style={{
            color: 'white',
            fontSize: '1.3rem',
            marginBottom: '1rem',
            fontWeight: '600'
          }}>
            📍 Not at School Today
          </h3>
          <p style={{
            color: 'rgba(255,255,255,0.9)',
            fontSize: '1rem'
          }}>
            These students will be automatically removed from today's schedule.
          </p>
        </div>
      )}

      {/* Home Button */}
      <div style={{
        position: 'fixed',
        top: '1rem',
        left: '1rem',
        zIndex: 1000
      }}>
        <button
          onClick={() => window.location.reload()}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: '2px solid rgba(255,255,255,0.3)',
            borderRadius: '12px',
            color: 'white',
            padding: '0.75rem 1rem',
            fontSize: '0.9rem',
            fontWeight: '600',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          🏠 Home
        </button>
      </div>

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '1rem',
        flexWrap: 'wrap'
      }}>
        {remainingStudents.length > 0 && (
          <button
            onClick={markAllAbsent}
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
          >
            Mark Remaining as Absent
          </button>
        )}
        
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
        >
          {remainingStudents.length === 0 ? 'Continue to I Will...' : 'Taking Attendance...'}
        </button>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
};

export default AttendanceSystem;
