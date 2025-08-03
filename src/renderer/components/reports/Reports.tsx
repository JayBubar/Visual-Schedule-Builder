import React, { useState, useEffect } from 'react';
import { Student, Staff, ActivityLibraryItem, ReportType } from '../../types';
import UnifiedDataService, { UnifiedStudent, IEPGoal } from '../../services/unifiedDataService';

interface ReportsProps {
  isActive: boolean;
  students: Student[];
  staff: Staff[];
  activities: ActivityLibraryItem[];
}

interface ReportTemplate {
  type: ReportType;
  title: string;
  description: string;
  icon: string;
  category: 'student' | 'schedule' | 'staff' | 'analytics';
}

const Reports: React.FC<ReportsProps> = ({ 
  isActive, 
  students, 
  staff, 
  activities 
}) => {
  const [selectedReportType, setSelectedReportType] = useState<ReportType | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter'>('week');
  const [systemStatus, setSystemStatus] = useState<any>(null);

  // Load system status on component mount
  useEffect(() => {
    const status = UnifiedDataService.getSystemStatus();
    setSystemStatus(status);
    
    // Auto-trigger data recovery if we have unified data but low data point count
    if (status.hasUnifiedData && status.totalDataPoints < 50) {
      console.log('Low data point count detected, attempting data recovery...');
      const recovered = UnifiedDataService.recoverMissingDataPoints();
      if (recovered) {
        console.log('Data recovery completed, refreshing system status...');
        const newStatus = UnifiedDataService.getSystemStatus();
        setSystemStatus(newStatus);
      }
    }
  }, []);

  // Available report templates
  const reportTemplates: ReportTemplate[] = [
    {
      type: 'student-progress',
      title: 'Student Progress Report',
      description: 'Individual student performance and goal tracking',
      icon: '👤',
      category: 'student'
    },
    {
      type: 'weekly-summary',
      title: 'Weekly Summary',
      description: 'Comprehensive overview of the week\'s activities',
      icon: '📅',
      category: 'schedule'
    },
    {
      type: 'activity-analytics',
      title: 'Activity Analytics',
      description: 'Popular activities and engagement metrics',
      icon: '📊',
      category: 'analytics'
    },
    {
      type: 'iep-goals',
      title: 'IEP Goals Tracking',
      description: 'Goal progress and data collection summaries',
      icon: '🎯',
      category: 'student'
    },
    {
      type: 'staff-utilization',
      title: 'Staff Report',
      description: 'Staff assignments and classroom coverage',
      icon: '👥',
      category: 'staff'
    },
    {
      type: 'schedule-usage',
      title: 'Schedule Usage Report',
      description: 'Most used schedules and activity patterns',
      icon: '🗓️',
      category: 'schedule'
    }
  ];

  // Generate sample report data
  const generateReportData = async (reportType: ReportType) => {
    setIsGenerating(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate mock data based on report type
    let mockData;
    
    switch (reportType) {
      case 'student-progress':
        mockData = generateStudentProgressData();
        break;
      case 'weekly-summary':
        mockData = generateWeeklySummaryData();
        break;
      case 'activity-analytics':
        mockData = generateActivityAnalyticsData();
        break;
      case 'iep-goals':
        mockData = generateIEPGoalsData();
        break;
      case 'staff-utilization':
        mockData = generateStaffUtilizationData();
        break;
      case 'schedule-usage':
        mockData = generateScheduleUsageData();
        break;
      default:
        mockData = { message: 'Report data not available' };
    }
    
    setReportData(mockData);
    setIsGenerating(false);
  };

  const generateStudentProgressData = () => {
    // Get real data from UnifiedDataService
    const unifiedStudents = UnifiedDataService.getAllStudents();
    const systemStatus = UnifiedDataService.getSystemStatus();
    
    // Calculate real statistics
    const studentsWithGoals = unifiedStudents.filter(s => s.iepData.goals.length > 0);
    const allGoals = unifiedStudents.flatMap(student => student.iepData.goals);
    
    // Calculate progress metrics
    const goalsMet = allGoals.filter(goal => goal.currentProgress >= 90).length;
    const goalsInProgress = allGoals.filter(goal => goal.currentProgress > 0 && goal.currentProgress < 90).length;
    
    // Calculate average progress across all students
    const averageProgress = allGoals.length > 0 
      ? Math.round(allGoals.reduce((sum, goal) => sum + (goal.currentProgress || 0), 0) / allGoals.length)
      : 0;
    
    // Find top performers (students with highest average goal progress)
    const topPerformers = unifiedStudents
      .map(student => {
        const studentGoals = student.iepData.goals;
        const avgProgress = studentGoals.length > 0 
          ? studentGoals.reduce((sum, goal) => sum + (goal.currentProgress || 0), 0) / studentGoals.length
          : 0;
        return { name: student.name, progress: avgProgress };
      })
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 3)
      .map(s => `${s.name} (${Math.round(s.progress)}%)`);
    
    return {
      totalStudents: systemStatus.totalStudents,
      studentsWithProgress: studentsWithGoals.length,
      averageProgress,
      goalsMet,
      goalsInProgress,
      topPerformers,
      progressTrend: 'Real-time data from unified system',
      studentsWithGoals: studentsWithGoals.length,
      totalGoals: systemStatus.totalGoals,
      totalDataPoints: systemStatus.totalDataPoints
    };
  };

  const generateWeeklySummaryData = () => ({
    totalActivities: activities.length,
    completedSchedules: 23,
    averageEngagement: 87,
    totalStudentHours: 145,
    peakActivityTime: '10:30 AM',
    mostPopularActivity: activities[0]?.name || 'Reading Corner',
    weeklyGoal: 'Increase transition time efficiency'
  });

  const generateActivityAnalyticsData = () => ({
    totalActivities: activities.length,
    mostUsed: activities.slice(0, 5).map(a => ({
      name: a.name,
      usageCount: Math.floor(Math.random() * 50) + 10,
      engagement: Math.floor(Math.random() * 30) + 70
    })),
    leastUsed: activities.slice(-3).map(a => a.name),
    categoryBreakdown: {
      academic: Math.floor(activities.length * 0.4),
      social: Math.floor(activities.length * 0.3),
      sensory: Math.floor(activities.length * 0.2),
      transition: Math.floor(activities.length * 0.1)
    }
  });

  const generateIEPGoalsData = () => {
    // Get real data from UnifiedDataService
    const unifiedStudents = UnifiedDataService.getAllStudents();
    const systemStatus = UnifiedDataService.getSystemStatus();
    
    // Calculate real statistics
    const allGoals = unifiedStudents.flatMap(student => student.iepData.goals);
    const allDataPoints = unifiedStudents.flatMap(student => student.iepData.dataCollection);
    
    // Calculate goal status based on progress
    const mastered = allGoals.filter(goal => goal.currentProgress >= 90).length;
    const onTrack = allGoals.filter(goal => goal.currentProgress >= 50 && goal.currentProgress < 90).length;
    const needsAttention = allGoals.filter(goal => goal.currentProgress < 50).length;
    
    // Calculate domain breakdown
    const domainCounts = allGoals.reduce((acc, goal) => {
      const domain = goal.domain || 'other';
      acc[domain] = (acc[domain] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Calculate average progress
    const averageProgress = allGoals.length > 0 
      ? Math.round(allGoals.reduce((sum, goal) => sum + (goal.currentProgress || 0), 0) / allGoals.length)
      : 0;
    
    return {
      totalGoals: systemStatus.totalGoals,
      mastered,
      onTrack,
      needsAttention,
      dataPoints: systemStatus.totalDataPoints,
      averageProgress,
      domains: {
        academic: domainCounts.academic || 0,
        behavioral: domainCounts.behavioral || 0,
        'social-emotional': domainCounts['social-emotional'] || 0,
        physical: domainCounts.physical || 0,
        communication: domainCounts.communication || 0,
        other: domainCounts.other || 0
      },
      studentsWithGoals: unifiedStudents.filter(s => s.iepData.goals.length > 0).length,
      totalStudents: systemStatus.totalStudents
    };
  };

  const generateStaffUtilizationData = () => ({
    totalStaff: staff.length,
    activeStaff: Math.floor(staff.length * 0.9),
    averageHours: 32,
    coverageRate: 95,
    substituteUsage: 8,
    staffRoles: staff.reduce((acc, s) => {
      acc[s.role] = (acc[s.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  });

  const generateScheduleUsageData = () => ({
    totalSchedules: 15,
    activeSchedules: 12,
    averageLength: 45,
    mostUsedSchedule: 'Morning Routine',
    scheduleCompliance: 89,
    modificationRate: 12,
    peakUsageTime: '9:00 AM - 11:00 AM'
  });

  const handleReportSelect = (reportType: ReportType) => {
    setSelectedReportType(reportType);
    generateReportData(reportType);
  };

  const getCurrentDateRange = () => {
    const now = new Date();
    const ranges = {
      week: {
        start: new Date(now.setDate(now.getDate() - now.getDay())),
        end: new Date(now.setDate(now.getDate() - now.getDay() + 6))
      },
      month: {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: new Date(now.getFullYear(), now.getMonth() + 1, 0)
      },
      quarter: {
        start: new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1),
        end: new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 + 3, 0)
      }
    };
    
    return ranges[dateRange];
  };

  const currentRange = getCurrentDateRange();

  if (!isActive) return null;

  return (
    <div className="reports-container">
      <div className="reports-header">
        <div className="header-info">
          <h1>📈 Reports & Analytics</h1>
          <p>Generate insights from your Visual Schedule Builder data</p>
          {systemStatus && (
            <div style={{
              display: 'inline-block',
              background: systemStatus.hasUnifiedData 
                ? 'rgba(34, 197, 94, 0.1)' 
                : 'rgba(239, 68, 68, 0.1)',
              padding: '8px 16px',
              borderRadius: '20px',
              marginTop: '10px',
              border: `1px solid ${systemStatus.hasUnifiedData ? '#22c55e' : '#ef4444'}`,
              color: systemStatus.hasUnifiedData ? '#22c55e' : '#ef4444',
              fontSize: '0.9rem'
            }}>
              {systemStatus.hasUnifiedData ? '✅ Unified Data Active' : '⚠️ Legacy Data Mode'}
              {systemStatus.hasUnifiedData && (
                <span style={{ marginLeft: '10px', fontSize: '0.8em', opacity: 0.8 }}>
                  {systemStatus.totalStudents} students • {systemStatus.totalGoals} goals • {systemStatus.totalDataPoints} data points
                </span>
              )}
            </div>
          )}
        </div>
        
        <div className="header-controls">
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value as any)}
            className="date-range-select"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
          </select>
          
          <div className="date-display">
            {currentRange.start.toLocaleDateString()} - {currentRange.end.toLocaleDateString()}
          </div>
        </div>
      </div>

      {!selectedReportType ? (
        <div className="report-selection">
          <h2>Select a Report Type</h2>
          <div className="report-templates">
            {reportTemplates.map((template) => (
              <div
                key={template.type}
                className="report-template-card"
                onClick={() => handleReportSelect(template.type)}
              >
                <div className="template-icon">{template.icon}</div>
                <div className="template-info">
                  <h3>{template.title}</h3>
                  <p>{template.description}</p>
                  <span className="template-category">{template.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="report-display">
          <div className="report-header">
            <button 
              onClick={() => setSelectedReportType(null)}
              className="back-button"
            >
              ← Back to Reports
            </button>
            <h2>
              {reportTemplates.find(t => t.type === selectedReportType)?.title}
            </h2>
          </div>

          {isGenerating ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Generating report...</p>
            </div>
          ) : reportData ? (
            <div className="report-content">
              <div className="data-summary">
                <h3>Summary</h3>
                <div className="summary-grid">
                  {Object.entries(reportData).map(([key, value]) => (
                    <div key={key} className="summary-item">
                      <div className="summary-label">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </div>
                      <div className="summary-value">
                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="report-actions">
                <button className="export-button">
                  📄 Export as PDF
                </button>
                <button className="export-button">
                  📊 Export as CSV
                </button>
                <button className="export-button">
                  📧 Email Report
                </button>
              </div>
            </div>
          ) : (
            <div className="no-data">
              <p>No data available for this report.</p>
            </div>
          )}
        </div>
      )}

      <style>{`
        .reports-container {
          padding: 2rem;
          background: white;
          min-height: 100vh;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .reports-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #e5e7eb;
        }

        .header-info h1 {
          margin: 0;
          color: #111827;
          font-size: 2rem;
          font-weight: bold;
        }

        .header-info p {
          margin: 0.5rem 0 0 0;
          color: #6b7280;
          font-size: 1.1rem;
        }

        .header-controls {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .date-range-select {
          padding: 0.5rem 1rem;
          border: 2px solid #d1d5db;
          border-radius: 8px;
          background: white;
          font-size: 1rem;
          color: #374151;
        }

        .date-display {
          padding: 0.5rem 1rem;
          background: #f3f4f6;
          border-radius: 8px;
          font-weight: 500;
          color: #374151;
        }

        .report-selection h2 {
          color: #111827;
          margin-bottom: 1.5rem;
        }

        .report-templates {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .report-template-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 16px;
          padding: 1.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
          color: white;
          position: relative;
          overflow: hidden;
        }

        .report-template-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(102, 126, 234, 0.3);
        }

        .template-icon {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }

        .template-info h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.25rem;
          font-weight: bold;
        }

        .template-info p {
          margin: 0 0 1rem 0;
          opacity: 0.9;
          line-height: 1.4;
        }

        .template-category {
          background: rgba(255, 255, 255, 0.2);
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.8rem;
          text-transform: uppercase;
          font-weight: 500;
        }

        .report-display {
          max-width: 1200px;
          margin: 0 auto;
        }

        .report-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .back-button {
          background: #f3f4f6;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          color: #374151;
          font-weight: 500;
          transition: background 0.2s ease;
        }

        .back-button:hover {
          background: #e5e7eb;
        }

        .report-header h2 {
          margin: 0;
          color: #111827;
        }

        .loading-container {
          text-align: center;
          padding: 4rem 2rem;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f4f6;
          border-top: 4px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem auto;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .data-summary {
          background: #f9fafb;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 2rem;
        }

        .data-summary h3 {
          margin: 0 0 1rem 0;
          color: #111827;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .summary-item {
          background: white;
          padding: 1rem;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .summary-label {
          font-size: 0.9rem;
          color: #6b7280;
          margin-bottom: 0.5rem;
        }

        .summary-value {
          font-size: 1.25rem;
          font-weight: bold;
          color: #111827;
        }

        .report-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-top: 2rem;
        }

        .export-button {
          background: #667eea;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .export-button:hover {
          background: #5a67d8;
          transform: translateY(-1px);
        }

        .no-data {
          text-align: center;
          padding: 4rem 2rem;
          color: #6b7280;
        }

        @media (max-width: 768px) {
          .reports-container {
            padding: 1rem;
          }

          .reports-header {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }

          .header-controls {
            flex-direction: column;
            width: 100%;
          }

          .date-range-select {
            width: 100%;
          }

          .report-templates {
            grid-template-columns: 1fr;
          }

          .report-actions {
            flex-direction: column;
            align-items: center;
          }

          .export-button {
            width: 200px;
          }

          .summary-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Reports;
