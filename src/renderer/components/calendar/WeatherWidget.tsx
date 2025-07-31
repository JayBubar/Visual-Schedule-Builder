import React, { useState, useEffect } from 'react';
import { WeatherData, CalendarSettings } from '../../types';
import { WeatherService, WeatherCache } from '../../utils/weatherService';

interface WeatherWidgetProps {
  settings: CalendarSettings;
  onWeatherUpdate?: (weather: WeatherData) => void;
  showDiscussionPrompts?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  settings,
  onWeatherUpdate,
  showDiscussionPrompts = false,
  size = 'medium'
}) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

      // Try to get cached data first
      const cached = WeatherCache.get(settings.weatherLocation);
      if (cached) {
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

      setWeather(weatherData);
      setLastUpdate(new Date());
      updateDiscussionPrompts(weatherData);
      onWeatherUpdate?.(weatherData);

      // Cache the data
      WeatherCache.save(settings.weatherLocation, weatherData);

    } catch (err) {
      console.error('Weather loading error:', err);
      setError('Unable to load weather data');
      
      // Try to use cached data even if expired
      const cached = WeatherCache.get(settings.weatherLocation);
      if (cached) {
        setWeather(cached);
        updateDiscussionPrompts(cached);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateDiscussionPrompts = (weatherData: WeatherData) => {
    const prompts = weatherService.getDiscussionPrompts(weatherData);
    setDiscussionPrompts(prompts);
    setCurrentPromptIndex(0);
  };

  const nextPrompt = () => {
    setCurrentPromptIndex((prev) => (prev + 1) % discussionPrompts.length);
  };

  const refreshWeather = () => {
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

  if (error && !weather) {
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
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌤️</div>
        <div style={{ fontSize: '1.2rem', color: 'white', textAlign: 'center', marginBottom: '1rem' }}>
          Weather temporarily unavailable
        </div>
        <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginBottom: '1rem' }}>
          Let's look outside and describe what we see!
        </div>
        <button
          onClick={refreshWeather}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: '2px solid rgba(255,255,255,0.3)',
            borderRadius: '8px',
            color: 'white',
            padding: '0.5rem 1rem',
            fontSize: '0.9rem',
            cursor: 'pointer'
          }}
        >
          🔄 Try Again
        </button>
      </div>
    );
  }

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
            marginBottom: '1rem'
          }}>
            {discussionPrompts[currentPromptIndex]}
          </div>
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

      {/* Weather Source Indicator */}
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