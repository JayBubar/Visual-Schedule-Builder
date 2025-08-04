// Complete Storage Reset and Demo Data Population
// This script will clear all legacy data and create a comprehensive demo dataset

console.log('🧹 Starting complete storage reset and demo data creation...');

// Step 1: Clear ALL existing localStorage data
function clearAllLegacyData() {
  console.log('🗑️ Clearing all legacy data...');
  
  const keysToRemove = [];
  
  // Collect all keys that might contain legacy data
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (
      key.includes('student') ||
      key.includes('staff') ||
      key.includes('iep') ||
      key.includes('goal') ||
      key.includes('data') ||
      key.includes('calendar') ||
      key.includes('behavior') ||
      key.includes('highlight') ||
      key.includes('choice') ||
      key.includes('migration') ||
      key.includes('visual-schedule') ||
      key.includes('vsb_') ||
      key === 'students' ||
      key === 'staff_members' ||
      key === 'custom_activities' ||
      key === 'iepGoals' ||
      key === 'iepDataPoints'
    )) {
      keysToRemove.push(key);
    }
  }
  
  // Remove all legacy keys
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log(`   ❌ Removed: ${key}`);
  });
  
  console.log(`✅ Cleared ${keysToRemove.length} legacy data keys`);
}

// Step 2: Create comprehensive demo data
function createDemoData() {
  console.log('🎭 Creating comprehensive demo data...');
  
  const currentDate = new Date().toISOString();
  const currentDateOnly = currentDate.split('T')[0];
  
  // Create 4 Staff Members
  const demoStaff = [
    {
      id: 'staff_lead_001',
      name: 'Sarah Johnson',
      role: 'Lead Teacher',
      email: 'sarah.johnson@school.edu',
      phone: '(555) 123-4567',
      photo: undefined,
      isActive: true,
      dateCreated: currentDateOnly,
      specialties: ['Classroom Management', 'Curriculum Development', 'IEP Coordination'],
      notes: 'Experienced lead teacher with 12 years in special education',
      isResourceTeacher: false,
      isRelatedArtsTeacher: false,
      permissions: {
        canEditStudents: true,
        canViewReports: true,
        canManageGoals: true
      }
    },
    {
      id: 'staff_assistant_001',
      name: 'Michael Rodriguez',
      role: 'Teacher Assistant',
      email: 'michael.rodriguez@school.edu',
      phone: '(555) 234-5678',
      photo: undefined,
      isActive: true,
      dateCreated: currentDateOnly,
      specialties: ['Behavior Support', 'Data Collection', 'Small Group Instruction'],
      notes: 'Dedicated assistant with expertise in behavioral interventions',
      isResourceTeacher: false,
      isRelatedArtsTeacher: false,
      permissions: {
        canEditStudents: false,
        canViewReports: true,
        canManageGoals: false
      }
    },
    {
      id: 'staff_arts_001',
      name: 'Emily Chen',
      role: 'Related Arts Teacher',
      email: 'emily.chen@school.edu',
      phone: '(555) 345-6789',
      photo: undefined,
      isActive: true,
      dateCreated: currentDateOnly,
      specialties: ['Art Therapy', 'Music Integration', 'Creative Expression'],
      notes: 'Specializes in using arts to support learning and emotional development',
      isResourceTeacher: false,
      isRelatedArtsTeacher: true,
      permissions: {
        canEditStudents: false,
        canViewReports: true,
        canManageGoals: false
      }
    },
    {
      id: 'staff_resource_001',
      name: 'Dr. Amanda Thompson',
      role: 'Resource Teacher',
      email: 'amanda.thompson@school.edu',
      phone: '(555) 456-7890',
      photo: undefined,
      isActive: true,
      dateCreated: currentDateOnly,
      specialties: ['Speech Therapy', 'Occupational Therapy', 'IEP Development'],
      notes: 'Licensed speech-language pathologist and special education coordinator',
      isResourceTeacher: true,
      isRelatedArtsTeacher: false,
      permissions: {
        canEditStudents: true,
        canViewReports: true,
        canManageGoals: true
      }
    }
  ];

  // Create 10 Students with comprehensive IEP data
  const demoStudents = [
    // Student 1: Emma Wilson - Kindergarten
    {
      id: 'student_001',
      name: 'Emma Wilson',
      grade: 'Kindergarten',
      photo: undefined,
      dateCreated: currentDateOnly,
      workingStyle: 'collaborative',
      accommodations: ['Visual supports', 'Extra time', 'Preferential seating'],
      goals: ['Letter recognition', 'Sight word reading', 'Fine motor skills'],
      parentName: 'Jennifer Wilson',
      parentEmail: 'jennifer.wilson@email.com',
      parentPhone: '(555) 111-2222',
      isActive: true,
      behaviorNotes: 'Responds well to positive reinforcement and visual cues',
      medicalNotes: 'No medical concerns',
      resourceInformation: {
        attendsResourceServices: true,
        accommodations: ['Visual supports', 'Extra time', 'Preferential seating'],
        relatedServices: ['Speech Therapy'],
        allergies: [],
        medicalNeeds: []
      },
      preferredPartners: ['Marcus Johnson'],
      avoidPartners: [],
      iepData: {
        goals: [
          {
            id: 'goal_emma_001',
            studentId: 'student_001',
            title: 'Letter Recognition',
            description: 'Will identify uppercase and lowercase letters A-Z with 90% accuracy',
            shortTermObjective: 'Identify 5 new letters each week with visual supports',
            domain: 'academic',
            measurementType: 'percentage',
            criteria: '90% accuracy over 3 consecutive sessions',
            target: 90,
            currentProgress: 75,
            priority: 'high',
            dateCreated: currentDateOnly,
            isActive: true,
            linkedActivityIds: []
          },
          {
            id: 'goal_emma_002',
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
            dateCreated: currentDateOnly,
            isActive: true,
            linkedActivityIds: []
          }
        ],
        dataCollection: [
          {
            id: 'data_emma_001',
            goalId: 'goal_emma_001',
            studentId: 'student_001',
            date: currentDateOnly,
            time: '09:30',
            value: 18,
            totalOpportunities: 26,
            notes: 'Great progress with letters M, N, O, P',
            context: 'Morning literacy center',
            collector: 'Sarah Johnson',
            photos: [],
            voiceNotes: []
          },
          {
            id: 'data_emma_002',
            goalId: 'goal_emma_002',
            studentId: 'student_001',
            date: currentDateOnly,
            time: '10:15',
            value: 12,
            totalOpportunities: 20,
            notes: 'Struggled with "where" and "when"',
            context: 'Reading group',
            collector: 'Sarah Johnson',
            photos: [],
            voiceNotes: []
          }
        ]
      }
    },
    
    // Student 2: Marcus Johnson - 1st Grade
    {
      id: 'student_002',
      name: 'Marcus Johnson',
      grade: '1st Grade',
      photo: undefined,
      dateCreated: currentDateOnly,
      workingStyle: 'independent',
      accommodations: ['Movement breaks', 'Fidget tools', 'Reduced distractions'],
      goals: ['Math counting', 'Attention span', 'Social skills'],
      parentName: 'David Johnson',
      parentEmail: 'david.johnson@email.com',
      parentPhone: '(555) 222-3333',
      isActive: true,
      behaviorNotes: 'Works best with clear structure and movement breaks',
      medicalNotes: 'ADHD - takes medication at lunch',
      resourceInformation: {
        attendsResourceServices: true,
        accommodations: ['Movement breaks', 'Fidget tools', 'Reduced distractions'],
        relatedServices: ['Occupational Therapy'],
        allergies: [],
        medicalNeeds: ['ADHD medication']
      },
      preferredPartners: ['Emma Wilson'],
      avoidPartners: [],
      iepData: {
        goals: [
          {
            id: 'goal_marcus_001',
            studentId: 'student_002',
            title: 'Math Counting Skills',
            description: 'Will count to 100 by 1s, 5s, and 10s with 85% accuracy',
            shortTermObjective: 'Count by 10s to 100 with visual supports',
            domain: 'academic',
            measurementType: 'percentage',
            criteria: '85% accuracy over 3 consecutive sessions',
            target: 85,
            currentProgress: 70,
            priority: 'high',
            dateCreated: currentDateOnly,
            isActive: true,
            linkedActivityIds: []
          },
          {
            id: 'goal_marcus_002',
            studentId: 'student_002',
            title: 'Sustained Attention',
            description: 'Will maintain attention to task for 15 minutes with minimal prompts',
            shortTermObjective: 'Increase attention span by 2 minutes each week',
            domain: 'behavioral',
            measurementType: 'duration',
            criteria: '15 minutes with 2 or fewer prompts',
            target: 15,
            currentProgress: 10,
            priority: 'medium',
            dateCreated: currentDateOnly,
            isActive: true,
            linkedActivityIds: []
          }
        ],
        dataCollection: [
          {
            id: 'data_marcus_001',
            goalId: 'goal_marcus_001',
            studentId: 'student_002',
            date: currentDateOnly,
            time: '11:00',
            value: 70,
            totalOpportunities: 100,
            notes: 'Good with counting by 10s, needs work on 5s',
            context: 'Math center',
            collector: 'Michael Rodriguez',
            photos: [],
            voiceNotes: []
          }
        ]
      }
    },

    // Student 3: Sofia Rodriguez - 2nd Grade
    {
      id: 'student_003',
      name: 'Sofia Rodriguez',
      grade: '2nd Grade',
      photo: undefined,
      dateCreated: currentDateOnly,
      workingStyle: 'collaborative',
      accommodations: ['Audio cues', 'Communication device', 'Extended time'],
      goals: ['AAC device usage', 'Following directions', 'Social interaction'],
      parentName: 'Maria Rodriguez',
      parentEmail: 'maria.rodriguez@email.com',
      parentPhone: '(555) 333-4444',
      isActive: true,
      behaviorNotes: 'Enjoys helping other students and group activities',
      medicalNotes: 'Uses AAC device for communication',
      resourceInformation: {
        attendsResourceServices: true,
        accommodations: ['Audio cues', 'Communication device', 'Extended time'],
        relatedServices: ['Speech Therapy', 'Occupational Therapy'],
        allergies: [],
        medicalNeeds: []
      },
      preferredPartners: ['Aiden Thompson'],
      avoidPartners: [],
      iepData: {
        goals: [
          {
            id: 'goal_sofia_001',
            studentId: 'student_003',
            title: 'AAC Device Communication',
            description: 'Will use AAC device to make 10 requests per day',
            shortTermObjective: 'Make 3 requests using AAC device during each activity',
            domain: 'social-emotional',
            measurementType: 'frequency',
            criteria: '10 requests per day for 5 consecutive days',
            target: 10,
            currentProgress: 7,
            priority: 'high',
            dateCreated: currentDateOnly,
            isActive: true,
            linkedActivityIds: []
          }
        ],
        dataCollection: [
          {
            id: 'data_sofia_001',
            goalId: 'goal_sofia_001',
            studentId: 'student_003',
            date: currentDateOnly,
            time: '10:45',
            value: 8,
            totalOpportunities: 10,
            notes: 'Great improvement with requesting help during art',
            context: 'Art class',
            collector: 'Emily Chen',
            photos: [],
            voiceNotes: []
          }
        ]
      }
    },

    // Student 4: Aiden Thompson - Kindergarten
    {
      id: 'student_004',
      name: 'Aiden Thompson',
      grade: 'Kindergarten',
      photo: undefined,
      dateCreated: currentDateOnly,
      workingStyle: 'independent',
      accommodations: ['Sensory breaks', 'Noise-canceling headphones', 'Structured routine'],
      goals: ['Social interaction', 'Sensory regulation', 'Academic engagement'],
      parentName: 'Robert Thompson',
      parentEmail: 'robert.thompson@email.com',
      parentPhone: '(555) 444-5555',
      isActive: true,
      behaviorNotes: 'Sensitive to sensory input, needs predictable routines',
      medicalNotes: 'Autism spectrum disorder, sensory processing differences',
      resourceInformation: {
        attendsResourceServices: true,
        accommodations: ['Sensory breaks', 'Noise-canceling headphones', 'Structured routine'],
        relatedServices: ['Occupational Therapy', 'Speech Therapy'],
        allergies: [],
        medicalNeeds: []
      },
      preferredPartners: ['Sofia Rodriguez'],
      avoidPartners: [],
      iepData: {
        goals: [
          {
            id: 'goal_aiden_001',
            studentId: 'student_004',
            title: 'Social Interaction',
            description: 'Will initiate interaction with peers 3 times per day',
            shortTermObjective: 'Use verbal or gestural greeting with one peer daily',
            domain: 'social-emotional',
            measurementType: 'frequency',
            criteria: '3 peer interactions per day for 1 week',
            target: 3,
            currentProgress: 2,
            priority: 'high',
            dateCreated: currentDateOnly,
            isActive: true,
            linkedActivityIds: []
          }
        ],
        dataCollection: [
          {
            id: 'data_aiden_001',
            goalId: 'goal_aiden_001',
            studentId: 'student_004',
            date: currentDateOnly,
            time: '14:30',
            value: 2,
            totalOpportunities: 3,
            notes: 'Initiated play with Sofia during free time',
            context: 'Free play',
            collector: 'Dr. Amanda Thompson',
            photos: [],
            voiceNotes: []
          }
        ]
      }
    },

    // Student 5: Lily Chen - 1st Grade
    {
      id: 'student_005',
      name: 'Lily Chen',
      grade: '1st Grade',
      photo: undefined,
      dateCreated: currentDateOnly,
      workingStyle: 'collaborative',
      accommodations: ['Visual schedules', 'Picture supports', 'Peer buddy'],
      goals: ['Reading comprehension', 'Math problem solving', 'Independence'],
      parentName: 'Wei Chen',
      parentEmail: 'wei.chen@email.com',
      parentPhone: '(555) 555-6666',
      isActive: true,
      behaviorNotes: 'Eager to learn, benefits from visual supports',
      medicalNotes: 'No medical concerns',
      resourceInformation: {
        attendsResourceServices: false,
        accommodations: ['Visual schedules', 'Picture supports', 'Peer buddy'],
        relatedServices: [],
        allergies: [],
        medicalNeeds: []
      },
      preferredPartners: ['Noah Davis'],
      avoidPartners: [],
      iepData: {
        goals: [
          {
            id: 'goal_lily_001',
            studentId: 'student_005',
            title: 'Reading Comprehension',
            description: 'Will answer 3 WH questions about a story with 80% accuracy',
            shortTermObjective: 'Answer who and what questions with picture supports',
            domain: 'academic',
            measurementType: 'percentage',
            criteria: '80% accuracy over 3 consecutive sessions',
            target: 80,
            currentProgress: 65,
            priority: 'high',
            dateCreated: currentDateOnly,
            isActive: true,
            linkedActivityIds: []
          }
        ],
        dataCollection: [
          {
            id: 'data_lily_001',
            goalId: 'goal_lily_001',
            studentId: 'student_005',
            date: currentDateOnly,
            time: '09:15',
            value: 6,
            totalOpportunities: 10,
            notes: 'Good with who questions, struggling with where',
            context: 'Reading group',
            collector: 'Sarah Johnson',
            photos: [],
            voiceNotes: []
          }
        ]
      }
    },

    // Student 6: Noah Davis - 2nd Grade
    {
      id: 'student_006',
      name: 'Noah Davis',
      grade: '2nd Grade',
      photo: undefined,
      dateCreated: currentDateOnly,
      workingStyle: 'independent',
      accommodations: ['Calculator', 'Extended time', 'Chunked assignments'],
      goals: ['Math computation', 'Written expression', 'Task completion'],
      parentName: 'Lisa Davis',
      parentEmail: 'lisa.davis@email.com',
      parentPhone: '(555) 666-7777',
      isActive: true,
      behaviorNotes: 'Perfectionist tendencies, needs encouragement to take risks',
      medicalNotes: 'Learning disability in mathematics',
      resourceInformation: {
        attendsResourceServices: true,
        accommodations: ['Calculator', 'Extended time', 'Chunked assignments'],
        relatedServices: ['Resource Support'],
        allergies: [],
        medicalNeeds: []
      },
      preferredPartners: ['Lily Chen'],
      avoidPartners: [],
      iepData: {
        goals: [
          {
            id: 'goal_noah_001',
            studentId: 'student_006',
            title: 'Math Computation',
            description: 'Will solve 2-digit addition problems with regrouping at 70% accuracy',
            shortTermObjective: 'Solve 1-digit addition with manipulatives',
            domain: 'academic',
            measurementType: 'percentage',
            criteria: '70% accuracy over 3 consecutive sessions',
            target: 70,
            currentProgress: 55,
            priority: 'high',
            dateCreated: currentDateOnly,
            isActive: true,
            linkedActivityIds: []
          }
        ],
        dataCollection: [
          {
            id: 'data_noah_001',
            goalId: 'goal_noah_001',
            studentId: 'student_006',
            date: currentDateOnly,
            time: '11:30',
            value: 11,
            totalOpportunities: 20,
            notes: 'Used manipulatives successfully for most problems',
            context: 'Math intervention',
            collector: 'Dr. Amanda Thompson',
            photos: [],
            voiceNotes: []
          }
        ]
      }
    },

    // Student 7: Zoe Martinez - Kindergarten
    {
      id: 'student_007',
      name: 'Zoe Martinez',
      grade: 'Kindergarten',
      photo: undefined,
      dateCreated: currentDateOnly,
      workingStyle: 'collaborative',
      accommodations: ['Bilingual support', 'Visual vocabulary cards', 'Extra processing time'],
      goals: ['English vocabulary', 'Phonemic awareness', 'Social communication'],
      parentName: 'Carlos Martinez',
      parentEmail: 'carlos.martinez@email.com',
      parentPhone: '(555) 777-8888',
      isActive: true,
      behaviorNotes: 'Bilingual learner, very social and eager to participate',
      medicalNotes: 'No medical concerns',
      resourceInformation: {
        attendsResourceServices: true,
        accommodations: ['Bilingual support', 'Visual vocabulary cards', 'Extra processing time'],
        relatedServices: ['ESL Support'],
        allergies: [],
        medicalNeeds: []
      },
      preferredPartners: ['Isabella Garcia'],
      avoidPartners: [],
      iepData: {
        goals: [
          {
            id: 'goal_zoe_001',
            studentId: 'student_007',
            title: 'English Vocabulary Development',
            description: 'Will use 50 English vocabulary words in context with 80% accuracy',
            shortTermObjective: 'Use 10 new English words each week in conversation',
            domain: 'academic',
            measurementType: 'percentage',
            criteria: '80% accuracy in using target vocabulary',
            target: 80,
            currentProgress: 45,
            priority: 'high',
            dateCreated: currentDateOnly,
            isActive: true,
            linkedActivityIds: []
          }
        ],
        dataCollection: [
          {
            id: 'data_zoe_001',
            goalId: 'goal_zoe_001',
            studentId: 'student_007',
            date: currentDateOnly,
            time: '13:00',
            value: 8,
            totalOpportunities: 15,
            notes: 'Great progress with color and number words',
            context: 'ESL group',
            collector: 'Emily Chen',
            photos: [],
            voiceNotes: []
          }
        ]
      }
    },

    // Student 8: Isabella Garcia - 1st Grade
    {
      id: 'student_008',
      name: 'Isabella Garcia',
      grade: '1st Grade',
      photo: undefined,
      dateCreated: currentDateOnly,
      workingStyle: 'collaborative',
      accommodations: ['Preferential seating', 'Frequent breaks', 'Positive reinforcement'],
      goals: ['On-task behavior', 'Following directions', 'Academic engagement'],
      parentName: 'Ana Garcia',
      parentEmail: 'ana.garcia@email.com',
      parentPhone: '(555) 888-9999',
      isActive: true,
      behaviorNotes: 'Benefits from consistent routines and positive feedback',
      medicalNotes: 'ADHD, anxiety',
      resourceInformation: {
        attendsResourceServices: true,
        accommodations: ['Preferential seating', 'Frequent breaks', 'Positive reinforcement'],
        relatedServices: ['Counseling'],
        allergies: [],
        medicalNeeds: ['ADHD medication']
      },
      preferredPartners: ['Zoe Martinez'],
      avoidPartners: [],
      iepData: {
        goals: [
          {
            id: 'goal_isabella_001',
            studentId: 'student_008',
            title: 'On-Task Behavior',
            description: 'Will remain on task for 10 minutes with 2 or fewer prompts',
            shortTermObjective: 'Stay focused during 5-minute activities',
            domain: 'behavioral',
            measurementType: 'duration',
            criteria: '10 minutes with minimal prompting',
            target: 10,
            currentProgress: 6,
            priority: 'high',
            dateCreated: currentDateOnly,
            isActive: true,
            linkedActivityIds: []
          }
        ],
        dataCollection: [
          {
            id: 'data_isabella_001',
            goalId: 'goal_isabella_001',
            studentId: 'student_008',
            date: currentDateOnly,
            time: '10:00',
            value: 7,
            totalOpportunities: 10,
            notes: 'Stayed focused during math activity with 1 reminder',
            context: 'Math center',
            collector: 'Michael Rodriguez',
            photos: [],
            voiceNotes: []
          }
        ]
      }
    },

    // Student 9: Ethan Brown - 2nd Grade
    {
      id: 'student_009',
      name: 'Ethan Brown',
      grade: '2nd Grade',
      photo: undefined,
      dateCreated: currentDateOnly,
      workingStyle: 'independent',
      accommodations: ['Assistive technology', 'Large print materials', 'Audio books'],
      goals: ['Reading fluency', 'Writing mechanics', 'Technology skills'],
      parentName: 'Michelle Brown',
      parentEmail: 'michelle.brown@email.com',
      parentPhone: '(555) 999-0000',
      isActive: true,
      behaviorNotes: 'Very motivated learner, adapts well to assistive technology',
      medicalNotes: 'Visual impairment, uses magnification tools',
      resourceInformation: {
        attendsResourceServices: true,
        accommodations: ['Assistive technology', 'Large print materials', 'Audio books'],
        relatedServices: ['Vision Support'],
        allergies: [],
        medicalNeeds: []
      },
      preferredPartners: ['Oliver Wilson'],
      avoidPartners: [],
      iepData: {
        goals: [
          {
            id: 'goal_ethan_001',
            studentId: 'student_009',
            title: 'Reading Fluency with Assistive Technology',
            description: 'Will read 50 words per minute using assistive technology',
            shortTermObjective: 'Read 25 words per minute with large print materials',
            domain: 'academic',
            measurementType: 'frequency',
            criteria: '50 words per minute for 3 consecutive sessions',
            target: 50,
            currentProgress: 35,
            priority: 'high',
            dateCreated: currentDateOnly,
            isActive: true,
            linkedActivityIds: []
          }
        ],
        dataCollection: [
          {
            id: 'data_ethan_001',
            goalId: 'goal_ethan_001',
            studentId: 'student_009',
            date: currentDateOnly,
            time: '09:45',
            value: 38,
            totalOpportunities: 50,
            notes: 'Good progress with magnification software',
            context: 'Reading intervention',
            collector: 'Dr. Amanda Thompson',
            photos: [],
            voiceNotes: []
          }
        ]
      }
    },

    // Student 10: Oliver Wilson - 1st Grade
    {
      id: 'student_010',
      name: 'Oliver Wilson',
      grade: '1st Grade',
      photo: undefined,
      dateCreated: currentDateOnly,
      workingStyle: 'independent',
      accommodations: ['Quiet workspace', 'Written instructions', 'Check-in schedule'],
      goals: ['Social skills', 'Emotional regulation', 'Academic participation'],
      parentName: 'James Wilson',
      parentEmail: 'james.wilson@email.com',
      parentPhone: '(555) 000-1111',
      isActive: true,
      behaviorNotes: 'Introverted, needs time to process social situations',
      medicalNotes: 'Selective mutism, anxiety',
      resourceInformation: {
        attendsResourceServices: true,
        accommodations: ['Quiet workspace', 'Written instructions', 'Check-in schedule'],
        relatedServices: ['Counseling', 'Speech Therapy'],
        allergies: [],
        medicalNeeds: []
      },
      preferredPartners: ['Ethan Brown'],
      avoidPartners: [],
      iepData: {
        goals: [
          {
            id: 'goal_oliver_001',
            studentId: 'student_010',
            title: 'Verbal Communication in School',
            description: 'Will verbally respond to teacher questions 3 times per day',
            shortTermObjective: 'Whisper responses to teacher during 1:1 time',
            domain: 'social-emotional',
            measurementType: 'frequency',
            criteria: '3 verbal responses per day for 1 week',
            target: 3,
            currentProgress: 1,
            priority: 'high',
            dateCreated: currentDateOnly,
            isActive: true,
            linkedActivityIds: []
          }
        ],
        dataCollection: [
          {
            id: 'data_oliver_001',
            goalId: 'goal_oliver_001',
            studentId: 'student_010',
            date: currentDateOnly,
            time: '15:00',
            value: 1,
            totalOpportunities: 3,
            notes: 'Whispered answer during math check-in',
            context: '1:1 check-in',
            collector: 'Sarah Johnson',
            photos: [],
            voiceNotes: []
          }
        ]
      }
    }
  ];

  // Create activities
  const demoActivities = [
    {
      id: 'activity_001',
      name: 'Letter Recognition Cards',
      category: 'Academic',
      description: 'Interactive letter identification activity with visual supports',
      duration: 15,
      materials: ['Letter cards', 'Visual supports', 'Timer'],
      instructions: 'Show letter cards and have student identify each letter',
      adaptations: ['Use larger cards for visual impairments', 'Add tactile elements'],
      linkedGoalIds: ['goal_emma_001'],
      isCustom: true,
      dateCreated: currentDateOnly
    },
    {
      id: 'activity_002',
      name: 'Math Counting with Manipulatives',
      category: 'Academic',
      description: 'Hands-on counting activity using various manipulatives',
      duration: 20,
      materials: ['Counting bears', 'Number cards', 'Hundreds chart'],
      instructions: 'Use manipulatives to practice counting by 1s, 5s, and 10s',
      adaptations: ['Use larger manipulatives', 'Provide visual number line'],
      linkedGoalIds: ['goal_marcus_001', 'goal_noah_001'],
      isCustom: true,
      dateCreated: currentDateOnly
    },
    {
      id: 'activity_003',
      name: 'AAC Communication Practice',
      category: 'Communication',
      description: 'Practice using AAC device for making requests and social interaction',
      duration: 10,
      materials: ['AAC device', 'Preferred items', 'Visual supports'],
      instructions: 'Encourage student to use AAC device to make requests',
      adaptations: ['Simplify vocabulary', 'Use picture prompts'],
      linkedGoalIds: ['goal_sofia_001'],
      isCustom: true,
      dateCreated: currentDateOnly
    }
  ];

  // Create unified data structure
  const unifiedData = {
    students: {},
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
      app: {
        theme: 'default',
        notifications: true,
        autoBackup: true
      },
      privacy: {
        requirePasswordForStudentData: false,
        autoDeleteOldData: false,
        dataRetentionDays: 365
      }
    },
    systemData: {
      activities: demoActivities,
      schedules: [],
      groups: [],
      customActivities: demoActivities
    },
    metadata: {
      version: '2.0.0',
      lastMigration: currentDate,
      dataIntegrityCheck: currentDate,
      backupLocation: 'demo-data-' + Date.now(),
      totalStudents: demoStudents.length,
      totalStaff: demoStaff.length,
      totalGoals: demoStudents.reduce((total, student) => total + student.iepData.goals.length, 0),
      totalDataPoints: demoStudents.reduce((total, student) => total + student.iepData.dataCollection.length, 0)
    }
  };

  // Convert students array to object format for unified data
  demoStudents.forEach(student => {
    unifiedData.students[student.id] = {
      ...student,
      createdAt: currentDate,
      updatedAt: currentDate,
      version: '2.0.0'
    };
  });

  // Convert staff array to object format for unified data
  demoStaff.forEach(staff => {
    unifiedData.staff[staff.id] = {
      ...staff,
      createdAt: currentDate,
      updatedAt: currentDate,
      version: '2.0.0'
    };
  });

  // Save unified data
  localStorage.setItem('visual-schedule-builder-unified-data', JSON.stringify(unifiedData));
  console.log('✅ Created unified data structure');
  console.log(`   📊 ${demoStudents.length} students`);
  console.log(`   👥 ${demoStaff.length} staff members`);
  console.log(`   🎯 ${unifiedData.metadata.totalGoals} IEP goals`);
  console.log(`   📈 ${unifiedData.metadata.totalDataPoints} data points`);
  console.log(`   🎭 ${demoActivities.length} activities`);

  // Create legacy backup for compatibility (if needed)
  localStorage.setItem('students', JSON.stringify(demoStudents));
  localStorage.setItem('staff_members', JSON.stringify(demoStaff));
  console.log('✅ Created legacy backup data');

  return {
    success: true,
    studentsCreated: demoStudents.length,
    staffCreated: demoStaff.length,
    goalsCreated: unifiedData.metadata.totalGoals,
    dataPointsCreated: unifiedData.metadata.totalDataPoints,
    activitiesCreated: demoActivities.length
  };
}

// Step 3: Main execution function
function resetAndPopulateDemo() {
  console.log('🚀 Starting complete reset and demo population...');
  
  try {
    // Clear all legacy data
    clearAllLegacyData();
    
    // Create comprehensive demo data
    const result = createDemoData();
    
    console.log('\n🎉 Demo data creation completed successfully!');
    console.log('📋 Summary:');
    console.log(`   👥 Students: ${result.studentsCreated}`);
    console.log(`   🏫 Staff: ${result.staffCreated}`);
    console.log(`   🎯 IEP Goals: ${result.goalsCreated}`);
    console.log(`   📊 Data Points: ${result.dataPointsCreated}`);
    console.log(`   🎭 Activities: ${result.activitiesCreated}`);
    console.log('\n✨ The app is now ready with comprehensive demo data!');
    console.log('🔄 Please refresh the page to see the new data.');
    
    return result;
    
  } catch (error) {
    console.error('❌ Error during reset and population:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Execute the reset and population
resetAndPopulateDemo();
