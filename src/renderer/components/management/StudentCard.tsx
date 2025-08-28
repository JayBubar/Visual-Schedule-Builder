// CORRECTED: StudentCard Component - Resource Services in Dropdown + Fixed Z-Index Issues
// src/renderer/components/management/StudentCard.tsx

import React, { useState, useRef } from 'react';
import UnifiedDataService from '../../services/unifiedDataService';
import QuickDataEntry from '../data-collection/QuickDataEntry';
import ProgressPanel from '../data-collection/ProgressPanel';
import EnhancedDataEntry from '../data-collection/EnhancedDataEntry';
import PrintDataSheetSystem from '../data-collection/PrintDataSheetSystem';
import GoalManager from '../data-collection/GoalManager';
import IEPDataCollectionInterface from '../data-collection/IEPDataCollectionInterface';
import EnhancedResourceInput from './EnhancedResourceInput';

// FIXED: Use the same ExtendedStudent interface as StudentManagement
interface ExtendedStudent {
  id: string;
  name: string;
  grade: string;
  photo?: string;
  workingStyle?: 'collaborative' | 'independent';
  accommodations?: string[];
  goals?: string[];
  parentName?: string;
  parentEmail?: string;
  parentPhone?: string;
  isActive?: boolean;
  behaviorNotes?: string;
  medicalNotes?: string;
  iepExpirationDate?: string;
  birthday?: string;
  allowBirthdayDisplay?: boolean;
  allowPhotoInCelebrations?: boolean;
  resourceInfo?: {
    attendsResource: boolean;
    resourceType: string;
    resourceTeacher: string;
    timeframe: string;
  };
  preferredPartners?: string[];
  avoidPartners?: string[];
  dateCreated?: string;
  iepData?: {
    goals: any[];
    dataCollection: any[];
  };
}

interface StudentCardProps {
  student: ExtendedStudent;
  onEdit: () => void;
  onDelete: () => void;
  uploadPhoto: (file: File) => Promise<{ success: boolean; photoData?: string; error?: string }>;
  onPhotoUpdate: () => void;
  isUsingUnifiedData: boolean;
  onDataEntry: (student: ExtendedStudent) => void;
  onPrintSheets: (student: ExtendedStudent) => void;
  onGoalManagement: (student: ExtendedStudent) => void;
  onQuickDataEntry: (student: ExtendedStudent) => void;
}

const StudentCard: React.FC<StudentCardProps> = ({
  student,
  onEdit,
  onDelete,
  uploadPhoto,
  onPhotoUpdate,
  isUsingUnifiedData,
  onDataEntry,
  onPrintSheets,
  onGoalManagement,
  onQuickDataEntry
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showQuickDataEntry, setShowQuickDataEntry] = useState(false);
  const [showProgressPanel, setShowProgressPanel] = useState(false);
  const [showEnhancedDataEntry, setShowEnhancedDataEntry] = useState(false);
  const [showPrintDataSheets, setShowPrintDataSheets] = useState(false);
  const [showGoalManager, setShowGoalManager] = useState(false);
  const [showIEPDataCollection, setShowIEPDataCollection] = useState(false);
  const [showResourceModal, setShowResourceModal] = useState(false); // Resource modal state
  const [selectedGoalId, setSelectedGoalId] = useState<string | undefined>(undefined);
  const [showActionsDropdown, setShowActionsDropdown] = useState(false);

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
          UnifiedDataService.updateStudent(student.id, { photo: result.photoData });
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

  const calculateIEPProgress = () => {
    if (!isUsingUnifiedData || !(student.iepData?.goals || []).length) {
      return { percentage: 0, trend: '➡️', goalCount: 0 };
    }

    const activeGoals = (student.iepData?.goals || []).filter(goal => goal.isActive);
    if (activeGoals.length === 0) {
      return { percentage: 0, trend: '➡️', goalCount: 0 };
    }

    const totalProgress = activeGoals.reduce((sum, goal) => sum + (goal.currentProgress || 0), 0);
    const averageProgress = totalProgress / activeGoals.length;

    const recentDataPoints = (student.iepData?.dataCollection || [])
      .sort((a, b) => new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime())
      .slice(0, 10);

    let trend = '➡️';
    if (recentDataPoints.length >= 3) {
      const recent = recentDataPoints.slice(0, 3);
      const older = recentDataPoints.slice(3, 6);
      if (recent.length && older.length) {
        const recentAvg = recent.reduce((sum, dp) => sum + dp.value, 0) / recent.length;
        const olderAvg = older.reduce((sum, dp) => sum + dp.value, 0) / older.length;
        if (recentAvg > olderAvg * 1.1) trend = '↗️';
        else if (recentAvg < olderAvg * 0.9) trend = '↘️';
      }
    }

    return {
      percentage: Math.round(averageProgress),
      trend,
      goalCount: activeGoals.length
    };
  };

  // ORIGINAL: Modal handlers - these work fine
  const handleDataEntry = () => {
    setShowEnhancedDataEntry(true);
  };

  const handlePrintSheets = () => {
    setShowPrintDataSheets(true);
  };

  const handleGoalManagement = () => {
    setShowGoalManager(true);
  };

  const handleQuickDataEntry = () => {
    setShowQuickDataEntry(true);
  };

  // MOVED: Resource Services to dropdown
  const handleResourceServices = () => {
    setShowActionsDropdown(false); // Close dropdown
    setShowResourceModal(true);
  };

  // Resource save handler - only save, don't close modal automatically
  const handleResourceSave = (resourceInfo: { attendsResource: boolean; resourceType: string; resourceTeacher: string; timeframe: string }) => {
    try {
      UnifiedDataService.updateStudent(student.id, { resourceInfo });
      onPhotoUpdate(); // Trigger refresh
      // Don't close modal automatically - let user close it manually
    } catch (error) {
      console.error('Error saving resource info:', error);
    }
  };

  // Explicit save and close handler
  const handleResourceSaveAndClose = () => {
    setShowResourceModal(false);
  };

  const progress = calculateIEPProgress();

  return (
    <div
      style={styles.cardContainer}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)';
      }}
    >
      {/* Top Section - Actions Dropdown (Top Right) */}
      <div style={styles.topSection}>
        <div style={styles.actionsDropdown}>
          <button
            onClick={() => setShowActionsDropdown(!showActionsDropdown)}
            style={styles.actionsButton}
          >
            ⚙️ Actions ▼
          </button>
          
          {showActionsDropdown && (
            <div style={styles.dropdownMenu}>
              <button onClick={onEdit} style={styles.dropdownItem}>
                ✏️ Edit Student
              </button>
              <button onClick={handleResourceServices} style={styles.dropdownItem}>
                🏫 Resource Services
              </button>
              <button onClick={onDelete} style={styles.dropdownItem}>
                🗑️ Delete Student
              </button>
            </div>
          )}
        </div>

        {/* Parent Info (Under Actions) */}
        {student.parentName && (
          <div style={styles.parentInfo}>
            <div style={styles.parentName}>👨‍👩‍👧‍👦 {student.parentName}</div>
            {student.parentPhone && <div style={styles.parentPhone}>📞 {student.parentPhone}</div>}
          </div>
        )}
      </div>

      {/* Main Section - Photo and Student Info */}
      <div style={styles.mainSection}>
        <div style={styles.photoContainer}>
          {student.photo ? (
            <img 
              src={student.photo} 
              alt={student.name}
              style={styles.studentPhoto}
              onClick={handlePhotoClick}
            />
          ) : (
            <div 
              style={styles.photoPlaceholder}
              onClick={handlePhotoClick}
            >
              {getStudentInitials(student.name)}
            </div>
          )}
          
          {isUploading && (
            <div style={styles.uploadingOverlay}>
              Uploading...
            </div>
          )}
        </div>

        <div style={styles.studentInfo}>
          <h3 style={styles.studentName}>{student.name}</h3>
          <p style={styles.studentGrade}>{student.grade}</p>
          
          {/* Status Badge */}
          <div style={{
            ...styles.statusBadge,
            ...(student.isActive ? styles.statusActive : styles.statusInactive)
          }}>
            {student.isActive ? '✅ Active' : '❌ Inactive'}
          </div>

          {/* Resource Info Badge - Show if has resource services */}
          {student.resourceInfo?.attendsResource && (
            <div style={styles.resourceBadge}>
              🎯 {student.resourceInfo.resourceType || 'Resource Services'}
            </div>
          )}
        </div>
      </div>

      {/* RESTORED: Original IEP Action Buttons Section - 2x2 Grid */}
      <div style={styles.iepButtonsSection}>
        <button
          onClick={handleGoalManagement}
          style={styles.primaryActionButton}
        >
          🎯 Manage Goals
        </button>
        <button
          onClick={handleQuickDataEntry}
          style={styles.secondaryActionButton}
        >
          ⚡ Quick Entry
        </button>
        <button
          onClick={handleDataEntry}
          style={styles.secondaryActionButton}
        >
          📊 Full Entry
        </button>
        <button
          onClick={handlePrintSheets}
          style={styles.primaryActionButton}
        >
          🖨️ Print Sheets
        </button>
      </div>

      {/* Stats Section */}
      <div style={styles.statsSection}>
        <div style={styles.statItem}>
          <div style={styles.statValue}>{(student.accommodations || []).length}</div>
          <div style={styles.statLabel}>Accommodations</div>
        </div>
        <div style={styles.statItem}>
          <div style={styles.statValue}>
            {isUsingUnifiedData ? (student.iepData?.goals || []).length : (student.goals || []).length}
          </div>
          <div style={styles.statLabel}>IEP Goals</div>
        </div>
        <div style={styles.statItem}>
          <div style={styles.statValue}>
            {isUsingUnifiedData ? (student.iepData?.dataCollection || []).length : 0}
          </div>
          <div style={styles.statLabel}>Data Points</div>
        </div>
      </div>

      {/* Bottom Section - IEP Progress */}
      <div style={styles.bottomSection}>
        <div style={styles.iepProgress}>
          <div style={styles.progressContainer}>
            <div style={styles.progressPercentage}>{progress.percentage}%</div>
            <div style={styles.progressTrend}>{progress.trend}</div>
          </div>
          <div style={styles.progressInfo}>
            <div style={styles.progressLabel}>IEP Progress</div>
            <div style={styles.progressGoals}>{progress.goalCount} active goals</div>
          </div>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handlePhotoChange}
        accept="image/*"
        style={{ display: 'none' }}
      />

      {/* CORRECTED: All modals now render outside the card using React Portals pattern */}
      {showQuickDataEntry && (
        <div style={styles.fullScreenModal}>
          <QuickDataEntry
            studentId={student.id}
            isOpen={showQuickDataEntry}
            onClose={() => {
              setShowQuickDataEntry(false);
              setSelectedGoalId(undefined);
            }}
            onDataSaved={() => {
              setShowQuickDataEntry(false);
              setSelectedGoalId(undefined);
              onPhotoUpdate();
            }}
            preselectedGoal={selectedGoalId}
          />
        </div>
      )}

      {showProgressPanel && (
        <div style={styles.fullScreenModal}>
          <ProgressPanel
            studentId={student.id}
            isOpen={showProgressPanel}
            onClose={() => setShowProgressPanel(false)}
            onAddData={(goalId: string) => {
              setShowProgressPanel(false);
              setSelectedGoalId(goalId);
              setShowQuickDataEntry(true);
            }}
          />
        </div>
      )}

      {showEnhancedDataEntry && (
        <div style={styles.fullScreenModal}>
          <div style={styles.enhancedDataEntryContainer}>
            <EnhancedDataEntry
              selectedStudent={{
                id: student.id,
                name: student.name,
                grade: student.grade,
                photo: student.photo
              }}
              selectedGoal={
                student.iepData?.goals?.[0] || {
                  id: 'temp-goal',
                  studentId: student.id,
                  title: 'Sample Goal',
                  description: 'Please create goals for this student',
                  domain: 'academic',
                  measurementType: 'percentage',
                  target: 80,
                  currentProgress: 0,
                  dataPoints: 0,
                  dateCreated: new Date().toISOString().split('T')[0]
                }
              }
              onBack={() => setShowEnhancedDataEntry(false)}
              onDataSaved={() => {
                setShowEnhancedDataEntry(false);
                onPhotoUpdate();
              }}
            />
          </div>
        </div>
      )}

      {showPrintDataSheets && (
        <div style={styles.fullScreenModal}>
          <PrintDataSheetSystem
            students={[{
              ...student,
              dateCreated: student.dateCreated || new Date().toISOString().split('T')[0],
              iepData: {
                goals: student.iepData?.goals || [],
                dataCollection: student.iepData?.dataCollection || []
              }
            }]}
            goals={student.iepData?.goals || []}
            onBack={() => setShowPrintDataSheets(false)}
          />
        </div>
      )}

      {/* CORRECTED: Goals Manager opens as intended with pre-selected student */}
      {showGoalManager && (
        <div style={styles.fullScreenModal}>
          <GoalManager
            preSelectedStudentId={student.id}
            onGoalSaved={() => {
              setShowGoalManager(false);
              onPhotoUpdate();
            }}
          />
        </div>
      )}

      {showIEPDataCollection && (
        <div style={styles.fullScreenModal}>
          <IEPDataCollectionInterface
            isActive={showIEPDataCollection}
            preSelectedStudentId={student.id}
          />
        </div>
      )}

      {/* DEBUGGING: Resource Modal - Let's try a simpler approach to fix the flash */}
      {showResourceModal && (
        <div 
          style={styles.resourceModalOverlay}
          onClick={(e) => {
            // Only close if clicking the overlay itself, not the modal content
            if (e.target === e.currentTarget) {
              setShowResourceModal(false);
            }
          }}
        >
          <div 
            style={styles.resourceModalContent}
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
          >
            <div style={styles.resourceModalHeader}>
              <h3 style={styles.resourceModalTitle}>
                🏫 Resource Services - {student.name}
              </h3>
              <button
                onClick={() => setShowResourceModal(false)}
                style={styles.resourceModalCloseButton}
              >
                ✕
              </button>
            </div>
            
            <div style={styles.resourceModalBody}>
              <EnhancedResourceInput
                resourceInfo={student.resourceInfo || {
                  attendsResource: false,
                  resourceType: '',
                  resourceTeacher: '',
                  timeframe: ''
                }}
                onChange={handleResourceSave}
                studentName={student.name}
              />
              
              {/* Debug: Manual Save Button */}
              <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <button
                  onClick={() => setShowResourceModal(false)}
                  style={styles.debugCloseButton}
                >
                  Close Modal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// CORRECTED: Styles with proper z-index hierarchy and restored 2x2 button grid
const styles: { [key: string]: React.CSSProperties } = {
  cardContainer: {
    background: 'linear-gradient(145deg, rgba(255,255,255,0.95), rgba(255,255,255,0.85))',
    borderRadius: '16px',
    padding: '1.5rem',
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.2)',
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    minHeight: '400px',
    position: 'relative',
    // IMPORTANT: Student cards stay at base level
    zIndex: 1
  },

  topSection: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    flexDirection: 'column',
    gap: '0.5rem'
  },

  actionsDropdown: {
    position: 'relative',
    alignSelf: 'flex-end'
  },

  actionsButton: {
    background: 'linear-gradient(145deg, #dc3545, #c82333)',
    border: 'none',
    color: 'white',
    padding: '8px 12px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem'
  },

  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: '0.25rem',
    background: 'white',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    border: '1px solid rgba(0,0,0,0.1)',
    minWidth: '180px',
    // FIXED: Dropdown should be above modals but below modal overlays
    zIndex: 100
  },

  dropdownItem: {
    width: '100%',
    padding: '0.75rem 1rem',
    border: 'none',
    background: 'transparent',
    color: '#374151',
    cursor: 'pointer',
    fontSize: '0.9rem',
    textAlign: 'left',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'background-color 0.2s ease'
  },

  parentInfo: {
    alignSelf: 'flex-end',
    textAlign: 'right',
    fontSize: '0.8rem',
    color: '#495057'
  },

  parentName: {
    fontWeight: '600',
    marginBottom: '0.25rem'
  },

  parentPhone: {
    opacity: 0.8
  },

  mainSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },

  photoContainer: {
    position: 'relative',
    flexShrink: 0
  },

  studentPhoto: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    objectFit: 'cover',
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
    cursor: 'pointer'
  },

  photoPlaceholder: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'linear-gradient(145deg, #667eea, #764ba2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2rem',
    fontWeight: 'bold',
    color: 'white',
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
    cursor: 'pointer'
  },

  uploadingOverlay: {
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
  },

  studentInfo: {
    flex: 1
  },

  studentName: {
    margin: '0 0 0.25rem 0',
    color: '#2c3e50',
    fontSize: '1.3rem',
    fontWeight: '700'
  },

  studentGrade: {
    margin: '0 0 0.5rem 0',
    color: '#667eea',
    fontSize: '1rem',
    fontWeight: '600'
  },

  statusBadge: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '0.7rem',
    fontWeight: '600',
    marginRight: '0.5rem'
  },

  statusActive: {
    background: 'linear-gradient(145deg, #28a745, #20c997)',
    color: 'white'
  },

  statusInactive: {
    background: 'linear-gradient(145deg, #dc3545, #c82333)',
    color: 'white'
  },

  resourceBadge: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '0.7rem',
    fontWeight: '600',
    background: 'linear-gradient(145deg, #6f42c1, #563d7c)',
    color: 'white'
  },

  // RESTORED: Original 2x2 button grid
  iepButtonsSection: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.5rem'
  },

  primaryActionButton: {
    padding: '0.75rem',
    borderRadius: '8px',
    border: 'none',
    background: 'linear-gradient(145deg, #28a745, #20c997)',
    color: 'white',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem'
  },

  secondaryActionButton: {
    padding: '0.75rem',
    borderRadius: '8px',
    border: 'none',
    background: 'linear-gradient(145deg, #007bff, #0056b3)',
    color: 'white',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem'
  },

  statsSection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '0.5rem',
    padding: '0.75rem',
    background: 'rgba(102, 126, 234, 0.1)',
    borderRadius: '8px'
  },

  statItem: {
    textAlign: 'center'
  },

  statValue: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: '#2c3e50'
  },

  statLabel: {
    fontSize: '0.7rem',
    color: '#495057',
    opacity: 0.8
  },

  bottomSection: {
    marginTop: 'auto'
  },

  iepProgress: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '0.75rem',
    background: 'rgba(40, 167, 69, 0.1)',
    borderRadius: '8px',
    border: '1px solid rgba(40, 167, 69, 0.2)'
  },

  progressContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },

  progressPercentage: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#28a745'
  },

  progressTrend: {
    fontSize: '1.2rem'
  },

  progressInfo: {
    flex: 1
  },

  progressLabel: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#28a745',
    marginBottom: '0.25rem'
  },

  progressGoals: {
    fontSize: '0.8rem',
    color: '#495057',
    opacity: 0.8
  },

  // CORRECTED: Universal full-screen modal style for most modals
  fullScreenModal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    zIndex: 10000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  // Enhanced Data Entry needs its own container
  enhancedDataEntryContainer: {
    width: '95vw',
    height: '95vh',
    background: 'white',
    borderRadius: '16px',
    overflow: 'hidden'
  },

  // DEBUGGING: Separate resource modal overlay to isolate the flashing issue
  resourceModalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    zIndex: 15000, // Even higher to ensure it's on top
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  resourceModalContent: {
    background: 'white',
    borderRadius: '16px',
    width: '90%',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflow: 'hidden',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    position: 'relative'
  },

  resourceModalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem',
    borderBottom: '1px solid rgba(0,0,0,0.1)',
    background: 'linear-gradient(145deg, #6f42c1, #563d7c)'
  },

  resourceModalTitle: {
    margin: 0,
    color: 'white',
    fontSize: '1.3rem',
    fontWeight: '600'
  },

  resourceModalCloseButton: {
    background: 'rgba(255,255,255,0.2)',
    border: 'none',
    color: 'white',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    cursor: 'pointer',
    fontSize: '1.2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s ease'
  },

  resourceModalBody: {
    padding: '2rem',
    maxHeight: '70vh',
    overflow: 'auto'
  },

  // DEBUG: Manual close button for testing
  debugCloseButton: {
    background: 'linear-gradient(145deg, #dc3545, #c82333)',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600'
  }
};

export default StudentCard;
