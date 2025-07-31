import React, { useState, useEffect, useMemo } from 'react';
import { 
  IEPGoal, 
  DataCollectionSession, 
  StudentWithIEP, 
  Student, 
  DataPoint, 
  FrequencyDataPoint, 
  AccuracyDataPoint, 
  DurationDataPoint, 
  IndependenceDataPoint, 
  RatingDataPoint, 
  ProgressSummary 
} from '../../types';

interface IEPDataCollectionProps {
  isActive: boolean;
}

const IEPDataCollectionInterface: React.FC<IEPDataCollectionProps> = ({ isActive }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentWithIEP | null>(null);
  const [activeGoals, setActiveGoals] = useState<IEPGoal[]>([]);
  const [currentSession, setCurrentSession] = useState<DataCollectionSession | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<IEPGoal | null>(null);
  const [dataEntry, setDataEntry] = useState<any>({});
  const [view, setView] = useState<'dashboard' | 'data-entry' | 'progress' | 'goals'>('dashboard');

  // Load students and IEP data on component mount
  useEffect(() => {
    if (isActive) {
      loadStudentData();
    }
  }, [isActive]);

  const loadStudentData = () => {
    // Load students from localStorage
    const storedStudents = localStorage.getItem('student_data');
    if (storedStudents) {
      const studentData = JSON.parse(storedStudents);
      setStudents(studentData);
      
      // Load IEP data for students
      const iepStudents = studentData.filter((student: Student) => student.iep);
      if (iepStudents.length > 0 && !selectedStudent) {
        // Auto-select first IEP student
        const firstIEPStudent = iepStudents[0];
        loadStudentIEPData(firstIEPStudent);
      }
    }
  };

  const loadStudentIEPData = (student: Student) => {
    // Load IEP goals for this student
    const storedGoals = localStorage.getItem(`iep_goals_${student.id}`);
    const goals: IEPGoal[] = storedGoals ? JSON.parse(storedGoals) : [];
    
    const studentWithIEP: StudentWithIEP = {
      ...student,
      hasIEP: true,
      iepGoals: goals,
      dataCollectionSessions: [],
      progressSummaries: [],
      iepStartDate: new Date().toISOString().split('T')[0],
      iepEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
    
    setSelectedStudent(studentWithIEP);
    setActiveGoals(goals.filter(goal => goal.isActive));
  };

  const startDataSession = (goalId?: string) => {
    if (!selectedStudent) return;
    
    const session: DataCollectionSession = {
      id: `session_${Date.now()}`,
      studentId: selectedStudent.id,
      goalIds: goalId ? [goalId] : activeGoals.map(g => g.id),
      startTime: new Date().toISOString(),
      setting: 'classroom',
      staffMember: 'Current User', // Would get from auth context
      dataPoints: [],
      isCompleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setCurrentSession(session);
    setView('data-entry');
  };

  const recordDataPoint = (goalId: string, value: any, type: string) => {
    if (!currentSession) return;
    
    const dataPoint: DataPoint = {
      id: `datapoint_${Date.now()}`,
      goalId,
      sessionId: currentSession.id,
      timestamp: new Date().toISOString(),
      value,
      context: type
    };
    
    const updatedSession = {
      ...currentSession,
      dataPoints: [...currentSession.dataPoints, dataPoint],
      updatedAt: new Date().toISOString()
    };
    
    setCurrentSession(updatedSession);
    
    // Save to localStorage
    const sessionKey = `session_${currentSession.id}`;
    localStorage.setItem(sessionKey, JSON.stringify(updatedSession));
  };

  const completeSession = () => {
    if (!currentSession) return;
    
    const completedSession = {
      ...currentSession,
      endTime: new Date().toISOString(),
      isCompleted: true,
      updatedAt: new Date().toISOString()
    };
    
    // Save completed session
    const sessionKey = `session_${currentSession.id}`;
    localStorage.setItem(sessionKey, JSON.stringify(completedSession));
    
    setCurrentSession(null);
    setView('dashboard');
  };

  const iepStudents = useMemo(() => {
    return students.filter(student => student.iep);
  }, [students]);

  if (!isActive) return null;

  return (
    <div className="iep-data-collection">
      <div className="iep-header">
        <h2 className="component-title">📊 IEP Data Collection</h2>
        <p className="component-subtitle">
          Track progress on individualized education program goals
        </p>
      </div>

      {/* Student Selection */}
      <div className="student-selection">
        <h3>Select Student</h3>
        <div className="student-cards">
          {iepStudents.length === 0 ? (
            <div className="no-iep-students">
              <p>No students with IEPs found. Mark students as having IEPs in Student Management.</p>
            </div>
          ) : (
            iepStudents.map(student => (
              <div
                key={student.id}
                className={`student-card ${selectedStudent?.id === student.id ? 'selected' : ''}`}
                onClick={() => loadStudentIEPData(student)}
              >
                <div className="student-photo">
                  {student.photo ? (
                    <img src={student.photo} alt={student.name} />
                  ) : (
                    <div className="student-avatar">
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="student-info">
                  <h4>{student.name}</h4>
                  <p>{student.grade || 'No grade specified'}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedStudent && (
        <>
          {/* Navigation Tabs */}
          <div className="view-tabs">
            <button
              className={`tab-button ${view === 'dashboard' ? 'active' : ''}`}
              onClick={() => setView('dashboard')}
            >
              📈 Dashboard
            </button>
            <button
              className={`tab-button ${view === 'goals' ? 'active' : ''}`}
              onClick={() => setView('goals')}
            >
              🎯 Goals
            </button>
            <button
              className={`tab-button ${view === 'data-entry' ? 'active' : ''}`}
              onClick={() => setView('data-entry')}
            >
              📝 Data Entry
            </button>
            <button
              className={`tab-button ${view === 'progress' ? 'active' : ''}`}
              onClick={() => setView('progress')}
            >
              📊 Progress
            </button>
          </div>

          {/* Dashboard View */}
          {view === 'dashboard' && (
            <div className="dashboard-view">
              <div className="dashboard-header">
                <h3>Data Collection Dashboard - {selectedStudent.name}</h3>
                <button 
                  className="start-session-btn"
                  onClick={() => startDataSession()}
                >
                  🎯 Start Data Collection Session
                </button>
              </div>

              <div className="dashboard-grid">
                <div className="active-goals-summary">
                  <h4>Active Goals ({activeGoals.length})</h4>
                  <div className="goals-list">
                    {activeGoals.map(goal => (
                      <div key={goal.id} className="goal-summary-card">
                        <div className="goal-header">
                          <span className={`goal-category ${goal.category}`}>
                            {goal.category}
                          </span>
                          <span className="measurement-type">
                            {goal.measurementType}
                          </span>
                        </div>
                        <h5>{goal.title}</h5>
                        <p>{goal.description}</p>
                        <button
                          className="quick-collect-btn"
                          onClick={() => startDataSession(goal.id)}
                        >
                          📝 Quick Collect
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="recent-sessions">
                  <h4>Recent Sessions</h4>
                  <p>No recent sessions found. Start collecting data to see progress!</p>
                </div>
              </div>
            </div>
          )}

          {/* Goals Management View */}
          {view === 'goals' && (
            <div className="goals-view">
              <div className="goals-header">
                <h3>IEP Goals - {selectedStudent.name}</h3>
                <button className="add-goal-btn">➕ Add New Goal</button>
              </div>
              
              <div className="goals-grid">
                {activeGoals.length > 0 ? (
                  activeGoals.map(goal => (
                    <div key={goal.id} className="goal-card">
                      <div className="goal-category-badge">
                        {goal.category}
                      </div>
                      <h4>{goal.title}</h4>
                      <p><strong>Target:</strong> {goal.targetBehavior}</p>
                      <p><strong>Measurement:</strong> {goal.measurementType}</p>
                      <p><strong>Criteria:</strong> {goal.targetCriteria}</p>
                      <p><strong>Current Level:</strong> {goal.currentLevel}</p>
                      {goal.notes && <p><strong>Notes:</strong> {goal.notes}</p>}
                      
                      <div className="goal-actions">
                        <button onClick={() => startDataSession(goal.id)}>
                          📝 Collect Data
                        </button>
                        <button>✏️ Edit</button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-goals">
                    <h4>No Goals Defined</h4>
                    <p>Add IEP goals to start collecting data.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Data Entry View */}
          {view === 'data-entry' && (
            <div className="data-entry-view">
              <div className="session-header">
                <h3>Data Collection Session</h3>
                {currentSession && (
                  <div className="session-info">
                    <span>Started: {new Date(currentSession.startTime).toLocaleTimeString()}</span>
                    <button 
                      className="complete-session-btn"
                      onClick={completeSession}
                    >
                      ✅ Complete Session
                    </button>
                  </div>
                )}
              </div>

              {currentSession ? (
                <div className="data-entry-forms">
                  {currentSession.goalIds.map(goalId => {
                    const goal = activeGoals.find(g => g.id === goalId);
                    if (!goal) return null;

                    return (
                      <div key={goalId} className="goal-data-entry">
                        <h4>{goal.title}</h4>
                        <div className="measurement-form">
                          {goal.measurementType === 'frequency' && (
                            <div className="frequency-form">
                              <label>Count:</label>
                              <input
                                type="number"
                                min="0"
                                placeholder="Number of occurrences"
                                onChange={(e) => recordDataPoint(goalId, parseInt(e.target.value), 'frequency')}
                              />
                            </div>
                          )}
                          
                          {goal.measurementType === 'accuracy' && (
                            <div className="accuracy-form">
                              <label>Correct:</label>
                              <input type="number" min="0" placeholder="Correct responses" />
                              <label>Total:</label>
                              <input type="number" min="1" placeholder="Total attempts" />
                            </div>
                          )}
                          
                          {goal.measurementType === 'duration' && (
                            <div className="duration-form">
                              <label>Duration (seconds):</label>
                              <input
                                type="number"
                                min="0"
                                placeholder="Duration in seconds"
                                onChange={(e) => recordDataPoint(goalId, parseInt(e.target.value), 'duration')}
                              />
                            </div>
                          )}
                          
                          {goal.measurementType === 'independence' && (
                            <div className="independence-form">
                              <label>Independence Level:</label>
                              <select onChange={(e) => recordDataPoint(goalId, e.target.value, 'independence')}>
                                <option value="">Select level...</option>
                                <option value="independent">Independent</option>
                                <option value="minimal-prompt">Minimal Prompt</option>
                                <option value="moderate-prompt">Moderate Prompt</option>
                                <option value="maximum-prompt">Maximum Prompt</option>
                                <option value="hand-over-hand">Hand-over-Hand</option>
                              </select>
                            </div>
                          )}
                          
                          {goal.measurementType === 'rating' && (
                            <div className="rating-form">
                              <label>Rating (1-5):</label>
                              <div className="rating-buttons">
                                {[1, 2, 3, 4, 5].map(rating => (
                                  <button
                                    key={rating}
                                    className="rating-btn"
                                    onClick={() => recordDataPoint(goalId, rating, 'rating')}
                                  >
                                    {rating}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="no-session">
                  <p>No active data collection session. Start a session from the dashboard.</p>
                  <button onClick={() => setView('dashboard')}>
                    🏠 Back to Dashboard
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Progress View */}
          {view === 'progress' && (
            <div className="progress-view">
              <h3>Progress Reports - {selectedStudent.name}</h3>
              <div className="progress-placeholder">
                <p>Progress tracking charts and reports will be displayed here.</p>
                <p>Feature coming soon!</p>
              </div>
            </div>
          )}
        </>
      )}

      <style>{`
        .iep-data-collection {
          padding: 1.5rem;
          background: white;
          min-height: calc(100vh - 80px);
        }

        .iep-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .component-title {
          font-size: 2rem;
          color: #2c3e50;
          margin-bottom: 0.5rem;
        }

        .component-subtitle {
          color: #7f8c8d;
          font-size: 1rem;
        }

        .student-selection {
          margin-bottom: 2rem;
        }

        .student-selection h3 {
          margin-bottom: 1rem;
          color: #34495e;
        }

        .student-cards {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem;
        }

        .student-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          padding: 1rem;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .student-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
        }

        .student-card.selected {
          background: linear-gradient(135deg, #2ecc71 0%, #3498db 100%);
          box-shadow: 0 8px 25px rgba(46, 204, 113, 0.4);
        }

        .student-photo {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .student-photo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .student-avatar {
          font-size: 1.5rem;
          font-weight: bold;
        }

        .student-info h4 {
          margin: 0 0 0.25rem 0;
          font-size: 1.1rem;
        }

        .student-info p {
          margin: 0;
          opacity: 0.9;
          font-size: 0.9rem;
        }

        .no-iep-students {
          text-align: center;
          padding: 2rem;
          background: #ecf0f1;
          border-radius: 8px;
          color: #7f8c8d;
        }

        .view-tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 2rem;
          border-bottom: 2px solid #ecf0f1;
          padding-bottom: 0.5rem;
        }

        .tab-button {
          padding: 0.75rem 1.5rem;
          border: none;
          background: transparent;
          border-radius: 8px 8px 0 0;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease;
          color: #7f8c8d;
        }

        .tab-button:hover {
          background: rgba(102, 126, 234, 0.1);
          color: #667eea;
        }

        .tab-button.active {
          background: #667eea;
          color: white;
        }

        .dashboard-view {
          background: #f8f9fa;
          border-radius: 12px;
          padding: 1.5rem;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .start-session-btn {
          background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .start-session-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(46, 204, 113, 0.4);
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 2rem;
        }

        .active-goals-summary h4,
        .recent-sessions h4 {
          margin-bottom: 1rem;
          color: #2c3e50;
        }

        .goals-list {
          display: grid;
          gap: 1rem;
        }

        .goal-summary-card {
          background: white;
          border-radius: 8px;
          padding: 1rem;
          border-left: 4px solid #667eea;
        }

        .goal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .goal-category {
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .goal-category.academic {
          background: #e3f2fd;
          color: #1565c0;
        }

        .goal-category.behavioral {
          background: #fff3e0;
          color: #ef6c00;
        }

        .goal-category.social-emotional {
          background: #f3e5f5;
          color: #7b1fa2;
        }

        .goal-category.physical {
          background: #e8f5e8;
          color: #2e7d32;
        }

        .measurement-type {
          background: #ecf0f1;
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
          font-size: 0.75rem;
          color: #2c3e50;
        }

        .goal-summary-card h5 {
          margin: 0.5rem 0;
          color: #2c3e50;
        }

        .goal-summary-card p {
          color: #7f8c8d;
          font-size: 0.9rem;
          margin-bottom: 1rem;
        }

        .quick-collect-btn {
          background: #667eea;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.2s ease;
        }

        .quick-collect-btn:hover {
          background: #5a67d8;
        }

        .goals-view {
          background: #f8f9fa;
          border-radius: 12px;
          padding: 1.5rem;
        }

        .goals-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .add-goal-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
        }

        .goals-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }

        .goal-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          position: relative;
        }

        .goal-category-badge {
          position: absolute;
          top: -10px;
          right: 20px;
          background: #667eea;
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .goal-card h4 {
          margin: 0 0 1rem 0;
          color: #2c3e50;
        }

        .goal-card p {
          margin: 0.5rem 0;
          color: #7f8c8d;
          font-size: 0.9rem;
        }

        .goal-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 1rem;
        }

        .goal-actions button {
          flex: 1;
          padding: 0.5rem;
          border: 1px solid #dee2e6;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .goal-actions button:first-child {
          background: #667eea;
          color: white;
          border-color: #667eea;
        }

        .goal-actions button:first-child:hover {
          background: #5a67d8;
        }

        .goal-actions button:last-child {
          background: white;
          color: #7f8c8d;
        }

        .goal-actions button:last-child:hover {
          background: #f8f9fa;
        }

        .no-goals {
          text-align: center;
          padding: 3rem;
          color: #7f8c8d;
        }

        .data-entry-view {
          background: #f8f9fa;
          border-radius: 12px;
          padding: 1.5rem;
        }

        .session-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .session-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .complete-session-btn {
          background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
        }

        .data-entry-forms {
          display: grid;
          gap: 2rem;
        }

        .goal-data-entry {
          background: white;
          border-radius: 8px;
          padding: 1.5rem;
          border-left: 4px solid #667eea;
        }

        .goal-data-entry h4 {
          margin: 0 0 1rem 0;
          color: #2c3e50;
        }

        .measurement-form {
          display: grid;
          gap: 1rem;
        }

        .measurement-form label {
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 0.5rem;
        }

        .measurement-form input,
        .measurement-form select {
          padding: 0.75rem;
          border: 2px solid #dee2e6;
          border-radius: 6px;
          font-size: 1rem;
          transition: border-color 0.2s ease;
        }

        .measurement-form input:focus,
        .measurement-form select:focus {
          outline: none;
          border-color: #667eea;
        }

        .rating-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .rating-btn {
          width: 3rem;
          height: 3rem;
          border: 2px solid #dee2e6;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          font-size: 1.2rem;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .rating-btn:hover {
          background: #667eea;
          color: white;
          border-color: #667eea;
        }

        .no-session {
          text-align: center;
          padding: 3rem;
          color: #7f8c8d;
        }

        .no-session button {
          background: #667eea;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          margin-top: 1rem;
        }

        .progress-view {
          background: #f8f9fa;
          border-radius: 12px;
          padding: 1.5rem;
        }

        .progress-placeholder {
          text-align: center;
          padding: 3rem;
          color: #7f8c8d;
        }

        @media (max-width: 768px) {
          .iep-data-collection {
            padding: 1rem;
          }

          .dashboard-grid {
            grid-template-columns: 1fr;
          }

          .goals-grid {
            grid-template-columns: 1fr;
          }

          .student-cards {
            grid-template-columns: 1fr;
          }

          .student-card {
            flex-direction: column;
            text-align: center;
          }

          .view-tabs {
            overflow-x: auto;
            flex-wrap: nowrap;
          }

          .tab-button {
            white-space: nowrap;
          }
        }
      `}</style>
    </div>
  );
};

export default IEPDataCollectionInterface;