// Enhanced Goal Intelligence UI Components
// Integration with existing Visual Schedule Builder IEP system
// MINIMAL FIX VERSION - Only fixing TypeScript errors, preserving all functionality

import React, { useState, useEffect, useMemo } from 'react';
import { 
  SmartGoalSuggestionsEngine, 
  PredictiveAnalyticsEngine,
  type GoalSuggestion,
  type PredictiveAnalytics,
  type ProgressIntelligence as ProgressIntelligenceType
} from './enhanced-goal-intelligence-core';

// ===== HELPER FUNCTIONS =====

// 🔧 FIXED: Updated formatDate to handle both Date objects and strings
const formatDate = (dateInput: string | Date): string => {
  try {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch (error) {
    return 'Invalid Date';
  }
};

// ===== SMART GOAL SUGGESTIONS COMPONENT =====

interface SmartGoalSuggestionsProps {
  studentId: string;
  currentGoals: any[];
  activityHistory: any[];
  onGoalSelect: (suggestion: GoalSuggestion) => void;
}

const SmartGoalSuggestions: React.FC<SmartGoalSuggestionsProps> = ({
  studentId,
  currentGoals,
  activityHistory,
  onGoalSelect
}) => {
  const [suggestions, setSuggestions] = useState<GoalSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [engine] = useState(() => new SmartGoalSuggestionsEngine());

  useEffect(() => {
    generateSuggestions();
  }, [studentId, currentGoals, activityHistory]);

  const generateSuggestions = async () => {
    setIsLoading(true);
    try {
      // Simulate AI processing time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newSuggestions = engine.generateGoalSuggestions(
        studentId, 
        activityHistory, 
        currentGoals
      );
      setSuggestions(newSuggestions);
    } catch (error) {
      console.error('Error generating goal suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence > 0.8) return 'text-green-600 bg-green-100';
    if (confidence > 0.6) return 'text-blue-600 bg-blue-100';
    return 'text-yellow-600 bg-yellow-100';
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '🌱';
      case 'intermediate': return '🌿';
      case 'advanced': return '🌳';
      default: return '📋';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white/80 backdrop-blur-md rounded-lg p-6 border border-white/20 shadow-lg">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              🧠 AI Analyzing Student Data...
            </h3>
            <p className="text-gray-500">
              Generating personalized goal suggestions based on activity patterns and progress data
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-lg p-6 border border-white/20 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            🧠 Smart Goal Suggestions
          </h3>
          <p className="text-gray-600 mt-1">
            AI-powered recommendations based on student patterns and data
          </p>
        </div>
        <button
          onClick={generateSuggestions}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          🔄 Refresh Suggestions
        </button>
      </div>

      {suggestions.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🎯</div>
          <p className="text-gray-500">
            No new goal suggestions available. Continue collecting data for better recommendations.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getDifficultyIcon(suggestion.difficulty)}</span>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                        {suggestion.domain}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getConfidenceColor(suggestion.confidence)}`}>
                        {Math.round(suggestion.confidence * 100)}% confidence
                      </span>
                    </div>
                    <h4 className="font-semibold text-gray-800 leading-tight">
                      {suggestion.goalText}
                    </h4>
                  </div>
                </div>
                <button
                  onClick={() => onGoalSelect(suggestion)}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                >
                  Add Goal
                </button>
              </div>

              <div className="bg-gray-50 rounded p-3 mb-3">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Why this goal:</strong> {suggestion.reasoning}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Estimated timeframe:</strong> {suggestion.estimatedTimeframe}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                <span className="text-xs font-medium text-gray-500">Suggested activities:</span>
                {suggestion.suggestedActivities.map((activity, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
                  >
                    {activity}
                  </span>
                ))}
              </div>

              {suggestion.basedOnPatterns.length > 0 && (
                <div className="text-xs text-gray-500">
                  <strong>Based on patterns:</strong> {suggestion.basedOnPatterns.join(', ')}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ===== PREDICTIVE ANALYTICS DASHBOARD =====

interface PredictiveAnalyticsDashboardProps {
  studentId: string;
  goals: any[];
  dataHistory: any[];
}

const PredictiveAnalyticsDashboard: React.FC<PredictiveAnalyticsDashboardProps> = ({
  studentId,
  goals,
  dataHistory
}) => {
  const [analytics, setAnalytics] = useState<PredictiveAnalytics[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [engine] = useState(() => new PredictiveAnalyticsEngine());

  useEffect(() => {
    generateAnalytics();
  }, [studentId, goals, dataHistory]);

  const generateAnalytics = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const analyticsData = goals.map(goal => {
        const goalData = dataHistory.filter(d => d.goalId === goal.id);
        return engine.generatePredictiveAnalytics(studentId, goal.id, goalData);
      });
      
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error generating analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTrajectoryIcon = (trajectory: string) => {
    switch (trajectory) {
      case 'ahead': return '🚀';
      case 'on-track': return '✅';
      case 'behind': return '⚠️';
      case 'plateau': return '📊';
      default: return '📈';
    }
  };

  const getTrajectoryColor = (trajectory: string) => {
    switch (trajectory) {
      case 'ahead': return 'text-green-600 bg-green-100';
      case 'on-track': return 'text-blue-600 bg-blue-100';
      case 'behind': return 'text-red-600 bg-red-100';
      case 'plateau': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white/80 backdrop-blur-md rounded-lg p-6 border border-white/20 shadow-lg">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-300 rounded w-48 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-32 mx-auto"></div>
            </div>
            <p className="text-gray-500 mt-4">Analyzing progress patterns...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-lg p-6 border border-white/20 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            📊 Predictive Analytics
          </h3>
          <p className="text-gray-600 mt-1">
            AI-powered progress forecasting and intervention recommendations
          </p>
        </div>
        <button
          onClick={generateAnalytics}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          🔄 Update Analytics
        </button>
      </div>

      {analytics.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📈</div>
          <p className="text-gray-500">
            Start collecting goal data to see predictive analytics and forecasts.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {analytics.map((analytic) => {
            const goal = goals.find(g => g.id === analytic.goalId);
            return (
              <div
                key={analytic.goalId}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">
                      {goal?.text || 'Goal'}
                    </h4>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      {goal?.domain || 'Unknown Domain'}
                    </span>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded flex items-center gap-1 ${getTrajectoryColor(analytic.currentTrajectory)}`}>
                    {getTrajectoryIcon(analytic.currentTrajectory)}
                    {analytic.currentTrajectory}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="bg-blue-50 rounded p-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-blue-700 font-medium">Predicted Completion:</span>
                      <span className="text-blue-800">
                        {formatDate(analytic.predictedCompletionDate)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-1">
                      <span className="text-blue-600">Confidence Level:</span>
                      <span className="text-blue-700 font-medium">
                        {Math.round(analytic.confidenceLevel * 100)}%
                      </span>
                    </div>
                  </div>

                  {analytic.interventionNeeded && (
                    <div className="bg-amber-50 border border-amber-200 rounded p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-amber-600">⚠️</span>
                        <span className="text-amber-800 font-medium text-sm">
                          Intervention Recommended
                        </span>
                      </div>
                      <ul className="text-xs text-amber-700 space-y-1">
                        {analytic.suggestedInterventions.map((intervention, index) => (
                          <li key={index}>• {intervention}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {analytic.successIndicators.length > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-green-600">✅</span>
                        <span className="text-green-800 font-medium text-sm">
                          Success Indicators
                        </span>
                      </div>
                      <ul className="text-xs text-green-700 space-y-1">
                        {analytic.successIndicators.slice(0, 2).map((indicator, index) => (
                          <li key={index}>• {indicator}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {analytic.riskFactors.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-red-600">🚨</span>
                        <span className="text-red-800 font-medium text-sm">
                          Risk Factors
                        </span>
                      </div>
                      <ul className="text-xs text-red-700 space-y-1">
                        {analytic.riskFactors.slice(0, 2).map((risk, index) => (
                          <li key={index}>• {risk}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ===== PROGRESS INTELLIGENCE COMPONENT =====

interface ProgressIntelligenceProps {
  studentId: string;
  allStudentsData?: any[];
}

const ProgressIntelligence: React.FC<ProgressIntelligenceProps> = ({
  studentId,
  allStudentsData = []
}) => {
  const [intelligence, setIntelligence] = useState<ProgressIntelligenceType | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    generateProgressIntelligence();
  }, [studentId, allStudentsData]);

  const generateProgressIntelligence = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Simulate progress intelligence generation
      const mockIntelligence: ProgressIntelligenceType = {
        studentId,
        trendAnalysis: {
          overallDirection: 'improving',
          velocity: 2.3,
          patterns: ['Strong morning performance', 'Responds well to visual supports', 'Prefers peer interaction'],
          plateauRisk: 0.2
        },
        goalMasteryPredictions: [
          {
            goalId: 'goal_1',
            currentMastery: 65,
            predictedMasteryDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days
            confidenceInterval: [55, 75],
            milestones: [
              { percentage: 75, predictedDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), requirements: ['Consistent practice', 'Visual supports'] },
              { percentage: 80, predictedDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000), requirements: ['Independent application'] }
            ]
          }
        ],
        comparativeAnalytics: {
          percentileRank: 72,
          similarStudentOutcomes: ['Above average progress in communication goals', 'Typical development in social skills'],
          benchmarkComparison: 'Performing above grade-level expectations'
        }
      };
      
      setIntelligence(mockIntelligence);
    } catch (error) {
      console.error('Error generating progress intelligence:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDirectionIcon = (direction: string) => {
    switch (direction) {
      case 'improving': return '📈';
      case 'stable': return '📊';
      case 'declining': return '📉';
      default: return '📊';
    }
  };

  const getDirectionColor = (direction: string) => {
    switch (direction) {
      case 'improving': return 'text-green-600 bg-green-100';
      case 'stable': return 'text-blue-600 bg-blue-100';
      case 'declining': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white/80 backdrop-blur-md rounded-lg p-6 border border-white/20 shadow-lg">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-300 rounded w-1/3"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-300 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!intelligence) {
    return (
      <div className="bg-white/80 backdrop-blur-md rounded-lg p-6 border border-white/20 shadow-lg">
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🧮</div>
          <p className="text-gray-500">Unable to generate progress intelligence.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-lg p-6 border border-white/20 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            🧮 Progress Intelligence
          </h3>
          <p className="text-gray-600 mt-1">
            Advanced analytics and comparative insights
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Trend Analysis */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            {getDirectionIcon(intelligence.trendAnalysis.overallDirection)}
            Trend Analysis
          </h4>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Overall Direction:</span>
              <span className={`px-2 py-1 text-xs font-medium rounded ${getDirectionColor(intelligence.trendAnalysis.overallDirection)}`}>
                {intelligence.trendAnalysis.overallDirection}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Progress Velocity:</span>
              <span className="text-sm font-medium text-gray-800">
                +{intelligence.trendAnalysis.velocity.toFixed(1)} pts/week
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Plateau Risk:</span>
              <span className={`text-sm font-medium ${intelligence.trendAnalysis.plateauRisk < 0.3 ? 'text-green-600' : intelligence.trendAnalysis.plateauRisk < 0.7 ? 'text-yellow-600' : 'text-red-600'}`}>
                {Math.round(intelligence.trendAnalysis.plateauRisk * 100)}%
              </span>
            </div>
          </div>

          <div className="mt-4">
            <span className="text-sm font-medium text-gray-700 mb-2 block">Key Patterns:</span>
            <div className="space-y-1">
              {intelligence.trendAnalysis.patterns.map((pattern, index) => (
                <div key={index} className="text-xs text-gray-600 bg-gray-50 rounded px-2 py-1">
                  • {pattern}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Comparative Analytics */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            📊 Comparative Analytics
          </h4>
          
          <div className="space-y-3">
            <div className="text-center bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {intelligence.comparativeAnalytics.percentileRank}%
              </div>
              <div className="text-sm text-blue-700">
                Percentile Rank
              </div>
            </div>
            
            <div>
              <span className="text-sm font-medium text-gray-700 mb-2 block">Benchmark Comparison:</span>
              <p className="text-sm text-gray-600 bg-green-50 rounded px-3 py-2">
                {intelligence.comparativeAnalytics.benchmarkComparison}
              </p>
            </div>
            
            <div>
              <span className="text-sm font-medium text-gray-700 mb-2 block">Similar Student Outcomes:</span>
              <div className="space-y-1">
                {intelligence.comparativeAnalytics.similarStudentOutcomes.map((outcome, index) => (
                  <div key={index} className="text-xs text-gray-600 bg-gray-50 rounded px-2 py-1">
                    • {outcome}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Goal Mastery Predictions */}
        <div className="lg:col-span-2 border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            🎯 Goal Mastery Predictions
          </h4>
          
          <div className="space-y-4">
            {intelligence.goalMasteryPredictions.map((prediction) => (
              <div key={prediction.goalId} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-gray-800">Goal Progress</span>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-600">
                      {prediction.currentMastery}%
                    </div>
                    <div className="text-xs text-gray-500">
                      current mastery
                    </div>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${prediction.currentMastery}%` }}
                  ></div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                  <span>Predicted mastery: {formatDate(prediction.predictedMasteryDate)}</span>
                  <span>Confidence: {prediction.confidenceInterval[0]}-{prediction.confidenceInterval[1]}%</span>
                </div>
                
                <div className="space-y-2">
                  <span className="text-sm font-medium text-gray-700">Upcoming Milestones:</span>
                  {prediction.milestones.map((milestone, index) => (
                    <div key={index} className="flex items-center justify-between text-xs text-gray-600 bg-white rounded px-2 py-1">
                      <span>{milestone.percentage}% mastery</span>
                      <span>{formatDate(milestone.predictedDate)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ===== MAIN ENHANCED GOAL INTELLIGENCE INTERFACE =====

interface EnhancedGoalIntelligenceProps {
  selectedStudentId: string | null;
  students: any[];
  goals: any[];
  dataHistory: any[];
  activityHistory: any[];
  onGoalAdd: (suggestion: GoalSuggestion) => void;
}

const EnhancedGoalIntelligence: React.FC<EnhancedGoalIntelligenceProps> = ({
  selectedStudentId,
  students,
  goals,
  dataHistory,
  activityHistory,
  onGoalAdd
}) => {
  const [activeTab, setActiveTab] = useState<'suggestions' | 'analytics' | 'intelligence'>('suggestions');

  const selectedStudent = students.find(s => s.id === selectedStudentId);
  const studentGoals = goals.filter(g => g.studentId === selectedStudentId);
  const studentDataHistory = dataHistory.filter(d => d.studentId === selectedStudentId);
  const studentActivityHistory = activityHistory.filter(a => a.studentId === selectedStudentId);

  if (!selectedStudentId || !selectedStudent) {
    return (
      <div className="bg-white/80 backdrop-blur-md rounded-lg p-8 border border-white/20 shadow-lg">
        <div className="text-center">
          <div className="text-6xl mb-4">🧠</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Enhanced Goal Intelligence
          </h3>
          <p className="text-gray-600 mb-6">
            Select a student to access AI-powered goal suggestions, predictive analytics, and progress intelligence.
          </p>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl mb-2">🎯</div>
              <h4 className="font-semibold text-blue-800 mb-1">Smart Suggestions</h4>
              <p className="text-blue-600">AI-generated goal recommendations based on student patterns</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-2xl mb-2">📊</div>
              <h4 className="font-semibold text-purple-800 mb-1">Predictive Analytics</h4>
              <p className="text-purple-600">Forecast goal completion and identify intervention needs</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl mb-2">🧮</div>
              <h4 className="font-semibold text-green-800 mb-1">Progress Intelligence</h4>
              <p className="text-green-600">Advanced insights and comparative analytics</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Student Header */}
      <div className="bg-white/80 backdrop-blur-md rounded-lg p-4 border border-white/20 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
            {selectedStudent.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Enhanced Intelligence for {selectedStudent.name}
            </h2>
            <p className="text-gray-600">
              {studentGoals.length} active goals • {studentDataHistory.length} data points collected
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white/80 backdrop-blur-md rounded-lg border border-white/20 shadow-lg">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'suggestions', label: 'Smart Suggestions', icon: '🎯' },
              { id: 'analytics', label: 'Predictive Analytics', icon: '📊' },
              { id: 'intelligence', label: 'Progress Intelligence', icon: '🧮' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'suggestions' && (
            <SmartGoalSuggestions
              studentId={selectedStudentId}
              currentGoals={studentGoals}
              activityHistory={studentActivityHistory}
              onGoalSelect={onGoalAdd}
            />
          )}
          
          {activeTab === 'analytics' && (
            <PredictiveAnalyticsDashboard
              studentId={selectedStudentId}
              goals={studentGoals}
              dataHistory={studentDataHistory}
            />
          )}
          
          {activeTab === 'intelligence' && (
            <ProgressIntelligence
              studentId={selectedStudentId}
              allStudentsData={dataHistory}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// ===== EXPORTS =====

export {
  EnhancedGoalIntelligence,
  SmartGoalSuggestions,
  PredictiveAnalyticsDashboard,
  ProgressIntelligence
};