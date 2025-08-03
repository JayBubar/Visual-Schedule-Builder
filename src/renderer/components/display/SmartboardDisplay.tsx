import React, { useState, useEffect } from 'react';
import { Student, StaffMember, GroupAssignment, SavedActivity } from '../../types';
import TransitionDisplay from './TransitionDisplay';

interface SmartboardDisplayProps {
  isActive: boolean;
  currentSchedule?: {
    activities: SavedActivity[];
    startTime: string;
    name: string;
  };
  staff?: StaffMember[];
  students?: Student[];
}

const SmartboardDisplay: React.FC<SmartboardDisplayProps> = ({
  isActive,
  currentSchedule,
  staff = [],
  students = []
}) => {
  // 🎯 CRITICAL: ALL HOOKS MUST BE CALLED BEFORE ANY EARLY RETURNS
  // State management - MUST be at the top, always called
  const [realStudents, setRealStudents] = useState<Student[]>([]);
  const [realStaff, setRealStaff] = useState<StaffMember[]>([]);
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(1800);
  const [isRunning, setIsRunning] = useState(false);
  const [fallbackSchedule, setFallbackSchedule] = useState<any>(null);

  // 🔧 CRITICAL FIX: Load schedule from localStorage with group preservation
  useEffect(() => {
    console.log('🖥️ SmartboardDisplay - Loading schedule data...');
    
    if (!currentSchedule) {
      console.log('🔍 No currentSchedule provided, loading from localStorage...');
      
      // Try multiple possible localStorage keys
      const possibleKeys = ['scheduleVariations', 'saved_schedules', 'schedules'];
      
      for (const key of possibleKeys) {
        try {
          const saved = localStorage.getItem(key);
          if (saved) {
            const schedules = JSON.parse(saved);
            console.log(`📋 Found ${schedules.length} schedules in '${key}'`);
            
            if (schedules.length > 0) {
              // Use the most recent schedule
              const mostRecent = schedules
                .filter((s: any) => s.lastUsed)
                .sort((a: any, b: any) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime())[0];
              
              const scheduleToUse = mostRecent || schedules[0];
              console.log('🎯 Using schedule:', scheduleToUse.name);
              
              // 🎯 CRITICAL: Preserve groupAssignments when loading
              const loadedActivities = (scheduleToUse.activities || []).map((activity: any) => ({
                ...activity,
                // Ensure groupAssignments are preserved
                groupAssignments: activity.groupAssignments || activity.assignment?.groupAssignments || []
              }));
              
              console.log('🔄 Loaded activities with groups:', loadedActivities.map((a: any) => ({
                name: a.name,
                groupCount: a.groupAssignments?.length || 0,
                groups: a.groupAssignments
              })));
              
              setFallbackSchedule({
                activities: loadedActivities,
                startTime: scheduleToUse.startTime || '09:00',
                name: scheduleToUse.name || 'Untitled Schedule'
              });
              break;
            }
          }
        } catch (error) {
          console.error(`Error loading from ${key}:`, error);
        }
      }
    } else {
      // 🎯 CRITICAL: Also preserve groupAssignments from currentSchedule prop
      console.log('📥 Using provided currentSchedule, preserving groups...');
      const preservedActivities = (currentSchedule.activities || []).map((activity: any) => ({
        ...activity,
        groupAssignments: activity.groupAssignments || activity.assignment?.groupAssignments || []
      }));
      
      console.log('🔄 Preserved activities from props:', preservedActivities.map((a: any) => ({
        name: a.name,
        groupCount: a.groupAssignments?.length || 0
      })));
    }
  }, [currentSchedule]);

  // Load real data from localStorage
  useEffect(() => {
    try {
      const savedStudents = localStorage.getItem('students');
      if (savedStudents) {
        const studentData = JSON.parse(savedStudents);
        setRealStudents(studentData);
        console.log('📚 Loaded students from localStorage:', studentData.length);
      }

      const savedStaff = localStorage.getItem('staff_members');
      if (savedStaff) {
        const staffData = JSON.parse(savedStaff);
        setRealStaff(staffData);
        console.log('👨‍🏫 Loaded staff from localStorage:', staffData.length);
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
    }
  }, []);

  // Timer countdown effect (moved after hooks)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeRemaining]);

  // 🎯 AFTER ALL HOOKS: Now calculate derived values
  const activeSchedule = currentSchedule || fallbackSchedule;
  const currentActivity = activeSchedule?.activities[currentActivityIndex];

  // Set initial timer when activity changes
  useEffect(() => {
    if (currentActivity && currentActivity.duration) {
      setTimeRemaining(currentActivity.duration * 60);
    }
  }, [currentActivityIndex, currentActivity]);

  // Timer control functions (moved after hooks)
  const onTimerControl = (action: string) => {
    switch (action) {
      case 'play':
        setIsRunning(true);
        break;
      case 'pause':
        setIsRunning(false);
        break;
      case 'reset':
        setTimeRemaining(currentActivity?.duration ? currentActivity.duration * 60 : 1800);
        setIsRunning(false);
        break;
      case 'next':
        if (currentActivityIndex < (activeSchedule?.activities.length || 0) - 1) {
          setCurrentActivityIndex(prev => prev + 1);
          const nextActivity = activeSchedule?.activities[currentActivityIndex + 1];
          setTimeRemaining(nextActivity?.duration * 60 || 1800);
          setIsRunning(false);
        }
        break;
      case 'previous':
        if (currentActivityIndex > 0) {
          setCurrentActivityIndex(prev => prev - 1);
          const prevActivity = activeSchedule?.activities[currentActivityIndex - 1];
          setTimeRemaining(prevActivity?.duration * 60 || 1800);
          setIsRunning(false);
        }
        break;
    }
  };

  // Helper functions for group display
  const getStudentById = (studentId: string): Student | undefined => {
    return [...realStudents, ...students].find(s => s.id === studentId);
  };

  const getStaffById = (staffId: string): StaffMember | undefined => {
    return [...realStaff, ...staff].find(s => s.id === staffId);
  };

  // Helper functions
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = (): string => {
    const percentage = currentActivity ? (timeRemaining / (currentActivity.duration * 60)) * 100 : 100;
    if (percentage > 50) return '#4CAF50';
    if (percentage > 25) return '#FF9800';
    return '#f44336';
  };

  // 🔍 DEBUG LOGGING (moved after hooks)
  console.log('🔍 DIRECT Activity Property Check:', {
    activityName: currentActivity?.name,
    hasIsTransition: currentActivity?.hasOwnProperty('isTransition'),
    isTransitionValue: currentActivity?.isTransition,
    allProperties: Object.keys(currentActivity || {}),
    category: currentActivity?.category,
    fullActivity: currentActivity
  });

  // 🎯 ENHANCED TRANSITION DETECTION (moved after hooks)
  const isTransitionActivity = 
    currentActivity?.isTransition === true ||  // Primary check
    (currentActivity?.category === 'transition' && 
     currentActivity?.transitionType) ||       // Fallback: category + transitionType
    (currentActivity?.category === 'transition' && 
     currentActivity?.animationStyle) ||       // Fallback: category + animationStyle
    (currentActivity?.name && 
     ['Movement Break', 'Brain Break', 'Transition Time', 'Get Ready', 'Clean Up Time']
     .includes(currentActivity.name));         // Fallback: known transition activity names

  // 🎯 NOW SAFE TO HAVE EARLY RETURNS - All hooks have been called
  if (!isActive) {
    return null;
  }

  // 🔧 ISOLATION FIX: Render transition in isolated container
  if (isTransitionActivity && currentActivity) {
    console.log('🎯 SmartboardDisplay - Rendering transition activity:', currentActivity.name);
    
    // Get next activity for preview
    const nextActivity = activeSchedule?.activities[currentActivityIndex + 1];
    
    return (
      <div className="smartboard-display-container" style={{ 
        height: '100vh',
        overflow: 'auto',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '1rem',
        position: 'relative',
        zIndex: 1
      }}>
        <TransitionDisplay
          activity={{
            ...currentActivity,
            // Ensure transition properties exist even if missing
            isTransition: true,
            transitionType: currentActivity.transitionType || 'movement-break',
            animationStyle: currentActivity.animationStyle || 'running-kids',
            showNextActivity: currentActivity.showNextActivity !== false, // Default to true
            movementPrompts: currentActivity.movementPrompts || [
              'Get ready to move! 🏃‍♀️',
              'Stand up and stretch! 🙌',
              'Take a deep breath! 😮‍💨',
              'Prepare for next activity! 🎯'
            ]
          }}
          nextActivity={nextActivity}
          timeRemaining={timeRemaining}
          onTimerControl={onTimerControl}
          isRunning={isRunning}
          previousActivity={activeSchedule?.activities[currentActivityIndex - 1]}
          activityIndex={currentActivityIndex}
          totalActivities={activeSchedule?.activities.length || 1}
        />
      </div>
    );
  }

  if (!activeSchedule || !currentActivity) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        overflow: 'auto',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        textAlign: 'center',
        padding: '1rem'
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '2rem' }}>📅</div>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>No Schedule Available</h2>
        <p style={{ fontSize: '1.2rem', opacity: 0.8 }}>
          Please create a schedule in the Schedule Builder first.
        </p>
      </div>
    );
  }

  // Student card component
  const StudentCard: React.FC<{ student: Student; groupColor: string }> = ({ student, groupColor }) => (
    <div style={{
      background: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      padding: '1rem',
      textAlign: 'center',
      border: `2px solid ${groupColor}40`,
      transition: 'transform 0.2s ease',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        background: student.photo ? 'transparent' : `linear-gradient(135deg, ${groupColor}80, ${groupColor})`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.2rem',
        margin: '0 auto 0.5rem auto',
        border: `2px solid ${groupColor}`,
        overflow: 'hidden',
        boxShadow: '0 3px 10px rgba(0, 0, 0, 0.2)'
      }}>
        {student.photo ? (
          <img src={student.photo} alt={student.name} style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }} />
        ) : (
          <span style={{ color: 'white', fontWeight: '700' }}>👤</span>
        )}
      </div>
      <h6 style={{
        margin: '0',
        fontSize: '0.9rem',
        fontWeight: '600',
        color: 'white',
        textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
      }}>
        {student.name}
      </h6>
    </div>
  );

  // Staff card component
  const StaffCard: React.FC<{ staffMember: StaffMember; groupColor: string }> = ({ staffMember, groupColor }) => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      background: `linear-gradient(135deg, ${groupColor}15, ${groupColor}25)`,
      borderRadius: '16px',
      padding: '1.25rem',
      border: `2px solid ${groupColor}40`,
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        background: staffMember.photo ? 'transparent' : `linear-gradient(135deg, ${groupColor}, ${groupColor}CC)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.5rem',
        border: `3px solid ${groupColor}`,
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
      }}>
        {staffMember.photo ? (
          <img src={staffMember.photo} alt={staffMember.name} style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }} />
        ) : (
          <span style={{ color: 'white', fontWeight: '700' }}>👨‍🏫</span>
        )}
      </div>
      <div>
        <h5 style={{
          margin: '0 0 0.25rem 0',
          fontSize: '1.2rem',
          fontWeight: '700',
          color: 'white',
          textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'
        }}>
          {staffMember.name}
        </h5>
        <p style={{
          margin: '0',
          fontSize: '1rem',
          color: 'rgba(255, 255, 255, 0.9)',
          fontWeight: '600'
        }}>
          {staffMember.role}
        </p>
      </div>
    </div>
  );

  // 🎯 Enhanced Group display component with better error handling
  const GroupDisplay: React.FC<{ group: GroupAssignment; groupIndex: number }> = ({ group, groupIndex }) => {
    console.log(`🎨 Rendering group ${groupIndex + 1}:`, group);
    
    const groupStudents = (group.studentIds || []).map(id => getStudentById(id)).filter(Boolean) as Student[];
    
    // Try multiple ways to get staff
    let staffMember = null;
    if (group.staffId) {
      staffMember = getStaffById(group.staffId);
    } else if (group.staffMember?.id) {
      staffMember = getStaffById(group.staffMember.id) || group.staffMember;
    }
    
    console.log(`👥 Group ${groupIndex + 1} data:`, {
      name: group.groupName,
      color: group.color,
      students: groupStudents.length,
      staff: staffMember?.name || 'None'
    });

    const groupColor = group.color || '#9C27B0';

    return (
      <div style={{
        background: `linear-gradient(135deg, ${groupColor}20, ${groupColor}10)`,
        borderRadius: '20px',
        padding: '2rem',
        border: `4px solid ${groupColor}`,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        marginBottom: '2rem'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem'
        }}>
          <h3 style={{
            margin: '0',
            fontSize: '2.5rem',
            fontWeight: '700',
            color: 'white',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
          }}>
            {group.groupName || `Group ${groupIndex + 1}`}
          </h3>
          <div style={{
            background: groupColor,
            borderRadius: '12px',
            padding: '0.5rem 1rem',
            color: 'white',
            fontWeight: '600',
            fontSize: '1.1rem',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
          }}>
            {groupStudents.length} Student{groupStudents.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Staff Member */}
        {staffMember && (
          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{
              margin: '0 0 1rem 0',
              fontSize: '1.5rem',
              fontWeight: '600',
              color: 'white',
              textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'
            }}>
              Staff Member
            </h4>
            <StaffCard staffMember={staffMember} groupColor={groupColor} />
          </div>
        )}

        {/* Students */}
        <div>
          <h4 style={{
            margin: '0 0 1.5rem 0',
            fontSize: '1.5rem',
            fontWeight: '600',
            color: 'white',
            textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'
          }}>
            Students
          </h4>
          {groupStudents.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '2rem',
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '1.1rem',
              fontStyle: 'italic'
            }}>
              No students assigned to this group
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: '1rem'
            }}>
              {groupStudents.map(student => (
                <StudentCard key={student.id} student={student} groupColor={groupColor} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Debug info for troubleshooting
  const debugInfo = {
    hasAssignment: !!currentActivity?.assignment,
    assignmentType: typeof currentActivity?.assignment,
    assignmentData: currentActivity?.assignment,
    hasDirectGroups: !!(currentActivity?.groupAssignments?.length),
    hasAssignmentGroups: !!(currentActivity?.assignment?.groupAssignments?.length)
  };

  // Get group assignments
  const groupAssignments = currentActivity.groupAssignments || currentActivity.assignment?.groupAssignments || [];

  return (
    <div style={{
      height: '100vh',
      overflow: 'auto',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      position: 'relative'
    }}>
      {/* Header */}
      <div style={{
        padding: '1rem',
        textAlign: 'center',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <h1 style={{
          margin: '0 0 1rem 0',
          fontSize: '3rem',
          fontWeight: '700',
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
        }}>
          {currentActivity.icon} {currentActivity.name}
        </h1>
        
        {/* Timer */}
        <div style={{
          fontSize: '4rem',
          fontWeight: '700',
          color: getTimerColor(),
          textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
          marginBottom: '1rem'
        }}>
          {formatTime(timeRemaining)}
        </div>

        {/* Timer Controls */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <button
            onClick={() => onTimerControl('previous')}
            disabled={currentActivityIndex === 0}
            style={{
              padding: '1rem 1.5rem',
              fontSize: '1.2rem',
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            ⏮️ Previous
          </button>
          
          <button
            onClick={() => onTimerControl(isRunning ? 'pause' : 'play')}
            style={{
              padding: '1rem 2rem',
              fontSize: '1.2rem',
              background: isRunning ? '#ff6b6b' : '#51cf66',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            {isRunning ? '⏸️ Pause' : '▶️ Play'}
          </button>
          
          <button
            onClick={() => onTimerControl('reset')}
            style={{
              padding: '1rem 1.5rem',
              fontSize: '1.2rem',
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            🔄 Reset
          </button>
          
          <button
            onClick={() => onTimerControl('next')}
            disabled={currentActivityIndex === (activeSchedule?.activities.length || 0) - 1}
            style={{
              padding: '1rem 1.5rem',
              fontSize: '1.2rem',
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Next ⏭️
          </button>
        </div>

        <div style={{ fontSize: '1.2rem', opacity: 0.8 }}>
          Activity {currentActivityIndex + 1} of {activeSchedule?.activities.length}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '1rem' }}>
        {groupAssignments.length > 0 ? (
          <>
            <h2 style={{
              textAlign: 'center',
              fontSize: '2.5rem',
              marginBottom: '3rem',
              fontWeight: '600',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
            }}>
              Group Assignments
            </h2>
            {groupAssignments.map((group, index) => (
              <GroupDisplay key={group.id || index} group={group} groupIndex={index} />
            ))}
          </>
        ) : (
          <div style={{
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '2rem',
            border: '4px solid #28a745',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            textAlign: 'center',
            marginBottom: '2rem'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>👥</div>
            <h3 style={{
              margin: '0 0 1rem 0',
              fontSize: '2.5rem',
              fontWeight: '700',
              color: 'white',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
            }}>
              Whole Class Activity
            </h3>
            <p style={{
              margin: '0',
              fontSize: '1.3rem',
              color: 'rgba(255, 255, 255, 0.9)',
              fontWeight: '500'
            }}>
              All {realStudents.length} students participate together
            </p>
            
            {/* Enhanced Debug Information */}
            <div style={{
              marginTop: '1.5rem',
              padding: '1rem',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '10px',
              fontSize: '0.8rem',
              opacity: 0.7,
              textAlign: 'left'
            }}>
              <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>🔍 Debug Info:</div>
              <div>Activity: "{currentActivity.name}"</div>
              <div>Has Assignment: {debugInfo.hasAssignment ? '✅' : '❌'}</div>
              <div>Assignment Type: {debugInfo.assignmentType}</div>
              <div>Direct Groups: {currentActivity.groupAssignments?.length || 0}</div>
              <div>Assignment Groups: {currentActivity.assignment?.groupAssignments?.length || 0}</div>
              {debugInfo.assignmentData && (
                <div style={{ marginTop: '0.5rem' }}>
                  Assignment Keys: {Object.keys(debugInfo.assignmentData).join(', ')}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartboardDisplay;