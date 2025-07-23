// File: src/renderer/components/display/EnhancedTimer.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Activity, CelebrationStyle } from '../../types';

interface EnhancedTimerProps {
  activity: Activity;
  onComplete: () => void;
  onCelebrationTriggered?: (style: CelebrationStyle) => void;
  celebrationStyle?: CelebrationStyle;
  autoStart?: boolean;
}

interface TimerState {
  timeRemaining: number;
  isRunning: boolean;
  isCompleted: boolean;
  isPaused: boolean;
  totalTime: number;
  overtime: number;
}

const EnhancedTimer: React.FC<EnhancedTimerProps> = ({
  activity,
  onComplete,
  onCelebrationTriggered,
  celebrationStyle = 'gentle',
  autoStart = false
}) => {
  const [timerState, setTimerState] = useState<TimerState>({
    timeRemaining: activity.duration * 60, // Convert minutes to seconds
    isRunning: autoStart,
    isCompleted: false,
    isPaused: false,
    totalTime: activity.duration * 60,
    overtime: 0
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [hasPlayedWarnings, setHasPlayedWarnings] = useState({
    fiveMinute: false,
    oneMinute: false,
    completion: false
  });

  // Audio context for gentle sounds
  const playNotificationSound = (type: 'warning' | 'urgent' | 'completion') => {
    try {
      // Create audio context for browser-based sounds
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Different frequencies for different notifications
      switch (type) {
        case 'warning':
          oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A note
          gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
          break;
        case 'urgent':
          oscillator.frequency.setValueAtTime(523, audioContext.currentTime); // C note (higher)
          gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
          break;
        case 'completion':
          // Happy completion chime
          oscillator.frequency.setValueAtTime(660, audioContext.currentTime); // E note
          gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
          break;
      }

      oscillator.type = 'sine'; // Gentle sine wave
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3); // Short, gentle chime

    } catch (error) {
      console.log('Audio not available:', error);
    }
  };

  // Main timer effect
  useEffect(() => {
    if (timerState.isRunning && !timerState.isPaused) {
      intervalRef.current = setInterval(() => {
        setTimerState(prev => {
          const newTimeRemaining = prev.timeRemaining - 1;
          
          // Check for notifications
          if (!hasPlayedWarnings.fiveMinute && newTimeRemaining === 300) { // 5 minutes
            playNotificationSound('warning');
            setHasPlayedWarnings(prev => ({ ...prev, fiveMinute: true }));
          }
          
          if (!hasPlayedWarnings.oneMinute && newTimeRemaining === 60) { // 1 minute
            playNotificationSound('urgent');
            setHasPlayedWarnings(prev => ({ ...prev, oneMinute: true }));
          }
          
          // Timer completion
          if (newTimeRemaining <= 0 && !prev.isCompleted) {
            if (!hasPlayedWarnings.completion) {
              playNotificationSound('completion');
              setHasPlayedWarnings(prev => ({ ...prev, completion: true }));
              
              // Trigger celebration!
              onCelebrationTriggered?.(celebrationStyle);
              
              // Call completion callback after short delay to let celebration start
              setTimeout(() => {
                onComplete();
              }, 500);
            }
            
            return {
              ...prev,
              timeRemaining: 0,
              isCompleted: true,
              isRunning: false,
              overtime: prev.overtime + 1
            };
          }
          
          // Continue into overtime
          if (newTimeRemaining < 0) {
            return {
              ...prev,
              timeRemaining: 0,
              overtime: prev.overtime + 1
            };
          }
          
          return {
            ...prev,
            timeRemaining: newTimeRemaining
          };
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timerState.isRunning, timerState.isPaused, timerState.isCompleted, onComplete, onCelebrationTriggered, celebrationStyle, hasPlayedWarnings]);

  // Timer control functions
  const startTimer = () => {
    setTimerState(prev => ({ ...prev, isRunning: true, isPaused: false }));
  };

  const pauseTimer = () => {
    setTimerState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  };

  const addTime = (minutes: number) => {
    setTimerState(prev => ({
      ...prev,
      timeRemaining: prev.timeRemaining + (minutes * 60),
      totalTime: prev.totalTime + (minutes * 60)
    }));
  };

  const resetTimer = () => {
    setTimerState({
      timeRemaining: activity.duration * 60,
      isRunning: false,
      isCompleted: false,
      isPaused: false,
      totalTime: activity.duration * 60,
      overtime: 0
    });
    setHasPlayedWarnings({
      fiveMinute: false,
      oneMinute: false,
      completion: false
    });
  };

  const skipActivity = () => {
    if (!hasPlayedWarnings.completion) {
      playNotificationSound('completion');
      onCelebrationTriggered?.(celebrationStyle);
    }
    setTimeout(() => {
      onComplete();
    }, 500);
  };

  // Format time display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(Math.abs(seconds) / 60);
    const secs = Math.abs(seconds) % 60;
    const sign = seconds < 0 ? '-' : '';
    return `${sign}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const progressPercentage = Math.max(0, Math.min(100, 
    ((timerState.totalTime - timerState.timeRemaining) / timerState.totalTime) * 100
  ));

  // Determine timer color based on time remaining
  const getTimerColor = (): string => {
    if (timerState.isCompleted || timerState.timeRemaining < 0) return '#e74c3c'; // Red for overtime
    if (timerState.timeRemaining <= 60) return '#f39c12'; // Orange for last minute
    if (timerState.timeRemaining <= 300) return '#f1c40f'; // Yellow for last 5 minutes
    return '#2ecc71'; // Green for plenty of time
  };

  // Get status message
  const getStatusMessage = (): string => {
    if (timerState.isCompleted) return '🎉 Activity Complete!';
    if (timerState.timeRemaining < 0) return `⏰ Overtime: ${formatTime(timerState.overtime)}`;
    if (timerState.timeRemaining <= 60) return '⚠️ One minute remaining!';
    if (timerState.timeRemaining <= 300) return '⏰ Five minutes remaining';
    if (timerState.isPaused) return '⏸️ Timer Paused';
    if (!timerState.isRunning) return '▶️ Ready to Start';
    return '✅ Timer Running';
  };

  return (
    <div className="enhanced-timer">
      {/* Main Timer Display */}
      <div className="timer-main-display">
        <div 
          className="timer-circle"
          style={{
            background: `conic-gradient(${getTimerColor()} ${progressPercentage * 3.6}deg, #e9ecef 0deg)`
          }}
        >
          <div className="timer-inner-circle">
            <div 
              className="timer-time"
              style={{ color: getTimerColor() }}
            >
              {formatTime(timerState.timeRemaining)}
            </div>
            <div className="timer-activity-name">
              {activity.name}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="timer-progress-bar">
        <div 
          className="timer-progress-fill"
          style={{ 
            width: `${progressPercentage}%`,
            backgroundColor: getTimerColor()
          }}
        />
      </div>

      {/* Status Message */}
      <div className="timer-status">
        {getStatusMessage()}
      </div>

      {/* Timer Controls */}
      <div className="timer-controls">
        {!timerState.isRunning && !timerState.isCompleted && (
          <button className="timer-btn start-btn" onClick={startTimer}>
            ▶️ Start
          </button>
        )}
        
        {timerState.isRunning && !timerState.isCompleted && (
          <button className="timer-btn pause-btn" onClick={pauseTimer}>
            {timerState.isPaused ? '▶️ Resume' : '⏸️ Pause'}
          </button>
        )}
        
        <button className="timer-btn extend-btn" onClick={() => addTime(5)}>
          +5 min
        </button>
        
        <button className="timer-btn skip-btn" onClick={skipActivity}>
          ⏭️ Complete
        </button>
        
        <button className="timer-btn reset-btn" onClick={resetTimer}>
          🔄 Reset
        </button>
      </div>

      {/* Celebration Style Indicator */}
      <div className="celebration-indicator">
        <span className="celebration-label">Celebration Style:</span>
        <span className="celebration-style">
          {celebrationStyle === 'gentle' ? '🌸 Gentle' : '🎆 Excited'}
        </span>
      </div>

      <style>{`
        .enhanced-timer {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
          padding: 2rem;
          background: linear-gradient(145deg, #f8f9fa 0%, #e9ecef 100%);
          border-radius: 20px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.1);
          max-width: 500px;
          margin: 0 auto;
        }

        .timer-main-display {
          position: relative;
        }

        .timer-circle {
          width: 200px;
          height: 200px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px;
          transition: all 0.3s ease;
        }

        .timer-inner-circle {
          width: 100%;
          height: 100%;
          background: white;
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          box-shadow: inset 0 4px 12px rgba(0,0,0,0.1);
        }

        .timer-time {
          font-size: 2.5rem;
          font-weight: 700;
          font-family: 'Courier New', monospace;
          transition: color 0.3s ease;
        }

        .timer-activity-name {
          font-size: 0.9rem;
          color: #6c757d;
          text-align: center;
          margin-top: 0.5rem;
          font-weight: 500;
        }

        .timer-progress-bar {
          width: 100%;
          height: 8px;
          background: #e9ecef;
          border-radius: 4px;
          overflow: hidden;
        }

        .timer-progress-fill {
          height: 100%;
          transition: width 0.3s ease, background-color 0.3s ease;
          border-radius: 4px;
        }

        .timer-status {
          font-size: 1.1rem;
          font-weight: 600;
          color: #495057;
          text-align: center;
          padding: 0.75rem 1.5rem;
          background: rgba(255,255,255,0.8);
          border-radius: 12px;
          backdrop-filter: blur(10px);
        }

        .timer-controls {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
          justify-content: center;
        }

        .timer-btn {
          padding: 0.75rem 1.25rem;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          min-width: 100px;
        }

        .start-btn {
          background: linear-gradient(145deg, #28a745, #20c997);
          color: white;
        }

        .start-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
        }

        .pause-btn {
          background: linear-gradient(145deg, #ffc107, #e0a800);
          color: #212529;
        }

        .pause-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(255, 193, 7, 0.3);
        }

        .extend-btn {
          background: linear-gradient(145deg, #007bff, #0056b3);
          color: white;
        }

        .extend-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0, 123, 255, 0.3);
        }

        .skip-btn {
          background: linear-gradient(145deg, #6f42c1, #5a32a3);
          color: white;
        }

        .skip-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(111, 66, 193, 0.3);
        }

        .reset-btn {
          background: linear-gradient(145deg, #6c757d, #545b62);
          color: white;
        }

        .reset-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(108, 117, 125, 0.3);
        }

        .celebration-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          color: #6c757d;
          background: rgba(255,255,255,0.6);
          padding: 0.5rem 1rem;
          border-radius: 8px;
        }

        .celebration-label {
          font-weight: 500;
        }

        .celebration-style {
          font-weight: 600;
          color: #667eea;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .enhanced-timer {
            padding: 1rem;
          }

          .timer-circle {
            width: 150px;
            height: 150px;
          }

          .timer-time {
            font-size: 2rem;
          }

          .timer-controls {
            gap: 0.5rem;
          }

          .timer-btn {
            padding: 0.5rem 1rem;
            font-size: 0.8rem;
            min-width: 80px;
          }
        }

        /* Animation for completion */
        .timer-circle.completed {
          animation: completionPulse 1s ease-in-out;
        }

        @keyframes completionPulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default EnhancedTimer;