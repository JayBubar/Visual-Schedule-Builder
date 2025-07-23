import React, { useState } from 'react';

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

const Settings: React.FC<SettingsProps> = ({ isActive }) => {
  const [activeSection, setActiveSection] = useState<keyof SettingsData>('appearance');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);

  // Mock settings data - in real app, this would come from storage
  const [settings, setSettings] = useState<SettingsData>({
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
  });

  const updateSetting = (section: keyof SettingsData, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
    setHasUnsavedChanges(true);
  };

  const saveSettings = () => {
    // In real app, this would save to electron-store or similar
    console.log('Saving settings:', settings);
    setHasUnsavedChanges(false);
    // Show success notification
  };

  const resetSettings = () => {
    // Reset to defaults
    setShowResetDialog(false);
    setHasUnsavedChanges(false);
    // Reload default settings
  };

  const settingsSections = [
    { id: 'appearance', name: 'Appearance', icon: '🎨', description: 'Themes, fonts, and visual preferences' },
    { id: 'accessibility', name: 'Accessibility', icon: '♿', description: 'Screen readers, navigation, and inclusive features' },
    { id: 'smartboard', name: 'Smartboard', icon: '📺', description: 'Touch settings and classroom display options' },
    { id: 'schedule', name: 'Schedule', icon: '📅', description: 'Default durations, time formats, and automation' },
    { id: 'notifications', name: 'Notifications', icon: '🔔', description: 'Alerts, sounds, and reminder settings' },
    { id: 'data', name: 'Data & Backup', icon: '💾', description: 'Backup, export, and sync preferences' }
  ] as const;

  if (!isActive) return null;

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
            <button className="action-button secondary">
              📤 Export Settings
            </button>
            <button className="action-button secondary">
              📥 Import Settings
            </button>
          </div>
        </div>
      </div>

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

      <style>{`
        .settings-page {
          padding: 1.5rem;
          background: white;
          min-height: calc(100vh - 80px);
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

        /* High contrast mode */
        @media (prefers-contrast: high) {
          .settings-nav,
          .settings-content {
            border: 3px solid #000000;
          }

          .nav-section.active {
            background: #000000;
            color: #ffffff;
          }

          .toggle-slider {
            border: 2px solid #000000;
          }

          .radio-item {
            border: 2px solid #000000;
          }
        }
      `}</style>
    </div>
  );
};

export default Settings;