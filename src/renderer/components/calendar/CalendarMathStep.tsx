// 🎯 NEW COMPONENT: CalendarMathStep.tsx
// Location: src/renderer/components/calendar/CalendarMathStep.tsx

import React, { useState, useEffect } from 'react';

interface CalendarMathStepProps {
  currentDate: Date;
  onNext: () => void;
  onBack: () => void;
}

const CalendarMathStep: React.FC<CalendarMathStepProps> = ({ 
  currentDate, 
  onNext, 
  onBack 
}) => {
  const [currentLevel, setCurrentLevel] = useState<'month' | 'week' | 'day'>('month');
  const [showAnimation, setShowAnimation] = useState(false);

  // Format helpers
  const formatDate = (date: Date) => {
    return {
      weekday: date.toLocaleDateString('en-US', { weekday: 'long' }),
      month: date.toLocaleDateString('en-US', { month: 'long' }),
      day: date.getDate(),
      year: date.getFullYear(),
      monthNumber: date.getMonth() + 1
    };
  };

  // Convert number to ordinal (1st, 2nd, 3rd, etc.)
  const getOrdinalNumber = (num: number): string => {
    const suffix = ['th', 'st', 'nd', 'rd'];
    const value = num % 100;
    return num + (suffix[(value - 20) % 10] || suffix[value] || suffix[0]);
  };

  const getYesterday = () => {
    const yesterday = new Date(currentDate);
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday;
  };

  const getTomorrow = () => {
    const tomorrow = new Date(currentDate);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getSeason = (date: Date) => {
    const month = date.getMonth() + 1;
    if (month >= 3 && month <= 5) return { name: 'Spring', emoji: '🌸', color: '#10B981' };
    if (month >= 6 && month <= 8) return { name: 'Summer', emoji: '☀️', color: '#F59E0B' };
    if (month >= 9 && month <= 11) return { name: 'Fall', emoji: '🍂', color: '#EF4444' };
    return { name: 'Winter', emoji: '❄️', color: '#3B82F6' };
  };

  const today = formatDate(currentDate);
  const yesterday = formatDate(getYesterday());
  const tomorrow = formatDate(getTomorrow());
  const season = getSeason(currentDate);

  const handleLevelChange = (level: 'month' | 'week' | 'day') => {
    setShowAnimation(true);
    setTimeout(() => {
      setCurrentLevel(level);
      setShowAnimation(false);
    }, 300);
  };

  // Auto-progress through levels
  useEffect(() => {
    const progression = ['month', 'week', 'day'] as const;
    const currentIndex = progression.indexOf(currentLevel);
    
    if (currentIndex < progression.length - 1) {
      const timer = setTimeout(() => {
        handleLevelChange(progression[currentIndex + 1]);
      }, 8000); // 8 seconds per level
      
      return () => clearTimeout(timer);
    }
  }, [currentLevel]);

  const renderMonthLevel = () => (
    <div style={{
      opacity: showAnimation ? 0.5 : 1,
      transform: showAnimation ? 'scale(0.95)' : 'scale(1)',
      transition: 'all 0.3s ease'
    }}>
      {/* Month Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '2rem',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '20px',
        padding: '2rem',
        border: '2px solid rgba(255,255,255,0.2)'
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>{season.emoji}</div>
        <h3 style={{ 
          fontSize: '2.5rem', 
          margin: '0 0 1rem 0',
          color: season.color,
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>
          {today.month} {today.year}
        </h3>
        <p style={{ fontSize: '1.5rem', margin: 0, opacity: 0.9 }}>
          We are in <strong style={{ color: season.color }}>{season.name}</strong>
        </p>
      </div>

      {/* Month Details */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '16px',
          padding: '1.5rem',
          textAlign: 'center',
          border: '2px solid rgba(255,255,255,0.2)'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📅</div>
          <h4 style={{ fontSize: '1.2rem', margin: '0 0 0.5rem 0' }}>Days in {today.month}</h4>
          <p style={{ fontSize: '2rem', margin: 0, fontWeight: 'bold' }}>
            {getDaysInMonth(currentDate)}
          </p>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '16px',
          padding: '1.5rem',
          textAlign: 'center',
          border: '2px solid rgba(255,255,255,0.2)'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🗓️</div>
          <h4 style={{ fontSize: '1.2rem', margin: '0 0 0.5rem 0' }}>Month Number</h4>
          <p style={{ fontSize: '2rem', margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>
            {getOrdinalNumber(today.monthNumber)}
          </p>
          <p style={{ fontSize: '1rem', margin: 0, opacity: 0.8 }}>
            {today.month} is the {getOrdinalNumber(today.monthNumber)} month
          </p>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '16px',
          padding: '1.5rem',
          textAlign: 'center',
          border: '2px solid rgba(255,255,255,0.2)'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{season.emoji}</div>
          <h4 style={{ fontSize: '1.2rem', margin: '0 0 0.5rem 0' }}>Season</h4>
          <p style={{ fontSize: '1.5rem', margin: 0, fontWeight: 'bold', color: season.color }}>
            {season.name}
          </p>
        </div>
      </div>
    </div>
  );

  const renderWeekLevel = () => {
    const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayIndex = currentDate.getDay();

    return (
      <div style={{
        opacity: showAnimation ? 0.5 : 1,
        transform: showAnimation ? 'scale(0.95)' : 'scale(1)',
        transition: 'all 0.3s ease'
      }}>
        {/* Week Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '2rem',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '20px',
          padding: '2rem',
          border: '2px solid rgba(255,255,255,0.2)'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📅</div>
          <h3 style={{ fontSize: '2.5rem', margin: '0 0 1rem 0' }}>
            This Week
          </h3>
          <p style={{ fontSize: '1.5rem', margin: 0, opacity: 0.9 }}>
            Today is <strong>{today.weekday}</strong>
          </p>
        </div>

        {/* Week Days Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          {weekDays.map((day, index) => (
            <div
              key={day}
              style={{
                background: index === todayIndex 
                  ? 'rgba(34, 197, 94, 0.3)' 
                  : 'rgba(255,255,255,0.1)',
                borderRadius: '16px',
                padding: '1rem',
                textAlign: 'center',
                border: index === todayIndex 
                  ? '3px solid #22C55E' 
                  : '2px solid rgba(255,255,255,0.2)',
                transform: index === todayIndex ? 'scale(1.05)' : 'scale(1)',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                {index === todayIndex ? '👈' : '📅'}
              </div>
              <h4 style={{ 
                fontSize: '1rem', 
                margin: '0 0 0.5rem 0',
                color: index === todayIndex ? '#22C55E' : 'white'
              }}>
                {day}
              </h4>
              {index === todayIndex && (
                <p style={{ fontSize: '0.8rem', margin: 0, color: '#22C55E', fontWeight: 'bold' }}>
                  TODAY!
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDayLevel = () => (
    <div style={{
      opacity: showAnimation ? 0.5 : 1,
      transform: showAnimation ? 'scale(0.95)' : 'scale(1)',
      transition: 'all 0.3s ease'
    }}>
      {/* Day Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '2rem',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '20px',
        padding: '2rem',
        border: '2px solid rgba(255,255,255,0.2)'
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📅</div>
        <h3 style={{ fontSize: '2.5rem', margin: '0 0 1rem 0' }}>
          Yesterday → Today → Tomorrow
        </h3>
        <p style={{ fontSize: '1.3rem', margin: 0, opacity: 0.9 }}>
          Learning about <strong>before</strong>, <strong>now</strong>, and <strong>after</strong>
        </p>
      </div>

      {/* Three Day Sequence */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* Yesterday */}
        <div style={{
          background: 'rgba(255,255,255,0.08)',
          borderRadius: '20px',
          padding: '2rem',
          textAlign: 'center',
          border: '2px solid rgba(255,255,255,0.15)',
          opacity: 0.8
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⬅️</div>
          <h4 style={{ fontSize: '1.5rem', margin: '0 0 1rem 0', color: 'rgba(255,255,255,0.7)' }}>
            Yesterday
          </h4>
          <p style={{ fontSize: '1.2rem', margin: '0 0 0.5rem 0' }}>
            {yesterday.weekday}
          </p>
          <p style={{ fontSize: '1rem', margin: 0, opacity: 0.6 }}>
            {yesterday.month} {getOrdinalNumber(yesterday.day)}
          </p>
          <div style={{ 
            marginTop: '1rem', 
            padding: '0.5rem', 
            background: 'rgba(255,255,255,0.1)', 
            borderRadius: '8px' 
          }}>
            <strong>Yesterday was...</strong>
          </div>
        </div>

        {/* Today */}
        <div style={{
          background: 'rgba(34, 197, 94, 0.2)',
          borderRadius: '20px',
          padding: '2rem',
          textAlign: 'center',
          border: '3px solid #22C55E',
          transform: 'scale(1.05)',
          boxShadow: '0 8px 32px rgba(34, 197, 94, 0.3)'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⭐</div>
          <h4 style={{ fontSize: '1.5rem', margin: '0 0 1rem 0', color: '#22C55E' }}>
            Today
          </h4>
          <p style={{ fontSize: '1.2rem', margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>
            {today.weekday}
          </p>
          <p style={{ fontSize: '1rem', margin: 0 }}>
            {today.month} {getOrdinalNumber(today.day)}
          </p>
          <div style={{ 
            marginTop: '1rem', 
            padding: '0.5rem', 
            background: 'rgba(34, 197, 94, 0.3)', 
            borderRadius: '8px',
            color: '#22C55E',
            fontWeight: 'bold'
          }}>
            Today is...
          </div>
        </div>

        {/* Tomorrow */}
        <div style={{
          background: 'rgba(255,255,255,0.08)',
          borderRadius: '20px',
          padding: '2rem',
          textAlign: 'center',
          border: '2px solid rgba(255,255,255,0.15)',
          opacity: 0.8
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>➡️</div>
          <h4 style={{ fontSize: '1.5rem', margin: '0 0 1rem 0', color: 'rgba(255,255,255,0.7)' }}>
            Tomorrow
          </h4>
          <p style={{ fontSize: '1.2rem', margin: '0 0 0.5rem 0' }}>
            {tomorrow.weekday}
          </p>
          <p style={{ fontSize: '1rem', margin: 0, opacity: 0.6 }}>
            {tomorrow.month} {getOrdinalNumber(tomorrow.day)}
          </p>
          <div style={{ 
            marginTop: '1rem', 
            padding: '0.5rem', 
            background: 'rgba(255,255,255,0.1)', 
            borderRadius: '8px' 
          }}>
            <strong>Tomorrow will be...</strong>
          </div>
        </div>
      </div>

      {/* Vocabulary Focus */}
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '16px',
        padding: '1.5rem',
        textAlign: 'center',
        border: '2px solid rgba(255,255,255,0.2)'
      }}>
        <h4 style={{ fontSize: '1.3rem', margin: '0 0 1rem 0' }}>
          🗣️ Vocabulary Words
        </h4>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          {['yesterday', 'today', 'tomorrow', 'before', 'after', 'now', '1st', '2nd', '3rd', 'ordinal'].map(word => (
            <span 
              key={word}
              style={{
                background: 'rgba(255,255,255,0.2)',
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                border: '1px solid rgba(255,255,255,0.3)'
              }}
            >
              {word}
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ 
      padding: '1rem 2rem',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '1rem',
        flexShrink: 0
      }}>
        <h2 style={{
          fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
          fontWeight: '700',
          color: 'white',
          marginBottom: '0.5rem',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>
          📅 Calendar Math Time
        </h2>
        <p style={{
          fontSize: 'clamp(1rem, 2.5vw, 1.3rem)',
          color: 'rgba(255,255,255,0.9)',
          marginBottom: '0'
        }}>
          Month → Week → Day Learning
        </p>
      </div>

      {/* Level Indicator */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '1rem',
        marginBottom: '1rem',
        flexShrink: 0
      }}>
        {(['month', 'week', 'day'] as const).map(level => (
          <button
            key={level}
            onClick={() => handleLevelChange(level)}
            style={{
              background: currentLevel === level 
                ? 'rgba(34, 197, 94, 0.8)' 
                : 'rgba(255,255,255,0.1)',
              border: currentLevel === level 
                ? '2px solid #22C55E' 
                : '2px solid rgba(255,255,255,0.3)',
              borderRadius: '12px',
              color: 'white',
              padding: '0.5rem 1rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              textTransform: 'capitalize'
            }}
          >
            {level}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '0 0.5rem'
      }}>
        {currentLevel === 'month' && renderMonthLevel()}
        {currentLevel === 'week' && renderWeekLevel()}
        {currentLevel === 'day' && renderDayLevel()}
      </div>

      {/* Navigation */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '1rem',
        marginTop: '1rem',
        flexShrink: 0
      }}>
        <button
          onClick={onBack}
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: '2px solid rgba(255,255,255,0.3)',
            borderRadius: '12px',
            color: 'white',
            padding: 'clamp(0.8rem 1.5rem, 2vw, 1rem 2rem)',
            fontSize: 'clamp(0.9rem, 2vw, 1rem)',
            fontWeight: '600',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease',
            minHeight: '60px'
          }}
        >
          ← Back to Behavior Expectations
        </button>
        
        <button
          onClick={onNext}
          style={{
            background: 'rgba(34, 197, 94, 0.8)',
            border: 'none',
            borderRadius: '12px',
            color: 'white',
            padding: 'clamp(0.8rem 2rem, 2.5vw, 1rem 3rem)',
            fontSize: 'clamp(1rem, 2.2vw, 1.1rem)',
            fontWeight: '700',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease',
            minHeight: '60px'
          }}
        >
          Continue to Weather & Clothing →
        </button>
      </div>
    </div>
  );
};

export default CalendarMathStep;