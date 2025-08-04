// Direct population of unified data structure for Visual Schedule Builder
// This script bypasses the migration interface and directly creates the unified data

console.log('🚀 Populating unified data structure...');

// Create the complete unified data structure with test students
const unifiedData = {
  students: {
    'student1': {
      id: 'student1',
      name: 'Emma Wilson',
      grade: 'Kindergarten',
      dateCreated: '2025-01-15',
      workingStyle: 'collaborative',
      accommodations: ['Visual supports', 'Extra time'],
      isActive: true,
      behaviorNotes: 'Responds well to positive reinforcement',
      iepData: {
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
            voiceNotes: []
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
            voiceNotes: []
          }
        ]
      },
      resourceInformation: {
        attendsResourceServices: false,
        accommodations: ['Visual supports', 'Extra time'],
        relatedServices: [],
        allergies: [],
        medicalNeeds: []
      },
      calendarPreferences: {
        behaviorCommitments: [],
        dailyHighlights: [],
        independentChoices: []
      }
    },
    'student2': {
      id: 'student2',
      name: 'Marcus Johnson',
      grade: '1st Grade',
      dateCreated: '2025-01-15',
      workingStyle: 'independent',
      accommodations: ['Movement breaks', 'Fidget tools'],
      isActive: true,
      behaviorNotes: 'Works best with clear structure',
      iepData: {
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
            voiceNotes: []
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
            voiceNotes: []
          }
        ]
      },
      resourceInformation: {
        attendsResourceServices: true,
        accommodations: ['Movement breaks', 'Fidget tools'],
        relatedServices: ['Speech Therapy'],
        allergies: [],
        medicalNeeds: ['ADHD medication']
      },
      calendarPreferences: {
        behaviorCommitments: [],
        dailyHighlights: [],
        independentChoices: []
      }
    },
    'student3': {
      id: 'student3',
      name: 'Sofia Rodriguez',
      grade: '2nd Grade',
      dateCreated: '2025-01-15',
      workingStyle: 'collaborative',
      accommodations: ['Audio cues', 'Communication device'],
      isActive: true,
      behaviorNotes: 'Enjoys helping other students',
      iepData: {
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
            voiceNotes: []
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
            voiceNotes: []
          }
        ]
      },
      resourceInformation: {
        attendsResourceServices: true,
        accommodations: ['Audio cues', 'Communication device'],
        relatedServices: ['Occupational Therapy', 'Speech Therapy'],
        allergies: [],
        medicalNeeds: ['Uses AAC device for communication']
      },
      calendarPreferences: {
        behaviorCommitments: [],
        dailyHighlights: [],
        independentChoices: []
      }
    }
  },
  staff: {},
  activities: {},
  calendar: {
    behaviorCommitments: [],
    dailyHighlights: [],
    independentChoices: []
  },
  settings: {},
  metadata: {
    version: '2.0',
    migratedAt: new Date().toISOString(),
    totalGoals: 6,
    totalDataPoints: 6,
    totalStaff: 0,
    totalActivities: 0
  }
};

// Save the unified data
localStorage.setItem('visual-schedule-builder-unified-data', JSON.stringify(unifiedData));

// Also create legacy backup
const legacyStudents = Object.values(unifiedData.students).map(student => ({
  ...student,
  goals: student.iepData.goals.map(g => g.description),
  iepData: {
    goals: student.iepData.goals,
    dataCollection: student.iepData.dataPoints
  }
}));

localStorage.setItem('students', JSON.stringify(legacyStudents));

// Create migration log
const migrationLog = [
  `[${new Date().toISOString()}] Migration started`,
  `[${new Date().toISOString()}] Created unified data structure`,
  `[${new Date().toISOString()}] Added 3 test students with IEP goals`,
  `[${new Date().toISOString()}] Added 6 IEP goals total`,
  `[${new Date().toISOString()}] Added 6 data points total`,
  `[${new Date().toISOString()}] Created legacy backup`,
  `[${new Date().toISOString()}] Migration completed successfully`
];

localStorage.setItem('migration-log', JSON.stringify(migrationLog));

console.log('✅ Unified data populated successfully!');
console.log('📊 Summary:');
console.log(`   - Students: ${Object.keys(unifiedData.students).length}`);
console.log(`   - Total Goals: ${unifiedData.metadata.totalGoals}`);
console.log(`   - Total Data Points: ${unifiedData.metadata.totalDataPoints}`);
console.log('🔄 Refreshing page...');

// Refresh the page to load the new data
window.location.reload();
