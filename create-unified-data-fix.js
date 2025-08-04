// Create proper unified data structure for Visual Schedule Builder
// This script creates the unified data in the exact format expected by the system

console.log('🚀 Creating unified data structure...');

// Create the unified data in the exact format expected by DataMigrationManager
const unifiedData = {
  students: {
    'student1': {
      id: 'student1',
      name: 'Emma Wilson',
      grade: 'Kindergarten',
      photo: undefined,
      photoFileName: undefined,
      isActive: true,
      workingStyle: 'collaborative',
      accommodations: ['Visual supports', 'Extra time'],
      goals: ['Will identify letters A-Z with 90% accuracy', 'Will read 25 sight words with 80% accuracy'],
      behaviorNotes: 'Responds well to positive reinforcement',
      medicalNotes: '',
      parentName: 'Sarah Wilson',
      parentEmail: 'sarah.wilson@email.com',
      parentPhone: '(555) 123-4567',
      emergencyContact: 'Sarah Wilson - (555) 123-4567',
      resourceInfo: {
        attendsResource: false,
        resourceType: '',
        resourceTeacher: '',
        timeframe: ''
      },
      preferredPartners: [],
      avoidPartners: [],
      iepData: {
        hasIEP: true,
        goals: [
          {
            id: 'goal1_emma',
            studentId: 'student1',
            title: 'Letter Recognition',
            description: 'Will identify letters A-Z with 90% accuracy',
            shortTermObjective: 'Identify 5 new letters each week',
            domain: 'academic',
            measurementType: 'percentage',
            criteria: '90% accuracy over 3 consecutive sessions',
            target: 90,
            currentProgress: 75,
            priority: 'high',
            dateCreated: '2025-01-15',
            isActive: true,
            linkedActivityIds: []
          },
          {
            id: 'goal2_emma',
            studentId: 'student1',
            title: 'Sight Word Reading',
            description: 'Will read 25 sight words with 80% accuracy',
            shortTermObjective: 'Read 5 new sight words each week',
            domain: 'academic',
            measurementType: 'percentage',
            criteria: '80% accuracy over 3 consecutive sessions',
            target: 80,
            currentProgress: 60,
            priority: 'high',
            dateCreated: '2025-01-15',
            isActive: true,
            linkedActivityIds: []
          }
        ],
        dataPoints: [
          {
            id: 'dp1_emma',
            goalId: 'goal1_emma',
            studentId: 'student1',
            date: '2025-01-20',
            time: '09:30',
            value: 18,
            totalOpportunities: 26,
            notes: 'Great progress with letters M, N, O',
            context: 'Morning literacy center',
            collector: 'Ms. Johnson',
            photos: [],
            voiceNotes: [],
            created_at: '2025-01-20T09:30:00.000Z'
          },
          {
            id: 'dp2_emma',
            goalId: 'goal2_emma',
            studentId: 'student1',
            date: '2025-01-20',
            time: '10:15',
            value: 12,
            totalOpportunities: 20,
            notes: 'Struggled with "where" and "when"',
            context: 'Reading group',
            collector: 'Ms. Johnson',
            photos: [],
            voiceNotes: [],
            created_at: '2025-01-20T10:15:00.000Z'
          }
        ],
        caseManager: 'Ms. Johnson',
        iepStartDate: '2025-01-15',
        iepEndDate: '2026-01-15',
        relatedServices: []
      },
      calendarData: {
        behaviorCommitments: [],
        independentChoices: [],
        dailyHighlights: []
      },
      progressData: {
        currentGoalProgress: {
          'goal1_emma': 75,
          'goal2_emma': 60
        },
        recentDataPoints: [
          {
            id: 'dp2_emma',
            goalId: 'goal2_emma',
            studentId: 'student1',
            date: '2025-01-20',
            time: '10:15',
            value: 12,
            totalOpportunities: 20,
            notes: 'Struggled with "where" and "when"',
            context: 'Reading group',
            collector: 'Ms. Johnson',
            photos: [],
            voiceNotes: [],
            created_at: '2025-01-20T10:15:00.000Z'
          },
          {
            id: 'dp1_emma',
            goalId: 'goal1_emma',
            studentId: 'student1',
            date: '2025-01-20',
            time: '09:30',
            value: 18,
            totalOpportunities: 26,
            notes: 'Great progress with letters M, N, O',
            context: 'Morning literacy center',
            collector: 'Ms. Johnson',
            photos: [],
            voiceNotes: [],
            created_at: '2025-01-20T09:30:00.000Z'
          }
        ],
        trends: {
          'goal1_emma': 'improving',
          'goal2_emma': 'maintaining'
        },
        lastAssessment: '2025-01-20'
      },
      createdAt: '2025-01-15T00:00:00.000Z',
      updatedAt: new Date().toISOString(),
      version: '2.0.0'
    },
    'student2': {
      id: 'student2',
      name: 'Marcus Johnson',
      grade: '1st Grade',
      photo: undefined,
      photoFileName: undefined,
      isActive: true,
      workingStyle: 'independent',
      accommodations: ['Movement breaks', 'Fidget tools'],
      goals: ['Will count to 100 by 1s, 5s, and 10s', 'Will sit for 15 minutes during instruction'],
      behaviorNotes: 'Works best with clear structure',
      medicalNotes: 'ADHD - takes medication at lunch',
      parentName: 'David Johnson',
      parentEmail: 'david.johnson@email.com',
      parentPhone: '(555) 234-5678',
      emergencyContact: 'David Johnson - (555) 234-5678',
      resourceInfo: {
        attendsResource: true,
        resourceType: 'Speech Therapy',
        resourceTeacher: 'Ms. Parker',
        timeframe: '10:00-10:30 AM'
      },
      preferredPartners: [],
      avoidPartners: [],
      iepData: {
        hasIEP: true,
        goals: [
          {
            id: 'goal1_marcus',
            studentId: 'student2',
            title: 'Math Counting',
            description: 'Will count to 100 by 1s, 5s, and 10s',
            shortTermObjective: 'Count by 10s to 100 with 90% accuracy',
            domain: 'academic',
            measurementType: 'percentage',
            criteria: '90% accuracy over 3 consecutive sessions',
            target: 90,
            currentProgress: 85,
            priority: 'high',
            dateCreated: '2025-01-15',
            isActive: true,
            linkedActivityIds: []
          },
          {
            id: 'goal2_marcus',
            studentId: 'student2',
            title: 'Attention Span',
            description: 'Will sit for 15 minutes during instruction',
            shortTermObjective: 'Increase sitting time by 2 minutes each week',
            domain: 'behavioral',
            measurementType: 'duration',
            criteria: '15 minutes with minimal prompting',
            target: 15,
            currentProgress: 12,
            priority: 'medium',
            dateCreated: '2025-01-15',
            isActive: true,
            linkedActivityIds: []
          }
        ],
        dataPoints: [
          {
            id: 'dp1_marcus',
            goalId: 'goal1_marcus',
            studentId: 'student2',
            date: '2025-01-20',
            time: '11:00',
            value: 85,
            totalOpportunities: 100,
            notes: 'Excellent counting by 10s, needs work on 5s',
            context: 'Math center',
            collector: 'Ms. Smith',
            photos: [],
            voiceNotes: [],
            created_at: '2025-01-20T11:00:00.000Z'
          },
          {
            id: 'dp2_marcus',
            goalId: 'goal2_marcus',
            studentId: 'student2',
            date: '2025-01-20',
            time: '14:30',
            value: 12,
            totalOpportunities: 15,
            notes: 'Used fidget tool, stayed focused',
            context: 'Science lesson',
            collector: 'Ms. Smith',
            photos: [],
            voiceNotes: [],
            created_at: '2025-01-20T14:30:00.000Z'
          }
        ],
        caseManager: 'Ms. Smith',
        iepStartDate: '2025-01-15',
        iepEndDate: '2026-01-15',
        relatedServices: ['Speech Therapy']
      },
      calendarData: {
        behaviorCommitments: [],
        independentChoices: [],
        dailyHighlights: []
      },
      progressData: {
        currentGoalProgress: {
          'goal1_marcus': 85,
          'goal2_marcus': 12
        },
        recentDataPoints: [
          {
            id: 'dp2_marcus',
            goalId: 'goal2_marcus',
            studentId: 'student2',
            date: '2025-01-20',
            time: '14:30',
            value: 12,
            totalOpportunities: 15,
            notes: 'Used fidget tool, stayed focused',
            context: 'Science lesson',
            collector: 'Ms. Smith',
            photos: [],
            voiceNotes: [],
            created_at: '2025-01-20T14:30:00.000Z'
          },
          {
            id: 'dp1_marcus',
            goalId: 'goal1_marcus',
            studentId: 'student2',
            date: '2025-01-20',
            time: '11:00',
            value: 85,
            totalOpportunities: 100,
            notes: 'Excellent counting by 10s, needs work on 5s',
            context: 'Math center',
            collector: 'Ms. Smith',
            photos: [],
            voiceNotes: [],
            created_at: '2025-01-20T11:00:00.000Z'
          }
        ],
        trends: {
          'goal1_marcus': 'improving',
          'goal2_marcus': 'maintaining'
        },
        lastAssessment: '2025-01-20'
      },
      createdAt: '2025-01-15T00:00:00.000Z',
      updatedAt: new Date().toISOString(),
      version: '2.0.0'
    },
    'student3': {
      id: 'student3',
      name: 'Sofia Rodriguez',
      grade: '2nd Grade',
      photo: undefined,
      photoFileName: undefined,
      isActive: true,
      workingStyle: 'collaborative',
      accommodations: ['Audio cues', 'Communication device'],
      goals: ['Will use AAC device to request items', 'Will follow 2-step directions independently'],
      behaviorNotes: 'Enjoys helping other students',
      medicalNotes: 'Uses AAC device for communication',
      parentName: 'Maria Rodriguez',
      parentEmail: 'maria.rodriguez@email.com',
      parentPhone: '(555) 345-6789',
      emergencyContact: 'Maria Rodriguez - (555) 345-6789',
      resourceInfo: {
        attendsResource: true,
        resourceType: 'Occupational Therapy',
        resourceTeacher: 'Mrs. Thompson',
        timeframe: '1:00-1:30 PM'
      },
      preferredPartners: [],
      avoidPartners: [],
      iepData: {
        hasIEP: true,
        goals: [
          {
            id: 'goal1_sofia',
            studentId: 'student3',
            title: 'AAC Device Usage',
            description: 'Will use AAC device to request items',
            shortTermObjective: 'Make 10 requests per day using AAC device',
            domain: 'social-emotional',
            measurementType: 'frequency',
            criteria: '10 requests per day for 5 consecutive days',
            target: 10,
            currentProgress: 7,
            priority: 'high',
            dateCreated: '2025-01-15',
            isActive: true,
            linkedActivityIds: []
          },
          {
            id: 'goal2_sofia',
            studentId: 'student3',
            title: 'Following Directions',
            description: 'Will follow 2-step directions independently',
            shortTermObjective: 'Follow 2-step directions with 80% accuracy',
            domain: 'behavioral',
            measurementType: 'percentage',
            criteria: '80% accuracy over 3 consecutive sessions',
            target: 80,
            currentProgress: 65,
            priority: 'medium',
            dateCreated: '2025-01-15',
            isActive: true,
            linkedActivityIds: []
          }
        ],
        dataPoints: [
          {
            id: 'dp1_sofia',
            goalId: 'goal1_sofia',
            studentId: 'student3',
            date: '2025-01-20',
            time: '10:45',
            value: 8,
            totalOpportunities: 10,
            notes: 'Great improvement with requesting help',
            context: 'Art class',
            collector: 'Ms. Parker',
            photos: [],
            voiceNotes: [],
            created_at: '2025-01-20T10:45:00.000Z'
          },
          {
            id: 'dp2_sofia',
            goalId: 'goal2_sofia',
            studentId: 'student3',
            date: '2025-01-20',
            time: '13:15',
            value: 6,
            totalOpportunities: 10,
            notes: 'Needed prompting for second step',
            context: 'Classroom cleanup',
            collector: 'Ms. Parker',
            photos: [],
            voiceNotes: [],
            created_at: '2025-01-20T13:15:00.000Z'
          }
        ],
        caseManager: 'Ms. Parker',
        iepStartDate: '2025-01-15',
        iepEndDate: '2026-01-15',
        relatedServices: ['Occupational Therapy', 'Speech Therapy']
      },
      calendarData: {
        behaviorCommitments: [],
        independentChoices: [],
        dailyHighlights: []
      },
      progressData: {
        currentGoalProgress: {
          'goal1_sofia': 7,
          'goal2_sofia': 65
        },
        recentDataPoints: [
          {
            id: 'dp2_sofia',
            goalId: 'goal2_sofia',
            studentId: 'student3',
            date: '2025-01-20',
            time: '13:15',
            value: 6,
            totalOpportunities: 10,
            notes: 'Needed prompting for second step',
            context: 'Classroom cleanup',
            collector: 'Ms. Parker',
            photos: [],
            voiceNotes: [],
            created_at: '2025-01-20T13:15:00.000Z'
          },
          {
            id: 'dp1_sofia',
            goalId: 'goal1_sofia',
            studentId: 'student3',
            date: '2025-01-20',
            time: '10:45',
            value: 8,
            totalOpportunities: 10,
            notes: 'Great improvement with requesting help',
            context: 'Art class',
            collector: 'Ms. Parker',
            photos: [],
            voiceNotes: [],
            created_at: '2025-01-20T10:45:00.000Z'
          }
        ],
        trends: {
          'goal1_sofia': 'improving',
          'goal2_sofia': 'maintaining'
        },
        lastAssessment: '2025-01-20'
      },
      createdAt: '2025-01-15T00:00:00.000Z',
      updatedAt: new Date().toISOString(),
      version: '2.0.0'
    }
  },
  staff: {},
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
    backupLocation: 'localStorage-backup-' + Date.now()
  }
};

// Save the unified data
localStorage.setItem('visual-schedule-builder-unified-data', JSON.stringify(unifiedData));

// Create migration log
const migrationLog = [
  `[${new Date().toISOString()}] Emergency data population started`,
  `[${new Date().toISOString()}] Created unified data structure with proper format`,
  `[${new Date().toISOString()}] Added 3 test students with complete IEP data`,
  `[${new Date().toISOString()}] Added 6 IEP goals total`,
  `[${new Date().toISOString()}] Added 6 data points total`,
  `[${new Date().toISOString()}] Created proper progress tracking data`,
  `[${new Date().toISOString()}] Emergency population completed successfully`
];

localStorage.setItem('visual-schedule-builder-migration-log', JSON.stringify(migrationLog));

// Also create legacy backup for compatibility
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

console.log('✅ Unified data created successfully!');
console.log('📊 Summary:');
console.log(`   - Students: ${Object.keys(unifiedData.students).length}`);
console.log(`   - Total Goals: ${Object.values(unifiedData.students).reduce((total, s) => total + s.iepData.goals.length, 0)}`);
console.log(`   - Total Data Points: ${Object.values(unifiedData.students).reduce((total, s) => total + s.iepData.dataPoints.length, 0)}`);
console.log('🔄 Refreshing page...');

// Refresh the page to load the new data
window.location.reload();
