// Quick Data Entry Modal Component
// src/renderer/components/data-collection/QuickDataEntry.tsx

import React, { useState, useEffect } from 'react';
import UnifiedDataService, { UnifiedStudent, IEPGoal } from '../../services/unifiedDataService';
import { DataPoint } from '../../types';

interface QuickDataEntryProps {
  studentId: string;
  isOpen: boolean;
  onClose: () => void;
  onDataSaved: () => void;
  preselectedGoal?: string;
}

const QuickDataEntry: React.FC<QuickDataEntryProps> = ({
  studentId,
  isOpen,
  onClose,
  onDataSaved,
  preselectedGoal
}) => {
  const [student, setStudent] = useState<UnifiedStudent | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<IEPGoal | null>(null);
  const [dataValue, setDataValue] = useState<number>(0);
  const [totalOpportunities, setTotalOpportunities] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');
  const [context, setContext] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Load student data when modal opens
  useEffect(() => {
    if (isOpen && studentId) {
      const studentData = UnifiedDataService.getStudent(studentId);
      setStudent(studentData);
      
      // Auto-select goal if preselected
      if (preselectedGoal && studentData) {
        const goal = studentData.iepData.goals.find(g => g.id === preselectedGoal);
        if (goal) {
          setSelectedGoal(goal);
        }
      }
    }
  }, [isOpen, studentId, preselectedGoal]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedGoal(null);
      setDataValue(0);
      setTotalOpportunities(1);
      setNotes('');
      setContext('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleGoalSelect = (goal: IEPGoal) => {
    setSelectedGoal(goal);
    // Reset values when changing goals
    setDataValue(0);
    setTotalOpportunities(1);
  };

  const handleQuickValue = (value: number) => {
    setDataValue(value);
  };

  const handleSubmit = async () => {
    if (!student || !selectedGoal) return;

    setIsSubmitting(true);
    try {
      const now = new Date();
      const dataPoint: Omit<DataPoint, 'id'> = {
        goalId: selectedGoal.id,
        studentId: student.id,
        date: now.toISOString().split('T')[0],
        time: now.toTimeString().split(' ')[0].substring(0, 5),
        value: dataValue,
        totalOpportunities: selectedGoal.measurementType === 'frequency' || selectedGoal.measurementType === 'percentage' ? totalOpportunities : undefined,
        notes: notes.trim() || undefined,
        context: context.trim() || undefined,
        collector: 'Teacher', // Could be made dynamic
        photos: [],
        voiceNotes: []
      };

      UnifiedDataService.addDataPoint(dataPoint);
      onDataSaved();
      onClose();
    } catch (error) {
      console.error('Error saving data point:', error);
      alert('Error saving data. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStudentInitials = (name: string): string => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getMeasurementLabel = (goal: IEPGoal): string => {
    switch (goal.measurementType) {
      case 'percentage':
        return 'Accuracy (%)';
      case 'frequency':
        return 'Frequency Count';
      case 'duration':
        return 'Duration (minutes)';
      case 'rating':
        return 'Rating (1-5)';
      case 'yes-no':
        return 'Yes/No';
      case 'independence':
        return 'Independence Level';
      default:
        return 'Value';
    }
  };

  const getQuickButtons = (goal: IEPGoal) => {
    switch (goal.measurementType) {
      case 'rating':
        return [1, 2, 3, 4, 5];
      case 'yes-no':
        return [0, 1]; // 0 = No, 1 = Yes
      case 'independence':
        return [1, 2, 3, 4]; // 1 = Full Support, 4 = Independent
      case 'percentage':
        return [0, 25, 50, 75, 100];
      default:
        return [0, 1, 2, 3, 4, 5];
    }
  };

  const getButtonLabel = (value: number, goal: IEPGoal): string => {
    switch (goal.measurementType) {
      case 'yes-no':
        return value === 1 ? 'Yes' : 'No';
      case 'independence':
        const levels = ['', 'Full Support', 'Partial Support', 'Minimal Support', 'Independent'];
        return levels[value] || value.toString();
      case 'percentage':
        return `${value}%`;
      case 'rating':
        return `${value}/5`;
      default:
        return value.toString();
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          color: 'white',
          padding: '2rem',
          borderRadius: '20px 20px 0 0',
          textAlign: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
            {student?.photo ? (
              <img 
                src={student.photo} 
                alt={student.name}
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '3px solid rgba(255,255,255,0.3)'
                }}
              />
            ) : (
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
                border: '3px solid rgba(255,255,255,0.3)'
              }}>
                {student ? getStudentInitials(student.name) : '?'}
              </div>
            )}
            <div>
              <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Quick Data Entry</h2>
              <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9 }}>
                {student?.name} • {student?.grade}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '2rem' }}>
          {/* Goal Selection */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '1rem', fontWeight: 'bold', fontSize: '1.1rem' }}>
              🎯 Select IEP Goal:
            </label>
            
            {student?.iepData.goals.filter(g => g.isActive).length === 0 ? (
              <div style={{
                padding: '2rem',
                textAlign: 'center',
                background: '#f8f9fa',
                borderRadius: '12px',
                color: '#6b7280'
              }}>
                <p>No active IEP goals found for this student.</p>
                <p style={{ fontSize: '0.9rem' }}>Add goals in the Goal Manager to begin data collection.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {student?.iepData.goals.filter(g => g.isActive).map(goal => (
                  <button
                    key={goal.id}
                    onClick={() => handleGoalSelect(goal)}
                    style={{
                      padding: '1rem',
                      borderRadius: '12px',
                      border: selectedGoal?.id === goal.id ? '3px solid #667eea' : '2px solid #e5e7eb',
                      background: selectedGoal?.id === goal.id ? '#f0f4ff' : 'white',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                      {goal.description}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                      {goal.domain} • {getMeasurementLabel(goal)}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Data Entry Section */}
          {selectedGoal && (
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', marginBottom: '1rem', fontWeight: 'bold', fontSize: '1.1rem' }}>
                📊 {getMeasurementLabel(selectedGoal)}:
              </label>
              
              {/* Quick Value Buttons */}
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '0.5rem', 
                marginBottom: '1rem' 
              }}>
                {getQuickButtons(selectedGoal).map(value => (
                  <button
                    key={value}
                    onClick={() => handleQuickValue(value)}
                    style={{
                      padding: '0.75rem 1.5rem',
                      borderRadius: '25px',
                      border: dataValue === value ? '3px solid #667eea' : '2px solid #e5e7eb',
                      background: dataValue === value ? '#667eea' : 'white',
                      color: dataValue === value ? 'white' : '#374151',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      transition: 'all 0.3s ease',
                      minWidth: '80px'
                    }}
                  >
                    {getButtonLabel(value, selectedGoal)}
                  </button>
                ))}
              </div>

              {/* Custom Value Input */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#6b7280' }}>
                  Or enter custom value:
                </label>
                <input
                  type="number"
                  value={dataValue}
                  onChange={(e) => setDataValue(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '2px solid #e5e7eb',
                    fontSize: '1rem'
                  }}
                  min="0"
                  max={selectedGoal.measurementType === 'percentage' ? 100 : undefined}
                />
              </div>

              {/* Total Opportunities (for frequency/percentage) */}
              {(selectedGoal.measurementType === 'frequency' || selectedGoal.measurementType === 'percentage') && (
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#6b7280' }}>
                    Total Opportunities:
                  </label>
                  <input
                    type="number"
                    value={totalOpportunities}
                    onChange={(e) => setTotalOpportunities(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: '2px solid #e5e7eb',
                      fontSize: '1rem'
                    }}
                    min="1"
                  />
                </div>
              )}
            </div>
          )}

          {/* Context and Notes */}
          {selectedGoal && (
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#6b7280' }}>
                  Context (optional):
                </label>
                <input
                  type="text"
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="e.g., Morning circle, Math center, Independent work"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '2px solid #e5e7eb',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#6b7280' }}>
                  Notes (optional):
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional observations or notes..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '2px solid #e5e7eb',
                    fontSize: '1rem',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '1.5rem 2rem',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          gap: '1rem',
          justifyContent: 'flex-end',
          background: '#f8f9fa',
          borderRadius: '0 0 20px 20px'
        }}>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '10px',
              border: '2px solid #e5e7eb',
              background: 'white',
              color: '#374151',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              opacity: isSubmitting ? 0.6 : 1
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedGoal || isSubmitting}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '10px',
              border: 'none',
              background: selectedGoal && !isSubmitting 
                ? 'linear-gradient(135deg, #667eea, #764ba2)' 
                : '#d1d5db',
              color: 'white',
              cursor: selectedGoal && !isSubmitting ? 'pointer' : 'not-allowed',
              fontSize: '1rem',
              fontWeight: 'bold'
            }}
          >
            {isSubmitting ? 'Saving...' : 'Save Data Point'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickDataEntry;
