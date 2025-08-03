// Progress Panel Component for Student Management Hub
// src/renderer/components/data-collection/ProgressPanel.tsx

import React, { useState, useEffect } from 'react';
import UnifiedDataService, { UnifiedStudent, IEPGoal } from '../../services/unifiedDataService';
import { DataPoint } from '../../types';

interface ProgressPanelProps {
  studentId: string;
  isOpen: boolean;
  onClose: () => void;
  onAddData: (goalId: string) => void;
}

interface GoalProgress {
  goal: IEPGoal;
  dataPoints: DataPoint[];
  recentProgress: number;
  trend: 'improving' | 'declining' | 'stable';
  lastDataPoint?: DataPoint;
}

const ProgressPanel: React.FC<ProgressPanelProps> = ({
  studentId,
  isOpen,
  onClose,
  onAddData
}) => {
  const [student, setStudent] = useState<UnifiedStudent | null>(null);
  const [goalProgress, setGoalProgress] = useState<GoalProgress[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'quarter'>('month');

  useEffect(() => {
    if (isOpen && studentId) {
      loadProgressData();
    }
  }, [isOpen, studentId, selectedTimeframe]);

  const loadProgressData = () => {
    const studentData = UnifiedDataService.getStudent(studentId);
    if (!studentData) return;

    setStudent(studentData);

    // Calculate progress for each goal
    const progressData: GoalProgress[] = studentData.iepData.goals.map(goal => {
      const goalDataPoints = studentData.iepData.dataCollection
        .filter(dp => dp.goalId === goal.id)
        .sort((a, b) => new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime());

      // Filter by timeframe
      const cutoffDate = new Date();
      switch (selectedTimeframe) {
        case 'week':
          cutoffDate.setDate(cutoffDate.getDate() - 7);
          break;
        case 'month':
          cutoffDate.setMonth(cutoffDate.getMonth() - 1);
          break;
        case 'quarter':
          cutoffDate.setMonth(cutoffDate.getMonth() - 3);
          break;
      }

      const filteredDataPoints = goalDataPoints.filter(dp => 
        new Date(dp.date) >= cutoffDate
      );

      // Calculate recent progress and trend
      const recentProgress = calculateProgress(filteredDataPoints, goal);
      const trend = calculateTrend(filteredDataPoints);

      return {
        goal,
        dataPoints: filteredDataPoints,
        recentProgress,
        trend,
        lastDataPoint: goalDataPoints[0]
      };
    });

    setGoalProgress(progressData);
  };

  const calculateProgress = (dataPoints: DataPoint[], goal: IEPGoal): number => {
    if (dataPoints.length === 0) return 0;

    switch (goal.measurementType) {
      case 'percentage':
        const avgPercentage = dataPoints.reduce((sum, dp) => sum + dp.value, 0) / dataPoints.length;
        return Math.round(avgPercentage);
      case 'frequency':
        const avgFrequency = dataPoints.reduce((sum, dp) => {
          const rate = dp.totalOpportunities ? (dp.value / dp.totalOpportunities) * 100 : dp.value;
          return sum + rate;
        }, 0) / dataPoints.length;
        return Math.round(avgFrequency);
      case 'rating':
        const avgRating = dataPoints.reduce((sum, dp) => sum + dp.value, 0) / dataPoints.length;
        return Math.round((avgRating / 5) * 100);
      case 'yes-no':
        const successRate = (dataPoints.filter(dp => dp.value === 1).length / dataPoints.length) * 100;
        return Math.round(successRate);
      case 'independence':
        const avgIndependence = dataPoints.reduce((sum, dp) => sum + dp.value, 0) / dataPoints.length;
        return Math.round((avgIndependence / 4) * 100);
      default:
        return Math.round(dataPoints.reduce((sum, dp) => sum + dp.value, 0) / dataPoints.length);
    }
  };

  const calculateTrend = (dataPoints: DataPoint[]): 'improving' | 'declining' | 'stable' => {
    if (dataPoints.length < 3) return 'stable';

    const recent = dataPoints.slice(0, Math.ceil(dataPoints.length / 2));
    const older = dataPoints.slice(Math.ceil(dataPoints.length / 2));

    const recentAvg = recent.reduce((sum, dp) => sum + dp.value, 0) / recent.length;
    const olderAvg = older.reduce((sum, dp) => sum + dp.value, 0) / older.length;

    const difference = recentAvg - olderAvg;
    const threshold = olderAvg * 0.1; // 10% threshold

    if (difference > threshold) return 'improving';
    if (difference < -threshold) return 'declining';
    return 'stable';
  };

  const getTrendIcon = (trend: 'improving' | 'declining' | 'stable'): string => {
    switch (trend) {
      case 'improving': return '📈';
      case 'declining': return '📉';
      case 'stable': return '➡️';
    }
  };

  const getTrendColor = (trend: 'improving' | 'declining' | 'stable'): string => {
    switch (trend) {
      case 'improving': return '#22c55e';
      case 'declining': return '#ef4444';
      case 'stable': return '#f59e0b';
    }
  };

  const getProgressColor = (progress: number): string => {
    if (progress >= 80) return '#22c55e';
    if (progress >= 60) return '#f59e0b';
    if (progress >= 40) return '#f97316';
    return '#ef4444';
  };

  const formatLastDataDate = (dataPoint?: DataPoint): string => {
    if (!dataPoint) return 'No data';
    const date = new Date(dataPoint.date);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const getStudentInitials = (name: string): string => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
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
        maxWidth: '900px',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          color: 'white',
          padding: '2rem',
          borderRadius: '20px 20px 0 0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
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
                <h2 style={{ margin: 0, fontSize: '1.5rem' }}>📈 Progress Overview</h2>
                <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9 }}>
                  {student?.name} • {student?.grade}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                color: 'white',
                fontSize: '1.5rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ×
            </button>
          </div>
        </div>

        {/* Timeframe Selector */}
        <div style={{ padding: '1.5rem 2rem 0 2rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
            {[
              { id: 'week', label: 'Last Week' },
              { id: 'month', label: 'Last Month' },
              { id: 'quarter', label: 'Last Quarter' }
            ].map(timeframe => (
              <button
                key={timeframe.id}
                onClick={() => setSelectedTimeframe(timeframe.id as any)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  border: selectedTimeframe === timeframe.id ? '2px solid #667eea' : '2px solid #e5e7eb',
                  background: selectedTimeframe === timeframe.id ? '#f0f4ff' : 'white',
                  color: selectedTimeframe === timeframe.id ? '#667eea' : '#6b7280',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: selectedTimeframe === timeframe.id ? 'bold' : 'normal',
                  transition: 'all 0.3s ease'
                }}
              >
                {timeframe.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '0 2rem 2rem 2rem' }}>
          {goalProgress.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              color: '#6b7280'
            }}>
              <h3>No IEP Goals Found</h3>
              <p>Add IEP goals to track progress for this student.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {goalProgress.map(({ goal, dataPoints, recentProgress, trend, lastDataPoint }) => (
                <div
                  key={goal.id}
                  style={{
                    background: '#f8f9fa',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    border: '1px solid #e5e7eb'
                  }}
                >
                  {/* Goal Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: '#374151' }}>
                        {goal.description}
                      </h3>
                      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem', color: '#6b7280' }}>
                        <span>📋 {goal.domain}</span>
                        <span>📊 {goal.measurementType}</span>
                        <span>🎯 {goal.isActive ? 'Active' : 'Inactive'}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => onAddData(goal.id)}
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        border: 'none',
                        background: '#667eea',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: 'bold'
                      }}
                    >
                      📝 Add Data
                    </button>
                  </div>

                  {/* Progress Metrics */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                    {/* Current Progress */}
                    <div style={{
                      background: 'white',
                      padding: '1rem',
                      borderRadius: '12px',
                      textAlign: 'center',
                      border: '1px solid #e5e7eb'
                    }}>
                      <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                        Current Progress
                      </div>
                      <div style={{ 
                        fontSize: '1.5rem', 
                        fontWeight: 'bold', 
                        color: getProgressColor(recentProgress) 
                      }}>
                        {recentProgress}%
                      </div>
                    </div>

                    {/* Trend */}
                    <div style={{
                      background: 'white',
                      padding: '1rem',
                      borderRadius: '12px',
                      textAlign: 'center',
                      border: '1px solid #e5e7eb'
                    }}>
                      <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                        Trend
                      </div>
                      <div style={{ 
                        fontSize: '1.2rem', 
                        fontWeight: 'bold', 
                        color: getTrendColor(trend),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                      }}>
                        <span>{getTrendIcon(trend)}</span>
                        <span style={{ textTransform: 'capitalize' }}>{trend}</span>
                      </div>
                    </div>

                    {/* Data Points */}
                    <div style={{
                      background: 'white',
                      padding: '1rem',
                      borderRadius: '12px',
                      textAlign: 'center',
                      border: '1px solid #e5e7eb'
                    }}>
                      <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                        Data Points
                      </div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#374151' }}>
                        {dataPoints.length}
                      </div>
                    </div>

                    {/* Last Data */}
                    <div style={{
                      background: 'white',
                      padding: '1rem',
                      borderRadius: '12px',
                      textAlign: 'center',
                      border: '1px solid #e5e7eb'
                    }}>
                      <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                        Last Data
                      </div>
                      <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#374151' }}>
                        {formatLastDataDate(lastDataPoint)}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>Progress toward target</span>
                      <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: getProgressColor(recentProgress) }}>
                        {recentProgress}%
                      </span>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '8px',
                      background: '#e5e7eb',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${Math.min(recentProgress, 100)}%`,
                        height: '100%',
                        background: getProgressColor(recentProgress),
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  </div>

                  {/* Recent Data Points */}
                  {dataPoints.length > 0 && (
                    <div>
                      <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#6b7280' }}>
                        Recent Data Points:
                      </h4>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {dataPoints.slice(0, 5).map(dp => (
                          <div
                            key={dp.id}
                            style={{
                              background: 'white',
                              padding: '0.5rem 0.75rem',
                              borderRadius: '8px',
                              border: '1px solid #e5e7eb',
                              fontSize: '0.8rem'
                            }}
                          >
                            <div style={{ fontWeight: 'bold' }}>{dp.value}</div>
                            <div style={{ color: '#6b7280' }}>{new Date(dp.date).toLocaleDateString()}</div>
                          </div>
                        ))}
                        {dataPoints.length > 5 && (
                          <div style={{
                            padding: '0.5rem 0.75rem',
                            borderRadius: '8px',
                            background: '#f3f4f6',
                            fontSize: '0.8rem',
                            color: '#6b7280',
                            display: 'flex',
                            alignItems: 'center'
                          }}>
                            +{dataPoints.length - 5} more
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressPanel;
