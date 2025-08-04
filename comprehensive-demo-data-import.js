// 🎯 Comprehensive Demo Data Import Script for Visual Schedule Builder
// This creates a rich dataset that demonstrates all app features
// Copy and paste this entire script into the Electron app's developer console (F12)

console.log('🎯 Creating comprehensive demo data for Visual Schedule Builder...');
console.log('This will showcase ALL features of the application!');

// ===== COMPREHENSIVE STAFF DATA =====
const comprehensiveStaff = [
    {
        id: 'staff-001',
        name: 'Dr. Sarah Johnson',
        role: 'Lead Special Education Teacher',
        email: 'sarah.johnson@eastside.edu',
        phone: '555-0101',
        certifications: ['Special Education K-12', 'Autism Specialist', 'Applied Behavior Analysis'],
        created: new Date().toISOString(),
        specialties: ['Autism Spectrum Disorders', 'Behavioral Interventions', 'Communication Supports'],
        notes: 'Department head with 15 years experience. Specializes in high-needs students.',
        isResourceTeacher: true,
        permissions: {
            canEditStudents: true,
            canViewReports: true,
            canManageGoals: true
        }
    },
    {
        id: 'staff-002',
        name: 'Mr. David Chen',
        role: 'Paraprofessional',
        email: 'david.chen@eastside.edu',
        phone: '555-0102',
        certifications: ['Paraprofessional Certificate', 'CPR/First Aid', 'Crisis Intervention'],
        created: new Date().toISOString(),
        specialties: ['Behavioral Support', 'Sensory Integration', 'Physical Assistance'],
        notes: 'Excellent with student engagement and behavior management.',
        permissions: {
            canEditStudents: false,
            canViewReports: true,
            canManageGoals: false
        }
    },
    {
        id: 'staff-003',
        name: 'Ms. Emily Rodriguez',
        role: 'Speech-Language Pathologist',
        email: 'emily.rodriguez@eastside.edu',
        phone: '555-0103',
        certifications: ['SLP License', 'AAC Specialist', 'Autism Communication'],
        created: new Date().toISOString(),
        specialties: ['Augmentative Communication', 'Language Development', 'Social Communication'],
        notes: 'Provides speech therapy and AAC device training.',
        permissions: {
            canEditStudents: true,
            canViewReports: true,
            canManageGoals: true
        }
    },
    {
        id: 'staff-004',
        name: 'Mrs. Jennifer Wilson',
        role: 'Occupational Therapist',
        email: 'jennifer.wilson@eastside.edu',
        phone: '555-0104',
        certifications: ['OT License', 'Sensory Integration', 'Assistive Technology'],
        created: new Date().toISOString(),
        specialties: ['Fine Motor Skills', 'Sensory Processing', 'Daily Living Skills'],
        notes: 'Focuses on functional skills and sensory regulation.',
        permissions: {
            canEditStudents: true,
            canViewReports: true,
            canManageGoals: true
        }
    },
    {
        id: 'staff-005',
        name: 'Mr. Michael Thompson',
        role: 'Behavior Specialist',
        email: 'michael.thompson@eastside.edu',
        phone: '555-0105',
        certifications: ['BCBA', 'Crisis Prevention', 'Data Analysis'],
        created: new Date().toISOString(),
        specialties: ['Behavior Analysis', 'Crisis Management', 'Data Collection'],
        notes: 'Board Certified Behavior Analyst. Leads behavior intervention planning.',
        permissions: {
            canEditStudents: true,
            canViewReports: true,
            canManageGoals: true
        }
    },
    {
        id: 'staff-006',
        name: 'Ms. Amanda Garcia',
        role: 'Art Teacher',
        email: 'amanda.garcia@eastside.edu',
        phone: '555-0106',
        certifications: ['Art Education', 'Adaptive Arts', 'Therapeutic Arts'],
        created: new Date().toISOString(),
        specialties: ['Creative Expression', 'Fine Motor Development', 'Sensory Arts'],
        notes: 'Adapted arts programming for students with diverse needs.',
        isRelatedArtsTeacher: true,
        permissions: {
            canEditStudents: false,
            canViewReports: true,
            canManageGoals: false
        }
    }
];

// ===== COMPREHENSIVE STUDENT DATA =====
const comprehensiveStudents = [
    {
        id: 'student-001',
        name: 'Alex Thompson',
        age: 8,
        grade: '2nd Grade',
        needsLevel: 'High Support',
        communicationMethod: 'PECS + Emerging Verbal',
        interests: ['Trains', 'Music', 'Sensory toys', 'iPads'],
        goals: ['Increase verbal communication', 'Follow 3-step directions', 'Reduce elopement behaviors'],
        created: new Date().toISOString(),
        workingStyle: 'Highly structured with visual supports',
        parentName: 'Lisa Thompson',
        parentEmail: 'lisa.thompson@email.com',
        parentPhone: '555-1001',
        behaviorNotes: 'May elope when overwhelmed. Uses deep pressure for calming.',
        medicalNotes: 'Autism, ADHD. Takes medication for focus.',
        resourceInformation: {
            attendsResourceServices: true,
            accommodations: ['Visual schedule', 'Noise canceling headphones', 'Movement breaks'],
            relatedServices: ['Speech Therapy 2x/week', 'OT 1x/week', 'Behavior Support'],
            allergies: ['Peanuts'],
            medicalNeeds: ['Medication at 12pm'],
            emergencyContact: {
                name: 'Mark Thompson',
                phone: '555-1002',
                relationship: 'Father'
            }
        },
        schedulePreferences: {
            preferredActivities: ['Morning Circle', 'iPad Time', 'Music Therapy'],
            accommodationNeeds: ['Visual timer', 'Quiet space access', 'Predictable routine']
        }
    },
    {
        id: 'student-002',
        name: 'Maya Patel',
        age: 10,
        grade: '4th Grade',
        needsLevel: 'Moderate Support',
        communicationMethod: 'AAC Device + Verbal',
        interests: ['Reading', 'Animals', 'Puzzles', 'Science experiments'],
        goals: ['Improve social interactions', 'Complete independent tasks', 'Increase attention span'],
        created: new Date().toISOString(),
        workingStyle: 'Benefits from peer support and structured choices',
        parentName: 'Priya Patel',
        parentEmail: 'priya.patel@email.com',
        parentPhone: '555-2001',
        behaviorNotes: 'Anxious in large groups. Responds well to positive reinforcement.',
        medicalNotes: 'Autism, anxiety disorder. No medications.',
        resourceInformation: {
            attendsResourceServices: true,
            accommodations: ['AAC device', 'Social stories', 'Flexible seating'],
            relatedServices: ['Speech Therapy 2x/week', 'Social Skills Group'],
            allergies: [],
            medicalNeeds: [],
            emergencyContact: {
                name: 'Raj Patel',
                phone: '555-2002',
                relationship: 'Father'
            }
        }
    },
    {
        id: 'student-003',
        name: 'Jordan Williams',
        age: 7,
        grade: '1st Grade',
        needsLevel: 'High Support',
        communicationMethod: 'Gestures + Emerging Verbal',
        interests: ['Sensory toys', 'Movement', 'Colors', 'Lights'],
        goals: ['Increase attention span', 'Reduce transition anxiety', 'Improve fine motor skills'],
        created: new Date().toISOString(),
        workingStyle: 'Requires frequent sensory breaks and physical movement',
        parentName: 'Sandra Williams',
        parentEmail: 'sandra.williams@email.com',
        parentPhone: '555-3001',
        behaviorNotes: 'Sensory seeking behaviors. Calms with weighted items.',
        medicalNotes: 'Autism, sensory processing disorder.',
        resourceInformation: {
            attendsResourceServices: true,
            accommodations: ['Sensory breaks', 'Weighted lap pad', 'Fidget tools'],
            relatedServices: ['OT 2x/week', 'Speech Therapy 1x/week'],
            allergies: ['Latex'],
            medicalNeeds: [],
            emergencyContact: {
                name: 'James Williams',
                phone: '555-3002',
                relationship: 'Father'
            }
        }
    },
    {
        id: 'student-004',
        name: 'Sam Kumar',
        age: 9,
        grade: '3rd Grade',
        needsLevel: 'Low Support',
        communicationMethod: 'Fully Verbal',
        interests: ['Math', 'Technology', 'Building', 'Robotics'],
        goals: ['Improve executive function', 'Develop peer relationships', 'Increase flexibility'],
        created: new Date().toISOString(),
        workingStyle: 'Independent learner who needs support with social situations',
        parentName: 'Anjali Kumar',
        parentEmail: 'anjali.kumar@email.com',
        parentPhone: '555-4001',
        behaviorNotes: 'Highly focused on interests. Difficulty with transitions.',
        medicalNotes: 'High-functioning autism.',
        resourceInformation: {
            attendsResourceServices: false,
            accommodations: ['Extended time', 'Break cards', 'Preferred seating'],
            relatedServices: ['Social Skills Group 1x/week'],
            allergies: [],
            medicalNeeds: [],
            emergencyContact: {
                name: 'Vikram Kumar',
                phone: '555-4002',
                relationship: 'Father'
            }
        }
    },
    {
        id: 'student-005',
        name: 'Emma Davis',
        age: 11,
        grade: '5th Grade',
        needsLevel: 'Moderate Support',
        communicationMethod: 'Verbal + Social Scripts',
        interests: ['Art', 'Animals', 'Cooking', 'Organization'],
        goals: ['Improve social communication', 'Increase independence', 'Manage anxiety'],
        created: new Date().toISOString(),
        workingStyle: 'Thrives with clear expectations and routine',
        parentName: 'Michelle Davis',
        parentEmail: 'michelle.davis@email.com',
        parentPhone: '555-5001',
        behaviorNotes: 'Perfectionist tendencies. Needs reassurance when making mistakes.',
        medicalNotes: 'Autism, generalized anxiety disorder.',
        resourceInformation: {
            attendsResourceServices: true,
            accommodations: ['Anxiety management strategies', 'Choice boards', 'Peer buddy system'],
            relatedServices: ['Counseling 1x/week', 'Speech Therapy 1x/week'],
            allergies: ['Tree nuts'],
            medicalNeeds: [],
            emergencyContact: {
                name: 'Robert Davis',
                phone: '555-5002',
                relationship: 'Father'
            }
        }
    },
    {
        id: 'student-006',
        name: 'Carlos Martinez',
        age: 6,
        grade: 'Kindergarten',
        needsLevel: 'High Support',
        communicationMethod: 'Picture Exchange + Gestures',
        interests: ['Cars', 'Water play', 'Spinning objects', 'Music'],
        goals: ['Develop communication skills', 'Improve attention to tasks', 'Reduce self-stimulating behaviors'],
        created: new Date().toISOString(),
        workingStyle: 'Requires intensive support with highly structured environment',
        parentName: 'Maria Martinez',
        parentEmail: 'maria.martinez@email.com',
        parentPhone: '555-6001',
        behaviorNotes: 'Self-stimulating behaviors when excited. Responds to music for calming.',
        medicalNotes: 'Autism, developmental delays.',
        resourceInformation: {
            attendsResourceServices: true,
            accommodations: ['Picture communication system', 'Structured play areas', 'Sensory tools'],
            relatedServices: ['Speech Therapy 3x/week', 'OT 2x/week', 'Behavior Support'],
            allergies: [],
            medicalNeeds: [],
            emergencyContact: {
                name: 'Luis Martinez',
                phone: '555-6002',
                relationship: 'Father'
            }
        }
    }
];

// ===== COMPREHENSIVE ACTIVITY LIBRARY =====
const comprehensiveActivities = [
    {
        id: 'activity-001',
        name: 'Morning Circle Time',
        category: 'Group Activity',
        description: 'Daily greeting, calendar, weather, and social skills practice',
        duration: 20,
        materials: ['Calendar', 'Weather chart', 'Greeting songs', 'Visual schedule'],
        instructions: 'Students sit in circle, take turns greeting, review calendar and weather, discuss daily schedule',
        adaptations: ['Picture symbols for non-readers', 'Choice boards for responses', 'Movement breaks'],
        goals: ['Social interaction', 'Routine following', 'Communication', 'Time concepts']
    },
    {
        id: 'activity-002',
        name: 'Math Centers',
        category: 'Academic',
        description: 'Rotational math activities targeting individual skill levels',
        duration: 30,
        materials: ['Manipulatives', 'Worksheets', 'iPad math apps', 'Counting bears', 'Number cards'],
        instructions: 'Students rotate through 3 centers: manipulative math, digital practice, and guided instruction',
        adaptations: ['Reduced number of problems', 'Visual supports', 'Calculator use allowed'],
        goals: ['Number recognition', 'Counting skills', 'Problem solving', 'Following directions']
    },
    {
        id: 'activity-003',
        name: 'Reading Groups',
        category: 'Academic',
        description: 'Small group literacy instruction with leveled materials',
        duration: 25,
        materials: ['Leveled books', 'Picture cards', 'Letter tiles', 'Reading apps', 'Audio books'],
        instructions: 'Small groups work on phonics, sight words, and reading comprehension at appropriate levels',
        adaptations: ['Picture-supported text', 'Audio support', 'Larger text size'],
        goals: ['Reading comprehension', 'Phonics skills', 'Vocabulary development']
    },
    {
        id: 'activity-004',
        name: 'Speech Therapy Session',
        category: 'Therapy',
        description: 'Individual or small group speech and language therapy',
        duration: 30,
        materials: ['AAC devices', 'Picture symbols', 'Articulation cards', 'Games'],
        instructions: 'Work on individual communication goals using evidence-based techniques',
        adaptations: ['Visual supports', 'Technology integration', 'Motivating activities'],
        goals: ['Communication skills', 'Language development', 'Social communication']
    },
    {
        id: 'activity-005',
        name: 'Occupational Therapy',
        category: 'Therapy',
        description: 'Fine motor, sensory, and daily living skills practice',
        duration: 30,
        materials: ['Fine motor tools', 'Sensory bins', 'Adaptive equipment', 'Daily living props'],
        instructions: 'Target individual OT goals through structured activities and play',
        adaptations: ['Graded difficulty', 'Sensory accommodations', 'Motivating themes'],
        goals: ['Fine motor skills', 'Sensory regulation', 'Daily living skills']
    },
    {
        id: 'activity-006',
        name: 'Art Therapy',
        category: 'Therapy',
        description: 'Creative expression and fine motor development through art',
        duration: 30,
        materials: ['Art supplies', 'Adaptive brushes', 'Various textures', 'Visual guides'],
        instructions: 'Students create art while working on fine motor and expression goals',
        adaptations: ['Modified tools', 'Hand-over-hand assistance', 'Choice of materials'],
        goals: ['Fine motor skills', 'Creative expression', 'Following directions', 'Sensory exploration']
    },
    {
        id: 'activity-007',
        name: 'Sensory Break',
        category: 'Break',
        description: 'Calming and organizing sensory activities',
        duration: 10,
        materials: ['Sensory bin', 'Weighted blankets', 'Fidget toys', 'Soft music'],
        instructions: 'Students choose preferred sensory activity for self-regulation',
        adaptations: ['Individual sensory preferences', 'Timer for transitions', 'Choice boards'],
        goals: ['Self-regulation', 'Sensory processing', 'Calm body', 'Transition skills']
    },
    {
        id: 'activity-008',
        name: 'Movement Break',
        category: 'Break',
        description: 'Physical movement activities for regulation and exercise',
        duration: 15,
        materials: ['Yoga mats', 'Balance balls', 'Movement cards', 'Music'],
        instructions: 'Guided movement activities including stretching, yoga, and dancing',
        adaptations: ['Modified movements', 'Visual demonstrations', 'Choice of activities'],
        goals: ['Gross motor skills', 'Body awareness', 'Following instructions', 'Energy regulation']
    },
    {
        id: 'activity-009',
        name: 'Social Skills Group',
        category: 'Social',
        description: 'Structured practice of social interactions and skills',
        duration: 30,
        materials: ['Social stories', 'Role play props', 'Games', 'Video models'],
        instructions: 'Practice social skills through games, role play, and discussion',
        adaptations: ['Visual supports', 'Scripted interactions', 'Peer buddies'],
        goals: ['Social interaction', 'Turn-taking', 'Conversation skills', 'Perspective taking']
    },
    {
        id: 'activity-010',
        name: 'Cooking Skills',
        category: 'Life Skills',
        description: 'Food preparation and kitchen safety skills',
        duration: 40,
        materials: ['Cooking ingredients', 'Adapted utensils', 'Recipe cards', 'Safety equipment'],
        instructions: 'Students follow recipes to prepare simple foods',
        adaptations: ['Picture recipes', 'Pre-measured ingredients', 'Safety modifications'],
        goals: ['Following directions', 'Safety awareness', 'Fine motor skills', 'Independence']
    },
    {
        id: 'activity-011',
        name: 'iPad Learning Apps',
        category: 'Technology',
        description: 'Educational apps targeting individual learning goals',
        duration: 20,
        materials: ['iPads', 'Educational apps', 'Headphones', 'App schedules'],
        instructions: 'Students use selected educational apps to practice skills',
        adaptations: ['App selection based on level', 'Time limits', 'Progress tracking'],
        goals: ['Academic skills', 'Technology use', 'Independent work', 'Digital citizenship']
    },
    {
        id: 'activity-012',
        name: 'Science Exploration',
        category: 'Academic',
        description: 'Hands-on science experiments and observations',
        duration: 35,
        materials: ['Science kit materials', 'Magnifying glasses', 'Recording sheets', 'Safety equipment'],
        instructions: 'Students conduct simple experiments, make observations, and record findings',
        adaptations: ['Picture recording sheets', 'Peer partners', 'Modified tools'],
        goals: ['Scientific thinking', 'Observation skills', 'Following procedures']
    }
];

// ===== SAMPLE IEP GOALS WITH DATA =====
const sampleIEPGoals = [
    {
        id: 'goal-001',
        studentId: 'student-001',
        domain: 'behavioral',
        title: 'Reduce Elopement Behaviors',
        shortTermObjective: 'Alex will remain in designated area during structured activities',
        description: 'When given visual and verbal cues, Alex will stay in the designated classroom area during structured activities for 80% of opportunities across 5 consecutive days.',
        criteria: '80% accuracy over 5 consecutive days',
        measurementType: 'percentage',
        target: 80,
        priority: 'high',
        dateCreated: '2024-09-01',
        currentProgress: 65,
        dataPoints: 15
    },
    {
        id: 'goal-002',
        studentId: 'student-001',
        domain: 'academic',
        title: 'Follow Multi-Step Directions',
        shortTermObjective: 'Alex will follow 3-step directions with visual supports',
        description: 'Given visual supports and verbal directions, Alex will complete 3-step directions with 75% accuracy in 4 out of 5 trials.',
        criteria: '75% accuracy in 4/5 trials',
        measurementType: 'percentage',
        target: 75,
        priority: 'high',
        dateCreated: '2024-09-01',
        currentProgress: 58,
        dataPoints: 12
    },
    {
        id: 'goal-003',
        studentId: 'student-002',
        domain: 'social-emotional',
        title: 'Improve Social Interactions',
        shortTermObjective: 'Maya will initiate social interactions with peers',
        description: 'Maya will independently initiate appropriate social interactions with peers during unstructured time in 70% of opportunities.',
        criteria: '70% of opportunities',
        measurementType: 'percentage',
        target: 70,
        priority: 'high',
        dateCreated: '2024-09-01',
        currentProgress: 55,
        dataPoints: 20
    },
    {
        id: 'goal-004',
        studentId: 'student-003',
        domain: 'behavioral',
        title: 'Increase Attention Span',
        shortTermObjective: 'Jordan will attend to structured activities for increasing durations',
        description: 'Jordan will attend to structured activities for 5 minutes with no more than 2 adult prompts in 70% of opportunities.',
        criteria: '70% of opportunities with ≤2 prompts',
        measurementType: 'percentage',
        target: 70,
        priority: 'high',
        dateCreated: '2024-09-01',
        currentProgress: 45,
        dataPoints: 22
    }
];

// ===== SAMPLE DATA POINTS =====
const sampleDataPoints = [
    { id: 'dp-001', studentId: 'student-001', goalId: 'goal-001', date: '2024-12-01', time: '09:30', value: 75, totalOpportunities: 4, notes: 'Good morning, needed 1 reminder', collector: 'Dr. Sarah Johnson' },
    { id: 'dp-002', studentId: 'student-001', goalId: 'goal-001', date: '2024-12-02', time: '10:15', value: 80, totalOpportunities: 5, notes: 'Excellent day, stayed in area', collector: 'Mr. David Chen' },
    { id: 'dp-003', studentId: 'student-001', goalId: 'goal-001', date: '2024-12-03', time: '09:45', value: 60, totalOpportunities: 5, notes: 'Challenging day, multiple redirections needed', collector: 'Dr. Sarah Johnson' },
    { id: 'dp-004', studentId: 'student-002', goalId: 'goal-003', date: '2024-12-01', time: '11:00', value: 60, totalOpportunities: 5, notes: 'Initiated play with 2 peers', collector: 'Ms. Emily Rodriguez' },
    { id: 'dp-005', studentId: 'student-002', goalId: 'goal-003', date: '2024-12-02', time: '10:30', value: 70, totalOpportunities: 10, notes: 'Great progress with peer interactions', collector: 'Mr. David Chen' }
];

// ===== CALENDAR DATA =====
const behaviorCommitments = [
    { id: 'bc-001', studentId: 'student-001', commitment: 'Stay in my seat during circle time', date: '2024-12-04', status: 'completed', notes: 'Great job today!' },
    { id: 'bc-002', studentId: 'student-002', commitment: 'Use my AAC device to ask for help', date: '2024-12-04', status: 'pending', notes: '' },
    { id: 'bc-003', studentId: 'student-003', commitment: 'Try a new sensory activity', date: '2024-12-04', status: 'completed', notes: 'Loved the texture bin!' }
];

const dailyHighlights = [
    { id: 'dh-001', studentId: 'student-001', highlight: 'Used verbal words to request trains activity', date: '2024-12-03', category: 'achievement', notes: 'First time using full sentence!' },
    { id: 'dh-002', studentId: 'student-002', highlight: 'Helped a peer with their puzzle', date: '2024-12-03', category: 'social', notes: 'Showed great empathy' },
    { id: 'dh-003', studentId: 'student-004', highlight: 'Completed math center independently', date: '2024-12-03', category: 'academic', notes: 'No prompting needed' }
];

const independentChoices = [
    { id: 'ic-001', studentId: 'student-001', choice: 'iPad time with train videos', date: '2024-12-04', completed: true, notes: 'Calming activity' },
    { id: 'ic-002', studentId: 'student-002', choice: 'Read animal books in quiet corner', date: '2024-12-04', completed: false, notes: 'Will try tomorrow' },
    { id: 'ic-003', studentId: 'student-005', choice: 'Help organize art supplies', date: '2024-12-04', completed: true, notes: 'Loves organizing!' }
];

// ===== COMPREHENSIVE SETTINGS =====
const comprehensiveSettings = {
    theme: 'light',
    accessibility: {
        highContrast: false,
        largeText: false,
        reducedMotion: false,
        screenReader: false
    },
    smartboard: {
        autoAdvance: false,
        showTimer: true,
        soundEffects: true,
        transitionWarning: 30,
        backgroundColor: '#f0f8ff'
    },
    dataCollection: {
        defaultMeasurement: 'percentage',
        requireNotes: true,
        autoBackup: true,
        reminderNotifications: true
    },
    scheduleBuilder: {
        defaultDuration: 30,
        allowOverlap: false,
        showBreaks: true,
        colorCoding: true
    },
    calendar: {
        weekStart: 'monday',
        showWeather: true,
        behaviorTracking: true,
        highlightToday: true
    },
    reports: {
        defaultDateRange: 30,
        includeGraphs: true,
        autoGenerate: false,
        exportFormat: 'pdf'
    },
    created: new Date().toISOString()
};

// ===== IMPORT FUNCTION =====
try {
    console.log('📥 Importing comprehensive demo data...');
    
    // Convert demo data to unified format that the app expects
    const unifiedData = {
        students: comprehensiveStudents.map(student => ({
            ...student,
            dateCreated: student.created,
            iepData: {
                goals: sampleIEPGoals.filter(goal => goal.studentId === student.id),
                dataCollection: sampleDataPoints.filter(dp => dp.studentId === student.id)
            },
            resourceInformation: student.resourceInformation || {
                attendsResourceServices: true,
                accommodations: [],
                relatedServices: [],
                allergies: [],
                medicalNeeds: []
            },
            accommodations: [],
            goals: student.goals || [],
            preferredPartners: [],
            avoidPartners: [],
            isActive: true,
            calendarPreferences: {
                behaviorCommitments: behaviorCommitments.filter(bc => bc.studentId === student.id),
                dailyHighlights: dailyHighlights.filter(dh => dh.studentId === student.id),
                independentChoices: independentChoices.filter(ic => ic.studentId === student.id)
            }
        })),
        staff: comprehensiveStaff.map(teacher => ({
            ...teacher,
            dateCreated: teacher.created,
            isActive: true,
            specialties: teacher.certifications || [],
            permissions: teacher.permissions || {
                canEditStudents: true,
                canViewReports: true,
                canManageGoals: true
            }
        })),
        activities: comprehensiveActivities.map(activity => ({
            ...activity,
            dateCreated: new Date().toISOString(),
            isCustom: true,
            linkedGoalIds: []
        })),
        calendar: {
            behaviorCommitments: behaviorCommitments,
            dailyHighlights: dailyHighlights,
            independentChoices: independentChoices
        },
        settings: {
            visualScheduleBuilderSettings: comprehensiveSettings
        },
        metadata: {
            version: '2.0',
            migratedAt: new Date().toISOString(),
            totalGoals: sampleIEPGoals.length,
            totalDataPoints: sampleDataPoints.length,
            totalStaff: comprehensiveStaff.length,
            totalActivities: comprehensiveActivities.length
        }
    };
    
    // Save to the unified data key that the app expects
    localStorage.setItem('visual-schedule-builder-unified-data', JSON.stringify(unifiedData));
    
    // Also save in legacy format for compatibility
    localStorage.setItem('vsb_staff', JSON.stringify(comprehensiveStaff));
    localStorage.setItem('vsb_students', JSON.stringify(comprehensiveStudents));
    localStorage.setItem('activityLibrary', JSON.stringify(comprehensiveActivities));
    localStorage.setItem('vsb_settings', JSON.stringify(comprehensiveSettings));
    localStorage.setItem('staff', JSON.stringify(comprehensiveStaff));
    localStorage.setItem('students', JSON.stringify(comprehensiveStudents));
    
    console.log('✅ Successfully imported comprehensive demo data!');
    console.log(`👨‍🏫 Staff: ${comprehensiveStaff.length} members`);
    console.log(`👦👧 Students: ${comprehensiveStudents.length} students`);
    console.log(`🎯 Activities: ${comprehensiveActivities.length} activities`);
    console.log(`📊 IEP Goals: ${sampleIEPGoals.length} goals`);
    console.log(`📈 Data Points: ${sampleDataPoints.length} data points`);
    console.log(`📅 Calendar Items: ${behaviorCommitments.length + dailyHighlights.length + independentChoices.length} items`);
    
    console.log('\n🎉 COMPREHENSIVE IMPORT COMPLETE!');
    console.log('🔄 Refresh the app to see your rich demo data.');
    console.log('📍 Look for the red "DEV" indicator in the navigation to confirm development mode.');
    
    console.log('\n✨ This demo data showcases:');
    console.log('• Diverse student profiles with detailed information');
    console.log('• Multi-disciplinary staff team');
    console.log('• Comprehensive activity library');
    console.log('• IEP goals with real data points');
    console.log('• Calendar features (behavior commitments, highlights, choices)');
    console.log('• Rich settings and configurations');
    console.log('• Full contact information and accommodations');
    console.log('• Medical notes and emergency contacts');
    console.log('• Various communication methods and support levels');
    
    console.log('\n📋 Imported Staff Roles:');
    comprehensiveStaff.forEach(staff => console.log(`  • ${staff.name} - ${staff.role}`));
    
    console.log('\n📋 Imported Students:');
    comprehensiveStudents.forEach(student => console.log(`  • ${student.name} (${student.grade}, ${student.needsLevel})`));
    
} catch (error) {
    console.error('❌ Error importing comprehensive demo data:', error);
    console.log('Please try running the script again.');
}
