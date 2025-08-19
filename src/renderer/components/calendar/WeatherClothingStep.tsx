// 🎯 NEW COMPONENT: WeatherClothingStep.tsx
// Location: src/renderer/components/calendar/WeatherClothingStep.tsx

import React, { useState, useEffect } from 'react';
import WeatherWidget from './WeatherWidget';
import { CalendarSettings, WeatherData } from '../../types';

interface WeatherClothingStepProps {
  onNext: () => void;
  onBack: () => void;
  currentDate?: Date; // Make optional
  calendarSettings?: CalendarSettings | null; // Make optional
  onWeatherUpdate?: (weather: WeatherData) => void; // Make optional
  selectedVideos?: string[]; // NEW: Video integration from Hub
  selectedVideo?: {
    id: string;
    title: string;
    videoData: {
      url: string;
      title: string;
      description: string;
    };
  } | null;
}

const WeatherClothingStep: React.FC<WeatherClothingStepProps> = ({ 
  currentDate = new Date(), // Default to current date
  calendarSettings = null, // Default to null
  onWeatherUpdate = () => {}, // Default to no-op function
  onNext, 
  onBack,
  selectedVideos,
  selectedVideo
}) => {
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [selectedClothing, setSelectedClothing] = useState<string[]>([]);
  const [showClothingDiscussion, setShowClothingDiscussion] = useState(false);

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
    if (!weather) return [];

    const temp = weather.temperature;
    const condition = weather.condition.toLowerCase();
    const suggestions = [];

    // Temperature-based clothing
    if (temp >= 75) {
      suggestions.push(
        { item: 'shorts', emoji: '🩳', reason: 'It\'s warm outside!' },
        { item: 't-shirt', emoji: '👕', reason: 'Light clothes for hot weather' },
        { item: 'sandals', emoji: '👡', reason: 'Keep your feet cool' },
        { item: 'sunglasses', emoji: '🕶️', reason: 'Protect your eyes from sun' }
      );
    } else if (temp >= 60) {
      suggestions.push(
        { item: 'jeans', emoji: '👖', reason: 'Good for mild weather' },
        { item: 'light jacket', emoji: '🧥', reason: 'In case it gets cool' },
        { item: 'sneakers', emoji: '👟', reason: 'Comfortable for walking' }
      );
    } else if (temp >= 40) {
      suggestions.push(
        { item: 'sweater', emoji: '🧶', reason: 'Stay warm and cozy' },
        { item: 'jacket', emoji: '🧥', reason: 'Protection from cold air' },
        { item: 'boots', emoji: '👢', reason: 'Keep feet warm and dry' }
      );
    } else {
      suggestions.push(
        { item: 'winter coat', emoji: '🧥', reason: 'Very cold outside!' },
        { item: 'gloves', emoji: '🧤', reason: 'Keep hands warm' },
        { item: 'winter hat', emoji: '🧢', reason: 'Protect your head from cold' },
        { item: 'warm boots', emoji: '👢', reason: 'Essential for cold weather' }
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
        { item: 'warm hat', emoji: '🧢', reason: 'Keep head warm in snow' }
      );
    }

    if (condition.includes('wind')) {
      suggestions.push(
        { item: 'windbreaker', emoji: '🧥', reason: 'Block the wind' }
      );
    }

    return suggestions;
  };

  // Get discussion questions based on weather
  const getWeatherQuestions = (weather: WeatherData | null) => {
    if (!weather) return [];

    const temp = weather.temperature;
    const questions = [];

    questions.push(
      `It's ${temp}°${weather.temperatureUnit} today. Is that hot or cold?`,
      `What should we wear when it's ${weather.condition.toLowerCase()}?`,
      `Look outside! Does the weather match what we're seeing on screen?`
    );

    if (temp > 80) {
      questions.push('What do we do to stay cool when it\'s this hot?');
    } else if (temp < 40) {
      questions.push('How do we keep warm when it\'s this cold?');
    }

    if (weather.condition.toLowerCase().includes('rain')) {
      questions.push('What do we need when it rains?');
    }

    if (weather.condition.toLowerCase().includes('sunny')) {
      questions.push('What do we wear to protect ourselves from the sun?');
    }

    return questions;
  };

  const season = getSeason(currentDate);
  const clothingSuggestions = getClothingSuggestions(currentWeather);
  const discussionQuestions = getWeatherQuestions(currentWeather);

  const handleWeatherUpdate = (weather: WeatherData) => {
    setCurrentWeather(weather);
    onWeatherUpdate(weather);
    // Manual advancement - user must click to show clothing discussion
  };

  const handleClothingSelect = (item: string) => {
    if (selectedClothing.includes(item)) {
      setSelectedClothing(selectedClothing.filter(c => c !== item));
    } else {
      setSelectedClothing([...selectedClothing, item]);
    }
  };

  return (
    <div style={{
      height: `${window.innerHeight - 140}px`,
      width: '100%',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white'
    }}>
      {/* Video Section - ADD THIS if selectedVideos prop exists */}
      {selectedVideos && selectedVideos.length > 0 && (
        <div style={{
          padding: '1rem 2rem',
          background: 'rgba(255, 255, 255, 0.1)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <span style={{ fontWeight: '600', fontSize: '1rem' }}>📹 Videos:</span>
          {selectedVideos.map((video, index) => (
            <button
              key={index}
              onClick={() => window.open(video, `video-${index}`, 'width=800,height=600')}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                color: 'white',
                padding: '0.5rem 1rem',
                fontSize: '0.9rem',
                cursor: 'pointer',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              ▶️ Play Video {index + 1}
            </button>
          ))}
        </div>
      )}

      {/* KEEP EXISTING COMPONENT CONTENT HERE - just wrap in proper container */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column'
      }}>
      {/* Video Button - if selectedVideo exists */}
      {selectedVideo && (
        <div style={{
          position: 'fixed',
          top: '1rem',
          right: '1rem',
          zIndex: 1000
        }}>
          <button
            onClick={() => window.open(selectedVideo.videoData.url, '_blank')}
            style={{
              background: 'rgba(33, 150, 243, 0.8)',
              border: '2px solid rgba(33, 150, 243, 1)',
              borderRadius: '12px',
              color: 'white',
              padding: '1rem 2rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(33, 150, 243, 1)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(33, 150, 243, 0.8)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            🎥 Play Video
          </button>
        </div>
      )}
      
      {/* Header */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: 'clamp(1rem, 2vh, 2rem)',
        flexShrink: 0
      }}>
        <h2 style={{
          fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
          fontWeight: '700',
          color: 'white',
          marginBottom: '0.5rem',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>
          🌤️ Weather & Clothing
        </h2>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}>
        {/* Weather Widget */}
        <div style={{ flexShrink: 0 }}>
          <WeatherWidget
            settings={calendarSettings}
            onWeatherUpdate={handleWeatherUpdate}
            showDiscussionPrompts={true}
            size="large"
          />
        </div>

        {/* Seasonal Context */}
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '16px',
          padding: '1.5rem',
          border: '2px solid rgba(255,255,255,0.2)',
          textAlign: 'center',
          flexShrink: 0
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{season.emoji}</div>
          <h3 style={{ 
            fontSize: 'clamp(1.2rem, 3vw, 1.8rem)', 
            margin: '0 0 0.5rem 0',
            color: season.color 
          }}>
            {season.name} Weather
          </h3>
          <p style={{ 
            fontSize: 'clamp(1rem, 2vw, 1.2rem)', 
            margin: 0, 
            opacity: 0.9 
          }}>
            This is typical {season.name.toLowerCase()} weather for our area
          </p>
        </div>

        {/* Show Clothing Discussion Button */}
        {currentWeather && !showClothingDiscussion && (
          <div style={{
            textAlign: 'center',
            flexShrink: 0
          }}>
            <button
              onClick={() => setShowClothingDiscussion(true)}
              style={{
                background: 'rgba(34, 197, 94, 0.8)',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                padding: '1rem 2rem',
                fontSize: 'clamp(1rem, 2.2vw, 1.2rem)',
                fontWeight: '700',
                cursor: 'pointer',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease'
              }}
            >
              👕 What Should We Wear Today?
            </button>
          </div>
        )}

        {/* Clothing Discussion */}
        {showClothingDiscussion && clothingSuggestions.length > 0 && (
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '2px solid rgba(255,255,255,0.2)',
            flexShrink: 0
          }}>
            <h3 style={{ 
              fontSize: 'clamp(1.2rem, 3vw, 1.8rem)', 
              margin: '0 0 1rem 0',
              textAlign: 'center'
            }}>
              👕 What Should We Wear?
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginBottom: '1.5rem'
            }}>
              {clothingSuggestions.slice(0, 6).map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleClothingSelect(suggestion.item)}
                  style={{
                    background: selectedClothing.includes(suggestion.item)
                      ? 'rgba(34, 197, 94, 0.3)'
                      : 'rgba(255,255,255,0.1)',
                    border: selectedClothing.includes(suggestion.item)
                      ? '2px solid #22C55E'
                      : '2px solid rgba(255,255,255,0.3)',
                    borderRadius: '12px',
                    padding: '1rem',
                    color: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    textAlign: 'center'
                  }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                    {suggestion.emoji}
                  </div>
                  <h4 style={{ 
                    fontSize: 'clamp(1rem, 2vw, 1.2rem)', 
                    margin: '0 0 0.5rem 0',
                    textTransform: 'capitalize'
                  }}>
                    {suggestion.item}
                  </h4>
                  <p style={{ 
                    fontSize: 'clamp(0.8rem, 1.5vw, 1rem)', 
                    margin: 0, 
                    opacity: 0.8 
                  }}>
                    {suggestion.reason}
                  </p>
                </button>
              ))}
            </div>

            {/* Discussion Questions */}
            {discussionQuestions.length > 0 && (
              <div style={{
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '1rem',
                border: '1px solid rgba(255,255,255,0.2)'
              }}>
                <h4 style={{ 
                  fontSize: 'clamp(1rem, 2vw, 1.3rem)', 
                  margin: '0 0 1rem 0',
                  textAlign: 'center'
                }}>
                  🗣️ Let's Talk About It!
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {discussionQuestions.slice(0, 3).map((question, index) => (
                    <p 
                      key={index}
                      style={{ 
                        fontSize: 'clamp(0.9rem, 2vw, 1.1rem)', 
                        margin: 0, 
                        padding: '0.5rem',
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        borderLeft: '4px solid #22C55E'
                      }}
                    >
                      • {question}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Temperature Learning */}
        {currentWeather && (
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '2px solid rgba(255,255,255,0.2)',
            textAlign: 'center',
            flexShrink: 0
          }}>
            <h3 style={{ 
              fontSize: 'clamp(1.2rem, 3vw, 1.8rem)', 
              margin: '0 0 1rem 0'
            }}>
              🌡️ Temperature Learning
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '1rem'
            }}>
              <div style={{
                background: currentWeather.temperature >= 75 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '1rem',
                border: currentWeather.temperature >= 75 ? '2px solid #EF4444' : '2px solid rgba(255,255,255,0.2)'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔥</div>
                <p style={{ margin: 0, fontWeight: 'bold' }}>Hot</p>
                <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8 }}>75°F and up</p>
              </div>

              <div style={{
                background: (currentWeather.temperature >= 60 && currentWeather.temperature < 75) ? 'rgba(251, 191, 36, 0.2)' : 'rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '1rem',
                border: (currentWeather.temperature >= 60 && currentWeather.temperature < 75) ? '2px solid #FBD024' : '2px solid rgba(255,255,255,0.2)'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>☀️</div>
                <p style={{ margin: 0, fontWeight: 'bold' }}>Warm</p>
                <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8 }}>60°F - 74°F</p>
              </div>

              <div style={{
                background: (currentWeather.temperature >= 40 && currentWeather.temperature < 60) ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '1rem',
                border: (currentWeather.temperature >= 40 && currentWeather.temperature < 60) ? '2px solid #22C55E' : '2px solid rgba(255,255,255,0.2)'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🍃</div>
                <p style={{ margin: 0, fontWeight: 'bold' }}>Cool</p>
                <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8 }}>40°F - 59°F</p>
              </div>

              <div style={{
                background: currentWeather.temperature < 40 ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '1rem',
                border: currentWeather.temperature < 40 ? '2px solid #3B82F6' : '2px solid rgba(255,255,255,0.2)'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>❄️</div>
                <p style={{ margin: 0, fontWeight: 'bold' }}>Cold</p>
                <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8 }}>Below 40°F</p>
              </div>
            </div>
            
            <div style={{
              marginTop: '1rem',
              padding: '1rem',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '12px',
              fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)',
              fontWeight: 'bold'
            }}>
              Today is {currentWeather.temperature}°{currentWeather.temperatureUnit} - That's{' '}
              {currentWeather.temperature >= 75 ? 'HOT!' :
               currentWeather.temperature >= 60 ? 'WARM!' :
               currentWeather.temperature >= 40 ? 'COOL!' : 'COLD!'}
            </div>
          </div>
        )}
      </div>

      </div>

      {/* Navigation Footer - ADD THIS at the bottom */}
      <div style={{
        padding: '1.5rem 2rem',
        background: 'rgba(255, 255, 255, 0.1)',
        borderTop: '1px solid rgba(255, 255, 255, 0.2)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <button
          onClick={onBack}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '12px',
            color: 'white',
            padding: 'clamp(0.75rem, 1.5vw, 1rem) clamp(1.5rem, 3vw, 2rem)',
            fontSize: 'clamp(1rem, 2vw, 1.1rem)',
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
            background: 'linear-gradient(145deg, #28a745, #20c997)',
            border: 'none',
            borderRadius: '12px',
            color: 'white',
            padding: 'clamp(0.75rem, 1.5vw, 1rem) clamp(1.5rem, 3vw, 2rem)',
            fontSize: 'clamp(1rem, 2vw, 1.1rem)',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(40, 167, 69, 0.3)'
          }}
        >
          Continue →
        </button>
      </div>
    </div>
  );
};

export default WeatherClothingStep;
