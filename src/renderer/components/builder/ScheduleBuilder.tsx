import React, { useState, useEffect } from 'react';
import GroupCreator from './GroupCreator';
import ScheduleManager from './ScheduleManager';
import { Student, Staff, StudentGroup, Activity, ScheduleActivity, ActivityAssignment } from '../../types';

// Type alias for enhanced activity with assignments
type EnhancedActivity = ScheduleActivity;

interface ScheduleBuilderProps {
  isActive: boolean;
}

const ScheduleBuilder: React.FC<ScheduleBuilderProps> = ({ isActive }) => {
  // State management
  const [schedule, setSchedule] = useState<EnhancedActivity[]>([]);
  const [startTime, setStartTime] = useState('08:00');
  const [staff, setStaff] = useState<Staff[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [groups, setGroups] = useState<StudentGroup[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [showAssignmentPanel, setShowAssignmentPanel] = useState(false);
  const [showGroupCreator, setShowGroupCreator] = useState(false);
  const [showScheduleManager, setShowScheduleManager] = useState(false);
  const [availableActivities, setAvailableActivities] = useState<(Omit<EnhancedActivity, 'assignment'> & { 
    addedFromLibrary?: boolean;
    originalId?: string;
    tags?: string[];
    materials?: string[];
    createdAt?: string;
  })[]>([]);

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
        skillLevel: 'proficient',
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
        skillLevel: 'developing',
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
        skillLevel: 'advanced',
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
        skillLevel: 'emerging',
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
        skillLevel: 'developing',
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
        skillLevel: 'proficient',
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

  // Get the current activity library (from localStorage or default)
  const activityLibrary = availableActivities.length > 0 ? availableActivities : defaultActivityLibrary;

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

  // Remove activity from available activities
  const removeFromAvailable = (activityId: string) => {
    setAvailableActivities(prev => {
      const updatedActivities = prev.filter(activity => activity.id !== activityId);
      localStorage.setItem('available_activities', JSON.stringify(updatedActivities));
      console.log(`Removed activity ${activityId} from available activities`);
      return updatedActivities;
    });
  };

  // Render available activities section
  const renderAvailableActivities = () => {
    if (availableActivities.length === 0) {
      return (
        <div style={{
          textAlign: 'center',
          padding: '2rem 1rem',
          color: '#6c757d',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '2px dashed #dee2e6',
          margin: '1rem 0'
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📚</div>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>
            No activities from library yet.<br/>
            Visit Activity Library to add activities.
          </p>
        </div>
      );
    }

    return (
      <div style={{ marginBottom: '1rem' }}>
        <h4 style={{ 
          margin: '0 0 0.75rem 0', 
          color: '#495057', 
          fontSize: '1rem',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          📚 Available Activities ({availableActivities.length})
          <button
            onClick={() => {
              localStorage.removeItem('available_activities');
              setAvailableActivities([]);
            }}
            style={{
              background: 'none',
              border: '1px solid #dc3545',
              color: '#dc3545',
              borderRadius: '4px',
              padding: '2px 6px',
              fontSize: '0.7rem',
              cursor: 'pointer',
              marginLeft: 'auto'
            }}
            title="Clear all available activities"
          >
            Clear All
          </button>
        </h4>
        
        <div style={{ 
          display: 'grid', 
          gap: '0.5rem',
          maxHeight: '300px',
          overflowY: 'auto',
          padding: '0.25rem'
        }}>
          {availableActivities.map((activity) => (
            <div 
              key={activity.id} 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem',
                background: 'white',
                border: '1px solid #e9ecef',
                borderRadius: '8px',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#667eea';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(102, 126, 234, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e9ecef';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Activity Icon */}
              <div style={{ fontSize: '1.25rem', flexShrink: 0 }}>
                {activity.icon && activity.icon.startsWith('data:') ? (
                  <img 
                    src={activity.icon} 
                    alt={activity.name} 
                    style={{ 
                      width: '1.25rem', 
                      height: '1.25rem', 
                      objectFit: 'cover', 
                      borderRadius: '3px' 
                    }} 
                  />
                ) : (
                  activity.icon || '📝'
                )}
              </div>

              {/* Activity Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ 
                  fontWeight: '600', 
                  fontSize: '0.85rem',
                  color: '#2c3e50',
                  marginBottom: '0.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  {activity.name}
                  {activity.isCustom && (
                    <span style={{
                      background: '#28a745',
                      color: 'white',
                      padding: '1px 4px',
                      borderRadius: '6px',
                      fontSize: '0.6rem',
                      fontWeight: '500'
                    }}>
                      Custom
                    </span>
                  )}
                  {activity.addedFromLibrary && (
                    <span style={{
                      background: '#17a2b8',
                      color: 'white',
                      padding: '1px 4px',
                      borderRadius: '6px',
                      fontSize: '0.6rem',
                      fontWeight: '500'
                    }}>
                      Library
                    </span>
                  )}
                </div>
                <div style={{ 
                  fontSize: '0.75rem', 
                  color: '#6c757d',
                  display: 'flex',
                  gap: '0.5rem',
                  alignItems: 'center'
                }}>
                  <span>{activity.duration}min</span>
                  <span>•</span>
                  <span>{activity.category}</span>
                  {activity.tags && activity.tags.length > 0 && (
                    <>
                      <span>•</span>
                      <span>{activity.tags.slice(0, 2).join(', ')}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
                <button
                  onClick={() => addToSchedule(activity)}
                  style={{
                    background: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    fontSize: '0.7rem',
                    cursor: 'pointer',
                    fontWeight: '600',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#218838';
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#28a745';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                  title={`Add ${activity.name} to schedule`}
                >
                  + Add  
                </button>
                <button
                  onClick={() => removeFromAvailable(activity.id)}
                  style={{
                    background: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '4px 6px',
                    fontSize: '0.7rem',
                    cursor: 'pointer',
                    fontWeight: '600',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#c82333';
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#dc3545';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                  title={`Remove ${activity.name} from available activities`}
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
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

  const handleLoadSchedule = (activities: EnhancedActivity[], newStartTime: string) => {
    setSchedule(activities);
    setStartTime(newStartTime);
    setShowScheduleManager(false);
  };

  if (!isActive) return null;

  const selectedActivityData = selectedActivity ? schedule.find(a => a.id === selectedActivity) : null;

  return (
    <div className="schedule-builder">
      {/* Header */}
      <div className="schedule-header">
        <h2>🛠️ Schedule Builder</h2>
        <div className="schedule-controls">
          <div className="time-control">
            <label>Start Time:</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          <div className="total-time">
            Total: {Math.floor(getTotalDuration() / 60)}h {getTotalDuration() % 60}m
          </div>
          <button 
            className="clear-button"
            onClick={() => setSchedule([])}
          >
            Clear All
          </button>
          <button 
            className="create-activity-button"
            onClick={() => setShowScheduleManager(true)}
          >
            📅 Schedule Manager
          </button>
          <button 
            className="create-activity-button"
            onClick={() => setShowGroupCreator(true)}
          >
            👥 Manage Groups ({groups.length})
          </button>
        </div>
      </div>

      {/* Group Management Banner */}
      {groups.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
          color: 'white',
          padding: '12px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          <div>
            ✅ <strong>{groups.length} groups created</strong> - 
            {groups.reduce((sum, group) => sum + group.studentIds.length, 0)} students assigned
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {groups.slice(0, 3).map(group => (
              <div key={group.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div 
                  style={{
                    width: '12px',
                    height: '12px',
                    backgroundColor: group.color,
                    borderRadius: '2px'
                  }}
                />
                <span>{group.name} ({group.studentIds.length})</span>
              </div>
            ))}
            {groups.length > 3 && <span>+{groups.length - 3} more</span>}
          </div>
        </div>
      )}

      <div className="schedule-content">
        {/* Activity Library Panel */}
        <div className="activity-library">
          <h3 style={{ 
            margin: '0 0 1rem 0',
            color: '#2c3e50',
            fontSize: '1.25rem',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            📚 Activity Library
          </h3>
          
          {/* Available Activities from Library */}
          {renderAvailableActivities()}
          
          {/* Default Activity Library */}
          <div style={{ marginBottom: '1rem' }}>
            <h4 style={{ 
              margin: '0 0 0.75rem 0', 
              color: '#495057', 
              fontSize: '1rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              🎯 Default Activities ({defaultActivityLibrary.length})
            </h4>
            
            <div className="activities-grid">
              {activityLibrary.map((activity) => (
                <div key={activity.id} className="activity-card">
                  <div className="activity-icon">
                    {activity.icon && activity.icon.startsWith('data:') ? (
                      <img src={activity.icon} alt={activity.name} style={{ width: '2rem', height: '2rem', objectFit: 'cover', borderRadius: '4px' }} />
                    ) : (
                      activity.icon || '📝'
                    )}
                  </div>
                  <div className="activity-info">
                    <h4>{activity.name}</h4>
                    <div className="activity-badges">
                      <span className="activity-duration">{activity.duration}min</span>
                      <span className="activity-category">{activity.category}</span>
                      {activity.isCustom && (
                        <span style={{
                          background: '#28a745',
                          color: 'white',
                          padding: '2px 6px',
                          borderRadius: '10px',
                          fontSize: '10px',
                          fontWeight: '600'
                        }}>Custom</span>
                      )}
                    </div>
                    {activity.description && (
                      <p style={{ fontSize: '12px', color: '#6c757d', margin: '4px 0 0 0' }}>
                        {activity.description}
                      </p>
                    )}
                  </div>
                  <div className="activity-actions">
                    <button
                      className="add-button"
                      onClick={() => addToSchedule(activity)}
                    >
                      + Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Integration Status */}
          <div style={{
            marginTop: '1rem',
            padding: '0.75rem',
            background: 'rgba(40, 167, 69, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(40, 167, 69, 0.3)',
            fontSize: '0.85rem',
            color: '#155724'
          }}>
            📊 Integration Status: {availableActivities.length > 0 ? (
              <span>
                {availableActivities.length} activities loaded from library
                ({availableActivities.filter(a => a.isCustom).length} custom, {' '}
                {availableActivities.filter(a => a.addedFromLibrary).length} library-added)
              </span>
            ) : 
              'No library activities yet (visit Activity Library to sync)'}
          </div>
        </div>

        {/* Schedule Canvas Panel */}
        <div className="schedule-canvas">
          {/* Today's Schedule - IMPROVED LAYOUT */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.15)',
            padding: '1.5rem',
            borderRadius: '16px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            minHeight: '200px',
            maxHeight: '400px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
              paddingBottom: '0.5rem',
              borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <h3 style={{ 
                margin: 0, 
                color: 'white', 
                fontSize: '1.2rem',
                fontWeight: '600'
              }}>
                📅 Today's Schedule
              </h3>
              
              {schedule.length > 0 && (
                <button
                  onClick={() => setSchedule([])}
                  style={{
                    background: 'rgba(231, 76, 60, 0.8)',
                    color: 'white',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(231, 76, 60, 1)';
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(231, 76, 60, 0.8)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  🗑️ Clear All
                </button>
              )}
            </div>

            {schedule.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '2rem',
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '1rem'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
                <p style={{ margin: 0 }}>
                  Click activities from the library to build your schedule
                </p>
              </div>
            ) : (
              <>
                {/* Activities List - IMPROVED SPACING */}
                <div style={{
                  flex: '1',
                  overflow: 'auto',
                  paddingRight: '8px'
                }}>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem'
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
                            background: 'rgba(255, 255, 255, 0.95)',
                            padding: '1rem',
                            borderRadius: '12px',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                            position: 'relative',
                            minHeight: '80px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between'
                          }}
                        >
                          {/* Remove button */}
                          <button
                            onClick={() => removeFromSchedule(index)}
                            style={{
                              position: 'absolute',
                              top: '8px',
                              right: '8px',
                              background: '#e74c3c',
                              color: 'white',
                              border: 'none',
                              borderRadius: '50%',
                              width: '24px',
                              height: '24px',
                              cursor: 'pointer',
                              fontSize: '14px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              zIndex: 10
                            }}
                            title="Remove activity"
                          >
                            ×
                          </button>

                          {/* Activity Header */}
                          <div style={{ marginBottom: '0.5rem' }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '0.75rem',
                              marginBottom: '0.5rem'
                            }}>
                              <div style={{ fontSize: '1.5rem' }}>
                                {activity.icon}
                              </div>
                              <div style={{ flex: '1', paddingRight: '30px' }}>
                                <h4 style={{
                                  margin: '0 0 0.25rem 0',
                                  color: '#2c3e50',
                                  fontSize: '1rem',
                                  fontWeight: '600',
                                  lineHeight: '1.3'
                                }}>
                                  {activity.name}
                                </h4>
                                
                                <div style={{
                                  display: 'flex',
                                  flexWrap: 'wrap',
                                  gap: '1rem',
                                  fontSize: '0.85rem',
                                  color: '#666'
                                }}>
                                  <span style={{ fontWeight: '500' }}>
                                    🕐 {activityStartTime} - {activityEndTime}
                                  </span>
                                  <span style={{ fontWeight: '500' }}>
                                    ⏱️ {activity.duration} min
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Staff Assignment */}
                          {activity.assignment && activity.assignment.staffIds.length > 0 && (
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              marginBottom: '0.5rem'
                            }}>
                              <span style={{ fontSize: '0.8rem', color: '#666', fontWeight: '500' }}>
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
                                        padding: '2px 8px',
                                        borderRadius: '12px',
                                        fontSize: '0.75rem',
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

                          {/* Group Assignment */}
                          {activity.assignment && activity.assignment.groupIds.length > 0 && (
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              marginBottom: '0.5rem'
                            }}>
                              <span style={{ fontSize: '0.8rem', color: '#666', fontWeight: '500' }}>
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
                                        padding: '2px 8px',
                                        borderRadius: '12px',
                                        fontSize: '0.75rem',
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
                            justifyContent: 'flex-end',
                            marginTop: '0.5rem',
                            paddingTop: '0.5rem',
                            borderTop: '1px solid rgba(0, 0, 0, 0.1)'
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
                                padding: '6px 12px',
                                borderRadius: '8px',
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                                fontWeight: '600',
                                minHeight: '32px',
                                transition: 'all 0.3s ease',
                                boxShadow: activity.assignment && 
                                  (activity.assignment.staffIds.length > 0 || activity.assignment.groupIds.length > 0)
                                  ? '0 2px 8px rgba(40, 167, 69, 0.3)'
                                  : '0 2px 8px rgba(102, 126, 234, 0.3)'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.05)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                              }}
                            >
                              {activity.assignment && 
                                (activity.assignment.staffIds.length > 0 || activity.assignment.groupIds.length > 0)
                                ? '✅ Assigned' 
                                : '👥 Assign'
                              }
                            </button>
                            
                            <div style={{ display: 'flex', gap: '2px' }}>
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
                                  borderRadius: '4px',
                                  width: '20px',
                                  height: '20px',
                                  cursor: index === 0 ? 'not-allowed' : 'pointer',
                                  fontSize: '0.7rem',
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
                                  borderRadius: '4px',
                                  width: '20px',
                                  height: '20px',
                                  cursor: index === schedule.length - 1 ? 'not-allowed' : 'pointer',
                                  fontSize: '0.7rem',
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
                  </div>
                </div>
                
                {/* Schedule Summary */}
                <div style={{
                  marginTop: '1rem',
                  padding: '0.75rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                    fontSize: '0.8rem',
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontWeight: '500'
                  }}>
                    <span>📅 {startTime} - {getEndTime()}</span>
                    <span>⏱️ {Math.floor(getTotalDuration() / 60)}h {getTotalDuration() % 60}m</span>
                    <span>📝 {schedule.length} activities</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Schedule Manager Modal */}
      {showScheduleManager && (
        <ScheduleManager
          currentSchedule={schedule}
          currentStartTime={startTime}
          onLoadSchedule={handleLoadSchedule}
          onClose={() => setShowScheduleManager(false)}
        />
      )}

      {/* Group Creator Modal */}
      {showGroupCreator && (
        <GroupCreator
          students={students}
          groups={groups}
          onSave={handleGroupsSave}
          onCancel={() => setShowGroupCreator(false)}
        />
      )}

      {/* Assignment Panel Modal */}
      {showAssignmentPanel && selectedActivityData && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>👥 Assign {selectedActivityData.name}</h3>
              <button className="close-button" onClick={() => setShowAssignmentPanel(false)}>×</button>
            </div>
            
            <div className="modal-body">
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
        </div>
      )}
    </div>
  );
};

// Assignment Panel Component
interface AssignmentPanelProps {
  activity: EnhancedActivity;
  staff: Staff[];
  students: Student[];
  groups: StudentGroup[];
  onSave: (assignment: ActivityAssignment) => void;
  onCancel: () => void;
}

const AssignmentPanel: React.FC<AssignmentPanelProps> = ({
  activity,
  staff,
  students,
  groups,
  onSave,
  onCancel
}) => {
  const [selectedStaff, setSelectedStaff] = useState<string[]>(activity.assignment?.staffIds || []);
  const [selectedGroups, setSelectedGroups] = useState<string[]>(activity.assignment?.groupIds || []);
  const [isWholeClass, setIsWholeClass] = useState<boolean>(activity.assignment?.isWholeClass ?? true);
  const [groupingType, setGroupingType] = useState<'whole-class' | 'small-groups' | 'individual' | 'flexible'>('whole-class');
  const [notes, setNotes] = useState(activity.assignment?.notes || '');

  const handleStaffToggle = (staffId: string) => {
    setSelectedStaff(prev => 
      prev.includes(staffId) 
        ? prev.filter(id => id !== staffId)
        : [...prev, staffId]
    );
  };

  const handleGroupToggle = (groupId: string) => {
    setSelectedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
    if (selectedGroups.length > 0 || (!selectedGroups.includes(groupId) && groupId)) {
      setIsWholeClass(false);
    }
  };

  const handleSave = () => {
    onSave({
      staffIds: selectedStaff,
      groupIds: selectedGroups,
      isWholeClass: groupingType === 'whole-class' ? true : (selectedGroups.length === 0 ? isWholeClass : false),
      notes: notes.trim(),
      groupingType: groupingType
    });
  };

  const assignedStudentCount = selectedGroups.reduce((count, groupId) => {
    const group = groups.find(g => g.id === groupId);
    return count + (group?.studentIds.length || 0);
  }, 0);

  return (
    <div style={{ padding: '1.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h4 style={{ color: '#2c3e50', marginBottom: '0.5rem' }}>
          {activity.icon} {activity.name}
        </h4>
        <p style={{ color: '#6c757d', fontSize: '14px' }}>
          {activity.description} • {activity.duration} minutes
        </p>
      </div>

      {/* Staff Assignment */}
      <div style={{ marginBottom: '2rem' }}>
        <h5 style={{ marginBottom: '1rem', color: '#2c3e50' }}>👨‍🏫 Assign Staff</h5>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
          {staff.filter(s => s.status === 'active').map(staffMember => (
            <label
              key={staffMember.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem',
                background: selectedStaff.includes(staffMember.id) ? '#e3f2fd' : '#f8f9fa',
                borderRadius: '8px',
                border: selectedStaff.includes(staffMember.id) ? '2px solid #2196f3' : '1px solid #dee2e6',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                if (!selectedStaff.includes(staffMember.id)) {
                  e.currentTarget.style.background = '#f0f0f0';
                }
              }}
              onMouseLeave={(e) => {
                if (!selectedStaff.includes(staffMember.id)) {
                  e.currentTarget.style.background = '#f8f9fa';
                }
              }}
            >
              <input
                type="checkbox"
                checked={selectedStaff.includes(staffMember.id)}
                onChange={() => handleStaffToggle(staffMember.id)}
                style={{ margin: 0 }}
              />
              <div>
                <div style={{ fontWeight: '600', color: '#2c3e50' }}>{staffMember.name}</div>
                <div style={{ fontSize: '12px', color: '#6c757d' }}>{staffMember.role}</div>
                {staffMember.isMainTeacher && (
                  <span style={{
                    fontSize: '10px',
                    background: '#28a745',
                    color: 'white',
                    padding: '2px 4px',
                    borderRadius: '4px',
                    marginTop: '2px',
                    display: 'inline-block'
                  }}>
                    Lead
                  </span>
                )}
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Student Assignment */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h5 style={{ margin: 0, color: '#2c3e50' }}>👥 Assign Students</h5>
          
          {/* Quick Action Buttons */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => {
                setSelectedGroups(groups.map(g => g.id));
                setIsWholeClass(false);
                setGroupingType('small-groups');
              }}
              disabled={groups.length === 0}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: '600',
                border: 'none',
                borderRadius: '6px',
                cursor: groups.length === 0 ? 'not-allowed' : 'pointer',
                background: groups.length === 0 ? '#e9ecef' : 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                color: groups.length === 0 ? '#6c757d' : 'white',
                transition: 'all 0.3s ease',
                minHeight: '32px'
              }}
              onMouseEnter={(e) => {
                if (groups.length > 0) {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(40, 167, 69, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (groups.length > 0) {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              ✅ Assign All
            </button>
            
            <button
              onClick={() => {
                setSelectedGroups([]);
                setIsWholeClass(false);
                setGroupingType('individual');
              }}
              disabled={selectedGroups.length === 0 && !isWholeClass}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: '600',
                border: 'none',
                borderRadius: '6px',
                cursor: (selectedGroups.length === 0 && !isWholeClass) ? 'not-allowed' : 'pointer',
                background: (selectedGroups.length === 0 && !isWholeClass) ? '#e9ecef' : 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
                color: (selectedGroups.length === 0 && !isWholeClass) ? '#6c757d' : 'white',
                transition: 'all 0.3s ease',
                minHeight: '32px'
              }}
              onMouseEnter={(e) => {
                if (selectedGroups.length > 0 || isWholeClass) {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(231, 76, 60, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedGroups.length > 0 || isWholeClass) {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              🗑️ Clear All
            </button>
          </div>
        </div>
        
        {/* Grouping Type Selector */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h6 style={{ margin: '0 0 0.75rem 0', color: '#495057', fontSize: '14px', fontWeight: '600' }}>
            📋 Activity Grouping Style:
          </h6>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {[
              { type: 'whole-class', label: '👥 Whole Class', desc: 'Everyone together' },
              { type: 'small-groups', label: '👤 Small Groups', desc: 'Divided groups' },
              { type: 'individual', label: '🧑 Individual', desc: 'Each student alone' },
              { type: 'flexible', label: '🔄 Flexible', desc: 'Mixed arrangements' }
            ].map(({ type, label, desc }) => (
              <button
                key={type}
                onClick={() => {
                  console.log(`Grouping type changed to: ${type}`);
                  setGroupingType(type as any);
                  
                  // Handle state changes based on grouping type
                  switch (type) {
                    case 'whole-class':
                      setIsWholeClass(true);
                      setSelectedGroups([]);
                      console.log('Whole class mode activated - cleared group selections');
                      break;
                      
                    case 'small-groups':
                      setIsWholeClass(false);
                      // Keep existing group selections if any
                      console.log('Small groups mode activated - keeping existing group selections');
                      break;
                      
                    case 'individual':
                      setIsWholeClass(false);
                      setSelectedGroups([]);
                      console.log('Individual mode activated - cleared group selections');
                      break;
                      
                    case 'flexible':
                      setIsWholeClass(false);
                      // Keep existing group selections for flexible arrangements
                      console.log('Flexible mode activated - keeping existing selections for mixed arrangements');
                      break;
                      
                    default:
                      console.warn(`Unknown grouping type: ${type}`);
                  }
                }}
                style={{
                  padding: '0.75rem 1rem',
                  border: groupingType === type ? '2px solid #667eea' : '2px solid #dee2e6',
                  background: groupingType === type ? 'rgba(102, 126, 234, 0.1)' : 'white',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  minHeight: '60px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.25rem',
                  flex: '1',
                  minWidth: '120px'
                }}
                onMouseEnter={(e) => {
                  if (groupingType !== type) {
                    e.currentTarget.style.background = 'rgba(102, 126, 234, 0.05)';
                    e.currentTarget.style.borderColor = '#667eea';
                  }
                }}
                onMouseLeave={(e) => {
                  if (groupingType !== type) {
                    e.currentTarget.style.background = 'white';
                    e.currentTarget.style.borderColor = '#dee2e6';
                  }
                }}
              >
                <div style={{ fontSize: '0.9rem', color: groupingType === type ? '#667eea' : '#2c3e50' }}>
                  {label}
                </div>
                <div style={{ 
                  fontSize: '0.7rem', 
                  color: groupingType === type ? '#667eea' : '#6c757d',
                  textAlign: 'center',
                  lineHeight: '1.2'
                }}>
                  {desc}
                </div>
              </button>
            ))}
          </div>
        </div>
        
        {/* Whole Class Option - Enhanced for Touch */}
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          padding: '1.25rem',
          background: isWholeClass 
            ? 'linear-gradient(135deg, #e8f5e8 0%, #d4edda 100%)' 
            : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
          borderRadius: '12px',
          border: isWholeClass ? '3px solid #28a745' : '2px solid #dee2e6',
          cursor: 'pointer',
          marginBottom: '1.5rem',
          transition: 'all 0.3s ease',
          minHeight: '70px',
          boxShadow: isWholeClass ? '0 4px 12px rgba(40, 167, 69, 0.2)' : '0 2px 4px rgba(0, 0, 0, 0.1)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Visual feedback indicator */}
          {isWholeClass && (
            <div style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              background: '#28a745',
              color: 'white',
              fontSize: '14px',
              padding: '4px 8px',
              borderRadius: '6px',
              fontWeight: '600',
              animation: 'fadeIn 0.3s ease'
            }}>
              ✓ Selected
            </div>
          )}
          
          <input
            type="radio"
            name="studentAssignment"
            checked={isWholeClass}
            onChange={(e) => {
              setIsWholeClass(e.target.checked);
              if (e.target.checked) {
                setSelectedGroups([]);
              }
            }}
            style={{ 
              margin: 0, 
              width: '20px', 
              height: '20px',
              accentColor: '#28a745'
            }}
          />
          <div>
            <div style={{ 
              fontWeight: '700', 
              color: isWholeClass ? '#155724' : '#2c3e50',
              fontSize: '16px',
              marginBottom: '4px'
            }}>
              👥 Whole Class Activity
            </div>
            <div style={{ 
              fontSize: '14px', 
              color: isWholeClass ? '#155724' : '#6c757d',
              fontWeight: '500'
            }}>
              All {students.length} students participate together
            </div>
          </div>
        </label>

        {/* Group Selection - Enhanced Dropdown Style */}
        {groups.length > 0 && (
          <div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              marginBottom: '1rem'
            }}>
              <h6 style={{ margin: 0, color: '#495057', fontSize: '14px', fontWeight: '600' }}>Or select specific groups:</h6>
              <div style={{
                background: selectedGroups.length > 0 ? '#28a745' : '#6c757d',
                color: 'white',
                fontSize: '12px',
                padding: '2px 6px',
                borderRadius: '10px',
                fontWeight: '600',
                minWidth: '20px',
                textAlign: 'center'
              }}>
                {selectedGroups.length}
              </div>
            </div>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
              gap: '1rem' 
            }}>
              {groups.map(group => {
                const isSelected = selectedGroups.includes(group.id);
                return (
                  <label
                    key={group.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '1.25rem',
                      background: isSelected 
                        ? `linear-gradient(135deg, ${group.color}15 0%, ${group.color}25 100%)`
                        : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                      borderRadius: '12px',
                      border: isSelected ? `3px solid ${group.color}` : '2px solid #dee2e6',
                      borderLeft: `6px solid ${group.color}`,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      minHeight: '80px',
                      boxShadow: isSelected 
                        ? `0 4px 12px ${group.color}30` 
                        : '0 2px 4px rgba(0, 0, 0, 0.1)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #f0f0f0 0%, #e6e6e6 100%)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                      }
                    }}
                  >
                    {/* Visual feedback indicator */}
                    {isSelected && (
                      <div style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        background: group.color,
                        color: 'white',
                        fontSize: '12px',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontWeight: '600'
                      }}>
                        ✓ Selected
                      </div>
                    )}
                    
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleGroupToggle(group.id)}
                      style={{ 
                        margin: 0,
                        width: '20px',
                        height: '20px',
                        accentColor: group.color
                      }}
                    />
                    <div style={{ flex: '1', paddingRight: '40px' }}>
                      <div style={{ 
                        fontWeight: '700', 
                        color: isSelected ? '#2c3e50' : '#2c3e50',
                        fontSize: '15px',
                        marginBottom: '4px'
                      }}>
                        {group.name}
                      </div>
                      <div style={{ 
                        fontSize: '13px', 
                        color: '#6c757d', 
                        marginBottom: '6px',
                        fontWeight: '600'
                      }}>
                        {group.studentIds.length} students • {group.groupType}
                      </div>
                      <div style={{ 
                        fontSize: '12px', 
                        color: '#495057',
                        lineHeight: '1.4'
                      }}>
                        {group.studentIds.map(studentId => {
                          const student = students.find(s => s.id === studentId);
                          return student?.name;
                        }).filter(Boolean).join(', ')}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* Enhanced Assignment Summary */}
        {(selectedGroups.length > 0 || isWholeClass) && (
          <div style={{
            marginTop: '1.5rem',
            padding: '1.25rem',
            background: 'linear-gradient(135deg, rgba(40, 167, 69, 0.1) 0%, rgba(32, 201, 151, 0.1) 100%)',
            borderRadius: '12px',
            border: '2px solid rgba(40, 167, 69, 0.3)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Animated success indicator */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '4px',
              height: '100%',
              background: 'linear-gradient(to bottom, #28a745, #20c997)',
              animation: 'slideDown 0.3s ease'
            }} />
            
            <div style={{ 
              fontSize: '16px', 
              fontWeight: '700', 
              color: '#155724', 
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span style={{
                background: '#28a745',
                color: 'white',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px'
              }}>✓</span>
              Assignment Summary
            </div>
            <div style={{ fontSize: '14px', color: '#155724', fontWeight: '600' }}>
              {isWholeClass ? (
                <span>🎯 All {students.length} students assigned to this activity</span>
              ) : (
                <span>👥 {assignedStudentCount} students in {selectedGroups.length} selected group{selectedGroups.length !== 1 ? 's' : ''}</span>
              )}
              {selectedStaff.length > 0 && (
                <span style={{ display: 'block', marginTop: '4px' }}>
                  👨‍🏫 {selectedStaff.length} staff member{selectedStaff.length !== 1 ? 's' : ''} assigned
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Notes */}
      <div style={{ marginBottom: '2rem' }}>
        <h5 style={{ marginBottom: '0.75rem', color: '#2c3e50' }}>📝 Additional Notes</h5>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any special instructions, accommodations, or notes for this activity..."
          style={{
            width: '100%',
            minHeight: '80px',
            padding: '0.75rem',
            border: '1px solid #dee2e6',
            borderRadius: '6px',
            fontSize: '14px',
            fontFamily: 'inherit',
            resize: 'vertical'
          }}
        />
      </div>

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
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600'
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
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600'
          }}
        >
          💾 Save Assignment
        </button>
      </div>
    </div>
  );
};

export default ScheduleBuilder;