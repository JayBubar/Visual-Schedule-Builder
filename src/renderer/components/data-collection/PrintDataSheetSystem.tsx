import React, { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { UnifiedStudent, IEPGoal } from '../../services/unifiedDataService';

interface PrintDataSheetSystemProps {
  students: UnifiedStudent[];
  goals: IEPGoal[];
  onBack: () => void;
}

const PrintDataSheet = ({ student, goal, dateRange = 'week' }: { 
  student: UnifiedStudent; 
  goal: IEPGoal;
  dateRange: string; 
}) => {
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
    if (goal.measurementType === 'frequency') {
      return (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>Date</th>
              <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center' }}>Occurrences</th>
              <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center' }}>Opportunities</th>
              <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center' }}>Percentage</th>
              <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>Notes</th>
            </tr>
          </thead>
          <tbody>
            {dates.map((date, index) => (
              <tr key={index}>
                <td style={{ border: '1px solid #ddd', padding: '12px', fontWeight: 'bold' }}>
                  {date.toLocaleDateString()}
                </td>
                <td style={{ border: '1px solid #ddd', padding: '12px', height: '40px' }}></td>
                <td style={{ border: '1px solid #ddd', padding: '12px', height: '40px' }}></td>
                <td style={{ border: '1px solid #ddd', padding: '12px', height: '40px' }}></td>
                <td style={{ border: '1px solid #ddd', padding: '12px', height: '40px' }}></td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    if (goal.measurementType === 'independence') {
      return (
        <div>
          <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#e3f2fd', borderRadius: '5px' }}>
            <strong>Independence Scale:</strong> 1 = Full assistance | 2 = Partial assistance | 3 = Verbal prompts | 4 = Gestural cues | 5 = Independent
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>Date</th>
                <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center' }}>Independence Level (1-5)</th>
                <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>Notes</th>
              </tr>
            </thead>
            <tbody>
              {dates.map((date, index) => (
                <tr key={index}>
                  <td style={{ border: '1px solid #ddd', padding: '12px', fontWeight: 'bold' }}>
                    {date.toLocaleDateString()}
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center', height: '50px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                      {[1, 2, 3, 4, 5].map(level => (
                        <div key={level} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span>{level}</span>
                          <div style={{ width: '20px', height: '20px', border: '2px solid #333', borderRadius: '50%' }}></div>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '12px', height: '50px' }}></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    // Default accuracy table
    return (
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f8f9fa' }}>
            <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>Date</th>
            <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center' }}>Correct</th>
            <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center' }}>Total Trials</th>
            <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center' }}>Accuracy %</th>
            <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>Notes</th>
          </tr>
        </thead>
        <tbody>
          {dates.map((date, index) => (
            <tr key={index}>
              <td style={{ border: '1px solid #ddd', padding: '12px', fontWeight: 'bold' }}>
                {date.toLocaleDateString()}
              </td>
              <td style={{ border: '1px solid #ddd', padding: '12px', height: '40px' }}></td>
              <td style={{ border: '1px solid #ddd', padding: '12px', height: '40px' }}></td>
              <td style={{ border: '1px solid #ddd', padding: '12px', height: '40px' }}></td>
              <td style={{ border: '1px solid #ddd', padding: '12px', height: '40px' }}></td>
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
      color: 'black'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '30px', borderBottom: '3px solid #2563eb', paddingBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0', color: '#2563eb' }}>
          IEP Data Collection Sheet
        </h1>
        <p style={{ fontSize: '14px', margin: '10px 0 0 0', color: '#666' }}>
          Visual Schedule Builder Platform
        </p>
      </div>

      {/* Student and Goal Information */}
      <div style={{ marginBottom: '30px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px', color: '#1f2937' }}>
              Student Information
            </h3>
            <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
              <p style={{ margin: '0 0 8px 0' }}><strong>Name:</strong> {student.name}</p>
              <p style={{ margin: '0 0 8px 0' }}><strong>Date Range:</strong> {dates[0]?.toLocaleDateString()} - {dates[dates.length - 1]?.toLocaleDateString()}</p>
              <p style={{ margin: '0' }}><strong>Collection Schedule:</strong> {goal.dataCollectionSchedule || 'Daily during activities'}</p>
            </div>
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px', color: '#1f2937' }}>
              Goal Information
            </h3>
            <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
              <p style={{ margin: '0 0 8px 0' }}><strong>Domain:</strong> {goal.domain}</p>
              <p style={{ margin: '0 0 8px 0' }}><strong>Measurement:</strong> {goal.measurementType}</p>
              <p style={{ margin: '0' }}><strong>Target:</strong> {goal.targetCriteria || 'See IEP document'}</p>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: '#eff6ff', padding: '15px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
          <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px', color: '#1e40af' }}>
            Measurable Objective:
          </h4>
          <p style={{ margin: '0', fontSize: '14px', color: '#1f2937' }}>
            {goal.measurableObjective || goal.description || 'Goal details in IEP'}
          </p>
        </div>
      </div>

      {/* Data Collection Table */}
      {renderDataTable()}

      {/* Footer Instructions */}
      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
        <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px', color: '#1f2937' }}>
          Data Collection Instructions:
        </h4>
        <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '14px', color: '#4b5563' }}>
          <li style={{ marginBottom: '5px' }}>Fill out data immediately after each opportunity when possible</li>
          <li style={{ marginBottom: '5px' }}>Use notes section to record context, prompts used, or environmental factors</li>
          <li style={{ marginBottom: '5px' }}>Enter data into digital system daily for progress tracking</li>
          <li style={{ marginBottom: '5px' }}>Contact IEP team if student consistently exceeds or falls below target criteria</li>
        </ul>
      </div>

      {/* Signature Lines */}
      <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', fontSize: '12px' }}>
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

  if (showPreview && selectedStudent && selectedGoal) {
    return (
      <div style={{
        background: 'rgba(255,255,255,0.15)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        padding: '2rem',
        minHeight: '600px'
      }}>
        {/* Preview Controls */}
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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

        {/* Printable Sheet */}
        <div style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden' }}>
          <div ref={printRef}>
            <PrintDataSheet student={selectedStudent} goal={selectedGoal} dateRange={dateRange} />
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

export default PrintDataSheetSystem;
