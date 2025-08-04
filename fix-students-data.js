// Immediate fix for Visual Schedule Builder - Add students to unified data
// This script adds test students to the existing unified data structure

console.log('🚀 Starting immediate fix for Visual Schedule Builder...');

// Check if we're in a browser environment
if (typeof localStorage === 'undefined') {
  console.error('❌ This script must be run in a browser environment with localStorage');
  process.exit(1);
}

// Get the existing unified data
const existingDataStr = localStorage.getItem('visual-schedule-builder-unified-data');
let existingData;

if (existingDataStr) {
  try {
    existingData = JSON.parse(existingDataStr);
    console.log('✅ Found existing unified data structure');
    console.log('Current students:', existingData.students?.length || 0);
  } catch (error) {
    console.error('❌ Error parsing existing unified data:', error);
    process.exit(1);
  }
} else {
  console.log('⚠️ No existing unified data found, creating new structure...');
  existingData = {
    students: [],
    staff: [],
    activities: [],
    calendar: {
      behaviorCommitments: [],
      dailyHighlights: [],
      independentChoices: []
    },
    settings: {},
    metadata: {
      version: '2.0',
      migratedAt: new Date().toISOString(),
      totalGoals: 0,
      totalDataPoints: 0,
      totalStaff: 0,
      totalActivities: 0
    }
  };
}

// Add test students to the existing structure
const testStudents = [
  {
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
          dataPoints: 12,
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
          dataPoints: 8,
          linkedActivityIds: []
        }
      ],
      dataCollection: [
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
    }
  },
  {
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
          dataPoints: 15,
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
          dataPoints: 10,
          linkedActivityIds: []
        }
      ],
      dataCollection: [
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
    }
  },
  {
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
          dataPoints: 20,
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
          dataPoints: 14,
          linkedActivityIds: []
        }
      ],
      dataCollection: [
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
    }
  }
];

// Add students to existing data
existingData.students = testStudents;

// Update metadata
existingData.metadata = {
  version: '2.0',
  migratedAt: new Date().toISOString(),
  totalGoals: testStudents.reduce((total, s) => total + s.iepData.goals.length, 0),
  totalDataPoints: testStudents.reduce((total, s) => total + s.iepData.dataCollection.length, 0),
  totalStaff: existingData.staff?.length || 0,
  totalActivities: existingData.activities?.length || 0
};

// Save back to storage
localStorage.setItem('visual-schedule-builder-unified-data', JSON.stringify(existingData));

console.log("✅ Students added to unified data!");
console.log(`📊 Summary:`);
console.log(`   - Students: ${existingData.students.length}`);
console.log(`   - Total Goals: ${existingData.metadata.totalGoals}`);
console.log(`   - Total Data Points: ${existingData.metadata.totalDataPoints}`);

// Also add to legacy format as backup
localStorage.setItem('students', JSON.stringify(existingData.students));

console.log("✅ Legacy backup created!");
console.log("🔄 Please refresh the page to see the changes.");

// Log the new unified data structure for verification
console.log("📋 New unified data:", existingData);
