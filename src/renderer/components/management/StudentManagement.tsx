// Complete Student Management with Unified Data Integration
// All original features preserved + unified data support
// src/renderer/components/management/StudentManagement.tsx

import React, { useState, useEffect, useRef } from 'react';
import UnifiedDataService, { UnifiedStudent } from '../../services/unifiedDataService';

// Extended interface to include all original Student properties
interface ExtendedStudent extends UnifiedStudent {
  workingStyle?: 'collaborative' | 'independent';
  accommodations?: string[];
  goals?: string[]; // Legacy IEP goals as strings
  parentName?: string;
  parentEmail?: string;
  parentPhone?: string;
  isActive?: boolean;
  behaviorNotes?: string;
  medicalNotes?: string;
  resourceInfo?: {
    attendsResource: boolean;
    resourceType: string;
    resourceTeacher: string;
    timeframe: string;
  };
  preferredPartners?: string[];
  avoidPartners?: string[];
}

interface PhotoUploadResult {
  success: boolean;
  photoData?: string;
  error?: string;
}

interface StudentManagementProps {
  isActive: boolean;
  onDataChange?: () => void;
}

const StudentManagement: React.FC<StudentManagementProps> = ({ isActive, onDataChange }) => {
  // State management
  const [students, setStudents] = useState<ExtendedStudent[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<ExtendedStudent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<ExtendedStudent | null>(null);
  const [isUsingUnifiedData, setIsUsingUnifiedData] = useState(false);

  // Load student data
  useEffect(() => {
    if (isActive) {
      loadStudentData();
    }
  }, [isActive]);

  // Filter students when search/filter changes
  useEffect(() => {
    filterStudents();
  }, [students, searchTerm, gradeFilter]);

  const loadStudentData = () => {
    try {
      // Check if unified data exists
      const unifiedDataStatus = UnifiedDataService.isUsingUnifiedData();
      setIsUsingUnifiedData(unifiedDataStatus);

      if (unifiedDataStatus) {
        // Load from unified data service
        const unifiedStudents = UnifiedDataService.getAllStudents() as ExtendedStudent[];
        setStudents(unifiedStudents);
      } else {
        // Load from legacy localStorage
        const savedStudents = localStorage.getItem('students');
        if (savedStudents) {
          const legacyStudents = JSON.parse(savedStudents);
          // Convert legacy students to extended format
          const extendedStudents: ExtendedStudent[] = legacyStudents.map((student: any) => ({
            ...student,
            iepData: student.iepData || {
              goals: [],
              dataCollection: []
            }
          }));
          setStudents(extendedStudents);
        } else {
          // Initialize with default students
          initializeDefaultStudents();
        }
      }
    } catch (error) {
      console.error('Error loading student data:', error);
    }
  };

  const initializeDefaultStudents = () => {
    const defaultStudents: ExtendedStudent[] = [
      {
        id: 'student1',
        name: 'Emma Wilson',
        grade: 'Kindergarten',
        photo: undefined,
        dateCreated: new Date().toISOString().split('T')[0],
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
        avoidPartners: [],
        iepData: {
          goals: [],
          dataCollection: []
        }
      },
      {
        id: 'student2',
        name: 'Marcus Johnson',
        grade: '1st Grade',
        photo: undefined,
        dateCreated: new Date().toISOString().split('T')[0],
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
        avoidPartners: [],
        iepData: {
          goals: [],
          dataCollection: []
        }
      },
      {
        id: 'student3',
        name: 'Sofia Rodriguez',
        grade: '2nd Grade',
        photo: undefined,
        dateCreated: new Date().toISOString().split('T')[0],
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
        avoidPartners: [],
        iepData: {
          goals: [],
          dataCollection: []
        }
      }
    ];
    
    setStudents(defaultStudents);
    saveStudentData(defaultStudents);
  };

  const saveStudentData = (studentData: ExtendedStudent[]) => {
    try {
      if (isUsingUnifiedData) {
        // Save to unified data service
        studentData.forEach(student => {
          UnifiedDataService.updateStudent(student.id, student);
        });
      } else {
        // Save to legacy localStorage
        localStorage.setItem('students', JSON.stringify(studentData));
      }
      
      // Dispatch update event
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
    const gradeGroups: { [key: string]: ExtendedStudent[] } = {};
    
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

  const handleEditStudent = (student: ExtendedStudent) => {
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
        alert('Error deleting student. Please try again.');
      }
    }
  };

  const handleSaveStudent = (studentData: Partial<ExtendedStudent>) => {
    try {
      if (editingStudent) {
        // Update existing student
        const updatedStudents = students.map(s => 
          s.id === editingStudent.id 
            ? { ...s, ...studentData }
            : s
        );
        setStudents(updatedStudents);
        saveStudentData(updatedStudents);
      } else {
        // Add new student
        const newStudent: ExtendedStudent = {
          id: Date.now().toString(),
          name: '',
          grade: '',
          dateCreated: new Date().toISOString().split('T')[0],
          iepData: {
            goals: [],
            dataCollection: []
          },
          isActive: true,
          accommodations: [],
          goals: [],
          preferredPartners: [],
          avoidPartners: [],
          ...studentData
        };
        
        const updatedStudents = [...students, newStudent];
        setStudents(updatedStudents);
        saveStudentData(updatedStudents);
      }
      
      setShowModal(false);
      setEditingStudent(null);
    } catch (error) {
      console.error('Error saving student:', error);
      alert('Error saving student. Please try again.');
    }
  };

  // Photo upload functionality
  const uploadPhoto = async (file: File): Promise<PhotoUploadResult> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        resolve({
          success: true,
          photoData: result
        });
      };
      reader.onerror = () => {
        resolve({
          success: false,
          error: 'Failed to read file'
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const validatePhoto = (file: File): boolean => {
    // Max file size: 5MB
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('Photo must be smaller than 5MB');
      return false;
    }
    
    // Allowed file types
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
      return false;
    }
    
    return true;
  };

  const getStudentInitials = (name: string): string => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (!isActive) return null;

  const gradeGroups = getGradeGroups();

  return (
    <div style={{
      height: '100vh',
      overflow: 'auto',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '1rem'
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '2rem',
        color: 'white'
      }}>
        <h1 style={{
          fontSize: '3rem',
          fontWeight: 'bold',
          marginBottom: '0.5rem',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>
          👥 Student Management
        </h1>
        <p style={{
          fontSize: '1.2rem',
          opacity: 0.9,
          marginBottom: '1rem'
        }}>
          Comprehensive student records with IEP integration
        </p>
        
        {/* Data Source Indicator */}
        <div style={{
          display: 'inline-block',
          background: isUsingUnifiedData 
            ? 'rgba(34, 197, 94, 0.2)' 
            : 'rgba(239, 68, 68, 0.2)',
          padding: '8px 16px',
          borderRadius: '20px',
          border: `1px solid ${isUsingUnifiedData ? '#22c55e' : '#ef4444'}`,
          color: isUsingUnifiedData ? '#22c55e' : '#ef4444',
          fontSize: '0.9rem'
        }}>
          {isUsingUnifiedData ? '✅ Unified Data Active' : '⚠️ Legacy Data Mode'}
          <span style={{ marginLeft: '10px' }}>
            {students.length} students loaded
          </span>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto 2rem auto',
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        {/* Search Input */}
        <div style={{
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '12px',
          padding: '0.75rem',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.3)',
          minWidth: '300px'
        }}>
          <input
            type="text"
            placeholder="🔍 Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '1rem',
              outline: 'none'
            }}
          />
        </div>

        {/* Grade Filter */}
        <div style={{
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '12px',
          padding: '0.75rem',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.3)'
        }}>
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '1rem',
              outline: 'none',
              minWidth: '150px'
            }}
          >
            <option value="all" style={{ background: '#667eea', color: 'white' }}>All Grades</option>
            <option value="pre-k" style={{ background: '#667eea', color: 'white' }}>Pre-K</option>
            <option value="kindergarten" style={{ background: '#667eea', color: 'white' }}>Kindergarten</option>
            <option value="1st grade" style={{ background: '#667eea', color: 'white' }}>1st Grade</option>
            <option value="2nd grade" style={{ background: '#667eea', color: 'white' }}>2nd Grade</option>
            <option value="3rd grade" style={{ background: '#667eea', color: 'white' }}>3rd Grade</option>
            <option value="4th grade" style={{ background: '#667eea', color: 'white' }}>4th Grade</option>
            <option value="5th grade" style={{ background: '#667eea', color: 'white' }}>5th Grade</option>
          </select>
        </div>

        {/* Add Student Button */}
        <button
          onClick={handleAddStudent}
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: '12px',
            border: 'none',
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            color: 'white',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(34, 197, 94, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(34, 197, 94, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(34, 197, 94, 0.3)';
          }}
        >
          ➕ Add Student
        </button>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        background: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: '2rem',
        border: '1px solid rgba(255,255,255,0.2)',
        minHeight: '400px'
      }}>
        
        {/* No Students / Empty State */}
        {filteredStudents.length === 0 ? (
          <div style={{
            textAlign: 'center',
            color: 'white',
            padding: '3rem'
          }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>
              {students.length === 0 
                ? 'No Students Yet' 
                : 'No Students Found'}
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '1.5rem' }}>
              {searchTerm || gradeFilter !== 'all'
                ? 'Try adjusting your search filters.'
                : 'Add your first student to get started.'}
            </p>
            <button
              onClick={handleAddStudent}
              style={{
                padding: '1rem 2rem',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                color: 'white',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              ➕ Add Student
            </button>
          </div>
        ) : (
          /* Students organized by grade */
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
                    isUsingUnifiedData={isUsingUnifiedData}
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
  student: ExtendedStudent;
  onEdit: () => void;
  onDelete: () => void;
  uploadPhoto: (file: File) => Promise<PhotoUploadResult>;
  onPhotoUpdate: () => void;
  isUsingUnifiedData: boolean;
}

const StudentCard: React.FC<StudentCardProps> = ({ 
  student, 
  onEdit, 
  onDelete, 
  uploadPhoto,
  onPhotoUpdate,
  isUsingUnifiedData
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const result = await uploadPhoto(file);
        if (result.success && result.photoData) {
          // Update student photo
          if (isUsingUnifiedData) {
            UnifiedDataService.updateStudent(student.id, { photo: result.photoData });
          } else {
            const students = JSON.parse(localStorage.getItem('students') || '[]');
            const updatedStudents = students.map((s: any) => 
              s.id === student.id ? { ...s, photo: result.photoData } : s
            );
            localStorage.setItem('students', JSON.stringify(updatedStudents));
          }
          onPhotoUpdate();
        }
      } catch (error) {
        console.error('Error uploading photo:', error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const getStudentInitials = (name: string): string => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div style={{
      background: 'rgba(255,255,255,0.1)',
      borderRadius: '16px',
      padding: '1.5rem',
      border: '1px solid rgba(255,255,255,0.2)',
      color: 'white',
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-5px)';
      e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'none';
    }}>
      
      {/* Student Photo/Avatar */}
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          {student.photo ? (
            <img 
              src={student.photo} 
              alt={student.name}
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid rgba(255,255,255,0.3)',
                cursor: 'pointer'
              }}
              onClick={handlePhotoClick}
            />
          ) : (
            <div 
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                fontWeight: 'bold',
                margin: '0 auto',
                border: '3px solid rgba(255,255,255,0.3)',
                cursor: 'pointer'
              }}
              onClick={handlePhotoClick}
            >
              {getStudentInitials(student.name)}
            </div>
          )}
          
          {isUploading && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.7)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '0.8rem'
            }}>
              Uploading...
            </div>
          )}
        </div>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handlePhotoChange}
          accept="image/*"
          style={{ display: 'none' }}
        />
      </div>

      {/* Student Info */}
      <div style={{ textAlign: 'center' }}>
        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.3rem' }}>
          {student.name}
        </h3>
        <p style={{ margin: '0 0 1rem 0', opacity: 0.8 }}>
          {student.grade}
        </p>
        
        {/* Status Badge */}
        <div style={{
          display: 'inline-block',
          padding: '0.25rem 0.75rem',
          borderRadius: '12px',
          background: student.isActive ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)',
          border: `1px solid ${student.isActive ? '#22c55e' : '#ef4444'}`,
          fontSize: '0.8rem',
          marginBottom: '1rem'
        }}>
          {student.isActive ? '✅ Active' : '❌ Inactive'}
        </div>

        {/* Student Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.5rem',
          marginBottom: '1rem',
          padding: '0.75rem',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '8px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
              {student.accommodations?.length || 0}
            </div>
            <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>Accommodations</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
              {isUsingUnifiedData ? student.iepData.goals.length : (student.goals?.length || 0)}
            </div>
            <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>IEP Goals</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
              {isUsingUnifiedData ? student.iepData.dataCollection.length : 0}
            </div>
            <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>Data Points</div>
          </div>
        </div>

        {/* Accommodations Preview */}
        {student.accommodations && student.accommodations.length > 0 && (
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: '0.25rem' }}>
              Key Accommodations:
            </div>
            <div style={{ fontSize: '0.8rem' }}>
              {student.accommodations.slice(0, 2).join(', ')}
              {student.accommodations.length > 2 && ` +${student.accommodations.length - 2} more`}
            </div>
          </div>
        )}

        {/* Contact Info Preview */}
        {student.parentName && (
          <div style={{ marginBottom: '1rem', fontSize: '0.8rem', opacity: 0.8 }}>
            <div>👨‍👩‍👧‍👦 {student.parentName}</div>
            {student.parentPhone && <div>📞 {student.parentPhone}</div>}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: 'none',
              background: 'rgba(59, 130, 246, 0.8)',
              color: 'white',
              cursor: 'pointer',
              fontSize: '0.9rem',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(59, 130, 246, 1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(59, 130, 246, 0.8)';
            }}
          >
            ✏️ Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: 'none',
              background: 'rgba(239, 68, 68, 0.8)',
              color: 'white',
              cursor: 'pointer',
              fontSize: '0.9rem',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.8)';
            }}
          >
            🗑️ Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// Student Modal Component
interface StudentModalProps {
  student: ExtendedStudent | null;
  students: ExtendedStudent[];
  onSave: (studentData: Partial<ExtendedStudent>) => void;
  onCancel: () => void;
  uploadPhoto: (file: File) => Promise<PhotoUploadResult>;
  validatePhoto: (file: File) => boolean;
}

const StudentModal: React.FC<StudentModalProps> = ({
  student,
  students,
  onSave,
  onCancel,
  uploadPhoto,
  validatePhoto
}) => {
  const [formData, setFormData] = useState<Partial<ExtendedStudent>>({
    name: '',
    grade: '',
    photo: '',
    workingStyle: 'collaborative',
    accommodations: [],
    goals: [],
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    isActive: true,
    behaviorNotes: '',
    medicalNotes: '',
    resourceInfo: {
      attendsResource: false,
      resourceType: '',
      resourceTeacher: '',
      timeframe: ''
    },
    preferredPartners: [],
    avoidPartners: []
  });

  const [currentTab, setCurrentTab] = useState<'basic' | 'academic' | 'contact' | 'notes'>('basic');
  const [newAccommodation, setNewAccommodation] = useState('');
  const [newGoal, setNewGoal] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (student) {
      setFormData({
        ...student,
        accommodations: student.accommodations || [],
        goals: student.goals || [],
        preferredPartners: student.preferredPartners || [],
        avoidPartners: student.avoidPartners || []
      });
    } else {
      // Reset form for new student
      setFormData({
        name: '',
        grade: '',
        photo: '',
        workingStyle: 'collaborative',
        accommodations: [],
        goals: [],
        parentName: '',
        parentEmail: '',
        parentPhone: '',
        isActive: true,
        behaviorNotes: '',
        medicalNotes: '',
        resourceInfo: {
          attendsResource: false,
          resourceType: '',
          resourceTeacher: '',
          timeframe: ''
        },
        preferredPartners: [],
        avoidPartners: []
      });
    }
  }, [student]);

  const handleSave = () => {
    if (!formData.name || !formData.grade) {
      alert('Please fill in required fields (Name and Grade)');
      return;
    }
    onSave(formData);
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && validatePhoto(file)) {
      setIsUploading(true);
      try {
        const result = await uploadPhoto(file);
        if (result.success && result.photoData) {
          setFormData(prev => ({ ...prev, photo: result.photoData }));
        }
      } catch (error) {
        console.error('Error uploading photo:', error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const addAccommodation = () => {
    if (newAccommodation.trim()) {
      setFormData(prev => ({
        ...prev,
        accommodations: [...(prev.accommodations || []), newAccommodation.trim()]
      }));
      setNewAccommodation('');
    }
  };

  const removeAccommodation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      accommodations: prev.accommodations?.filter((_, i) => i !== index) || []
    }));
  };

  const addGoal = () => {
    if (newGoal.trim()) {
      setFormData(prev => ({
        ...prev,
        goals: [...(prev.goals || []), newGoal.trim()]
      }));
      setNewGoal('');
    }
  };

  const removeGoal = (index: number) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals?.filter((_, i) => i !== index) || []
    }));
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '800px',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid #e5e7eb',
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          color: 'white',
          borderRadius: '16px 16px 0 0'
        }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem' }}>
            {student ? `Edit ${student.name}` : 'Add New Student'}
          </h2>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #e5e7eb',
          background: '#f8f9fa'
        }}>
          {[
            { id: 'basic', label: '👤 Basic Info', icon: '👤' },
            { id: 'academic', label: '🎯 Academic', icon: '🎯' },
            { id: 'contact', label: '📞 Contact', icon: '📞' },
            { id: 'notes', label: '📝 Notes', icon: '📝' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id as any)}
              style={{
                flex: 1,
                padding: '1rem',
                border: 'none',
                background: currentTab === tab.id ? 'white' : 'transparent',
                color: currentTab === tab.id ? '#667eea' : '#6b7280',
                borderBottom: currentTab === tab.id ? '2px solid #667eea' : 'none',
                cursor: 'pointer',
                fontWeight: currentTab === tab.id ? 'bold' : 'normal',
                transition: 'all 0.3s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ padding: '1.5rem' }}>
          {currentTab === 'basic' && (
            <div>
              {/* Photo Upload */}
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  {formData.photo ? (
                    <img 
                      src={formData.photo} 
                      alt="Student"
                      style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '4px solid #e5e7eb'
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '120px',
                      height: '120px',
                      borderRadius: '50%',
                      background: '#f3f4f6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '3rem',
                      color: '#9ca3af',
                      border: '4px solid #e5e7eb'
                    }}>
                      👤
                    </div>
                  )}
                  
                  {isUploading && (
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'rgba(0,0,0,0.7)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '0.9rem'
                    }}>
                      Uploading...
                    </div>
                  )}
                </div>
                
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  style={{ marginTop: '1rem' }}
                />
              </div>

              {/* Basic Fields */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Student Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: '2px solid #e5e7eb',
                      fontSize: '1rem'
                    }}
                    placeholder="Enter student's full name"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Grade Level *
                  </label>
                  <select
                    value={formData.grade || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, grade: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: '2px solid #e5e7eb',
                      fontSize: '1rem'
                    }}
                  >
                    <option value="">Select Grade</option>
                    <option value="Pre-K">Pre-K</option>
                    <option value="Kindergarten">Kindergarten</option>
                    <option value="1st Grade">1st Grade</option>
                    <option value="2nd Grade">2nd Grade</option>
                    <option value="3rd Grade">3rd Grade</option>
                    <option value="4th Grade">4th Grade</option>
                    <option value="5th Grade">5th Grade</option>
                  </select>
                </div>
              </div>

              <div style={{ marginTop: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Working Style
                </label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  {['collaborative', 'independent'].map(style => (
                    <label key={style} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input
                        type="radio"
                        name="workingStyle"
                        value={style}
                        checked={formData.workingStyle === style}
                        onChange={(e) => setFormData(prev => ({ ...prev, workingStyle: e.target.value as any }))}
                      />
                      <span style={{ textTransform: 'capitalize' }}>{style}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={formData.isActive || false}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  />
                  <span style={{ fontWeight: 'bold' }}>Active Student</span>
                </label>
              </div>
            </div>
          )}

          {currentTab === 'academic' && (
            <div>
              {/* Accommodations */}
              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Accommodations
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                  <input
                    type="text"
                    value={newAccommodation}
                    onChange={(e) => setNewAccommodation(e.target.value)}
                    placeholder="Add accommodation..."
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      borderRadius: '6px',
                      border: '1px solid #d1d5db'
                    }}
                    onKeyPress={(e) => e.key === 'Enter' && addAccommodation()}
                  />
                  <button
                    onClick={addAccommodation}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      border: 'none',
                      background: '#667eea',
                      color: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    Add
                  </button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {formData.accommodations?.map((accommodation, index) => (
                    <span
                      key={index}
                      style={{
                        padding: '0.25rem 0.75rem',
                        background: '#e0e7ff',
                        color: '#3730a3',
                        borderRadius: '16px',
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      {accommodation}
                      <button
                        onClick={() => removeAccommodation(index)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ef4444',
                          cursor: 'pointer',
                          padding: 0,
                          fontSize: '1rem'
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Goals */}
              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  IEP Goals (Legacy)
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                  <input
                    type="text"
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                    placeholder="Add IEP goal..."
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      borderRadius: '6px',
                      border: '1px solid #d1d5db'
                    }}
                    onKeyPress={(e) => e.key === 'Enter' && addGoal()}
                  />
                  <button
                    onClick={addGoal}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      border: 'none',
                      background: '#22c55e',
                      color: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    Add
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {formData.goals?.map((goal, index) => (
                    <div
                      key={index}
                      style={{
                        padding: '0.75rem',
                        background: '#f0fdf4',
                        border: '1px solid #bbf7d0',
                        borderRadius: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <span style={{ flex: 1 }}>{goal}</span>
                      <button
                        onClick={() => removeGoal(index)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ef4444',
                          cursor: 'pointer',
                          padding: '0.25rem',
                          fontSize: '1.2rem'
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resource Services */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Resource Services
                </label>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="checkbox"
                      checked={formData.resourceInfo?.attendsResource || false}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        resourceInfo: {
                          ...prev.resourceInfo,
                          attendsResource: e.target.checked,
                          resourceType: '',
                          resourceTeacher: '',
                          timeframe: ''
                        }
                      }))}
                    />
                    <span>Receives Resource Services</span>
                  </label>
                </div>

                {formData.resourceInfo?.attendsResource && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginLeft: '1.5rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                        Service Type
                      </label>
                      <input
                        type="text"
                        value={formData.resourceInfo?.resourceType || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          resourceInfo: { ...prev.resourceInfo!, resourceType: e.target.value }
                        }))}
                        placeholder="e.g., Speech Therapy"
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          borderRadius: '6px',
                          border: '1px solid #d1d5db',
                          fontSize: '0.9rem'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                        Teacher/Therapist
                      </label>
                      <input
                        type="text"
                        value={formData.resourceInfo?.resourceTeacher || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          resourceInfo: { ...prev.resourceInfo!, resourceTeacher: e.target.value }
                        }))}
                        placeholder="e.g., Ms. Smith"
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          borderRadius: '6px',
                          border: '1px solid #d1d5db',
                          fontSize: '0.9rem'
                        }}
                      />
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                        Schedule/Timeframe
                      </label>
                      <input
                        type="text"
                        value={formData.resourceInfo?.timeframe || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          resourceInfo: { ...prev.resourceInfo!, timeframe: e.target.value }
                        }))}
                        placeholder="e.g., 10:00-10:30 AM, Tuesdays & Thursdays"
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          borderRadius: '6px',
                          border: '1px solid #d1d5db',
                          fontSize: '0.9rem'
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {currentTab === 'contact' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Parent/Guardian Name
                </label>
                <input
                  type="text"
                  value={formData.parentName || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, parentName: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '2px solid #e5e7eb',
                    fontSize: '1rem'
                  }}
                  placeholder="Enter parent/guardian name"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.parentEmail || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, parentEmail: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '2px solid #e5e7eb',
                    fontSize: '1rem'
                  }}
                  placeholder="parent@email.com"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.parentPhone || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, parentPhone: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '2px solid #e5e7eb',
                    fontSize: '1rem'
                  }}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
          )}

          {currentTab === 'notes' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Behavior Notes
                </label>
                <textarea
                  value={formData.behaviorNotes || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, behaviorNotes: e.target.value }))}
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '2px solid #e5e7eb',
                    fontSize: '1rem',
                    resize: 'vertical'
                  }}
                  placeholder="Notes about behavior patterns, triggers, successful strategies..."
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Medical Notes
                </label>
                <textarea
                  value={formData.medicalNotes || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, medicalNotes: e.target.value }))}
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '2px solid #e5e7eb',
                    fontSize: '1rem',
                    resize: 'vertical'
                  }}
                  placeholder="Medical conditions, medications, allergies, emergency information..."
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '1.5rem',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          gap: '1rem',
          justifyContent: 'flex-end',
          background: '#f8f9fa',
          borderRadius: '0 0 16px 16px'
        }}>
          <button
            onClick={onCancel}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              border: '2px solid #e5e7eb',
              background: 'white',
              color: '#374151',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!formData.name || !formData.grade}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              border: 'none',
              background: formData.name && formData.grade 
                ? 'linear-gradient(135deg, #667eea, #764ba2)' 
                : '#d1d5db',
              color: 'white',
              cursor: formData.name && formData.grade ? 'pointer' : 'not-allowed',
              fontSize: '1rem',
              fontWeight: 'bold'
            }}
          >
            {student ? 'Update Student' : 'Add Student'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentManagement;