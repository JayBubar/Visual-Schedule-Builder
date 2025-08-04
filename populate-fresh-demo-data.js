// 🎯 Fresh Demo Data Population Script
// This script will create fresh demo data for the development environment

const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('🎯 Visual Schedule Builder - Fresh Demo Data Population');
console.log('='.repeat(60));

// Demo data definitions
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

function createDemoDataFiles() {
    // Development data directory (separate from production)
    const devDataDir = path.join(os.homedir(), '.visual-schedule-builder-dev');
    
    if (!fs.existsSync(devDataDir)) {
        fs.mkdirSync(devDataDir, { recursive: true });
        console.log(`📁 Created development data directory: ${devDataDir}`);
    }
    
    // Save demo data as files
    const files = [
        { name: 'demo-teachers.json', data: demoTeachers },
        { name: 'demo-students.json', data: demoStudents },
        { name: 'demo-activities.json', data: demoActivities },
        { name: 'demo-settings.json', data: demoSettings }
    ];
    
    files.forEach(file => {
        const filePath = path.join(devDataDir, file.name);
        fs.writeFileSync(filePath, JSON.stringify(file.data, null, 2));
        console.log(`✅ Created: ${file.name} (${file.data.length || 1} items)`);
    });
    
    console.log(`\n📊 Demo Data Summary:`);
    console.log(`👨‍🏫 Teachers: ${demoTeachers.length}`);
    console.log(`👦👧 Students: ${demoStudents.length}`);
    console.log(`🎯 Activities: ${demoActivities.length}`);
    console.log(`⚙️ Settings: Configured`);
    
    return devDataDir;
}

function createImportScript(dataDir) {
    const importScript = `
// 📥 Demo Data Import Script for Development
// This script should be run inside the Electron app's renderer process

console.log('🎯 Importing fresh demo data...');

// Demo data
const teachers = ${JSON.stringify(demoTeachers, null, 2)};
const students = ${JSON.stringify(demoStudents, null, 2)};
const activities = ${JSON.stringify(demoActivities, null, 2)};
const settings = ${JSON.stringify(demoSettings, null, 2)};

// Import into localStorage (renderer process)
localStorage.setItem('vsb_staff', JSON.stringify(teachers));
localStorage.setItem('vsb_students', JSON.stringify(students));
localStorage.setItem('activityLibrary', JSON.stringify(activities));
localStorage.setItem('vsb_settings', JSON.stringify(settings));

// Also save in alternate key formats for compatibility
localStorage.setItem('staff', JSON.stringify(teachers));
localStorage.setItem('students', JSON.stringify(students));

console.log('✅ Demo data imported successfully!');
console.log('🔄 Please refresh the app to see the new data.');
`;
    
    const scriptPath = path.join(dataDir, 'import-demo-data.js');
    fs.writeFileSync(scriptPath, importScript);
    console.log(`\n📜 Created import script: ${scriptPath}`);
    
    return scriptPath;
}

function main() {
    console.log('\n🚀 Creating fresh demo data for development environment...\n');
    
    try {
        const dataDir = createDemoDataFiles();
        const scriptPath = createImportScript(dataDir);
        
        console.log('\n🎉 DEMO DATA CREATION COMPLETE!\n');
        console.log('📋 Next Steps:');
        console.log('1. Start your development server: npm run dev');
        console.log('2. Open the app and go to Developer Tools (F12)');
        console.log('3. In the Console tab, run the import script:');
        console.log(`   // Copy and paste the contents of: ${scriptPath}`);
        console.log('4. Or use the browser-based demo data creator tools');
        console.log('5. Refresh the app to see your fresh demo data');
        
        console.log('\n✨ Your development environment now has:');
        console.log('• Separate storage from production');
        console.log('• Fresh, clean demo data');
        console.log('• No conflicts with installed version');
        
    } catch (error) {
        console.error('❌ Error creating demo data:', error.message);
        process.exit(1);
    }
}

main();
