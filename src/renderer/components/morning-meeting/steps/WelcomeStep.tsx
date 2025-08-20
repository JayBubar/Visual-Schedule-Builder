import React, { useState, useEffect, useCallback } from 'react';
import { MorningMeetingStepProps } from '../types/morningMeetingTypes';

const WelcomeStep: React.FC<MorningMeetingStepProps> = ({
  currentDate,
  onNext,
  onBack,
  onDataUpdate,
  stepData,
  hubSettings,
  students = []
}) => {
  const [showGreeting, setShowGreeting] = useState(false);

  // Get custom welcome message from hub settings
  const getWelcomeMessage = (): string => {
    if (hubSettings?.welcomePersonalization?.customMessage) {
      return hubSettings.welcomePersonalization.customMessage;
    }
    return 'Welcome to Our Classroom!';
  };

  // Get school/class info from hub settings
  const getClassInfo = () => {
    return {
      schoolName: hubSettings?.welcomePersonalization?.schoolName || '',
      teacherName: hubSettings?.welcomePersonalization?.teacherName || '',
      className: hubSettings?.welcomePersonalization?.className || ''
    };
  };

  const welcomeMessage = getWelcomeMessage();
  const classInfo = getClassInfo();

  useEffect(() => {
    console.log('👋 DEBUG WelcomeStep hubSettings:', hubSettings);
    console.log('👋 DEBUG Welcome message:', hubSettings?.welcomePersonalization?.customMessage);
  }, [hubSettings]);

  useEffect(() => {
    // Auto-start greeting animation
    const timer = setTimeout(() => {
      setShowGreeting(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  // FIX: Use useCallback to memoize onDataUpdate and prevent infinite loops
  const handleDataUpdate = useCallback(() => {
    const stepData = {
      welcomeMessage,
      classInfo,
      showedGreeting: showGreeting,
      completedAt: showGreeting ? new Date() : undefined
    };
    onDataUpdate(stepData);
  }, [welcomeMessage, classInfo, showGreeting, onDataUpdate]);

  // FIX: Only call onDataUpdate when showGreeting changes to true (completion)
  useEffect(() => {
    if (showGreeting) {
      handleDataUpdate();
    }
  }, [showGreeting, handleDataUpdate]);

  return (
    <div style={{
      height: '100%',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      padding: '2rem',
      overflow: 'hidden'
    }}>
      {/* Welcome Animation */}
      <div style={{
        transform: showGreeting ? 'scale(1) translateY(0)' : 'scale(0.8) translateY(20px)',
        opacity: showGreeting ? 1 : 0,
        transition: 'all 1s ease-out',
        maxWidth: '800px'
      }}>
        {/* Main Welcome Message */}
        <h1 style={{
          fontSize: 'clamp(2.5rem, 8vw, 5rem)',
          fontWeight: '700',
          color: 'white',
          marginBottom: '2rem',
          textShadow: '0 4px 8px rgba(0,0,0,0.3)',
          lineHeight: 1.2
        }}>
          {welcomeMessage}
        </h1>

        {/* Class Information */}
        {(classInfo.schoolName || classInfo.className || classInfo.teacherName) && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.15)',
            borderRadius: '20px',
            padding: '2rem',
            backdropFilter: 'blur(10px)',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            marginBottom: '3rem'
          }}>
            {classInfo.schoolName && (
              <h2 style={{
                fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
                fontWeight: '600',
                color: 'white',
                marginBottom: '1rem'
              }}>
                {classInfo.schoolName}
              </h2>
            )}
            
            {classInfo.className && (
              <h3 style={{
                fontSize: 'clamp(1.2rem, 3vw, 2rem)',
                fontWeight: '500',
                color: 'rgba(255,255,255,0.9)',
                marginBottom: '0.5rem'
              }}>
                {classInfo.className}
              </h3>
            )}
            
            {classInfo.teacherName && (
              <p style={{
                fontSize: 'clamp(1rem, 2.5vw, 1.5rem)',
                color: 'rgba(255,255,255,0.8)'
              }}>
                with {classInfo.teacherName}
              </p>
            )}
          </div>
        )}

        {/* Date Display */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '3rem',
          backdropFilter: 'blur(10px)',
          border: '2px solid rgba(255, 255, 255, 0.2)'
        }}>
          <p style={{
            fontSize: 'clamp(1.2rem, 3vw, 2rem)',
            fontWeight: '600',
            color: 'white',
            marginBottom: '0.5rem'
          }}>
            📅 Today is
          </p>
          <p style={{
            fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
            fontWeight: '700',
            color: 'white'
          }}>
            {currentDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        {/* Student Count */}
        {students.length > 0 && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '3rem',
            backdropFilter: 'blur(10px)',
            border: '2px solid rgba(255, 255, 255, 0.2)'
          }}>
            <p style={{
              fontSize: 'clamp(1.2rem, 3vw, 1.8rem)',
              color: 'white',
              fontWeight: '600'
            }}>
              👥 We have {students.filter((s: any) => s.present === true).length} students here today!
            </p>
          </div>
        )}

        {/* Continue Button */}
        {showGreeting && (
          <button
            onClick={onNext}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: '3px solid rgba(255, 255, 255, 0.4)',
              borderRadius: '20px',
              color: 'white',
              padding: '1.5rem 3rem',
              fontSize: 'clamp(1.2rem, 3vw, 1.8rem)',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            Let's Start Our Day! →
          </button>
        )}
      </div>

      {/* Always visible navigation buttons */}
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
          Welcome Complete! →
        </button>
      </div>
    </div>
  );
};

export default WelcomeStep;