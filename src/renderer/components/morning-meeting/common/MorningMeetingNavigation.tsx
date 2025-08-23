// src/renderer/components/morning-meeting/common/MorningMeetingNavigation.tsx

import React from 'react';

interface MorningMeetingNavigationProps {
  onBack: () => void;
  onNext: () => void;
  isNextDisabled?: boolean;
  isBackDisabled?: boolean;
}

const MorningMeetingNavigation: React.FC<MorningMeetingNavigationProps> = ({
  onBack,
  onNext,
  isNextDisabled = false,
  isBackDisabled = false,
}) => {
  const styles: { [key: string]: React.CSSProperties } = {
    navButton: {
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
    },
    backButton: {
      left: '2rem',
    },
    nextButton: {
      right: '2rem',
    },
    disabledButton: {
      background: 'rgba(0, 0, 0, 0.2)',
      color: 'rgba(255, 255, 255, 0.4)',
      cursor: 'not-allowed',
      opacity: 0.5,
    },
  };

  return (
    <>
      <button
        onClick={onBack}
        disabled={isBackDisabled}
        style={{ ...styles.navButton, ...styles.backButton, ...(isBackDisabled ? styles.disabledButton : {}) }}
        aria-label="Previous Step"
      >
        &lt; {/* Using < character */}
      </button>

      <button
        onClick={onNext}
        disabled={isNextDisabled}
        style={{ ...styles.navButton, ...styles.nextButton, ...(isNextDisabled ? styles.disabledButton : {}) }}
        aria-label="Next Step"
      >
        &gt; {/* FIX: Using > character directly */}
      </button>
    </>
  );
};

export default MorningMeetingNavigation;