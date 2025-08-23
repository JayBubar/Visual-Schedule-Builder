import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MorningMeetingStepProps, WeatherStepData } from '../types/morningMeetingTypes';

// Interfaces (unchanged)
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
  currentDate = new Date(),
  onNext,
  onBack,
  onDataUpdate,
  stepData,
  hubSettings,
  onStepComplete
}) => {
  // 🎯 STATE MANAGEMENT
  const [currentSection, setCurrentSection] = useState(0);
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(stepData?.currentWeather || null);
  const [selectedClothing, setSelectedClothing] = useState<string[]>(stepData?.selectedClothing || []);
  const [weatherRevealed, setWeatherRevealed] = useState(stepData?.sectionProgress?.weatherRevealed || false);
  const [clothingGameComplete, setClothingGameComplete] = useState(stepData?.sectionProgress?.clothingGameComplete || false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');
  
  const selectedVideos = hubSettings?.videos?.weatherClothing || [];

  // 🌱 SEASON DETECTION
  const season = useMemo((): SeasonInfo => {
    const month = currentDate.getMonth() + 1;
    if (month >= 3 && month <= 5) return { name: 'Spring', emoji: '🌸', color: '#10B981', bgGradient: '...' };
    if (month >= 6 && month <= 8) return { name: 'Summer', emoji: '☀️', color: '#F59E0B', bgGradient: '...' };
    if (month >= 9 && month <= 11) return { name: 'Fall', emoji: '🍂', color: '#EF4444', bgGradient: '...' };
    return { name: 'Winter', emoji: '❄️', color: '#3B82F6', bgGradient: '...' };
  }, [currentDate]);

  // 🎲 MOCK WEATHER (FALLBACK)
  const generateMockWeather = useCallback((): WeatherData => {
    const conditions = ['sunny', 'cloudy', 'rainy', 'snowy', 'windy', 'foggy', 'partly cloudy', 'stormy'];
    let seasonalConditions = conditions;
    if (season.name === 'Winter') seasonalConditions = conditions.filter(c => ['snowy', 'cloudy', 'windy', 'foggy'].includes(c.toLowerCase()));
    else if (season.name === 'Summer') seasonalConditions = conditions.filter(c => ['sunny', 'clear', 'partly cloudy', 'cloudy'].includes(c.toLowerCase()));
    else seasonalConditions = conditions.filter(c => ['rainy', 'cloudy', 'windy', 'partly cloudy', 'sunny'].includes(c.toLowerCase()));
    const randomCondition = seasonalConditions[Math.floor(Math.random() * seasonalConditions.length)] || 'sunny';
    let baseTemp = 70, variance = 15;
    if (season.name === 'Winter') { baseTemp = 32; variance = 25; } 
    else if (season.name === 'Fall') { baseTemp = 55; variance = 20; } 
    else if (season.name === 'Spring') { baseTemp = 65; variance = 20; } 
    else if (season.name === 'Summer') { baseTemp = 82; variance = 18; }
    const tempVariance = Math.floor(Math.random() * variance) - (variance / 2);
    const temperature = Math.round(Math.max(10, Math.min(105, baseTemp + tempVariance)));
    return { temperature, temperatureUnit: 'F', condition: randomCondition.charAt(0).toUpperCase() + randomCondition.slice(1), clothingRecommendations: [], description: `${randomCondition} weather for ${season.name.toLowerCase()}` };
  }, [season.name]);
  
  // 🌐 WEATHER API CONNECTION
  useEffect(() => {
    const fetchAndSetWeather = async () => {
      if (hubSettings?.weatherAPI?.enabled && hubSettings?.weatherAPI?.apiKey && hubSettings?.weatherAPI?.zipCode) {
        try {
          const { apiKey, zipCode } = hubSettings.weatherAPI;
          const url = `https://api.openweathermap.org/data/2.5/weather?zip=${zipCode},us&appid=${apiKey}&units=imperial`;
          const response = await fetch(url);
          if (!response.ok) throw new Error('Weather API request failed');
          const data = await response.json();
          const liveWeather: WeatherData = {
            temperature: Math.round(data.main.temp),
            temperatureUnit: 'F',
            condition: data.weather[0]?.main || 'Clear',
            description: data.weather[0]?.description || 'Clear skies',
            humidity: data.main.humidity,
            clothingRecommendations: [],
          };
          setCurrentWeather(liveWeather);
        } catch (error) {
          console.error("Weather API Error:", error, "Falling back to mock data.");
          setCurrentWeather(generateMockWeather());
        }
      } else {
        setCurrentWeather(generateMockWeather());
      }
    };
    if (!currentWeather) {
      fetchAndSetWeather();
    }
  }, [hubSettings, currentWeather, generateMockWeather]);

  //  HELPER FUNCTIONS
  const getWeatherEmoji = (condition: string): string => {
    const cond = condition.toLowerCase();
    if (cond.includes('sun') || cond.includes('clear')) return '☀️';
    if (cond.includes('rain')) return '🌧️';
    if (cond.includes('snow')) return '❄️';
    if (cond.includes('cloud')) return '☁️';
    if (cond.includes('wind')) return '💨';
    return '🌤️';
  };

  const triggerCelebration = (message: string) => {
    setCelebrationMessage(message);
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 2500);
  };

  // 🧭 NAVIGATION & INTERACTION
  const nextSection = () => { 
    if (currentSection < 2) {
      setCurrentSection(currentSection + 1); 
    } else {
      // Step is complete - call onStepComplete instead of onNext
      onStepComplete?.();
    }
  };
  const prevSection = () => { if (currentSection > 0) setCurrentSection(currentSection - 1); else onBack?.(); };

  // ✨ FIX IS HERE ✨
  const revealWeather = () => {
    setWeatherRevealed(true);
    triggerCelebration("Great job! Here is today's weather! 🌤️");
    // The auto-advance setTimeout that was here has been removed!
  };
  
  // ... (rest of the component logic is unchanged)

  const clothingDatabase: ClothingItem[] = useMemo(() => [ /* ... clothing data ... */ ], []);
  const getClothingSuggestions = useCallback((weather: WeatherData): ClothingItem[] => { /* ... suggestion logic ... */ return []; }, [clothingDatabase]);
  const getWeatherSafetyTips = (weather: WeatherData | null): WeatherSafetyTip[] => { /* ... safety logic ... */ return []; };
  const selectClothing = (item: ClothingItem) => { /* ... selection logic ... */ };
  useEffect(() => { /* ... clothing game completion logic ... */ }, [selectedClothing]);

  const renderWeatherDiscovery = () => (
      <>
        <h2 style={styles.sectionTitle}>What's the weather like today? 🌤️</h2>
        <div style={styles.discoveryBox}>
          <div style={{ ...styles.discoveryEmoji, filter: weatherRevealed ? 'blur(0px)' : 'blur(15px)' }}>{currentWeather ? getWeatherEmoji(currentWeather.condition) : '☀️'}</div>
          <div style={{ ...styles.discoveryData, filter: weatherRevealed ? 'blur(0px)' : 'blur(8px)' }}>
            {currentWeather && (<><div style={styles.discoveryTemp}>{currentWeather.temperature}°{currentWeather.temperatureUnit}</div><div style={styles.discoveryCondition}>{currentWeather.condition}</div><div style={styles.discoveryDescription}>{currentWeather.description}</div></>)}
          </div>
          {!weatherRevealed ? (<button onClick={revealWeather} style={styles.revealButton}>🔍 Reveal Today's Weather!</button>) : (<div style={styles.revealedMessage}>⭐ Amazing! Now let's get dressed! ⭐</div>)}
        </div>
      </>
  );

  const renderClothingSelection = () => { /* ... clothing section render logic ... */ return null; };
  const renderWeatherSafety = () => { /* ... safety section render logic ... */ return null; };
  
  const sections = [renderWeatherDiscovery, renderClothingSelection, renderWeatherSafety];

  return (
    <div style={styles.pageContainer}>
      <div style={styles.sidebar}><div style={styles.sidebarTitle}><div>Talk</div><div>About</div><div>The</div><div>Weather</div></div><div style={{...styles.sidebarIcon, top: '20px'}}>🌤️</div><div style={{...styles.sidebarIcon, bottom: '20px'}}>🌈</div></div>
      <div style={styles.mainContent}>
        {selectedVideos.length > 0 && (<div style={{ position: 'absolute', top: '30px', right: '30px', zIndex: 100 }}><button onClick={() => window.open(selectedVideos[0].url, 'weather-video')} style={styles.videoButton}>📹 Weather Video</button></div>)}
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}><h2 style={styles.mainHeader}>{season.emoji} {season.name} Weather & Clothing Fun</h2></div>
        <div style={styles.contentBox}>{sections[currentSection]()}</div>
      </div>
      {showCelebration && <div style={styles.celebrationOverlay}><div style={styles.celebrationMessage}>{celebrationMessage}</div></div>}
    </div>
  );
};

// --- STYLES OBJECT ---
const baseButton: React.CSSProperties = { /* ... base button styles ... */ };
const styles: { [key: string]: React.CSSProperties } = { /* ... all style definitions ... */ };

export default WeatherStep;
