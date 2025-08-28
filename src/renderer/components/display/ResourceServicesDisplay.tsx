import React, { useState, useEffect } from 'react';
import { User, Clock } from 'lucide-react';
import { useResourceSchedule } from '../../services/ResourceScheduleManager';

interface StudentPullOut {
  student: {
    id: string;
    name: string;
    photo?: string;
    grade?: string;
  };
  currentService: {
    serviceType: string;
    teacher: string;
    startTime: string;
    endTime: string;
  };
  timeRemaining?: number;
}

interface ResourceServicesDisplayProps {
  className?: string;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  compact?: boolean;
}

const ResourceServicesDisplay: React.FC<ResourceServicesDisplayProps> = ({
  className = '',
  position = 'top-left',
  compact = true
}) => {
  const { getCurrentPullOuts } = useResourceSchedule();
  const [studentsInPullOut, setStudentsInPullOut] = useState<StudentPullOut[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Load current pull-out data
  const loadData = () => {
    setIsLoading(true);
    try {
      const currentPullOuts = getCurrentPullOuts();
      setStudentsInPullOut(currentPullOuts);
    } catch (error) {
      console.error('Error loading resource pullout data:', error);
      setStudentsInPullOut([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on mount and refresh every minute for automatic returns
  useEffect(() => {
    loadData();
    
    // Refresh every minute to handle automatic returns
    const interval = setInterval(loadData, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Don't render if no students are pulled out
  if (studentsInPullOut.length === 0 && !isLoading) {
    return null;
  }

  const getServiceIcon = (serviceType: string) => {
    const icons = {
      'Speech Therapy': '🗣️',
      'Occupational Therapy': '✋',
      'Physical Therapy': '🏃',
      'Counseling': '💭',
      'Reading Support': '📚',
      'Math Support': '🔢',
      'ESL Support': '🌍',
      'Behavior Support': '🎯',
      'Life Skills': '🛠️'
    };
    return icons[serviceType] || '📋';
  };

  // Position styles based on position prop
  const getPositionStyles = () => {
    const baseStyles = {
      position: 'fixed' as const,
      zIndex: 100,
      maxWidth: isExpanded ? '400px' : '280px',
      transition: 'all 0.3s ease',
    };

    switch (position) {
      case 'top-left':
        return {
          ...baseStyles,
          top: '80px',
          left: '20px',
        };
      case 'top-right':
        return {
          ...baseStyles,
          top: '80px',
          right: '20px',
        };
      case 'bottom-left':
        return {
          ...baseStyles,
          bottom: '20px',
          left: '20px',
        };
      case 'bottom-right':
        return {
          ...baseStyles,
          bottom: '20px',
          right: '20px',
        };
      default:
        return {
          ...baseStyles,
          top: '80px',
          left: '20px',
        };
    }
  };

  return (
    <div style={getPositionStyles()}>
      {/* Collapsed Header Bar */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          background: 'rgba(255, 193, 7, 0.9)',
          borderRadius: isExpanded ? '12px 12px 0 0' : '12px',
          padding: '12px 16px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          boxShadow: '0 4px 20px rgba(255, 193, 7, 0.3)',
          backdropFilter: 'blur(10px)',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          transition: 'all 0.2s ease',
          minHeight: '48px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 193, 7, 1)';
          e.currentTarget.style.transform = 'scale(1.02)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 193, 7, 0.9)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        {/* Icon and Count */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.2rem' }}>🏫</span>
          <span style={{
            color: 'white',
            fontWeight: '700',
            fontSize: '1rem'
          }}>
            {studentsInPullOut.length} Resource
          </span>
        </div>

        {/* Compact Student Photos (when collapsed) */}
        {!isExpanded && (
          <div style={{ 
            display: 'flex', 
            gap: '4px',
            marginLeft: '8px'
          }}>
            {studentsInPullOut.slice(0, 3).map((pullOut, index) => (
              <div
                key={pullOut.student?.id || index}
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: pullOut.student?.photo ? 'transparent' : 'rgba(255, 255, 255, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.5)',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {pullOut.student?.photo ? (
                  <img 
                    src={pullOut.student.photo} 
                    alt={pullOut.student.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <span style={{ 
                    color: 'white', 
                    fontSize: '10px', 
                    fontWeight: '600' 
                  }}>
                    {pullOut.student?.name?.charAt(0) || '?'}
                  </span>
                )}
              </div>
            ))}
            {studentsInPullOut.length > 3 && (
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                color: 'white',
                fontWeight: '600'
              }}>
                +{studentsInPullOut.length - 3}
              </div>
            )}
          </div>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div style={{
            background: 'rgba(34, 197, 94, 0.3)',
            borderRadius: '8px',
            padding: '0.2rem 0.4rem',
            fontSize: '0.6rem',
            color: '#22c55e',
            fontWeight: '600'
          }}>
            🔄
          </div>
        )}

        {/* Expand/Collapse Arrow */}
        <span style={{
          color: 'white',
          fontSize: '1rem',
          transition: 'transform 0.2s ease',
          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
        }}>
          ▼
        </span>
      </div>

      {/* Expanded Student List */}
      {isExpanded && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '0 0 12px 12px',
          padding: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          backdropFilter: 'blur(10px)',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          borderTop: 'none',
          maxHeight: '300px',
          overflowY: 'auto'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            {studentsInPullOut.map((pullOut, index) => (
              <div
                key={pullOut.student?.id || index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '8px',
                  background: 'rgba(255, 193, 7, 0.1)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 193, 7, 0.2)'
                }}
              >
                {/* Student Photo */}
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: pullOut.student?.photo ? 'transparent' : 'linear-gradient(135deg, #ffc107, #ff8f00)',
                  border: '2px solid rgba(255, 193, 7, 0.3)',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {pullOut.student?.photo ? (
                    <img 
                      src={pullOut.student.photo} 
                      alt={pullOut.student.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    <span style={{ 
                      color: 'white', 
                      fontSize: '1rem', 
                      fontWeight: '600' 
                    }}>
                      {pullOut.student?.name?.charAt(0) || '?'}
                    </span>
                  )}
                </div>

                {/* Student Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontWeight: '700',
                    color: '#1f2937',
                    fontSize: '0.95rem',
                    marginBottom: '2px'
                  }}>
                    {pullOut.student?.name || 'Unknown Student'}
                  </div>
                  <div style={{
                    fontSize: '0.8rem',
                    color: '#6b7280',
                    fontWeight: '500',
                    marginBottom: '4px'
                  }}>
                    {pullOut.currentService.serviceType}
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.7rem',
                    color: '#6b7280'
                  }}>
                    <Clock style={{ width: '10px', height: '10px' }} />
                    <span>
                      {pullOut.currentService.startTime} - {pullOut.currentService.endTime}
                    </span>
                  </div>
                </div>

                {/* Service Icon */}
                <div style={{
                  color: '#ffc107',
                  fontSize: '1.2rem'
                }}>
                  {getServiceIcon(pullOut.currentService.serviceType)}
                </div>
              </div>
            ))}
          </div>

          {/* Footer Actions */}
          <div style={{
            marginTop: '12px',
            paddingTop: '12px',
            borderTop: '1px solid rgba(255, 193, 7, 0.2)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{
                fontSize: '0.8rem',
                color: '#6b7280',
                fontWeight: '500'
              }}>
                {studentsInPullOut.length} student{studentsInPullOut.length !== 1 ? 's' : ''} in resource services
              </span>
              <div style={{
                color: 'rgba(34, 197, 94, 0.9)',
                fontSize: '0.6rem',
                fontWeight: '600'
              }}>
                ✅ Updated: {new Date().toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(false);
              }}
              style={{
                background: 'rgba(255, 193, 7, 0.1)',
                border: '1px solid rgba(255, 193, 7, 0.3)',
                borderRadius: '6px',
                color: '#ffc107',
                padding: '4px 8px',
                fontSize: '0.8rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Collapse
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceServicesDisplay;
