import React, { createContext, useContext, useMemo, useCallback } from 'react';

// Using your existing unified data structure
interface UnifiedStudent {
  id: string;
  name: string;
  grade: string;
  photo?: string;
  dateCreated: string;
  notes?: string;
  accommodations?: string[];
  goals?: string[];
  preferredPartners?: string[];
  avoidPartners?: string[];
  resourceInfo?: {
    attendsResource: boolean;
    resourceType: string;
    resourceTeacher: string;
    timeframe: string;
    parsedSchedule?: ResourceSchedule[];
  };
  iepData?: {
    goals: any[];
    dataCollection: any[];
  };
  calendarPreferences?: any;
  schedulePreferences?: any;
  analytics?: any;
}

interface ResourceSchedule {
  day: string;
  startTime: string;
  endTime: string;
  serviceType: string;
  teacher: string;
  location?: string;
}

interface StudentPullOut {
  student: UnifiedStudent;
  currentService: ResourceSchedule;
  timeRemaining?: number;
}

interface ResourceScheduleContextType {
  // Current pull-out status
  getCurrentPullOuts: (currentTime?: Date) => StudentPullOut[];
  getUpcomingPullOuts: (currentTime?: Date, nextMinutes?: number) => StudentPullOut[];
  
  // Schedule parsing and validation
  parseResourceSchedule: (timeframe: string, serviceType: string, teacher: string) => ResourceSchedule[];
  isStudentInPullOut: (studentId: string, currentTime?: Date) => boolean;
  getStudentCurrentService: (studentId: string, currentTime?: Date) => ResourceSchedule | null;
  
  // Conflict detection
  hasScheduleConflict: (activityTime: string, day?: string) => { hasConflict: boolean; conflictingStudents: UnifiedStudent[] };
  filterAvailableStudents: (students: UnifiedStudent[], currentTime?: Date) => UnifiedStudent[];
  
  // Utility functions
  formatTimeRange: (schedule: ResourceSchedule) => string;
  getServiceColor: (serviceType: string) => string;
  getAllResourceStudents: () => UnifiedStudent[];
}

const ResourceScheduleContext = createContext<ResourceScheduleContextType | undefined>(undefined);

interface ResourceScheduleProviderProps {
  children: React.ReactNode;
  allStudents: UnifiedStudent[];
}

export const ResourceScheduleProvider: React.FC<ResourceScheduleProviderProps> = ({
  children,
  allStudents
}) => {
  // Parse timeframe strings into structured schedules
  const parseResourceSchedule = useCallback((timeframe: string, serviceType: string, teacher: string): ResourceSchedule[] => {
    if (!timeframe) return [];
    
    try {
      const schedules: ResourceSchedule[] = [];
      
      // Common patterns:
      // "Tuesdays 10:00-10:30"
      // "Monday/Wednesday 2:00-2:30"  
      // "10:00-10:30 AM, Tuesdays & Thursdays"
      // "MWF 9:00-9:30"
      
      const timeframeUpper = timeframe.toUpperCase();
      
      // Extract time range
      const timeMatch = timeframe.match(/(\d{1,2}):(\d{2})\s*(?:AM|PM)?\s*-\s*(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
      if (!timeMatch) return [];
      
      const [, startHour, startMin, endHour, endMin, period] = timeMatch;
      const startTime = formatTime(startHour, startMin, period);
      const endTime = formatTime(endHour, endMin, period);
      
      // Extract days
      const days: string[] = [];
      if (timeframeUpper.includes('MONDAY') || timeframeUpper.includes('MON')) days.push('Monday');
      if (timeframeUpper.includes('TUESDAY') || timeframeUpper.includes('TUE')) days.push('Tuesday');
      if (timeframeUpper.includes('WEDNESDAY') || timeframeUpper.includes('WED')) days.push('Wednesday');
      if (timeframeUpper.includes('THURSDAY') || timeframeUpper.includes('THU')) days.push('Thursday');
      if (timeframeUpper.includes('FRIDAY') || timeframeUpper.includes('FRI')) days.push('Friday');
      
      // Handle abbreviations like MWF
      if (timeframeUpper.includes('MWF')) {
        days.push('Monday', 'Wednesday', 'Friday');
      }
      if (timeframeUpper.includes('TTH') || timeframeUpper.includes('T/TH')) {
        days.push('Tuesday', 'Thursday');
      }
      
      // Create schedule entries for each day
      days.forEach(day => {
        schedules.push({
          day,
          startTime,
          endTime,
          serviceType,
          teacher,
        });
      });
      
      return schedules;
    } catch (error) {
      console.warn('Error parsing resource schedule:', timeframe, error);
      return [];
    }
  }, []);

  // Helper function to format time with AM/PM
  const formatTime = (hour: string, minute: string, period?: string) => {
    let h = parseInt(hour);
    if (period?.toUpperCase() === 'PM' && h !== 12) h += 12;
    if (period?.toUpperCase() === 'AM' && h === 12) h = 0;
    return `${h.toString().padStart(2, '0')}:${minute}`;
  };

  // Get all students with resource services
  const getAllResourceStudents = useCallback(() => {
    return allStudents.filter(student => student.resourceInfo?.attendsResource);
  }, [allStudents]);

  // Parse all student schedules
  const studentsWithParsedSchedules = useMemo(() => {
    return allStudents.map(student => {
      if (student.resourceInfo?.attendsResource && student.resourceInfo.timeframe) {
        const parsedSchedule = parseResourceSchedule(
          student.resourceInfo.timeframe,
          student.resourceInfo.resourceType,
          student.resourceInfo.resourceTeacher
        );
        return {
          ...student,
          resourceInfo: {
            ...student.resourceInfo,
            parsedSchedule
          }
        };
      }
      return student;
    });
  }, [allStudents, parseResourceSchedule]);

  // Get students currently in pull-out
  const getCurrentPullOuts = useCallback((currentTime: Date = new Date()): StudentPullOut[] => {
    const currentDay = currentTime.toLocaleDateString('en-US', { weekday: 'long' });
    const currentTimeStr = currentTime.toTimeString().substring(0, 5); // HH:MM format
    
    const pullOuts: StudentPullOut[] = [];
    
    studentsWithParsedSchedules.forEach(student => {
      if (!student.resourceInfo?.parsedSchedule) return;
      
      student.resourceInfo.parsedSchedule.forEach(schedule => {
        if (schedule.day === currentDay && 
            currentTimeStr >= schedule.startTime && 
            currentTimeStr <= schedule.endTime) {
          
          // Calculate time remaining
          const endTime = new Date(currentTime);
          const [endHour, endMin] = schedule.endTime.split(':').map(Number);
          endTime.setHours(endHour, endMin, 0, 0);
          const timeRemaining = Math.max(0, Math.floor((endTime.getTime() - currentTime.getTime()) / 60000));
          
          pullOuts.push({
            student,
            currentService: schedule,
            timeRemaining
          });
        }
      });
    });
    
    return pullOuts;
  }, [studentsWithParsedSchedules]);

  // Get upcoming pull-outs in the next X minutes
  const getUpcomingPullOuts = useCallback((currentTime: Date = new Date(), nextMinutes: number = 30): StudentPullOut[] => {
    const currentDay = currentTime.toLocaleDateString('en-US', { weekday: 'long' });
    const currentTimeStr = currentTime.toTimeString().substring(0, 5);
    
    const futureTime = new Date(currentTime.getTime() + nextMinutes * 60000);
    const futureTimeStr = futureTime.toTimeString().substring(0, 5);
    
    const upcomingPullOuts: StudentPullOut[] = [];
    
    studentsWithParsedSchedules.forEach(student => {
      if (!student.resourceInfo?.parsedSchedule) return;
      
      student.resourceInfo.parsedSchedule.forEach(schedule => {
        if (schedule.day === currentDay && 
            schedule.startTime > currentTimeStr && 
            schedule.startTime <= futureTimeStr) {
          
          upcomingPullOuts.push({
            student,
            currentService: schedule
          });
        }
      });
    });
    
    return upcomingPullOuts;
  }, [studentsWithParsedSchedules]);

  // Check if specific student is currently in pull-out
  const isStudentInPullOut = useCallback((studentId: string, currentTime: Date = new Date()): boolean => {
    const currentPullOuts = getCurrentPullOuts(currentTime);
    return currentPullOuts.some(pullOut => pullOut.student.id === studentId);
  }, [getCurrentPullOuts]);

  // Get current service for a student
  const getStudentCurrentService = useCallback((studentId: string, currentTime: Date = new Date()): ResourceSchedule | null => {
    const currentPullOuts = getCurrentPullOuts(currentTime);
    const studentPullOut = currentPullOuts.find(pullOut => pullOut.student.id === studentId);
    return studentPullOut?.currentService || null;
  }, [getCurrentPullOuts]);

  // Detect schedule conflicts
  const hasScheduleConflict = useCallback((activityTime: string, day?: string): { hasConflict: boolean; conflictingStudents: UnifiedStudent[] } => {
    const checkDay = day || new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const conflictingStudents: UnifiedStudent[] = [];
    
    studentsWithParsedSchedules.forEach(student => {
      if (!student.resourceInfo?.parsedSchedule) return;
      
      student.resourceInfo.parsedSchedule.forEach(schedule => {
        if (schedule.day === checkDay) {
          // Check if activity time overlaps with resource time
          if (timeRangesOverlap(activityTime, `${schedule.startTime}-${schedule.endTime}`)) {
            conflictingStudents.push(student);
          }
        }
      });
    });
    
    return {
      hasConflict: conflictingStudents.length > 0,
      conflictingStudents
    };
  }, [studentsWithParsedSchedules]);

  // Filter students available for activities (not in pull-out)
  const filterAvailableStudents = useCallback((students: UnifiedStudent[], currentTime: Date = new Date()): UnifiedStudent[] => {
    const currentPullOuts = getCurrentPullOuts(currentTime);
    const pullOutStudentIds = currentPullOuts.map(pullOut => pullOut.student.id);
    
    return students.filter(student => !pullOutStudentIds.includes(student.id));
  }, [getCurrentPullOuts]);

  // Helper function to check time range overlap
  const timeRangesOverlap = (range1: string, range2: string): boolean => {
    try {
      const [start1, end1] = range1.split('-');
      const [start2, end2] = range2.split('-');
      
      return start1 < end2 && start2 < end1;
    } catch {
      return false;
    }
  };

  // Utility functions
  const formatTimeRange = useCallback((schedule: ResourceSchedule): string => {
    return `${schedule.startTime}-${schedule.endTime}`;
  }, []);

  const getServiceColor = useCallback((serviceType: string): string => {
    const colors = {
      'Speech Therapy': '#8B5CF6',
      'Occupational Therapy': '#10B981',
      'Physical Therapy': '#3B82F6',
      'Counseling': '#F59E0B',
      'Reading Support': '#EF4444',
      'Math Support': '#F97316',
      'ESL': '#EC4899'
    };
    return colors[serviceType] || '#6B7280';
  }, []);

  const value: ResourceScheduleContextType = {
    getCurrentPullOuts,
    getUpcomingPullOuts,
    parseResourceSchedule,
    isStudentInPullOut,
    getStudentCurrentService,
    hasScheduleConflict,
    filterAvailableStudents,
    formatTimeRange,
    getServiceColor,
    getAllResourceStudents
  };

  return (
    <ResourceScheduleContext.Provider value={value}>
      {children}
    </ResourceScheduleContext.Provider>
  );
};

export const useResourceSchedule = (): ResourceScheduleContextType => {
  const context = useContext(ResourceScheduleContext);
  if (context === undefined) {
    throw new Error('useResourceSchedule must be used within a ResourceScheduleProvider');
  }
  return context;
};

export default ResourceScheduleProvider;