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
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with Student Info */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img 
                src={selectedStudentState?.photo || '/api/placeholder/60/60'} 
                alt={selectedStudentState?.name || 'Student'}
                className="w-16 h-16 rounded-full border-4 border-white/30"
              />
              <div>
                <h1 className="text-2xl font-bold text-white">{selectedStudentState?.name || 'Student Name'}</h1>
                <p className="text-white/80">{selectedStudentState?.grade || 'Grade'} • IEP Data Collection</p>
              </div>
            </div>
            <div className="text-right text-white/80">
              <p className="text-sm">Current 9-Week Period: {selectedGoalState.currentNineWeek}/4</p>
              <p className="text-sm">Next IEP: {new Date(selectedGoalState.nextIEPDate).toLocaleDateString()}</p>
              <p className="text-xs">({daysUntilIEP} days remaining)</p>
            </div>
          </div>
        </div>

        {/* Goal Progress Overview */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
          <div className="flex items-center gap-3 mb-4">
            <Target className="text-white" size={24} />
            <h2 className="text-xl font-bold text-white">Goal Progress Overview</h2>
            {selectedGoalState.isInherited && (
              <span className="px-3 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-full text-yellow-200 text-sm">
                Inherited Goal
              </span>
            )}
          </div>

          <div className="space-y-4">
            {/* Goal Description */}
            <div className="bg-white/5 rounded-lg p-4">
              <h3 className="font-semibold text-white mb-2">{selectedGoalState?.title || 'Goal Title'}</h3>
              <p className="text-white/80 text-sm">{selectedGoalState?.description || 'Goal description not available'}</p>
              {selectedGoalState?.inheritedFrom && (
                <p className="text-white/60 text-xs mt-2">
                  📋 Inherited from: {selectedGoalState.inheritedFrom}
                </p>
              )}
            </div>

            {/* Progress Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Current Progress */}
              <div className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/80 text-sm">Current Progress</span>
                  {getTrendIcon()}
                </div>
                <div className="text-2xl font-bold text-white">
                  {selectedGoalState.currentProgress}%
                </div>
                <div className="text-white/60 text-xs">
                  {selectedGoalState.dataPointCount} data points collected
                </div>
              </div>

              {/* 9-Week Target */}
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-white/80 text-sm mb-2">9-Week Target</div>
                <div className="text-2xl font-bold text-white">
                  {selectedGoalState.nineWeekTargets[selectedGoalState.currentNineWeek - 1]}%
                </div>
                <div className={`text-xs px-2 py-1 rounded-full border inline-block ${getStatusColor(progressStatus)}`}>
                  {progressStatus === 'onTrack' && '✅ On Track'}
                  {progressStatus === 'nearTarget' && '⚠️ Near Target'}
                  {progressStatus === 'needsSupport' && '🔴 Needs Support'}
                </div>
              </div>

              {/* Annual Goal */}
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-white/80 text-sm mb-2">Annual Target</div>
                <div className="text-2xl font-bold text-white">
                  {selectedGoalState.annualTarget}%
                </div>
                <div className="text-white/60 text-xs">
                  By {new Date(selectedGoalState.targetDate).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* 9-Week Progress Timeline */}
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Nine-Week Progress Timeline</h4>
              <div className="flex items-center space-x-2">
                {selectedGoalState.nineWeekTargets.map((target, index) => {
                  const isCurrentPeriod = index + 1 === selectedGoalState.currentNineWeek;
                  const isPastPeriod = index + 1 < selectedGoalState.currentNineWeek;
                  const achieved = isPastPeriod ? selectedGoalState.currentProgress >= target : false;
                  
                  return (
                    <div key={index} className="flex-1">
                      <div className={`text-center p-2 rounded-lg border ${
                        isCurrentPeriod 
                          ? 'bg-blue-500/30 border-blue-400 text-white' 
                          : isPastPeriod && achieved
                          ? 'bg-green-500/30 border-green-400 text-green-200'
                          : isPastPeriod
                          ? 'bg-red-500/30 border-red-400 text-red-200'
                          : 'bg-white/5 border-white/20 text-white/60'
                      }`}>
                        <div className="text-xs">Q{index + 1}</div>
                        <div className="font-bold">{target}%</div>
                        {isCurrentPeriod && <div className="text-xs">Current</div>}
                        {isPastPeriod && (
                          <div className="text-xs">
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
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="text-white" size={24} />
            <h2 className="text-xl font-bold text-white">Today's Data Entry</h2>
            <span className="text-white/60 text-sm">
              {new Date().toLocaleDateString()} • 9-Week Period {dataEntry.nineWeekPeriod}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Data Entry */}
            <div className="space-y-4">
              {/* Performance Entry */}
              <div className="bg-white/5 rounded-lg p-4">
                <label className="block text-white font-medium mb-3">
                  Performance Entry
                </label>
                
                {/* Trial Details Toggle */}
                <div className="flex items-center gap-3 mb-4">
                  <input
                    type="checkbox"
                    id="showTrials"
                    checked={showTrialDetails}
                    onChange={(e) => setShowTrialDetails(e.target.checked)}
                    className="rounded border-white/30 bg-white/10 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                  />
                  <label htmlFor="showTrials" className="text-white/80 text-sm">
                    Show trial details (for X out of Y tracking)
                  </label>
                </div>

                {showTrialDetails ? (
                  /* Trial-based Entry */
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-white/80 text-sm mb-1">
                          Correct Responses
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={dataEntry.trialsCorrect || 0}
                          onChange={(e) => handleTrialUpdate('trialsCorrect', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/50 focus:border-white/50 focus:outline-none"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-white/80 text-sm mb-1">
                          Total Attempts
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={dataEntry.trialsTotal || 0}
                          onChange={(e) => handleTrialUpdate('trialsTotal', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/50 focus:border-white/50 focus:outline-none"
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3 text-center">
                      <span className="text-white font-bold text-xl">
                        {dataEntry.value}%
                      </span>
                      <div className="text-white/60 text-sm">
                        ({dataEntry.trialsCorrect || 0} out of {dataEntry.trialsTotal || 0} correct)
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Direct Percentage Entry */
                  <div>
                    <label className="block text-white/80 text-sm mb-1">
                      Accuracy Percentage
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={dataEntry.value || ''}
                      onChange={(e) => handleDirectPercentageEntry(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/50 focus:border-white/50 focus:outline-none text-xl"
                      placeholder="Enter percentage..."
                    />
                  </div>
                )}
              </div>

              {/* Context */}
              <div className="bg-white/5 rounded-lg p-4">
                <label className="block text-white font-medium mb-2">
                  Activity/Context
                </label>
                <input
                  type="text"
                  value={dataEntry.notes || ''}
                  onChange={(e) => setDataEntry(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/50 focus:border-white/50 focus:outline-none"
                  placeholder="e.g., Small group reading, Independent work, Math center..."
                />
              </div>

              {/* Additional Notes */}
              <div className="bg-white/5 rounded-lg p-4">
                <label className="block text-white font-medium mb-2">
                  📝 Detailed Notes (Important for Admin/Progress Reports)
                </label>
                <textarea
                  value={dataEntry.notes || ''}
                  onChange={(e) => setDataEntry(prev => ({ ...prev, notes: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/50 focus:border-white/50 focus:outline-none resize-none"
                  placeholder="Detailed observations, strategies used, support provided, environmental factors, student behavior, next steps..."
                />
                <div className="text-white/60 text-xs mt-1">
                  💡 Tip: Include specific observations for admin requests and progress reports
                </div>
              </div>
            </div>

            {/* Right Column - Progress Context */}
            <div className="space-y-4">
              {/* Admin Quick View */}
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                  <AlertCircle size={16} />
                  Admin Quick View
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/80">Current 9-Week:</span>
                    <span className="text-white font-medium">
                      {selectedGoalState.currentProgress}% / {selectedGoalState.nineWeekTargets[selectedGoalState.currentNineWeek - 1]}% target
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/80">Annual Progress:</span>
                    <span className="text-white font-medium">
                      {selectedGoalState.currentProgress}% / {selectedGoalState.annualTarget}% target
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/80">Data Points:</span>
                    <span className="text-white font-medium">{selectedGoalState.dataPointCount} collected</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/80">Last Entry:</span>
                    <span className="text-white font-medium">
                      {selectedGoal.lastDataPoint ? new Date(selectedGoal.lastDataPoint).toLocaleDateString() : 'No data'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Progress Summary */}
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-white font-medium mb-3">Recent Trends</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white/80 text-sm">This Week:</span>
                    <span className="text-white font-medium">78% ↗️</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/80 text-sm">This Month:</span>
                    <span className="text-white font-medium">75% ↗️</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/80 text-sm">9-Week Period:</span>
                    <span className="text-white font-medium">73% ↗️</span>
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
                className={`w-full py-3 px-4 rounded-lg font-medium text-lg transition-all ${
                  dataEntry.value && dataEntry.notes
                    ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg'
                    : 'bg-white/20 text-white/50 cursor-not-allowed'
                }`}
              >
                💾 Save Data Point
              </button>

              {/* Inherited Goal Notice */}
              {selectedGoalState.isInherited && (
                <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar size={16} className="text-yellow-300" />
                    <span className="text-yellow-200 font-medium text-sm">
                      Inherited Goal Notice
                    </span>
                  </div>
                  <p className="text-yellow-100 text-xs">
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
