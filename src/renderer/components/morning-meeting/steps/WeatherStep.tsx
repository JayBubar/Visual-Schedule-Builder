import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MorningMeetingStepProps, WeatherStepData } from '../types/morningMeetingTypes';

// Interfaces from original file
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
  hubSettings
}) => {
  // 🎯 STATE MANAGEMENT - From original file
  const [currentSection, setCurrentSection] = useState(0);
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(stepData?.currentWeather || null);
  const [selectedClothing, setSelectedClothing] = useState<string[]>(stepData?.selectedClothing || []);
  const [weatherRevealed, setWeatherRevealed] = useState(stepData?.sectionProgress?.weatherRevealed || false);
  const [clothingGameComplete, setClothingGameComplete] = useState(stepData?.sectionProgress?.clothingGameComplete || false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');
  
  const selectedVideos = hubSettings?.videos?.weatherClothing || [];

  // 🌱 SEASON DETECTION - From original file
  const season = useMemo((): SeasonInfo => {
    const month = currentDate.getMonth() + 1;
    if (month >= 3 && month <= 5) return { name: 'Spring', emoji: '🌸', color: '#10B981', bgGradient: '...' };
    if (month >= 6 && month <= 8) return { name: 'Summer', emoji: '☀️', color: '#F59E0B', bgGradient: '...' };
    if (month >= 9 && month <= 11) return { name: 'Fall', emoji: '🍂', color: '#EF4444', bgGradient: '...' };
    return { name: 'Winter', emoji: '❄️', color: '#3B82F6', bgGradient: '...' };
  }, [currentDate]);

  // 💾 DATA PERSISTENCE - From original file
  const handleDataUpdate = useCallback(() => {
    if (currentSection > 0 || selectedClothing.length > 0 || weatherRevealed) {
      const getCustomVocabulary = (): string[] => {
        if (hubSettings?.customVocabulary?.weather?.length > 0) return hubSettings.customVocabulary.weather;
        if (hubSettings?.weatherAPI?.customVocabulary?.length > 0) return hubSettings.weatherAPI.customVocabulary;
        return ['sunny', 'cloudy', 'rainy', 'snowy', 'windy', 'foggy', 'partly cloudy', 'stormy'];
      };
      const data: WeatherStepData = {
        currentWeather,
        selectedClothing,
        customVocabulary: getCustomVocabulary(),
        completedAt: currentSection === 2 ? new Date().toISOString() : undefined,
        sectionProgress: { weatherRevealed, clothingGameComplete, currentSection }
      };
      onDataUpdate(data);
    }
  }, [currentWeather, selectedClothing, currentSection, weatherRevealed, clothingGameComplete, hubSettings, onDataUpdate]);

  useEffect(() => { handleDataUpdate() }, [handleDataUpdate]);

  // 🎨 CLOTHING DATABASE - From original file
  const clothingDatabase: ClothingItem[] = useMemo(() => [
    { item: 'shorts', emoji: '🩳', reason: 'Perfect for hot weather!', temperature: 'hot', weather: ['sunny', 'clear'] },
    { item: 't-shirt', emoji: '👕', reason: 'Stay cool and comfortable', temperature: 'hot', weather: ['sunny', 'clear', 'cloudy'] },
    { item: 'sunglasses', emoji: '🕶️', reason: 'Protect your eyes from bright sun!', temperature: 'hot', weather: ['sunny'] },
    { item: 'light jacket', emoji: '🧥', reason: 'Perfect for mild weather', temperature: 'warm', weather: ['cloudy', 'clear', 'partly cloudy'] },
    { item: 'long pants', emoji: '👖', reason: 'Comfortable for this temperature', temperature: 'warm', weather: ['cloudy', 'clear', 'windy'] },
    { item: 'sneakers', emoji: '👟', reason: 'Great for walking and playing', temperature: 'warm', weather: ['cloudy', 'clear'] },
    { item: 'sweater', emoji: '👔', reason: 'Keep warm and cozy', temperature: 'cool', weather: ['cloudy', 'windy'] },
    { item: 'jeans', emoji: '👖', reason: 'Warm and sturdy for cool days', temperature: 'cool', weather: ['cloudy', 'windy'] },
    { item: 'heavy coat', emoji: '🧥', reason: 'Stay very warm in cold weather!', temperature: 'cold', weather: ['snowy', 'windy'] },
    { item: 'warm boots', emoji: '🥾', reason: 'Keep feet warm and dry', temperature: 'cold', weather: ['snowy', 'rainy'] },
    { item: 'gloves', emoji: '🧤', reason: 'Protect your hands from cold', temperature: 'cold', weather: ['snowy', 'windy'] },
    { item: 'umbrella', emoji: '☂️', reason: 'Stay dry in the rain!', temperature: 'warm', weather: ['rainy', 'stormy'] },
  ], []);

  // 🎲 MOCK WEATHER (FALLBACK) - From original file
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
  
  // 🌐 WEATHER API CONNECTION - RESTORED & IMPLEMENTED
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


  // 👗 SMART CLOTHING SUGGESTIONS - From original file
  const getClothingSuggestions = useCallback((weather: WeatherData): ClothingItem[] => {
    const temp = weather.temperature;
    const condition = weather.condition.toLowerCase();
    let tempCategory: 'hot' | 'warm' | 'cool' | 'cold';
    if (temp >= 75) tempCategory = 'hot';
    else if (temp >= 60) tempCategory = 'warm';
    else if (temp >= 40) tempCategory = 'cool';
    else tempCategory = 'cold';
    const suggestions = clothingDatabase.filter(item => {
      const tempMatch = item.temperature === tempCategory;
      const weatherMatch = item.weather.some(w => condition.includes(w));
      return tempMatch || weatherMatch;
    });
    return [...new Set(suggestions)].slice(0, 4);
  }, [clothingDatabase]);

  // 🛡️ WEATHER SAFETY TIPS - From original file
  const getWeatherSafetyTips = (weather: WeatherData | null): WeatherSafetyTip[] => {
    if (!weather) return [];
    const tips: WeatherSafetyTip[] = [];
    const temp = weather.temperature;
    const condition = weather.condition.toLowerCase();
    if (temp >= 85) tips.push({ emoji: '💧', title: 'Stay Hydrated', description: 'Drink lots of water when it\'s very hot outside!' });
    if (temp >= 75) tips.push({ emoji: '🧴', title: 'Sunscreen Protection', description: 'Use sunscreen to protect your skin, even on warm days!' });
    if (temp <= 32) tips.push({ emoji: '🧤', title: 'Cover Exposed Skin', description: 'Wear gloves and hats to prevent frostbite on very cold days.' });
    if (temp <= 45) tips.push({ emoji: '🧥', title: 'Layer Up', description: 'Wear multiple layers so you can add or remove clothes.' });
    if ((condition.includes('rain') || condition.includes('storm')) && tips.length < 4) tips.push({ emoji: '⚡', title: 'Lightning Safety', description: 'Stay inside during thunderstorms!' });
    if (condition.includes('snow') && tips.length < 4) tips.push({ emoji: '⛄', title: 'Bundle Up', description: 'Wear waterproof boots and warm layers in the snow.' });
    if (tips.length < 4) tips.push({ emoji: '👥', title: 'Buddy System', description: 'Always stay with friends or family when playing outside!' });
    return tips.slice(0, 4);
  };
  
  // 🌤️ HELPER FUNCTIONS - From original file
  const getWeatherEmoji = (condition: string): string => {
    const cond = condition.toLowerCase();
    if (cond.includes('sun') || cond.includes('clear')) return '☀️';
    if (cond.includes('rain')) return '🌧️';
    if (cond.includes('snow')) return '❄️';
    if (cond.includes('cloud')) return '☁️';
    if (cond.includes('wind')) return '💨';
    if (cond.includes('fog')) return '🌫️';
    if (cond.includes('storm')) return '⛈️';
    return '🌤️';
  };

  const triggerCelebration = (message: string) => {
    setCelebrationMessage(message);
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 2500);
  };

  // 🧭 NAVIGATION & INTERACTION
  const nextSection = () => { if (currentSection < 2) setCurrentSection(currentSection + 1); else onNext?.(); };
  const prevSection = () => { if (currentSection > 0) setCurrentSection(currentSection - 1); else onBack?.(); };

  const revealWeather = () => {
    setWeatherRevealed(true);
    triggerCelebration("Great job! Here is today's weather! 🌤️");
    setTimeout(nextSection, 2500);
  };

  const selectClothing = (item: ClothingItem) => {
    const newSelected = selectedClothing.includes(item.item)
      ? selectedClothing.filter(i => i !== item.item)
      : [...selectedClothing, item.item];
    setSelectedClothing(newSelected);
  };

  useEffect(() => {
    if (selectedClothing.length >= 3 && !clothingGameComplete) {
      setClothingGameComplete(true);
      triggerCelebration("Perfect choices! You're ready for the day! 👕");
    } else if (selectedClothing.length < 3) {
        setClothingGameComplete(false);
    }
  }, [selectedClothing, clothingGameComplete]);

  // 🖌️ RENDER SECTIONS - Styled with new design
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

  const renderClothingSelection = () => {
    const clothingSuggestions = currentWeather ? getClothingSuggestions(currentWeather) : [];
    return (
      <>
        <h2 style={styles.sectionTitle}>Choose at least 3 items to wear! 👕</h2>
        <div style={styles.grid}>
          {clothingSuggestions.map((item) => {
            const isSelected = selectedClothing.includes(item.item);
            return (<button key={item.item} onClick={() => selectClothing(item)} style={{ ...styles.choiceButton, ...(isSelected ? styles.choiceButtonSelected : {}) }}><span style={{fontSize: '2em'}}>{item.emoji}</span>{item.item}</button>)
          })}
        </div>
        {clothingGameComplete && <div style={styles.revealedMessage}>Perfect! You picked some great clothes!</div>}
      </>
    );
  };

  const renderWeatherSafety = () => {
    const safetyTips = getWeatherSafetyTips(currentWeather);
    return (
      <>
        <h2 style={styles.sectionTitle}>Weather Safety Heroes! 🛡️</h2>
        <div style={{width: '100%', maxWidth: '900px', display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
          <div style={styles.grid}>
            {safetyTips.map((tip) => (<div key={tip.title} style={styles.safetyCard}><div style={styles.safetyCardEmoji}>{tip.emoji}</div><div style={styles.safetyCardTitle}>{tip.title}</div><div style={styles.safetyCardDesc}>{tip.description}</div></div>))}
          </div>
          <div style={styles.masteryReport}>
            <h4 style={styles.masteryTitle}>🌟 Today's Weather Mastery Report 🌟</h4>
            <div style={styles.masteryGrid}>
                <div style={styles.masteryItem}><strong>🌡️ Temp:</strong> {currentWeather?.temperature}°{currentWeather?.temperatureUnit}</div>
                <div style={styles.masteryItem}><strong>🌤️ Condition:</strong> {currentWeather?.condition}</div>
                <div style={styles.masteryItem}><strong>👗 Clothing:</strong> {selectedClothing.length} items picked!</div>
                <div style={styles.masteryItem}><strong>🍂 Season:</strong> {season.emoji} {season.name}</div>
            </div>
          </div>
        </div>
      </>
    );
  };
  
  const sections = [renderWeatherDiscovery, renderClothingSelection, renderWeatherSafety];

  return (
    <div style={styles.pageContainer}>
      <div style={styles.sidebar}><div style={styles.sidebarTitle}><div>Talk</div><div>About</div><div>The</div><div>Weather</div></div><div style={{...styles.sidebarIcon, top: '20px'}}>🌤️</div><div style={{...styles.sidebarIcon, bottom: '20px'}}>🌈</div></div>
      <div style={styles.mainContent}>
        {selectedVideos.length > 0 && (<div style={{ position: 'absolute', top: '30px', right: '30px', zIndex: 100 }}><button onClick={() => window.open(selectedVideos[0].url, 'weather-video')} style={styles.videoButton}>📹 Weather Video</button></div>)}
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}><h2 style={styles.mainHeader}>{season.emoji} {season.name} Weather & Clothing Fun</h2></div>
        <div style={styles.contentBox}>{sections[currentSection]()}</div>
        <div style={styles.navContainer}>
          <button onClick={prevSection} disabled={currentSection === 0} style={{...styles.navButton, opacity: currentSection === 0 ? 0.5 : 1, cursor: currentSection === 0 ? 'not-allowed' : 'pointer'}}>← Back</button>
          <div style={{ display: 'flex', gap: '0.5rem' }}>{[0, 1, 2].map(i => <div key={i} style={{...styles.navDot, background: i === currentSection ? 'white' : 'rgba(255, 255, 255, 0.4)'}} />)}</div>
          <button onClick={nextSection} style={styles.navButton} disabled={(currentSection === 1 && !clothingGameComplete)}>{currentSection === 2 ? 'Complete! 🎉' : 'Next →'}</button>
        </div>
      </div>
      {showCelebration && <div style={styles.celebrationOverlay}><div style={styles.celebrationMessage}>{celebrationMessage}</div></div>}
      <style>{`@keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }`}</style>
    </div>
  );
};

// --- STYLES OBJECT - Merging original logic with new design
const baseButton: React.CSSProperties = { background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)', border: '2px solid rgba(255, 255, 255, 0.3)', borderRadius: '15px', color: 'white', cursor: 'pointer', transition: 'all 0.3s ease', textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)', padding: '1rem 1.5rem', fontSize: '1.2rem', fontWeight: 600 };
const styles: { [key: string]: React.CSSProperties } = {
  pageContainer: { minHeight: '100vh', display: 'flex', background: 'linear-gradient(135deg, #FF9500 0%, #FF6B6B 50%, #9B59B6 100%)', fontFamily: 'system-ui, -apple-system, sans-serif', overflow: 'hidden' },
  sidebar: { width: '200px', background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', borderRight: '2px solid rgba(255, 255, 255, 0.2)', padding: '2rem 1rem', position: 'relative' },
  sidebarTitle: { fontSize: '2.5rem', fontWeight: 800, color: 'white', textShadow: '0 4px 8px rgba(0, 0, 0, 0.3)', letterSpacing: '0.2rem', lineHeight: '1.2', textAlign: 'center' },
  sidebarIcon: { position: 'absolute', fontSize: '2rem', opacity: 0.7 },
  mainContent: { flex: 1, display: 'flex', flexDirection: 'column', padding: '2rem', position: 'relative' },
  videoButton: { ...baseButton },
  mainHeader: { fontSize: '2rem', fontWeight: 700, color: 'white', textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)', margin: 0, paddingTop: '2rem' },
  contentBox: { flex: 1, background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(15px)', borderRadius: '20px', padding: '2rem', border: '2px solid rgba(255, 255, 255, 0.2)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '500px', position: 'relative', textAlign: 'center' },
  navContainer: { position: 'absolute', bottom: '30px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '1rem', alignItems: 'center' },
  navButton: { ...baseButton, padding: '0.8rem 1.5rem', fontSize: '1.1rem' },
  navDot: { width: '12px', height: '12px', borderRadius: '50%', transition: 'all 0.3s ease' },
  sectionTitle: { fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', fontWeight: 800, color: 'white', textShadow: '0 4px 8px rgba(0, 0, 0, 0.3)', marginBottom: '2rem', lineHeight: '1.2' },
  discoveryBox: { background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(15px)', borderRadius: '24px', padding: '3rem', border: '2px solid rgba(255, 255, 255, 0.3)', maxWidth: '500px', width: '100%' },
  discoveryEmoji: { fontSize: '6rem', marginBottom: '2rem', transition: 'filter 1s ease' },
  discoveryData: { transition: 'filter 1s ease', marginBottom: '2rem' },
  discoveryTemp: { fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: 800, color: 'white' },
  discoveryCondition: { fontSize: 'clamp(1.2rem, 3vw, 1.8rem)', color: 'rgba(255, 255, 255, 0.9)', fontWeight: 600, textTransform: 'capitalize' },
  discoveryDescription: { fontSize: 'clamp(0.9rem, 2vw, 1.1rem)', color: 'rgba(255, 255, 255, 0.8)', fontStyle: 'italic', textTransform: 'capitalize' },
  revealButton: { ...baseButton, background: 'linear-gradient(135deg, #FFD93D, #FF6B6B)', padding: '1.5rem 3rem', fontSize: '1.4rem' },
  revealedMessage: { fontSize: '1.3rem', color: 'rgba(255, 255, 255, 0.9)', fontWeight: 600, background: 'rgba(16, 185, 129, 0.3)', borderRadius: '12px', padding: '1rem 2rem', border: '2px solid rgba(16, 185, 129, 0.5)', marginTop: '1rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', width: '100%', maxWidth: '800px' },
  choiceButton: { ...baseButton, padding: '1.5rem', fontSize: '1.4rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', textTransform: 'capitalize' },
  choiceButtonSelected: { background: 'rgba(255, 255, 255, 0.4)', border: '2px solid white', transform: 'scale(1.05)' },
  safetyCard: { background: 'rgba(255, 255, 255, 0.15)', border: '2px solid rgba(255, 255, 255, 0.2)', borderRadius: '16px', padding: '1.5rem' },
  safetyCardEmoji: { fontSize: '2.5rem', marginBottom: '0.5rem'},
  safetyCardTitle: { fontSize: '1.2rem', fontWeight: 700, color: 'white' },
  safetyCardDesc: { fontSize: '1rem', color: 'rgba(255, 255, 255, 0.8)' },
  masteryReport: { background: 'linear-gradient(135deg, #FFD93D, #FF6B6B)', borderRadius: '20px', padding: '1.5rem', color: 'white' },
  masteryTitle: { margin: '0 0 1rem 0', fontSize: '1.3rem', fontWeight: '700', textShadow: '1px 1px 2px rgba(0,0,0,0.3)'},
  masteryGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', textAlign: 'left'},
  masteryItem: { background: 'rgba(255, 255, 255, 0.2)', borderRadius: '8px', padding: '0.5rem 1rem'},
  celebrationOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.2)', zIndex: 1000 },
  celebrationMessage: { padding: '2rem 3rem', background: 'linear-gradient(135deg, #10B981, #34D399)', color: 'white', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)', fontSize: '1.5rem', fontWeight: 700 },
};

export default WeatherStep;