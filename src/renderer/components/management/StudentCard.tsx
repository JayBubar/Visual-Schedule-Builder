// UPDATED: StudentCard with Resource Services in Admin Dropdown
// Keep workflow buttons prominent, move admin actions to dropdown
// src/renderer/components/management/StudentCard.tsx

import React, { useState, useRef } from 'react';
import UnifiedDataService from '../../services/unifiedDataService';
import QuickDataEntry from '../data-collection/QuickDataEntry';
import ProgressPanel from '../data-collection/ProgressPanel';
import EnhancedResourceInput from './EnhancedResourceInput';

// Same ExtendedStudent interface as before
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
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | undefined>(undefined);

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

  const calculateIEPExpiration = (iepStartDate?: string): string => {
    if (!iepStartDate) return 'Not set';
    const startDate = new Date(iepStartDate);
    const expirationDate = new Date(startDate.setFullYear(startDate.getFullYear() + 1));
    return expirationDate.toLocaleDateString('en-US', { 
      month: 'numeric', 
      day: 'numeric', 
      year: '2-digit' 
    });
  };

  // Workflow button handlers (keep these as direct functions)
  const handleDataEntry = () => onDataEntry(student);
  const handlePrintSheets = () => onPrintSheets(student);
  const handleGoalManagement = () => onGoalManagement(student);
  const handleQuickDataEntry = () => onQuickDataEntry(student);

  // Resource modal handlers
  const handleResourceServices = () => {
    setShowResourceModal(true);
  };

  const handleResourceUpdate = (resourceInfo: any) => {
    console.log('🔄 Updating resource info:', resourceInfo);
    UnifiedDataService.updateStudent(student.id, { resourceInfo });
    onPhotoUpdate(); // Refresh the card data
  };

  const handleResourceModalClose = () => {
    setShowResourceModal(false);
    onPhotoUpdate(); // Refresh in case data was updated
  };

  return (
    <div style={styles.cardContainer}>
      
      {/* Top Left - PRIMARY WORKFLOW BUTTONS (Keep These Prominent!) */}
      <div style={styles.actionsLeft}>
        <div style={styles.actionButtonsColumn}>
          <button
            onClick={handleGoalManagement}
            style={styles.primaryActionButton}
            title="Manage IEP Goals"
          >
            🎯 Manage Goals
          </button>
          <button
            onClick={handleQuickDataEntry}
            style={styles.secondaryActionButton}
            title="Quick Data Entry"
          >
            ⚡ Quick Entry
          </button>
          <button
            onClick={handleDataEntry}
            style={styles.secondaryActionButton}
            title="Full Data Entry"
          >
            📊 Full Entry
          </button>
          <button
            onClick={handlePrintSheets}
            style={styles.primaryActionButton}
            title="Print Data Sheets"
          >
            🖨️ Print Sheets
          </button>
        </div>
      </div>

      {/* Center - Student Info */}
      <div style={styles.studentInfo}>
        {/* Student Photo/Avatar */}
        <div style={styles.photoSection}>
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
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handlePhotoChange}
            accept="image/*"
            style={{ display: 'none' }}
          />
        </div>

        <h3 style={styles.studentName}>{student.name}</h3>
        <p style={styles.studentGrade}>{student.grade}</p>
        
        {/* Status Badge */}
        <div style={{
          ...styles.statusBadge,
          ...(student.isActive ? styles.statusActive : styles.statusInactive)
        }}>
          {student.isActive ? '✅ Active' : '❌ Inactive'}
        </div>

        {/* Resource Services Indicator */}
        {student.resourceInfo?.attendsResource && (
          <div style={styles.resourceIndicator}>
            🏫 {student.resourceInfo.resourceType}
            <br/>
            <small>{student.resourceInfo.timeframe}</small>
          </div>
        )}
      </div>

      {/* Top Right - Progress Graphic */}
      <div style={styles.progressRight}>
        <ProgressGraphic student={student} isUsingUnifiedData={isUsingUnifiedData} />
      </div>

      {/* Content Area - Main Information */}
      <div style={styles.contentArea}>
        <div style={styles.statsGrid}>
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

        {/* Accommodations Preview */}
        {student.accommodations && student.accommodations.length > 0 && (
          <div style={styles.accommodationsPreview}>
            <div style={styles.previewLabel}>Key Accommodations:</div>
            <div style={styles.previewText}>
              {student.accommodations.slice(0, 2).join(', ')}
              {student.accommodations.length > 2 && ` +${student.accommodations.length - 2} more`}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Left - IMPROVED ADMIN DROPDOWN */}
      <div style={styles.adminLeft}>
        <AdminActionsDropdown 
          onEdit={onEdit}
          onDelete={onDelete}
          onResourceServices={handleResourceServices}
          studentId={student.id}
          studentName={student.name}
        />
      </div>

      {/* Bottom Center - Contact Info */}
      <div style={styles.contactInfo}>
        {student.parentName && (
          <div style={styles.contactText}>
            <div>👨‍👩‍👧‍👦 {student.parentName}</div>
            {student.parentPhone && <div>📞 {student.parentPhone}</div>}
          </div>
        )}
      </div>

      {/* Bottom Right - Reference Information */}
      <div style={styles.referenceRight}>
        <div style={styles.referenceContainer}>
          <div style={styles.referenceTitle}>Quick Reference:</div>
          <div style={styles.referenceContent}>
            <div>📋 {student.accommodations?.length || 0} accommodations</div>
            <div>🎯 {isUsingUnifiedData ? (student.iepData?.goals || []).filter(g => g.isActive).length : (student.goals?.length || 0)} active goals</div>
            <div>📊 {isUsingUnifiedData ? (student.iepData?.dataCollection || []).length : 0} data points</div>
            {student.dateCreated && (
              <div>📅 IEP expires: {calculateIEPExpiration(student.dateCreated)}</div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
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

      {/* NEW: Resource Services Modal */}
      {showResourceModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.resourceModal}>
            <div style={styles.resourceModalHeader}>
              <h3 style={styles.resourceModalTitle}>
                🏫 Resource Services - {student.name}
              </h3>
              <button 
                onClick={handleResourceModalClose}
                style={styles.resourceModalClose}
              >
                ×
              </button>
            </div>
            <div style={styles.resourceModalContent}>
              <EnhancedResourceInput
                resourceInfo={student.resourceInfo || {
                  attendsResource: false,
                  resourceType: '',
                  resourceTeacher: '',
                  timeframe: ''
                }}
                onChange={handleResourceUpdate}
                studentName={student.name}
              />
            </div>
            <div style={styles.resourceModalFooter}>
              <button 
                onClick={handleResourceModalClose}
                style={styles.resourceModalSaveButton}
              >
                ✅ Save & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// IMPROVED Admin Actions Dropdown Component
interface AdminActionsDropdownProps {
  onEdit: () => void;
  onDelete: () => void;
  onResourceServices: () => void;
  studentId: string;
  studentName: string;
}

const AdminActionsDropdown: React.FC<AdminActionsDropdownProps> = ({ 
  onEdit, 
  onDelete, 
  onResourceServices, 
  studentId, 
  studentName 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={styles.dropdownContainer}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={styles.actionsButton}
        title="Administrative Actions"
      >
        🔴 Admin ▼
      </button>

      {isOpen && (
        <>
          {/* Backdrop to close dropdown */}
          <div 
            style={styles.dropdownBackdrop}
            onClick={() => setIsOpen(false)}
          />
          
          <div style={styles.dropdownMenu}>
            <button onClick={onEdit} style={styles.dropdownItem}>
              ✏️ Edit Student
            </button>
            
            <div style={styles.dropdownDivider} />
            
            <button onClick={onResourceServices} style={styles.dropdownItem}>
              🏫 Resource Services
            </button>
            
            <div style={styles.dropdownDivider} />
            
            <button 
              onClick={() => {
                if (window.confirm(`Are you sure you want to delete ${studentName}? This cannot be undone.`)) {
                  onDelete();
                }
                setIsOpen(false);
              }} 
              style={styles.dropdownItemDanger}
            >
              🗑️ Delete Student
            </button>
          </div>
        </>
      )}
    </div>
  );
};

// Progress Graphic Component (unchanged)
interface ProgressGraphicProps {
  student: ExtendedStudent;
  isUsingUnifiedData: boolean;
}

const ProgressGraphic: React.FC<ProgressGraphicProps> = ({ student, isUsingUnifiedData }) => {
  const calculateStudentProgress = () => {
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

  const progress = calculateStudentProgress();

  return (
    <div style={styles.progressContainer}>
      <div style={styles.progressPercentage}>{progress.percentage}%</div>
      <div style={styles.progressTrend}>{progress.trend}</div>
      <div style={styles.progressGoals}>{progress.goalCount} goals</div>
    </div>
  );
};

// COMPREHENSIVE STYLES (Updated with new modal and dropdown styles)
const styles: { [key: string]: React.CSSProperties } = {
  cardContainer: {
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '16px',
    border: '1px solid rgba(255,255,255,0.2)',
    color: 'white',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    display: 'grid',
    gridTemplateAreas: `
      "actions-left student-info progress-right"
      "content-area content-area content-area"
      "admin-left contact-info reference-right"
    `,
    gridTemplateColumns: '220px 1fr 220px',
    gridTemplateRows: 'auto 1fr auto',
    gap: '24px',
    padding: '28px',
    minHeight: '320px'
  },
  
  actionsLeft: { gridArea: 'actions-left' },
  actionButtonsColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem'
  },
  
  primaryActionButton: {
    padding: '0.75rem 0.875rem',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, #10b981, #059669)',
    color: 'white',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: 'bold',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    minHeight: '40px',
    whiteSpace: 'nowrap',
    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
  },
  
  secondaryActionButton: {
    padding: '0.6rem 0.75rem',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    color: 'white',
    cursor: 'pointer',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.4rem',
    minHeight: '36px',
    whiteSpace: 'nowrap',
    boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
  },
  
  studentInfo: { gridArea: 'student-info', textAlign: 'center' },
  photoSection: { marginBottom: '1rem' },
  photoContainer: { position: 'relative', display: 'inline-block' },
  
  studentPhoto: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '3px solid rgba(255,255,255,0.3)',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  
  photoPlaceholder: {
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
    cursor: 'pointer',
    transition: 'all 0.3s ease'
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
  
  studentName: { margin: '0 0 0.5rem 0', fontSize: '1.3rem', fontWeight: '700' },
  studentGrade: { margin: '0 0 1rem 0', opacity: 0.8, fontSize: '1rem' },
  
  statusBadge: {
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    borderRadius: '12px',
    fontSize: '0.8rem',
    marginBottom: '0.5rem',
    fontWeight: '600'
  },
  
  statusActive: {
    background: 'rgba(34, 197, 94, 0.3)',
    border: '1px solid #22c55e'
  },
  
  statusInactive: {
    background: 'rgba(239, 68, 68, 0.3)',
    border: '1px solid #ef4444'
  },

  // NEW: Resource indicator
  resourceIndicator: {
    display: 'inline-block',
    padding: '0.5rem',
    borderRadius: '8px',
    background: 'rgba(59, 130, 246, 0.2)',
    border: '1px solid rgba(59, 130, 246, 0.4)',
    fontSize: '0.7rem',
    color: '#dbeafe',
    textAlign: 'center',
    lineHeight: '1.2',
    marginTop: '0.5rem'
  },
  
  progressRight: { gridArea: 'progress-right' },
  progressContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '1rem',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '12px',
    minWidth: '120px',
    height: 'fit-content',
    backdropFilter: 'blur(10px)'
  },
  
  progressPercentage: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
    lineHeight: '1'
  },
  
  progressTrend: {
    fontSize: '1.4rem',
    marginBottom: '0.75rem',
    lineHeight: '1'
  },
  
  progressGoals: {
    fontSize: '0.75rem',
    opacity: 0.8,
    textAlign: 'center',
    lineHeight: '1.2'
  },
  
  contentArea: { gridArea: 'content-area' },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '0.5rem',
    marginBottom: '1rem',
    padding: '0.75rem',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '8px',
    backdropFilter: 'blur(10px)'
  },
  
  statItem: { textAlign: 'center' },
  statValue: { fontSize: '1.2rem', fontWeight: 'bold' },
  statLabel: { fontSize: '0.7rem', opacity: 0.7 },
  
  accommodationsPreview: { marginBottom: '1rem' },
  previewLabel: { fontSize: '0.8rem', opacity: 0.7, marginBottom: '0.25rem' },
  previewText: { fontSize: '0.8rem' },
  
  adminLeft: { gridArea: 'admin-left' },
  dropdownContainer: { position: 'relative' },
  
  actionsButton: {
    padding: '0.5rem 0.75rem',
    borderRadius: '8px',
    border: 'none',
    background: 'rgba(239, 68, 68, 0.8)',
    color: 'white',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: 'bold',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)'
  },

  // NEW: Improved dropdown styles
  dropdownBackdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999
  },
  
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    marginTop: '0.25rem',
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
    border: '1px solid rgba(0,0,0,0.1)',
    minWidth: '200px',
    zIndex: 1000,
    overflow: 'hidden',
    backdropFilter: 'blur(10px)'
  },
  
  dropdownItem: {
    width: '100%',
    padding: '0.875rem 1.25rem',
    border: 'none',
    background: 'transparent',
    color: '#374151',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
    textAlign: 'left',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    transition: 'all 0.2s ease'
  },

  dropdownItemDanger: {
    width: '100%',
    padding: '0.875rem 1.25rem',
    border: 'none',
    background: 'transparent',
    color: '#dc2626',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
    textAlign: 'left',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    transition: 'all 0.2s ease'
  },

  dropdownDivider: {
    height: '1px',
    background: 'rgba(0,0,0,0.1)',
    margin: '0.25rem 0'
  },
  
  contactInfo: { gridArea: 'contact-info' },
  contactText: { fontSize: '0.8rem', opacity: 0.8 },
  
  referenceRight: { gridArea: 'reference-right' },
  referenceContainer: {
    padding: '1rem',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '8px',
    fontSize: '0.8rem',
    backdropFilter: 'blur(10px)'
  },
  
  referenceTitle: {
    marginBottom: '0.75rem',
    fontWeight: 'bold',
    opacity: 0.9,
    fontSize: '0.85rem'
  },
  
  referenceContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    lineHeight: '1.3'
  },

  // NEW: Resource Modal Styles
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
    padding: '2rem',
    backdropFilter: 'blur(5px)'
  },

  resourceModal: {
    background: 'white',
    borderRadius: '20px',
    width: '100%',
    maxWidth: '800px',
    maxHeight: '90vh',
    overflow: 'hidden',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    display: 'flex',
    flexDirection: 'column'
  },

  resourceModalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem 2rem',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: 'white'
  },

  resourceModalTitle: {
    margin: 0,
    fontSize: '1.3rem',
    fontWeight: '700'
  },

  resourceModalClose: {
    background: 'rgba(255,255,255,0.2)',
    border: 'none',
    color: 'white',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    cursor: 'pointer',
    fontSize: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease'
  },

  resourceModalContent: {
    flex: 1,
    padding: '2rem',
    overflowY: 'auto'
  },

  resourceModalFooter: {
    padding: '1.5rem 2rem',
    borderTop: '1px solid #e5e7eb',
    background: '#f9fafb',
    display: 'flex',
    justifyContent: 'flex-end'
  },

  resourceModalSaveButton: {
    padding: '0.875rem 2rem',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, #10b981, #059669)',
    color: 'white',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 'bold',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)'
  }
};

export default StudentCard;