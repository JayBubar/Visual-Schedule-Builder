// Updated IEP Data Collection Interface - Now uses Unified Data
// src/renderer/components/data-collection/IEPDataCollectionInterface.tsx

import React, { useState, useEffect } from 'react';
import UnifiedDataService, { UnifiedStudent, IEPGoal } from '../../services/unifiedDataService';
import { DataPoint } from '../../types';
import EnhancedDataEntry from './EnhancedDataEntry';
import ProgressDashboard from './ProgressDashboard';
import PrintDataSheetSystem from './PrintDataSheetSystem';
import GoalManager from './GoalManager';
import QuickDataEntry from './QuickDataEntry';

type ViewType = 'dashboard' | 'print-sheets' | 'data-entry' | 'progress' | 'goal-selection'

interface IEPDataCollectionInterfaceProps {
  isActive: boolean;
  preSelectedStudentId?: string;
}

const IEPDataCollectionInterface: React.FC<IEPDataCollectionInterfaceProps> = ({ isActive, preSelectedStudentId }) => {
  const [students, setStudents] = useState<UnifiedStudent[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<UnifiedStudent | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<any>(null);
  const [needsGoalSelection, setNeedsGoalSelection] = useState(false);
  const [view, setView] = useState<ViewType>('dashboard');
  const [systemStatus, setSystemStatus] = useState<any>(null);
  
  // Modal states for Quick Entry and Print Sheets
  const [showQuickEntry, setShowQuickEntry] = useState(false);
  const [showPrintSheets, setShowPrintSheets] = useState(false);

  // Load data on component mount
  useEffect(() => {
    loadUnifiedData();
    checkSystemStatus();
  }, []);

  const loadUnifiedData = () => {
    try {
      const unifiedStudents = UnifiedDataService.getAllStudents();
      
      // Ensure all students have properly initialized iepData
      const safeStudents = unifiedStudents.map(student => ({
        ...student,
        iepData: {
          goals: student.iepData?.goals || [],
          dataCollection: student.iepData?.dataCollection || [],
          progressAnalytics: student.iepData?.progressAnalytics
        }
      }));
      
      setStudents(safeStudents);
      
      // If we have a preSelectedStudentId, select that student
      if (preSelectedStudentId && safeStudents.length > 0) {
        const preSelectedStudent = safeStudents.find(s => s.id === preSelectedStudentId);
        if (preSelectedStudent) {
          setSelectedStudent(preSelectedStudent);
          return;
        }
      }
      
      // If we have students but no selected student, select the first one
      if (safeStudents.length > 0 && !selectedStudent) {
        setSelectedStudent(safeStudents[0]);
      }
    } catch (error) {
      console.error('Error loading unified data:', error);
    }
  };

  const checkSystemStatus = () => {
    const status = UnifiedDataService.getSystemStatus();
    setSystemStatus(status);
    console.log('System Status:', status);
  };

  // Event handlers
  const handleStudentSelect = (student: any) => {
    setSelectedStudent(student);
    
    // Get active goals for this student - FIX: Use isActive instead of status
    const activeGoals = student.iepData?.goals?.filter((g: any) => g.isActive === true) || [];
    
    console.log('🎯 Student selected:', student.name);
    console.log('🎯 Total goals:', student.iepData?.goals?.length || 0);
    console.log('🎯 Active goals found:', activeGoals.length);
    console.log('🎯 Active goals:', activeGoals);
    
    if (activeGoals.length === 0) {
      alert(`${student.name} doesn't have any active IEP goals. Please add goals first in Goal Management.`);
      setView('goal-selection'); // Send them to goal manager
      return;
    }
    
    if (activeGoals.length === 1) {
      // Only one goal - auto-select it and go to data entry
      setSelectedGoal(activeGoals[0]);
      setNeedsGoalSelection(false);
      console.log('🎯 Auto-selected single goal:', activeGoals[0].title || activeGoals[0].description);
      // Don't change view yet - let them click Data Entry tab
    } else {
      // Multiple goals - they'll need to select one
      setSelectedGoal(null);
      setNeedsGoalSelection(true);
      console.log('🎯 Multiple goals found, user needs to select one');
    }
  };

  const handleGoalSelect = (goal: IEPGoal) => {
    setSelectedGoal(goal);
  };

  const handleDataSaved = () => {
    // Refresh data after saving
    loadUnifiedData();
    
    // Update selected student data
    if (selectedStudent) {
      const updatedStudent = UnifiedDataService.getStudent(selectedStudent.id);
      if (updatedStudent) {
        setSelectedStudent(updatedStudent);
      }
    }
  };

  const handleGoalAdded = (goalData: Omit<IEPGoal, 'id' | 'studentId'>) => {
    if (selectedStudent) {
      try {
        const newGoal = UnifiedDataService.addGoalToStudent(selectedStudent.id, goalData);
        loadUnifiedData(); // Refresh all data
        setSelectedGoal(newGoal); // Select the new goal
      } catch (error) {
        console.error('Error adding goal:', error);
        alert('Error adding goal. Please try again.');
      }
    }
  };

  const getStudentInitials = (name: string): string => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Goal Selection Component
  const GoalSelectionView = () => {
    if (!selectedStudent) return null;
    
    const activeGoals = selectedStudent.iepData?.goals?.filter((g: any) => g.isActive === true) || [];
    
    return (
      <div style={{ color: 'white', padding: '2rem' }}>
        <h2 style={{ marginBottom: '2rem', fontSize: '1.5rem' }}>
          Select Goal for Data Entry - {selectedStudent.name}
        </h2>
        
        <div style={{ display: 'grid', gap: '1rem' }}>
          {activeGoals.map((goal: any) => (
            <div
              key={goal.id}
              onClick={() => {
                setSelectedGoal(goal);
                setNeedsGoalSelection(false);
                setView('data-entry'); // Auto-switch to data entry
              }}
              style={{
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(20px)',
                borderRadius: '12px',
                padding: '1.5rem',
                border: '1px solid rgba(255,255,255,0.2)',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    color: '#60a5fa', 
                    fontWeight: '600', 
                    marginBottom: '0.5rem' 
                  }}>
                    {goal.domain}
                  </div>
                  <h3 style={{ 
                    fontSize: '1.1rem', 
                    fontWeight: '600', 
                    marginBottom: '1rem',
                    lineHeight: '1.4'
                  }}>
                    {goal.description}
                  </h3>
                  <div style={{ 
                    display: 'flex', 
                    gap: '2rem', 
                    fontSize: '0.9rem',
                    opacity: 0.8
                  }}>
                    <span>Current: {goal.currentProgress}%</span>
                    <span>Target: {goal.targetCriteria}%</span>
                    <span>Type: {goal.measurementType}</span>
                  </div>
                </div>
                <div style={{ 
                  color: 'rgba(255,255,255,0.6)',
                  fontSize: '0.9rem',
                  textAlign: 'right'
                }}>
                  Click to enter data →
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (!isActive) return null;

  return (
    <div style={{
      height: '100vh',
      overflow: 'auto',
      background: 'linear-gradient(135deg, #2563eb 0%, #9333ea 50%, #2563eb 100%)',
      padding: '1.5rem'
    }}>
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
        {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '2rem',
        color: 'white'
      }}>
        <h1 style={{
          fontSize: '3rem',
          fontWeight: 'bold',
          marginBottom: '0.5rem',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>
          📊 IEP Data Collection
        </h1>
        <p style={{
          fontSize: '1.2rem',
          opacity: 0.9
        }}>
          Professional data collection with unified student records
        </p>
        
        {/* System Status Indicator */}
        {systemStatus && (
          <div style={{
            display: 'inline-block',
            background: systemStatus.hasUnifiedData 
              ? 'rgba(34, 197, 94, 0.2)' 
              : 'rgba(239, 68, 68, 0.2)',
            padding: '8px 16px',
            borderRadius: '20px',
            marginTop: '10px',
            border: `1px solid ${systemStatus.hasUnifiedData ? '#22c55e' : '#ef4444'}`,
            color: systemStatus.hasUnifiedData ? '#22c55e' : '#ef4444'
          }}>
            {systemStatus.hasUnifiedData ? '✅ Unified Data Active' : '⚠️ Legacy Data Mode'}
            {systemStatus.hasUnifiedData && (
              <span style={{ marginLeft: '10px', fontSize: '0.9em' }}>
                {systemStatus.totalStudents} students • {systemStatus.totalGoals} goals • {systemStatus.totalDataPoints} data points
              </span>
            )}
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '2rem'
      }}>
        <div style={{
          display: 'flex',
          background: 'rgba(255,255,255,0.2)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          padding: '8px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          {[
            { id: 'dashboard', icon: '🏠', label: 'Dashboard' },
            { 
              id: 'data-entry', 
              icon: '📝', 
              label: selectedStudent && selectedGoal 
                ? 'Data Entry ✅' 
                : selectedStudent 
                  ? 'Data Entry ⚠️' 
                  : 'Data Entry'
            },
            { id: 'progress', icon: '📈', label: 'Progress' },
            { id: 'goal-selection', icon: '🎯', label: 'Goal Manager' },
            { id: 'print-sheets', icon: '🖨️', label: 'Print Sheets' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setView(tab.id as ViewType)}
              style={{
                padding: '12px 24px',
                borderRadius: '12px',
                border: 'none',
                fontWeight: '600',
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: view === tab.id 
                  ? 'rgba(255,255,255,0.9)' 
                  : 'transparent',
                color: view === tab.id 
                  ? '#667eea' 
                  : 'white',
                transform: view === tab.id ? 'scale(1.05)' : 'scale(1)'
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        background: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: '2rem',
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        
        {/* Student Selection */}
        {students.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: 'white', marginBottom: '1rem' }}>Select Student:</h3>
            <div style={{
              display: 'flex',
              gap: '1rem',
              flexWrap: 'wrap'
            }}>
              {students.map(student => (
                <button
                  key={student.id}
                  onClick={() => handleStudentSelect(student)}
                  style={{
                    padding: '1rem',
                    borderRadius: '12px',
                    border: selectedStudent?.id === student.id 
                      ? '3px solid #22c55e' 
                      : '2px solid rgba(255,255,255,0.3)',
                    background: selectedStudent?.id === student.id
                      ? 'rgba(34, 197, 94, 0.2)'
                      : 'rgba(255,255,255,0.1)',
                    color: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {student.photo ? (
                    <img 
                      src={student.photo} 
                      alt={student.name}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: '#667eea',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2rem',
                      fontWeight: 'bold'
                    }}>
                      {getStudentInitials(student.name)}
                    </div>
                  )}
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 'bold' }}>{student.name}</div>
                    <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>{student.grade}</div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>
                      {student.iepData?.goals?.length || 0} goals • {student.iepData?.dataCollection?.length || 0} data points
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content based on selected view */}
        {view === 'dashboard' && (
          <div style={{ color: 'white' }}>
            <h2 style={{ marginBottom: '1rem' }}>📊 Dashboard</h2>
            {selectedStudent ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                  <h3>Student: {selectedStudent.name}</h3>
                  
                  {/* Quick Action Buttons */}
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                      onClick={() => setShowQuickEntry(true)}
                      style={{
                        padding: '0.75rem 1.5rem',
                        borderRadius: '12px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: 'bold',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      📊 Quick Data Entry
                    </button>
                    
                    <button
                      onClick={() => setShowPrintSheets(true)}
                      style={{
                        padding: '0.75rem 1.5rem',
                        borderRadius: '12px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: 'bold',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      🖨️ Print Sheets
                    </button>
                  </div>
                </div>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem',
                  marginTop: '1rem'
                }}>
                  <div style={{
                    background: 'rgba(255,255,255,0.1)',
                    padding: '1rem',
                    borderRadius: '12px'
                  }}>
                    <h4>🎯 Active Goals</h4>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                      {selectedStudent.iepData?.goals?.filter(g => g.isActive)?.length || 0}
                    </div>
                  </div>
                  <div style={{
                    background: 'rgba(255,255,255,0.1)',
                    padding: '1rem',
                    borderRadius: '12px'
                  }}>
                    <h4>📝 Data Points</h4>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                      {selectedStudent.iepData?.dataCollection?.length || 0}
                    </div>
                  </div>
                  <div style={{
                    background: 'rgba(255,255,255,0.1)',
                    padding: '1rem',
                    borderRadius: '12px'
                  }}>
                    <h4>📈 Total Goals</h4>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                      {selectedStudent.iepData?.goals?.length || 0}
                    </div>
                  </div>
                </div>
                
                {/* Recent Goals */}
                <div style={{ marginTop: '2rem' }}>
                  <h3>Recent Goals:</h3>
                  {selectedStudent.iepData?.goals?.length > 0 ? (
                    selectedStudent.iepData.goals.slice(0, 3).map(goal => (
                      <div key={goal.id} style={{
                        background: 'rgba(255,255,255,0.1)',
                        padding: '1rem',
                        marginBottom: '0.5rem',
                        borderRadius: '8px',
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        setSelectedGoal(goal);
                        setView('data-entry');
                      }}>
                        <div style={{ fontWeight: 'bold' }}>{goal.description}</div>
                        <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                          {goal.domain} • {goal.isActive ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{
                      background: 'rgba(255,255,255,0.1)',
                      padding: '2rem',
                      borderRadius: '8px',
                      textAlign: 'center',
                      opacity: 0.7
                    }}>
                      <p>No goals found for this student.</p>
                      <p style={{ fontSize: '0.9rem' }}>Add goals in the Goal Manager section.</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <h3>Select a student to view their dashboard</h3>
              </div>
            )}
          </div>
        )}

        {view === 'data-entry' && (
          <>
            {!selectedStudent && (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'white' }}>
                <h3>Please select a student first</h3>
                <p>Choose a student from the list above to begin data entry</p>
              </div>
            )}
            
            {selectedStudent && needsGoalSelection && (
              <GoalSelectionView />
            )}
            
            {selectedStudent && !needsGoalSelection && !selectedGoal && (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'white' }}>
                <h3>No active goals found</h3>
                <p>{selectedStudent.name} needs active IEP goals before data entry can begin.</p>
                <button
                  onClick={() => setView('goal-selection')}
                  style={{
                    marginTop: '1rem',
                    padding: '12px 24px',
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  Add Goals in Goal Manager
                </button>
              </div>
            )}
            
            {selectedStudent && selectedGoal && (
              <EnhancedDataEntry
                selectedStudent={selectedStudent}
                selectedGoal={selectedGoal}
                onBack={() => {
                  setSelectedGoal(null);
                  setView('dashboard');
                }}
                onDataSaved={() => {
                  // Refresh student data after saving
                  const updatedStudents = students.map(s => 
                    s.id === selectedStudent.id 
                      ? UnifiedDataService.getStudent(s.id) 
                      : s
                  );
                  setStudents(updatedStudents);
                  alert('Data saved successfully!');
                }}
              />
            )}
          </>
        )}

        {view === 'progress' && selectedStudent && (
          <div style={{ color: 'white', textAlign: 'center', padding: '3rem' }}>
            <h3>📈 Progress Dashboard</h3>
            <p>Progress tracking component will be integrated with unified data system.</p>
          </div>
        )}

        {view === 'goal-selection' && (
          <GoalManager />
        )}

        {view === 'print-sheets' && selectedStudent && (
          <div style={{ color: 'white', textAlign: 'center', padding: '3rem' }}>
            <h3>🖨️ Print Data Sheets</h3>
            <p>Print functionality component will be integrated with unified data system.</p>
          </div>
        )}

        {/* No students message */}
        {students.length === 0 && (
          <div style={{
            textAlign: 'center',
            color: 'white',
            padding: '3rem'
          }}>
            <h2>No Students Found</h2>
            <p>Add students in the Student Management section to begin IEP data collection.</p>
            {systemStatus && !systemStatus.hasUnifiedData && (
              <div style={{
                marginTop: '2rem',
                padding: '1rem',
                background: 'rgba(239, 68, 68, 0.2)',
                borderRadius: '12px',
                border: '1px solid #ef4444'
              }}>
                <h3>⚠️ Migration Required</h3>
                <p>It looks like you have data in the old format. Please run the data migration to use the new unified system.</p>
              </div>
            )}
          </div>
        )}
      </div>
      </div>

      {/* Quick Data Entry Modal */}
      {showQuickEntry && selectedStudent && (
        <QuickDataEntry
          studentId={selectedStudent.id}
          isOpen={showQuickEntry}
          onClose={() => setShowQuickEntry(false)}
          onDataSaved={() => {
            handleDataSaved();
            setShowQuickEntry(false);
          }}
        />
      )}

      {/* Print Data Sheets Modal */}
      {showPrintSheets && selectedStudent && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            width: '95vw',
            height: '95vh',
            overflow: 'hidden',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowPrintSheets(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                zIndex: 1001,
                background: 'rgba(0,0,0,0.7)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                cursor: 'pointer',
                fontSize: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ×
            </button>
            <PrintDataSheetSystem
              students={[selectedStudent]}
              goals={selectedStudent.iepData?.goals || []}
              onBack={() => setShowPrintSheets(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default IEPDataCollectionInterface;
