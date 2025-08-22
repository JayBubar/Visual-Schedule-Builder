// 🌤️ WEATHERSTEP TRANSFORMATION - PART 1: CORE STRUCTURE
// File: WeatherStep.tsx (Part 1 of 6)

import React, { useState, useEffect, useCallback } from 'react';
import { MorningMeetingStepProps, WeatherStepData } from '../types/morningMeetingTypes';

// Enhanced interfaces for weather system
interface WeatherData {
  temperature: number;
  temperatureUnit: string;
  condition: string;
  clothingRecommendations: string[];
  humidity?: number;
  description?: string;
}

interface ClothingItem {
  item: string;
  emoji: string;
  reason: string;
  temperature: 'hot' | 'warm' | 'cool' | 'cold';
  weather: string[];
}

interface WeatherSafetyTip {
  emoji: string;
  title: string;
  description: string;
}

interface SeasonInfo {
  name: string;
  emoji: string;
  color: string;
  bgGradient: string;
}

const WeatherStep: React.FC<MorningMeetingStepProps> = ({
  currentDate,
  onNext,
  onBack,
  onDataUpdate,
  stepData,
  hubSettings
}) => {
  // 🎯 STATE MANAGEMENT - Enhanced for 3-section flow
  const [currentSection, setCurrentSection] = useState(0); // 0=Discovery, 1=Clothing, 2=Safety
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(
    stepData?.currentWeather || null
  );
  const [selectedClothing, setSelectedClothing] = useState<string[]>(
    stepData?.selectedClothing || []
  );
  
  // ✨ NEW: Interactive states for magical experience
  const [weatherRevealed, setWeatherRevealed] = useState(false);
  const [clothingGameComplete, setClothingGameComplete] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');

  // 🎬 VIDEO INTEGRATION - Maintained from original
  const selectedVideos = hubSettings?.videos?.weatherClothing || [];

  // 📚 CUSTOM VOCABULARY - Enhanced logic from original
  const getSeasonalVocabulary = (): string[] => {
    // FIRST: Check Hub custom vocabulary (new pattern)
    if (hubSettings?.customVocabulary?.weather?.length > 0) {
      return hubSettings.customVocabulary.weather;
    }
    
    // SECOND: Check weather API custom vocabulary (legacy support)
    if (hubSettings?.weatherAPI?.customVocabulary?.length > 0) {
      return hubSettings.weatherAPI.customVocabulary;
    }
    
    // THIRD: Use enhanced defaults
    return ['sunny', 'cloudy', 'rainy', 'snowy', 'windy', 'foggy', 'partly cloudy', 'stormy'];
  };

  const customVocabulary = getSeasonalVocabulary();

  // 🌱 SEASON DETECTION - Enhanced from original with gradients
  const getSeason = (date: Date): SeasonInfo => {
    const month = date.getMonth() + 1;
    if (month >= 3 && month <= 5) return { 
      name: 'Spring', 
      emoji: '🌸', 
      color: '#10B981',
      bgGradient: 'linear-gradient(135deg, #34D399 0%, #10B981 50%, #065F46 100%)'
    };
    if (month >= 6 && month <= 8) return { 
      name: 'Summer', 
      emoji: '☀️', 
      color: '#F59E0B',
      bgGradient: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 50%, #D97706 100%)'
    };
    if (month >= 9 && month <= 11) return { 
      name: 'Fall', 
      emoji: '🍂', 
      color: '#EF4444',
      bgGradient: 'linear-gradient(135deg, #F87171 0%, #EF4444 50%, #DC2626 100%)'
    };
    return { 
      name: 'Winter', 
      emoji: '❄️', 
      color: '#3B82F6',
      bgGradient: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 50%, #1E40AF 100%)'
    };
  };

  const season = getSeason(currentDate);

  // 🔧 DEBUG LOGGING - Maintained from original
  useEffect(() => {
    console.log('🌤️ DEBUG WeatherStep hubSettings:', hubSettings);
    console.log('🌤️ DEBUG Custom vocabulary:', hubSettings?.customVocabulary?.weather);
    console.log('🌤️ DEBUG Videos:', hubSettings?.videos?.weatherClothing);
    console.log('🌤️ DEBUG Weather API:', hubSettings?.weatherAPI);
  }, [hubSettings]);

  // 💾 DATA PERSISTENCE - Enhanced with section tracking
  const handleDataUpdate = useCallback(() => {
    // Only update when we have meaningful progress
    if (currentSection > 0 || selectedClothing.length > 0 || weatherRevealed) {
      const stepData: WeatherStepData = {
        currentWeather,
        selectedClothing,
        customVocabulary,
        completedAt: currentSection === 2 ? new Date() : undefined,
        // ✨ NEW: Track section progress
        sectionProgress: {
          weatherRevealed,
          clothingGameComplete,
          currentSection
        }
      };
      onDataUpdate(stepData);
    }
  }, [currentWeather, selectedClothing, currentSection, weatherRevealed, clothingGameComplete, customVocabulary, onDataUpdate]);

  useEffect(() => {
    handleDataUpdate();
  }, [handleDataUpdate]);

  // Continue to Part 2...
// 🌤️ WEATHERSTEP TRANSFORMATION - PART 2: WEATHER LOGIC & CLOTHING DATABASE
// File: WeatherStep.tsx (Part 2 of 6)

  // 🎨 ENHANCED CLOTHING DATABASE - Expanded from original
  const clothingDatabase: ClothingItem[] = [
    // 🔥 Hot weather (75°F+)
    { item: 'shorts', emoji: '🩳', reason: 'Perfect for hot weather!', temperature: 'hot', weather: ['sunny', 'clear'] },
    { item: 't-shirt', emoji: '👕', reason: 'Stay cool and comfortable', temperature: 'hot', weather: ['sunny', 'clear', 'cloudy'] },
    { item: 'tank top', emoji: '🎽', reason: 'Extra cooling for very hot days', temperature: 'hot', weather: ['sunny'] },
    { item: 'sandals', emoji: '👡', reason: 'Let your feet breathe', temperature: 'hot', weather: ['sunny', 'clear'] },
    { item: 'sunglasses', emoji: '🕶️', reason: 'Protect your eyes from bright sun!', temperature: 'hot', weather: ['sunny'] },
    { item: 'sun hat', emoji: '👒', reason: 'Shade your face from the sun', temperature: 'hot', weather: ['sunny'] },
    
    // 🌤️ Warm weather (60-74°F)
    { item: 'light jacket', emoji: '🧥', reason: 'Perfect for mild weather', temperature: 'warm', weather: ['cloudy', 'clear', 'partly cloudy'] },
    { item: 'long pants', emoji: '👖', reason: 'Comfortable for this temperature', temperature: 'warm', weather: ['cloudy', 'clear', 'windy'] },
    { item: 'sneakers', emoji: '👟', reason: 'Great for walking and playing', temperature: 'warm', weather: ['cloudy', 'clear'] },
    { item: 'light sweater', emoji: '👔', reason: 'Cozy without being too warm', temperature: 'warm', weather: ['cloudy'] },
    
    // 🍂 Cool weather (40-59°F)
    { item: 'sweater', emoji: '👔', reason: 'Keep warm and cozy', temperature: 'cool', weather: ['cloudy', 'windy'] },
    { item: 'jeans', emoji: '👖', reason: 'Warm and sturdy for cool days', temperature: 'cool', weather: ['cloudy', 'windy'] },
    { item: 'closed shoes', emoji: '👞', reason: 'Keep feet warm and protected', temperature: 'cool', weather: ['cloudy', 'windy', 'rainy'] },
    { item: 'light scarf', emoji: '🧣', reason: 'Extra warmth for your neck', temperature: 'cool', weather: ['windy'] },
    { item: 'hoodie', emoji: '👘', reason: 'Warm and comfortable', temperature: 'cool', weather: ['cloudy', 'windy'] },
    
    // ❄️ Cold weather (under 40°F)
    { item: 'heavy coat', emoji: '🧥', reason: 'Stay very warm in cold weather!', temperature: 'cold', weather: ['snowy', 'windy'] },
    { item: 'warm boots', emoji: '🥾', reason: 'Keep feet warm and dry', temperature: 'cold', weather: ['snowy', 'rainy'] },
    { item: 'winter hat', emoji: '🧢', reason: 'Keep your head warm', temperature: 'cold', weather: ['snowy', 'windy'] },
    { item: 'gloves', emoji: '🧤', reason: 'Protect your hands from cold', temperature: 'cold', weather: ['snowy', 'windy'] },
    { item: 'warm socks', emoji: '🧦', reason: 'Keep your feet toasty', temperature: 'cold', weather: ['snowy', 'windy'] },
    { item: 'thermal underwear', emoji: '👕', reason: 'Extra layer for very cold days', temperature: 'cold', weather: ['snowy'] },
    
    // 🌧️ Weather-specific items
    { item: 'umbrella', emoji: '☂️', reason: 'Stay dry in the rain!', temperature: 'warm', weather: ['rainy', 'stormy'] },
    { item: 'rain boots', emoji: '👢', reason: 'Waterproof feet for puddles', temperature: 'cool', weather: ['rainy'] },
    { item: 'raincoat', emoji: '🧥', reason: 'Keep your body completely dry', temperature: 'cool', weather: ['rainy', 'stormy'] },
    { item: 'windbreaker', emoji: '🧥', reason: 'Protection from strong winds', temperature: 'warm', weather: ['windy'] }
  ];

  // ⚡ WEATHER DATA GENERATION - Enhanced from original with better seasonal logic
  const generateMockWeather = (): WeatherData => {
    const conditions = customVocabulary;
    
    // 🎲 Smart seasonal condition selection
    let seasonalConditions = conditions;
    if (season.name === 'Winter') {
      seasonalConditions = conditions.filter(c => ['snowy', 'cloudy', 'windy', 'foggy'].includes(c.toLowerCase()));
    } else if (season.name === 'Summer') {
      seasonalConditions = conditions.filter(c => ['sunny', 'clear', 'partly cloudy', 'cloudy'].includes(c.toLowerCase()));
    } else if (season.name === 'Spring' || season.name === 'Fall') {
      seasonalConditions = conditions.filter(c => ['rainy', 'cloudy', 'windy', 'partly cloudy', 'sunny'].includes(c.toLowerCase()));
    }
    
    const randomCondition = seasonalConditions[Math.floor(Math.random() * seasonalConditions.length)] || 'sunny';
    
    // 🌡️ Smart seasonal temperature ranges
    let baseTemp = 70;
    let variance = 15;
    
    if (season.name === 'Winter') {
      baseTemp = 32;
      variance = 25; // 7°F to 57°F range
    } else if (season.name === 'Fall') {
      baseTemp = 55;
      variance = 20; // 35°F to 75°F range
    } else if (season.name === 'Spring') {
      baseTemp = 65;
      variance = 20; // 45°F to 85°F range
    } else if (season.name === 'Summer') {
      baseTemp = 82;
      variance = 18; // 64°F to 100°F range
    }
    
    const tempVariance = Math.floor(Math.random() * variance) - (variance / 2);
    const temperature = Math.max(10, Math.min(105, baseTemp + tempVariance));

    return {
      temperature,
      temperatureUnit: 'F',
      condition: randomCondition.charAt(0).toUpperCase() + randomCondition.slice(1),
      clothingRecommendations: [],
      description: `${randomCondition} weather for ${season.name.toLowerCase()}`,
      humidity: Math.floor(Math.random() * 60) + 30 // 30-90% humidity
    };
  };

  // 👗 SMART CLOTHING SUGGESTIONS - Enhanced logic from original
  const getClothingSuggestions = (weather: WeatherData): ClothingItem[] => {
    const temp = weather.temperature;
    const condition = weather.condition.toLowerCase();
    
    // 🌡️ Determine temperature category
    let tempCategory: 'hot' | 'warm' | 'cool' | 'cold';
    if (temp >= 75) tempCategory = 'hot';
    else if (temp >= 60) tempCategory = 'warm';
    else if (temp >= 40) tempCategory = 'cool';
    else tempCategory = 'cold';

    // 🎯 Smart filtering: temperature + weather condition
    const suggestions = clothingDatabase.filter(item => {
      const tempMatch = item.temperature === tempCategory;
      const weatherMatch = item.weather.some(w => condition.includes(w));
      
      // Prioritize items that match both temperature AND weather
      if (tempMatch && weatherMatch) return true;
      // Include temperature matches for base clothing
      if (tempMatch) return true;
      // Include weather-specific items regardless of temp (like umbrellas)
      if (weatherMatch && ['umbrella', 'raincoat', 'rain boots'].includes(item.item)) return true;
      
      return false;
    });

    // 📊 Smart sorting: weather-specific items first, then temperature items
    const sorted = suggestions.sort((a, b) => {
      const aWeatherMatch = a.weather.some(w => condition.includes(w));
      const bWeatherMatch = b.weather.some(w => condition.includes(w));
      
      if (aWeatherMatch && !bWeatherMatch) return -1;
      if (!aWeatherMatch && bWeatherMatch) return 1;
      return 0;
    });

    // 🎲 Add variety and limit to 6 suggestions
    return sorted.slice(0, 6);
  };

  // 🌤️ WEATHER EMOJI HELPER - Enhanced from original
  const getWeatherEmoji = (condition: string): string => {
    const cond = condition.toLowerCase();
    if (cond.includes('sun') || cond.includes('clear')) return '☀️';
    if (cond.includes('partly') && cond.includes('cloud')) return '⛅';
    if (cond.includes('rain')) return '🌧️';
    if (cond.includes('snow')) return '❄️';
    if (cond.includes('cloud')) return '☁️';
    if (cond.includes('wind')) return '💨';
    if (cond.includes('fog')) return '🌫️';
    if (cond.includes('storm')) return '⛈️';
    if (cond.includes('mist')) return '🌁';
    return '🌤️'; // Default partly cloudy
  };

  // 🔄 WEATHER INITIALIZATION - Enhanced from original
  useEffect(() => {
    if (!currentWeather) {
      // 🌐 Check if API is enabled and has key (maintained from original)
      if (hubSettings?.weatherAPI?.enabled && hubSettings?.weatherAPI?.apiKey) {
        // TODO: Implement actual API call here
        // For now, use enhanced mock data
        console.log('🌐 Weather API enabled but using mock data for demo');
        setCurrentWeather(generateMockWeather());
      } else {
        // 🎲 Use enhanced mock weather data
        setCurrentWeather(generateMockWeather());
      }
    }
  }, [hubSettings?.weatherAPI, currentWeather, season.name]);

  // Continue to Part 3...
  // 🌤️ WEATHERSTEP TRANSFORMATION - PART 3: SECTION 1 - WEATHER MYSTERY DISCOVERY
// File: WeatherStep.tsx (Part 3 of 6)

  // ✨ CELEBRATION SYSTEM - New magical feature
  const triggerCelebration = (message: string) => {
    setCelebrationMessage(message);
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 3000);
  };

  // 🔍 WEATHER REVEAL ANIMATION - New interactive feature
  const revealWeather = () => {
    setWeatherRevealed(true);
    triggerCelebration("Amazing! Let's see what the weather is like! 🌤️");
    // Auto-advance to clothing section after celebration
    setTimeout(() => {
      setCurrentSection(1);
    }, 3500);
  };

  // 🏗️ RENDER: SECTION 1 - WEATHER MYSTERY DISCOVERY
  const renderWeatherDiscoverySection = () => (
    <div style={{
      background: 'rgba(255, 255, 255, 0.15)',
      borderRadius: '24px',
      padding: '3rem',
      textAlign: 'center',
      backdropFilter: 'blur(15px)',
      border: '2px solid rgba(255, 255, 255, 0.2)',
      maxWidth: '600px',
      margin: '0 auto',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* 🌟 Mystery shimmer effect */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        left: '-50%',
        width: '200%',
        height: '200%',
        background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
        animation: !weatherRevealed ? 'shimmer 3s ease-in-out infinite' : 'none',
        pointerEvents: 'none'
      }} />

      {/* 🌤️ Weather emoji with mystery blur */}
      <div style={{
        fontSize: '6rem',
        marginBottom: '2rem',
        filter: weatherRevealed ? 'blur(0px)' : 'blur(15px)',
        transition: 'filter 1s ease',
        position: 'relative',
        zIndex: 1
      }}>
        {currentWeather ? getWeatherEmoji(currentWeather.condition) : '🌤️'}
      </div>
      
      {/* 📝 Discovery question */}
      <h3 style={{
        fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
        fontWeight: '700',
        color: 'white',
        marginBottom: '1.5rem',
        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
        position: 'relative',
        zIndex: 1
      }}>
        What's the weather like today?
      </h3>
      
      {/* 📊 Weather data with mystery blur */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.2)',
        borderRadius: '16px',
        padding: '2rem',
        marginBottom: '2rem',
        filter: weatherRevealed ? 'blur(0px)' : 'blur(8px)',
        transition: 'filter 1s ease',
        position: 'relative',
        zIndex: 1,
        border: '1px solid rgba(255, 255, 255, 0.3)'
      }}>
        {currentWeather && (
          <>
            <div style={{
              fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
              fontWeight: '800',
              color: 'white',
              marginBottom: '0.5rem',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)'
            }}>
              {currentWeather.temperature}°{currentWeather.temperatureUnit}
            </div>
            <div style={{
              fontSize: 'clamp(1.2rem, 3vw, 1.8rem)',
              color: 'rgba(255, 255, 255, 0.9)',
              fontWeight: '600',
              marginBottom: '0.5rem'
            }}>
              {currentWeather.condition}
            </div>
            <div style={{
              fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
              color: 'rgba(255, 255, 255, 0.8)',
              fontStyle: 'italic'
            }}>
              {currentWeather.description}
            </div>
          </>
        )}
      </div>
      
      {/* 🎯 Interactive reveal button or completion message */}
      {!weatherRevealed ? (
        <button
          onClick={revealWeather}
          style={{
            background: 'linear-gradient(135deg, #FFD93D 0%, #FF6B6B 100%)',
            border: 'none',
            borderRadius: '20px',
            color: 'white',
            padding: 'clamp(1rem, 2vh, 1.5rem) clamp(2rem, 4vw, 3rem)',
            fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
            position: 'relative',
            zIndex: 1,
            minWidth: '200px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)';
            e.currentTarget.style.boxShadow = '0 12px 35px rgba(0, 0, 0, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.2)';
          }}
        >
          🔍 Reveal Today's Weather!
        </button>
      ) : (
        <div style={{
          fontSize: 'clamp(1rem, 2.5vw, 1.3rem)',
          color: 'rgba(255, 255, 255, 0.9)',
          fontWeight: '600',
          position: 'relative',
          zIndex: 1,
          background: 'rgba(16, 185, 129, 0.3)',
          borderRadius: '12px',
          padding: '1rem 2rem',
          border: '2px solid rgba(16, 185, 129, 0.5)',
          animation: 'glow 2s ease-in-out infinite alternate'
        }}>
          ⭐ Amazing! Now let's choose the perfect clothing! ⭐
        </div>
      )}

      {/* 🎈 Floating celebration particles when revealed */}
      {weatherRevealed && [...Array(6)].map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            fontSize: '1.5rem',
            animation: `float 3s ease-in-out infinite ${i * 0.5}s`,
            left: `${20 + (i * 15)}%`,
            top: `${10 + (i % 2) * 80}%`,
            pointerEvents: 'none',
            opacity: 0.7,
            zIndex: 0
          }}
        >
          {['✨', '🌟', '⭐', '💫', '🎉', '🎊'][i]}
        </div>
      ))}
    </div>
  );

  // Continue to Part 4...
  // 🌤️ WEATHERSTEP TRANSFORMATION - PART 4: SECTION 2 - INTERACTIVE CLOTHING GAME
// File: WeatherStep.tsx (Part 4 of 6)

  // 👗 CLOTHING SELECTION HANDLER - Enhanced with game logic
  const selectClothing = (item: ClothingItem) => {
    const newSelected = selectedClothing.includes(item.item)
      ? selectedClothing.filter(i => i !== item.item)
      : [...selectedClothing, item.item];
    
    setSelectedClothing(newSelected);
    
    // 🎯 Game completion logic
    if (newSelected.length >= 3 && !clothingGameComplete) {
      setClothingGameComplete(true);
      triggerCelebration("Perfect clothing choices! You're ready for the weather! 👕");
    }
  };

  // 🏗️ RENDER: SECTION 2 - INTERACTIVE CLOTHING CHOICE GAME  
  const renderClothingGameSection = () => {
    const clothingSuggestions = currentWeather ? getClothingSuggestions(currentWeather) : [];
    
    return (
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* 🎮 Game instructions header */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '24px',
          padding: '2rem',
          marginBottom: '2rem',
          textAlign: 'center',
          backdropFilter: 'blur(15px)',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* 🌟 Game header shimmer */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
            animation: 'gameShimmer 3s ease-in-out infinite',
            pointerEvents: 'none'
          }} />

          <h3 style={{
            fontSize: 'clamp(1.5rem, 4vw, 2.2rem)',
            fontWeight: '700',
            color: 'white',
            marginBottom: '1rem',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
            position: 'relative',
            zIndex: 1
          }}>
            👗 Clothing Choice Game!
          </h3>
          
          <p style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.3rem)',
            color: 'rgba(255, 255, 255, 0.9)',
            marginBottom: '1rem',
            position: 'relative',
            zIndex: 1
          }}>
            Choose the best clothing for <strong>{currentWeather?.temperature}°{currentWeather?.temperatureUnit}</strong> and <strong>{currentWeather?.condition.toLowerCase()}</strong> weather!
          </p>
          
          {/* 📊 Progress indicator */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            padding: '1rem 2rem',
            display: 'inline-block',
            position: 'relative',
            zIndex: 1,
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}>
            <span style={{ fontWeight: '600' }}>
              Selected: {selectedClothing.length} items | Need: 3+ items to complete
            </span>
            {/* 📈 Progress bar */}
            <div style={{
              width: '100%',
              height: '4px',
              background: 'rgba(255, 255, 255, 0.3)',
              borderRadius: '2px',
              marginTop: '0.5rem',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${Math.min(100, (selectedClothing.length / 3) * 100)}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #10B981, #34D399)',
                borderRadius: '2px',
                transition: 'width 0.5s ease'
              }} />
            </div>
          </div>
        </div>

        {/* 🎯 Clothing selection grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {clothingSuggestions.map((item, index) => {
            const isSelected = selectedClothing.includes(item.item);
            const isWeatherSpecific = item.weather.some(w => 
              currentWeather?.condition.toLowerCase().includes(w)
            );
            
            return (
              <div
                key={index}
                onClick={() => selectClothing(item)}
                style={{
                  background: isSelected 
                    ? 'linear-gradient(135deg, #10B981 0%, #34D399 100%)'
                    : 'rgba(255, 255, 255, 0.15)',
                  borderRadius: '20px',
                  padding: '2rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: isSelected 
                    ? '3px solid rgba(255, 255, 255, 0.8)' 
                    : isWeatherSpecific 
                      ? '2px solid rgba(255, 215, 0, 0.6)'
                      : '2px solid rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                  boxShadow: isSelected 
                    ? '0 8px 30px rgba(16, 185, 129, 0.4)'
                    : isWeatherSpecific
                      ? '0 4px 20px rgba(255, 215, 0, 0.3)'
                      : '0 4px 20px rgba(0, 0, 0, 0.1)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.transform = 'scale(1.02)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                  }
                }}
              >
                {/* 🌟 Special weather-appropriate badge */}
                {isWeatherSpecific && !isSelected && (
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'linear-gradient(135deg, #FFD93D, #FF6B6B)',
                    borderRadius: '12px',
                    padding: '0.3rem 0.6rem',
                    fontSize: '0.7rem',
                    fontWeight: '700',
                    color: 'white',
                    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)',
                    animation: 'pulse 2s ease-in-out infinite'
                  }}>
                    PERFECT!
                  </div>
                )}

                {/* 👕 Clothing emoji with scaling animation */}
                <div style={{ 
                  fontSize: 'clamp(3rem, 6vw, 4rem)', 
                  marginBottom: '1rem',
                  transform: isSelected ? 'scale(1.2)' : 'scale(1)',
                  transition: 'transform 0.3s ease',
                  filter: isSelected ? 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.5))' : 'none'
                }}>
                  {item.emoji}
                </div>
                
                {/* 📝 Item details */}
                <h4 style={{
                  fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)',
                  fontWeight: '700',
                  color: 'white',
                  marginBottom: '0.5rem',
                  textTransform: 'capitalize',
                  textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)'
                }}>
                  {item.item}
                </h4>
                
                <p style={{
                  fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
                  color: 'rgba(255, 255, 255, 0.9)',
                  lineHeight: '1.4',
                  marginBottom: '0.5rem'
                }}>
                  {item.reason}
                </p>

                {/* ✅ Selection indicator */}
                {isSelected && (
                  <div style={{
                    marginTop: '1rem',
                    fontSize: '1.8rem',
                    animation: 'bounce 1s ease-in-out infinite',
                    filter: 'drop-shadow(0 0 5px rgba(255, 255, 255, 0.8))'
                  }}>
                    ✅
                  </div>
                )}

                {/* 🌟 Temperature category indicator */}
                <div style={{
                  fontSize: '0.8rem',
                  color: 'rgba(255, 255, 255, 0.7)',
                  marginTop: '0.5rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  fontWeight: '600'
                }}>
                  {item.temperature.toUpperCase()} WEATHER
                </div>
              </div>
            );
          })}
        </div>

        {/* 🎉 Game completion celebration */}
        {clothingGameComplete && (
          <div style={{
            background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
            borderRadius: '20px',
            padding: '2rem',
            textAlign: 'center',
            marginTop: '2rem',
            color: 'white',
            fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)',
            fontWeight: '700',
            border: '3px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 8px 30px rgba(16, 185, 129, 0.4)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* 🎊 Celebration background effect */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.2) 0%, transparent 70%)',
              animation: 'celebrationPulse 2s ease-in-out infinite',
              pointerEvents: 'none'
            }} />
            
            <div style={{ position: 'relative', zIndex: 1 }}>
              🎉 Excellent clothing choices! You're ready for any weather! 🎉
              <div style={{ 
                marginTop: '1rem', 
                fontSize: 'clamp(0.9rem, 2vw, 1.1rem)', 
                opacity: 0.9,
                fontWeight: '600'
              }}>
                You selected {selectedClothing.length} perfect items for {currentWeather?.condition.toLowerCase()} weather!
              </div>
              <div style={{
                marginTop: '1rem',
                fontSize: 'clamp(0.8rem, 1.8vw, 1rem)',
                opacity: 0.8,
                fontStyle: 'italic'
              }}>
                Click "Next" to learn weather safety tips! 🛡️
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Continue to Part 5...
  // 🌤️ WEATHERSTEP TRANSFORMATION - PART 5: SECTION 3 - WEATHER SAFETY & CELEBRATION
// File: WeatherStep.tsx (Part 5 of 6)

  // 🛡️ WEATHER SAFETY TIPS GENERATOR - Enhanced with comprehensive safety advice
  const getWeatherSafetyTips = (weather: WeatherData | null): WeatherSafetyTip[] => {
    if (!weather) return [];
    
    const tips: WeatherSafetyTip[] = [];
    const temp = weather.temperature;
    const condition = weather.condition.toLowerCase();
    
    // 🌡️ Temperature-based safety tips
    if (temp >= 85) {
      tips.push({
        emoji: '💧',
        title: 'Stay Hydrated',
        description: 'Drink lots of water when it\'s very hot outside! Your body needs extra water to stay cool.'
      });
      tips.push({
        emoji: '🌳',
        title: 'Find Shade',
        description: 'Play in shady areas and take breaks indoors to avoid getting too hot in the sun.'
      });
    } else if (temp >= 75) {
      tips.push({
        emoji: '🧴',
        title: 'Sunscreen Protection',
        description: 'Use sunscreen to protect your skin from UV rays, even on warm days!'
      });
    } else if (temp <= 32) {
      tips.push({
        emoji: '🧤',
        title: 'Cover Exposed Skin',
        description: 'Wear gloves, hats, and warm clothes to prevent frostbite on very cold days.'
      });
      tips.push({
        emoji: '🏠',
        title: 'Limit Outdoor Time',
        description: 'Don\'t stay outside too long when it\'s freezing - come inside to warm up!'
      });
    } else if (temp <= 45) {
      tips.push({
        emoji: '🧥',
        title: 'Layer Up',
        description: 'Wear multiple layers so you can add or remove clothes as needed.'
      });
    }
    
    // 🌧️ Weather condition-specific tips
    if (condition.includes('rain') || condition.includes('storm')) {
      tips.push({
        emoji: '⚡',
        title: 'Lightning Safety',
        description: 'Stay inside during thunderstorms and away from tall objects like trees!'
      });
      tips.push({
        emoji: '👀',
        title: 'Watch Your Step',
        description: 'Be careful on wet surfaces - they can be very slippery!'
      });
    }
    
    if (condition.includes('snow')) {
      tips.push({
        emoji: '⛄',
        title: 'Bundle Up',
        description: 'Wear waterproof boots and warm layers when playing in the snow.'
      });
      tips.push({
        emoji: '🛷',
        title: 'Safe Snow Play',
        description: 'Only play in safe, supervised areas away from roads and traffic.'
      });
    }
    
    if (condition.includes('wind')) {
      tips.push({
        emoji: '🌪️',
        title: 'Wind Awareness',
        description: 'Be careful around trees and loose objects on very windy days.'
      });
    }
    
    if (condition.includes('fog')) {
      tips.push({
        emoji: '👁️',
        title: 'Visibility Safety',
        description: 'Stay close to adults in foggy weather - it\'s harder to see!'
      });
    }
    
    // 👥 Always include general safety tip
    tips.push({
      emoji: '👥',
      title: 'Buddy System',
      description: 'Always stay with friends, family, or teachers when playing outside!'
    });
    
    // 📱 Communication tip for older students
    if (temp <= 32 || condition.includes('storm')) {
      tips.push({
        emoji: '📱',
        title: 'Stay Connected',
        description: 'Make sure adults know where you are, especially in extreme weather.'
      });
    }
    
    return tips.slice(0, 4); // Limit to 4 most relevant tips
  };

  // 🏗️ RENDER: SECTION 3 - WEATHER SAFETY & CELEBRATION
  const renderWeatherSafetySection = () => {
    const safetyTips = getWeatherSafetyTips(currentWeather);
    
    return (
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.15)',
          borderRadius: '24px',
          padding: '3rem',
          textAlign: 'center',
          backdropFilter: 'blur(15px)',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          marginBottom: '2rem',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* 🌟 Hero background effect */}
          <div style={{
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: 'radial-gradient(circle, rgba(255, 215, 0, 0.1) 0%, transparent 70%)',
            animation: 'heroShimmer 4s ease-in-out infinite',
            pointerEvents: 'none'
          }} />

          <h3 style={{
            fontSize: 'clamp(2rem, 5vw, 2.8rem)',
            fontWeight: '800',
            color: 'white',
            marginBottom: '1.5rem',
            textShadow: '3px 3px 6px rgba(0, 0, 0, 0.3)',
            position: 'relative',
            zIndex: 1,
            filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.3))'
          }}>
            🛡️ Weather Safety Heroes!
          </h3>
          
          {/* 🎯 Safety tips grid */}
          <div style={{
            display: 'grid',
            gap: '1.5rem',
            marginBottom: '2rem',
            position: 'relative',
            zIndex: 1
          }}>
            {safetyTips.map((tip, index) => (
              <div
                key={index}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  animation: `slideInUp 0.6s ease-out ${index * 0.2}s both`,
                  textAlign: 'left',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.02)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                }}
              >
                <div style={{ 
                  fontSize: 'clamp(2rem, 4vw, 2.8rem)', 
                  marginBottom: '1rem',
                  textAlign: 'center'
                }}>
                  {tip.emoji}
                </div>
                <h4 style={{
                  fontSize: 'clamp(1.1rem, 2.5vw, 1.3rem)',
                  fontWeight: '700',
                  color: 'white',
                  marginBottom: '0.5rem',
                  textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)'
                }}>
                  {tip.title}
                </h4>
                <p style={{
                  fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
                  color: 'rgba(255, 255, 255, 0.9)',
                  lineHeight: '1.4',
                  margin: 0
                }}>
                  {tip.description}
                </p>
              </div>
            ))}
          </div>

          {/* 📊 Weather summary report */}
          <div style={{
            background: 'linear-gradient(135deg, #FFD93D 0%, #FF6B6B 100%)',
            borderRadius: '20px',
            padding: '2rem',
            marginBottom: '2rem',
            color: 'white',
            position: 'relative',
            zIndex: 1,
            border: '3px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.2)'
          }}>
            <h4 style={{
              fontSize: 'clamp(1.3rem, 3vw, 1.7rem)',
              fontWeight: '700',
              marginBottom: '1rem',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)'
            }}>
              🌟 Today's Weather Mastery Report 🌟
            </h4>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              textAlign: 'left'
            }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                padding: '1rem',
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}>
                <strong style={{ fontSize: '1.1rem' }}>🌡️ Temperature:</strong><br />
                <span style={{ fontSize: '1.3rem', fontWeight: '700' }}>
                  {currentWeather?.temperature}°{currentWeather?.temperatureUnit}
                </span>
              </div>
              
              <div style={{
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                padding: '1rem',
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}>
                <strong style={{ fontSize: '1.1rem' }}>🌤️ Condition:</strong><br />
                <span style={{ fontSize: '1.1rem', fontWeight: '600' }}>
                  {currentWeather?.condition}
                </span>
              </div>
              
              <div style={{
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                padding: '1rem',
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}>
                <strong style={{ fontSize: '1.1rem' }}>👗 Clothing:</strong><br />
                <span style={{ fontSize: '1.1rem', fontWeight: '600' }}>
                  {selectedClothing.length} perfect items!
                </span>
              </div>
              
              <div style={{
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                padding: '1rem',
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}>
                <strong style={{ fontSize: '1.1rem' }}>🍂 Season:</strong><br />
                <span style={{ fontSize: '1.1rem', fontWeight: '600' }}>
                  {season.emoji} {season.name}
                </span>
              </div>
            </div>
          </div>

          {/* 🎉 Final celebration button */}
          <button
            onClick={() => {
              triggerCelebration("🎉 Weather Masters! You're ready for anything! 🌈");
              setTimeout(() => {
                triggerCelebration("Congratulations! You've mastered weather wisdom! 🎊");
              }, 3500);
            }}
            style={{
              background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
              border: 'none',
              borderRadius: '20px',
              color: 'white',
              padding: 'clamp(1.2rem, 2.5vh, 1.8rem) clamp(2.5rem, 5vw, 3.5rem)',
              fontSize: 'clamp(1.1rem, 2.8vw, 1.5rem)',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)',
              marginBottom: '1rem',
              position: 'relative',
              zIndex: 1,
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
              minWidth: '280px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)';
              e.currentTarget.style.boxShadow = '0 12px 35px rgba(16, 185, 129, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.3)';
            }}
          >
            🎉 CELEBRATE WEATHER MASTERY! 🎉
          </button>
          
          <p style={{
            fontSize: 'clamp(1rem, 2.2vw, 1.2rem)',
            color: 'rgba(255, 255, 255, 0.9)',
            fontWeight: '600',
            position: 'relative',
            zIndex: 1,
            margin: 0
          }}>
            You've mastered weather discovery, clothing choices, and safety! ⭐
          </p>
        </div>
      </div>
    );
  };

  // Continue to Part 6...
  // 🌤️ WEATHERSTEP TRANSFORMATION - PART 6: NAVIGATION, MAIN RENDER & CSS
// File: WeatherStep.tsx (Part 6 of 6)

  // 🧭 NAVIGATION HANDLERS - Enhanced with section logic
  const nextSection = () => {
    if (currentSection < 2) {
      setCurrentSection(currentSection + 1);
    } else {
      onNext(); // Proceed to next Morning Meeting step
    }
  };
  
  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    } else {
      onBack(); // Go back to previous Morning Meeting step
    }
  };

  // 🎬 MAIN COMPONENT RENDER
  return (
    <div style={{
      height: '100%',
      background: season.bgGradient,
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    }}>
      {/* 🌤️ Floating Weather Particles - Enhanced from original */}
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
            opacity: 0.6,
            animation: `float 4s ease-in-out infinite`,
            animationDelay: `${i * 0.5}s`,
            left: `${10 + (i * 12)}%`,
            top: `${20 + (i % 3) * 20}%`,
            pointerEvents: 'none',
            zIndex: 1,
            filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))'
          }}
        >
          {i % 4 === 0 ? '🌤️' : i % 4 === 1 ? '☁️' : i % 4 === 2 ? '🌈' : '💨'}
        </div>
      ))}

      {/* 🎊 Celebration Overlay System */}
      {showCelebration && (
        <>
          {/* 📢 Celebration Message */}
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
            color: 'white',
            padding: 'clamp(1.5rem, 3vh, 2.5rem) clamp(2rem, 4vw, 3.5rem)',
            borderRadius: '24px',
            fontSize: 'clamp(1.2rem, 3vw, 1.8rem)',
            fontWeight: '700',
            textAlign: 'center',
            zIndex: 1000,
            border: '3px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
            animation: 'celebrationPop 3s ease-out',
            backdropFilter: 'blur(10px)',
            maxWidth: '90vw',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)'
          }}>
            {celebrationMessage}
          </div>

          {/* 🎊 Confetti Rain Effect */}
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              style={{
                position: 'fixed',
                left: `${Math.random() * 100}%`,
                top: `-10px`,
                fontSize: 'clamp(1.2rem, 2.5vw, 2rem)',
                animation: `confettiFall 3s linear infinite`,
                animationDelay: `${Math.random() * 2}s`,
                pointerEvents: 'none',
                zIndex: 999
              }}
            >
              {['🎉', '🎊', '⭐', '🌟', '✨', '💫', '🌈'][Math.floor(Math.random() * 7)]}
            </div>
          ))}
        </>
      )}

      {/* 🎬 VIDEO SECTION - Enhanced from original */}
      {selectedVideos.length > 0 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          padding: '1rem',
          flexShrink: 0,
          flexWrap: 'wrap'
        }}>
          {selectedVideos.map((video, index) => (
            <button
              key={index}
              onClick={() => {
                console.log('🎬 Opening weather video:', video.url);
                const newWindow = window.open(
                  video.url, 
                  `weather-video-${index}`, 
                  'width=800,height=600,scrollbars=yes,resizable=yes'
                );
                if (!newWindow) {
                  console.error('Failed to open video window - popup blocker may be active');
                }
              }}
              style={{
                background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
                color: 'white',
                border: '2px solid rgba(255,255,255,0.3)',
                borderRadius: '16px',
                padding: 'clamp(0.8rem, 1.5vh, 1.2rem) clamp(1.5rem, 3vw, 2.5rem)',
                fontSize: 'clamp(1rem, 2vw, 1.3rem)',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 20px rgba(52, 152, 219, 0.3)',
                backdropFilter: 'blur(10px)',
                textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)',
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
              <span>Weather Video{selectedVideos.length > 1 ? ` ${index + 1}` : ''}</span>
            </button>
          ))}
        </div>
      )}

      {/* 📋 Header with Section Progress */}
      <div style={{
        padding: '2rem',
        textAlign: 'center',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(15px)',
        position: 'relative',
        zIndex: 10,
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <h2 style={{
          fontSize: 'clamp(2rem, 6vw, 3.5rem)',
          fontWeight: '800',
          color: 'white',
          marginBottom: '1rem',
          textShadow: '3px 3px 6px rgba(0, 0, 0, 0.3)',
          filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.3))',
          lineHeight: '1.2'
        }}>
          🌤️ Weather Discovery Adventure!
        </h2>
        
        <p style={{
          fontSize: 'clamp(1.2rem, 3vw, 1.8rem)',
          color: 'rgba(255, 255, 255, 0.9)',
          fontWeight: '600',
          marginBottom: '1.5rem'
        }}>
          {season.emoji} {season.name} Weather & Clothing Fun
        </p>
        
        {/* 📊 Section Progress Indicators */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          alignItems: 'center'
        }}>
          {[
            { label: 'Discover', icon: '🔍' },
            { label: 'Choose', icon: '👗' }, 
            { label: 'Safety', icon: '🛡️' }
          ].map((section, index) => (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: currentSection >= index 
                ? 'rgba(255, 255, 255, 0.3)' 
                : 'rgba(255, 255, 255, 0.1)',
              borderRadius: '20px',
              padding: '0.5rem 1rem',
              border: currentSection === index 
                ? '2px solid rgba(255, 255, 255, 0.8)'
                : '1px solid rgba(255, 255, 255, 0.3)',
              transition: 'all 0.3s ease'
            }}>
              <div style={{
                fontSize: '1.2rem',
                opacity: currentSection >= index ? 1 : 0.6
              }}>
                {section.icon}
              </div>
              <span style={{
                fontSize: 'clamp(0.8rem, 1.8vw, 1rem)',
                fontWeight: '600',
                color: 'white',
                opacity: currentSection >= index ? 1 : 0.7
              }}>
                {section.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 🎯 Main Content Area */}
      <div style={{ 
        flex: 1, 
        padding: 'clamp(1rem, 2vh, 2rem)', 
        overflow: 'auto', 
        position: 'relative', 
        zIndex: 10 
      }}>
        {currentSection === 0 && renderWeatherDiscoverySection()}
        {currentSection === 1 && renderClothingGameSection()}
        {currentSection === 2 && renderWeatherSafetySection()}
      </div>

      {/* 🧭 Navigation Bar */}
      <div style={{
        padding: 'clamp(1.5rem, 2vh, 2rem)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(0, 0, 0, 0.2)',
        backdropFilter: 'blur(10px)',
        position: 'relative',
        zIndex: 10,
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        gap: '1rem',
        flexWrap: 'wrap'
      }}>
        {/* ⬅️ Back Button */}
        <button
          onClick={prevSection}
          style={{
            background: 'rgba(156, 163, 175, 0.8)',
            border: 'none',
            borderRadius: '16px',
            color: 'white',
            padding: 'clamp(0.8rem, 1.5vh, 1.2rem) clamp(1.5rem, 3vw, 2rem)',
            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(10px)',
            minWidth: 'clamp(100px, 15vw, 140px)',
            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(156, 163, 175, 1)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(156, 163, 175, 0.8)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          ← {currentSection === 0 ? 'Back' : 'Previous'}
        </button>

        {/* 📍 Section Indicator */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '20px',
          padding: 'clamp(0.6rem, 1.2vh, 1rem) clamp(1.5rem, 3vw, 2rem)',
          color: 'white',
          fontWeight: '600',
          fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          textAlign: 'center',
          minWidth: 'clamp(120px, 18vw, 160px)'
        }}>
          Section {currentSection + 1} of 3
        </div>

        {/* ➡️ Next Button */}
        <button
          onClick={nextSection}
          disabled={currentSection === 0 && !weatherRevealed}
          style={{
            background: currentSection === 2 
              ? 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)'
              : 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
            border: 'none',
            borderRadius: '16px',
            color: 'white',
            padding: 'clamp(0.8rem, 1.5vh, 1.2rem) clamp(1.5rem, 3vw, 2rem)',
            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            fontWeight: '700',
            cursor: currentSection === 0 && !weatherRevealed ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(10px)',
            minWidth: 'clamp(100px, 15vw, 140px)',
            opacity: currentSection === 0 && !weatherRevealed ? 0.5 : 1,
            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)'
          }}
          onMouseEnter={(e) => {
            if (!(currentSection === 0 && !weatherRevealed)) {
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
            }
          }}
          onMouseLeave={(e) => {
            if (!(currentSection === 0 && !weatherRevealed)) {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
            }
          }}
        >
          {currentSection === 2 ? 'Complete! →' : 'Next →'}
        </button>
      </div>

      {/* 🎨 CSS Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes celebrationPop {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
          20% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
          80% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
        }
        
        @keyframes confettiFall {
          0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes slideInUp {
          0% { transform: translateY(50px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes shimmer {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(180deg); }
        }
        
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 5px rgba(16, 185, 129, 0.5); }
          50% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.8); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        
        @keyframes gameShimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        
        @keyframes heroShimmer {
          0%, 100% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.1); }
        }
        
        @keyframes celebrationPulse {
          0%, 100% { transform: scale(1); opacity: 0.2; }
          50% { transform: scale(1.05); opacity: 0.4; }
        }
        
        /* 📱 Responsive Design */
        @media (max-width: 768px) {
          h2 { font-size: 2rem !important; }
          .grid { grid-template-columns: 1fr !important; }
        }
        
        @media (max-width: 480px) {
          h2 { font-size: 1.8rem !important; }
        }
      `}</style>
    </div>
  );
};

export default WeatherStep;
