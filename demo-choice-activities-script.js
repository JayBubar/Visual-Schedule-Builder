// Demo Choice Activities Script for Visual Schedule Builder
// Instructions: Open browser console (F12) and paste this entire script, then press Enter

console.log('🎯 Adding Demo Choice Activities to Visual Schedule Builder...');

// Demo Choice Activities Data
const demoChoiceActivities = [
  {
    id: 'choice-art-center',
    name: 'Art Center',
    icon: '🎨',
    category: 'choice-items',
    choiceEligible: true,
    defaultDuration: 20,
    maxStudents: 4,
    skillLevel: 'all',
    supervisionNeeded: true,
    description: 'Creative art activities with various materials like crayons, markers, paper, and craft supplies',
    tags: ['creative', 'fine-motor', 'expression'],
    isCustom: true,
    createdAt: new Date().toISOString(),
    materials: ['Paper', 'Crayons', 'Markers', 'Glue sticks', 'Scissors'],
    instructions: 'Students can choose from various art materials to create their own artwork'
  },
  {
    id: 'choice-reading-corner',
    name: 'Reading Corner',
    icon: '📚',
    category: 'choice-items',
    choiceEligible: true,
    defaultDuration: 15,
    maxStudents: 3,
    skillLevel: 'all',
    supervisionNeeded: false,
    description: 'Quiet reading space with books, magazines, and comfortable seating',
    tags: ['literacy', 'quiet', 'independent'],
    isCustom: true,
    createdAt: new Date().toISOString(),
    materials: ['Books', 'Cushions', 'Reading light'],
    instructions: 'Students select books and read independently in the cozy corner'
  },
  {
    id: 'choice-sensory-bin',
    name: 'Sensory Bin',
    icon: '🤲',
    category: 'choice-items',
    choiceEligible: true,
    defaultDuration: 10,
    maxStudents: 2,
    skillLevel: 'all',
    supervisionNeeded: true,
    description: 'Tactile exploration with rice, beans, sand, or other sensory materials',
    tags: ['sensory', 'tactile', 'calming'],
    isCustom: true,
    createdAt: new Date().toISOString(),
    materials: ['Sensory bin', 'Rice/beans', 'Scoops', 'Small toys'],
    instructions: 'Students explore different textures and materials with their hands'
  },
  {
    id: 'choice-computer-time',
    name: 'Computer Time',
    icon: '💻',
    category: 'choice-items',
    choiceEligible: true,
    defaultDuration: 15,
    maxStudents: 2,
    skillLevel: 'intermediate',
    supervisionNeeded: true,
    description: 'Educational computer games and typing practice',
    tags: ['technology', 'learning', 'digital'],
    isCustom: true,
    createdAt: new Date().toISOString(),
    materials: ['Computer/tablet', 'Headphones', 'Educational software'],
    instructions: 'Students use educational software and games to practice skills'
  },
  {
    id: 'choice-building-blocks',
    name: 'Building Blocks',
    icon: '🧱',
    category: 'choice-items',
    choiceEligible: true,
    defaultDuration: 20,
    maxStudents: 4,
    skillLevel: 'all',
    supervisionNeeded: false,
    description: 'Construction play with various building materials and blocks',
    tags: ['construction', 'spatial', 'creativity'],
    isCustom: true,
    createdAt: new Date().toISOString(),
    materials: ['Lego blocks', 'Wooden blocks', 'Magnetic tiles'],
    instructions: 'Students build structures and creations using various block materials'
  },
  {
    id: 'choice-puzzles',
    name: 'Puzzle Station',
    icon: '🧩',
    category: 'choice-items',
    choiceEligible: true,
    defaultDuration: 15,
    maxStudents: 3,
    skillLevel: 'all',
    supervisionNeeded: false,
    description: 'Various puzzles for problem-solving and fine motor development',
    tags: ['problem-solving', 'fine-motor', 'concentration'],
    isCustom: true,
    createdAt: new Date().toISOString(),
    materials: ['Jigsaw puzzles', 'Logic puzzles', 'Shape sorters'],
    instructions: 'Students choose puzzles appropriate for their skill level and work independently'
  },
  {
    id: 'choice-quiet-corner',
    name: 'Quiet Corner',
    icon: '🤫',
    category: 'choice-items',
    choiceEligible: true,
    defaultDuration: 10,
    maxStudents: 2,
    skillLevel: 'all',
    supervisionNeeded: false,
    description: 'Peaceful space for rest, reflection, or quiet activities',
    tags: ['calm', 'rest', 'self-regulation'],
    isCustom: true,
    createdAt: new Date().toISOString(),
    materials: ['Soft cushions', 'Blanket', 'Calm-down tools'],
    instructions: 'Students use this space when they need a quiet break or to self-regulate'
  },
  {
    id: 'choice-listening-center',
    name: 'Listening Center',
    icon: '🎧',
    category: 'choice-items',
    choiceEligible: true,
    defaultDuration: 15,
    maxStudents: 4,
    skillLevel: 'all',
    supervisionNeeded: false,
    description: 'Audio books, music, and educational recordings with headphones',
    tags: ['listening', 'audio', 'literacy'],
    isCustom: true,
    createdAt: new Date().toISOString(),
    materials: ['Headphones', 'Audio player', 'Books with CDs'],
    instructions: 'Students listen to stories, music, or educational content with headphones'
  },
  {
    id: 'choice-science-exploration',
    name: 'Science Exploration',
    icon: '🔬',
    category: 'choice-items',
    choiceEligible: true,
    defaultDuration: 20,
    maxStudents: 3,
    skillLevel: 'intermediate',
    supervisionNeeded: true,
    description: 'Hands-on science activities and simple experiments',
    tags: ['science', 'exploration', 'discovery'],
    isCustom: true,
    createdAt: new Date().toISOString(),
    materials: ['Magnifying glasses', 'Simple experiments', 'Science books'],
    instructions: 'Students explore science concepts through hands-on activities and observations'
  },
  {
    id: 'choice-dramatic-play',
    name: 'Dramatic Play',
    icon: '🎭',
    category: 'choice-items',
    choiceEligible: true,
    defaultDuration: 20,
    maxStudents: 6,
    skillLevel: 'all',
    supervisionNeeded: false,
    description: 'Role-playing and imaginative play with costumes and props',
    tags: ['dramatic', 'social', 'imagination'],
    isCustom: true,
    createdAt: new Date().toISOString(),
    materials: ['Costumes', 'Props', 'Play kitchen', 'Dolls'],
    instructions: 'Students engage in imaginative role-play and social interaction'
  }
];

// Function to add activities to the system
function addDemoChoiceActivities() {
  try {
    // Get existing custom activities from localStorage
    const existingActivities = JSON.parse(localStorage.getItem('custom_activities') || '[]');
    
    // Check if demo activities already exist
    const existingIds = existingActivities.map(a => a.id);
    const newActivities = demoChoiceActivities.filter(activity => !existingIds.includes(activity.id));
    
    if (newActivities.length === 0) {
      console.log('✅ Demo choice activities already exist in the system!');
      return;
    }
    
    // Add new activities to existing ones
    const updatedActivities = [...existingActivities, ...newActivities];
    
    // Save to localStorage
    localStorage.setItem('custom_activities', JSON.stringify(updatedActivities));
    
    // Also add to available activities for immediate use
    const availableActivities = JSON.parse(localStorage.getItem('available_activities') || '[]');
    const activitiesForSchedule = newActivities.map(activity => ({
      ...activity,
      id: `${activity.id}_${Date.now()}`,
      originalId: activity.id,
      addedFromLibrary: true,
      duration: activity.defaultDuration
    }));
    
    const updatedAvailableActivities = [...availableActivities, ...activitiesForSchedule];
    localStorage.setItem('available_activities', JSON.stringify(updatedAvailableActivities));
    
    // Trigger update events
    window.dispatchEvent(new CustomEvent('activitiesUpdated', {
      detail: { 
        activities: updatedActivities,
        source: 'DemoScript',
        timestamp: Date.now()
      }
    }));
    
    console.log(`✅ Successfully added ${newActivities.length} demo choice activities!`);
    console.log('📋 Added activities:', newActivities.map(a => a.name).join(', '));
    console.log('🎯 All activities are marked as choice-eligible and ready for Daily Check-In!');
    console.log('🔄 Refresh the Activity Library to see the new activities.');
    
    // Show success message
    if (typeof alert !== 'undefined') {
      alert(`✅ Success! Added ${newActivities.length} demo choice activities.\n\nRefresh the Activity Library to see them!`);
    }
    
  } catch (error) {
    console.error('❌ Error adding demo activities:', error);
    if (typeof alert !== 'undefined') {
      alert('❌ Error adding demo activities. Check the console for details.');
    }
  }
}

// Function to show current choice activities
function showChoiceActivities() {
  try {
    const customActivities = JSON.parse(localStorage.getItem('custom_activities') || '[]');
    const choiceActivities = customActivities.filter(a => a.choiceEligible);
    
    console.log(`📊 Current choice-eligible activities: ${choiceActivities.length}`);
    choiceActivities.forEach(activity => {
      console.log(`  • ${activity.name} (${activity.category}) - ${activity.defaultDuration}min`);
    });
    
    return choiceActivities;
  } catch (error) {
    console.error('Error reading choice activities:', error);
    return [];
  }
}

// Function to remove demo activities (for cleanup)
function removeDemoChoiceActivities() {
  try {
    const existingActivities = JSON.parse(localStorage.getItem('custom_activities') || '[]');
    const demoIds = demoChoiceActivities.map(a => a.id);
    const filteredActivities = existingActivities.filter(a => !demoIds.includes(a.id));
    
    localStorage.setItem('custom_activities', JSON.stringify(filteredActivities));
    
    // Also remove from available activities
    const availableActivities = JSON.parse(localStorage.getItem('available_activities') || '[]');
    const filteredAvailable = availableActivities.filter(a => !demoIds.includes(a.originalId));
    localStorage.setItem('available_activities', JSON.stringify(filteredAvailable));
    
    console.log('🗑️ Demo choice activities removed!');
    
    // Trigger update event
    window.dispatchEvent(new CustomEvent('activitiesUpdated', {
      detail: { 
        activities: filteredActivities,
        source: 'DemoScript',
        timestamp: Date.now()
      }
    }));
    
  } catch (error) {
    console.error('Error removing demo activities:', error);
  }
}

// Main execution
console.log('🎯 Demo Choice Activities Script Loaded!');
console.log('📝 Available commands:');
console.log('  • addDemoChoiceActivities() - Add demo activities');
console.log('  • showChoiceActivities() - Show current choice activities');
console.log('  • removeDemoChoiceActivities() - Remove demo activities');
console.log('');

// Auto-run the addition
addDemoChoiceActivities();

// Make functions available globally for manual use
window.addDemoChoiceActivities = addDemoChoiceActivities;
window.showChoiceActivities = showChoiceActivities;
window.removeDemoChoiceActivities = removeDemoChoiceActivities;

console.log('✨ Demo script complete! Check the Activity Library for new choice activities.');
