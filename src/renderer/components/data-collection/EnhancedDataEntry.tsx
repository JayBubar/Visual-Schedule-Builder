import React, { useState, useEffect, useRef } from 'react';
import UnifiedDataService from '../../services/unifiedDataService';
import { EnhancedDataPoint } from '../../types';

// Enhanced interfaces for educator workflow
interface TeacherOptimizedDataEntry {
  goalId: string;
  studentId: string;
  value: number;
  trialsCorrect?: number;
  trialsTotal?: number;
  sessionType: 'instruction' | 'practice' | 'assessment' | 'generalization';
  confidenceLevel: 'low' | 'medium' | 'high';
  notes: string;
  accommodationsUsed?: string[];
  environmentalFactors?: string[];
  masteryIndicator?: boolean;
}

interface IEPGoal {
  id: string;
  studentId: string;
  domain: 'academic' | 'behavioral' | 'social-emotional' | 'physical' | 'communication' | 'adaptive';
  title: string;
  description: string;
  measurementType: 'percentage' | 'frequency' | 'duration' | 'rating' | 'yes-no' | 'independence';
  target: number;
  criteria: string;
  isActive: boolean;
  priority: 'high' | 'medium' | 'low';
  lastDataPoint?: string;
  dataPoints: number;
  currentProgress: number;
}

interface EnhancedDataEntryProps {
  selectedStudent: any;
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
  // ===== TEACHER-OPTIMIZED STATE MANAGEMENT =====
  const [entryMode, setEntryMode] = useState<'quick' | 'trial' | 'detailed'>('quick');
  const [savingStatus, setSavingStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // Current entry state with smart defaults
  const [currentEntry, setCurrentEntry] = useState<Partial<TeacherOptimizedDataEntry>>({
    goalId: selectedGoal.id,
    studentId: selectedStudent.id,
    sessionType: 'instruction',
    confidenceLevel: 'medium',
    notes: '',
    accommodationsUsed: [],
    environmentalFactors: []
  });

  // Progress and context data
  const [daysSinceLastData, setDaysSinceLastData] = useState(0);

  // ===== TEACHER EFFICIENCY FEATURES =====
  
  // Load context data on mount
  useEffect(() => {
    loadTeacherContext();
  }, [selectedGoal.id, selectedStudent.id]);

  const loadTeacherContext = () => {
    try {
      // Get progress analysis
      const analysis = UnifiedDataService.getProgressAnalysis(selectedStudent.id);
      setDaysSinceLastData(analysis.daysSinceLastData);
    } catch (error) {
      console.error('Error loading teacher context:', error);
    }
  };

  // ===== TEACHER-FRIENDLY DATA ENTRY METHODS =====

  const handleQuickSave = async (quickValue: number | string) => {
    setSavingStatus('saving');
    
    const numericValue = typeof quickValue === 'string' ? 
      (quickValue === 'Yes' ? 1 : quickValue === 'No' ? 0 : parseFloat(quickValue) || 0) : 
      quickValue;
    
    const enhancedDataPoint: Omit<EnhancedDataPoint, 'id'> = {
      goalId: selectedGoal.id,
      studentId: selectedStudent.id,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('en-US', { hour12: false }),
      value: numericValue,
      notes: currentEntry.notes || 'Quick entry',
      context: `Quick ${selectedGoal.measurementType} entry`,
      collector: 'Teacher',
      photos: [],
      voiceNotes: [],
      
      // Enhanced properties
      sessionType: currentEntry.sessionType || 'instruction',
      confidenceLevel: currentEntry.confidenceLevel || 'medium',
      accommodationsUsed: currentEntry.accommodationsUsed || [],
      environmentalFactors: currentEntry.environmentalFactors || [],
      dataQuality: 'good'
    };

    try {
      await saveEnhancedDataPoint(enhancedDataPoint);
      setSavingStatus('saved');
      setShowConfirmation(true);
      
      setTimeout(() => {
        setSavingStatus('idle');
        setShowConfirmation(false);
      }, 3000);
      
      onDataSaved();
    } catch (error) {
      setSavingStatus('error');
      console.error('Error saving quick data:', error);
      setTimeout(() => setSavingStatus('idle'), 3000);
    }
  };

  const saveEnhancedDataPoint = async (dataPoint: Omit<EnhancedDataPoint, 'id'>) => {
    try {
      UnifiedDataService.addEnhancedDataPoint(dataPoint);
      loadTeacherContext(); // Refresh context
    } catch (error) {
      console.error('Error saving enhanced data point:', error);
      throw error;
    }
  };

  // ===== MAIN RENDER =====
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Back Button */}
      <button
        onClick={onBack}
        style={{
          position: 'fixed',
          top: '2rem',
          left: '2rem',
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
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        ← Back to Goals
      </button>

      {/* Success Confirmation */}
      {showConfirmation && (
        <div style={{
          position: 'fixed',
          top: '2rem',
          right: '2rem',
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

      {/* Student & Goal Header */}
      <div style={{
        background: 'rgba(255,255,255,0.15)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        padding: '1.5rem',
        marginBottom: '1.5rem',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        border: '1px solid rgba(255,255,255,0.2)',
        marginTop: '4rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          {/* Student Photo/Avatar */}
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

          {/* Student & Goal Info */}
          <div style={{ flex: 1 }}>
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
              <span>📊 {selectedGoal.currentProgress}% progress</span>
              <span>🎯 {selectedGoal.dataPoints} data points</span>
              {daysSinceLastData > 0 && (
                <span style={{ color: daysSinceLastData > 7 ? '#fbbf24' : 'rgba(255,255,255,0.8)' }}>
                  ⏰ {daysSinceLastData} days since last data
                </span>
              )}
            </div>
          </div>

          {/* Quick Status Indicator */}
          <div style={{
            background: selectedGoal.currentProgress >= selectedGoal.target ? 
              'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 
              selectedGoal.currentProgress >= selectedGoal.target * 0.8 ? 
              'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' :
              'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: 'white',
            padding: '0.75rem 1rem',
            borderRadius: '12px',
            textAlign: 'center',
            minWidth: '100px'
          }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
              {selectedGoal.currentProgress}%
            </div>
            <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>
              {selectedGoal.currentProgress >= selectedGoal.target ? 'Mastered' : 
               selectedGoal.currentProgress >= selectedGoal.target * 0.8 ? 'On Track' : 'Needs Support'}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{
          width: '100%',
          height: '8px',
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${Math.min(selectedGoal.currentProgress, 100)}%`,
            height: '100%',
            background: selectedGoal.currentProgress >= selectedGoal.target ? 
              'linear-gradient(90deg, #10b981, #059669)' :
              'linear-gradient(90deg, #3b82f6, #1d4ed8)',
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>

      {/* Quick Data Entry Interface */}
      <div style={{
        background: 'rgba(255,255,255,0.15)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        padding: '2rem',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        border: '1px solid rgba(255,255,255,0.2)',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <h3 style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: 'white',
          marginBottom: '1.5rem',
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}>
          <span>⚡</span>
          Quick Data Entry
          <span style={{ fontSize: '0.8rem', opacity: 0.7, marginLeft: '8px' }}>
            (Touch-friendly for tablets)
          </span>
        </h3>

        {/* Quick Notes */}
        <div style={{ marginBottom: '1.5rem' }}>
          <input
            type="text"
            value={currentEntry.notes || ''}
            onChange={(e) => setCurrentEntry(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Quick note (optional) - e.g., 'Math center', 'With prompts'..."
            style={{
              width: '100%',
              padding: '16px',
              border: '2px solid rgba(255,255,255,0.3)',
              borderRadius: '12px',
              fontSize: '1rem',
              background: 'rgba(255,255,255,0.9)',
              color: '#2c3e50',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Measurement-specific quick entry */}
        {selectedGoal.measurementType === 'yes-no' && (
          <div>
            <p style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '1rem', textAlign: 'center', fontSize: '1.1rem' }}>
              Did the student meet the goal criteria?
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => handleQuickSave(1)}
                disabled={savingStatus === 'saving'}
                style={{
                  flex: 1,
                  padding: '1.5rem',
                  borderRadius: '16px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  cursor: savingStatus === 'saving' ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  opacity: savingStatus === 'saving' ? 0.6 : 1,
                  minHeight: '80px'
                }}
              >
                ✅ YES
              </button>
              <button
                onClick={() => handleQuickSave(0)}
                disabled={savingStatus === 'saving'}
                style={{
                  flex: 1,
                  padding: '1.5rem',
                  borderRadius: '16px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: 'white',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  cursor: savingStatus === 'saving' ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  opacity: savingStatus === 'saving' ? 0.6 : 1,
                  minHeight: '80px'
                }}
              >
                ❌ NO
              </button>
            </div>
          </div>
        )}

        {selectedGoal.measurementType === 'rating' && (
          <div>
            <p style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '1rem', textAlign: 'center' }}>
              Rate the performance (1-5):
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => handleQuickSave(rating)}
                  disabled={savingStatus === 'saving'}
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    border: 'none',
                    background: 'rgba(255,255,255,0.9)',
                    color: '#2c3e50',
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    cursor: savingStatus === 'saving' ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    opacity: savingStatus === 'saving' ? 0.6 : 1
                  }}
                >
                  {rating}
                </button>
              ))}
            </div>
            <div style={{
              marginTop: '1rem',
              padding: '1rem',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '12px',
              fontSize: '0.9rem',
              color: 'rgba(255,255,255,0.8)',
              textAlign: 'center'
            }}>
              <strong>1</strong> = Needs full support | <strong>2</strong> = Needs some help | 
              <strong>3</strong> = Inconsistent | <strong>4</strong> = Usually successful | 
              <strong>5</strong> = Independent
            </div>
          </div>
        )}

        {selectedGoal.measurementType === 'percentage' && (
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '1rem' }}>
              Quick percentage entry:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '12px', maxWidth: '400px', margin: '0 auto' }}>
              {[0, 25, 50, 75, 100].map((percentage) => (
                <button
                  key={percentage}
                  onClick={() => handleQuickSave(percentage)}
                  disabled={savingStatus === 'saving'}
                  style={{
                    padding: '1rem',
                    borderRadius: '12px',
                    border: 'none',
                    background: percentage >= 80 ? '#10b981' : percentage >= 60 ? '#f59e0b' : '#ef4444',
                    color: 'white',
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    cursor: savingStatus === 'saving' ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    opacity: savingStatus === 'saving' ? 0.6 : 1
                  }}
                >
                  {percentage}%
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Default numeric entry for other measurement types */}
        {!['yes-no', 'rating', 'percentage'].includes(selectedGoal.measurementType) && (
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '1rem' }}>
              Enter value for {selectedGoal.measurementType}:
            </p>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'center' }}>
              <input
                type="number"
                value={currentEntry.value || ''}
                onChange={(e) => setCurrentEntry(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                style={{
                  padding: '16px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderRadius: '12px',
                  fontSize: '1.2rem',
                  background: 'rgba(255,255,255,0.9)',
                  color: '#2c3e50',
                  width: '120px',
                  textAlign: 'center'
                }}
              />
              <button
                onClick={() => currentEntry.value !== undefined && handleQuickSave(currentEntry.value)}
                disabled={savingStatus === 'saving' || currentEntry.value === undefined}
                style={{
                  padding: '16px 24px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  color: 'white',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  cursor: (savingStatus === 'saving' || currentEntry.value === undefined) ? 'not-allowed' : 'pointer',
                  opacity: (savingStatus === 'saving' || currentEntry.value === undefined) ? 0.6 : 1
                }}
              >
                Save Data
              </button>
            </div>
          </div>
        )}

        {/* Saving Status */}
        {savingStatus === 'saving' && (
          <div style={{
            marginTop: '1rem',
            textAlign: 'center',
            color: 'rgba(255,255,255,0.9)',
            fontSize: '1rem'
          }}>
            💾 Saving data...
          </div>
        )}

        {savingStatus === 'error' && (
          <div style={{
            marginTop: '1rem',
            textAlign: 'center',
            color: '#ef4444',
            fontSize: '1rem',
            fontWeight: 'bold'
          }}>
            ❌ Error saving data. Please try again.
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedDataEntry;
