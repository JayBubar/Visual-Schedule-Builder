import React, { useState, useEffect } from 'react';
import { Clock, User, Calendar, AlertTriangle } from 'lucide-react';

interface ResourceInfo {
  attendsResource: boolean;
  resourceType: string;
  resourceTeacher: string;
  timeframe: string;
}

interface EnhancedResourceInputProps {
  resourceInfo: ResourceInfo;
  onChange: (resourceInfo: ResourceInfo) => void;
  studentName?: string;
}

const EnhancedResourceInput: React.FC<EnhancedResourceInputProps> = ({
  resourceInfo,
  onChange,
  studentName
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [schedulePreview, setSchedulePreview] = useState<string>('');
  const [scheduleError, setScheduleError] = useState<string>('');

  // Common service types
  const serviceTypes = [
    'Speech Therapy',
    'Occupational Therapy', 
    'Physical Therapy',
    'Counseling',
    'Reading Support',
    'Math Support',
    'ESL',
    'Behavioral Support',
    'Life Skills',
    'Other'
  ];

  // Common time slots
  const timeSlots = [
    '8:00-8:30 AM',
    '8:30-9:00 AM',
    '9:00-9:30 AM',
    '9:30-10:00 AM',
    '10:00-10:30 AM',
    '10:30-11:00 AM',
    '11:00-11:30 AM',
    '11:30-12:00 PM',
    '12:00-12:30 PM',
    '12:30-1:00 PM',
    '1:00-1:30 PM',
    '1:30-2:00 PM',
    '2:00-2:30 PM',
    '2:30-3:00 PM',
    '3:00-3:30 PM',
    'Custom'
  ];

  // Days of the week
  const daysOfWeek = [
    { value: 'Monday', label: 'Monday', abbr: 'M' },
    { value: 'Tuesday', label: 'Tuesday', abbr: 'T' },
    { value: 'Wednesday', label: 'Wednesday', abbr: 'W' },
    { value: 'Thursday', label: 'Thursday', abbr: 'Th' },
    { value: 'Friday', label: 'Friday', abbr: 'F' }
  ];

  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [customTime, setCustomTime] = useState<string>('');

  // Parse existing timeframe when component mounts
  useEffect(() => {
    if (resourceInfo.timeframe) {
      parseExistingTimeframe(resourceInfo.timeframe);
    }
  }, []);

  // Generate schedule preview and validate
  useEffect(() => {
    if (selectedDays.length > 0 && (selectedTime !== 'Custom' ? selectedTime : customTime)) {
      const timeToUse = selectedTime === 'Custom' ? customTime : selectedTime;
      const daysText = selectedDays.length === 1 
        ? selectedDays[0] + 's'
        : selectedDays.length === 5
        ? 'Daily'
        : selectedDays.join('/');
      
      const preview = `${daysText} ${timeToUse}`;
      setSchedulePreview(preview);
      
      // Validate the schedule format
      validateSchedule(preview);
      
      // Update the parent component
      onChange({
        ...resourceInfo,
        timeframe: preview
      });
    } else {
      setSchedulePreview('');
      setScheduleError('');
    }
  }, [selectedDays, selectedTime, customTime]);

  const parseExistingTimeframe = (timeframe: string) => {
    try {
      // Extract time
      const timeMatch = timeframe.match(/(\d{1,2}:\d{2}(?:\s*(?:AM|PM))?)\s*-\s*(\d{1,2}:\d{2}(?:\s*(?:AM|PM))?)/i);
      if (timeMatch) {
        const fullTimeRange = `${timeMatch[1]}-${timeMatch[2]}`;
        if (timeSlots.includes(fullTimeRange)) {
          setSelectedTime(fullTimeRange);
        } else {
          setSelectedTime('Custom');
          setCustomTime(fullTimeRange);
        }
      }

      // Extract days
      const days: string[] = [];
      daysOfWeek.forEach(day => {
        if (timeframe.toLowerCase().includes(day.value.toLowerCase()) || 
            timeframe.toLowerCase().includes(day.abbr.toLowerCase())) {
          days.push(day.value);
        }
      });
      setSelectedDays(days);
    } catch (error) {
      console.warn('Error parsing existing timeframe:', timeframe);
    }
  };

  const validateSchedule = (schedule: string) => {
    if (!schedule) {
      setScheduleError('');
      return;
    }

    // Check for valid time format
    const hasValidTime = /\d{1,2}:\d{2}/.test(schedule);
    if (!hasValidTime) {
      setScheduleError('Please include a valid time range (e.g., 10:00-10:30)');
      return;
    }

    // Check for valid days
    const hasValidDays = daysOfWeek.some(day => 
      schedule.toLowerCase().includes(day.value.toLowerCase())
    );
    if (!hasValidDays && !schedule.toLowerCase().includes('daily')) {
      setScheduleError('Please specify which days (e.g., Monday, Tuesday)');
      return;
    }

    setScheduleError('');
  };

  const handleDayToggle = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day].sort((a, b) => {
            const order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
            return order.indexOf(a) - order.indexOf(b);
          })
    );
  };

  const handleResourceToggle = (checked: boolean) => {
    if (!checked) {
      // Clear all data when unchecked
      setSelectedDays([]);
      setSelectedTime('');
      setCustomTime('');
      setSchedulePreview('');
      setScheduleError('');
    }
    
    onChange({
      attendsResource: checked,
      resourceType: checked ? resourceInfo.resourceType : '',
      resourceTeacher: checked ? resourceInfo.resourceTeacher : '',
      timeframe: checked ? resourceInfo.timeframe : ''
    });
  };

  return (
    <div className="space-y-4">
      {/* Main Resource Toggle */}
      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={resourceInfo.attendsResource}
            onChange={(e) => handleResourceToggle(e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="font-medium text-blue-900">🎯 Receives Resource Services</span>
        </label>
        {resourceInfo.attendsResource && (
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="ml-auto text-xs bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded text-blue-700 transition-colors"
          >
            {showAdvanced ? 'Simple' : 'Advanced'} Setup
          </button>
        )}
      </div>

      {resourceInfo.attendsResource && (
        <div className="ml-6 space-y-4 border-l-2 border-blue-200 pl-4">
          {/* Service Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service Type
            </label>
            <select
              value={resourceInfo.resourceType}
              onChange={(e) => onChange({...resourceInfo, resourceType: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a service...</option>
              {serviceTypes.map(service => (
                <option key={service} value={service}>{service}</option>
              ))}
            </select>
          </div>

          {/* Teacher/Therapist */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teacher/Therapist
            </label>
            <input
              type="text"
              value={resourceInfo.resourceTeacher}
              onChange={(e) => onChange({...resourceInfo, resourceTeacher: e.target.value})}
              placeholder="e.g., Ms. Johnson, Mr. Smith"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {showAdvanced ? (
            // Advanced Schedule Builder
            <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Schedule Builder
              </h4>

              {/* Days Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Days
                </label>
                <div className="flex flex-wrap gap-2">
                  {daysOfWeek.map(day => (
                    <button
                      key={day.value}
                      onClick={() => handleDayToggle(day.value)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        selectedDays.includes(day.value)
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Slot
                </label>
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select time slot...</option>
                  {timeSlots.map(slot => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>

              {/* Custom Time Input */}
              {selectedTime === 'Custom' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Custom Time Range
                  </label>
                  <input
                    type="text"
                    value={customTime}
                    onChange={(e) => setCustomTime(e.target.value)}
                    placeholder="e.g., 10:15-10:45 AM"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Format: 10:00-10:30 AM or 14:00-14:30
                  </p>
                </div>
              )}

              {/* Schedule Preview */}
              {schedulePreview && (
                <div className="bg-white border border-gray-200 rounded-md p-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-gray-900">Schedule:</span>
                    <span className="text-blue-600 font-mono">{schedulePreview}</span>
                  </div>
                  {scheduleError ? (
                    <div className="flex items-center gap-2 text-xs text-red-600 mt-2">
                      <AlertTriangle className="w-3 h-3" />
                      <span>{scheduleError}</span>
                    </div>
                  ) : (
                    <div className="text-xs text-green-600 mt-2">
                      ✓ Valid schedule format
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            // Simple Text Input (original)
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Schedule/Timeframe
              </label>
              <input
                type="text"
                value={resourceInfo.timeframe}
                onChange={(e) => onChange({...resourceInfo, timeframe: e.target.value})}
                placeholder="e.g., Tuesdays & Thursdays 10:00-10:30 AM"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Examples: "Monday/Wednesday 2:00-2:30", "Daily 10:00-10:30 AM", "MWF 9:00-9:30"
              </p>
            </div>
          )}

          {/* Student Preview */}
          {studentName && resourceInfo.resourceType && resourceInfo.timeframe && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <User className="w-4 h-4 text-green-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-green-900">
                    {studentName} → {resourceInfo.resourceType}
                  </p>
                  <p className="text-green-700">
                    {resourceInfo.timeframe} with {resourceInfo.resourceTeacher || 'Resource Teacher'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EnhancedResourceInput;