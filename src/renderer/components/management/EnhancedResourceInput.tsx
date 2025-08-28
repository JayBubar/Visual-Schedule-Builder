// IMPROVED: Clean Resource Input with M-F Checkboxes + Time Dropdowns
// src/renderer/components/management/EnhancedResourceInput.tsx

import React, { useState, useEffect } from 'react';
import { Clock, User, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';
import UnifiedDataService from '../../services/unifiedDataService';

// Teacher Selector Component
const TeacherSelector: React.FC<{
  value: string;
  onChange: (teacher: string) => void;
  serviceType: string;
}> = ({ value, onChange, serviceType }) => {
  const [allStaff, setAllStaff] = useState<any[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<any[]>([]);

  useEffect(() => {
    // Load staff from UnifiedDataService
    try {
      const staff = UnifiedDataService.getAllStaff();
      setAllStaff(staff);
      console.log('📋 Loaded staff for resource selection:', staff.length);
    } catch (error) {
      console.error('Error loading staff:', error);
      setAllStaff([]);
    }
  }, []);

  useEffect(() => {
    // Filter staff based on service type and role
    let filtered = allStaff;

    if (serviceType) {
      // Try to match staff roles to service types
      const roleKeywords = {
        'Speech Therapy': ['speech', 'slp', 'language', 'communication'],
        'Occupational Therapy': ['occupational', 'ot', 'therapy'],
        'Physical Therapy': ['physical', 'pt', 'therapy'],
        'Counseling': ['counselor', 'counseling', 'social', 'psychologist'],
        'Reading Support': ['reading', 'literacy', 'english', 'ela'],
        'Math Support': ['math', 'mathematics', 'numeracy'],
        'ESL Support': ['esl', 'english', 'language', 'bilingual'],
        'Behavior Support': ['behavior', 'social', 'emotional', 'support'],
        'Life Skills': ['life', 'skills', 'functional', 'adaptive']
      };

      const keywords = roleKeywords[serviceType as keyof typeof roleKeywords] || [];
      
      filtered = allStaff.filter(staff => {
        const role = (staff.role || '').toLowerCase();
        const name = (staff.name || '').toLowerCase();
        
        // Check if role matches keywords or if it's a general resource role
        return keywords.some(keyword => role.includes(keyword)) ||
               role.includes('resource') ||
               role.includes('specialist') ||
               role.includes('therapist') ||
               role.includes('teacher');
      });
    }

    // If no matches found, show all staff as fallback
    if (filtered.length === 0) {
      filtered = allStaff;
    }

    // Sort by name for better UX
    filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    
    setFilteredStaff(filtered);
  }, [allStaff, serviceType]);

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={styles.select}
      required
    >
      <option value="">Select teacher/therapist...</option>
      {filteredStaff.map(staff => (
        <option key={staff.id} value={staff.name}>
          {staff.name} {staff.role ? `(${staff.role})` : ''}
        </option>
      ))}
      {allStaff.length === 0 && (
        <option value="" disabled>No staff loaded</option>
      )}
      {/* Allow custom entry as fallback */}
      <option value="__custom__">Add Custom Teacher...</option>
    </select>
  );
};

interface ResourceInfo {
  attendsResource: boolean;
  resourceType: string;
  resourceTeacher: string;
  timeframe: string;
}

// NEW: Structured resource schedule interface
interface StructuredResourceSchedule {
  attendsResource: boolean;
  resourceType: string;
  resourceTeacher: string;
  days: string[]; // ['Monday', 'Wednesday', 'Friday']
  startTime: string; // '9:00 AM'
  endTime: string; // '9:30 AM'
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
  // Parse existing timeframe into structured data
  const parseTimeframe = (timeframe: string): StructuredResourceSchedule => {
    const defaultSchedule: StructuredResourceSchedule = {
      attendsResource: resourceInfo.attendsResource,
      resourceType: resourceInfo.resourceType,
      resourceTeacher: resourceInfo.resourceTeacher,
      days: [],
      startTime: '9:00 AM',
      endTime: '9:30 AM'
    };

    if (!timeframe) return defaultSchedule;

    try {
      // Try to parse existing timeframe formats
      const dayAbbreviations = {
        'M': 'Monday', 'MON': 'Monday',
        'T': 'Tuesday', 'TU': 'Tuesday', 'TUE': 'Tuesday', 'TUES': 'Tuesday',
        'W': 'Wednesday', 'WED': 'Wednesday',
        'TH': 'Thursday', 'THU': 'Thursday', 'THUR': 'Thursday', 'THURS': 'Thursday',
        'F': 'Friday', 'FRI': 'Friday'
      };

      // Extract days
      const days: string[] = [];
      Object.keys(dayAbbreviations).forEach(abbr => {
        if (timeframe.toUpperCase().includes(abbr)) {
          const fullDay = dayAbbreviations[abbr as keyof typeof dayAbbreviations];
          if (!days.includes(fullDay)) {
            days.push(fullDay);
          }
        }
      });

      // Extract time range
      const timeMatch = timeframe.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?.*?(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
      if (timeMatch) {
        const [, startHour, startMin, startPeriod = 'AM', endHour, endMin, endPeriod = 'AM'] = timeMatch;
        defaultSchedule.startTime = `${startHour}:${startMin} ${startPeriod.toUpperCase()}`;
        defaultSchedule.endTime = `${endHour}:${endMin} ${endPeriod.toUpperCase()}`;
      }

      defaultSchedule.days = days;
      return defaultSchedule;
    } catch (error) {
      console.error('Error parsing timeframe:', error);
      return defaultSchedule;
    }
  };

  const [schedule, setSchedule] = useState<StructuredResourceSchedule>(() => 
    parseTimeframe(resourceInfo.timeframe)
  );

  // Generate time options in 15-minute increments
  const generateTimeOptions = () => {
    const times: string[] = [];
    const periods = ['AM', 'PM'];
    
    periods.forEach(period => {
      const startHour = period === 'AM' ? 7 : 12;
      const endHour = period === 'AM' ? 11 : 15; // 7AM-11:45AM, 12PM-3:45PM (school hours)
      
      for (let hour = startHour; hour <= endHour; hour++) {
        for (let minute = 0; minute < 60; minute += 15) {
          const displayHour = period === 'AM' ? hour : (hour === 12 ? 12 : hour - 12);
          const timeString = `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
          times.push(timeString);
        }
      }
    });
    
    return times;
  };

  const timeOptions = generateTimeOptions();

  // Service types
  const serviceTypes = [
    { value: '', label: 'Select a service...', color: '#gray' },
    { value: 'Speech Therapy', label: 'Speech Therapy', color: '#3b82f6' },
    { value: 'Occupational Therapy', label: 'Occupational Therapy (OT)', color: '#10b981' },
    { value: 'Physical Therapy', label: 'Physical Therapy (PT)', color: '#f59e0b' },
    { value: 'Reading Support', label: 'Reading Support', color: '#ef4444' },
    { value: 'Math Support', label: 'Math Support', color: '#8b5cf6' },
    { value: 'Counseling', label: 'Counseling', color: '#06b6d4' },
    { value: 'ESL Support', label: 'ESL Support', color: '#84cc16' },
    { value: 'Behavior Support', label: 'Behavior Support', color: '#f97316' },
    { value: 'Life Skills', label: 'Life Skills', color: '#6366f1' },
    { value: 'Other', label: 'Other Service', color: '#64748b' }
  ];

  // Days of the week
  const daysOfWeek = [
    { value: 'Monday', label: 'Monday', abbr: 'M' },
    { value: 'Tuesday', label: 'Tuesday', abbr: 'T' },
    { value: 'Wednesday', label: 'Wednesday', abbr: 'W' },
    { value: 'Thursday', label: 'Thursday', abbr: 'Th' },
    { value: 'Friday', label: 'Friday', abbr: 'F' }
  ];

  // Convert structured schedule back to timeframe string
  const generateTimeframe = (schedule: StructuredResourceSchedule): string => {
    if (!schedule.attendsResource || schedule.days.length === 0) {
      return '';
    }

    // Create day abbreviations
    const dayAbbrs = schedule.days.map(day => {
      switch(day) {
        case 'Monday': return 'M';
        case 'Tuesday': return 'T';
        case 'Wednesday': return 'W';
        case 'Thursday': return 'Th';
        case 'Friday': return 'F';
        default: return day.substring(0, 3);
      }
    });

    const dayString = dayAbbrs.join('');
    return `${dayString} ${schedule.startTime}-${schedule.endTime}`;
  };

  // Update parent component when schedule changes
  useEffect(() => {
    const newTimeframe = generateTimeframe(schedule);
    onChange({
      attendsResource: schedule.attendsResource,
      resourceType: schedule.resourceType,
      resourceTeacher: schedule.resourceTeacher,
      timeframe: newTimeframe
    });
  }, [schedule]); // Removed onChange from dependencies to prevent infinite loop

  const handleResourceToggle = (checked: boolean) => {
    setSchedule(prev => ({
      ...prev,
      attendsResource: checked,
      resourceType: checked ? prev.resourceType : '',
      resourceTeacher: checked ? prev.resourceTeacher : '',
      days: checked ? prev.days : [],
      startTime: checked ? prev.startTime : '9:00 AM',
      endTime: checked ? prev.endTime : '9:30 AM'
    }));
  };

  const handleDayToggle = (day: string) => {
    setSchedule(prev => ({
      ...prev,
      days: prev.days.includes(day) 
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day].sort((a, b) => {
            const order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
            return order.indexOf(a) - order.indexOf(b);
          })
    }));
  };

  // Validation
  const isValidSchedule = schedule.attendsResource && 
                         schedule.resourceType && 
                         schedule.resourceTeacher && 
                         schedule.days.length > 0 &&
                         schedule.startTime &&
                         schedule.endTime;

  // Time conflict validation
  const hasTimeConflict = () => {
    const startTime = new Date(`2000-01-01 ${schedule.startTime}`);
    const endTime = new Date(`2000-01-01 ${schedule.endTime}`);
    return endTime <= startTime;
  };

  const selectedServiceType = serviceTypes.find(s => s.value === schedule.resourceType);

  return (
    <div style={styles.container}>
      <div style={styles.sectionTitle}>
        <Calendar className="w-5 h-5" />
        Resource Services Configuration
      </div>

      {/* Main Toggle */}
      <div style={styles.toggleSection}>
        <label style={styles.toggleLabel}>
          <input
            type="checkbox"
            checked={schedule.attendsResource}
            onChange={(e) => handleResourceToggle(e.target.checked)}
            style={styles.checkbox}
          />
          <span style={styles.toggleText}>🎯 Student receives resource services</span>
        </label>
      </div>

      {schedule.attendsResource && (
        <div style={styles.detailsSection}>
          
          {/* Service Type */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              <User className="w-4 h-4" />
              Service Type *
            </label>
            <select
              value={schedule.resourceType}
              onChange={(e) => setSchedule(prev => ({ ...prev, resourceType: e.target.value }))}
              style={{
                ...styles.select,
                borderColor: selectedServiceType?.color || '#e5e7eb'
              }}
              required
            >
              {serviceTypes.map(service => (
                <option key={service.value} value={service.value}>
                  {service.label}
                </option>
              ))}
            </select>
          </div>

          {/* Teacher/Therapist */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              <User className="w-4 h-4" />
              Teacher/Therapist *
            </label>
            <TeacherSelector
              value={schedule.resourceTeacher}
              onChange={(teacher) => setSchedule(prev => ({ ...prev, resourceTeacher: teacher }))}
              serviceType={schedule.resourceType}
            />
          </div>

          {/* Days Selection */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              <Calendar className="w-4 h-4" />
              Days of the Week *
            </label>
            <div style={styles.daysGrid}>
              {daysOfWeek.map(day => (
                <label key={day.value} style={styles.dayLabel}>
                  <input
                    type="checkbox"
                    checked={schedule.days.includes(day.value)}
                    onChange={() => handleDayToggle(day.value)}
                    style={styles.dayCheckbox}
                  />
                  <span style={{
                    ...styles.dayButton,
                    ...(schedule.days.includes(day.value) ? styles.dayButtonActive : {})
                  }}>
                    <div style={styles.dayAbbr}>{day.abbr}</div>
                    <div style={styles.dayName}>{day.label}</div>
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Time Selection */}
          <div style={styles.timeSection}>
            <div style={styles.formGroup}>
              <label style={styles.label}>
                <Clock className="w-4 h-4" />
                Start Time *
              </label>
              <select
                value={schedule.startTime}
                onChange={(e) => setSchedule(prev => ({ ...prev, startTime: e.target.value }))}
                style={styles.select}
                required
              >
                <option value="">Select start time...</option>
                {timeOptions.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                <Clock className="w-4 h-4" />
                End Time *
              </label>
              <select
                value={schedule.endTime}
                onChange={(e) => setSchedule(prev => ({ ...prev, endTime: e.target.value }))}
                style={styles.select}
                required
              >
                <option value="">Select end time...</option>
                {timeOptions.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Validation Messages */}
          {hasTimeConflict() && (
            <div style={styles.errorMessage}>
              <AlertTriangle className="w-4 h-4" />
              End time must be after start time
            </div>
          )}

          {/* Schedule Preview */}
          {isValidSchedule && !hasTimeConflict() && (
            <div style={styles.previewSection}>
              <div style={styles.previewHeader}>
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span style={styles.previewTitle}>Schedule Preview</span>
              </div>
              <div style={styles.previewContent}>
                <div style={styles.previewStudent}>
                  <strong>{studentName}</strong> will attend <strong>{schedule.resourceType}</strong>
                </div>
                <div style={styles.previewDetails}>
                  with <strong>{schedule.resourceTeacher}</strong>
                </div>
                <div style={styles.previewTime}>
                  {schedule.days.map(day => day.charAt(0)).join('')} {schedule.startTime} - {schedule.endTime}
                </div>
                <div style={styles.previewDays}>
                  {schedule.days.join(', ')}
                </div>
              </div>
            </div>
          )}

          {/* Help Text */}
          <div style={styles.helpSection}>
            <div style={styles.helpTitle}>💡 Tips:</div>
            <ul style={styles.helpList}>
              <li>Select the days your student will be pulled out for services</li>
              <li>Choose times during your regular class schedule</li>
              <li>Times are in 15-minute increments for easy scheduling</li>
              <li>The system will automatically track when students are out of class</li>
            </ul>
          </div>
        </div>
      )}

      {/* No Services Message */}
      {!schedule.attendsResource && (
        <div style={styles.noServicesSection}>
          <div style={styles.noServicesIcon}>🎒</div>
          <div style={styles.noServicesText}>
            <strong>{studentName}</strong> does not currently receive resource services.
            <br />
            Check the box above to configure resource services.
          </div>
        </div>
      )}
    </div>
  );
};

// Clean, professional styles
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    background: 'rgba(59, 130, 246, 0.05)',
    borderRadius: '16px',
    padding: '2rem',
    border: '1px solid rgba(59, 130, 246, 0.1)'
  },

  sectionTitle: {
    fontSize: '1.2rem',
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },

  toggleSection: {
    marginBottom: '1.5rem',
    padding: '1rem',
    background: 'rgba(59, 130, 246, 0.1)',
    borderRadius: '12px',
    border: '2px solid rgba(59, 130, 246, 0.2)'
  },

  toggleLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    cursor: 'pointer',
    fontSize: '1rem'
  },

  checkbox: {
    width: '1.5rem',
    height: '1.5rem',
    cursor: 'pointer'
  },

  toggleText: {
    fontWeight: '600',
    color: '#1e40af'
  },

  detailsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },

  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },

  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#374151'
  },

  select: {
    padding: '0.75rem',
    borderRadius: '8px',
    border: '2px solid #e5e7eb',
    fontSize: '1rem',
    backgroundColor: 'white',
    transition: 'border-color 0.2s ease'
  },

  input: {
    padding: '0.75rem',
    borderRadius: '8px',
    border: '2px solid #e5e7eb',
    fontSize: '1rem',
    backgroundColor: 'white',
    transition: 'border-color 0.2s ease'
  },

  daysGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '0.5rem'
  },

  dayLabel: {
    cursor: 'pointer'
  },

  dayCheckbox: {
    display: 'none'
  },

  dayButton: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '0.75rem 0.5rem',
    borderRadius: '8px',
    border: '2px solid #e5e7eb',
    backgroundColor: 'white',
    transition: 'all 0.2s ease',
    cursor: 'pointer'
  },

  dayButtonActive: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
    color: '#1e40af'
  },

  dayAbbr: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    marginBottom: '0.25rem'
  },

  dayName: {
    fontSize: '0.7rem'
  },

  timeSection: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem'
  },

  errorMessage: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem',
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    borderRadius: '8px',
    border: '1px solid #fecaca',
    fontSize: '0.9rem'
  },

  previewSection: {
    padding: '1rem',
    backgroundColor: '#f0fdf4',
    borderRadius: '12px',
    border: '1px solid #bbf7d0'
  },

  previewHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.75rem'
  },

  previewTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#15803d'
  },

  previewContent: {
    fontSize: '0.9rem',
    color: '#374151',
    lineHeight: '1.5'
  },

  previewStudent: {
    marginBottom: '0.5rem'
  },

  previewDetails: {
    marginBottom: '0.5rem'
  },

  previewTime: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#15803d',
    marginBottom: '0.25rem'
  },

  previewDays: {
    fontSize: '0.8rem',
    color: '#6b7280'
  },

  helpSection: {
    padding: '1rem',
    backgroundColor: '#fef9e7',
    borderRadius: '8px',
    border: '1px solid #fde047'
  },

  helpTitle: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#a16207',
    marginBottom: '0.5rem'
  },

  helpList: {
    fontSize: '0.8rem',
    color: '#92400e',
    paddingLeft: '1rem',
    margin: 0
  },

  noServicesSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '2rem',
    backgroundColor: '#f9fafb',
    borderRadius: '12px',
    border: '1px solid #e5e7eb'
  },

  noServicesIcon: {
    fontSize: '3rem',
    marginBottom: '1rem'
  },

  noServicesText: {
    textAlign: 'center',
    color: '#6b7280',
    lineHeight: '1.5'
  }
};

export default EnhancedResourceInput;
