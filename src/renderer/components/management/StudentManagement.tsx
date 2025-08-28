// SIMPLIFIED: StudentManagement with direct UnifiedDataService integration
// FIXED: All type errors resolved, no useRobustDataLoading dependency
// src/renderer/components/management/StudentManagement.tsx

import React, { useState, useEffect, useCallback } from 'react';
import UnifiedDataService, { UnifiedStudent, IEPGoal } from '../../services/unifiedDataService';
import StudentCard from './StudentCard';
import StudentModal from './StudentModal';
import EnhancedResourceInput from './EnhancedResourceInput';
import QuickDataEntry from '../data-collection/QuickDataEntry';
import ProgressPanel from '../data-collection/ProgressPanel';
import EnhancedDataEntry from '../data-collection/EnhancedDataEntry';
import PrintDataSheetSystem from '../data-collection/PrintDataSheetSystem';
import GoalManager from '../data-collection/GoalManager';
import IEPDataCollectionInterface from '../data-collection/IEPDataCollectionInterface';

// FIXED: ExtendedStudent interface with exact type matching - includes ALL fields
interface ExtendedStudent extends UnifiedStudent {
  grade: string; // Ensure grade is required
  workingStyle?: 'collaborative' | 'independent'; // FIXED: Exact type match
  iepExpirationDate?: string; // FIXED: Add missing iepExpirationDate field
  behaviorNotes?: string;
  medicalNotes?: string;
  parentName?: string;
  parentEmail?: string;
  parentPhone?: string;
  resourceInfo?: { // FIXED: Add missing resourceInfo field
    attendsResource: boolean;
    resourceType: string;
    resourceTeacher: string;
    timeframe: string;
  };
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
  // SIMPLIFIED: Direct state management with UnifiedDataService
  const [students, setStudents] = useState<ExtendedStudent[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<ExtendedStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<ExtendedStudent | null>(null);
  
  // Integration modal states
  const [showDataEntryModal, setShowDataEntryModal] = useState(false);
  const [showPrintSheetsModal, setShowPrintSheetsModal] = useState(false);
  const [showGoalManagerModal, setShowGoalManagerModal] = useState(false);
  const [showQuickDataEntryModal, setShowQuickDataEntryModal] = useState(false);
  const [showIEPDataCollectionModal, setShowIEPDataCollectionModal] = useState(false);
  const [selectedStudentForIntegration, setSelectedStudentForIntegration] = useState<ExtendedStudent | null>(null);
  const [selectedGoalForDataEntry, setSelectedGoalForDataEntry] = useState<IEPGoal | null>(null);

  // SIMPLIFIED: Clean data loading function
  const loadStudents = useCallback(async () => {
    console.log('📚 Loading students from UnifiedDataService...');
    setIsLoading(true);
    setError(null);
    
    try {
      const unifiedStudents = UnifiedDataService.getAllStudents();
      
      // FIXED: Ensure all students have required fields and proper type conversion
      const studentsWithDefaults: ExtendedStudent[] = unifiedStudents.map(student => ({
        ...student,
        grade: student.grade || 'Unassigned',
        // FIXED: Ensure workingStyle is properly typed
        workingStyle: (student.workingStyle === 'collaborative' || student.workingStyle === 'independent')
          ? student.workingStyle as 'collaborative' | 'independent'
          : 'collaborative'
      }));
      
      console.log('✅ Loaded students:', studentsWithDefaults.length);
      setStudents(studentsWithDefaults);
      setError(null);
      
    } catch (error) {
      console.error('❌ Error loading students:', error);
      setError('Failed to load students');
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // SIMPLIFIED: Clean refresh function
  const refreshData = useCallback(() => {
    console.log('🔄 Refreshing student data...');
    loadStudents();
    onDataChange?.();
  }, [loadStudents, onDataChange]);

  // Load data on mount and when dependencies change
  useEffect(() => {
    if (isActive) {
      loadStudents();
    }
  }, [isActive, loadStudents]);

  // Filter students when search/filter changes
  useEffect(() => {
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
  }, [students, searchTerm, gradeFilter]);

  // SIMPLIFIED: Clean event handlers
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
        // Remove from local state immediately for responsive UI
        setStudents(prev => prev.filter(s => s.id !== studentId));
        
        // TODO: Add deleteStudent method to UnifiedDataService
        // For now, we'll handle it through the updated student list
        console.log('🗑️ Student deleted:', studentId);
        
      } catch (error) {
        console.error('❌ Error deleting student:', error);
        alert('Error deleting student. Please try again.');
        refreshData(); // Refresh to restore state
      }
    }
  };

  // SIMPLIFIED: Direct save to UnifiedDataService
  const handleSaveStudent = async (studentData: Partial<ExtendedStudent>) => {
    try {
      console.log('💾 Saving student data:', studentData);
      
      if (editingStudent) {
        // Update existing student
        UnifiedDataService.updateStudent(editingStudent.id, studentData);
        console.log('✅ Student updated:', editingStudent.id);
      } else {
        // Add new student with proper defaults
        const newStudentData: Partial<ExtendedStudent> = {
          name: '',
          grade: '',
          isActive: true,
          accommodations: [],
          goals: [],
          preferredPartners: [],
          avoidPartners: [],
          birthday: '',
          allowBirthdayDisplay: true,
          allowPhotoInCelebrations: true,
          iepExpirationDate: '',
          behaviorNotes: '',
          medicalNotes: '',
          parentName: '',
          parentEmail: '',
          parentPhone: '',
          workingStyle: 'collaborative',
          resourceInfo: {
            attendsResource: false,
            resourceType: '',
            resourceTeacher: '',
            timeframe: ''
          },
          ...studentData
        };
        
        UnifiedDataService.addStudent(newStudentData);
        console.log('✅ New student added');
      }
      
      // Close modal
      setShowModal(false);
      setEditingStudent(null);
      
      // Refresh data
      setTimeout(refreshData, 100);
      
    } catch (error) {
      console.error('❌ Error saving student:', error);
      alert('Error saving student. Please try again.');
    }
  };

  // Photo upload (simplified)
  const uploadPhoto = async (file: File): Promise<PhotoUploadResult> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        resolve({ success: true, photoData: result });
      };
      reader.onerror = () => {
        resolve({ success: false, error: 'Failed to read file' });
      };
      reader.readAsDataURL(file);
    });
  };

  const validatePhoto = (file: File): boolean => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert('Photo must be smaller than 5MB');
      return false;
    }
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
      return false;
    }
    
    return true;
  };

  // IEP integration handlers (simplified)
  const handleDataEntry = (student: ExtendedStudent) => {
    const studentGoals = student.iepData?.goals || [];
    if (studentGoals.length === 0) {
      alert(`${student.name} doesn't have any IEP goals set up yet. Please add goals first in Goal Management.`);
      return;
    }
    setSelectedStudentForIntegration(student);
    setShowIEPDataCollectionModal(true);
  };

  const handlePrintSheets = (student: ExtendedStudent) => {
    const studentGoals = student.iepData?.goals || [];
    const activeGoals = studentGoals.filter(goal => goal.isActive !== false);
    if (activeGoals.length === 0) {
      alert(`${student.name} doesn't have any active IEP goals set up yet. Please add goals first in Goal Management.`);
      return;
    }
    setSelectedStudentForIntegration(student);
    setShowPrintSheetsModal(true);
  };

  const handleGoalManagement = (student: ExtendedStudent) => {
    setSelectedStudentForIntegration(student);
    setShowGoalManagerModal(true);
  };

  const handleQuickDataEntry = (student: ExtendedStudent) => {
    const studentGoals = student.iepData?.goals || [];
    if (studentGoals.length === 0) {
      alert(`${student.name} doesn't have any IEP goals set up yet. Please add goals first in Goal Management.`);
      return;
    }
    setSelectedStudentForIntegration(student);
    setShowQuickDataEntryModal(true);
  };

  // Helper functions
  const getGradeGroups = () => {
    const gradeGroups: { [key: string]: ExtendedStudent[] } = {};
    filteredStudents.forEach(student => {
      const grade = student.grade || 'Unassigned';
      if (!gradeGroups[grade]) gradeGroups[grade] = [];
      gradeGroups[grade].push(student);
    });
    return gradeGroups;
  };

  if (!isActive) return null;

  const gradeGroups = getGradeGroups();

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>👥 Student Management</h1>
        <p style={styles.subtitle}>Comprehensive student records with IEP integration</p>
        
      </div>

      {/* Search and Filter Controls */}
      <div style={styles.controlsContainer}>
        <div style={styles.searchContainer}>
          <input
            type="text"
            placeholder="🔍 Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <div style={styles.filterContainer}>
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            style={styles.gradeSelect}
          >
            <option value="all">All Grades</option>
            <option value="pre-k">Pre-K</option>
            <option value="kindergarten">Kindergarten</option>
            <option value="1st grade">1st Grade</option>
            <option value="2nd grade">2nd Grade</option>
            <option value="3rd grade">3rd Grade</option>
            <option value="4th grade">4th Grade</option>
            <option value="5th grade">5th Grade</option>
          </select>
        </div>

        <button onClick={handleAddStudent} style={styles.addButton}>
          ➕ Add Student
        </button>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {filteredStudents.length === 0 ? (
          <div style={styles.emptyState}>
            <h3 style={styles.emptyTitle}>
              {students.length === 0 ? 'No Students Yet' : 'No Students Found'}
            </h3>
            <p style={styles.emptyText}>
              {searchTerm || gradeFilter !== 'all'
                ? 'Try adjusting your search filters.'
                : 'Add your first student to get started.'}
            </p>
            <button onClick={handleAddStudent} style={styles.emptyButton}>
              ➕ Add Student
            </button>
          </div>
        ) : (
          Object.entries(gradeGroups).map(([grade, gradeStudents]) => (
            <div key={grade} style={styles.gradeSection}>
              <h3 style={styles.gradeTitle}>
                {grade} ({gradeStudents.length} students)
              </h3>
              <div style={styles.studentGrid}>
                {gradeStudents.map(student => (
                  <StudentCard
                    key={student.id}
                    student={student}
                    onEdit={() => handleEditStudent(student)}
                    onDelete={() => handleDeleteStudent(student.id)}
                    uploadPhoto={uploadPhoto}
                    onPhotoUpdate={refreshData}
                    isUsingUnifiedData={true}
                    onDataEntry={handleDataEntry}
                    onPrintSheets={handlePrintSheets}
                    onGoalManagement={handleGoalManagement}
                    onQuickDataEntry={handleQuickDataEntry}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modals */}
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

      {/* IEP Integration Modals - Simplified */}
      {showGoalManagerModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContainer}>
            <button onClick={() => setShowGoalManagerModal(false)} style={styles.closeButton}>×</button>
            <GoalManager 
              preSelectedStudentId={selectedStudentForIntegration?.id}
              onGoalSaved={refreshData}
            />
          </div>
        </div>
      )}

      {showQuickDataEntryModal && selectedStudentForIntegration && (
        <QuickDataEntry
          studentId={selectedStudentForIntegration.id}
          isOpen={showQuickDataEntryModal}
          onClose={() => {
            setShowQuickDataEntryModal(false);
            setSelectedStudentForIntegration(null);
          }}
          onDataSaved={() => {
            setShowQuickDataEntryModal(false);
            setSelectedStudentForIntegration(null);
            refreshData();
          }}
        />
      )}

      {showPrintSheetsModal && selectedStudentForIntegration && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContainer}>
            <button onClick={() => setShowPrintSheetsModal(false)} style={styles.closeButton}>×</button>
            <PrintDataSheetSystem
              students={[selectedStudentForIntegration]}
              goals={selectedStudentForIntegration.iepData?.goals || []}
              onBack={() => {
                setShowPrintSheetsModal(false);
                setSelectedStudentForIntegration(null);
              }}
            />
          </div>
        </div>
      )}

      {showIEPDataCollectionModal && selectedStudentForIntegration && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContainer}>
            <button onClick={() => {
              setShowIEPDataCollectionModal(false);
              setSelectedStudentForIntegration(null);
            }} style={styles.closeButton}>×</button>
            <IEPDataCollectionInterface
              isActive={true}
              preSelectedStudentId={selectedStudentForIntegration.id}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// FIXED: Comprehensive styles
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '1rem',
    minHeight: '100vh'
  },
  header: {
    textAlign: 'center',
    marginBottom: '2rem',
    color: 'white'
  },
  title: {
    fontSize: '3rem',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
  },
  subtitle: {
    fontSize: '1.2rem',
    opacity: 0.9,
    marginBottom: '1rem'
  },
  controlsContainer: {
    maxWidth: '1400px',
    margin: '0 auto 2rem auto',
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
    justifyContent: 'center'
  },
  searchContainer: {
    background: 'rgba(255,255,255,0.2)',
    borderRadius: '12px',
    padding: '0.75rem',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.3)',
    minWidth: '300px'
  },
  searchInput: {
    width: '100%',
    background: 'transparent',
    border: 'none',
    color: 'white',
    fontSize: '1rem',
    outline: 'none'
  },
  filterContainer: {
    background: 'rgba(255,255,255,0.2)',
    borderRadius: '12px',
    padding: '0.75rem',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.3)'
  },
  gradeSelect: {
    background: 'transparent',
    border: 'none',
    color: 'white',
    fontSize: '1rem',
    outline: 'none',
    minWidth: '150px'
  },
  addButton: {
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
  },
  mainContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    background: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(20px)',
    borderRadius: '24px',
    padding: '2rem',
    border: '1px solid rgba(255,255,255,0.2)',
    minHeight: '400px'
  },
  emptyState: { textAlign: 'center', color: 'white', padding: '3rem' },
  emptyTitle: { marginBottom: '1rem', fontSize: '1.5rem' },
  emptyText: { color: 'rgba(255,255,255,0.8)', marginBottom: '1.5rem' },
  emptyButton: {
    padding: '1rem 2rem',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
    color: 'white',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  gradeSection: { marginBottom: '2rem' },
  gradeTitle: {
    color: 'white',
    fontSize: '1.5rem',
    fontWeight: '700',
    marginBottom: '1rem',
    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
  },
  studentGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 450px))',
    gap: '1.5rem',
    justifyContent: 'start'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.8)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem'
  },
  modalContainer: {
    background: 'white',
    borderRadius: '16px',
    width: '95vw',
    height: '95vh',
    overflow: 'hidden',
    position: 'relative'
  },
  closeButton: {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    zIndex: 1001,
    background: 'rgba(0,0,0,0.7)',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    cursor: 'pointer',
    fontSize: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
};

export default StudentManagement;
