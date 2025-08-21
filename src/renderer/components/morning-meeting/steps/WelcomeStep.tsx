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
    return 'Welcome to Our Classroom! 🌈';
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

  // SIMPLIFIED FIX - Only update once when showGreeting becomes true
  useEffect(() => {
    if (showGreeting) {
      const stepData = {
        welcomeMessage,
        classInfo,
        showedGreeting: showGreeting,
        completedAt: new Date()
      };
      onDataUpdate(stepData);
    }
  }, [showGreeting]); // Only depend on showGreeting

  // Format date for display
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // CSS for sparkle animation
  const sparkleStyles = `
    @keyframes sparkleFloat {
      0%, 100% { 
        transform: translateY(0) rotate(0deg);
        opacity: 0;
      }
      10%, 90% {
        opacity: 1;
      }
      50% { 
        transform: translateY(-30px) rotate(180deg);
        opacity: 0.8;
      }
    }
    
    @keyframes gradientShift {
      0%, 100% { filter: hue-rotate(0deg) brightness(1.1); }
      25% { filter: hue-rotate(10deg) brightness(1.2); }
      50% { filter: hue-rotate(-10deg) brightness(1.1); }
      75% { filter: hue-rotate(5deg) brightness(1.15); }
    }
    
    @keyframes bounceIn {
      0% {
        transform: scale(0.5) translateY(50px);
        opacity: 0;
      }
      60% {
        transform: scale(1.1) translateY(-10px);
        opacity: 0.9;
      }
      100% {
        transform: scale(1) translateY(0);
        opacity: 1;
      }
    }
    
    @keyframes titleGlow {
      0% { text-shadow: 0 0 20px rgba(255,255,255,0.5), 0 8px 16px rgba(0,0,0,0.3); }
      100% { text-shadow: 0 0 30px rgba(255,255,255,0.8), 0 8px 16px rgba(0,0,0,0.3); }
    }
    
    @keyframes cardFloat {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    
    @keyframes buttonPulse {
      0%, 100% { 
        transform: scale(1);
        box-shadow: 0 10px 30px rgba(255, 107, 53, 0.4);
      }
      50% { 
        transform: scale(1.05);
        box-shadow: 0 15px 40px rgba(255, 107, 53, 0.6);
      }
    }
  `;

  return (
    <>
      {/* Inject CSS animations */}
      <style>{sparkleStyles}</style>
      
      <div style={{
        height: '100%',
        background: 'linear-gradient(135deg, #FF6B35 0%, #FF8E9B 25%, #C8A8E9 50%, #87CEEB 75%, #98FB98 100%)',
        animation: 'gradientShift 15s ease-in-out infinite',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: '2rem',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Floating sparkles */}
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: '1.5rem',
          animation: 'sparkleFloat 6s ease-in-out infinite',
          pointerEvents: 'none',
          animationDelay: '0s'
        }}>✨</div>
        <div style={{
          position: 'absolute',
          top: '30%',
          right: '15%',
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: '1.5rem',
          animation: 'sparkleFloat 6s ease-in-out infinite',
          pointerEvents: 'none',
          animationDelay: '1s'
        }}>🌟</div>
        <div style={{
          position: 'absolute',
          top: '60%',
          left: '20%',
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: '1.5rem',
          animation: 'sparkleFloat 6s ease-in-out infinite',
          pointerEvents: 'none',
          animationDelay: '2s'
        }}>⭐</div>
        <div style={{
          position: 'absolute',
          top: '70%',
          right: '25%',
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: '1.5rem',
          animation: 'sparkleFloat 6s ease-in-out infinite',
          pointerEvents: 'none',
          animationDelay: '3s'
        }}>💫</div>
        <div style={{
          position: 'absolute',
          top: '40%',
          left: '80%',
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: '1.5rem',
          animation: 'sparkleFloat 6s ease-in-out infinite',
          pointerEvents: 'none',
          animationDelay: '4s'
        }}>🌈</div>
        <div style={{
          position: 'absolute',
          top: '80%',
          right: '70%',
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: '1.5rem',
          animation: 'sparkleFloat 6s ease-in-out infinite',
          pointerEvents: 'none',
          animationDelay: '5s'
        }}>🎉</div>

        {/* Date display - top right corner, smaller and moved left */}
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '120px', // Moved left to avoid red X
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '12px',
          padding: '0.6rem 0.8rem', // 20% smaller
          backdropFilter: 'blur(10px)',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          fontSize: '0.8rem', // 20% smaller
          fontWeight: '600',
          color: 'white',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)',
          zIndex: 10
        }}>
          {formatDate(currentDate)}
        </div>

        {/* Welcome Animation */}
        <div style={{
          transform: showGreeting ? 'scale(1) translateY(0)' : 'scale(0.8) translateY(20px)',
          opacity: showGreeting ? 1 : 0,
          transition: 'all 1.5s ease-out',
          maxWidth: '900px',
          width: '100%',
          animation: showGreeting ? 'bounceIn 1.5s ease-out' : 'none'
        }}>
          {/* Main Welcome Message */}
          <h1 style={{
            fontFamily: "'Comic Sans MS', 'Trebuchet MS', cursive",
            fontSize: 'clamp(3rem, 10vw, 6rem)',
            fontWeight: '700',
            color: 'white',
            marginBottom: '2rem',
            textShadow: '0 0 20px rgba(255,255,255,0.5), 0 8px 16px rgba(0,0,0,0.3)',
            lineHeight: 1.1,
            animation: 'titleGlow 3s ease-in-out infinite alternate'
          }}>
            {welcomeMessage}
          </h1>

          {/* Class Information */}
          {(classInfo.schoolName || classInfo.className || classInfo.teacherName) && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.25)',
              borderRadius: '25px',
              padding: '2.5rem',
              backdropFilter: 'blur(15px)',
              border: '3px solid rgba(255, 255, 255, 0.4)',
              marginBottom: '3rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
              animation: 'cardFloat 4s ease-in-out infinite'
            }}>
              {classInfo.schoolName && (
                <h2 style={{
                  fontFamily: "'Comic Sans MS', 'Trebuchet MS', cursive",
                  fontSize: 'clamp(2rem, 6vw, 3.5rem)',
                  fontWeight: '700',
                  color: 'white',
                  marginBottom: '1rem',
                  textShadow: '0 4px 8px rgba(0,0,0,0.3)'
                }}>
                  {classInfo.schoolName} 🌞
                </h2>
              )}
              
              {classInfo.className && (
                <h3 style={{
                  fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
                  fontWeight: '700',
                  color: 'rgba(255,255,255,0.95)',
                  marginBottom: '0.5rem',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}>
                  {classInfo.className}
                </h3>
              )}
              
              {classInfo.teacherName && (
                <p style={{
                  fontSize: 'clamp(1.2rem, 3vw, 2rem)',
                  fontWeight: '600',
                  color: 'rgba(255,255,255,0.9)',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}>
                  with {classInfo.teacherName} - Ready for an amazing day together! 💫
                </p>
              )}
            </div>
          )}

          {/* Start button */}
          <button
            onClick={() => {
              console.log('🎉 WelcomeStep - Let\'s Start Our Day button clicked!');
              // Add celebration effect here if needed
            }}
            style={{
              background: 'linear-gradient(135deg, #FF6B35, #FF8E9B)',
              border: '4px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '25px',
              color: 'white',
              padding: '2rem 4rem',
              fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
              fontWeight: '700',
              fontFamily: "'Comic Sans MS', 'Trebuchet MS', cursive",
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 10px 30px rgba(255, 107, 53, 0.4)',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              marginBottom: '3rem',
              animation: 'buttonPulse 2s ease-in-out infinite',
              minHeight: '80px' // Touch-friendly for small hands
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1) translateY(-5px)';
              e.currentTarget.style.background = 'linear-gradient(135deg, #FF8E9B, #C8A8E9)';
              e.currentTarget.style.boxShadow = '0 20px 50px rgba(255, 107, 53, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1) translateY(0)';
              e.currentTarget.style.background = 'linear-gradient(135deg, #FF6B35, #FF8E9B)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(255, 107, 53, 0.4)';
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'scale(1.1) translateY(-5px)';
            }}
          >
            Let's Start Our Day! 🚀
          </button>
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
          background: 'rgba(0, 0, 0, 0.6)',
          borderRadius: '20px',
          padding: '1rem 2rem',
          backdropFilter: 'blur(10px)',
          border: '2px solid rgba(255, 255, 255, 0.2)'
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
              transition: 'all 0.3s ease',
              minHeight: '60px' // Touch-friendly
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.background = 'rgba(156, 163, 175, 1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.background = 'rgba(156, 163, 175, 0.8)';
            }}
          >
            ← Back
          </button>
          
          <button
            onClick={onNext}
            style={{
              background: 'rgba(34, 197, 94, 0.9)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              padding: '1rem 2rem',
              fontSize: '1rem',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              minHeight: '60px' // Touch-friendly
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(34, 197, 94, 1)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(34, 197, 94, 0.9)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            Welcome Complete! →
          </button>
        </div>
      </div>
    </>
  );
};

export default WelcomeStep;