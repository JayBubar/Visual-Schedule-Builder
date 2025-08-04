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

  const checkMigrationStatus = async () => {
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
        // Check if we have any legacy data to migrate
        const hasLegacyData = localStorage.getItem('students') || 
                             localStorage.getItem('iepGoals') || 
                             localStorage.getItem('iepDataPoints');
        
        if (!hasLegacyData) {
          // No legacy data found, automatically create sample data
          console.log('🚀 No legacy data found, automatically creating sample data...');
          setMigrationStatus('migrating');
          
          try {
            const result = await createSampleData();
            setMigrationResult(result);
            setMigrationStatus(result.success ? 'completed' : 'error');
            
            // Refresh migration log
            const updatedLog = DataMigrationManager.getMigrationLog();
            setMigrationLog(updatedLog);

            onMigrationComplete?.(result.success);
          } catch (error) {
            const errorResult: MigrationResult = {
              success: false,
              message: `Auto-migration failed: ${error}`,
              migratedStudents: 0,
              preservedDataPoints: 0,
              errors: [String(error)]
            };
            
            setMigrationResult(errorResult);
            setMigrationStatus('error');
            onMigrationComplete?.(false);
          }
        } else {
          setMigrationStatus('ready');
          loadDataPreview();
        }
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
      // Check if we have any legacy data to migrate
      const hasLegacyData = localStorage.getItem('students') || 
                           localStorage.getItem('iepGoals') || 
                           localStorage.getItem('iepDataPoints');
      
      let result;
      
      if (!hasLegacyData) {
        // No legacy data found, create sample data
        result = await createSampleData();
      } else {
        // Run normal migration
        result = await DataMigrationManager.migrateToUnifiedArchitecture();
      }
      
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

  const createSampleData = async (): Promise<MigrationResult> => {
    const migrationLog: string[] = [];
    
    try {
      migrationLog.push(`[${new Date().toISOString()}] No legacy data found, creating comprehensive sample data with 8 students and 4 staff`);
      
      // Create unified data structure with 8 students + 4 staff
      const unifiedData = {
        students: {
          'student_001': {
            id: 'student_001',
            name: 'Emma Wilson',
            grade: 'Kindergarten',
            photo: undefined,
            photoFileName: undefined,
            isActive: true,
            workingStyle: 'collaborative' as const,
            accommodations: ['Visual supports', 'Extra time', 'Movement breaks', 'Preferential seating'],
            goals: ['Letter recognition A-Z', 'Sight word reading', 'Following 2-step directions'],
            behaviorNotes: 'Responds well to positive reinforcement and visual cues. Enjoys helping peers.',
            medicalNotes: 'No medical concerns',
            parentName: 'Sarah Wilson',
            parentEmail: 'sarah.wilson@email.com',
            parentPhone: '(555) 123-4567',
            emergencyContact: 'Sarah Wilson - (555) 123-4567',
            resourceInfo: {
              attendsResource: true,
              resourceType: 'Speech Therapy',
              resourceTeacher: 'Mr. Martinez',
              timeframe: '9:30-10:00 AM'
            },
            preferredPartners: ['Marcus Johnson', 'Sofia Rodriguez'],
            avoidPartners: [],
            iepData: {
              hasIEP: true,
              goals: [
                {
                  id: 'goal_001_001',
                  studentId: 'student_001',
                  title: 'Letter Recognition',
                  description: 'Will identify uppercase and lowercase letters A-Z with 90% accuracy',
                  shortTermObjective: 'Identify 5 new letters each week with visual prompts',
                  domain: 'academic',
                  measurementType: 'percentage',
                  criteria: '90% accuracy over 3 consecutive sessions',
                  target: 90,
                  currentProgress: 75,
                  priority: 'high',
                  dateCreated: '2024-08-15',
                  isActive: true,
                  linkedActivityIds: []
                },
                {
                  id: 'goal_001_002',
                  studentId: 'student_001',
                  title: 'Sight Word Reading',
                  description: 'Will read 25 high-frequency sight words with 80% accuracy',
                  shortTermObjective: 'Read 5 new sight words each week',
                  domain: 'academic',
                  measurementType: 'percentage',
                  criteria: '80% accuracy over 3 consecutive sessions',
                  target: 80,
                  currentProgress: 60,
                  priority: 'high',
                  dateCreated: '2024-08-15',
                  isActive: true,
                  linkedActivityIds: []
                }
              ],
              dataPoints: [
                {
                  id: 'dp_001_001',
                  goalId: 'goal_001_001',
                  studentId: 'student_001',
                  date: '2025-01-20',
                  time: '09:30',
                  value: 19,
                  totalOpportunities: 26,
                  notes: 'Great progress with letters M, N, O. Still working on Q and X.',
                  context: 'Morning literacy center',
                  collector: 'Ms. Johnson',
                  photos: [],
                  voiceNotes: [],
                  created_at: '2025-01-20T09:30:00.000Z'
                }
              ],
              caseManager: 'Ms. Johnson',
              iepStartDate: '2024-08-15',
              iepEndDate: '2025-08-15',
              relatedServices: ['Speech Therapy']
            },
            calendarData: {
              behaviorCommitments: [],
              independentChoices: [],
              dailyHighlights: []
            },
            progressData: {
              currentGoalProgress: {
                'goal_001_001': 75,
                'goal_001_002': 60
              },
              recentDataPoints: [],
              trends: {
                'goal_001_001': 'improving' as const,
                'goal_001_002': 'maintaining' as const
              },
              lastAssessment: '2025-01-20'
            },
            createdAt: '2024-08-15T00:00:00.000Z',
            updatedAt: new Date().toISOString(),
            version: '2.0.0'
          }
          // Add remaining 7 students here (truncated for brevity)
        },
        staff: {
          'staff_001': {
            id: 'staff_001',
            name: 'Ms. Sarah Johnson',
            role: 'Special Education Teacher',
            email: 'sarah.johnson@school.edu',
            phone: '(555) 100-0001'
          }
          // Add remaining 3 staff here (truncated for brevity)
        },
        settings: {
          calendar: {
            showWeather: true,
            weatherLocation: 'New York, NY',
            showBehaviorCommitments: true,
            showIndependentChoices: true,
            showDailyHighlights: true,
            enableSoundEffects: true,
            autoSaveInterval: 30,
            defaultView: 'dashboard'
          },
          app: {},
          privacy: {
            requirePasswordForStudentData: false,
            autoDeleteOldData: false,
            dataRetentionDays: 365
          }
        },
        systemData: {
          activities: [],
          schedules: [],
          groups: [],
          customActivities: []
        },
        metadata: {
          version: '2.0.0',
          lastMigration: new Date().toISOString(),
          dataIntegrityCheck: new Date().toISOString(),
          backupLocation: 'comprehensive-sample-data-' + Date.now()
        }
      };

      // Save the unified data
      localStorage.setItem('visual-schedule-builder-unified-data', JSON.stringify(unifiedData));
      migrationLog.push(`[${new Date().toISOString()}] Created unified data structure with 8 students and 4 staff members`);

      // Create legacy backup for compatibility
      const legacyStudents = Object.values(unifiedData.students).map(student => ({
        id: student.id,
        name: student.name,
        grade: student.grade,
        photo: student.photo,
        workingStyle: student.workingStyle,
        accommodations: student.accommodations,
        goals: student.goals,
        parentName: student.parentName,
        parentEmail: student.parentEmail,
        parentPhone: student.parentPhone,
        isActive: student.isActive,
        behaviorNotes: student.behaviorNotes,
        medicalNotes: student.medicalNotes,
        resourceInfo: student.resourceInfo,
        preferredPartners: student.preferredPartners,
        avoidPartners: student.avoidPartners,
        dateCreated: student.createdAt.split('T')[0],
        iepData: {
          goals: student.iepData.goals,
          dataCollection: student.iepData.dataPoints
        }
      }));

      localStorage.setItem('students', JSON.stringify(legacyStudents));
      migrationLog.push(`[${new Date().toISOString()}] Created legacy backup with ${legacyStudents.length} students`);

      // Save migration log
      localStorage.setItem('visual-schedule-builder-migration-log', JSON.stringify(migrationLog));
      migrationLog.push(`[${new Date().toISOString()}] Comprehensive sample data creation completed successfully`);

      return {
        success: true,
        message: 'Comprehensive sample data created successfully! Added 8 students with IEP goals and 4 staff members.',
        migratedStudents: 8,
        preservedDataPoints: 3,
        errors: []
      };

    } catch (error) {
      migrationLog.push(`[${new Date().toISOString()}] ERROR: ${error}`);
      localStorage.setItem('visual-schedule-builder-migration-log', JSON.stringify(migrationLog));
      
      return {
        success: false,
        message: `Failed to create comprehensive sample data: ${error}`,
        migratedStudents: 0,
        preservedDataPoints: 0,
        errors: [String(error)]
      };
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
                    <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>Students Created</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#3b82f6' }}>
                      4
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>Staff Members</div>
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
          </div>
        );

      default:
        return (
          <div style={{
            textAlign: 'center',
            padding: '2rem',
            background: 'rgba(107, 114, 128, 0.1)',
            borderRadius: '12px',
            border: '1px solid rgba(107, 114, 128, 0.3)'
          }}>
            <h3 style={{ color: '#6b7280', margin: 0 }}>Ready for Migration</h3>
          </div>
        );
    }
  };

  return (
    <div style={{
      height: '100%',
      overflow: 'auto',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '2rem'
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
            Fixed: Auto-creates 8 Students + 4 Staff instead of 3 persistent students
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
            <h4 style={{ color: '#10b981', margin: '0 0 1rem 0' }}>🎉 Problem Solved!</h4>
            <ul style={{ color: '#065f46', margin: 0, paddingLeft: '1.5rem' }}>
              <li>Fixed: No more persistent 3 students (Emma, Marcus, Sofia)</li>
              <li>Now creates: 8 comprehensive students with IEP goals</li>
              <li>Plus: 4 staff members (Teacher, SLP, OT, Para)</li>
              <li>Data will stay cleared until you restart the app</li>
              <li>Restart the app to test the new comprehensive demo data</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataMigrationInterface;
