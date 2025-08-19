// Morning Meeting Steps - Clean exports
import AttendanceStep from './AttendanceStep';
import BehaviorStep from './BehaviorStep';
import CalendarMathStep from './CalendarMathStep';
import WeatherStep from './WeatherStep';
import SeasonalStep from './SeasonalStep';
import WelcomeStep from './WelcomeStep';

export { 
  AttendanceStep, 
  BehaviorStep, 
  CalendarMathStep, 
  WeatherStep, 
  SeasonalStep, 
  WelcomeStep 
};

// Export types
export * from '../types/morningMeetingTypes';

// Step metadata for easy reference
export const STEP_COMPONENTS = {
  welcome: WelcomeStep,
  attendance: AttendanceStep,
  behavior: BehaviorStep,
  calendarMath: CalendarMathStep,
  weather: WeatherStep,
  seasonal: SeasonalStep
} as const;

// Step information for flow management
export const STEP_INFO = {
  welcome: {
    name: 'Welcome',
    icon: '👋',
    description: 'Personalized welcome message',
    required: false,
    estimatedMinutes: 1
  },
  attendance: {
    name: 'Attendance',
    icon: '📋',
    description: 'Mark students present or absent',
    required: true,
    estimatedMinutes: 3
  },
  behavior: {
    name: 'Behavior Goals',
    icon: '⭐',
    description: 'Students choose daily behavior commitments',
    required: false,
    estimatedMinutes: 5
  },
  calendarMath: {
    name: 'Calendar Math',
    icon: '📅',
    description: 'Learn months, weeks, days with ordinal numbers',
    required: false,
    estimatedMinutes: 4
  },
  weather: {
    name: 'Weather & Clothing',
    icon: '🌤️',
    description: 'Weather discussion and clothing selection',
    required: false,
    estimatedMinutes: 4
  },
  seasonal: {
    name: 'Seasonal Learning',
    icon: '🍂',
    description: 'Season-appropriate activities and vocabulary',
    required: false,
    estimatedMinutes: 5
  }
} as const;

// Flow order and management
export const DEFAULT_STEP_ORDER = [
  'welcome',
  'attendance', 
  'behavior',
  'calendarMath',
  'weather',
  'seasonal'
] as const;

export type StepKey = keyof typeof STEP_COMPONENTS;