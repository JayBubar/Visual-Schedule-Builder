import React, { useEffect } from 'react';
import { MorningMeetingStepProps } from '../types/morningMeetingTypes';

const TestStep: React.FC<MorningMeetingStepProps> = ({ onNext, onBack }) => {
  // Add debug logging
  useEffect(() => {
    console.log('📍 STEP DEBUG: TestStep mounted');
    console.log('📍 STEP DEBUG: onNext function:', typeof onNext);
    console.log('📍 STEP DEBUG: onBack function:', typeof onBack);
  }, []);

  return (
    <div style={{
      height: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      padding: '2rem'
    }}>
      <h1>🧪 TEST STEP</h1>
      <p>If you can see this and the buttons work, navigation is fixed!</p>
      
      <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem' }}>
        <button
          onClick={() => {
            console.log('🧪 TEST: Back clicked');
            onBack();
          }}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: '2px solid white',
            borderRadius: '10px',
            color: 'white',
            padding: '1rem 2rem',
            fontSize: '1rem',
            cursor: 'pointer'
          }}
        >
          ← Back
        </button>
        <button
          onClick={() => {
            console.log('🧪 TEST: Next clicked');
            onNext();
          }}
          style={{
            background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
            border: '2px solid #4CAF50',
            borderRadius: '10px',
            color: 'white',
            padding: '1rem 2rem',
            fontSize: '1rem',
            cursor: 'pointer'
          }}
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default TestStep;
