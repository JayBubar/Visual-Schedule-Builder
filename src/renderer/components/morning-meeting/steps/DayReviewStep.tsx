import React, { useState, useEffect, useCallback } from 'react';
import { MorningMeetingStepProps } from '../types/morningMeetingTypes';

interface DayReviewStepData {
  currentSection: number;
  selectedGoals: string[];
  completedAt?: string;
  viewedAnnouncements: boolean;
}

interface DailyGoal {
  id: string;
  emoji: string;
  text: string;
}

const DEFAULT_GOALS: DailyGoal[] = [
  { id: 'learn', emoji: '🧠', text: "I'm Ready to Learn!" },
  { id: 'kind', emoji: '💖', text: "I'm Ready to Be Kind!" },
  { id: 'best', emoji: '⭐', text: "I'm Ready to Try My Best!" }
];

const COMPLETED_STEPS = [
  'Welcome',
  'Attendance', 
  'Classroom Rules',
  'Calendar Math',
  'Weather',
  'Seasonal Fun',
  'Celebration'
];

const DayReviewStep: React.FC<MorningMeetingStepProps> = ({
  onNext,
  onBack,
  onDataUpdate,
  stepData,
  hubSettings,
  students = []
}) => {
  const [currentSection, setCurrentSection] = useState<number>(
    stepData?.currentSection || 1
  );
  const [selectedGoals, setSelectedGoals] = useState<string[]>(
    stepData?.selectedGoals || []
  );
  const [showCompletionAnimation, setShowCompletionAnimation] = useState(false);

  // Get daily announcements from hub settings
  const getDailyAnnouncements = () => {
    const today = new Date().toDateString();
    return hubSettings?.dailyAnnouncements?.find(
      (announcement: any) => announcement.date === today
    )?.announcements || [];
  };

  const dailyAnnouncements = getDailyAnnouncements();

  // Data persistence with useCallback to prevent infinite loops
  const handleDataUpdate = useCallback(() => {
    if (currentSection > 1 || selectedGoals.length > 0) {
      const stepDataUpdate: DayReviewStepData = {
        currentSection,
        selectedGoals,
        completedAt: currentSection === 3 && showCompletionAnimation ? new Date().toISOString() : undefined,
        viewedAnnouncements: currentSection >= 2
      };
      onDataUpdate(stepDataUpdate);
    }
  }, [currentSection, selectedGoals, showCompletionAnimation, onDataUpdate]);

  useEffect(() => {
    handleDataUpdate();
  }, [handleDataUpdate]);

  const handleGoalToggle = (goalId: string) => {
    setSelectedGoals(prev => 
      prev.includes(goalId)
        ? prev.filter(id => id !== goalId)
        : [...prev, goalId]
    );
  };

  const goToNextSection = () => {
    if (currentSection < 3) {
      setCurrentSection(prev => prev + 1);
    }
  };

  const goToPreviousSection = () => {
    if (currentSection > 1) {
      setCurrentSection(prev => prev - 1);
    } else {
      onBack();
    }
  };

  const handleComplete = () => {
    setShowCompletionAnimation(true);
    setTimeout(() => {
      onNext();
    }, 3000);
  };

  const canProceed = () => {
    if (currentSection === 2) {
      return selectedGoals.length > 0;
    }
    return true;
  };

  return (
    <div style={{
      height: '100%',
      background: 'linear-gradient(135deg, #FF6B35 0%, #FF8E9B 50%, #FFD93D 100%)',
      display: 'flex',
      flexDirection: 'column',
      color: 'white',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Floating Sparkles */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '5%',
        fontSize: '2rem',
        animation: 'float 4s ease-in-out infinite',
        opacity: 0.6,
        pointerEvents: 'none',
        zIndex: 1
      }}>✨</div>
      <div style={{
        position: 'absolute',
        top: '20%',
        right: '5%',
        fontSize: '2rem',
        animation: 'float 4s ease-in-out infinite 1s',
        opacity: 0.6,
        pointerEvents: 'none',
        zIndex: 1
      }}>⭐</div>
      <div style={{
        position: 'absolute',
        bottom: '20%',
        left: '10%',
        fontSize: '2rem',
        animation: 'float 4s ease-in-out infinite 2s',
        opacity: 0.6,
        pointerEvents: 'none',
        zIndex: 1
      }}>🌟</div>
      <div style={{
        position: 'absolute',
        bottom: '15%',
        right: '15%',
        fontSize: '2rem',
        animation: 'float 4s ease-in-out infinite 3s',
        opacity: 0.6,
        pointerEvents: 'none',
        zIndex: 1
      }}>💫</div>

      {/* Completion Animation Overlay */}
      {showCompletionAnimation && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <div style={{
            textAlign: 'center',
            color: 'white',
            animation: 'scaleIn 0.5s ease-out'
          }}>
            <div style={{
              fontSize: '5rem',
              marginBottom: '1rem',
              color: '#4CAF50',
              animation: 'bounce 0.6s ease-in-out'
            }}>✅</div>
            <h2 style={{ fontSize: '2rem', margin: '0 0 0.5rem 0' }}>
              Morning Meeting Complete!
            </h2>
            <p style={{ fontSize: '1.2rem', margin: 0, opacity: 0.9 }}>
              Great job setting intentions for today! ✨
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{
        padding: '2rem',
        textAlign: 'center',
        background: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(15px)',
        borderBottom: '3px solid rgba(255, 255, 255, 0.3)'
      }}>
        <h1 style={{
          fontSize: 'clamp(2.5rem, 6vw, 4rem)',
          fontWeight: 800,
          textShadow: '3px 3px 6px rgba(0, 0, 0, 0.3)',
          marginBottom: '0.5rem',
          animation: 'glow 3s ease-in-out infinite'
        }}>
          🌅 Today Will Be Amazing!
        </h1>
        <div style={{
          fontSize: '1.2rem',
          color: 'rgba(255, 255, 255, 0.9)',
          fontWeight: 600
        }}>
          Step 8 of 8 • Morning Meeting Finale
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        padding: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'auto'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.15)',
          borderRadius: '30px',
          padding: '3rem',
          backdropFilter: 'blur(20px)',
          border: '3px solid rgba(255, 255, 255, 0.2)',
          maxWidth: '800px',
          width: '100%',
          textAlign: 'center',
          position: 'relative',
          zIndex: 10
        }}>
          {/* Section 1: Morning Meeting Celebration */}
          {currentSection === 1 && (
            <div>
              <div style={{
                fontSize: 'clamp(2rem, 5vw, 3rem)',
                fontWeight: 700,
                marginBottom: '2rem',
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)'
              }}>
                🎉 Look What We Accomplished!
              </div>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                margin: '2rem 0'
              }}>
                {COMPLETED_STEPS.map((step, index) => (
                  <div
                    key={step}
                    style={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      borderRadius: '16px',
                      padding: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      opacity: 0,
                      transform: 'scale(0)',
                      animation: `badgeAppear 0.6s ease-out forwards`,
                      animationDelay: `${(index + 1) * 0.2}s`,
                      border: '2px solid rgba(255, 255, 255, 0.3)'
                    }}
                  >
                    <span style={{ fontSize: '1.5rem', color: '#4CAF50' }}>✅</span>
                    <span style={{ fontWeight: 600, fontSize: '1rem' }}>{step}</span>
                  </div>
                ))}
              </div>
              
              <p style={{
                fontSize: '1.3rem',
                marginTop: '2rem',
                fontWeight: 500
              }}>
                WOW! We did so much learning together! 🌟
              </p>
            </div>
          )}

          {/* Section 2: Daily Announcements + Goals */}
          {currentSection === 2 && (
            <div>
              <div style={{
                fontSize: 'clamp(2rem, 5vw, 2.5rem)',
                fontWeight: 700,
                marginBottom: '2rem',
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)'
              }}>
                📢 Today's Special News
              </div>
              
              {/* Daily Announcements */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '20px',
                padding: '2rem',
                margin: '2rem 0',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{
                  fontSize: '1.5rem',
                  fontWeight: 600,
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}>
                  🗣️ Important Things to Remember
                </div>
                
                {dailyAnnouncements.length > 0 ? (
                  dailyAnnouncements.map((announcement: any, index: number) => (
                    <div
                      key={index}
                      style={{
                        background: 'rgba(255, 255, 255, 0.15)',
                        borderRadius: '12px',
                        padding: '1rem',
                        margin: '0.75rem 0',
                        borderLeft: '4px solid rgba(255, 255, 255, 0.5)',
                        fontSize: '1.1rem',
                        fontWeight: 500
                      }}
                    >
                      {announcement.icon || '📌'} {announcement.text}
                    </div>
                  ))
                ) : (
                  <div style={{
                    fontStyle: 'italic',
                    opacity: 0.8,
                    fontSize: '1rem'
                  }}>
                    No special announcements today - just a wonderful day of learning!
                  </div>
                )}
              </div>

              {/* Goals Selection */}
              <div>
                <div style={{
                  fontSize: '1.8rem',
                  fontWeight: 700,
                  margin: '2rem 0 1rem 0',
                  textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)'
                }}>
                  🎯 How Will You Be Amazing Today?
                </div>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '1.5rem',
                  margin: '2rem 0'
                }}>
                  {DEFAULT_GOALS.map((goal) => (
                    <div
                      key={goal.id}
                      onClick={() => handleGoalToggle(goal.id)}
                      style={{
                        background: 'rgba(255, 255, 255, 0.9)',
                        color: '#333333',
                        borderRadius: '20px',
                        padding: '2rem 2rem 2.5rem 2rem',
                        cursor: 'pointer',
                        transition: 'all 0.4s ease',
                        border: selectedGoals.includes(goal.id) 
                          ? '3px solid rgba(76, 175, 80, 0.8)' 
                          : '3px solid rgba(255, 255, 255, 0.3)',
                        position: 'relative',
                        overflow: 'visible',
                        minHeight: '180px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transform: selectedGoals.includes(goal.id) ? 'scale(1.05)' : 'scale(1)',
                        boxShadow: selectedGoals.includes(goal.id) 
                          ? '0 8px 25px rgba(0, 0, 0, 0.2)' 
                          : '0 4px 15px rgba(0, 0, 0, 0.1)'
                      }}
                    >
                      {selectedGoals.includes(goal.id) && (
                        <div style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          fontSize: '2rem',
                          color: '#4CAF50',
                          animation: 'scaleIn 0.3s ease-out'
                        }}>
                          ✅
                        </div>
                      )}
                      <span style={{
                        fontSize: '3rem',
                        marginBottom: '1rem',
                        display: 'block'
                      }}>
                        {goal.emoji}
                      </span>
                      <div style={{
                        fontSize: '1.3rem',
                        fontWeight: 600,
                        color: '#333333',
                        textShadow: 'none'
                      }}>
                        {goal.text}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Final Celebration */}
          {currentSection === 3 && (
            <div>
              <div style={{
                fontSize: 'clamp(2.5rem, 6vw, 4rem)',
                fontWeight: 800,
                marginBottom: '2rem',
                textShadow: '3px 3px 6px rgba(0, 0, 0, 0.3)',
                animation: 'bounceTitle 2s ease-in-out infinite'
              }}>
                🚀 Let's Go Make Magic!
              </div>
              
              <div style={{
                fontSize: '1.5rem',
                margin: '1.5rem 0',
                fontWeight: 500,
                opacity: 0.95
              }}>
                You are prepared, you are excited, and you are ready for an INCREDIBLE day of learning and fun!
              </div>
              
              <div style={{
                fontSize: '1.8rem',
                color: '#FFD93D',
                margin: '1.5rem 0',
                fontWeight: 600,
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)'
              }}>
                ✨ Today is going to be AMAZING! ✨
              </div>
              
              <button
                onClick={handleComplete}
                style={{
                  background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                  border: 'none',
                  borderRadius: '25px',
                  color: 'white',
                  padding: '1.5rem 3rem',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  margin: '2rem 0',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 12px 35px rgba(0, 0, 0, 0.3)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.2)';
                }}
              >
                🎉 Start Our Amazing Day! 🎉
              </button>
              
              <div style={{
                marginTop: '2rem',
                fontSize: '1.2rem',
                opacity: 0.9
              }}>
                Ready to transition to your daily schedule! 📅
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '2rem',
        zIndex: 1000,
        background: 'rgba(0, 0, 0, 0.2)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '1rem 2rem',
        minWidth: '400px'
      }}>
        <button
          onClick={goToPreviousSection}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '16px',
            color: 'white',
            padding: '1rem 2rem',
            fontSize: '1.1rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(10px)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          ← Back
        </button>
        
        <div style={{
          fontWeight: 600,
          opacity: 0.9,
          textAlign: 'center'
        }}>
          Section {currentSection} of 3
        </div>
        
        {currentSection < 3 ? (
          <button
            onClick={goToNextSection}
            disabled={!canProceed()}
            style={{
              background: canProceed() ? 'rgba(255, 255, 255, 0.2)' : 'rgba(156, 163, 175, 0.5)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '16px',
              color: 'white',
              padding: '1rem 2rem',
              fontSize: '1.1rem',
              fontWeight: 600,
              cursor: canProceed() ? 'pointer' : 'not-allowed',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)',
              opacity: canProceed() ? 1 : 0.5
            }}
            onMouseOver={(e) => {
              if (canProceed()) {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }
            }}
            onMouseOut={(e) => {
              if (canProceed()) {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.transform = 'scale(1)';
              }
            }}
          >
            {currentSection === 2 ? 'Finale →' : 'Next →'}
          </button>
        ) : (
          <div style={{ width: '120px' }}></div>
        )}
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
          50% { transform: translateY(-30px) rotate(180deg) scale(1.2); }
        }
        
        @keyframes glow {
          0%, 100% { text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.3); }
          50% { text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.3), 0 0 20px rgba(255, 255, 255, 0.3); }
        }
        
        @keyframes badgeAppear {
          0% { opacity: 0; transform: scale(0) rotate(-180deg); }
          80% { transform: scale(1.1) rotate(0deg); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        
        @keyframes bounceTitle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes scaleIn {
          from { transform: scale(0); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-20px); }
          60% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
};

export default DayReviewStep;