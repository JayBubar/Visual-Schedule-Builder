// ===== VIEW TYPES =====
// ✅ FIXED: Added 'reports', 'iep-goals', and 'start' to ViewType enum
export type ViewType = 
  | 'builder' 
  | 'display' 
  | 'students' 
  | 'staff' 
  | 'iep-goals'      // ✅ ADDED - IEP Goals management
  | 'calendar' 
  | 'library' 
  | 'data-collection' 
  | 'reports'        // ✅ ADDED - this was missing!
  | 'smart-groups'  
  | 'settings'
  | 'start';         // ✅ ADDED - Start screen view

// Schedule category type
export type ScheduleCategory = 'academic' | 'social' | 'break' | 'special' | 'routine' | 'therapy' | 'custom' | 'creative' | 'movement' | 'holiday' | 'mixed' | 'resource' | 'transition' | 'sensory' | 'system';

// Staff interface
export interface Staff {
  id: string;
  name: string;
  role: string;
  photo?: string;
  email?: string;
  phone?: string;
  specialties?: string[];
  notes?: string;
  isActive?: boolean;
  startDate?: string;
  status?: 'active' | 'inactive' | 'substitute' | 'absent';
  isMainTeacher?: boolean;
  isResourceTeacher?: boolean;      // NEW: For pull-out services
  isRelatedArtsTeacher?: boolean;   // NEW: For teachers who come to classroom
  emergencyContact?: string;
  certifications?: string[];
  photoFileName?: string;
  schedule?: any;
  createdAt?: string;
  updatedAt?: string;
}

// Student interface
export interface Student {
  id: string;
  name: string;
  photo?: string;
  avatar?: string;  // Add avatar support
  grade?: string;
  readingLevel?: 'emerging' | 'developing' | 'proficient' | 'advanced';
  accommodations?: string[];
  notes?: string;
  parentContact?: string;
  emergencyContact?: string;
  allergies?: string[];
  isActive?: boolean;
  skillLevel?: 'low' | 'medium' | 'high' | 'emerging' | 'developing' | 'proficient' | 'advanced';
  workingStyle: string;
  preferredPartners?: string[];
  avoidPartners?: string[];
  iep?: boolean;
  behaviorNotes?: string;
  parentName?: string;
  parentEmail?: string;
  parentPhone?: string;
  medicalNotes?: string;
  photoFileName?: string;
  createdAt?: string;
  updatedAt?: string;
  goals?: string[];
  resourceInfo?: {
    attendsResource: boolean;
    resourceType: string;
    resourceTeacher: string;
    timeframe: string;
  };
}

// Unified Student interface (extends Student with celebration features)
export interface UnifiedStudent extends Student {
  birthday?: string; // 'YYYY-MM-DD' format
  allowBirthdayDisplay?: boolean; // Direct property for easier access
  allowPhotoInCelebrations?: boolean; // Direct property for easier access
  celebrationPreferences?: {
    allowBirthdayDisplay: boolean;
    customCelebrationMessage?: string;
  };
}

// Custom Celebration interface
export interface CustomCelebration {
  id: string;
  title: string;
  message: string;
  date: string;
  isRecurring: boolean;
  emoji: string;
  enabled: boolean;
  createdAt: string;
}

// Group interface
export interface Group {
  id: string;
  name: string;
  staffId: string;
  students: string[];
  color: string;
  description?: string;
}

// Student Group interface (extends Group with additional properties)
export interface StudentGroup extends Group {
  label?: string;
  studentIds?: string[];
  groupType?: 'academic' | 'social' | 'therapy' | 'behavior' | 'mixed';
  maxSize?: number;
  minSize?: number;
  targetSkills?: string[];
  isTemplate?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// 🔧 NEW: Group Assignment interface for SmartboardDisplay
export interface GroupAssignment {
  id: string;
  groupName: string;
  color: 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'yellow' | string;
  staffMember?: {
    id: string;
    name: string;
    role: string;
    avatar?: string;
    photo?: string;
  } | null;
  studentIds: string[];
  staffId?: string;
  location?: string;
  activityVariation?: string;
  notes?: string;
  isIndependent?: boolean;
  groupType?: string;
  targetSkills?: string[];
}

// 🔧 ENHANCED: Assignment interface with groupAssignments
export interface Assignment {
  isWholeClass: boolean;
  groups?: Group[];
  groupIds?: string[];
  staffIds?: string[];
  notes?: string;
  groupingType?: 'whole-class' | 'small-groups' | 'individual' | 'flexible';
  // 🎯 CRITICAL: Add groupAssignments to Assignment interface
  groupAssignments?: GroupAssignment[];
}

// Activity Assignment interface
export interface ActivityAssignment extends Assignment {}

// Activity interface
export interface Activity {
  id: string;
  name: string;
  emoji?: string;
  icon?: string;
  duration: number;
  category: ScheduleCategory;
  description?: string;
  materials?: string[];
  instructions?: string;
  staff?: Staff[];
  students?: Student[];
  assignment?: Assignment;
  isCustom?: boolean;
  tags?: string[];
  difficulty?: string;
  createdAt?: string;
  updatedAt?: string;
  // New group assignment properties
  groupingType?: 'whole-class' | 'small-groups' | 'individual' | 'flexible';
  groupAssignments?: GroupAssignment[];
  accommodations?: string[];
  adaptations?: string[];
  
  // 🎯 NEW: Transition properties (optional for all activities)
  isTransition?: boolean;
  transitionType?: 'animated-countdown' | 'brain-break' | 'cleanup-prep' | 'movement-break';
  animationStyle?: 'running-kids' | 'floating-shapes' | 'bouncing-balls' | 'organizing-items' | 'dancing-emojis';
  showNextActivity?: boolean;
  movementPrompts?: string[];
  autoStart?: boolean;
  soundEnabled?: boolean;
  customMessage?: string;
}

// 🎯 NEW: Transition-specific interface
export interface TransitionActivity extends Activity {
  isTransition: true;
  transitionType: 'animated-countdown' | 'brain-break' | 'cleanup-prep' | 'movement-break';
  animationStyle: 'running-kids' | 'floating-shapes' | 'bouncing-balls' | 'organizing-items' | 'dancing-emojis';
  showNextActivity: boolean;
  movementPrompts: string[];
  autoStart?: boolean;
  soundEnabled?: boolean;
  customMessage?: string;
}

// Saved Activity interface (extends Activity)
export interface SavedActivity extends Activity {}

// Schedule Activity interface (alias for Activity)
export interface ScheduleActivity extends Activity {}

// Schedule Item interface (alias for Activity)
export interface ScheduleItem extends Activity {}

// Schedule variation types
export type ScheduleType = 'daily' | 'special-event' | 'time-variation' | 'emergency';

// Schedule variation interface
export interface ScheduleVariation {
  id: string;
  name: string;
  type: ScheduleType;
  category?: ScheduleCategory;
  activities: SavedActivity[];
  startTime: string;
  endTime?: string;
  totalDuration?: number;
  color?: string;
  icon?: string;
  createdAt: string;
  lastUsed?: string;
  usageCount?: number;
  description?: string;
  tags?: string[];
  applicableDays?: string[];
  isDefault?: boolean;
}

// Schedule interface
export interface Schedule {
  id: string;
  name: string;
  date?: string;
  startTime: string;
  endTime?: string;
  activities: SavedActivity[];
  templateId?: string;
  notes?: string;
  status?: 'draft' | 'active' | 'completed' | 'archived'; // Changed to optional
  createdAt: string;
  updatedAt: string;
  description?: string;
  tags?: string[];
  totalDuration?: number;
  activityCount?: number;
  isTemplate?: boolean;
  templateType?: 'academic' | 'therapy' | 'holiday' | 'custom' | 'half-day';
  version?: string;
}

// Saved schedule interface (for persistence)
export interface SavedSchedule {
  id: string;
  name: string;
  date?: string;
  startTime: string;
  activities: SavedActivity[];
  templateId?: string;
  notes?: string;
  status?: 'draft' | 'active' | 'completed' | 'archived';
  createdAt: string;
  updatedAt?: string;
  description?: string;
  tags?: string[];
  totalDuration?: number;
  activityCount?: number;
  isTemplate?: boolean;
  templateType?: 'academic' | 'therapy' | 'holiday' | 'custom' | 'half-day';
  version?: string;
}

// Schedule template interface
export interface ScheduleTemplate {
  id: string;
  name: string;
  description?: string;
  category?: ScheduleCategory;
  activities: SavedActivity[];
  startTime: string;
  totalDuration?: number;
  isTemplate: true;
  templateType?: 'academic' | 'therapy' | 'holiday' | 'custom' | 'half-day';
  tags?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  isPublic?: boolean;
  usageCount?: number;
  activityCount?: number;
  createdAt: string;
  updatedAt?: string;
  version?: string;
  date?: string;
  status?: 'draft' | 'active' | 'completed' | 'archived';
  notes?: string;
  targetGrade?: string;
  targetSkills?: string[];
}

// Activity library item
export interface ActivityLibraryItem {
  id: string;
  name: string;
  emoji: string;
  icon?: string;
  category: ScheduleCategory;
  defaultDuration: number;
  description?: string;
  materials?: string[];
  instructions?: string;
  isCustom: boolean;
  tags?: string[];
  ageGroup?: 'elementary' | 'middle' | 'high' | 'adult' | 'all';
  difficulty?: 'easy' | 'medium' | 'hard';
  
  // 🎯 NEW: Transition properties for library items
  isTransition?: boolean;
  transitionType?: 'animated-countdown' | 'brain-break' | 'cleanup-prep' | 'movement-break';
  animationStyle?: 'running-kids' | 'floating-shapes' | 'bouncing-balls' | 'organizing-items' | 'dancing-emojis';
  showNextActivity?: boolean;
  movementPrompts?: string[];
  autoStart?: boolean;
  soundEnabled?: boolean;
  customMessage?: string;
  
  // Calendar/Choice-related properties
  isChoiceEligible?: boolean;
  choiceProperties?: {
    maxStudents: number;
    minAge?: number;
    maxAge?: number;
    requiresSupervision: boolean;
    isIndoor: boolean;
    setupTime: number;
    cleanupTime: number;
    skillLevel?: string;
    staffSupervision?: string;
    socialInteraction?: string;
    quietActivity?: boolean;
    messyActivity?: boolean;
    preparationTime?: number;
    [key: string]: any;
  };
  usageStats?: {
    timesChosen: number;
    lastUsed?: string;
    averageRating?: number;
    [key: string]: any;
  };
  recommendationTags?: {
    energyLevel: 'low' | 'medium' | 'high';
    groupSize: 'individual' | 'small' | 'large';
    noiseLevel: 'quiet' | 'moderate' | 'loud';
    messiness: 'clean' | 'moderate' | 'messy';
    timeOfDay?: string;
    academicConnection?: string[];
    sensoryInput?: string;
    [key: string]: any;
  };
}

// Photo upload result interface
export interface PhotoUploadResult {
  success: boolean;
  url?: string;
  error?: string;
  file?: File;
  dataUrl?: string;
  fileName?: string;
}

// Celebration animation types
export type CelebrationStyle = 'gentle' | 'excited';

export interface CelebrationSettings {
  style: CelebrationStyle;
  duration: number;
  sound: boolean;
  volume: number;
}

// Settings interfaces
export interface AppSettings {
  theme: 'light' | 'dark' | 'high-contrast';
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  animations: boolean;
  soundEffects: boolean;
  volume: number;
  autoSave: boolean;
  celebrationSettings: CelebrationSettings;
}

// Data export/import interfaces
export interface ExportData {
  schedules: SavedSchedule[];
  templates: ScheduleTemplate[];
  activities: ActivityLibraryItem[];
  students: Student[];
  staff: Staff[];
  settings: AppSettings;
  exportDate: string;
  version: string;
}

// Component prop interfaces
export interface ComponentProps {
  isActive: boolean;
}

export interface NavigationProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  selectedSchedule?: ScheduleVariation | null;
}

// Error handling
export interface AppError {
  id: string;
  message: string;
  type: 'warning' | 'error' | 'info';
  timestamp: string;
  resolved?: boolean;
}

// Group Management Types
export interface StaffMember {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;        // Added required property
  specialties: string[]; // Added required property (renamed from specializations)
  photo: string | null;
  isActive: boolean;    // Added required property
  startDate: string;    // Added required property
  notes?: string;       // Added optional property
  isResourceTeacher: boolean;      // NEW: For pull-out services (Speech, OT, PT, etc.)
  isRelatedArtsTeacher: boolean;   // NEW: For teachers who come to classroom (Art, Music, PE, etc.)
  avatar?: string;      // Keep existing optional property
  color?: string;       // Keep existing optional property
  schedule?: string[];  // Keep existing optional property (Available time slots)
}

export type GroupingType = 'whole-class' | 'small-groups' | 'individual' | 'flexible';

// Enhanced Activity Interface
export interface EnhancedActivity extends Activity {
  groupingType: GroupingType;
  groupAssignments: GroupAssignment[];
  accommodations?: string[];
  adaptations?: string[];
}

export interface GroupTemplate {
  id: string;
  name: string;
  description: string;
  groupCount: number;
  suggestedColors: string[];
  typicalUse: string;
}

// Calendar and Daily Check-In Interfaces
export interface WeatherData {
  temperature: number;
  condition: string;
  icon: string;
  description: string;
  humidity?: number;
  windSpeed?: number;
  location: string;
  lastUpdated?: string;
  temperatureUnit?: 'F' | 'C';
  apiSource?: string;
  timestamp?: string;
  [key: string]: any;
}

export interface CalendarSettings {
  showWeather: boolean;
  weatherLocation: string;
  showBehaviorCommitments: boolean;
  showIndependentChoices: boolean;
  showDailyHighlights: boolean;
  enableSoundEffects: boolean;
  autoSaveInterval: number;
  defaultView: 'dashboard' | 'commitments' | 'choices' | 'highlights' | 'day';
  weatherUpdateInterval?: number;
  weatherApiKey?: string;
  temperatureUnit?: 'F' | 'C';
  behaviorCategories?: string[];
  independentChoiceCategories?: string[];
  customCelebrations?: CustomCelebration[];
  birthdayDisplayMode?: 'photo' | 'name' | 'both';
  weekendBirthdayHandling?: 'friday' | 'monday' | 'exact';
  [key: string]: any;
}

export interface StudentBehaviorChoice {
  id?: string;
  studentId: string;
  behaviorGoal?: string;
  commitment: string;
  isCompleted?: boolean;
  completed?: boolean;
  completedAt?: string;
  notes?: string;
  achieved?: boolean;
  category?: string;
  selectedAt?: string;
  commitmentId?: string;
  timestamp?: string;
  studentName?: string;
  studentPhoto?: string;
  date?: string;
  [key: string]: any;
}

export interface ActivityHighlight {
  id: string;
  activityId: string;
  activityName: string;
  studentId?: string;
  studentName?: string;
  achievement?: string;
  description?: string;
  timestamp: string;
  category?: 'academic' | 'behavioral' | 'social' | 'creative' | 'physical';
  staffMember?: string;
  photo?: string;
  emoji?: string;
  studentIds?: string[];
  studentReactions?: any[];
  highlight?: string;
  [key: string]: any;
}

export interface Achievement {
  id: string;
  studentId: string;
  title: string;
  description: string;
  category: 'academic' | 'behavioral' | 'social' | 'creative' | 'physical';
  timestamp: string;
  staffMember?: string;
  photo?: string;
  isShared: boolean;
  icon?: string;
  date?: string;
  [key: string]: any;
}

export interface DailyCheckIn {
  id: string;
  date: string;
  weatherData?: WeatherData;
  weather?: WeatherData;
  behaviorCommitments?: StudentBehaviorChoice[];
  independentChoices?: string[];
  dailyHighlights?: ActivityHighlight[];
  achievements?: Achievement[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  yesterdayHighlights?: ActivityHighlight[];
  studentChoices?: any[];
  independentActivitiesSelected?: any[];
  behaviorCommitmentsSelected?: any[];
  dailyHighlightsSelected?: any[];
  [key: string]: any;
}

export interface ChoiceFilter {
  category?: ScheduleCategory;
  difficulty?: 'easy' | 'medium' | 'hard';
  maxDuration?: number;
  requiresSupervision?: boolean;
  isIndoor?: boolean;
  maxStudents?: number;
  quietActivity?: boolean;
  skillLevel?: string;
  [key: string]: any;
}

// ===== ENHANCED IEP DATA COLLECTION TYPES =====
// Enhanced for SMART goals and educator workflow

export interface IEPGoal {
  id: string;
  studentId: string;
  domain: 'academic' | 'behavioral' | 'social-emotional' | 'physical' | 'communication' | 'adaptive';
  description: string;
  measurableObjective: string;
  measurementType: 'percentage' | 'frequency' | 'duration' | 'rating' | 'yes-no' | 'independence';
  targetCriteria: string;
  dataCollectionSchedule: string;
  
  // SMART Goal Enhancement
  title: string;
  shortTermObjective: string;
  criteria: string;
  target: number; // Annual target value
  priority: 'high' | 'medium' | 'low';
  dateCreated: string;
  lastDataPoint?: string;
  dataPoints: number;
  currentProgress: number;
  
  // Nine-week milestones for progress monitoring
  nineWeekMilestones?: {
    quarter1: { target: number; actual?: number; notes?: string };
    quarter2: { target: number; actual?: number; notes?: string };
    quarter3: { target: number; actual?: number; notes?: string };
    quarter4: { target: number; actual?: number; notes?: string };
  };
  
  // Goal inheritance tracking
  inheritedFrom?: {
    previousGoalId: string;
    previousYear: string;
    carryOverReason: string;
    modifications: string[];
  };
  
  // Administrative compliance
  iepMeetingDate?: string;
  reviewDates?: string[];
  complianceNotes?: string;
  
  baseline?: {
    value: number;
    date: string;
    notes?: string;
  };
  isActive: boolean;
  createdDate: string;
  lastUpdated: string;
  linkedActivityIds?: string[];
}

export interface DataPoint {
  id: string;
  goalId: string;
  studentId: string;
  date: string;
  time: string;
  value: number;
  totalOpportunities?: number; // For trial-based data (X out of Y)
  notes?: string;
  context?: string;
  activityId?: string;
  collector: string;
  photos?: string[];
  voiceNotes?: string[];
}

// Enhanced data point for trial-based entry and administrative needs
export interface EnhancedDataPoint extends DataPoint {
  // Trial-based data entry
  trialsCorrect?: number;
  trialsTotal?: number;
  trialDetails?: {
    trial: number;
    correct: boolean;
    response?: string;
    promptLevel?: 'independent' | 'verbal' | 'gestural' | 'physical';
  }[];
  
  // Administrative documentation
  sessionType: 'instruction' | 'practice' | 'assessment' | 'generalization';
  environmentalFactors?: string[];
  accommodationsUsed?: string[];
  behaviorNotes?: string;
  
  // Progress monitoring
  confidenceLevel: 'low' | 'medium' | 'high';
  masteryIndicator?: boolean;
  nextSteps?: string;
  
  // Auto-calculated fields
  percentageCorrect?: number;
  sessionDuration?: number;
  dataQuality: 'excellent' | 'good' | 'fair' | 'poor';
}

// Nine-week period calculation
export interface SchoolYearPeriod {
  year: string; // "2024-2025"
  startDate: string;
  endDate: string;
  quarters: {
    q1: { start: string; end: string; weekNumber: number };
    q2: { start: string; end: string; weekNumber: number };
    q3: { start: string; end: string; weekNumber: number };
    q4: { start: string; end: string; weekNumber: number };
  };
}

// Goal inheritance tracking
export interface GoalInheritance {
  currentGoalId: string;
  previousGoals: {
    goalId: string;
    year: string;
    finalProgress: number;
    carryOverReason: 'not-mastered' | 'partial-mastery' | 'new-environment' | 'skill-refinement';
    modifications: string[];
  }[];
  continuityNotes: string;
}

export interface IEPProgress {
  goalId: string;
  studentId: string;
  currentLevel: number;
  targetLevel: number;
  progressPercentage: number;
  trend: 'improving' | 'maintaining' | 'declining';
  lastThreeDataPoints: DataPoint[];
  averagePerformance: number;
  meetingCriteria: boolean;
}

export interface IEPReport {
  id: string;
  studentId: string;
  goalIds: string[];
  reportType: 'weekly' | 'monthly' | 'quarterly' | 'annual';
  startDate: string;
  endDate: string;
  generatedDate: string;
  summary: string;
  progressData: IEPProgress[];
  recommendations: string[];
}

export interface DataCollectionSession {
  id: string;
  studentId: string;
  date: string;
  startTime: string;
  endTime: string;
  activityId?: string;
  goalsAddressed: string[];
  dataPoints: DataPoint[];
  sessionNotes?: string;
  collector: string;
}

export interface MeasurementConfig {
  type: 'frequency' | 'accuracy' | 'duration' | 'independence' | 'rating';
  unit?: string;
  scale?: {
    min: number;
    max: number;
    labels?: string[];
  };
  prompt?: string;
}

export interface StudentWithIEP extends Student {
  hasIEP: true;
  iepGoals: IEPGoal[];
  dataCollectionSessions: DataCollectionSession[];
  progressSummaries: IEPProgress[];
  iepStartDate: string;
  iepEndDate: string;
  iepReviewDate?: string;
  caseManager?: string;
  relatedServices?: string[];
}

// Additional calendar types
export interface ActivityPreview {
  id: string;
  name: string;
  emoji: string;
  duration: number;
  category: ScheduleCategory;
  description?: string;
  isScheduled?: boolean;
  scheduledTime?: string;
  activityId?: string;
  activityName?: string;
  icon?: string;
  startTime?: string;
  groupAssignments?: GroupAssignment[];
  isSpecial?: boolean;
  status?: 'completed' | 'active' | 'upcoming' | 'current';
  [key: string]: any;
}

export interface ChoiceRecommendation {
  activityId: string;
  score: number;
  reasons: string[];
  [key: string]: any;
}

export interface ChoiceAnalytics {
  timesUsed: number;
  averageRating: number;
  studentPreferences: { [studentId: string]: number };
  [key: string]: any;
}

// ===== REPORT INTERFACES =====
// New interfaces to support the Reports component

export interface ReportData {
  id: string;
  type: ReportType;
  title: string;
  generatedAt: string;
  dateRange: {
    start: string;
    end: string;
  };
  data: any; // Flexible data structure for different report types
  metadata?: {
    totalRecords: number;
    filters: string[];
    exportFormat?: 'pdf' | 'csv' | 'json';
  };
}

export type ReportType = 
  | 'student-progress' 
  | 'schedule-usage' 
  | 'activity-analytics' 
  | 'iep-goals' 
  | 'staff-utilization'
  | 'weekly-summary'
  | 'monthly-overview';

export interface ReportFilter {
  studentId?: string;
  dateRange: 'week' | 'month' | 'quarter' | 'year';
  includeInactive?: boolean;
  categories?: string[];
}

export interface ProgressMetric {
  studentId: string;
  goalId: string;
  currentValue: number;
  targetValue: number;
  progressPercentage: number;
  lastUpdated: string;
  trend: 'improving' | 'declining' | 'stable';
}

export interface ActivityUsageStats {
  activityId: string;
  activityName: string;
  usageCount: number;
  averageDuration: number;
  engagementScore: number;
  lastUsed: string;
  popularTimeSlots: string[];
}

export interface ScheduleAnalytics {
  scheduleId: string;
  scheduleName: string;
  usageFrequency: number;
  averageCompletionTime: number;
  successRate: number;
  mostSkippedActivities: string[];
  peakUsageTimes: string[];
}

// ===== DAILY CHECK-IN SETTINGS INTERFACES =====

export interface BehaviorStatement {
  id: string;
  text: string;
  category: 'kindness' | 'respect' | 'effort' | 'responsibility' | 'safety' | 'learning';
  emoji: string;           // ← Add this
  isActive: boolean;       // ← Add this  
  isDefault: boolean;      // ← Add this (instead of isCustom)
  createdAt: string;
}

export const DEFAULT_BEHAVIOR_STATEMENTS: BehaviorStatement[] = [
  {
    id: 'default-1',
    text: 'I will be kind to my friends',
    category: 'kindness',
    emoji: '🤝',
    isActive: true,
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'default-2', 
    text: 'I will listen carefully',
    category: 'responsibility',
    emoji: '👂',
    isActive: true,
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'default-3',
    text: 'I will try my best',
    category: 'effort',
    emoji: '💪',
    isActive: true,
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'default-4',
    text: 'I will use my words when I need help',
    category: 'learning',
    emoji: '💬',
    isActive: true,
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'default-5',
    text: 'I will keep my hands to myself',
    category: 'safety',
    emoji: '🙌',
    isActive: true,
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'default-6',
    text: 'I will clean up after myself',
    category: 'responsibility',
    emoji: '🧹',
    isActive: true,
    isDefault: true,
    createdAt: new Date().toISOString()
  }
];

export interface CheckInStep {
  id: string;
  name: string;
  component: string;
  enabled: boolean;
  order: number;
  settings?: any;
}

export interface BirthdaySettings {
  enableBirthdayDisplay: boolean;
  birthdayCountdownDays: number;
  weekendBirthdayHandling: 'friday' | 'monday' | 'exact';
  birthdayDisplayMode: 'photo' | 'name' | 'both';
  showBirthdayBadges: boolean;
}

export interface BehaviorCommitmentSettings {
  customStatements: BehaviorStatement[];
  enableStudentCustom: boolean;
  showPhotos: boolean;
}

export interface WelcomeSettings {
  customWelcomeMessage: string;
  showTeacherName: boolean;
  substituteMode: boolean;
  substituteMessage: string;
  schoolName: string;
  className: string;
}

export interface CheckInFlowSettings {
  enableWeather: boolean;
  enableCelebrations: boolean;
  enableBehaviorCommitments: boolean;
  enableChoiceActivities: boolean;
  customSteps: CheckInStep[];
}

// Enhanced CalendarSettings interface
export interface EnhancedCalendarSettings extends CalendarSettings {
  birthdaySettings: BirthdaySettings;
  behaviorCommitments: BehaviorCommitmentSettings;
  welcomeSettings: WelcomeSettings;
  checkInFlow: CheckInFlowSettings;
}

// HubSettings interface - Ensure it's exported from this main types file
export interface HubSettings {
  videos?: {
    calendarMath?: { name: string; url: string }[];
    weather?: { name: string; url: string }[];
    seasonal?: { name: string; url: string }[];
    behaviorCommitments?: { name: string; url: string }[];
  };
  behaviorStatements?: {
    enabled: boolean;
    statements: BehaviorStatement[];
    allowCustom: boolean;
  };
  celebrations?: {
    enabled: boolean;
    showBirthdayPhotos: boolean;
    customCelebrations: CustomCelebration[];
  };
  flowCustomization?: {
    enabledSteps: { [stepId: string]: boolean };
  };
  dailyCheckIn?: EnhancedCalendarSettings;
  [key: string]: any;
}

// Add this to the bottom of src/renderer/types.ts

export type WeatherType = 'sunny' | 'cloudy' | 'rainy' | 'windy' | 'snowy';

export interface WeatherHistory {
  [date: string]: WeatherType;
}

// ===== DETAILED LOG ENTRY STRUCTURE =====

export interface StandardLogEntry {
  standard: string;
  source: string; // e.g., 'CalendarMathStep', 'SeasonalStep'
}

export interface DailyLog {
  [date: string]: {
    standardsCovered: StandardLogEntry[];
  };
}
