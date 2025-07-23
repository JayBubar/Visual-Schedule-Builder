import React, { useState, useEffect } from 'react';
import { Activity, ScheduleVariation } from '../../types';

interface MultipleScheduleManagerProps {
  isActive: boolean;
}

const MultipleScheduleManager: React.FC<MultipleScheduleManagerProps> = ({ isActive }) => {
  const [scheduleVariations, setScheduleVariations] = useState<ScheduleVariation[]>([]);
  const [currentSchedule, setCurrentSchedule] = useState<ScheduleVariation | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showQuickSwitch, setShowQuickSwitch] = useState(false);

  // Initialize with sample schedule variations
  useEffect(() => {
    const sampleSchedules: ScheduleVariation[] = [
      {
        id: 'regular-monday',
        name: 'Regular Monday',
        type: 'daily',
        category: 'academic',
        description: 'Standard Monday schedule with full academics',
        activities: [
          { id: '1', name: 'Morning Meeting', icon: '🌅', duration: 15, category: 'social', isCustom: false },
          { id: '2', name: 'Literacy Block', icon: '📚', duration: 60, category: 'academic', isCustom: false },
          { id: '3', name: 'Math Block', icon: '🔢', duration: 45, category: 'academic', isCustom: false },
          { id: '4', name: 'Snack Break', icon: '🍎', duration: 15, category: 'break', isCustom: false },
          { id: '5', name: 'Science', icon: '🔬', duration: 30, category: 'academic', isCustom: false },
          { id: '6', name: 'Lunch', icon: '🍽️', duration: 30, category: 'break', isCustom: false },
          { id: '7', name: 'Closing Circle', icon: '🔄', duration: 15, category: 'social', isCustom: false }
        ],
        startTime: '8:00',
        endTime: '2:30',
        totalDuration: 390,
        isDefault: true,
        applicableDays: ['Monday'],
        icon: '📚',
        color: '#4CAF50',
        createdAt: '2025-01-01',
        usageCount: 45
      },
      {
        id: 'assembly-day',
        name: 'Assembly Day',
        type: 'special-event',
        category: 'special',
        description: 'Modified schedule for school assembly',
        activities: [
          { id: '1', name: 'Morning Meeting', icon: '🌅', duration: 10, category: 'social', isCustom: false },
          { id: '2', name: 'Quick Literacy', icon: '📖', duration: 30, category: 'academic', isCustom: false },
          { id: '3', name: 'Assembly Prep', icon: '🎭', duration: 15, category: 'special', isCustom: true },
          { id: '4', name: 'School Assembly', icon: '🎪', duration: 45, category: 'special', isCustom: true },
          { id: '5', name: 'Assembly Debrief', icon: '💭', duration: 15, category: 'social', isCustom: true },
          { id: '6', name: 'Math Block', icon: '🔢', duration: 30, category: 'academic', isCustom: false },
          { id: '7', name: 'Lunch', icon: '🍽️', duration: 30, category: 'break', isCustom: false }
        ],
        startTime: '8:00',
        endTime: '2:30',
        totalDuration: 390,
        isDefault: false,
        applicableDays: ['Any'],
        icon: '🎪',
        color: '#FF9800',
        createdAt: '2025-01-15',
        lastUsed: '2025-01-18',
        usageCount: 8
      },
      {
        id: 'half-day',
        name: 'Half Day Schedule',
        type: 'time-variation',
        category: 'academic',
        description: 'Early dismissal at 12:00 PM',
        activities: [
          { id: '1', name: 'Morning Meeting', icon: '🌅', duration: 10, category: 'social', isCustom: false },
          { id: '2', name: 'Literacy Block', icon: '📚', duration: 45, category: 'academic', isCustom: false },
          { id: '3', name: 'Math Block', icon: '🔢', duration: 35, category: 'academic', isCustom: false },
          { id: '4', name: 'Snack Break', icon: '🍎', duration: 10, category: 'break', isCustom: false },
          { id: '5', name: 'Choice Time', icon: '🎮', duration: 30, category: 'social', isCustom: false },
          { id: '6', name: 'Closing Circle', icon: '🔄', duration: 15, category: 'social', isCustom: false }
        ],
        startTime: '8:00',
        endTime: '12:00',
        totalDuration: 240,
        isDefault: false,
        applicableDays: ['Friday'],
        icon: '🌅',
        color: '#2196F3',
        createdAt: '2025-01-10',
        lastUsed: '2025-01-19',
        usageCount: 12
      },
      {
        id: 'emergency-drill',
        name: 'Emergency Drill',
        type: 'emergency',
        category: 'special',
        description: 'Fire drill or lockdown practice schedule',
        activities: [
          { id: '1', name: 'Morning Meeting', icon: '🌅', duration: 15, category: 'social', isCustom: false },
          { id: '2', name: 'Drill Preparation', icon: '🚨', duration: 10, category: 'special', isCustom: true },
          { id: '3', name: 'Emergency Drill', icon: '🔥', duration: 20, category: 'special', isCustom: true },
          { id: '4', name: 'Calm Down Time', icon: '😌', duration: 15, category: 'social', isCustom: true },
          { id: '5', name: 'Modified Academics', icon: '📝', duration: 60, category: 'academic', isCustom: true },
          { id: '6', name: 'Extended Lunch', icon: '🍽️', duration: 45, category: 'break', isCustom: true }
        ],
        startTime: '8:00',
        endTime: '2:30',
        totalDuration: 390,
        isDefault: false,
        applicableDays: ['Any'],
        icon: '🚨',
        color: '#F44336',
        createdAt: '2025-01-05',
        usageCount: 3
      },
      {
        id: 'holiday-party',
        name: 'Holiday Celebration',
        type: 'special-event',
        category: 'special',
        description: 'Special schedule for holiday parties',
        activities: [
          { id: '1', name: 'Holiday Greeting', icon: '🎄', duration: 15, category: 'social', isCustom: true },
          { id: '2', name: 'Holiday Craft', icon: '🎨', duration: 45, category: 'special', isCustom: true },
          { id: '3', name: 'Holiday Stories', icon: '📖', duration: 30, category: 'academic', isCustom: true },
          { id: '4', name: 'Holiday Games', icon: '🎮', duration: 45, category: 'special', isCustom: true },
          { id: '5', name: 'Special Lunch', icon: '🎂', duration: 45, category: 'break', isCustom: true },
          { id: '6', name: 'Holiday Celebration', icon: '🎉', duration: 30, category: 'special', isCustom: true }
        ],
        startTime: '8:00',
        endTime: '2:30',
        totalDuration: 390,
        isDefault: false,
        applicableDays: ['Any'],
        icon: '🎄',
        color: '#4CAF50',
        createdAt: '2024-12-20',
        lastUsed: '2024-12-22',
        usageCount: 6
      }
    ];

    setScheduleVariations(sampleSchedules);
    setCurrentSchedule(sampleSchedules[0]);
  }, []);

  const filteredSchedules = scheduleVariations.filter(schedule => {
    const matchesCategory = selectedCategory === 'all' || schedule.type === selectedCategory;
    const matchesSearch = schedule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         schedule.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (type: string): string => {
    switch (type) {
      case 'daily': return '📅';
      case 'special-event': return '🎭';
      case 'emergency': return '🚨';
      case 'time-variation': return '⏰';
      default: return '📋';
    }
  };

  const getCategoryName = (type: string): string => {
    switch (type) {
      case 'daily': return 'Daily Schedules';
      case 'special-event': return 'Special Events';
      case 'emergency': return 'Emergency Procedures';
      case 'time-variation': return 'Time Variations';
      default: return 'Other';
    }
  };

  const handleScheduleSwitch = (schedule: ScheduleVariation) => {
    setCurrentSchedule(schedule);
    const updatedSchedules = scheduleVariations.map(s => 
      s.id === schedule.id 
        ? { ...s, usageCount: s.usageCount + 1, lastUsed: new Date().toISOString().split('T')[0] }
        : s
    );
    setScheduleVariations(updatedSchedules);
    setShowQuickSwitch(false);
  };

  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (!isActive) return null;

  return (
    <div style={{
      padding: '40px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      position: 'relative'
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '40px'
      }}>
        <h2 style={{
          color: 'white',
          fontSize: '2.5rem',
          fontWeight: '700',
          margin: '0 0 20px 0',
          textShadow: '0 4px 8px rgba(0,0,0,0.3)'
        }}>
          📅 Multiple Schedule Management
        </h2>
        <p style={{
          color: 'rgba(255,255,255,0.9)',
          fontSize: '1.1rem',
          margin: '0'
        }}>
          Handle all the schedule variations teachers face - assemblies, holidays, emergencies, and more
        </p>
      </div>

      {/* Current Schedule Display */}
      {currentSchedule && (
        <div style={{
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          padding: '30px',
          marginBottom: '30px',
          border: `3px solid ${currentSchedule.color}40`
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '15px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{
                fontSize: '3rem',
                background: currentSchedule.color,
                borderRadius: '12px',
                padding: '10px',
                minWidth: '70px',
                textAlign: 'center'
              }}>
                {currentSchedule.icon}
              </div>
              <div>
                <h3 style={{
                  color: 'white',
                  fontSize: '1.8rem',
                  margin: '0 0 5px 0',
                  fontWeight: '700'
                }}>
                  {currentSchedule.name}
                </h3>
                <p style={{
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: '1rem',
                  margin: '0 0 5px 0'
                }}>
                  {currentSchedule.description}
                </p>
                <div style={{
                  display: 'flex',
                  gap: '15px',
                  fontSize: '0.9rem',
                  color: 'rgba(255,255,255,0.7)'
                }}>
                  <span>⏰ {formatTime(currentSchedule.startTime)} - {formatTime(currentSchedule.endTime)}</span>
                  <span>📊 {currentSchedule.activities.length} activities</span>
                  <span>📈 Used {currentSchedule.usageCount} times</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowQuickSwitch(true)}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #FFD93D 0%, #FF9FF3 100%)',
                color: '#2c3e50',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 6px 20px rgba(0,0,0,0.2)'
              }}
            >
              🔄 Quick Switch
            </button>
          </div>

          {/* Current Schedule Activities Preview */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '10px',
            marginTop: '20px'
          }}>
            {currentSchedule.activities.slice(0, 6).map((activity) => (
              <div
                key={activity.id}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  padding: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>{activity.icon}</span>
                <div>
                  <div style={{
                    color: 'white',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    marginBottom: '2px'
                  }}>
                    {activity.name}
                  </div>
                  <div style={{
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '0.8rem'
                  }}>
                    {activity.duration}min • {activity.category}
                  </div>
                </div>
              </div>
            ))}
            {currentSchedule.activities.length > 6 && (
              <div style={{
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '8px',
                padding: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(255,255,255,0.7)',
                fontSize: '0.9rem'
              }}>
                +{currentSchedule.activities.length - 6} more activities
              </div>
            )}
          </div>
        </div>
      )}

      {/* Controls */}
      <div style={{
        background: 'rgba(255,255,255,0.15)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        padding: '30px',
        marginBottom: '30px',
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '15px'
        }}>
          <h3 style={{
            color: 'white',
            fontSize: '1.5rem',
            margin: '0'
          }}>
            Available Schedule Variations
          </h3>
        </div>

        {/* Search and Filter */}
        <div style={{
          display: 'flex',
          gap: '15px',
          marginBottom: '25px',
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
              fontSize: '1rem',
              backdropFilter: 'blur(10px)'
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
              fontSize: '1rem',
              backdropFilter: 'blur(10px)'
            }}
          >
            <option value="all">All Categories</option>
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
          gap: '20px'
        }}>
          {filteredSchedules.map(schedule => (
            <div
              key={schedule.id}
              onClick={() => handleScheduleSwitch(schedule)}
              style={{
                background: currentSchedule?.id === schedule.id 
                  ? `linear-gradient(145deg, ${schedule.color}40 0%, ${schedule.color}20 100%)`
                  : 'rgba(255,255,255,0.1)',
                border: currentSchedule?.id === schedule.id 
                  ? `3px solid ${schedule.color}`
                  : '2px solid rgba(255,255,255,0.2)',
                borderRadius: '15px',
                padding: '20px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => {
                if (currentSchedule?.id !== schedule.id) {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.2)';
                }
              }}
              onMouseLeave={(e) => {
                if (currentSchedule?.id !== schedule.id) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                marginBottom: '15px'
              }}>
                <div style={{
                  fontSize: '2rem',
                  background: schedule.color,
                  borderRadius: '10px',
                  padding: '8px',
                  minWidth: '50px',
                  textAlign: 'center'
                }}>
                  {schedule.icon}
                </div>
                <div style={{ flex: '1' }}>
                  <h4 style={{
                    color: 'white',
                    fontSize: '1.2rem',
                    margin: '0 0 5px 0',
                    fontWeight: '700'
                  }}>
                    {schedule.name}
                  </h4>
                  <p style={{
                    color: 'rgba(255,255,255,0.8)',
                    fontSize: '0.9rem',
                    margin: '0'
                  }}>
                    {schedule.description}
                  </p>
                </div>
              </div>

              {/* Schedule Stats */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '10px',
                marginBottom: '15px',
                fontSize: '0.8rem',
                color: 'rgba(255,255,255,0.7)'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: '700', color: 'white', fontSize: '1rem' }}>
                    {schedule.activities.length}
                  </div>
                  <div>Activities</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: '700', color: 'white', fontSize: '1rem' }}>
                    {Math.floor(schedule.totalDuration / 60)}h {schedule.totalDuration % 60}m
                  </div>
                  <div>Duration</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: '700', color: 'white', fontSize: '1rem' }}>
                    {schedule.usageCount}
                  </div>
                  <div>Times Used</div>
                </div>
              </div>

              {/* Category and Status */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '10px'
              }}>
                <div style={{
                  background: schedule.color,
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '0.8rem',
                  fontWeight: '600'
                }}>
                  {getCategoryIcon(schedule.type)} {getCategoryName(schedule.type)}
                </div>
                {schedule.isDefault && (
                  <div style={{
                    background: '#FFD700',
                    color: '#2c3e50',
                    padding: '4px 8px',
                    borderRadius: '8px',
                    fontSize: '0.7rem',
                    fontWeight: '700'
                  }}>
                    ⭐ DEFAULT
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Switch Modal */}
      {showQuickSwitch && (
        <div style={{
          position: 'fixed',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(5px)'
        }}>
          <div style={{
            background: 'linear-gradient(145deg, #2c3e50 0%, #3498db 100%)',
            borderRadius: '20px',
            padding: '30px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '25px'
            }}>
              <h3 style={{
                color: 'white',
                fontSize: '1.5rem',
                margin: '0'
              }}>
                🔄 Quick Schedule Switch
              </h3>
              <button
                onClick={() => setShowQuickSwitch(false)}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '35px',
                  height: '35px',
                  color: 'white',
                  fontSize: '1.2rem',
                  cursor: 'pointer'
                }}
              >
                ×
              </button>
            </div>

            <div style={{
              display: 'grid',
              gap: '15px'
            }}>
              {scheduleVariations.map(schedule => (
                <button
                  key={schedule.id}
                  onClick={() => handleScheduleSwitch(schedule)}
                  style={{
                    background: currentSchedule?.id === schedule.id 
                      ? `linear-gradient(135deg, ${schedule.color} 0%, ${schedule.color}80 100%)`
                      : 'rgba(255,255,255,0.1)',
                    border: currentSchedule?.id === schedule.id 
                      ? `2px solid ${schedule.color}`
                      : '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '12px',
                    padding: '15px',
                    color: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    textAlign: 'left',
                    width: '100%'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <span style={{ fontSize: '1.5rem' }}>{schedule.icon}</span>
                    <div>
                      <div style={{
                        fontWeight: '700',
                        fontSize: '1rem',
                        marginBottom: '3px'
                      }}>
                        {schedule.name}
                      </div>
                      <div style={{
                        fontSize: '0.8rem',
                        opacity: 0.8
                      }}>
                        {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)} • {schedule.activities.length} activities
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Educational Benefits */}
      <div style={{
        background: 'rgba(255,255,255,0.15)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        padding: '30px',
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        <h3 style={{
          color: 'white',
          fontSize: '1.5rem',
          margin: '0 0 20px 0'
        }}>
          🎓 Benefits for Special Education Classrooms
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <h4 style={{
              color: 'white',
              margin: '0 0 10px 0',
              fontSize: '1.1rem'
            }}>
              📅 Reduces Teacher Stress
            </h4>
            <ul style={{
              color: 'rgba(255,255,255,0.9)',
              fontSize: '0.9rem',
              margin: '0',
              paddingLeft: '20px'
            }}>
              <li>Pre-planned schedules for common scenarios</li>
              <li>Quick switching without rebuilding</li>
              <li>Emergency procedures ready to go</li>
              <li>No more last-minute schedule panic</li>
            </ul>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <h4 style={{
              color: 'white',
              margin: '0 0 10px 0',
              fontSize: '1.1rem'
            }}>
            👥 Maintains Student Routine
            </h4>
            <ul style={{
              color: 'rgba(255,255,255,0.9)',
              fontSize: '0.9rem',
              margin: '0',
              paddingLeft: '20px'
            }}>
              <li>Structure preserved even on special days</li>
              <li>Predictable patterns reduce anxiety</li>
              <li>Visual schedule still available</li>
              <li>Smooth transitions between variations</li>
            </ul>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <h4 style={{
              color: 'white',
              margin: '0 0 10px 0',
              fontSize: '1.1rem'
            }}>
            🚨 Emergency Preparedness
            </h4>
            <ul style={{
              color: 'rgba(255,255,255,0.9)',
              fontSize: '0.9rem',
              margin: '0',
              paddingLeft: '20px'
            }}>
              <li>Drill schedules pre-planned</li>
              <li>Calming activities included</li>
              <li>Modified academics for stress</li>
              <li>Quick access when needed</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultipleScheduleManager;