// Unified Schedule Management Hub - Cleaned UI Version
import React, { useState, useEffect } from 'react';
import { useStaffData } from '../../hooks/useStaffData';
import { Staff, Student, Group, Assignment, SavedActivity, ScheduleVariation, EnhancedActivity, StaffMember } from '../../types';
import GroupAssignmentModal from './GroupAssignmentModal';

interface UnifiedScheduleManagerProps {
  isActive: boolean;
  selectedSchedule?: ScheduleVariation | null;
  onScheduleSelect?: (schedule: ScheduleVariation | null) => void;
  onScheduleUpdate?: (schedules: ScheduleVariation[]) => void;
  scheduleVariations?: ScheduleVariation[];
  students?: Student[];
  staff?: Staff[];
}

const UnifiedScheduleManager: React.FC<UnifiedScheduleManagerProps> = ({
  isActive,
  selectedSchedule,
  onScheduleSelect,
  onScheduleUpdate,
  scheduleVariations = [],
  students = [],
  staff = []
}) => {
  // Use real staff data from hook
  const { staff: allStaff } = useStaffData();
  
  const [activeTab, setActiveTab] = useState<'variations' | 'builder'>('variations');
  const [editingSchedule, setEditingSchedule] = useState<ScheduleVariation | null>(null);
  const [builderActivities, setBuilderActivities] = useState<SavedActivity[]>([]);
  const [startTime, setStartTime] = useState('08:00');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showScheduleSelector, setShowScheduleSelector] = useState(false);
  const [showNameInput, setShowNameInput] = useState(false);
  const [newScheduleName, setNewScheduleName] = useState('');
  const [scheduleAction, setScheduleAction] = useState<'save' | 'use'>('use');
  

  // Group assignment modal state
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [editingActivityForGroups, setEditingActivityForGroups] = useState<EnhancedActivity | null>(null);

  // Use real data if available, otherwise fallback to sample data
  const sampleStaff: Staff[] = [
    { id: 'staff-1', name: 'Ms. Johnson', role: 'Lead Teacher', photo: '👩‍🏫' },
    { id: 'staff-2', name: 'Mr. Smith', role: 'Assistant Teacher', photo: '👨‍🏫' },
    { id: 'staff-3', name: 'Mrs. Davis', role: 'Reading Specialist', photo: '👩‍💼' },
    { id: 'staff-4', name: 'Mr. Wilson', role: 'Math Coach', photo: '👨‍💼' },
    { id: 'staff-5', name: 'Ms. Brown', role: 'Aide', photo: '👩‍🎓' }
  ];

  const sampleStudents: Student[] = [
    { id: 'student-1', name: 'Emma', photo: '👧', readingLevel: 'emerging' },
    { id: 'student-2', name: 'Liam', photo: '👦', readingLevel: 'developing' },
    { id: 'student-3', name: 'Sophia', photo: '👧', readingLevel: 'proficient' },
    { id: 'student-4', name: 'Noah', photo: '👦', readingLevel: 'emerging' },
    { id: 'student-5', name: 'Olivia', photo: '👧', readingLevel: 'developing' },
    { id: 'student-6', name: 'Mason', photo: '👦', readingLevel: 'proficient' },
    { id: 'student-7', name: 'Ava', photo: '👧', readingLevel: 'emerging' },
    { id: 'student-8', name: 'Lucas', photo: '👦', readingLevel: 'developing' },
    { id: 'student-9', name: 'Isabella', photo: '👧', readingLevel: 'proficient' },
    { id: 'student-10', name: 'Ethan', photo: '👦', readingLevel: 'developing' }
  ];

  // Use real data if available, otherwise use sample data
  const availableStaff = staff.length > 0 ? staff : sampleStaff;
  const availableStudents = students.length > 0 ? students : sampleStudents;

  // Available activities for the builder
  const availableActivities: SavedActivity[] = [
    { 
      id: 'morning-meeting', 
      name: 'Morning Meeting', 
      emoji: '🌅', 
      duration: 15, 
      category: 'routine',
      staff: availableStaff,
      students: availableStudents,
      assignment: { isWholeClass: true }
    },
    { 
      id: 'literacy', 
      name: 'Reading Groups', 
      emoji: '📚', 
      duration: 45, 
      category: 'academic',
      staff: availableStaff,
      students: availableStudents,
      assignment: {
        isWholeClass: false,
        groups: [
          {
            id: 'group-1',
            name: 'Emerging Readers',
            staffId: 'staff-3',
            students: ['student-1', 'student-4', 'student-7'],
            color: '#3498db'
          },
          {
            id: 'group-2',
            name: 'Developing Readers',
            staffId: 'staff-2',
            students: ['student-2', 'student-5', 'student-8', 'student-10'],
            color: '#e74c3c'
          },
          {
            id: 'group-3',
            name: 'Proficient Readers',
            staffId: 'staff-1',
            students: ['student-3', 'student-6', 'student-9'],
            color: '#2ecc71'
          }
        ]
      }
    },
    { 
      id: 'math', 
      name: 'Math Centers', 
      emoji: '🔢', 
      duration: 40, 
      category: 'academic',
      staff: availableStaff,
      students: availableStudents,
      assignment: {
        isWholeClass: false,
        groups: [
          {
            id: 'math-group-1',
            name: 'Numbers & Operations',
            staffId: 'staff-4',
            students: ['student-1', 'student-2', 'student-7', 'student-8'],
            color: '#9b59b6'
          },
          {
            id: 'math-group-2',
            name: 'Problem Solving',
            staffId: 'staff-1',
            students: ['student-3', 'student-5', 'student-6'],
            color: '#f39c12'
          },
          {
            id: 'math-group-3',
            name: 'Independent Practice',
            staffId: 'staff-5',
            students: ['student-4', 'student-9', 'student-10'],
            color: '#1abc9c'
          }
        ]
      }
    },
    { 
      id: 'science', 
      name: 'Science Discovery', 
      emoji: '🔬', 
      duration: 30, 
      category: 'academic',
      staff: availableStaff,
      students: availableStudents,
      assignment: { isWholeClass: true }
    },
    { 
      id: 'social-studies', 
      name: 'Social Studies', 
      emoji: '🌍', 
      duration: 25, 
      category: 'academic',
      staff: availableStaff,
      students: availableStudents,
      assignment: { isWholeClass: true }
    },
    { 
      id: 'art', 
      name: 'Art Time', 
      emoji: '🎨', 
      duration: 30, 
      category: 'special',
      staff: availableStaff,
      students: availableStudents,
      assignment: { isWholeClass: true }
    },
    { 
      id: 'music', 
      name: 'Music Class', 
      emoji: '🎵', 
      duration: 30, 
      category: 'special',
      staff: availableStaff,
      students: availableStudents,
      assignment: { isWholeClass: true }
    },
    { 
      id: 'pe', 
      name: 'Physical Education', 
      emoji: '🏃‍♂️', 
      duration: 30, 
      category: 'special',
      staff: availableStaff,
      students: availableStudents,
      assignment: { isWholeClass: true }
    },
    { 
      id: 'snack', 
      name: 'Snack Break', 
      emoji: '🍎', 
      duration: 15, 
      category: 'break',
      staff: availableStaff,
      students: availableStudents,
      assignment: { isWholeClass: true }
    },
    { 
      id: 'lunch', 
      name: 'Lunch Time', 
      emoji: '🍽️', 
      duration: 30, 
      category: 'break',
      staff: availableStaff,
      students: availableStudents,
      assignment: { isWholeClass: true }
    },
    { 
      id: 'recess', 
      name: 'Recess', 
      emoji: '🏃‍♀️', 
      duration: 20, 
      category: 'break',
      staff: availableStaff,
      students: availableStudents,
      assignment: { isWholeClass: true }
    },
    { 
      id: 'choice-time', 
      name: 'Choice Time', 
      emoji: '🎮', 
      duration: 30, 
      category: 'social',
      staff: availableStaff,
      students: availableStudents,
      assignment: {
        isWholeClass: false,
        groups: [
          {
            id: 'choice-group-1',
            name: 'Creative Corner',
            staffId: 'staff-2',
            students: ['student-1', 'student-3', 'student-7', 'student-9'],
            color: '#e67e22'
          },
          {
            id: 'choice-group-2',
            name: 'Building Zone',
            staffId: 'staff-5',
            students: ['student-2', 'student-4', 'student-6', 'student-8', 'student-10'],
            color: '#34495e'
          },
          {
            id: 'choice-group-3',
            name: 'Quiet Activities',
            staffId: 'staff-1',
            students: ['student-5'],
            color: '#95a5a6'
          }
        ]
      }
    },
    { 
      id: 'closing', 
      name: 'Closing Circle', 
      emoji: '🔄', 
      duration: 15, 
      category: 'routine',
      staff: availableStaff,
      students: availableStudents,
      assignment: { isWholeClass: true }
    },
    { 
      id: 'assembly-prep', 
      name: 'Assembly Prep', 
      emoji: '🎭', 
      duration: 15, 
      category: 'special',
      staff: availableStaff,
      students: availableStudents,
      assignment: { isWholeClass: true }
    },
    { 
      id: 'assembly', 
      name: 'School Assembly', 
      emoji: '🎪', 
      duration: 45, 
      category: 'special',
      staff: availableStaff,
      students: availableStudents,
      assignment: { isWholeClass: true }
    },
    { 
      id: 'drill', 
      name: 'Emergency Drill', 
      emoji: '🚨', 
      duration: 20, 
      category: 'special',
      staff: availableStaff,
      students: availableStudents,
      assignment: { isWholeClass: true }
    },
    { 
      id: 'calm-down', 
      name: 'Calm Down Time', 
      emoji: '😌', 
      duration: 15, 
      category: 'social',
      staff: availableStaff,
      students: availableStudents,
      assignment: { isWholeClass: true }
    },
    { 
      id: 'holiday-craft', 
      name: 'Holiday Craft', 
      emoji: '🎨', 
      duration: 45, 
      category: 'special',
      staff: availableStaff,
      students: availableStudents,
      assignment: { isWholeClass: true }
    },
    { 
      id: 'holiday-games', 
      name: 'Holiday Games', 
      emoji: '🎮', 
      duration: 45, 
      category: 'special',
      staff: availableStaff,
      students: availableStudents,
      assignment: { isWholeClass: true }
    }
  ];

  // Load editing schedule into builder
  useEffect(() => {
    if (editingSchedule) {
      setBuilderActivities(editingSchedule.activities);
      setStartTime(editingSchedule.startTime);
      setActiveTab('builder');
    }
  }, [editingSchedule]);

  // Fix input focus when modal opens
  useEffect(() => {
    if (showNameInput) {
      // Use setTimeout to ensure DOM has rendered
      setTimeout(() => {
        const input = document.querySelector('input[placeholder="Enter schedule name..."]') as HTMLInputElement;
        if (input) {
          input.focus();
          input.select(); // Also select any existing text
        }
      }, 100);
    }
  }, [showNameInput]);

  // Handle schedule selection
  const handleScheduleSelect = (schedule: ScheduleVariation) => {
    onScheduleSelect?.(schedule);
    
    // Update usage count
    const updatedSchedules = scheduleVariations.map(s => 
      s.id === schedule.id 
        ? { ...s, usageCount: (s.usageCount || 0) + 1, lastUsed: new Date().toISOString() }
        : s
    );
    onScheduleUpdate?.(updatedSchedules);
  };

  // Handle schedule edit
  const handleEditSchedule = (schedule: ScheduleVariation) => {
    setEditingSchedule(schedule);
  };

  // Handle schedule delete
  const handleDeleteSchedule = (schedule: ScheduleVariation) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete '${schedule.name}'? This cannot be undone.`
    );
    
    if (confirmed) {
      const updatedSchedules = scheduleVariations.filter(s => s.id !== schedule.id);
      
      // Update localStorage
      localStorage.setItem('scheduleVariations', JSON.stringify(updatedSchedules));
      
      // Update parent component
      onScheduleUpdate?.(updatedSchedules);
      
      // If the deleted schedule was currently selected, clear the selection
      if (selectedSchedule?.id === schedule.id) {
        onScheduleSelect?.(null);
      }
    }
  };

  // Handle schedule save from builder
  const handleSaveSchedule = () => {
    if (builderActivities.length === 0) return;

    setScheduleAction('save'); // Set action type
    setShowNameInput(true);
  };

  // Add this new function for save (different from use)
  const handleConfirmSaveName = () => {
    const scheduleName = newScheduleName.trim() || `Schedule ${Date.now()}`;

    const newSchedule: ScheduleVariation = {
      id: editingSchedule?.id || `schedule-${Date.now()}`,
      name: scheduleName,
      type: editingSchedule?.type || 'daily',
      category: editingSchedule?.category || 'custom',
      activities: builderActivities,
      startTime,
      createdAt: editingSchedule?.createdAt || new Date().toISOString(),
      usageCount: editingSchedule?.usageCount || 0,
      lastUsed: editingSchedule?.lastUsed
    };

    const updatedSchedules = editingSchedule
      ? scheduleVariations.map(s => s.id === editingSchedule.id ? newSchedule : s)
      : [...scheduleVariations, newSchedule];

    // Save to localStorage
    localStorage.setItem('scheduleVariations', JSON.stringify(updatedSchedules));
    
    // Update parent component
    onScheduleUpdate?.(updatedSchedules);
    
    // Clear everything
    setEditingSchedule(null);
    setBuilderActivities([]);
    setNewScheduleName('');
    setShowNameInput(false);
    setActiveTab('variations');
    
    alert(`Schedule "${scheduleName}" saved successfully!`);
  };

  // Handle using schedule immediately (temporary, no save)
  const handleUseSchedule = () => {
    console.log('Use Schedule clicked - temporary activation');
    
    if (builderActivities.length === 0) {
      alert('Please add activities first!');
      return;
    }

    // Create temporary schedule (not saved to variations)
    const tempSchedule: ScheduleVariation = {
      id: `temp-schedule-${Date.now()}`,
      name: `Temporary Schedule (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`,
      type: 'daily',
      category: 'custom',
      activities: builderActivities,
      startTime,
      createdAt: new Date().toISOString(),
      usageCount: 0,
      lastUsed: new Date().toISOString()
    };

    console.log('Created temporary schedule:', tempSchedule);

    // Activate immediately WITHOUT updating the saved schedules list
    onScheduleSelect?.(tempSchedule);
    
    console.log('Temporary schedule activated!');
    
    // Clear builder but DON'T clear the activities yet (in case they want to save later)
    setActiveTab('variations');
    
    alert(`Temporary schedule activated! This won't be saved to your schedule list.`);
  };

  // Handle confirming the schedule name
  const handleConfirmScheduleName = () => {
    const scheduleName = newScheduleName.trim() || `Schedule ${Date.now()}`;

    const newSchedule: ScheduleVariation = {
      id: editingSchedule?.id || `schedule-${Date.now()}`,
      name: scheduleName,
      type: editingSchedule?.type || 'daily',
      category: editingSchedule?.category || 'custom',
      activities: builderActivities,
      startTime,
      createdAt: editingSchedule?.createdAt || new Date().toISOString(),
      usageCount: editingSchedule?.usageCount || 0,
      lastUsed: new Date().toISOString()
    };

    console.log('Created new schedule:', newSchedule);

    const updatedSchedules = editingSchedule
      ? scheduleVariations.map(s => s.id === editingSchedule.id ? newSchedule : s)
      : [...scheduleVariations, newSchedule];

    console.log('Updated schedules:', updatedSchedules);

    onScheduleUpdate?.(updatedSchedules);
    
    // Immediately activate this schedule
    onScheduleSelect?.(newSchedule);
    
    console.log('Schedule should now be active!');
    
    // Clear everything
    setEditingSchedule(null);
    setBuilderActivities([]);
    setNewScheduleName('');
    setShowNameInput(false);
    setActiveTab('variations');
    
    alert(`"${scheduleName}" is now active and ready for use!`);
  };

  // Handle activity add to builder
  const handleAddActivity = (activity: SavedActivity) => {
    const newActivity = {
      ...activity,
      id: `${activity.id}-${Date.now()}`
    };
    setBuilderActivities([...builderActivities, newActivity]);
  };

  // Handle activity remove from builder
  const handleRemoveActivity = (activityId: string) => {
    setBuilderActivities(builderActivities.filter(a => a.id !== activityId));
  };


  // Group assignment handlers
  const openGroupModal = (activity: SavedActivity) => {
    // Convert SavedActivity to EnhancedActivity format
    const enhancedActivity: EnhancedActivity = {
      ...activity,
      groupingType: 'whole-class',
      groupAssignments: [],
      accommodations: [],
      adaptations: []
    };
    setEditingActivityForGroups(enhancedActivity);
    setShowGroupModal(true);
  };

  const handleGroupSave = (updatedActivity: EnhancedActivity) => {
    const activityIndex = builderActivities.findIndex(act => act.id === updatedActivity.id);
    if (activityIndex >= 0) {
      const updatedActivities = [...builderActivities];
      updatedActivities[activityIndex] = updatedActivity;
      setBuilderActivities(updatedActivities);
    }
    setShowGroupModal(false);
    setEditingActivityForGroups(null);
  };

  // Calculate total time
  const calculateTotalTime = (): number => {
    return builderActivities.reduce((total, activity) => total + activity.duration, 0);
  };

  // Format time
  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Filter schedules
  const filteredSchedules = scheduleVariations.filter(schedule => {
    const matchesCategory = selectedCategory === 'all' || schedule.type === selectedCategory;
    const matchesSearch = schedule.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (!isActive) return null;

  return (
    <div style={{
      padding: '2rem',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      color: 'white'
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '2rem'
      }}>
        <h2 style={{
          fontSize: '2.5rem',
          fontWeight: '700',
          margin: '0 0 1rem 0',
          textShadow: '0 4px 8px rgba(0,0,0,0.3)'
        }}>
          📅 Schedule Management Hub
        </h2>
        <p style={{
          fontSize: '1.1rem',
          opacity: 0.9,
          margin: '0'
        }}>
          Create, edit, and manage all your saved classroom schedules
        </p>
      </div>

      {/* Tab Navigation - REMOVED Quick Templates */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        {[
          { id: 'variations', label: '📂 My Saved Schedules', icon: '📋' },
          { id: 'builder', label: 'Schedule Builder', icon: '🛠️' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              background: activeTab === tab.id 
                ? 'rgba(255, 255, 255, 0.2)' 
                : 'rgba(255, 255, 255, 0.1)',
              border: activeTab === tab.id 
                ? '2px solid rgba(255, 255, 255, 0.4)' 
                : '2px solid transparent',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* My Saved Schedules Tab */}
      {activeTab === 'variations' && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          padding: '2rem',
          backdropFilter: 'blur(10px)'
        }}>
          {/* Current Schedule Display */}
          {selectedSchedule && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '1.5rem',
              marginBottom: '2rem',
              border: '2px solid rgba(255, 255, 255, 0.3)'
            }}>
              <h3 style={{ margin: '0 0 1rem 0' }}>🎯 Currently Active Schedule</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ fontSize: '2rem' }}>
                  {selectedSchedule.type === 'emergency' ? '🚨' :
                   selectedSchedule.type === 'special-event' ? '🎭' :
                   selectedSchedule.type === 'time-variation' ? '⏰' : '📅'}
                </div>
                <div>
                  <h4 style={{ margin: '0', fontSize: '1.2rem' }}>{selectedSchedule.name}</h4>
                  <p style={{ margin: '0', opacity: 0.8 }}>
                    {selectedSchedule.activities.length} activities • {formatTime(selectedSchedule.startTime)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Search and Filter */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            marginBottom: '2rem',
            flexWrap: 'wrap'
          }}>
            <input
              type="text"
              placeholder="Search schedules..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                flex: '1',
                minWidth: '200px',
                padding: '12px 16px',
                border: '2px solid rgba(255,255,255,0.2)',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                fontSize: '1rem'
              }}
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                padding: '12px 16px',
                border: '2px solid rgba(255,255,255,0.2)',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                fontSize: '1rem'
              }}
            >
              <option value="all">All Types</option>
              <option value="daily">Daily Schedules</option>
              <option value="special-event">Special Events</option>
              <option value="emergency">Emergency Procedures</option>
              <option value="time-variation">Time Variations</option>
            </select>
          </div>

          {/* Schedule Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '1.5rem'
          }}>
            {filteredSchedules.map(schedule => (
              <div
                key={schedule.id}
                style={{
                  background: selectedSchedule?.id === schedule.id 
                    ? 'rgba(255, 255, 255, 0.2)' 
                    : 'rgba(255, 255, 255, 0.1)',
                  border: selectedSchedule?.id === schedule.id 
                    ? '3px solid rgba(255, 255, 255, 0.5)' 
                    : '2px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '15px',
                  padding: '1.5rem',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{ fontSize: '2rem' }}>
                    {schedule.type === 'emergency' ? '🚨' :
                     schedule.type === 'special-event' ? '🎭' :
                     schedule.type === 'time-variation' ? '⏰' : '📅'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0', fontSize: '1.2rem' }}>{schedule.name}</h4>
                    <p style={{ margin: '0', opacity: 0.8, fontSize: '0.9rem' }}>
                      {schedule.activities.length} activities • {formatTime(schedule.startTime)}
                    </p>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  gap: '0.5rem',
                  marginTop: '1rem'
                }}>
                  <button
                    onClick={() => handleScheduleSelect(schedule)}
                    style={{
                      flex: 1,
                      background: 'rgba(46, 204, 113, 0.8)',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 16px',
                      color: 'white',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    {selectedSchedule?.id === schedule.id ? '✅ Active' : '▶️ Use'}
                  </button>
                  <button
                    onClick={() => handleEditSchedule(schedule)}
                    style={{
                      background: 'rgba(52, 152, 219, 0.8)',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 16px',
                      color: 'white',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDeleteSchedule(schedule)}
                    style={{
                      background: 'rgba(231, 76, 60, 0.8)',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 16px',
                      color: 'white',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredSchedules.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              opacity: 0.7
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
              <h3>No saved schedules found. Create your first schedule in the Builder tab!</h3>
            </div>
          )}
        </div>
      )}

      {/* Schedule Builder Tab */}
      {activeTab === 'builder' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 300px',
          gap: '2rem',
          height: 'calc(100vh - 300px)'
        }}>
          {/* Main Builder Area */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            padding: '2rem',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '2rem'
            }}>
              <h3 style={{ margin: 0 }}>
                🛠️ {editingSchedule ? `Editing: ${editingSchedule.name}` : 'Build New Schedule'}
              </h3>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <label>
                  Start Time:
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    style={{
                      marginLeft: '0.5rem',
                      padding: '8px',
                      borderRadius: '6px',
                      border: '1px solid rgba(255,255,255,0.3)',
                      background: 'rgba(255,255,255,0.1)',
                      color: 'white'
                    }}
                  />
                </label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <button
                    onClick={handleSaveSchedule}
                    disabled={builderActivities.length === 0}
                    style={{
                      background: builderActivities.length > 0 ? '#3498db' : '#95a5a6',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px 20px',
                      color: 'white',
                      fontWeight: '600',
                      cursor: builderActivities.length > 0 ? 'pointer' : 'not-allowed'
                    }}
                    title="Save schedule permanently to your schedule list"
                  >
                    💾 Save Schedule
                  </button>
                  
                  <button
                    onClick={handleUseSchedule}
                    disabled={builderActivities.length === 0}
                    style={{
                      background: builderActivities.length > 0 ? '#2ecc71' : '#95a5a6',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px 20px',
                      color: 'white',
                      fontWeight: '600',
                      cursor: builderActivities.length > 0 ? 'pointer' : 'not-allowed'
                    }}
                    title="Use this schedule temporarily (won't be saved)"
                  >
                    ▶️ Use Schedule
                  </button>
                </div>
                {/* Add this right after the buttons */}
                <div style={{ 
                  fontSize: '0.8rem', 
                  opacity: 0.8, 
                  marginTop: '0.5rem',
                  textAlign: 'center'
                }}>
                  💡 Tip: "Use Schedule" for temporary use • "Save Schedule" to keep permanently
                </div>
              </div>
            </div>

            {/* Schedule Summary */}
            {builderActivities.length > 0 && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '1rem',
                marginBottom: '2rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span>📊 Total Activities: {builderActivities.length}</span>
                  <span>⏱️ Total Time: {Math.floor(calculateTotalTime() / 60)}h {calculateTotalTime() % 60}m</span>
                  <span>🏁 End Time: {(() => {
                    const [hours, minutes] = startTime.split(':').map(Number);
                    const endMinutes = hours * 60 + minutes + calculateTotalTime();
                    const endHours = Math.floor(endMinutes / 60) % 24;
                    const endMins = endMinutes % 60;
                    return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
                  })()}</span>
                </div>
              </div>
            )}

            {/* Schedule Activities */}
            <div style={{
              maxHeight: 'calc(100vh - 500px)',
              overflowY: 'auto'
            }}>
              {builderActivities.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '3rem',
                  opacity: 0.7
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
                  <h3>No Activities Added</h3>
                  <p>Click activities from the library to add them to your schedule.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {builderActivities.map((activity, index) => (
                    <div
                      key={activity.id}
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        padding: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                      }}
                    >
                      <div style={{ fontSize: '1.5rem' }}>{activity.emoji}</div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0', fontSize: '1rem' }}>{activity.name}</h4>
                        <p style={{ margin: '0', opacity: 0.8, fontSize: '0.9rem' }}>
                          {activity.duration} minutes • {activity.category}
                          {activity.assignment && !activity.assignment.isWholeClass && activity.assignment.groups && (
                            <span style={{ marginLeft: '0.5rem', color: '#2ecc71', fontWeight: '600' }}>
                              • {activity.assignment.groups.length} groups
                            </span>
                          )}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => openGroupModal(activity)}
                          style={{
                            padding: '4px 8px',
                            background: (activity as any).groupAssignments?.length > 0 
                              ? 'linear-gradient(145deg, #28a745 0%, #20c997 100%)'
                              : 'linear-gradient(145deg, #6c757d 0%, #495057 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '0.7rem',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                          }}
                          title={(activity as any).groupAssignments?.length > 0 
                            ? `${(activity as any).groupAssignments.length} groups assigned`
                            : 'Set up groups for this activity'
                          }
                        >
                          {(activity as any).groupAssignments?.length > 0 
                            ? `🎯 ${(activity as any).groupAssignments.length} Groups` 
                            : '👥 Set Groups'}
                        </button>
                        <button
                          onClick={() => handleRemoveActivity(activity.id)}
                          style={{
                            background: '#e74c3c',
                            border: 'none',
                            borderRadius: '6px',
                            width: '30px',
                            height: '30px',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '1rem'
                          }}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Activity Library Sidebar */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            padding: '1.5rem',
            backdropFilter: 'blur(10px)'
          }}>
            <h3 style={{ margin: '0 0 1.5rem 0' }}>📚 Activity Library</h3>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              maxHeight: 'calc(100vh - 400px)',
              overflowY: 'auto'
            }}>
              {availableActivities.map(activity => (
                <button
                  key={activity.id}
                  onClick={() => handleAddActivity(activity)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    color: 'white',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>{activity.emoji}</span>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>
                        {activity.name}
                      </div>
                      <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                        {activity.duration}m • {activity.category}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Schedule Name Input Modal */}
      {showNameInput && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => {
            setShowNameInput(false);
            setNewScheduleName('');
            setScheduleAction('use');
          }}
        >
          <div 
            style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '12px',
              maxWidth: '400px',
              width: '90%',
              color: '#333'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 1rem 0' }}>
              {scheduleAction === 'save' ? '💾 Save Schedule' : '📝 Use Schedule'}
            </h3>
            
            <input
              type="text"
              value={newScheduleName}
              onChange={(e) => {
                console.log('Input changed:', e.target.value); // Debug logging
                setNewScheduleName(e.target.value);
              }}
              placeholder="Enter schedule name..."
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #ddd',
                borderRadius: '8px',
                fontSize: '1rem',
                marginBottom: '1rem',
                outline: 'none', // Remove default focus outline
                boxSizing: 'border-box' // Ensure proper sizing
              }}
              autoFocus
              onKeyDown={(e) => {
                // Use onKeyDown instead of onKeyPress for better compatibility
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleConfirmScheduleName();
                }
              }}
            />
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowNameInput(false);
                  setNewScheduleName('');
                  setScheduleAction('use'); // Reset to default
                }}
                style={{
                  padding: '10px 20px',
                  background: '#95a5a6',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              
              <button
                onClick={() => {
                  if (scheduleAction === 'save') {
                    handleConfirmSaveName();
                  } else {
                    handleConfirmScheduleName();
                  }
                }}
                style={{
                  padding: '10px 20px',
                  background: '#2ecc71',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                {scheduleAction === 'save' ? '💾 Save Schedule' : '✅ Use Schedule'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Group Assignment Modal */}
      {showGroupModal && editingActivityForGroups && (
        <GroupAssignmentModal
          activity={editingActivityForGroups}
          staff={allStaff}
          onSave={handleGroupSave}
          onCancel={() => {
            setShowGroupModal(false);
            setEditingActivityForGroups(null);
          }}
        />
      )}
    </div>
  );
};

export default UnifiedScheduleManager;