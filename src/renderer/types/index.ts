// Main view types
export type ViewType = 'builder' | 'display' | 'students' | 'staff' | 'library' | 'celebrations' | 'settings';

// Schedule category type
export type ScheduleCategory = 'academic' | 'social' | 'break' | 'special' | 'routine' | 'therapy' | 'custom' | 'creative' | 'movement' | 'holiday' | 'mixed' | 'resource' | 'transition';

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
  workingStyle?: 'independent' | 'collaborative' | 'guided' | 'needs-support';
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
  status: 'draft' | 'active' | 'completed' | 'archived';
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