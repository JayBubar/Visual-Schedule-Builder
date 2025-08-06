import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Clock, User, X } from 'lucide-react';
import { useResourceSchedule } from '../ResourceScheduleManager';

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
    parsedSchedule?: any[];
  };
  iepData?: {
    goals: any[];
    dataCollection: any[];
  };
  calendarPreferences?: any;
  schedulePreferences?: any;
  analytics?: any;
}

interface ScheduleConflictDetectorProps {
  activityTime: string;
  activityName: string;
  day?: string;
  assignedStudents?: UnifiedStudent[];
  onDismiss?: () => void;
  className?: string;
}

const ScheduleConflictDetector: React.FC<ScheduleConflictDetectorProps> = ({
  activityTime,
  activityName,
  day,
  assignedStudents = [],
  onDismiss,
  className = ''
}) => {
  const { hasScheduleConflict, getStudentCurrentService } = useResourceSchedule();
  
  // Check for conflicts
  const conflictCheck = hasScheduleConflict(activityTime, day);
  
  if (!conflictCheck.hasConflict) {
    return null;
  }

  // Filter conflicts to only assigned students if provided
  const relevantConflicts = assignedStudents.length > 0 
    ? conflictCheck.conflictingStudents.filter(student => 
        assignedStudents.some(assigned => assigned.id === student.id)
      )
    : conflictCheck.conflictingStudents;

  if (relevantConflicts.length === 0) {
    return null;
  }

  const getConflictSeverity = () => {
    const conflictRatio = relevantConflicts.length / (assignedStudents.length || relevantConflicts.length);
    if (conflictRatio >= 0.5) return 'high';
    if (conflictRatio >= 0.25) return 'medium';
    return 'low';
  };

  const severity = getConflictSeverity();
  
  const getSeverityStyles = () => {
    switch (severity) {
      case 'high':
        return {
          bg: 'bg-red-50 border-red-200',
          text: 'text-red-800',
          icon: 'text-red-500',
          badge: 'bg-red-500'
        };
      case 'medium':
        return {
          bg: 'bg-orange-50 border-orange-200',
          text: 'text-orange-800',
          icon: 'text-orange-500',
          badge: 'bg-orange-500'
        };
      default:
        return {
          bg: 'bg-yellow-50 border-yellow-200',
          text: 'text-yellow-800',
          icon: 'text-yellow-500',
          badge: 'bg-yellow-500'
        };
    }
  };

  const styles = getSeverityStyles();

  return (
    <AnimatePresence>
      <motion.div
        className={`border rounded-lg p-4 shadow-sm ${styles.bg} ${className}`}
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-start gap-3">
          {/* Warning Icon */}
          <div className="flex-shrink-0">
            <AlertTriangle className={`w-5 h-5 ${styles.icon}`} />
          </div>

          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <h4 className={`font-medium ${styles.text} flex items-center gap-2`}>
                Schedule Conflict Detected
                <span className={`text-xs px-2 py-1 rounded-full text-white ${styles.badge}`}>
                  {relevantConflicts.length} student{relevantConflicts.length !== 1 ? 's' : ''}
                </span>
              </h4>
              
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className={`${styles.text} hover:opacity-70 transition-opacity`}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Activity Info */}
            <div className={`text-sm ${styles.text} mb-3`}>
              <div className="flex items-center gap-1 mb-1">
                <Clock className="w-3 h-3" />
                <span className="font-medium">{activityName}</span>
                <span>at {activityTime}</span>
                {day && <span>on {day}</span>}
              </div>
              <p className="text-xs opacity-75">
                {relevantConflicts.length} student{relevantConflicts.length !== 1 ? 's have' : ' has'} conflicting resource services
              </p>
            </div>

            {/* Conflicting Students */}
            <div className="space-y-2">
              {relevantConflicts.map(student => {
                // Get the current service for context
                const currentService = getStudentCurrentService(student.id);
                const serviceInfo = student.resourceInfo;
                
                return (
                  <div
                    key={student.id}
                    className="flex items-center gap-3 bg-white/50 rounded-md p-2 border border-white/50"
                  >
                    {/* Student Photo */}
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 border flex-shrink-0">
                      {student.photo ? (
                        <img
                          src={student.photo}
                          alt={student.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Student Info */}
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-sm ${styles.text}`}>
                        {student.name}
                      </p>
                      <p className={`text-xs opacity-75 ${styles.text}`}>
                        {serviceInfo?.resourceType || 'Resource Service'} with {serviceInfo?.resourceTeacher || 'Resource Teacher'}
                      </p>
                      <p className={`text-xs opacity-60 ${styles.text}`}>
                        Scheduled: {serviceInfo?.timeframe}
                      </p>
                    </div>

                    {/* Service Type Badge */}
                    <div className={`px-2 py-1 rounded text-xs font-medium ${styles.badge} text-white`}>
                      {serviceInfo?.resourceType?.split(' ')[0] || 'Resource'}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Suggestions */}
            <div className={`mt-3 text-xs ${styles.text} opacity-75`}>
              <p className="font-medium mb-1">Suggestions:</p>
              <ul className="space-y-1 ml-4">
                <li>• Reschedule this activity to avoid resource service times</li>
                <li>• Remove conflicting students from this activity</li>
                <li>• Coordinate with resource teachers for flexibility</li>
                {severity === 'high' && (
                  <li className="font-medium">• Consider this a high-priority conflict</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ScheduleConflictDetector;
