import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Clock, MapPin, Calendar } from 'lucide-react';
import UnifiedDataService from '../../services/unifiedDataService';

// Import the actual UnifiedStudent type from UnifiedDataService
import { UnifiedStudent } from '../../services/unifiedDataService';

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

interface OutOfClassDisplayProps {
  className?: string;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

const OutOfClassDisplay: React.FC<OutOfClassDisplayProps> = ({
  className = '',
  position = 'top-right'
}) => {
  const [studentsInPullOut, setStudentsInPullOut] = useState<StudentPullOut[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // Get students currently in pull-out
  const getCurrentPullOuts = useCallback((currentTime: Date = new Date()): StudentPullOut[] => {
    const currentDay = currentTime.toLocaleDateString('en-US', { weekday: 'long' });
    const currentTimeStr = currentTime.toTimeString().substring(0, 5); // HH:MM format
    
    const pullOuts: StudentPullOut[] = [];
    
    try {
      // Get all students from UnifiedDataService
      const allStudents = UnifiedDataService.getAllStudents();
      
      // Filter students with resource services
      const resourceStudents = allStudents.filter(student => 
        (student as any).resourceInfo?.attendsResource || 
        student.resourceInformation?.attendsResourceServices
      );
      
      resourceStudents.forEach(student => {
        // Handle both old and new resource info structures
        const studentAny = student as any;
        const resourceInfo = studentAny.resourceInfo || {
          attendsResource: student.resourceInformation?.attendsResourceServices || false,
          resourceType: student.resourceInformation?.relatedServices?.[0] || 'Resource Services',
          resourceTeacher: 'Resource Teacher',
          timeframe: ''
        };
        
        if (!resourceInfo.timeframe) return;
        
        const parsedSchedule = parseResourceSchedule(
          resourceInfo.timeframe,
          resourceInfo.resourceType,
          resourceInfo.resourceTeacher
        );
        
        parsedSchedule.forEach(schedule => {
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
      
    } catch (err) {
      console.error('Error getting current pull-outs:', err);
      setError('Failed to load resource students');
    }
    
    return pullOuts;
  }, [parseResourceSchedule]);

  // Load current pull-out data
  const loadData = useCallback(() => {
    setIsLoading(true);
    setError(null);
    
    try {
      const currentPullOuts = getCurrentPullOuts();
      setStudentsInPullOut(currentPullOuts);
      console.log('📚 Loaded pull-out students:', currentPullOuts.length);
    } catch (err) {
      console.error('Error loading pull-out data:', err);
      setError('Failed to load pull-out data');
      setStudentsInPullOut([]);
    } finally {
      setIsLoading(false);
    }
  }, [getCurrentPullOuts]);

  // Load data on mount and refresh every minute
  useEffect(() => {
    loadData();
    
    // Refresh every minute to keep pull-out status current
    const interval = setInterval(loadData, 60000);
    
    return () => clearInterval(interval);
  }, [loadData]);

  if (studentsInPullOut.length === 0 && !isLoading) {
    return null;
  }

  // Group by service type for better organization
  const serviceGroups = studentsInPullOut.reduce((groups, pullOut) => {
    const serviceType = pullOut.currentService.serviceType;
    if (!groups[serviceType]) {
      groups[serviceType] = [];
    }
    groups[serviceType].push(pullOut);
    return groups;
  }, {} as Record<string, StudentPullOut[]>);

  const getServiceColor = (serviceType: string) => {
    const colors = {
      'Speech Therapy': 'bg-purple-500/20 border-purple-300',
      'Occupational Therapy': 'bg-green-500/20 border-green-300',
      'Physical Therapy': 'bg-blue-500/20 border-blue-300',
      'Counseling': 'bg-yellow-500/20 border-yellow-300',
      'Reading Support': 'bg-red-500/20 border-red-300',
      'Math Support': 'bg-orange-500/20 border-orange-300',
      'ESL': 'bg-pink-500/20 border-pink-300',
      'default': 'bg-gray-500/20 border-gray-300'
    };
    return colors[serviceType] || colors.default;
  };

  const getServiceIcon = (serviceType: string) => {
    const icons = {
      'Speech Therapy': '🗣️',
      'Occupational Therapy': '✋',
      'Physical Therapy': '🏃',
      'Counseling': '💭',
      'Reading Support': '📚',
      'Math Support': '🔢',
      'ESL': '🌍'
    };
    return icons[serviceType] || '📋';
  };

  // Position styles based on position prop
  const getPositionStyles = () => {
    const baseStyles = {
      position: 'fixed' as const,
      zIndex: 100,
      maxWidth: '320px',
      transition: 'all 0.3s ease',
    };

    switch (position) {
      case 'top-left':
        return {
          ...baseStyles,
          top: '80px',
          left: '20px',
        };
      case 'top-right':
        return {
          ...baseStyles,
          top: '80px',
          right: '20px',
        };
      case 'bottom-left':
        return {
          ...baseStyles,
          bottom: '20px',
          left: '20px',
        };
      case 'bottom-right':
        return {
          ...baseStyles,
          bottom: '20px',
          right: '20px',
        };
      default:
        return {
          ...baseStyles,
          top: '80px',
          right: '20px',
        };
    }
  };

  return (
    <motion.div 
      style={getPositionStyles()}
      className={`bg-black/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-lg ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <MapPin className="w-4 h-4 text-white/70" />
        <h3 className="text-sm font-medium text-white/90">
          Out of Class
        </h3>
        <span className="bg-blue-500/20 text-blue-300 text-xs px-2 py-1 rounded-full">
          {studentsInPullOut.length}
        </span>
        
        {/* Loading/Error Indicators */}
        {isLoading && (
          <div className="bg-green-500/20 text-green-300 text-xs px-2 py-1 rounded-full">
            🔄
          </div>
        )}
        {error && (
          <div className="bg-red-500/20 text-red-300 text-xs px-2 py-1 rounded-full">
            ⚠️
          </div>
        )}
      </div>

      {/* Services Groups */}
      <div className="space-y-3">
        <AnimatePresence>
          {Object.entries(serviceGroups).map(([serviceType, students]) => (
            <motion.div
              key={serviceType}
              className={`rounded-lg p-2 border ${getServiceColor(serviceType)}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Service Type Header */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm">{getServiceIcon(serviceType)}</span>
                <span className="text-xs font-medium text-white/80">{serviceType}</span>
                <span className="text-xs text-white/60 ml-auto">
                  {students[0]?.currentService.teacher}
                </span>
              </div>

              {/* Students in this service */}
              <div className="grid grid-cols-2 gap-1">
                {students.map(({ student, currentService, timeRemaining }) => (
                  <motion.div
                    key={student.id}
                    className="bg-white/10 rounded p-1.5 text-center"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Student Photo */}
                    <div className="w-8 h-8 mx-auto mb-1 rounded-full overflow-hidden bg-white/20 border border-white/20">
                      {student.photo ? (
                        <img 
                          src={student.photo} 
                          alt={student.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-4 h-4 text-white/60" />
                        </div>
                      )}
                    </div>

                    {/* Student Name */}
                    <div className="text-xs text-white/80 font-medium leading-tight">
                      {student.name.split(' ')[0]} {/* First name only for space */}
                    </div>
                    
                    {/* Time Info */}
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <Clock className="w-2 h-2 text-white/60" />
                      <span className="text-xs text-white/60">
                        {currentService.endTime}
                      </span>
                    </div>

                    {/* Time Remaining (if available) */}
                    {timeRemaining && timeRemaining > 0 && (
                      <div className="text-xs text-white/50 mt-1">
                        {timeRemaining}min
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Service Time Range */}
              <div className="flex items-center justify-between mt-2 text-xs text-white/60">
                <span>
                  {students[0]?.currentService.startTime} - {students[0]?.currentService.endTime}
                </span>
                {students[0]?.currentService.location && (
                  <span>📍 {students[0]?.currentService.location}</span>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Footer Note */}
      <div className="mt-3 text-xs text-gray-400 text-center">
        Students will return to class activities
      </div>
    </motion.div>
  );
};

export default OutOfClassDisplay;
