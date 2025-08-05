import React, { useState, useEffect } from 'react';

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

  useEffect(() => {
    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Show animation after component mounts
    setTimeout(() => setShowAnimation(true), 500);

    return () => clearInterval(timer);
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

        {/* Greeting */}
        <h1 style={{
          fontSize: '3rem',
          fontWeight: '700',
          color: 'white',
          marginBottom: '1rem',
          textShadow: '0 4px 8px rgba(0,0