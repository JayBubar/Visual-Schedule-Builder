import React, { useState, useEffect, useCallback } from 'react';
import UnifiedDataService from '../../services/unifiedDataService';

interface AttendanceManagerProps {
  allStudents: any[];
  isOpen: boolean;
  onClose: () => void;
}

const AttendanceManager: React.FC<AttendanceManagerProps> = ({ 
  allStudents, 
  isOpen, 
  onClose 
}) => {
  // Direct data loading with UnifiedDataService
  const [loadedStudents, setLoadedStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const students = UnifiedDataService.getAllStudents();
      
      setLoadedStudents(students);
      setError(null);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data');
      setLoadedStudents([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, loadData]);

  // Filter to only active students
  const students = loadedStudents.filter(student => student.isActive !== false);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'present' | 'absent'>('all');
  const [notes, setNotes] = useState<{ [studentId: string]: string }>({});
  const [absentStudents, setAbsentStudents] = useState<string[]>([]);

  console.log('📋 AttendanceManager - Using robust data loading');
  console.log('- students:', students?.length || 0, 'students');
  console.log('- absentStudents:', absentStudents?.length || 0, 'absent');
  console.log('- isLoading:', isLoading);
  console.log('- error:', error);

  // Load existing notes and absent students for today
  useEffect(() => {
    try {
      const todayAttendance = UnifiedDataService.getTodayAttendance();
      const notesMap: { [studentId: string]: string } = {};
      const absentIds: string[] = [];
      
      todayAttendance.forEach(record => {
        if (record.notes) {
          notesMap[record.studentId] = record.notes;
        }
        if (!record.isPresent) {
          absentIds.push(record.studentId);
        }
      });
      
      setNotes(notesMap);
      setAbsentStudents(absentIds);
    } catch (error) {
      console.error('Error loading today\'s attendance:', error);
      setAbsentStudents([]);
      setNotes({});
    }
  }, []);

  // Filter students based on search and status
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
    const isAbsent = absentStudents.includes(student.id);
    
    if (filterStatus === 'present') return matchesSearch && !isAbsent;
    if (filterStatus === 'absent') return matchesSearch && isAbsent;
    return matchesSearch;
  });

  const handleStatusToggle = (studentId: string, currentlyPresent: boolean) => {
    const newStatus = !currentlyPresent;
    const studentNotes = notes[studentId] || '';
    
    try {
      // Update attendance via UnifiedDataService (date, isPresent, notes)
      const today = new Date().toISOString().split('T')[0];
      UnifiedDataService.updateStudentAttendance(studentId, today, newStatus, studentNotes);
      
      // Update local state
      if (newStatus) {
        // Student is now present - remove from absent list
        setAbsentStudents(prev => prev.filter(id => id !== studentId));
      } else {
        // Student is now absent - add to absent list
        setAbsentStudents(prev => [...prev.filter(id => id !== studentId), studentId]);
      }
    } catch (error) {
      console.error('Error updating student attendance:', error);
      alert('Error updating attendance. Please try again.');
    }
  };

  const handleNotesChange = (studentId: string, newNotes: string) => {
    setNotes(prev => ({ ...prev, [studentId]: newNotes }));
    const isPresent = !absentStudents.includes(studentId);
    
    try {
      // Update attendance with new notes via UnifiedDataService (studentId, date, isPresent, notes)
      const today = new Date().toISOString().split('T')[0];
      UnifiedDataService.updateStudentAttendance(studentId, today, isPresent, newNotes);
    } catch (error) {
      console.error('Error updating attendance notes:', error);
    }
  };

  const handleResetAll = () => {
    if (window.confirm('Reset all students to present? This cannot be undone.')) {
      try {
        // Reset all students to present via UnifiedDataService
        UnifiedDataService.resetTodayAttendance();
        
        // Update local state
        setAbsentStudents([]);
        setNotes({});
      } catch (error) {
        console.error('Error resetting attendance:', error);
        alert('Error resetting attendance. Please try again.');
      }
    }
  };

  const presentCount = students.length - absentStudents.length;
  const absentCount = absentStudents.length;

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        width: '90%',
        maxWidth: '800px',
        maxHeight: '90vh',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{
              margin: '0 0 0.5rem 0',
              fontSize: '1.5rem',
              fontWeight: '700'
            }}>
              📋 Daily Attendance
            </h2>
            <p style={{
              margin: '0',
              fontSize: '0.9rem',
              opacity: 0.9
            }}>
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              color: 'white',
              fontSize: '1.2rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ✕
          </button>
        </div>

        {/* Stats Bar */}
        <div style={{
          background: '#f8f9fa',
          padding: '1rem 1.5rem',
          borderBottom: '1px solid #e9ecef',
          display: 'flex',
          gap: '2rem',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <div style={{
              background: '#28a745',
              color: 'white',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.8rem',
              fontWeight: '700'
            }}>
              ✓
            </div>
            <span style={{ fontWeight: '600', color: '#28a745' }}>
              Present: {presentCount}
            </span>
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <div style={{
              background: '#dc3545',
              color: 'white',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.8rem',
              fontWeight: '700'
            }}>
              🏠
            </div>
            <span style={{ fontWeight: '600', color: '#dc3545' }}>
              Absent: {absentCount}
            </span>
          </div>

          <div style={{
            marginLeft: 'auto',
            display: 'flex',
            gap: '0.5rem'
          }}>
            <button
              onClick={handleResetAll}
              style={{
                background: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '0.5rem 1rem',
                fontSize: '0.8rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              🔄 Reset All
            </button>
          </div>
        </div>

        {/* Controls */}
        <div style={{
          padding: '1rem 1.5rem',
          borderBottom: '1px solid #e9ecef',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <input
              type="text"
              placeholder="🔍 Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e9ecef',
                borderRadius: '8px',
                fontSize: '0.9rem'
              }}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {(['all', 'present', 'absent'] as const).map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                style={{
                  padding: '0.5rem 1rem',
                  border: '2px solid',
                  borderColor: filterStatus === status ? '#667eea' : '#e9ecef',
                  background: filterStatus === status ? '#667eea' : 'white',
                  color: filterStatus === status ? 'white' : '#495057',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {status === 'all' ? `All (${students.length})` : 
                 status === 'present' ? `Present (${presentCount})` : 
                 `Absent (${absentCount})`}
              </button>
            ))}
          </div>
        </div>

        {/* Student List */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '1rem 1.5rem'
        }}>
          {filteredStudents.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              color: '#6c757d'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
              <p style={{ margin: 0, fontSize: '1.1rem' }}>
                {searchTerm ? 'No students match your search' : 'No students found'}
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gap: '1rem',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))'
            }}>
              {filteredStudents.map(student => {
                const isAbsent = absentStudents.includes(student.id);
                const isPresent = !isAbsent;
                
                return (
                  <div
                    key={student.id}
                    style={{
                      background: isPresent ? '#f8fff8' : '#fff5f5',
                      border: `2px solid ${isPresent ? '#28a745' : '#dc3545'}`,
                      borderRadius: '12px',
                      padding: '1rem',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {/* Student Header */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      marginBottom: '0.75rem'
                    }}>
                      {/* Photo */}
                      <div style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        background: student.photo ? 'transparent' : 'linear-gradient(135deg, #667eea, #764ba2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        border: `3px solid ${isPresent ? '#28a745' : '#dc3545'}`,
                        flexShrink: 0
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
                          <span style={{ 
                            color: 'white', 
                            fontWeight: '700',
                            fontSize: '1rem'
                          }}>
                            {student.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                          </span>
                        )}
                      </div>

                      {/* Student Info */}
                      <div style={{ flex: 1 }}>
                        <h4 style={{
                          margin: '0 0 0.25rem 0',
                          fontSize: '1.1rem',
                          fontWeight: '700',
                          color: '#2c3e50'
                        }}>
                          {student.name}
                        </h4>
                        {student.grade && (
                          <p style={{
                            margin: '0',
                            fontSize: '0.9rem',
                            color: '#6c757d',
                            fontWeight: '500'
                          }}>
                            Grade {student.grade}
                          </p>
                        )}
                      </div>

                      {/* Status Toggle */}
                      <button
                        onClick={() => handleStatusToggle(student.id, isPresent)}
                        style={{
                          background: isPresent ? '#28a745' : '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '0.5rem 1rem',
                          fontSize: '0.9rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {isPresent ? '✓ Present' : '🏠 Absent'}
                      </button>
                    </div>

                    {/* Notes Section */}
                    <div>
                      <label style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        color: '#495057'
                      }}>
                        Notes (optional):
                      </label>
                      <textarea
                        value={notes[student.id] || ''}
                        onChange={(e) => handleNotesChange(student.id, e.target.value)}
                        placeholder="Add any notes about this student's attendance..."
                        style={{
                          width: '100%',
                          minHeight: '60px',
                          padding: '0.5rem',
                          border: '1px solid #e9ecef',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          resize: 'vertical',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          background: '#f8f9fa',
          padding: '1rem 1.5rem',
          borderTop: '1px solid #e9ecef',
          textAlign: 'center'
        }}>
          <p style={{
            margin: '0',
            fontSize: '0.8rem',
            color: '#6c757d'
          }}>
            Attendance data is automatically saved and will reset tomorrow
          </p>
        </div>
      </div>
    </div>
  );
};

export default AttendanceManager;
