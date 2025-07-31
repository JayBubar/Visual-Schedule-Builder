import axios from 'axios';
import { WeatherData } from '../types';

// Weather service for fetching weather data
export class WeatherService {
  private readonly API_BASE_URL = 'https://api.openweathermap.org/data/2.5';
  private readonly DEFAULT_API_KEY = 'demo_key'; // Users will need to get their own
  
  constructor(private apiKey?: string) {
    this.apiKey = apiKey || this.DEFAULT_API_KEY;
  }

  async getCurrentWeather(location: string, units: 'F' | 'C' = 'F'): Promise<WeatherData> {
    try {
      // Convert units for API call
      const apiUnits = units === 'F' ? 'imperial' : 'metric';
      
      const response = await axios.get(`${this.API_BASE_URL}/weather`, {
        params: {
          q: location,
          appid: this.apiKey,
          units: apiUnits
        },
        timeout: 10000 // 10 second timeout
      });

      const data = response.data;
      
      return {
        location: data.name + (data.sys?.country ? `, ${data.sys.country}` : ''),
        condition: this.mapWeatherCondition(data.weather[0]?.main || 'Clear'),
        temperature: Math.round(data.main?.temp || 72),
        temperatureUnit: units,
        icon: this.getWeatherEmoji(data.weather[0]?.main || 'Clear'),
        description: this.getKidFriendlyDescription(data.weather[0]?.description || 'nice weather'),
        timestamp: new Date().toISOString(),
        apiSource: 'openweathermap'
      };
    } catch (error) {
      console.error('Weather API error:', error);
      
      // Return fallback weather data
      return this.getFallbackWeather(location, units);
    }
  }

  private mapWeatherCondition(condition: string): string {
    const conditionMap: { [key: string]: string } = {
      'Clear': 'sunny',
      'Clouds': 'cloudy',
      'Rain': 'rainy',
      'Drizzle': 'rainy',
      'Thunderstorm': 'stormy',
      'Snow': 'snowy',
      'Mist': 'foggy',
      'Fog': 'foggy',
      'Haze': 'foggy'
    };
    
    return conditionMap[condition] || 'partly cloudy';
  }

  private getWeatherEmoji(condition: string): string {
    const emojiMap: { [key: string]: string } = {
      'Clear': '☀️',
      'Clouds': '☁️',
      'Rain': '🌧️',
      'Drizzle': '🌦️',
      'Thunderstorm': '⛈️',
      'Snow': '❄️',
      'Mist': '🌫️',
      'Fog': '🌫️',
      'Haze': '🌫️'
    };
    
    return emojiMap[condition] || '⛅';
  }

  private getKidFriendlyDescription(description: string): string {
    const friendlyMap: { [key: string]: string } = {
      'clear sky': 'Beautiful sunny day! Perfect for outdoor activities! ☀️',
      'few clouds': 'Mostly sunny with some fluffy clouds! 🌤️',
      'scattered clouds': 'Partly cloudy - some sun, some clouds! ⛅',
      'broken clouds': 'Cloudy but still a nice day! ☁️',
      'overcast clouds': 'Gray and cloudy today! ☁️',
      'light rain': 'Light rain - time for umbrellas! 🌦️',
      'moderate rain': 'Rainy day - perfect for indoor activities! 🌧️',
      'heavy rain': 'Heavy rain - stay warm and dry inside! 🌧️',
      'thunderstorm': 'Thunder and lightning - exciting weather! ⛈️',
      'snow': 'Snow day! Time for winter fun! ❄️',
      'mist': 'Misty and mysterious morning! 🌫️',
      'fog': 'Foggy day - can you see through the clouds? 🌫️'
    };
    
    // Try to find exact match first
    const lowercaseDesc = description.toLowerCase();
    if (friendlyMap[lowercaseDesc]) {
      return friendlyMap[lowercaseDesc];
    }
    
    // Try partial matches
    for (const [key, value] of Object.entries(friendlyMap)) {
      if (lowercaseDesc.includes(key.split(' ')[0])) {
        return value;
      }
    }
    
    // Default fallback
    return `Today's weather: ${description}! Let's talk about what we see outside! 🌤️`;
  }

  private getFallbackWeather(location: string, units: 'F' | 'C'): WeatherData {
    return {
      location: location,
      condition: 'partly cloudy',
      temperature: units === 'F' ? 72 : 22,
      temperatureUnit: units,
      icon: '⛅',
      description: 'Weather information temporarily unavailable. Let\'s look outside and describe what we see! 🌤️',
      timestamp: new Date().toISOString(),
      apiSource: 'fallback'
    };
  }

  // Get weather discussion prompts for teachers
  getDiscussionPrompts(weather: WeatherData): string[] {
    const basePrompts = [
      `Today it's ${weather.temperature}°${weather.temperatureUnit}. Is that hot, cold, or just right?`,
      `What do you think we should wear outside today?`,
      `How does this weather make you feel?`,
      `What activities could we do in this weather?`
    ];

    const conditionPrompts: { [key: string]: string[] } = {
      'sunny': [
        'Can you see any shadows? Where do shadows come from?',
        'What happens when we go from shade to sunshine?',
        'Why do we need to wear sunscreen on sunny days?'
      ],
      'cloudy': [
        'What shapes do you see in the clouds?',
        'Do you think it might rain later?',
        'How do clouds form in the sky?'
      ],
      'rainy': [
        'What sounds does rain make?',
        'Where does rain come from?',
        'What do plants and animals need rain for?'
      ],
      'snowy': [
        'How are snowflakes different from raindrops?',
        'What can we build with snow?',
        'How do animals stay warm in the snow?'
      ],
      'stormy': [
        'What causes thunder and lightning?',
        'How can we stay safe during storms?',
        'What do you do when you hear thunder?'
      ]
    };

    const specificPrompts = conditionPrompts[weather.condition] || [];
    return [...basePrompts, ...specificPrompts];
  }

  // Check if API key is valid (basic validation)
  validateApiKey(apiKey: string): boolean {
    return apiKey && apiKey.length >= 32 && apiKey !== 'demo_key';
  }

  // Get setup instructions for teachers
  static getSetupInstructions(): string {
    return `
To get live weather data:

1. Go to https://openweathermap.org/api
2. Sign up for a free account
3. Get your API key from your account dashboard
4. Enter the API key in Calendar Settings
5. The free plan includes 1,000 API calls per day

Without an API key, the calendar will show sample weather data and encourage students to look outside and describe what they see!
    `.trim();
  }
}

// Weather data cache for offline/fallback scenarios
export class WeatherCache {
  private static readonly CACHE_KEY = 'weatherCache';
  private static readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  static save(location: string, weather: WeatherData): void {
    try {
      const cache = {
        [location]: {
          data: weather,
          timestamp: Date.now()
        }
      };
      
      const existing = this.getAll();
      const updated = { ...existing, ...cache };
      
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving weather cache:', error);
    }
  }

  static get(location: string): WeatherData | null {
    try {
      const cache = this.getAll();
      const entry = cache[location];
      
      if (!entry) return null;
      
      const age = Date.now() - entry.timestamp;
      if (age > this.CACHE_DURATION) {
        return null; // Cache expired
      }
      
      return entry.data;
    } catch (error) {
      console.error('Error reading weather cache:', error);
      return null;
    }
  }

  private static getAll(): { [location: string]: { data: WeatherData; timestamp: number } } {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      return cached ? JSON.parse(cached) : {};
    } catch (error) {
      return {};
    }
  }

  static clear(): void {
    localStorage.removeItem(this.CACHE_KEY);
  }
}