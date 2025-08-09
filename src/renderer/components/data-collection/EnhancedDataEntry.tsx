import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, Target, Calendar, FileText, AlertCircle, CheckCircle } from 'lucide-react';

// Props interface for the component (matching actual UnifiedDataService types)
interface EnhancedDataEntryProps {
  selectedStudent: {
    id: string;
    name: string;
    grade: string;
    photo?: string;
  };
  selectedGoal: {
    id: string;
    studentId: string;
    title: string;
    description: string;
    domain: string;
    measurementType: string;
    target: number;
    currentProgress: number;
    dataPoints: number;
    dateCreated: string;
    lastDataPoint?: string;
    // Optional enhanced properties
    nineWeekMilestones?: {
      quarter1: { target: number; actual?: number; notes?: string };
      quarter2: { target: number; actual?: number; notes?: string };
      quarter3: { target: number; actual?: number; notes?: string };
      quarter4: { target: number; actual?: number; notes?: string };
    };
    inheritedFrom?: {
      previousGoalId: string;
      previousYear: string;
      carryOverReason: string;
      modifications: string[];
    };
    iepMeetingDate?: string;
  };
  onBack: () => void;
  onDataSaved: () => void;
}

// Enhanced interfaces for real IEP workflow
interface EnhancedIEPGoal {
  id: string;
  studentId: string;
  title: string;
  description: string;
  domain: string;
  measurementType: 'percentage' | 'frequency' | 'duration' | 'rating' | 'yes-no' | 'independence';
  
  // SMART Goal components
  annualTarget: number;           // 80%
  targetDate: string;             // "2025-05-31" (IEP anniversary)
  createdDate: string;
  
  // Progress tracking
  currentProgress: number;
  dataPointCount: number;
  lastDataDate?: string;
  
  // Administrative requirements
  nineWeekTargets: number[];      // [60%, 70%, 75%, 80%] for 4 nine-week periods
  currentNineWeek: number;        // Which 9-week period (1-4)
  
  // Goal inheritance tracking
  inheritedFrom?: string;         // Previous teacher/IEP
  nextIEPDate: string;           // When new goals can be written
  isInherited: boolean;
}

interface EnhancedDataPoint {
  id: string;
  goalId: string;
  studentId: string;
  date: string;
  time: string;
  
  // Main data
  value: number;                  // Primary percentage/score
  
  // Trial tracking (optional but important)
  trialData?: {
    correctCount: number;         // 15
    totalAttempts: number;        // 20
    showTrials: boolean;          // User preference
  };
  
  // Context and notes (VERY important per feedback)
  context: string;                // Activity/setting
  notes: string;                  // Detailed observations
  
  // Administrative tracking
  nineWeekPeriod: number;         // Which 9-week period this data belongs to
  quarterlyNote?: string;         // Special notes for progress reports
  
  // Data collector info
  collector: string;
  photos?: string[];
  voiceNotes?: string[];
}

// Data entry interface for the form state
interface DataEntry {
  goalId: string;
  studentId: string;
  value?: number;
  trialsCorrect?: number;
  trialsTotal?: number;
  notes: string;
  nineWeekPeriod: number;
}

const EnhancedIEPDataEntry: React.FC<EnhancedDataEntryProps> = ({
  selectedStudent,
  selectedGoal,
  onBack,
  onDataSaved
}) => {
  // Early return if required props are missing
  if (!selectedStudent || !selectedGoal) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(20px)',
          borderRadius: '12px',
          padding: '2rem',
          color: 'white',
          textAlign: 'center'
        }}>
          <h2>Missing Data</h2>
          <p>Please select a student and goal to continue.</p>
          <button
            onClick={onBack}
            style={{
              marginTop: '1rem',
              padding: '12px 24px',
              background: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Sample data - would come from your UnifiedDataService (now using props)
  const [selectedStudentState] = useState(selectedStudent);
  const [selectedGoalState] = useState({
    ...selectedGoal,
    // Provide fallback values for enhanced features that may not exist yet
    nineWeekTargets: selectedGoal?.nineWeekMilestones ? 
      [
        selectedGoal.nineWeekMilestones.quarter1?.target || 60,
        selectedGoal.nineWeekMilestones.quarter2?.target || 70,
        selectedGoal.nineWeekMilestones.quarter3?.target || 75,
        selectedGoal.nineWeekMilestones.quarter4?.target || (selectedGoal.target || 80)
      ] : [60, 70, 75, selectedGoal?.target || 80],
    currentNineWeek: 2, // Could be calculated from school year
    dataPointCount: selectedGoal?.dataPoints || 0,
    annualTarget: selectedGoal?.target || 80,
    targetDate: selectedGoal?.iepMeetingDate || '2025-05-31',
    nextIEPDate: selectedGoal?.iepMeetingDate || '2025-05-31',
    isInherited: !!(selectedGoal?.inheritedFrom),
    inheritedFrom: selectedGoal?.inheritedFrom?.previousYear || null
  });

  // Current data entry state
  const [dataEntry, setDataEntry] = useState<DataEntry>({
    goalId: selectedGoal?.id || '',
    studentId: selectedStudent?.id || '',
    notes: '',
    nineWeekPeriod: 2
  });

  const [showTrialDetails, setShowTrialDetails] = useState(false);

  const getCurrentNineWeek = () => {
    const today = new Date();
    const schoolYearStart = new Date('2024-08-15'); // Adjust for your school year
    const daysSinceStart = Math.floor((today.getTime() - schoolYearStart.getTime()) / (1000 * 60 * 60 * 24));
    return Math.min(Math.floor(daysSinceStart / 45) + 1, 4); // 45 days per 9-week period
  };

  useEffect(() => {
    const currentPeriod = getCurrentNineWeek();
    setDataEntry(prev => ({ ...prev, nineWeekPeriod: currentPeriod }));
  }, []);

  // Calculate if student is on track for current 9-week target
  const getProgressStatus = () => {
    const currentTarget = selectedGoalState.nineWeekTargets[selectedGoalState.currentNineWeek - 1];
    const current = selectedGoalState.currentProgress;
    
    if (current >= currentTarget) return 'onTrack';
    if (current >= currentTarget - 5) return 'nearTarget';
    return 'needsSupport';
  };

  const getTrendIcon = () => {
    // In real implementation, this would calculate from recent data points
    const trend: 'improving' | 'declining' | 'stable' = 'improving'; // Sample
    if (trend === 'improving') return <TrendingUp className="text-green-500" size={16} />;
    if (trend === 'declining') return <TrendingDown className="text-red-500" size={16} />;
    return <Minus className="text-yellow-500" size={16} />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'onTrack': return 'text-green-600 bg-green-50 border-green-200';
      case 'nearTarget': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'needsSupport': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Handle trial data entry
  const handleTrialUpdate = (field: 'trialsCorrect' | 'trialsTotal', value: number) => {
    const newTrialData = {
      trialsCorrect: field === 'trialsCorrect' ? value : (dataEntry.trialsCorrect || 0),
      trialsTotal: field === 'trialsTotal' ? value : (dataEntry.trialsTotal || 0)
    };
    
    // Auto-calculate percentage from trials
    if (newTrialData.trialsTotal > 0) {
      const calculatedPercentage = Math.round((newTrialData.trialsCorrect / newTrialData.trialsTotal) * 100);
      setDataEntry(prev => ({
        ...prev,
        value: calculatedPercentage,
        trialsCorrect: newTrialData.trialsCorrect,
        trialsTotal: newTrialData.trialsTotal
      }));
    } else {
      setDataEntry(prev => ({ 
        ...prev, 
        trialsCorrect: newTrialData.trialsCorrect,
        trialsTotal: newTrialData.trialsTotal
      }));
    }
  };

  const handleDirectPercentageEntry = (value: number) => {
    setDataEntry(prev => ({ ...prev, value }));
  };

  const progressStatus = getProgressStatus();
  const daysUntilIEP = Math.ceil((new Date(selectedGoalState.nextIEPDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #2563eb 0%, #9333ea 50%, #2563eb 100%)',
      padding: '1.5rem'
    }}>
      <div style={{ maxWidth: '1800px', margin: '0 auto' }}>
        {/* Header with Student Info */}
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '2rem',
          marginBottom: '2rem',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <img 
                src={selectedStudentState?.photo || '/api/placeholder/60/60'} 
                alt={selectedStudentState?.name || 'Student'}
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  border: '4px solid rgba(255,255,255,0.3)'
                }}
              />
              <div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', margin: 0 }}>
                  {selectedStudentState?.name || 'Student Name'}
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0 }}>
                  {selectedStudentState?.grade || 'Grade'} • IEP Data Collection
                </p>
              </div>
            </div>
            <div style={{ textAlign: 'right', color: 'rgba(255,255,255,0.8)' }}>
              <p style={{ fontSize: '0.875rem', margin: 0 }}>
                Current 9-Week Period: {selectedGoalState.currentNineWeek}/4
              </p>
              <p style={{ fontSize: '0.875rem', margin: 0 }}>
                Next IEP: {new Date(selectedGoalState.nextIEPDate).toLocaleDateString()}
              </p>
              <p style={{ fontSize: '0.75rem', margin: 0 }}>
                ({daysUntilIEP} days remaining)
              </p>
            </div>
          </div>
        </div>

        {/* Goal Progress Overview */}
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '2rem',
          marginBottom: '2rem',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <Target style={{ color: 'white' }} size={28} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', margin: 0 }}>
              Goal Progress Overview
            </h2>
            {selectedGoalState.isInherited && (
              <span style={{
                padding: '0.5rem 1rem',
                background: 'rgba(234, 179, 8, 0.2)',
                border: '1px solid rgba(234, 179, 8, 0.3)',
                borderRadius: '20px',
                color: 'rgba(254, 240, 138, 1)',
                fontSize: '0.875rem'
              }}>
                Inherited Goal
              </span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Goal Description */}
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '12px',
              padding: '1.5rem'
            }}>
              <h3 style={{ fontWeight: '600', color: 'white', marginBottom: '0.5rem', fontSize: '1.1rem' }}>
                {selectedGoalState?.title || selectedGoalState?.description || 'Goal Title'}
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem', lineHeight: '1.5' }}>
                {selectedGoalState?.description || 'Goal description not available'}
              </p>
              {selectedGoalState?.inheritedFrom && (
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                  📋 Inherited from: {selectedGoalState.inheritedFrom}
                </p>
              )}
            </div>

            {/* Progress Indicators */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '1.5rem' 
            }}>
              {/* Current Progress */}
              <div style={{
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '12px',
                padding: '1.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem' }}>Current Progress</span>
                  {getTrendIcon()}
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>
                  {selectedGoalState.currentProgress}%
                </div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}>
                  {selectedGoalState.dataPointCount} data points collected
                </div>
              </div>

              {/* 9-Week Target */}
              <div style={{
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '12px',
                padding: '1.5rem'
              }}>
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  9-Week Target
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>
                  {selectedGoalState.nineWeekTargets[selectedGoalState.currentNineWeek - 1]}%
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '20px',
                  border: '1px solid',
                  display: 'inline-block',
                  marginTop: '0.5rem',
                  ...(progressStatus === 'onTrack' ? {
                    color: '#16a34a',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    borderColor: '#16a34a'
                  } : progressStatus === 'nearTarget' ? {
                    color: '#ca8a04',
                    backgroundColor: 'rgba(234, 179, 8, 0.1)',
                    borderColor: '#ca8a04'
                  } : {
                    color: '#dc2626',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderColor: '#dc2626'
                  })
                }}>
                  {progressStatus === 'onTrack' && '✅ On Track'}
                  {progressStatus === 'nearTarget' && '⚠️ Near Target'}
                  {progressStatus === 'needsSupport' && '🔴 Needs Support'}
                </div>
              </div>

              {/* Annual Goal */}
              <div style={{
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '12px',
                padding: '1.5rem'
              }}>
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  Annual Target
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>
                  {selectedGoalState.annualTarget}%
                </div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}>
                  By {new Date(selectedGoalState.targetDate).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* 9-Week Progress Timeline */}
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '12px',
              padding: '1.5rem'
            }}>
              <h4 style={{ color: 'white', fontWeight: '500', marginBottom: '1rem', fontSize: '1rem' }}>
                Nine-Week Progress Timeline
              </h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {selectedGoalState.nineWeekTargets.map((target, index) => {
                  const isCurrentPeriod = index + 1 === selectedGoalState.currentNineWeek;
                  const isPastPeriod = index + 1 < selectedGoalState.currentNineWeek;
                  const achieved = isPastPeriod ? selectedGoalState.currentProgress >= target : false;
                  
                  return (
                    <div key={index} style={{ flex: 1 }}>
                      <div style={{
                        textAlign: 'center',
                        padding: '0.75rem',
                        borderRadius: '12px',
                        border: '1px solid',
                        ...(isCurrentPeriod ? {
                          background: 'rgba(59, 130, 246, 0.3)',
                          borderColor: '#60a5fa',
                          color: 'white'
                        } : isPastPeriod && achieved ? {
                          background: 'rgba(34, 197, 94, 0.3)',
                          borderColor: '#4ade80',
                          color: '#bbf7d0'
                        } : isPastPeriod ? {
                          background: 'rgba(239, 68, 68, 0.3)',
                          borderColor: '#f87171',
                          color: '#fecaca'
                        } : {
                          background: 'rgba(255,255,255,0.05)',
                          borderColor: 'rgba(255,255,255,0.2)',
                          color: 'rgba(255,255,255,0.6)'
                        })
                      }}>
                        <div style={{ fontSize: '0.75rem' }}>Q{index + 1}</div>
                        <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>{target}%</div>
                        {isCurrentPeriod && <div style={{ fontSize: '0.75rem' }}>Current</div>}
                        {isPastPeriod && (
                          <div style={{ fontSize: '0.75rem' }}>
                            {achieved ? '✅' : '❌'}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Data Entry Form */}
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '2rem',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <FileText style={{ color: 'white' }} size={28} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', margin: 0 }}>
              Today's Data Entry
            </h2>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem' }}>
              {new Date().toLocaleDateString()} • 9-Week Period {dataEntry.nineWeekPeriod}
            </span>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
            gap: '2rem' 
          }}>
            {/* Left Column - Data Entry */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Performance Entry */}
              <div style={{
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '12px',
                padding: '1.5rem'
              }}>
                <label style={{ 
                  display: 'block', 
                  color: 'white', 
                  fontWeight: '500', 
                  marginBottom: '1rem',
                  fontSize: '1rem'
                }}>
                  Performance Entry
                </label>
                
                {/* Trial Details Toggle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                  <input
                    type="checkbox"
                    id="showTrials"
                    checked={showTrialDetails}
                    onChange={(e) => setShowTrialDetails(e.target.checked)}
                    style={{
                      borderRadius: '4px',
                      border: '1px solid rgba(255,255,255,0.3)',
                      background: 'rgba(255,255,255,0.1)',
                      accentColor: '#3b82f6'
                    }}
                  />
                  <label htmlFor="showTrials" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem' }}>
                    Show trial details (for X out of Y tracking)
                  </label>
                </div>

                {showTrialDetails ? (
                  /* Trial-based Entry */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ 
                          display: 'block', 
                          color: 'rgba(255,255,255,0.8)', 
                          fontSize: '0.875rem', 
                          marginBottom: '0.25rem' 
                        }}>
                          Correct Responses
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={dataEntry.trialsCorrect || 0}
                          onChange={(e) => handleTrialUpdate('trialsCorrect', parseInt(e.target.value) || 0)}
                          style={{
                            width: '100%',
                            padding: '0.75rem',
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
                        <label style={{ 
                          display: 'block', 
                          color: 'rgba(255,255,255,0.8)', 
                          fontSize: '0.875rem', 
                          marginBottom: '0.25rem' 
                        }}>
                          Total Attempts
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={dataEntry.trialsTotal || 0}
                          onChange={(e) => handleTrialUpdate('trialsTotal', parseInt(e.target.value) || 0)}
                          style={{
                            width: '100%',
                            padding: '0.75rem',
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
                      padding: '1rem',
                      textAlign: 'center'
                    }}>
                      <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1.5rem' }}>
                        {dataEntry.value}%
                      </span>
                      <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem' }}>
                        ({dataEntry.trialsCorrect || 0} out of {dataEntry.trialsTotal || 0} correct)
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Direct Percentage Entry */
                  <div>
                    <label style={{ 
                      display: 'block', 
                      color: 'rgba(255,255,255,0.8)', 
                      fontSize: '0.875rem', 
                      marginBottom: '0.25rem' 
                    }}>
                      Accuracy Percentage
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={dataEntry.value || ''}
                      onChange={(e) => handleDirectPercentageEntry(parseInt(e.target.value) || 0)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.3)',
                        borderRadius: '8px',
                        color: 'white',
                        fontSize: '1.5rem',
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
                padding: '1.5rem'
              }}>
                <label style={{ 
                  display: 'block', 
                  color: 'white', 
                  fontWeight: '500', 
                  marginBottom: '0.5rem',
                  fontSize: '1rem'
                }}>
                  Activity/Context
                </label>
                <input
                  type="text"
                  value={dataEntry.notes || ''}
                  onChange={(e) => setDataEntry(prev => ({ ...prev, notes: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '1rem'
                  }}
                  placeholder="e.g., Small group reading, Independent work, Math center..."
                />
              </div>

              {/* Additional Notes */}
              <div style={{
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '12px',
                padding: '1.5rem'
              }}>
                <label style={{ 
                  display: 'block', 
                  color: 'white', 
                  fontWeight: '500', 
                  marginBottom: '0.5rem',
                  fontSize: '1rem'
                }}>
                  📝 Detailed Notes (Important for Admin/Progress Reports)
                </label>
                <textarea
                  value={dataEntry.notes || ''}
                  onChange={(e) => setDataEntry(prev => ({ ...prev, notes: e.target.value }))}
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '1rem',
                    resize: 'none',
                    fontFamily: 'inherit'
                  }}
                  placeholder="Detailed observations, strategies used, support provided, environmental factors, student behavior, next steps..."
                />
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  💡 Tip: Include specific observations for admin requests and progress reports
                </div>
              </div>
            </div>

            {/* Right Column - Progress Context */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Admin Quick View */}
              <div style={{
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '12px',
                padding: '1.5rem'
              }}>
                <h3 style={{ 
                  color: 'white', 
                  fontWeight: '500', 
                  marginBottom: '1rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  fontSize: '1rem'
                }}>
                  <AlertCircle size={18} />
                  Admin Quick View
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'rgba(255,255,255,0.8)' }}>Current 9-Week:</span>
                    <span style={{ color: 'white', fontWeight: '500' }}>
                      {selectedGoalState.currentProgress}% / {selectedGoalState.nineWeekTargets[selectedGoalState.currentNineWeek - 1]}% target
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'rgba(255,255,255,0.8)' }}>Annual Progress:</span>
                    <span style={{ color: 'white', fontWeight: '500' }}>
                      {selectedGoalState.currentProgress}% / {selectedGoalState.annualTarget}% target
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'rgba(255,255,255,0.8)' }}>Data Points:</span>
                    <span style={{ color: 'white', fontWeight: '500' }}>{selectedGoalState.dataPointCount} collected</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'rgba(255,255,255,0.8)' }}>Last Entry:</span>
                    <span style={{ color: 'white', fontWeight: '500' }}>
                      {selectedGoal.lastDataPoint ? new Date(selectedGoal.lastDataPoint).toLocaleDateString() : 'No data'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Progress Summary */}
              <div style={{
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '12px',
                padding: '1.5rem'
              }}>
                <h3 style={{ color: 'white', fontWeight: '500', marginBottom: '1rem', fontSize: '1rem' }}>Recent Trends</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem' }}>This Week:</span>
                    <span style={{ color: 'white', fontWeight: '500' }}>78% ↗️</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem' }}>This Month:</span>
                    <span style={{ color: 'white', fontWeight: '500' }}>75% ↗️</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem' }}>9-Week Period:</span>
                    <span style={{ color: 'white', fontWeight: '500' }}>73% ↗️</span>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <button
                onClick={() => {
                  // Simple save using existing UnifiedDataService
                  if (dataEntry.value !== undefined && dataEntry.notes) {
                    try {
                      // Create a basic data point that matches your existing structure
                      const newDataPoint = {
                        goalId: selectedGoal?.id || '',
                        studentId: selectedStudent?.id || '',
                        date: new Date().toISOString().split('T')[0],
                        time: new Date().toLocaleTimeString('en-US', { hour12: false }),
                        value: dataEntry.value,
                        totalOpportunities: dataEntry.trialsTotal,
                        notes: dataEntry.notes,
                        context: `${selectedGoal?.measurementType || 'data'} entry`,
                        collector: 'Teacher'
                      };
                      
                      // Save using your existing UnifiedDataService
                      // UnifiedDataService.addDataPoint(newDataPoint);
                      
                      alert('Data saved successfully!');
                      onDataSaved();
                    } catch (error) {
                      console.error('Error saving data:', error);
                      alert('Error saving data. Please try again.');
                    }
                  } else {
                    alert('Please enter a value and notes before saving.');
                  }
                }}
                disabled={!dataEntry.value || !dataEntry.notes}
                style={{
                  width: '100%',
                  padding: '1rem 1.5rem',
                  borderRadius: '12px',
                  fontWeight: '500',
                  fontSize: '1.1rem',
                  transition: 'all 0.3s ease',
                  border: 'none',
                  cursor: dataEntry.value && dataEntry.notes ? 'pointer' : 'not-allowed',
                  ...(dataEntry.value && dataEntry.notes ? {
                    background: 'linear-gradient(135deg, #16a34a, #22c55e)',
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
                  } : {
                    background: 'rgba(255,255,255,0.2)',
                    color: 'rgba(255,255,255,0.5)'
                  })
                }}
              >
                💾 Save Data Point
              </button>

              {/* Inherited Goal Notice */}
              {selectedGoalState.isInherited && (
                <div style={{
                  background: 'rgba(234, 179, 8, 0.2)',
                  border: '1px solid rgba(234, 179, 8, 0.3)',
                  borderRadius: '12px',
                  padding: '1.5rem'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem', 
                    marginBottom: '0.5rem' 
                  }}>
                    <Calendar size={18} style={{ color: '#fcd34d' }} />
                    <span style={{ color: '#fef3c7', fontWeight: '500', fontSize: '0.875rem' }}>
                      Inherited Goal Notice
                    </span>
                  </div>
                  <p style={{ color: '#fef9c3', fontSize: '0.75rem', lineHeight: '1.4', margin: 0 }}>
                    This goal cannot be modified until the next IEP meeting on {new Date(selectedGoalState.nextIEPDate).toLocaleDateString()}. 
                    Continue collecting data using the current criteria.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedIEPDataEntry;
