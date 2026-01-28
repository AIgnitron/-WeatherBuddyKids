#!/usr/bin/env node
/**
 * renameApk.js
 * 
 * Finds the APK file in ./release/android/ (or newest if multiple)
 * and renames/copies it to WeatherBuddyKids.apk
 * 
 * Usage:
 *   npm run rename:apk
 *   node scripts/renameApk.js
 */

const fs = require('fs');
const path = require('path');

const RELEASE_DIR = path.join(__dirname, '..', 'release', 'android');
const TARGET_NAME = 'WeatherBuddyKids.apk';

function main() {
  console.log('🔍 Looking for APK files in:', RELEASE_DIR);

  // Check if directory exists
  if (!fs.existsSync(RELEASE_DIR)) {
    console.error(`❌ Directory not found: ${RELEASE_DIR}`);
    console.error('   Create the directory and place your APK there after EAS build.');
    console.error('   mkdir -p release/android');
    process.exit(1);
  }

  // Find all .apk files
  const files = fs.readdirSync(RELEASE_DIR);
  const apkFiles = files.filter(f => f.toLowerCase().endsWith('.apk'));

  if (apkFiles.length === 0) {
    console.error('❌ No APK files found in:', RELEASE_DIR);
    console.error('   Download your APK from EAS and place it in this folder.');
    process.exit(1);
  }

  // If multiple APKs, pick the newest one
  let sourceFile;
  if (apkFiles.length === 1) {
    sourceFile = apkFiles[0];
  } else {
    console.log(`📦 Found ${apkFiles.length} APK files, selecting newest...`);
    
    // Sort by modification time (newest first)
    const sorted = apkFiles
      .map(f => ({
        name: f,
        mtime: fs.statSync(path.join(RELEASE_DIR, f)).mtime.getTime()
      }))
      .sort((a, b) => b.mtime - a.mtime);
    
    sourceFile = sorted[0].name;
    console.log(`   Newest: ${sourceFile}`);
  }

  const sourcePath = path.join(RELEASE_DIR, sourceFile);
  const targetPath = path.join(RELEASE_DIR, TARGET_NAME);

  // If source already has the target name, we're done
  if (sourceFile === TARGET_NAME) {
    console.log(`✅ APK already named: ${TARGET_NAME}`);
    console.log(`   Path: ${targetPath}`);
    process.exit(0);
  }

  // Copy/rename the file
  try {
    fs.copyFileSync(sourcePath, targetPath);
    console.log(`✅ Renamed APK to: ${TARGET_NAME}`);
    console.log(`   From: ${sourceFile}`);
    console.log(`   Path: ${targetPath}`);
    
    // Get file size for confirmation
    const stats = fs.statSync(targetPath);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`   Size: ${sizeMB} MB`);
  } catch (err) {
    console.error('❌ Failed to rename APK:', err.message);
    process.exit(1);
  }
}

main();
