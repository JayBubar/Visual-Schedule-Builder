import React, { useState, useEffect } from 'react';
import GroupBreakoutDisplay from './GroupBreakoutDisplay';
import { useCelebrationManager } from '../../utils/celebrationManager';
import CelebrationAnimations from '../common/CelebrationAnimations';
import { Activity, StaffMember, Student } from '../../types';

interface SmartboardDisplayProps {
  isActive: boolean;
  currentSchedule?: {
    activities: Activity[];
    startTime: string;
    name: string;
  };
  staff: StaffMember[];
  students: Student[];
}

const SmartboardDisplay: React.FC<SmartboardDisplayProps> = ({
  isActive,
  currentSchedule,
  staff = [],
  students = []
}) => {
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Celebration management
  const { triggerCelebration, getCelebrationStyle, activeCelebrations } = useCelebrationManager();
  
  // Timer state is working correctly now

  // Mock data if no schedule provided
  const mockSchedule = {
    activities: [
      {
        id: '1',
        name: 'Holiday Greeting',
        icon: '🎄',
        duration: 15,
        category: 'holiday' as const,
        groupingType: 'small-groups' as const,
        groupAssignments: [
          {
            id: 'g1',
            groupName: 'Skill-Level Groups 1',
            color: 'red' as const,
            staffMember: { id: 's1', name: 'Ms. Johnson', role: 'Lead Teacher', avatar: '👩‍🏫' },
            studentIds: ['st1', 'st2', 'st3'],
            location: 'Reading Corner'
          },
          {
            id: 'g2',
            groupName: 'Skill-Level Groups 2',
            color: 'yellow' as const,
            staffMember: { id: 's2', name: 'Mr. Smith', role: 'Assistant', avatar: '👨‍🏫' },
            studentIds: ['st4', 'st5', 'st6'],
            location: 'Math Station'
          },
          {
            id: 'g3',
            groupName: 'Independent Work',
            color: 'blue' as const,
            staffMember: { id: 's3', name: 'Mrs. Davis', role: 'Aide', avatar: '👩‍💼' },
            studentIds: ['st7', 'st8'],
            location: 'Quiet Area'
          }
        ]
      }
    ],
    startTime: '11:24',
    name: 'Temporary Schedule'
  };

  const schedule = currentSchedule || mockSchedule;
  const currentActivity = schedule.activities[currentActivityIndex];

  // Initialize timer when activity changes (only when activity ID changes, not on every render)
  useEffect(() => {
    if (currentActivity) {
      setTimeRemaining(currentActivity.duration * 60); // Convert minutes to seconds
      setIsRunning(false); // Reset timer state when activity changes
    }
  }, [currentActivity.id, currentActivity.duration]); // Only depend on ID and duration, not the whole object

  // Timer countdown with celebration integration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            
            // 🎉 TRIGGER CELEBRATION!
            const celebrationStyle = getCelebrationStyle(currentActivity.name);
            triggerCelebration(currentActivity.name, celebrationStyle);
            
            // Auto-advance to next activity after celebration starts
            if (currentActivityIndex < schedule.activities.length - 1) {
              setTimeout(() => {
                setCurrentActivityIndex(prev => prev + 1);
              }, 2000); // Wait 2 seconds for celebration to be visible
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning]); // Only depend on isRunning to prevent interval recreation

  // Format time display
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Get timer color based on remaining time
  const getTimerColor = (): string => {
    if (timeRemaining <= 60) return '#F44336'; // Red for last minute
    if (timeRemaining <= 300) return '#FF9800'; // Orange for last 5 minutes
    return '#4CAF50'; // Green for normal time
  };

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  // Handle timer controls
  const handleStart = () => setIsRunning(!isRunning);
  const handleAddTime = () => setTimeRemaining(prev => prev + 300); // Add 5 minutes
  const handleSkip = () => {
    // 🎉 TRIGGER CELEBRATION ON MANUAL SKIP TOO!
    const celebrationStyle = getCelebrationStyle(currentActivity.name);
    triggerCelebration(currentActivity.name, celebrationStyle);
    
    // Stop the timer
    setIsRunning(false);
    
    if (currentActivityIndex < schedule.activities.length - 1) {
      setTimeout(() => {
        setCurrentActivityIndex(prev => prev + 1);
      }, 1000); // Brief delay for celebration
    }
  };
  const handleReset = () => {
    setTimeRemaining(currentActivity.duration * 60);
    setIsRunning(false);
  };

  if (!isActive) return null;

  return (
    <>
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '20px',
        boxSizing: 'border-box',
        overflow: 'auto', // IMPORTANT: Keep original overflow behavior
        position: 'relative'
      }}>
        {/* Exit Fullscreen Button */}
        <button
          onClick={toggleFullscreen}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
            zIndex: 1000
          }}
        >
          📺 {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        </button>

        {/* Main Container - ORIGINAL LAYOUT PRESERVED */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh' // Changed from maxHeight to minHeight to allow scrolling
        }}>
          {/* Compact Activity & Timer Banner */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '15px 25px',
            marginBottom: '20px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            flexWrap: 'wrap',
            gap: '15px'
          }}>
            {/* Current Activity Info */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              flex: '1',
              minWidth: '300px'
            }}>
              <div style={{
                fontSize: '2.5rem',
                background: 'rgba(255, 255, 255, 0.2)',
                padding: '10px',
                borderRadius: '15px',
                minWidth: '60px',
                textAlign: 'center'
              }}>
                {currentActivity.icon}
              </div>
              <div>
                <h2 style={{
                  margin: '0',
                  fontSize: '1.8rem',
                  fontWeight: '700'
                }}>
                  {currentActivity.name}
                </h2>
                <p style={{
                  margin: '5px 0 0 0',
                  fontSize: '1rem',
                  opacity: 0.9
                }}>
                  {schedule.name} ({schedule.startTime}) • {currentActivity.duration} minutes
                  {currentActivity.groupAssignments?.length > 0 && (
                    <span style={{
                      marginLeft: '10px',
                      background: 'rgba(255, 255, 255, 0.2)',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '0.8rem'
                    }}>
                      🎯 {currentActivity.groupAssignments.length} Groups
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Timer Section */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              flexWrap: 'wrap'
            }}>
              {/* Countdown Display */}
              <div style={{
                textAlign: 'center',
                background: 'rgba(255, 255, 255, 0.2)',
                padding: '15px 20px',
                borderRadius: '15px',
                minWidth: '120px'
              }}>
                <p style={{
                  fontSize: '2.2rem',
                  fontWeight: '700',
                  margin: '0',
                  color: getTimerColor()
                }}>
                  {(() => {
                    console.log('Timer display rendering with timeRemaining:', timeRemaining);
                    return formatTime(timeRemaining);
                  })()}
                </p>
                <p style={{
                  fontSize: '0.9rem',
                  margin: '0',
                  opacity: 0.9
                }}>
                  Remaining
                </p>
              </div>

              {/* Timer Controls */}
              <div style={{
                display: 'flex',
                gap: '10px',
                flexWrap: 'wrap'
              }}>
                <button
                  onClick={handleStart}
                  style={{
                    padding: '12px 16px',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontSize: '0.9rem',
                    background: isRunning ? '#FF9800' : '#4CAF50',
                    color: 'white'
                  }}
                >
                  {isRunning ? '⏸ Pause' : '▶ Start'}
                </button>
                <button
                  onClick={handleAddTime}
                  style={{
                    padding: '12px 16px',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontSize: '0.9rem',
                    background: '#FF9800',
                    color: 'white'
                  }}
                >
                  🕐 +5 Min
                </button>
                <button
                  onClick={handleSkip}
                  style={{
                    padding: '12px 16px',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontSize: '0.9rem',
                    background: '#9C27B0', // Purple for Complete button
                    color: 'white'
                  }}
                  disabled={false}
                >
                  🎉 Complete
                </button>
                <button
                  onClick={handleReset}
                  style={{
                    padding: '12px 16px',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontSize: '0.9rem',
                    background: '#9E9E9E',
                    color: 'white'
                  }}
                >
                  🔄 Reset
                </button>
              </div>
              
              {/* Celebration Style Indicator */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.8rem',
                color: 'rgba(255,255,255,0.8)',
                background: 'rgba(255,255,255,0.1)',
                padding: '6px 12px',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)'
              }}>
                <span>Celebration:</span>
                <span style={{ fontWeight: '600' }}>
                  {getCelebrationStyle(currentActivity.name) === 'gentle' ? '🌸 Gentle' : '🎆 Excited'}
                </span>
              </div>
            </div>
          </div>

          {/* Group Breakout Display - ORIGINAL SCROLLING PRESERVED */}
          <GroupBreakoutDisplay
            currentActivity={currentActivity}
            staff={staff}
            students={students}
          />

          {/* Up Next Preview */}
          {currentActivityIndex < schedule.activities.length - 1 && (
            <div style={{
              textAlign: 'center',
              marginTop: '20px',
              padding: '15px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '15px',
              backdropFilter: 'blur(10px)'
            }}>
              <h4 style={{
                margin: '0 0 5px 0',
                fontSize: '1.1rem',
                fontWeight: '600'
              }}>
                ⏭ Up Next
              </h4>
              <p style={{
                margin: '0',
                fontSize: '1rem',
                opacity: 0.9
              }}>
                {schedule.activities[currentActivityIndex + 1].icon} {schedule.activities[currentActivityIndex + 1].name}
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Celebration Overlay - POSITIONED OUTSIDE MAIN CONTAINER */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 1000
      }}>
        {activeCelebrations.map(celebration => (
          <CelebrationAnimations
            key={celebration.id}
            isActive={true}
            style={celebration.style}
            message={`🎉 ${celebration.activityName} Complete!`}
            onComplete={() => {
              // Celebration will auto-remove via celebration manager
            }}
          />
        ))}
      </div>
    </>
  );
};

export default SmartboardDisplay;