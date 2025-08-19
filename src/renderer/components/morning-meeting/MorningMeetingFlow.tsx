import React, { useState, useEffect } from 'react';
import { Student, StaffMember } from '../../types';

interface MorningMeetingFlowProps {
  students?: Student[];
  staff?: StaffMember[];
  onComplete?: () => void;
  onNavigateHome?: () => void;
}

const MorningMeetingFlow: React.FC<MorningMeetingFlowProps> = ({
  students = [],
  staff = [],
  onComplete,
  onNavigateHome
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      if (onComplete) onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const stepNames = [
    'Welcome', 'Attendance', 'Behavior', 'Calendar Math', 'Weather', 'Seasonal'
  ];

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      {/* Header */}
      <div style={{
        height: '70px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 2rem',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        color: 'white'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>
            🌅 Morning Meeting
          </h1>
          <div style={{ fontSize: '1rem', opacity: 0.8 }}>
            Step {currentStep} of {totalSteps}: {stepNames[currentStep - 1]}
          </div>
        </div>

        {onNavigateHome && (
          <button
            onClick={onNavigateHome}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              padding: '0.5rem 0.75rem',
              fontSize: '1rem',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            🏠 Home
          </button>
        )}
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem',
        color: 'white',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '5rem', marginBottom: '2rem' }}>
          {currentStep === 1 && '👋'}
          {currentStep === 2 && '✋'}
          {currentStep === 3 && '💪'}
          {currentStep === 4 && '📅'}
          {currentStep === 5 && '🌤️'}
          {currentStep === 6 && '🍂'}
        </div>
        
        <h2 style={{ 
          fontSize: 'clamp(2rem, 4vw, 3rem)', 
          fontWeight: '700', 
          margin: '0 0 1rem 0' 
        }}>
          {stepNames[currentStep - 1]}
        </h2>
        
        <p style={{ 
          fontSize: 'clamp(1rem, 2vw, 1.5rem)', 
          opacity: 0.9,
          maxWidth: '600px',
          lineHeight: 1.5
        }}>
          {currentStep === 1 && "Welcome to our learning community! Let's start our day together."}
          {currentStep === 2 && "Let's see who's here today and ready to learn!"}
          {currentStep === 3 && "Choose a positive behavior to focus on today."}
          {currentStep === 4 && "Let's explore the calendar and practice our math skills."}
          {currentStep === 5 && "What's the weather like today? How should we dress?"}
          {currentStep === 6 && "Let's learn about our current season and activities."}
        </p>

        {students.length > 0 && (
          <div style={{
            marginTop: '2rem',
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            {students.slice(0, 6).map((student, index) => (
              <div key={student.id} style={{
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                padding: '1rem',
                minWidth: '100px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                  {(student as any).emoji || '👤'}
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>
                  {student.name}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        height: '60px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 2rem',
        background: 'rgba(255, 255, 255, 0.1)',
        borderTop: '1px solid rgba(255, 255, 255, 0.2)',
        color: 'white'
      }}>
        <button
          onClick={handleBack}
          disabled={currentStep === 1}
          style={{
            padding: '0.75rem 1.5rem',
            background: currentStep === 1 ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '8px',
            color: currentStep === 1 ? 'rgba(255, 255, 255, 0.5)' : 'white',
            cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            fontWeight: '600',
            opacity: currentStep === 1 ? 0.5 : 1
          }}
        >
          ← Back
        </button>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {Array.from({ length: totalSteps }, (_, index) => (
            <div
              key={index}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: index < currentStep ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.3)',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'rgba(255, 255, 255, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '8px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '600'
          }}
        >
          {currentStep >= totalSteps ? 'Complete 🎉' : 'Next →'}
        </button>
      </div>

      <style>{`
        button:hover:not(:disabled) {
          transform: scale(1.05);
          background: rgba(255, 255, 255, 0.3) !important;
        }
      `}</style>
    </div>
  );
};

export default MorningMeetingFlow;