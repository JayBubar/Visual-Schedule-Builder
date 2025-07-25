import React, { useState, useEffect } from 'react';
import GroupCreator from './GroupCreator';
import { Student as ProjectStudent, Staff, StudentGroup, Activity, ScheduleActivity, ActivityAssignment, ScheduleVariation, SavedActivity, StaffMember as ProjectStaffMember } from '../../types';

// Type aliases to avoid conflicts with enhanced components
type BuilderStudent = ProjectStudent;
type BuilderStaffMember = ProjectStaffMember;
type EnhancedActivity = ScheduleActivity;

interface ScheduleBuilderProps {
  isActive: boolean;
}

const ScheduleBuilder: React.FC<ScheduleBuilderProps> = ({ isActive }) => {
  // State management
  const [schedule, setSchedule] = useState<EnhancedActivity[]>([]);
  const [startTime, setStartTime] = useState('08:00');
  const [staff, setStaff] = useState<Staff[]>([]);
  const [students, setStudents] = useState<BuilderStudent[]>([]);
  const [groups, setGroups] = useState<StudentGroup[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [showAssignmentPanel, setShowAssignmentPanel] = useState(false);
  const [showGroupCreator, setShowGroupCreator] = useState(false);
  const [availableActivities, setAvailableActivities] = useState<(Omit<EnhancedActivity, 'assignment'> & { 
    addedFromLibrary?: boolean;
    originalId?: string;
    tags?: string[];
    materials?: string[];
    createdAt?: string;
  })[]>([]);

  // Tab interface state
  const [activeTab, setActiveTab] = useState<'activities' | 'saved' | 'builder'>('activities');
  
  // Saved schedules state
  const [savedSchedules, setSavedSchedules] = useState<ScheduleVariation[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveScheduleName, setSaveScheduleName] = useState('');
  const [saveScheduleDescription, setSaveScheduleDescription] = useState('');

  // Load available activities from localStorage
  useEffect(() => {
    const storedActivities = localStorage.getItem('available_activities');
    if (storedActivities) {
      try {
        setAvailableActivities(JSON.parse(storedActivities));
      } catch (error) {
        console.error('Error loading available activities:', error);
      }
    }
  }, []);

  // Load saved schedules from localStorage
  useEffect(() => {
    const storedSchedules = localStorage.getItem('saved_schedules');
    if (storedSchedules) {
      try {
        setSavedSchedules(JSON.parse(storedSchedules));
      } catch (error) {
        console.error('Error loading saved schedules:', error);
      }
    }
  }, []);

  // Event listeners for Activity Library integration
  useEffect(() => {
    console.log('🔧 Setting up Activity Library event listeners...');
    
    const handleActivityAdded = (event: CustomEvent) => {
      const { activity, source, timestamp } = event.detail;
      const timeString = new Date(timestamp).toLocaleTimeString();
      
      console.group(`📝 Activity Added Event [${timeString}]`);
      console.log(`Source: ${source || 'unknown'}`);
      console.log(`Activity:`, {
        id: activity.id,
        originalId: activity.originalId,
        name: activity.name,
        duration: activity.duration,
        category: activity.category,
        isCustom: activity.isCustom,
        addedFromLibrary: activity.addedFromLibrary
      });
      
      // Update available activities list
      setAvailableActivities(prev => {
        console.log(`Current available activities count: ${prev.length}`);
        
        // Check for duplicates by ID (including unique instance IDs)
        const exists = prev.find(act => act.id === activity.id);
        if (!exists) {
          const formattedActivity = {
            id: activity.id,
            originalId: activity.originalId || activity.id,
            name: activity.name,
            icon: activity.icon || activity.emoji || '📝',
            duration: activity.duration || activity.defaultDuration || 30,
            category: activity.category,
            description: activity.description || activity.instructions || '',
            isCustom: activity.isCustom || false,
            tags: activity.tags || [],
            materials: activity.materials || [],
            addedFromLibrary: activity.addedFromLibrary || false,
            createdAt: activity.createdAt || new Date().toISOString()
          };
          
          const newActivities = [...prev, formattedActivity];
          
          // Persist to localStorage
          try {
            localStorage.setItem('available_activities', JSON.stringify(newActivities));
            console.log(`✅ Successfully saved to localStorage`);
          } catch (error) {
            console.error(`❌ Failed to save to localStorage:`, error);
          }
          
          console.log(`✅ Added activity: "${activity.name}" (ID: ${activity.id})`);
          console.log(`📊 New total activities: ${newActivities.length}`);
          console.groupEnd();
          return newActivities;
        } else {
          console.warn(`⚠️ Activity with ID ${activity.id} already exists, skipping duplicate`);
          console.groupEnd();
        }
        return prev;
      });
    };

    const handleActivitiesUpdated = (event: CustomEvent) => {
      const { activities, source, customCount, totalCount, timestamp } = event.detail;
      const timeString = new Date(timestamp).toLocaleTimeString();
      
      console.group(`🔄 Activities Updated Event [${timeString}]`);
      console.log(`Source: ${source || 'unknown'}`);
      console.log(`Statistics:`, {
        totalCount: totalCount || activities.length,
        customCount: customCount || 0,
        baseCount: (totalCount || activities.length) - (customCount || 0)
      });
      
      // Convert library activities to schedule builder format
      const formattedActivities = activities.map((activity: any, index: number) => {
        console.log(`📝 Processing activity ${index + 1}/${activities.length}: ${activity.name}`);
        return {
          id: activity.id,
          originalId: activity.originalId || activity.id,
          name: activity.name,
          icon: activity.icon || activity.emoji || '📝',
          duration: activity.defaultDuration || activity.duration || 30,
          category: activity.category,
          description: activity.description || '',
          isCustom: activity.isCustom || false,
          tags: activity.tags || [],
          materials: activity.materials || [],
          createdAt: activity.createdAt || new Date().toISOString()
        };
      });
      
      try {
        setAvailableActivities(formattedActivities);
        localStorage.setItem('available_activities', JSON.stringify(formattedActivities));
        console.log(`✅ Successfully updated ${formattedActivities.length} activities`);
      } catch (error) {
        console.error(`❌ Failed to update activities:`, error);
      }
      
      console.groupEnd();
    };

    // Add event listeners
    window.addEventListener('activityAdded', handleActivityAdded as EventListener);
    window.addEventListener('activitiesUpdated', handleActivitiesUpdated as EventListener);
    
    console.log('✅ Activity Library event listeners registered successfully');
    console.log('📡 Listening for events: activityAdded, activitiesUpdated');

    // Cleanup
    return () => {
      console.log('🧹 Cleaning up Activity Library event listeners...');
      window.removeEventListener('activityAdded', handleActivityAdded as EventListener);
      window.removeEventListener('activitiesUpdated', handleActivitiesUpdated as EventListener);
      console.log('✅ Event listeners cleaned up successfully');
    };
  }, []);

  // Mock data for demonstration (in real app, this would come from dataStore)
  useEffect(() => {
    // Sample staff data
    setStaff([
      {
        id: 'staff1',
        name: 'Ms. Johnson',
        role: 'Lead Teacher',
        email: 'johnson@school.edu',
        photo: undefined,
        isMainTeacher: true,
        status: 'active'
      },
      {
        id: 'staff2',
        name: 'Mr. Davis',
        role: 'Aide',
        email: 'davis@school.edu',
        photo: undefined,
        isMainTeacher: false,
        status: 'active'
      },
      {
        id: 'staff3',
        name: 'Ms. Rodriguez',
        role: 'Speech Therapist',
        email: 'rodriguez@school.edu',
        photo: undefined,
        isMainTeacher: false,
        status: 'active'
      }
    ]);

    // Enhanced student data with all properties
    setStudents([
      { 
        id: 'student1', 
        name: 'Alex', 
        photo: undefined, 
        accommodations: ['extra time', 'visual supports'],
        workingStyle: 'collaborative',
        preferredPartners: ['student3'],
        avoidPartners: [],
        behaviorNotes: 'Works well in small groups'
      },
      { 
        id: 'student2', 
        name: 'Maria', 
        photo: undefined, 
        accommodations: ['movement breaks'],
        workingStyle: 'needs-support',
        preferredPartners: ['student4', 'student5'],
        avoidPartners: [],
        behaviorNotes: 'Benefits from structured activities'
      },
      { 
        id: 'student3', 
        name: 'Jordan', 
        photo: undefined, 
        accommodations: ['sensory tools'],
        workingStyle: 'independent',
        preferredPartners: ['student1'],
        avoidPartners: [],
        behaviorNotes: 'Natural leader, helps peers'
      },
      { 
        id: 'student4', 
        name: 'Sam', 
        photo: undefined, 
        accommodations: ['picture schedule'],
        workingStyle: 'needs-support',
        preferredPartners: ['student2'],
        avoidPartners: [],
        behaviorNotes: 'Responds well to routine'
      },
      { 
        id: 'student5', 
        name: 'Taylor', 
        photo: undefined, 
        accommodations: ['quiet space'],
        workingStyle: 'collaborative',
        preferredPartners: ['student2', 'student6'],
        avoidPartners: [],
        behaviorNotes: 'Enjoys peer interaction'
      },
      { 
        id: 'student6', 
        name: 'Casey', 
        photo: undefined, 
        accommodations: ['visual cues'],
        workingStyle: 'independent',
        preferredPartners: ['student5'],
        avoidPartners: [],
        behaviorNotes: 'Self-directed learner'
      }
    ]);

    // Sample groups with enhanced properties
    setGroups([
      {
        id: 'group1',
        name: 'Advanced Readers',
        label: 'Reading Group A',
        description: 'Students reading above grade level',
        staffId: 'staff1',
        students: ['student1', 'student3'],
        studentIds: ['student1', 'student3'],
        color: '#3498db',
        isTemplate: true,
        groupType: 'academic',
        targetSkills: ['fluency', 'comprehension'],
        maxSize: 4,
        minSize: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'group2',
        name: 'Math Support',
        label: 'Extra Practice Group',
        description: 'Students needing additional math support',
        staffId: 'staff2',
        students: ['student2', 'student4', 'student5'],
        studentIds: ['student2', 'student4', 'student5'],
        color: '#e74c3c',
        isTemplate: true,
        groupType: 'academic',
        targetSkills: ['number sense', 'basic operations'],
        maxSize: 4,
        minSize: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]);
  }, []);

  // Default activity library (fallback)
  const defaultActivityLibrary: Omit<EnhancedActivity, 'assignment'>[] = [
    { id: 'act1', name: 'Morning Meeting', icon: '🌅', category: 'routine', duration: 15, description: 'Circle time and calendar' },
    { id: 'act2', name: 'Reading Groups', icon: '📚', category: 'academic', duration: 30, description: 'Guided reading instruction' },
    { id: 'act3', name: 'Math Workshop', icon: '🔢', category: 'academic', duration: 45, description: 'Math instruction and practice' },
    { id: 'act4', name: 'Speech Therapy', icon: '🗣️', category: 'therapy', duration: 20, description: 'Individual speech sessions' },
    { id: 'act5', name: 'Art Project', icon: '🎨', category: 'special', duration: 30, description: 'Creative arts and crafts' },
    { id: 'act6', name: 'Physical Education', icon: '🏃', category: 'special', duration: 30, description: 'Physical activity and movement' },
    { id: 'act7', name: 'Lunch', icon: '🍽️', category: 'break', duration: 30, description: 'Lunch and social time' },
    { id: 'act8', name: 'Quiet Time', icon: '🧘', category: 'break', duration: 15, description: 'Rest and sensory break' },
    { id: 'act9', name: 'Science Experiment', icon: '🔬', category: 'academic', duration: 30, description: 'Hands-on science exploration' },
    { id: 'act10', name: 'Social Skills', icon: '🤝', category: 'therapy', duration: 25, description: 'Social interaction practice' },
    { id: 'act11', name: 'Music & Movement', icon: '🎵', category: 'special', duration: 25, description: 'Music and rhythm activities' },
    { id: 'act12', name: 'Independent Work', icon: '📝', category: 'academic', duration: 20, description: 'Self-directed learning time' },
    { id: 'act13', name: 'Computer Lab', icon: '💻', category: 'academic', duration: 25, description: 'Educational technology' },
    { id: 'act14', name: 'Outdoor Play', icon: '🌳', category: 'break', duration: 20, description: 'Outdoor activities and fresh air' },
    { id: 'act15', name: 'Group Project', icon: '👥', category: 'academic', duration: 35, description: 'Collaborative learning activity' },
    { id: 'act16', name: 'Snack Time', icon: '🍎', category: 'break', duration: 10, description: 'Healthy snack and hydration' }
  ];

  // Helper functions
  const addToSchedule = (activity: Omit<EnhancedActivity, 'assignment'>) => {
    const newActivity: EnhancedActivity = {
      ...activity,
      assignment: {
        staffIds: [],
        groupIds: [],
        isWholeClass: true,
        notes: ''
      }
    };
    setSchedule([...schedule, newActivity]);
  };

  const removeFromSchedule = (index: number) => {
    setSchedule(schedule.filter((_, i) => i !== index));
  };

  const updateActivityAssignment = (activityId: string, assignment: ActivityAssignment) => {
    setSchedule(schedule.map(activity => 
      activity.id === activityId 
        ? { ...activity, assignment }
        : activity
    ));
  };

  const calculateTime = (startTime: string, minutes: number): string => {
    const [hours, mins] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMins = totalMinutes % 60;
    return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
  };

  const getTotalDuration = () => {
    return schedule.reduce((total, activity) => total + activity.duration, 0);
  };

  const getEndTime = () => {
    return calculateTime(startTime, getTotalDuration());
  };

  const openAssignmentPanel = (activityId: string) => {
    setSelectedActivity(activityId);
    setShowAssignmentPanel(true);
  };

  const handleGroupsSave = (updatedGroups: StudentGroup[]) => {
    setGroups(updatedGroups);
    setShowGroupCreator(false);
  };

  // Remove activity from available activities
  const removeFromAvailable = (activityId: string) => {
    setAvailableActivities(prev => {
      const updatedActivities = prev.filter(activity => activity.id !== activityId);
      localStorage.setItem('available_activities', JSON.stringify(updatedActivities));
      console.log(`Removed activity ${activityId} from available activities`);
      return updatedActivities;
    });
  };

  // Save current schedule
  const saveCurrentSchedule = () => {
    if (!saveScheduleName.trim()) {
      alert('Please enter a schedule name');
      return;
    }

    const savedActivities: SavedActivity[] = schedule.map(activity => ({
      id: activity.id,
      name: activity.name,
      icon: activity.icon,
      duration: activity.duration,
      category: activity.category,
      description: activity.description || '',
      isCustom: activity.isCustom || false,
      tags: activity.tags || [],
      materials: activity.materials || []
    }));

    const newSchedule: ScheduleVariation = {
      id: `schedule_${Date.now()}`,
      name: saveScheduleName.trim(),
      type: 'daily',
      category: 'academic',
      activities: savedActivities,
      startTime,
      endTime: getEndTime(),
      totalDuration: getTotalDuration(),
      color: '#667eea',
      icon: '📅',
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
      usageCount: 0,
      description: saveScheduleDescription.trim() || '',
      tags: [],
      applicableDays: [],
      isDefault: false
    };

    const updatedSchedules = [...savedSchedules, newSchedule];
    setSavedSchedules(updatedSchedules);
    localStorage.setItem('saved_schedules', JSON.stringify(updatedSchedules));
    
    // Reset dialog
    setShowSaveDialog(false);
    setSaveScheduleName('');
    setSaveScheduleDescription('');
    
    console.log(`Saved schedule: ${newSchedule.name}`);
  };

  // Load a saved schedule
  const loadSchedule = (scheduleVariation: ScheduleVariation) => {
    const loadedActivities: EnhancedActivity[] = scheduleVariation.activities.map(activity => ({
      ...activity,
      assignment: {
        staffIds: [],
        groupIds: [],
        isWholeClass: true,
        notes: ''
      }
    }));

    setSchedule(loadedActivities);
    setStartTime(scheduleVariation.startTime);
    setActiveTab('builder');

    // Update usage tracking
    const updatedSchedules = savedSchedules.map(schedule => 
      schedule.id === scheduleVariation.id 
        ? { 
            ...schedule, 
            lastUsed: new Date().toISOString(),
            usageCount: (schedule.usageCount || 0) + 1
          }
        : schedule
    );
    setSavedSchedules(updatedSchedules);
    localStorage.setItem('saved_schedules', JSON.stringify(updatedSchedules));
    
    console.log(`Loaded schedule: ${scheduleVariation.name}`);
  };

  // Delete a saved schedule
  const deleteSchedule = (scheduleId: string) => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      const updatedSchedules = savedSchedules.filter(schedule => schedule.id !== scheduleId);
      setSavedSchedules(updatedSchedules);
      localStorage.setItem('saved_schedules', JSON.stringify(updatedSchedules));
      console.log(`Deleted schedule: ${scheduleId}`);
    }
  };

  if (!isActive) return null;

  const selectedActivityData = selectedActivity ? schedule.find(a => a.id === selectedActivity) : null;

  return (
    <div style={{
      padding: '2rem',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      {/* Header */}
      <div style={{
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        <h1 style={{
          color: 'white',
          fontSize: '2.5rem',
          fontWeight: '700',
          margin: '0 0 0.5rem 0',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>
          🛠️ Schedule Builder
        </h1>
        <p style={{
          color: 'rgba(255,255,255,0.9)',
          fontSize: '1.1rem',
          margin: 0
        }}>
          Build your daily schedule and assign staff and groups
        </p>
      </div>

      {/* Schedule Controls */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem',
        alignItems: 'center',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: 'white',
          fontWeight: '600'
        }}>
          <label>Start Time:</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '2px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.1)',
              color: 'white',
              fontWeight: '600'
            }}
          />
        </div>
        
        <div style={{
          color: 'white',
          fontWeight: '600',
          background: 'rgba(255,255,255,0.1)',
          padding: '8px 16px',
          borderRadius: '8px'
        }}>
          Total: {Math.floor(getTotalDuration() / 60)}h {getTotalDuration() % 60}m
        </div>
        
        {schedule.length > 0 && (
          <button
            onClick={() => setSchedule([])}
            style={{
              background: 'linear-gradient(145deg, #dc3545, #c82333)',
              border: 'none',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            🗑️ Clear All
          </button>
        )}
      </div>

      {/* Glassmorphism Tab Interface */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '1.5rem',
        justifyContent: 'center'
      }}>
        {[
          { 
            id: 'activities', 
            icon: '📚', 
            label: 'Available Activities', 
            count: availableActivities.length + defaultActivityLibrary.length
          },
          { 
            id: 'saved', 
            icon: '📂', 
            label: 'My Saved Schedules', 
            count: savedSchedules.length
          },
          { 
            id: 'builder', 
            icon: '🛠️', 
            label: 'Schedule Builder', 
            count: schedule.length
          }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              padding: '1rem 1.5rem',
              border: activeTab === tab.id ? '2px solid rgba(102, 126, 234, 0.3)' : '2px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '16px',
              background: activeTab === tab.id 
                ? 'rgba(102, 126, 234, 0.15)' 
                : 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              color: activeTab === tab.id ? '#667eea' : 'white',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
              position: 'relative',
              minWidth: '150px'
            }}
          >
            <div style={{ position: 'relative', fontSize: '1.5rem' }}>
              {tab.icon}
              {tab.count > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '-5px',
                  right: '-5px',
                  background: activeTab === tab.id ? '#667eea' : '#28a745',
                  color: 'white',
                  borderRadius: '12px',
                  padding: '2px 6px',
                  fontSize: '0.6rem',
                  fontWeight: '700',
                  minWidth: '16px',
                  textAlign: 'center'
                }}>
                  {tab.count}
                </div>
              )}
            </div>
            <span style={{ fontSize: '0.8rem' }}>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        padding: '2rem',
        minHeight: '500px',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        {/* Available Activities Tab */}
        {activeTab === 'activities' && (
          <div>
            <h3 style={{ 
              margin: '0 0 2rem 0',
              color: '#2c3e50',
              fontSize: '1.5rem',
              fontWeight: '700',
              textAlign: 'center'
            }}>
              📚 Activity Library
            </h3>
            
            {/* Available Activities from Library */}
            {availableActivities.length > 0 && (
              <div style={{ marginBottom: '3rem' }}>
                <h4 style={{
                  margin: '0 0 1rem 0',
                  color: '#495057',
                  fontSize: '1.2rem',
                  fontWeight: '600'
                }}>
                  🔗 From Activity Library ({availableActivities.length})
                </h4>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: '1rem'
                }}>
                  {availableActivities.map((activity) => (
                    <div 
                      key={activity.id} 
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '1rem',
                        background: 'white',
                        border: '1px solid #e9ecef',
                        borderRadius: '12px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}
                    >
                      <div style={{ fontSize: '1.5rem' }}>
                        {activity.icon || '📝'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          fontWeight: '600', 
                          color: '#2c3e50',
                          marginBottom: '0.25rem'
                        }}>
                          {activity.name}
                        </div>
                        <div style={{ 
                          fontSize: '0.8rem', 
                          color: '#6c757d'
                        }}>
                          {activity.duration}min • {activity.category}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => addToSchedule(activity)}
                          style={{
                            background: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '6px 12px',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            fontWeight: '600'
                          }}
                        >
                          + Add
                        </button>
                        <button
                          onClick={() => removeFromAvailable(activity.id)}
                          style={{
                            background: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '6px 8px',
                            fontSize: '0.8rem',
                            cursor: 'pointer'
                          }}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Default Activity Library */}
            <div>
              <h4 style={{
                margin: '0 0 1rem 0',
                color: '#495057',
                fontSize: '1.2rem',
                fontWeight: '600'
              }}>
                🎯 Default Activities ({defaultActivityLibrary.length})
              </h4>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '1rem'
              }}>
                {defaultActivityLibrary.map((activity) => (
                  <div 
                    key={activity.id} 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '1rem',
                      background: 'white',
                      border: '1px solid #e9ecef',
                      borderRadius: '12px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                  >
                    <div style={{ fontSize: '1.5rem' }}>
                      {activity.icon || '📝'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        fontWeight: '600', 
                        color: '#2c3e50',
                        marginBottom: '0.25rem'
                      }}>
                        {activity.name}
                      </div>
                      <div style={{ 
                        fontSize: '0.8rem', 
                        color: '#6c757d'
                      }}>
                        {activity.duration}min • {activity.category}
                      </div>
                    </div>
                    <button
                      onClick={() => addToSchedule(activity)}
                      style={{
                        background: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      + Add
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {availableActivities.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '2rem',
                color: '#6c757d',
                background: '#f8f9fa',
                borderRadius: '12px',
                border: '2px dashed #dee2e6',
                margin: '2rem 0'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
                <p style={{ margin: 0, fontSize: '1.1rem' }}>
                  No activities from library yet.<br/>
                  Visit Activity Library to add activities.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Saved Schedules Tab */}
        {activeTab === 'saved' && (
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '2rem'
            }}>
              <h3 style={{ 
                margin: '0',
                color: '#2c3e50',
                fontSize: '1.5rem',
                fontWeight: '700'
              }}>
                📂 My Saved Schedules
              </h3>
              
              <button
                onClick={() => setShowSaveDialog(true)}
                disabled={schedule.length === 0}
                style={{
                  background: schedule.length === 0 
                    ? 'rgba(108, 117, 125, 0.5)' 
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.75rem 1.5rem',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: schedule.length === 0 ? 'not-allowed' : 'pointer',
                  opacity: schedule.length === 0 ? 0.6 : 1
                }}
              >
                💾 Save Current Schedule
              </button>
            </div>

            {savedSchedules.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '3rem',
                color: '#6c757d',
                background: '#f8f9fa',
                borderRadius: '12px',
                border: '2px dashed #dee2e6'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📂</div>
                <p style={{ margin: 0, fontSize: '1.1rem' }}>
                  No saved schedules yet.<br/>
                  Build a schedule and save it to get started.
                </p>
              </div>
            ) : (
              <div style={{ 
                display: 'grid', 
                gap: '1rem'
              }}>
                {savedSchedules.map((schedule) => (
                  <div 
                    key={schedule.id} 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '1.5rem',
                      background: 'white',
                      border: '1px solid #e9ecef',
                      borderRadius: '12px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      borderLeft: `4px solid ${schedule.color || '#667eea'}`
                    }}
                  >
                    <div style={{ fontSize: '2rem' }}>
                      {schedule.icon || '📅'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        fontWeight: '700', 
                        fontSize: '1.1rem',
                        color: '#2c3e50',
                        marginBottom: '0.5rem'
                      }}>
                        {schedule.name}
                      </div>
                      {schedule.description && (
                        <div style={{ 
                          fontSize: '0.9rem', 
                          color: '#6c757d',
                          marginBottom: '0.5rem'
                        }}>
                          {schedule.description}
                        </div>
                      )}
                      <div style={{ 
                        fontSize: '0.8rem', 
                        color: '#6c757d',
                        display: 'flex',
                        gap: '1rem',
                        flexWrap: 'wrap'
                      }}>
                        <span>📝 {schedule.activities.length} activities</span>
                        <span>⏱️ {Math.floor((schedule.totalDuration || 0) / 60)}h {(schedule.totalDuration || 0) % 60}m</span>
                        <span>🕐 {schedule.startTime} - {schedule.endTime}</span>
                        <span>Used {schedule.usageCount || 0} times</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => loadSchedule(schedule)}
                        style={{
                          background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '8px 16px',
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          fontWeight: '600'
                        }}
                      >
                        📥 Load
                      </button>
                      <button
                        onClick={() => deleteSchedule(schedule.id)}
                        style={{
                          background: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '8px 12px',
                          fontSize: '0.8rem',
                          cursor: 'pointer'
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Schedule Builder Tab */}
        {activeTab === 'builder' && (
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '2rem'
            }}>
              <h3 style={{ 
                margin: '0',
                color: '#2c3e50',
                fontSize: '1.5rem',
                fontWeight: '700'
              }}>
                🛠️ Schedule Builder
              </h3>
              
              <button
                onClick={() => setShowSaveDialog(true)}
                disabled={schedule.length === 0}
                style={{
                  background: schedule.length === 0 
                    ? 'rgba(108, 117, 125, 0.5)' 
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.75rem 1.5rem',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: schedule.length === 0 ? 'not-allowed' : 'pointer',
                  opacity: schedule.length === 0 ? 0.6 : 1
                }}
              >
                💾 Save Current Schedule
              </button>
            </div>

            {schedule.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '3rem',
                color: '#6c757d',
                background: '#f8f9fa',
                borderRadius: '12px',
                border: '2px dashed #dee2e6'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
                <p style={{ margin: 0, fontSize: '1.1rem' }}>
                  Click activities from the library to build your schedule
                </p>
              </div>
            ) : (
              <div style={{ 
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                {schedule.map((activity, index) => {
                  const activityStartTime = index === 0 
                    ? startTime 
                    : calculateTime(startTime, schedule.slice(0, index).reduce((sum, act) => sum + act.duration, 0));
                  const activityEndTime = calculateTime(activityStartTime, activity.duration);

                  return (
                    <div
                      key={`${activity.id}-${index}`}
                      style={{
                        background: 'white',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        border: '1px solid #e9ecef',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                        position: 'relative'
                      }}
                    >
                      {/* Remove button */}
                      <button
                        onClick={() => removeFromSchedule(index)}
                        style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          background: '#e74c3c',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '28px',
                          height: '28px',
                          cursor: 'pointer',
                          fontSize: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        ×
                      </button>

                      {/* Activity Header */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        marginBottom: '1rem'
                      }}>
                        <div style={{ fontSize: '2rem' }}>
                          {activity.icon}
                        </div>
                        <div style={{ flex: '1', paddingRight: '40px' }}>
                          <h4 style={{
                            margin: '0 0 0.5rem 0',
                            color: '#2c3e50',
                            fontSize: '1.2rem',
                            fontWeight: '600'
                          }}>
                            {activity.name}
                          </h4>
                          
                          <div style={{
                            display: 'flex',
                            gap: '1rem',
                            fontSize: '0.9rem',
                            color: '#666',
                            flexWrap: 'wrap'
                          }}>
                            <span style={{ fontWeight: '500' }}>
                              🕐 {activityStartTime} - {activityEndTime}
                            </span>
                            <span style={{ fontWeight: '500' }}>
                              ⏱️ {activity.duration} min
                            </span>
                            <span style={{ fontWeight: '500' }}>
                              📂 {activity.category}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Staff Assignment Display */}
                      {activity.assignment && activity.assignment.staffIds.length > 0 && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          marginBottom: '0.5rem'
                        }}>
                          <span style={{ fontSize: '0.9rem', color: '#666', fontWeight: '500' }}>
                            👥 Staff:
                          </span>
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {activity.assignment.staffIds.map(staffId => {
                              const staffMember = staff.find(s => s.id === staffId);
                              return staffMember ? (
                                <span
                                  key={staffId}
                                  style={{
                                    background: '#3498db',
                                    color: 'white',
                                    padding: '4px 8px',
                                    borderRadius: '12px',
                                    fontSize: '0.8rem',
                                    fontWeight: '500'
                                  }}
                                >
                                  {staffMember.name}
                                </span>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}

                      {/* Group Assignment Display */}
                      {activity.assignment && activity.assignment.groupIds.length > 0 && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          marginBottom: '0.5rem'
                        }}>
                          <span style={{ fontSize: '0.9rem', color: '#666', fontWeight: '500' }}>
                            👤 Groups:
                          </span>
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {activity.assignment.groupIds.map(groupId => {
                              const group = groups.find(g => g.id === groupId);
                              return group ? (
                                <span
                                  key={groupId}
                                  style={{
                                    background: '#27ae60',
                                    color: 'white',
                                    padding: '4px 8px',
                                    borderRadius: '12px',
                                    fontSize: '0.8rem',
                                    fontWeight: '500'
                                  }}
                                >
                                  {group.name} ({group.studentIds.length})
                                </span>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div style={{
                        display: 'flex',
                        gap: '0.5rem',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: '1rem',
                        paddingTop: '1rem',
                        borderTop: '1px solid #e9ecef'
                      }}>
                        <button
                          onClick={() => openAssignmentPanel(activity.id)}
                          style={{
                            background: activity.assignment && 
                              (activity.assignment.staffIds.length > 0 || activity.assignment.groupIds.length > 0)
                              ? 'linear-gradient(135deg, #28a745 0%, #20c997 100%)'
                              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            fontWeight: '600'
                          }}
                        >
                          {activity.assignment && 
                            (activity.assignment.staffIds.length > 0 || activity.assignment.groupIds.length > 0)
                            ? '✅ Assigned' 
                            : '👥 Assign'
                          }
                        </button>
                        
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => {
                              if (index > 0) {
                                const newSchedule = [...schedule];
                                [newSchedule[index], newSchedule[index - 1]] = [newSchedule[index - 1], newSchedule[index]];
                                setSchedule(newSchedule);
                              }
                            }}
                            disabled={index === 0}
                            style={{
                              background: index === 0 ? '#ccc' : '#6c757d',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              width: '32px',
                              height: '32px',
                              cursor: index === 0 ? 'not-allowed' : 'pointer',
                              fontSize: '0.8rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            ↑
                          </button>
                          <button
                            onClick={() => {
                              if (index < schedule.length - 1) {
                                const newSchedule = [...schedule];
                                [newSchedule[index], newSchedule[index + 1]] = [newSchedule[index + 1], newSchedule[index]];
                                setSchedule(newSchedule);
                              }
                            }}
                            disabled={index === schedule.length - 1}
                            style={{
                              background: index === schedule.length - 1 ? '#ccc' : '#6c757d',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              width: '32px',
                              height: '32px',
                              cursor: index === schedule.length - 1 ? 'not-allowed' : 'pointer',
                              fontSize: '0.8rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            ↓
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {/* Schedule Summary */}
                <div style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  background: 'rgba(102, 126, 234, 0.1)',
                  borderRadius: '12px',
                  border: '1px solid rgba(102, 126, 234, 0.3)'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    fontSize: '0.9rem',
                    color: '#495057',
                    fontWeight: '600'
                  }}>
                    <span>📅 {startTime} - {getEndTime()}</span>
                    <span>⏱️ {Math.floor(getTotalDuration() / 60)}h {getTotalDuration() % 60}m</span>
                    <span>📝 {schedule.length} activities</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Group Creator Modal */}
      {showGroupCreator && (
        <GroupCreator
          students={students}
          groups={groups}
          onSave={handleGroupsSave}
          onCancel={() => setShowGroupCreator(false)}
        />
      )}

      {/* Save Schedule Dialog */}
      {showSaveDialog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '500px',
            width: '90vw',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{ margin: 0, color: '#2c3e50' }}>💾 Save Current Schedule</h3>
              <button
                onClick={() => setShowSaveDialog(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#6c757d'
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontWeight: '600',
                color: '#2c3e50'
              }}>
                Schedule Name *
              </label>
              <input
                type="text"
                value={saveScheduleName}
                onChange={(e) => setSaveScheduleName(e.target.value)}
                placeholder="Enter a name for this schedule..."
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e9ecef',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
                autoFocus
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontWeight: '600',
                color: '#2c3e50'
              }}>
                Description (Optional)
              </label>
              <textarea
                value={saveScheduleDescription}
                onChange={(e) => setSaveScheduleDescription(e.target.value)}
                placeholder="Add a description for this schedule..."
                style={{
                  width: '100%',
                  minHeight: '80px',
                  padding: '0.75rem',
                  border: '2px solid #e9ecef',
                  borderRadius: '6px',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{
              background: 'rgba(102, 126, 234, 0.1)',
              border: '1px solid rgba(102, 126, 234, 0.3)',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1.5rem'
            }}>
              <h6 style={{ 
                margin: '0 0 0.75rem 0',
                color: '#495057',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                📋 Schedule Preview:
              </h6>
              <div style={{
                fontSize: '0.85rem',
                color: '#495057',
                display: 'flex',
                gap: '1rem',
                flexWrap: 'wrap'
              }}>
                <span>📝 {schedule.length} activities</span>
                <span>⏱️ {Math.floor(getTotalDuration() / 60)}h {getTotalDuration() % 60}m</span>
                <span>🕐 {startTime} - {getEndTime()}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowSaveDialog(false)}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                Cancel
              </button>
              <button
                onClick={saveCurrentSchedule}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                💾 Save Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assignment Panel Modal */}
      {showAssignmentPanel && selectedActivityData && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '600px',
            width: '90vw',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{ margin: 0, color: '#2c3e50' }}>👥 Assign {selectedActivityData.name}</h3>
              <button
                onClick={() => setShowAssignmentPanel(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#6c757d'
                }}
              >
                ×
              </button>
            </div>
            
            <AssignmentPanel
              activity={selectedActivityData}
              staff={staff}
              students={students}
              groups={groups}
              onSave={(assignment) => {
                updateActivityAssignment(selectedActivityData.id, assignment);
                setShowAssignmentPanel(false);
              }}
              onCancel={() => setShowAssignmentPanel(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// ================================
// CLASSROOM GROUP ASSIGNMENT SYSTEM
// ================================

// Color definitions for groups
const GROUP_COLORS = [
  { id: 'orange', name: 'Orange', color: '#FF8C00', bg: '#FFF3E0' },
  { id: 'red', name: 'Red', color: '#DC3545', bg: '#FFEBEE' },
  { id: 'green', name: 'Green', color: '#28A745', bg: '#E8F5E8' },
  { id: 'blue', name: 'Blue', color: '#007BFF', bg: '#E3F2FD' },
  { id: 'purple', name: 'Purple', color: '#6F42C1', bg: '#F3E5F5' },
  { id: 'yellow', name: 'Yellow', color: '#FFC107', bg: '#FFFDE7' }
];

const SPECIAL_GROUPS = [
  { id: 'absent', name: 'Not at School Today', color: '#6C757D', bg: '#F8F9FA' },
  { id: 'pt', name: 'PT', color: '#17A2B8', bg: '#E0F7FA' },
  { id: 'related-arts', name: 'Related Arts', color: '#FD7E14', bg: '#FFF8E1' },
  { id: 'calm-time', name: 'Calm Time', color: '#20C997', bg: '#E8F8F5' }
];

interface GroupAssignment {
  id: string;
  groupName: string;
  color: string;
  studentIds: string[];
  staffId?: string;
  isIndependent: boolean;
}

const ClassroomGroupAssignment: React.FC<AssignmentPanelProps> = ({
  activity,
  students: propStudents,
  staff: propStaff,
  onSave,
  onCancel
}) => {
  // Load real data from localStorage with fallbacks
  const [realStudents, setRealStudents] = useState<any[]>([]);
  const [realStaff, setRealStaff] = useState<any[]>([]);
  const [groups, setGroups] = useState<GroupAssignment[]>([]);
  const [unassignedStudents, setUnassignedStudents] = useState<string[]>([]);

  useEffect(() => {
    // Load real student data
    try {
      const savedStudents = localStorage.getItem('students');
      const studentData = savedStudents ? JSON.parse(savedStudents) : propStudents || [];
      setRealStudents(studentData);
      setUnassignedStudents(studentData.map((s: any) => s.id));
    } catch (error) {
      console.error('Error loading students:', error);
      setRealStudents(propStudents || []);
      setUnassignedStudents((propStudents || []).map((s: any) => s.id));
    }

    // Load real staff data
    try {
      const savedStaff = localStorage.getItem('staff_members');
      const staffData = savedStaff ? JSON.parse(savedStaff) : propStaff || [];
      setRealStaff(staffData);
    } catch (error) {
      console.error('Error loading staff:', error);
      setRealStaff(propStaff || []);
    }
  }, [propStudents, propStaff]);

  const createGroup = (colorConfig: any) => {
    const newGroup: GroupAssignment = {
      id: `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      groupName: colorConfig.name,
      color: colorConfig.id,
      studentIds: [],
      isIndependent: false
    };
    setGroups(prev => [...prev, newGroup]);
  };

  const deleteGroup = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (group) {
      setUnassignedStudents(prev => [...prev, ...group.studentIds]);
      setGroups(prev => prev.filter(g => g.id !== groupId));
    }
  };

  const addStudentToGroup = (studentId: string, groupId: string) => {
    setGroups(prev => prev.map(group => 
      group.id === groupId 
        ? { ...group, studentIds: [...group.studentIds, studentId] }
        : group
    ));
    setUnassignedStudents(prev => prev.filter(id => id !== studentId));
  };

  const removeStudentFromGroup = (studentId: string, groupId: string) => {
    setGroups(prev => prev.map(group => 
      group.id === groupId 
        ? { ...group, studentIds: group.studentIds.filter(id => id !== studentId) }
        : group
    ));
    setUnassignedStudents(prev => [...prev, studentId]);
  };

  const assignStaffToGroup = (groupId: string, staffId: string) => {
    setGroups(prev => prev.map(group => 
      group.id === groupId 
        ? { ...group, staffId: staffId === 'none' ? undefined : staffId }
        : group
    ));
  };

  const toggleIndependent = (groupId: string) => {
    setGroups(prev => prev.map(group => 
      group.id === groupId 
        ? { ...group, isIndependent: !group.isIndependent, staffId: undefined }
        : group
    ));
  };

  const handleSave = () => {
    const assignment = {
      groupAssignments: groups,
      totalGroups: groups.length,
      assignedStudents: groups.flatMap(g => g.studentIds).length,
      unassignedStudents: unassignedStudents.length
    };
    onSave(assignment);
  };

  const getColorConfig = (colorId: string) => {
    return [...GROUP_COLORS, ...SPECIAL_GROUPS].find(c => c.id === colorId) || GROUP_COLORS[0];
  };

  const getStudentName = (studentId: string) => {
    const student = realStudents.find((s: any) => s.id === studentId);
    return student?.name || 'Unknown Student';
  };

  const getStaffName = (staffId: string) => {
    const staff = realStaff.find((s: any) => s.id === staffId);
    return staff?.name || 'Unknown Staff';
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '2rem'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        width: '95%',
        maxWidth: '1200px',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '2rem',
          borderRadius: '20px 20px 0 0',
          textAlign: 'center'
        }}>
          <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem', fontWeight: '700' }}>
            {activity.icon} Group Assignment
          </h2>
          <p style={{ margin: 0, fontSize: '1.2rem', opacity: 0.9 }}>
            {activity.name} - Assign students to color groups
          </p>
        </div>

        <div style={{ padding: '2rem' }}>
          {/* Create New Groups */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', color: '#333' }}>🎨 Create Color Groups</h3>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              {GROUP_COLORS.map(color => (
                <button
                  key={color.id}
                  onClick={() => createGroup(color)}
                  style={{
                    padding: '0.75rem 1rem',
                    border: `3px solid ${color.color}`,
                    background: color.bg,
                    color: color.color,
                    borderRadius: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  + {color.name} Group
                </button>
              ))}
            </div>
            
            <h4 style={{ marginBottom: '1rem', color: '#666', fontSize: '1rem' }}>Special Groups</h4>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {SPECIAL_GROUPS.map(special => (
                <button
                  key={special.id}
                  onClick={() => createGroup(special)}
                  style={{
                    padding: '0.5rem 0.75rem',
                    border: `2px solid ${special.color}`,
                    background: special.bg,
                    color: special.color,
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  + {special.name}
                </button>
              ))}
            </div>
          </div>

          {/* Unassigned Students */}
          {unassignedStudents.length > 0 && (
            <div style={{
              background: '#F8F9FA',
              border: '2px dashed #DEE2E6',
              borderRadius: '12px',
              padding: '1.5rem',
              marginBottom: '2rem'
            }}>
              <h3 style={{ margin: '0 0 1rem 0', color: '#495057' }}>
                👥 Students to Assign ({unassignedStudents.length})
              </h3>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {unassignedStudents.map(studentId => (
                  <div
                    key={studentId}
                    style={{
                      background: 'white',
                      border: '2px solid #CED4DA',
                      borderRadius: '8px',
                      padding: '0.5rem 0.75rem',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#495057'
                    }}
                  >
                    {getStudentName(studentId)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Groups */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', color: '#333' }}>📋 Active Groups ({groups.length})</h3>
            
            {groups.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '3rem',
                color: '#6C757D',
                fontSize: '1.1rem'
              }}>
                No groups created yet. Click a color above to create your first group!
              </div>
            )}

            <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
              {groups.map(group => {
                const colorConfig = getColorConfig(group.color);
                return (
                  <div
                    key={group.id}
                    style={{
                      border: `3px solid ${colorConfig.color}`,
                      borderRadius: '16px',
                      background: colorConfig.bg,
                      overflow: 'hidden'
                    }}
                  >
                    {/* Group Header */}
                    <div style={{
                      background: colorConfig.color,
                      color: 'white',
                      padding: '1rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700' }}>
                        {group.groupName} Group
                      </h4>
                      <button
                        onClick={() => deleteGroup(group.id)}
                        style={{
                          background: 'rgba(255, 255, 255, 0.2)',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '0.3rem 0.6rem',
                          color: 'white',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        ✕ Delete
                      </button>
                    </div>

                    <div style={{ padding: '1rem' }}>
                      {/* Staff Assignment */}
                      <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333' }}>
                          👨‍🏫 Assign Staff Member:
                        </label>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <select
                            value={group.staffId || 'none'}
                            onChange={(e) => assignStaffToGroup(group.id, e.target.value)}
                            disabled={group.isIndependent}
                            style={{
                              flex: 1,
                              padding: '0.5rem',
                              border: '2px solid #DEE2E6',
                              borderRadius: '8px',
                              fontSize: '14px',
                              background: group.isIndependent ? '#F8F9FA' : 'white'
                            }}
                          >
                            <option value="none">No staff assigned</option>
                            {realStaff.map((staff: any) => (
                              <option key={staff.id} value={staff.id}>
                                {staff.name} ({staff.role})
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => toggleIndependent(group.id)}
                            style={{
                              padding: '0.5rem 0.75rem',
                              border: '2px solid',
                              borderColor: group.isIndependent ? '#28A745' : '#6C757D',
                              background: group.isIndependent ? '#D4EDDA' : 'white',
                              color: group.isIndependent ? '#155724' : '#6C757D',
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                          >
                            {group.isIndependent ? '✓ Independent' : 'Set Independent'}
                          </button>
                        </div>
                      </div>

                      {/* Students in Group */}
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333' }}>
                          👥 Students ({group.studentIds.length}/5):
                        </label>
                        
                        {/* Add Student Dropdown */}
                        {unassignedStudents.length > 0 && (
                          <select
                            onChange={(e) => {
                              if (e.target.value && group.studentIds.length < 5) {
                                addStudentToGroup(e.target.value, group.id);
                                e.target.value = '';
                              }
                            }}
                            style={{
                              width: '100%',
                              padding: '0.5rem',
                              border: '2px solid #DEE2E6',
                              borderRadius: '8px',
                              marginBottom: '0.75rem',
                              fontSize: '14px'
                            }}
                          >
                            <option value="">+ Add student to group...</option>
                            {unassignedStudents.map(studentId => (
                              <option key={studentId} value={studentId}>
                                {getStudentName(studentId)}
                              </option>
                            ))}
                          </select>
                        )}

                        {/* Current Students */}
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {group.studentIds.map(studentId => (
                            <div
                              key={studentId}
                              style={{
                                background: 'white',
                                border: '2px solid #DEE2E6',
                                borderRadius: '8px',
                                padding: '0.5rem 0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontSize: '14px'
                              }}
                            >
                              <span>{getStudentName(studentId)}</span>
                              <button
                                onClick={() => removeStudentFromGroup(studentId, group.id)}
                                style={{
                                  background: '#DC3545',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  padding: '0.2rem 0.4rem',
                                  fontSize: '12px',
                                  cursor: 'pointer'
                                }}
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>

                        {group.studentIds.length === 0 && (
                          <div style={{
                            textAlign: 'center',
                            padding: '1rem',
                            color: '#6C757D',
                            fontStyle: 'italic',
                            fontSize: '14px'
                          }}>
                            No students assigned yet
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Summary */}
          {groups.length > 0 && (
            <div style={{
              background: '#E7F3FF',
              border: '2px solid #007BFF',
              borderRadius: '12px',
              padding: '1rem',
              marginBottom: '2rem'
            }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#0056B3' }}>📊 Assignment Summary</h4>
              <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', fontSize: '14px', color: '#495057' }}>
                <span><strong>Groups Created:</strong> {groups.length}</span>
                <span><strong>Students Assigned:</strong> {groups.flatMap(g => g.studentIds).length}/{realStudents.length}</span>
                <span><strong>Unassigned:</strong> {unassignedStudents.length}</span>
                <span><strong>Staff Assigned:</strong> {groups.filter(g => g.staffId).length}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            paddingTop: '1rem',
            borderTop: '2px solid #DEE2E6'
          }}>
            <button
              onClick={handleSave}
              style={{
                padding: '1rem 2rem',
                background: '#28A745',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1.1rem',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(40, 167, 69, 0.3)'
              }}
            >
              💾 Save Group Assignment
            </button>
            <button
              onClick={onCancel}
              style={{
                padding: '1rem 2rem',
                background: '#6C757D',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1.1rem',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const toggleGroup = (groupId: string) => {
    setSelectedGroupIds(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleSave = () => {
    onSave({
      staffIds: selectedStaffIds,
      groupIds: selectedGroupIds,
      isWholeClass,
      notes: notes.trim()
    });
  };

  return (
    <div style={{ padding: '1.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h4 style={{ margin: '0 0 0.5rem 0', color: '#2c3e50', fontSize: '1.1rem' }}>
          👥 Assign {activity?.name || 'Activity'}
        </h4>
        <p style={{ margin: 0, color: '#6c757d', fontSize: '0.9rem' }}>
          Select staff members and groups for this activity
        </p>
      </div>

      {/* Grouping Style */}
      <div style={{ marginBottom: '2rem' }}>
        <h5 style={{ margin: '0 0 1rem 0', color: '#495057', fontSize: '1rem', fontWeight: '600' }}>
          📊 Grouping Style
        </h5>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setIsWholeClass(true)}
            style={{
              padding: '0.5rem 1rem',
              border: `2px solid ${isWholeClass ? '#667eea' : '#dee2e6'}`,
              borderRadius: '8px',
              background: isWholeClass ? 'rgba(102, 126, 234, 0.1)' : 'white',
              color: isWholeClass ? '#667eea' : '#6c757d',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: '600',
              transition: 'all 0.2s ease'
            }}
          >
            👥 Whole Class
          </button>
          <button
            onClick={() => setIsWholeClass(false)}
            style={{
              padding: '0.5rem 1rem',
              border: `2px solid ${!isWholeClass ? '#667eea' : '#dee2e6'}`,
              borderRadius: '8px',
              background: !isWholeClass ? 'rgba(102, 126, 234, 0.1)' : 'white',
              color: !isWholeClass ? '#667eea' : '#6c757d',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: '600',
              transition: 'all 0.2s ease'
            }}
          >
            🎯 Groups
          </button>
        </div>
      </div>

      {/* Staff Assignment */}
      <div style={{ marginBottom: '2rem' }}>
        <h5 style={{ margin: '0 0 1rem 0', color: '#495057', fontSize: '1rem', fontWeight: '600' }}>
          👨‍🏫 Assign Staff ({selectedStaffIds.length} selected)
        </h5>
        {staff.length === 0 ? (
          <div style={{
            padding: '1rem',
            background: '#f8f9fa',
            borderRadius: '8px',
            border: '2px dashed #dee2e6',
            textAlign: 'center',
            color: '#6c757d'
          }}>
            No staff members available
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            {staff.map(staffMember => (
              <div
                key={staffMember.id}
                onClick={() => toggleStaff(staffMember.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.75rem',
                  border: `2px solid ${selectedStaffIds.includes(staffMember.id) ? '#28a745' : '#e9ecef'}`,
                  borderRadius: '8px',
                  background: selectedStaffIds.includes(staffMember.id) ? 'rgba(40, 167, 69, 0.1)' : 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '4px',
                  background: selectedStaffIds.includes(staffMember.id) ? '#28a745' : '#dee2e6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '0.7rem',
                  fontWeight: 'bold'
                }}>
                  {selectedStaffIds.includes(staffMember.id) ? '✓' : ''}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontWeight: '600', 
                    color: '#2c3e50',
                    fontSize: '0.9rem'
                  }}>
                    {staffMember.name}
                  </div>
                  <div style={{ 
                    fontSize: '0.8rem', 
                    color: '#6c757d'
                  }}>
                    {staffMember.role}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Group Assignment (only show if not whole class) */}
      {!isWholeClass && (
        <div style={{ marginBottom: '2rem' }}>
          <h5 style={{ margin: '0 0 1rem 0', color: '#495057', fontSize: '1rem', fontWeight: '600' }}>
            👤 Assign Groups ({selectedGroupIds.length} selected)
          </h5>
          {groups.length === 0 ? (
            <div style={{
              padding: '1rem',
              background: '#f8f9fa',
              borderRadius: '8px',
              border: '2px dashed #dee2e6',
              textAlign: 'center',
              color: '#6c757d'
            }}>
              <div style={{ marginBottom: '0.5rem' }}>No groups created yet</div>
              <small>Use Group Creator to create student groups</small>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              {groups.map(group => (
                <div
                  key={group.id}
                  onClick={() => toggleGroup(group.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '0.75rem',
                    border: `2px solid ${selectedGroupIds.includes(group.id) ? '#3498db' : '#e9ecef'}`,
                    borderRadius: '8px',
                    background: selectedGroupIds.includes(group.id) ? 'rgba(52, 152, 219, 0.1)' : 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '4px',
                    background: selectedGroupIds.includes(group.id) ? '#3498db' : '#dee2e6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '0.7rem',
                    fontWeight: 'bold'
                  }}>
                    {selectedGroupIds.includes(group.id) ? '✓' : ''}
                  </div>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '2px',
                    background: group.color,
                    flexShrink: 0
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      fontWeight: '600', 
                      color: '#2c3e50',
                      fontSize: '0.9rem'
                    }}>
                      {group.name}
                    </div>
                    <div style={{ 
                      fontSize: '0.8rem', 
                      color: '#6c757d'
                    }}>
                      {group.studentIds.length} students • {group.groupType}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Notes */}
      <div style={{ marginBottom: '2rem' }}>
        <h5 style={{ margin: '0 0 0.5rem 0', color: '#495057', fontSize: '1rem', fontWeight: '600' }}>
          📝 Notes (Optional)
        </h5>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any notes about this assignment..."
          style={{
            width: '100%',
            minHeight: '60px',
            padding: '0.75rem',
            border: '2px solid #e9ecef',
            borderRadius: '6px',
            fontSize: '0.9rem',
            resize: 'vertical',
            fontFamily: 'inherit'
          }}
        />
      </div>

      {/* Assignment Summary */}
      {(selectedStaffIds.length > 0 || selectedGroupIds.length > 0 || notes.trim()) && (
        <div style={{
          background: 'rgba(102, 126, 234, 0.1)',
          border: '1px solid rgba(102, 126, 234, 0.3)',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '2rem'
        }}>
          <h6 style={{ 
            margin: '0 0 0.75rem 0',
            color: '#495057',
            fontSize: '0.9rem',
            fontWeight: '600'
          }}>
            📋 Assignment Summary:
          </h6>
          <div style={{ fontSize: '0.85rem', color: '#495057' }}>
            <div>👥 Grouping: {isWholeClass ? 'Whole Class' : 'Selected Groups'}</div>
            {selectedStaffIds.length > 0 && (
              <div>👨‍🏫 Staff: {selectedStaffIds.map(id => staff.find(s => s.id === id)?.name).join(', ')}</div>
            )}
            {selectedGroupIds.length > 0 && (
              <div>👤 Groups: {selectedGroupIds.map(id => groups.find(g => g.id === id)?.name).join(', ')}</div>
            )}
            {notes.trim() && (
              <div>📝 Notes: {notes.trim()}</div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
        <button 
          onClick={onCancel}
          style={{ 
            padding: '0.75rem 1.5rem', 
            background: '#6c757d', 
            color: 'white', 
            border: 'none', 
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>
        <button 
          onClick={handleSave}
          style={{ 
            padding: '0.75rem 1.5rem', 
            background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)', 
            color: 'white', 
            border: 'none', 
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          💾 Save Assignment
        </button>
      </div>
    </div>
  );
};

export default ScheduleBuilder;