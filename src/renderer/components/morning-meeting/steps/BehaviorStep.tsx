import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MorningMeetingStepProps, BehaviorStepData } from '../types/morningMeetingTypes';

// Helper function to get video URL from various possible formats
const getVideoUrl = (video: any): string | null => {
  // Try multiple possible video URL locations
  if (video?.videoData?.videoUrl) return video.videoData.videoUrl;
  if (video?.url) return video.url;
  if (typeof video === 'string') return video;
  return null;
};

// Standardized Navigation Component
const StepNavigation: React.FC<{
  navigation: any;
  customNextText?: string;
  showProgress?: boolean;
}> = ({ navigation, customNextText, showProgress = true }) => {
  return (
    <div style={{
      position: 'absolute',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      alignItems: 'center',
      gap: '2rem',
      zIndex: 50,
      background: 'rgba(0, 0, 0, 0.4)',
      backdropFilter: 'blur(15px)',
      border: '2px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '20px',
      padding: '1rem 2rem',
      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)'
    }}>
      {/* Previous Button */}
      {!navigation.isFirstStep && (
        <button
          onClick={navigation.onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(10px)',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            color: 'white',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          ← Previous
        </button>
      )}

      {/* Progress Indicator */}
      {showProgress && (
        <div style={{
          color: 'white',
          fontSize: '0.9rem',
          fontWeight: 600,
          textAlign: 'center',
          opacity: 0.9
        }}>
          Step {navigation.currentStep} of {navigation.totalSteps}
        </div>
      )}

      {/* Next Button */}
      <button
        onClick={navigation.onNext}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1.5rem',
          background: navigation.isLastStep
            ? 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)'
            : 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(10px)',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '12px',
          color: 'white',
          fontSize: '1rem',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
        onMouseOver={(e) => {
          if (navigation.isLastStep) {
            e.currentTarget.style.background = 'linear-gradient(135deg, #45a049 0%, #3d8b40 100%)';
          } else {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
          }
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseOut={(e) => {
          if (navigation.isLastStep) {
            e.currentTarget.style.background = 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)';
          } else {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
          }
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        {navigation.isLastStep ? 'Complete! ✨' : customNextText || 'Next →'}
      </button>
    </div>
  );
};

interface ClassroomRule {
  id: string;
  title: string;
  description: string;
  emoji: string;
  explanation: string;
}

// Default rules as fallback
const DEFAULT_CLASSROOM_RULES: ClassroomRule[] = [
  {
    id: 'take-turns-share',
    title: 'Take Turns and Share with Friends',
    description: 'We share toys, take turns talking, and play together nicely!',
    emoji: '🤝',
    explanation: 'This helps everyone have fun and feel included!'
  },
  {
    id: 'listen-teachers',
    title: 'Listen to My Teachers',
    description: 'I use my listening ears when my teachers are talking!',
    emoji: '👂',
    explanation: 'This helps me learn new things and stay safe!'
  },
  {
    id: 'quiet-voice-kind-words',
    title: 'Use a Quiet Voice and Kind Words',
    description: 'I speak softly and say nice things to make others feel good!',
    emoji: '🗣️',
    explanation: 'Kind words make our classroom a happy place!'
  },
  {
    id: 'follow-directions',
    title: 'Follow Directions and Participate',
    description: 'I listen carefully and join in with classroom activities!',
    emoji: '🎯',
    explanation: 'This helps our whole class learn and have fun together!'
  },
  {
    id: 'kind-body',
    title: 'Have Kind Hands, Kind Feet and a Kind Body',
    description: 'I keep my hands to myself and move gently around others!',
    emoji: '🤗',
    explanation: 'This keeps everyone safe and comfortable!'
  },
  {
    id: 'use-strategies',
    title: 'Use My Strategies When I Am Upset',
    description: 'I take deep breaths, count to 10, or ask for help when I feel upset!',
    emoji: '🧘',
    explanation: 'This helps me feel better and solve problems!'
  }
];

const BehaviorStep: React.FC<MorningMeetingStepProps> = ({
  onNext,
  onBack,
  onDataUpdate,
  stepData,
  hubSettings,
  students = [],
  onStepComplete
}) => {
  // Get classroom rules from hub settings or use defaults - memoized to prevent re-creation
  const classroomRules = useMemo((): ClassroomRule[] => {
    if (hubSettings?.classroomRules?.rules?.length > 0) {
      return hubSettings.classroomRules.rules.map((rule: any, index: number) => ({
        id: rule.id || `custom-${index}`,
        title: rule.title || rule.name || 'Classroom Rule',
        description: rule.description || '',
        emoji: rule.emoji || '⭐',
        explanation: rule.explanation || 'This helps our classroom run smoothly!'
      }));
    }
    return DEFAULT_CLASSROOM_RULES;
  }, [hubSettings?.classroomRules?.rules]);
  
  const [currentRuleIndex, setCurrentRuleIndex] = useState<number>(
    stepData?.currentRuleIndex || 0
  );
  const [learnedRules, setLearnedRules] = useState<Set<string>>(
    new Set(stepData?.learnedRules || [])
  );
  const [isRuleActivated, setIsRuleActivated] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [confettiElements, setConfettiElements] = useState<JSX.Element[]>([]);

  // Get selected videos for this step
  const selectedVideos = hubSettings?.videos?.behaviorCommitments || [];

  // Memoized data update function with error handling
  const handleDataUpdate = useCallback(() => {
    // Only update when we have meaningful progress
    if (currentRuleIndex > 0 || learnedRules.size > 0) {
      const stepDataUpdate: BehaviorStepData = {
        currentRuleIndex,
        learnedRules: Array.from(learnedRules),
        completedAt: learnedRules.size === classroomRules.length ? new Date().toISOString() : undefined,
        totalRules: classroomRules.length
      };
      onDataUpdate(stepDataUpdate);
    }
  }, [currentRuleIndex, learnedRules, classroomRules.length, onDataUpdate]);

  useEffect(() => {
    handleDataUpdate();
  }, [handleDataUpdate]);

  // Check for completion
  useEffect(() => {
    if (learnedRules.size === classroomRules.length && !showCompletion && classroomRules.length > 0) {
      setTimeout(() => {
        setShowCompletion(true);
        createMassiveConfetti();
        // Call onStepComplete after showing completion
        setTimeout(() => {
          onStepComplete?.();
        }, 3000);
      }, 1000);
    }
  }, [learnedRules.size, showCompletion, classroomRules.length, onStepComplete]);

  const createConfetti = (count: number = 15) => {
    const confettiEmojis = ['🎉', '🎊', '⭐', '🌟', '✨', '💫'];
    const newConfetti: JSX.Element[] = [];

    for (let i = 0; i < count; i++) {
      const emoji = confettiEmojis[Math.floor(Math.random() * confettiEmojis.length)];
      const id = `confetti-${Date.now()}-${i}`;
      
      newConfetti.push(
        <div
          key={id}
          style={{
            position: 'fixed',
            fontSize: '2rem',
            pointerEvents: 'none',
            zIndex: 999,
            left: Math.random() * 100 + 'vw',
            top: '-10vh',
            animation: `confetti-fall ${Math.random() * 2 + 2}s linear forwards`,
            animationDelay: Math.random() * 2 + 's'
          }}
        >
          {emoji}
        </div>
      );
    }

    setConfettiElements(prev => [...prev, ...newConfetti]);

    // Remove confetti after animation
    setTimeout(() => {
      setConfettiElements(prev => 
        prev.filter(el => !newConfetti.includes(el))
      );
    }, 4000);
  };

  const createMassiveConfetti = () => {
    for (let burst = 0; burst < 6; burst++) {
      setTimeout(() => createConfetti(20), burst * 300);
    }
  };

  const handleRuleClick = () => {
    if (!isRuleActivated && currentRuleIndex < classroomRules.length) {
      const currentRule = classroomRules[currentRuleIndex];
      setIsRuleActivated(true);
      setLearnedRules(prev => new Set([...prev, currentRule.id]));
      createConfetti();

      // After celebration, move to next rule
      setTimeout(() => {
        if (currentRuleIndex < classroomRules.length - 1) {
          setCurrentRuleIndex(prev => prev + 1);
          setIsRuleActivated(false);
        }
      }, 2000);
    }
  };

  const handleNextRule = () => {
    if (isRuleActivated && currentRuleIndex < classroomRules.length - 1) {
      setCurrentRuleIndex(prev => prev + 1);
      setIsRuleActivated(false);
    }
  };

  const currentRule = classroomRules[currentRuleIndex];
  const progressPercentage = (learnedRules.size / classroomRules.length) * 100;
  const isCurrentRuleLearned = currentRule && learnedRules.has(currentRule.id);

  return (
    <>
      <style>
        {`
          @keyframes confetti-fall {
            0% {
              transform: translateY(-10vh) rotate(0deg);
              opacity: 1;
            }
            100% {
              transform: translateY(110vh) rotate(360deg);
              opacity: 0;
            }
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
          }
          
          @keyframes shimmer {
            0%, 100% { filter: hue-rotate(0deg); }
            50% { filter: hue-rotate(30deg); }
          }
          
          @keyframes ruleEntrance {
            0% { 
              transform: scale(0) rotate(-180deg);
              opacity: 0;
            }
            70% { 
              transform: scale(1.1) rotate(10deg);
              opacity: 1;
            }
            100% { 
              transform: scale(1) rotate(0deg);
              opacity: 1;
            }
          }
          
          @keyframes celebrateSpin {
            0% { transform: scale(1) rotate(0deg); }
            25% { transform: scale(1.2) rotate(90deg); }
            50% { transform: scale(1.3) rotate(180deg); }
            75% { transform: scale(1.2) rotate(270deg); }
            100% { transform: scale(1.1) rotate(360deg); }
          }
          
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.8; }
            50% { transform: scale(1.05); opacity: 1; }
          }
        `}
      </style>
      
      <div style={{
        height: '100%',
        background: 'linear-gradient(135deg, #FFD700 0%, #FF69B4 30%, #32CD32 60%, #87CEEB 100%)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative'
      }}>
        
        {/* Floating sparkles background */}
        {[0, 1, 2, 3, 4, 5].map(i => (
          <div
            key={`sparkle-${i}`}
            style={{
              position: 'fixed',
              fontSize: '2rem',
              animation: 'float 4s ease-in-out infinite',
              opacity: 0.5,
              pointerEvents: 'none',
              zIndex: 1,
              top: `${5 + (i * 15)}%`,
              left: i % 2 === 0 ? '5%' : '95%',
              animationDelay: `${i * 0.5}s`
            }}
          >
            {['✨', '⭐', '🌟', '💫'][i % 4]}
          </div>
        ))}

        {/* VIDEO SECTION */}
        {selectedVideos.length > 0 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem',
            padding: '1rem',
            flexShrink: 0
          }}>
            {selectedVideos.map((video, index) => (
              <button
                key={index}
                onClick={() => {
                  const videoUrl = getVideoUrl(video);
                  if (videoUrl) {
                    console.log('Opening behavior video:', videoUrl);
                    const newWindow = window.open(videoUrl, `rules-video-${index}`, 'width=800,height=600,scrollbars=yes,resizable=yes');
                    if (!newWindow) {
                      console.error('Failed to open video window - popup blocked?');
                      alert('Unable to open video. Please check your popup blocker settings.');
                    }
                  } else {
                    console.error('Video URL not found for video:', video);
                    alert('Video URL not available');
                  }
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  color: '#333333',
                  border: '3px solid rgba(255, 215, 0, 0.8)',
                  borderRadius: '20px',
                  padding: '1rem 2rem',
                  fontSize: '1.2rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 215, 0, 0.9)';
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
                  e.currentTarget.style.color = '#333333';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                🎬 Play Classroom Rules Video {selectedVideos.length > 1 ? ` ${index + 1}` : ''}
              </button>
            ))}
          </div>
        )}

        {/* HEADER */}
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(15px)',
          borderBottom: '3px solid rgba(255, 255, 255, 0.3)'
        }}>
          <h1 style={{
            fontSize: 'clamp(2.5rem, 6vw, 4rem)',
            fontWeight: '800',
            textShadow: '3px 3px 6px rgba(0, 0, 0, 0.3)',
            marginBottom: '0.5rem',
            background: 'linear-gradient(45deg, #FFD700, #FF69B4, #32CD32)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'shimmer 3s ease-in-out infinite'
          }}>
            🌟 Our Classroom Rules 🌟
          </h1>
          <div style={{
            fontSize: '1.5rem',
            color: 'rgba(255, 255, 255, 0.9)',
            fontWeight: '600'
          }}>
            Let's learn each rule together!
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div style={{
          flex: 1,
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'auto'
        }}>
          
          {!showCompletion && currentRule ? (
            <>
              {/* Progress Indicator */}
              <div style={{
                fontSize: '1.5rem',
                color: 'white',
                fontWeight: '700',
                marginBottom: '1rem',
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)'
              }}>
                Rule {currentRuleIndex + 1} of {classroomRules.length}
              </div>

              {/* Current Rule Card */}
              <div
                onClick={handleRuleClick}
                style={{
                  background: isCurrentRuleLearned 
                    ? 'linear-gradient(135deg, #32CD32 0%, #98FB98 100%)'
                    : 'rgba(255, 255, 255, 0.95)',
                  color: isCurrentRuleLearned ? 'white' : '#333333',
                  borderRadius: '30px',
                  padding: '3rem',
                  textAlign: 'center',
                  cursor: isCurrentRuleLearned ? 'default' : 'pointer',
                  transition: 'all 0.4s ease',
                  border: isCurrentRuleLearned ? '6px solid #228B22' : '6px solid rgba(255, 215, 0, 0.8)',
                  position: 'relative',
                  overflow: 'hidden',
                  backdropFilter: 'blur(10px)',
                  maxWidth: '600px',
                  width: '100%',
                  animation: 'ruleEntrance 0.8s ease-out',
                  transform: isCurrentRuleLearned ? 'scale(1.1)' : 'scale(1)',
                  boxShadow: isCurrentRuleLearned 
                    ? '0 25px 50px rgba(34, 197, 94, 0.3)' 
                    : '0 20px 40px rgba(0, 0, 0, 0.2)'
                }}
                onMouseEnter={(e) => {
                  if (!isCurrentRuleLearned) {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 25px 50px rgba(255, 215, 0, 0.4)';
                    e.currentTarget.style.animation = 'pulse 1s ease-in-out infinite';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isCurrentRuleLearned) {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.2)';
                    e.currentTarget.style.animation = 'none';
                  }
                }}
              >
                {/* Check mark for learned rule */}
                {isCurrentRuleLearned && (
                  <div style={{
                    position: 'absolute',
                    top: '15px',
                    right: '15px',
                    fontSize: '3rem',
                    color: '#228B22',
                    animation: 'bounce 2s ease-in-out infinite'
                  }}>
                    ✅
                  </div>
                )}
                
                <span style={{
                  fontSize: '6rem',
                  marginBottom: '1.5rem',
                  display: 'block',
                  animation: isCurrentRuleLearned ? 'celebrateSpin 1s ease-in-out' : 'bounce 2s ease-in-out infinite'
                }}>
                  {currentRule.emoji}
                </span>
                
                <div style={{
                  fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                  fontWeight: '800',
                  marginBottom: '1.5rem',
                  lineHeight: '1.2'
                }}>
                  {currentRule.title}
                </div>
                
                <div style={{
                  fontSize: 'clamp(1rem, 3vw, 1.3rem)',
                  color: isCurrentRuleLearned ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.7)',
                  lineHeight: '1.4',
                  marginBottom: '1.5rem'
                }}>
                  {currentRule.description}
                </div>
                
                {isCurrentRuleLearned && (
                  <div style={{
                    fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)',
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontStyle: 'italic',
                    marginTop: '1rem',
                    padding: '1rem',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '15px'
                  }}>
                    💡 {currentRule.explanation}
                  </div>
                )}
                
                {!isCurrentRuleLearned && (
                  <div style={{
                    fontSize: '1.2rem',
                    fontWeight: '600',
                    color: 'rgba(255, 215, 0, 0.9)',
                    marginTop: '1rem',
                    animation: 'pulse 2s ease-in-out infinite'
                  }}>
                    👆 Click to learn this rule!
                  </div>
                )}
              </div>

              {/* Next Rule Button */}
              {isCurrentRuleLearned && currentRuleIndex < classroomRules.length - 1 && (
                <button
                  onClick={handleNextRule}
                  style={{
                    background: 'linear-gradient(135deg, #FF69B4, #FFD700)',
                    border: 'none',
                    borderRadius: '20px',
                    color: 'white',
                    padding: '1.5rem 3rem',
                    fontSize: '1.3rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    marginTop: '2rem',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 10px 25px rgba(255, 105, 180, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 15px 35px rgba(255, 105, 180, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(255, 105, 180, 0.3)';
                  }}
                >
                  ✨ Next Rule! ✨
                </button>
              )}

              {/* Progress Section */}
              <div style={{ 
                textAlign: 'center', 
                width: '100%', 
                maxWidth: '500px',
                marginTop: '2rem'
              }}>
                <div style={{
                  fontSize: '1.2rem',
                  fontWeight: '600',
                  textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
                  marginBottom: '1rem',
                  color: 'white'
                }}>
                  🌟 Progress: {learnedRules.size}/{classroomRules.length} Rules Learned! 🌟
                </div>
                
                <div style={{
                  width: '100%',
                  height: '25px',
                  background: 'rgba(255, 255, 255, 0.3)',
                  borderRadius: '15px',
                  overflow: 'hidden',
                  border: '3px solid rgba(255, 255, 255, 0.5)'
                }}>
                  <div style={{
                    height: '100%',
                    background: 'linear-gradient(90deg, #32CD32, #FFD700)',
                    width: `${progressPercentage}%`,
                    transition: 'width 0.8s ease',
                    position: 'relative'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
                      animation: 'shimmer 2s ease-in-out infinite'
                    }} />
                  </div>
                </div>
              </div>
            </>
          ) : showCompletion ? (
            /* Completion Celebration */
            <div style={{
              textAlign: 'center',
              background: 'linear-gradient(135deg, #FFD700, #FF69B4)',
              color: 'white',
              padding: '4rem',
              borderRadius: '40px',
              border: '8px solid white',
              boxShadow: '0 30px 60px rgba(0, 0, 0, 0.3)',
              animation: 'ruleEntrance 0.8s ease-out',
              maxWidth: '700px'
            }}>
              <div style={{ fontSize: '5rem', marginBottom: '1.5rem' }}>🎉</div>
              <div style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: '800', marginBottom: '1rem' }}>
                Fantastic! You learned all our classroom rules! 🎉
              </div>
              <div style={{ fontSize: 'clamp(1.2rem, 3vw, 1.8rem)', marginTop: '1rem' }}>
                You're ready to have an amazing day! ⭐
              </div>
              <div style={{ 
                fontSize: '1rem', 
                marginTop: '2rem',
                opacity: 0.9,
                fontStyle: 'italic'
              }}>
                Great job learning {classroomRules.length} important rules! 🌟
              </div>
            </div>
          ) : (
            /* No rules configured */
            <div style={{
              textAlign: 'center',
              background: 'rgba(255, 255, 255, 0.9)',
              color: '#333333',
              padding: '3rem',
              borderRadius: '30px',
              border: '4px solid rgba(255, 215, 0, 0.8)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem' }}>
                No Classroom Rules Configured
              </div>
              <div style={{ fontSize: '1.1rem', lineHeight: '1.4' }}>
                Please set up your classroom rules in the Morning Meeting Hub settings!
              </div>
            </div>
          )}
        </div>


        {/* Confetti Elements */}
        {confettiElements}
      </div>
    </>
  );
};

export default BehaviorStep;
