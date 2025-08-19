import React, { useState, useEffect } from 'react';
import UnifiedDataService from '../../services/unifiedDataService';

interface WelcomeScreenProps {
  currentDate: Date;
  teacherName?: string;
  schoolName?: string;
  onBegin: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  currentDate,
  teacherName = "Teacher",
  schoolName = "Our School",
  onBegin
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showAnimation, setShowAnimation] = useState(false);
  const [welcomeSettings, setWelcomeSettings] = useState<any>(null);

  useEffect(() => {
    // Load welcome settings from UnifiedDataService
    const settings = UnifiedDataService.getSettings();
    if (settings.morningMeeting?.welcomeSettings) {
      setWelcomeSettings(settings.morningMeeting.welcomeSettings);
    }

    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Show animation after component mounts
    setTimeout(() => setShowAnimation(true), 500);

    // Listen for settings changes
    const handleSettingsChange = (event: CustomEvent) => {
      const newSettings = event.detail;
      if (newSettings.morningMeeting?.welcomeSettings) {
        setWelcomeSettings(newSettings.morningMeeting.welcomeSettings);
      }
    };

    window.addEventListener('unifiedSettingsChanged', handleSettingsChange as EventListener);

    return () => {
      clearInterval(timer);
      window.removeEventListener('unifiedSettingsChanged', handleSettingsChange as EventListener);
    };
  }, []);

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
      second: '2-digit',
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
    const month = currentDate.getMonth() + 1;
    if (month >= 3 && month <= 5) return "🌸"; // Spring
    if (month >= 6 && month <= 8) return "☀️"; // Summer
    if (month >= 9 && month <= 11) return "🍂"; // Fall
    return "❄️"; // Winter
  };

  return (
    <div style={{
      padding: '3rem 2rem',
      textAlign: 'center',
      minHeight: '600px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '2rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Floating Background Elements */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '10%',
        fontSize: '3rem',
        opacity: 0.3,
        animation: 'float 6s ease-in-out infinite'
      }}>
        📚
      </div>
      <div style={{
        position: 'absolute',
        top: '20%',
        right: '15%',
        fontSize: '2.5rem',
        opacity: 0.3,
        animation: 'float 8s ease-in-out infinite 2s'
      }}>
        ✏️
      </div>
      <div style={{
        position: 'absolute',
        bottom: '15%',
        left: '20%',
        fontSize: '2rem',
        opacity: 0.3,
        animation: 'float 7s ease-in-out infinite 1s'
      }}>
        🎨
      </div>
      <div style={{
        position: 'absolute',
        bottom: '25%',
        right: '10%',
        fontSize: '2.5rem',
        opacity: 0.3,
        animation: 'float 9s ease-in-out infinite 3s'
      }}>
        🌟
      </div>

      {/* Main Welcome Content */}
      <div style={{
        background: 'rgba(255,255,255,0.15)',
        borderRadius: '30px',
        padding: '3rem',
        backdropFilter: 'blur(20px)',
        border: '2px solid rgba(255,255,255,0.2)',
        maxWidth: '700px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
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

        {/* Custom Welcome Message */}
        {welcomeSettings?.customWelcomeMessage && (
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: '600',
              color: 'white',
              margin: 0,
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}>
              {welcomeSettings.customWelcomeMessage}
            </h2>
          </div>
        )}

        {/* Teacher Name */}
        {welcomeSettings?.teacherName && (
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            color: 'white',
            marginBottom: '1rem',
            textShadow: '0 4px 8px rgba(0,0,0,0.3)',
            lineHeight: '1.2'
          }}>
            {welcomeSettings.teacherName}
          </h1>
        )}

        {/* School Name */}
        {welcomeSettings?.schoolName && (
          <div style={{
            fontSize: '1.5rem',
            color: 'rgba(255,255,255,0.9)',
            marginBottom: '1rem',
            fontWeight: '500'
          }}>
            <p style={{ margin: 0 }}>
              {welcomeSettings.schoolName}
            </p>
          </div>
        )}

        {/* Class Name */}
        {welcomeSettings?.className && (
          <div style={{
            fontSize: '1.3rem',
            color: 'rgba(255,255,255,0.8)',
            marginBottom: '2rem',
            fontWeight: '500'
          }}>
            <p style={{ margin: 0 }}>
              {welcomeSettings.className}
            </p>
          </div>
        )}

        {/* Substitute Mode Message */}
        {welcomeSettings?.substituteMode && welcomeSettings?.substituteMessage && (
          <div style={{
            background: 'rgba(255, 193, 7, 0.2)',
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '2rem',
            border: '2px solid rgba(255, 193, 7, 0.4)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👋</div>
            <p style={{
              fontSize: '1.2rem',
              fontWeight: '600',
              color: 'white',
              margin: 0,
              lineHeight: '1.3'
            }}>
              {welcomeSettings.substituteMessage}
            </p>
          </div>
        )}

        {/* Date and Time */}
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '2rem',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <div style={{
            fontSize: '1.8rem',
            fontWeight: '600',
            color: 'white',
            marginBottom: '0.5rem'
          }}>
            📅 {formatDate(currentDate)}
          </div>
          <div style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            color: 'white',
            fontFamily: 'monospace',
            letterSpacing: '2px'
          }}>
            🕐 {formatTime(currentTime)}
          </div>
        </div>

        {/* Daily Motivation */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.3), rgba(16, 185, 129, 0.3))',
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '2rem',
          border: '2px solid rgba(34, 197, 94, 0.4)'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💪</div>
          <p style={{
            fontSize: '1.4rem',
            fontWeight: '600',
            color: 'white',
            margin: 0,
            lineHeight: '1.3'
          }}>
            {getDayMotivation()}
          </p>
        </div>


        {/* Ready to Begin Button */}
        <button
          onClick={onBegin}
          style={{
            background: 'linear-gradient(135deg, #ff6b6b, #feca57)',
            border: 'none',
            borderRadius: '20px',
            color: 'white',
            padding: '1.5rem 3rem',
            fontSize: '1.5rem',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.4s ease',
            boxShadow: '0 8px 25px rgba(255, 107, 107, 0.4)',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            transform: 'translateY(0)',
            animation: 'glow 2s ease-in-out infinite alternate'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px) scale(1.05)';
            e.currentTarget.style.boxShadow = '0 15px 35px rgba(255, 107, 107, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(255, 107, 107, 0.4)';
          }}
        >
          🚀 Let's Begin Our Day! 🚀
        </button>

        {/* Encouragement Text */}
        <p style={{
          fontSize: '1rem',
          color: 'rgba(255,255,255,0.7)',
          marginTop: '1.5rem',
          fontStyle: 'italic'
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

export default WelcomeScreen;
