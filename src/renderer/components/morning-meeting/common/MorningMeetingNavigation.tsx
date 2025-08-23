// src/renderer/components/morning-meeting/common/MorningMeetingNavigation.tsx

import React from 'react';

interface MorningMeetingNavigationProps {
  onBack: () => void;
  onNext: () => void;
  isNextDisabled?: boolean;
  isBackDisabled?: boolean;
  currentStep?: number;
  totalSteps?: number;
  nextButtonText?: string;
}

const MorningMeetingNavigation: React.FC<MorningMeetingNavigationProps> = ({
  onBack,
  onNext,
  isNextDisabled = false,
  isBackDisabled = false,
  currentStep,
  totalSteps,
  nextButtonText,
}) => {
  const styles: { [key: string]: React.CSSProperties } = {
    // Style for the individual buttons
    navButton: {
      position: 'absolute',
      bottom: '2rem',
      width: '80px',
      height: '80px',
      background: 'rgba(255, 255, 255, 0.2)',
      backdropFilter: 'blur(10px)',
      border: '2px solid rgba(255, 255, 255, 0.3)',
      borderRadius: '50%', // Makes the buttons circular
      color: 'white',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontSize: '3rem', // Larger font for the arrows
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
    },
    // Positioning for the "Back" button
    backButton: {
      left: '2rem',
    },
    // Positioning for the "Next" button
    nextButton: {
      right: '2rem',
    },
    // Style for when a button is disabled
    disabledButton: {
      background: 'rgba(0, 0, 0, 0.2)',
      color: 'rgba(255, 255, 255, 0.4)',
      cursor: 'not-allowed',
      opacity: 0.5,
    },
    // Style for the step indicator
    navIndicator: {
      position: 'absolute',
      bottom: '2rem',
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'rgba(255, 255, 255, 0.2)',
      backdropFilter: 'blur(10px)',
      border: '2px solid rgba(255, 255, 255, 0.3)',
      borderRadius: '25px',
      color: 'white',
      padding: '12px 24px',
      fontSize: '1.2rem',
      fontWeight: 'bold',
      textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
      whiteSpace: 'nowrap',
    },
  };

  return (
    <>
      {/* Back Button */}
      <button
        onClick={onBack}
        disabled={isBackDisabled}
        style={{ ...styles.navButton, ...styles.backButton, ...(isBackDisabled ? styles.disabledButton : {}) }}
        aria-label="Previous Step"
      >
        &#8249; {/* This is the HTML code for the < symbol */}
      </button>

      {/* Step Counter */}
      {currentStep && totalSteps && (
        <div style={styles.navIndicator}>
          Step {currentStep} of {totalSteps}
        </div>
      )}

      {/* Next Button */}
      <button
        onClick={onNext}
        disabled={isNextDisabled}
        style={{ ...styles.navButton, ...styles.nextButton, ...(isNextDisabled ? styles.disabledButton : {}) }}
        aria-label="Next Step"
      >
        {nextButtonText ? nextButtonText : '&#8250;'} {/* Use custom text or default arrow */}
      </button>
    </>
  );
};

export default MorningMeetingNavigation;
