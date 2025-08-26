import UnifiedDataService from '../services/unifiedDataService';

export const DataMigrationUtility = {
  
  // Check if legacy calendar settings exist
  hasLegacyCalendarData: (): boolean => {
    try {
      const legacyCalendarSettings = localStorage.getItem('calendarSettings');
      if (legacyCalendarSettings) {
        const parsed = JSON.parse(legacyCalendarSettings);
        return !!(parsed.customBehaviorCommitments || parsed.customCelebrations);
      }
      return false;
    } catch {
      return false;
    }
  },

  // Migrate legacy calendar data to unified format
  migrateLegacyData: (): void => {
    try {
      console.log('🔄 Starting legacy data migration...');
      
      const legacyCalendarSettings = localStorage.getItem('calendarSettings');
      if (!legacyCalendarSettings) {
        console.log('ℹ️ No legacy calendar settings found');
        return;
      }

      const legacyData = JSON.parse(legacyCalendarSettings);
      console.log('📋 Legacy data found:', legacyData);

      // Get current unified settings
      const currentSettings = UnifiedDataService.getSettings();
      console.log('📋 Current unified settings:', currentSettings);

      // Migrate behavior commitments
      const legacyBehavior = legacyData.customBehaviorCommitments || {};
      const migratedBehaviorStatements: any[] = [];
      
      Object.keys(legacyBehavior).forEach(categoryId => {
        const statements = legacyBehavior[categoryId] || [];
        statements.forEach((statement: string, index: number) => {
          migratedBehaviorStatements.push({
            id: `migrated_${categoryId}_${index}`,
            text: statement,
            category: categoryId,
            emoji: getCategoryEmoji(categoryId),
            isActive: true,
            isDefault: false,
            createdAt: new Date().toISOString()
          });
        });
      });

      // Migrate celebrations
      const legacyCelebrations = legacyData.customCelebrations || [];
      const migratedCelebrations = legacyCelebrations.map((celebration: any) => ({
        id: celebration.id || `migrated_${Date.now()}_${Math.random()}`,
        name: celebration.title || celebration.name,
        emoji: celebration.emoji || '🎉',
        message: celebration.message || `Celebrating ${celebration.title || celebration.name}!`,
        date: celebration.date,
        isRecurring: celebration.isRecurring || false,
        enabled: true,
        type: 'custom',
        createdAt: new Date().toISOString()
      }));

      // Create updated unified settings
      const updatedSettings = {
        ...currentSettings,
        // Note: DailyCheckIn functionality has been moved to Morning Meeting
        // Legacy behavior commitments and celebrations are preserved in their new locations
        behaviorCommitments: {
          ...currentSettings.behaviorCommitments,
          customStatements: [
            ...(currentSettings.behaviorCommitments?.customStatements || []),
            ...migratedBehaviorStatements
          ]
        },
        celebrations: {
          ...currentSettings.celebrations,
          enabled: legacyData.celebrationsEnabled !== false,
          customCelebrations: [
            ...(currentSettings.celebrations?.customCelebrations || []),
            ...migratedCelebrations
          ]
        }
      };

      console.log('💾 Saving migrated settings:', updatedSettings);

      // Save to unified system
      UnifiedDataService.updateSettings(updatedSettings);

      // Backup legacy data before removing
      localStorage.setItem('calendarSettings_backup', legacyCalendarSettings);
      
      // Remove legacy data to prevent conflicts
      localStorage.removeItem('calendarSettings');

      console.log('✅ Legacy data migration completed successfully');
      console.log('📦 Legacy data backed up to calendarSettings_backup');

      // Trigger update event
      window.dispatchEvent(new CustomEvent('unifiedSettingsChanged', { 
        detail: updatedSettings 
      }));

    } catch (error) {
      console.error('❌ Legacy data migration failed:', error);
    }
  },

  // Clean up all legacy data sources
  cleanupLegacyData: (): void => {
    console.log('🧹 Cleaning up legacy data sources...');
    
    // List of legacy storage keys to clean
    const legacyKeys = [
      'calendarSettings',
      'behaviorStatements',
      'customCelebrations',
      'weatherSettings'
    ];

    legacyKeys.forEach(key => {
      if (localStorage.getItem(key)) {
        // Backup before removing
        localStorage.setItem(`${key}_backup`, localStorage.getItem(key)!);
        localStorage.removeItem(key);
        console.log(`🗑️ Removed legacy key: ${key}`);
      }
    });

    console.log('✅ Legacy data cleanup completed');
  }
};

// Helper function to get emoji for category
const getCategoryEmoji = (categoryId: string): string => {
  const emojiMap: { [key: string]: string } = {
    'kindness': '🤝',
    'respect': '👂',
    'effort': '💪',
    'responsibility': '📋',
    'safety': '🛡️',
    'learning': '📚'
  };
  return emojiMap[categoryId] || '⭐';
};

// Debug utilities
export const DebugDataSources = {
  
  // Inspect all data sources
  inspectAllDataSources: () => {
    console.log('🔍 === DATA SOURCE INSPECTION ===');
    
    console.log('📱 UnifiedDataService settings:', UnifiedDataService.getSettings());
    console.log('🗄️ localStorage calendarSettings:', localStorage.getItem('calendarSettings'));
    console.log('🗄️ localStorage unifiedData:', localStorage.getItem('unifiedData'));
    console.log('🗄️ localStorage visualScheduleBuilderSettings:', localStorage.getItem('visualScheduleBuilderSettings'));
    
    console.log('🔍 Legacy data check:', DataMigrationUtility.hasLegacyCalendarData());
  },

  // Force migration and cleanup
  forceMigrationAndCleanup: () => {
    console.log('🔧 === FORCING MIGRATION AND CLEANUP ===');
    
    DataMigrationUtility.migrateLegacyData();
    DataMigrationUtility.cleanupLegacyData();
    
    // Refresh components
    window.dispatchEvent(new CustomEvent('unifiedSettingsChanged', { 
      detail: UnifiedDataService.getSettings() 
    }));
    
    console.log('✅ Migration and cleanup completed');
  },

  // Add test data to verify fix
  addTestData: () => {
    const currentSettings = UnifiedDataService.getSettings();
    const testSettings = {
      ...currentSettings,
      // Note: DailyCheckIn functionality has been moved to Morning Meeting
      behaviorCommitments: {
        ...currentSettings.behaviorCommitments,
        customStatements: [
          { id: 'test1', text: 'I will test my behavior statements', category: 'kindness', emoji: '🤝', isActive: true, isDefault: false, createdAt: new Date().toISOString() },
          { id: 'test2', text: 'I will verify the fix works', category: 'respect', emoji: '👂', isActive: true, isDefault: false, createdAt: new Date().toISOString() }
        ]
      },
      celebrations: {
        ...currentSettings.celebrations,
        enabled: true,
        customCelebrations: [
          {
            id: 'test1',
            name: 'Test Celebration Fix',
            emoji: '🔧',
            message: 'Testing that celebrations load correctly!',
            date: new Date().toISOString().split('T')[0],
            enabled: true,
            isRecurring: false,
            type: 'custom',
            createdAt: new Date().toISOString()
          }
        ]
      }
    };
    
    UnifiedDataService.updateSettings(testSettings);
    window.dispatchEvent(new CustomEvent('unifiedSettingsChanged', { detail: testSettings }));
    
    console.log('🧪 Test data added');
  }
};
