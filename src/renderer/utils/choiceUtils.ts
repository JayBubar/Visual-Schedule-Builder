// 🚀 SESSION 8: CHOICE INTEGRATION UTILITIES
// File: src/renderer/utils/choiceUtils.ts

import { ActivityLibraryItem, Student, ChoiceFilter, ChoiceRecommendation, ChoiceAnalytics } from '../types';

// 🎯 Choice Management Utilities
export class ChoiceManager {
  
  // Get all choice-eligible activities from localStorage
  static getChoiceEligibleActivities(): ActivityLibraryItem[] {
    const savedActivities = localStorage.getItem('activityLibrary');
    if (savedActivities) {
      const allActivities: ActivityLibraryItem[] = JSON.parse(savedActivities);
      return allActivities.filter(activity => activity.isChoiceEligible);
    }
    return [];
  }

  // Update activity usage statistics
  static updateActivityUsage(activityId: string, studentId?: string, rating?: number) {
    const savedActivities = localStorage.getItem('activityLibrary');
    if (savedActivities) {
      const activities: ActivityLibraryItem[] = JSON.parse(savedActivities);
      const updatedActivities = activities.map(activity => {
        if (activity.id === activityId) {
          const currentUsage = activity.usageStats || {};
          const updatedUsage = {
            ...currentUsage,
            timesUsed: (currentUsage.timesUsed || 0) + 1,
            lastUsed: new Date().toISOString(),
            averageRating: rating ? this.calculateNewAverageRating(currentUsage, rating) : currentUsage.averageRating,
            studentPreferences: studentId ? this.updateStudentPreferences(currentUsage, studentId, rating) : currentUsage.studentPreferences
          };

          return {
            ...activity,
            usageStats: updatedUsage
          };
        }
        return activity;
      });
      
      localStorage.setItem('activityLibrary', JSON.stringify(updatedActivities));
    }
  }

  // Calculate new average rating
  private static calculateNewAverageRating(currentUsage: any, newRating: number): number {
    const currentRating = currentUsage.averageRating || 0;
    const timesUsed = currentUsage.timesUsed || 0;
    
    if (timesUsed === 0) return newRating;
    
    return ((currentRating * timesUsed) + newRating) / (timesUsed + 1);
  }

  // Update student preferences
  private static updateStudentPreferences(currentUsage: any, studentId: string, rating?: number): { [studentId: string]: number } {
    const preferences = currentUsage.studentPreferences || {};
    if (rating) {
      preferences[studentId] = rating;
    } else {
      // Increment preference count
      preferences[studentId] = (preferences[studentId] || 0) + 1;
    }
    return preferences;
  }

  // Filter activities based on criteria
  static filterActivities(activities: ActivityLibraryItem[], filter: ChoiceFilter): ActivityLibraryItem[] {
    return activities.filter(activity => {
      // Category filter
      if (filter.category && filter.category.length > 0 && !filter.category.includes(activity.category)) {
        return false;
      }

      // Max students filter
      if (filter.maxStudents && activity.choiceProperties?.maxStudents && 
          activity.choiceProperties.maxStudents > filter.maxStudents) {
        return false;
      }

      // Quiet only filter
      if (filter.quietOnly && !activity.choiceProperties?.quietActivity) {
        return false;
      }

      // Skill level filter
      if (filter.skillLevel && filter.skillLevel.length > 0 && 
          activity.choiceProperties?.skillLevel &&
          !filter.skillLevel.includes(activity.choiceProperties.skillLevel)) {
        return false;
      }

      // Staff supervision filter
      if (filter.staffSupervisionLevel && filter.staffSupervisionLevel.length > 0 &&
          activity.choiceProperties?.staffSupervision &&
          !filter.staffSupervisionLevel.includes(activity.choiceProperties.staffSupervision)) {
        return false;
      }

      // Social interaction filter
      if (filter.socialInteraction && filter.socialInteraction.length > 0 &&
          activity.choiceProperties?.socialInteraction &&
          !filter.socialInteraction.includes(activity.choiceProperties.socialInteraction)) {
        return false;
      }

      // Time of day filter
      if (filter.timeOfDay && activity.recommendationTags?.timeOfDay && 
          activity.recommendationTags.timeOfDay !== 'any' &&
          activity.recommendationTags.timeOfDay !== filter.timeOfDay) {
        return false;
      }

      // Energy level filter
      if (filter.energyLevel && filter.energyLevel.length > 0 &&
          activity.recommendationTags?.energyLevel &&
          !filter.energyLevel.includes(activity.recommendationTags.energyLevel)) {
        return false;
      }

      return true;
    });
  }

  // Generate smart recommendations
  static generateRecommendations(activities: ActivityLibraryItem[], currentFilter?: ChoiceFilter): ChoiceRecommendation[] {
    const now = new Date();
    const hour = now.getHours();
    const timeOfDay = hour < 12 ? 'morning' : 'afternoon';

    return activities
      .filter(activity => activity.isChoiceEligible)
      .map(activity => {
        let score = 50; // Base score
        let reason = 'Available for choice time';
        const tags: string[] = [];

        // Boost score based on usage stats
        if (activity.usageStats?.averageRating) {
          const ratingBoost = activity.usageStats.averageRating * 10;
          score += ratingBoost;
          if (activity.usageStats.averageRating >= 4) {
            tags.push('Highly rated');
          }
        }

        // Consider time of day
        if (activity.recommendationTags?.timeOfDay === timeOfDay) {
          score += 15;
          tags.push(`Perfect for ${timeOfDay}`);
        }

        // Consider current filters
        if (currentFilter?.quietOnly && activity.choiceProperties?.quietActivity) {
          score += 20;
          tags.push('Quiet activity');
        }

        // Boost popular activities
        if (activity.usageStats?.timesUsed && activity.usageStats.timesUsed > 5) {
          score += 10;
          tags.push('Popular choice');
        }

        // Consider energy level for time of day
        if (timeOfDay === 'morning' && activity.recommendationTags?.energyLevel === 'high') {
          score += 10;
          tags.push('Great morning activity');
        } else if (timeOfDay === 'afternoon' && activity.recommendationTags?.energyLevel === 'low') {
          score += 10;
          tags.push('Perfect for afternoon');
        }

        // Penalize recently used activities slightly
        if (activity.usageStats?.lastUsed) {
          const lastUsed = new Date(activity.usageStats.lastUsed);
          const daysSinceUsed = (now.getTime() - lastUsed.getTime()) / (1000 * 60 * 60 * 24);
          if (daysSinceUsed < 1) {
            score -= 5;
          }
        }

        return {
          activityId: activity.id,
          score: Math.min(Math.max(score, 0), 100),
          reason,
          tags
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);
  }

  // Generate choice analytics
  static generateAnalytics(): ChoiceAnalytics {
    const activities = this.getChoiceEligibleActivities();
    const rotationHistory = JSON.parse(localStorage.getItem('choiceRotationHistory') || '[]');

    // Popular activities
    const popularActivities = activities
      .filter(activity => activity.usageStats?.timesUsed)
      .sort((a, b) => (b.usageStats?.timesUsed || 0) - (a.usageStats?.timesUsed || 0))
      .slice(0, 5)
      .map(activity => ({
        activityId: activity.id,
        name: activity.name,
        timesChosen: activity.usageStats?.timesUsed || 0,
        averageRating: activity.usageStats?.averageRating || 0
      }));

    // Student engagement (simplified - would need more detailed tracking)
    const students = JSON.parse(localStorage.getItem('students') || '[]');
    const studentEngagement = students.map((student: Student) => ({
      studentId: student.id,
      engagementLevel: 3, // Default engagement level
      preferredActivities: [], // Would be populated from actual data
      avoidedActivities: []
    }));

    // Time patterns (simplified)
    const timePatterns = [
      {
        timeSlot: 'morning',
        mostPopular: activities.filter(a => a.recommendationTags?.timeOfDay === 'morning').map(a => a.id),
        leastPopular: []
      },
      {
        timeSlot: 'afternoon', 
        mostPopular: activities.filter(a => a.recommendationTags?.timeOfDay === 'afternoon').map(a => a.id),
        leastPopular: []
      }
    ];

    // Behavior impact
    const behaviorImpact = {
      calmingActivities: activities.filter(a => a.usageStats?.behaviorImpact === 'calming').map(a => a.id),
      energizingActivities: activities.filter(a => a.usageStats?.behaviorImpact === 'energizing').map(a => a.id),
      neutralActivities: activities.filter(a => a.usageStats?.behaviorImpact === 'neutral').map(a => a.id)
    };

    return {
      popularActivities,
      studentEngagement,
      timePatterns,
      behaviorImpact
    };
  }

  // Auto-assign students to activities
  static autoAssignStudents(
    students: Student[],
    activities: ActivityLibraryItem[],
    preferences?: { [studentId: string]: string[] }
  ): { studentId: string; activityId: string }[] {
    const assignments: { studentId: string; activityId: string }[] = [];
    const activityCapacity: { [activityId: string]: number } = {};

    // Initialize capacity tracking
    activities.forEach(activity => {
      activityCapacity[activity.id] = activity.choiceProperties?.maxStudents || 6;
    });

    // Sort students by preference strength if available
    const sortedStudents = preferences ? 
      students.sort((a, b) => (preferences[b.id]?.length || 0) - (preferences[a.id]?.length || 0)) :
      students;

    for (const student of sortedStudents) {
      let assigned = false;

      // Try to assign based on preferences first
      if (preferences && preferences[student.id]) {
        for (const preferredActivityId of preferences[student.id]) {
          if (activityCapacity[preferredActivityId] > 0) {
            assignments.push({ studentId: student.id, activityId: preferredActivityId });
            activityCapacity[preferredActivityId]--;
            assigned = true;
            break;
          }
        }
      }

      // If not assigned by preference, assign to available activity
      if (!assigned) {
        const availableActivity = activities.find(activity => activityCapacity[activity.id] > 0);
        if (availableActivity) {
          assignments.push({ studentId: student.id, activityId: availableActivity.id });
          activityCapacity[availableActivity.id]--;
        }
      }
    }

    return assignments;
  }

  // Validate activity for choice eligibility
  static validateChoiceEligibility(activity: ActivityLibraryItem): { isValid: boolean; warnings: string[] } {
    const warnings: string[] = [];

    if (!activity.choiceProperties) {
      warnings.push('No choice properties defined');
    } else {
      if (!activity.choiceProperties.maxStudents || activity.choiceProperties.maxStudents < 1) {
        warnings.push('Max students should be at least 1');
      }

      if (!activity.choiceProperties.skillLevel) {
        warnings.push('Skill level not specified');
      }

      if (!activity.choiceProperties.staffSupervision) {
        warnings.push('Staff supervision level not specified');
      }
    }

    if (!activity.materials || activity.materials.length === 0) {
      warnings.push('No materials listed - consider adding for setup clarity');
    }

    if (!activity.description) {
      warnings.push('No description provided');
    }

    return {
      isValid: warnings.length === 0,
      warnings
    };
  }

  // Export choice data for reports
  static exportChoiceData(): string {
    const activities = this.getChoiceEligibleActivities();
    const analytics = this.generateAnalytics();
    const rotationHistory = JSON.parse(localStorage.getItem('choiceRotationHistory') || '[]');

    const exportData = {
      timestamp: new Date().toISOString(),
      choiceEligibleActivities: activities.length,
      totalRotations: rotationHistory.length,
      popularActivities: analytics.popularActivities,
      activities: activities.map(activity => ({
        id: activity.id,
        name: activity.name,
        category: activity.category,
        timesUsed: activity.usageStats?.timesUsed || 0,
        averageRating: activity.usageStats?.averageRating || 0,
        maxStudents: activity.choiceProperties?.maxStudents,
        skillLevel: activity.choiceProperties?.skillLevel,
        isQuiet: activity.choiceProperties?.quietActivity
      }))
    };

    return JSON.stringify(exportData, null, 2);
  }
}

// 🎯 Default choice-eligible activities generator
export const getDefaultChoiceActivities = (): ActivityLibraryItem[] => {
  return [
    {
      id: 'choice-reading-corner',
      name: 'Reading Corner',
      emoji: '📚',
      category: 'academic',
      defaultDuration: 20,
      description: 'Independent reading time with favorite books',
      materials: ['Books', 'Comfortable seating', 'Reading pillows'],
      isCustom: false,
      isChoiceEligible: true,
      choiceProperties: {
        maxStudents: 3,
        skillLevel: 'independent',
        staffSupervision: 'minimal',
        socialInteraction: 'individual',
        quietActivity: true,
        messyActivity: false,
        preparationTime: 1,
        cleanupTime: 2
      },
      recommendationTags: {
        timeOfDay: 'any',
        energyLevel: 'low',
        academicConnection: ['Reading', 'Language Arts'],
        sensoryInput: 'visual'
      },
      tags: ['quiet', 'independent', 'literacy']
    },
    {
      id: 'choice-art-station',
      name: 'Art Station',
      emoji: '🎨',
      category: 'creative',
      defaultDuration: 25,
      description: 'Creative art activities with various materials',
      materials: ['Paper', 'Crayons', 'Markers', 'Glue sticks', 'Safety scissors'],
      isCustom: false,
      isChoiceEligible: true,
      choiceProperties: {
        maxStudents: 4,
        skillLevel: 'independent',
        staffSupervision: 'minimal',
        socialInteraction: 'any',
        quietActivity: false,
        messyActivity: true,
        preparationTime: 3,
        cleanupTime: 5
      },
      recommendationTags: {
        timeOfDay: 'any',
        energyLevel: 'medium',
        academicConnection: ['Art', 'Fine Motor'],
        sensoryInput: 'tactile'
      },
      tags: ['creative', 'messy', 'fine-motor']
    },
    {
      id: 'choice-puzzle-table',
      name: 'Puzzle Table',
      emoji: '🧩',
      category: 'academic',
      defaultDuration: 30,
      description: 'Jigsaw puzzles and brain teasers for problem solving',
      materials: ['Various puzzles', 'Puzzle mat', 'Storage containers'],
      isCustom: false,
      isChoiceEligible: true,
      choiceProperties: {
        maxStudents: 2,
        skillLevel: 'independent',
        staffSupervision: 'none',
        socialInteraction: 'pair',
        quietActivity: true,
        messyActivity: false,
        preparationTime: 1,
        cleanupTime: 3
      },
      recommendationTags: {
        timeOfDay: 'any',
        energyLevel: 'low',
        academicConnection: ['Problem Solving', 'Visual Spatial'],
        sensoryInput: 'visual'
      },
      tags: ['problem-solving', 'quiet', 'cooperative']
    },
    {
      id: 'choice-sensory-bin',
      name: 'Sensory Bin',
      emoji: '✋',
      category: 'sensory',
      defaultDuration: 15,
      description: 'Tactile exploration with various sensory materials',
      materials: ['Sensory bin', 'Rice/beans', 'Scoops', 'Hidden objects'],
      isCustom: false,
      isChoiceEligible: true,
      choiceProperties: {
        maxStudents: 2,
        skillLevel: 'independent',
        staffSupervision: 'minimal',
        socialInteraction: 'individual',
        quietActivity: true,
        messyActivity: true,
        preparationTime: 2,
        cleanupTime: 4
      },
      recommendationTags: {
        timeOfDay: 'any',
        energyLevel: 'low',
        academicConnection: ['Sensory Processing'],
        sensoryInput: 'tactile'
      },
      tags: ['sensory', 'calming', 'tactile']
    },
    {
      id: 'choice-building-blocks',
      name: 'Building Station',
      emoji: '🧱',
      category: 'creative',
      defaultDuration: 20,
      description: 'Construction play with blocks and building materials',
      materials: ['LEGO blocks', 'Wooden blocks', 'Pattern cards'],
      isCustom: false,
      isChoiceEligible: true,
      choiceProperties: {
        maxStudents: 3,
        skillLevel: 'independent',
        staffSupervision: 'minimal',
        socialInteraction: 'small-group',
        quietActivity: false,
        messyActivity: false,
        preparationTime: 2,
        cleanupTime: 4
      },
      recommendationTags: {
        timeOfDay: 'any',
        energyLevel: 'medium',
        academicConnection: ['Engineering', 'Math', 'Spatial Reasoning'],
        sensoryInput: 'tactile'
      },
      tags: ['engineering', 'cooperative', 'spatial']
    },
    {
      id: 'choice-listening-center',
      name: 'Listening Center',
      emoji: '🎧',
      category: 'academic',
      defaultDuration: 20,
      description: 'Audio books and educational recordings with headphones',
      materials: ['Tablets/CD player', 'Headphones', 'Audio books'],
      isCustom: false,
      isChoiceEligible: true,
      choiceProperties: {
        maxStudents: 4,
        skillLevel: 'independent',
        staffSupervision: 'none',
        socialInteraction: 'individual',
        quietActivity: true,
        messyActivity: false,
        preparationTime: 1,
        cleanupTime: 2
      },
      recommendationTags: {
        timeOfDay: 'any',
        energyLevel: 'low',
        academicConnection: ['Listening Skills', 'Language Arts'],
        sensoryInput: 'auditory'
      },
      tags: ['technology', 'quiet', 'literacy']
    },
    {
      id: 'choice-math-games',
      name: 'Math Games',
      emoji: '🔢',
      category: 'academic',
      defaultDuration: 25,
      description: 'Interactive math games and manipulatives',
      materials: ['Math manipulatives', 'Number games', 'Calculators'],
      isCustom: false,
      isChoiceEligible: true,
      choiceProperties: {
        maxStudents: 3,
        skillLevel: 'independent',
        staffSupervision: 'minimal',
        socialInteraction: 'small-group',
        quietActivity: false,
        messyActivity: false,
        preparationTime: 2,
        cleanupTime: 3
      },
      recommendationTags: {
        timeOfDay: 'morning',
        energyLevel: 'medium',
        academicConnection: ['Math', 'Problem Solving'],
        sensoryInput: 'visual'
      },
      tags: ['academic', 'math', 'games']
    },
    {
      id: 'choice-dramatic-play',
      name: 'Dramatic Play',
      emoji: '🎭',
      category: 'social',
      defaultDuration: 30,
      description: 'Role-playing and imaginative play activities',
      materials: ['Costumes', 'Props', 'Play kitchen', 'Dolls'],
      isCustom: false,
      isChoiceEligible: true,
      choiceProperties: {
        maxStudents: 4,
        skillLevel: 'independent',
        staffSupervision: 'minimal',
        socialInteraction: 'small-group',
        quietActivity: false,
        messyActivity: false,
        preparationTime: 3,
        cleanupTime: 4
      },
      recommendationTags: {
        timeOfDay: 'any',
        energyLevel: 'high',
        academicConnection: ['Social Skills', 'Language Development'],
        sensoryInput: 'movement'
      },
      tags: ['social', 'imaginative', 'language']
    }
  ];
};

// 🎯 Choice activity validators
export const validateChoiceActivity = (activity: ActivityLibraryItem): boolean => {
  return !!(
    activity.isChoiceEligible &&
    activity.choiceProperties &&
    activity.choiceProperties.maxStudents &&
    activity.choiceProperties.skillLevel &&
    activity.choiceProperties.staffSupervision
  );
};

// 🎯 Choice time calculations
export const calculateOptimalChoiceTime = (
  numStudents: number,
  numActivities: number,
  averageActivityDuration: number = 20
): number => {
  // Base calculation: ensure all students can rotate through activities
  const rotationsNeeded = Math.ceil(numStudents / Math.max(numActivities * 2, 1));
  return Math.max(averageActivityDuration * rotationsNeeded, 15);
};

// 🎯 Activity capacity helpers
export const getActivityCapacityStatus = (
  activity: ActivityLibraryItem,
  currentAssignments: number
): 'available' | 'nearly-full' | 'full' => {
  const maxStudents = activity.choiceProperties?.maxStudents || 6;
  const percentage = currentAssignments / maxStudents;
  
  if (percentage >= 1) return 'full';
  if (percentage >= 0.8) return 'nearly-full';
  return 'available';
};

// 🎯 Smart assignment algorithm
export const smartAssignStudents = (
  students: Student[],
  activities: ActivityLibraryItem[],
  previousAssignments?: { [studentId: string]: string[] }
): { studentId: string; activityId: string; score: number }[] => {
  const assignments: { studentId: string; activityId: string; score: number }[] = [];
  const activityCapacity: { [activityId: string]: number } = {};
  
  // Initialize capacity
  activities.forEach(activity => {
    activityCapacity[activity.id] = activity.choiceProperties?.maxStudents || 6;
  });

  // Score each student-activity combination
  const scoredCombinations: Array<{
    studentId: string;
    activityId: string;
    score: number;
  }> = [];

  students.forEach(student => {
    activities.forEach(activity => {
      let score = 50; // Base score

      // Boost score if student hasn't done this activity recently
      if (previousAssignments && previousAssignments[student.id]) {
        const hasRecentlyDone = previousAssignments[student.id].includes(activity.id);
        if (!hasRecentlyDone) {
          score += 20;
        } else {
          score -= 10; // Slightly penalize recent activities
        }
      }

      // Consider activity popularity
      if (activity.usageStats?.averageRating) {
        score += activity.usageStats.averageRating * 5;
      }

      // Add some randomness for variety
      score += Math.random() * 10;

      scoredCombinations.push({
        studentId: student.id,
        activityId: activity.id,
        score
      });
    });
  });

  // Sort by score and assign
  scoredCombinations.sort((a, b) => b.score - a.score);
  
  const assignedStudents = new Set<string>();
  
  for (const combination of scoredCombinations) {
    if (assignedStudents.has(combination.studentId)) continue;
    if (activityCapacity[combination.activityId] <= 0) continue;
    
    assignments.push(combination);
    assignedStudents.add(combination.studentId);
    activityCapacity[combination.activityId]--;
  }

  return assignments;
};