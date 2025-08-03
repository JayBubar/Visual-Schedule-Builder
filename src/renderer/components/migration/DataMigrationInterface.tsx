import React, { useState, useEffect } from 'react';
import { DataMigrationManager, UnifiedDataAccess } from '../../utils/dataMigration';

interface MigrationResult {
  success: boolean;
  message: string;
  migratedStudents: number;
  preservedDataPoints: number;
  errors: string[];
}

interface DataMigrationInterfaceProps {
  onMigrationComplete?: (success: boolean) => void;
}

const DataMigrationInterface: React.FC<DataMigrationInterfaceProps> = ({ onMigrationComplete }) => {
  const [migrationStatus, setMigrationStatus] = useState<'idle' | 'checking' | 'ready' | 'migrating' | 'completed' | 'error'>('idle');
  const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null);
  const [migrationLog, setMigrationLog] = useState<string[]>([]);
  const [showLog, setShowLog] = useState(false);
  const [dataPreview, setDataPreview] = useState<any>(null);
  const [confirmMigration, setConfirmMigration] = useState(false);

  useEffect(() => {
    checkMigrationStatus();
  }, []);

  const checkMigrationStatus = () => {
    setMigrationStatus('checking');
    
    try {
      const isMigrationNeeded = DataMigrationManager.isMigrationNeeded();
      const existingUnifiedData = DataMigrationManager.getUnifiedData();
      const migrationLog = DataMigrationManager.getMigrationLog();
      
      setMigrationLog(migrationLog);
      
      if (existingUnifiedData && !isMigrationNeeded) {
        setMigrationStatus('completed');
        setMigrationResult({
          success: true,
          message: 'Data migration already completed',
          migratedStudents: Object.keys(existingUnifiedData.students).length,
          preservedDataPoints: Object.values(existingUnifiedData.students)
            .reduce((total, student) => total + student.iepData.dataPoints.length, 0),
          errors: []
        });
      } else {
        setMigrationStatus('ready');
        loadDataPreview();
      }
    } catch (error) {
      setMigrationStatus('error');
      console.error('Error checking migration status:', error);
    }
  };

  const loadDataPreview = () => {
    try {
      // Load current data for preview
      const students = localStorage.getItem('students');
      const iepGoals = localStorage.getItem('iepGoals');
      const iepDataPoints = localStorage.getItem('iepDataPoints');
      const staff = localStorage.getItem('staff_members');
      
      const preview = {
        students: students ? JSON.parse(students).length : 0,
        goals: iepGoals ? JSON.parse(iepGoals).length : 0,
        dataPoints: iepDataPoints ? JSON.parse(iepDataPoints).length : 0,
        staff: staff ? JSON.parse(staff).length : 0,
        storageKeys: []
      };

      // Count all relevant localStorage keys
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
          key.includes('student') || 
          key.includes('iep') || 
          key.includes('goal') || 
          key.includes('data') ||
          key.includes('calendar') ||
          key.includes('staff')
        )) {
          preview.storageKeys.push(key);
        }
      }

      setDataPreview(preview);
    } catch (error) {
      console.error('Error loading data preview:', error);
    }
  };

  const runMigration = async () => {
    if (!confirmMigration) {
      alert('Please confirm that you want to proceed with the migration by checking the confirmation box.');
      return;
    }

    setMigrationStatus('migrating');
    setMigrationResult(null);

    try {
      const result = await DataMigrationManager.migrateToUnifiedArchitecture();
      setMigrationResult(result);
      setMigrationStatus(result.success ? 'completed' : 'error');
      
      // Refresh migration log
      const updatedLog = DataMigrationManager.getMigrationLog();
      setMigrationLog(updatedLog);

      onMigrationComplete?.(result.success);
    } catch (error) {
      const errorResult: MigrationResult = {
        success: false,
        message: `Migration failed: ${error}`,
        migratedStudents: 0,
        preservedDataPoints: 0,
        errors: [String(error)]
      };
      
      setMigrationResult(errorResult);
      setMigrationStatus('error');
      onMigrationComplete?.(false);
    }
  };

  const rollbackMigration = () => {
    if (window.confirm('Are you sure you want to rollback to the legacy data structure? This will undo the migration.')) {
      const success = DataMigrationManager.rollbackToLegacyData();
      if (success) {
        alert('Successfully rolled back to legacy data structure. Please refresh the page.');
        window.location.reload();
      } else {
        alert('Failed to rollback. Please check the console for errors.');
      }
    }
  };

  const testUnifiedData = () => {
    try {
      const students = UnifiedDataAccess.getAllStudents();
      const goals = UnifiedDataAccess.getAllIEPGoals();
      const dataPoints = UnifiedDataAccess.getAllDataPoints();
      
      alert(`Unified Data Test Results:
- Students: ${students.length}
- Students with IEP Goals: ${goals.length}
- Total Data Points: ${dataPoints.length}
- Data structure is working correctly!`);
    } catch (error) {
      alert(`Unified Data Test Failed: ${error}`);
    }
  };

  const renderMigrationStatus = () => {
    switch (migrationStatus) {
      case 'checking':
        return (
          <div style={{
            textAlign: 'center',
            padding: '2rem',
            background: 'rgba(59, 130, 246, 0.1)',
            borderRadius: '12px',
            border: '1px solid rgba(59, 130, 246, 0.3)'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid rgba(59, 130, 246, 0.3)',
              borderTop: '4px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem auto'
            }} />
            <h3 style={{ color: '#3b82f6', margin: 0 }}>Checking Migration Status...</h3>
          </div>
        );

      case 'ready':
        return (
          <div style={{
            background: 'rgba(245, 158, 11, 0.1)',
            borderRadius: '12px',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            padding: '2rem'
          }}>
            <h3 style={{ color: '#f59e0b', marginTop: 0 }}>⚠️ Migration Required</h3>
            <p style={{ color: '#92400e', marginBottom: '1.5rem' }}>
              Your data needs to be migrated to the new unified architecture to resolve the issues with reports showing 0 goals.
            </p>
            
            {dataPreview && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.8)',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1.5rem'
              }}>
                <h4 style={{ margin: '0 0 1rem 0', color: '#374151' }}>Current Data Summary:</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>{dataPreview.students}</div>
                    <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>Students</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>{dataPreview.goals}</div>
                    <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>IEP Goals</div>
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b', textAlign: 'center' }}>
                    <div>{dataPreview.dataPoints}</div>
                    <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>Data Points</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6' }}>{dataPreview.staff}</div>
                    <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>Staff Members</div>
                  </div>
                </div>
                <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#6b7280' }}>
                  Found {dataPreview.storageKeys.length} data storage keys to migrate
                </div>
              </div>
            )}

            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1.5rem'
            }}>
              <h4 style={{ color: '#dc2626', margin: '0 0 0.5rem 0' }}>⚠️ Important Safety Information</h4>
              <ul style={{ color: '#7f1d1d', margin: 0, paddingLeft: '1.5rem' }}>
                <li>A complete backup of your data will be created automatically</li>
                <li>All existing data will be preserved and consolidated</li>
                <li>You can rollback if needed using the emergency rollback function</li>
                <li>The migration is designed to be safe and reversible</li>
              </ul>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                color: '#374151',
                fontWeight: '500'
              }}>
                <input
                  type="checkbox"
                  checked={confirmMigration}
                  onChange={(e) => setConfirmMigration(e.target.checked)}
                  style={{ transform: 'scale(1.2)' }}
                />
                I understand the migration process and want to proceed
              </label>
            </div>

            <button
              onClick={runMigration}
              disabled={!confirmMigration}
              style={{
                background: confirmMigration 
                  ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                  : '#d1d5db',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '1rem 2rem',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: confirmMigration ? 'pointer' : 'not-allowed',
                width: '100%',
                transition: 'all 0.3s ease'
              }}
            >
              🚀 Start Migration
            </button>
          </div>
        );

      case 'migrating':
        return (
          <div style={{
            textAlign: 'center',
            padding: '2rem',
            background: 'rgba(59, 130, 246, 0.1)',
            borderRadius: '12px',
            border: '1px solid rgba(59, 130, 246, 0.3)'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              border: '6px solid rgba(59, 130, 246, 0.3)',
              borderTop: '6px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1.5rem auto'
            }} />
            <h3 style={{ color: '#3b82f6', margin: '0 0 1rem 0' }}>🔄 Migration in Progress...</h3>
            <p style={{ color: '#1e40af', margin: 0 }}>
              Please wait while we safely migrate your data to the unified architecture.
              This may take a few moments.
            </p>
          </div>
        );

      case 'completed':
        return (
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            borderRadius: '12px',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            padding: '2rem'
          }}>
            <h3 style={{ color: '#10b981', marginTop: 0 }}>✅ Migration Completed Successfully!</h3>
            
            {migrationResult && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.8)',
                borderRadius: '8px',
                padding: '1.5rem',
                marginBottom: '1.5rem'
              }}>
                <h4 style={{ margin: '0 0 1rem 0', color: '#374151' }}>Migration Results:</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#10b981' }}>
                      {migrationResult.migratedStudents}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>Students Migrated</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#3b82f6' }}>
                      {migrationResult.preservedDataPoints}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>Data Points Preserved</div>
                  </div>
                </div>
                <div style={{ marginTop: '1rem', color: '#059669', fontWeight: '500' }}>
                  {migrationResult.message}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                onClick={testUnifiedData}
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.75rem 1.5rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  flex: '1',
                  minWidth: '200px'
                }}
              >
                🧪 Test Unified Data
              </button>
              
              <button
                onClick={() => setShowLog(!showLog)}
                style={{
                  background: 'rgba(107, 114, 128, 0.1)',
                  color: '#374151',
                  border: '1px solid rgba(107, 114, 128, 0.3)',
                  borderRadius: '8px',
                  padding: '0.75rem 1.5rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  flex: '1',
                  minWidth: '200px'
                }}
              >
                📋 {showLog ? 'Hide' : 'Show'} Migration Log
              </button>
            </div>

            {migrationResult && migrationResult.errors.length > 0 && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                padding: '1rem',
                marginTop: '1rem'
              }}>
                <h4 style={{ color: '#dc2626', margin: '0 0 0.5rem 0' }}>⚠️ Migration Warnings:</h4>
                <ul style={{ color: '#7f1d1d', margin: 0, paddingLeft: '1.5rem' }}>
                  {migrationResult.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );

      case 'error':
        return (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            borderRadius: '12px',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            padding: '2rem'
          }}>
            <h3 style={{ color: '#dc2626', marginTop: 0 }}>❌ Migration Error</h3>
            
            {migrationResult && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.8)',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1.5rem'
              }}>
                <p style={{ color: '#7f1d1d', margin: 0 }}>{migrationResult.message}</p>
                {migrationResult.errors.length > 0 && (
                  <ul style={{ color: '#7f1d1d', marginTop: '1rem', paddingLeft: '1.5rem' }}>
                    {migrationResult.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                onClick={checkMigrationStatus}
                style={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.75rem 1.5rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  flex: '1'
                }}
              >
                🔄 Retry Migration
              </button>
              
              <button
                onClick={rollbackMigration}
                style={{
                  background: 'rgba(107, 114, 128, 0.1)',
                  color: '#374151',
                  border: '1px solid rgba(107, 114, 128, 0.3)',
                  borderRadius: '8px',
                  padding: '0.75rem 1.5rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  flex: '1'
                }}
              >
                ↩️ Emergency Rollback
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '2rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 'bold',
          color: '#1f2937',
          margin: '0 0 0.5rem 0'
        }}>
          🔧 Data Architecture Migration
        </h1>
        <p style={{
          fontSize: '1.1rem',
          color: '#6b7280',
          margin: 0
        }}>
          Unified Data Architecture for Visual Schedule Builder
        </p>
      </div>

      {renderMigrationStatus()}

      {showLog && migrationLog.length > 0 && (
        <div style={{
          marginTop: '2rem',
          background: '#f9fafb',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          padding: '1.5rem'
        }}>
          <h4 style={{ margin: '0 0 1rem 0', color: '#374151' }}>📋 Migration Log</h4>
          <div style={{
            background: '#1f2937',
            color: '#f9fafb',
            borderRadius: '8px',
            padding: '1rem',
            maxHeight: '300px',
            overflowY: 'auto',
            fontSize: '0.9rem',
            fontFamily: 'Monaco, Consolas, "Courier New", monospace'
          }}>
            {migrationLog.map((entry, index) => (
              <div key={index} style={{ marginBottom: '0.25rem' }}>
                {entry}
              </div>
            ))}
          </div>
        </div>
      )}

      {migrationStatus === 'completed' && (
        <div style={{
          marginTop: '2rem',
          background: 'rgba(16, 185, 129, 0.1)',
          borderRadius: '12px',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          padding: '1.5rem'
        }}>
          <h4 style={{ color: '#10b981', margin: '0 0 1rem 0' }}>🎉 What's Next?</h4>
          <ul style={{ color: '#065f46', margin: 0, paddingLeft: '1.5rem' }}>
            <li>Your reports should now show the correct number of goals and data points</li>
            <li>All student data is now centralized and connected</li>
            <li>IEP data collection is linked to student profiles</li>
            <li>Calendar preferences are preserved in the unified structure</li>
            <li>You can continue using the app normally - all workflows are preserved</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default DataMigrationInterface;
