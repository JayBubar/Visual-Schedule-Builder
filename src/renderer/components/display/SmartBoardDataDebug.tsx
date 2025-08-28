// DIAGNOSTIC: SmartBoard Data Flow Debug Component
// Place this temporarily in SmartboardDisplay.tsx to debug the absent/resource data flow

import React, { useState, useEffect } from 'react';
import UnifiedDataService from '../../services/unifiedDataService';
import { useResourceSchedule } from '../../services/ResourceScheduleManager';

const SmartBoardDataDebug: React.FC = () => {
  const [debugData, setDebugData] = useState<any>(null);
  const { getCurrentPullOuts } = useResourceSchedule();

  useEffect(() => {
    const runDiagnostics = () => {
      console.log("🔍 SMARTBOARD DEBUG - Running diagnostics...");

      // 1. Check if UnifiedDataService has students
      const allStudents = UnifiedDataService.getAllStudents();
      console.log("📚 All Students:", allStudents.length, allStudents);

      // 2. Check attendance data
      const absentStudentIds = UnifiedDataService.getAbsentStudentsToday();
      console.log("❌ Absent Students Today:", absentStudentIds);

      // 3. Check today's attendance records
      const todayAttendance = UnifiedDataService.getTodayAttendance();
      console.log("📋 Today's Attendance Records:", todayAttendance);

      // 4. Check for students with resource info
      const studentsWithResourceInfo = allStudents.filter(student => 
        (student as any).resourceInfo?.attendsResource || 
        student.resourceInformation?.attendsResourceServices
      );
      console.log("🏫 Students with Resource Info:", studentsWithResourceInfo.length, studentsWithResourceInfo);

      // 5. Check current pull-outs
      const currentPullOuts = getCurrentPullOuts();
      console.log("📤 Current Pull-outs:", currentPullOuts.length, currentPullOuts);

      // 6. Check localStorage data directly
      const studentsStorage = localStorage.getItem('students');
      const attendanceStorage = localStorage.getItem('attendance');
      console.log("💾 Raw Storage - Students:", studentsStorage ? JSON.parse(studentsStorage).length : 0);
      console.log("💾 Raw Storage - Attendance:", attendanceStorage ? JSON.parse(attendanceStorage) : "None");

      setDebugData({
        allStudents: allStudents.length,
        absentStudents: absentStudentIds.length,
        todayAttendance: todayAttendance.length,
        resourceStudents: studentsWithResourceInfo.length,
        currentPullOuts: currentPullOuts.length,
        studentsWithDetails: allStudents.map(s => ({
          id: s.id,
          name: s.name,
          hasResourceInfo: !!(s as any).resourceInfo,
          resourceType: (s as any).resourceInfo?.resourceType || 'none'
        })),
        absentDetails: absentStudentIds,
        resourceDetails: studentsWithResourceInfo.map(s => ({
          name: s.name,
          resourceInfo: (s as any).resourceInfo || s.resourceInformation
        }))
      });
    };

    runDiagnostics();
    
    // Run diagnostics every 5 seconds to see real-time changes
    const interval = setInterval(runDiagnostics, 5000);
    return () => clearInterval(interval);
  }, [getCurrentPullOuts]);

  if (!debugData) {
    return <div style={styles.debugContainer}>Loading diagnostics...</div>;
  }

  return (
    <div style={styles.debugContainer}>
      <h3 style={styles.debugTitle}>🔍 SmartBoard Data Debug</h3>
      
      <div style={styles.debugGrid}>
        <div style={styles.debugCard}>
          <h4>📊 Data Summary</h4>
          <p><strong>Total Students:</strong> {debugData.allStudents}</p>
          <p><strong>Absent Today:</strong> {debugData.absentStudents}</p>
          <p><strong>Resource Students:</strong> {debugData.resourceStudents}</p>
          <p><strong>Current Pull-outs:</strong> {debugData.currentPullOuts}</p>
        </div>

        <div style={styles.debugCard}>
          <h4>❌ Absent Students</h4>
          {debugData.absentDetails.length > 0 ? (
            debugData.absentDetails.map((id: string) => (
              <p key={id} style={styles.debugItem}>{id}</p>
            ))
          ) : (
            <p style={styles.noData}>No absent students</p>
          )}
        </div>

        <div style={styles.debugCard}>
          <h4>🏫 Resource Students</h4>
          {debugData.resourceDetails.length > 0 ? (
            debugData.resourceDetails.map((student: any, idx: number) => (
              <div key={idx} style={styles.debugItem}>
                <strong>{student.name}</strong>
                <br />
                <small>{JSON.stringify(student.resourceInfo, null, 2)}</small>
              </div>
            ))
          ) : (
            <p style={styles.noData}>No resource students found</p>
          )}
        </div>

        <div style={styles.debugCard}>
          <h4>👥 All Students Overview</h4>
          {debugData.studentsWithDetails.map((student: any) => (
            <div key={student.id} style={styles.debugItem}>
              <strong>{student.name}</strong> 
              <span style={styles.resourceBadge}>
                {student.hasResourceInfo ? `📚 ${student.resourceType}` : '🚫 No Resource'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.instructionBox}>
        <h4>🎯 Next Steps:</h4>
        <ol>
          <li><strong>If "Total Students" is 0:</strong> Students not loading from UnifiedDataService</li>
          <li><strong>If "Absent Today" is 0 but you marked students absent:</strong> Attendance data not saving</li>
          <li><strong>If "Resource Students" is 0 but you added resource info:</strong> Resource data not saving</li>
          <li><strong>If "Current Pull-outs" is 0:</strong> ResourceScheduleManager not finding students</li>
        </ol>
        
        <p><strong>Check the console logs above for detailed debugging information.</strong></p>
      </div>
    </div>
  );
};

const styles = {
  debugContainer: {
    position: 'fixed' as const,
    top: '10px',
    left: '10px',
    right: '10px',
    bottom: '10px',
    background: 'rgba(0, 0, 0, 0.95)',
    color: 'white',
    padding: '20px',
    borderRadius: '10px',
    zIndex: 20000,
    overflow: 'auto',
    fontFamily: 'monospace'
  },
  debugTitle: {
    textAlign: 'center' as const,
    marginBottom: '20px',
    color: '#4CAF50'
  },
  debugGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '15px',
    marginBottom: '20px'
  },
  debugCard: {
    background: 'rgba(255, 255, 255, 0.1)',
    padding: '15px',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.2)'
  },
  debugItem: {
    padding: '5px 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    fontSize: '12px'
  },
  resourceBadge: {
    marginLeft: '10px',
    fontSize: '10px',
    opacity: 0.8
  },
  noData: {
    color: '#ff9800',
    fontStyle: 'italic' as const
  },
  instructionBox: {
    background: 'rgba(33, 150, 243, 0.2)',
    padding: '15px',
    borderRadius: '8px',
    border: '1px solid #2196F3'
  }
};

export default SmartBoardDataDebug;