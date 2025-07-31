import React, { useState, useEffect, useRef } from 'react';
import { 
  ScheduleVariation, 
  Student, 
  StaffMember, 
  DailyCheckIn as DailyCheckInType,
  ActivityHighlight,
  ActivityPreview,
  PhotoUploadResult
} from '../../types';

interface ThreeDayViewProps {
  currentDate: Date;
  selectedSchedule?: ScheduleVariation | null;
  todayCheckIn: DailyCheckInType | null;
  students: Student[];
  staff: StaffMember[];
  onUpdateCheckIn: (checkIn: DailyCheckInType) => void;
}

interface TomorrowPreview {
  date: string;
  scheduleName?: string;
  topActivities: {
    name: string;
    icon: string;
    startTime: string;
    isSpecial: boolean;
  }[];
  specialEvents: string[];
  preparation: string[];
}

const ThreeDayView: React.FC<ThreeDayViewProps> = ({
  currentDate,
  selectedSchedule,
  todayCheckIn,
  students,
  staff,
  onUpdateCheckIn
}) => {
  const [yesterdayData, setYesterdayData] = useState<DailyCheckInType | null>(null);
  const [todayPreview, setTodayPreview] = useState<ActivityPreview[]>([]);
  const [tomorrowPreview, setTomorrowPreview] = useState<TomorrowPreview | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadYesterdayData();
    generateTodayPreview();
    generateTomorrowPreview();
  }, [currentDate, selectedSchedule]);

  const loadYesterdayData = () => {
    const yesterday = new Date(currentDate);
    yesterday.setDate(yesterday.getDate() - 1);
    const dateKey = yesterday.toISOString().split('T')[0];
    
    try {
      const savedCheckIns = localStorage.getItem('dailyCheckIns');
      if (savedCheckIns) {
        const checkIns: DailyCheckInType[] = JSON.parse(savedCheckIns);
        const yesterdayCheckIn = checkIns.find(checkin => checkin.date === dateKey);
        setYesterdayData(yesterdayCheckIn || null);
      }
    } catch (error) {
      console.error('Error loading yesterday data:', error);
    }
  };

  const generateTodayPreview = () => {
    if (!selectedSchedule?.activities) {
      setTodayPreview([]);
      return;
    }

    const currentTime = new Date();
    const startTime = new Date(currentDate);
    startTime.setHours(9, 0, 0, 0);

    const previews: ActivityPreview[] = selectedSchedule.activities.map((activity, index) => {
      const activityStartTime = new Date(startTime);
      const cumulativeMinutes = selectedSchedule.activities
        .slice(0, index)
        .reduce((total, prev) => total + (prev.duration || 30), 0);
      
      activityStartTime.setMinutes(activityStartTime.getMinutes() + cumulativeMinutes);

      let status: 'upcoming' | 'current' | 'completed' = 'upcoming';
      if (currentTime > activityStartTime) {
        const activityEndTime = new Date(activityStartTime);
        activityEndTime.setMinutes(activityEndTime.getMinutes() + (activity.duration || 30));
        status = currentTime > activityEndTime ? 'completed' : 'current';
      }

      return {
        id: activity.id,              // ← ADD THIS
        name: activity.name,          // ← ADD THIS  
        emoji: activity.emoji || '📝', // ← ADD THIS
        activityId: activity.id,
        activityName: activity.name,
        icon: activity.icon || activity.emoji || '📝',
        startTime: activityStartTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        duration: activity.duration || 30,
        groupAssignments: activity.groupAssignments || [],
        isSpecial: activity.category === 'special' || activity.isTransition || false,
        description: activity.description || '',
        status: status
      };
    });

    setTodayPreview(previews);
  };

  const generateTomorrowPreview = () => {
    const tomorrow = new Date(currentDate);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const preview: TomorrowPreview = {
      date: tomorrow.toISOString().split('T')[0],
      scheduleName: selectedSchedule?.name || 'Regular Schedule',
      topActivities: selectedSchedule?.activities.slice(0, 3).map(activity => ({
        name: activity.name,
        icon: activity.icon || activity.emoji || '📝',
        startTime: '9:00 AM',
        isSpecial: activity.category === 'special' || false
      })) || [],
      specialEvents: [],
      preparation: [
        'Review today\'s achievements',
        'Prepare activity materials',
        'Set positive intentions',
        'Check weather for outdoor activities'
      ]
    };

    setTomorrowPreview(preview);
  };

  const uploadPhoto = async (file: File): Promise<PhotoUploadResult> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        resolve({
          success: true,
          dataUrl: dataUrl,
          fileName: file.name
        });
      };
      reader.onerror = () => {
        resolve({
          success: false,
          error: 'Failed to read file'
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !todayCheckIn) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Photo must be smaller than 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const result = await uploadPhoto(file);
      if (result.success && result.dataUrl) {
        const newHighlight: ActivityHighlight = {
          id: `highlight_${Date.now()}`,
          activityId: `highlight_${Date.now()}`,
          activityName: 'Daily Moment',
          emoji: '📸',
          description: 'Great moment captured!',
          studentReactions: [],
          photo: result.dataUrl,
          highlight: 'Great moment captured!',
          timestamp: new Date().toISOString()
        };

        const updatedCheckIn = {
          ...todayCheckIn,
          yesterdayHighlights: [...todayCheckIn.yesterdayHighlights, newHighlight],
          updatedAt: new Date().toISOString()
        };

        onUpdateCheckIn(updatedCheckIn);
      } else {
        alert(`Photo upload failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Photo upload error:', error);
      alert('Failed to upload photo. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const addQuickAchievement = (text: string) => {
    if (!todayCheckIn) return;

    const newHighlight: ActivityHighlight = {
      id: `achievement_${Date.now()}`,
      activityId: `achievement_${Date.now()}`,
      activityName: 'Daily Achievement',
      emoji: '🏆',
      description: text || 'Daily achievement',
      studentReactions: [],
      highlight: text,
      timestamp: new Date().toISOString()
    };

    const updatedCheckIn = {
      ...todayCheckIn,
      yesterdayHighlights: [...todayCheckIn.yesterdayHighlights, newHighlight],
      updatedAt: new Date().toISOString()
    };

    onUpdateCheckIn(updatedCheckIn);
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#28a745';
      case 'current': return '#ffc107';
      case 'upcoming': return '#6c757d';
      default: return '#6c757d';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅';
      case 'current': return '⏳';
      case 'upcoming': return '⏰';
      default: return '📋';
    }
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
      gap: '2rem',
      padding: '1rem'
    }}>
      {/* Yesterday Section */}
      <div style={{
        background: 'linear-gradient(145deg, rgba(100, 149, 237, 0.2), rgba(100, 149, 237, 0.1))',
        borderRadius: '20px',
        padding: '2rem',
        border: '2px solid rgba(100, 149, 237, 0.3)',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <span style={{ fontSize: '2.5rem' }}>📸</span>
          <div>
            <h3 style={{
              margin: '0',
              fontSize: '1.8rem',
              fontWeight: '700',
              color: 'white'
            }}>
              Yesterday
            </h3>
            <p style={{
              margin: '0',
              fontSize: '1rem',
              color: 'rgba(255,255,255,0.8)'
            }}>
              {formatDate(new Date(currentDate.getTime() - 24 * 60 * 60 * 1000))}
            </p>
          </div>
        </div>

        {yesterdayData && yesterdayData.yesterdayHighlights.length > 0 ? (
          <div>
            <h4 style={{
              color: 'white',
              fontSize: '1.3rem',
              marginBottom: '1rem'
            }}>
              🌟 Yesterday's Highlights
            </h4>
            
            {/* Photo Gallery */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: '1rem',
              marginBottom: '1.5rem'
            }}>
              {yesterdayData.yesterdayHighlights
                .filter(h => h.photo)
                .slice(0, 4)
                .map((highlight, index) => (
                  <div
                    key={index}
                    style={{
                      aspectRatio: '1',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                      transition: 'transform 0.3s ease'
                    }}
                    onClick={() => setSelectedPhoto(highlight.photo || null)}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <img
                      src={highlight.photo}
                      alt={highlight.highlight}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  </div>
                ))}
            </div>

            {/* Achievement List */}
            <div>
              {yesterdayData.yesterdayHighlights
                .filter(h => !h.photo)
                .slice(0, 3)
                .map((highlight, index) => (
                  <div
                    key={index}
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      padding: '1rem',
                      marginBottom: '0.5rem',
                      border: '1px solid rgba(255,255,255,0.2)'
                    }}
                  >
                    <div style={{
                      fontSize: '0.9rem',
                      color: 'white',
                      lineHeight: '1.4'
                    }}>
                      🏆 {highlight.highlight}
                    </div>
                    <div style={{
                      fontSize: '0.8rem',
                      color: 'rgba(255,255,255,0.7)',
                      marginTop: '0.25rem'
                    }}>
                      {new Date(highlight.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '2rem',
            color: 'rgba(255,255,255,0.8)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
            <p>No highlights from yesterday yet.</p>
            <p style={{ fontSize: '0.9rem' }}>
              Start capturing moments today!
            </p>
          </div>
        )}
      </div>

      {/* Today Section */}
      <div style={{
        background: 'linear-gradient(145deg, rgba(102, 126, 234, 0.2), rgba(102, 126, 234, 0.1))',
        borderRadius: '20px',
        padding: '2rem',
        border: '2px solid rgba(102, 126, 234, 0.3)',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <span style={{ fontSize: '2.5rem' }}>✨</span>
          <div>
            <h3 style={{
              margin: '0',
              fontSize: '1.8rem',
              fontWeight: '700',
              color: 'white'
            }}>
              Today
            </h3>
            <p style={{
              margin: '0',
              fontSize: '1rem',
              color: 'rgba(255,255,255,0.8)'
            }}>
              {formatDate(currentDate)}
            </p>
          </div>
        </div>

        {/* Today's Schedule Timeline */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{
            color: 'white',
            fontSize: '1.3rem',
            marginBottom: '1rem'
          }}>
            📋 Today's Schedule
          </h4>
          
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {todayPreview.map((activity, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.75rem',
                  marginBottom: '0.5rem',
                  background: activity.status === 'current' 
                    ? 'rgba(255, 193, 7, 0.2)' 
                    : 'rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  border: activity.status === 'current' 
                    ? '2px solid rgba(255, 193, 7, 0.5)' 
                    : '1px solid rgba(255,255,255,0.2)',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{
                  fontSize: '1.5rem',
                  width: '40px',
                  textAlign: 'center'
                }}>
                  {activity.status === 'current' ? '⚡' : activity.icon}
                </div>
                
                <div style={{ flex: '1' }}>
                  <div style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: 'white',
                    marginBottom: '0.25rem'
                  }}>
                    {activity.activityName}
                  </div>
                  <div style={{
                    fontSize: '0.8rem',
                    color: 'rgba(255,255,255,0.8)'
                  }}>
                    {activity.startTime} • {activity.duration} min
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span style={{
                    color: getStatusColor(activity.status || 'upcoming'),
                    fontSize: '1.2rem'
                  }}>
                    {getStatusIcon(activity.status || 'upcoming')}
                  </span>
                  {activity.isSpecial && (
                    <span style={{
                      background: 'linear-gradient(135deg, #ff6b6b, #ff8e53)',
                      color: 'white',
                      padding: '2px 6px',
                      borderRadius: '8px',
                      fontSize: '0.7rem',
                      fontWeight: '600'
                    }}>
                      SPECIAL
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h4 style={{
            color: 'white',
            fontSize: '1.3rem',
            marginBottom: '1rem'
          }}>
            📸 Capture the Moment
          </h4>
          
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            marginBottom: '1rem'
          }}>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              style={{
                background: 'linear-gradient(145deg, #28a745, #20c997)',
                border: 'none',
                color: 'white',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
                flex: '1',
                boxShadow: '0 4px 15px rgba(40, 167, 69, 0.3)'
              }}
            >
              📷 {isUploading ? 'Uploading...' : 'Add Photo'}
            </button>
            
            <button
              onClick={() => {
                const text = prompt('What achievement would you like to record?');
                if (text) addQuickAchievement(text);
              }}
              style={{
                background: 'linear-gradient(145deg, #ffc107, #e0a800)',
                border: 'none',
                color: 'white',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
                flex: '1',
                boxShadow: '0 4px 15px rgba(255, 193, 7, 0.3)'
              }}
            >
              🏆 Add Achievement
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handlePhotoUpload}
          />

          {/* Student Count */}
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '12px',
            padding: '1rem',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '2rem',
              marginBottom: '0.5rem'
            }}>
              👥
            </div>
            <div style={{
              fontSize: '1.1rem',
              fontWeight: '600',
              color: 'white'
            }}>
              {students.length} Students • {staff.length} Staff
            </div>
            <div style={{
              fontSize: '0.9rem',
              color: 'rgba(255,255,255,0.8)',
              marginTop: '0.25rem'
            }}>
              Ready for a great day!
            </div>
          </div>
        </div>
      </div>

      {/* Tomorrow Section */}
      <div style={{
        background: 'linear-gradient(145deg, rgba(138, 43, 226, 0.2), rgba(138, 43, 226, 0.1))',
        borderRadius: '20px',
        padding: '2rem',
        border: '2px solid rgba(138, 43, 226, 0.3)',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <span style={{ fontSize: '2.5rem' }}>🔮</span>
          <div>
            <h3 style={{
              margin: '0',
              fontSize: '1.8rem',
              fontWeight: '700',
              color: 'white'
            }}>
              Tomorrow
            </h3>
            <p style={{
              margin: '0',
              fontSize: '1rem',
              color: 'rgba(255,255,255,0.8)'
            }}>
              {formatDate(new Date(currentDate.getTime() + 24 * 60 * 60 * 1000))}
            </p>
          </div>
        </div>

        {tomorrowPreview && (
          <div>
            {/* Tomorrow's Activities Preview */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{
                color: 'white',
                fontSize: '1.3rem',
                marginBottom: '1rem'
              }}>
                🗓️ Tomorrow We Will...
              </h4>
              
              {tomorrowPreview.topActivities.length > 0 ? (
                <div>
                  {tomorrowPreview.topActivities.map((activity, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '0.75rem',
                        marginBottom: '0.5rem',
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        border: '1px solid rgba(255,255,255,0.2)'
                      }}
                    >
                      <div style={{
                        fontSize: '1.3rem',
                        width: '35px',
                        textAlign: 'center'
                      }}>
                        {activity.icon}
                      </div>
                      
                      <div style={{ flex: '1' }}>
                        <div style={{
                          fontSize: '1rem',
                          fontWeight: '600',
                          color: 'white'
                        }}>
                          {activity.name}
                        </div>
                        <div style={{
                          fontSize: '0.8rem',
                          color: 'rgba(255,255,255,0.8)'
                        }}>
                          Starting around {activity.startTime}
                        </div>
                      </div>

                      {activity.isSpecial && (
                        <span style={{
                          background: 'linear-gradient(135deg, #e91e63, #ad1457)',
                          color: 'white',
                          padding: '2px 6px',
                          borderRadius: '8px',
                          fontSize: '0.7rem',
                          fontWeight: '600'
                        }}>
                          SPECIAL
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '2rem',
                  color: 'rgba(255,255,255,0.8)'
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📋</div>
                  <p>Schedule to be determined</p>
                </div>
              )}
            </div>

            {/* Preparation List */}
            <div>
              <h4 style={{
                color: 'white',
                fontSize: '1.3rem',
                marginBottom: '1rem'
              }}>
                🎯 Let's Prepare
              </h4>
              
              <div style={{
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '1.5rem',
                border: '1px solid rgba(255,255,255,0.2)'
              }}>
                {tomorrowPreview.preparation.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      marginBottom: index < tomorrowPreview.preparation.length - 1 ? '0.75rem' : '0',
                      fontSize: '0.9rem',
                      color: 'white'
                    }}
                  >
                    <span style={{
                      color: '#8a2be2',
                      fontSize: '1rem'
                    }}>
                      ✨
                    </span>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Excitement Builder */}
            <div style={{
              marginTop: '1.5rem',
              textAlign: 'center',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '1.5rem',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <div style={{
                fontSize: '2rem',
                marginBottom: '0.5rem'
              }}>
                🌟
              </div>
              <div style={{
                fontSize: '1.1rem',
                fontWeight: '600',
                color: 'white',
                marginBottom: '0.5rem'
              }}>
                Tomorrow will be amazing!
              </div>
              <div style={{
                fontSize: '0.9rem',
                color: 'rgba(255,255,255,0.8)',
                lineHeight: '1.4'
              }}>
                Get ready for another day of learning, growing, and having fun together!
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Photo Lightbox */}
      {selectedPhoto && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '2rem'
          }}
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            style={{
              maxWidth: '90%',
              maxHeight: '90%',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedPhoto}
              alt="Enlarged photo"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                borderRadius: '12px'
              }}
            />
            <button
              onClick={() => setSelectedPhoto(null)}
              style={{
                position: 'absolute',
                top: '-10px',
                right: '-10px',
                background: 'rgba(0,0,0,0.7)',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                color: 'white',
                fontSize: '1.5rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreeDayView;