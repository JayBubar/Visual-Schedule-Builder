// Morning Meeting Type Definitions
import { Student } from '../../../types';
import { BookOpen } from 'lucide-react';

// Standard interface for all Morning Meeting step components
export interface MorningMeetingStepProps {
  students: Student[];
  onNext: () => void;
  onBack: () => void;
  currentDate: Date;
  hubSettings: MorningMeetingSettings;
  onDataUpdate: (stepData: any) => void;
  stepData?: any; // Current step's saved data
}

// Step component metadata interface
export interface MorningMeetingStepComponent {
  stepName: string;
  stepIcon: string;
  isComplete: boolean;
  requiredData?: string[];
}

// Morning Meeting settings from Hub
export interface MorningMeetingSettings {
  welcomePersonalization: {
    schoolName: string;
    teacherName: string;
    className: string;
    customMessage?: string;
  };
  videos: {
    weatherClothing: Array<{id: string, name: string, url: string}>;
    seasonalLearning: Array<{id: string, name: string, url: string}>;
    behaviorCommitments: Array<{id: string, name: string, url: string}>;
    calendarMath: Array<{id: string, name: string, url: string}>;
  };
  customVocabulary: {
    weather: string[];
    seasonal: string[];
    calendar: string[];
  };
  behaviorStatements: {
    enabled: boolean;
    statements: string[];
    allowCustom: boolean;
  };
  weatherAPI: {
    enabled: boolean;
    apiKey?: string;
    location?: string;
    customVocabulary: string[];
  };
  calendarMath: {
    enableOrdinalNumbers: boolean;
    enableYesterday: boolean;
    enableTomorrow: boolean;
    autoAdvanceSeconds: number;
  };
  seasonalLearning: {
    enabled: boolean;
    currentSeason: 'spring' | 'summer' | 'fall' | 'winter';
    activities: string[];
  };
  flowCustomization: {
    enabledSteps: {
      welcome: boolean;
      attendance: boolean;
      behavior: boolean;
      calendarMath: boolean;
      weather: boolean;
      seasonal: boolean;
    };
    stepOrder: string[];
  };
}

// Step data interfaces for persistence
export interface AttendanceStepData {
  presentStudents: Student[];
  absentStudents: Student[];
  manuallyMarkedAbsent: string[]; // Student IDs
  completedAt?: Date;
}

export interface BehaviorStepData {
  studentBehaviorChoices: Record<string, string>; // studentId -> behavior statement
  completedAt?: Date;
}

export interface CalendarMathStepData {
  currentLevel: 'month' | 'week' | 'day';
  completedLevels: string[];
  timeSpentSeconds: number;
  completedAt?: Date;
}

export interface WeatherStepData {
  currentWeather?: {
    temperature: number;
    condition: string;
    clothingRecommendations: string[];
  };
  selectedClothing: string[];
  customVocabulary: string[];
  completedAt?: Date;
}

export interface SeasonalStepData {
  currentSeason: string;
  currentSection?: 'characteristics' | 'vocabulary' | 'activities';
  completedSections?: string[];
  completedActivities: string[];
  learnedVocabulary: string[];
  completedAt?: Date;
}

export interface WelcomeStepData {
  personalizedMessage: string;
  viewedAt: Date;
  completedAt?: Date;
}

// Complete Morning Meeting session data
export interface MorningMeetingSessionData {
  sessionId: string;
  date: Date;
  startTime: Date;
  endTime?: Date;
  presentStudents: Student[];
  absentStudents: Student[];
  stepData: {
    welcome?: WelcomeStepData;
    attendance?: AttendanceStepData;
    behavior?: BehaviorStepData;
    calendarMath?: CalendarMathStepData;
    weather?: WeatherStepData;
    seasonal?: SeasonalStepData;
  };
  completedSteps: string[];
  isComplete: boolean;
}

// Flow control interfaces
export interface MorningMeetingFlowState {
  currentStepIndex: number;
  enabledSteps: string[];
  sessionData: MorningMeetingSessionData;
  hubSettings: MorningMeetingSettings;
}

export interface MorningMeetingFlowProps {
  students: Student[];
  staff?: any[];
  onComplete: () => void;
  onNavigateHome?: () => void;
}

// Step metadata for flow management
export const MORNING_MEETING_STEPS = {
  welcome: {
    name: 'Welcome',
    icon: '👋',
    component: 'WelcomeStep',
    required: false
  },
  attendance: {
    name: 'Attendance',
    icon: '📋',
    component: 'AttendanceStep',
    required: true
  },
  behavior: {
    name: 'Behavior',
    icon: '⭐',
    component: 'BehaviorStep',
    required: false
  },
  calendarMath: {
    name: 'Calendar Math',
    icon: '📅',
    component: 'CalendarMathStep',
    required: false
  },
  weather: {
    name: 'Weather',
    icon: '🌤️',
    component: 'WeatherStep',
    required: false
  },
  seasonal: {
    name: 'Seasonal Learning',
    icon: '🍂',
    component: 'SeasonalStep',
    required: false
  }
} as const;

export type StepKey = keyof typeof MORNING_MEETING_STEPS;

// Default settings
export const DEFAULT_MORNING_MEETING_SETTINGS: MorningMeetingSettings = {
  welcomePersonalization: {
    schoolName: '',
    teacherName: '',
    className: '',
    customMessage: undefined
  },
  videos: {
    weatherClothing: [],
    seasonalLearning: [],
    behaviorCommitments: [],
    calendarMath: []
  },
  customVocabulary: {
    weather: ['sunny', 'cloudy', 'rainy', 'snowy', 'windy', 'foggy'],
    seasonal: ['spring', 'summer', 'fall', 'winter', 'leaves', 'flowers'],
    calendar: ['yesterday', 'today', 'tomorrow', 'week', 'month', 'ordinal']
  },
  behaviorStatements: {
    enabled: true,
    statements: [
      'I will be kind to others',
      'I will listen when others are speaking',
      'I will do my best work',
      'I will help others when they need it',
      'I will follow classroom rules'
    ],
    allowCustom: true
  },
  weatherAPI: {
    enabled: false,
    customVocabulary: ['sunny', 'cloudy', 'rainy', 'snowy', 'windy']
  },
  calendarMath: {
    enableOrdinalNumbers: true,
    enableYesterday: true,
    enableTomorrow: true,
    autoAdvanceSeconds: 8
  },
  seasonalLearning: {
    enabled: true,
    currentSeason: 'fall',
    activities: []
  },
  flowCustomization: {
    enabledSteps: {
      welcome: true,
      attendance: true,
      behavior: true,
      calendarMath: true,
      weather: true,
      seasonal: true
    },
    stepOrder: ['welcome', 'attendance', 'behavior', 'calendarMath', 'weather', 'seasonal']
  }
};
