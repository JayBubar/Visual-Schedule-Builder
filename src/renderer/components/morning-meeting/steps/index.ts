// Morning Meeting Steps - Complete 8-Step Flow
export { default as WelcomeStep } from './WelcomeStep';
export { default as AttendanceStep } from './AttendanceStep';
export { default as BehaviorStep } from './BehaviorStep';
export { default as CalendarMathStep } from './CalendarMathStep';
export { default as WeatherStep } from './WeatherStep';
export { default as SeasonalStep } from './SeasonalStep';
export { default as CelebrationStep } from './CelebrationStep';
export { default as DayReviewStep } from './DayReviewStep';

// Re-export types from the types file
export type { MorningMeetingSettings, MorningMeetingStepProps } from '../types/morningMeetingTypes';
export { DEFAULT_MORNING_MEETING_SETTINGS } from '../types/morningMeetingTypes';

// Import the components for the STEP_COMPONENTS map
import WelcomeStep from './WelcomeStep';
import AttendanceStep from './AttendanceStep';
import BehaviorStep from './BehaviorStep';
import CalendarMathStep from './CalendarMathStep';
import WeatherStep from './WeatherStep';
import SeasonalStep from './SeasonalStep';
import CelebrationStep from './CelebrationStep';
import DayReviewStep from './DayReviewStep';

// Step components map for dynamic rendering (required by MorningMeetingFlow.tsx)
export const STEP_COMPONENTS = {
  welcome: WelcomeStep,
  attendance: AttendanceStep,
  behavior: BehaviorStep,
  calendarMath: CalendarMathStep,
  weather: WeatherStep,
  seasonal: SeasonalStep,
  celebration: CelebrationStep,
  dayReview: DayReviewStep
} as const;

// Default step order (required by MorningMeetingFlow.tsx)
export const DEFAULT_STEP_ORDER = [
  'welcome',
  'attendance',
  'behavior', 
  'calendarMath',
  'weather',
  'seasonal',
  'celebration',
  'dayReview'
] as const;

// Step metadata for flow management
export const MORNING_MEETING_STEPS = {
  welcome: {
    name: 'Welcome',
    icon: '👋',
    component: 'WelcomeStep',
    required: false,
    description: 'Personalized welcome message and class greeting'
  },
  attendance: {
    name: 'Attendance',
    icon: '📋',
    component: 'AttendanceStep',
    required: true,
    description: 'Mark students present and absent for the day'
  },
  behavior: {
    name: 'Behavior Commitments',
    icon: '⭐',
    component: 'BehaviorStep',
    required: false,
    description: 'Students choose their behavior goals for the day'
  },
  calendarMath: {
    name: 'Calendar Math',
    icon: '📅',
    component: 'CalendarMathStep',
    required: false,
    description: 'Interactive calendar, dates, and number learning'
  },
  weather: {
    name: 'Weather & Clothing',
    icon: '🌤️',
    component: 'WeatherStep',
    required: false,
    description: 'Weather discussion and appropriate clothing choices'
  },
  seasonal: {
    name: 'Seasonal Learning',
    icon: '🍂',
    component: 'SeasonalStep',
    required: false,
    description: 'Season-specific vocabulary and activities'
  },
  celebration: {
    name: 'Celebrations',
    icon: '🎉',
    component: 'CelebrationStep',
    required: false,
    description: 'Birthday celebrations and special recognitions'
  },
  dayReview: {
    name: 'Day Review & Goals',
    icon: '🎯',
    component: 'DayReviewStep',
    required: false,
    description: 'Goal setting and reflection for the day ahead'
  }
} as const;

// Type for step keys (re-exported for compatibility)
export type StepKey = keyof typeof STEP_COMPONENTS;

// Default enabled steps for new installations
export const DEFAULT_ENABLED_STEPS: StepKey[] = [
  'welcome',
  'attendance', 
  'behavior',
  'calendarMath',
  'weather',
  'seasonal',
  'celebration',
  'dayReview'
];

// Helper function to get enabled steps in order
export const getEnabledStepsInOrder = (enabledSteps: Record<string, boolean>): StepKey[] => {
  const stepOrder: StepKey[] = [
    'welcome',
    'attendance',
    'behavior', 
    'calendarMath',
    'weather',
    'seasonal',
    'celebration',
    'dayReview'
  ];
  
  return stepOrder.filter(step => enabledSteps[step] !== false);
};

// Helper function to get step component by key
export const getStepComponent = (stepKey: StepKey) => {
  return STEP_COMPONENTS[stepKey];
};