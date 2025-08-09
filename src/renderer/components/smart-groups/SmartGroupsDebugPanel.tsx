// SmartGroupsDebugPanel.tsx - Floating Debug Panel for Smart Groups
// This file is TEMPORARY and will be removed before deployment

import React, { useState } from 'react';
import { Database, Eye, EyeOff, RefreshCw, X } from 'lucide-react';
import UnifiedDataService from '../../services/unifiedDataService';

export const SmartGroupsDebugPanel: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

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
        smartGroupActivities: activities.filter(a => a.linkedGoalIds?.length > 0).length,
        scheduleEntries: JSON.parse(localStorage.getItem('smartGroupSchedules') || '[]').length,
        lessonLibraryCount: JSON.parse(localStorage.getItem('lessonLibrary') || '[]').length,
        dataCollectionReminders: JSON.parse(localStorage.getItem('dataCollectionReminders') || '[]').length,
        sampleStudent: students[0] ? {
          id: students[0].id,
          name: students[0].name,
          hasIEPData: !!students[0].iepData,
          goalCount: students[0].iepData?.goals?.length || 0,
          dataPointCount: students[0].iepData?.dataCollection?.length || 0,
          hasSmartGroupsHistory: !!students[0].schedulePreferences
        } : null,
        sampleActivity: activities[0] ? {
          id: activities[0].id,
          name: activities[0].name,
          hasSmartGroupMetadata: !!activities[0].linkedGoalIds,
          isCustom: activities[0].isCustom
        } : null,
        systemStatus: {
          hasUnifiedData: !!data,
          totalGoals: students.reduce((sum, s) => sum + (s.iepData?.goals?.length || 0), 0),
          totalDataPoints: students.reduce((sum, s) => sum + (s.iepData?.dataCollection?.length || 0), 0),
          lastCheck: new Date().toLocaleTimeString()
        }
      };
      
      setDebugInfo(debugData);
      setShowDebug(true);
      
      console.log('🔍 Smart Groups Debug Info:', debugData);
      
    } catch (error) {
      const errorData = { 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        lastCheck: new Date().toLocaleTimeString()
      };
      setDebugInfo(errorData);
      setShowDebug(true);
      console.error('❌ Debug check failed:', error);
    }
  };

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
      border: '2px solid #e2e8f0',
      maxWidth: isMinimized ? '300px' : '450px',
      zIndex: 1000,
      transition: 'all 0.3s ease'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
        borderRadius: '14px 14px 0 0',
        padding: '1rem',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '50%',
            width: '2rem',
            height: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            🔍
          </div>
          <h3 style={{ 
            margin: 0, 
            fontSize: '1.1rem',
            fontWeight: '700'
          }}>
            Smart Groups Debug
          </h3>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '6px',
              padding: '0.5rem',
              cursor: 'pointer',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {isMinimized ? (
              <Eye style={{ width: '1rem', height: '1rem' }} />
            ) : (
              <EyeOff style={{ width: '1rem', height: '1rem' }} />
            )}
          </button>
          <button
            onClick={() => setIsVisible(false)}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '6px',
              padding: '0.5rem',
              cursor: 'pointer',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X style={{ width: '1rem', height: '1rem' }} />
          </button>
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div style={{ padding: '1rem' }}>
          {/* Action Buttons */}
          <div style={{ 
            display: 'flex', 
            gap: '0.5rem', 
            marginBottom: '1rem',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={runDebugCheck}
              style={{
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '0.5rem 1rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                flex: 1
              }}
            >
              <RefreshCw style={{ width: '1rem', height: '1rem' }} />
              Check Integration
            </button>
            
            {debugInfo && (
              <button
                onClick={() => setShowDebug(!showDebug)}
                style={{
                  background: 'transparent',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '0.5rem 1rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <Database style={{ width: '1rem', height: '1rem' }} />
                {showDebug ? 'Hide' : 'Show'} Details
              </button>
            )}
          </div>

          {/* Debug Results */}
          {showDebug && debugInfo && (
            <div>
              <h4 style={{ 
                margin: '0 0 0.75rem 0', 
                color: '#374151', 
                fontSize: '0.95rem',
                fontWeight: '700'
              }}>
                Integration Status:
              </h4>
              
              {debugInfo.error ? (
                <div style={{
                  background: '#fef2f2',
                  border: '2px solid #fecaca',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  color: '#dc2626',
                  fontSize: '0.875rem'
                }}>
                  <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
                    ❌ Error: {debugInfo.error}
                  </div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                    Last checked: {debugInfo.lastCheck}
                  </div>
                </div>
              ) : (
                <div style={{
                  background: '#f0fdf4',
                  border: '2px solid #bbf7d0',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  fontSize: '0.875rem'
                }}>
                  <div style={{ 
                    fontWeight: '600', 
                    color: '#166534',
                    marginBottom: '0.75rem'
                  }}>
                    System Status:
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>UnifiedDataService:</span>
                      <span style={{ fontWeight: '600' }}>
                        {debugInfo.unifiedDataExists ? '✅' : '❌'}
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Students:</span>
                      <span style={{ fontWeight: '600' }}>
                        {debugInfo.studentCount} ({debugInfo.studentsWithIEP} with IEP)
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Activities:</span>
                      <span style={{ fontWeight: '600' }}>
                        {debugInfo.activityCount} ({debugInfo.smartGroupActivities} Smart Groups)
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Schedule Entries:</span>
                      <span style={{ fontWeight: '600' }}>{debugInfo.scheduleEntries}</span>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Lesson Library:</span>
                      <span style={{ fontWeight: '600' }}>{debugInfo.lessonLibraryCount}</span>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Data Reminders:</span>
                      <span style={{ fontWeight: '600' }}>{debugInfo.dataCollectionReminders}</span>
                    </div>
                  </div>
                  
                  {debugInfo.sampleStudent && (
                    <details style={{ marginTop: '0.75rem' }}>
                      <summary style={{ 
                        cursor: 'pointer', 
                        fontWeight: '600',
                        color: '#166534',
                        fontSize: '0.875rem'
                      }}>
                        Sample Data
                      </summary>
                      <div style={{
                        background: '#f3f4f6',
                        padding: '0.5rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        marginTop: '0.5rem',
                        fontFamily: 'monospace',
                        maxHeight: '200px',
                        overflow: 'auto'
                      }}>
                        <div style={{ marginBottom: '0.5rem' }}>
                          <strong>Student Sample:</strong>
                        </div>
                        <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                          {JSON.stringify(debugInfo.sampleStudent, null, 2)}
                        </pre>
                        
                        {debugInfo.sampleActivity && (
                          <>
                            <div style={{ marginTop: '0.75rem', marginBottom: '0.5rem' }}>
                              <strong>Activity Sample:</strong>
                            </div>
                            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                              {JSON.stringify(debugInfo.sampleActivity, null, 2)}
                            </pre>
                          </>
                        )}
                      </div>
                    </details>
                  )}
                  
                  <div style={{ 
                    fontSize: '0.75rem', 
                    color: '#166534',
                    marginTop: '0.75rem',
                    textAlign: 'center',
                    opacity: 0.8
                  }}>
                    Last checked: {debugInfo.systemStatus?.lastCheck}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick Status (when details are hidden) */}
          {!showDebug && debugInfo && !debugInfo.error && (
            <div style={{
              background: '#f0f9ff',
              border: '2px solid #bfdbfe',
              borderRadius: '8px',
              padding: '0.75rem',
              fontSize: '0.875rem'
            }}>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '0.5rem',
                textAlign: 'center'
              }}>
                <div>
                  <div style={{ fontWeight: '700', color: '#1e40af' }}>
                    {debugInfo.studentCount}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#3b82f6' }}>
                    Students
                  </div>
                </div>
                <div>
                  <div style={{ fontWeight: '700', color: '#1e40af' }}>
                    {debugInfo.activityCount}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#3b82f6' }}>
                    Activities
                  </div>
                </div>
              </div>
              
              <div style={{ 
                textAlign: 'center', 
                marginTop: '0.5rem',
                fontSize: '0.75rem',
                color: '#6b7280'
              }}>
                {debugInfo.unifiedDataExists ? '✅ Connected' : '❌ Not Connected'}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
