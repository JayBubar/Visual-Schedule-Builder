// File: src/renderer/utils/celebrationManager.ts
import React from 'react';
import { CelebrationStyle } from '../types';

export interface CelebrationEvent {
  id: string;
  style: CelebrationStyle;
  activityName: string;
  timestamp: number;
  duration: number;
  studentName?: string;
}

export interface CelebrationSettings {
  enabled: boolean;
  defaultStyle: CelebrationStyle;
  volume: number;
  duration: number;
  autoAdvance: boolean;
}

class CelebrationManager {
  private celebrations: CelebrationEvent[] = [];
  private settings: CelebrationSettings = {
    enabled: true,
    defaultStyle: 'gentle',
    volume: 0.5,
    duration: 3000,
    autoAdvance: true
  };
  private listeners: Array<(event: CelebrationEvent) => void> = [];

  /**
   * Trigger a celebration
   */
  triggerCelebration(
    activityName: string, 
    style?: CelebrationStyle, 
    studentName?: string
  ): string {
    if (!this.settings.enabled) return '';

    const celebrationEvent: CelebrationEvent = {
      id: `celebration_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      style: style || this.settings.defaultStyle,
      activityName,
      timestamp: Date.now(),
      duration: this.settings.duration,
      studentName
    };

    this.celebrations.push(celebrationEvent);
    
    // Notify all listeners
    this.listeners.forEach(listener => {
      try {
        listener(celebrationEvent);
      } catch (error) {
        console.error('Error in celebration listener:', error);
      }
    });

    // Auto-remove celebration after duration
    setTimeout(() => {
      this.removeCelebration(celebrationEvent.id);
    }, this.settings.duration);

    console.log(`🎉 Celebration triggered: ${activityName} (${style})`);
    return celebrationEvent.id;
  }

  /**
   * Subscribe to celebration events
   */
  subscribe(listener: (event: CelebrationEvent) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Remove a celebration
   */
  removeCelebration(id: string): void {
    const index = this.celebrations.findIndex(c => c.id === id);
    if (index > -1) {
      this.celebrations.splice(index, 1);
    }
  }

  /**
   * Get active celebrations
   */
  getActiveCelebrations(): CelebrationEvent[] {
    const now = Date.now();
    return this.celebrations.filter(
      celebration => (now - celebration.timestamp) < celebration.duration
    );
  }

  /**
   * Update settings
   */
  updateSettings(newSettings: Partial<CelebrationSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
  }

  /**
   * Get current settings
   */
  getSettings(): CelebrationSettings {
    return { ...this.settings };
  }

  /**
   * Load settings from storage
   */
  loadSettings(): void {
    try {
      const saved = localStorage.getItem('celebration_settings');
      if (saved) {
        const parsedSettings = JSON.parse(saved);
        this.settings = { ...this.settings, ...parsedSettings };
      }
    } catch (error) {
      console.error('Error loading celebration settings:', error);
    }
  }

  /**
   * Save settings to storage
   */
  private saveSettings(): void {
    try {
      localStorage.setItem('celebration_settings', JSON.stringify(this.settings));
    } catch (error) {
      console.error('Error saving celebration settings:', error);
    }
  }

  /**
   * Get celebration style for activity/student
   */
  getCelebrationStyle(activityName: string, studentName?: string): CelebrationStyle {
    // In a more advanced system, this could look up student preferences
    // For now, return default or gentle for sensory-sensitive activities
    
    const gentleActivities = [
      'quiet time', 'reading', 'individual work', 'rest', 'calm down',
      'sensory break', 'meditation', 'yoga'
    ];
    
    const excitedActivities = [
      'recess', 'pe', 'art', 'music', 'celebration', 'party', 'game',
      'achievement', 'milestone', 'graduation'
    ];

    const activityLower = activityName.toLowerCase();
    
    if (gentleActivities.some(activity => activityLower.includes(activity))) {
      return 'gentle';
    }
    
    if (excitedActivities.some(activity => activityLower.includes(activity))) {
      return 'excited';
    }
    
    return this.settings.defaultStyle;
  }

  /**
   * Bulk trigger celebrations for multiple activities/students
   */
  triggerBulkCelebrations(
    celebrations: Array<{
      activityName: string;
      studentName?: string;
      style?: CelebrationStyle;
    }>
  ): string[] {
    return celebrations.map(({ activityName, studentName, style }) =>
      this.triggerCelebration(activityName, style, studentName)
    );
  }

  /**
   * Schedule a delayed celebration
   */
  scheduleCelebration(
    delayMs: number,
    activityName: string,
    style?: CelebrationStyle,
    studentName?: string
  ): string {
    const timeoutId = setTimeout(() => {
      this.triggerCelebration(activityName, style, studentName);
    }, delayMs);

    // Return a cancellation ID
    const cancellationId = `scheduled_${Date.now()}`;
    
    // Store for potential cancellation
    (this as any)[`_timeout_${cancellationId}`] = timeoutId;
    
    return cancellationId;
  }

  /**
   * Cancel a scheduled celebration
   */
  cancelScheduledCelebration(cancellationId: string): void {
    const timeoutId = (this as any)[`_timeout_${cancellationId}`];
    if (timeoutId) {
      clearTimeout(timeoutId);
      delete (this as any)[`_timeout_${cancellationId}`];
    }
  }

  /**
   * Get celebration history
   */
  getCelebrationHistory(limit: number = 50): CelebrationEvent[] {
    return this.celebrations
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  /**
   * Clear celebration history
   */
  clearHistory(): void {
    this.celebrations = [];
  }

  /**
   * Get celebration statistics
   */
  getStatistics(timeRange: number = 24 * 60 * 60 * 1000): {
    total: number;
    gentle: number;
    excited: number;
    averagePerHour: number;
    mostCommonActivity: string;
  } {
    const now = Date.now();
    const recentCelebrations = this.celebrations.filter(
      c => (now - c.timestamp) <= timeRange
    );

    const gentle = recentCelebrations.filter(c => c.style === 'gentle').length;
    const excited = recentCelebrations.filter(c => c.style === 'excited').length;
    
    const hours = timeRange / (60 * 60 * 1000);
    const averagePerHour = recentCelebrations.length / hours;

    // Find most common activity
    const activityCounts: { [key: string]: number } = {};
    recentCelebrations.forEach(c => {
      activityCounts[c.activityName] = (activityCounts[c.activityName] || 0) + 1;
    });
    
    const mostCommonActivity = Object.entries(activityCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None';

    return {
      total: recentCelebrations.length,
      gentle,
      excited,
      averagePerHour: Math.round(averagePerHour * 100) / 100,
      mostCommonActivity
    };
  }

  /**
   * Test celebration system
   */
  testCelebration(style: CelebrationStyle = 'gentle'): string {
    return this.triggerCelebration('🧪 Test Activity', style, '👤 Test Student');
  }

  /**
   * Export celebration data
   */
  exportData(): {
    settings: CelebrationSettings;
    history: CelebrationEvent[];
    statistics: any;
  } {
    return {
      settings: this.getSettings(),
      history: this.getCelebrationHistory(),
      statistics: this.getStatistics()
    };
  }

  /**
   * Import celebration data
   */
  importData(data: {
    settings?: CelebrationSettings;
    history?: CelebrationEvent[];
  }): void {
    if (data.settings) {
      this.updateSettings(data.settings);
    }
    
    if (data.history) {
      this.celebrations = [...data.history];
    }
  }
}

// Create singleton instance
export const celebrationManager = new CelebrationManager();

// Initialize settings on creation
celebrationManager.loadSettings();

// React hook for celebration management
export const useCelebrationManager = () => {
  const [settings, setSettings] = React.useState(celebrationManager.getSettings());
  const [activeCelebrations, setActiveCelebrations] = React.useState<CelebrationEvent[]>([]);

  React.useEffect(() => {
    // Subscribe to celebration events
    const unsubscribe = celebrationManager.subscribe((event) => {
      setActiveCelebrations(celebrationManager.getActiveCelebrations());
    });

    // Update active celebrations periodically
    const interval = setInterval(() => {
      setActiveCelebrations(celebrationManager.getActiveCelebrations());
    }, 1000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const updateSettings = (newSettings: Partial<CelebrationSettings>) => {
    celebrationManager.updateSettings(newSettings);
    setSettings(celebrationManager.getSettings());
  };

  const triggerCelebration = (
    activityName: string, 
    style?: CelebrationStyle, 
    studentName?: string
  ) => {
    return celebrationManager.triggerCelebration(activityName, style, studentName);
  };

  const testCelebration = (style: CelebrationStyle = 'gentle') => {
    return celebrationManager.testCelebration(style);
  };

  return {
    settings,
    activeCelebrations,
    updateSettings,
    triggerCelebration,
    testCelebration,
    getStatistics: () => celebrationManager.getStatistics(),
    getCelebrationStyle: (activityName: string, studentName?: string) => 
      celebrationManager.getCelebrationStyle(activityName, studentName)
  };
};

// Export types and manager
export default celebrationManager;