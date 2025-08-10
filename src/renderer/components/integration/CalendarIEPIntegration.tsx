// Calendar-IEP Integration Bridge Component
// This component provides seamless integration between Calendar and IEP systems

import React, { useState, useEffect } from 'react';

// Types for Calendar-IEP Integration
interface CalendarIEPBridge {
  selectedStudent: string | null;
  relevantGoals: IEPGoal[];
  todayActivities: Activity[];
  quickDataEntry: boolean;
}

interface IEPGoal {
  id: string;
  studentId: string;
  category: string;
  description: string;
  targetCriteria: string;
  measurementType: 'frequency' | 'accuracy' | 'duration' | 'independence' | 'rating';
  currentProgress: number;
  lastDataEntry?: string;
  relatedActivityTypes?: string[];
}

interface Activity {
  id: string;
  name: string;
  type: string;
  scheduledTime: string;
  assignedStudents: string[];
  iepGoalOpportunities?: string[]; // IEP goals this activity can address
}

interface CalendarIEPIntegrationProps {
  currentView: 'calendar' | 'iep';
  selectedDate: string;
  onNavigateToIEP: (studentId: string, goalId?: string) => void;
  onNavigateToCalendar: (date: string) => void;
  onQuickDataEntry: (goalId: string, value: any) => void;
}

const CalendarIEPIntegration: React.FC<CalendarIEPIntegrationProps> = ({
  currentView,
  selectedDate,
  onNavigateToIEP,
  onNavigateToCalendar,
  onQuickDataEntry
}) => {
  const [bridgeData, setBridgeData] = useState<CalendarIEPBridge>({
    selectedStudent: null,
    relevantGoals: [],
    todayActivities: [],
    quickDataEntry: false
  });

  const [showQuickEntry, setShowQuickEntry] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<IEPGoal | null>(null);

  // Load relevant data based on current context
  useEffect(() => {
    loadIntegrationData();
  }, [selectedDate, currentView]);

  const loadIntegrationData = () => {
    try {
      const schedules = JSON.parse(localStorage.getItem('schedules') || '[]');
      const todaySchedule = schedules.find((s: any) => s.date === selectedDate);
      
      if (todaySchedule) {
        const activities = todaySchedule.activities || [];
        
        // Get relevant goals using the utility function
        const { getRelevantGoalsForDate } = require('../../utils/activityGoalMapping');
        const relevantGoals = getRelevantGoalsForDate(selectedDate);

        setBridgeData({
          selectedStudent: null,
          relevantGoals,
          todayActivities: activities,
          quickDataEntry: false
        });
      }
    } catch (error) {
      console.error('Error loading integration data:', error);
      setBridgeData({
        selectedStudent: null,
        relevantGoals: [],
        todayActivities: [],
        quickDataEntry: false
      });
    }
  };

  const handleQuickDataEntry = (goal: IEPGoal, value: any) => {
    try {
      // Use the utility function for consistent data entry
      const { saveQuickDataEntry } = require('../../utils/activityGoalMapping');
      saveQuickDataEntry(goal.id, goal.studentId, value, selectedDate);

      onQuickDataEntry(goal.id, value);
      setShowQuickEntry(false);
      setSelectedGoal(null);
      loadIntegrationData(); // Refresh data after entry
    } catch (error) {
      console.error('Quick data entry failed:', error);
    }
  };

  return (
    <div className="calendar-iep-integration">
      {/* Navigation Bridge */}
      <div className="integration-header">
        <div className="view-navigation">
          <button 
            className={`nav-button ${currentView === 'calendar' ? 'active' : ''}`}
            onClick={() => onNavigateToCalendar(selectedDate)}
          >
            📅 Calendar View
          </button>
          <button 
            className={`nav-button ${currentView === 'iep' ? 'active' : ''}`}
            onClick={() => onNavigateToIEP('', '')}
          >
            📊 IEP Data
          </button>
        </div>
        
        <div className="date-context">
          <span className="current-date">{new Date(selectedDate).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Calendar View Integration */}
      {currentView === 'calendar' && (
        <div className="calendar-iep-overlay">
          {bridgeData.relevantGoals.length > 0 && (
            <div className="relevant-goals-panel">
              <h3>🎯 Today's IEP Goal Opportunities</h3>
              <div className="goals-grid">
                {bridgeData.relevantGoals.map(goal => (
                  <div key={goal.id} className="goal-card">
                    <div className="goal-header">
                      <span className="goal-category">{goal.category}</span>
                      <span className="goal-progress">{goal.currentProgress}%</span>
                    </div>
                    <p className="goal-description">{goal.description}</p>
                    <div className="goal-actions">
                      <button 
                        className="quick-entry-btn"
                        onClick={() => {
                          setSelectedGoal(goal);
                          setShowQuickEntry(true);
                        }}
                      >
                        ⚡ Quick Entry
                      </button>
                      <button 
                        className="view-details-btn"
                        onClick={() => onNavigateToIEP(goal.studentId, goal.id)}
                      >
                        📝 Full Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Today's Activities with IEP Context */}
          <div className="activities-iep-context">
            <h3>📋 Today's Schedule with Goal Context</h3>
            {bridgeData.todayActivities.map(activity => {
              const relatedGoals = bridgeData.relevantGoals.filter(goal =>
                goal.relatedActivityTypes?.includes(activity.type)
              );
              
              return (
                <div key={activity.id} className="activity-goal-card">
                  <div className="activity-header">
                    <h4>{activity.name}</h4>
                    <span className="activity-time">{activity.scheduledTime}</span>
                  </div>
                  {relatedGoals.length > 0 && (
                    <div className="activity-goals">
                      <span className="goals-label">🎯 Goal Opportunities:</span>
                      {relatedGoals.map(goal => (
                        <span key={goal.id} className="goal-tag">
                          {goal.category}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* IEP View Integration */}
      {currentView === 'iep' && (
        <div className="iep-calendar-overlay">
          <div className="calendar-context-panel">
            <h3>📅 Calendar Context</h3>
            <button 
              className="view-today-schedule"
              onClick={() => onNavigateToCalendar(selectedDate)}
            >
              View Today's Schedule
            </button>
            
            {bridgeData.todayActivities.length > 0 && (
              <div className="todays-activities-summary">
                <h4>Today's Activities:</h4>
                <ul>
                  {bridgeData.todayActivities.slice(0, 3).map(activity => (
                    <li key={activity.id}>{activity.name}</li>
                  ))}
                  {bridgeData.todayActivities.length > 3 && (
                    <li>...and {bridgeData.todayActivities.length - 3} more</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Data Entry Modal */}
      {showQuickEntry && selectedGoal && (
        <div className="quick-entry-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>⚡ Quick Data Entry</h3>
              <button 
                className="close-btn"
                onClick={() => setShowQuickEntry(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="goal-context">
              <h4>{selectedGoal.description}</h4>
              <p>Target: {selectedGoal.targetCriteria}</p>
            </div>

            <div className="quick-entry-form">
              {selectedGoal.measurementType === 'accuracy' && (
                <div className="accuracy-entry">
                  <label>Percentage Correct:</label>
                  <div className="percentage-buttons">
                    {[0, 25, 50, 75, 100].map(percent => (
                      <button 
                        key={percent}
                        className="percentage-btn"
                        onClick={() => handleQuickDataEntry(selectedGoal, percent)}
                      >
                        {percent}%
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedGoal.measurementType === 'independence' && (
                <div className="independence-entry">
                  <label>Independence Level:</label>
                  <div className="level-buttons">
                    {[
                      { level: 1, label: 'Full Prompt' },
                      { level: 2, label: 'Partial Prompt' },
                      { level: 3, label: 'Gestural Prompt' },
                      { level: 4, label: 'Verbal Prompt' },
                      { level: 5, label: 'Independent' }
                    ].map(({ level, label }) => (
                      <button 
                        key={level}
                        className="level-btn"
                        onClick={() => handleQuickDataEntry(selectedGoal, level)}
                      >
                        {level} - {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedGoal.measurementType === 'frequency' && (
                <div className="frequency-entry">
                  <label>Frequency Count:</label>
                  <div className="frequency-buttons">
                    {[0, 1, 2, 3, 4, 5, '5+'].map(count => (
                      <button 
                        key={count}
                        className="frequency-btn"
                        onClick={() => handleQuickDataEntry(selectedGoal, count === '5+' ? 6 : count)}
                      >
                        {count}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .calendar-iep-integration {
          position: relative;
          z-index: 10;
        }

        .integration-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          margin-bottom: 1rem;
        }

        .view-navigation {
          display: flex;
          gap: 0.5rem;
        }

        .nav-button {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .nav-button:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
        }

        .nav-button.active {
          background: rgba(59, 130, 246, 0.8);
          color: white;
        }

        .current-date {
          font-weight: bold;
          color: white;
        }

        .relevant-goals-panel {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 1rem;
        }

        .relevant-goals-panel h3 {
          color: white;
          margin-bottom: 1rem;
          font-size: 1.2rem;
        }

        .goals-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1rem;
        }

        .goal-card {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 8px;
          padding: 1rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .goal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .goal-category {
          background: rgba(59, 130, 246, 0.8);
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.8rem;
        }

        .goal-progress {
          font-weight: bold;
          color: #10b981;
        }

        .goal-description {
          color: white;
          margin: 0.5rem 0;
          font-size: 0.9rem;
        }

        .goal-actions {
          display: flex;
          gap: 0.5rem;
        }

        .quick-entry-btn, .view-details-btn {
          padding: 0.5rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.8rem;
          transition: all 0.3s ease;
        }

        .quick-entry-btn {
          background: #10b981;
          color: white;
        }

        .view-details-btn {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .quick-entry-btn:hover, .view-details-btn:hover {
          transform: translateY(-2px);
        }

        .activities-iep-context {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          padding: 1.5rem;
        }

        .activities-iep-context h3 {
          color: white;
          margin-bottom: 1rem;
        }

        .activity-goal-card {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 0.5rem;
        }

        .activity-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: white;
        }

        .activity-goals {
          margin-top: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .goals-label {
          color: #10b981;
          font-size: 0.8rem;
        }

        .goal-tag {
          background: rgba(59, 130, 246, 0.6);
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.7rem;
        }

        .quick-entry-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal-content {
          background: rgba(30, 41, 59, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 16px;
          padding: 2rem;
          max-width: 500px;
          width: 90%;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          color: white;
        }

        .close-btn {
          background: none;
          border: none;
          color: white;
          font-size: 1.5rem;
          cursor: pointer;
        }

        .goal-context {
          margin-bottom: 1.5rem;
          color: white;
        }

        .goal-context h4 {
          margin-bottom: 0.5rem;
        }

        .percentage-buttons, .level-buttons, .frequency-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }

        .percentage-btn, .level-btn, .frequency-btn {
          padding: 0.75rem 1rem;
          border: none;
          border-radius: 8px;
          background: rgba(59, 130, 246, 0.8);
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          flex: 1;
          min-width: 80px;
        }

        .percentage-btn:hover, .level-btn:hover, .frequency-btn:hover {
          background: rgba(59, 130, 246, 1);
          transform: translateY(-2px);
        }

        .level-btn {
          flex: none;
          min-width: 120px;
          font-size: 0.9rem;
        }

        .iep-calendar-overlay {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          padding: 1.5rem;
        }

        .calendar-context-panel h3 {
          color: white;
          margin-bottom: 1rem;
        }

        .view-today-schedule {
          background: rgba(59, 130, 246, 0.8);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          margin-bottom: 1rem;
          transition: all 0.3s ease;
        }

        .view-today-schedule:hover {
          background: rgba(59, 130, 246, 1);
          transform: translateY(-2px);
        }

        .todays-activities-summary {
          color: white;
        }

        .todays-activities-summary h4 {
          margin-bottom: 0.5rem;
        }

        .todays-activities-summary ul {
          list-style: none;
          padding: 0;
        }

        .todays-activities-summary li {
          padding: 0.25rem 0;
          color: rgba(255, 255, 255, 0.8);
        }
      `}</style>
    </div>
  );
};

export default CalendarIEPIntegration;