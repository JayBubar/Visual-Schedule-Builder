import React, { createContext, useContext, useMemo, useCallback } from 'react';
import UnifiedDataService, { UnifiedStudent } from './unifiedDataService';

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
}

export const ResourceScheduleProvider: React.FC<ResourceScheduleProviderProps> = ({
  children
}) => {
  // Get all students from UnifiedDataService
  const allStudents = useMemo(() => {
    try {
      return UnifiedDataService.getAllStudents();
    } catch (error) {
      console.error('ResourceScheduleManager: Error loading students from UnifiedDataService:', error);
      return [];
    }
  }, []);
  // Parse timeframe strings into structured schedules
  const parseResourceSchedule = useCallback((timeframe: string, serviceType: string, teacher: string): ResourceSchedule[] => {
    if (!timeframe) return [];
    
    try {
      const schedules: ResourceSchedule[] = [];
      
      console.log('🔍 Parsing resource schedule:', { timeframe, serviceType, teacher });
      
      // NEW: Handle EnhancedResourceInput format: "MTW 10:00 AM-11:30 AM"
      // OLD: Handle legacy formats: "Tuesdays 10:00-10:30", "Monday/Wednesday 2:00-2:30", "MWF 9:00-9:30"
      
      const timeframeUpper = timeframe.toUpperCase();
      
      // Extract time range - Updated to handle AM/PM properly
      const timeMatch = timeframe.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?\s*-\s*(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
      if (!timeMatch) {
        console.warn('❌ No time pattern found in:', timeframe);
        return [];
      }
      
      const [, startHour, startMin, startPeriod, endHour, endMin, endPeriod] = timeMatch;
      const startTime = formatTime(startHour, startMin, startPeriod);
      const endTime = formatTime(endHour, endMin, endPeriod);
      
      console.log('⏰ Parsed times:', { startTime, endTime });
      
      // Extract days - Enhanced to handle new format
      const days: string[] = [];
      
      // NEW: Handle compact day abbreviations like "MTW", "MTWF", "MTWThF", etc.
      const compactDayMatch = timeframe.match(/^([MTWThF]+)\s+/);
      console.log('🔍 Compact day match attempt:', { timeframe, compactDayMatch });
      
      if (compactDayMatch) {
        const dayString = compactDayMatch[1];
        console.log('📅 Found compact day format:', dayString);
        
        // Parse the day string, handling "Th" for Thursday
        let i = 0;
        while (i < dayString.length) {
          const char = dayString[i];
          const nextChar = dayString[i + 1];
          
          console.log(`🔤 Parsing character at position ${i}: '${char}', next: '${nextChar}'`);
          
          if (char === 'M') {
            days.push('Monday');
            console.log('✅ Added Monday');
            i++;
          } else if (char === 'T' && nextChar === 'h') {
            days.push('Thursday');
            console.log('✅ Added Thursday');
            i += 2; // Skip both 'T' and 'h'
          } else if (char === 'T') {
            days.push('Tuesday');
            console.log('✅ Added Tuesday');
            i++;
          } else if (char === 'W') {
            days.push('Wednesday');
            console.log('✅ Added Wednesday');
            i++;
          } else if (char === 'F') {
            days.push('Friday');
            console.log('✅ Added Friday');
            i++;
          } else {
            console.log(`⚠️ Unknown character: '${char}'`);
            i++; // Skip unknown characters
          }
        }
      } else {
        // LEGACY: Handle full day names and other patterns
        if (timeframeUpper.includes('MONDAY') || timeframeUpper.includes('MON')) days.push('Monday');
        if (timeframeUpper.includes('TUESDAY') || timeframeUpper.includes('TUE')) days.push('Tuesday');
        if (timeframeUpper.includes('WEDNESDAY') || timeframeUpper.includes('WED')) days.push('Wednesday');
        if (timeframeUpper.includes('THURSDAY') || timeframeUpper.includes('THU')) days.push('Thursday');
        if (timeframeUpper.includes('FRIDAY') || timeframeUpper.includes('FRI')) days.push('Friday');
        
        // Handle legacy abbreviations like MWF (but not the new compact format)
        if (timeframeUpper.includes('MWF') && !compactDayMatch) {
          days.push('Monday', 'Wednesday', 'Friday');
        }
        if (timeframeUpper.includes('TTH') || timeframeUpper.includes('T/TH')) {
          days.push('Tuesday', 'Thursday');
        }
      }
      
      console.log('📅 Parsed days:', days);
      
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
      
      console.log('✅ Created schedules:', schedules);
      return schedules;
    } catch (error) {
      console.error('❌ Error parsing resource schedule:', timeframe, error);
      return [];
    }
  }, []);

  // Helper function to format time with AM/PM - Enhanced for better AM/PM handling
  const formatTime = (hour: string, minute: string, period?: string) => {
    let h = parseInt(hour);
    
    // Handle AM/PM conversion to 24-hour format
    if (period) {
      const periodUpper = period.toUpperCase();
      if (periodUpper === 'PM' && h !== 12) {
        h += 12;
      } else if (periodUpper === 'AM' && h === 12) {
        h = 0;
      }
    }
    
    const formattedTime = `${h.toString().padStart(2, '0')}:${minute}`;
    console.log(`🕐 Formatted time: ${hour}:${minute} ${period || ''} -> ${formattedTime}`);
    return formattedTime;
  };

  // Get all students with resource services
  const getAllResourceStudents = useCallback(() => {
    return allStudents.filter(student => 
      (student as any).resourceInfo?.attendsResource || 
      student.resourceInformation?.attendsResourceServices
    );
  }, [allStudents]);

  // Parse all student schedules
  const studentsWithParsedSchedules = useMemo(() => {
    return allStudents.map(student => {
      // Handle both old and new resource info structures
      const studentAny = student as any;
      const resourceInfo = studentAny.resourceInfo || {
        attendsResource: student.resourceInformation?.attendsResourceServices || false,
        resourceType: student.resourceInformation?.relatedServices?.[0] || 'Resource Services',
        resourceTeacher: 'Resource Teacher',
        timeframe: ''
      };

      if (resourceInfo.attendsResource && resourceInfo.timeframe) {
        const parsedSchedule = parseResourceSchedule(
          resourceInfo.timeframe,
          resourceInfo.resourceType,
          resourceInfo.resourceTeacher
        );
        return {
          ...student,
          resourceInfo: {
            ...resourceInfo,
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
    
    console.log('🔍 getCurrentPullOuts called:', {
      currentTime: currentTime.toISOString(),
      currentDay,
      currentTimeStr,
      totalStudents: studentsWithParsedSchedules.length
    });
    
    // ENHANCED DEBUG: Log all students and their resource info
    console.log('👥 All students with resource info:');
    studentsWithParsedSchedules.forEach((student, index) => {
      const studentAny = student as any;
      console.log(`  ${index + 1}. ${student.name}:`, {
        hasResourceInfo: !!studentAny.resourceInfo,
        attendsResource: studentAny.resourceInfo?.attendsResource,
        resourceType: studentAny.resourceInfo?.resourceType,
        timeframe: studentAny.resourceInfo?.timeframe,
        hasParsedSchedule: !!studentAny.resourceInfo?.parsedSchedule,
        parsedScheduleLength: studentAny.resourceInfo?.parsedSchedule?.length || 0
      });
    });
    
    const pullOuts: StudentPullOut[] = [];
    
    studentsWithParsedSchedules.forEach(student => {
      const studentAny = student as any;
      
      // Debug each student's resource info
      if (studentAny.resourceInfo?.attendsResource) {
        console.log(`👤 Checking student: ${student.name}`, {
          attendsResource: studentAny.resourceInfo.attendsResource,
          timeframe: studentAny.resourceInfo.timeframe,
          parsedSchedule: studentAny.resourceInfo.parsedSchedule
        });
      }
      
      if (!studentAny.resourceInfo?.parsedSchedule) return;
      
      studentAny.resourceInfo.parsedSchedule.forEach((schedule: ResourceSchedule) => {
        console.log(`📅 Checking schedule for ${student.name}:`, {
          scheduleDay: schedule.day,
          currentDay,
          scheduleStart: schedule.startTime,
          scheduleEnd: schedule.endTime,
          currentTime: currentTimeStr,
          dayMatch: schedule.day === currentDay,
          timeInRange: currentTimeStr >= schedule.startTime && currentTimeStr <= schedule.endTime
        });
        
        if (schedule.day === currentDay && 
            currentTimeStr >= schedule.startTime && 
            currentTimeStr <= schedule.endTime) {
          
          console.log(`✅ PULLOUT DETECTED: ${student.name} is in ${schedule.serviceType}`);
          
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
    
    console.log(`🏫 Total pullouts found: ${pullOuts.length}`, pullOuts.map(p => ({
      student: p.student.name,
      service: p.currentService.serviceType,
      timeRemaining: p.timeRemaining
    })));
    
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
      const studentAny = student as any;
      if (!studentAny.resourceInfo?.parsedSchedule) return;
      
      studentAny.resourceInfo.parsedSchedule.forEach((schedule: ResourceSchedule) => {
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
      const studentAny = student as any;
      if (!studentAny.resourceInfo?.parsedSchedule) return;
      
      studentAny.resourceInfo.parsedSchedule.forEach((schedule: ResourceSchedule) => {
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
