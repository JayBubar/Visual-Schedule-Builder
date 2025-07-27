import React from 'react';
import { Activity } from '../../types';

interface TransitionDisplayProps {
  activity: Activity;
  nextActivity?: Activity;
  timeRemaining: number;
  onTimerControl: (action: 'play' | 'pause' | 'next' | 'reset' | 'previous') => void;
  isRunning: boolean;
  previousActivity?: Activity;
  activityIndex?: number;
  totalActivities?: number;
}

const TransitionDisplay: React.FC<TransitionDisplayProps> = ({
  activity,
  nextActivity,
  timeRemaining,
  onTimerControl,
  isRunning,
  previousActivity,
  activityIndex = 0,
  totalActivities = 1
}) => {

  // Get animation based on style
  const getTransitionAnimation = () => {
    switch (activity.animationStyle) {
      case 'running-kids':
        return (
          <div style={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            animation: 'runningKids 3s infinite linear',
            fontSize: '3rem',
            margin: '2rem 0',
            overflow: 'hidden'
          }}>
            <span style={{ animation: 'bounce 1s infinite' }}>🏃‍♀️</span>
            <span style={{ animation: 'bounce 1s infinite 0.2s' }}>🏃‍♂️</span>
            <span style={{ animation: 'bounce 1s infinite 0.4s' }}>🏃‍♀️</span>
            <span style={{ animation: 'bounce 1s infinite 0.6s' }}>🏃‍♂️</span>
            <span style={{ animation: 'bounce 1s infinite 0.8s' }}>🏃‍♀️</span>
          </div>
        );
      
      case 'floating-shapes':
        return (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '2rem',
            margin: '2rem 0'
          }}>
            {['🔵', '🔶', '🟢', '🔴', '⭐', '💙', '🌟'].map((shape, i) => (
              <span
                key={i}
                style={{
                  fontSize: '2.5rem',
                  animation: `float 2s infinite ease-in-out ${i * 0.3}s`,
                  display: 'inline-block'
                }}
              >
                {shape}
              </span>
            ))}
          </div>
        );
      
      case 'bouncing-balls':
        return (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem',
            margin: '2rem 0'
          }}>
            {['🏀', '⚽', '🏈', '🎾', '🏐', '⚾', '🎱'].map((ball, i) => (
              <span
                key={i}
                style={{
                  fontSize: '2.5rem',
                  animation: `bounce 0.8s infinite ${i * 0.1}s`,
                  display: 'inline-block'
                }}
              >
                {ball}
              </span>
            ))}
          </div>
        );

      case 'dancing-emojis':
        return (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1.5rem',
            margin: '2rem 0'
          }}>
            {['💃', '🕺', '💃', '🕺', '💃', '🕺'].map((dancer, i) => (
              <span
                key={i}
                style={{
                  fontSize: '2.5rem',
                  animation: `dance 1.5s infinite ${i * 0.2}s`,
                  display: 'inline-block'
                }}
              >
                {dancer}
              </span>
            ))}
          </div>
        );

      case 'organizing-items':
        return (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1.5rem',
            margin: '2rem 0'
          }}>
            {['📚', '✏️', '📝', '🗂️', '📋', '🎨'].map((item, i) => (
              <span
                key={i}
                style={{
                  fontSize: '2.5rem',
                  animation: `organize 2s infinite ${i * 0.3}s`,
                  display: 'inline-block'
                }}
              >
                {item}
              </span>
            ))}
          </div>
        );
      
      default:
        return (
          <div style={{
            textAlign: 'center',
            fontSize: '4rem',
            margin: '2rem 0',
            animation: 'pulse 2s infinite'
          }}>
            {activity.icon}
          </div>
        );
    }
  };

  // Get current movement prompt based on time
  const getCurrentMovementPrompt = () => {
    if (!activity.movementPrompts || activity.movementPrompts.length === 0) return null;
    
    const totalTime = activity.duration * 60;
    const promptInterval = Math.floor(totalTime / activity.movementPrompts.length);
    const elapsed = totalTime - timeRemaining;
    const currentPromptIndex = Math.floor(elapsed / promptInterval);
    const promptIndex = Math.min(currentPromptIndex, activity.movementPrompts.length - 1);
    
    return activity.movementPrompts[promptIndex];
  };

  // Format time display for transitions (shows minutes:seconds for under 10 minutes)
  const formatTransitionTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes === 0) {
      return `${remainingSeconds}s`;
    }
    
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Get background gradient based on transition type
  const getBackgroundGradient = () => {
    switch (activity.transitionType) {
      case 'brain-break':
        return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      case 'cleanup-prep':
        return 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
      case 'movement-break':
        return 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
      default:
        return 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)';
    }
  };

  return (
    <div style={{
      background: getBackgroundGradient(),
      color: 'white',
      borderRadius: '24px',
      padding: '2rem',
      textAlign: 'center',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
      minHeight: '70vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden'
    }}>
      
      {/* 🎯 Enhanced Progress Indicator */}
      <div style={{
        position: 'absolute',
        top: '1rem',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(255, 255, 255, 0.2)',
        borderRadius: '20px',
        padding: '0.5rem 1rem',
        fontSize: '0.9rem',
        fontWeight: '600'
      }}>
        Transition {activityIndex + 1} of {totalActivities}
      </div>

      {/* Transition Header */}
      <h1 style={{
        fontSize: '2.5rem',
        margin: '0 0 1rem 0',
        fontWeight: '700',
        textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
      }}>
        {activity.name}
      </h1>
      
      {/* Custom Message */}
      {activity.customMessage && (
        <p style={{
          fontSize: '1.3rem',
          margin: '0 0 2rem 0',
          opacity: 0.9,
          fontStyle: 'italic'
        }}>
          {activity.customMessage}
        </p>
      )}
      
      {/* Large Timer Display */}
      <div style={{
        fontSize: timeRemaining > 60 ? '4rem' : '5rem',
        fontWeight: '700',
        margin: '1rem 0',
        color: timeRemaining < 30 ? '#FFE082' : 'white',
        textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
        animation: timeRemaining < 10 ? 'pulse 1s infinite' : 'none'
      }}>
        {formatTransitionTime(timeRemaining)}
      </div>
      
      <p style={{ 
        fontSize: '1.2rem', 
        margin: '0 0 2rem 0', 
        opacity: 0.9 
      }}>
        {timeRemaining > 60 ? 'minutes remaining' : 'seconds remaining'}
      </p>

      {/* Animation */}
      {getTransitionAnimation()}

      {/* Movement Prompt */}
      {getCurrentMovementPrompt() && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '16px',
          padding: '1.5rem',
          margin: '2rem auto',
          fontSize: '1.4rem',
          fontWeight: '600',
          maxWidth: '500px',
          animation: 'fadeInScale 0.5s ease-out'
        }}>
          {getCurrentMovementPrompt()}
        </div>
      )}

      {/* Previous Activity Preview */}
      {previousActivity && activityIndex > 0 && (
        <div style={{
          position: 'absolute',
          top: '1rem',
          left: '1rem',
          background: 'rgba(255, 255, 255, 0.15)',
          borderRadius: '12px',
          padding: '0.75rem 1rem',
          fontSize: '0.85rem',
          maxWidth: '200px'
        }}>
          <p style={{ margin: '0 0 0.25rem 0', opacity: 0.8 }}>Previous:</p>
          <p style={{ 
            margin: '0', 
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}>
            <span>{previousActivity.icon}</span>
            <span style={{ fontSize: '0.8rem' }}>{previousActivity.name}</span>
          </p>
        </div>
      )}

      {/* Next Activity Preview */}
      {activity.showNextActivity && nextActivity && (
        <div style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          background: 'rgba(255, 255, 255, 0.15)',
          borderRadius: '12px',
          padding: '0.75rem 1rem',
          fontSize: '0.85rem',
          maxWidth: '200px'
        }}>
          <p style={{ margin: '0 0 0.25rem 0', opacity: 0.8 }}>Coming up:</p>
          <p style={{ 
            margin: '0', 
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}>
            <span>{nextActivity.icon}</span>
            <span style={{ fontSize: '0.8rem' }}>{nextActivity.name}</span>
          </p>
        </div>
      )}

      {/* Main Next Activity Preview (Center) */}
      {activity.showNextActivity && nextActivity && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.15)',
          borderRadius: '16px',
          padding: '1.5rem',
          margin: '2rem auto',
          maxWidth: '400px'
        }}>
          <p style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', opacity: 0.8 }}>
            Coming up next:
          </p>
          <p style={{ 
            margin: '0', 
            fontSize: '1.5rem', 
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}>
            <span style={{ fontSize: '2rem' }}>{nextActivity.icon}</span>
            {nextActivity.name}
          </p>
        </div>
      )}

      {/* 🎯 Enhanced Timer Controls with Previous Button */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        justifyContent: 'center',
        marginTop: '2rem',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        {/* Previous Button */}
        <button
          onClick={() => onTimerControl('previous')}
          disabled={activityIndex === 0}
          style={{
            padding: '12px 20px',
            border: 'none',
            borderRadius: '12px',
            fontWeight: '600',
            cursor: activityIndex === 0 ? 'not-allowed' : 'pointer',
            fontSize: '1.1rem',
            background: activityIndex === 0 
              ? 'rgba(255, 255, 255, 0.2)' 
              : 'linear-gradient(135deg, #6c757d 0%, #495057 100%)',
            opacity: activityIndex === 0 ? 0.5 : 1,
            color: 'white',
            boxShadow: activityIndex === 0 
              ? 'none' 
              : '0 4px 12px rgba(0, 0, 0, 0.2)',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          ⬅️ Previous
        </button>
        
        {/* Play/Pause Button */}
        <button
          onClick={() => onTimerControl(isRunning ? 'pause' : 'play')}
          style={{
            padding: '12px 24px',
            border: 'none',
            borderRadius: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '1.1rem',
            background: isRunning 
              ? 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)' 
              : 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)',
            color: 'white',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            transition: 'all 0.3s ease',
            transform: 'scale(1)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          {isRunning ? '⏸️ Pause' : '▶️ Start'}
        </button>
        
        {/* Reset Button */}
        <button
          onClick={() => onTimerControl('reset')}
          style={{
            padding: '12px 20px',
            border: 'none',
            borderRadius: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '1.1rem',
            background: 'linear-gradient(135deg, #6c757d 0%, #495057 100%)',
            color: 'white',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          🔄 Reset
        </button>
        
        {/* Next/Complete Button */}
        <button
          onClick={() => onTimerControl('next')}
          style={{
            padding: '12px 24px',
            border: 'none',
            borderRadius: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '1.1rem',
            background: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)',
            color: 'white',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          {activityIndex === totalActivities - 1 ? '🎉 Complete' : '⏭️ Next'}
        </button>
      </div>

      {/* 🎯 Enhanced CSS Animations */}
      <style>{`
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% {
            transform: translateY(0);
          }
          40%, 43% {
            transform: translateY(-30px);
          }
          70% {
            transform: translateY(-15px);
          }
          90% {
            transform: translateY(-4px);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          33% {
            transform: translateY(-20px) rotate(5deg);
          }
          66% {
            transform: translateY(-10px) rotate(-5deg);
          }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.8;
          }
        }

        @keyframes dance {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          25% {
            transform: translateY(-15px) rotate(-10deg);
          }
          50% {
            transform: translateY(-5px) rotate(10deg);
          }
          75% {
            transform: translateY(-20px) rotate(-5deg);
          }
        }

        @keyframes organize {
          0%, 100% {
            transform: translateX(0) scale(1);
          }
          50% {
            transform: translateX(10px) scale(1.1);
          }
        }

        @keyframes runningKids {
          0% {
            transform: translateX(-20px);
          }
          100% {
            transform: translateX(20px);
          }
        }

        @keyframes fadeInScale {
          0% {
            opacity: 0;
            transform: scale(0.8);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        /* Button hover effects */
        button:hover:not(:disabled) {
          transform: translateY(-2px) !important;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3) !important;
        }

        button:active:not(:disabled) {
          transform: translateY(0) !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2) !important;
        }
      `}</style>
    </div>
  );
};

export default TransitionDisplay;