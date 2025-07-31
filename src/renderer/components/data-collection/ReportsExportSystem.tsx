import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Download, FileText, Printer, Mail, Calendar, User, Target, TrendingUp } from 'lucide-react';

// Interface definitions
interface DataPoint {
  id: string;
  studentId: string;
  goalId: string;
  value: number;
  measurementType: string;
  date: string;
  notes?: string;
  activity?: string;
}

interface Goal {
  id: string;
  studentId: string;
  title: string;
  description: string;
  domain: string;
  measurementType: string;
  targetValue: number;
  currentProgress: number;
  startDate: string;
  targetDate: string;
  status: 'active' | 'completed' | 'paused';
}

interface Student {
  id: string;
  name: string;
  grade?: string;
  photo?: string;
}

interface ReportConfig {
  studentId: string;
  goalIds: string[];
  dateRange: {
    start: string;
    end: string;
  };
  includeCharts: boolean;
  includeDataTable: boolean;
  includeNotes: boolean;
  reportType: 'individual' | 'progress' | 'summary' | 'quarterly';
}

const ReportsExportSystem: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    studentId: '',
    goalIds: [],
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    },
    includeCharts: true,
    includeDataTable: true,
    includeNotes: true,
    reportType: 'progress'
  });
  const [reportPreview, setReportPreview] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Load data from localStorage
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = () => {
    try {
      const studentsData = localStorage.getItem('students');
      if (studentsData) {
        setStudents(JSON.parse(studentsData));
      }

      const goalsData = localStorage.getItem('iep_goals');
      if (goalsData) {
        setGoals(JSON.parse(goalsData));
      }

      const dataPointsData = localStorage.getItem('iep_data_points');
      if (dataPointsData) {
        setDataPoints(JSON.parse(dataPointsData));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  // Get student goals
  const getStudentGoals = (studentId: string) => {
    return goals.filter(goal => goal.studentId === studentId);
  };

  // Get filtered data points
  const getFilteredDataPoints = () => {
    const { studentId, goalIds, dateRange } = reportConfig;
    
    return dataPoints.filter(dp => {
      const dpDate = new Date(dp.date);
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      
      const matchesStudent = !studentId || goals.find(g => g.id === dp.goalId)?.studentId === studentId;
      const matchesGoals = goalIds.length === 0 || goalIds.includes(dp.goalId);
      const matchesDate = dpDate >= startDate && dpDate <= endDate;
      
      return matchesStudent && matchesGoals && matchesDate;
    });
  };

  // Generate report data
  const generateReportData = () => {
    const filteredData = getFilteredDataPoints();
    const student = students.find(s => s.id === reportConfig.studentId);
    const selectedGoals = goals.filter(g => 
      reportConfig.goalIds.length === 0 ? 
      g.studentId === reportConfig.studentId : 
      reportConfig.goalIds.includes(g.id)
    );

    // Calculate progress data
    const progressData = filteredData.reduce((acc: any, dp) => {
      const date = new Date(dp.date).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = { date, values: [] };
      }
      acc[date].values.push(dp.value);
      return acc;
    }, {});

    const chartData = Object.values(progressData).map((day: any) => ({
      date: day.date,
      progress: Math.round(day.values.reduce((sum: number, val: number) => sum + val, 0) / day.values.length)
    }));

    // Calculate summary statistics
    const totalDataPoints = filteredData.length;
    const averageProgress = totalDataPoints > 0 ? 
      Math.round(filteredData.reduce((sum, dp) => sum + dp.value, 0) / totalDataPoints) : 0;
    
    const goalProgress = selectedGoals.map(goal => {
      const goalData = filteredData.filter(dp => dp.goalId === goal.id);
      const avgProgress = goalData.length > 0 ? 
        Math.round(goalData.reduce((sum, dp) => sum + dp.value, 0) / goalData.length) : 0;
      
      return {
        ...goal,
        dataPoints: goalData.length,
        averageProgress: avgProgress,
        latestProgress: goalData.length > 0 ? 
          goalData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].value : 0
      };
    });

    return {
      student,
      goals: selectedGoals,
      goalProgress,
      chartData,
      totalDataPoints,
      averageProgress,
      dataPoints: filteredData,
      dateRange: reportConfig.dateRange
    };
  };

  // Generate PDF report
  const generatePDFReport = async () => {
    setIsGenerating(true);
    
    try {
      const reportData = generateReportData();
      
      // Create a new window for the report
      const reportWindow = window.open('', '_blank');
      if (!reportWindow) {
        alert('Please allow popups to generate reports');
        return;
      }

      const reportHTML = generateReportHTML(reportData);
      reportWindow.document.write(reportHTML);
      reportWindow.document.close();
      
      // Add print functionality
      setTimeout(() => {
        reportWindow.print();
      }, 1000);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate Excel export
  const generateExcelExport = () => {
    const reportData = generateReportData();
    
    // Create CSV content
    const headers = ['Date', 'Student', 'Goal', 'Domain', 'Value', 'Measurement Type', 'Notes', 'Activity'];
    const rows = reportData.dataPoints.map(dp => {
      const goal = goals.find(g => g.id === dp.goalId);
      return [
        dp.date,
        reportData.student?.name || '',
        goal?.title || '',
        goal?.domain || '',
        dp.value,
        dp.measurementType,
        dp.notes || '',
        dp.activity || ''
      ];
    });

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    // Download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `IEP_Data_${reportData.student?.name || 'Report'}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  // Generate HTML for PDF report
  const generateReportHTML = (reportData: any) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>IEP Progress Report - ${reportData.student?.name}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
        .header { text-align: center; border-bottom: 3px solid #4f46e5; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { color: #4f46e5; margin: 0; font-size: 28px; }
        .header p { margin: 5px 0; color: #666; }
        .section { margin: 30px 0; }
        .section h2 { color: #4f46e5; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; }
        .student-info { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .goals-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .goal-card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; }
        .goal-title { font-weight: bold; color: #374151; margin-bottom: 10px; }
        .progress-bar { width: 100%; height: 20px; background: #e5e7eb; border-radius: 10px; overflow: hidden; }
        .progress-fill { height: 100%; background: linear-gradient(90deg, #10b981, #059669); }
        .data-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .data-table th, .data-table td { border: 1px solid #d1d5db; padding: 8px; text-align: left; }
        .data-table th { background: #f3f4f6; font-weight: bold; }
        .summary-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
        .stat-card { background: #f8fafc; padding: 15px; border-radius: 8px; text-align: center; }
        .stat-number { font-size: 24px; font-weight: bold; color: #4f46e5; }
        .stat-label { color: #6b7280; font-size: 14px; }
        .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; }
        @media print { body { margin: 20px; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>IEP Progress Report</h1>
        <p><strong>Student:</strong> ${reportData.student?.name || 'Not Selected'}</p>
        <p><strong>Report Period:</strong> ${new Date(reportData.dateRange.start).toLocaleDateString()} - ${new Date(reportData.dateRange.end).toLocaleDateString()}</p>
        <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
      </div>

      ${reportData.student ? `
      <div class="section">
        <h2>📊 Summary Statistics</h2>
        <div class="summary-stats">
          <div class="stat-card">
            <div class="stat-number">${reportData.totalDataPoints}</div>
            <div class="stat-label">Total Data Points</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${reportData.averageProgress}%</div>
            <div class="stat-label">Average Progress</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${reportData.goals.length}</div>
            <div class="stat-label">Active Goals</div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>🎯 Goal Progress</h2>
        <div class="goals-grid">
          ${reportData.goalProgress.map((goal: any) => `
            <div class="goal-card">
              <div class="goal-title">${goal.title}</div>
              <p><strong>Domain:</strong> ${goal.domain}</p>
              <p><strong>Data Points:</strong> ${goal.dataPoints}</p>
              <p><strong>Average Progress:</strong> ${goal.averageProgress}%</p>
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${goal.averageProgress}%"></div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      ${reportConfig.includeDataTable ? `
      <div class="section">
        <h2>📈 Data Collection Record</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Goal</th>
              <th>Progress</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            ${reportData.dataPoints.slice(0, 20).map((dp: any) => {
              const goal = reportData.goals.find((g: any) => g.id === dp.goalId);
              return `
                <tr>
                  <td>${new Date(dp.date).toLocaleDateString()}</td>
                  <td>${goal?.title || 'Unknown Goal'}</td>
                  <td>${dp.value}%</td>
                  <td>${dp.notes || '-'}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
        ${reportData.dataPoints.length > 20 ? `<p><em>Showing most recent 20 entries of ${reportData.dataPoints.length} total.</em></p>` : ''}
      </div>
      ` : ''}
      ` : '<p>Please select a student to generate a report.</p>'}

      <div class="footer">
        <p>Generated by Visual Schedule Builder IEP Management System</p>
      </div>
    </body>
    </html>
    `;
  };

  const studentGoals = selectedStudent ? getStudentGoals(selectedStudent) : [];

  return (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      padding: '2rem'
    }}>
      {/* Header */}
      <div style={{
        background: 'rgba(255,255,255,0.15)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        padding: '2rem',
        marginBottom: '2rem',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 'bold',
          color: 'white',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <FileText size={40} />
          Reports & Export System
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.1rem' }}>
          Generate professional IEP progress reports and export data for meetings
        </p>
      </div>

      {/* Report Configuration */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '2rem',
        marginBottom: '2rem'
      }}>
        {/* Student & Goal Selection */}
        <div style={{
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          padding: '2rem',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <h3 style={{
            color: 'white',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <User size={24} />
            Student & Goals
          </h3>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ color: 'white', fontSize: '1rem', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
              Select Student:
            </label>
            <select
              value={selectedStudent}
              onChange={(e) => {
                setSelectedStudent(e.target.value);
                setReportConfig({
                  ...reportConfig,
                  studentId: e.target.value,
                  goalIds: []
                });
              }}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '12px',
                border: 'none',
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                fontSize: '1rem',
                backdropFilter: 'blur(10px)'
              }}
            >
              <option value="" style={{ color: 'black' }}>All Students</option>
              {students.map(student => (
                <option key={student.id} value={student.id} style={{ color: 'black' }}>
                  {student.name}
                </option>
              ))}
            </select>
          </div>

          {selectedStudent && (
            <div>
              <label style={{ color: 'white', fontSize: '1rem', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
                Select Goals (leave empty for all):
              </label>
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {studentGoals.map(goal => (
                  <label key={goal.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.5rem',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    marginBottom: '0.5rem',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      checked={reportConfig.goalIds.includes(goal.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setReportConfig({
                            ...reportConfig,
                            goalIds: [...reportConfig.goalIds, goal.id]
                          });
                        } else {
                          setReportConfig({
                            ...reportConfig,
                            goalIds: reportConfig.goalIds.filter(id => id !== goal.id)
                          });
                        }
                      }}
                      style={{ marginRight: '0.5rem' }}
                    />
                    <span style={{ color: 'white', fontSize: '0.9rem' }}>{goal.title}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Report Settings */}
        <div style={{
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          padding: '2rem',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <h3 style={{
            color: 'white',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Calendar size={24} />
            Report Settings
          </h3>

          {/* Date Range */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ color: 'white', fontSize: '1rem', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
              Date Range:
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="date"
                value={reportConfig.dateRange.start}
                onChange={(e) => setReportConfig({
                  ...reportConfig,
                  dateRange: { ...reportConfig.dateRange, start: e.target.value }
                })}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white'
                }}
              />
              <input
                type="date"
                value={reportConfig.dateRange.end}
                onChange={(e) => setReportConfig({
                  ...reportConfig,
                  dateRange: { ...reportConfig.dateRange, end: e.target.value }
                })}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white'
                }}
              />
            </div>
          </div>

          {/* Report Type */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ color: 'white', fontSize: '1rem', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
              Report Type:
            </label>
            <select
              value={reportConfig.reportType}
              onChange={(e) => setReportConfig({
                ...reportConfig,
                reportType: e.target.value as any
              })}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: 'none',
                background: 'rgba(255,255,255,0.2)',
                color: 'white'
              }}
            >
              <option value="progress" style={{ color: 'black' }}>Progress Report</option>
              <option value="summary" style={{ color: 'black' }}>Summary Report</option>
              <option value="quarterly" style={{ color: 'black' }}>Quarterly Review</option>
              <option value="individual" style={{ color: 'black' }}>Individual Goals</option>
            </select>
          </div>

          {/* Include Options */}
          <div>
            <label style={{ color: 'white', fontSize: '1rem', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
              Include in Report:
            </label>
            {[
              { key: 'includeCharts', label: 'Progress Charts' },
              { key: 'includeDataTable', label: 'Data Table' },
              { key: 'includeNotes', label: 'Notes & Comments' }
            ].map(option => (
              <label key={option.key} style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0.5rem',
                color: 'white',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={reportConfig[option.key as keyof ReportConfig] as boolean}
                  onChange={(e) => setReportConfig({
                    ...reportConfig,
                    [option.key]: e.target.checked
                  })}
                  style={{ marginRight: '0.5rem' }}
                />
                {option.label}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{
        background: 'rgba(255,255,255,0.15)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        padding: '2rem',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        border: '1px solid rgba(255,255,255,0.2)',
        marginBottom: '2rem'
      }}>
        <h3 style={{
          color: 'white',
          fontSize: '1.5rem',
          fontWeight: 'bold',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Download size={24} />
          Generate Reports
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          <button
            onClick={generatePDFReport}
            disabled={isGenerating || !selectedStudent}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '1rem 1.5rem',
              borderRadius: '12px',
              border: 'none',
              background: isGenerating || !selectedStudent ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: isGenerating || !selectedStudent ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              if (!isGenerating && selectedStudent) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.2)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <FileText size={20} />
            {isGenerating ? 'Generating...' : 'PDF Report'}
          </button>

          <button
            onClick={generateExcelExport}
            disabled={!selectedStudent}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '1rem 1.5rem',
              borderRadius: '12px',
              border: 'none',
              background: !selectedStudent ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: !selectedStudent ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              if (selectedStudent) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.2)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Download size={20} />
            Excel Export
          </button>

          <button
            onClick={() => {
              const reportData = generateReportData();
              setReportPreview(reportData);
            }}
            disabled={!selectedStudent}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '1rem 1.5rem',
              borderRadius: '12px',
              border: 'none',
              background: !selectedStudent ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: 'white',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: !selectedStudent ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              if (selectedStudent) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.2)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <TrendingUp size={20} />
            Preview Report
          </button>

          <button
            onClick={loadAllData}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '1rem 1.5rem',
              borderRadius: '12px',
              border: 'none',
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)'
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
            🔄 Refresh Data
          </button>
        </div>
      </div>

      {/* Report Preview */}
      {reportPreview && (
        <div style={{
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          padding: '2rem',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
          marginBottom: '2rem'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem'
          }}>
            <h3 style={{
              color: 'white',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <TrendingUp size={24} />
              Report Preview
            </h3>
            <button
              onClick={() => setReportPreview(null)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: 'none',
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              ✕ Close
            </button>
          </div>

          {/* Preview Content */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            color: '#333'
          }}>
            {/* Report Header */}
            <div style={{
              textAlign: 'center',
              borderBottom: '3px solid #4f46e5',
              paddingBottom: '20px',
              marginBottom: '30px'
            }}>
              <h1 style={{ color: '#4f46e5', margin: 0, fontSize: '28px' }}>
                IEP Progress Report
              </h1>
              <p style={{ margin: '5px 0', color: '#666' }}>
                <strong>Student:</strong> {reportPreview.student?.name || 'Not Selected'}
              </p>
              <p style={{ margin: '5px 0', color: '#666' }}>
                <strong>Report Period:</strong> {new Date(reportPreview.dateRange.start).toLocaleDateString()} - {new Date(reportPreview.dateRange.end).toLocaleDateString()}
              </p>
              <p style={{ margin: '5px 0', color: '#666' }}>
                <strong>Generated:</strong> {new Date().toLocaleDateString()}
              </p>
            </div>

            {/* Summary Statistics */}
            <div style={{ marginBottom: '30px' }}>
              <h2 style={{ color: '#4f46e5', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>
                📊 Summary Statistics
              </h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '15px',
                margin: '20px 0'
              }}>
                <div style={{
                  background: '#f8fafc',
                  padding: '15px',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4f46e5' }}>
                    {reportPreview.totalDataPoints}
                  </div>
                  <div style={{ color: '#6b7280', fontSize: '14px' }}>Total Data Points</div>
                </div>
                <div style={{
                  background: '#f8fafc',
                  padding: '15px',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4f46e5' }}>
                    {reportPreview.averageProgress}%
                  </div>
                  <div style={{ color: '#6b7280', fontSize: '14px' }}>Average Progress</div>
                </div>
                <div style={{
                  background: '#f8fafc',
                  padding: '15px',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4f46e5' }}>
                    {reportPreview.goals.length}
                  </div>
                  <div style={{ color: '#6b7280', fontSize: '14px' }}>Active Goals</div>
                </div>
              </div>
            </div>

            {/* Goal Progress */}
            <div style={{ marginBottom: '30px' }}>
              <h2 style={{ color: '#4f46e5', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>
                🎯 Goal Progress
              </h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '20px',
                margin: '20px 0'
              }}>
                {reportPreview.goalProgress.map((goal: any) => (
                  <div key={goal.id} style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '15px'
                  }}>
                    <div style={{ fontWeight: 'bold', color: '#374151', marginBottom: '10px' }}>
                      {goal.title}
                    </div>
                    <p style={{ margin: '5px 0' }}>
                      <strong>Domain:</strong> {goal.domain}
                    </p>
                    <p style={{ margin: '5px 0' }}>
                      <strong>Data Points:</strong> {goal.dataPoints}
                    </p>
                    <p style={{ margin: '5px 0' }}>
                      <strong>Average Progress:</strong> {goal.averageProgress}%
                    </p>
                    <div style={{
                      width: '100%',
                      height: '20px',
                      background: '#e5e7eb',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      marginTop: '10px'
                    }}>
                      <div style={{
                        height: '100%',
                        background: 'linear-gradient(90deg, #10b981, #059669)',
                        width: `${goal.averageProgress}%`,
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress Chart */}
            {reportConfig.includeCharts && reportPreview.chartData.length > 0 && (
              <div style={{ marginBottom: '30px' }}>
                <h2 style={{ color: '#4f46e5', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>
                  📈 Progress Over Time
                </h2>
                <div style={{ height: '300px', marginTop: '20px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={reportPreview.chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                        stroke="#9ca3af"
                      />
                      <YAxis 
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                        stroke="#9ca3af"
                        domain={[0, 100]}
                      />
                      <Tooltip 
                        contentStyle={{
                          background: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          color: '#374151'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="progress" 
                        stroke="#4f46e5" 
                        strokeWidth={3}
                        dot={{ fill: '#4f46e5', strokeWidth: 2, r: 6 }}
                        activeDot={{ r: 8, stroke: '#4f46e5', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Recent Data Table */}
            {reportConfig.includeDataTable && reportPreview.dataPoints.length > 0 && (
              <div style={{ marginBottom: '30px' }}>
                <h2 style={{ color: '#4f46e5', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>
                  📈 Recent Data Collection
                </h2>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  margin: '20px 0'
                }}>
                  <thead>
                    <tr>
                      <th style={{
                        border: '1px solid #d1d5db',
                        padding: '8px',
                        textAlign: 'left',
                        background: '#f3f4f6',
                        fontWeight: 'bold'
                      }}>
                        Date
                      </th>
                      <th style={{
                        border: '1px solid #d1d5db',
                        padding: '8px',
                        textAlign: 'left',
                        background: '#f3f4f6',
                        fontWeight: 'bold'
                      }}>
                        Goal
                      </th>
                      <th style={{
                        border: '1px solid #d1d5db',
                        padding: '8px',
                        textAlign: 'left',
                        background: '#f3f4f6',
                        fontWeight: 'bold'
                      }}>
                        Progress
                      </th>
                      <th style={{
                        border: '1px solid #d1d5db',
                        padding: '8px',
                        textAlign: 'left',
                        background: '#f3f4f6',
                        fontWeight: 'bold'
                      }}>
                        Notes
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportPreview.dataPoints
                      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .slice(0, 10)
                      .map((dp: any) => {
                        const goal = reportPreview.goals.find((g: any) => g.id === dp.goalId);
                        return (
                          <tr key={dp.id}>
                            <td style={{ border: '1px solid #d1d5db', padding: '8px' }}>
                              {new Date(dp.date).toLocaleDateString()}
                            </td>
                            <td style={{ border: '1px solid #d1d5db', padding: '8px' }}>
                              {goal?.title || 'Unknown Goal'}
                            </td>
                            <td style={{ border: '1px solid #d1d5db', padding: '8px' }}>
                              <span style={{
                                background: dp.value >= 80 ? '#10b981' : dp.value >= 60 ? '#f59e0b' : '#ef4444',
                                color: 'white',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: 'bold'
                              }}>
                                {dp.value}%
                              </span>
                            </td>
                            <td style={{ border: '1px solid #d1d5db', padding: '8px' }}>
                              {dp.notes || '-'}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
                {reportPreview.dataPoints.length > 10 && (
                  <p style={{ fontStyle: 'italic', color: '#6b7280' }}>
                    Showing most recent 10 entries of {reportPreview.dataPoints.length} total.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div style={{
        background: 'rgba(255,255,255,0.15)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        padding: '2rem',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        <h3 style={{
          color: 'white',
          fontSize: '1.5rem',
          fontWeight: 'bold',
          marginBottom: '1.5rem'
        }}>
          📊 Current Data Overview
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '12px',
            padding: '1rem',
            textAlign: 'center'
          }}>
            <div style={{ color: 'white', fontSize: '2rem', fontWeight: 'bold' }}>
              {students.length}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.8)' }}>Total Students</div>
          </div>
          
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '12px',
            padding: '1rem',
            textAlign: 'center'
          }}>
            <div style={{ color: 'white', fontSize: '2rem', fontWeight: 'bold' }}>
              {goals.length}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.8)' }}>Active Goals</div>
          </div>
          
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '12px',
            padding: '1rem',
            textAlign: 'center'
          }}>
            <div style={{ color: 'white', fontSize: '2rem', fontWeight: 'bold' }}>
              {dataPoints.length}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.8)' }}>Data Points</div>
          </div>
          
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '12px',
            padding: '1rem',
            textAlign: 'center'
          }}>
            <div style={{ color: 'white', fontSize: '2rem', fontWeight: 'bold' }}>
              {dataPoints.length > 0 ? Math.round(dataPoints.reduce((sum, dp) => sum + dp.value, 0) / dataPoints.length) : 0}%
            </div>
            <div style={{ color: 'rgba(255,255,255,0.8)' }}>Avg. Progress</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsExportSystem;