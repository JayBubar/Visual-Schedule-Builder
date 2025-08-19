import React, { useState, useEffect } from 'react';
import { Settings, Play, Users, Video, Calendar, Cloud, CheckCircle, Eye, BookOpen } from 'lucide-react';
import UnifiedDataService from '../../services/unifiedDataService';
import { MorningMeetingSettings, DEFAULT_MORNING_MEETING_SETTINGS } from './types/morningMeetingTypes';

interface MorningMeetingHubProps {
  onStartMorningMeeting: () => void;
  onClose: () => void;
}

const MorningMeetingHub: React.FC<MorningMeetingHubProps> = ({ onStartMorningMeeting, onClose }) => {
  const [settings, setSettings] = useState<MorningMeetingSettings>(() => {
    // Load existing settings from localStorage
    const saved = localStorage.getItem('morningMeetingSettings');
    if (saved) {
      try {
        const parsedSettings = JSON.parse(saved);
        // Merge with defaults to ensure all new properties exist
        return {
          ...DEFAULT_MORNING_MEETING_SETTINGS,
          ...parsedSettings,
          videos: {
            ...DEFAULT_MORNING_MEETING_SETTINGS.videos,
            ...parsedSettings.videos
          },
          customVocabulary: {
            ...DEFAULT_MORNING_MEETING_SETTINGS.customVocabulary,
            ...parsedSettings.customVocabulary
          }
        };
      } catch (error) {
        console.error('Failed to parse Morning Meeting settings:', error);
      }
    }
    
    return DEFAULT_MORNING_MEETING_SETTINGS;
  });

  const [activeSection, setActiveSection] = useState<string>('welcome');
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('morningMeetingSettings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (section: keyof MorningMeetingSettings, data: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }));
  };

  const getCurrentSeason = () => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
  };

  // Get videos from Activity Library with proper tags
  const getTaggedVideos = (tags: string[]) => {
    const allActivities = UnifiedDataService.getAllActivities();
    return allActivities.filter(activity => 
      activity.category === 'video' && 
      activity.materials && 
      tags.some(tag => activity.materials?.some(material => 
        material.toLowerCase().includes(tag.toLowerCase())
      ))
    );
  };

  // VideoSelectionStep Component
  const VideoSelectionStep = ({ stepName, stepIcon, description, availableVideos, currentSelection, onSelectionChange }: {
    stepName: string;
    stepIcon: string;
    description: string;
    availableVideos: any[];
    currentSelection: Array<{id: string, name: string, url: string}>;
    onSelectionChange: (videos: Array<{id: string, name: string, url: string}>) => void;
  }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
      <div className="video-step-selector">
        <div 
          className="video-step-header"
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            cursor: 'pointer',
            marginBottom: '0.5rem'
          }}
        >
          <div>
            <strong>{stepIcon} {stepName}</strong>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>{description}</p>
            <small>{currentSelection.length} video(s) selected</small>
          </div>
          <span>{isExpanded ? '▼' : '▶'}</span>
        </div>
        
        {isExpanded && (
          <div style={{ padding: '1rem', border: '1px solid #e9ecef', borderRadius: '8px' }}>
            {availableVideos.length === 0 ? (
              <p style={{ color: '#666', fontStyle: 'italic' }}>
                No videos found. Add videos with appropriate tags in Activity Library.
              </p>
            ) : (
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                {availableVideos.map(video => (
                  <div 
                    key={video.id} 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0.5rem',
                      border: '1px solid #dee2e6',
                      borderRadius: '4px'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={currentSelection.some(sel => sel.id === video.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          onSelectionChange([...currentSelection, { 
                            id: video.id, 
                            name: video.name, 
                            url: video.instructions || video.description || '' 
                          }]);
                        } else {
                          onSelectionChange(currentSelection.filter(sel => sel.id !== video.id));
                        }
                      }}
                      style={{ marginRight: '0.5rem' }}
                    />
                    <div>
                      <strong>{video.name}</strong>
                      {video.description && (
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>
                          {video.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const sections = [
    { id: 'welcome', label: 'Welcome Personalization', icon: Users, color: '#3498db' },
    { id: 'videos', label: 'Video Selection', icon: Video, color: '#e74c3c' },
    { id: 'vocabulary', label: 'Custom Vocabulary', icon: BookOpen, color: '#27ae60' },
    { id: 'behavior', label: 'Behavior Statements', icon: CheckCircle, color: '#2ecc71' },
    { id: 'weather', label: 'Weather API', icon: Cloud, color: '#f39c12' },
    { id: 'flow', label: 'Flow Customization', icon: Settings, color: '#9b59b6' },
    { id: 'preview', label: 'Preview & Test', icon: Eye, color: '#1abc9c' }
  ];

  const renderWelcomeSection = () => (
    <div className="hub-section">
      <h3 className="section-title">
        <Users size={20} /> Welcome Personalization
      </h3>
      <p className="section-description">
        Customize the welcome experience for your classroom
      </p>
      
      <div className="form-grid">
        <div className="form-group">
          <label>School Name</label>
          <input
            type="text"
            value={settings.welcomePersonalization.schoolName}
            onChange={(e) => updateSettings('welcomePersonalization', { schoolName: e.target.value })}
            placeholder="Your School Name"
          />
        </div>
        
        <div className="form-group">
          <label>Teacher Name</label>
          <input
            type="text"
            value={settings.welcomePersonalization.teacherName}
            onChange={(e) => updateSettings('welcomePersonalization', { teacherName: e.target.value })}
            placeholder="Mr./Ms. Your Name"
          />
        </div>
        
        <div className="form-group">
          <label>Class Name</label>
          <input
            type="text"
            value={settings.welcomePersonalization.className}
            onChange={(e) => updateSettings('welcomePersonalization', { className: e.target.value })}
            placeholder="Grade 3A, Room 102, etc."
          />
        </div>
        
        <div className="form-group full-width">
          <label>Welcome Message</label>
          <textarea
            value={settings.welcomePersonalization.customMessage || ''}
            onChange={(e) => updateSettings('welcomePersonalization', { customMessage: e.target.value })}
            placeholder="Your daily welcome message to students"
            rows={3}
          />
        </div>
      </div>
    </div>
  );

  const renderVideoSection = () => {
    const weatherVideos = getTaggedVideos(['weather', 'clothing', 'seasons']);
    const seasonalVideos = getTaggedVideos(['seasonal', getCurrentSeason()]);
    const behaviorVideos = getTaggedVideos(['behavior', 'social', 'expectations']);
    const calendarVideos = getTaggedVideos(['calendar', 'math', 'numbers']);

    return (
      <div className="hub-section">
        <h3 className="section-title">
          <Video size={20} /> Video Selection
        </h3>
        <p className="section-description">
          Select videos from your Activity Library for each Morning Meeting step
        </p>
        
        <VideoSelectionStep 
          stepName="Weather & Clothing"
          stepIcon="🌤️"
          description="Weather and clothing selection videos"
          availableVideos={weatherVideos}
          currentSelection={settings.videos.weatherClothing}
          onSelectionChange={(videos) => updateSettings('videos', {
            ...settings.videos,
            weatherClothing: videos
          })}
        />
        
        <VideoSelectionStep 
          stepName="Seasonal Learning"
          stepIcon="🍂"
          description="Seasonal activities and learning videos"
          availableVideos={seasonalVideos}
          currentSelection={settings.videos.seasonalLearning}
          onSelectionChange={(videos) => updateSettings('videos', {
            ...settings.videos,
            seasonalLearning: videos
          })}
        />
        
        <VideoSelectionStep 
          stepName="Behavior Commitments"
          stepIcon="⭐"
          description="Social skills and behavior videos"
          availableVideos={behaviorVideos}
          currentSelection={settings.videos.behaviorCommitments}
          onSelectionChange={(videos) => updateSettings('videos', {
            ...settings.videos,
            behaviorCommitments: videos
          })}
        />
        
        <VideoSelectionStep 
          stepName="Calendar Math"
          stepIcon="📅"
          description="Math and calendar learning videos"
          availableVideos={calendarVideos}
          currentSelection={settings.videos.calendarMath}
          onSelectionChange={(videos) => updateSettings('videos', {
            ...settings.videos,
            calendarMath: videos
          })}
        />
      </div>
    );
  };

  const renderVocabularySection = () => (
    <div className="hub-section">
      <h3 className="section-title">
        <BookOpen size={20} /> Custom Vocabulary
      </h3>
      <p className="section-description">
        Customize vocabulary words for each Morning Meeting step
      </p>
      
      <div className="vocabulary-grid">
        <div className="vocab-category">
          <h4>🌤️ Weather Words</h4>
          <textarea
            value={settings.customVocabulary.weather.join(', ')}
            onChange={(e) => updateSettings('customVocabulary', {
              ...settings.customVocabulary,
              weather: e.target.value.split(',').map(word => word.trim()).filter(word => word)
            })}
            placeholder="sunny, cloudy, rainy, snowy, windy, foggy"
            rows={3}
          />
        </div>
        
        <div className="vocab-category">
          <h4>🍂 Seasonal Words</h4>
          <textarea
            value={settings.customVocabulary.seasonal.join(', ')}
            onChange={(e) => updateSettings('customVocabulary', {
              ...settings.customVocabulary,
              seasonal: e.target.value.split(',').map(word => word.trim()).filter(word => word)
            })}
            placeholder="spring, summer, fall, winter, leaves, flowers, snow"
            rows={3}
          />
        </div>
        
        <div className="vocab-category">
          <h4>📅 Calendar Words</h4>
          <textarea
            value={settings.customVocabulary.calendar.join(', ')}
            onChange={(e) => updateSettings('customVocabulary', {
              ...settings.customVocabulary,
              calendar: e.target.value.split(',').map(word => word.trim()).filter(word => word)
            })}
            placeholder="yesterday, today, tomorrow, week, month, ordinal"
            rows={3}
          />
        </div>
      </div>
    </div>
  );

  const renderBehaviorSection = () => (
    <div className="hub-section">
      <h3 className="section-title">
        <CheckCircle size={20} /> Behavior Statements
      </h3>
      <p className="section-description">
        Manage positive behavior expectations for your classroom
      </p>
      
      <div className="behavior-controls">
        <label className="toggle-label">
          <input
            type="checkbox"
            checked={settings.behaviorStatements.enabled}
            onChange={(e) => updateSettings('behaviorStatements', { enabled: e.target.checked })}
          />
          Enable Behavior Statements in Morning Meeting
        </label>
      </div>
      
      {settings.behaviorStatements.enabled && (
        <div className="statements-list">
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
              />
              <button
                onClick={() => {
                  const newStatements = settings.behaviorStatements.statements.filter((_, i) => i !== index);
                  updateSettings('behaviorStatements', { statements: newStatements });
                }}
                className="remove-btn"
              >
                ×
              </button>
            </div>
          ))}
          
          <button
            onClick={() => {
              const newStatements = [...settings.behaviorStatements.statements, 'New behavior statement'];
              updateSettings('behaviorStatements', { statements: newStatements });
            }}
            className="add-statement-btn"
          >
            + Add Statement
          </button>
        </div>
      )}
    </div>
  );

  const renderWeatherSection = () => (
    <div className="hub-section">
      <h3 className="section-title">
        <Cloud size={20} /> Weather API Settings
      </h3>
      <p className="section-description">
        Configure automatic weather data for Weather & Clothing step
      </p>
      
      <div className="weather-controls">
        <label className="toggle-label">
          <input
            type="checkbox"
            checked={settings.weatherAPI.enabled}
            onChange={(e) => updateSettings('weatherAPI', { enabled: e.target.checked })}
          />
          Enable Automatic Weather Data
        </label>
      </div>
      
      {settings.weatherAPI.enabled && (
        <div className="form-grid">
          <div className="form-group">
            <label>API Key</label>
            <input
              type="password"
              value={settings.weatherAPI.apiKey || ''}
              onChange={(e) => updateSettings('weatherAPI', { apiKey: e.target.value })}
              placeholder="Your weather API key"
            />
          </div>
          
          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              value={settings.weatherAPI.location || ''}
              onChange={(e) => updateSettings('weatherAPI', { location: e.target.value })}
              placeholder="City, State or ZIP code"
            />
          </div>
        </div>
      )}
    </div>
  );

  const renderFlowSection = () => (
    <div className="hub-section">
      <h3 className="section-title">
        <Settings size={20} /> Flow Customization
      </h3>
      <p className="section-description">
        Enable or disable specific steps in your Morning Meeting flow
      </p>
      
      <div className="flow-steps">
        {Object.entries(settings.flowCustomization.enabledSteps).map(([step, enabled]) => (
          <label key={step} className="step-toggle">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => updateSettings('flowCustomization', {
                enabledSteps: {
                  ...settings.flowCustomization.enabledSteps,
                  [step]: e.target.checked
                }
              })}
            />
            <span className="step-name">
              {step.charAt(0).toUpperCase() + step.slice(1).replace(/([A-Z])/g, ' $1')}
            </span>
          </label>
        ))}
      </div>
    </div>
  );

  const renderPreviewSection = () => (
    <div className="hub-section">
      <h3 className="section-title">
        <Eye size={20} /> Preview & Test
      </h3>
      <p className="section-description">
        Preview your Morning Meeting configuration and test the flow
      </p>
      
      <div className="preview-summary">
        <div className="summary-item">
          <strong>School:</strong> {settings.welcomePersonalization.schoolName || 'Not set'}
        </div>
        <div className="summary-item">
          <strong>Teacher:</strong> {settings.welcomePersonalization.teacherName || 'Not set'}
        </div>
        <div className="summary-item">
          <strong>Class:</strong> {settings.welcomePersonalization.className || 'Not set'}
        </div>
        <div className="summary-item">
          <strong>Enabled Steps:</strong> {Object.values(settings.flowCustomization.enabledSteps).filter(Boolean).length} of 6
        </div>
        <div className="summary-item">
          <strong>Behavior Statements:</strong> {settings.behaviorStatements.enabled ? 'Enabled' : 'Disabled'}
        </div>
        <div className="summary-item">
          <strong>Weather API:</strong> {settings.weatherAPI.enabled ? 'Enabled' : 'Disabled'}
        </div>
        <div className="summary-item">
          <strong>Videos Selected:</strong> {
            Object.values(settings.videos).reduce((total, videos) => total + videos.length, 0)
          }
        </div>
      </div>
      
      <div className="preview-actions">
        <button 
          onClick={() => setIsPreviewMode(true)}
          className="preview-btn"
        >
          <Eye size={16} /> Preview Mode
        </button>
        <button 
          onClick={onStartMorningMeeting}
          className="test-btn"
        >
          <Play size={16} /> Test Morning Meeting
        </button>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'welcome': return renderWelcomeSection();
      case 'videos': return renderVideoSection();
      case 'vocabulary': return renderVocabularySection();
      case 'behavior': return renderBehaviorSection();
      case 'weather': return renderWeatherSection();
      case 'flow': return renderFlowSection();
      case 'preview': return renderPreviewSection();
      default: return renderWelcomeSection();
    }
  };

  return (
    <div className="morning-meeting-hub">
      {/* Header */}
      <div className="hub-header">
        <div className="hub-title">
          <Calendar size={24} />
          <div>
            <h1>Morning Meeting Hub</h1>
            <p>Configure and manage your daily Morning Meeting experience</p>
          </div>
        </div>
        <button onClick={onClose} className="close-btn">×</button>
      </div>

      {/* Main Content */}
      <div className="hub-content">
        {/* Sidebar Navigation */}
        <div className="hub-sidebar">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`sidebar-btn ${activeSection === section.id ? 'active' : ''}`}
              style={{ '--section-color': section.color } as React.CSSProperties}
            >
              <section.icon size={16} />
              {section.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="hub-main">
          {renderContent()}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="hub-footer">
        <button onClick={onClose} className="secondary-btn">
          Close Hub
        </button>
        <button onClick={onStartMorningMeeting} className="primary-btn">
          <Play size={16} />
          Start Morning Meeting
        </button>
      </div>

      <style>{`
        .morning-meeting-hub {
          height: 100vh;
          width: 100vw;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          position: fixed;
          top: 0;
          left: 0;
          z-index: 1000;
        }

        .hub-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2rem;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        }

        .hub-title {
          display: flex;
          align-items: center;
          gap: 1rem;
          color: white;
        }

        .hub-title h1 {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0;
        }

        .hub-title p {
          font-size: 0.9rem;
          opacity: 0.8;
          margin: 0;
        }

        .close-btn {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          font-size: 1.5rem;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(1.1);
        }

        .hub-content {
          flex: 1;
          display: flex;
          overflow: hidden;
        }

        .hub-sidebar {
          width: 250px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          padding: 1rem;
          border-right: 1px solid rgba(255, 255, 255, 0.2);
          overflow-y: auto;
        }

        .sidebar-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          margin-bottom: 0.5rem;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          color: white;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: left;
        }

        .sidebar-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .sidebar-btn.active {
          background: var(--section-color);
          border-color: var(--section-color);
          font-weight: 600;
        }

        .hub-main {
          flex: 1;
          padding: 2rem;
          overflow-y: auto;
          background: rgba(255, 255, 255, 0.95);
          color: #333;
        }

        .hub-section {
          max-width: 800px;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          color: #2c3e50;
        }

        .section-description {
          color: #7f8c8d;
          margin-bottom: 2rem;
          line-height: 1.5;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group.full-width {
          grid-column: 1 / -1;
        }

        .form-group label {
          font-weight: 600;
          color: #2c3e50;
        }

        .form-group input,
        .form-group textarea {
          padding: 0.75rem;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          font-size: 0.9rem;
          transition: border-color 0.3s ease;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #667eea;
        }

        .video-step-selector {
          margin-bottom: 1rem;
        }

        .vocabulary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .vocab-category {
          padding: 1.5rem;
          background: #f8f9fa;
          border-radius: 12px;
          border: 2px solid #e9ecef;
        }

        .vocab-category h4 {
          margin-bottom: 1rem;
          color: #2c3e50;
        }

        .vocab-category textarea {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          font-size: 0.9rem;
          transition: border-color 0.3s ease;
          resize: vertical;
        }

        .vocab-category textarea:focus {
          outline: none;
          border-color: #667eea;
        }

        .behavior-controls,
        .weather-controls {
          margin-bottom: 2rem;
        }

        .toggle-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          cursor: pointer;
        }

        .statements-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .statement-item {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .statement-item input {
          flex: 1;
          padding: 0.75rem;
          border: 2px solid #e9ecef;
          border-radius: 8px;
        }

        .remove-btn {
          width: 30px;
          height: 30px;
          background: #e74c3c;
          color: white;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          font-size: 1.2rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .add-statement-btn {
          padding: 0.75rem 1.5rem;
          background: #2ecc71;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          align-self: flex-start;
        }

        .flow-steps {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .step-toggle {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
        }

        .preview-summary {
          display: grid;
          gap: 1rem;
          margin-bottom: 2rem;
          padding: 1.5rem;
          background: #f8f9fa;
          border-radius: 12px;
        }

        .summary-item {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
          border-bottom: 1px solid #e9ecef;
        }

        .preview-actions {
          display: flex;
          gap: 1rem;
        }

        .preview-btn,
        .test-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .preview-btn {
          background: #3498db;
          color: white;
        }

        .test-btn {
          background: #2ecc71;
          color: white;
        }

        .hub-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2rem;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-top: 1px solid rgba(255, 255, 255, 0.2);
        }

        .secondary-btn,
        .primary-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 2rem;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .secondary-btn {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .primary-btn {
          background: #2ecc71;
          color: white;
        }

        .secondary-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .primary-btn:hover {
          background: #27ae60;
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
};

export default MorningMeetingHub;
