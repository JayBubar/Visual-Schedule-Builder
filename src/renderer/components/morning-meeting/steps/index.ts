// Morning Meeting Steps Index
// This file exports all step components and defines the step order

import WelcomeStep from './WelcomeStep';
import AttendanceStep from './AttendanceStep';
import ClassroomRulesStep from './ClassroomRulesStep';
import CalendarMathStep from './CalendarMathStep';
import WeatherStep from './WeatherStep';
import SeasonalStep from './SeasonalStep';
import CelebrationStep from './CelebrationStep';
import DayReviewStep from './DayReviewStep'; // ✅ ADDED BACK

// Export all step components
export {
  WelcomeStep,
  AttendanceStep,
  ClassroomRulesStep,
  CalendarMathStep,
  WeatherStep,
  SeasonalStep,
  CelebrationStep,
  DayReviewStep // ✅ ADDED BACK
};

// Define step keys
export type StepKey = 
  | 'welcome'
  | 'attendance'
  | 'classroomRules'
  | 'behaviorCommitments' // FIXED KEY
  | 'calendarMath'
  | 'weather'
  | 'seasonal'
  | 'celebration'
  | 'dayReview';

// Step component mapping
export const STEP_COMPONENTS = {
  welcome: WelcomeStep,
  attendance: AttendanceStep,
  classroomRules: ClassroomRulesStep,
  behaviorCommitments: ClassroomRulesStep, // FIXED KEY
  calendarMath: CalendarMathStep,
  weather: WeatherStep,
  seasonal: SeasonalStep,
  celebration: CelebrationStep,
  dayReview: DayReviewStep
};

// Default step order - Complete 9-step flow
export const DEFAULT_STEP_ORDER: StepKey[] = [
  'welcome',
  'attendance',
  'classroomRules',
  'behaviorCommitments', // FIXED KEY
  'calendarMath',
  'weather',
  'seasonal',
  'celebration',
  'dayReview'
];

// Function to get enabled steps in order
export const getEnabledStepsInOrder = (enabledSteps: Record<string, boolean>): StepKey[] => {
  return DEFAULT_STEP_ORDER.filter(step => {
    // If step is explicitly disabled, exclude it
    // If step is not in enabledSteps object or is true, include it
    // This ensures backwards compatibility and includes steps by default
    return enabledSteps[step] !== false;
  });
};

// Step metadata for UI purposes
export const STEP_METADATA = {
  welcome: {
    name: 'Welcome',
    icon: '👋',
    description: 'Classroom greeting and introduction',
    estimatedTime: '2 minutes'
  },
  attendance: {
    name: 'Attendance',
    icon: '📋',
    description: 'Check who is here today',
    estimatedTime: '3 minutes'
  },
  classroomRules: {
    name: 'Classroom Rules',
    icon: '⭐',
    description: 'Learn classroom expectations and rules',
    estimatedTime: '4 minutes'
  },
  behaviorCommitments: {
    name: 'Behavior Goals',
    icon: '🎯',
    description: 'Student behavior commitments and goals',
    estimatedTime: '4 minutes'
  },
  calendarMath: {
    name: 'Calendar Math',
    icon: '📅',
    description: 'Date, counting, and math concepts',
    estimatedTime: '5 minutes'
  },
  weather: {
    name: 'Weather & Clothing',
    icon: '🌤️',
    description: 'Weather discussion and clothing choices',
    estimatedTime: '4 minutes'
  },
  seasonal: {
    name: 'Seasonal Learning',
    icon: '🌸',
    description: 'Season-specific activities and vocabulary',
    estimatedTime: '6 minutes'
  },
  celebration: {
    name: 'Celebrations',
    icon: '🎉',
    description: 'Birthdays and special recognition',
    estimatedTime: '3 minutes'
  },
  dayReview: {
    name: 'Day Review & Goals',
    icon: '🎯',
    description: 'Reflection and goal-setting for the day',
    estimatedTime: '5 minutes'
  }
};

// Calculate total estimated time
export const getTotalEstimatedTime = (enabledSteps: Record<string, boolean>): number => {
  const enabledStepKeys = getEnabledStepsInOrder(enabledSteps);
  return enabledStepKeys.reduce((total, stepKey) => {
    const timeStr = STEP_METADATA[stepKey].estimatedTime;
    const minutes = parseInt(timeStr.match(/\d+/)?.[0] || '0');
    return total + minutes;
  }, 0);
};

// Validation function
export const validateStepOrder = (steps: StepKey[]): boolean => {
  // Check if all steps are valid
  const validSteps = steps.every(step => step in STEP_COMPONENTS);
  
  // Check if attendance is included (required step)
  const hasAttendance = steps.includes('attendance');
  
  // Check if welcome is first (if included)
  const welcomeIndex = steps.indexOf('welcome');
  const welcomeIsFirst = welcomeIndex === -1 || welcomeIndex === 0;
  
  // Check if dayReview is last (if included)
  const dayReviewIndex = steps.indexOf('dayReview');
  const dayReviewIsLast = dayReviewIndex === -1 || dayReviewIndex === steps.length - 1;
  
  return validSteps && hasAttendance && welcomeIsFirst && dayReviewIsLast;
};

// Get step progress information
export const getStepProgress = (currentStepIndex: number, totalSteps: number) => {
  const percentage = Math.round(((currentStepIndex + 1) / totalSteps) * 100);
  const remaining = totalSteps - currentStepIndex - 1;
  
  return {
    current: currentStepIndex + 1,
    total: totalSteps,
    percentage,
    remaining,
    isFirst: currentStepIndex === 0,
    isLast: currentStepIndex === totalSteps - 1
  };
};

// Get next/previous step info
export const getStepNavigation = (
  currentStepKey: StepKey,
  enabledSteps: Record<string, boolean>
) => {
  const stepOrder = getEnabledStepsInOrder(enabledSteps);
  const currentIndex = stepOrder.indexOf(currentStepKey);
  
  return {
    currentIndex,
    previousStep: currentIndex > 0 ? stepOrder[currentIndex - 1] : null,
    nextStep: currentIndex < stepOrder.length - 1 ? stepOrder[currentIndex + 1] : null,
    canGoBack: currentIndex > 0,
    canGoNext: currentIndex < stepOrder.length - 1,
    isComplete: currentIndex === stepOrder.length - 1
  };
};
