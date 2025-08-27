// FIXED: StudentModal with type compatibility and data persistence
// src/renderer/components/management/StudentModal.tsx

import React, { useState, useEffect } from 'react';
import UnifiedDataService from '../../services/unifiedDataService';
import EnhancedResourceInput from './EnhancedResourceInput';

// FIXED: Match the exact ExtendedStudent interface from StudentManagement
interface ExtendedStudent {
  id?: string;
  name: string;
  grade: string;
  photo?: string;
  workingStyle?: 'collaborative' | 'independent'; // FIXED: Exact type match
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

interface StudentModalProps {
  student: ExtendedStudent | null;
  students: ExtendedStudent[];
  onSave: (studentData: Partial<ExtendedStudent>) => void;
  onCancel: () => void;
  uploadPhoto: (file: File) => Promise<{ success: boolean; photoData?: string; error?: string }>;
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
    workingStyle: 'collaborative' as 'collaborative' | 'independent', // FIXED: Explicit typing
    accommodations: [],
    goals: [],
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    isActive: true,
    behaviorNotes: '',
    medicalNotes: '',
    birthday: '',
    allowBirthdayDisplay: true,
    allowPhotoInCelebrations: true,
    iepExpirationDate: '',
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
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (student) {
      setFormData({
        ...student,
        // FIXED: Ensure workingStyle is properly typed
        workingStyle: (student.workingStyle === 'collaborative' || student.workingStyle === 'independent') 
          ? student.workingStyle 
          : 'collaborative',
        accommodations: student.accommodations || [],
        goals: student.goals || [],
        preferredPartners: student.preferredPartners || [],
        avoidPartners: student.avoidPartners || [],
        birthday: student.birthday || '',
        allowBirthdayDisplay: student.allowBirthdayDisplay !== undefined ? student.allowBirthdayDisplay : true,
        allowPhotoInCelebrations: student.allowPhotoInCelebrations !== undefined ? student.allowPhotoInCelebrations : true,
        iepExpirationDate: student.iepExpirationDate || '',
        behaviorNotes: student.behaviorNotes || '',
        medicalNotes: student.medicalNotes || ''
      });
    }
  }, [student]);

  const handleSave = async () => {
    if (!formData.name || !formData.grade) {
      alert('Please fill in required fields (Name and Grade)');
      return;
    }
    
    try {
      console.log('🔄 Saving student data:', formData);
      
      // FIXED: Ensure workingStyle is properly typed in saved data
      const studentDataToSave: Partial<ExtendedStudent> = {
        ...formData,
        id: student?.id || Date.now().toString(),
        name: formData.name!.trim(),
        grade: formData.grade!,
        // FIXED: Explicit workingStyle typing
        workingStyle: formData.workingStyle as 'collaborative' | 'independent',
        isActive: formData.isActive !== undefined ? formData.isActive : true,
        birthday: formData.birthday || '',
        allowBirthdayDisplay: formData.allowBirthdayDisplay !== undefined ? formData.allowBirthdayDisplay : true,
        allowPhotoInCelebrations: formData.allowPhotoInCelebrations !== undefined ? formData.allowPhotoInCelebrations : true,
        iepExpirationDate: formData.iepExpirationDate || '',
        medicalNotes: formData.medicalNotes || '',
        behaviorNotes: formData.behaviorNotes || '',
        parentName: formData.parentName || '',
        parentEmail: formData.parentEmail || '',
        parentPhone: formData.parentPhone || '',
        resourceInfo: formData.resourceInfo || {
          attendsResource: false,
          resourceType: '',
          resourceTeacher: '',
          timeframe: ''
        },
        accommodations: formData.accommodations || [],
        goals: formData.goals || [],
        preferredPartners: formData.preferredPartners || [],
        avoidPartners: formData.avoidPartners || []
      };
      
      console.log('✅ Final student data being saved:', studentDataToSave);
      onSave(studentDataToSave);
      
    } catch (error) {
      console.error('❌ Error in handleSave:', error);
      alert('Error saving student. Please try again.');
    }
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

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContainer}>
        {/* Modal Header */}
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>
            {student ? `Edit ${student.name}` : 'Add New Student'}
          </h2>
        </div>

        {/* Tab Navigation */}
        <div style={styles.tabNavigation}>
          {[
            { id: 'basic', label: '👤 Basic Info' },
            { id: 'academic', label: '🎯 Academic' },
            { id: 'contact', label: '📞 Contact' },
            { id: 'notes', label: '📝 Notes' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id as any)}
              style={{
                ...styles.tabButton,
                ...(currentTab === tab.id ? styles.tabButtonActive : {})
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* FIXED: Scrollable Tab Content */}
        <div style={styles.tabContent}>
          {currentTab === 'basic' && (
            <div style={styles.basicTab}>
              {/* Photo Upload */}
              <div style={styles.photoSection}>
                <div style={styles.photoContainer}>
                  {formData.photo ? (
                    <img 
                      src={formData.photo} 
                      alt="Student"
                      style={styles.photoPreview}
                    />
                  ) : (
                    <div style={styles.photoPlaceholder}>
                      👤
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
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  style={styles.fileInput}
                />
              </div>

              {/* Basic Fields */}
              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Student Name *</label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    style={styles.input}
                    placeholder="Enter student's full name"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Grade Level *</label>
                  <select
                    value={formData.grade || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, grade: e.target.value }))}
                    style={styles.select}
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

              <div style={styles.workingStyleSection}>
                <label style={styles.label}>Working Style</label>
                <div style={styles.radioGroup}>
                  {(['collaborative', 'independent'] as const).map(style => (
                    <label key={style} style={styles.radioLabel}>
                      <input
                        type="radio"
                        name="workingStyle"
                        value={style}
                        checked={formData.workingStyle === style}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          workingStyle: e.target.value as 'collaborative' | 'independent'
                        }))}
                      />
                      <span style={styles.radioText}>{style.charAt(0).toUpperCase() + style.slice(1)}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={styles.checkboxSection}>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formData.isActive || false}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  />
                  <span style={styles.checkboxText}>Active Student</span>
                </label>
              </div>

              {/* Birthday Section */}
              <div style={styles.birthdaySection}>
                <h4 style={styles.sectionTitle}>🎂 Birthday & Celebrations</h4>

                <div style={styles.formGrid}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Birthday (Optional)</label>
                    <input
                      type="date"
                      value={formData.birthday || ''}
                      onChange={(e) => {
                        console.log('🎂 Birthday changed to:', e.target.value);
                        setFormData(prev => ({ ...prev, birthday: e.target.value }));
                      }}
                      style={styles.input}
                    />
                    <div style={styles.inputHelp}>
                      Used for birthday celebrations in Morning Meeting
                    </div>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Birthday Celebrations</label>
                    <div style={styles.checkboxGroup}>
                      <label style={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          checked={formData.allowBirthdayDisplay !== false}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            allowBirthdayDisplay: e.target.checked 
                          }))}
                        />
                        <span style={styles.checkboxText}>Show birthday celebrations</span>
                      </label>
                      
                      <label style={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          checked={formData.allowPhotoInCelebrations !== false}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            allowPhotoInCelebrations: e.target.checked 
                          }))}
                        />
                        <span style={styles.checkboxText}>Include photo in celebrations</span>
                      </label>
                    </div>
                  </div>
                </div>

                {formData.birthday && (
                  <div style={styles.birthdayPreview}>
                    <div style={styles.previewIcon}>🎂</div>
                    <div>
                      <div style={styles.previewTitle}>Birthday Preview</div>
                      <div style={styles.previewText}>
                        {new Date(formData.birthday).toLocaleDateString('en-US', { 
                          month: 'long', 
                          day: 'numeric' 
                        })} - {formData.name || 'Student'}'s birthday will appear in Morning Meeting celebrations
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {currentTab === 'academic' && (
            <div style={styles.academicTab}>
              {/* Accommodations */}
              <div style={styles.accommodationsSection}>
                <label style={styles.label}>Accommodations</label>
                <div style={styles.addItemRow}>
                  <input
                    type="text"
                    value={newAccommodation}
                    onChange={(e) => setNewAccommodation(e.target.value)}
                    placeholder="Add accommodation..."
                    style={styles.addInput}
                    onKeyPress={(e) => e.key === 'Enter' && addAccommodation()}
                  />
                  <button
                    onClick={addAccommodation}
                    style={styles.addButton}
                  >
                    Add
                  </button>
                </div>
                <div style={styles.tagList}>
                  {formData.accommodations?.map((accommodation, index) => (
                    <span key={index} style={styles.tag}>
                      {accommodation}
                      <button
                        onClick={() => removeAccommodation(index)}
                        style={styles.tagRemove}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* IEP Expiration Date */}
              <div style={styles.formGroup}>
                <label style={styles.label}>IEP Expiration Date</label>
                <input
                  type="date"
                  value={formData.iepExpirationDate || ''}
                  onChange={(e) => {
                    console.log('📅 IEP Expiration changed to:', e.target.value);
                    setFormData(prev => ({ ...prev, iepExpirationDate: e.target.value }));
                  }}
                  style={styles.input}
                />
              </div>

              {/* Resource Services */}
              <div style={styles.resourceSection}>
                <EnhancedResourceInput
                  resourceInfo={formData.resourceInfo || {
                    attendsResource: false,
                    resourceType: '',
                    resourceTeacher: '',
                    timeframe: ''
                  }}
                  onChange={(resourceInfo) => {
                    console.log('🔄 Resource info changed:', resourceInfo);
                    setFormData({...formData, resourceInfo});
                  }}
                  studentName={formData.name || ''}
                />
              </div>
            </div>
          )}

          {currentTab === 'contact' && (
            <div style={styles.contactTab}>
              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Parent/Guardian Name</label>
                  <input
                    type="text"
                    value={formData.parentName || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, parentName: e.target.value }))}
                    style={styles.input}
                    placeholder="Enter parent/guardian name"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Email Address</label>
                  <input
                    type="email"
                    value={formData.parentEmail || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, parentEmail: e.target.value }))}
                    style={styles.input}
                    placeholder="parent@email.com"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Phone Number</label>
                  <input
                    type="tel"
                    value={formData.parentPhone || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, parentPhone: e.target.value }))}
                    style={styles.input}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>
            </div>
          )}

          {currentTab === 'notes' && (
            <div style={styles.notesTab}>
              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Behavior Notes</label>
                  <textarea
                    value={formData.behaviorNotes || ''}
                    onChange={(e) => {
                      console.log('📝 Behavior notes changed to:', e.target.value);
                      setFormData(prev => ({ ...prev, behaviorNotes: e.target.value }));
                    }}
                    rows={4}
                    style={styles.textarea}
                    placeholder="Notes about behavior patterns, triggers, successful strategies..."
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Medical Notes</label>
                  <textarea
                    value={formData.medicalNotes || ''}
                    onChange={(e) => {
                      console.log('🏥 Medical notes changed to:', e.target.value);
                      setFormData(prev => ({ ...prev, medicalNotes: e.target.value }));
                    }}
                    rows={4}
                    style={styles.textarea}
                    placeholder="Medical conditions, medications, allergies, emergency information..."
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div style={styles.modalFooter}>
          <button onClick={onCancel} style={styles.cancelButton}>
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!formData.name || !formData.grade}
            style={{
              ...styles.saveButton,
              ...((!formData.name || !formData.grade) ? styles.saveButtonDisabled : {})
            }}
          >
            {student ? 'Update Student' : 'Add Student'}
          </button>
        </div>
      </div>
    </div>
  );
};

// FIXED: Complete styles object
const styles: { [key: string]: React.CSSProperties } = {
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
    zIndex: 1000,
    padding: '1rem'
  },
  
  modalContainer: {
    background: 'white',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '900px',
    maxHeight: '95vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  
  modalHeader: {
    padding: '1.5rem',
    borderBottom: '1px solid #e5e7eb',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: 'white',
    borderRadius: '16px 16px 0 0',
    flexShrink: 0
  },
  
  modalTitle: {
    margin: 0,
    fontSize: '1.5rem',
    fontWeight: 'bold'
  },
  
  tabNavigation: {
    display: 'flex',
    borderBottom: '1px solid #e5e7eb',
    background: '#f8f9fa',
    flexShrink: 0
  },
  
  tabButton: {
    flex: 1,
    padding: '1rem',
    border: 'none',
    background: 'transparent',
    color: '#6b7280',
    cursor: 'pointer',
    fontWeight: 'normal',
    transition: 'all 0.3s ease',
    borderBottom: '2px solid transparent'
  },
  
  tabButtonActive: {
    background: 'white',
    color: '#667eea',
    borderBottom: '2px solid #667eea',
    fontWeight: 'bold'
  },
  
  tabContent: {
    flex: 1,
    overflowY: 'auto',
    padding: '1.5rem',
    minHeight: '400px'
  },
  
  basicTab: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },
  
  photoSection: {
    textAlign: 'center'
  },
  
  photoContainer: {
    position: 'relative',
    display: 'inline-block',
    marginBottom: '1rem'
  },
  
  photoPreview: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '4px solid #e5e7eb'
  },
  
  photoPlaceholder: {
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
    fontSize: '0.9rem'
  },
  
  fileInput: {
    marginTop: '1rem'
  },
  
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem'
  },
  
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  
  label: {
    fontWeight: 'bold',
    color: '#374151',
    fontSize: '0.9rem'
  },
  
  input: {
    padding: '0.75rem',
    borderRadius: '8px',
    border: '2px solid #e5e7eb',
    fontSize: '1rem',
    transition: 'border-color 0.2s'
  },
  
  select: {
    padding: '0.75rem',
    borderRadius: '8px',
    border: '2px solid #e5e7eb',
    fontSize: '1rem',
    backgroundColor: 'white',
    transition: 'border-color 0.2s'
  },
  
  textarea: {
    padding: '0.75rem',
    borderRadius: '8px',
    border: '2px solid #e5e7eb',
    fontSize: '1rem',
    resize: 'vertical',
    minHeight: '100px',
    transition: 'border-color 0.2s'
  },
  
  inputHelp: {
    fontSize: '0.8rem',
    color: '#6b7280'
  },
  
  workingStyleSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  
  radioGroup: {
    display: 'flex',
    gap: '1rem'
  },
  
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer'
  },
  
  radioText: {
    fontSize: '0.9rem',
    color: '#374151'
  },
  
  checkboxSection: {
    display: 'flex',
    alignItems: 'center'
  },
  
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
    fontSize: '0.9rem',
    color: '#374151'
  },
  
  checkboxText: {
    fontWeight: 'bold'
  },
  
  birthdaySection: {
    background: 'rgba(245, 158, 11, 0.1)',
    borderRadius: '12px',
    padding: '1.5rem',
    border: '1px solid rgba(245, 158, 11, 0.2)'
  },
  
  sectionTitle: {
    fontSize: '1.2rem',
    fontWeight: '600',
    color: '#d97706',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  
  checkboxGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  
  birthdayPreview: {
    marginTop: '1rem',
    padding: '1rem',
    background: 'rgba(16, 185, 129, 0.1)',
    borderRadius: '8px',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  
  previewIcon: {
    fontSize: '2rem'
  },
  
  previewTitle: {
    fontWeight: '600',
    color: '#065f46',
    marginBottom: '0.25rem'
  },
  
  previewText: {
    fontSize: '0.9rem',
    color: '#047857'
  },
  
  academicTab: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },
  
  accommodationsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  
  addItemRow: {
    display: 'flex',
    gap: '0.5rem'
  },
  
  addInput: {
    flex: 1,
    padding: '0.5rem',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    fontSize: '0.9rem'
  },
  
  addButton: {
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    border: 'none',
    background: '#667eea',
    color: 'white',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  
  tagList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem'
  },
  
  tag: {
    padding: '0.25rem 0.75rem',
    background: '#e0e7ff',
    color: '#3730a3',
    borderRadius: '16px',
    fontSize: '0.9rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  
  tagRemove: {
    background: 'none',
    border: 'none',
    color: '#ef4444',
    cursor: 'pointer',
    padding: 0,
    fontSize: '1rem'
  },
  
  resourceSection: {
    marginTop: '1rem'
  },
  
  contactTab: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  
  notesTab: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  
  modalFooter: {
    padding: '1.5rem',
    borderTop: '1px solid #e5e7eb',
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-end',
    background: '#f8f9fa',
    borderRadius: '0 0 16px 16px',
    flexShrink: 0
  },
  
  cancelButton: {
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    border: '2px solid #e5e7eb',
    background: 'white',
    color: '#374151',
    cursor: 'pointer',
    fontSize: '1rem'
  },
  
  saveButton: {
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    border: 'none',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: 'white',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 'bold'
  },
  
  saveButtonDisabled: {
    background: '#d1d5db',
    cursor: 'not-allowed'
  }
};

export default StudentModal;