import React, { useState, useEffect, useCallback } from 'react';
import { DataMigrationManager } from '../../utils/dataMigration';
import DataMigrationInterface from '../migration/DataMigrationInterface';

interface SettingsProps {
  isActive: boolean;
}

interface SettingsData {
  appearance: {
    theme: 'light' | 'dark' | 'high-contrast';
    fontSize: 'small' | 'medium' | 'large' | 'extra-large';
    animations: boolean;
    colorBlindFriendly: boolean;
  };
  accessibility: {
    screenReader: boolean;
    keyboardNavigation: boolean;
    reduceMotion: boolean;
    highContrast: boolean;
    textToSpeech: boolean;
    autoReadSchedule: boolean;
  };
  smartboard: {
    touchSensitivity: 'low' | 'medium' | 'high';
    buttonSize: 'small' | 'medium' | 'large' | 'extra-large';
    displayMode: 'standard' | 'presentation' | 'kiosk';
    autoFullscreen: boolean;
    gestureControls: boolean;
  };
  schedule: {
    defaultDuration: number;
    timeFormat: '12h' | '24h';
    autoAdvance: boolean;
    soundAlerts: boolean;
    visualAlerts: boolean;
    transitionWarning: number;
    autoSave: boolean;
  };
  notifications: {
    activityReminders: boolean;
    transitionAlerts: boolean;
    completionSounds: boolean;
    customSounds: boolean;
    volume: number;
  };
  data: {
    autoBackup: boolean;
    backupFrequency: 'daily' | 'weekly' | 'monthly';
    exportFormat: 'json' | 'csv' | 'pdf';
    includePhotos: boolean;
    cloudSync: boolean;
  };
}

// Default settings configuration
const DEFAULT_SETTINGS: SettingsData = {
  appearance: {
    theme: 'light',
    fontSize: 'medium',
    animations: true,
    colorBlindFriendly: false
  },
  accessibility: {
    screenReader: false,
    keyboardNavigation: true,
    reduceMotion: false,
    highContrast: false,
    textToSpeech: false,
    autoReadSchedule: false
  },
  smartboard: {
    touchSensitivity: 'medium',
    buttonSize: 'large',
    displayMode: 'presentation',
    autoFullscreen: false,
    gestureControls: true
  },
  schedule: {
    defaultDuration: 30,
    timeFormat: '12h',
    autoAdvance: false,
    soundAlerts: true,
    visualAlerts: true,
    transitionWarning: 5,
    autoSave: true
  },
  notifications: {
    activityReminders: true,
    transitionAlerts: true,
    completionSounds: true,
    customSounds: false,
    volume: 70
  },
  data: {
    autoBackup: true,
    backupFrequency: 'weekly',
    exportFormat: 'json',
    includePhotos: true,
    cloudSync: false
  }
};

// Settings storage key
const SETTINGS_STORAGE_KEY = 'visualScheduleBuilderSettings';

const Settings: React.FC<SettingsProps> = ({ isActive }) => {
  const [activeSection, setActiveSection] = useState<keyof SettingsData>('appearance');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showMigrationInterface, setShowMigrationInterface] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState<'unknown' | 'needed' | 'completed'>('unknown');

  // Settings state
  const [settings, setSettings] = useState<SettingsData>(DEFAULT_SETTINGS);

  // Load settings from localStorage on component mount
  const loadSettings = useCallback(() => {
    try {
      setIsLoading(true);
      const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
      
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        
        // Merge with defaults to ensure all keys exist
        const mergedSettings = {
          ...DEFAULT_SETTINGS,
          ...parsedSettings,
          // Deep merge each section
          appearance: { ...DEFAULT_SETTINGS.appearance, ...parsedSettings.appearance },
          accessibility: { ...DEFAULT_SETTINGS.accessibility, ...parsedSettings.accessibility },
          smartboard: { ...DEFAULT_SETTINGS.smartboard, ...parsedSettings.smartboard },
          schedule: { ...DEFAULT_SETTINGS.schedule, ...parsedSettings.schedule },
          notifications: { ...DEFAULT_SETTINGS.notifications, ...parsedSettings.notifications },
          data: { ...DEFAULT_SETTINGS.data, ...parsedSettings.data }
        };
        
        setSettings(mergedSettings);
        console.log('✅ Settings loaded from localStorage:', mergedSettings);
        
        // Apply settings immediately
        applySettings(mergedSettings);
      } else {
        console.log('📝 No saved settings found, using defaults');
        applySettings(DEFAULT_SETTINGS);
      }
    } catch (error) {
      console.error('❌ Error loading settings:', error);
      setShowErrorMessage('Failed to load settings. Using defaults.');
      applySettings(DEFAULT_SETTINGS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Apply settings to the application
  const applySettings = useCallback((settingsToApply: SettingsData) => {
    try {
      // Apply theme
      const body = document.body;
      body.classList.remove('theme-light', 'theme-dark', 'theme-high-contrast');
      body.classList.add(`theme-${settingsToApply.appearance.theme}`);

      // Apply font size
      body.classList.remove('font-small', 'font-medium', 'font-large', 'font-extra-large');
      body.classList.add(`font-${settingsToApply.appearance.fontSize}`);

      // Apply animations
      if (!settingsToApply.appearance.animations || settingsToApply.accessibility.reduceMotion) {
        body.classList.add('reduce-motion');
      } else {
        body.classList.remove('reduce-motion');
      }

      // Apply high contrast
      if (settingsToApply.accessibility.highContrast || settingsToApply.appearance.theme === 'high-contrast') {
        body.classList.add('high-contrast');
      } else {
        body.classList.remove('high-contrast');
      }

      // Apply color blind friendly
      if (settingsToApply.appearance.colorBlindFriendly) {
        body.classList.add('color-blind-friendly');
      } else {
        body.classList.remove('color-blind-friendly');
      }

      // Apply button size for smartboard
      body.classList.remove('buttons-small', 'buttons-medium', 'buttons-large', 'buttons-extra-large');
      body.classList.add(`buttons-${settingsToApply.smartboard.buttonSize}`);

      // Dispatch custom event for other components to listen to
      window.dispatchEvent(new CustomEvent('settingsChanged', {
        detail: settingsToApply
      }));

      console.log('🎨 Settings applied to application');
    } catch (error) {
      console.error('❌ Error applying settings:', error);
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = useCallback(() => {
    try {
      // Validate settings before saving
      const validationError = validateSettings(settings);
      if (validationError) {
        setShowErrorMessage(validationError);
        return;
      }

      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
      setHasUnsavedChanges(false);
      
      // Apply settings immediately
      applySettings(settings);
      
      // Show success message
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
      
      console.log('💾 Settings saved successfully:', settings);
    } catch (error) {
      console.error('❌ Error saving settings:', error);
      setShowErrorMessage('Failed to save settings. Please try again.');
    }
  }, [settings, applySettings]);

  // Validate settings
  const validateSettings = (settingsToValidate: SettingsData): string | null => {
    // Validate default duration
    if (settingsToValidate.schedule.defaultDuration < 5 || settingsToValidate.schedule.defaultDuration > 120) {
      return 'Default duration must be between 5 and 120 minutes';
    }

    // Validate transition warning
    if (settingsToValidate.schedule.transitionWarning < 1 || settingsToValidate.schedule.transitionWarning > 15) {
      return 'Transition warning must be between 1 and 15 minutes';
    }

    // Validate volume
    if (settingsToValidate.notifications.volume < 0 || settingsToValidate.notifications.volume > 100) {
      return 'Volume must be between 0 and 100';
    }

    return null;
  };

  // Update a specific setting
  const updateSetting = useCallback((section: keyof SettingsData, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
    setHasUnsavedChanges(true);
    setShowErrorMessage(null);
  }, []);

  // Reset settings to defaults
  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    setHasUnsavedChanges(true);
    setShowResetDialog(false);
    setShowErrorMessage(null);
    console.log('🔄 Settings reset to defaults');
  }, []);

  // Export settings
  const exportSettings = useCallback(() => {
    try {
      const dataStr = JSON.stringify(settings, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = 'visual-schedule-builder-settings.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log('📤 Settings exported successfully');
    } catch (error) {
      console.error('❌ Error exporting settings:', error);
      setShowErrorMessage('Failed to export settings');
    }
  }, [settings]);

  // Import settings
  const importSettings = useCallback(() => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      
      input.onchange = (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const importedSettings = JSON.parse(e.target?.result as string);
            
            // Validate imported settings structure
            if (!importedSettings || typeof importedSettings !== 'object') {
              throw new Error('Invalid settings file format');
            }
            
            // Merge with defaults to ensure all keys exist
            const mergedSettings = {
              ...DEFAULT_SETTINGS,
              ...importedSettings,
              appearance: { ...DEFAULT_SETTINGS.appearance, ...importedSettings.appearance },
              accessibility: { ...DEFAULT_SETTINGS.accessibility, ...importedSettings.accessibility },
              smartboard: { ...DEFAULT_SETTINGS.smartboard, ...importedSettings.smartboard },
              schedule: { ...DEFAULT_SETTINGS.schedule, ...importedSettings.schedule },
              notifications: { ...DEFAULT_SETTINGS.notifications, ...importedSettings.notifications },
              data: { ...DEFAULT_SETTINGS.data, ...importedSettings.data }
            };
            
            setSettings(mergedSettings);
            setHasUnsavedChanges(true);
            setShowErrorMessage(null);
            console.log('📥 Settings imported successfully:', mergedSettings);
          } catch (error) {
            console.error('❌ Error importing settings:', error);
            setShowErrorMessage('Failed to import settings. Invalid file format.');
          }
        };
        reader.readAsText(file);
      };
      
      input.click();
    } catch (error) {
      console.error('❌ Error importing settings:', error);
      setShowErrorMessage('Failed to import settings');
    }
  }, []);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
    checkMigrationStatus();
  }, [loadSettings]);

  const checkMigrationStatus = () => {
    try {
      const isMigrationNeeded = DataMigrationManager.isMigrationNeeded();
      const existingUnifiedData = DataMigrationManager.getUnifiedData();
      
      if (existingUnifiedData && !isMigrationNeeded) {
        setMigrationStatus('completed');
      } else if (isMigrationNeeded) {
        setMigrationStatus('needed');
      } else {
        setMigrationStatus('unknown');
      }
    } catch (error) {
      console.error('Error checking migration status:', error);
      setMigrationStatus('unknown');
    }
  };

  const handleMigrationComplete = (success: boolean) => {
    if (success) {
      setShowMigrationInterface(false);
      setMigrationStatus('completed');
      // Refresh the page to reload with unified data
      window.location.reload();
    } else {
      console.error('Migration failed');
      // Keep the migration interface open for retry
    }
  };

  // Auto-save when enabled
  useEffect(() => {
    if (settings.schedule.autoSave && hasUnsavedChanges) {
      const timer = setTimeout(() => {
        saveSettings();
      }, 2000); // Auto-save after 2 seconds of no changes
      
      return () => clearTimeout(timer);
    }
  }, [settings.schedule.autoSave, hasUnsavedChanges, saveSettings]);

  const settingsSections = [
    { id: 'appearance', name: 'Appearance', icon: '🎨', description: 'Themes, fonts, and visual preferences' },
    { id: 'accessibility', name: 'Accessibility', icon: '♿', description: 'Screen readers, navigation, and inclusive features' },
    { id: 'smartboard', name: 'Smartboard', icon: '📺', description: 'Touch settings and classroom display options' },
    { id: 'schedule', name: 'Schedule', icon: '📅', description: 'Default durations, time formats, and automation' },
    { id: 'notifications', name: 'Notifications', icon: '🔔', description: 'Alerts, sounds, and reminder settings' },
    { id: 'data', name: 'Data & Backup', icon: '💾', description: 'Backup, export, and sync preferences' }
  ] as const;

  if (!isActive) return null;

  if (isLoading) {
    return (
      <div className="settings-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading settings...</p>
        </div>
        <style>{`
          .settings-page {
            padding: 1.5rem;
            background: white;
            min-height: calc(100vh - 80px);
            position: relative;
          }

          .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 400px;
            gap: 1rem;
          }

          .loading-spinner {
            width: 3rem;
            height: 3rem;
            border: 4px solid #e9ecef;
            border-top: 4px solid #667eea;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h2 className="component-title">⚙️ Settings</h2>
        <p className="component-subtitle">
          Configure Visual Schedule Builder to meet your classroom needs
        </p>
      </div>

      <div className="settings-layout">
        {/* Settings Navigation */}
        <div className="settings-nav">
          <div className="nav-header">
            <h3>Settings Categories</h3>
          </div>
          <div className="nav-sections">
            {settingsSections.map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id as keyof SettingsData)}
                className={`nav-section ${activeSection === section.id ? 'active' : ''}`}
              >
                <span className="section-icon">{section.icon}</span>
                <div className="section-info">
                  <div className="section-name">{section.name}</div>
                  <div className="section-desc">{section.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Settings Content */}
        <div className="settings-content">
          {/* Appearance Settings */}
          {activeSection === 'appearance' && (
            <div className="settings-section">
              <h3>🎨 Appearance Settings</h3>
              <p className="section-description">Customize the visual appearance of the application</p>

              <div className="settings-group">
                <label className="setting-label">Theme</label>
                <div className="radio-group">
                  {(['light', 'dark', 'high-contrast'] as const).map(theme => (
                    <label key={theme} className="radio-item">
                      <input
                        type="radio"
                        name="theme"
                        value={theme}
                        checked={settings.appearance.theme === theme}
                        onChange={(e) => updateSetting('appearance', 'theme', e.target.value)}
                      />
                      <span className="radio-label">
                        {theme === 'light' && '☀️ Light'}
                        {theme === 'dark' && '🌙 Dark'}
                        {theme === 'high-contrast' && '🔲 High Contrast'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="settings-group">
                <label className="setting-label">Font Size</label>
                <div className="radio-group">
                  {(['small', 'medium', 'large', 'extra-large'] as const).map(size => (
                    <label key={size} className="radio-item">
                      <input
                        type="radio"
                        name="fontSize"
                        value={size}
                        checked={settings.appearance.fontSize === size}
                        onChange={(e) => updateSetting('appearance', 'fontSize', e.target.value)}
                      />
                      <span className="radio-label">
                        {size.charAt(0).toUpperCase() + size.slice(1).replace('-', ' ')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="settings-group">
                <div className="toggle-setting">
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      checked={settings.appearance.animations}
                      onChange={(e) => updateSetting('appearance', 'animations', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                    <span className="toggle-text">Enable Animations</span>
                  </label>
                  <p className="setting-description">Smooth transitions and visual effects</p>
                </div>
              </div>

              <div className="settings-group">
                <div className="toggle-setting">
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      checked={settings.appearance.colorBlindFriendly}
                      onChange={(e) => updateSetting('appearance', 'colorBlindFriendly', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                    <span className="toggle-text">Color Blind Friendly</span>
                  </label>
                  <p className="setting-description">Use patterns and symbols in addition to colors</p>
                </div>
              </div>
            </div>
          )}

          {/* Accessibility Settings */}
          {activeSection === 'accessibility' && (
            <div className="settings-section">
              <h3>♿ Accessibility Settings</h3>
              <p className="section-description">Features to support users with diverse needs</p>

              <div className="settings-group">
                <div className="toggle-setting">
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      checked={settings.accessibility.screenReader}
                      onChange={(e) => updateSetting('accessibility', 'screenReader', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                    <span className="toggle-text">Screen Reader Support</span>
                  </label>
                  <p className="setting-description">Enhanced compatibility with screen reading software</p>
                </div>
              </div>

              <div className="settings-group">
                <div className="toggle-setting">
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      checked={settings.accessibility.keyboardNavigation}
                      onChange={(e) => updateSetting('accessibility', 'keyboardNavigation', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                    <span className="toggle-text">Keyboard Navigation</span>
                  </label>
                  <p className="setting-description">Navigate the app using only keyboard shortcuts</p>
                </div>
              </div>

              <div className="settings-group">
                <div className="toggle-setting">
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      checked={settings.accessibility.reduceMotion}
                      onChange={(e) => updateSetting('accessibility', 'reduceMotion', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                    <span className="toggle-text">Reduce Motion</span>
                  </label>
                  <p className="setting-description">Minimize animations and moving elements</p>
                </div>
              </div>

              <div className="settings-group">
                <div className="toggle-setting">
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      checked={settings.accessibility.textToSpeech}
                      onChange={(e) => updateSetting('accessibility', 'textToSpeech', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                    <span className="toggle-text">Text-to-Speech</span>
                  </label>
                  <p className="setting-description">Read activity names and instructions aloud</p>
                </div>
              </div>

              <div className="settings-group">
                <div className="toggle-setting">
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      checked={settings.accessibility.autoReadSchedule}
                      onChange={(e) => updateSetting('accessibility', 'autoReadSchedule', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                    <span className="toggle-text">Auto-Read Schedule</span>
                  </label>
                  <p className="setting-description">Automatically read schedule items when displayed</p>
                </div>
              </div>
            </div>
          )}

          {/* Smartboard Settings */}
          {activeSection === 'smartboard' && (
            <div className="settings-section">
              <h3>📺 Smartboard Settings</h3>
              <p className="section-description">Optimize the app for classroom smartboard displays</p>

              <div className="settings-group">
                <label className="setting-label">Touch Sensitivity</label>
                <div className="radio-group">
                  {(['low', 'medium', 'high'] as const).map(sensitivity => (
                    <label key={sensitivity} className="radio-item">
                      <input
                        type="radio"
                        name="touchSensitivity"
                        value={sensitivity}
                        checked={settings.smartboard.touchSensitivity === sensitivity}
                        onChange={(e) => updateSetting('smartboard', 'touchSensitivity', e.target.value)}
                      />
                      <span className="radio-label">
                        {sensitivity.charAt(0).toUpperCase() + sensitivity.slice(1)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="settings-group">
                <label className="setting-label">Button Size</label>
                <div className="radio-group">
                  {(['small', 'medium', 'large', 'extra-large'] as const).map(size => (
                    <label key={size} className="radio-item">
                      <input
                        type="radio"
                        name="buttonSize"
                        value={size}
                        checked={settings.smartboard.buttonSize === size}
                        onChange={(e) => updateSetting('smartboard', 'buttonSize', e.target.value)}
                      />
                      <span className="radio-label">
                        {size.charAt(0).toUpperCase() + size.slice(1).replace('-', ' ')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="settings-group">
                <div className="toggle-setting">
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      checked={settings.smartboard.autoFullscreen}
                      onChange={(e) => updateSetting('smartboard', 'autoFullscreen', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                    <span className="toggle-text">Auto Fullscreen</span>
                  </label>
                  <p className="setting-description">Automatically enter fullscreen mode for display view</p>
                </div>
              </div>

              <div className="settings-group">
                <div className="toggle-setting">
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      checked={settings.smartboard.gestureControls}
                      onChange={(e) => updateSetting('smartboard', 'gestureControls', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                    <span className="toggle-text">Gesture Controls</span>
                  </label>
                  <p className="setting-description">Enable swipe and multi-touch gestures</p>
                </div>
              </div>
            </div>
          )}

          {/* Schedule Settings */}
          {activeSection === 'schedule' && (
            <div className="settings-section">
              <h3>📅 Schedule Settings</h3>
              <p className="section-description">Configure default schedule behavior and timing</p>

              <div className="settings-group">
                <label className="setting-label">Default Activity Duration</label>
                <div className="input-group">
                  <input
                    type="number"
                    min="5"
                    max="120"
                    step="5"
                    value={settings.schedule.defaultDuration}
                    onChange={(e) => updateSetting('schedule', 'defaultDuration', parseInt(e.target.value))}
                    className="number-input"
                  />
                  <span className="input-suffix">minutes</span>
                </div>
              </div>

              <div className="settings-group">
                <label className="setting-label">Time Format</label>
                <div className="radio-group">
                  <label className="radio-item">
                    <input
                      type="radio"
                      name="timeFormat"
                      value="12h"
                      checked={settings.schedule.timeFormat === '12h'}
                      onChange={(e) => updateSetting('schedule', 'timeFormat', e.target.value)}
                    />
                    <span className="radio-label">12-hour (2:30 PM)</span>
                  </label>
                  <label className="radio-item">
                    <input
                      type="radio"
                      name="timeFormat"
                      value="24h"
                      checked={settings.schedule.timeFormat === '24h'}
                      onChange={(e) => updateSetting('schedule', 'timeFormat', e.target.value)}
                    />
                    <span className="radio-label">24-hour (14:30)</span>
                  </label>
                </div>
              </div>

              <div className="settings-group">
                <label className="setting-label">Transition Warning</label>
                <div className="input-group">
                  <input
                    type="number"
                    min="1"
                    max="15"
                    value={settings.schedule.transitionWarning}
                    onChange={(e) => updateSetting('schedule', 'transitionWarning', parseInt(e.target.value))}
                    className="number-input"
                  />
                  <span className="input-suffix">minutes before</span>
                </div>
              </div>

              <div className="settings-group">
                <div className="toggle-setting">
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      checked={settings.schedule.autoAdvance}
                      onChange={(e) => updateSetting('schedule', 'autoAdvance', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                    <span className="toggle-text">Auto-Advance Activities</span>
                  </label>
                  <p className="setting-description">Automatically move to next activity when time expires</p>
                </div>
              </div>

              <div className="settings-group">
                <div className="toggle-setting">
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      checked={settings.schedule.autoSave}
                      onChange={(e) => updateSetting('schedule', 'autoSave', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                    <span className="toggle-text">Auto-Save Schedules</span>
                  </label>
                  <p className="setting-description">Automatically save changes as you work</p>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Settings */}
          {activeSection === 'notifications' && (
            <div className="settings-section">
              <h3>🔔 Notification Settings</h3>
              <p className="section-description">Configure alerts, reminders, and sound preferences</p>

              <div className="settings-group">
                <div className="toggle-setting">
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      checked={settings.notifications.activityReminders}
                      onChange={(e) => updateSetting('notifications', 'activityReminders', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                    <span className="toggle-text">Activity Reminders</span>
                  </label>
                  <p className="setting-description">Show reminders before activities begin</p>
                </div>
              </div>

              <div className="settings-group">
                <div className="toggle-setting">
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      checked={settings.notifications.transitionAlerts}
                      onChange={(e) => updateSetting('notifications', 'transitionAlerts', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                    <span className="toggle-text">Transition Alerts</span>
                  </label>
                  <p className="setting-description">Visual and audio alerts for activity transitions</p>
                </div>
              </div>

              <div className="settings-group">
                <div className="toggle-setting">
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      checked={settings.notifications.completionSounds}
                      onChange={(e) => updateSetting('notifications', 'completionSounds', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                    <span className="toggle-text">Completion Sounds</span>
                  </label>
                  <p className="setting-description">Play sounds when activities are completed</p>
                </div>
              </div>

              <div className="settings-group">
                <div className="toggle-setting">
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      checked={settings.notifications.customSounds}
                      onChange={(e) => updateSetting('notifications', 'customSounds', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                    <span className="toggle-text">Custom Sounds</span>
                  </label>
                  <p className="setting-description">Use custom sound files for notifications</p>
                </div>
              </div>

              <div className="settings-group">
                <label className="setting-label">Volume Level</label>
                <div className="slider-group">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.notifications.volume}
                    onChange={(e) => updateSetting('notifications', 'volume', parseInt(e.target.value))}
                    className="volume-slider"
                  />
                  <span className="slider-value">{settings.notifications.volume}%</span>
                </div>
              </div>
            </div>
          )}

          {/* Data & Backup Settings */}
          {activeSection === 'data' && (
            <div className="settings-section">
              <h3>💾 Data & Backup Settings</h3>
              <p className="section-description">Manage data storage, backups, and export options</p>

              <div className="settings-group">
                <div className="toggle-setting">
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      checked={settings.data.autoBackup}
                      onChange={(e) => updateSetting('data', 'autoBackup', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                    <span className="toggle-text">Automatic Backups</span>
                  </label>
                  <p className="setting-description">Regularly backup your schedules and student data</p>
                </div>
              </div>

              <div className="settings-group">
                <label className="setting-label">Backup Frequency</label>
                <div className="radio-group">
                  {(['daily', 'weekly', 'monthly'] as const).map(frequency => (
                    <label key={frequency} className="radio-item">
                      <input
                        type="radio"
                        name="backupFrequency"
                        value={frequency}
                        checked={settings.data.backupFrequency === frequency}
                        onChange={(e) => updateSetting('data', 'backupFrequency', e.target.value)}
                      />
                      <span className="radio-label">
                        {frequency.charAt(0).toUpperCase() + frequency.slice(1)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="settings-group">
                <label className="setting-label">Export Format</label>
                <div className="radio-group">
                  <label className="radio-item">
                    <input
                      type="radio"
                      name="exportFormat"
                      value="json"
                      checked={settings.data.exportFormat === 'json'}
                      onChange={(e) => updateSetting('data', 'exportFormat', e.target.value)}
                    />
                    <span className="radio-label">JSON (Full Data)</span>
                  </label>
                  <label className="radio-item">
                    <input
                      type="radio"
                      name="exportFormat"
                      value="csv"
                      checked={settings.data.exportFormat === 'csv'}
                      onChange={(e) => updateSetting('data', 'exportFormat', e.target.value)}
                    />
                    <span className="radio-label">CSV (Spreadsheet)</span>
                  </label>
                  <label className="radio-item">
                    <input
                      type="radio"
                      name="exportFormat"
                      value="pdf"
                      checked={settings.data.exportFormat === 'pdf'}
                      onChange={(e) => updateSetting('data', 'exportFormat', e.target.value)}
                    />
                    <span className="radio-label">PDF (Print-Ready)</span>
                  </label>
                </div>
              </div>

              <div className="settings-group">
                <div className="toggle-setting">
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      checked={settings.data.includePhotos}
                      onChange={(e) => updateSetting('data', 'includePhotos', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                    <span className="toggle-text">Include Photos in Backup</span>
                  </label>
                  <p className="setting-description">Include student photos and custom images in backups</p>
                </div>
              </div>

              {/* Data Migration Section */}
              <div className="settings-group">
                <label className="setting-label">Data Architecture Migration</label>
                <div style={{
                  background: migrationStatus === 'completed' ? 'rgba(16, 185, 129, 0.1)' : 
                             migrationStatus === 'needed' ? 'rgba(245, 158, 11, 0.1)' : 
                             'rgba(107, 114, 128, 0.1)',
                  border: `2px solid ${migrationStatus === 'completed' ? 'rgba(16, 185, 129, 0.3)' : 
                                     migrationStatus === 'needed' ? 'rgba(245, 158, 11, 0.3)' : 
                                     'rgba(107, 114, 128, 0.3)'}`,
                  borderRadius: '8px',
                  padding: '1rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>
                      {migrationStatus === 'completed' ? '✅' : 
                       migrationStatus === 'needed' ? '⚠️' : '🔧'}
                    </span>
                    <div>
                      <div style={{ fontWeight: '600', color: '#374151' }}>
                        {migrationStatus === 'completed' ? 'Migration Completed' : 
                         migrationStatus === 'needed' ? 'Migration Required' : 
                         'Migration Status Unknown'}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                        {migrationStatus === 'completed' ? 'Your data has been successfully migrated to the unified architecture' : 
                         migrationStatus === 'needed' ? 'Your data needs to be migrated to fix report issues' : 
                         'Checking migration status...'}
                      </div>
                    </div>
                  </div>
                  
                  {migrationStatus === 'needed' && (
                    <div style={{ marginTop: '1rem' }}>
                      <button
                        onClick={() => setShowMigrationInterface(true)}
                        style={{
                          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '0.75rem 1.5rem',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        🚀 Start Data Migration
                      </button>
                    </div>
                  )}
                  
                  {migrationStatus === 'completed' && (
                    <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => setShowMigrationInterface(true)}
                        style={{
                          background: 'rgba(107, 114, 128, 0.1)',
                          color: '#374151',
                          border: '1px solid rgba(107, 114, 128, 0.3)',
                          borderRadius: '6px',
                          padding: '0.5rem 1rem',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        📋 View Migration Details
                      </button>
                      <button
                        onClick={checkMigrationStatus}
                        style={{
                          background: 'rgba(107, 114, 128, 0.1)',
                          color: '#374151',
                          border: '1px solid rgba(107, 114, 128, 0.3)',
                          borderRadius: '6px',
                          padding: '0.5rem 1rem',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        🔄 Refresh Status
                      </button>
                    </div>
                  )}
                </div>
                <p className="setting-description">
                  The unified data architecture consolidates all student data, IEP goals, and progress tracking into a single, 
                  connected system. This resolves issues with reports showing 0 goals and improves data consistency.
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="settings-actions">
            <button
              onClick={saveSettings}
              className={`action-button primary ${!hasUnsavedChanges ? 'disabled' : ''}`}
              disabled={!hasUnsavedChanges}
            >
              💾 Save Changes
            </button>
            <button
              onClick={() => setShowResetDialog(true)}
              className="action-button secondary"
            >
              🔄 Reset to Defaults
            </button>
            <button 
              onClick={exportSettings}
              className="action-button secondary"
            >
              📤 Export Settings
            </button>
            <button 
              onClick={importSettings}
              className="action-button secondary"
            >
              📥 Import Settings
            </button>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="success-message">
          <div className="message-content">
            <span className="message-icon">✅</span>
            <span className="message-text">Settings saved successfully!</span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {showErrorMessage && (
        <div className="error-message">
          <div className="message-content">
            <span className="message-icon">❌</span>
            <span className="message-text">{showErrorMessage}</span>
            <button 
              onClick={() => setShowErrorMessage(null)} 
              className="message-close"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Unsaved Changes Warning */}
      {hasUnsavedChanges && (
        <div className="unsaved-warning">
          <div className="warning-content">
            <span className="warning-icon">⚠️</span>
            <span className="warning-text">You have unsaved changes</span>
            <button onClick={saveSettings} className="save-quick">Save Now</button>
          </div>
        </div>
      )}

      {/* Reset Dialog */}
      {showResetDialog && (
        <div className="dialog-overlay">
          <div className="dialog">
            <h3>Reset Settings</h3>
            <p>Are you sure you want to reset all settings to their default values? This action cannot be undone.</p>
            <div className="dialog-actions">
              <button onClick={() => setShowResetDialog(false)} className="dialog-button secondary">
                Cancel
              </button>
              <button onClick={resetSettings} className="dialog-button danger">
                Reset All Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Migration Interface Overlay */}
      {showMigrationInterface && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            maxWidth: '900px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowMigrationInterface(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'rgba(107, 114, 128, 0.1)',
                border: '1px solid rgba(107, 114, 128, 0.3)',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '1.2rem',
                color: '#6b7280',
                zIndex: 1
              }}
              title="Close migration interface"
            >
              ×
            </button>
            <DataMigrationInterface onMigrationComplete={handleMigrationComplete} />
          </div>
        </div>
      )}

      <style>{`
        .settings-page {
          padding: 1.5rem;
          background: white;
          min-height: calc(100vh - 80px);
          position: relative;
        }

        .settings-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .settings-layout {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .settings-nav {
          background: #f8f9fa;
          border-radius: 12px;
          padding: 1.5rem;
          height: fit-content;
          position: sticky;
          top: 1rem;
          border: 2px solid #e9ecef;
        }

        .nav-header h3 {
          font-size: 1.125rem;
          font-weight: 600;
          color: #495057;
          margin: 0 0 1rem 0;
          text-align: center;
        }

        .nav-sections {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .nav-section {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: white;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
          width: 100%;
        }

        .nav-section:hover {
          border-color: #667eea;
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.15);
        }

        .nav-section.active {
          border-color: #667eea;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .section-icon {
          font-size: 1.5rem;
          flex-shrink: 0;
        }

        .section-info {
          flex: 1;
        }

        .section-name {
          font-weight: 600;
          font-size: 0.875rem;
          margin-bottom: 0.25rem;
        }

        .section-desc {
          font-size: 0.75rem;
          opacity: 0.8;
          line-height: 1.3;
        }

        .settings-content {
          background: white;
          border: 2px solid #e9ecef;
          border-radius: 12px;
          padding: 2rem;
        }

        .settings-section h3 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #495057;
          margin: 0 0 0.5rem 0;
        }

        .section-description {
          color: #6c757d;
          margin: 0 0 2rem 0;
          line-height: 1.5;
        }

        .settings-group {
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid #e9ecef;
        }

        .settings-group:last-child {
          border-bottom: none;
          margin-bottom: 0;
        }

        .setting-label {
          display: block;
          font-weight: 600;
          color: #495057;
          margin-bottom: 1rem;
          font-size: 1rem;
        }

        .radio-group {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .radio-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .radio-item:hover {
          border-color: #667eea;
          background: rgba(102, 126, 234, 0.02);
        }

        .radio-item input[type="radio"] {
          margin: 0;
          transform: scale(1.2);
        }

        .radio-item input[type="radio"]:checked + .radio-label {
          font-weight: 600;
          color: #667eea;
        }

        .radio-label {
          font-size: 0.875rem;
          color: #495057;
          cursor: pointer;
        }

        .toggle-setting {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .toggle-label {
          display: flex;
          align-items: center;
          gap: 1rem;
          cursor: pointer;
        }

        .toggle-label input[type="checkbox"] {
          display: none;
        }

        .toggle-slider {
          width: 3rem;
          height: 1.5rem;
          background: #dee2e6;
          border-radius: 0.75rem;
          position: relative;
          transition: background-color 0.2s ease;
        }

        .toggle-slider::after {
          content: '';
          width: 1.25rem;
          height: 1.25rem;
          background: white;
          border-radius: 50%;
          position: absolute;
          top: 0.125rem;
          left: 0.125rem;
          transition: transform 0.2s ease;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .toggle-label input[type="checkbox"]:checked + .toggle-slider {
          background: #667eea;
        }

        .toggle-label input[type="checkbox"]:checked + .toggle-slider::after {
          transform: translateX(1.5rem);
        }

        .toggle-text {
          font-weight: 600;
          color: #495057;
          font-size: 1rem;
        }

        .setting-description {
          color: #6c757d;
          font-size: 0.875rem;
          line-height: 1.4;
          margin: 0;
        }

        .input-group {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .number-input {
          width: 5rem;
          padding: 0.5rem;
          border: 2px solid #dee2e6;
          border-radius: 6px;
          font-size: 0.875rem;
          text-align: center;
        }

        .number-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .input-suffix {
          color: #6c757d;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .slider-group {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .volume-slider {
          flex: 1;
          height: 0.5rem;
          background: #dee2e6;
          border-radius: 0.25rem;
          outline: none;
          cursor: pointer;
        }

        .volume-slider::-webkit-slider-thumb {
          appearance: none;
          width: 1.25rem;
          height: 1.25rem;
          background: #667eea;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .volume-slider::-moz-range-thumb {
          width: 1.25rem;
          height: 1.25rem;
          background: #667eea;
          border-radius: 50%;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .slider-value {
          font-weight: 600;
          color: #495057;
          min-width: 3rem;
          text-align: right;
        }

        .settings-actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 2px solid #e9ecef;
          flex-wrap: wrap;
        }

        .action-button {
          padding: 0.75rem 1.5rem;
          border: 2px solid #dee2e6;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
        }

        .action-button.primary {
          background: #667eea;
          color: white;
          border-color: #667eea;
        }

        .action-button.primary:hover:not(.disabled) {
          background: #5a67d8;
          border-color: #5a67d8;
        }

        .action-button.primary.disabled {
          background: #6c757d;
          border-color: #6c757d;
          cursor: not-allowed;
          opacity: 0.6;
        }

        .action-button.secondary {
          background: white;
          color: #6c757d;
        }

        .action-button.secondary:hover {
          background: #f8f9fa;
          border-color: #adb5bd;
          color: #495057;
        }

        .success-message,
        .error-message {
          position: fixed;
          top: 2rem;
          right: 2rem;
          padding: 1rem;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          z-index: 1000;
          animation: slideIn 0.3s ease;
        }

        .success-message {
          background: #d4edda;
          border: 2px solid #c3e6cb;
          color: #155724;
        }

        .error-message {
          background: #f8d7da;
          border: 2px solid #f5c6cb;
          color: #721c24;
        }

        .message-content {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .message-icon {
          font-size: 1.25rem;
        }

        .message-text {
          font-weight: 500;
        }

        .message-close {
          background: none;
          border: none;
          font-size: 1.25rem;
          cursor: pointer;
          color: inherit;
          opacity: 0.7;
          margin-left: auto;
        }

        .message-close:hover {
          opacity: 1;
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .unsaved-warning {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          background: #fff3cd;
          border: 2px solid #ffeaa7;
          border-radius: 8px;
          padding: 1rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          z-index: 1000;
        }

        .warning-content {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .warning-icon {
          font-size: 1.25rem;
        }

        .warning-text {
          color: #856404;
          font-weight: 500;
        }

        .save-quick {
          padding: 0.5rem 1rem;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.2s ease;
        }

        .save-quick:hover {
          background: #5a67d8;
        }

        .dialog-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }

        .dialog {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          max-width: 400px;
          width: 90vw;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        .dialog h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #495057;
          margin: 0 0 1rem 0;
        }

        .dialog p {
          color: #6c757d;
          line-height: 1.5;
          margin: 0 0 1.5rem 0;
        }

        .dialog-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
        }

        .dialog-button {
          padding: 0.75rem 1.5rem;
          border: 2px solid #dee2e6;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .dialog-button.secondary {
          background: white;
          color: #6c757d;
        }

        .dialog-button.secondary:hover {
          background: #f8f9fa;
          border-color: #adb5bd;
        }

        .dialog-button.danger {
          background: #dc3545;
          color: white;
          border-color: #dc3545;
        }

        .dialog-button.danger:hover {
          background: #c82333;
          border-color: #c82333;
        }

        /* Theme Application Styles */
        body.theme-dark {
          background-color: #1a1a1a;
          color: #ffffff;
        }

        body.theme-dark .settings-page {
          background: #2d2d2d;
          color: #ffffff;
        }

        body.theme-dark .settings-nav,
        body.theme-dark .settings-content {
          background: #333333;
          border-color: #555555;
        }

        body.theme-high-contrast {
          background-color: #000000;
          color: #ffffff;
        }

        body.theme-high-contrast .settings-nav,
        body.theme-high-contrast .settings-content {
          background: #000000;
          border: 3px solid #ffffff;
        }

        /* Font Size Application */
        body.font-small { font-size: 12px; }
        body.font-medium { font-size: 14px; }
        body.font-large { font-size: 16px; }
        body.font-extra-large { font-size: 18px; }

        /* Button Size Application */
        body.buttons-small button { padding: 0.25rem 0.5rem; font-size: 0.75rem; }
        body.buttons-medium button { padding: 0.5rem 1rem; font-size: 0.875rem; }
        body.buttons-large button { padding: 0.75rem 1.5rem; font-size: 1rem; }
        body.buttons-extra-large button { padding: 1rem 2rem; font-size: 1.125rem; }

        /* Reduce Motion */
        body.reduce-motion * {
          animation-duration: 0.01s !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01s !important;
        }

        /* High Contrast Mode */
        body.high-contrast {
          filter: contrast(150%);
        }

        /* Color Blind Friendly */
        body.color-blind-friendly .nav-section.active {
          background: repeating-linear-gradient(
            45deg,
            #667eea,
            #667eea 10px,
            #764ba2 10px,
            #764ba2 20px
          );
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .settings-layout {
            grid-template-columns: 1fr;
          }

          .settings-nav {
            position: static;
          }

          .nav-sections {
            flex-direction: row;
            flex-wrap: wrap;
          }

          .nav-section {
            flex: 1;
            min-width: 200px;
          }
        }

        @media (max-width: 768px) {
          .settings-page {
            padding: 1rem;
          }

          .settings-content {
            padding: 1.5rem;
          }

          .radio-group {
            gap: 0.5rem;
          }

          .radio-item {
            padding: 0.5rem;
          }

          .settings-actions {
            flex-direction: column;
          }

          .action-button {
            justify-content: center;
          }

          .success-message,
          .error-message,
          .unsaved-warning {
            bottom: 1rem;
            right: 1rem;
            left: 1rem;
          }

          .nav-sections {
            flex-direction: column;
          }
        }

        @media (max-width: 480px) {
          .section-desc {
            display: none;
          }

          .dialog {
            padding: 1.5rem;
          }

          .dialog-actions {
            flex-direction: column;
          }

          .slider-group {
            flex-direction: column;
            align-items: stretch;
          }

          .input-group {
            flex-direction: column;
            align-items: stretch;
            text-align: center;
          }
        }

        /* Accessibility */
        .nav-section:focus,
        .radio-item:focus,
        .action-button:focus {
          outline: 2px solid #667eea;
          outline-offset: 2px;
        }

        /* Keyboard navigation styles */
        body.keyboard-navigation *:focus {
          outline: 3px solid #667eea !important;
          outline-offset: 2px !important;
        }
      `}</style>
    </div>
  );
};

export default Settings;
