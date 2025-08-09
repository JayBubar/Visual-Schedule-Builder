import React, { useState, useEffect } from 'react';
import UnifiedDataService, { UnifiedStudent, IEPGoal } from '../../services/unifiedDataService';
import { EnhancedDataPoint } from '../../types';

interface EnhancedDataEntryProps {
  selectedStudent: UnifiedStudent;
  selectedGoal: IEPGoal;
  onBack: () => void;
  onDataSaved: () => void;
}

const EnhancedDataEntry: React.FC<EnhancedDataEntryProps> = ({
  selectedStudent,
  selectedGoal,
  onBack,
  onDataSaved
}) => {
  const [value, setValue] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [context, setContext] = useState<string>('');
  const [showTrialDetails, setShowTrialDetails] = useState(false);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [totalAttempts, setTotalAttempts] = useState<number>(0);
  const [savingStatus, setSavingStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Auto-calculate percentage from trials
  useEffect(() => {
    if (showTrialDetails && totalAttempts > 0) {
      const calculatedPercentage = Math.round((correctCount / totalAttempts) * 100);
      setValue(calculatedPercentage);
    }
  }, [correctCount, totalAttempts, showTrialDetails]);

  const handleSaveData = async () => {
    if (!value && value !== 0) {
      alert('Please enter a performance value');
      return;
    }
    
    if (!notes.trim()) {
      alert('Please add detailed notes - they are important for admin requests and progress reports');
      return;
    }

    setSavingStatus('saving');
    
    const enhancedDataPoint: Omit<EnhancedDataPoint, 'id'> = {
      goalId: selectedGoal.id,
      studentId: selectedStudent.id,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('en-US', { hour12: false }),
      value: value,
      notes: notes,
      context: context || 'General instruction',
      collector: 'Teacher',
      photos: [],
      voiceNotes: [],
      sessionType: 'instruction',
      confidenceLevel: 'medium',
      accommodationsUsed: [],
      environmentalFactors: [],
      dataQuality: 'good',
      
      // Trial data if applicable
      ...(showTrialDetails && {
        trialData: {
          correctCount: correctCount,
          totalAttempts: totalAttempts,
          showTrials: true
        }
      })
    };

    try {
      UnifiedDataService.addEnhancedDataPoint(enhancedDataPoint);
      setSavingStatus('saved');
      setShowConfirmation(true);
      
      // Reset form
      setValue(0);
      setNotes('');
      setContext('');
      setCorrectCount(0);
      setTotalAttempts(0);
      
      setTimeout(() => {
        setSavingStatus('idle');
        setShowConfirmation(false);
        onDataSaved();
      }, 3000);
      
    } catch (error) {
      setSavingStatus('error');
      console.error('Error saving data:', error);
      setTimeout(() => setSavingStatus('idle'), 3000);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '1rem',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Back Button */}
      <button
        onClick={onBack}
        style={{
          position: 'fixed',
          top: '1rem',
          left: '1rem',
          zIndex: 1000,
          padding: '12px 20px',
          background: 'rgba(255,255,255,0.2)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: '12px',
          color: 'white',
          fontSize: '1rem',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
      >
        ← Back to Goals
      </button>

      {/* Success Confirmation */}
      {showConfirmation && (
        <div style={{
          position: 'fixed',
          top: '1rem',
          right: '1rem',
          zIndex: 1000,
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white',
          padding: '1rem 1.5rem',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '1rem',
          fontWeight: '600'
        }}>
          ✅ Data saved successfully!
        </div>
      )}

      <div style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '4rem' }}>
        {/* Header with Student Info */}
        <div style={{
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          padding: '1.5rem',
          marginBottom: '1.5rem',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: 'white',
              border: '3px solid rgba(255,255,255,0.3)'
            }}>
              {selectedStudent.photo ? (
                <img 
                  src={selectedStudent.photo} 
                  alt={selectedStudent.name} 
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                selectedStudent.name.split(' ').map((n: string) => n[0]).join('')
              )}
            </div>

            <div>
              <h1 style={{
                fontSize: '1.8rem',
                fontWeight: 'bold',
                color: 'white',
                margin: 0,
                marginBottom: '0.25rem'
              }}>
                {selectedStudent.name}
              </h1>
              <p style={{
                fontSize: '1.1rem',
                color: 'rgba(255,255,255,0.9)',
                margin: 0,
                marginBottom: '0.5rem'
              }}>
                {selectedGoal.title}
              </p>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>
                <span>📊 {selectedGoal.currentProgress || 0}% progress</span>
                <span>🎯 {selectedGoal.dataPoints || 0} data points</span>
              </div>
            </div>
          </div>
        </div>

        {/* Goal Description */}
        <div style={{
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          padding: '1.5rem',
          marginBottom: '1.5rem',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <h2 style={{
            fontSize: '1.3rem',
            fontWeight: 'bold',
            color: 'white',
            margin: 0,
            marginBottom: '0.5rem'
          }}>
            🎯 Goal Details
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1rem', margin: 0 }}>
            {selectedGoal.description}
          </p>
        </div>

        {/* Data Entry Form */}
        <div style={{
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          padding: '1.5rem',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <h2 style={{
            fontSize: '1.3rem',
            fontWeight: 'bold',
            color: 'white',
            margin: 0,
            marginBottom: '1.5rem'
          }}>
            📝 Today's Data Entry
          </h2>

          {/* Performance Entry */}
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '1rem'
          }}>
            <label style={{ display: 'block', color: 'white', fontWeight: '600', marginBottom: '1rem' }}>
              Performance Entry
            </label>
            
            {/* Trial Details Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
              <input
                type="checkbox"
                id="showTrials"
                checked={showTrialDetails}
                onChange={(e) => setShowTrialDetails(e.target.checked)}
                style={{
                  width: '16px',
                  height: '16px',
                  accentColor: '#3b82f6'
                }}
              />
              <label htmlFor="showTrials" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
                Show trial details (for X out of Y tracking)
              </label>
            </div>

            {showTrialDetails ? (
              /* Trial-based Entry */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', marginBottom: '4px' }}>
                      Correct Responses
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={correctCount}
                      onChange={(e) => setCorrectCount(parseInt(e.target.value) || 0)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.3)',
                        borderRadius: '8px',
                        color: 'white',
                        fontSize: '1rem'
                      }}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', marginBottom: '4px' }}>
                      Total Attempts
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={totalAttempts}
                      onChange={(e) => setTotalAttempts(parseInt(e.target.value) || 0)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.3)',
                        borderRadius: '8px',
                        color: 'white',
                        fontSize: '1rem'
                      }}
                      placeholder="0"
                    />
                  </div>
                </div>
                <div style={{
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  padding: '12px',
                  textAlign: 'center'
                }}>
                  <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1.2rem' }}>
                    {value}%
                  </span>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
                    ({correctCount} out of {totalAttempts} correct)
                  </div>
                </div>
              </div>
            ) : (
              /* Direct Percentage Entry */
              <div>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', marginBottom: '4px' }}>
                  Accuracy Percentage
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={value || ''}
                  onChange={(e) => setValue(parseInt(e.target.value) || 0)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '1.2rem',
                    textAlign: 'center'
                  }}
                  placeholder="Enter percentage..."
                />
              </div>
            )}
          </div>

          {/* Context */}
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '1rem'
          }}>
            <label style={{ display: 'block', color: 'white', fontWeight: '600', marginBottom: '8px' }}>
              Activity/Context
            </label>
            <input
              type="text"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '1rem'
              }}
              placeholder="e.g., Small group reading, Independent work, Math center..."
            />
          </div>

          {/* Notes */}
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '1.5rem'
          }}>
            <label style={{ display: 'block', color: 'white', fontWeight: '600', marginBottom: '8px' }}>
              📝 Detailed Notes (Important for Admin/Progress Reports)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              style={{
                width: '100%',
                padding: '12px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '1rem',
                resize: 'vertical'
              }}
              placeholder="Detailed observations, strategies used, support provided, environmental factors, student behavior, next steps..."
            />
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginTop: '4px' }}>
              💡 Tip: Include specific observations for admin requests and progress reports
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSaveData}
            disabled={!value && value !== 0 || !notes.trim() || savingStatus === 'saving'}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '12px',
              border: 'none',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: (!value && value !== 0) || !notes.trim() || savingStatus === 'saving' ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              background: (!value && value !== 0) || !notes.trim() || savingStatus === 'saving'
                ? 'rgba(255,255,255,0.2)'
                : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: (!value && value !== 0) || !notes.trim() || savingStatus === 'saving'
                ? 'rgba(255,255,255,0.5)'
                : 'white',
              boxShadow: (!value && value !== 0) || !notes.trim() || savingStatus === 'saving'
                ? 'none'
                : '0 4px 16px rgba(16, 185, 129, 0.3)'
            }}
          >
            {savingStatus === 'saving' ? '💾 Saving...' : '💾 Save Data Point'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedDataEntry;
