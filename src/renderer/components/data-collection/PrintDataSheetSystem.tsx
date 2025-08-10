import React, { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { UnifiedStudent, IEPGoal } from '../../services/unifiedDataService';

interface PrintDataSheetSystemProps {
  students: UnifiedStudent[];
  goals: IEPGoal[];
  onBack: () => void;
}

interface PrintDataSheetProps {
  student: UnifiedStudent;
  goal: IEPGoal;
  dateRange: string;
}

const PrintDataSheet: React.FC<PrintDataSheetProps> = ({ student, goal, dateRange = 'week' }) => {
  const getDatesForRange = () => {
    const dates = [];
    const today = new Date();
    
    if (dateRange === 'week') {
      // Get next 5 weekdays
      let currentDate = new Date(today);
      let daysAdded = 0;
      while (daysAdded < 5) {
        if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
          dates.push(new Date(currentDate));
          daysAdded++;
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
    } else if (dateRange === 'month') {
      // Get next 20 weekdays
      let currentDate = new Date(today);
      let daysAdded = 0;
      while (daysAdded < 20) {
        if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
          dates.push(new Date(currentDate));
          daysAdded++;
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }
    
    return dates;
  };

  const dates = getDatesForRange();

  const renderDataTable = () => {
    const tableStyle = {
      width: '100%',
      borderCollapse: 'collapse' as const,
      marginTop: '20px',
      backgroundColor: 'white',
      color: 'black'
    };

    const headerStyle = {
      backgroundColor: '#f8f9fa',
      border: '1px solid #333',
      padding: '12px',
      color: 'black',
      fontWeight: 'bold' as const
    };

    const cellStyle = {
      border: '1px solid #333',
      padding: '12px',
      color: 'black',
      height: '40px'
    };

    if (goal.measurementType === 'frequency') {
      return (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={{ ...headerStyle, textAlign: 'left' }}>Date</th>
              <th style={{ ...headerStyle, textAlign: 'center' }}>Occurrences</th>
              <th style={{ ...headerStyle, textAlign: 'center' }}>Opportunities</th>
              <th style={{ ...headerStyle, textAlign: 'center' }}>Percentage</th>
              <th style={{ ...headerStyle, textAlign: 'left' }}>Notes</th>
            </tr>
          </thead>
          <tbody>
            {dates.map((date, index) => (
              <tr key={index}>
                <td style={{ ...cellStyle, fontWeight: 'bold', textAlign: 'left' }}>
                  {date.toLocaleDateString()}
                </td>
                <td style={cellStyle}></td>
                <td style={cellStyle}></td>
                <td style={cellStyle}></td>
                <td style={cellStyle}></td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    if (goal.measurementType === 'independence') {
      return (
        <div>
          <div style={{ 
            marginBottom: '15px', 
            padding: '10px', 
            backgroundColor: '#e3f2fd', 
            borderRadius: '5px',
            color: 'black',
            border: '1px solid #333'
          }}>
            <strong>Independence Scale:</strong> 1 = Full assistance | 2 = Partial assistance | 3 = Verbal prompts | 4 = Gestural cues | 5 = Independent
          </div>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={{ ...headerStyle, textAlign: 'left' }}>Date</th>
                <th style={{ ...headerStyle, textAlign: 'center' }}>Independence Level (1-5)</th>
                <th style={{ ...headerStyle, textAlign: 'left' }}>Notes</th>
              </tr>
            </thead>
            <tbody>
              {dates.map((date, index) => (
                <tr key={index}>
                  <td style={{ ...cellStyle, fontWeight: 'bold', textAlign: 'left' }}>
                    {date.toLocaleDateString()}
                  </td>
                  <td style={{ ...cellStyle, textAlign: 'center', height: '50px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                      {[1, 2, 3, 4, 5].map(level => (
                        <div key={level} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span style={{ color: 'black', fontWeight: 'bold' }}>{level}</span>
                          <div style={{ 
                            width: '20px', 
                            height: '20px', 
                            border: '2px solid #333', 
                            borderRadius: '50%',
                            backgroundColor: 'white'
                          }}></div>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td style={{ ...cellStyle, height: '50px' }}></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    // Default accuracy table
    return (
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={{ ...headerStyle, textAlign: 'left' }}>Date</th>
            <th style={{ ...headerStyle, textAlign: 'center' }}>Correct</th>
            <th style={{ ...headerStyle, textAlign: 'center' }}>Total Trials</th>
            <th style={{ ...headerStyle, textAlign: 'center' }}>Accuracy %</th>
            <th style={{ ...headerStyle, textAlign: 'left' }}>Notes</th>
          </tr>
        </thead>
        <tbody>
          {dates.map((date, index) => (
            <tr key={index}>
              <td style={{ ...cellStyle, fontWeight: 'bold', textAlign: 'left' }}>
                {date.toLocaleDateString()}
              </td>
              <td style={cellStyle}></td>
              <td style={cellStyle}></td>
              <td style={cellStyle}></td>
              <td style={cellStyle}></td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif', 
      maxWidth: '8.5in', 
      margin: '0 auto',
      backgroundColor: 'white',
      color: 'black',
      minHeight: '11in'
    }}>
      {/* Header */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '30px', 
        borderBottom: '3px solid #2563eb', 
        paddingBottom: '20px' 
      }}>
        <h1 style={{ 
          fontSize: '28px', 
          fontWeight: 'bold', 
          margin: '0', 
          color: '#2563eb' 
        }}>
          IEP Data Collection Sheet
        </h1>
        <p style={{ 
          fontSize: '16px', 
          margin: '10px 0 0 0', 
          color: '#666' 
        }}>
          Bloom Smart Groups Platform
        </p>
      </div>

      {/* Student and Goal Information */}
      <div style={{ marginBottom: '30px' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '20px', 
          marginBottom: '20px' 
        }}>
          <div>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              marginBottom: '10px', 
              color: '#1f2937' 
            }}>
              Student Information
            </h3>
            <div style={{ 
              backgroundColor: '#f8f9fa', 
              padding: '15px', 
              borderRadius: '8px',
              border: '1px solid #ddd'
            }}>
              <p style={{ margin: '0 0 8px 0', color: 'black' }}>
                <strong>Name:</strong> {student.name}
              </p>
              <p style={{ margin: '0 0 8px 0', color: 'black' }}>
                <strong>Date Range:</strong> {dates[0]?.toLocaleDateString()} - {dates[dates.length - 1]?.toLocaleDateString()}
              </p>
              <p style={{ margin: '0', color: 'black' }}>
                <strong>Collection Schedule:</strong> {goal.dataCollectionSchedule || 'Daily during activities'}
              </p>
            </div>
          </div>
          <div>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              marginBottom: '10px', 
              color: '#1f2937' 
            }}>
              Goal Information
            </h3>
            <div style={{ 
              backgroundColor: '#f8f9fa', 
              padding: '15px', 
              borderRadius: '8px',
              border: '1px solid #ddd'
            }}>
              <p style={{ margin: '0 0 8px 0', color: 'black' }}>
                <strong>Domain:</strong> {goal.domain}
              </p>
              <p style={{ margin: '0 0 8px 0', color: 'black' }}>
                <strong>Measurement:</strong> {goal.measurementType}
              </p>
              <p style={{ margin: '0', color: 'black' }}>
                <strong>Target:</strong> {goal.targetCriteria || 'See IEP document'}
              </p>
            </div>
          </div>
        </div>

        <div style={{ 
          backgroundColor: '#eff6ff', 
          padding: '15px', 
          borderRadius: '8px', 
          border: '1px solid #bfdbfe' 
        }}>
          <h4 style={{ 
            fontSize: '16px', 
            fontWeight: 'bold', 
            marginBottom: '8px', 
            color: '#1e40af' 
          }}>
            Measurable Objective:
          </h4>
          <p style={{ 
            margin: '0', 
            fontSize: '14px', 
            color: '#1f2937' 
          }}>
            {goal.measurableObjective || goal.description || 'Goal details in IEP'}
          </p>
        </div>
      </div>

      {/* Data Collection Table */}
      {renderDataTable()}

      {/* Footer Instructions */}
      <div style={{ 
        marginTop: '30px', 
        padding: '20px', 
        backgroundColor: '#f9fafb', 
        borderRadius: '8px', 
        border: '1px solid #e5e7eb',
        pageBreakInside: 'avoid'
      }}>
        <h4 style={{ 
          fontSize: '16px', 
          fontWeight: 'bold', 
          marginBottom: '10px', 
          color: '#1f2937' 
        }}>
          Data Collection Instructions:
        </h4>
        <ul style={{ 
          margin: '0', 
          paddingLeft: '20px', 
          fontSize: '14px', 
          color: '#4b5563' 
        }}>
          <li style={{ marginBottom: '5px' }}>Fill out data immediately after each opportunity when possible</li>
          <li style={{ marginBottom: '5px' }}>Use notes section to record context, prompts used, or environmental factors</li>
          <li style={{ marginBottom: '5px' }}>Enter data into digital system daily for progress tracking</li>
          <li style={{ marginBottom: '5px' }}>Contact IEP team if student consistently exceeds or falls below target criteria</li>
        </ul>
      </div>

      {/* Signature Lines */}
      <div style={{ 
        marginTop: '20px', 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '20px', 
        fontSize: '14px',
        color: 'black',
        pageBreakInside: 'avoid'
      }}>
        <div>
          <strong>Teacher Signature:</strong> ____________________________
        </div>
        <div>
          <strong>Date Completed:</strong> ____________________________
        </div>
      </div>
    </div>
  );
};

const PrintDataSheetSystem: React.FC<PrintDataSheetSystemProps> = ({ students, goals, onBack }) => {
  const [selectedStudent, setSelectedStudent] = useState<UnifiedStudent | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<IEPGoal | null>(null);
  const [dateRange, setDateRange] = useState<'week' | 'month'>('week');
  const [showPreview, setShowPreview] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Data_Sheet_${selectedStudent?.name}_${selectedGoal?.domain}_${new Date().toISOString().split('T')[0]}`,
  });

  const studentGoals = selectedStudent ? goals.filter(g => g.studentId === selectedStudent.id) : [];

  // Replace the showPreview section in PrintDataSheetSystem with this:

if (showPreview && selectedStudent && selectedGoal) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      padding: '2rem'
    }}>
      {/* Preview Controls */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '1rem'
      }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', margin: 0 }}>
          🖨️ Print Data Sheet Preview
        </h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={() => setShowPreview(false)}
            style={{
              padding: '12px 24px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            ← Back to Setup
          </button>
          <button
            onClick={handlePrint}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            🖨️ Print Sheet
          </button>
        </div>
      </div>

      {/* Printable Sheet - COMPLETELY ISOLATED */}
      <div style={{ 
        flex: 1,
        backgroundColor: 'white',
        borderRadius: '12px',
        overflow: 'auto',
        border: '3px solid #ddd',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
      }}>
        <div 
          ref={printRef}
          style={{
            backgroundColor: 'white',
            color: 'black',
            minHeight: '100%',
            fontFamily: 'Arial, sans-serif'
          }}
        >
          {/* INLINE PRINT COMPONENT - NO EXTERNAL DEPENDENCIES */}
          <div style={{ 
            padding: '20px', 
            fontFamily: 'Arial, sans-serif', 
            maxWidth: '8.5in', 
            margin: '0 auto',
            backgroundColor: 'white',
            color: 'black',
            minHeight: '11in'
          }}>
            {/* Header */}
            <div style={{ 
              textAlign: 'center', 
              marginBottom: '30px', 
              borderBottom: '3px solid #2563eb', 
              paddingBottom: '20px' 
            }}>
              <h1 style={{ 
                fontSize: '28px', 
                fontWeight: 'bold', 
                margin: '0', 
                color: '#2563eb' 
              }}>
                IEP Data Collection Sheet
              </h1>
              <p style={{ 
                fontSize: '16px', 
                margin: '10px 0 0 0', 
                color: '#666' 
              }}>
                Bloom Smart Groups Platform
              </p>
            </div>

            {/* Student Info Grid */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '20px', 
              marginBottom: '30px' 
            }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px', color: 'black' }}>
                  Student Information
                </h3>
                <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px', border: '1px solid #ddd' }}>
                  <p style={{ margin: '0 0 8px 0', color: 'black' }}>
                    <strong>Name:</strong> {selectedStudent.name}
                  </p>
                  <p style={{ margin: '0 0 8px 0', color: 'black' }}>
                    <strong>Date Range:</strong> {new Date().toLocaleDateString()} - {new Date(Date.now() + (dateRange === 'week' ? 5 : 20) * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  </p>
                  <p style={{ margin: '0', color: 'black' }}>
                    <strong>Collection Schedule:</strong> {selectedGoal.dataCollectionSchedule || 'Daily during activities'}
                  </p>
                </div>
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px', color: 'black' }}>
                  Goal Information
                </h3>
                <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px', border: '1px solid #ddd' }}>
                  <p style={{ margin: '0 0 8px 0', color: 'black' }}>
                    <strong>Domain:</strong> {selectedGoal.domain}
                  </p>
                  <p style={{ margin: '0 0 8px 0', color: 'black' }}>
                    <strong>Measurement:</strong> {selectedGoal.measurementType}
                  </p>
                  <p style={{ margin: '0', color: 'black' }}>
                    <strong>Target:</strong> {selectedGoal.targetCriteria || 'See IEP document'}
                  </p>
                </div>
              </div>
            </div>

            {/* Goal Description */}
            <div style={{ backgroundColor: '#eff6ff', padding: '15px', borderRadius: '8px', border: '1px solid #bfdbfe', marginBottom: '30px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px', color: '#1e40af' }}>
                Measurable Objective:
              </h4>
              <p style={{ margin: '0', fontSize: '14px', color: 'black' }}>
                {selectedGoal.measurableObjective || selectedGoal.description || 'Goal details in IEP'}
              </p>
            </div>

            {/* Data Table */}
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse', 
              marginBottom: '30px',
              backgroundColor: 'white'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{ border: '2px solid black', padding: '12px', textAlign: 'left', color: 'black', fontWeight: 'bold' }}>Date</th>
                  <th style={{ border: '2px solid black', padding: '12px', textAlign: 'center', color: 'black', fontWeight: 'bold' }}>
                    {selectedGoal.measurementType === 'independence' ? 'Independence (1-5)' : 'Correct'}
                  </th>
                  <th style={{ border: '2px solid black', padding: '12px', textAlign: 'center', color: 'black', fontWeight: 'bold' }}>
                    {selectedGoal.measurementType === 'independence' ? 'Support Level' : 'Total Trials'}
                  </th>
                  <th style={{ border: '2px solid black', padding: '12px', textAlign: 'left', color: 'black', fontWeight: 'bold' }}>Notes</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: dateRange === 'week' ? 5 : 20 }, (_, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() + i);
                  return (
                    <tr key={i}>
                      <td style={{ border: '1px solid black', padding: '12px', color: 'black', fontWeight: 'bold', height: '50px' }}>
                        {date.toLocaleDateString()}
                      </td>
                      <td style={{ border: '1px solid black', padding: '12px', color: 'black', height: '50px' }}></td>
                      <td style={{ border: '1px solid black', padding: '12px', color: 'black', height: '50px' }}></td>
                      <td style={{ border: '1px solid black', padding: '12px', color: 'black', height: '50px' }}></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Instructions */}
            <div style={{ padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid black', marginBottom: '20px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px', color: 'black' }}>
                Data Collection Instructions:
              </h4>
              <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '14px', color: 'black' }}>
                <li style={{ marginBottom: '5px' }}>Fill out data immediately after each opportunity when possible</li>
                <li style={{ marginBottom: '5px' }}>Use notes section to record context, prompts used, or environmental factors</li>
                <li style={{ marginBottom: '5px' }}>Enter data into digital system daily for progress tracking</li>
                <li style={{ marginBottom: '5px' }}>Contact IEP team if student consistently exceeds or falls below target criteria</li>
              </ul>
            </div>

            {/* Signature Lines */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', fontSize: '14px', color: 'black' }}>
              <div>
                <strong>Teacher Signature:</strong> ____________________________
              </div>
              <div>
                <strong>Date Completed:</strong> ____________________________
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

  return (
    <div style={{
      background: 'rgba(255,255,255,0.15)',
      backdropFilter: 'blur(20px)',
      borderRadius: '20px',
      padding: '2rem',
      minHeight: '600px'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem' }}>
          🖨️ Generate Print Data Sheets
        </h2>
        <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.8)' }}>
          Create printable data collection sheets for offline use
        </p>
      </div>

      {/* Back Button */}
      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={onBack}
          style={{
            padding: '10px 20px',
            backgroundColor: 'rgba(255,255,255,0.2)',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* Student Selection */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem' }}>
          1. Select Student
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          {students.map((student) => (
            <button
              key={student.id}
              onClick={() => {
                setSelectedStudent(student);
                setSelectedGoal(null);
              }}
              style={{
                padding: '1rem',
                backgroundColor: selectedStudent?.id === student.id ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
                border: selectedStudent?.id === student.id ? '2px solid white' : '1px solid rgba(255,255,255,0.2)',
                borderRadius: '12px',
                color: 'white',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <img 
                  src={student.photo || '/api/placeholder/50/50'} 
                  alt={student.name}
                  style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                  <p style={{ margin: '0', fontWeight: 'bold', fontSize: '1.1rem' }}>{student.name}</p>
                  <p style={{ margin: '0', opacity: 0.8 }}>
                    {goals.filter(g => g.studentId === student.id).length} goals available
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Goal Selection */}
      {selectedStudent && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem' }}>
            2. Select Goal
          </h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {studentGoals.map((goal) => (
              <button
                key={goal.id}
                onClick={() => setSelectedGoal(goal)}
                style={{
                  padding: '1rem',
                  backgroundColor: selectedGoal?.id === goal.id ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
                  border: selectedGoal?.id === goal.id ? '2px solid white' : '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  color: 'white',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold', fontSize: '1.1rem' }}>
                      {goal.domain} - {goal.description}
                    </p>
                    <p style={{ margin: '0', opacity: 0.8, fontSize: '0.9rem' }}>
                      {goal.measurableObjective}
                    </p>
                  </div>
                  <div style={{ padding: '0.5rem 1rem', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '8px' }}>
                    {goal.measurementType}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Date Range Selection */}
      {selectedGoal && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem' }}>
            3. Select Date Range
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <button
              onClick={() => setDateRange('week')}
              style={{
                padding: '1rem',
                backgroundColor: dateRange === 'week' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
                border: dateRange === 'week' ? '2px solid white' : '1px solid rgba(255,255,255,0.2)',
                borderRadius: '12px',
                color: 'white',
                cursor: 'pointer',
                textAlign: 'center'
              }}
            >
              <h4 style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>📅 One Week</h4>
              <p style={{ margin: '0', opacity: 0.8 }}>5 weekdays of data collection</p>
            </button>
            <button
              onClick={() => setDateRange('month')}
              style={{
                padding: '1rem',
                backgroundColor: dateRange === 'month' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
                border: dateRange === 'month' ? '2px solid white' : '1px solid rgba(255,255,255,0.2)',
                borderRadius: '12px',
                color: 'white',
                cursor: 'pointer',
                textAlign: 'center'
              }}
            >
              <h4 style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>📅 One Month</h4>
              <p style={{ margin: '0', opacity: 0.8 }}>20 weekdays of data collection</p>
            </button>
          </div>
        </div>
      )}

      {/* Generate Button */}
      {selectedStudent && selectedGoal && (
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={() => setShowPreview(true)}
            style={{
              padding: '1rem 2rem',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '1.1rem'
            }}
          >
            🖨️ Generate Print Data Sheet
          </button>
        </div>
      )}
    </div>
  );
};

// Make sure this is the default export
export default PrintDataSheetSystem;