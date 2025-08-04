// 🎯 Browser-Compatible Demo Data Import Script
// Copy and paste this entire script into the Electron app's developer console (F12)

console.log('🎯 Importing fresh demo data into Visual Schedule Builder...');

// Demo Teachers
const demoTeachers = [
    {
        id: 'teacher-1',
        name: 'Ms. Sarah Johnson',
        role: 'Lead Teacher',
        email: 'sarah.johnson@school.edu',
        phone: '555-0101',
        certifications: ['Special Education', 'Autism Specialist'],
        created: new Date().toISOString()
    },
    {
        id: 'teacher-2', 
        name: 'Mr. David Chen',
        role: 'Assistant Teacher',
        email: 'david.chen@school.edu',
        phone: '555-0102',
        certifications: ['Paraprofessional', 'Behavioral Support'],
        created: new Date().toISOString()
    },
    {
        id: 'teacher-3',
        name: 'Ms. Emily Rodriguez',
        role: 'Speech Therapist',
        email: 'emily.rodriguez@school.edu', 
        phone: '555-0103',
        certifications: ['Speech-Language Pathology', 'AAC Specialist'],
        created: new Date().toISOString()
    }
];

// Demo Students
const demoStudents = [
    {
        id: 'student-1',
        name: 'Alex Thompson',
        age: 8,
        grade: '2nd Grade',
        needsLevel: 'High Support',
        communicationMethod: 'PECS + Verbal',
        interests: ['Trains', 'Music', 'Art'],
        goals: ['Increase verbal communication', 'Follow 3-step directions'],
        created: new Date().toISOString()
    },
    {
        id: 'student-2',
        name: 'Maya Patel', 
        age: 10,
        grade: '4th Grade', 
        needsLevel: 'Moderate Support',
        communicationMethod: 'AAC Device + Verbal',
        interests: ['Reading', 'Animals', 'Puzzles'],
        goals: ['Improve social interactions', 'Complete independent tasks'],
        created: new Date().toISOString()
    },
    {
        id: 'student-3',
        name: 'Jordan Williams',
        age: 7,
        grade: '1st Grade',
        needsLevel: 'High Support', 
        communicationMethod: 'Gestures + Emerging Verbal',
        interests: ['Sensory toys', 'Movement', 'Colors'],
        goals: ['Increase attention span', 'Reduce transition anxiety'],
        created: new Date().toISOString()
    },
    {
        id: 'student-4',
        name: 'Sam Kumar',
        age: 9,
        grade: '3rd Grade',
        needsLevel: 'Low Support',
        communicationMethod: 'Fully Verbal',
        interests: ['Math', 'Technology', 'Building'],
        goals: ['Improve executive function', 'Develop peer relationships'],
        created: new Date().toISOString()
    }
];

// Demo Activities
const demoActivities = [
    {
        id: 'activity-1',
        name: 'Morning Circle',
        category: 'Group Activity',
        description: 'Daily greeting and calendar time',
        duration: 15,
        materials: ['Calendar', 'Weather chart', 'Greeting songs'],
        instructions: 'Gather in circle, greet each student, review calendar and weather',
        goals: ['Social interaction', 'Routine following', 'Communication']
    },
    {
        id: 'activity-2',
        name: 'Math Centers',
        category: 'Academic',
        description: 'Rotational math activities',
        duration: 30,
        materials: ['Manipulatives', 'Worksheets', 'iPad apps'],
        instructions: 'Students rotate through 3 centers with different math concepts',
        goals: ['Number recognition', 'Counting skills', 'Problem solving']
    },
    {
        id: 'activity-3',
        name: 'Sensory Break',
        category: 'Break',
        description: 'Calming sensory activities',
        duration: 10,
        materials: ['Sensory bin', 'Weighted blankets', 'Fidget toys'],
        instructions: 'Students choose preferred sensory activity for self-regulation',
        goals: ['Self-regulation', 'Sensory processing', 'Calm body']
    },
    {
        id: 'activity-4',
        name: 'Reading Groups',
        category: 'Academic',
        description: 'Small group literacy instruction',
        duration: 25,
        materials: ['Leveled books', 'Picture cards', 'Letter tiles'],
        instructions: 'Small groups work on individualized reading skills',
        goals: ['Reading comprehension', 'Phonics', 'Vocabulary']
    },
    {
        id: 'activity-5',
        name: 'Art Therapy',
        category: 'Therapy',
        description: 'Creative expression through art',
        duration: 30,
        materials: ['Art supplies', 'Adaptive tools', 'Visual guides'],
        instructions: 'Students create art while working on fine motor and expression goals',
        goals: ['Fine motor skills', 'Creative expression', 'Following directions']
    }
];

// Demo Settings
const demoSettings = {
    theme: 'light',
    accessibility: {
        highContrast: false,
        largeText: false,
        reducedMotion: false
    },
    smartboard: {
        autoAdvance: false,
        showTimer: true,
        soundEffects: true
    },
    created: new Date().toISOString()
};

// Import the data into localStorage
try {
    console.log('📥 Importing demo data...');
    
    // Convert demo data to unified format that the app expects
    const unifiedData = {
        students: demoStudents.map(student => ({
            ...student,
            dateCreated: student.created,
            iepData: {
                goals: [],
                dataCollection: []
            },
            resourceInformation: {
                attendsResourceServices: false,
                accommodations: [],
                relatedServices: [],
                allergies: [],
                medicalNeeds: []
            },
            accommodations: [],
            goals: student.goals || [],
            preferredPartners: [],
            avoidPartners: [],
            isActive: true
        })),
        staff: demoTeachers.map(teacher => ({
            ...teacher,
            dateCreated: teacher.created,
            isActive: true,
            specialties: teacher.certifications || [],
            permissions: {
                canEditStudents: true,
                canViewReports: true,
                canManageGoals: true
            }
        })),
        activities: demoActivities.map(activity => ({
            ...activity,
            dateCreated: new Date().toISOString(),
            isCustom: true,
            linkedGoalIds: []
        })),
        calendar: {
            behaviorCommitments: [],
            dailyHighlights: [],
            independentChoices: []
        },
        settings: {
            visualScheduleBuilderSettings: demoSettings
        },
        metadata: {
            version: '2.0',
            migratedAt: new Date().toISOString(),
            totalGoals: 0,
            totalDataPoints: 0,
            totalStaff: demoTeachers.length,
            totalActivities: demoActivities.length
        }
    };
    
    // Save to the unified data key that the app expects
    localStorage.setItem('visual-schedule-builder-unified-data', JSON.stringify(unifiedData));
    
    // Also save in legacy format for compatibility
    localStorage.setItem('vsb_staff', JSON.stringify(demoTeachers));
    localStorage.setItem('vsb_students', JSON.stringify(demoStudents));
    localStorage.setItem('activityLibrary', JSON.stringify(demoActivities));
    localStorage.setItem('vsb_settings', JSON.stringify(demoSettings));
    localStorage.setItem('staff', JSON.stringify(demoTeachers));
    localStorage.setItem('students', JSON.stringify(demoStudents));
    
    console.log('✅ Successfully imported demo data!');
    console.log(`👨‍🏫 Teachers: ${demoTeachers.length}`);
    console.log(`👦👧 Students: ${demoStudents.length}`);
    console.log(`🎯 Activities: ${demoActivities.length}`);
    console.log(`⚙️ Settings: Configured`);
    
    console.log('\n🎉 IMPORT COMPLETE!');
    console.log('🔄 Refresh the app to see your fresh demo data.');
    console.log('📍 Look for the red "DEV" indicator in the navigation to confirm you\'re in development mode.');
    
    // Show what was imported
    console.log('\n📋 Imported Teachers:');
    demoTeachers.forEach(teacher => console.log(`  • ${teacher.name} (${teacher.role})`));
    
    console.log('\n📋 Imported Students:');
    demoStudents.forEach(student => console.log(`  • ${student.name} - ${student.grade} (${student.needsLevel})`));
    
} catch (error) {
    console.error('❌ Error importing demo data:', error);
    console.log('Please try running the script again.');
}
