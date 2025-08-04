// 🧹 Electron Storage Cleanup Script
// This script will remove the conflicting storage from the production version

const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('🔥 Visual Schedule Builder - Storage Cleanup');
console.log('='.repeat(50));

// Storage locations to clean
const storagePaths = [
    // Main Electron storage (the conflicting one)
    path.join(os.homedir(), 'AppData', 'Roaming', 'visual-schedule-builder'),
    // Backup/cache locations
    path.join(os.homedir(), 'AppData', 'Local', 'visual-schedule-builder'),
    // File-based storage
    path.join(os.homedir(), '.visual-schedule-builder'),
];

function deleteDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) {
        console.log(`⏭️  Directory doesn't exist: ${dirPath}`);
        return false;
    }

    try {
        console.log(`🗑️  Removing: ${dirPath}`);
        
        // Get directory size first
        let totalSize = 0;
        function calculateSize(dir) {
            const files = fs.readdirSync(dir);
            files.forEach(file => {
                const filePath = path.join(dir, file);
                const stats = fs.statSync(filePath);
                if (stats.isDirectory()) {
                    calculateSize(filePath);
                } else {
                    totalSize += stats.size;
                }
            });
        }
        calculateSize(dirPath);
        
        // Remove directory recursively
        fs.rmSync(dirPath, { recursive: true, force: true });
        
        console.log(`✅ Successfully removed ${dirPath}`);
        console.log(`💽 Freed ${(totalSize / 1024).toFixed(2)} KB of storage`);
        return true;
    } catch (error) {
        console.error(`❌ Error removing ${dirPath}:`, error.message);
        return false;
    }
}

function main() {
    console.log('\n🔍 Scanning for Visual Schedule Builder storage locations...\n');
    
    let foundAny = false;
    let removedCount = 0;
    
    storagePaths.forEach(storagePath => {
        if (fs.existsSync(storagePath)) {
            foundAny = true;
            console.log(`📁 Found: ${storagePath}`);
            
            // Show contents
            try {
                const contents = fs.readdirSync(storagePath);
                console.log(`   Contents: ${contents.join(', ')}`);
            } catch (err) {
                console.log(`   (Cannot read contents: ${err.message})`);
            }
        }
    });
    
    if (!foundAny) {
        console.log('✅ No conflicting storage locations found!');
        console.log('🎯 Your development environment should already be clean.');
        return;
    }
    
    console.log('\n⚠️  WARNING: This will permanently delete ALL Visual Schedule Builder data!');
    console.log('This includes data from both development and production versions.');
    console.log('This action cannot be undone.\n');
    
    // In a real scenario, you'd want user confirmation here
    // For now, we'll just show what would be removed
    console.log('🚨 PREVIEW MODE - Showing what would be removed:');
    console.log('(Run with --force to actually delete)\n');
    
    const forceMode = process.argv.includes('--force');
    
    storagePaths.forEach(storagePath => {
        if (fs.existsSync(storagePath)) {
            if (forceMode) {
                if (deleteDirectory(storagePath)) {
                    removedCount++;
                }
            } else {
                console.log(`🔍 Would remove: ${storagePath}`);
            }
        }
    });
    
    if (forceMode) {
        console.log(`\n🎉 CLEANUP COMPLETE!`);
        console.log(`📊 Removed ${removedCount} storage locations`);
        console.log('🚀 Your development environment is now clean.');
        console.log('\nNext steps:');
        console.log('1. Start your development server: npm run dev');
        console.log('2. The app will now use fresh, clean storage');
        console.log('3. Add your demo data through the app interface');
    } else {
        console.log('\n📋 PREVIEW COMPLETE');
        console.log('To actually perform the cleanup, run:');
        console.log('   node cleanup-electron-storage.js --force');
    }
}

main();
