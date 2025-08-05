// Choice Data Manager - Handles saving and retrieving student choice selections
// File: src/renderer/utils/choiceDataManager.ts

export interface StudentChoice {
  studentId: string;
  studentName: string;
  activityId: string;
  activityName: string;
  activityIcon: string;
  assignedAt: string;
  rotationNumber?: number;
}

export interface DailyChoiceData {
  date: string;
  studentChoices: StudentChoice[];
  rotationHistory: any[];
  createdAt: string;
  updatedAt: string;
}

class ChoiceDataManager {
  private static instance: ChoiceDataManager;
  private readonly STORAGE_KEY = 'daily_choice_selections';

  static getInstance(): ChoiceDataManager {
    if (!ChoiceDataManager.instance) {
      ChoiceDataManager.instance = new ChoiceDataManager();
    }
    return ChoiceDataManager.instance;
  }

  // Get today's date in YYYY-MM-DD format
  private getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  // Save student choices for today
  saveTodayChoices(choices: StudentChoice[]): void {
    try {
      const today = this.getTodayDate();
      const existingData = this.getAllChoiceData();
      
      const todayData: DailyChoiceData = {
        date: today,
        studentChoices: choices,
        rotationHistory: this.getRotationHistory(),
        createdAt: existingData[today]?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      existingData[today] = todayData;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existingData));
      
      console.log(`💾 Saved ${choices.length} student choices for ${today}`);
    } catch (error) {
      console.error('Error saving today\'s choices:', error);
    }
  }

  // Get student choices for today
  getTodayChoices(): StudentChoice[] {
    try {
      const today = this.getTodayDate();
      const allData = this.getAllChoiceData();
      return allData[today]?.studentChoices || [];
    } catch (error) {
      console.error('Error loading today\'s choices:', error);
      return [];
    }
  }

  // Get student choices for a specific date
  getChoicesForDate(date: string): StudentChoice[] {
    try {
      const allData = this.getAllChoiceData();
      return allData[date]?.studentChoices || [];
    } catch (error) {
      console.error(`Error loading choices for ${date}:`, error);
      return [];
    }
  }

  // Get all choice data
  private getAllChoiceData(): { [date: string]: DailyChoiceData } {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error loading choice data:', error);
      return {};
    }
  }

  // Get rotation history from IndependentChoices
  private getRotationHistory(): any[] {
    try {
      const stored = localStorage.getItem('choiceRotationHistory');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading rotation history:', error);
      return [];
    }
  }

  // Update a specific student's choice
  updateStudentChoice(studentId: string, choice: Omit<StudentChoice, 'studentId'>): void {
    try {
      const currentChoices = this.getTodayChoices();
      const updatedChoices = currentChoices.filter(c => c.studentId !== studentId);
      updatedChoices.push({ studentId, ...choice });
      this.saveTodayChoices(updatedChoices);
    } catch (error) {
      console.error('Error updating student choice:', error);
    }
  }

  // Remove a student's choice
  removeStudentChoice(studentId: string): void {
    try {
      const currentChoices = this.getTodayChoices();
      const updatedChoices = currentChoices.filter(c => c.studentId !== studentId);
      this.saveTodayChoices(updatedChoices);
    } catch (error) {
      console.error('Error removing student choice:', error);
    }
  }

  // Get choice for a specific student today
  getStudentChoiceToday(studentId: string): StudentChoice | null {
    try {
      const todayChoices = this.getTodayChoices();
      return todayChoices.find(c => c.studentId === studentId) || null;
    } catch (error) {
      console.error('Error getting student choice:', error);
      return null;
    }
  }

  // Get students assigned to a specific activity today
  getStudentsForActivity(activityId: string): StudentChoice[] {
    try {
      const todayChoices = this.getTodayChoices();
      return todayChoices.filter(c => c.activityId === activityId);
    } catch (error) {
      console.error('Error getting students for activity:', error);
      return [];
    }
  }

  // Get activity assignments grouped by activity
  getActivityAssignments(): { [activityId: string]: StudentChoice[] } {
    try {
      const todayChoices = this.getTodayChoices();
      const assignments: { [activityId: string]: StudentChoice[] } = {};
      
      todayChoices.forEach(choice => {
        if (!assignments[choice.activityId]) {
          assignments[choice.activityId] = [];
        }
        assignments[choice.activityId].push(choice);
      });
      
      return assignments;
    } catch (error) {
      console.error('Error getting activity assignments:', error);
      return {};
    }
  }

  // Get choice statistics
  getChoiceStatistics(): {
    totalStudentsWithChoices: number;
    totalActivitiesUsed: number;
    mostPopularActivity: { name: string; count: number } | null;
    averageStudentsPerActivity: number;
  } {
    try {
      const todayChoices = this.getTodayChoices();
      const activityCounts: { [activityName: string]: number } = {};
      
      todayChoices.forEach(choice => {
        activityCounts[choice.activityName] = (activityCounts[choice.activityName] || 0) + 1;
      });
      
      const activities = Object.keys(activityCounts);
      const mostPopular = activities.length > 0 
        ? activities.reduce((a, b) => activityCounts[a] > activityCounts[b] ? a : b)
        : null;
      
      return {
        totalStudentsWithChoices: todayChoices.length,
        totalActivitiesUsed: activities.length,
        mostPopularActivity: mostPopular ? { name: mostPopular, count: activityCounts[mostPopular] } : null,
        averageStudentsPerActivity: activities.length > 0 ? todayChoices.length / activities.length : 0
      };
    } catch (error) {
      console.error('Error calculating choice statistics:', error);
      return {
        totalStudentsWithChoices: 0,
        totalActivitiesUsed: 0,
        mostPopularActivity: null,
        averageStudentsPerActivity: 0
      };
    }
  }

  // Clear all choice data (for testing/reset)
  clearAllChoiceData(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem('choiceRotationHistory');
      console.log('🗑️ Cleared all choice data');
    } catch (error) {
      console.error('Error clearing choice data:', error);
    }
  }

  // Export choice data for backup
  exportChoiceData(): string {
    try {
      const allData = this.getAllChoiceData();
      return JSON.stringify(allData, null, 2);
    } catch (error) {
      console.error('Error exporting choice data:', error);
      return '{}';
    }
  }

  // Import choice data from backup
  importChoiceData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
      console.log('📥 Imported choice data successfully');
      return true;
    } catch (error) {
      console.error('Error importing choice data:', error);
      return false;
    }
  }

  // Sync with IndependentChoices component
  syncWithIndependentChoices(): void {
    try {
      // Get current rotation from IndependentChoices
      const rotationHistory = this.getRotationHistory();
      const latestRotation = rotationHistory[rotationHistory.length - 1];
      
      if (latestRotation && latestRotation.assignments) {
        const choices: StudentChoice[] = latestRotation.assignments.map((assignment: any) => ({
          studentId: assignment.studentId,
          studentName: assignment.studentName,
          activityId: assignment.activityId,
          activityName: assignment.activityName,
          activityIcon: assignment.activityEmoji,
          assignedAt: assignment.assignedAt,
          rotationNumber: assignment.rotationNumber
        }));
        
        this.saveTodayChoices(choices);
        console.log(`🔄 Synced ${choices.length} choices from IndependentChoices`);
      }
    } catch (error) {
      console.error('Error syncing with IndependentChoices:', error);
    }
  }
}

export default ChoiceDataManager;
