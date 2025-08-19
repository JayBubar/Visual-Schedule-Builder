import React, { useState, useEffect } from 'react';

interface SeasonalLearningStepProps {
  onNext: () => void;
  onBack: () => void;
  currentDate: Date;
  weather?: {
    condition: string;
    temperature: number;
    temperatureUnit?: 'F' | 'C';
    icon: string;
  } | null;
}

interface SeasonalActivity {
  id: string;
  title: string;
  description: string;
  emoji: string;
  category: 'vocabulary' | 'observation' | 'movement' | 'science' | 'art';
  duration: string;
  materials?: string[];
  instructions: string[];
}

interface SeasonalTheme {
  season: string;
  emoji: string;
  colors: string[];
  vocabulary: string[];
  activities: SeasonalActivity[];
  characteristics: string[];
}

const SEASONAL_THEMES: { [key: string]: SeasonalTheme } = {
  spring: {
    season: 'Spring',
    emoji: '🌸',
    colors: ['#90EE90', '#98FB98', '#FFB6C1'],
    vocabulary: ['bloom', 'grow', 'rain', 'flowers', 'green', 'warm', 'birds', 'nest'],
    characteristics: [
      'Plants start to grow and bloom',
      'Animals wake up from winter sleep',
      'Days get longer and warmer',
      'Rain helps plants grow'
    ],
    activities: [
      {
        id: 'spring-vocab',
        title: 'Spring Words',
        description: 'Learn new spring vocabulary words',
        emoji: '🌱',
        category: 'vocabulary',
        duration: '3 minutes',
        instructions: [
          'Say each spring word together',
          'Talk about what each word means',
          'Look for spring things outside our window'
        ]
      },
      {
        id: 'spring-observation',
        title: 'Spring Detective',
        description: 'Look for signs of spring around us',
        emoji: '🔍',
        category: 'observation',
        duration: '4 minutes',
        instructions: [
          'Look outside for signs of spring',
          'What colors do you see?',
          'Are there any flowers or new leaves?',
          'Share what you observe with friends'
        ]
      },
      {
        id: 'spring-movement',
        title: 'Growing Like Plants',
        description: 'Move your body like spring plants',
        emoji: '🌿',
        category: 'movement',
        duration: '2 minutes',
        instructions: [
          'Start curled up like a seed',
          'Slowly grow and stretch up tall',
          'Sway gently like flowers in the breeze',
          'Reach your arms up to the sunshine'
        ]
      }
    ]
  },
  summer: {
    season: 'Summer',
    emoji: '☀️',
    colors: ['#FFD700', '#FF6347', '#00CED1'],
    vocabulary: ['hot', 'sunny', 'vacation', 'swim', 'beach', 'ice cream', 'play', 'outside'],
    characteristics: [
      'The hottest time of the year',
      'Long, sunny days',
      'Time for swimming and outdoor fun',
      'Many fruits and vegetables grow'
    ],
    activities: [
      {
        id: 'summer-vocab',
        title: 'Summer Fun Words',
        description: 'Explore exciting summer vocabulary',
        emoji: '🏖️',
        category: 'vocabulary',
        duration: '3 minutes',
        instructions: [
          'Practice summer words together',
          'Talk about summer activities you enjoy',
          'Share your favorite summer memories'
        ]
      },
      {
        id: 'summer-science',
        title: 'Sun and Shadows',
        description: 'Learn about sunshine and shadows',
        emoji: '🌞',
        category: 'science',
        duration: '4 minutes',
        instructions: [
          'Look at how sunlight comes through windows',
          'Make shadows with your hands',
          'Notice how shadows change during the day',
          'Talk about why we need sun protection'
        ]
      },
      {
        id: 'summer-movement',
        title: 'Summer Sports',
        description: 'Move like summer athletes',
        emoji: '🏊',
        category: 'movement',
        duration: '2 minutes',
        instructions: [
          'Pretend to swim in a pool',
          'Throw an imaginary beach ball',
          'Run in place like playing tag',
          'Stretch like you\'re reaching for the sun'
        ]
      }
    ]
  },
  fall: {
    season: 'Fall/Autumn',
    emoji: '🍂',
    colors: ['#FF8C00', '#DC143C', '#B8860B'],
    vocabulary: ['leaves', 'falling', 'harvest', 'pumpkin', 'orange', 'cool', 'acorns', 'cozy'],
    characteristics: [
      'Leaves change colors and fall',
      'Weather gets cooler',
      'Time to harvest crops',
      'Animals prepare for winter'
    ],
    activities: [
      {
        id: 'fall-vocab',
        title: 'Autumn Words',
        description: 'Discover beautiful fall vocabulary',
        emoji: '🍁',
        category: 'vocabulary',
        duration: '3 minutes',
        instructions: [
          'Say fall words with expression',
          'Talk about what happens in autumn',
          'Describe the colors you see outside'
        ]
      },
      {
        id: 'fall-observation',
        title: 'Leaf Detective',
        description: 'Observe how leaves change',
        emoji: '🔍',
        category: 'observation',
        duration: '4 minutes',
        instructions: [
          'Look at trees outside our window',
          'What colors do you see on the leaves?',
          'Are any leaves falling?',
          'Talk about why leaves change colors'
        ]
      },
      {
        id: 'fall-movement',
        title: 'Falling Leaves',
        description: 'Move like autumn leaves',
        emoji: '🍃',
        category: 'movement',
        duration: '2 minutes',
        instructions: [
          'Stand tall like a tree',
          'Sway gently in the autumn breeze',
          'Flutter down like falling leaves',
          'Curl up on the ground like a pile of leaves'
        ]
      }
    ]
  },
  winter: {
    season: 'Winter',
    emoji: '❄️',
    colors: ['#87CEEB', '#FFFFFF', '#4682B4'],
    vocabulary: ['cold', 'snow', 'ice', 'mittens', 'coat', 'hot chocolate', 'cozy', 'fireplace'],
    characteristics: [
      'The coldest time of the year',
      'Some places get snow and ice',
      'Animals stay warm in different ways',
      'Days are shorter and nights are longer'
    ],
    activities: [
      {
        id: 'winter-vocab',
        title: 'Winter Words',
        description: 'Learn cozy winter vocabulary',
        emoji: '⛄',
        category: 'vocabulary',
        duration: '3 minutes',
        instructions: [
          'Practice winter words together',
          'Talk about staying warm in winter',
          'Share what you like about cold weather'
        ]
      },
      {
        id: 'winter-science',
        title: 'Staying Warm',
        description: 'Learn how we stay warm in winter',
        emoji: '🧥',
        category: 'science',
        duration: '4 minutes',
        instructions: [
          'Talk about winter clothes and why we wear them',
          'Feel different materials - which ones are warmer?',
          'Discuss how animals stay warm in winter',
          'Think about warm activities we do inside'
        ]
      },
      {
        id: 'winter-movement',
        title: 'Winter Fun',
        description: 'Move like winter activities',
        emoji: '⛷️',
        category: 'movement',
        duration: '2 minutes',
        instructions: [
          'Pretend to build a snowman',
          'Slide and glide like ice skating',
          'Shiver and then warm up by the fireplace',
          'March in place to stay warm'
        ]
      }
    ]
  }
};

const SeasonalLearningStep: React.FC<SeasonalLearningStepProps> = ({
  onNext,
  onBack,
  currentDate,
  weather
}) => {
  const [currentActivity, setCurrentActivity] = useState<SeasonalActivity | null>(null);
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const [showVocabulary, setShowVocabulary] = useState(true);
  const [activityStarted, setActivityStarted] = useState(false);

  // Determine current season based on date
  const getCurrentSeason = (): string => {
    const month = currentDate.getMonth(); // 0-11
    
    if (month >= 2 && month <= 4) return 'spring'; // March, April, May
    if (month >= 5 && month <= 7) return 'summer'; // June, July, August  
    if (month >= 8 && month <= 10) return 'fall'; // September, October, November
    return 'winter'; // December, January, February
  };

  const currentSeason = getCurrentSeason();
  const seasonalTheme = SEASONAL_THEMES[currentSeason];

  // Auto-start with vocabulary display
  useEffect(() => {
    setShowVocabulary(true);
    setCurrentActivity(null);
    setActivityStarted(false);
  }, [currentSeason]);

  const startActivity = (activity: SeasonalActivity) => {
    setCurrentActivity(activity);
    setShowVocabulary(false);
    setActivityStarted(true);
  };

  const nextActivity = () => {
    const activities = seasonalTheme.activities;
    const nextIndex = (currentActivityIndex + 1) % activities.length;
    setCurrentActivityIndex(nextIndex);
    setCurrentActivity(activities[nextIndex]);
  };

  const backToVocabulary = () => {
    setCurrentActivity(null);
    setShowVocabulary(true);
    setActivityStarted(false);
  };

  // Get season-appropriate weather connection
  const getWeatherConnection = () => {
    if (!weather) return '';
    
    const temp = weather.temperature;
    const condition = weather.condition.toLowerCase();
    
    if (currentSeason === 'spring') {
      if (condition.includes('rain')) return "Spring rain helps flowers grow! 🌧️🌸";
      if (temp > 60) return "Perfect spring weather for plants to grow! 🌱";
      return "Spring is here - time for new growth! 🌿";
    }
    
    if (currentSeason === 'summer') {
      if (temp > 80) return "Hot summer weather - great for swimming! 🏊‍♀️";
      if (condition.includes('sun')) return "Sunny summer day - perfect for playing outside! ☀️";
      return "Summer warmth brings lots of outdoor fun! 🏖️";
    }
    
    if (currentSeason === 'fall') {
      if (temp < 60) return "Cool fall weather - leaves are changing! 🍂";
      if (condition.includes('wind')) return "Autumn wind blows the colorful leaves! 🍃";
      return "Fall weather is perfect for cozy activities! 🧡";
    }
    
    if (currentSeason === 'winter') {
      if (temp < 40) return "Cold winter weather - time to bundle up! 🧥";
      if (condition.includes('snow')) return "Winter snow makes everything beautiful! ❄️";
      return "Winter weather means staying warm and cozy! ⛄";
    }
    
    return '';
  };

  return (
    <div style={{
      padding: '2rem',
      textAlign: 'center',
      minHeight: '600px',
      background: `linear-gradient(135deg, ${seasonalTheme.colors[0]}40, ${seasonalTheme.colors[1]}40, ${seasonalTheme.colors[2]}40)`,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{
          fontSize: '2.5rem',
          fontWeight: '700',
          color: 'white',
          marginBottom: '0.5rem',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem'
        }}>
          {seasonalTheme.emoji} {seasonalTheme.season} Learning
        </h2>
        <p style={{
          fontSize: '1.3rem',
          color: 'rgba(255,255,255,0.9)',
          marginBottom: '1rem'
        }}>
          Let's explore what makes {seasonalTheme.season.toLowerCase()} special!
        </p>
        
        {/* Weather Connection */}
        {weather && (
          <div style={{
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '12px',
            padding: '1rem',
            marginTop: '1rem',
            fontSize: '1.1rem',
            color: 'white',
            fontWeight: '600'
          }}>
            {getWeatherConnection()}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '2rem',
        flex: 1,
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        
        {/* Vocabulary Section */}
        {showVocabulary && (
          <div>
            <h3 style={{
              fontSize: '2rem',
              color: 'white',
              marginBottom: '1.5rem',
              fontWeight: '600'
            }}>
              {seasonalTheme.season} Words & Facts
            </h3>
            
            {/* Season Characteristics */}
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '16px',
              padding: '1.5rem',
              marginBottom: '2rem'
            }}>
              <h4 style={{
                fontSize: '1.4rem',
                color: 'white',
                marginBottom: '1rem',
                fontWeight: '600'
              }}>
                What happens in {seasonalTheme.season.toLowerCase()}?
              </h4>
              <div style={{
                display: 'grid',
                gap: '0.75rem',
                textAlign: 'left'
              }}>
                {seasonalTheme.characteristics.map((fact, index) => (
                  <div key={index} style={{
                    fontSize: '1.1rem',
                    color: 'rgba(255,255,255,0.9)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <span style={{ color: seasonalTheme.colors[0], fontSize: '1.2rem' }}>•</span>
                    {fact}
                  </div>
                ))}
              </div>
            </div>

            {/* Vocabulary Words */}
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '16px',
              padding: '1.5rem',
              marginBottom: '2rem'
            }}>
              <h4 style={{
                fontSize: '1.4rem',
                color: 'white',
                marginBottom: '1rem',
                fontWeight: '600'
              }}>
                {seasonalTheme.season} Vocabulary
              </h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: '1rem'
              }}>
                {seasonalTheme.vocabulary.map((word, index) => (
                  <div key={index} style={{
                    background: `${seasonalTheme.colors[index % 3]}30`,
                    border: `2px solid ${seasonalTheme.colors[index % 3]}60`,
                    borderRadius: '12px',
                    padding: '1rem',
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '1.1rem',
                    textTransform: 'capitalize',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.background = `${seasonalTheme.colors[index % 3]}50`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.background = `${seasonalTheme.colors[index % 3]}30`;
                  }}
                  >
                    {word}
                  </div>
                ))}
              </div>
            </div>

            {/* Activity Selection */}
            <div>
              <h4 style={{
                fontSize: '1.4rem',
                color: 'white',
                marginBottom: '1rem',
                fontWeight: '600'
              }}>
                Choose a {seasonalTheme.season} Activity
              </h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1rem'
              }}>
                {seasonalTheme.activities.map((activity) => (
                  <button
                    key={activity.id}
                    onClick={() => startActivity(activity)}
                    style={{
                      background: 'rgba(255,255,255,0.15)',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderRadius: '16px',
                      padding: '1.5rem',
                      color: 'white',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.background = 'rgba(255,255,255,0.25)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{
                      fontSize: '2rem',
                      marginBottom: '0.5rem'
                    }}>
                      {activity.emoji}
                    </div>
                    <h5 style={{
                      fontSize: '1.2rem',
                      fontWeight: '600',
                      marginBottom: '0.5rem'
                    }}>
                      {activity.title}
                    </h5>
                    <p style={{
                      fontSize: '0.9rem',
                      opacity: 0.8,
                      marginBottom: '0.5rem'
                    }}>
                      {activity.description}
                    </p>
                    <div style={{
                      fontSize: '0.8rem',
                      opacity: 0.7,
                      fontWeight: '600'
                    }}>
                      Duration: {activity.duration}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Activity Display */}
        {currentActivity && (
          <div>
            <button
              onClick={backToVocabulary}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '8px',
                color: 'white',
                padding: '0.5rem 1rem',
                fontSize: '0.9rem',
                cursor: 'pointer',
                marginBottom: '2rem',
                alignSelf: 'flex-start'
              }}
            >
              ← Back to {seasonalTheme.season} Words
            </button>

            <div style={{
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '16px',
              padding: '2rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
                {currentActivity.emoji}
              </div>
              <h3 style={{
                fontSize: '2rem',
                color: 'white',
                marginBottom: '1rem',
                fontWeight: '600'
              }}>
                {currentActivity.title}
              </h3>
              <p style={{
                fontSize: '1.2rem',
                color: 'rgba(255,255,255,0.9)',
                marginBottom: '2rem'
              }}>
                {currentActivity.description}
              </p>

              {/* Instructions */}
              <div style={{
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '1.5rem',
                marginBottom: '2rem',
                textAlign: 'left'
              }}>
                <h4 style={{
                  fontSize: '1.3rem',
                  color: 'white',
                  marginBottom: '1rem',
                  fontWeight: '600',
                  textAlign: 'center'
                }}>
                  Let's Try This Together!
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {currentActivity.instructions.map((instruction, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '1rem',
                      fontSize: '1.1rem',
                      color: 'rgba(255,255,255,0.9)'
                    }}>
                      <div style={{
                        background: seasonalTheme.colors[0],
                        color: 'white',
                        borderRadius: '50%',
                        width: '2rem',
                        height: '2rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '600',
                        fontSize: '1rem',
                        flexShrink: 0
                      }}>
                        {index + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        {instruction}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity Controls */}
              <div style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'center'
              }}>
                <button
                  onClick={nextActivity}
                  style={{
                    background: `${seasonalTheme.colors[1]}80`,
                    border: 'none',
                    borderRadius: '12px',
                    color: 'white',
                    padding: '1rem 2rem',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.background = `${seasonalTheme.colors[1]}90`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.background = `${seasonalTheme.colors[1]}80`;
                  }}
                >
                  Try Another Activity
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: '1rem',
        marginTop: '2rem'
      }}>
        <button
          onClick={onBack}
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: '2px solid rgba(255,255,255,0.3)',
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
          ← Back to Weather & Clothing
        </button>
        
        <button
          onClick={onNext}
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
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(34, 197, 94, 0.4)'
          }}
        >
          Continue to Celebrations →
        </button>
      </div>
    </div>
  );
};

export default SeasonalLearningStep;
