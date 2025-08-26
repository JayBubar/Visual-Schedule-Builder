// src/components/morning-meeting/common/StepNavigation.tsx
import React from 'react';

interface StepNavigationProps {
  navigation?: any;
  onNext?: () => void;
  onBack?: () => void;
  onHome?: () => void;
  customNextText?: string;
}

const StepNavigation: React.FC<StepNavigationProps> = ({
  navigation,
  onNext,
  onBack,
  onHome,
  customNextText
}) => {
  // Handle both navigation object and direct props
  const actualGoNext = navigation?.goNext || onNext;
  const actualGoBack = navigation?.goBack || onBack;
  const actualGoHome = navigation?.goHome || onHome;
  const canGoBack = navigation?.canGoBack ?? (!!actualGoBack);
  const isLastStep = navigation?.isLastStep ?? false;
  
  if (!actualGoNext) {
    console.warn('⚠️ StepNavigation: No navigation function available');
    return null;
  }

  const buttonStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: '2rem',
    width: '80px',
    height: '80px',
    background: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(10px)',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '50%',
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontSize: '3rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
  };

  const disabledStyle: React.CSSProperties = {
    background: 'rgba(0, 0, 0, 0.2)',
    color: 'rgba(255, 255, 255, 0.4)',
    cursor: 'not-allowed',
    opacity: 0.5,
  };

  const homeButtonStyle: React.CSSProperties = {
    position: 'absolute',
    top: '2rem',
    left: '2rem',
    width: '60px',
    height: '60px',
    background: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(10px)',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '50%',
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontSize: '1.8rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
  };

  return (
    <>
      {/* Home Button - Top Left */}
      {actualGoHome && (
        <button
          onClick={actualGoHome}
          style={homeButtonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
          aria-label="Back to Schedule Builder"
          title="Back to Schedule Builder"
        >
          🏠
        </button>
      )}

      {/* Back Button - Bottom Left */}
      {canGoBack && (
        <button
          onClick={actualGoBack}
          style={{
            ...buttonStyle,
            left: '2rem',
          }}
          onMouseEnter={(e) => {
            if (canGoBack) {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
          aria-label="Previous Step"
        >
          &lt;
        </button>
      )}

      {/* Next Button - Bottom Right */}
      <button
        onClick={actualGoNext}
        style={{
          ...buttonStyle,
          right: '2rem',
          ...(isLastStep && {
            background: 'rgba(76, 175, 80, 0.3)',
            border: '2px solid rgba(76, 175, 80, 0.5)'
          })
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = isLastStep 
            ? 'rgba(76, 175, 80, 0.4)' 
            : 'rgba(255, 255, 255, 0.3)';
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = isLastStep 
            ? 'rgba(76, 175, 80, 0.3)' 
            : 'rgba(255, 255, 255, 0.2)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
        aria-label={isLastStep ? "Complete Meeting" : "Next Step"}
      >
        {isLastStep ? '✓' : '>'}
      </button>
    </>
  );
};

export default StepNavigation;
