import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Clock, MapPin, Calendar } from 'lucide-react';

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

interface OutOfClassDisplayProps {
  studentsInPullOut: StudentPullOut[];
  className?: string;
}

const OutOfClassDisplay: React.FC<OutOfClassDisplayProps> = ({
  studentsInPullOut,
  className = ''
}) => {
  if (studentsInPullOut.length === 0) {
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

  return (
    <motion.div 
      className={`absolute top-4 right-4 bg-black/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-lg max-w-sm ${className}`}
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