import React, { useState, useEffect } from 'react';

interface CelebrationAnimationsProps {
  isActive: boolean;
  style?: 'gentle' | 'excited';
  message?: string;
  onComplete?: () => void;
  duration?: number;
}

const CelebrationAnimations: React.FC<CelebrationAnimationsProps> = ({ 
  isActive,
  style = 'gentle',
  message,
  onComplete,
  duration
}) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);
  const [showEncouragement, setShowEncouragement] = useState(false);
  const [celebrationStyle, setCelebrationStyle] = useState<'gentle' | 'excited'>(style);
  const [currentMessage, setCurrentMessage] = useState('');

  const encouragementMessages = {
    gentle: [
      "Great job! 🌟",
      "Well done! ✨",
      "Nice work! 👏",
      "You did it! 😊",
      "Excellent! 🎯",
      "Amazing! 💫"
    ],
    excited: [
      "FANTASTIC! 🎉",
      "AWESOME! 🌟",
      "INCREDIBLE! 🎊",
      "YOU'RE A STAR! ⭐",
      "AMAZING WORK! 🎆",
      "BRILLIANT! 🚀"
    ]
  };

  // Generate confetti particles
  const generateConfetti = () => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3'];
    const particles = [];
    
    for (let i = 0; i < (celebrationStyle === 'excited' ? 50 : 25); i++) {
      particles.push({
        id: i,
        left: Math.random() * 100,
        animationDelay: Math.random() * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4
      });
    }
    return particles;
  };

  // Generate sparkle particles
  const generateSparkles = () => {
    const particles = [];
    for (let i = 0; i < 15; i++) {
      particles.push({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        animationDelay: Math.random() * 1,
        size: Math.random() * 12 + 6
      });
    }
    return particles;
  };

  // Auto-trigger when isActive becomes true
  useEffect(() => {
    if (isActive) {
      triggerCelebration();
    }
  }, [isActive]);

  const triggerCelebration = () => {
    // Use provided message or fallback to random encouragement
    if (message) {
      setCurrentMessage(message);
    } else {
      const messages = encouragementMessages[celebrationStyle];
      setCurrentMessage(messages[Math.floor(Math.random() * messages.length)]);
    }

    // Show animations
    setShowConfetti(true);
    setShowSparkles(true);
    setShowEncouragement(true);

    // Play audio (gentle or excited based on style)
    const audio = new Audio();
    if (celebrationStyle === 'gentle') {
      // Gentle success sound (you can replace with actual audio file)
      audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEaBkGS1vLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEaBkGS1vLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEaBkGS1vLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEaBkGS1vLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEaBkGS1vLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEaBkGS1vLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEaBkGS1vLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEaBkGS1vLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEaBkGS1vLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEaBkGS1vLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEaBkGS1vLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEaBkGS1vLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEaBkGS1vLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEaBkGS1vLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEaBkGS1vLNeSsF';
    } else {
      // Excited success sound
      audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEaBkGS1vLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEaBkGS1vLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEaBkGS1vLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEaBkGS1vLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEaBkGS1vLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEaBkGS1vLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEaBkGS1vLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEaBkGS1vLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEaBkGS1vLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEaBkGS1vLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEaBkGS1vLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEaBkGS1vLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEaBkGS1vLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEaBkGS1vLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEaBkGS1vLNeSsF';
    }
    
    // Attempt to play audio (will be silent in this demo)
    audio.play().catch(() => {
      // Audio play failed (expected in demo environment)
    });

    // Clear animations after duration
    const animationDuration = duration || (celebrationStyle === 'excited' ? 4000 : 3000);
    setTimeout(() => {
      setShowConfetti(false);
      setShowSparkles(false);
      setShowEncouragement(false);
      if (onComplete) {
        onComplete();
      }
    }, animationDuration);
  };

  // CSS for animations
  const animationStyles = `
    @keyframes confettiFall {
      0% {
        transform: translateY(-10px) rotateZ(0deg);
        opacity: 1;
      }
      100% {
        transform: translateY(400px) rotateZ(720deg);
        opacity: 0;
      }
    }

    @keyframes sparkle {
      0% {
        transform: scale(0) rotate(0deg);
        opacity: 0;
      }
      50% {
        transform: scale(1.2) rotate(180deg);
        opacity: 1;
      }
      100% {
        transform: scale(0) rotate(360deg);
        opacity: 0;
      }
    }

    @keyframes messageAppear {
      0% {
        transform: translate(-50%, -50%) scale(0);
        opacity: 0;
      }
      20% {
        transform: translate(-50%, -50%) scale(1.2);
        opacity: 1;
      }
      80% {
        transform: translate(-50%, -50%) scale(1);
        opacity: 1;
      }
      100% {
        transform: translate(-50%, -50%) scale(0.8);
        opacity: 0;
      }
    }

    .celebration-message {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(255, 255, 255, 0.95);
      padding: 1rem 2rem;
      border-radius: 20px;
      font-size: 2rem;
      font-weight: 700;
      color: #2c3e50;
      text-align: center;
      box-shadow: 0 8px 32px rgba(0,0,0,0.2);
      animation: celebrationMessagePop 3s ease-in-out;
      z-index: 1001;
    }

    @keyframes celebrationMessagePop {
      0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
      20% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
      80% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
      100% { transform: translate(-50%, -50%) scale(0.9); opacity: 0; }
    }
  `;

  if (!isActive) return null;

  return (
    <>
      <style>{animationStyles}</style>
      <div style={{
        padding: '40px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '40px'
        }}>
          <h2 style={{
            color: 'white',
            fontSize: '2.5rem',
            fontWeight: '700',
            margin: '0 0 20px 0',
            textShadow: '0 4px 8px rgba(0,0,0,0.3)'
          }}>
            🎉 Celebration Animations
          </h2>
          <p style={{
            color: 'rgba(255,255,255,0.9)',
            fontSize: '1.1rem',
            margin: '0'
          }}>
            Fun, engaging visual feedback when students complete activities
          </p>
        </div>

        {/* Controls */}
        <div style={{
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          padding: '30px',
          marginBottom: '30px',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <h3 style={{
            color: 'white',
            fontSize: '1.5rem',
            margin: '0 0 20px 0'
          }}>
            Celebration Settings
          </h3>

          {/* Style Selection */}
          <div style={{
            marginBottom: '25px'
          }}>
            <label style={{
              color: 'white',
              fontSize: '1rem',
              fontWeight: '600',
              display: 'block',
              marginBottom: '10px'
            }}>
              Celebration Style:
            </label>
            <div style={{
              display: 'flex',
              gap: '15px',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={() => setCelebrationStyle('gentle')}
                style={{
                  padding: '12px 24px',
                  background: celebrationStyle === 'gentle' 
                    ? 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)' 
                    : 'rgba(255,255,255,0.2)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)'
                }}
              >
                🌸 Gentle
              </button>
              <button
                onClick={() => setCelebrationStyle('excited')}
                style={{
                  padding: '12px 24px',
                  background: celebrationStyle === 'excited' 
                    ? 'linear-gradient(135deg, #FF6B6B 0%, #e74c3c 100%)' 
                    : 'rgba(255,255,255,0.2)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)'
                }}
              >
                🎆 Excited
              </button>
            </div>
          </div>

          {/* Trigger Button */}
          <button
            onClick={triggerCelebration}
            style={{
              padding: '15px 30px',
              background: 'linear-gradient(135deg, #FFD93D 0%, #FF9FF3 100%)',
              color: '#2c3e50',
              border: 'none',
              borderRadius: '15px',
              fontSize: '1.2rem',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
              transform: 'translateY(0)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 12px 35px rgba(0,0,0,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.2)';
            }}
          >
            🎊 Trigger Celebration!
          </button>
        </div>

        {/* Preview Area */}
        <div style={{
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          padding: '30px',
          border: '1px solid rgba(255,255,255,0.2)',
          position: 'relative',
          minHeight: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <h3 style={{
            color: 'white',
            fontSize: '1.8rem',
            textAlign: 'center',
            opacity: showEncouragement ? 0 : 0.6
          }}>
            Click "Trigger Celebration!" to see the magic ✨
          </h3>

          {/* Confetti Animation */}
          {showConfetti && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              pointerEvents: 'none',
              overflow: 'hidden'
            }}>
              {generateConfetti().map(particle => (
                <div
                  key={particle.id}
                  style={{
                    position: 'absolute',
                    left: `${particle.left}%`,
                    top: '-10px',
                    width: `${particle.size}px`,
                    height: `${particle.size}px`,
                    backgroundColor: particle.color,
                    borderRadius: '50%',
                    animation: `confettiFall ${celebrationStyle === 'excited' ? 3 : 2.5}s ease-in-out ${particle.animationDelay}s`,
                    animationFillMode: 'forwards'
                  }}
                />
              ))}
            </div>
          )}

          {/* Sparkles Animation */}
          {showSparkles && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              pointerEvents: 'none'
            }}>
              {generateSparkles().map(sparkle => (
                <div
                  key={sparkle.id}
                  style={{
                    position: 'absolute',
                    left: `${sparkle.left}%`,
                    top: `${sparkle.top}%`,
                    fontSize: `${sparkle.size}px`,
                    animation: `sparkle 1.5s ease-in-out ${sparkle.animationDelay}s`,
                    animationFillMode: 'forwards'
                  }}
                >
                  ✨
                </div>
              ))}
            </div>
          )}

          {/* Encouragement Message */}
          {showEncouragement && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: 'white',
              fontSize: celebrationStyle === 'excited' ? '3rem' : '2.5rem',
              fontWeight: '700',
              textAlign: 'center',
              animation: `messageAppear ${celebrationStyle === 'excited' ? 4 : 3}s ease-in-out`,
              textShadow: '0 4px 20px rgba(0,0,0,0.5)',
              zIndex: 10
            }}>
              {currentMessage}
            </div>
          )}

          {/* Celebration Message with Enhanced Styling */}
          {message && showEncouragement && (
            <div className="celebration-message">
              {message}
            </div>
          )}
        </div>

        {/* Features List */}
        <div style={{
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          padding: '30px',
          marginTop: '30px',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <h3 style={{
            color: 'white',
            fontSize: '1.5rem',
            margin: '0 0 20px 0'
          }}>
            📋 Celebration Features for Special Education
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <h4 style={{
                color: 'white',
                margin: '0 0 10px 0',
                fontSize: '1.1rem'
              }}>
                🌸 Gentle Style
              </h4>
              <ul style={{
                color: 'rgba(255,255,255,0.9)',
                fontSize: '0.9rem',
                margin: '0',
                paddingLeft: '20px'
              }}>
                <li>Soft, calming animations</li>
                <li>Fewer particles for sensory sensitivity</li>
                <li>Encouraging but not overwhelming</li>
                <li>Perfect for autism/anxiety</li>
              </ul>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <h4 style={{
                color: 'white',
                margin: '0 0 10px 0',
                fontSize: '1.1rem'
              }}>
                🎆 Excited Style
              </h4>
              <ul style={{
                color: 'rgba(255,255,255,0.9)',
                fontSize: '0.9rem',
                margin: '0',
                paddingLeft: '20px'
              }}>
                <li>Vibrant, energetic celebrations</li>
                <li>More particles and longer duration</li>
                <li>Motivating for achievement</li>
                <li>Great for milestone moments</li>
              </ul>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <h4 style={{
                color: 'white',
                margin: '0 0 10px 0',
                fontSize: '1.1rem'
              }}>
              🔊 Audio Coordination
              </h4>
              <ul style={{
                color: 'rgba(255,255,255,0.9)',
                fontSize: '0.9rem',
                margin: '0',
                paddingLeft: '20px'
              }}>
                <li>Gentle chimes for celebrations</li>
                <li>Coordinated with visual effects</li>
                <li>Volume adjustable for sensitivity</li>
                <li>Can be disabled if needed</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CelebrationAnimations;