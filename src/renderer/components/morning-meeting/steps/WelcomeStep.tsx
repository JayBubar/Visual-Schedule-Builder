import React, { useState, useEffect } from 'react';
import { MorningMeetingStepProps, WelcomeStepData } from '../types/morningMeetingTypes';

const WelcomeStep: React.FC<MorningMeetingStepProps> = ({
  currentDate,
  onNext,
  onDataUpdate,
  stepData,
  hubSettings
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showAnimation, setShowAnimation] = useState(false);
  const [autoAdvanceTimer, setAutoAdvanceTimer] = useState<NodeJS.Timeout | null>(null);

  // Get personalization from hub settings
  const schoolName = hubSettings?.welcomePersonalization?.schoolName || 'Our School';
  const teacherName = hubSettings?.welcomePersonalization?.teacherName || 'Teacher';
  const className = hubSettings?.welcomePersonalization?.className || '';
  const customMessage = hubSettings?.welcomePersonalization?.customMessage || '';

  useEffect(() => {
    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Show animation after component mounts
    setTimeout(() => setShowAnimation(true), 500);

    // Auto-advance after 8 seconds (configurable)
    const autoTimer = setTimeout(() => {
      handleNext();
    }, 8000);

    setAutoAdvanceTimer(autoTimer);

    // Save step data on mount
    const stepData: WelcomeStepData = {
      personalizedMessage: getWelcomeMessage(),
      viewedAt: new Date(),
      completedAt: new Date()
    };
    onDataUpdate(stepData);

    return () => {
      clearInterval(timer);
      if (autoTimer) clearTimeout(autoTimer);
    };
  }, []);

  const handleNext = () => {
    if (autoAdvanceTimer) {
      clearTimeout(autoAdvanceTimer);
      setAutoAdvanceTimer(null);
    }
    onNext();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const getDayMotivation = () => {
    const dayOfWeek = currentDate.getDay();
    const motivations = [
      "Ready for a fresh week of learning!", // Sunday
      "Monday Motivation - Let's make it amazing!", // Monday
      "Tuesday Teamwork - Together we shine!", // Tuesday
      "Wednesday Wisdom - Learning something new!", // Wednesday
      "Thursday Thinking - Growing our minds!", // Thursday
      "Friday Fun - Let's finish strong!", // Friday
      "Saturday Smiles - Every day is special!" // Saturday
    ];
    return motivations[dayOfWeek];
  };

  const getSeasonalIcon = () => {
    const month = currentDate.getMonth();
    if (month >= 2 && month <= 4) return '🌸'; // Spring
    if (month >= 5 && month <= 7) return '☀️'; // Summer
    if (month >= 8 && month <= 10) return '🍂'; // Fall
    return '❄️'; // Winter
  };

  const getWelcomeMessage = () => {
    if (customMessage) {
      return customMessage;
    }
    return `Welcome to ${className ? `${className} at ` : ''}${schoolName}!`;
  };

  const getSeasonalColors = () => {
    const month = currentDate.getMonth();
    if (month >= 2 && month <= 4) return ['#90EE90', '#98FB98']; // Spring - greens
    if (month >= 5 && month <= 7) return ['#FFD700', '#FF6347']; // Summer - yellows/oranges
    if (month >= 8 && month <= 10) return ['#FF8C00', '#DC143C']; // Fall - oranges/reds
    return ['#87CEEB', '#4682B4']; // Winter - blues
  };

  const seasonalColors = getSeasonalColors();

  return (
    <div style={{
      height: '100%',
      width: '100%',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: `linear-gradient(135deg, ${seasonalColors[0]}, ${seasonalColors[1]})`,
      position: 'relative'
    }}>
      {/* Floating Background Elements */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '15%',
        fontSize: '3rem',
        opacity: 0.3,
        animation: 'float 6s ease-in-out infinite'
      }}>
        🌟
      </div>
      <div style={{
        position: 'absolute',
        top: '20%',
        right: '20%',
        fontSize: '2.5rem',
        opacity: 0.3,
        animation: 'float 8s ease-in-out infinite reverse'
      }}>
        📚
      </div>
      <div style={{
        position: 'absolute',
        bottom: '15%',
        left: '10%',
        fontSize: '2rem',
        opacity: 0.3,
        animation: 'float 7s ease-in-out infinite'
      }}>
        ✨
      </div>

      {/* Main Content */}
      <div style={{
        textAlign: 'center',
        color: 'white',
        zIndex: 10,
        maxWidth: '800px',
        padding: '2rem',
        transform: showAnimation ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.95)',
        opacity: showAnimation ? 1 : 0,
        transition: 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      }}>
        {/* Seasonal Icon */}
        <div style={{
          fontSize: '4rem',
          marginBottom: '1rem',
          animation: 'bounce 2s ease-in-out infinite'
        }}>
          {getSeasonalIcon()}
        </div>

        {/* Greeting */}
        <h1 style={{
          fontSize: '3rem',
          fontWeight: '700',
          marginBottom: '1rem',
          textShadow: '0 4px 8px rgba(0,0,0,0.3)',
          lineHeight: '1.2'
        }}>
          {getGreeting()}!
        </h1>

        {/* Custom Welcome Message */}
        {(customMessage || schoolName) && (
          <div style={{
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            border: '1px solid rgba(255,255,255,0.3)',
            backdropFilter: 'blur(10px)'
          }}>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: '600',
              color: 'white',
              margin: 0,
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}>
              {getWelcomeMessage()}
            </h2>
          </div>
        )}

        {/* Teacher Name */}
        {teacherName && teacherName !== 'Teacher' && (
          <div style={{
            fontSize: '1.5rem',
            color: 'rgba(255,255,255,0.9)',
            marginBottom: '1rem',
            fontWeight: '500'
          }}>
            with {teacherName}
          </div>
        )}

        {/* Class Name */}
        {className && (
          <div style={{
            fontSize: '1.3rem',
            color: 'rgba(255,255,255,0.8)',
            marginBottom: '2rem',
            fontWeight: '400'
          }}>
            {className}
          </div>
        )}

        {/* Date and Time Display */}
        <div style={{
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '20px',
          padding: '1.5rem',
          marginBottom: '2rem',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.3)'
        }}>
          <div style={{
            fontSize: '1.8rem',
            fontWeight: '600',
            marginBottom: '0.5rem',
            color: 'white'
          }}>
            {formatDate(currentDate)}
          </div>
          <div style={{
            fontSize: '1.4rem',
            color: 'rgba(255,255,255,0.9)',
            fontWeight: '500'
          }}>
            {formatTime(currentTime)}
          </div>
        </div>

        {/* Daily Motivation */}
        <div style={{
          background: 'rgba(255,255,255,0.15)',
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '2rem',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <p style={{
            fontSize: '1.3rem',
            color: 'white',
            margin: 0,
            fontWeight: '500',
            lineHeight: '1.4'
          }}>
            {getDayMotivation()}
          </p>
        </div>

        {/* Begin Button */}
        <button
          onClick={handleNext}
          style={{
            background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
            border: 'none',
            borderRadius: '25px',
            color: 'white',
            padding: '1.5rem 3rem',
            fontSize: '1.5rem',
            fontWeight: '700',
            cursor: 'pointer',
            boxShadow: '0 8px 25px rgba(255, 107, 107, 0.4)',
            transition: 'all 0.3s ease',
            animation: 'glow 2s ease-in-out infinite alternate',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 12px 35px rgba(255, 107, 107, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1) translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(255, 107, 107, 0.4)';
          }}
        >
          Let's Begin Our Day! 🚀
        </button>

        {/* Auto-advance indicator */}
        <p style={{
          fontSize: '0.9rem',
          color: 'rgba(255,255,255,0.7)',
          marginTop: '1.5rem',
          fontStyle: 'italic'
        }}>
          Starting automatically in a few seconds...
        </p>

        {/* Encouragement Text */}
        <p style={{
          fontSize: '1rem',
          color: 'rgba(255,255,255,0.8)',
          marginTop: '1rem',
          fontStyle: 'italic',
          lineHeight: '1.4'
        }}>
          "Every day is a fresh start to learn, grow, and shine together!"
        </p>
      </div>

      {/* Animated CSS */}
      <style>{`
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg); 
          }
          33% { 
            transform: translateY(-10px) rotate(5deg); 
          }
          66% { 
            transform: translateY(-5px) rotate(-3deg); 
          }
        }

        @keyframes bounce {
          0%, 100% { 
            transform: translateY(0); 
          }
          50% { 
            transform: translateY(-10px); 
          }
        }

        @keyframes glow {
          from {
            box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4);
          }
          to {
            box-shadow: 0 8px 25px rgba(255, 107, 107, 0.8), 0 0 30px rgba(255, 107, 107, 0.3);
          }
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default WelcomeStep;