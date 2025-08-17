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
            fontSize: 'clamp(2rem, 4vw, 4rem)',
            margin: '1rem 0',
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
            gap: 'clamp(1rem, 3vw, 2rem)',
            margin: '1rem 0'
          }}>
            {['🔵', '🔶', '🟢', '🔴', '⭐', '💙', '🌟'].map((shape, i) => (
              <span
                key={i}
                style={{
                  fontSize: 'clamp(1.5rem, 3vw, 3rem)',
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
            gap: 'clamp(0.5rem, 2vw, 1rem)',
            margin: '1rem 0'
          }}>
            {['🏀', '⚽', '🏈', '🎾', '🏐', '⚾', '🎱'].map((ball, i) => (
              <span
                key={i}
                style={{
                  fontSize: 'clamp(1.5rem, 3vw, 3rem)',
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
            gap: 'clamp(0.75rem, 2.5vw, 1.5rem)',
            margin: '1rem 0'
          }}>
            {['💃', '🕺', '💃', '🕺', '💃', '🕺'].map((dancer, i) => (
              <span
                key={i}
                style={{
                  fontSize: 'clamp(1.5rem, 3vw, 3rem)',
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
            gap: 'clamp(0.75rem, 2.5vw, 1.5rem)',
            margin: '1rem 0'
          }}>
            {['📚', '✏️', '📐', '🗂️', '📋', '🎨'].map((item, i) => (
              <span
                key={i}
                style={{
                  fontSize: 'clamp(1.5rem, 3vw, 3rem)',
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
            fontSize: 'clamp(3rem, 8vw, 6rem)',
            margin: '1rem 0',
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
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      padding: 'clamp(1rem, 3vw, 2rem)'
    }}>
      
      {/* 🎯 Enhanced Progress Indicator */}
      <div style={{
        position: 'absolute',
        top: 'clamp(1rem, 3vh, 2rem)',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(255, 255, 255, 0.2)',
        borderRadius: '20px',
        padding: 'clamp(0.5rem, 1.5vw, 1rem)',
        fontSize: 'clamp(0.8rem, 1.5vw, 1rem)',
        fontWeight: '600',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.3)'
      }}>
        Transition {activityIndex + 1} of {totalActivities}
      </div>

      {/* Main Content Container - Centered and Responsive */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        flex: 1,
        width: '100%',
        maxWidth: '90vw',
        gap: 'clamp(1rem, 3vh, 2rem)'
      }}>

        {/* Transition Header */}
        <h1 style={{
          fontSize: 'clamp(1.8rem, 4vw, 3rem)',
          margin: '0',
          fontWeight: '700',
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
          lineHeight: '1.2'
        }}>
          {activity.name}
        </h1>
        
        {/* Custom Message */}
        {activity.customMessage && (
          <p style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.5rem)',
            margin: '0',
            opacity: 0.9,
            fontStyle: 'italic',
            maxWidth: '80%',
            lineHeight: '1.4'
          }}>
            {activity.customMessage}
          </p>
        )}
        
        {/* Large Timer Display */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'clamp(0.5rem, 2vh, 1rem)'
        }}>
          <div style={{
            fontSize: timeRemaining > 60 ? 'clamp(3rem, 8vw, 6rem)' : 'clamp(3.5rem, 10vw, 7rem)',
            fontWeight: '700',
            color: timeRemaining < 30 ? '#FFE082' : 'white',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
            animation: timeRemaining < 10 ? 'pulse 1s infinite' : 'none',
            fontFamily: '"Courier New", monospace',
            letterSpacing: '0.1em',
            lineHeight: '1'
          }}>
            {formatTransitionTime(timeRemaining)}
          </div>
          
          <p style={{ 
            fontSize: 'clamp(0.9rem, 2vw, 1.2rem)', 
            margin: '0', 
            opacity: 0.9,
            fontWeight: '500'
          }}>
            {timeRemaining > 60 ? 'minutes remaining' : 'seconds remaining'}
          </p>
        </div>

        {/* Animation */}
        <div style={{
          width: '100%',
          maxWidth: '600px',
          display: 'flex',
          justifyContent: 'center'
        }}>
          {getTransitionAnimation()}
        </div>

        {/* Movement Prompt */}
        {getCurrentMovementPrompt() && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '16px',
            padding: 'clamp(1rem, 2.5vw, 1.5rem)',
            fontSize: 'clamp(1rem, 2.5vw, 1.4rem)',
            fontWeight: '600',
            maxWidth: '80%',
            animation: 'fadeInScale 0.5s ease-out',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            lineHeight: '1.3',
            textAlign: 'center'
          }}>
            {getCurrentMovementPrompt()}
          </div>
        )}
      </div>

      {/* Previous Activity Preview */}
      {previousActivity && activityIndex > 0 && (
        <div style={{
          position: 'absolute',
          top: 'clamp(1rem, 3vh, 2rem)',
          left: 'clamp(1rem, 3vw, 2rem)',
          background: 'rgba(255, 255, 255, 0.15)',
          borderRadius: '12px',
          padding: 'clamp(0.5rem, 1.5vw, 0.75rem)',
          fontSize: 'clamp(0.7rem, 1.2vw, 0.85rem)',
          maxWidth: 'clamp(150px, 25vw, 200px)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.3)'
        }}>
          <p style={{ margin: '0 0 0.25rem 0', opacity: 0.8, fontSize: '0.9em' }}>Previous:</p>
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            fontWeight: '600'
          }}>
            <span style={{ fontSize: '1.2em' }}>{previousActivity.icon}</span>
            <span style={{ 
              fontSize: '0.8em',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {previousActivity.name}
            </span>
          </div>
        </div>
      )}

      {/* Next Activity Preview */}
      {activity.showNextActivity && nextActivity && (
        <div style={{
          position: 'absolute',
          top: 'clamp(1rem, 3vh, 2rem)',
          right: 'clamp(1rem, 3vw, 2rem)',
          background: 'rgba(255, 255, 255, 0.15)',
          borderRadius: '12px',
          padding: 'clamp(0.5rem, 1.5vw, 0.75rem)',
          fontSize: 'clamp(0.7rem, 1.2vw, 0.85rem)',
          maxWidth: 'clamp(150px, 25vw, 200px)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.3)'
        }}>
          <p style={{ margin: '0 0 0.25rem 0', opacity: 0.8, fontSize: '0.9em' }}>Coming up:</p>
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            fontWeight: '600'
          }}>
            <span style={{ fontSize: '1.2em' }}>{nextActivity.icon}</span>
            <span style={{ 
              fontSize: '0.8em',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {nextActivity.name}
            </span>
          </div>
        </div>
      )}

      {/* Main Next Activity Preview (Center Bottom) */}
      {activity.showNextActivity && nextActivity && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.15)',
          borderRadius: '16px',
          padding: 'clamp(1rem, 2.5vw, 1.5rem)',
          maxWidth: 'clamp(300px, 60vw, 400px)',
          width: '100%',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          textAlign: 'center',
          position: 'absolute',
          bottom: 'clamp(7rem, 15vh, 10rem)',
          left: '50%',
          transform: 'translateX(-50%)'
        }}>
          <p style={{ 
            margin: '0 0 0.5rem 0', 
            fontSize: 'clamp(0.8rem, 1.5vw, 1rem)', 
            opacity: 0.8 
          }}>
            Coming up next:
          </p>
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'clamp(0.5rem, 2vw, 1rem)',
            fontWeight: '600',
            fontSize: 'clamp(1rem, 2.5vw, 1.5rem)'
          }}>
            <span style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>{nextActivity.icon}</span>
            <span style={{ 
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flex: 1
            }}>
              {nextActivity.name}
            </span>
          </div>
        </div>
      )}

      {/* Timer Controls - Fixed Bottom Position */}
      <div style={{
        position: 'absolute',
        bottom: 'clamp(1rem, 3vh, 2rem)',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: 'clamp(0.5rem, 2vw, 1rem)',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        maxWidth: '90vw'
      }}>
        {/* Previous Button */}
        <button
          onClick={() => onTimerControl('previous')}
          disabled={activityIndex === 0}
          style={{
            padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1rem, 2.5vw, 1.5rem)',
            border: 'none',
            borderRadius: '12px',
            fontWeight: '600',
            cursor: activityIndex === 0 ? 'not-allowed' : 'pointer',
            fontSize: 'clamp(0.8rem, 1.5vw, 1rem)',
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
            gap: '0.5rem',
            backdropFilter: 'blur(10px)',
            minHeight: '44px' // Touch-friendly
          }}
        >
          ⬅️ Previous
        </button>
        
        {/* Play/Pause Button */}
        <button
          onClick={() => onTimerControl(isRunning ? 'pause' : 'play')}
          style={{
            padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 3vw, 2rem)',
            border: 'none',
            borderRadius: '12px',
            fontWeight: '700',
            cursor: 'pointer',
            fontSize: 'clamp(0.9rem, 1.8vw, 1.1rem)',
            background: isRunning 
              ? 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)' 
              : 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)',
            color: 'white',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            transition: 'all 0.3s ease',
            transform: 'scale(1)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backdropFilter: 'blur(10px)',
            minHeight: '48px' // Larger for primary action
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
            padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1rem, 2.5vw, 1.5rem)',
            border: 'none',
            borderRadius: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: 'clamp(0.8rem, 1.5vw, 1rem)',
            background: 'linear-gradient(135deg, #6c757d 0%, #495057 100%)',
            color: 'white',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backdropFilter: 'blur(10px)',
            minHeight: '44px'
          }}
        >
          🔄 Reset
        </button>
        
        {/* Next/Complete Button */}
        <button
          onClick={() => onTimerControl('next')}
          style={{
            padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 3vw, 2rem)',
            border: 'none',
            borderRadius: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: 'clamp(0.8rem, 1.5vw, 1rem)',
            background: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)',
            color: 'white',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backdropFilter: 'blur(10px)',
            minHeight: '44px'
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

        /* Responsive font scaling for very small screens */
        @media (max-height: 600px) {
          div[style*="fontSize: 'clamp(3rem"] {
            font-size: clamp(2rem, 6vw, 4rem) !important;
          }
        }

        /* Touch device optimizations */
        @media (hover: none) and (pointer: coarse) {
          button {
            min-height: 48px !important;
            padding: 1rem 1.5rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default TransitionDisplay;