import React from 'react';
import UnifiedDataService from '../../services/unifiedDataService';

interface AbsentStudentsDisplayProps {
  absentStudents: string[];
}

const AbsentStudentsDisplay: React.FC<AbsentStudentsDisplayProps> = ({ absentStudents }) => {
  // Get student details from UnifiedDataService
  const getStudentDetails = (studentId: string) => {
    try {
      const allStudents = UnifiedDataService.getAllStudents();
      return allStudents.find(student => student.id === studentId);
    } catch (error) {
      console.error('Error loading student details:', error);
      // Fallback to localStorage
      try {
        const savedStudents = localStorage.getItem('students');
        if (savedStudents) {
          const students = JSON.parse(savedStudents);
          return students.find((student: any) => student.id === studentId);
        }
      } catch (fallbackError) {
        console.error('Error loading students from localStorage:', fallbackError);
      }
      return null;
    }
  };

  // Don't render if no absent students
  if (!absentStudents || absentStudents.length === 0) {
    return null;
  }

  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      left: '20px',
      background: 'rgba(220, 53, 69, 0.95)',
      backdropFilter: 'blur(10px)',
      borderRadius: '16px',
      padding: '1rem',
      border: '2px solid rgba(220, 53, 69, 0.3)',
      boxShadow: '0 8px 32px rgba(220, 53, 69, 0.3)',
      zIndex: 100,
      minWidth: '200px',
      maxWidth: '300px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '0.75rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        paddingBottom: '0.5rem'
      }}>
        <span style={{ fontSize: '1.2rem' }}>🏠</span>
        <h4 style={{
          margin: '0',
          color: 'white',
          fontSize: '0.9rem',
          fontWeight: '700',
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
        }}>
          Not at School Today
        </h4>
        <div style={{
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '12px',
          padding: '0.2rem 0.5rem',
          fontSize: '0.7rem',
          fontWeight: '700',
          color: 'white',
          minWidth: '20px',
          textAlign: 'center'
        }}>
          {absentStudents.length}
        </div>
      </div>

      {/* Absent Students List */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
      }}>
        {absentStudents.map(studentId => {
          const student = getStudentDetails(studentId);
          
          return (
            <div
              key={studentId}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '0.5rem',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              {/* Student Photo/Avatar */}
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: student?.photo ? 'transparent' : 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.8rem',
                overflow: 'hidden',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                flexShrink: 0
              }}>
                {student?.photo ? (
                  <img 
                    src={student.photo} 
                    alt={student.name || 'Student'} 
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }} 
                  />
                ) : (
                  <span style={{ 
                    color: 'white', 
                    fontWeight: '700',
                    fontSize: '0.7rem'
                  }}>
                    {student?.name ? student.name.split(' ').map(n => n[0]).join('').toUpperCase() : '?'}
                  </span>
                )}
              </div>

              {/* Student Name */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  color: 'white',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {student?.name || 'Unknown Student'}
                </div>
                {student?.grade && (
                  <div style={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: '0.7rem',
                    fontWeight: '500'
                  }}>
                    Grade {student.grade}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer with timestamp */}
      <div style={{
        marginTop: '0.75rem',
        paddingTop: '0.5rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.2)',
        textAlign: 'center'
      }}>
        <div style={{
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: '0.7rem',
          fontWeight: '500'
        }}>
          Updated: {new Date().toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
    </div>
  );
};

export default AbsentStudentsDisplay;
