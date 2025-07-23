import React, { useState, useEffect, useRef } from 'react';
import { Student, PhotoUploadResult } from '../../types';
import { usePhotoUpload } from '../../utils/photoManager';

interface StudentManagementProps {
  isActive: boolean;
  onDataChange?: () => void;
}

const StudentManagement: React.FC<StudentManagementProps> = ({ isActive, onDataChange }) => {
  // State management
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Photo upload hook
  const { uploadPhoto, validatePhoto } = usePhotoUpload();

  // Load student data
  useEffect(() => {
    loadStudentData();
  }, []);

  // Filter students when search/filter changes
  useEffect(() => {
    filterStudents();
  }, [students, searchTerm, gradeFilter]);

  const loadStudentData = () => {
    try {
      const savedStudents = localStorage.getItem('students');
      if (savedStudents) {
        setStudents(JSON.parse(savedStudents));
      } else {
        // Initialize with default students if none exist
        const defaultStudents: Student[] = [
          {
            id: 'student1',
            name: 'Emma Wilson',
            grade: 'Kindergarten',
            photo: null,
            workingStyle: 'collaborative',
            accommodations: ['Visual supports', 'Extra time'],
            goals: [
              'Will identify letters A-Z with 90% accuracy',
              'Will read 25 sight words with 80% accuracy',
              'Will write name independently'
            ],
            parentName: 'Sarah Wilson',
            parentEmail: 'sarah.wilson@email.com',
            parentPhone: '(555) 123-4567',
            isActive: true,
            behaviorNotes: 'Responds well to positive reinforcement',
            medicalNotes: '',
            resourceInfo: {
              attendsResource: false,
              resourceType: '',
              resourceTeacher: '',
              timeframe: ''
            },
            preferredPartners: [],
            avoidPartners: []
          },
          {
            id: 'student2',
            name: 'Marcus Johnson',
            grade: '1st',
            photo: null,
            workingStyle: 'independent',
            accommodations: ['Movement breaks', 'Fidget tools'],
            goals: [
              'Will count to 100 by 1s, 5s, and 10s',
              'Will solve addition problems within 20',
              'Will sit for 15 minutes during instruction'
            ],
            parentName: 'David Johnson',
            parentEmail: 'david.johnson@email.com',
            parentPhone: '(555) 234-5678',
            isActive: true,
            behaviorNotes: 'Works best with clear structure',
            medicalNotes: 'ADHD - takes medication at lunch',
            resourceInfo: {
              attendsResource: true,
              resourceType: 'Speech Therapy',
              resourceTeacher: 'Ms. Parker',
              timeframe: '10:00-10:30 AM'
            },
            preferredPartners: [],
            avoidPartners: []
          },
          {
            id: 'student3',
            name: 'Sofia Rodriguez',
            grade: '2nd',
            photo: null,
            workingStyle: 'collaborative',
            accommodations: ['Audio cues', 'Communication device'],
            goals: [
              'Will use AAC device to request items',
              'Will follow 2-step directions independently',
              'Will participate in group activities for 10 minutes'
            ],
            parentName: 'Maria Rodriguez',
            parentEmail: 'maria.rodriguez@email.com',
            parentPhone: '(555) 345-6789',
            isActive: true,
            behaviorNotes: 'Enjoys helping other students',
            medicalNotes: 'Uses AAC device for communication',
            resourceInfo: {
              attendsResource: true,
              resourceType: 'Occupational Therapy',
              resourceTeacher: 'Mrs. Thompson',
              timeframe: '1:00-1:30 PM'
            },
            preferredPartners: [],
            avoidPartners: []
          }
        ];
        setStudents(defaultStudents);
        saveStudentData(defaultStudents);
      }
    } catch (error) {
      console.error('Error loading student data:', error);
    }
  };

  const saveStudentData = (studentData: Student[]) => {
    try {
      localStorage.setItem('students', JSON.stringify(studentData));
      window.dispatchEvent(new CustomEvent('studentDataUpdated', { 
        detail: studentData 
      }));
      onDataChange?.();
    } catch (error) {
      console.error('Error saving student data:', error);
    }
  };

  const filterStudents = () => {
    let filtered = [...students];

    if (searchTerm) {
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.grade?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.accommodations?.some(acc => acc.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (gradeFilter !== 'all') {
      filtered = filtered.filter(s => s.grade?.toLowerCase() === gradeFilter.toLowerCase());
    }

    setFilteredStudents(filtered);
  };

  const getGradeGroups = () => {
    const gradeGroups: { [key: string]: Student[] } = {};
    
    filteredStudents.forEach(student => {
      const grade = student.grade || 'Unassigned';
      if (!gradeGroups[grade]) {
        gradeGroups[grade] = [];
      }
      gradeGroups[grade].push(student);
    });

    return gradeGroups;
  };

  const handleAddStudent = () => {
    setEditingStudent(null);
    setShowModal(true);
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setShowModal(true);
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (window.confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
      try {
        const updatedStudents = students.filter(s => s.id !== studentId);
        setStudents(updatedStudents);
        saveStudentData(updatedStudents);
      } catch (error) {
        console.error('Error deleting student:', error);
      }
    }
  };

  const handleSaveStudent = (studentData: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingStudent) {
        const updatedStudents = students.map(s => 
          s.id === editingStudent.id 
            ? { ...s, ...studentData, updatedAt: new Date().toISOString() }
            : s
        );
        setStudents(updatedStudents);
        saveStudentData(updatedStudents);
      } else {
        const newStudent: Student = {
          ...studentData,
          id: `student_${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        const updatedStudents = [...students, newStudent];
        setStudents(updatedStudents);
        saveStudentData(updatedStudents);
      }
      setShowModal(false);
      setEditingStudent(null);
    } catch (error) {
      console.error('Error saving student:', error);
    }
  };

  const exportStudents = () => {
    try {
      const dataStr = JSON.stringify(students, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `students-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting students:', error);
      alert('Failed to export students. Please try again.');
    }
  };

  const importStudents = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        if (Array.isArray(importedData)) {
          const confirmed = window.confirm(
            `This will import ${importedData.length} students. This will replace your current student list. Continue?`
          );
          if (confirmed) {
            setStudents(importedData);
            saveStudentData(importedData);
            alert(`Successfully imported ${importedData.length} students.`);
          }
        } else {
          alert('Invalid file format. Please select a valid student export file.');
        }
      } catch (error) {
        console.error('Error importing students:', error);
        alert('Failed to import students. Please check the file format.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  if (!isActive) return null;

  const gradeGroups = getGradeGroups();

  return (
    <div style={{ 
      padding: '2rem', 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
    }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 style={{ 
          color: 'white', 
          fontSize: '2.5rem', 
          fontWeight: '700', 
          margin: '0 0 0.5rem 0',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>
          👥 Student Management
        </h1>
        <p style={{ 
          color: 'rgba(255,255,255,0.9)', 
          fontSize: '1.1rem',
          margin: 0
        }}>
          Manage your students and upload photos for group assignments
        </p>
      </div>

      {/* Controls */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <input
          type="text"
          placeholder="Search students by name, grade, or accommodations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: '1',
            minWidth: '300px',
            padding: '12px 16px',
            border: '2px solid rgba(255,255,255,0.2)',
            borderRadius: '12px',
            fontSize: '14px',
            background: 'rgba(255,255,255,0.1)',
            color: 'white',
            backdropFilter: 'blur(10px)'
          }}
        />
        
        <select
          value={gradeFilter}
          onChange={(e) => setGradeFilter(e.target.value)}
          style={{
            padding: '12px 16px',
            border: '2px solid rgba(255,255,255,0.2)',
            borderRadius: '12px',
            fontSize: '14px',
            background: 'rgba(255,255,255,0.9)',
            color: 'black',
            backdropFilter: 'blur(10px)'
          }}
        >
          <option value="all" style={{ color: 'black' }}>All Grades</option>
          <option value="pre-k" style={{ color: 'black' }}>Pre-K</option>
          <option value="kindergarten" style={{ color: 'black' }}>Kindergarten</option>
          <option value="1st" style={{ color: 'black' }}>1st Grade</option>
          <option value="2nd" style={{ color: 'black' }}>2nd Grade</option>
          <option value="3rd" style={{ color: 'black' }}>3rd Grade</option>
          <option value="4th" style={{ color: 'black' }}>4th Grade</option>
          <option value="5th" style={{ color: 'black' }}>5th Grade</option>
          <option value="6th" style={{ color: 'black' }}>6th Grade</option>
        </select>
        
        <button
          className="create-activity-button"
          onClick={handleAddStudent}
          style={{
            background: 'linear-gradient(145deg, #28a745, #20c997)',
            border: 'none',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(40, 167, 69, 0.3)',
            transition: 'all 0.3s ease'
          }}
        >
          ➕ Add Student
        </button>

        <button
          onClick={exportStudents}
          style={{
            background: 'linear-gradient(145deg, #17a2b8, #138496)',
            border: 'none',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(23, 162, 184, 0.3)',
            transition: 'all 0.3s ease'
          }}
        >
          📤 Export
        </button>

        <label style={{
          background: 'linear-gradient(145deg, #fd7e14, #e55a00)',
          border: 'none',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: '600',
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(253, 126, 20, 0.3)',
          transition: 'all 0.3s ease'
        }}>
          📥 Import
          <input
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={importStudents}
          />
        </label>
      </div>

      {/* Student Groups */}
      <div style={{ marginBottom: '2rem' }}>
        {Object.entries(gradeGroups).length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '16px',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>👥</div>
            <h3 style={{ color: 'white', marginBottom: '0.5rem' }}>
              {searchTerm || gradeFilter !== 'all'
                ? 'No Students Found' 
                : 'No Students Yet'}
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '1.5rem' }}>
              {searchTerm || gradeFilter !== 'all'
                ? 'Try adjusting your search filters.'
                : 'Add your first student to get started.'}
            </p>
            <button
              className="create-activity-button"
              onClick={handleAddStudent}
            >
              ➕ Add Student
            </button>
          </div>
        ) : (
          Object.entries(gradeGroups).map(([grade, gradeStudents]) => (
            <div key={grade} style={{ marginBottom: '2rem' }}>
              <h3 style={{
                color: 'white',
                fontSize: '1.5rem',
                fontWeight: '700',
                marginBottom: '1rem',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}>
                {grade} ({gradeStudents.length} students)
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                gap: '1.5rem'
              }}>
                {gradeStudents.map(student => (
                  <StudentCard
                    key={student.id}
                    student={student}
                    onEdit={() => handleEditStudent(student)}
                    onDelete={() => handleDeleteStudent(student.id)}
                    uploadPhoto={uploadPhoto}
                    onPhotoUpdate={loadStudentData}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Student Modal */}
      {showModal && (
        <StudentModal
          student={editingStudent}
          students={students}
          onSave={handleSaveStudent}
          onCancel={() => {
            setShowModal(false);
            setEditingStudent(null);
          }}
          uploadPhoto={uploadPhoto}
          validatePhoto={validatePhoto}
        />
      )}
    </div>
  );
};

// Student Card Component
interface StudentCardProps {
  student: Student;
  onEdit: () => void;
  onDelete: () => void;
  uploadPhoto: (file: File) => Promise<PhotoUploadResult>;
  onPhotoUpdate: () => void;
}

const StudentCard: React.FC<StudentCardProps> = ({ 
  student, 
  onEdit, 
  onDelete, 
  uploadPhoto,
  onPhotoUpdate 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const result = await uploadPhoto(file);
      if (result.success && result.dataUrl) {
        const savedStudents = localStorage.getItem('students');
        if (savedStudents) {
          const students: Student[] = JSON.parse(savedStudents);
          const updatedStudents = students.map(s => 
            s.id === student.id 
              ? { ...s, photo: result.dataUrl, photoFileName: result.fileName }
              : s
          );
          localStorage.setItem('students', JSON.stringify(updatedStudents));
          
          window.dispatchEvent(new CustomEvent('studentDataUpdated', { 
            detail: updatedStudents 
          }));
          
          onPhotoUpdate();
        }
      } else {
        alert(`Photo upload failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Photo upload error:', error);
      alert('Failed to upload photo. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePhoto = () => {
    const savedStudents = localStorage.getItem('students');
    if (savedStudents) {
      const students: Student[] = JSON.parse(savedStudents);
      const updatedStudents = students.map(s => 
        s.id === student.id 
          ? { ...s, photo: null, photoFileName: undefined }
          : s
      );
      localStorage.setItem('students', JSON.stringify(updatedStudents));
      
      window.dispatchEvent(new CustomEvent('studentDataUpdated', { 
        detail: updatedStudents 
      }));
      
      onPhotoUpdate();
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(145deg, rgba(255,255,255,0.95), rgba(255,255,255,0.85))',
      borderRadius: '16px',
      padding: '1.5rem',
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255,255,255,0.2)',
      transition: 'all 0.3s ease'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.15)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)';
    }}>
      {/* Photo Section */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '1rem'
      }}>
        <div 
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            overflow: 'hidden',
            background: student.photo 
              ? 'transparent' 
              : 'linear-gradient(145deg, #667eea, #764ba2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            cursor: 'pointer'
          }}
          onClick={handlePhotoClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handlePhotoChange}
            disabled={isUploading}
          />
          
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
              fontSize: '2rem',
              color: 'white',
              fontWeight: '700'
            }}>
              {student.name.split(' ').map(n => n[0]).join('')}
            </span>
          )}
          
          {!student.photo && !isUploading && (
            <div style={{
              position: 'absolute',
              bottom: '0',
              left: '0',
              right: '0',
              background: 'rgba(0,0,0,0.7)',
              color: 'white',
              fontSize: '10px',
              textAlign: 'center',
              padding: '2px'
            }}>
              📷 Add
            </div>
          )}
          
          {student.photo && !isUploading && (
            <div style={{
              position: 'absolute',
              top: '0',
              left: '0',
              right: '0',
              bottom: '0',
              background: 'rgba(0,0,0,0.5)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              opacity: '0',
              transition: 'opacity 0.3s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}>
              📷 Change
            </div>
          )}
          
          {isUploading && (
            <div style={{
              position: 'absolute',
              top: '0',
              left: '0',
              right: '0',
              bottom: '0',
              background: 'rgba(0,0,0,0.7)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px'
            }}>
              📤 Uploading...
            </div>
          )}
        </div>

        <div style={{ flex: '1' }}>
          <h3 style={{
            margin: '0 0 0.25rem 0',
            color: '#2c3e50',
            fontSize: '1.3rem',
            fontWeight: '700'
          }}>
            {student.name}
          </h3>
          <p style={{
            margin: '0 0 0.5rem 0',
            color: '#667eea',
            fontSize: '1rem',
            fontWeight: '600'
          }}>
            {student.grade || 'No grade assigned'}
          </p>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span style={{
              background: 'linear-gradient(145deg, #667eea, #764ba2)',
              color: 'white',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '0.75rem',
              fontWeight: '600'
            }}>
              {student.workingStyle === 'independent' && '🧠 Independent'}
              {student.workingStyle === 'collaborative' && '👥 Collaborative'}
              {student.workingStyle === 'needs-support' && '🤝 Needs Support'}
            </span>
          </div>
        </div>
      </div>

      {/* Photo Upload Controls */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1rem'
      }}>
        <button
          onClick={handlePhotoClick}
          disabled={isUploading}
          style={{
            background: 'linear-gradient(145deg, #007bff, #0056b3)',
            border: 'none',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            flex: '1'
          }}
        >
          📷 {student.photo ? 'Change Photo' : 'Add Photo'}
        </button>
        
        {student.photo && (
          <button
            onClick={handleRemovePhoto}
            style={{
              background: 'linear-gradient(145deg, #dc3545, #c82333)',
              border: 'none',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            🗑️
          </button>
        )}
      </div>

      {/* Goals Section */}
      {student.goals && student.goals.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <strong style={{ color: '#2c3e50', fontSize: '0.9rem' }}>🎯 Goals:</strong>
          <div style={{ marginTop: '0.5rem' }}>
            {student.goals.slice(0, 2).map((goal, index) => (
              <div key={index} style={{
                fontSize: '0.8rem',
                color: '#495057',
                marginBottom: '0.25rem',
                paddingLeft: '1rem',
                position: 'relative'
              }}>
                <span style={{ 
                  position: 'absolute', 
                  left: '0', 
                  color: '#28a745' 
                }}>•</span>
                {goal}
              </div>
            ))}
            {student.goals.length > 2 && (
              <div style={{
                fontSize: '0.75rem',
                color: '#6c757d',
                fontStyle: 'italic',
                marginTop: '0.25rem'
              }}>
                +{student.goals.length - 2} more goals...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Resource Info */}
      {student.resourceInfo?.attendsResource && (
        <div style={{ marginBottom: '1rem' }}>
          <strong style={{ color: '#2c3e50', fontSize: '0.9rem' }}>🏫 Resource:</strong>
          <div style={{ marginTop: '0.25rem', fontSize: '0.85rem', color: '#495057' }}>
            <div>{student.resourceInfo.resourceType}</div>
            <div>{student.resourceInfo.resourceTeacher}</div>
            <div>{student.resourceInfo.timeframe}</div>
          </div>
        </div>
      )}

      {/* Accommodations */}
      {student.accommodations && student.accommodations.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <strong style={{ color: '#2c3e50', fontSize: '0.9rem' }}>Accommodations:</strong>
          <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
            {student.accommodations.slice(0, 3).map((accommodation, index) => (
              <span 
                key={index} 
                style={{
                  background: '#e3f2fd',
                  color: '#1976d2',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: '500'
                }}
              >
                {accommodation}
              </span>
            ))}
            {student.accommodations.length > 3 && (
              <span style={{
                color: '#6c757d',
                fontSize: '0.75rem',
                fontStyle: 'italic'
              }}>
                +{student.accommodations.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Parent Contact */}
      {student.parentEmail && (
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.9rem', color: '#495057' }}>
            👨‍👩‍👧‍👦 {student.parentName || 'Parent'}
          </div>
          <a href={`mailto:${student.parentEmail}`} style={{
            fontSize: '0.8rem',
            color: '#007bff',
            textDecoration: 'none'
          }}>
            📧 {student.parentEmail}
          </a>
          {student.parentPhone && (
            <div style={{ fontSize: '0.8rem', color: '#495057' }}>
              📞 {student.parentPhone}
            </div>
          )}
        </div>
      )}

      {/* Notes */}
      {student.behaviorNotes && (
        <div style={{
          background: 'rgba(102, 126, 234, 0.1)',
          padding: '0.75rem',
          borderRadius: '8px',
          fontSize: '0.9rem',
          color: '#495057',
          marginBottom: '1rem',
          fontStyle: 'italic'
        }}>
          💭 {student.behaviorNotes}
        </div>
      )}

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        gap: '0.5rem'
      }}>
        <button
          onClick={onEdit}
          style={{
            background: 'linear-gradient(145deg, #ffc107, #e0a800)',
            border: 'none',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            flex: '1'
          }}
        >
          ✏️ Edit
        </button>
        
        <button
          onClick={onDelete}
          style={{
            background: 'linear-gradient(145deg, #dc3545, #c82333)',
            border: 'none',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  );
};

// Student Modal Component
interface StudentModalProps {
  student: Student | null;
  students: Student[];
  onSave: (student: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  uploadPhoto: (file: File) => Promise<PhotoUploadResult>;
  validatePhoto: (file: File) => { isValid: boolean; error?: string };
}

const StudentModal: React.FC<StudentModalProps> = ({
  student,
  students,
  onSave,
  onCancel,
  uploadPhoto,
  validatePhoto
}) => {
  const [formData, setFormData] = useState({
    name: student?.name || '',
    grade: student?.grade || 'Kindergarten',
    photo: student?.photo || null,
    photoFileName: student?.photoFileName || '',
    accommodations: student?.accommodations || [],
    goals: student?.goals || [],
    workingStyle: student?.workingStyle || 'collaborative' as const,
    behaviorNotes: student?.behaviorNotes || '',
    medicalNotes: student?.medicalNotes || '',
    parentName: student?.parentName || '',
    parentEmail: student?.parentEmail || '',
    parentPhone: student?.parentPhone || '',
    emergencyContact: student?.emergencyContact || '',
    resourceInfo: student?.resourceInfo || {
      attendsResource: false,
      resourceType: '',
      resourceTeacher: '',
      timeframe: ''
    },
    preferredPartners: student?.preferredPartners || [],
    avoidPartners: student?.avoidPartners || [],
    isActive: student?.isActive ?? true
  });

  const [newAccommodation, setNewAccommodation] = useState('');
  const [newGoal, setNewGoal] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const accommodationOptions = [
    'Extra time',
    'Visual supports',
    'Movement breaks',
    'Audio cues',
    'Simplified instructions',
    'Quiet space',
    'Sensory tools',
    'Picture schedule',
    'Social stories',
    'Communication device',
    'Fidget tools',
    'Noise-canceling headphones',
    'Preferred seating',
    'Frequent check-ins',
    'Modified assignments',
    'Alternative assessment'
  ];

  const resourceTypes = [
    'Speech Therapy',
    'Occupational Therapy',
    'Physical Therapy',
    'Reading Specialist',
    'Math Specialist',
    'Behavioral Support',
    'Counseling',
    'ESL Support',
    'Life Skills',
    'Vocational Training'
  ];

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.grade) {
      newErrors.grade = 'Grade is required';
    }

    if (formData.parentEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.parentEmail)) {
      newErrors.parentEmail = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    onSave({
      name: formData.name.trim(),
      grade: formData.grade,
      photo: formData.photo,
      photoFileName: formData.photoFileName,
      accommodations: formData.accommodations,
      goals: formData.goals,
      workingStyle: formData.workingStyle,
      behaviorNotes: formData.behaviorNotes.trim(),
      medicalNotes: formData.medicalNotes.trim(),
      parentName: formData.parentName.trim(),
      parentEmail: formData.parentEmail.trim(),
      parentPhone: formData.parentPhone.trim(),
      emergencyContact: formData.emergencyContact.trim(),
      resourceInfo: formData.resourceInfo,
      preferredPartners: formData.preferredPartners,
      avoidPartners: formData.avoidPartners,
      isActive: formData.isActive
    });
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validation = validatePhoto(file);
    if (!validation.isValid) {
      alert(`Photo validation failed: ${validation.error}`);
      return;
    }

    setIsUploading(true);
    try {
      const result = await uploadPhoto(file);
      if (result.success && result.dataUrl) {
        setFormData(prev => ({
          ...prev,
          photo: result.dataUrl,
          photoFileName: result.fileName || ''
        }));
      } else {
        alert(`Photo upload failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Photo upload error:', error);
      alert('Failed to upload photo. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePhoto = () => {
    setFormData(prev => ({
      ...prev,
      photo: null,
      photoFileName: ''
    }));
  };

  const addAccommodation = (accommodation: string) => {
    if (accommodation && !formData.accommodations.includes(accommodation)) {
      setFormData(prev => ({
        ...prev,
        accommodations: [...prev.accommodations, accommodation]
      }));
    }
  };

  const removeAccommodation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      accommodations: prev.accommodations.filter((_, i) => i !== index)
    }));
  };

  const addGoal = () => {
    if (newGoal.trim() && !formData.goals.includes(newGoal.trim())) {
      setFormData(prev => ({
        ...prev,
        goals: [...prev.goals, newGoal.trim()]
      }));
      setNewGoal('');
    }
  };

  const removeGoal = (index: number) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="modal-header">
          <h3>{student ? '✏️ Edit Student' : '➕ Add Student'}</h3>
          <button className="close-button" onClick={onCancel}>×</button>
        </div>

        <div className="modal-body">
          {/* Photo Section */}
          <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
            <h4>Photo</h4>
            <div 
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                overflow: 'hidden',
                background: formData.photo 
                  ? 'transparent' 
                  : 'linear-gradient(145deg, #667eea, #764ba2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem auto',
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                cursor: 'pointer'
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handlePhotoUpload}
                disabled={isUploading}
              />
              
              {formData.photo ? (
                <img
                  src={formData.photo}
                  alt={formData.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <span style={{
                  fontSize: '3rem',
                  color: 'white',
                  fontWeight: '700'
                }}>
                  {formData.name ? formData.name.split(' ').map(n => n[0]).join('') : '👦'}
                </span>
              )}
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                style={{
                  background: 'linear-gradient(145deg, #007bff, #0056b3)',
                  border: 'none',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                📷 {formData.photo ? 'Change Photo' : 'Add Photo'}
              </button>
              
              {formData.photo && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  style={{
                    background: 'linear-gradient(145deg, #dc3545, #c82333)',
                    border: 'none',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  🗑️ Remove
                </button>
              )}
            </div>
          </div>

          {/* Basic Information */}
          <div className="form-section">
            <h4>Basic Information</h4>
            <div className="form-grid">
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter student's name"
                  style={{ width: '100%' }}
                />
                {errors.name && <span className="error-text">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label>Grade *</label>
                <select
                  value={formData.grade}
                  onChange={(e) => setFormData(prev => ({ ...prev, grade: e.target.value }))}
                  style={{ width: '100%' }}
                >
                  <option value="Pre-K">Pre-K</option>
                  <option value="Kindergarten">Kindergarten</option>
                  <option value="1st">1st Grade</option>
                  <option value="2nd">2nd Grade</option>
                  <option value="3rd">3rd Grade</option>
                  <option value="4th">4th Grade</option>
                  <option value="5th">5th Grade</option>
                  <option value="6th">6th Grade</option>
                </select>
                {errors.grade && <span className="error-text">{errors.grade}</span>}
              </div>

              <div className="form-group">
                <label>Working Style</label>
                <select
                  value={formData.workingStyle}
                  onChange={(e) => setFormData(prev => ({ ...prev, workingStyle: e.target.value as any }))}
                  style={{ width: '100%' }}
                >
                  <option value="independent">Independent</option>
                  <option value="collaborative">Collaborative</option>
                  <option value="needs-support">Needs Support</option>
                </select>
              </div>
            </div>
          </div>

          {/* Goals Section */}
          <div className="form-section">
            <h4>🎯 IEP Goals</h4>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="Enter an IEP goal..."
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addGoal();
                    }
                  }}
                  style={{ flex: '1' }}
                />
                <button
                  type="button"
                  onClick={addGoal}
                  disabled={!newGoal.trim()}
                  style={{
                    background: newGoal.trim() ? '#28a745' : '#dee2e6',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.75rem 1rem',
                    color: 'white',
                    cursor: newGoal.trim() ? 'pointer' : 'not-allowed',
                    fontSize: '0.9rem',
                    fontWeight: '600'
                  }}
                >
                  Add Goal
                </button>
              </div>
              
              {formData.goals.length > 0 && (
                <div style={{
                  background: '#f8f9fa',
                  borderRadius: '8px',
                  padding: '1rem',
                  border: '1px solid #e1e8ed',
                  maxHeight: '200px',
                  overflowY: 'auto'
                }}>
                  <div style={{ marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>
                    Current Goals ({formData.goals.length})
                  </div>
                  {formData.goals.map((goal, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        padding: '0.5rem',
                        background: 'white',
                        borderRadius: '6px',
                        marginBottom: '0.5rem',
                        border: '1px solid #e1e8ed'
                      }}
                    >
                      <div style={{ flex: '1', fontSize: '0.9rem', lineHeight: '1.4' }}>
                        {goal}
                      </div>
                      <button
                        onClick={() => removeGoal(index)}
                        style={{
                          background: '#dc3545',
                          border: 'none',
                          borderRadius: '4px',
                          width: '24px',
                          height: '24px',
                          color: 'white',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          marginLeft: '0.5rem'
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Resource Information */}
          <div className="form-section">
            <h4>🏫 Resource Information</h4>
            <div className="checkbox-group" style={{ marginBottom: '1rem' }}>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.resourceInfo.attendsResource}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    resourceInfo: {
                      ...prev.resourceInfo,
                      attendsResource: e.target.checked
                    }
                  }))}
                />
                Student attends resource/pull-out services
              </label>
            </div>

            {formData.resourceInfo.attendsResource && (
              <div className="form-grid">
                <div className="form-group">
                  <label>Resource Type</label>
                  <select
                    value={formData.resourceInfo.resourceType}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      resourceInfo: {
                        ...prev.resourceInfo,
                        resourceType: e.target.value
                      }
                    }))}
                    style={{ width: '100%' }}
                  >
                    <option value="">Select resource type...</option>
                    {resourceTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Resource Teacher</label>
                  <input
                    type="text"
                    value={formData.resourceInfo.resourceTeacher}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      resourceInfo: {
                        ...prev.resourceInfo,
                        resourceTeacher: e.target.value
                      }
                    }))}
                    placeholder="Teacher name"
                    style={{ width: '100%' }}
                  />
                </div>

                <div className="form-group">
                  <label>Time Frame</label>
                  <input
                    type="text"
                    value={formData.resourceInfo.timeframe}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      resourceInfo: {
                        ...prev.resourceInfo,
                        timeframe: e.target.value
                      }
                    }))}
                    placeholder="e.g., 10:00-10:30 AM"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Accommodations */}
          <div className="form-section">
            <h4>🛠️ Accommodations</h4>
            <div className="accommodations-section">
              <div style={{ marginBottom: '1rem' }}>
                {formData.accommodations.map((accommodation, index) => (
                  <span 
                    key={index} 
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      background: '#e3f2fd',
                      color: '#1976d2',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '0.85rem',
                      fontWeight: '500',
                      margin: '2px',
                      border: '1px solid #bbdefb'
                    }}
                  >
                    {accommodation}
                    <button 
                      type="button" 
                      onClick={() => removeAccommodation(index)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#1976d2',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        padding: '0'
                      }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value) {
                      addAccommodation(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  style={{ width: '100%' }}
                >
                  <option value="">Select an accommodation...</option>
                  {accommodationOptions
                    .filter(opt => !formData.accommodations.includes(opt))
                    .map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="Or add custom accommodation..."
                  value={newAccommodation}
                  onChange={(e) => setNewAccommodation(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addAccommodation(newAccommodation);
                      setNewAccommodation('');
                    }
                  }}
                  style={{ flex: '1' }}
                />
                <button
                  type="button"
                  onClick={() => {
                    addAccommodation(newAccommodation);
                    setNewAccommodation('');
                  }}
                  disabled={!newAccommodation.trim()}
                  style={{
                    background: '#667eea',
                    color: 'white',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Parent/Guardian Information */}
          <div className="form-section">
            <h4>Parent/Guardian Information</h4>
            <div className="form-grid">
              <div className="form-group">
                <label>Parent/Guardian Name</label>
                <input
                  type="text"
                  value={formData.parentName}
                  onChange={(e) => setFormData(prev => ({ ...prev, parentName: e.target.value }))}
                  placeholder="Parent or guardian name"
                  style={{ width: '100%' }}
                />
              </div>

              <div className="form-group">
                <label>Parent Email</label>
                <input
                  type="email"
                  value={formData.parentEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, parentEmail: e.target.value }))}
                  placeholder="parent@email.com"
                  style={{ width: '100%' }}
                />
                {errors.parentEmail && <span className="error-text">{errors.parentEmail}</span>}
              </div>

              <div className="form-group">
                <label>Parent Phone</label>
                <input
                  type="tel"
                  value={formData.parentPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, parentPhone: e.target.value }))}
                  placeholder="(555) 123-4567"
                  style={{ width: '100%' }}
                />
              </div>

              <div className="form-group">
                <label>Emergency Contact</label>
                <input
                  type="text"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData(prev => ({ ...prev, emergencyContact: e.target.value }))}
                  placeholder="Emergency contact name and phone"
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div className="form-section">
            <h4>Additional Information</h4>
            <div className="form-group">
              <label>Behavior Notes</label>
              <textarea
                value={formData.behaviorNotes}
                onChange={(e) => setFormData(prev => ({ ...prev, behaviorNotes: e.target.value }))}
                placeholder="Behavior strategies, triggers, positive reinforcements..."
                rows={3}
                style={{ width: '100%' }}
              />
            </div>

            <div className="form-group">
              <label>Medical Notes</label>
              <textarea
                value={formData.medicalNotes}
                onChange={(e) => setFormData(prev => ({ ...prev, medicalNotes: e.target.value }))}
                placeholder="Medical conditions, medications, allergies..."
                rows={3}
                style={{ width: '100%' }}
              />
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="cancel-btn" onClick={onCancel}>
            Cancel
          </button>
          <button 
            className="save-btn" 
            onClick={handleSubmit}
            disabled={isUploading}
          >
            {isUploading ? '📤 Uploading...' : student ? 'Update Student' : 'Add Student'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentManagement;