// 🚀 Visual Schedule Builder - Storage Utilities
// File: src/renderer/utils/storage.ts
// Purpose: Provides type-safe localStorage functions for the Visual Schedule Builder

/**
 * 💾 Load data from localStorage with type safety and error handling
 * @param key - The localStorage key to retrieve
 * @param defaultValue - The default value to return if key doesn't exist or parsing fails
 * @returns The parsed data or the default value
 */
export const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    if (item === null) {
      console.log(`📂 No data found for key "${key}", using default value`);
      return defaultValue;
    }
    
    const parsed = JSON.parse(item);
    console.log(`✅ Loaded from storage [${key}]:`, Array.isArray(parsed) ? `Array(${parsed.length})` : typeof parsed);
    return parsed;
  } catch (error) {
    console.error(`❌ Error loading from storage [${key}]:`, error);
    return defaultValue;
  }
};

/**
 * 💾 Save data to localStorage with type safety and error handling
 * @param key - The localStorage key to store under
 * @param value - The value to store (will be JSON.stringify'd)
 */
export const saveToStorage = <T>(key: string, value: T): void => {
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
    console.log(`💾 Saved to storage [${key}]:`, Array.isArray(value) ? `Array(${value.length})` : typeof value);
  } catch (error) {
    console.error(`❌ Error saving to storage [${key}]:`, error);
    
    // Handle quota exceeded error
    if (error instanceof DOMException && error.code === 22) {
      console.warn('🚨 localStorage quota exceeded! Consider implementing data cleanup.');
      
      // Attempt to free up space by removing old data
      try {
        const keysToClean = ['temp_', 'cache_', 'old_'];
        keysToClean.forEach(prefix => {
          for (let i = localStorage.length - 1; i >= 0; i--) {
            const storageKey = localStorage.key(i);
            if (storageKey && storageKey.startsWith(prefix)) {
              localStorage.removeItem(storageKey);
              console.log(`🧹 Cleaned old storage key: ${storageKey}`);
            }
          }
        });
        
        // Try saving again after cleanup
        const serializedRetry = JSON.stringify(value);
        localStorage.setItem(key, serializedRetry);
        console.log(`✅ Successfully saved after cleanup [${key}]`);
      } catch (retryError) {
        console.error(`❌ Failed to save even after cleanup [${key}]:`, retryError);
      }
    }
  }
};

/**
 * 🗑️ Remove data from localStorage
 * @param key - The localStorage key to remove
 */
export const removeFromStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
    console.log(`🗑️ Removed from storage: ${key}`);
  } catch (error) {
    console.error(`❌ Error removing from storage [${key}]:`, error);
  }
};

/**
 * 🔍 Check if a key exists in localStorage
 * @param key - The localStorage key to check
 * @returns true if the key exists, false otherwise
 */
export const existsInStorage = (key: string): boolean => {
  try {
    return localStorage.getItem(key) !== null;
  } catch (error) {
    console.error(`❌ Error checking storage existence [${key}]:`, error);
    return false;
  }
};

/**
 * 📊 Get storage usage information
 * @returns Object with storage usage stats
 */
export const getStorageInfo = () => {
  try {
    let totalSize = 0;
    const keyData: { [key: string]: number } = {};
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key) || '';
        const size = new Blob([value]).size;
        keyData[key] = size;
        totalSize += size;
      }
    }
    
    // Estimate available space (typical limit is 5-10MB)
    const estimatedLimit = 5 * 1024 * 1024; // 5MB in bytes
    const usagePercentage = (totalSize / estimatedLimit) * 100;
    
    return {
      totalKeys: localStorage.length,
      totalSize: totalSize,
      totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
      usagePercentage: Math.min(usagePercentage, 100).toFixed(1),
      keyData: keyData,
      largestKeys: Object.entries(keyData)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([key, size]) => ({ key, size, sizeMB: (size / (1024 * 1024)).toFixed(3) }))
    };
  } catch (error) {
    console.error('❌ Error getting storage info:', error);
    return null;
  }
};

/**
 * 🧹 Clean up old or temporary storage entries
 * @param patterns - Array of string patterns to match for deletion
 */
export const cleanupStorage = (patterns: string[] = ['temp_', 'cache_', 'backup_old_']): number => {
  let deletedCount = 0;
  
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && patterns.some(pattern => key.includes(pattern))) {
        localStorage.removeItem(key);
        deletedCount++;
        console.log(`🧹 Cleaned storage key: ${key}`);
      }
    }
    
    console.log(`✅ Storage cleanup complete. Removed ${deletedCount} items.`);
    return deletedCount;
  } catch (error) {
    console.error('❌ Error during storage cleanup:', error);
    return deletedCount;
  }
};

/**
 * 📋 Export all Visual Schedule Builder data as JSON
 * @returns JSON string containing all VSB data
 */
export const exportAllVSBData = (): string => {
  try {
    const vsbData: { [key: string]: any } = {};
    const vsbKeys = [
      'vsb_students',
      'vsb_staff', 
      'vsb_activities',
      'saved_schedules',
      'scheduleVariations',
      'activityLibrary',
      'students',
      'staff',
      'vsb_settings',
      'choiceRotationHistory',
      'choiceAnalytics',
      'behaviorCommitments'
    ];
    
    vsbKeys.forEach(key => {
      const data = localStorage.getItem(key);
      if (data) {
        try {
          vsbData[key] = JSON.parse(data);
        } catch {
          vsbData[key] = data; // Store as string if not JSON
        }
      }
    });
    
    const exportPackage = {
      exportedAt: new Date().toISOString(),
      version: '1.0',
      application: 'Visual Schedule Builder',
      data: vsbData
    };
    
    return JSON.stringify(exportPackage, null, 2);
  } catch (error) {
    console.error('❌ Error exporting VSB data:', error);
    throw new Error('Failed to export Visual Schedule Builder data');
  }
};

/**
 * 📥 Import Visual Schedule Builder data from JSON
 * @param jsonData - JSON string containing VSB data export
 * @param overwrite - Whether to overwrite existing data
 */
export const importVSBData = (jsonData: string, overwrite: boolean = false): void => {
  try {
    const importPackage = JSON.parse(jsonData);
    
    if (!importPackage.data) {
      throw new Error('Invalid import format: missing data property');
    }
    
    const importData = importPackage.data;
    let importedCount = 0;
    
    Object.entries(importData).forEach(([key, value]) => {
      const exists = existsInStorage(key);
      
      if (!exists || overwrite) {
        saveToStorage(key, value);
        importedCount++;
        console.log(`📥 Imported ${key}`);
      } else {
        console.log(`⏭️ Skipped ${key} (already exists)`);
      }
    });
    
    console.log(`✅ Import complete. Imported ${importedCount} items.`);
  } catch (error) {
    console.error('❌ Error importing VSB data:', error);
    throw new Error('Failed to import Visual Schedule Builder data');
  }
};

// 🚀 Default export for convenience
export default {
  loadFromStorage,
  saveToStorage,
  removeFromStorage,
  existsInStorage,
  getStorageInfo,
  cleanupStorage,
  exportAllVSBData,
  importVSBData
};
