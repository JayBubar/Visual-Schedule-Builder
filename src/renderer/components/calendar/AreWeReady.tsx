import React, { useState, useEffect } from 'react';
import { Student, StaffMember, ScheduleVariation, Activity } from '../../types';

interface AreWeReadyProps {
  currentDate: Date;
  presentStudents: Student[];
  absentStudents: Student[];
  selectedSchedule?: ScheduleVariation | null;
  staff: StaffMember[];
  onConfirm: () => void;
  onBack: () => void;
}

const AreWeReady: React.FC<AreWeReadyProps> = ({
  currentDate,
  presentStudents,
  absentStudents,
  selectedSchedule,
  staff,
  onConfirm,
  onBack
}) => {
  const [isReady, setIsReady] = useState<boolean | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Get today's pullouts and special events
  const getTodaysPullouts = () => {
    // This would integrate with your existing IEP/pullout system
    // For now, returning mock data - replace with actual logic
    return presentStudents.filter(student => {
      // Check if student has pullouts on this day
      return student.goals && student.goals.length > 0;
    });
  };

  const getSpecialEvents = () => {
    // Check for drills, assemblies, etc.
    const dayOfWeek = currentDate.getDay();
    const events = [];
    
    // Example: Fire drill on Fridays
    if (dayOfWeek === 5) {
      events.push({
        type: 'drill',
        name: 'Fire Drill Practice',
        time: '10:30 AM',
        icon: '🚨'
      });
    }
    
    // Add other scheduled events here
    return events;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleReadyChoice = (ready: boolean) => {
    setIsReady(ready);
    if (ready) {
      setShowConfirmation(true);
    }
  };

  const handleConfirm = () => {
    onConfirm();
  };

  const pulloutStudents = getTodaysPullouts();
  const specialEvents = getSpecialEvents();

  return (
    <div style={{
      padding: '2rem',
      textAlign: 'center',
      minHeight: '600px',
      display: 'flex',
      flexDirection: 'column',
      gap: '2rem'
    }}>
      {/* Header */}
      <div>
        <h2 style={{
          fontSize: '3rem',
          fontWeight: '700',
          color: 'white',
          marginBottom: '1rem',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>
          🚀 Are We Ready?
        </h2>
        <p style={{
          fontSize: '1.3rem',
          color: 'rgba(255,255,255,0.9)',
          marginBottom: '0.5rem'
        }}>
          {formatDate(currentDate)}
        </p>
        <p style={{
          fontSize: '1.1rem',
          color: 'rgba(255,255,255,0.8)'
        }}>
          Let's review our day before we begin!
        </p>
      </div>

      {/* Today's Summary */}
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '20px',
        padding: '2rem',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.2)',
        maxWidth: '800px',
        margin: '0 auto',
        textAlign: 'left'
      }}>
        {/* Attendance Summary */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            background: 'rgba(34, 197, 94, 0.2)',
            borderRadius: '12px',
            padding: '1.5rem',
            textAlign: 'center',
            border: '2px solid rgba(34, 197, 94, 0.4)'
          }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem', lineHeight: '1.2' }}>
              {Array.from({ length: presentStudents.length }, (_, i) => '👤').join('')}
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: '700', color: 'white' }}>
              {presentStudents.length}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem' }}>
              Students Present
            </div>
          </div>

          {absentStudents.length > 0 && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.2)',
              borderRadius: '12px',
              padding: '1.5rem',
              textAlign: 'center',
              border: '2px solid rgba(239, 68, 68, 0.4)'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📍</div>
              <div style={{ fontSize: '1.8rem', fontWeight: '700', color: 'white' }}>
                {absentStudents.length}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem' }}>
                Students Absent
              </div>
            </div>
          )}

          <div style={{
            background: 'rgba(59, 130, 246, 0.2)',
            borderRadius: '12px',
            padding: '1.5rem',
            textAlign: 'center',
            border: '2px solid rgba(59, 130, 246, 0.4)'
          }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem', lineHeight: '1.2' }}>
              {Array.from({ length: staff.length }, (_, i) => i % 2 === 0 ? '👨‍🏫' : '👩‍🏫').join('')}
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: '700', color: 'white' }}>
              {staff.length}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem' }}>
              Staff Members
            </div>
          </div>
        </div>

        {/* Schedule Preview */}
        {selectedSchedule && (
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{
              fontSize: '1.5rem',
              color: 'white',
              marginBottom: '1rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              📋 Today's Schedule: {selectedSchedule.name}
            </h3>
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '1rem',
              maxHeight: '200px',
              overflowY: 'auto'
            }}>
              {selectedSchedule.activities.slice(0, 5).map((activity, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.5rem',
                  borderBottom: index < 4 ? '1px solid rgba(255,255,255,0.1)' : 'none'
                }}>
                  <span style={{ fontSize: '1.5rem' }}>{activity.icon}</span>
                  <span style={{ color: 'white', fontWeight: '500' }}>
                    {activity.name}
                  </span>
                  <span style={{ 
                    color: 'rgba(255,255,255,0.7)', 
                    fontSize: '0.9rem',
                    marginLeft: 'auto'
                  }}>
                    {activity.duration} min
                  </span>
                </div>
              ))}
              {selectedSchedule.activities.length > 5 && (
                <div style={{
                  textAlign: 'center',
                  padding: '0.5rem',
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: '0.9rem'
                }}>
                  +{selectedSchedule.activities.length - 5} more activities
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pullout Reminders */}
        {pulloutStudents.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{
              fontSize: '1.3rem',
              color: 'white',
              marginBottom: '1rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              🎯 Student Pullouts Today
            </h3>
            <div style={{
              background: 'rgba(168, 85, 247, 0.2)',
              borderRadius: '12px',
              padding: '1rem',
              border: '2px solid rgba(168, 85, 247, 0.4)'
            }}>
              {pulloutStudents.map(student => (
                <div key={student.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.5rem'
                }}>
                  <div style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    background: student.photo 
                      ? `url(${student.photo}) center/cover`
                      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    color: 'white'
                  }}>
                    {!student.photo && student.name.charAt(0)}
                  </div>
                  <span style={{ color: 'white', fontWeight: '500' }}>
                    {student.name}
                  </span>
                  <span style={{ 
                    color: 'rgba(255,255,255,0.7)', 
                    fontSize: '0.9rem',
                    marginLeft: 'auto'
                  }}>
                    Speech Therapy - 10:30 AM
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Special Events */}
        {specialEvents.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{
              fontSize: '1.3rem',
              color: 'white',
              marginBottom: '1rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              ⚠️ Special Events Today
            </h3>
            <div style={{
              background: 'rgba(245, 158, 11, 0.2)',
              borderRadius: '12px',
              padding: '1rem',
              border: '2px solid rgba(245, 158, 11, 0.4)'
            }}>
              {specialEvents.map((event, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.5rem'
                }}>
                  <span style={{ fontSize: '1.5rem' }}>{event.icon}</span>
                  <span style={{ color: 'white', fontWeight: '500' }}>
                    {event.name}
                  </span>
                  <span style={{ 
                    color: 'rgba(255,255,255,0.7)', 
                    fontSize: '0.9rem',
                    marginLeft: 'auto'
                  }}>
                    {event.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Ready Question */}
      {!showConfirmation && (
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '20px',
          padding: '2rem',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          <h3 style={{
            fontSize: '2rem',
            color: 'white',
            marginBottom: '2rem',
            fontWeight: '600'
          }}>
            Are we ready to start our day?
          </h3>
          
          <div style={{
            display: 'flex',
            gap: '2rem',
            justifyContent: 'center'
          }}>
            <button
              onClick={() => handleReadyChoice(true)}
              style={{
                background: 'linear-gradient(135deg, #10B981, #34D399)',
                border: 'none',
                borderRadius: '16px',
                color: 'white',
                padding: '1.5rem 3rem',
                fontSize: '1.5rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1) translateY(0)';
              }}
            >
              ✅ YES! We're Ready!
            </button>
            
            <button
              onClick={() => handleReadyChoice(false)}
              style={{
                background: 'linear-gradient(135deg, #EF4444, #F87171)',
                border: 'none',
                borderRadius: '16px',
                color: 'white',
                padding: '1.5rem 3rem',
                fontSize: '1.5rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 16px rgba(239, 68, 68, 0.4)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1) translateY(0)';
              }}
            >
              ❌ Not Yet...
            </button>
          </div>
        </div>
      )}

      {/* Confirmation */}
      {showConfirmation && isReady && (
        <div style={{
          background: 'linear-gradient(135deg, #10B981, #34D399)',
          borderRadius: '20px',
          padding: '2rem',
          maxWidth: '600px',
          margin: '0 auto',
          animation: 'celebration 1s ease-in-out'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
          <h3 style={{
            fontSize: '2rem',
            color: 'white',
            marginBottom: '1rem',
            fontWeight: '700'
          }}>
            Fantastic! Let's Begin Our Day!
          </h3>
          <p style={{
            fontSize: '1.2rem',
            color: 'white',
            marginBottom: '2rem',
            opacity: 0.9
          }}>
            Time to start our visual schedule and have an amazing day together!
          </p>
          
          <button
            onClick={handleConfirm}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: '2px solid white',
              borderRadius: '12px',
              color: 'white',
              padding: '1rem 2rem',
              fontSize: '1.3rem',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.color = '#10B981';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
              e.currentTarget.style.color = 'white';
            }}
          >
            🚀 Start Our Visual Schedule!
          </button>
        </div>
      )}

      {/* Not Ready Response */}
      {isReady === false && !showConfirmation && (
        <div style={{
          background: 'rgba(245, 158, 11, 0.2)',
          borderRadius: '16px',
          padding: '1.5rem',
          border: '2px solid rgba(245, 158, 11, 0.4)',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          <p style={{
            color: 'white',
            fontSize: '1.1rem',
            marginBottom: '1rem'
          }}>
            That's okay! Let's take a moment to prepare.
          </p>
          <button
            onClick={onBack}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: '2px solid rgba(255,255,255,0.5)',
              borderRadius: '8px',
              color: 'white',
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
            ← Go Back to Review
          </button>
        </div>
      )}

      <style>{`
        @keyframes celebration {
          0% { transform: scale(0.8) rotate(-5deg); opacity: 0; }
          50% { transform: scale(1.1) rotate(2deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default AreWeReady;
