// Morning Meeting Debug Script
// This script helps diagnose issues with Morning Meeting step configuration

console.log('🔍 Morning Meeting Debug Script');
console.log('================================');

// Check if we're in a browser environment
if (typeof window !== 'undefined' && window.localStorage) {
  console.log('\n📊 Checking localStorage for Morning Meeting settings...');
  
  // Check for any Morning Meeting related keys
  const keys = Object.keys(localStorage);
  const mmKeys = keys.filter(key => 
    key.toLowerCase().includes('morning') || 
    key.toLowerCase().includes('meeting') ||
    key.toLowerCase().includes('settings')
  );
  
  console.log('Found localStorage keys:', mmKeys);
  
  mmKeys.forEach(key => {
    try {
      const value = localStorage.getItem(key);
      console.log(`\n🔑 ${key}:`, JSON.parse(value));
    } catch (e) {
      console.log(`\n🔑 ${key}:`, value);
    }
  });
  
  // Check for unified data service settings
  try {
    const settingsKey = keys.find(key => key.includes('settings') || key.includes('unified'));
    if (settingsKey) {
      const settings = JSON.parse(localStorage.getItem(settingsKey));
      console.log('\n⚙️ Unified Settings:', settings);
      
      if (settings && settings.morningMeeting) {
        console.log('\n🌅 Morning Meeting Settings:', settings.morningMeeting);
        
        if (settings.morningMeeting.checkInFlow) {
          console.log('\n📋 Check-in Flow Settings:', settings.morningMeeting.checkInFlow);
          
          // Check specifically for dayReview
          const dayReviewEnabled = settings.morningMeeting.checkInFlow.dayReview;
          console.log(`\n🎯 Day Review Step Enabled: ${dayReviewEnabled}`);
          
          // Count enabled steps
          const enabledSteps = Object.entries(settings.morningMeeting.checkInFlow)
            .filter(([key, value]) => value === true);
          console.log(`\n📊 Total Enabled Steps: ${enabledSteps.length}`);
          console.log('Enabled Steps:', enabledSteps.map(([key]) => key));
        }
      }
    }
  } catch (e) {
    console.error('Error parsing settings:', e);
  }
  
} else {
  console.log('❌ Not in browser environment or localStorage not available');
}

// If running in Node.js, check for any config files
if (typeof require !== 'undefined') {
  const fs = require('fs');
  const path = require('path');
  
  console.log('\n📁 Checking for config files...');
  
  const configPaths = [
    './src/renderer/data/',
    './src/renderer/services/',
    './'
  ];
  
  configPaths.forEach(configPath => {
    try {
      if (fs.existsSync(configPath)) {
        const files = fs.readdirSync(configPath);
        const configFiles = files.filter(file => 
          file.includes('config') || 
          file.includes('settings') ||
          file.includes('morning')
        );
        
        if (configFiles.length > 0) {
          console.log(`Found config files in ${configPath}:`, configFiles);
        }
      }
    } catch (e) {
      // Ignore errors for paths that don't exist
    }
  });
}

console.log('\n✅ Debug script complete');
console.log('================================');
