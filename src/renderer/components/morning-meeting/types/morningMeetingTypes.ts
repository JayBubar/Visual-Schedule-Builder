// Morning Meeting Types
// Complete type definitions for all Morning Meeting functionality

export interface Student {
  id: string;
  name: string;
  photo?: string;
  present?: boolean;
  grade?: string;
  birthday?: string;
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  permissions?: string[];
}

// Base props that all step components receive
export interface MorningMeetingStepProps {
  currentDate: Date;
  onNext: () => void;
  onBack: () => void;
  onDataUpdate: (data: any) => void;
  stepData?: any;
  hubSettings?: HubSettings;
  students?: Student[];
  staff?: StaffMember[];
}

// Hub Settings Interface
export interface HubSettings {
  welcomePersonalization?: {
    schoolName: string;
    teacherName: string;
    className: string;
    customMessage?: string;
  };
  customVocabulary?: {
    weather: string[];
    seasonal: string[];
    calendar: string[]; // ✅ ADDED: Calendar vocabulary
  };
  videos: {
    calendarMath: Array<{ id: string; name: string; url: string; }>;
    weatherClothing: Array<{ id: string; name: string; url: string; }>;
    seasonalLearning: Array<{ id: string; name: string; url: string; }>;
    behaviorCommitments: Array<{ id: string; name: string; url: string; }>;
  };
  behaviorStatements: {
    enabled: boolean;
    statements: string[];
    allowCustom: boolean;
  };
  celebrations: {
    enabled: boolean;
    showBirthdayPhotos: boolean;
    customCelebrations: Celebration[];
  };
  flowCustomization: {
    enabledSteps: Record<string, boolean>;
  };
  calendarMath?: { // ✅ ADDED: Calendar Math settings
    enableOrdinalNumbers: boolean;
    enableYesterday: boolean;
    enableTomorrow: boolean;
    enableWeekdays: boolean;
    enableMonths: boolean;
    enableCounting: boolean;
  };
  weatherAPI?: {
    enabled: boolean;
    apiKey?: string;
    customVocabulary?: string[];
  };
  classroomRules?: {
    rules: Array<{
      id: string;
      title: string;
      description: string;
      emoji: string;
      explanation: string;
    }>;
  };
  dailyAnnouncements?: DailyAnnouncements[];
}

// Individual Step Data Interfaces
export interface WelcomeStepData {
  welcomeMessage: string;
  classInfo: {
    schoolName: string;
    teacherName: string;
    className: string;
  };
  showedGreeting: boolean;
  completedAt?: string;
}

export interface AttendanceStepData {
  presentStudents: string[];
  absentStudents: string[];
  attendanceNotes?: Record<string, string>;
  completedAt?: string;
}

export interface BehaviorStepData {
  currentRuleIndex?: number;
  learnedRules?: string[];
  completedAt?: string;
  totalRules?: number;
}

export interface CalendarMathStepData {
  currentDate: Date;
  weatherCondition?: string;
  selectedActivities: string[];
  mathConcepts: string[];
  completedSections: string[];
  currentSection: string;
  currentLevel: 'day' | 'week' | 'month'; // ✅ ADDED: Current difficulty level
  completedLevels: string[]; // ✅ ADDED: Completed difficulty levels
  timeSpentSeconds: number; // ✅ ADDED: Time tracking
  completedAt?: string;
}

export interface WeatherStepData {
  currentWeather: {
    temperature: number;
    temperatureUnit: string;
    condition: string;
    clothingRecommendations: string[];
    humidity?: number;
    description?: string;
  };
  selectedClothing: string[];
  customVocabulary: string[];
  sectionProgress?: {
    weatherRevealed: boolean;
    clothingGameComplete: boolean;
    currentSection: number;
  };
  completedAt?: string;
}

export interface SeasonalStepData {
  currentSeason: string;
  currentSection: 'characteristics' | 'vocabulary' | 'activities';
  completedSections: string[];
  completedActivities: string[];
  learnedVocabulary: string[];
  completedAt?: string;
}

export interface CelebrationStepData {
  todaysBirthdays: string[];
  customCelebrations: string[];
  celebrationMessages: Record<string, string>;
  showedCelebrations: boolean;
  completedAt?: string;
}

// ✅ ADDED: DayReviewStep Data Interface
export interface DayReviewStepData {
  selectedGoals: string[];
  reflectionAnswers: Record<string, string>;
  currentSection: 'goals' | 'reflection' | 'summary';
  completedAt?: string;
}

// Supporting Types
export interface DailyAnnouncements {
  date: string; // toDateString() format
  announcements: {
    text: string;
    icon?: string;
    type?: 'info' | 'warning' | 'celebration';
  }[];
}

export interface Celebration {
  id: string;
  name: string;
  emoji: string;
  message: string;
  type: 'birthday' | 'custom';
  recurring?: boolean;
  date?: string;
  students: string[];
  createdAt: string;
}

export interface VideoContent {
  id: string;
  name: string;
  url: string;
  category: 'weather' | 'seasonal' | 'behavior' | 'calendar';
  tags?: string[];
  duration?: number;
  description?: string;
}

export interface BehaviorCommitment {
  id: string;
  statement: string;
  category: 'kindness' | 'responsibility' | 'respect' | 'effort' | 'safety';
  icon: string;
  selected?: boolean;
}

export interface WeatherCondition {
  code: string;
  description: string;
  icon: string;
  clothingRecommendations: string[];
}

export interface SeasonalActivity {
  id: string;
  title: string;
  description: string;
  emoji: string;
  category: 'vocabulary' | 'observation' | 'movement' | 'science' | 'art';
  duration: string;
  instructions: string[];
}

// ✅ ADDED: Day Review Types
export interface DayGoal {
  id: string;
  category: 'learning' | 'behavior' | 'teamwork' | 'personal';
  icon: string;
  title: string;
  description: string;
  selected: boolean;
}

export interface ReflectionPrompt {
  id: string;
  question: string;
  emoji: string;
  category: 'gratitude' | 'learning' | 'friendship' | 'growth';
}

// Session and Progress Tracking
export interface MorningMeetingSession {
  id: string;
  date: Date;
  startTime: Date;
  endTime?: Date;
  completedSteps: string[];
  stepData: Record<string, any>;
  hubSettings: HubSettings;
  participants: {
    presentStudents: string[];
    absentStudents: string[];
    staff: string[];
  };
  status: 'in_progress' | 'completed' | 'interrupted';
}

export interface StepProgress {
  stepKey: string;
  startTime: Date;
  endTime?: Date;
  data: any;
  isCompleted: boolean;
  timeSpent?: number; // in seconds
}

// Validation and Error Types
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface MorningMeetingError {
  code: string;
  message: string;
  stepKey?: string;
  timestamp: Date;
  context?: Record<string, any>;
}

// Settings and Configuration
export interface MorningMeetingConfiguration {
  defaultDuration: number; // in minutes
  allowSkipSteps: boolean;
  requireDataCollection: boolean;
  autoSaveInterval: number; // in seconds
  enableVideoSupport: boolean;
  enableWeatherAPI: boolean;
  theme: 'default' | 'seasonal' | 'custom';
  language: string;
  accessibility: {
    highContrast: boolean;
    largeText: boolean;
    screenReader: boolean;
    reducedMotion: boolean;
  };
}

// Export and Import Types
export interface MorningMeetingExport {
  metadata: {
    exportDate: Date;
    version: string;
    source: string;
  };
  sessions: MorningMeetingSession[];
  configuration: MorningMeetingConfiguration;
  hubSettings: HubSettings;
}

// Analytics and Reporting
export interface MorningMeetingAnalytics {
  period: {
    start: Date;
    end: Date;
  };
  totalSessions: number;
  averageDuration: number;
  completionRate: number;
  stepAnalytics: Record<string, {
    completionRate: number;
    averageTimeSpent: number;
    mostCommonIssues: string[];
  }>;
  studentParticipation: Record<string, {
    attendanceRate: number;
    engagementScore: number;
    behaviorCommitments: string[];
  }>;
  trendData: {
    date: Date;
    metric: string;
    value: number;
  }[];
}

// API Response Types (for future integration)
export interface WeatherAPIResponse {
  temperature: number;
  temperatureUnit: 'F' | 'C';
  condition: string;
  humidity: number;
  windSpeed: number;
  description: string;
  icon: string;
  clothingRecommendations: string[];
}

export interface VideoAPIResponse {
  videos: VideoContent[];
  totalCount: number;
  categories: string[];
  tags: string[];
}

// Component State Types
export interface MorningMeetingFlowState {
  currentStepIndex: number;
  enabledSteps: string[];
  stepData: Record<string, any>;
  session: MorningMeetingSession;
  isLoading: boolean;
  errors: MorningMeetingError[];
}

export interface MorningMeetingHubState {
  activeSection: string;
  settings: HubSettings;
  hasUnsavedChanges: boolean;
  isLoading: boolean;
  availableContent: {
    videos: VideoContent[];
    activities: any[];
    templates: any[];
  };
}

// Event Types
export interface MorningMeetingEvent {
  type: 'step_started' | 'step_completed' | 'step_skipped' | 'session_started' | 'session_completed' | 'error_occurred';
  timestamp: Date;
  stepKey?: string;
  data?: any;
  metadata?: Record<string, any>;
}

// Utility Types
export type StepKey = 
  | 'welcome'
  | 'attendance'
  | 'behavior'
  | 'calendarMath'
  | 'weather'
  | 'seasonal'
  | 'celebration'
  | 'dayReview'; // ✅ ADDED BACK

export type StepComponent = React.ComponentType<MorningMeetingStepProps>;

export type StepDataType = 
  | WelcomeStepData
  | AttendanceStepData
  | BehaviorStepData
  | CalendarMathStepData
  | WeatherStepData
  | SeasonalStepData
  | CelebrationStepData
  | DayReviewStepData; // ✅ ADDED BACK

// Helper type for type-safe step data access
export type StepDataMap = {
  welcome: WelcomeStepData;
  attendance: AttendanceStepData;
  behavior: BehaviorStepData;
  calendarMath: CalendarMathStepData;
  weather: WeatherStepData;
  seasonal: SeasonalStepData;
  celebration: CelebrationStepData;
  dayReview: DayReviewStepData; // ✅ ADDED BACK
};

// Generic type for getting step data by key
export type GetStepData<K extends StepKey> = StepDataMap[K];
