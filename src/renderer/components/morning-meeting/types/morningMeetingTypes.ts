// src/renderer/components/morning-meeting/types/morningMeetingTypes.ts

export interface Student {
  id: string;
  name: string;
  photo?: string;
  birthday?: string; // Added for CelebrationStep
}

export interface HubSettings {
  videos?: {
    calendarMath?: { name: string; url: string }[];
    weatherClothing?: { name: string; url: string }[];
    seasonalLearning?: { name: string; url: string }[];
    behaviorCommitments?: { name: string; url: string }[];
  };
  behaviorStatements?: {
    enabled: boolean;
    statements: { id: string; text: string; emoji: string }[];
    allowCustom: boolean;
  };
  celebrations?: {
    enabled: boolean;
    showBirthdayPhotos: boolean;
    customCelebrations?: { id: string; name: string; message: string; emoji: string }[]; // Updated for CelebrationStep
  };
  weatherAPI?: {
    enabled: boolean;
    apiKey?: string;
    zipCode?: string;
    customVocabulary?: string[];
  };
  flowCustomization?: {
    morningMeeting?: string[];
    enabledSteps?: { [key: string]: boolean }; // Added for SmartboardDisplay
  };
  // Added missing settings sections
  welcomePersonalization?: {
    teacherName?: string;
    schoolName?: string;
    className?: string;
    customMessage?: string;
  };
  classroomRules?: {
    rules: { id: string; text: string; emoji: string }[];
  };
  dailyAnnouncements?: { id: string; text: string; date: string }[];
}

// The single source of truth for step props
export interface MorningMeetingStepProps {
  students?: Student[];
  hubSettings?: HubSettings;
  currentDate: Date;
  onDataUpdate: (data: any) => void;
  stepData?: any;
  onStepComplete?: () => void;
  onNext?: () => void;
  onBack?: () => void;
}

// Data types for each step
export interface BehaviorStepData {
  commitments: { studentId: string; statementId: string }[];
  completedAt?: string;
}
export interface WeatherStepData { /* ... */ }
export interface CalendarMathStepData { /* ... */ }
export interface SeasonalStepData { /* ... */ }
// ... add other specific data types as you build them out