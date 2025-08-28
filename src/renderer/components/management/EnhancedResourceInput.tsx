// IMPROVED: User-friendly Resource Input Component
// src/renderer/components/management/EnhancedResourceInput.tsx

import React, { useState, useEffect } from 'react';

interface ResourceInfo {
  attendsResource: boolean;
  resourceType: string;
  resourceTeacher: string;
  timeframe: string;
}

interface EnhancedResourceInputProps {
  resourceInfo: ResourceInfo;
  onChange: (resourceInfo: ResourceInfo) => void;
  studentName: string;
}

const EnhancedResourceInput: React.FC<EnhancedResourceInputProps> = ({
  resourceInfo,
  onChange,
  studentName
}) => {
  // Local state for the form
  const [localResourceInfo, setLocalResourceInfo] = useState<ResourceInfo>({
    attendsResource: false,
    resourceType: '',
    resourceTeacher: '',
    timeframe: '',
    ...resourceInfo
  });

  // Predefined options for better UX
  const serviceTypes = [
    { value: '', label: 'Select a service...' },
    { value: 'Speech Therapy', label: 'Speech Therapy' },
    { value: 'Occupational Therapy', label: 'Occupational Therapy (OT)' },
    { value: 'Physical Therapy', label: 'Physical Therapy (PT)' },
    { value: 'Reading Support', label: 'Reading Support' },
    { value: 'Math Support', label: 'Math Support' },
    { value: 'Counseling', label: 'Counseling' },
    { value: 'ESL Support', label: 'ESL Support' },
    { value: 'Behavior Support', label: 'Behavior Support' },
    { value: 'Other', label: 'Other Service' }
  ];

  const timeSlots = [
    { value: '', label: 'Select time...' },
    { value: 'Monday 9:00-9:30 AM', label: 'Monday 9:00-9:30 AM' },
    { value: 'Monday 10:00-10:30 AM', label: 'Monday 10:00-10:30 AM' },
    { value: 'Monday 11:00-11:30 AM', label: 'Monday 11:00-11:30 AM' },
    { value: 'Monday 1:00-1:30 PM', label: 'Monday 1:00-1:30 PM' },
    { value: 'Monday 2:00-2:30 PM', label: 'Monday 2:00-2:30 PM' },
    { value: 'Tuesday 9:00-9:30 AM', label: 'Tuesday 9:00-9:30 AM' },
    { value: 'Tuesday 10:00-10:30 AM', label: 'Tuesday 10:00-10:30 AM' },
    { value: 'Tuesday 11:00-11:30 AM', label: 'Tuesday 11:00-11:30 AM' },
    { value: 'Tuesday 1:00-1:30 PM', label: 'Tuesday 1:00-1:30 PM' },
    { value: 'Tuesday 2:00-2:30 PM', label: 'Tuesday 2:00-2:30 PM' },
    { value: 'Wednesday 9:00-9:30 AM', label: 'Wednesday 9:00-9:30 AM' },
    { value: 'Wednesday 10:00-10:30 AM', label: 'Wednesday 10:00-10:30 AM' },
    { value: 'Wednesday 11:00-11:30 AM', label: 'Wednesday 11:00-11:30 AM' },
    { value: 'Wednesday 1:00-1:30 PM', label: 'Wednesday 1:00-1:30 PM' },
    { value: 'Wednesday 2:00-2:30 PM', label: 'Wednesday 2:00-2:30 PM' },
    { value: 'Thursday 9:00-9:30 AM', label: 'Thursday 9:00-9:30 AM' },
    { value: 'Thursday 10:00-10:30 AM', label: 'Thursday 10:00-10:30 AM' },
    { value: 'Thursday 11:00-11:30 AM', label: 'Thursday 11:00-11:30 AM' },
    { value: 'Thursday 1:00-1:30 PM', label: 'Thursday 1:00-1:30 PM' },
    { value: 'Thursday 2:00-2:30 PM', label: 'Thursday 2:00-2:30 PM' },
    { value: 'Friday 9:00-9:30 AM', label: 'Friday 9:00-9:30 AM' },
    { value: 'Friday 10:00-10:30 AM', label: 'Friday 10:00-10:30 AM' },
    { value: 'Friday 11:00-11:30 AM', label: 'Friday 11:00-11:30 AM' },
    { value: 'Friday 1:00-1:30 PM', label: 'Friday 1:00-1:30 PM' },
    { value: 'Friday 2:00-2:30 PM', label: 'Friday 2:00-2:30 PM' },
    { value: 'Custom', label: 'Custom Schedule...' }
  ];

  const resourceTeachers = [
    { value: '', label: 'Select teacher/therapist...' },
    { value: 'Ms. Johnson', label: 'Ms. Johnson' },
    { value: 'Mr. Smith', label: 'Mr. Smith' },
    { value: 'Ms. Rodriguez', label: 'Ms. Rodriguez' },
    { value: 'Mr. Davis', label: 'Mr. Davis' },
    { value: 'Ms. Thompson', label: 'Ms. Thompson' },
    { value: 'Other', label: 'Other (specify below)' }
  ];

  // Update parent when local state changes
  useEffect(() => {
    onChange(localResourceInfo);
  }, [localResourceInfo, onChange]);

  const handleFieldChange = (field: keyof ResourceInfo, value: any) => {
    console.log(`🔄 Resource field changed: ${field} = ${value}`);
    setLocalResourceInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAttendanceChange = (attends: boolean) => {
    if (!attends) {
      // If unchecking attendance, clear all other fields
      setLocalResourceInfo({
        attendsResource: false,
        resourceType: '',
        resourceTeacher: '',
        timeframe: ''
      });
    } else {
      setLocalResourceInfo(prev => ({
        ...prev,
        attendsResource: true
      }));
    }
  };

  return (
    <div style={styles.container}>
      <h4 style={styles.sectionTitle}>
        🏫 Resource Services for {studentName}
      </h4>

      {/* Main Toggle */}
      <div style={styles.toggleSection}>
        <label style={styles.toggleLabel}>
          <input
            type="checkbox"
            checked={localResourceInfo.attendsResource}
            onChange={(e) => handleAttendanceChange(e.target.checked)}
            style={styles.checkbox}
          />
          <span style={styles.toggleText}>
            This student receives resource services
          </span>
        </label>
      </div>

      {/* Resource Details (only show if attending) */}
      {localResourceInfo.attendsResource && (
        <div style={styles.detailsSection}>
          
          {/* Service Type */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Service Type *</label>
            <select
              value={localResourceInfo.resourceType}
              onChange={(e) => handleFieldChange('resourceType', e.target.value)}
              style={styles.select}
              required
            >
              {serviceTypes.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {localResourceInfo.resourceType && (
              <div style={styles.selectedPreview}>
                ✅ Selected: {localResourceInfo.resourceType}
              </div>
            )}
          </div>

          {/* Schedule/Timeframe */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Schedule/Time *</label>
            <select
              value={localResourceInfo.timeframe}
              onChange={(e) => handleFieldChange('timeframe', e.target.value)}
              style={styles.select}
              required
            >
              {timeSlots.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            
            {/* Custom time input */}
            {localResourceInfo.timeframe === 'Custom' && (
              <input
                type="text"
                placeholder="e.g., MWF 10:15-10:45 AM"
                onChange={(e) => handleFieldChange('timeframe', e.target.value)}
                style={styles.customInput}
              />
            )}
            
            {localResourceInfo.timeframe && localResourceInfo.timeframe !== 'Custom' && (
              <div style={styles.selectedPreview}>
                ⏰ Scheduled: {localResourceInfo.timeframe}
              </div>
            )}
          </div>

          {/* Teacher/Therapist */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Teacher/Therapist *</label>
            <select
              value={localResourceInfo.resourceTeacher}
              onChange={(e) => handleFieldChange('resourceTeacher', e.target.value)}
              style={styles.select}
              required
            >
              {resourceTeachers.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            
            {/* Custom teacher input */}
            {localResourceInfo.resourceTeacher === 'Other' && (
              <input
                type="text"
                placeholder="Enter teacher/therapist name"
                onChange={(e) => handleFieldChange('resourceTeacher', e.target.value)}
                style={styles.customInput}
              />
            )}
            
            {localResourceInfo.resourceTeacher && localResourceInfo.resourceTeacher !== 'Other' && (
              <div style={styles.selectedPreview}>
                👨‍🏫 Provider: {localResourceInfo.resourceTeacher}
              </div>
            )}
          </div>

          {/* Summary Preview */}
          {localResourceInfo.resourceType && localResourceInfo.timeframe && localResourceInfo.resourceTeacher && (
            <div style={styles.summaryPreview}>
              <div style={styles.summaryTitle}>📋 Resource Service Summary</div>
              <div style={styles.summaryContent}>
                <div><strong>{studentName}</strong> will attend <strong>{localResourceInfo.resourceType}</strong></div>
                <div>with <strong>{localResourceInfo.resourceTeacher}</strong></div>
                <div>during <strong>{localResourceInfo.timeframe}</strong></div>
              </div>
            </div>
          )}

          {/* Helpful Examples */}
          <div style={styles.helpSection}>
            <div style={styles.helpTitle}>💡 Schedule Format Examples:</div>
            <div style={styles.helpText}>
              • "Monday/Wednesday 2:00-2:30 PM"<br/>
              • "Daily 10:00-10:30 AM"<br/>
              • "MWF 9:00-9:30 AM"<br/>
              • "Tuesdays & Thursdays 1:15-2:00 PM"
            </div>
          </div>
        </div>
      )}

      {/* No Services Message */}
      {!localResourceInfo.attendsResource && (
        <div style={styles.noServicesMessage}>
          <div style={styles.noServicesIcon}>🏫</div>
          <div style={styles.noServicesText}>
            {studentName} does not currently receive resource services.<br/>
            Check the box above to set up resource services.
          </div>
        </div>
      )}
    </div>
  );
};

// Comprehensive styles for the improved resource input
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    background: 'rgba(59, 130, 246, 0.05)',
    borderRadius: '12px',
    padding: '1.5rem',
    border: '1px solid rgba(59, 130, 246, 0.1)',
    marginTop: '1rem'
  },

  sectionTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },

  toggleSection: {
    marginBottom: '1.5rem',
    padding: '1rem',
    background: 'rgba(59, 130, 246, 0.1)',
    borderRadius: '8px',
    border: '2px solid rgba(59, 130, 246, 0.2)'
  },

  toggleLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    cursor: 'pointer',
    fontSize: '1rem'
  },

  checkbox: {
    width: '1.25rem',
    height: '1.25rem',
    cursor: 'pointer'
  },

  toggleText: {
    fontWeight: '600',
    color: '#1e40af'
  },

  detailsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem'
  },

  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },

  label: {
    fontWeight: '600',
    color: '#374151',
    fontSize: '0.9rem'
  },

  select: {
    padding: '0.75rem',
    borderRadius: '8px',
    border: '2px solid #e5e7eb',
    fontSize: '1rem',
    backgroundColor: 'white',
    transition: 'border-color 0.2s',
    cursor: 'pointer'
  },

  customInput: {
    padding: '0.75rem',
    borderRadius: '8px',
    border: '2px solid #e5e7eb',
    fontSize: '1rem',
    marginTop: '0.5rem',
    transition: 'border-color 0.2s'
  },

  selectedPreview: {
    padding: '0.5rem',
    background: 'rgba(34, 197, 94, 0.1)',
    borderRadius: '6px',
    border: '1px solid rgba(34, 197, 94, 0.2)',
    color: '#065f46',
    fontSize: '0.9rem',
    fontWeight: '500',
    marginTop: '0.5rem'
  },

  summaryPreview: {
    marginTop: '1rem',
    padding: '1rem',
    background: 'rgba(16, 185, 129, 0.1)',
    borderRadius: '8px',
    border: '1px solid rgba(16, 185, 129, 0.2)'
  },

  summaryTitle: {
    fontWeight: '600',
    color: '#065f46',
    marginBottom: '0.5rem',
    fontSize: '1rem'
  },

  summaryContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    fontSize: '0.9rem',
    color: '#047857',
    lineHeight: '1.4'
  },

  helpSection: {
    marginTop: '1rem',
    padding: '1rem',
    background: 'rgba(245, 158, 11, 0.1)',
    borderRadius: '8px',
    border: '1px solid rgba(245, 158, 11, 0.2)'
  },

  helpTitle: {
    fontWeight: '600',
    color: '#92400e',
    marginBottom: '0.5rem',
    fontSize: '0.9rem'
  },

  helpText: {
    fontSize: '0.8rem',
    color: '#a16207',
    lineHeight: '1.4'
  },

  noServicesMessage: {
    padding: '2rem',
    textAlign: 'center',
    background: 'rgba(156, 163, 175, 0.1)',
    borderRadius: '8px',
    border: '1px solid rgba(156, 163, 175, 0.2)'
  },

  noServicesIcon: {
    fontSize: '3rem',
    marginBottom: '1rem'
  },

  noServicesText: {
    color: '#6b7280',
    fontSize: '0.9rem',
    lineHeight: '1.5'
  }
};

export default EnhancedResourceInput;