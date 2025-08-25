import React, { useState, useEffect } from 'react';
import { Calendar, Settings, Users, Video, Star, Gift, BookOpen, Save, Play } from 'lucide-react';
import UnifiedDataService from '../../services/unifiedDataService';

interface MorningMeetingHubProps {
  onStartMorningMeeting: () => void;
  onClose: () => void;
}

interface HubSettings {
  welcomePersonalization: {
    schoolName: string;
    teacherName: string;
    className: string;
    customMessage?: string;
  };
  customVocabulary: {
    weather: string[];
    seasonal: string[];
  };
  videos: {
    weather: Array<{id: string, name: string, url: string}>;
    seasonal: Array<{id: string, name: string, url: string}>;
    behaviorCommitments: Array<{id: string, name: string, url: string}>;
    calendarMath: Array<{id: string, name: string, url: string}>;
  };
  behaviorStatements: {
    enabled: boolean;
    statements: string[];
    allowCustom: boolean;
  };
  celebrations: {
    enabled: boolean;
    showBirthdayPhotos: boolean;
    customCelebrations: Celebration[];
  };
  flowCustomization: {
    enabledSteps: Record<string, boolean>;
  };
}

interface Celebration {
  id: string;
  name: string;
  emoji: string;
  message: string;
  type: 'birthday' | 'custom';
  recurring?: boolean;
  date?: string;
  students: string[];
  createdAt: string;
}

const DEFAULT_HUB_SETTINGS: HubSettings = {
  welcomePersonalization: {
    schoolName: '',
    teacherName: '',
    className: '',
    customMessage: 'Welcome to Our Classroom!'
  },
  customVocabulary: {
    weather: ['sunny', 'cloudy', 'rainy', 'snowy', 'windy', 'foggy'],
    seasonal: ['spring', 'summer', 'fall', 'winter', 'bloom', 'harvest']
  },
  videos: {
    weather: [],
    seasonal: [],
    behaviorCommitments: [],
    calendarMath: []
  },
  behaviorStatements: {
    enabled: true,
    statements: [
      'I will use kind words with my friends',
      'I will listen when my teacher is talking',
      'I will try my best in everything I do'
    ],
    allowCustom: true
  },
  celebrations: {
    enabled: true,
    showBirthdayPhotos: true,
    customCelebrations: []
  },
  flowCustomization: {
    enabledSteps: {
      welcome: true,
      attendance: true,
      behavior: true,
      calendarMath: true,
      weather: true,
      seasonal: true,
      celebration: true,
      dayReview: true
    }
  }
};

// Celebrations Management Modal Component
const CelebrationsManagementModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  celebrations: Celebration[];
  onUpdateCelebrations: (celebrations: Celebration[]) => void;
}> = ({ isOpen, onClose, celebrations, onUpdateCelebrations }) => {
  const [customCelebrations, setCustomCelebrations] = useState<Celebration[]>(celebrations);

  if (!isOpen) return null;

  const addCustomCelebration = () => {
    const newCelebration: Celebration = {
      id: `custom_${Date.now()}`,
      name: '',
      emoji: '🎉',
      message: '',
      type: 'custom',
      recurring: false,
      date: '',
      students: [],
      createdAt: new Date().toISOString()
    };
    setCustomCelebrations([...customCelebrations, newCelebration]);
  };

  const updateCelebration = (id: string, updates: Partial<Celebration>) => {
    setCustomCelebrations(prev => 
      prev.map(cel => cel.id === id ? { ...cel, ...updates } : cel)
    );
  };

  const deleteCelebration = (id: string) => {
    if (confirm('Delete this celebration?')) {
      setCustomCelebrations(prev => prev.filter(cel => cel.id !== id));
    }
  };

  const saveCelebrations = () => {
    onUpdateCelebrations(customCelebrations);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>🎊 Manage Celebrations</h2>
          <button onClick={onClose} className="close-button">×</button>
        </div>

        <div className="modal-body">
          <button onClick={addCustomCelebration} className="add-celebration-button">
            ➕ Add Custom Celebration
          </button>

          <div className="celebrations-list">
            {customCelebrations.map(celebration => (
              <div key={celebration.id} className="celebration-item">
                <div className="celebration-row">
                  <input
                    type="text"
                    placeholder="Celebration Name"
                    value={celebration.name}
                    onChange={(e) => updateCelebration(celebration.id, { name: e.target.value })}
                    className="celebration-input"
                  />
                  <input
                    type="text"
                    placeholder="🎉"
                    value={celebration.emoji}
                    onChange={(e) => updateCelebration(celebration.id, { emoji: e.target.value })}
                    className="emoji-input"
                  />
                  <button
                    onClick={() => deleteCelebration(celebration.id)}
                    className="delete-button"
                  >
                    🗑️
                  </button>
                </div>
                
                <div className="celebration-row">
                  <div className="date-section">
                    <label>Date</label>
                    <input
                      type="date"
                      value={celebration.date || ''}
                      onChange={(e) => updateCelebration(celebration.id, { date: e.target.value })}
                      className="date-input"
                    />
                  </div>
                  <div className="recurring-section">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={celebration.recurring || false}
                        onChange={(e) => updateCelebration(celebration.id, { recurring: e.target.checked })}
                      />
                      Repeat Annually
                    </label>
                  </div>
                </div>
                
                <textarea
                  placeholder="Celebration message..."
                  value={celebration.message}
                  onChange={(e) => updateCelebration(celebration.id, { message: e.target.value })}
                  className="message-input"
                  rows={3}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="cancel-button">
            Cancel
          </button>
          <button onClick={saveCelebrations} className="save-button">
            Save Celebrations
          </button>
        </div>
      </div>
    </div>
  );
};

const MorningMeetingHub: React.FC<MorningMeetingHubProps> = ({
  onStartMorningMeeting,
  onClose
}) => {
  const [activeSection, setActiveSection] = useState<'welcome' | 'vocabulary' | 'videos' | 'behavior' | 'celebrations' | 'flow'>('welcome');
  const [settings, setSettings] = useState<HubSettings>(DEFAULT_HUB_SETTINGS);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showCelebrationsModal, setShowCelebrationsModal] = useState(false);
  const [availableVideos, setAvailableVideos] = useState<any[]>([]);

  useEffect(() => {
    loadSettings();
    loadAvailableVideos();
  }, []);

  const loadSettings = () => {
    try {
      const morningMeetingSettings = UnifiedDataService.getSettings()?.morningMeeting || {};
      // Raw MM settings loaded
      
      // FIX: Ensure all required properties are included in merged settings
      const mergedSettings: HubSettings = {
        // FIX: Always include welcomePersonalization
        welcomePersonalization: {
          schoolName: morningMeetingSettings.welcomeSettings?.schoolName || DEFAULT_HUB_SETTINGS.welcomePersonalization.schoolName,
          teacherName: morningMeetingSettings.welcomeSettings?.teacherName || DEFAULT_HUB_SETTINGS.welcomePersonalization.teacherName,
          className: morningMeetingSettings.welcomeSettings?.className || DEFAULT_HUB_SETTINGS.welcomePersonalization.className,
          customMessage: morningMeetingSettings.welcomeSettings?.customMessage || DEFAULT_HUB_SETTINGS.welcomePersonalization.customMessage
        },
        // FIX: Always include customVocabulary
        customVocabulary: {
          weather: morningMeetingSettings.customVocabulary?.weather || DEFAULT_HUB_SETTINGS.customVocabulary.weather,
          seasonal: morningMeetingSettings.customVocabulary?.seasonal || DEFAULT_HUB_SETTINGS.customVocabulary.seasonal
        },
        // FIX: Ensure videos array structure with proper URLs
        videos: {
          weather: Array.isArray(morningMeetingSettings.selectedVideos?.weather) 
            ? morningMeetingSettings.selectedVideos.weather
            : (morningMeetingSettings.selectedVideos?.weather ? [{
                id: morningMeetingSettings.selectedVideos.weather,
                name: 'Selected Weather Video',
                url: morningMeetingSettings.selectedVideos.weather
              }] : []),
          seasonal: Array.isArray(morningMeetingSettings.selectedVideos?.seasonal) 
            ? morningMeetingSettings.selectedVideos.seasonal
            : (morningMeetingSettings.selectedVideos?.seasonal ? [{
                id: morningMeetingSettings.selectedVideos.seasonal,
                name: 'Selected Seasonal Video',
                url: morningMeetingSettings.selectedVideos.seasonal
              }] : []),
          behaviorCommitments: Array.isArray(morningMeetingSettings.selectedVideos?.behaviorCommitments) 
            ? morningMeetingSettings.selectedVideos.behaviorCommitments
            : (morningMeetingSettings.selectedVideos?.behaviorCommitments ? [{
                id: morningMeetingSettings.selectedVideos.behaviorCommitments,
                name: 'Selected Behavior Video',
                url: morningMeetingSettings.selectedVideos.behaviorCommitments
              }] : []),
          calendarMath: Array.isArray(morningMeetingSettings.selectedVideos?.calendarMath) 
            ? morningMeetingSettings.selectedVideos.calendarMath
            : (morningMeetingSettings.selectedVideos?.calendarMath ? [{
                id: morningMeetingSettings.selectedVideos.calendarMath,
                name: 'Selected Calendar Math Video',
                url: morningMeetingSettings.selectedVideos.calendarMath
              }] : [])
        },
        behaviorStatements: {
          enabled: morningMeetingSettings.behaviorCommitments?.enabled || true,
          statements: morningMeetingSettings.behaviorCommitments?.statements || [
            'I will use kind words with my friends',
            'I will listen when my teacher is talking',
            'I will try my best in everything I do'
          ],
          allowCustom: morningMeetingSettings.behaviorCommitments?.allowCustom || true
        },
        celebrations: {
          ...DEFAULT_HUB_SETTINGS.celebrations,
          ...morningMeetingSettings.celebrations
        },
        flowCustomization: {
          ...DEFAULT_HUB_SETTINGS.flowCustomization,
          enabledSteps: {
            ...DEFAULT_HUB_SETTINGS.flowCustomization.enabledSteps,
            ...morningMeetingSettings.checkInFlow
          }
        }
      };
      
      // Hub settings processed
      setSettings(mergedSettings);
    } catch (error) {
      setSettings(DEFAULT_HUB_SETTINGS);
    }
  };

  const loadAvailableVideos = () => {
    try {
      const activities = UnifiedDataService.getAllActivities();
      const videos = activities.filter(activity => 
        (activity as any).contentType === 'video'
      );
      setAvailableVideos(videos);
    } catch (error) {
      setAvailableVideos([]);
    }
  };

  const getTaggedVideos = (tags: string[]) => {
    return availableVideos.filter(video => 
      (video as any).tags && 
      tags.some(tag => (video as any).tags.includes(tag))
    );
  };

  const updateSettings = (section: keyof HubSettings, updates: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        ...updates
      }
    }));
    setHasUnsavedChanges(true);
  };

  const saveSettings = () => {
    try {
      // Saving settings
      
      // FIX: Convert hub settings back to the format expected by Settings.tsx
      // but ensure ALL properties are included
      const morningMeetingSettings = {
        // FIX: Save welcomePersonalization properly
        welcomeSettings: {
          schoolName: settings.welcomePersonalization.schoolName,
          teacherName: settings.welcomePersonalization.teacherName,
          className: settings.welcomePersonalization.className,
          customMessage: settings.welcomePersonalization.customMessage
        },
        // FIX: Save customVocabulary properly
        customVocabulary: {
          weather: settings.customVocabulary.weather,
          seasonal: settings.customVocabulary.seasonal
        },
        selectedVideos: {
          weather: settings.videos.weather,
          seasonal: settings.videos.seasonal,
          behaviorCommitments: settings.videos.behaviorCommitments,
          calendarMath: settings.videos.calendarMath
        },
        behaviorCommitments: settings.behaviorStatements,
        celebrations: settings.celebrations,
        checkInFlow: settings.flowCustomization.enabledSteps
      };

      // Converted to MM format

      // Get current settings and update just the morningMeeting section
      const currentSettings = UnifiedDataService.getSettings();
      const updatedSettings = {
        ...currentSettings,
        morningMeeting: {
          ...currentSettings.morningMeeting,
          ...morningMeetingSettings
        }
      };

      // Final settings to save
      UnifiedDataService.updateSettings(updatedSettings);
      setHasUnsavedChanges(false);
      
      // Verify it was saved
      setTimeout(() => {
        const verifySettings = UnifiedDataService.getSettings();
        // Settings verified after save
      }, 100);
      
      // Dispatch event for other components
      window.dispatchEvent(new CustomEvent('morningMeetingSettingsChanged', {
        detail: settings
      }));
      
      // Morning Meeting settings saved successfully
    } catch (error) {
      // Error saving settings
    }
  };

  const playVideo = (videoId: string | null) => {
    if (!videoId) return;
    
    const video = availableVideos.find(v => v.id === videoId);
    if (video && (video as any).url) {
      window.open((video as any).url, '_blank');
    }
  };

  const hubSections = [
    { id: 'welcome', name: 'Welcome', icon: '👋', description: 'Personalize your classroom greeting' },
    { id: 'vocabulary', name: 'Vocabulary', icon: '📚', description: 'Customize learning words' },
    { id: 'videos', name: 'Videos', icon: '🎥', description: 'Select educational videos' },
    { id: 'behavior', name: 'Behavior', icon: '⭐', description: 'Manage behavior expectations' },
    { id: 'celebrations', name: 'Celebrations', icon: '🎉', description: 'Birthday and special events' },
    { id: 'flow', name: 'Flow', icon: '⚙️', description: 'Customize meeting steps' }
  ] as const;

  return (
    <div className="morning-meeting-hub">
      <div className="hub-header">
        <div className="header-content">
          <h1>🌅 Morning Meeting Hub</h1>
          <p>Configure your perfect Morning Meeting experience</p>
        </div>
        <div className="header-actions">
          <button onClick={onClose} className="home-button">
            ← Close
          </button>
          {hasUnsavedChanges && (
            <button onClick={saveSettings} className="save-button">
              <Save size={20} />
              Save Changes
            </button>
          )}
          <button onClick={onStartMorningMeeting} className="start-button">
            <Play size={20} />
            Start My Day
          </button>
        </div>
      </div>

      <div className="hub-layout">
        {/* Navigation */}
        <div className="hub-nav">
          <h3>Configuration</h3>
          <div className="nav-sections">
            {hubSections.map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id as any)}
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

        {/* Content */}
        <div className="hub-content">
          {/* Welcome Personalization */}
          {activeSection === 'welcome' && (
            <div className="hub-section">
              <h2>👋 Welcome Personalization</h2>
              <p>Customize your classroom greeting and information</p>

              <div className="form-group">
                <label>School Name</label>
                <input
                  type="text"
                  value={settings.welcomePersonalization.schoolName}
                  onChange={(e) => updateSettings('welcomePersonalization', { schoolName: e.target.value })}
                  placeholder="Lincoln Elementary School"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Teacher Name</label>
                <input
                  type="text"
                  value={settings.welcomePersonalization.teacherName}
                  onChange={(e) => updateSettings('welcomePersonalization', { teacherName: e.target.value })}
                  placeholder="Mrs. Smith"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Class Name</label>
                <input
                  type="text"
                  value={settings.welcomePersonalization.className}
                  onChange={(e) => updateSettings('welcomePersonalization', { className: e.target.value })}
                  placeholder="3rd Grade Class"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Custom Welcome Message</label>
                <input
                  type="text"
                  value={settings.welcomePersonalization.customMessage || ''}
                  onChange={(e) => updateSettings('welcomePersonalization', { customMessage: e.target.value })}
                  placeholder="Welcome to Our Classroom!"
                  className="form-input"
                />
              </div>
            </div>
          )}

          {/* Vocabulary Customization */}
          {activeSection === 'vocabulary' && (
            <div className="hub-section">
              <h2>📚 Custom Vocabulary</h2>
              <p>Customize vocabulary words for weather and seasonal learning</p>

              <div className="form-group">
                <label>Weather Vocabulary Words</label>
                <p className="form-description">Words that will be used in the weather step</p>
                <div className="vocabulary-list">
                  {(settings.customVocabulary?.weather || ['sunny', 'cloudy', 'rainy', 'snowy', 'windy', 'foggy']).map((word, index) => (
                    <div key={index} className="vocabulary-item">
                      <input
                        type="text"
                        value={word}
                        onChange={(e) => {
                          const newWords = [...(settings.customVocabulary?.weather || [])];
                          newWords[index] = e.target.value;
                          updateSettings('customVocabulary', { 
                            ...settings.customVocabulary,
                            weather: newWords 
                          });
                        }}
                        className="vocabulary-input"
                      />
                      <button
                        onClick={() => {
                          const newWords = (settings.customVocabulary?.weather || []).filter((_, i) => i !== index);
                          updateSettings('customVocabulary', { 
                            ...settings.customVocabulary,
                            weather: newWords 
                          });
                        }}
                        className="delete-vocab-button"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
                
                <button
                  onClick={() => {
                    const newWords = [...(settings.customVocabulary?.weather || []), ''];
                    updateSettings('customVocabulary', { 
                      ...settings.customVocabulary,
                      weather: newWords 
                    });
                  }}
                  className="add-vocab-button"
                >
                  + Add Weather Word
                </button>
              </div>

              <div className="form-group">
                <label>Seasonal Vocabulary Words</label>
                <p className="form-description">Words that will be used in the seasonal learning step</p>
                <div className="vocabulary-list">
                  {(settings.customVocabulary?.seasonal || ['spring', 'summer', 'fall', 'winter', 'bloom', 'harvest']).map((word, index) => (
                    <div key={index} className="vocabulary-item">
                      <input
                        type="text"
                        value={word}
                        onChange={(e) => {
                          const newWords = [...(settings.customVocabulary?.seasonal || [])];
                          newWords[index] = e.target.value;
                          updateSettings('customVocabulary', { 
                            ...settings.customVocabulary,
                            seasonal: newWords 
                          });
                        }}
                        className="vocabulary-input"
                      />
                      <button
                        onClick={() => {
                          const newWords = (settings.customVocabulary?.seasonal || []).filter((_, i) => i !== index);
                          updateSettings('customVocabulary', { 
                            ...settings.customVocabulary,
                            seasonal: newWords 
                          });
                        }}
                        className="delete-vocab-button"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
                
                <button
                  onClick={() => {
                    const newWords = [...(settings.customVocabulary?.seasonal || []), ''];
                    updateSettings('customVocabulary', { 
                      ...settings.customVocabulary,
                      seasonal: newWords 
                    });
                  }}
                  className="add-vocab-button"
                >
                  + Add Seasonal Word
                </button>
              </div>
            </div>
          )}

          {/* Video Selection */}
          {activeSection === 'videos' && (
            <div className="hub-section">
              <h2>🎥 Video Selection</h2>
              <p>Select videos from your Activity Library to use during Morning Meeting steps</p>

              <div className="video-categories">
                <div className="video-category">
                  <h3>🌤️ Weather & Clothing Videos</h3>
                  <div className="video-selection">
                    <select
                      value=""
                      onChange={(e) => {
                        if (e.target.value) {
                          const selectedVideo = availableVideos.find(v => v.id === e.target.value);
                          if (selectedVideo) {
                            const newVideo = {
                              id: selectedVideo.id,
                              name: selectedVideo.name,
                              url: (selectedVideo as any).url || ''
                            };
                            updateSettings('videos', { 
                              weather: [...settings.videos.weather, newVideo]
                            });
                          }
                        }
                      }}
                      className="video-select"
                    >
                      <option value="">Add weather video...</option>
                      {getTaggedVideos(['weather', 'clothing', 'seasons']).map(video => (
                        <option key={video.id} value={video.id}>{video.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="selected-videos">
                    {settings.videos.weather.map((video, index) => (
                      <div key={index} className="selected-video">
                        <span>{video.name}</span>
                        <button 
                          onClick={() => window.open(video.url, '_blank')}
                          className="preview-button"
                        >
                          ▶️ Preview
                        </button>
                        <button
                          onClick={() => {
                            const newVideos = settings.videos.weather.filter((_, i) => i !== index);
                            updateSettings('videos', { weather: newVideos });
                          }}
                          className="remove-button"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="video-category">
                  <h3>🍂 Seasonal Learning Videos</h3>
                  <div className="video-selection">
                    <select
                      value=""
                      onChange={(e) => {
                        if (e.target.value) {
                          const selectedVideo = availableVideos.find(v => v.id === e.target.value);
                          if (selectedVideo) {
                            const newVideo = {
                              id: selectedVideo.id,
                              name: selectedVideo.name,
                              url: (selectedVideo as any).url || ''
                            };
                            updateSettings('videos', { 
                              seasonal: [...settings.videos.seasonal, newVideo]
                            });
                          }
                        }
                      }}
                      className="video-select"
                    >
                      <option value="">Add seasonal video...</option>
                      {getTaggedVideos(['seasonal', 'activities']).map(video => (
                        <option key={video.id} value={video.id}>{video.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="selected-videos">
                    {settings.videos.seasonal.map((video, index) => (
                      <div key={index} className="selected-video">
                        <span>{video.name}</span>
                        <button 
                          onClick={() => window.open(video.url, '_blank')}
                          className="preview-button"
                        >
                          ▶️ Preview
                        </button>
                        <button
                          onClick={() => {
                            const newVideos = settings.videos.seasonal.filter((_, i) => i !== index);
                            updateSettings('videos', { seasonal: newVideos });
                          }}
                          className="remove-button"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="video-category">
                  <h3>💪 Behavior Expectations Videos</h3>
                  <div className="video-selection">
                    <select
                      value=""
                      onChange={(e) => {
                        if (e.target.value) {
                          const selectedVideo = availableVideos.find(v => v.id === e.target.value);
                          if (selectedVideo) {
                            const newVideo = {
                              id: selectedVideo.id,
                              name: selectedVideo.name,
                              url: (selectedVideo as any).url || ''
                            };
                            updateSettings('videos', { 
                              behaviorCommitments: [...settings.videos.behaviorCommitments, newVideo]
                            });
                          }
                        }
                      }}
                      className="video-select"
                    >
                      <option value="">Add behavior video...</option>
                      {getTaggedVideos(['behavior', 'social-skills']).map(video => (
                        <option key={video.id} value={video.id}>{video.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="selected-videos">
                    {settings.videos.behaviorCommitments.map((video, index) => (
                      <div key={index} className="selected-video">
                        <span>{video.name}</span>
                        <button 
                          onClick={() => window.open(video.url, '_blank')}
                          className="preview-button"
                        >
                          ▶️ Preview
                        </button>
                        <button
                          onClick={() => {
                            const newVideos = settings.videos.behaviorCommitments.filter((_, i) => i !== index);
                            updateSettings('videos', { behaviorCommitments: newVideos });
                          }}
                          className="remove-button"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="video-category">
                  <h3>📅 Calendar Math Videos</h3>
                  <div className="video-selection">
                    <select
                      value=""
                      onChange={(e) => {
                        if (e.target.value) {
                          const selectedVideo = availableVideos.find(v => v.id === e.target.value);
                          if (selectedVideo) {
                            const newVideo = {
                              id: selectedVideo.id,
                              name: selectedVideo.name,
                              url: (selectedVideo as any).url || ''
                            };
                            updateSettings('videos', { 
                              calendarMath: [...settings.videos.calendarMath, newVideo]
                            });
                          }
                        }
                      }}
                      className="video-select"
                    >
                      <option value="">Add calendar math video...</option>
                      {getTaggedVideos(['calendar', 'math', 'numbers']).map(video => (
                        <option key={video.id} value={video.id}>{video.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="selected-videos">
                    {settings.videos.calendarMath.map((video, index) => (
                      <div key={index} className="selected-video">
                        <span>{video.name}</span>
                        <button 
                          onClick={() => window.open(video.url, '_blank')}
                          className="preview-button"
                        >
                          ▶️ Preview
                        </button>
                        <button
                          onClick={() => {
                            const newVideos = settings.videos.calendarMath.filter((_, i) => i !== index);
                            updateSettings('videos', { calendarMath: newVideos });
                          }}
                          className="remove-button"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {availableVideos.length === 0 && (
                <div className="no-videos-message">
                  <p>No videos found in Activity Library. Add videos with appropriate tags to see them here.</p>
                </div>
              )}
            </div>
          )}

          {/* Behavior Statements */}
          {activeSection === 'behavior' && (
            <div className="hub-section">
              <h2>⭐ Behavior Expectations</h2>
              <p>Manage positive behavior expectations for your classroom</p>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.behaviorStatements.enabled}
                    onChange={(e) => updateSettings('behaviorStatements', { enabled: e.target.checked })}
                  />
                  Enable Behavior Commitments in Morning Meeting
                </label>
              </div>

              {settings.behaviorStatements.enabled && (
                <div className="behavior-statements">
                  <h3>Behavior Statements</h3>
                  {settings.behaviorStatements.statements.map((statement, index) => (
                    <div key={index} className="statement-item">
                      <input
                        type="text"
                        value={statement}
                        onChange={(e) => {
                          const newStatements = [...settings.behaviorStatements.statements];
                          newStatements[index] = e.target.value;
                          updateSettings('behaviorStatements', { statements: newStatements });
                        }}
                        className="statement-input"
                      />
                      <button
                        onClick={() => {
                          const newStatements = settings.behaviorStatements.statements.filter((_, i) => i !== index);
                          updateSettings('behaviorStatements', { statements: newStatements });
                        }}
                        className="delete-statement-button"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                  
                  <button
                    onClick={() => {
                      const newStatements = [...settings.behaviorStatements.statements, ''];
                      updateSettings('behaviorStatements', { statements: newStatements });
                    }}
                    className="add-statement-button"
                  >
                    ➕ Add Statement
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Celebrations */}
          {activeSection === 'celebrations' && (
            <div className="hub-section">
              <h2>🎉 Celebrations</h2>
              <p>Manage birthday celebrations and custom recognitions</p>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.celebrations.enabled}
                    onChange={(e) => updateSettings('celebrations', { enabled: e.target.checked })}
                  />
                  Enable celebrations in Morning Meeting
                </label>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.celebrations.showBirthdayPhotos}
                    onChange={(e) => updateSettings('celebrations', { showBirthdayPhotos: e.target.checked })}
                  />
                  Show photos in birthday celebrations
                </label>
              </div>

              <div className="celebrations-summary">
                <h3>Custom Celebrations</h3>
                <p>Current celebrations: {settings.celebrations.customCelebrations.length}</p>
                
                <button
                  onClick={() => setShowCelebrationsModal(true)}
                  className="manage-celebrations-button"
                >
                  🎊 Manage Celebrations
                </button>
              </div>
            </div>
          )}

          {/* Flow Customization */}
          {activeSection === 'flow' && (
            <div className="hub-section">
              <h2>⚙️ Flow Customization</h2>
              <p>Choose which steps to include in your Morning Meeting</p>

              <div className="flow-steps">
                {Object.entries({
                  welcome: { name: 'Welcome Message', icon: '👋' },
                  attendance: { name: 'Attendance', icon: '📋' },
                  behavior: { name: 'Behavior Commitments', icon: '⭐' },
                  calendarMath: { name: 'Calendar Math', icon: '📅' },
                  weather: { name: 'Weather & Clothing', icon: '🌤️' },
                  seasonal: { name: 'Seasonal Learning', icon: '🍂' },
                  celebration: { name: 'Celebrations', icon: '🎉' },
                  dayReview: { name: 'Day Review & Goals', icon: '🎯' }
                }).map(([stepKey, stepInfo]) => (
                  <div key={stepKey} className="flow-step">
                    <label className="step-toggle">
                      <input
                        type="checkbox"
                        checked={settings.flowCustomization.enabledSteps[stepKey] !== false}
                        onChange={(e) => updateSettings('flowCustomization', {
                          enabledSteps: {
                            ...settings.flowCustomization.enabledSteps,
                            [stepKey]: e.target.checked
                          }
                        })}
                        disabled={stepKey === 'attendance'} // Attendance is always required
                      />
                      <span className="step-icon">{stepInfo.icon}</span>
                      <span className="step-name">{stepInfo.name}</span>
                      {stepKey === 'attendance' && <span className="required-badge">Required</span>}
                    </label>
                  </div>
                ))}
              </div>

              <div className="flow-summary">
                <h3>Your Morning Meeting Flow</h3>
                <p>
                  {Object.values(settings.flowCustomization.enabledSteps).filter(Boolean).length} of 8 steps enabled
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Celebrations Management Modal */}
      <CelebrationsManagementModal
        isOpen={showCelebrationsModal}
        onClose={() => setShowCelebrationsModal(false)}
        celebrations={settings.celebrations.customCelebrations}
        onUpdateCelebrations={(celebrations) => {
          updateSettings('celebrations', { customCelebrations: celebrations });
          setShowCelebrationsModal(false);
        }}
      />

      <style>{`
        .morning-meeting-hub {
          display: flex;
          flex-direction: column;
          height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .hub-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2rem;
          background: rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .header-content h1 {
          font-size: 2rem;
          margin: 0 0 0.25rem 0;
          font-weight: 700;
        }

        .header-content p {
          margin: 0;
          opacity: 0.8;
          font-size: 1.1rem;
        }

        .header-actions {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .home-button,
        .save-button,
        .start-button {
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          padding: 0.75rem 1.5rem;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          backdrop-filter: blur(10px);
        }

        .save-button {
          background: rgba(76, 175, 80, 0.2);
          border-color: rgba(76, 175, 80, 0.4);
        }

        .start-button {
          background: rgba(255, 193, 7, 0.2);
          border-color: rgba(255, 193, 7, 0.4);
          font-size: 1.1rem;
          padding: 1rem 2rem;
        }

        .home-button:hover,
        .save-button:hover,
        .start-button:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }

        .hub-layout {
          display: flex;
          flex: 1;
          overflow: hidden;
        }

        .hub-nav {
          width: 300px;
          background: rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(10px);
          padding: 1.5rem;
          overflow-y: auto;
        }

        .hub-nav h3 {
          margin: 0 0 1rem 0;
          font-size: 1.2rem;
          opacity: 0.8;
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
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: left;
          width: 100%;
          color: white;
        }

        .nav-section:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .nav-section.active {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.3);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }

        .section-icon {
          font-size: 1.5rem;
        }

        .section-info {
          flex: 1;
        }

        .section-name {
          font-weight: 600;
          margin-bottom: 0.25rem;
        }

        .section-desc {
          font-size: 0.8rem;
          opacity: 0.7;
        }

        .hub-content {
          flex: 1;
          padding: 2rem;
          overflow-y: auto;
          background: rgba(255, 255, 255, 0.05);
        }

        .hub-section {
          max-width: 800px;
          margin: 0 auto;
        }

        .hub-section h2 {
          font-size: 2rem;
          margin: 0 0 0.5rem 0;
          font-weight: 700;
        }

        .hub-section > p {
          font-size: 1.1rem;
          opacity: 0.9;
          margin: 0 0 2rem 0;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          font-weight: 600;
          margin-bottom: 0.5rem;
          font-size: 1rem;
        }

        .form-input {
          width: 100%;
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          padding: 0.75rem;
          color: white;
          font-size: 1rem;
          backdrop-filter: blur(10px);
        }

        .form-input::placeholder {
          color: rgba(255, 255, 255, 0.6);
        }

        .form-input:focus {
          outline: none;
          border-color: rgba(255, 255, 255, 0.4);
          box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          font-weight: 600;
        }

        .checkbox-label input[type="checkbox"] {
          transform: scale(1.2);
        }

        /* Video Selection Styles */
        .video-categories {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .video-category {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 1.5rem;
          backdrop-filter: blur(10px);
        }

        .video-category h3 {
          margin: 0 0 1rem 0;
          font-size: 1.2rem;
          font-weight: 600;
        }

        .video-selection {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .video-select {
          flex: 1;
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          padding: 0.75rem;
          color: white;
          font-size: 1rem;
          cursor: pointer;
        }

        .video-select option {
          background: #333;
          color: white;
        }

        .preview-button {
          background: rgba(255, 193, 7, 0.2);
          border: 2px solid rgba(255, 193, 7, 0.4);
          border-radius: 8px;
          padding: 0.75rem 1rem;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .preview-button:hover {
          background: rgba(255, 193, 7, 0.3);
          transform: translateY(-2px);
        }

        .selected-videos {
          margin-top: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .selected-video {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 0.75rem;
          gap: 1rem;
        }

        .selected-video span {
          flex: 1;
          font-weight: 500;
        }

        .remove-button {
          background: rgba(220, 53, 69, 0.2);
          border: 2px solid rgba(220, 53, 69, 0.4);
          border-radius: 6px;
          padding: 0.5rem;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.9rem;
        }

        .remove-button:hover {
          background: rgba(220, 53, 69, 0.3);
        }

        .no-videos-message {
          text-align: center;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 2rem;
          margin-top: 2rem;
        }

        .no-videos-message p {
          font-size: 1.1rem;
          opacity: 0.8;
          margin: 0;
        }

        /* Behavior Statements Styles */
        .behavior-statements {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 1.5rem;
          backdrop-filter: blur(10px);
        }

        .behavior-statements h3 {
          margin: 0 0 1rem 0;
          font-size: 1.2rem;
          font-weight: 600;
        }

        .statement-item {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
          align-items: center;
        }

        .statement-input {
          flex: 1;
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          padding: 0.75rem;
          color: white;
          font-size: 1rem;
        }

        .statement-input:focus {
          outline: none;
          border-color: rgba(255, 255, 255, 0.4);
        }

        .delete-statement-button {
          background: rgba(220, 53, 69, 0.2);
          border: 2px solid rgba(220, 53, 69, 0.4);
          border-radius: 8px;
          padding: 0.5rem;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .delete-statement-button:hover {
          background: rgba(220, 53, 69, 0.3);
        }

        .add-statement-button {
          background: rgba(40, 167, 69, 0.2);
          border: 2px solid rgba(40, 167, 69, 0.4);
          border-radius: 8px;
          padding: 0.75rem 1rem;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          width: 100%;
        }

        .add-statement-button:hover {
          background: rgba(40, 167, 69, 0.3);
        }

        /* Vocabulary Styles */
        .form-description {
          font-size: 0.9rem;
          opacity: 0.8;
          margin: 0 0 1rem 0;
          font-style: italic;
        }

        .vocabulary-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .vocabulary-item {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .vocabulary-input {
          flex: 1;
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          padding: 0.75rem;
          color: white;
          font-size: 1rem;
          backdrop-filter: blur(10px);
        }

        .vocabulary-input::placeholder {
          color: rgba(255, 255, 255, 0.6);
        }

        .vocabulary-input:focus {
          outline: none;
          border-color: rgba(255, 255, 255, 0.4);
          box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
        }

        .delete-vocab-button {
          background: rgba(220, 53, 69, 0.2);
          border: 2px solid rgba(220, 53, 69, 0.4);
          border-radius: 8px;
          padding: 0.5rem;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.9rem;
        }

        .delete-vocab-button:hover {
          background: rgba(220, 53, 69, 0.3);
        }

        .add-vocab-button {
          background: rgba(40, 167, 69, 0.2);
          border: 2px solid rgba(40, 167, 69, 0.4);
          border-radius: 8px;
          padding: 0.75rem 1rem;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          width: 100%;
        }

        .add-vocab-button:hover {
          background: rgba(40, 167, 69, 0.3);
        }

        /* Celebrations Styles */
        .celebrations-summary {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 1.5rem;
          backdrop-filter: blur(10px);
        }

        .celebrations-summary h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.2rem;
          font-weight: 600;
        }

        .celebrations-summary p {
          margin: 0 0 1.5rem 0;
          opacity: 0.8;
        }

        .manage-celebrations-button {
          background: rgba(255, 107, 107, 0.2);
          border: 2px solid rgba(255, 107, 107, 0.4);
          border-radius: 12px;
          padding: 1rem 1.5rem;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 1.1rem;
          width: 100%;
        }

        .manage-celebrations-button:hover {
          background: rgba(255, 107, 107, 0.3);
          transform: translateY(-2px);
        }

        /* Flow Customization Styles */
        .flow-steps {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .flow-step {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 1rem;
          backdrop-filter: blur(10px);
        }

        .step-toggle {
          display: flex;
          align-items: center;
          gap: 1rem;
          cursor: pointer;
          font-weight: 600;
        }

        .step-toggle input[type="checkbox"] {
          transform: scale(1.2);
        }

        .step-toggle input[type="checkbox"]:disabled {
          opacity: 0.6;
        }

        .step-icon {
          font-size: 1.5rem;
        }

        .step-name {
          flex: 1;
        }

        .required-badge {
          background: rgba(255, 193, 7, 0.3);
          border: 1px solid rgba(255, 193, 7, 0.5);
          border-radius: 4px;
          padding: 0.25rem 0.5rem;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .flow-summary {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 1.5rem;
          text-align: center;
          backdrop-filter: blur(10px);
        }

        .flow-summary h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.2rem;
          font-weight: 600;
        }

        .flow-summary p {
          margin: 0;
          opacity: 0.8;
          font-size: 1.1rem;
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
        }

        .modal-content {
          background: white;
          border-radius: 16px;
          width: 90%;
          max-width: 600px;
          max-height: 80vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          color: #333;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2rem;
          border-bottom: 1px solid #e1e8ed;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 700;
        }

        .close-button {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #666;
          padding: 0.25rem;
        }

        .close-button:hover {
          color: #333;
        }

        .modal-body {
          padding: 2rem;
          overflow-y: auto;
          flex: 1;
        }

        .add-celebration-button {
          background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
          color: white;
          border: none;
          border-radius: 8px;
          padding: 0.75rem 1.5rem;
          cursor: pointer;
          font-weight: 600;
          margin-bottom: 2rem;
          width: 100%;
        }

        .add-celebration-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }

        .celebrations-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .celebration-item {
          border: 1px solid #e1e8ed;
          border-radius: 8px;
          padding: 1.5rem;
          background: #f8f9fa;
        }

        .celebration-row {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
          align-items: end;
        }

        .celebration-input {
          flex: 1;
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
        }

        .emoji-input {
          width: 60px;
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          text-align: center;
          font-size: 1rem;
        }

        .delete-button {
          background: #dc3545;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 0.5rem 1rem;
          cursor: pointer;
          font-size: 1rem;
        }

        .delete-button:hover {
          background: #c82333;
        }

        .date-section {
          flex: 1;
        }

        .date-section label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #333;
          font-size: 0.9rem;
        }

        .date-input {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
        }

        .recurring-section {
          display: flex;
          align-items: end;
          padding-bottom: 0.5rem;
        }

        .recurring-section .checkbox-label {
          font-size: 0.9rem;
          color: #333;
          gap: 0.5rem;
        }

        .message-input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          resize: vertical;
          font-size: 1rem;
          font-family: inherit;
        }

        .modal-footer {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          padding: 1.5rem 2rem;
          border-top: 1px solid #e1e8ed;
        }

        .cancel-button {
          background: #6c757d;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 0.75rem 1.5rem;
          cursor: pointer;
          font-weight: 600;
        }

        .cancel-button:hover {
          background: #5a6268;
        }

        .save-button {
          background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
          color: white;
          border: none;
          border-radius: 8px;
          padding: 0.75rem 1.5rem;
          cursor: pointer;
          font-weight: 600;
        }

        .save-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .hub-layout {
            flex-direction: column;
          }

          .hub-nav {
            width: 100%;
            padding: 1rem;
          }

          .nav-sections {
            flex-direction: row;
            overflow-x: auto;
            gap: 1rem;
          }

          .nav-section {
            min-width: 200px;
          }
        }

        @media (max-width: 768px) {
          .hub-header {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }

          .header-actions {
            flex-direction: column;
            width: 100%;
          }

          .hub-content {
            padding: 1rem;
          }

          .video-selection {
            flex-direction: column;
            align-items: stretch;
          }

          .celebration-row {
            flex-direction: column;
            align-items: stretch;
          }

          .modal-content {
            width: 95%;
            margin: 1rem;
          }

          .modal-body {
            padding: 1rem;
          }

          .modal-footer {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default MorningMeetingHub;
