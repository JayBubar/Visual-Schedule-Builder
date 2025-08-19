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
        { item: 't-shirt', emoji: '👕', reason: 'Light clothes for hot weather' },
        { item: 'sandals', emoji: '👡', reason: 'Keep your feet cool' },
        { item: 'sunglasses', emoji: '🕶️', reason: 'Protect your eyes from sun' },
        { item: 'hat', emoji: '🧢', reason: 'Shade from the sun' }
      );
    } else if (temp >= 60) {
      suggestions.push(
        { item: 'jeans', emoji: '👖', reason: 'Good for mild weather' },
        { item: 'light jacket', emoji: '🧥', reason: 'In case it gets cool' },
        { item: 'sneakers', emoji: '👟', reason: 'Comfortable for walking' },
        { item: 'long sleeves', emoji: '👔', reason: 'Perfect for this temperature' }
      );
    } else if (temp >= 40) {
      suggestions.push(
        { item: 'sweater', emoji: '🧶', reason: 'Stay warm and cozy' },
        { item: 'jacket', emoji: '🧥', reason: 'Protection from cold air' },
        { item: 'boots', emoji: '👢', reason: 'Keep feet warm and dry' },
        { item: 'scarf', emoji: '🧣', reason: 'Extra warmth for your neck' }
      );
    } else {
      suggestions.push(
        { item: 'winter coat', emoji: '🧥', reason: 'Very cold outside!' },
        { item: 'gloves', emoji: '🧤', reason: 'Keep hands warm' },
        { item: 'winter hat', emoji: '🧢', reason: 'Protect your head from cold' },
        { item: 'warm boots', emoji: '👢', reason: 'Essential for cold weather' },
        { item: 'thermal clothes', emoji: '👕', reason: 'Extra layers for warmth' }
      );
    }

    // Condition-based clothing
    if (condition.includes('rain') || condition.includes('storm')) {
      suggestions.push(
        { item: 'raincoat', emoji: '🧥', reason: 'Stay dry in the rain!' },
        { item: 'umbrella', emoji: '☂️', reason: 'Keep the rain off you' },
        { item: 'rain boots', emoji: '👢', reason: 'Waterproof feet' }
      );
    }

    if (condition.includes('snow')) {
      suggestions.push(
        { item: 'snow boots', emoji: '👢', reason: 'Walk safely in snow' },
        { item: 'warm hat', emoji: '🧢', reason: 'Keep head warm in snow' },
        { item: 'snow gloves', emoji: '🧤', reason: 'Protect hands from snow' }
      );
    }

    if (condition.includes('wind')) {
      suggestions.push(
        { item: 'windbreaker', emoji: '🧥', reason: 'Block the wind' },
        { item: 'secure hat', emoji: '🧢', reason: 'Won\'t blow away in wind' }
      );
    }

    return suggestions;
  };

  // Get discussion questions based on weather
  const getWeatherQuestions = (weather: WeatherData | null) => {
    if (!weather) {
      return [
        'What do you think the weather is like today?',
        'How should we dress for today?',
        'What season do you think it is?'
      ];
    }

    const temp = weather.temperature;
    const questions = [];

    questions.push(
      `It's ${temp}°${weather.temperatureUnit} today. Is that hot, warm, cool, or cold?`,
      `The weather is ${weather.condition.toLowerCase()}. What should we wear?`,
      `Look outside! Does the weather match what we're seeing here?`,
      'How does this weather make you feel?'
    );

    if (temp > 80) {
      questions.push('What do we do to stay cool when it\'s this hot?');
    } else if (temp < 40) {
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
  }, [currentWeather, selectedClothing, customVocabulary, showDiscussion]);

  const handleClothingSelect = (item: string) => {
    if (selectedClothing.includes(item)) {
      setSelectedClothing(prev => prev.filter(c => c !== item));
    } else {
      setSelectedClothing(prev => [...prev, item]);
    }
  };

  const handleShowClothing = () => {
    setShowClothingSelection(true);
  };

  const handleShowDiscussion = () => {
    setShowDiscussion(true);
  };

  const handleNext = () => {
    onNext();
  };

  const season = getSeason(currentDate);
  const clothingSuggestions = getClothingSuggestions(currentWeather);
  const discussionQuestions = getWeatherQuestions(currentWeather);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!currentWeather) {
    return (
      <div style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌤️</div>
          <div style={{ fontSize: '1.5rem' }}>Loading weather...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      height: '100%',
      width: '100%',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white'
    }}>
      {/* Video Section */}
      {hubSettings?.videos?.weatherClothing && hubSettings.videos.weatherClothing.length > 0 && (
        <div style={{
          padding: '1rem 2rem',
          background: 'rgba(255, 255, 255, 0.1)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <span style={{ fontWeight: '600', fontSize: '1rem' }}>🎬 Videos:</span>
          {hubSettings.videos.weatherClothing.map((video, index) => (
            <button
              key={index}
              onClick={() => window.open(video.url, `weather-video-${index}`, 'width=800,height=600')}
              style={{
                background: 'rgba(34, 197, 94, 0.8)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                padding: '0.5rem 1rem',
                fontSize: '0.9rem',
                fontWeight: '600',
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
              Play Weather Video {index + 1}
            </button>
          ))}
        </div>
      )}

      {/* Header */}
      <div style={{
        padding: '2rem 2rem 1rem 2rem',
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
          fontSize: '1.2rem',
          color: 'rgba(255,255,255,0.9)',
          marginBottom: '0.5rem'
        }}>
          {formatDate(currentDate)}
        </p>
        <p style={{
          fontSize: '1rem',
          color: 'rgba(255,255,255,0.8)'
        }}>
          What's the weather like? What should we wear?
        </p>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '1rem 2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        {/* Weather Display */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '20px',
          padding: '2rem',
          backdropFilter: 'blur(10px)',
          textAlign: 'center',
          marginBottom: '2rem',
          maxWidth: '600px',
          width: '100%'
        }}>
          <div style={{
            fontSize: '4rem',
            marginBottom: '1rem'
          }}>
            {currentWeather.condition.toLowerCase().includes('sunny') ? '☀️' :
             currentWeather.condition.toLowerCase().includes('cloudy') ? '☁️' :
             currentWeather.condition.toLowerCase().includes('rain') ? '🌧️' :
             currentWeather.condition.toLowerCase().includes('snow') ? '❄️' :
             currentWeather.condition.toLowerCase().includes('windy') ? '💨' : '🌤️'}
          </div>
          <div style={{
            fontSize: '3rem',
            fontWeight: '700',
            marginBottom: '0.5rem'
          }}>
            {currentWeather.temperature}°{currentWeather.temperatureUnit}
          </div>
          <div style={{
            fontSize: '1.5rem',
            marginBottom: '1rem',
            textTransform: 'capitalize'
          }}>
            {currentWeather.condition}
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '1rem',
            fontSize: '1.2rem',
            marginBottom: '1rem'
          }}>
            <span>{season.emoji}</span>
            <span>{season.name}</span>
          </div>
        </div>

        {/* Temperature Categories */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
          maxWidth: '600px',
          width: '100%'
        }}>
          <div style={{
            background: currentWeather.temperature >= 75 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255,255,255,0.1)',
            borderRadius: '12px',
            padding: '1rem',
            textAlign: 'center',
            border: currentWeather.temperature >= 75 ? '2px solid #EF4444' : '2px solid rgba(255,255,255,0.2)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔥</div>
            <p style={{ margin: 0, fontWeight: 'bold', fontSize: '0.9rem' }}>Hot</p>
            <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.8 }}>75°F+</p>
          </div>

          <div style={{
            background: (currentWeather.temperature >= 60 && currentWeather.temperature < 75) ? 'rgba(251, 191, 36, 0.3)' : 'rgba(255,255,255,0.1)',
            borderRadius: '12px',
            padding: '1rem',
            textAlign: 'center',
            border: (currentWeather.temperature >= 60 && currentWeather.temperature < 75) ? '2px solid #FBD024' : '2px solid rgba(255,255,255,0.2)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>☀️</div>
            <p style={{ margin: 0, fontWeight: 'bold', fontSize: '0.9rem' }}>Warm</p>
            <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.8 }}>60-74°F</p>
          </div>

          <div style={{
            background: (currentWeather.temperature >= 40 && currentWeather.temperature < 60) ? 'rgba(34, 197, 94, 0.3)' : 'rgba(255,255,255,0.1)',
            borderRadius: '12px',
            padding: '1rem',
            textAlign: 'center',
            border: (currentWeather.temperature >= 40 && currentWeather.temperature < 60) ? '2px solid #22C55E' : '2px solid rgba(255,255,255,0.2)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🍃</div>
            <p style={{ margin: 0, fontWeight: 'bold', fontSize: '0.9rem' }}>Cool</p>
            <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.8 }}>40-59°F</p>
          </div>

          <div style={{
            background: currentWeather.temperature < 40 ? 'rgba(59, 130, 246, 0.3)' : 'rgba(255,255,255,0.1)',
            borderRadius: '12px',
            padding: '1rem',
            textAlign: 'center',
            border: currentWeather.temperature < 40 ? '2px solid #3B82F6' : '2px solid rgba(255,255,255,0.2)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>❄️</div>
            <p style={{ margin: 0, fontWeight: 'bold', fontSize: '0.9rem' }}>Cold</p>
            <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.8 }}>Below 40°F</p>
          </div>
        </div>

        {/* Weather Learning */}
        <div style={{
          padding: '1rem',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '12px',
          fontSize: '1.2rem',
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: '2rem',
          maxWidth: '600px'
        }}>
          Today is {currentWeather.temperature}°{currentWeather.temperatureUnit} - That's{' '}
          {currentWeather.temperature >= 75 ? 'HOT! 🔥' :
           currentWeather.temperature >= 60 ? 'WARM! ☀️' :
           currentWeather.temperature >= 40 ? 'COOL! 🍃' : 'COLD! ❄️'}
        </div>

        {/* Clothing Suggestions */}
        {(showClothingSelection || selectedClothing.length > 0) && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.15)',
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '2rem',
            maxWidth: '800px',
            width: '100%'
          }}>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              marginBottom: '1rem',
              textAlign: 'center'
            }}>
              👕 What Should We Wear?
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem'
            }}>
              {clothingSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  onClick={() => handleClothingSelect(suggestion.item)}
                  style={{
                    background: selectedClothing.includes(suggestion.item)
                      ? 'rgba(34, 197, 94, 0.8)'
                      : 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '12px',
                    padding: '1rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    border: selectedClothing.includes(suggestion.item) ? '2px solid white' : 'none'
                  }}
                >
                  <div style={{
                    fontSize: '2rem',
                    marginBottom: '0.5rem',
                    textAlign: 'center'
                  }}>
                    {suggestion.emoji}
                  </div>
                  <div style={{
                    fontWeight: '600',
                    fontSize: '1rem',
                    marginBottom: '0.25rem',
                    textAlign: 'center',
                    textTransform: 'capitalize'
                  }}>
                    {suggestion.item}
                  </div>
                  <div style={{
                    fontSize: '0.8rem',
                    opacity: 0.9,
                    textAlign: 'center',
                    lineHeight: '1.3'
                  }}>
                    {suggestion.reason}
                  </div>
                  {selectedClothing.includes(suggestion.item) && (
                    <div style={{
                      textAlign: 'center',
                      marginTop: '0.5rem',
                      fontSize: '0.8rem',
                      fontWeight: 'bold'
                    }}>
                      ✓ Selected!
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Discussion Questions */}
        {showDiscussion && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.15)',
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '2rem',
            maxWidth: '800px',
            width: '100%'
          }}>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              marginBottom: '1rem',
              textAlign: 'center'
            }}>
              💬 Let's Talk About Weather
            </h3>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              {discussionQuestions.map((question, index) => (
                <div
                  key={index}
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    fontSize: '1rem',
                    lineHeight: '1.4'
                  }}
                >
                  <strong>Q{index + 1}:</strong> {question}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div style={{
        padding: '1rem 2rem 2rem 2rem',
        display: 'flex',
        justifyContent: 'center',
        gap: '1rem',
        flexWrap: 'wrap'
      }}>
        {!showClothingSelection && (
          <button
            onClick={handleShowClothing}
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
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(34, 197, 94, 1)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(34, 197, 94, 0.8)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            What Should We Wear? 👕
          </button>
        )}

        {showClothingSelection && !showDiscussion && (
          <button
            onClick={handleShowDiscussion}
            style={{
              background: 'rgba(59, 130, 246, 0.8)',
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
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(59, 130, 246, 1)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(59, 130, 246, 0.8)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            Let's Talk About Weather 💬
          </button>
        )}

        {showDiscussion && (
          <button
            onClick={handleNext}
            style={{
              background: 'rgba(34, 197, 94, 0.8)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              padding: '1rem 3rem',
              fontSize: '1.1rem',
              fontWeight: '700',
              cursor: 'pointer',
              backdropFilter: 'blur(10px)',
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
            Weather Complete! Continue →
          </button>
        )}
      </div>
    </div>
  );
};

export default WeatherStep;
