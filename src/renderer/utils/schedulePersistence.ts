// Schedule Persistence System
// Provides comprehensive save/load functionality for schedules with templates and export capabilities

import { ScheduleActivity, SavedSchedule, ScheduleTemplate, SavedActivity, GroupTemplate, EnhancedActivity } from '../types';

// Local interfaces for persistence
interface ActivityAssignment {
  staffIds: string[];
  groupIds: string[];
  isWholeClass: boolean;
  notes?: string;
}

interface ScheduleStats {
  totalSchedules: number;
  totalTemplates: number;
  averageDuration: number;
  mostUsedActivities: { name: string; count: number }[];
  recentActivity: string;
}

// Default schedule templates
const DEFAULT_TEMPLATES: ScheduleTemplate[] = [
  {
    id: 'template-academic-full-day',
    name: 'Academic Full Day',
    description: 'Complete academic day with core subjects and breaks',
    startTime: '08:00',
    activities: [
      {
        id: 'morning-meeting',
        name: 'Morning Meeting',
        icon: '🌅',
        emoji: '🌅',
        category: 'routine',
        duration: 15,
        description: 'Circle time and calendar'
      },
      {
        id: 'reading-groups',
        name: 'Reading Groups',
        icon: '📚',
        emoji: '📚',
        category: 'academic',
        duration: 45,
        description: 'Guided reading instruction'
      },
      {
        id: 'math-workshop',
        name: 'Math Workshop',
        icon: '🔢',
        emoji: '🔢',
        category: 'academic',
        duration: 45,
        description: 'Math instruction and practice'
      },
      {
        id: 'snack-break',
        name: 'Snack Time',
        icon: '🍎',
        emoji: '🍎',
        category: 'break',
        duration: 15,
        description: 'Healthy snack and hydration'
      },
      {
        id: 'science-explore',
        name: 'Science Exploration',
        icon: '🔬',
        emoji: '🔬',
        category: 'academic',
        duration: 30,
        description: 'Hands-on science learning'
      },
      {
        id: 'lunch-break',
        name: 'Lunch',
        icon: '🍽️',
        emoji: '🍽️',
        category: 'break',
        duration: 30,
        description: 'Lunch and social time'
      },
      {
        id: 'writing-workshop',
        name: 'Writing Workshop',
        icon: '✍️',
        emoji: '✍️',
        category: 'academic',
        duration: 30,
        description: 'Creative and structured writing'
      },
      {
        id: 'social-studies',
        name: 'Social Studies',
        icon: '🌍',
        emoji: '🌍',
        category: 'academic',
        duration: 25,
        description: 'Community and world exploration'
      },
      {
        id: 'art-project',
        name: 'Art Project',
        icon: '🎨',
        emoji: '🎨',
        category: 'special',
        duration: 30,
        description: 'Creative arts and crafts'
      },
      {
        id: 'reflection-time',
        name: 'Daily Reflection',
        icon: '💭',
        emoji: '💭',
        category: 'routine',
        duration: 10,
        description: 'Review and reflection'
      }
    ],
    totalDuration: 275,
    activityCount: 10,
    isTemplate: true,
    templateType: 'academic',
    category: 'academic',
    targetGrade: 'Elementary',
    targetSkills: ['reading', 'math', 'science', 'social skills'],
    tags: ['full-day', 'academic', 'elementary', 'structured'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: '1.0.0',
    date: new Date().toISOString().split('T')[0],
    status: 'active' as const
  },
  {
    id: 'template-therapy-intensive',
    name: 'Therapy Intensive Day',
    description: 'Focused therapeutic activities and skill building',
    startTime: '09:00',
    activities: [
      {
        id: 'welcome-routine',
        name: 'Welcome Routine',
        icon: '👋',
        emoji: '👋',
        category: 'routine',
        duration: 10,
        description: 'Greeting and transition'
      },
      {
        id: 'speech-therapy',
        name: 'Speech Therapy',
        icon: '🗣️',
        emoji: '🗣️',
        category: 'therapy',
        duration: 30,
        description: 'Individual speech sessions'
      },
      {
        id: 'occupational-therapy',
        name: 'Occupational Therapy',
        icon: '🖐️',
        emoji: '🖐️',
        category: 'therapy',
        duration: 30,
        description: 'Fine motor and daily living skills'
      },
      {
        id: 'sensory-break',
        name: 'Sensory Break',
        icon: '🧘',
        emoji: '🧘',
        category: 'break',
        duration: 15,
        description: 'Sensory regulation activities'
      },
      {
        id: 'social-skills',
        name: 'Social Skills Practice',
        icon: '🤝',
        emoji: '🤝',
        category: 'therapy',
        duration: 25,
        description: 'Social interaction and communication'
      },
      {
        id: 'movement-therapy',
        name: 'Movement Therapy',
        icon: '🏃',
        emoji: '🏃',
        category: 'therapy',
        duration: 20,
        description: 'Gross motor and coordination'
      },
      {
        id: 'quiet-time',
        name: 'Quiet Time',
        icon: '🤫',
        emoji: '🤫',
        category: 'break',
        duration: 15,
        description: 'Rest and self-regulation'
      },
      {
        id: 'life-skills',
        name: 'Life Skills',
        icon: '🏠',
        emoji: '🏠',
        category: 'therapy',
        duration: 25,
        description: 'Daily living and independence'
      },
      {
        id: 'art-therapy',
        name: 'Art Therapy',
        icon: '🎭',
        emoji: '🎭',
        category: 'therapy',
        duration: 20,
        description: 'Creative expression and communication'
      },
      {
        id: 'closing-circle',
        name: 'Closing Circle',
        icon: '🔄',
        emoji: '🔄',
        category: 'routine',
        duration: 10,
        description: 'Summary and goodbye'
      }
    ],
    totalDuration: 200,
    activityCount: 10,
    isTemplate: true,
    templateType: 'therapy',
    category: 'therapy',
    targetGrade: 'All',
    targetSkills: ['communication', 'motor skills', 'social skills', 'self-regulation'],
    tags: ['therapy', 'intervention', 'skills', 'individualized'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: '1.0.0',
    date: new Date().toISOString().split('T')[0],
    status: 'active' as const
  },
  {
    id: 'template-half-day',
    name: 'Half Day Schedule',
    description: 'Condensed schedule for shorter days',
    startTime: '08:30',
    activities: [
      {
        id: 'quick-start',
        name: 'Quick Start',
        icon: '⚡',
        emoji: '⚡',
        category: 'routine',
        duration: 10,
        description: 'Fast-paced morning routine'
      },
      {
        id: 'core-learning',
        name: 'Core Learning Block',
        icon: '📖',
        emoji: '📖',
        category: 'academic',
        duration: 45,
        description: 'Integrated academic session'
      },
      {
        id: 'active-break',
        name: 'Active Break',
        icon: '🤸',
        emoji: '🤸',
        category: 'break',
        duration: 15,
        description: 'Movement and energy release'
      },
      {
        id: 'hands-on-activity',
        name: 'Hands-On Learning',
        icon: '🔧',
        emoji: '🔧',
        category: 'academic',
        duration: 30,
        description: 'Interactive and practical learning'
      },
      {
        id: 'snack-social',
        name: 'Snack & Social',
        icon: '🥨',
        emoji: '🥨',
        category: 'break',
        duration: 15,
        description: 'Nutrition and peer interaction'
      },
      {
        id: 'wrap-up-activity',
        name: 'Wrap-Up Activity',
        icon: '🎯',
        emoji: '🎯',
        category: 'academic',
        duration: 20,
        description: 'Review and consolidation'
      },
      {
        id: 'pack-up',
        name: 'Pack Up',
        icon: '🎒',
        emoji: '🎒',
        category: 'routine',
        duration: 10,
        description: 'Organization and departure prep'
      }
    ],
    totalDuration: 145,
    activityCount: 7,
    isTemplate: true,
    templateType: 'half-day',
    category: 'academic',
    targetGrade: 'All',
    targetSkills: ['efficiency', 'core academics', 'transitions'],
    tags: ['half-day', 'efficient', 'condensed', 'flexible'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: '1.0.0',
    date: new Date().toISOString().split('T')[0],
    status: 'active' as const
  },
  {
    id: 'template-holiday-celebration',
    name: 'Holiday Celebration',
    description: 'Special day activities and celebrations',
    startTime: '09:00',
    activities: [
      {
        id: 'holiday-greeting',
        name: 'Holiday Greeting Circle',
        icon: '🎉',
        emoji: '🎉',
        category: 'special',
        duration: 15,
        description: 'Holiday welcome and sharing'
      },
      {
        id: 'holiday-crafts',
        name: 'Holiday Crafts',
        icon: '🎨',
        emoji: '🎨',
        category: 'special',
        duration: 40,
        description: 'Festive arts and crafts'
      },
      {
        id: 'holiday-stories',
        name: 'Holiday Stories',
        icon: '📚',
        emoji: '📚',
        category: 'special',
        duration: 20,
        description: 'Seasonal stories and traditions'
      },
      {
        id: 'festive-snack',
        name: 'Festive Snack',
        icon: '🍪',
        emoji: '🍪',
        category: 'special',
        duration: 20,
        description: 'Holiday treats and sharing'
      },
      {
        id: 'holiday-games',
        name: 'Holiday Games',
        icon: '🎲',
        emoji: '🎲',
        category: 'special',
        duration: 30,
        description: 'Fun seasonal activities'
      },
      {
        id: 'music-movement',
        name: 'Holiday Music & Movement',
        icon: '🎵',
        emoji: '🎵',
        category: 'special',
        duration: 25,
        description: 'Seasonal songs and dance'
      },
      {
        id: 'holiday-reflection',
        name: 'Holiday Reflection',
        icon: '💫',
        emoji: '💫',
        category: 'special',
        duration: 15,
        description: 'Gratitude and sharing'
      },
      {
        id: 'celebration-close',
        name: 'Celebration Closing',
        icon: '🌟',
        emoji: '🌟',
        category: 'special',
        duration: 10,
        description: 'Special goodbye and wishes'
      }
    ],
    totalDuration: 175,
    activityCount: 8,
    isTemplate: true,
    templateType: 'holiday',
    category: 'special',
    targetGrade: 'All',
    targetSkills: ['social interaction', 'cultural awareness', 'creativity'],
    tags: ['holiday', 'celebration', 'special', 'festive', 'cultural'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: '1.0.0',
    date: new Date().toISOString().split('T')[0],
    status: 'active' as const
  }
];

// Default group templates for enhanced activity grouping
const DEFAULT_GROUP_TEMPLATES: GroupTemplate[] = [
  {
    id: 'template-independent-stations',
    name: 'Independent Learning Stations',
    description: 'Students work individually at different learning stations',
    groupCount: 4,
    suggestedColors: ['blue', 'green', 'orange', 'purple'],
    typicalUse: 'Self-directed learning activities'
  },
  {
    id: 'template-collaborative-pairs',
    name: 'Collaborative Pairs',
    description: 'Students work together in pairs for peer learning',
    groupCount: 2,
    suggestedColors: ['blue', 'green'],
    typicalUse: 'Partner activities and peer tutoring'
  },
  {
    id: 'template-skill-level-groups',
    name: 'Skill-Level Groups',
    description: 'Groups organized by similar skill levels for targeted instruction',
    groupCount: 3,
    suggestedColors: ['red', 'yellow', 'green'],
    typicalUse: 'Differentiated instruction and scaffolded learning'
  },
  {
    id: 'template-mixed-ability-teams',
    name: 'Mixed-Ability Teams',
    description: 'Diverse groups with students of varying abilities working together',
    groupCount: 4,
    suggestedColors: ['blue', 'green', 'orange', 'purple'],
    typicalUse: 'Cooperative learning and inclusive activities'
  }
];

// Migration function to upgrade regular activities to enhanced activities
function upgradeActivityToEnhanced(activity: SavedActivity): EnhancedActivity {
  return {
    ...activity,
    groupingType: 'whole-class',
    groupAssignments: [],
    accommodations: [],
    adaptations: []
  };
}

// Load schedule with automatic migration to enhanced format
function loadScheduleWithMigration(scheduleId: string): EnhancedActivity[] | null {
  const schedule = schedulePersistence.getScheduleById(scheduleId);
  if (!schedule) return null;
  
  return schedule.activities.map(activity => {
    // Check if activity is already enhanced
    if ('groupingType' in activity && 'groupAssignments' in activity) {
      return activity as EnhancedActivity;
    }
    
    // Upgrade legacy activity to enhanced format
    return upgradeActivityToEnhanced(activity);
  });
}

class SchedulePersistence {
  private readonly STORAGE_KEY = 'visual-schedule-builder-schedules';
  private readonly TEMPLATES_KEY = 'visual-schedule-builder-templates';
  private readonly VERSION = '1.0.0';

  constructor() {
    this.initializeDefaultTemplates();
  }

  // Initialize default templates if they don't exist
  private initializeDefaultTemplates(): void {
    const existingTemplates = this.getTemplates();
    if (existingTemplates.length === 0) {
      DEFAULT_TEMPLATES.forEach(template => {
        this.saveTemplate(template);
      });
    }
  }

  // Generate unique ID
  private generateId(): string {
    return `schedule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Calculate total duration
  private calculateTotalDuration(activities: ScheduleActivity[]): number {
    return activities.reduce((total, activity) => total + activity.duration, 0);
  }

  // Validate schedule data
  private validateSchedule(schedule: Partial<SavedSchedule>): boolean {
    return !!(
      schedule.name &&
      schedule.activities &&
      Array.isArray(schedule.activities) &&
      schedule.activities.length > 0 &&
      schedule.startTime
    );
  }

  // Save a schedule
  saveSchedule(
    name: string,
    description: string,
    startTime: string,
    activities: ScheduleActivity[],
    isTemplate: boolean = false,
    templateType?: 'academic' | 'therapy' | 'half-day' | 'holiday' | 'custom',
    tags: string[] = []
  ): SavedSchedule {
    const schedule: SavedSchedule = {
      id: this.generateId(),
      name: name.trim(),
      description: description.trim(),
      date: new Date().toISOString().split('T')[0],
      startTime,
      activities: JSON.parse(JSON.stringify(activities)), // Deep clone
      status: 'draft' as const,
      totalDuration: this.calculateTotalDuration(activities),
      activityCount: activities.length,
      isTemplate,
      templateType,
      tags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: this.VERSION
    };

    if (!this.validateSchedule(schedule)) {
      throw new Error('Invalid schedule data');
    }

    const schedules = this.getAllSchedules();
    schedules.push(schedule);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(schedules));

    return schedule;
  }

  // Update an existing schedule
  updateSchedule(
    id: string,
    name: string,
    description: string,
    startTime: string,
    activities: ScheduleActivity[],
    tags: string[] = []
  ): SavedSchedule | null {
    const schedules = this.getAllSchedules();
    const index = schedules.findIndex(s => s.id === id);
    
    if (index === -1) {
      return null;
    }

    const updatedSchedule: SavedSchedule = {
      ...schedules[index],
      name: name.trim(),
      description: description.trim(),
      startTime,
      activities: JSON.parse(JSON.stringify(activities)),
      totalDuration: this.calculateTotalDuration(activities),
      activityCount: activities.length,
      tags,
      updatedAt: new Date().toISOString(),
      date: schedules[index].date,
      status: schedules[index].status
    };

    if (!this.validateSchedule(updatedSchedule)) {
      throw new Error('Invalid schedule data');
    }

    schedules[index] = updatedSchedule;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(schedules));

    return updatedSchedule;
  }

  // Get all schedules
  getAllSchedules(): SavedSchedule[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading schedules:', error);
      return [];
    }
  }

  // Get schedules (non-templates)
  getSchedules(): SavedSchedule[] {
    return this.getAllSchedules().filter(s => !s.isTemplate);
  }

  // Get templates
  getTemplates(): ScheduleTemplate[] {
    return this.getAllSchedules().filter(s => s.isTemplate) as ScheduleTemplate[];
  }

  // Get schedule by ID
  getScheduleById(id: string): SavedSchedule | null {
    const schedules = this.getAllSchedules();
    return schedules.find(s => s.id === id) || null;
  }

  // Delete schedule
  deleteSchedule(id: string): boolean {
    const schedules = this.getAllSchedules();
    const filteredSchedules = schedules.filter(s => s.id !== id);
    
    if (filteredSchedules.length === schedules.length) {
      return false; // Schedule not found
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredSchedules));
    return true;
  }

  // Duplicate schedule
  duplicateSchedule(id: string, newName?: string): SavedSchedule | null {
    const original = this.getScheduleById(id);
    if (!original) {
      return null;
    }

    const duplicate: SavedSchedule = {
      ...original,
      id: this.generateId(),
      name: newName || `${original.name} (Copy)`,
      isTemplate: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const schedules = this.getAllSchedules();
    schedules.push(duplicate);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(schedules));

    return duplicate;
  }

  // Save as template
  saveTemplate(template: ScheduleTemplate): ScheduleTemplate {
    const templates = this.getTemplates();
    const existingIndex = templates.findIndex(t => t.id === template.id);
    
    if (existingIndex >= 0) {
      templates[existingIndex] = { ...template, updatedAt: new Date().toISOString() };
    } else {
      templates.push(template);
    }

    const allSchedules = this.getSchedules();
    const allData = [...allSchedules, ...templates];
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allData));

    return template;
  }

  // Search schedules
  searchSchedules(query: string, includeTemplates: boolean = false): SavedSchedule[] {
    const schedules = includeTemplates ? this.getAllSchedules() : this.getSchedules();
    const lowercaseQuery = query.toLowerCase();

    return schedules.filter(schedule => 
      schedule.name.toLowerCase().includes(lowercaseQuery) ||
      schedule.description?.toLowerCase().includes(lowercaseQuery) ||
      schedule.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
      schedule.activities.some(activity => 
        activity.name.toLowerCase().includes(lowercaseQuery) ||
        activity.category.toLowerCase().includes(lowercaseQuery)
      )
    );
  }

  // Filter schedules
  filterSchedules(filters: {
    templateType?: string;
    minDuration?: number;
    maxDuration?: number;
    activityCount?: number;
    tags?: string[];
    dateRange?: { start: Date; end: Date };
  }): SavedSchedule[] {
    let schedules = this.getAllSchedules();

    if (filters.templateType && filters.templateType !== 'all') {
      schedules = schedules.filter(s => s.templateType === filters.templateType);
    }

    if (filters.minDuration !== undefined) {
      schedules = schedules.filter(s => s.totalDuration >= filters.minDuration!);
    }

    if (filters.maxDuration !== undefined) {
      schedules = schedules.filter(s => s.totalDuration <= filters.maxDuration!);
    }

    if (filters.activityCount !== undefined) {
      schedules = schedules.filter(s => s.activityCount === filters.activityCount);
    }

    if (filters.tags && filters.tags.length > 0) {
      schedules = schedules.filter(s => 
        filters.tags!.some(tag => s.tags?.includes(tag))
      );
    }

    if (filters.dateRange) {
      const { start, end } = filters.dateRange;
      schedules = schedules.filter(s => {
        const createdDate = new Date(s.createdAt);
        return createdDate >= start && createdDate <= end;
      });
    }

    return schedules;
  }

  // Get schedule statistics
  getScheduleStats(): ScheduleStats {
    const schedules = this.getSchedules();
    const templates = this.getTemplates();
    
    // Calculate average duration
    const totalDuration = schedules.reduce((sum, s) => sum + s.totalDuration, 0);
    const averageDuration = schedules.length > 0 ? Math.round(totalDuration / schedules.length) : 0;

    // Get most used activities
    const activityCounts: { [key: string]: number } = {};
    schedules.forEach(schedule => {
      schedule.activities.forEach(activity => {
        activityCounts[activity.name] = (activityCounts[activity.name] || 0) + 1;
      });
    });

    const mostUsedActivities = Object.entries(activityCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Get recent activity
    const sortedSchedules = [...schedules].sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    const recentActivity = sortedSchedules.length > 0 
      ? `Updated "${sortedSchedules[0].name}" on ${new Date(sortedSchedules[0].updatedAt).toLocaleDateString()}`
      : 'No recent activity';

    return {
      totalSchedules: schedules.length,
      totalTemplates: templates.length,
      averageDuration,
      mostUsedActivities,
      recentActivity
    };
  }

  // Export schedule
  exportSchedule(id: string): string {
    const schedule = this.getScheduleById(id);
    if (!schedule) {
      throw new Error('Schedule not found');
    }

    const exportData = {
      schedule,
      exportedAt: new Date().toISOString(),
      exportedBy: 'Visual Schedule Builder',
      version: this.VERSION
    };

    return JSON.stringify(exportData, null, 2);
  }

  // Import schedule
  importSchedule(jsonData: string, importAsTemplate: boolean = false): SavedSchedule {
    try {
      const importData = JSON.parse(jsonData);
      const schedule = importData.schedule || importData;

      if (!this.validateSchedule(schedule)) {
        throw new Error('Invalid schedule format');
      }

      // Create new schedule with new ID
      const newSchedule: SavedSchedule = {
        ...schedule,
        id: this.generateId(),
        isTemplate: importAsTemplate,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: this.VERSION
      };

      const schedules = this.getAllSchedules();
      schedules.push(newSchedule);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(schedules));

      return newSchedule;
    } catch (error) {
      throw new Error(`Import failed: ${error.message}`);
    }
  }

  // Export all schedules
  exportAllSchedules(): string {
    const allSchedules = this.getAllSchedules();
    const exportData = {
      schedules: allSchedules,
      exportedAt: new Date().toISOString(),
      exportedBy: 'Visual Schedule Builder',
      version: this.VERSION,
      count: allSchedules.length
    };

    return JSON.stringify(exportData, null, 2);
  }

  // Clear all data (with confirmation)
  clearAllData(): boolean {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.TEMPLATES_KEY);
      this.initializeDefaultTemplates();
      return true;
    } catch (error) {
      console.error('Error clearing data:', error);
      return false;
    }
  }

  // Get recent schedules
  getRecentSchedules(limit: number = 5): SavedSchedule[] {
    const schedules = this.getSchedules();
    return schedules
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, limit);
  }

  // Get popular templates
  getPopularTemplates(limit: number = 4): ScheduleTemplate[] {
    const templates = this.getTemplates();
    return templates
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  // Load schedule for a specific date
  loadScheduleForDate(date: Date): SavedSchedule | null {
    const dateString = date.toISOString().split('T')[0];
    const schedules = this.getSchedules();
    
    // Find schedule that matches the date
    const schedule = schedules.find(s => s.date === dateString);
    return schedule || null;
  }
}

// Create singleton instance
export const schedulePersistence = new SchedulePersistence();

// Export types
export type {
  ScheduleActivity,
  ActivityAssignment,
  SavedSchedule,
  ScheduleTemplate,
  ScheduleStats
};

// Export migration functions and templates
export {
  DEFAULT_GROUP_TEMPLATES,
  upgradeActivityToEnhanced,
  loadScheduleWithMigration
};

// Export the loadScheduleForDate function
export const loadScheduleForDate = (date: Date) => {
  return schedulePersistence.loadScheduleForDate(date);
};
