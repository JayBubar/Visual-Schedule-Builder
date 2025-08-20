import React, { useState, useEffect } from 'react';
import { MorningMeetingStepProps, CalendarMathStepData } from '../types/morningMeetingTypes';

const CalendarMathStep: React.FC<MorningMeetingStepProps> = ({
  currentDate,
  onNext,
  onBack,
  onDataUpdate,
  stepData,
  hubSettings
}) => {
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [mathConcepts, setMathConcepts] = useState<string[]>([]);
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  const [currentSection, setCurrentSection] = useState<string>('day');
  const [currentLevel, setCurrentLevel] = useState<'day' | 'week' | 'month'>(
    stepData?.currentLevel || 'day'
  );
  const [completedLevels, setCompletedLevels] = useState<string[]>(
    stepData?.completedLevels || []
  );
  const [timeSpentSeconds, setTimeSpentSeconds] = useState<number>(0);
  const [startTime] = useState(new Date());

  // Update time spent every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSpentSeconds(Math.floor((new Date().getTime() - startTime.getTime()) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  // Settings from hub
  const enableOrdinalNumbers = hubSettings?.calendarMath?.enableOrdinalNumbers ?? true;
  const enableYesterday = hubSettings?.calendarMath?.enableYesterday ?? true;
  const enableTomorrow = hubSettings?.calendarMath?.enableTomorrow ?? true;

  // Add custom vocabulary support
  const getCalendarVocabulary = (): string[] => {
    if (hubSettings?.customVocabulary?.calendar?.length > 0) {
      return hubSettings.customVocabulary.calendar;
    }
    
    return ['yesterday', 'today', 'tomorrow', 'week', 'month', 'ordinal'];
  };

  const customVocabulary = getCalendarVocabulary();

  // Date calculations
  const today = currentDate;
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const seasonNames = {
    0: 'Winter', 1: 'Winter', 2: 'Spring',
    3: 'Spring', 4: 'Spring', 5: 'Summer',
    6: 'Summer', 7: 'Summer', 8: 'Fall',
    9: 'Fall', 10: 'Fall', 11: 'Winter'
  };

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Utility functions
  const getOrdinal = (n: number): string => {
    if (!enableOrdinalNumbers) return n.toString();
    const suffix = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (suffix[(v - 20) % 10] || suffix[v] || suffix[0]);
  };

  const getDaysInMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getWeekCalendar = (date: Date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    
    const week = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    return week;
  };


  // Save step data
  useEffect(() => {
    const stepData: CalendarMathStepData = {
      // Required properties from interface
      currentDate: new Date(), // or currentDate prop
      selectedActivities: selectedActivities || [], // from component state
      mathConcepts: mathConcepts || [], // from component state
      completedSections: completedSections || [], // from component state
      currentSection: currentSection || 'day', // from component state
      
      // New properties that were added
      currentLevel: currentLevel || 'day', // from component state
      completedLevels: completedLevels || [], // from component state
      timeSpentSeconds: timeSpentSeconds || 0, // from component state
      
      // Optional property
      completedAt: currentLevel === 'month' && completedLevels.length >= 3 ? new Date() : undefined
    };
    onDataUpdate(stepData);
  }, [currentLevel, completedLevels, selectedActivities, mathConcepts, completedSections, currentSection, timeSpentSeconds]);

  const handleLevelComplete = (level: string) => {
    if (!completedLevels.includes(level)) {
      setCompletedLevels(prev => [...prev, level]);
    }

    // Auto-progress to next level
    if (level === 'month' && currentLevel === 'month') {
      setCurrentLevel('week');
    } else if (level === 'week' && currentLevel === 'week') {
      setCurrentLevel('day');
    }
  };

  const handleManualNavigation = (level: 'month' | 'week' | 'day') => {
    setCurrentLevel(level);
  };

  const renderMonthLevel = () => {
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const daysInMonth = getDaysInMonth(today);
    const season = seasonNames[currentMonth as keyof typeof seasonNames];

    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2rem',
        padding: '2rem'
      }}>
        <div style={{
          textAlign: 'center'
        }}>
          <h3 style={{
            fontSize: '3rem',
            fontWeight: '700',
            color: 'white',
            marginBottom: '1rem',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            {monthNames[currentMonth]} {currentYear}
          </h3>
          <div style={{
            fontSize: '1.5rem',
            color: 'rgba(255,255,255,0.9)',
            marginBottom: '0.5rem'
          }}>
            The {getOrdinal(currentMonth + 1)} month of the year
          </div>
          <div style={{
            fontSize: '1.3rem',
            color: 'rgba(255,255,255,0.8)',
            marginBottom: '0.5rem'
          }}>
            Season: {season}
          </div>
          <div style={{
            fontSize: '1.2rem',
            color: 'rgba(255,255,255,0.8)'
          }}>
            This month has {daysInMonth} days
          </div>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '20px',
          padding: '2rem',
          backdropFilter: 'blur(10px)',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '4rem',
            fontWeight: '700',
            color: 'white',
            marginBottom: '0.5rem'
          }}>
            📅
          </div>
          <div style={{
            fontSize: '1.2rem',
            color: 'rgba(255,255,255,0.9)'
          }}>
            Learning about months and seasons
          </div>
        </div>
      </div>
    );
  };

  const renderWeekLevel = () => {
    const weekDays = getWeekCalendar(today);
    
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2rem',
        padding: '2rem'
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '1rem'
        }}>
          <h3 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            color: 'white',
            marginBottom: '1rem',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            This Week
          </h3>
          <div style={{
            fontSize: '1.3rem',
            color: 'rgba(255,255,255,0.9)'
          }}>
            Today is {dayNames[today.getDay()]}
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '1rem',
          maxWidth: '800px'
        }}>
          {weekDays.map((day, index) => {
            const isToday = day.toDateString() === today.toDateString();
            
            return (
              <div
                key={index}
                style={{
                  background: isToday 
                    ? 'rgba(34, 197, 94, 0.9)' 
                    : 'rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  padding: '1rem',
                  textAlign: 'center',
                  backdropFilter: 'blur(10px)',
                  border: isToday ? '3px solid white' : 'none',
                  transform: isToday ? 'scale(1.1)' : 'scale(1)',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: 'white',
                  marginBottom: '0.5rem'
                }}>
                  {dayNames[day.getDay()]}
                </div>
                <div style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: 'white'
                }}>
                  {day.getDate()}
                </div>
                {isToday && (
                  <div style={{
                    fontSize: '0.8rem',
                    color: 'white',
                    marginTop: '0.25rem',
                    fontWeight: '500'
                  }}>
                    TODAY
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '16px',
          padding: '1.5rem',
          backdropFilter: 'blur(10px)',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '1.2rem',
            color: 'rgba(255,255,255,0.9)',
            marginBottom: '0.5rem'
          }}>
            Today is the {getOrdinal(today.getDate())} day of {monthNames[today.getMonth()]}
          </div>
        </div>
      </div>
    );
  };

  const renderDayLevel = () => {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2rem',
        padding: '2rem'
      }}>
        <div style={{
          textAlign: 'center'
        }}>
          <h3 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            color: 'white',
            marginBottom: '1rem',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            Today's Date
          </h3>
          <div style={{
            fontSize: '1.5rem',
            color: 'rgba(255,255,255,0.9)',
            marginBottom: '2rem'
          }}>
            {today.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: enableYesterday && enableTomorrow ? 'repeat(3, 1fr)' : enableYesterday || enableTomorrow ? 'repeat(2, 1fr)' : '1fr',
          gap: '2rem',
          maxWidth: '900px',
          width: '100%'
        }}>
          {enableYesterday && (
            <div style={{
              background: 'rgba(156, 163, 175, 0.8)',
              borderRadius: '16px',
              padding: '2rem',
              textAlign: 'center',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{
                fontSize: '3rem',
                marginBottom: '1rem'
              }}>
                ⬅️
              </div>
              <div style={{
                fontSize: '1.3rem',
                fontWeight: '600',
                color: 'white',
                marginBottom: '0.5rem'
              }}>
                Yesterday
              </div>
              <div style={{
                fontSize: '1.1rem',
                color: 'rgba(255,255,255,0.9)',
                marginBottom: '0.5rem'
              }}>
                {dayNames[yesterday.getDay()]}
              </div>
              <div style={{
                fontSize: '1rem',
                color: 'rgba(255,255,255,0.8)'
              }}>
                {monthNames[yesterday.getMonth()]} {getOrdinal(yesterday.getDate())}
              </div>
            </div>
          )}

          <div style={{
            background: 'rgba(34, 197, 94, 0.9)',
            borderRadius: '16px',
            padding: '2rem',
            textAlign: 'center',
            backdropFilter: 'blur(10px)',
            border: '3px solid white',
            transform: 'scale(1.05)'
          }}>
            <div style={{
              fontSize: '3rem',
              marginBottom: '1rem'
            }}>
              ⭐
            </div>
            <div style={{
              fontSize: '1.3rem',
              fontWeight: '600',
              color: 'white',
              marginBottom: '0.5rem'
            }}>
              Today
            </div>
            <div style={{
              fontSize: '1.1rem',
              color: 'rgba(255,255,255,0.9)',
              marginBottom: '0.5rem'
            }}>
              {dayNames[today.getDay()]}
            </div>
            <div style={{
              fontSize: '1rem',
              color: 'rgba(255,255,255,0.8)'
            }}>
              {monthNames[today.getMonth()]} {getOrdinal(today.getDate())}
            </div>
          </div>

          {enableTomorrow && (
            <div style={{
              background: 'rgba(59, 130, 246, 0.8)',
              borderRadius: '16px',
              padding: '2rem',
              textAlign: 'center',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{
                fontSize: '3rem',
                marginBottom: '1rem'
              }}>
                ➡️
              </div>
              <div style={{
                fontSize: '1.3rem',
                fontWeight: '600',
                color: 'white',
                marginBottom: '0.5rem'
              }}>
                Tomorrow
              </div>
              <div style={{
                fontSize: '1.1rem',
                color: 'rgba(255,255,255,0.9)',
                marginBottom: '0.5rem'
              }}>
                {dayNames[tomorrow.getDay()]}
              </div>
              <div style={{
                fontSize: '1rem',
                color: 'rgba(255,255,255,0.8)'
              }}>
                {monthNames[tomorrow.getMonth()]} {getOrdinal(tomorrow.getDate())}
              </div>
            </div>
          )}
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '16px',
          padding: '1.5rem',
          backdropFilter: 'blur(10px)',
          textAlign: 'center',
          maxWidth: '600px'
        }}>
          <div style={{
            fontSize: '1.2rem',
            color: 'rgba(255,255,255,0.9)',
            lineHeight: '1.4'
          }}>
            <strong>Vocabulary Practice:</strong><br />
            Yesterday → Today → Tomorrow<br />
            {getOrdinal(today.getDate())} day of the month
          </div>
        </div>
      </div>
    );
  };

  const renderCurrentLevel = () => {
    switch (currentLevel) {
      case 'month':
        return renderMonthLevel();
      case 'week':
        return renderWeekLevel();
      case 'day':
        return renderDayLevel();
      default:
        return renderMonthLevel();
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isAllComplete = completedLevels.length >= 3;

  return (
    <div style={{
      height: '100%',
      width: '100%',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white'
    }}>
      {/* Video Section */}
      {hubSettings?.videos?.calendarMath && hubSettings.videos.calendarMath.length > 0 && (
        <div style={{
          padding: '1rem 2rem',
          background: 'rgba(255, 255, 255, 0.1)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <span style={{ fontWeight: '600', fontSize: '1rem' }}>🎬 Videos:</span>
          {hubSettings.videos.calendarMath.map((video, index) => (
            <button
              key={index}
              onClick={() => window.open(video.url, `calendar-video-${index}`, 'width=800,height=600')}
              style={{
                background: 'rgba(34, 197, 94, 0.8)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                padding: '0.5rem 1rem',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(34, 197, 94, 1)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(34, 197, 94, 0.8)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              Play Calendar Video {index + 1}
            </button>
          ))}
        </div>
      )}

      {/* Header */}
      <div style={{
        padding: '1.5rem 2rem 1rem 2rem',
        textAlign: 'center'
      }}>
        <h2 style={{
          fontSize: '2.5rem',
          fontWeight: '700',
          color: 'white',
          marginBottom: '0.5rem',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>
          📅 Calendar Math
        </h2>
        <p style={{
          fontSize: '1.1rem',
          color: 'rgba(255,255,255,0.9)',
          marginBottom: '0.5rem'
        }}>
          {formatDate(currentDate)}
        </p>
        <p style={{
          fontSize: '0.9rem',
          color: 'rgba(255,255,255,0.8)'
        }}>
          Learning months, weeks, and days with numbers!
        </p>
      </div>

      {/* Level Navigation */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '1rem',
        padding: '0 2rem 1rem 2rem'
      }}>
        {(['month', 'week', 'day'] as const).map((level) => (
          <button
            key={level}
            onClick={() => handleManualNavigation(level)}
            style={{
              background: currentLevel === level
                ? 'rgba(255, 255, 255, 0.3)'
                : 'rgba(255, 255, 255, 0.1)',
              border: currentLevel === level ? '2px solid white' : '2px solid transparent',
              borderRadius: '12px',
              color: 'white',
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s ease',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              if (currentLevel !== level) {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }
            }}
            onMouseLeave={(e) => {
              if (currentLevel !== level) {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.transform = 'scale(1)';
              }
            }}
          >
            {level.charAt(0).toUpperCase() + level.slice(1)}
            {completedLevels.includes(level) && (
              <span style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                background: 'rgba(34, 197, 94, 1)',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.7rem'
              }}>
                ✓
              </span>
            )}
          </button>
        ))}
      </div>


      {/* Main Content */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {renderCurrentLevel()}
      </div>

      {/* Navigation */}
      <div style={{
        padding: '1rem 2rem 2rem 2rem',
        display: 'flex',
        justifyContent: 'center',
        gap: '1rem'
      }}>
        {currentLevel !== 'day' && (
          <button
            onClick={() => handleLevelComplete(currentLevel)}
            style={{
              background: 'rgba(34, 197, 94, 0.8)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              padding: '1rem 2rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(34, 197, 94, 1)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(34, 197, 94, 0.8)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            Continue to {currentLevel === 'month' ? 'Week' : 'Day'} →
          </button>
        )}

        {currentLevel === 'day' && (
          <button
            onClick={onNext}
            style={{
              background: 'rgba(34, 197, 94, 0.8)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              padding: '1rem 2rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s ease'
            }}
          >
            Continue to Weather →
          </button>
        )}
      </div>

      {/* ALWAYS VISIBLE NAVIGATION - QUICK FIX */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '1rem',
        zIndex: 1000,
        background: 'rgba(0, 0, 0, 0.8)',
        borderRadius: '20px',
        padding: '1rem 2rem',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
      }}>
        <button
          onClick={onBack}
          style={{
            background: 'rgba(156, 163, 175, 0.8)',
            border: 'none',
            borderRadius: '12px',
            color: 'white',
            padding: '1rem 2rem',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          ← Back
        </button>
        
        <button
          onClick={onNext}
          style={{
            background: 'rgba(34, 197, 94, 0.8)',
            border: 'none',
            borderRadius: '12px',
            color: 'white',
            padding: '1rem 2rem',
            fontSize: '1rem',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(34, 197, 94, 1)';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(34, 197, 94, 0.8)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          Calendar Math Complete! →
        </button>
      </div>
    </div>
  );
};

export default CalendarMathStep;
