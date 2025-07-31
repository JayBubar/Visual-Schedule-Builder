import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths, isToday } from 'date-fns';

interface CalendarWidgetProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  size?: 'small' | 'medium' | 'large';
  savedDates?: string[]; // Array of YYYY-MM-DD strings for dates with saved data
  className?: string;
}

const CalendarWidget: React.FC<CalendarWidgetProps> = ({
  selectedDate,
  onDateSelect,
  size = 'large',
  savedDates = [],
  className = ''
}) => {
  const [currentMonth, setCurrentMonth] = useState(selectedDate);
  const [isAnimating, setIsAnimating] = useState(false);

  // Size configurations
  const sizeConfig = {
    small: {
      container: '400px',
      cellSize: '45px',
      fontSize: '14px',
      headerSize: '18px',
      buttonPadding: '8px 12px'
    },
    medium: {
      container: '500px',
      cellSize: '60px',
      fontSize: '16px',
      headerSize: '24px',
      buttonPadding: '12px 16px'
    },
    large: {
      container: '700px',
      cellSize: '80px',
      fontSize: '20px',
      headerSize: '32px',
      buttonPadding: '16px 24px'
    }
  };

  const config = sizeConfig[size];

  // Get calendar grid dates
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const dateFormat = 'd';
  const rows = [];
  let days = [];
  let day = startDate;

  // Build calendar grid
  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      const cloneDay = day;
      const formattedDate = format(day, dateFormat);
      const isCurrentMonth = isSameMonth(day, monthStart);
      const isSelected = isSameDay(day, selectedDate);
      const isCurrentDay = isToday(day);
      const hasSavedData = savedDates.includes(format(day, 'yyyy-MM-dd'));

      days.push(
        <div
          key={day.toString()}
          className={`calendar-cell ${isCurrentMonth ? 'current-month' : 'other-month'} ${
            isSelected ? 'selected' : ''
          } ${isCurrentDay ? 'today' : ''} ${hasSavedData ? 'has-data' : ''}`}
          onClick={() => {
            if (isCurrentMonth) {
              onDateSelect(cloneDay);
            }
          }}
          style={{
            width: config.cellSize,
            height: config.cellSize,
            fontSize: config.fontSize,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            cursor: isCurrentMonth ? 'pointer' : 'default',
            background: isSelected 
              ? 'linear-gradient(135deg, #667eea, #764ba2)'
              : isCurrentDay
              ? 'rgba(255, 255, 255, 0.3)'
              : isCurrentMonth
              ? 'rgba(255, 255, 255, 0.1)'
              : 'rgba(255, 255, 255, 0.05)',
            color: isSelected || isCurrentDay ? 'white' : isCurrentMonth ? 'white' : 'rgba(255, 255, 255, 0.4)',
            border: isCurrentDay ? '3px solid #FFD700' : '2px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '16px',
            fontWeight: isSelected || isCurrentDay ? '700' : isCurrentMonth ? '600' : '400',
            transition: 'all 0.3s ease',
            boxShadow: isSelected 
              ? '0 8px 32px rgba(102, 126, 234, 0.4)'
              : isCurrentDay
              ? '0 4px 20px rgba(255, 215, 0, 0.3)'
              : hasSavedData
              ? '0 4px 15px rgba(40, 167, 69, 0.3)'
              : '0 2px 8px rgba(0, 0, 0, 0.1)',
            transform: 'scale(1)',
            userSelect: 'none'
          }}
          onMouseEnter={(e) => {
            if (isCurrentMonth && !isSelected) {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 6px 24px rgba(0, 0, 0, 0.2)';
            }
          }}
          onMouseLeave={(e) => {
            if (isCurrentMonth && !isSelected) {
              e.currentTarget.style.background = hasSavedData 
                ? 'rgba(40, 167, 69, 0.2)' 
                : 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = hasSavedData
                ? '0 4px 15px rgba(40, 167, 69, 0.3)'
                : '0 2px 8px rgba(0, 0, 0, 0.1)';
            }
          }}
        >
          {formattedDate}
          
          {/* Data indicator badge */}
          {hasSavedData && (
            <div style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              width: '8px',
              height: '8px',
              background: '#28a745',
              borderRadius: '50%',
              border: '2px solid white',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
            }} />
          )}
          
          {/* Today indicator */}
          {isCurrentDay && !isSelected && (
            <div style={{
              position: 'absolute',
              bottom: '2px',
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: '10px',
              fontWeight: '700',
              color: '#FFD700',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)'
            }}>
              TODAY
            </div>
          )}
          
          {/* Selected indicator */}
          {isSelected && (
            <div style={{
              position: 'absolute',
              top: '2px',
              left: '2px',
              fontSize: '12px',
              color: 'white',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)'
            }}>
              ✓
            </div>
          )}
        </div>
      );
      
      day = addDays(day, 1);
    }
    rows.push(
      <div 
        key={day.toString()} 
        style={{ 
          display: 'flex', 
          gap: '8px',
          justifyContent: 'center',
          marginBottom: '8px'
        }}
      >
        {days}
      </div>
    );
    days = [];
  }

  // Navigation handlers
  const handlePrevMonth = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentMonth(subMonths(currentMonth, 1));
      setIsAnimating(false);
    }, 150);
  };

  const handleNextMonth = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentMonth(addMonths(currentMonth, 1));
      setIsAnimating(false);
    }, 150);
  };

  const handleTodayClick = () => {
    const today = new Date();
    setCurrentMonth(today);
    onDateSelect(today);
  };

  // Week day headers
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div 
      className={`calendar-widget ${className}`}
      style={{
        background: 'linear-gradient(145deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))',
        borderRadius: '24px',
        padding: '2rem',
        border: '2px solid rgba(255,255,255,0.2)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
        maxWidth: config.container,
        margin: '0 auto',
        transition: 'all 0.3s ease'
      }}
    >
      {/* Header with navigation */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <button
          onClick={handlePrevMonth}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '16px',
            color: 'white',
            padding: config.buttonPadding,
            fontSize: config.fontSize,
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
            userSelect: 'none'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
          disabled={isAnimating}
        >
          ← Previous
        </button>

        <div style={{ textAlign: 'center' }}>
          <h2 style={{
            margin: '0',
            fontSize: config.headerSize,
            fontWeight: '700',
            color: 'white',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
            opacity: isAnimating ? 0.5 : 1,
            transition: 'opacity 0.3s ease'
          }}>
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          
          <button
            onClick={handleTodayClick}
            style={{
              background: 'linear-gradient(135deg, #28a745, #20c997)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              marginTop: '8px',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(40, 167, 69, 0.3)',
              userSelect: 'none'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(40, 167, 69, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(40, 167, 69, 0.3)';
            }}
          >
            📅 Today
          </button>
        </div>

        <button
          onClick={handleNextMonth}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '16px',
            color: 'white',
            padding: config.buttonPadding,
            fontSize: config.fontSize,
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
            userSelect: 'none'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
          disabled={isAnimating}
        >
          Next →
        </button>
      </div>

      {/* Week day headers */}
      <div style={{
        display: 'flex',
        gap: '8px',
        justifyContent: 'center',
        marginBottom: '16px'
      }}>
        {weekDays.map(day => (
          <div
            key={day}
            style={{
              width: config.cellSize,
              textAlign: 'center',
              fontSize: config.fontSize,
              fontWeight: '700',
              color: 'rgba(255, 255, 255, 0.8)',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
              padding: '8px 0',
              userSelect: 'none'
            }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{
        opacity: isAnimating ? 0.5 : 1,
        transform: isAnimating ? 'scale(0.95)' : 'scale(1)',
        transition: 'all 0.3s ease'
      }}>
        {rows}
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '2rem',
        marginTop: '1.5rem',
        fontSize: '14px',
        color: 'rgba(255, 255, 255, 0.8)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '12px',
            height: '12px',
            background: '#28a745',
            borderRadius: '50%',
            border: '2px solid white'
          }} />
          <span>Has Data</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '16px',
            height: '16px',
            background: 'rgba(255, 255, 255, 0.3)',
            borderRadius: '4px',
            border: '3px solid #FFD700'
          }} />
          <span>Today</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '16px',
            height: '16px',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            borderRadius: '4px',
            border: '2px solid rgba(255, 255, 255, 0.2)'
          }} />
          <span>Selected</span>
        </div>
      </div>
    </div>
  );
};

export default CalendarWidget;