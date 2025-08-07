import React, { useState, useEffect } from 'react';
import { CalendarSettings, ScheduleCategory } from '../../types';
import { WeatherService } from '../../utils/weatherService';

interface CalendarSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: CalendarSettings) => void;
  currentSettings: CalendarSettings;
}

const CalendarSettingsComponent: React.FC<CalendarSettingsProps> = ({
  isOpen,
  onClose,
  onSave,
  currentSettings
}) => {
  const [formData, setFormData] = useState<CalendarSettings>({
    ...currentSettings,
    celebrationsEnabled: currentSettings.celebrationsEnabled !== false,
    customCelebrations: currentSettings.customCelebrations || [],
    birthdayDisplayMode: currentSettings.birthdayDisplayMode || 'both',
    weekendBirthdayHandling: currentSettings.weekendBirthdayHandling || 'friday',
    enableBirthdayNotifications: currentSettings.enableBirthdayNotifications !== false,
    celebrationAnimationLevel: currentSettings.celebrationAnimationLevel || 'full'
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isTestingApi, setIsTestingApi] = useState(false);
  const [apiTestResult, setApiTestResult] = useState<string | null>(null);

  useEffect(() => {
    setFormData(currentSettings);
  }, [currentSettings]);

  const handleSave = () => {
    const newErrors: { [key: string]: string } = {};

    // Validate required fields
    if (!formData.weatherLocation.trim()) {
      newErrors.weatherLocation = 'Weather location is required';
    }

    if (formData.weatherUpdateInterval < 5) {
      newErrors.weatherUpdateInterval = 'Update interval must be at least 5 minutes';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave(formData);
    onClose();
  };

  const testApiKey = async () => {
    if (!formData.weatherApiKey) {
      setApiTestResult('Please enter an API key to test');
      return;
    }

    setIsTestingApi(true);
    setApiTestResult(null);

    try {
      const weatherService = new WeatherService(formData.weatherApiKey);
      const testWeather = await weatherService.getCurrentWeather(formData.weatherLocation, formData.temperatureUnit);
      
      if (testWeather.apiSource === 'openweathermap') {
        setApiTestResult('✅ API key is working! Weather data retrieved successfully.');
      } else {
        setApiTestResult('⚠️ API key may not be working properly. Using fallback data.');
      }
    } catch (error) {
      setApiTestResult('❌ API key test failed. Please check your key and try again.');
    } finally {
      setIsTestingApi(false);
    }
  };

  const addBehaviorCategory = () => {
    const newCategory = prompt('Enter new behavior category:');
    if (newCategory && !formData.behaviorCategories.includes(newCategory.toLowerCase())) {
      setFormData(prev => ({
        ...prev,
        behaviorCategories: [...prev.behaviorCategories, newCategory.toLowerCase()]
      }));
    }
  };

  const removeBehaviorCategory = (category: string) => {
    setFormData(prev => ({
      ...prev,
      behaviorCategories: prev.behaviorCategories.filter(c => c !== category)
    }));
  };

  const addChoiceCategory = (category: ScheduleCategory) => {
    if (!formData.independentChoiceCategories.includes(category)) {
      setFormData(prev => ({
        ...prev,
        independentChoiceCategories: [...prev.independentChoiceCategories, category]
      }));
    }
  };

  const removeChoiceCategory = (category: ScheduleCategory) => {
    setFormData(prev => ({
      ...prev,
      independentChoiceCategories: prev.independentChoiceCategories.filter(c => c !== category)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(5px)'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '20px',
        padding: '2rem',
        maxWidth: '800px',
        width: '90%',
        maxHeight: '90vh',
        overflowY: 'auto',
        color: 'white',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '2rem',
            fontWeight: '700'
          }}>
            📅 Calendar Settings
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              color: 'white',
              fontSize: '1.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        </div>

        {/* Weather Settings */}
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <h3 style={{
            margin: '0 0 1rem 0',
            fontSize: '1.5rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            🌤️ Weather Settings
          </h3>

          {/* Weather Location */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              fontSize: '1rem'
            }}>
              Weather Location
            </label>
            <input
              type="text"
              value={formData.weatherLocation}
              onChange={(e) => setFormData(prev => ({ ...prev, weatherLocation: e.target.value }))}
              placeholder="e.g., Columbia, SC or New York, NY"
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: errors.weatherLocation ? '2px solid #ff6b6b' : '2px solid rgba(255,255,255,0.3)',
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                fontSize: '1rem',
                backdropFilter: 'blur(10px)'
              }}
            />
            {errors.weatherLocation && (
              <div style={{ color: '#ff6b6b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                {errors.weatherLocation}
              </div>
            )}
          </div>

          {/* Temperature Unit */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              fontSize: '1rem'
            }}>
              Temperature Unit
            </label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="temperatureUnit"
                  value="F"
                  checked={formData.temperatureUnit === 'F'}
                  onChange={(e) => setFormData(prev => ({ ...prev, temperatureUnit: e.target.value as 'F' | 'C' }))}
                />
                Fahrenheit (°F)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="temperatureUnit"
                  value="C"
                  checked={formData.temperatureUnit === 'C'}
                  onChange={(e) => setFormData(prev => ({ ...prev, temperatureUnit: e.target.value as 'F' | 'C' }))}
                />
                Celsius (°C)
              </label>
            </div>
          </div>

          {/* API Key */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              fontSize: '1rem'
            }}>
              OpenWeatherMap API Key (Optional)
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                type="password"
                value={formData.weatherApiKey || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, weatherApiKey: e.target.value }))}
                placeholder="Enter your API key for live weather data"
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  background: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  fontSize: '1rem',
                  backdropFilter: 'blur(10px)'
                }}
              />
              <button
                onClick={testApiKey}
                disabled={isTestingApi}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderRadius: '8px',
                  color: 'white',
                  padding: '0.75rem 1rem',
                  fontSize: '0.9rem',
                  cursor: isTestingApi ? 'not-allowed' : 'pointer',
                  fontWeight: '600'
                }}
              >
                {isTestingApi ? '🔄 Testing...' : '🧪 Test'}
              </button>
            </div>
            
            {apiTestResult && (
              <div style={{
                marginTop: '0.5rem',
                padding: '0.75rem',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.1)',
                fontSize: '0.9rem'
              }}>
                {apiTestResult}
              </div>
            )}

            <div style={{
              marginTop: '0.5rem',
              fontSize: '0.8rem',
              color: 'rgba(255,255,255,0.8)',
              lineHeight: '1.4'
            }}>
              Without an API key, sample weather data will be shown. Get a free key at{' '}
              <span style={{ fontWeight: '600' }}>openweathermap.org/api</span>
            </div>
          </div>

          {/* Auto Update Settings */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              marginBottom: '1rem'
            }}>
              <input
                type="checkbox"
                checked={formData.autoWeatherUpdate}
                onChange={(e) => setFormData(prev => ({ ...prev, autoWeatherUpdate: e.target.checked }))}
              />
              <span style={{ fontWeight: '600' }}>Auto-update weather data</span>
            </label>

            {formData.autoWeatherUpdate && (
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '600',
                  fontSize: '1rem'
                }}>
                  Update Interval (minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  max="1440"
                  value={formData.weatherUpdateInterval}
                  onChange={(e) => setFormData(prev => ({ ...prev, weatherUpdateInterval: parseInt(e.target.value) || 60 }))}
                  style={{
                    width: '120px',
                    padding: '0.5rem',
                    borderRadius: '8px',
                    border: errors.weatherUpdateInterval ? '2px solid #ff6b6b' : '2px solid rgba(255,255,255,0.3)',
                    background: 'rgba(255,255,255,0.1)',
                    color: 'white',
                    fontSize: '1rem'
                  }}
                />
                {errors.weatherUpdateInterval && (
                  <div style={{ color: '#ff6b6b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                    {errors.weatherUpdateInterval}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Celebration Settings */}
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <h3 style={{
            margin: '0 0 1rem 0',
            fontSize: '1.5rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            🎉 Celebration Settings
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={formData.celebrationsEnabled !== false}
                onChange={(e) => setFormData(prev => ({ ...prev, celebrationsEnabled: e.target.checked }))}
              />
              <span>Enable celebration system</span>
            </label>

            {formData.celebrationsEnabled !== false && (
              <>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: '600',
                    fontSize: '1rem'
                  }}>
                    Birthday Display Mode
                  </label>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="birthdayDisplayMode"
                        value="both"
                        checked={formData.birthdayDisplayMode === 'both' || !formData.birthdayDisplayMode}
                        onChange={(e) => setFormData(prev => ({ ...prev, birthdayDisplayMode: e.target.value as 'photo' | 'name' | 'both' }))}
                      />
                      Photo & Name
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="birthdayDisplayMode"
                        value="photo"
                        checked={formData.birthdayDisplayMode === 'photo'}
                        onChange={(e) => setFormData(prev => ({ ...prev, birthdayDisplayMode: e.target.value as 'photo' | 'name' | 'both' }))}
                      />
                      Photo Only
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="birthdayDisplayMode"
                        value="name"
                        checked={formData.birthdayDisplayMode === 'name'}
                        onChange={(e) => setFormData(prev => ({ ...prev, birthdayDisplayMode: e.target.value as 'photo' | 'name' | 'both' }))}
                      />
                      Name Only
                    </label>
                  </div>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: '600',
                    fontSize: '1rem'
                  }}>
                    Weekend Birthday Handling
                  </label>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="weekendBirthdayHandling"
                        value="friday"
                        checked={formData.weekendBirthdayHandling === 'friday' || !formData.weekendBirthdayHandling}
                        onChange={(e) => setFormData(prev => ({ ...prev, weekendBirthdayHandling: e.target.value as 'friday' | 'monday' | 'exact' }))}
                      />
                      Celebrate Friday
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="weekendBirthdayHandling"
                        value="monday"
                        checked={formData.weekendBirthdayHandling === 'monday'}
                        onChange={(e) => setFormData(prev => ({ ...prev, weekendBirthdayHandling: e.target.value as 'friday' | 'monday' | 'exact' }))}
                      />
                      Celebrate Monday
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="weekendBirthdayHandling"
                        value="exact"
                        checked={formData.weekendBirthdayHandling === 'exact'}
                        onChange={(e) => setFormData(prev => ({ ...prev, weekendBirthdayHandling: e.target.value as 'friday' | 'monday' | 'exact' }))}
                      />
                      Exact Date
                    </label>
                  </div>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: '600',
                    fontSize: '1rem'
                  }}>
                    Animation Level
                  </label>
                  <select
                    value={formData.celebrationAnimationLevel || 'full'}
                    onChange={(e) => setFormData(prev => ({ ...prev, celebrationAnimationLevel: e.target.value as 'full' | 'minimal' | 'none' }))}
                    style={{
                      width: '200px',
                      padding: '0.5rem',
                      borderRadius: '8px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      background: 'rgba(255,255,255,0.1)',
                      color: 'white',
                      fontSize: '1rem'
                    }}
                  >
                    <option value="full" style={{ background: '#667eea', color: 'white' }}>Full Animations</option>
                    <option value="minimal" style={{ background: '#667eea', color: 'white' }}>Minimal Effects</option>
                    <option value="none" style={{ background: '#667eea', color: 'white' }}>No Animations</option>
                  </select>
                </div>

                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={formData.enableBirthdayNotifications !== false}
                    onChange={(e) => setFormData(prev => ({ ...prev, enableBirthdayNotifications: e.target.checked }))}
                  />
                  <span>Enable birthday notifications</span>
                </label>
              </>
            )}
          </div>

          {/* Custom Celebrations Management */}
          <div style={{ marginTop: '1.5rem' }}>
            <h4 style={{
              fontSize: '1.2rem',
              fontWeight: '600',
              marginBottom: '1rem',
              color: 'white'
            }}>
              Custom Celebrations ({(formData.customCelebrations || []).length})
            </h4>
            
            {formData.customCelebrations && formData.customCelebrations.length > 0 ? (
              <div style={{
                display: 'grid',
                gap: '0.75rem',
                marginBottom: '1rem'
              }}>
                {formData.customCelebrations.map((celebration, index) => (
                  <div
                    key={celebration.id || index}
                    style={{
                      background: 'rgba(255,255,255,0.15)',
                      borderRadius: '8px',
                      padding: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ fontSize: '1.5rem' }}>{celebration.emoji}</span>
                      <div>
                        <div style={{ fontWeight: '600', color: 'white', fontSize: '1rem' }}>
                          {celebration.title}
                        </div>
                        <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
                          {celebration.isRecurring ? `Annual - ${celebration.date}` : `One-time - ${celebration.date}`}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const updatedCelebrations = formData.customCelebrations?.filter((_, i) => i !== index) || [];
                        setFormData(prev => ({ ...prev, customCelebrations: updatedCelebrations }));
                      }}
                      style={{
                        background: 'rgba(239, 68, 68, 0.3)',
                        border: '1px solid rgba(239, 68, 68, 0.5)',
                        borderRadius: '6px',
                        color: 'white',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.8rem',
                        cursor: 'pointer'
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                padding: '1rem',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '8px',
                textAlign: 'center',
                color: 'rgba(255,255,255,0.8)',
                fontSize: '0.9rem',
                marginBottom: '1rem'
              }}>
                No custom celebrations yet. Add them in the Daily Check-In celebration step.
              </div>
            )}
          </div>
        </div>

        {/* Behavior Categories */}
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <h3 style={{
            margin: '0 0 1rem 0',
            fontSize: '1.5rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            ⭐ Behavior Categories
          </h3>

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
            marginBottom: '1rem'
          }}>
            {formData.behaviorCategories.map(category => (
              <div key={category} style={{
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '8px',
                padding: '0.5rem 1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.9rem'
              }}>
                <span style={{ textTransform: 'capitalize' }}>{category}</span>
                <button
                  onClick={() => removeBehaviorCategory(category)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    padding: '0'
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={addBehaviorCategory}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: '2px solid rgba(255,255,255,0.3)',
              borderRadius: '8px',
              color: 'white',
              padding: '0.75rem 1rem',
              fontSize: '0.9rem',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            + Add Category
          </button>
        </div>

        {/* General Settings */}
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <h3 style={{
            margin: '0 0 1rem 0',
            fontSize: '1.5rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            ⚙️ General Settings
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={formData.enableAchievements}
                onChange={(e) => setFormData(prev => ({ ...prev, enableAchievements: e.target.checked }))}
              />
              <span>Enable achievement tracking</span>
            </label>

            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={formData.showThreeDayView}
                onChange={(e) => setFormData(prev => ({ ...prev, showThreeDayView: e.target.checked }))}
              />
              <span>Show three-day view (Yesterday/Today/Tomorrow)</span>
            </label>

            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={formData.morningRoutineAutoStart}
                onChange={(e) => setFormData(prev => ({ ...prev, morningRoutineAutoStart: e.target.checked }))}
              />
              <span>Auto-start morning routine on calendar open</span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '1rem'
        }}>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: '2px solid rgba(255,255,255,0.3)',
              borderRadius: '12px',
              color: 'white',
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              background: 'linear-gradient(145deg, #28a745, #20c997)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              cursor: 'pointer',
              fontWeight: '600',
              boxShadow: '0 4px 15px rgba(40, 167, 69, 0.3)'
            }}
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarSettingsComponent;
