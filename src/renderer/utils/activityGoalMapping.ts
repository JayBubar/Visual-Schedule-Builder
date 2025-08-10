// src/renderer/utils/activityGoalMapping.ts
// Utilities for connecting Calendar Activities with IEP Goals

export interface IEPGoal {
  id: string;
  studentId: string;
  category: string;
  description: string;
  targetCriteria: string;
  measurementType: 'frequency' | 'accuracy' | 'duration' | 'independence' | 'rating';
  currentProgress: number;
  lastDataEntry?: string;
  relatedActivityTypes?: string[];
  scheduleOpportunities?: string[];
}

export interface Activity {
  id: string;
  name: string;
  type: string;
  scheduledTime: string;
  assignedStudents: string[];
  iepGoalOpportunities?: string[];
  suggestedDataCollection?: boolean;
}

/**
 * Get IEP goals that are relevant to a specific activity type for a student
 */
export const getGoalsForActivity = (activityType: string, studentId: string): IEPGoal[] => {
  try {
    const goals = JSON.parse(localStorage.getItem('iepGoals') || '[]');
    return goals.filter((goal: IEPGoal) => 
      goal.studentId === studentId && 
      (goal.relatedActivityTypes?.includes(activityType) || 
       goal.relatedActivityTypes?.includes('All Activities'))
    );
  } catch (error) {
    console.error('Error loading goals for activity:', error);
    return [];
  }
};

/**
 * Get all goals that could be addressed during today's activities
 */
export const getRelevantGoalsForDate = (date: string, studentId?: string): IEPGoal[] => {
  try {
    const schedules = JSON.parse(localStorage.getItem('schedules') || '[]');
    const todaySchedule = schedules.find((s: any) => s.date === date);
    
    if (!todaySchedule || !todaySchedule.activities) return [];
    
    const goals = JSON.parse(localStorage.getItem('iepGoals') || '[]');
    const activityTypes = todaySchedule.activities.map((a: Activity) => a.type);
    
    return goals.filter((goal: IEPGoal) => {
      if (studentId && goal.studentId !== studentId) return false;
      return goal.relatedActivityTypes?.some(type => 
        activityTypes.includes(type) || type === 'All Activities'
      ) || false;
    });
  } catch (error) {
    console.error('Error loading relevant goals:', error);
    return [];
  }
};

/**
 * Save quick data entry for a goal
 */
export const saveQuickDataEntry = (goalId: string, studentId: string, value: any, date: string, context = 'calendar_integration') => {
  try {
    const dataEntry = {
      id: `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      goalId,
      studentId,
      date,
      value,
      context,
      timestamp: new Date().toISOString(),
      entryMethod: 'quick_entry'
    };

    const existingData = JSON.parse(localStorage.getItem('iepDataEntries') || '[]');
    existingData.push(dataEntry);
    localStorage.setItem('iepDataEntries', JSON.stringify(existingData));

    const goals = JSON.parse(localStorage.getItem('iepGoals') || '[]');
    const updatedGoals = goals.map((g: IEPGoal) => {
      if (g.id === goalId) {
        return {
          ...g,
          lastDataEntry: date,
          currentProgress: typeof value === 'number' ? value : g.currentProgress
        };
      }
      return g;
    });
    localStorage.setItem('iepGoals', JSON.stringify(updatedGoals));

    return dataEntry;
  } catch (error) {
    console.error('Error saving quick data entry:', error);
    throw error;
  }
};

/**
 * Initialize default activity-goal relationships for existing goals
 */
export const initializeActivityGoalRelationships = () => {
  try {
    const goals = JSON.parse(localStorage.getItem('iepGoals') || '[]');
    let updated = false;
    
    const updatedGoals = goals.map((goal: IEPGoal) => {
      if (!goal.relatedActivityTypes || goal.relatedActivityTypes.length === 0) {
        const suggestedTypes = getSuggestedActivityTypesForGoal(goal.category);
        updated = true;
        return {
          ...goal,
          relatedActivityTypes: suggestedTypes
        };
      }
      return goal;
    });
    
    if (updated) {
      localStorage.setItem('iepGoals', JSON.stringify(updatedGoals));
      console.log('Initialized activity-goal relationships for existing goals');
    }
  } catch (error) {
    console.error('Error initializing activity-goal relationships:', error);
  }
};

const getSuggestedActivityTypesForGoal = (goalCategory: string): string[] => {
  const goalActivityMap: Record<string, string[]> = {
    'Math Computation': ['Math', 'Computer'],
    'Reading Comprehension': ['Reading', 'Computer'],
    'Written Expression': ['Writing', 'Computer'],
    'Social Skills': ['Social Skills', 'Free Time', 'Snack', 'Choice Activity'],
    'Following Directions': ['All Activities'],
    'Independence': ['Life Skills', 'Transition', 'Choice Activity', 'Free Time'],
    'Communication': ['Social Skills', 'Snack', 'Free Time', 'All Activities'],
    'Fine Motor': ['Writing', 'Art', 'Computer'],
    'Gross Motor': ['Physical Activity', 'Transition'],
    'Self Care': ['Life Skills', 'Snack'],
    'Task Completion': ['All Activities'],
    'Behavior': ['All Activities'],
    'Attention': ['All Activities']
  };
  
  return goalActivityMap[goalCategory] || ['All Activities'];
};