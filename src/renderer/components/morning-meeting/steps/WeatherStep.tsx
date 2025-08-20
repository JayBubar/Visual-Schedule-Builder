import React, { useState, useEffect } from 'react';
import { MorningMeetingStepProps, WeatherStepData } from '../types/morningMeetingTypes';

interface WeatherData {
  temperature: number;
  temperatureUnit: string;
  condition: string;
  clothingRecommendations: string[];
  humidity?: number;
  description?: string;
}

const WeatherStep: React.FC<MorningMeetingStepProps> = ({
  currentDate,
  onNext,
  onBack,
  onDataUpdate,
  stepData,
  hubSettings
}) => {
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(
    stepData?.currentWeather || null
  );
  const [selectedClothing, setSelectedClothing] = useState<string[]>(
    stepData?.selectedClothing || []
  );
  const [showClothingSelection, setShowClothingSelection] = useState(false);
  const [showDiscussion, setShowDiscussion] = useState(false);

  // Get selected videos for this step
  const selectedVideos = hubSettings?.videos?.weatherClothing || [];

  // Get custom vocabulary from hub settings or use defaults
  const getSeasonalVocabulary = (): string[] => {
    // FIRST: Check Hub custom vocabulary
    if (hubSettings?.customVocabulary?.weather?.length > 0) {
      return hubSettings.customVocabulary.weather;
    }
    
    // SECOND: Check weather API custom vocabulary (legacy)
    if (hubSettings?.weatherAPI?.customVocabulary?.length > 0) {
      return hubSettings.weatherAPI.customVocabulary;
    }
    
    // THIRD: Use defaults
    return ['sunny', 'cloudy', 'rainy', 'snowy', 'windy', 'foggy'];
  };

  const customVocabulary = getSeasonalVocabulary();

  // Get season from current date
  const getSeason = (date: Date) => {
    const month = date.getMonth() + 1;
    if (month >= 3 && month <= 5) return { name: 'Spring', emoji: '🌸', color: '#10B981' };
    if (month >= 6 && month <= 8) return { name: 'Summer', emoji: '☀️', color: '#F59E0B' };
    if (month >= 9 && month <= 11) return { name: 'Fall', emoji: '🍂', color: '#EF4444' };
    return { name: 'Winter', emoji: '❄️', color: '#3B82F6' };
  };

  // Get clothing suggestions based on weather
  const getClothingSuggestions = (weather: WeatherData | null) => {
    if (!weather) {
      return [
        { item: 'jacket', emoji: '🧥', reason: 'Check the weather to decide!' },
        { item: 'shoes', emoji: '👟', reason: 'Good for any weather' },
        { item: 'clothes', emoji: '👕', reason: 'Dress appropriately for the day' }
      ];
    }

    const temp = weather.temperature;
    const condition = weather.condition.toLowerCase();
    const suggestions = [];

    // Temperature-based clothing
    if (temp >= 75) {
      suggestions.push(
        { item: 'shorts', emoji: '🩳', reason: 'It\'s warm outside!' },
        { item: 't-shirt', emoji: '👕', reason: 'Stay cool and comfortable' },
        { item: 'sandals', emoji: '👡', reason: 'Let your feet breathe' }
      );
    } else if (temp >= 60) {
      suggestions.push(
        { item: 'light jacket', emoji: '🧥', reason: 'Perfect for mild weather' },
        { item: 'long pants', emoji: '👖', reason: 'Comfortable for this temperature' },
        { item: 'sneakers', emoji: '👟', reason: 'Good for walking' }
      );
    } else if (temp >= 40) {
      suggestions.push(
        { item: 'warm jacket', emoji: '🧥', reason: 'Keep warm outside' },
        { item: 'long sleeves', emoji: '👔', reason: 'Cover your arms' },
        { item: 'closed shoes', emoji: '👞', reason: 'Keep your feet warm' }
      );
    } else {
      suggestions.push(
        { item: 'heavy coat', emoji: '🧥', reason: 'Stay very warm!' },
        { item: 'warm clothes', emoji: '🧣', reason: 'Layer up for cold weather' },
        { item: 'warm boots', emoji: '🥾', reason: 'Keep your feet warm and dry' }
      );
    }

    // Weather condition-based additions
    if (condition.includes('rain') || condition.includes('storm')) {
      suggestions.push(
        { item: 'umbrella', emoji: '☂️', reason: 'Stay dry in the rain!' },
        { item: 'rain boots', emoji: '👢', reason: 'Waterproof your feet' }
      );
    }

    if (condition.includes('snow')) {
      suggestions.push(
        { item: 'snow boots', emoji: '🥾', reason: 'Good grip in snow' },
        { item: 'warm hat', emoji: '🧢', reason: 'Keep your head warm' },
        { item: 'gloves', emoji: '🧤', reason: 'Protect your hands' }
      );
    }

    if (condition.includes('sun') && temp > 70) {
      suggestions.push(
        { item: 'sunglasses', emoji: '🕶️', reason: 'Protect your eyes from sun' },
        { item: 'hat', emoji: '👒', reason: 'Shade your face' }
      );
    }

    return suggestions.slice(0, 4); // Limit to top 4 suggestions
  };

  // Generate discussion questions
  const getDiscussionQuestions = (weather: WeatherData | null) => {
    if (!weather) return ['What do you think the weather is like today?'];
    
    const questions = [
      `It's ${weather.temperature}°${weather.temperatureUnit} and ${weather.condition.toLowerCase()}. How does that make you feel?`,
      'What activities would be fun to do in this weather?'
    ];

    if (weather.temperature > 80) {
      questions.push('What do we do to stay cool when it\'s this hot?');
    } else if (weather.temperature < 40) {
      questions.push('How do we keep warm when it\'s this cold?');
    }

    if (weather.condition.toLowerCase().includes('rain')) {
      questions.push('What do we need when it rains?', 'What sounds do we hear when it rains?');
    }

    if (weather.condition.toLowerCase().includes('sunny')) {
      questions.push('What do we wear to protect ourselves from the sun?');
    }

    return questions;
  };

  // Mock weather data if API not available
  const generateMockWeather = (): WeatherData => {
    const season = getSeason(currentDate);
    const conditions = customVocabulary;
    const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
    
    let baseTemp = 70;
    if (season.name === 'Winter') baseTemp = 35;
    else if (season.name === 'Fall') baseTemp = 55;
    else if (season.name === 'Spring') baseTemp = 65;
    else if (season.name === 'Summer') baseTemp = 80;
    
    const variance = Math.floor(Math.random() * 20) - 10;
    const temperature = Math.max(15, baseTemp + variance);

    return {
      temperature,
      temperatureUnit: 'F',
      condition: randomCondition.charAt(0).toUpperCase() + randomCondition.slice(1),
      clothingRecommendations: [], // Add empty array, will be populated by getClothingSuggestions
      description: `${randomCondition} weather for ${season.name.toLowerCase()}`
    };
  };

  // Initialize weather data
  useEffect(() => {
    if (!currentWeather) {
      // Check if API is enabled and has key
      if (hubSettings?.weatherAPI?.enabled && hubSettings?.weatherAPI?.apiKey) {
        // TODO: Implement actual API call
        // For now, use mock data
        setCurrentWeather(generateMockWeather());
      } else {
        // Use mock weather data
        setCurrentWeather(generateMockWeather());
      }
    }
  }, [hubSettings, currentWeather]);

  // Save step data whenever state changes
  useEffect(() => {
    if (currentWeather) {
      const stepData: WeatherStepData = {
        currentWeather,
        selectedClothing,
        customVocabulary,
        completedAt: showDiscussion ? new Date() : undefined
      };
      onDataUpdate(stepData);
    }
  }, [currentWeather, selectedClothing, showDiscussion, customVocabulary, onDataUpdate]);

  const season = getSeason(currentDate);
  const clothingSuggestions = getClothingSuggestions(currentWeather);
  const discussionQuestions = getDiscussionQuestions(currentWeather);

  return (
    <div style={{
      height: '100%',
      background: `linear-gradient(135deg, ${season.color}20 0%, ${season.color}40 100%)`,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* VIDEO SECTION - Only show if videos are selected */}
      {selectedVideos.length > 0 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          marginBottom: '1.5rem',
          flexShrink: 0,
          padding: '1rem'
        }}>
          {selectedVideos.map((video, index) => (
            <button
              key={index}
              onClick={() => window.open(video.url, `weather-video-${index}`, 'width=800,height=600,scrollbars=yes,resizable=yes')}
              style={{
                background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
                color: 'white',
                border: '2px solid rgba(255,255,255,0.3)',
                borderRadius: '12px',
                padding: 'clamp(0.75rem, 1.5vh, 1rem) clamp(1.5rem, 3vw, 2rem)',
                fontSize: 'clamp(1rem, 2vw, 1.2rem)',
                fontWeight: '600',
                cursor: 'pointer',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 4px 20px rgba(52, 152, 219, 0.3)',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                minWidth: 'clamp(160px, 20vw, 220px)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
                e.currentTarget.style.boxShadow = '0 6px 25px rgba(52, 152, 219, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(52, 152, 219, 0.3)';
              }}
              title={`Play: ${video.name || `Weather Video ${index + 1}`}`}
            >
              <span style={{ fontSize: '1.3em' }}>🎬</span>
              <span>Play Weather Video {selectedVideos.length > 1 ? ` ${index + 1}` : ''}</span>
            </button>
          ))}
        </div>
      )}

      {/* Header */}
      <div style={{
        padding: '1.5rem 2rem 1rem 2rem',
        textAlign: 'center'
      }}>
        <h2 style={{
          fontSize: '2.5rem',
          fontWeight: '700',
          color: 'white',
          marginBottom: '0.5rem',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>
          🌤️ Weather & Clothing
        </h2>
        <p style={{
          fontSize: '1.1rem',
          color: 'rgba(255,255,255,0.9)',
          marginBottom: '0.5rem'
        }}>
          {season.emoji} {season.name} Weather Check
        </p>
        <p style={{
          fontSize: '0.9rem',
          color: 'rgba(255,255,255,0.8)'
        }}>
          What should we wear today?
        </p>
      </div>

      {/* Content Area */}
      <div style={{ flex: 1, padding: '0 2rem', overflow: 'auto' }}>
        {/* Weather Display */}
        {currentWeather && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.15)',
            borderRadius: '20px',
            padding: '2rem',
            marginBottom: '2rem',
            textAlign: 'center',
            backdropFilter: 'blur(10px)',
            border: '2px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{
              fontSize: '3rem',
              marginBottom: '1rem'
            }}>
              {getWeatherEmoji(currentWeather.condition)}
            </div>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: 'white',
              marginBottom: '0.5rem'
            }}>
              {currentWeather.temperature}°{currentWeather.temperatureUnit}
            </h3>
            <p style={{
              fontSize: '1.2rem',
              color: 'rgba(255,255,255,0.9)',
              marginBottom: '1rem'
            }}>
              {currentWeather.condition}
            </p>
            <p style={{
              fontSize: '0.9rem',
              color: 'rgba(255,255,255,0.8)'
            }}>
              {currentWeather.description}
            </p>
          </div>
        )}

        {/* Clothing Suggestions */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          padding: '2rem',
          marginBottom: '2rem',
          backdropFilter: 'blur(10px)',
          border: '2px solid rgba(255, 255, 255, 0.2)'
        }}>
          <h3 style={{
            fontSize: '1.3rem',
            fontWeight: '600',
            color: 'white',
            marginBottom: '1.5rem',
            textAlign: 'center'
          }}>
            👗 What Should We Wear?
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem'
          }}>
            {clothingSuggestions.map((suggestion, index) => (
              <div
                key={index}
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  borderRadius: '12px',
                  padding: '1rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: selectedClothing.includes(suggestion.item) 
                    ? '2px solid rgba(255, 255, 255, 0.6)' 
                    : '2px solid transparent'
                }}
                onClick={() => {
                  setSelectedClothing(prev => 
                    prev.includes(suggestion.item)
                      ? prev.filter(item => item !== suggestion.item)
                      : [...prev, suggestion.item]
                  );
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                  {suggestion.emoji}
                </div>
                <div style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: 'white',
                  marginBottom: '0.5rem'
                }}>
                  {suggestion.item}
                </div>
                <div style={{
                  fontSize: '0.8rem',
                  color: 'rgba(255,255,255,0.8)'
                }}>
                  {suggestion.reason}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Discussion Section */}
        {showClothingSelection && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            padding: '2rem',
            marginBottom: '2rem',
            backdropFilter: 'blur(10px)',
            border: '2px solid rgba(255, 255, 255, 0.2)'
          }}>
            <h3 style={{
              fontSize: '1.3rem',
              fontWeight: '600',
              color: 'white',
              marginBottom: '1.5rem',
              textAlign: 'center'
            }}>
              💭 Let's Talk About Weather
            </h3>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              {discussionQuestions.map((question, index) => (
                <div
                  key={index}
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    borderRadius: '12px',
                    padding: '1rem',
                    color: 'white',
                    fontSize: '1rem'
                  }}
                >
                  <strong>Question {index + 1}:</strong> {question}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div style={{
        padding: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0
      }}>
        {!showClothingSelection ? (
          <button
            onClick={() => setShowClothingSelection(true)}
            style={{
              background: 'rgba(34, 197, 94, 0.8)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              padding: '1rem 2rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s ease'
            }}
          >
            Choose Clothing →
          </button>
        ) : !showDiscussion ? (
          <button
            onClick={() => setShowDiscussion(true)}
            style={{
              background: 'rgba(34, 197, 94, 0.8)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              padding: '1rem 2rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s ease'
            }}
          >
            Discuss Weather →
          </button>
        ) : (
          <button
            onClick={onNext}
            style={{
              background: 'rgba(34, 197, 94, 0.8)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              padding: '1rem 2rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s ease'
            }}
          >
            Continue to Seasonal Learning →
          </button>
        )}

        {/* Always visible navigation buttons */}
        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '1rem',
          zIndex: 1000,
          background: 'rgba(0, 0, 0, 0.8)',
          borderRadius: '20px',
          padding: '1rem 2rem',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
        }}>
          <button
            onClick={onBack}
            style={{
              background: 'rgba(156, 163, 175, 0.8)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              padding: '1rem 2rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            ← Back
          </button>
          
          <button
            onClick={onNext}
            style={{
              background: 'rgba(34, 197, 94, 0.8)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              padding: '1rem 2rem',
              fontSize: '1rem',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(34, 197, 94, 1)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(34, 197, 94, 0.8)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            Weather Complete! →
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper function to get weather emoji
const getWeatherEmoji = (condition: string): string => {
  const cond = condition.toLowerCase();
  if (cond.includes('sun')) return '☀️';
  if (cond.includes('rain')) return '🌧️';
  if (cond.includes('snow')) return '❄️';
  if (cond.includes('cloud')) return '☁️';
  if (cond.includes('wind')) return '💨';
  if (cond.includes('fog')) return '🌫️';
  if (cond.includes('storm')) return '⛈️';
  return '🌤️';
};

export default WeatherStep;