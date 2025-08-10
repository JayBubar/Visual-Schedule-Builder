import React, { useState } from 'react';
import UnifiedDataService from '../../services/unifiedDataService';

export const SmartGroupsDebugPanel: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [showDebug, setShowDebug] = useState(false);

  const runDebugCheck = () => {
    try {
      const data = UnifiedDataService.getUnifiedData();
      const students = UnifiedDataService.getAllStudents();
      const activities = UnifiedDataService.getAllActivities();
      
      const debugData = {
        timestamp: new Date().toISOString(),
        unifiedDataExists: !!data,
        studentCount: students.length,
        activityCount: activities.length,
        studentsWithIEP: students.filter(s => s.iepData?.goals?.length > 0).length,
        smartGroupActivities: activities.filter(a => a.name.includes('Smart Group') || a.description?.includes('AI')).length,
        scheduleEntries: data?.calendar ? Object.keys(data.calendar).length : 0,
        lessonLibraryCount: 0, // Not implemented yet
        sampleStudent: students[0] ? {
          id: students[0].id,
          name: students[0].name,
          hasIEPData: !!students[0].iepData,
          goalCount: students[0].iepData?.goals?.length || 0,
          hasSmartGroupsHistory: false // Not implemented yet
        } : null,
        sampleActivity: activities[0] ? {
          id: activities[0].id,
          name: activities[0].name,
          hasSmartGroupMetadata: activities[0].name.includes('Smart Group') || activities[0].description?.includes('AI')
        } : null
      };
      
      setDebugInfo(debugData);
      setShowDebug(true);
      
      console.log('🔍 Smart Groups Debug Info:', debugData);
      
    } catch (error) {
      setDebugInfo({ error: error.message });
      setShowDebug(true);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: 'white',
      borderRadius: '12px',
      padding: '1rem',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
      border: '2px solid #e2e8f0',
      maxWidth: '400px',
      zIndex: 1000
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={{
          background: '#8b5cf6',
          color: 'white',
          borderRadius: '50%',
          width: '2rem',
          height: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          🔍
        </div>
        <h3 style={{ margin: 0, color: '#1a202c', fontSize: '1.1rem' }}>
          Smart Groups Debug
        </h3>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <button
          onClick={runDebugCheck}
          style={{
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '0.5rem 1rem',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '600'
          }}
        >
          Check Integration
        </button>
        
        {debugInfo && (
          <button
            onClick={() => setShowDebug(!showDebug)}
            style={{
              background: 'transparent',
              border: '2px solid #e5e7eb',
              borderRadius: '6px',
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '600',
              color: '#374151'
            }}
          >
            {showDebug ? 'Hide' : 'Show'} Details
          </button>
        )}
      </div>

      {showDebug && debugInfo && (
        <div>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#374151', fontSize: '0.9rem' }}>
            Integration Status:
          </h4>
          
          {debugInfo.error ? (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #dc2626',
              borderRadius: '6px',
              padding: '0.75rem',
              color: '#dc2626',
              fontSize: '0.8rem'
            }}>
              ❌ Error: {debugInfo.error}
            </div>
          ) : (
            <div style={{
              background: '#f0fdf4',
              border: '1px solid #22c55e',
              borderRadius: '6px',
              padding: '0.75rem',
              fontSize: '0.8rem'
            }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>Data Status:</strong>
              </div>
              <div>• UnifiedDataService: {debugInfo.unifiedDataExists ? '✅' : '❌'}</div>
              <div>• Students: {debugInfo.studentCount} ({debugInfo.studentsWithIEP} with IEP)</div>
              <div>• Activities: {debugInfo.activityCount} ({debugInfo.smartGroupActivities} Smart Groups)</div>
              <div>• Schedule Entries: {debugInfo.scheduleEntries}</div>
              <div>• Lesson Library: {debugInfo.lessonLibraryCount}</div>
              
              {debugInfo.sampleStudent && (
                <details style={{ marginTop: '0.5rem' }}>
                  <summary style={{ cursor: 'pointer', fontWeight: '600' }}>
                    Sample Data
                  </summary>
                  <pre style={{
                    background: '#f3f4f6',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    overflow: 'auto',
                    marginTop: '0.5rem'
                  }}>
                    {JSON.stringify({ 
                      student: debugInfo.sampleStudent, 
                      activity: debugInfo.sampleActivity 
                    }, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
