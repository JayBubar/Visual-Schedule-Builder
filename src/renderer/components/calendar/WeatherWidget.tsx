import React, { useState, useEffect } from 'react';
import { WeatherData, CalendarSettings } from '../../types';
import { WeatherService, WeatherCache } from '../../utils/weatherService';

interface WeatherWidgetProps {
  settings: CalendarSettings;
  onWeatherUpdate?: (weather: WeatherData) => void;
  showDiscussionPrompts?: boolean;
  size?: 'small' | 'medium' | 'large';
}

// Enhanced fallback weather options for offline mode
const FALLBACK_WEATHER_OPTIONS = [
  {
    id: 'sunny',
    icon: '☀️',
    condition: 'Sunny',
    description: 'Clear skies and sunshine',
    temperature: 75,
    colors: ['#FFD700', '#FFA500', '#FF8C00'],
    discussion: 'What activities do we enjoy when it\'s sunny outside?'
  },
  {
    id: 'cloudy',
    icon: '☁️',
    condition: 'Cloudy',
    description: 'Overcast with gray clouds',
    temperature: 68,
    colors: ['#87CEEB', '#B0C4DE', '#708090'],
    discussion: 'How do clouds form in the sky?'
  },
  {
    id: 'rainy',
    icon: '🌧️',
    condition: 'Rainy',
    description: 'Light rain showers',
    temperature: 62,
    colors: ['#4682B4', '#5F9EA0', '#6495ED'],
    discussion: 'Why is rain important for plants and animals?'
  },
  {
    id: 'snowy',
    icon: '❄️',
    condition: 'Snowy',
    description: 'Light snow falling',
    temperature: 32,
    colors: ['#E6E6FA', '#F0F8FF', '#B0E0E6'],
    discussion: 'What makes snowflakes so special and unique?'
  }
];

const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  settings,
  onWeatherUpdate,
  showDiscussionPrompts = false,
  size = 'medium'
}) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFallbackPanels, setShowFallbackPanels] = useState(false);
  const [selectedFallback, setSelectedFallback] = useState<typeof FALLBACK_WEATHER_OPTIONS[0] | null>(null);
  const [discussionPrompts, setDiscussionPrompts] = useState<string[]>([]);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const weatherService = new WeatherService(settings.weatherApiKey);

  // Load weather data
  useEffect(() => {
    loadWeatherData();
    
    // Set up auto-refresh if enabled
    if (settings.autoWeatherUpdate && settings.weatherUpdateInterval > 0) {
      const interval = setInterval(loadWeatherData, settings.weatherUpdateInterval * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [settings.weatherLocation, settings.weatherApiKey, settings.autoWeatherUpdate, settings.weatherUpdateInterval]);

  const loadWeatherData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setShowFallbackPanels(false);

      // Try to get cached data first
      const cached = WeatherCache.get(settings.weatherLocation);
      if (cached && cached.apiSource !== 'fallback') {
        setWeather(cached);
        setIsLoading(false);
        updateDiscussionPrompts(cached);
        onWeatherUpdate?.(cached);
        return;
      }

      // Fetch fresh data
      const weatherData = await weatherService.getCurrentWeather(
        settings.weatherLocation,
        settings.temperatureUnit
      );

      // Check if this is fallback data (API failed)
      if (weatherData.apiSource === 'fallback') {
        console.log('🌤️ Weather API unavailable, showing four-panel fallback display');
        setShowFallbackPanels(true);
        setIsLoading(false);
        return;
      }

      setWeather(weatherData);
      setLastUpdate(new Date());
      updateDiscussionPrompts(weatherData);
      onWeatherUpdate?.(weatherData);

      // Cache the data
      WeatherCache.save(settings.weatherLocation, weatherData);

    } catch (err) {
      console.error('Weather loading error:', err);
      setError('Weather API unavailable');
      
      // Show four-panel fallback display
      setShowFallbackPanels(true);
      setIsLoading(false);
    }
  };

  const updateDiscussionPrompts = (weatherData: WeatherData) => {
    const prompts = weatherService.getDiscussionPrompts(weatherData);
    setDiscussionPrompts(prompts);
    setCurrentPromptIndex(0);
  };

  const selectFallbackWeather = (weatherOption: typeof FALLBACK_WEATHER_OPTIONS[0]) => {
    setSelectedFallback(weatherOption);
    
    // Create mock weather data for the selected option
    const mockWeather: WeatherData = {
      location: settings.weatherLocation,
      condition: weatherOption.condition,
      temperature: weatherOption.temperature,
      temperatureUnit: settings.temperatureUnit,
      icon: weatherOption.icon,
      description: weatherOption.description,
      timestamp: new Date().toISOString(),
      apiSource: 'manual-selection'
    };
    
    setWeather(mockWeather);
    setDiscussionPrompts([weatherOption.discussion]);
    setCurrentPromptIndex(0);
    onWeatherUpdate?.(mockWeather);
    setLastUpdate(new Date());
  };

  const nextPrompt = () => {
    setCurrentPromptIndex((prev) => (prev + 1) % discussionPrompts.length);
  };

  const refreshWeather = () => {
    setSelectedFallback(null);
    setShowFallbackPanels(false);
    loadWeatherData();
  };

  // Size configurations
  const sizeConfig = {
    small: {
      container: { minHeight: '200px', padding: '1rem' },
      icon: { fontSize: '3rem' },
      temperature: { fontSize: '2rem' },
      description: { fontSize: '0.9rem' },
      location: { fontSize: '0.8rem' }
    },
    medium: {
      container: { minHeight: '300px', padding: '2rem' },
      icon: { fontSize: '6rem' },
      temperature: { fontSize: '3rem' },
      description: { fontSize: '1.2rem' },
      location: { fontSize: '1rem' }
    },
    large: {
      container: { minHeight: '400px', padding: '3rem' },
      icon: { fontSize: '8rem' },
      temperature: { fontSize: '4rem' },
      description: { fontSize: '1.5rem' },
      location: { fontSize: '1.2rem' }
    }
  };

  const config = sizeConfig[size];

  if (isLoading) {
    return (
      <div style={{
        ...config.container,
        background: 'rgba(255,255,255,0.15)',
        borderRadius: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(10px)',
        border: '2px solid rgba(255,255,255,0.3)'
      }}>
        <div style={{
          fontSize: '3rem',
          marginBottom: '1rem',
          animation: 'pulse 2s infinite'
        }}>
          🌤️
        </div>
        <div style={{ fontSize: '1.2rem', color: 'white' }}>
          Loading weather...
        </div>
      </div>
    );
  }

  // 🆕 FOUR-PANEL FALLBACK DISPLAY
  if (showFallbackPanels && !selectedFallback) {
    return (
      <div style={{
        ...config.container,
        background: 'rgba(255,255,255,0.15)',
        borderRadius: '20px',
        backdropFilter: 'blur(10px)',
        border: '2px solid rgba(255,255,255,0.3)',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🌤️</div>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: 'white',
            margin: '0 0 0.5rem 0'
          }}>
            Let's Look Outside!
          </h3>
          <p style={{
            fontSize: '1rem',
            color: 'rgba(255,255,255,0.9)',
            margin: 0
          }}>
            What kind of weather do you see today?
          </p>
        </div>

        {/* Four Weather Panels */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          {FALLBACK_WEATHER_OPTIONS.map((option) => (
            <button
              key={option.id}
              onClick={() => selectFallbackWeather(option)}
              style={{
                background: `linear-gradient(135deg, ${option.colors[0]}20, ${option.colors[1]}30, ${option.colors[2]}20)`,
                border: `2px solid ${option.colors[1]}40`,
                borderRadius: '16px',
                padding: '1.5rem 1rem',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textAlign: 'center',
                backdropFilter: 'blur(5px)',
                minHeight: '120px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = `0 8px 25px ${option.colors[1]}30`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
                {option.icon}
              </div>
              <div style={{
                fontSize: '1.1rem',
                fontWeight: '700',
                marginBottom: '0.25rem'
              }}>
                {option.condition}
              </div>
              <div style={{
                fontSize: '0.8rem',
                color: 'rgba(255,255,255,0.8)',
                lineHeight: '1.2'
              }}>
                {option.description}
              </div>
            </button>
          ))}
        </div>

        {/* Instructions */}
        <div style={{
          background: 'rgba(59, 130, 246, 0.2)',
          borderRadius: '12px',
          padding: '1rem',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '0.9rem',
            color: 'white',
            fontWeight: '600',
            marginBottom: '0.5rem'
          }}>
            👀 Look outside the window and choose the weather that matches!
          </div>
          <div style={{
            fontSize: '0.8rem',
            color: 'rgba(255,255,255,0.8)'
          }}>
            We can observe and discuss weather without internet connection
          </div>
        </div>

        {/* Refresh Button */}
        <button
          onClick={refreshWeather}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'rgba(255,255,255,0.2)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            color: 'white',
            fontSize: '1rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease'
          }}
          title="Try Weather API Again"
        >
          🔄
        </button>

        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.05); }
          }
        `}</style>
      </div>
    );
  }

  // Regular weather display (existing functionality enhanced)
  if (!weather) return null;

  return (
    <div style={{
      ...config.container,
      background: 'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1))',
      borderRadius: '20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      backdropFilter: 'blur(10px)',
      border: '2px solid rgba(255,255,255,0.3)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Weather Icon */}
      <div style={{
        ...config.icon,
        marginBottom: '1rem',
        textShadow: '0 2px 4px rgba(0,0,0,0.3)'
      }}>
        {weather.icon}
      </div>

      {/* Temperature */}
      <div style={{
        ...config.temperature,
        fontWeight: '700',
        color: 'white',
        textShadow: '0 2px 4px rgba(0,0,0,0.3)',
        marginBottom: '0.5rem'
      }}>
        {weather.temperature}°{weather.temperatureUnit}
      </div>

      {/* Location */}
      <div style={{
        ...config.location,
        color: 'rgba(255,255,255,0.9)',
        fontWeight: '600',
        marginBottom: '1rem',
        textAlign: 'center'
      }}>
        📍 {weather.location}
      </div>

      {/* Description */}
      <div style={{
        ...config.description,
        color: 'white',
        textAlign: 'center',
        lineHeight: '1.4',
        marginBottom: showDiscussionPrompts ? '1.5rem' : '1rem',
        padding: '0 1rem'
      }}>
        {weather.description}
      </div>

      {/* Discussion Prompts */}
      {showDiscussionPrompts && discussionPrompts.length > 0 && (
        <div style={{
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '12px',
          padding: '1rem',
          margin: '0 1rem',
          width: 'calc(100% - 2rem)',
          boxSizing: 'border-box'
        }}>
          <div style={{
            fontSize: '0.9rem',
            fontWeight: '600',
            color: 'white',
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            💭 Discussion Prompt:
          </div>
          <div style={{
            fontSize: '0.9rem',
            color: 'rgba(255,255,255,0.9)',
            lineHeight: '1.4',
            marginBottom: discussionPrompts.length > 1 ? '1rem' : '0'
          }}>
            {discussionPrompts[currentPromptIndex]}
          </div>
          {discussionPrompts.length > 1 && (
            <button
              onClick={nextPrompt}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '6px',
                color: 'white',
                padding: '0.5rem 1rem',
                fontSize: '0.8rem',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Next Question →
            </button>
          )}
        </div>
      )}

      {/* Last Update Info */}
      {lastUpdate && (
        <div style={{
          position: 'absolute',
          bottom: '0.5rem',
          right: '0.5rem',
          fontSize: '0.7rem',
          color: 'rgba(255,255,255,0.6)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem'
        }}>
          🕒 {lastUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      )}

      {/* Refresh Button */}
      <button
        onClick={refreshWeather}
        style={{
          position: 'absolute',
          top: '0.5rem',
          right: '0.5rem',
          background: 'rgba(255,255,255,0.2)',
          border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          color: 'white',
          fontSize: '1rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease'
        }}
        title="Refresh Weather"
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        🔄
      </button>

      {/* Weather Source Indicators */}
      {weather.apiSource === 'fallback' && (
        <div style={{
          position: 'absolute',
          bottom: '0.5rem',
          left: '0.5rem',
          fontSize: '0.7rem',
          color: 'rgba(255,255,255,0.6)',
          background: 'rgba(255,255,255,0.1)',
          padding: '0.25rem 0.5rem',
          borderRadius: '4px'
        }}>
          📱 Offline Mode
        </div>
      )}
      
      {weather.apiSource === 'manual-selection' && (
        <div style={{
          position: 'absolute',
          bottom: '0.5rem',
          left: '0.5rem',
          fontSize: '0.7rem',
          color: 'rgba(255,255,255,0.6)',
          background: 'rgba(255,255,255,0.1)',
          padding: '0.25rem 0.5rem',
          borderRadius: '4px'
        }}>
          👀 Observed Weather
        </div>
      )}

      {/* Back to Selection Button (when weather is manually selected) */}
      {selectedFallback && (
        <button
          onClick={() => {
            setSelectedFallback(null);
            setShowFallbackPanels(true);
            setWeather(null);
          }}
          style={{
            position: 'absolute',
            top: '0.5rem',
            left: '0.5rem',
            background: 'rgba(255,255,255,0.2)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '6px',
            color: 'white',
            padding: '0.25rem 0.5rem',
            fontSize: '0.7rem',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          ← Back to Selection
        </button>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
};

export default WeatherWidget;