import React, { useState, useEffect } from 'react';
import { MorningMeetingStepProps, SeasonalStepData } from '../types/morningMeetingTypes';

interface SeasonalActivity {
  id: string;
  title: string;
  description: string;
  emoji: string;
  category: 'vocabulary' | 'observation' | 'movement' | 'science' | 'art';
  duration: string;
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
    colors: ['#90EE90', '#98FB98'],
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
          'Do you hear any birds singing?'
        ]
      },
      {
        id: 'spring-movement',
        title: 'Growing Like Plants',
        description: 'Move and grow like spring plants',
        emoji: '🌿',
        category: 'movement',
        duration: '2 minutes',
        instructions: [
          'Start curled up like a seed',
          'Slowly grow up toward the sun',
          'Stretch your arms like branches',
          'Sway gently in the spring breeze'
        ]
      }
    ]
  },
  summer: {
    season: 'Summer',
    emoji: '☀️',
    colors: ['#FFD700', '#FF6347'],
    vocabulary: ['hot', 'sunny', 'beach', 'swimming', 'vacation', 'ice cream', 'picnic', 'camping'],
    characteristics: [
      'The warmest time of the year',
      'Long days and short nights',
      'Time for outdoor activities',
      'Many plants are fully grown'
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
          'Say summer words with excitement',
          'Talk about summer activities you love',
          'Share your favorite summer memories'
        ]
      },
      {
        id: 'summer-science',
        title: 'Staying Cool',
        description: 'Learn how to stay cool in summer',
        emoji: '🧊',
        category: 'science',
        duration: '4 minutes',
        instructions: [
          'Talk about what we do when it\'s very hot',
          'Why do we wear light colors in summer?',
          'How do animals stay cool?',
          'What happens to ice in the sun?'
        ]
      },
      {
        id: 'summer-movement',
        title: 'Summer Activities',
        description: 'Move like summer fun',
        emoji: '🏊',
        category: 'movement',
        duration: '2 minutes',
        instructions: [
          'Pretend to swim in a pool',
          'March like you\'re hiking',
          'Reach up to pick fruit from trees',
          'Fan yourself to stay cool'
        ]
      }
    ]
  },
  fall: {
    season: 'Fall/Autumn',
    emoji: '🍂',
    colors: ['#FF8C00', '#DC143C'],
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
    colors: ['#87CEEB', '#4682B4'],
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

const SeasonalStep: React.FC<MorningMeetingStepProps> = ({
  currentDate,
  onNext,
  onDataUpdate,
  stepData,
  hubSettings
}) => {
  const [currentActivity, setCurrentActivity] = useState<SeasonalActivity | null>(null);
  const [completedActivities, setCompletedActivities] = useState<string[]>(
    stepData?.completedActivities || []
  );
  const [learnedVocabulary, setLearnedVocabulary] = useState<string[]>(
    stepData?.learnedVocabulary || []
  );
  const [showVocabulary, setShowVocabulary] = useState(true);

  // Determine current season based on date
  const getCurrentSeason = (): string => {
    const month = currentDate.getMonth(); // 0-11
    
    if (month >= 2 && month <= 4) return 'spring'; // March, April, May
    if (month >= 5 && month <= 7) return 'summer'; // June, July, August  
    if (month >= 8 && month <= 10) return 'fall'; // September, October, November
    return 'winter'; // December, January, February
  };

  const currentSeason = getCurrentSeason();
  
  // Get vocabulary from hub settings or use defaults
  const getSeasonalVocabulary = (season: string): string[] => {
    // FIRST: Check Hub custom vocabulary
    if (hubSettings?.customVocabulary?.seasonal?.length > 0) {
      return hubSettings.customVocabulary.seasonal;
    }
    
    // SECOND: Use seasonal theme defaults
    return SEASONAL_THEMES[season]?.vocabulary || [];
  };

  const seasonalTheme = {
    ...SEASONAL_THEMES[currentSeason],
    vocabulary: getSeasonalVocabulary(currentSeason)
  };

  // Save step data whenever state changes
  useEffect(() => {
    const stepData: SeasonalStepData = {
      currentSeason,
      completedActivities,
      learnedVocabulary,
      completedAt: completedActivities.length > 0 ? new Date() : undefined
    };
    onDataUpdate(stepData);
  }, [currentSeason, completedActivities, learnedVocabulary]);

  const startActivity = (activity: SeasonalActivity) => {
    setCurrentActivity(activity);
    setShowVocabulary(false);
  };

  const completeActivity = (activityId: string) => {
    if (!completedActivities.includes(activityId)) {
      setCompletedActivities(prev => [...prev, activityId]);
    }
    setCurrentActivity(null);
    setShowVocabulary(true);
  };

  const addToVocabulary = (word: string) => {
    if (!learnedVocabulary.includes(word)) {
      setLearnedVocabulary(prev => [...prev, word]);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get weather connection message
  const getWeatherConnection = () => {
    if (currentSeason === 'spring') {
      return "Spring weather helps flowers grow! 🌧️🌸";
    }
    if (currentSeason === 'summer') {
      return "Hot summer weather - great for outdoor fun! ☀️";
    }
    if (currentSeason === 'fall') {
      return "Cool fall weather - leaves are changing! 🍂";
    }
    return "Cold winter weather - time to stay cozy! ❄️";
  };

  if (currentActivity) {
    return (
      <div style={{
        height: '100%',
        width: '100%',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        background: `linear-gradient(135deg, ${seasonalTheme.colors[0]}, ${seasonalTheme.colors[1]})`,
        color: 'white'
      }}>
        {/* Activity Header */}
        <div style={{
          padding: '2rem 2rem 1rem 2rem',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '4rem',
            marginBottom: '1rem'
          }}>
            {currentActivity.emoji}
          </div>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            marginBottom: '0.5rem',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            {currentActivity.title}
          </h2>
          <p style={{
            fontSize: '1.2rem',
            color: 'rgba(255,255,255,0.9)',
            marginBottom: '0.5rem'
          }}>
            {currentActivity.description}
          </p>
          <div style={{
            display: 'inline-block',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '20px',
            padding: '0.5rem 1rem',
            fontSize: '0.9rem',
            backdropFilter: 'blur(10px)'
          }}>
            Duration: {currentActivity.duration} • {currentActivity.category}
          </div>
        </div>

        {/* Activity Instructions */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '1rem 2rem',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '20px',
            padding: '2rem',
            backdropFilter: 'blur(10px)',
            maxWidth: '600px',
            width: '100%'
          }}>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              marginBottom: '1.5rem',
              textAlign: 'center'
            }}>
              Let's Do This Activity!
            </h3>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              {currentActivity.instructions.map((instruction, index) => (
                <div
                  key={index}
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '12px',
                    padding: '1rem',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1rem'
                  }}
                >
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.3)',
                    borderRadius: '50%',
                    width: '30px',
                    height: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    flexShrink: 0
                  }}>
                    {index + 1}
                  </div>
                  <div style={{
                    fontSize: '1.1rem',
                    lineHeight: '1.4'
                  }}>
                    {instruction}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activity Navigation */}
        <div style={{
          padding: '1rem 2rem 2rem 2rem',
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem'
        }}>
          <button
            onClick={() => setCurrentActivity(null)}
            style={{
              background: 'rgba(156, 163, 175, 0.8)',
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
              e.currentTarget.style.background = 'rgba(156, 163, 175, 1)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(156, 163, 175, 0.8)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            Back to Activities
          </button>
          
          <button
            onClick={() => completeActivity(currentActivity.id)}
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
            Activity Complete! ✓
          </button>
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
      background: `linear-gradient(135deg, ${seasonalTheme.colors[0]}, ${seasonalTheme.colors[1]})`,
      color: 'white'
    }}>
      {/* Video Section */}
      {hubSettings?.videos?.seasonalLearning && hubSettings.videos.seasonalLearning.length > 0 && (
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
          {hubSettings.videos.seasonalLearning.map((video, index) => (
            <button
              key={index}
              onClick={() => window.open(video.url, `seasonal-video-${index}`, 'width=800,height=600')}
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
              Play Seasonal Video {index + 1}
            </button>
          ))}
        </div>
      )}

      {/* Header */}
      <div style={{
        padding: '2rem 2rem 1rem 2rem',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '4rem',
          marginBottom: '1rem'
        }}>
          {seasonalTheme.emoji}
        </div>
        <h2 style={{
          fontSize: '2.5rem',
          fontWeight: '700',
          color: 'white',
          marginBottom: '0.5rem',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>
          {seasonalTheme.season} Learning
        </h2>
        <p style={{
          fontSize: '1.2rem',
          color: 'rgba(255,255,255,0.9)',
          marginBottom: '0.5rem'
        }}>
          {formatDate(currentDate)}
        </p>
        <div style={{
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '12px',
          padding: '0.75rem 1rem',
          display: 'inline-block',
          backdropFilter: 'blur(10px)',
          fontSize: '1rem'
        }}>
          {getWeatherConnection()}
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '1rem 2rem',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Season Characteristics */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '2rem',
          backdropFilter: 'blur(10px)'
        }}>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            marginBottom: '1rem',
            textAlign: 'center'
          }}>
            About {seasonalTheme.season}
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '0.75rem'
          }}>
            {seasonalTheme.characteristics.map((characteristic, index) => (
              <div
                key={index}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  fontSize: '0.95rem',
                  lineHeight: '1.4'
                }}
              >
                • {characteristic}
              </div>
            ))}
          </div>
        </div>

        {/* Vocabulary Section */}
        {showVocabulary && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '2rem',
            backdropFilter: 'blur(10px)'
          }}>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              marginBottom: '1rem',
              textAlign: 'center'
            }}>
              📚 {seasonalTheme.season} Words
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: '0.75rem'
            }}>
              {seasonalTheme.vocabulary.map((word, index) => (
                <div
                  key={index}
                  onClick={() => addToVocabulary(word)}
                  style={{
                    background: learnedVocabulary.includes(word) 
                      ? 'rgba(34, 197, 94, 0.8)' 
                      : 'rgba(255, 255, 255, 0.3)',
                    borderRadius: '12px',
                    padding: '0.75rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    border: learnedVocabulary.includes(word) ? '2px solid white' : 'none'
                  }}
                >
                  {word}
                  {learnedVocabulary.includes(word) && (
                    <div style={{ fontSize: '0.7rem', marginTop: '0.25rem' }}>
                      ✓ Learned!
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div style={{
              textAlign: 'center',
              marginTop: '1rem',
              fontSize: '0.9rem',
              opacity: 0.9
            }}>
              Tap words to mark them as learned!
            </div>
          </div>
        )}

        {/* Activities */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '1rem',
          backdropFilter: 'blur(10px)'
        }}>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            marginBottom: '1rem',
            textAlign: 'center'
          }}>
            🎯 {seasonalTheme.season} Activities
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem'
          }}>
            {seasonalTheme.activities.map((activity) => (
              <div
                key={activity.id}
                onClick={() => startActivity(activity)}
                style={{
                  background: completedActivities.includes(activity.id)
                    ? 'rgba(34, 197, 94, 0.8)'
                    : 'rgba(255, 255, 255, 0.3)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textAlign: 'center',
                  border: completedActivities.includes(activity.id) ? '2px solid white' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (!completedActivities.includes(activity.id)) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.4)';
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!completedActivities.includes(activity.id)) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }
                }}
              >
                <div style={{
                  fontSize: '3rem',
                  marginBottom: '0.5rem'
                }}>
                  {activity.emoji}
                </div>
                <div style={{
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  marginBottom: '0.5rem'
                }}>
                  {activity.title}
                </div>
                <div style={{
                  fontSize: '0.9rem',
                  opacity: 0.9,
                  marginBottom: '0.5rem',
                  lineHeight: '1.3'
                }}>
                  {activity.description}
                </div>
                <div style={{
                  fontSize: '0.8rem',
                  opacity: 0.8
                }}>
                  {activity.duration} • {activity.category}
                </div>
                {completedActivities.includes(activity.id) && (
                  <div style={{
                    marginTop: '0.5rem',
                    fontSize: '0.9rem',
                    fontWeight: 'bold'
                  }}>
                    ✓ Completed!
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div style={{
        padding: '1rem 2rem 2rem 2rem',
        display: 'flex',
        justifyContent: 'center'
      }}>
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
          Seasonal Learning Complete! Continue →
        </button>
      </div>
    </div>
  );
};

export default SeasonalStep;
