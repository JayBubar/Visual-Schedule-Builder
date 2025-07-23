import React, { useState, useEffect, useRef } from 'react';

interface AudioNotificationProps {
  timeRemaining: number;
  isRunning: boolean;
  isPaused: boolean;
  currentActivityName: string;
  nextActivityName?: string;
  onNotificationPlayed?: (type: string) => void;
}

interface NotificationSettings {
  enabled: boolean;
  volume: number;
  fiveMinuteWarning: boolean;
  oneMinuteWarning: boolean;
  thirtySecondWarning: boolean;
  completionSound: boolean;
  transitionSound: boolean;
  voiceAnnouncements: boolean;
  gentleMode: boolean; // For sensory-sensitive students
}

const AudioNotificationSystem: React.FC<AudioNotificationProps> = ({
  timeRemaining,
  isRunning,
  isPaused,
  currentActivityName,
  nextActivityName,
  onNotificationPlayed
}) => {
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: true,
    volume: 0.7,
    fiveMinuteWarning: true,
    oneMinuteWarning: true,
    thirtySecondWarning: false,
    completionSound: true,
    transitionSound: true,
    voiceAnnouncements: false,
    gentleMode: true
  });

  const [playedNotifications, setPlayedNotifications] = useState<Set<string>>(new Set());
  const audioContextRef = useRef<AudioContext | null>(null);
  const speechSynthRef = useRef<SpeechSynthesis | null>(null);

  // Initialize audio context
  useEffect(() => {
    if (typeof window !== 'undefined' && window.AudioContext) {
      audioContextRef.current = new AudioContext();
      speechSynthRef.current = window.speechSynthesis;
    }
  }, []);

  // Reset played notifications when activity changes
  useEffect(() => {
    setPlayedNotifications(new Set());
  }, [currentActivityName]);

  // Main notification logic
  useEffect(() => {
    if (!settings.enabled || !isRunning || isPaused) return;

    const notificationKey = `${currentActivityName}-${timeRemaining}`;
    
    // 5-minute warning
    if (settings.fiveMinuteWarning && timeRemaining === 300 && !playedNotifications.has('5min')) {
      playFiveMinuteWarning();
      setPlayedNotifications(prev => new Set(prev).add('5min'));
      onNotificationPlayed?.('5-minute-warning');
    }
    
    // 1-minute warning
    if (settings.oneMinuteWarning && timeRemaining === 60 && !playedNotifications.has('1min')) {
      playOneMinuteWarning();
      setPlayedNotifications(prev => new Set(prev).add('1min'));
      onNotificationPlayed?.('1-minute-warning');
    }
    
    // 30-second warning
    if (settings.thirtySecondWarning && timeRemaining === 30 && !playedNotifications.has('30sec')) {
      playThirtySecondWarning();
      setPlayedNotifications(prev => new Set(prev).add('30sec'));
      onNotificationPlayed?.('30-second-warning');
    }
    
    // Activity completion
    if (settings.completionSound && timeRemaining === 0 && !playedNotifications.has('complete')) {
      playCompletionSound();
      setPlayedNotifications(prev => new Set(prev).add('complete'));
      onNotificationPlayed?.('activity-complete');
    }
  }, [timeRemaining, isRunning, isPaused, settings, currentActivityName, playedNotifications]);

  // Audio generation functions
  const createTone = (frequency: number, duration: number, type: OscillatorType = 'sine') => {
    if (!audioContextRef.current) return;
    
    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);
    
    oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(0, audioContextRef.current.currentTime);
    gainNode.gain.linearRampToValueAtTime(settings.volume * 0.3, audioContextRef.current.currentTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current.currentTime + duration);
    
    oscillator.start(audioContextRef.current.currentTime);
    oscillator.stop(audioContextRef.current.currentTime + duration);
  };

  const playChime = (frequencies: number[], duration: number = 0.5) => {
    frequencies.forEach((freq, index) => {
      setTimeout(() => createTone(freq, duration), index * 200);
    });
  };

  const playFiveMinuteWarning = () => {
    if (settings.gentleMode) {
      // Gentle ascending chime
      playChime([440, 554, 659], 0.6);
    } else {
      // More prominent warning
      playChime([523, 659, 784], 0.8);
    }
    
    if (settings.voiceAnnouncements) {
      setTimeout(() => {
        speak("Five minutes remaining");
      }, 1000);
    }
  };

  const playOneMinuteWarning = () => {
    if (settings.gentleMode) {
      // Gentle double chime
      playChime([659, 523], 0.4);
      setTimeout(() => playChime([659, 523], 0.4), 600);
    } else {
      // More urgent sound
      playChime([784, 659, 523], 0.6);
    }
    
    if (settings.voiceAnnouncements) {
      setTimeout(() => {
        speak("One minute remaining");
      }, 1000);
    }
  };

  const playThirtySecondWarning = () => {
    // Quick triple beep
    playChime([880, 880, 880], 0.2);
    
    if (settings.voiceAnnouncements) {
      setTimeout(() => {
        speak("Thirty seconds left");
      }, 800);
    }
  };

  const playCompletionSound = () => {
    if (settings.gentleMode) {
      // Gentle completion melody
      playChime([523, 659, 784, 1047], 0.8);
    } else {
      // Celebration sound
      playChime([523, 659, 784, 1047, 784, 659, 523], 0.5);
    }
    
    if (settings.voiceAnnouncements) {
      setTimeout(() => {
        speak(`${currentActivityName} is complete. ${nextActivityName ? `Time for ${nextActivityName}` : 'Great job!'}`);
      }, 1500);
    }
  };

  const playTransitionSound = () => {
    if (settings.transitionSound) {
      playChime([392, 440, 494], 0.7);
    }
  };

  const speak = (text: string) => {
    if (!speechSynthRef.current || !settings.voiceAnnouncements) return;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = settings.volume;
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1.0;
    
    // Use a calm, clear voice if available
    const voices = speechSynthRef.current.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Karen') || 
      voice.name.includes('Samantha') ||
      voice.lang.includes('en-US')
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    speechSynthRef.current.speak(utterance);
  };

  // Test functions
  const testFiveMinute = () => playFiveMinuteWarning();
  const testOneMinute = () => playOneMinuteWarning();
  const testCompletion = () => playCompletionSound();

  return (
    <div style={{
      background: 'linear-gradient(145deg, #f8f9fa 0%, #e9ecef 100%)',
      borderRadius: '16px',
      padding: '1.5rem',
      border: '2px solid #dee2e6',
      maxWidth: '500px',
      margin: '1rem auto'
    }}>
      <h3 style={{
        margin: '0 0 1.5rem 0',
        color: '#2c3e50',
        fontSize: '1.3rem',
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem'
      }}>
        🔔 Audio Notifications
      </h3>

      {/* Master Control */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.5rem',
        padding: '1rem',
        background: settings.enabled ? '#d4edda' : '#f8d7da',
        borderRadius: '12px',
        border: `2px solid ${settings.enabled ? '#c3e6cb' : '#f5c6cb'}`
      }}>
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '1.1rem',
          fontWeight: '600',
          color: '#2c3e50'
        }}>
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={(e) => setSettings(prev => ({ ...prev, enabled: e.target.checked }))}
            style={{ width: '20px', height: '20px' }}
          />
          Enable Audio Notifications
        </label>
        <div style={{
          fontSize: '1.5rem'
        }}>
          {settings.enabled ? '🔊' : '🔇'}
        </div>
      </div>

      {settings.enabled && (
        <>
          {/* Volume Control */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: '#495057'
            }}>
              Volume: {Math.round(settings.volume * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.volume}
              onChange={(e) => setSettings(prev => ({ ...prev, volume: parseFloat(e.target.value) }))}
              style={{
                width: '100%',
                height: '8px',
                borderRadius: '4px',
                background: '#e9ecef',
                outline: 'none'
              }}
            />
          </div>

          {/* Notification Types */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '0.75rem',
            marginBottom: '1.5rem'
          }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem',
              background: '#ffffff',
              borderRadius: '8px',
              border: '1px solid #dee2e6',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={settings.fiveMinuteWarning}
                onChange={(e) => setSettings(prev => ({ ...prev, fiveMinuteWarning: e.target.checked }))}
              />
              <span>🕐 5-Minute Warning</span>
            </label>

            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem',
              background: '#ffffff',
              borderRadius: '8px',
              border: '1px solid #dee2e6',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={settings.oneMinuteWarning}
                onChange={(e) => setSettings(prev => ({ ...prev, oneMinuteWarning: e.target.checked }))}
              />
              <span>⏰ 1-Minute Warning</span>
            </label>

            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem',
              background: '#ffffff',
              borderRadius: '8px',
              border: '1px solid #dee2e6',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={settings.thirtySecondWarning}
                onChange={(e) => setSettings(prev => ({ ...prev, thirtySecondWarning: e.target.checked }))}
              />
              <span>⚡ 30-Second Warning</span>
            </label>

            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem',
              background: '#ffffff',
              borderRadius: '8px',
              border: '1px solid #dee2e6',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={settings.completionSound}
                onChange={(e) => setSettings(prev => ({ ...prev, completionSound: e.target.checked }))}
              />
              <span>🎉 Activity Completion</span>
            </label>

            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem',
              background: '#ffffff',
              borderRadius: '8px',
              border: '1px solid #dee2e6',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={settings.voiceAnnouncements}
                onChange={(e) => setSettings(prev => ({ ...prev, voiceAnnouncements: e.target.checked }))}
              />
              <span>🗣️ Voice Announcements</span>
            </label>

            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem',
              background: '#fff3cd',
              borderRadius: '8px',
              border: '1px solid #ffeaa7',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={settings.gentleMode}
                onChange={(e) => setSettings(prev => ({ ...prev, gentleMode: e.target.checked }))}
              />
              <span>🕊️ Gentle Mode (Sensory-Friendly)</span>
            </label>
          </div>

          {/* Test Buttons */}
          <div style={{
            borderTop: '2px solid #e9ecef',
            paddingTop: '1rem'
          }}>
            <h4 style={{
              margin: '0 0 1rem 0',
              color: '#495057',
              fontSize: '1rem'
            }}>
              Test Sounds:
            </h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: '0.5rem'
            }}>
              <button
                onClick={testFiveMinute}
                style={{
                  padding: '0.5rem',
                  background: '#17a2b8',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                🕐 5-Min
              </button>
              <button
                onClick={testOneMinute}
                style={{
                  padding: '0.5rem',
                  background: '#ffc107',
                  color: '#212529',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                ⏰ 1-Min
              </button>
              <button
                onClick={testCompletion}
                style={{
                  padding: '0.5rem',
                  background: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                🎉 Complete
              </button>
            </div>
          </div>

          {/* Current Status */}
          <div style={{
            marginTop: '1rem',
            padding: '0.75rem',
            background: '#e3f2fd',
            borderRadius: '8px',
            border: '1px solid #bbdefb',
            fontSize: '0.9rem',
            color: '#1565c0'
          }}>
            <strong>Status:</strong> {
              !isRunning ? 'Timer not running' :
              isPaused ? 'Timer paused' :
              `Active - Next notification: ${
                timeRemaining > 300 ? '5-minute warning' :
                timeRemaining > 60 ? '1-minute warning' :
                timeRemaining > 30 ? '30-second warning' :
                timeRemaining > 0 ? 'Activity completion' :
                'Activity complete'
              }`
            }
          </div>
        </>
      )}
    </div>
  );
};

export default AudioNotificationSystem;