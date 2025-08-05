import React, { useState, useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import PrintDataSheetSystem from './PrintDataSheetSystem';
import UnifiedDataService from '../../services/unifiedDataService';
import { DataPoint as BaseDataPoint } from '../../types';

// Extended DataPoint interface for this component
interface DataPoint extends BaseDataPoint {
  collectedBy?: string;
  created_at?: string;
  accuracy?: number;
  duration?: number;
  prompt_level?: 1 | 2 | 3 | 4 | 5;
}

interface QuickDataEntry {
  goalId: string;
  measurementType: 'frequency' | 'percentage' | 'duration' | 'rating' | 'yes-no' | 'independence';
  context: string;
  isQuickEntry: boolean;
}

interface IEPGoal {
  id: string;
  studentId: string;
  domain: 'academic' | 'behavioral' | 'social-emotional' | 'physical';
  title: string;
  description: string;
  measurementType: 'frequency' | 'percentage' | 'duration' | 'rating' | 'yes-no' | 'independence';
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
  // Print functionality state
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printDateRange, setPrintDateRange] = useState('week');
  const [currentEntry, setCurrentEntry] = useState<Partial<DataPoint>>({
    value: 0,
    notes: '',
    context: ''
  });
  
  const [isQuickMode, setIsQuickMode] = useState(false);
  const [recentDataPoints, setRecentDataPoints] = useState<DataPoint[]>([]);
  const [savingStatus, setSavingStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Load recent data points for context
  useEffect(() => {
    loadRecentDataPoints();
  }, [selectedGoal.id]);

  const loadRecentDataPoints = () => {
    try {
      // Use UnifiedDataService instead of localStorage
      const goalData = UnifiedDataService.getGoalDataPoints(selectedGoal.id)
        .slice(0, 5); // Last 5 entries
      setRecentDataPoints(goalData);
    } catch (error) {
      console.error('Error loading recent data points:', error);
    }
  };

  const handleQuickSave = async (quickValue: number | string) => {
    setSavingStatus('saving');
    
    const numericValue = typeof quickValue === 'string' ? 
      (quickValue === 'Yes' ? 1 : quickValue === 'No' ? 0 : parseFloat(quickValue) || 0) : 
      quickValue;
    
    const dataPoint: DataPoint = {
      id: Date.now().toString(),
      goalId: selectedGoal.id,
      studentId: selectedStudent.id,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString(),
      value: numericValue,
      context: currentEntry.context || 'Quick entry',
      collector: 'Current User', // Use collector instead of collectedBy
      collectedBy: 'Current User', // Keep for backward compatibility
      created_at: new Date().toISOString(),
      ...currentEntry
    };

    try {
      await saveDataPoint(dataPoint);
      setSavingStatus('saved');
      setTimeout(() => setSavingStatus('idle'), 2000);
      onDataSaved();
    } catch (error) {
      setSavingStatus('error');
      console.error('Error saving data point:', error);
    }
  };

  const handleDetailedSave = async () => {
    if (!currentEntry.value) return;
    
    setSavingStatus('saving');
    
    const numericValue = typeof currentEntry.value === 'string' ? 
      parseFloat(currentEntry.value) || 0 : 
      currentEntry.value;
    
    const dataPoint: DataPoint = {
      id: Date.now().toString(),
      goalId: selectedGoal.id,
      studentId: selectedStudent.id,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString(),
      value: numericValue,
      notes: currentEntry.notes,
      context: currentEntry.context || 'Detailed entry',
      collector: 'Current User', // Required field
      collectedBy: 'Current User', // Backward compatibility
      created_at: new Date().toISOString(),
      accuracy: currentEntry.accuracy,
      duration: currentEntry.duration,
      prompt_level: currentEntry.prompt_level
    };

    try {
      await saveDataPoint(dataPoint);
      setSavingStatus('saved');
      setCurrentEntry({ value: 0, notes: '', context: '' });
      setTimeout(() => setSavingStatus('idle'), 2000);
      onDataSaved();
    } catch (error) {
      setSavingStatus('error');
      console.error('Error saving data point:', error);
    }
  };

  const saveDataPoint = async (dataPoint: DataPoint) => {
    try {
      // Use UnifiedDataService with correct signature
      const dataPointToSave = {
        goalId: dataPoint.goalId,
        studentId: dataPoint.studentId,
        date: dataPoint.date,
        time: dataPoint.time,
        value: dataPoint.value,
        totalOpportunities: dataPoint.totalOpportunities,
        notes: dataPoint.notes,
        context: dataPoint.context,
        activityId: dataPoint.activityId,
        collector: dataPoint.collector || 'Current User',
        photos: dataPoint.photos || [],
        voiceNotes: dataPoint.voiceNotes || []
      };
      
      UnifiedDataService.addDataPoint(dataPointToSave);
      
      // Update goal progress
      updateGoalProgress(dataPoint);
    } catch (error) {
      console.error('Error saving data point:', error);
      throw error;
    }
  };

  const updateGoalProgress = (dataPoint: DataPoint) => {
    try {
      // Use UnifiedDataService to update goal progress
      const progress = calculateProgress(selectedGoal, dataPoint);
      UnifiedDataService.updateGoal(selectedGoal.id, { 
        currentProgress: progress,
        lastDataPoint: new Date().toISOString(),
        dataPoints: selectedGoal.dataPoints + 1
      });
    } catch (error) {
      console.error('Error updating goal progress:', error);
    }
  };

  const calculateProgress = (goal: IEPGoal, dataPoint: DataPoint): number => {
    // Simplified progress calculation - in production this would be more sophisticated
    switch (goal.measurementType) {
      case 'percentage':
        return typeof dataPoint.value === 'number' ? dataPoint.value : 0;
      case 'rating':
        return typeof dataPoint.value === 'number' ? (dataPoint.value / 5) * 100 : 0;
      case 'independence':
        // For independence, assume higher values mean more independent
        return typeof dataPoint.value === 'number' ? (dataPoint.value / 5) * 100 : 0;
      default:
        return goal.currentProgress;
    }
  };

  const renderQuickEntry = () => (
    <div style={{
      background: 'rgba(255,255,255,0.15)',
      backdropFilter: 'blur(20px)',
      borderRadius: '20px',
      padding: '2rem',
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      border: '1px solid rgba(255,255,255,0.2)',
      marginBottom: '1.5rem'
    }}>
      <h3 style={{
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: 'white',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <span>⚡</span>
        Quick Data Entry
      </h3>

      {selectedGoal.measurementType === 'rating' && (
        <div>
          <p style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '1rem' }}>
            Rate the performance (1-5):
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                onClick={() => handleQuickSave(rating)}
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  border: 'none',
                  background: 'rgba(255,255,255,0.9)',
                  color: '#2c3e50',
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.1)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
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
            color: 'rgba(255,255,255,0.8)'
          }}>
            <strong>1</strong> = Needs full support | <strong>2</strong> = Needs some help | 
            <strong>3</strong> = Inconsistent | <strong>4</strong> = Usually successful | 
            <strong>5</strong> = Independent
          </div>
        </div>
      )}

      {selectedGoal.measurementType === 'yes-no' && (
        <div>
          <p style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '1rem' }}>
            Did the student meet the goal?
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => handleQuickSave('Yes')}
              style={{
                flex: 1,
                padding: '1.5rem',
                borderRadius: '16px',
                border: 'none',
                background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                color: 'white',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(40, 167, 69, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              ✅ YES
            </button>
            <button
              onClick={() => handleQuickSave('No')}
              style={{
                flex: 1,
                padding: '1.5rem',
                borderRadius: '16px',
                border: 'none',
                background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
                color: 'white',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(220, 53, 69, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              ❌ NO
            </button>
          </div>
        </div>
      )}

      {selectedGoal.measurementType === 'independence' && (
        <div>
          <p style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '1rem' }}>
            Independence level:
          </p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { level: 5, label: 'Independent', color: '#28a745', emoji: '🌟' },
              { level: 4, label: 'Verbal Cue', color: '#20c997', emoji: '🗣️' },
              { level: 3, label: 'Gesture', color: '#ffc107', emoji: '👉' },
              { level: 2, label: 'Partial Help', color: '#fd7e14', emoji: '🤝' },
              { level: 1, label: 'Full Support', color: '#dc3545', emoji: '🆘' }
            ].map((item) => (
              <button
                key={item.level}
                onClick={() => {
                  setCurrentEntry(prev => ({ ...prev, prompt_level: item.level as 1|2|3|4|5 }));
                  handleQuickSave(item.level);
                }}
                style={{
                  flex: '1',
                  minWidth: '120px',
                  padding: '1rem 0.5rem',
                  borderRadius: '12px',
                  border: 'none',
                  background: item.color,
                  color: 'white',
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>{item.emoji}</span>
                <span>{item.level}</span>
                <span style={{ fontSize: '0.8rem' }}>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderDetailedEntry = () => (
    <div style={{
      display: 'grid',
      gridTemplateColumns: window.innerWidth > 768 ? '1fr 1fr' : '1fr',
      gap: '2rem'
    }}>
      {/* Form Column */}
      <div style={{
        background: 'rgba(255,255,255,0.15)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        padding: '2rem',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        <h3 style={{
          fontSize: '1.8rem',
          fontWeight: 'bold',
          color: 'white',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>📝</span>
          Detailed Data Entry
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Context/Activity Field */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '1rem',
              fontWeight: '600',
              color: 'white',
              marginBottom: '8px'
            }}>
              Activity/Context
            </label>
            <input
              type="text"
              value={currentEntry.context || ''}
              onChange={(e) => setCurrentEntry(prev => ({ ...prev, context: e.target.value }))}
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
              placeholder="e.g., Math center, Reading group, Recess..."
            />
          </div>

          {/* Measurement-specific inputs */}
          {selectedGoal.measurementType === 'percentage' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: 'white',
                    marginBottom: '8px'
                  }}>
                    Correct Responses
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={currentEntry.accuracy || ''}
                    onChange={(e) => {
                      const correct = parseInt(e.target.value) || 0;
                      const total = (currentEntry.value as number) || 0;
                      setCurrentEntry(prev => ({
                        ...prev,
                        accuracy: correct,
                        value: total > 0 ? Math.round((correct / total) * 100) : 0
                      }));
                    }}
                    style={{
                      width: '100%',
                      padding: '16px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderRadius: '12px',
                      fontSize: '1.1rem',
                      background: 'rgba(255,255,255,0.9)',
                      color: '#2c3e50',
                      boxSizing: 'border-box'
                    }}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: 'white',
                    marginBottom: '8px'
                  }}>
                    Total Opportunities
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={currentEntry.value || ''}
                    onChange={(e) => {
                      const total = parseInt(e.target.value) || 0;
                      const correct = currentEntry.accuracy || 0;
                      setCurrentEntry(prev => ({
                        ...prev,
                        value: total,
                        accuracy: total > 0 ? Math.round((correct / total) * 100) : 0
                      }));
                    }}
                    style={{
                      width: '100%',
                      padding: '16px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderRadius: '12px',
                      fontSize: '1.1rem',
                      background: 'rgba(255,255,255,0.9)',
                      color: '#2c3e50',
                      boxSizing: 'border-box'
                    }}
                    placeholder="0"
                  />
                </div>
              </div>
              <div style={{
                marginTop: '1rem',
                padding: '1rem',
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>
                  {currentEntry.accuracy || 0}%
                </span>
                <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0 }}>
                  Accuracy ({currentEntry.accuracy || 0} out of {currentEntry.totalOpportunities || 0})
                </p>
              </div>
            </div>
          )}

          {selectedGoal.measurementType === 'frequency' && (
            <div>
              <label style={{
                display: 'block',
                fontSize: '1rem',
                fontWeight: '600',
                color: 'white',
                marginBottom: '8px'
              }}>
                Number of Occurrences
              </label>
              <input
                type="number"
                min="0"
                value={currentEntry.value || ''}
                onChange={(e) => setCurrentEntry(prev => ({ ...prev, value: parseInt(e.target.value) || 0 }))}
                style={{
                  width: '100%',
                  padding: '16px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderRadius: '12px',
                  fontSize: '1.1rem',
                  background: 'rgba(255,255,255,0.9)',
                  color: '#2c3e50',
                  boxSizing: 'border-box'
                }}
                placeholder="Enter count..."
              />
            </div>
          )}

          {selectedGoal.measurementType === 'duration' && (
            <div>
              <label style={{
                display: 'block',
                fontSize: '1rem',
                fontWeight: '600',
                color: 'white',
                marginBottom: '8px'
              }}>
                Duration (minutes)
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={currentEntry.duration || ''}
                onChange={(e) => {
                  const duration = parseFloat(e.target.value) || 0;
                  setCurrentEntry(prev => ({ ...prev, duration, value: duration }));
                }}
                style={{
                  width: '100%',
                  padding: '16px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderRadius: '12px',
                  fontSize: '1.1rem',
                  background: 'rgba(255,255,255,0.9)',
                  color: '#2c3e50',
                  boxSizing: 'border-box'
                }}
                placeholder="0.0"
              />
            </div>
          )}

          {/* Notes */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '1rem',
              fontWeight: '600',
              color: 'white',
              marginBottom: '8px'
            }}>
              Notes (Optional)
            </label>
            <textarea
              value={currentEntry.notes || ''}
              onChange={(e) => setCurrentEntry(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              style={{
                width: '100%',
                padding: '16px',
                border: '2px solid rgba(255,255,255,0.3)',
                borderRadius: '12px',
                fontSize: '1rem',
                background: 'rgba(255,255,255,0.9)',
                color: '#2c3e50',
                resize: 'vertical',
                boxSizing: 'border-box'
              }}
              placeholder="Additional observations, strategies used, environmental factors..."
            />
          </div>

          {/* Save Button */}
          <button
            onClick={handleDetailedSave}
            disabled={!currentEntry.value || savingStatus === 'saving'}
            style={{
              width: '100%',
              background: currentEntry.value && savingStatus !== 'saving'
                ? 'linear-gradient(135deg, #28a745 0%, #20c997 100%)'
                : 'rgba(255,255,255,0.3)',
              color: 'white',
              fontWeight: '700',
              fontSize: '1.2rem',
              padding: '16px',
              borderRadius: '12px',
              border: 'none',
              cursor: currentEntry.value && savingStatus !== 'saving' ? 'pointer' : 'not-allowed',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              if (currentEntry.value && savingStatus !== 'saving') {
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(40, 167, 69, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (currentEntry.value && savingStatus !== 'saving') {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          >
            {savingStatus === 'saving' && <span>⏳</span>}
            {savingStatus === 'saved' && <span>✅</span>}
            {savingStatus === 'error' && <span>❌</span>}
            {savingStatus === 'idle' && <span>💾</span>}
            {savingStatus === 'saving' ? 'Saving...' : 
             savingStatus === 'saved' ? 'Saved!' :
             savingStatus === 'error' ? 'Error - Try Again' : 
             'Save Data Point'}
          </button>
        </div>
      </div>

      {/* Context/Progress Column */}
      <div style={{
        background: 'rgba(255,255,255,0.15)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        padding: '2rem',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        <h3 style={{
          fontSize: '1.8rem',
          fontWeight: 'bold',
          color: 'white',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>📊</span>
          Goal Progress
        </h3>

        {/* Current Progress */}
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ color: 'white', fontWeight: '600' }}>Current Progress</span>
            <span style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }}>
              {selectedGoal.currentProgress}%
            </span>
          </div>
          <div style={{
            width: '100%',
            height: '10px',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '5px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${selectedGoal.currentProgress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #28a745, #20c997)',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        {/* Goal Details */}
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '1.5rem'
        }}>
          <h4 style={{ color: 'white', marginBottom: '1rem' }}>Goal Details</h4>
          <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', lineHeight: '1.5' }}>
            <p><strong>Target:</strong> {selectedGoal.criteria}</p>
            <p><strong>Type:</strong> {selectedGoal.measurementType}</p>
            <p><strong>Data Points:</strong> {selectedGoal.dataPoints}</p>
            <p><strong>Priority:</strong> {selectedGoal.priority}</p>
          </div>
        </div>

        {/* Recent Data Points */}
        {recentDataPoints.length > 0 && (
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '12px',
            padding: '1.5rem'
          }}>
            <h4 style={{ color: 'white', marginBottom: '1rem' }}>Recent Entries</h4>
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {recentDataPoints.map((dp, index) => (
                <div
                  key={dp.id}
                  style={{
                    padding: '0.75rem',
                    marginBottom: '0.5rem',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    fontSize: '0.9rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'white' }}>
                    <span>{dp.date}</span>
                    <span style={{ fontWeight: 'bold' }}>{dp.value}</span>
                  </div>
                  {dp.context && (
                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>
                      {dp.context}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div style={{
      height: '100vh',
      overflow: 'auto',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '1rem'
    }}>
      {/* Header */}
      <div style={{
        marginBottom: '2rem'
      }}>
        <button
          onClick={onBack}
          style={{
            background: 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.3)',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: '600',
            fontSize: '1rem',
            marginBottom: '1rem'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
          }}
        >
          <span style={{ fontSize: '1.2rem' }}>←</span>
          Back to Goals
        </button>

        <div style={{
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          padding: '1.5rem',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
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
              color: 'white'
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
                fontSize: '2rem',
                fontWeight: 'bold',
                color: 'white',
                margin: 0
              }}>
                {selectedStudent.name}
              </h1>
              <p style={{
                fontSize: '1.2rem',
                color: 'rgba(255,255,255,0.9)',
                margin: 0
              }}>
                {selectedGoal.title}
              </p>
            </div>
          </div>
          
          {/* Print Button */}
          <button
            onClick={() => setShowPrintModal(true)}
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 20px',
              fontSize: '0.95rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.15)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
            }}
          >
            🖨️ Print Data Sheet
          </button>
        </div>
      </div>

      {/* Entry Mode Toggle */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '2rem'
      }}>
        <div style={{
          display: 'flex',
          background: 'rgba(255,255,255,0.2)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          padding: '8px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <button
            onClick={() => setIsQuickMode(true)}
            style={{
              padding: '12px 24px',
              borderRadius: '12px',
              border: 'none',
              fontWeight: '600',
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: isQuickMode 
                ? 'rgba(255,255,255,0.9)' 
                : 'transparent',
              color: isQuickMode 
                ? '#667eea' 
                : 'white',
              transform: isQuickMode ? 'scale(1.05)' : 'scale(1)'
            }}
          >
            <span>⚡</span>
            Quick Entry
          </button>
          <button
            onClick={() => setIsQuickMode(false)}
            style={{
              padding: '12px 24px',
              borderRadius: '12px',
              border: 'none',
              fontWeight: '600',
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: !isQuickMode 
                ? 'rgba(255,255,255,0.9)' 
                : 'transparent',
              color: !isQuickMode 
                ? '#667eea' 
                : 'white',
              transform: !isQuickMode ? 'scale(1.05)' : 'scale(1)'
            }}
          >
            <span>📝</span>
            Detailed Entry
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {isQuickMode ? renderQuickEntry() : renderDetailedEntry()}
      </div>

      {/* Print Modal */}
      {showPrintModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '2rem',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h3 style={{ 
              fontSize: '1.5rem', 
              fontWeight: 'bold', 
              marginBottom: '1.5rem',
              color: '#1f2937'
            }}>
              🖨️ Generate Print Data Sheet
            </h3>

            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ marginBottom: '1rem', color: '#4b5563' }}>
                <strong>Student:</strong> {selectedStudent?.name}<br/>
                <strong>Goal:</strong> {selectedGoal?.description}<br/>
                <strong>Measurement:</strong> {selectedGoal?.measurementType}
              </p>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
                Select Date Range:
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <button
                  onClick={() => setPrintDateRange('week')}
                  style={{
                    padding: '1rem',
                    borderRadius: '8px',
                    border: `2px solid ${printDateRange === 'week' ? '#3b82f6' : '#d1d5db'}`,
                    background: printDateRange === 'week' ? '#eff6ff' : '#f9fafb',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ fontWeight: '600', color: '#1f2937' }}>📅 One Week</div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>5 weekdays</div>
                </button>
                <button
                  onClick={() => setPrintDateRange('month')}
                  style={{
                    padding: '1rem',
                    borderRadius: '8px',
                    border: `2px solid ${printDateRange === 'month' ? '#3b82f6' : '#d1d5db'}`,
                    background: printDateRange === 'month' ? '#eff6ff' : '#f9fafb',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ fontWeight: '600', color: '#1f2937' }}>📅 One Month</div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>20 weekdays</div>
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowPrintModal(false)}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  background: '#f9fafb',
                  color: '#374151',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Create and open print window with data sheet
                  const getDatesForRange = () => {
                    const dates = [];
                    const today = new Date();
                    
                    if (printDateRange === 'week') {
                      let currentDate = new Date(today);
                      let daysAdded = 0;
                      while (daysAdded < 5) {
                        if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
                          dates.push(new Date(currentDate));
                          daysAdded++;
                        }
                        currentDate.setDate(currentDate.getDate() + 1);
                      }
                    } else if (printDateRange === 'month') {
                      let currentDate = new Date(today);
                      let daysAdded = 0;
                      while (daysAdded < 20) {
                        if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
                          dates.push(new Date(currentDate));
                          daysAdded++;
                        }
                        currentDate.setDate(currentDate.getDate() + 1);
                      }
                    }
                    return dates;
                  };
                  
                  const dates = getDatesForRange();
                  const printWindow = window.open('', '_blank');
                  const printContent = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                      <title>Data Sheet - ${selectedStudent.name}</title>
                      <style>
                        body { font-family: Arial, sans-serif; padding: 20px; max-width: 8.5in; margin: 0 auto; }
                        .header { text-align: center; border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
                        .header h1 { color: #2563eb; margin: 0; font-size: 24px; }
                        .info { margin-bottom: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                        .info-box { background: #f8f9fa; padding: 15px; border-radius: 8px; }
                        .objective { background: #eff6ff; padding: 15px; border-radius: 8px; border: 1px solid #bfdbfe; margin-bottom: 20px; }
                        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                        th { background-color: #f8f9fa; font-weight: bold; }
                        .date-col { font-weight: bold; }
                        .data-cell { height: 40px; }
                        .instructions { background: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin-top: 30px; }
                        .signature { margin-top: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; font-size: 12px; }
                        @media print { body { -webkit-print-color-adjust: exact; } }
                      </style>
                    </head>
                    <body>
                      <div class="header">
                        <h1>IEP Data Collection Sheet</h1>
                        <p style="margin: 10px 0 0 0; color: #666;">Visual Schedule Builder Platform</p>
                      </div>
                      
                      <div class="info">
                        <div class="info-box">
                          <h3 style="margin-top: 0;">Student Information</h3>
                          <p><strong>Name:</strong> ${selectedStudent.name}</p>
                          <p><strong>Date Range:</strong> ${dates[0]?.toLocaleDateString()} - ${dates[dates.length - 1]?.toLocaleDateString()}</p>
                        </div>
                        <div class="info-box">
                          <h3 style="margin-top: 0;">Goal Information</h3>
                          <p><strong>Domain:</strong> ${selectedGoal.domain}</p>
                          <p><strong>Measurement:</strong> ${selectedGoal.measurementType}</p>
                        </div>
                      </div>
                      
                      <div class="objective">
                        <h4 style="color: #1e40af; margin-top: 0;">Goal Description:</h4>
                        <p style="margin: 0;">${selectedGoal.description}</p>
                      </div>
                      
                      <table>
                        <thead>
                          <tr>
                            <th style="width: 20%;">Date</th>
                            <th style="width: 20%;">Data Value</th>
                            <th style="width: 15%;">Accuracy %</th>
                            <th style="width: 45%;">Notes</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${dates.map(date => `
                            <tr>
                              <td class="date-col">${date.toLocaleDateString()}</td>
                              <td class="data-cell"></td>
                              <td class="data-cell"></td>
                              <td class="data-cell"></td>
                            </tr>
                          `).join('')}
                        </tbody>
                      </table>
                      
                      <div class="instructions">
                        <h4 style="margin-top: 0;">Data Collection Instructions:</h4>
                        <ul style="margin: 0; padding-left: 20px;">
                          <li>Fill out data immediately after each opportunity when possible</li>
                          <li>Use notes section to record context, prompts used, or environmental factors</li>
                          <li>Enter data into digital system daily for progress tracking</li>
                          <li>Contact IEP team if student consistently exceeds or falls below target criteria</li>
                        </ul>
                      </div>
                      
                      <div class="signature">
                        <div><strong>Teacher Signature:</strong> ____________________________</div>
                        <div><strong>Date Completed:</strong> ____________________________</div>
                      </div>
                    </body>
                    </html>
                  `;
                  
                  printWindow.document.write(printContent);
                  printWindow.document.close();
                  printWindow.print();
                  setShowPrintModal(false);
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#3b82f6',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                🖨️ Generate & Print
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success/Error Messages */}
      {savingStatus === 'saved' && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
          color: 'white',
          padding: '1rem 1.5rem',
          borderRadius: '12px',
          boxShadow: '0 8px 25px rgba(40, 167, 69, 0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '1rem',
          fontWeight: '600',
          zIndex: 1000
        }}>
          <span style={{ fontSize: '1.2rem' }}>✅</span>
          Data saved successfully!
        </div>
      )}

      {savingStatus === 'error' && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
          color: 'white',
          padding: '1rem 1.5rem',
          borderRadius: '12px',
          boxShadow: '0 8px 25px rgba(220, 53, 69, 0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '1rem',
          fontWeight: '600',
          zIndex: 1000
        }}>
          <span style={{ fontSize: '1.2rem' }}>❌</span>
          Error saving data. Please try again.
        </div>
      )}
    </div>
  );
};

export default EnhancedDataEntry;
