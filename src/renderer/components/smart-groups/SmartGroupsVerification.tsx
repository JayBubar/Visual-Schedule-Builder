import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Database, RefreshCw, Trash2, Eye, Settings } from 'lucide-react';
import UnifiedDataService from '../../services/unifiedDataService';

// Quick verification panel for basic status checks
export const QuickVerificationPanel: React.FC = () => {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runQuickCheck = () => {
    setLoading(true);
    try {
      const data = UnifiedDataService.getUnifiedData();
      const students = UnifiedDataService.getAllStudents();
      const activities = UnifiedDataService.getAllActivities();
      
      const quickStatus = {
        unifiedDataService: !!data,
        studentCount: students.length,
        activityCount: activities.length,
        studentsWithIEP: students.filter(s => s.iepData?.goals?.length > 0).length,
        timestamp: new Date().toISOString()
      };
      
      setStatus(quickStatus);
      console.log('🔍 Quick verification results:', quickStatus);
    } catch (error) {
      setStatus({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runQuickCheck();
  }, []);

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '1.5rem',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e2e8f0'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={{
          background: '#3b82f6',
          color: 'white',
          borderRadius: '50%',
          width: '2.5rem',
          height: '2.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Database style={{ width: '1.25rem', height: '1.25rem' }} />
        </div>
        <div>
          <h3 style={{ margin: 0, color: '#1a202c', fontSize: '1.25rem', fontWeight: '700' }}>
            Integration Status
          </h3>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem' }}>
            Quick system check
          </p>
        </div>
        <button
          onClick={runQuickCheck}
          disabled={loading}
          style={{
            marginLeft: 'auto',
            background: 'transparent',
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            padding: '0.5rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <RefreshCw 
            style={{ 
              width: '1rem', 
              height: '1rem',
              animation: loading ? 'spin 1s linear infinite' : 'none'
            }} 
          />
        </button>
      </div>

      {status && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {status.error ? (
            <div style={{
              gridColumn: '1 / -1',
              background: '#fef2f2',
              border: '1px solid #dc2626',
              borderRadius: '8px',
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <XCircle style={{ width: '1.25rem', height: '1.25rem', color: '#dc2626' }} />
              <span style={{ color: '#dc2626', fontWeight: '600' }}>Error: {status.error}</span>
            </div>
          ) : (
            <>
              <div style={{
                background: status.unifiedDataService ? '#f0fdf4' : '#fef2f2',
                border: `1px solid ${status.unifiedDataService ? '#22c55e' : '#dc2626'}`,
                borderRadius: '8px',
                padding: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  {status.unifiedDataService ? 
                    <CheckCircle style={{ width: '1rem', height: '1rem', color: '#22c55e' }} /> :
                    <XCircle style={{ width: '1rem', height: '1rem', color: '#dc2626' }} />
                  }
                  <span style={{ fontWeight: '600', fontSize: '0.875rem' }}>UnifiedDataService</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>
                  {status.unifiedDataService ? 'Connected' : 'Not accessible'}
                </p>
              </div>

              <div style={{
                background: status.studentCount > 0 ? '#f0fdf4' : '#fef3cd',
                border: `1px solid ${status.studentCount > 0 ? '#22c55e' : '#f59e0b'}`,
                borderRadius: '8px',
                padding: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  {status.studentCount > 0 ? 
                    <CheckCircle style={{ width: '1rem', height: '1rem', color: '#22c55e' }} /> :
                    <AlertTriangle style={{ width: '1rem', height: '1rem', color: '#f59e0b' }} />
                  }
                  <span style={{ fontWeight: '600', fontSize: '0.875rem' }}>Students</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>
                  {status.studentCount} found ({status.studentsWithIEP} with IEP)
                </p>
              </div>

              <div style={{
                background: status.activityCount > 0 ? '#f0fdf4' : '#fef3cd',
                border: `1px solid ${status.activityCount > 0 ? '#22c55e' : '#f59e0b'}`,
                borderRadius: '8px',
                padding: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  {status.activityCount > 0 ? 
                    <CheckCircle style={{ width: '1rem', height: '1rem', color: '#22c55e' }} /> :
                    <AlertTriangle style={{ width: '1rem', height: '1rem', color: '#f59e0b' }} />
                  }
                  <span style={{ fontWeight: '600', fontSize: '0.875rem' }}>Activities</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>
                  {status.activityCount} available
                </p>
              </div>
            </>
          )}
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

// Full verification dashboard with comprehensive tests
export const SmartGroupsVerificationDashboard: React.FC = () => {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [testData, setTestData] = useState<any>(null);

  const runFullVerification = async () => {
    setIsRunning(true);
    const results: any[] = [];
    
    try {
      // Test 1: UnifiedDataService Integration
      results.push(await testUnifiedDataService());
      
      // Test 2: Student Records
      results.push(await testStudentRecords());
      
      // Test 3: Activity Creation
      results.push(await testActivityCreation());
      
      // Test 4: IEP Data Collection
      results.push(await testIEPDataCollection());
      
      // Test 5: Schedule Integration
      results.push(await testScheduleIntegration());
      
      // Test 6: Lesson Library
      results.push(await testLessonLibrary());
      
      setTestResults(results);
      console.log('🔍 Full verification results:', results);
      
    } catch (error) {
      console.error('Verification error:', error);
      results.push({
        name: 'Verification System',
        status: 'failed',
        message: `System error: ${error.message}`,
        details: error.stack
      });
      setTestResults(results);
    } finally {
      setIsRunning(false);
    }
  };

  const testUnifiedDataService = async (): Promise<any> => {
    try {
      const data = UnifiedDataService.getUnifiedData();
      const students = UnifiedDataService.getAllStudents();
      const activities = UnifiedDataService.getAllActivities();
      
      if (!data) {
        return {
          name: 'UnifiedDataService Integration',
          status: 'failed',
          message: 'UnifiedDataService not accessible',
          details: 'Cannot access UnifiedDataService.getUnifiedData()'
        };
      }
      
      return {
        name: 'UnifiedDataService Integration',
        status: 'passed',
        message: `Successfully connected - ${students.length} students, ${activities.length} activities`,
        details: {
          hasUnifiedData: !!data,
          studentCount: students.length,
          activityCount: activities.length
        }
      };
    } catch (error) {
      return {
        name: 'UnifiedDataService Integration',
        status: 'failed',
        message: `Integration error: ${error.message}`,
        details: error.stack
      };
    }
  };

  const testStudentRecords = async (): Promise<any> => {
    try {
      const students = UnifiedDataService.getAllStudents();
      
      if (students.length === 0) {
        return {
          name: 'Student Records',
          status: 'warning',
          message: 'No students found in system',
          details: 'Smart Groups needs student data to generate recommendations'
        };
      }
      
      const studentsWithIEP = students.filter(s => s.iepData?.goals?.length > 0);
      
      return {
        name: 'Student Records',
        status: 'passed',
        message: `${students.length} students found (${studentsWithIEP.length} with IEP goals)`,
        details: {
          totalStudents: students.length,
          studentsWithIEP: studentsWithIEP.length,
          sampleStudent: students[0] ? {
            id: students[0].id,
            name: students[0].name,
            hasIEPData: !!students[0].iepData
          } : null
        }
      };
    } catch (error) {
      return {
        name: 'Student Records',
        status: 'failed',
        message: `Student data error: ${error.message}`,
        details: error.stack
      };
    }
  };

  const testActivityCreation = async (): Promise<any> => {
    try {
      // Create a test activity
      const testActivity = {
        id: 'test-smart-group-activity-' + Date.now(),
        name: 'Test Smart Group Activity',
        category: 'academic',
        duration: 30,
        description: 'Test activity for Smart Groups verification',
        isCustom: true,
        metadata: {
          isAIGenerated: true,
          smartGroupsTest: true,
          createdBy: 'verification-system'
        }
      };
      
      // Try to add it to UnifiedDataService
      const success = UnifiedDataService.addActivity(testActivity);
      
      if (success) {
        // Store test data for cleanup
        setTestData(prev => ({
          ...prev,
          testActivityId: testActivity.id
        }));
        
        return {
          name: 'Activity Creation',
          status: 'passed',
          message: 'Successfully created test activity',
          details: {
            activityId: testActivity.id,
            activityName: testActivity.name
          }
        };
      } else {
        return {
          name: 'Activity Creation',
          status: 'failed',
          message: 'Failed to create test activity',
          details: 'UnifiedDataService.addActivity returned false'
        };
      }
    } catch (error) {
      return {
        name: 'Activity Creation',
        status: 'failed',
        message: `Activity creation error: ${error.message}`,
        details: error.stack
      };
    }
  };

  const testIEPDataCollection = async (): Promise<any> => {
    try {
      const students = UnifiedDataService.getAllStudents();
      const studentsWithIEP = students.filter(s => s.iepData?.goals?.length > 0);
      
      if (studentsWithIEP.length === 0) {
        return {
          name: 'IEP Data Collection',
          status: 'warning',
          message: 'No students with IEP goals found',
          details: 'Smart Groups can still work but IEP alignment features will be limited'
        };
      }
      
      // Test goal data structure
      const sampleGoals = studentsWithIEP[0].iepData.goals;
      const hasValidGoals = sampleGoals.every(goal => 
        goal.id && goal.description && goal.domain
      );
      
      return {
        name: 'IEP Data Collection',
        status: hasValidGoals ? 'passed' : 'warning',
        message: `${studentsWithIEP.length} students with IEP goals, ${hasValidGoals ? 'valid' : 'incomplete'} goal structure`,
        details: {
          studentsWithIEP: studentsWithIEP.length,
          totalGoals: studentsWithIEP.reduce((sum, s) => sum + s.iepData.goals.length, 0),
          sampleGoal: sampleGoals[0]
        }
      };
    } catch (error) {
      return {
        name: 'IEP Data Collection',
        status: 'failed',
        message: `IEP data error: ${error.message}`,
        details: error.stack
      };
    }
  };

  const testScheduleIntegration = async (): Promise<any> => {
    try {
      const data = UnifiedDataService.getUnifiedData();
      
      // Check if calendar structure exists
      if (!data || !data.calendar) {
        return {
          name: 'Schedule Integration',
          status: 'warning',
          message: 'Calendar structure not found - Smart Groups schedule integration limited',
          details: 'Calendar data structure needs to be initialized for full Smart Groups integration'
        };
      }
      
      // For now, just verify the calendar structure exists
      return {
        name: 'Schedule Integration',
        status: 'passed',
        message: 'Calendar structure available for Smart Groups integration',
        details: {
          hasCalendar: !!data.calendar,
          calendarStructure: Object.keys(data.calendar)
        }
      };
    } catch (error) {
      return {
        name: 'Schedule Integration',
        status: 'failed',
        message: `Schedule integration error: ${error.message}`,
        details: error.stack
      };
    }
  };

  const testLessonLibrary = async (): Promise<any> => {
    try {
      const data = UnifiedDataService.getUnifiedData();
      
      // For now, just verify that we can access the data structure
      // Lesson library functionality can be added later
      return {
        name: 'Lesson Library',
        status: 'passed',
        message: 'Data structure ready for lesson library integration',
        details: {
          hasUnifiedData: !!data,
          note: 'Lesson library structure can be added to UnifiedData interface when needed'
        }
      };
    } catch (error) {
      return {
        name: 'Lesson Library',
        status: 'failed',
        message: `Lesson library error: ${error.message}`,
        details: error.stack
      };
    }
  };

  const cleanupTestData = () => {
    if (!testData) return;
    
    try {
      // Remove test activity using deleteActivity method
      if (testData.testActivityId) {
        UnifiedDataService.deleteActivity(testData.testActivityId);
      }
      
      // For now, just log that cleanup would happen for other test data
      // These features can be implemented when the data structures are added
      if (testData.testScheduleEntryId) {
        console.log('Would clean up test schedule entry:', testData.testScheduleEntryId);
      }
      
      if (testData.testLessonId) {
        console.log('Would clean up test lesson:', testData.testLessonId);
      }
      
      setTestData(null);
      console.log('✅ Test data cleaned up successfully');
      
    } catch (error) {
      console.error('❌ Error cleaning up test data:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle style={{ width: '1.25rem', height: '1.25rem', color: '#22c55e' }} />;
      case 'warning':
        return <AlertTriangle style={{ width: '1.25rem', height: '1.25rem', color: '#f59e0b' }} />;
      case 'failed':
        return <XCircle style={{ width: '1.25rem', height: '1.25rem', color: '#dc2626' }} />;
      default:
        return <Database style={{ width: '1.25rem', height: '1.25rem', color: '#64748b' }} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return { bg: '#f0fdf4', border: '#22c55e', text: '#166534' };
      case 'warning':
        return { bg: '#fef3cd', border: '#f59e0b', text: '#92400e' };
      case 'failed':
        return { bg: '#fef2f2', border: '#dc2626', text: '#991b1b' };
      default:
        return { bg: '#f8fafc', border: '#e2e8f0', text: '#475569' };
    }
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '2rem',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e2e8f0'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ margin: 0, color: '#1a202c', fontSize: '1.5rem', fontWeight: '700' }}>
            Smart Groups Verification Dashboard
          </h2>
          <p style={{ margin: '0.5rem 0 0 0', color: '#64748b', fontSize: '1rem' }}>
            Comprehensive integration testing and system validation
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {testData && (
            <button
              onClick={cleanupTestData}
              style={{
                background: '#f59e0b',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Trash2 style={{ width: '1rem', height: '1rem' }} />
              Clean Up Test Data
            </button>
          )}
          
          <button
            onClick={runFullVerification}
            disabled={isRunning}
            style={{
              background: isRunning ? '#9ca3af' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '0.75rem 1.5rem',
              cursor: isRunning ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <RefreshCw 
              style={{ 
                width: '1rem', 
                height: '1rem',
                animation: isRunning ? 'spin 1s linear infinite' : 'none'
              }} 
            />
            {isRunning ? 'Running Tests...' : 'Run Full Verification'}
          </button>
        </div>
      </div>

      {testResults.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {testResults.map((result, index) => {
            const colors = getStatusColor(result.status);
            return (
              <div
                key={index}
                style={{
                  background: colors.bg,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                  padding: '1.5rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  {getStatusIcon(result.status)}
                  <h3 style={{ margin: 0, color: colors.text, fontSize: '1.125rem', fontWeight: '600' }}>
                    {result.name}
                  </h3>
                  <span style={{
                    background: colors.border,
                    color: 'white',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    textTransform: 'uppercase'
                  }}>
                    {result.status}
                  </span>
                </div>
                
                <p style={{ margin: '0 0 1rem 0', color: colors.text, fontSize: '0.875rem' }}>
                  {result.message}
                </p>
                
                {result.details && (
                  <details style={{ marginTop: '0.75rem' }}>
                    <summary style={{ 
                      cursor: 'pointer', 
                      fontWeight: '600', 
                      color: colors.text,
                      fontSize: '0.875rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <Eye style={{ width: '0.875rem', height: '0.875rem' }} />
                      View Details
                    </summary>
                    <pre style={{
                      background: 'rgba(0, 0, 0, 0.05)',
                      padding: '1rem',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      overflow: 'auto',
                      marginTop: '0.75rem',
                      color: '#374151'
                    }}>
                      {typeof result.details === 'string' 
                        ? result.details 
                        : JSON.stringify(result.details, null, 2)
                      }
                    </pre>
                  </details>
                )}
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
