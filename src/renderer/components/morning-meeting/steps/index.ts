// Morning Meeting Steps Index
import WelcomeStep from './WelcomeStep';
import AttendanceStep from './AttendanceStep';
import ClassroomRulesStep from './ClassroomRulesStep';
import BehaviorStep from './BehaviorStep';
import CalendarMathStep from './CalendarMathStep';
import WeatherStep from './WeatherStep';
import SeasonalStep from './SeasonalStep';
import CelebrationStep from './CelebrationStep';
import DayReviewStep from './DayReviewStep';

// Export all step components
export {
  WelcomeStep,
  AttendanceStep,
  ClassroomRulesStep,
  BehaviorStep,
  CalendarMathStep,
  WeatherStep,
  SeasonalStep,
  CelebrationStep,
  DayReviewStep
};

// Define step keys - MATCH the flow exactly
export type StepKey = 
  | 'welcome'
  | 'attendance'
  | 'classroomRules'      // FIXED
  | 'behaviorCommitments' // FIXED
  | 'calendarMath'
  | 'weather'
  | 'seasonal'
  | 'celebration'
  | 'dayReview';

// Step component mapping - MATCH the flow exactly
export const STEP_COMPONENTS = {
  welcome: WelcomeStep,
  attendance: AttendanceStep,
  classroomRules: ClassroomRulesStep,      // FIXED
  behaviorCommitments: BehaviorStep,       // FIXED
  calendarMath: CalendarMathStep,
  weather: WeatherStep,
  seasonal: SeasonalStep,
  celebration: CelebrationStep,
  dayReview: DayReviewStep
};

// Default step order - MATCH the flow exactly
export const DEFAULT_STEP_ORDER: StepKey[] = [
  'welcome',
  'attendance',
  'classroomRules',      // FIXED
  'behaviorCommitments', // FIXED
  'calendarMath',
  'weather',
  'seasonal',
  'celebration',
  'dayReview'
];

// Step metadata
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
    description: 'Learn classroom expectations',
    estimatedTime: '2 minutes'
  },
  behaviorCommitments: {
    name: 'Behavior Goals',
    icon: '🎯',
    description: 'Students choose daily behavior goals',
    estimatedTime: '3 minutes'
  },
  calendarMath: {
    name: 'Calendar Math',
    icon: '📅',
    description: 'Interactive calendar and math',
    estimatedTime: '5 minutes'
  },
  weather: {
    name: 'Weather',
    icon: '🌤️',
    description: 'Weather and clothing discussion',
    estimatedTime: '3 minutes'
  },
  seasonal: {
    name: 'Seasonal',
    icon: '🌸',
    description: 'Season-appropriate learning',
    estimatedTime: '4 minutes'
  },
  celebration: {
    name: 'Celebrations',
    icon: '🎉',
    description: 'Daily celebrations',
    estimatedTime: '3 minutes'
  },
  dayReview: {
    name: 'Day Review',
    icon: '🎯',
    description: 'Review goals and rules',
    estimatedTime: '2 minutes'
  }
};
