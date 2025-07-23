import React, { createContext, useContext, useCallback, useEffect, useRef, useState } from 'react';
import { Activity, ScheduleItem } from '../types';

interface TimerState {
  isRunning: boolean;
  isPaused: boolean;
  currentActivityIndex: number;
  remainingTime: number; // in seconds
  totalTime: number; // in seconds
  scheduleItems: ScheduleItem[];
}

interface TimerContextValue {
  timer: TimerState;
  startSchedule: (items: ScheduleItem[]) => void;
  pauseTimer: () => void;
  skipToNext: () => void;
  addFiveMinutes: () => void;
  resetTimer: () => void;
  updateScheduleItems: (items: ScheduleItem[]) => void;
  getCurrentActivity: () => ScheduleItem | null;
  getNextActivity: () => ScheduleItem | null;
  formatTime: (seconds: number) => string;
  getTimerColor: () => 'normal' | 'warning' | 'urgent' | 'expired';
}

const TimerContext = createContext<TimerContextValue | undefined>(undefined);

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};

interface TimerProviderProps {
  children: React.ReactNode;
}

export const TimerProvider: React.FC<TimerProviderProps> = ({ children }) => {
  const [timer, setTimer] = useState<TimerState>({
    isRunning: false,
    isPaused: false,
    currentActivityIndex: 0,
    remainingTime: 0,
    totalTime: 0,
    scheduleItems: []
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Audio notification functions
  const playNotificationSound = useCallback((frequency: number, duration: number) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContextRef.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + duration / 1000);
    
    oscillator.start(audioContextRef.current.currentTime);
    oscillator.stop(audioContextRef.current.currentTime + duration / 1000);
  }, []);

  const playWarningSound = useCallback(() => {
    playNotificationSound(800, 500); // 5 minutes warning
  }, [playNotificationSound]);

  const playUrgentSound = useCallback(() => {
    playNotificationSound(1200, 300);
    setTimeout(() => playNotificationSound(1200, 300), 400);
  }, [playNotificationSound]);

  const playTransitionSound = useCallback(() => {
    playNotificationSound(600, 800); // Activity complete
  }, [playNotificationSound]);

  // Timer functions
  const startSchedule = useCallback((items: ScheduleItem[]) => {
    if (items.length === 0) return;
    
    const firstActivity = items[0];
    setTimer(prev => ({
      ...prev,
      isRunning: true,
      isPaused: false,
      currentActivityIndex: 0,
      remainingTime: firstActivity.duration * 60, // Convert minutes to seconds
      totalTime: firstActivity.duration * 60,
      scheduleItems: items
    }));
  }, []);

  const pauseTimer = useCallback(() => {
    setTimer(prev => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);

  const skipToNext = useCallback(() => {
    setTimer(prev => {
      const nextIndex = prev.currentActivityIndex + 1;
      if (nextIndex < prev.scheduleItems.length) {
        const nextActivity = prev.scheduleItems[nextIndex];
        playTransitionSound();
        return {
          ...prev,
          currentActivityIndex: nextIndex,
          remainingTime: nextActivity.duration * 60,
          totalTime: nextActivity.duration * 60
        };
      } else {
        // Schedule complete
        playTransitionSound();
        return { 
          ...prev, 
          isRunning: false,
          currentActivityIndex: 0,
          remainingTime: 0,
          totalTime: 0
        };
      }
    });
  }, [playTransitionSound]);

  const addFiveMinutes = useCallback(() => {
    setTimer(prev => ({
      ...prev,
      remainingTime: prev.remainingTime + 300, // Add 5 minutes (300 seconds)
      totalTime: prev.totalTime + 300
    }));
  }, []);

  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setTimer(prev => ({
      ...prev,
      isRunning: false,
      isPaused: false,
      currentActivityIndex: 0,
      remainingTime: 0,
      totalTime: 0
    }));
  }, []);

  const updateScheduleItems = useCallback((items: ScheduleItem[]) => {
    setTimer(prev => ({
      ...prev,
      scheduleItems: items
    }));
  }, []);

  const getCurrentActivity = useCallback(() => {
    if (timer.scheduleItems.length === 0 || timer.currentActivityIndex >= timer.scheduleItems.length) {
      return null;
    }
    return timer.scheduleItems[timer.currentActivityIndex];
  }, [timer.scheduleItems, timer.currentActivityIndex]);

  const getNextActivity = useCallback(() => {
    const nextIndex = timer.currentActivityIndex + 1;
    if (nextIndex >= timer.scheduleItems.length) {
      return null;
    }
    return timer.scheduleItems[nextIndex];
  }, [timer.scheduleItems, timer.currentActivityIndex]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const getTimerColor = useCallback(() => {
    if (timer.remainingTime <= 0) return 'expired';
    if (timer.remainingTime <= 60) return 'urgent';
    if (timer.remainingTime <= 300) return 'warning';
    return 'normal';
  }, [timer.remainingTime]);

  // Timer effect
  useEffect(() => {
    if (timer.isRunning && !timer.isPaused && timer.remainingTime > 0) {
      timerRef.current = setInterval(() => {
        setTimer(prev => {
          const newRemainingTime = prev.remainingTime - 1;
          
          // Play warning sounds
          if (newRemainingTime === 300) { // 5 minutes left
            playWarningSound();
          } else if (newRemainingTime === 60) { // 1 minute left
            playUrgentSound();
          } else if (newRemainingTime === 0) { // Time's up
            playTransitionSound();
            // Auto-advance to next activity
            setTimeout(() => {
              const nextIndex = prev.currentActivityIndex + 1;
              if (nextIndex < prev.scheduleItems.length) {
                const nextActivity = prev.scheduleItems[nextIndex];
                setTimer(current => ({
                  ...current,
                  currentActivityIndex: nextIndex,
                  remainingTime: nextActivity.duration * 60,
                  totalTime: nextActivity.duration * 60
                }));
              } else {
                // Schedule complete
                setTimer(current => ({ 
                  ...current, 
                  isRunning: false,
                  currentActivityIndex: 0,
                  remainingTime: 0,
                  totalTime: 0
                }));
              }
            }, 1000);
          }
          
          return { ...prev, remainingTime: Math.max(0, newRemainingTime) };
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timer.isRunning, timer.isPaused, timer.remainingTime, timer.scheduleItems, playWarningSound, playUrgentSound, playTransitionSound]);

  const contextValue: TimerContextValue = {
    timer,
    startSchedule,
    pauseTimer,
    skipToNext,
    addFiveMinutes,
    resetTimer,
    updateScheduleItems,
    getCurrentActivity,
    getNextActivity,
    formatTime,
    getTimerColor
  };

  return (
    <TimerContext.Provider value={contextValue}>
      {children}
    </TimerContext.Provider>
  );
};