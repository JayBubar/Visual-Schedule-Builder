import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Clock, MapPin } from 'lucide-react';
import { useResourceSchedule } from '../../services/ResourceScheduleManager';

interface StudentPullOut {
  student: {
    id: string;
    name: string;
    photo?: string;
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

  // Load current pull-out data
  const loadData = () => {
    setIsLoading(true);
    try {
      const currentPullOuts = getCurrentPullOuts();
      setStudentsInPullOut(currentPullOuts);
      console.log('🏫 Loaded resource pullout students:', currentPullOuts.length);
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

  // Group by service type for better organization
  const serviceGroups = studentsInPullOut.reduce((groups, pullOut) => {
    const serviceType = pullOut.currentService.serviceType;
    if (!groups[serviceType]) {
      groups[serviceType] = [];
    }
    groups[serviceType].push(pullOut);
    return groups;
  }, {} as Record<string, StudentPullOut[]>);

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
      maxWidth: compact ? '280px' : '320px',
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
    <motion.div 
      style={getPositionStyles()}
      className={`bg-yellow-500/10 backdrop-blur-sm rounded-xl p-3 border-2 border-yellow-400/30 shadow-lg ${className}`}
      initial={{ opacity: 0, scale: 0.9, x: -20 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '0.75rem',
        paddingBottom: '0.5rem',
        borderBottom: '1px solid rgba(255, 193, 7, 0.3)'
      }}>
        <span style={{ fontSize: '1.2rem' }}>🏫</span>
        <h3 style={{
          margin: 0,
          fontSize: '0.9rem',
          fontWeight: '600',
          color: 'white',
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
        }}>
          Resource Services
        </h3>
        <span style={{
          background: 'rgba(255, 193, 7, 0.3)',
          color: '#ffc107',
          fontSize: '0.7rem',
          padding: '0.2rem 0.5rem',
          borderRadius: '12px',
          fontWeight: '600',
          border: '1px solid rgba(255, 193, 7, 0.5)'
        }}>
          {studentsInPullOut.length}
        </span>
        
        {/* Loading Indicator */}
        {isLoading && (
          <div style={{
            background: 'rgba(255, 193, 7, 0.2)',
            color: '#ffc107',
            fontSize: '0.7rem',
            padding: '0.2rem 0.5rem',
            borderRadius: '12px'
          }}>
            🔄
          </div>
        )}
      </div>

      {/* Services Groups */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <AnimatePresence>
          {Object.entries(serviceGroups).map(([serviceType, students]) => (
            <motion.div
              key={serviceType}
              style={{
                background: 'rgba(255, 193, 7, 0.15)',
                borderRadius: '8px',
                padding: '0.5rem',
                border: '1px solid rgba(255, 193, 7, 0.3)'
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Service Type Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.5rem'
              }}>
                <span style={{ fontSize: '1rem' }}>{getServiceIcon(serviceType)}</span>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: 'white',
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                }}>
                  {serviceType}
                </span>
                <span style={{
                  fontSize: '0.65rem',
                  color: 'rgba(255, 255, 255, 0.8)',
                  marginLeft: 'auto'
                }}>
                  {students[0]?.currentService.teacher}
                </span>
              </div>

              {/* Students in this service */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: compact ? '1fr' : 'repeat(2, 1fr)',
                gap: '0.5rem'
              }}>
                {students.map(({ student, currentService, timeRemaining }) => (
                  <motion.div
                    key={student.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '6px',
                      padding: '0.4rem',
                      border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Student Photo */}
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      background: student.photo ? 'transparent' : 'linear-gradient(135deg, #ffc107, #ff8f00)',
                      border: '1px solid rgba(255, 193, 7, 0.5)',
                      flexShrink: 0
                    }}>
                      {student.photo ? (
                        <img 
                          src={student.photo} 
                          alt={student.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      ) : (
                        <div style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <User style={{ width: '12px', height: '12px', color: 'white' }} />
                        </div>
                      )}
                    </div>

                    {/* Student Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: '0.7rem',
                        fontWeight: '600',
                        color: 'white',
                        textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {student.name}
                      </div>
                      
                      {/* Service Time */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        marginTop: '0.1rem'
                      }}>
                        <Clock style={{ width: '8px', height: '8px', color: 'rgba(255, 255, 255, 0.7)' }} />
                        <span style={{
                          fontSize: '0.6rem',
                          color: 'rgba(255, 255, 255, 0.7)'
                        }}>
                          Until {currentService.endTime}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Service Time Range */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: '0.5rem',
                fontSize: '0.65rem',
                color: 'rgba(255, 255, 255, 0.7)',
                borderTop: '1px solid rgba(255, 193, 7, 0.2)',
                paddingTop: '0.3rem'
              }}>
                {students[0]?.currentService.startTime} - {students[0]?.currentService.endTime}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Footer Note */}
      <div style={{
        marginTop: '0.5rem',
        fontSize: '0.6rem',
        color: 'rgba(255, 255, 255, 0.6)',
        textAlign: 'center',
        fontStyle: 'italic'
      }}>
        Students return automatically when service ends
      </div>
    </motion.div>
  );
};

export default ResourceServicesDisplay;
