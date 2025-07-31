import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

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

const ProgressDashboard: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [selectedGoal, setSelectedGoal] = useState<string>('');
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview');

  // Load data from localStorage
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = () => {
    try {
      // Load students
      const studentsData = localStorage.getItem('students');
      if (studentsData) {
        setStudents(JSON.parse(studentsData));
      }

      // Load goals
      const goalsData = localStorage.getItem('iep_goals');
      if (goalsData) {
        setGoals(JSON.parse(goalsData));
      }

      // Load data points
      const dataPointsData = localStorage.getItem('iep_data_points');
      if (dataPointsData) {
        setDataPoints(JSON.parse(dataPointsData));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  // Get filtered data based on selections
  const getFilteredData = () => {
    if (!selectedStudent && !selectedGoal) return dataPoints;
    
    return dataPoints.filter(dp => {
      if (selectedGoal) return dp.goalId === selectedGoal;
      if (selectedStudent) {
        const studentGoals = goals.filter(g => g.studentId === selectedStudent);
        return studentGoals.some(g => g.id === dp.goalId);
      }
      return true;
    });
  };

  // Prepare chart data
  const prepareProgressChartData = () => {
    const filteredData = getFilteredData();
    
    // Group by date and calculate averages
    const dateGroups: { [date: string]: number[] } = {};
    
    filteredData.forEach(dp => {
      const date = new Date(dp.date).toLocaleDateString();
      if (!dateGroups[date]) dateGroups[date] = [];
      dateGroups[date].push(dp.value);
    });

    return Object.entries(dateGroups)
      .map(([date, values]) => ({
        date,
        progress: Math.round(values.reduce((sum, val) => sum + val, 0) / values.length),
        dataPoints: values.length
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  // Get domain distribution
  const getDomainDistribution = () => {
    const selectedStudentGoals = selectedStudent 
      ? goals.filter(g => g.studentId === selectedStudent)
      : goals;

    const domainCounts: { [domain: string]: number } = {};
    selectedStudentGoals.forEach(goal => {
      domainCounts[goal.domain] = (domainCounts[goal.domain] || 0) + 1;
    });

    return Object.entries(domainCounts).map(([domain, count]) => ({
      domain,
      count,
      fill: getDomainColor(domain)
    }));
  };

  const getDomainColor = (domain: string) => {
    const colors: { [key: string]: string } = {
      'Academic': '#3b82f6',
      'Communication': '#10b981', 
      'Social/Emotional': '#f59e0b',
      'Behavioral': '#ef4444',
      'Life Skills': '#8b5cf6',
      'Motor Skills': '#06b6d4'
    };
    return colors[domain] || '#6b7280';
  };

  // Calculate recent progress trends
  const getRecentTrends = () => {
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const recentData = dataPoints.filter(dp => 
      new Date(dp.date) >= last7Days &&
      (!selectedStudent || goals.find(g => g.id === dp.goalId)?.studentId === selectedStudent)
    );

    const avgProgress = recentData.length > 0 
      ? Math.round(recentData.reduce((sum, dp) => sum + dp.value, 0) / recentData.length)
      : 0;

    return {
      totalDataPoints: recentData.length,
      averageProgress: avgProgress,
      goalsWorkedOn: new Set(recentData.map(dp => dp.goalId)).size
    };
  };

  const chartData = prepareProgressChartData();
  const domainData = getDomainDistribution();
  const trends = getRecentTrends();
  const filteredGoals = selectedStudent ? goals.filter(g => g.studentId === selectedStudent) : goals;

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
          <span>📈</span>
          IEP Progress Dashboard
        </h1>

        {/* Controls */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <select 
            value={selectedStudent}
            onChange={(e) => {
              setSelectedStudent(e.target.value);
              setSelectedGoal(''); // Reset goal selection
            }}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '12px',
              border: 'none',
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              fontSize: '1rem',
              backdropFilter: 'blur(10px)'
            }}
          >
            <option value="">All Students</option>
            {students.map(student => (
              <option key={student.id} value={student.id} style={{ color: 'black' }}>
                {student.name}
              </option>
            ))}
          </select>

          <select 
            value={selectedGoal}
            onChange={(e) => setSelectedGoal(e.target.value)}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '12px',
              border: 'none',
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              fontSize: '1rem',
              backdropFilter: 'blur(10px)'
            }}
          >
            <option value="">All Goals</option>
            {filteredGoals.map(goal => (
              <option key={goal.id} value={goal.id} style={{ color: 'black' }}>
                {goal.title}
              </option>
            ))}
          </select>

          <button
            onClick={loadAllData}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '12px',
              border: 'none',
              background: 'rgba(255,255,255,0.3)',
              color: 'white',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.4)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
          >
            🔄 Refresh Data
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          padding: '1.5rem',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <h3 style={{ color: 'white', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
            📊 Total Data Points (7 days)
          </h3>
          <p style={{ color: 'white', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
            {trends.totalDataPoints}
          </p>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          padding: '1.5rem',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <h3 style={{ color: 'white', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
            🎯 Average Progress
          </h3>
          <p style={{ color: 'white', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
            {trends.averageProgress}%
          </p>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          padding: '1.5rem',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <h3 style={{ color: 'white', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
            📋 Active Goals
          </h3>
          <p style={{ color: 'white', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
            {trends.goalsWorkedOn}
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '2rem'
      }}>
        {/* Progress Over Time Chart */}
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
            📈 Progress Over Time
          </h3>
          
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: 'white', fontSize: 12 }}
                  stroke="rgba(255,255,255,0.5)"
                />
                <YAxis 
                  tick={{ fill: 'white', fontSize: 12 }}
                  stroke="rgba(255,255,255,0.5)"
                  domain={[0, 100]}
                />
                <Tooltip 
                  contentStyle={{
                    background: 'rgba(0,0,0,0.8)',
                    border: 'none',
                    borderRadius: '12px',
                    color: 'white'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="progress" 
                  stroke="#00d4aa" 
                  strokeWidth={3}
                  dot={{ fill: '#00d4aa', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, stroke: '#00d4aa', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{
              height: '300px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgba(255,255,255,0.7)',
              fontSize: '1.1rem'
            }}>
              📊 No data points available. Start collecting data to see progress charts!
            </div>
          )}
        </div>

        {/* Domain Distribution Chart */}
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
            🎯 Goals by Domain
          </h3>
          
          {domainData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={domainData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="count"
                  label={({ domain, count }) => `${domain}: ${count}`}
                >
                  {domainData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    background: 'rgba(0,0,0,0.8)',
                    border: 'none',
                    borderRadius: '12px',
                    color: 'white'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{
              height: '300px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgba(255,255,255,0.7)',
              fontSize: '1.1rem'
            }}>
              🎯 No goals found. Create goals to see domain distribution!
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      {dataPoints.length > 0 && (
        <div style={{
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          padding: '2rem',
          marginTop: '2rem',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <h3 style={{
            color: 'white',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            marginBottom: '1.5rem'
          }}>
            🕒 Recent Data Collection
          </h3>
          
          <div style={{
            display: 'grid',
            gap: '1rem',
            maxHeight: '300px',
            overflowY: 'auto'
          }}>
            {getFilteredData()
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 10)
              .map(dp => {
                const goal = goals.find(g => g.id === dp.goalId);
                const student = students.find(s => s.id === goal?.studentId);
                
                return (
                  <div key={dp.id} style={{
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    padding: '1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <p style={{ color: 'white', fontWeight: 'bold', margin: '0 0 0.25rem 0' }}>
                        {student?.name} - {goal?.title}
                      </p>
                      <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', margin: 0 }}>
                        {new Date(dp.date).toLocaleDateString()} {dp.activity && `• ${dp.activity}`}
                      </p>
                    </div>
                    <div style={{
                      background: dp.value >= 80 ? '#10b981' : dp.value >= 60 ? '#f59e0b' : '#ef4444',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      fontWeight: 'bold'
                    }}>
                      {dp.value}%
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressDashboard;