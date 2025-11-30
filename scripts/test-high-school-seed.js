#!/usr/bin/env node

/**
 * Test script for the high school mock data seed
 * This script runs the high school seed and provides feedback
 */

const { exec } = require('child_process');
const path = require('path');

console.log('🧪 Testing High School Mock Data Seed...\n');

// Run the high school seed
const seedCommand = 'npm run prisma:seed:highschool';

exec(seedCommand, { cwd: process.cwd() }, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Error running high school seed:');
    console.error(error.message);
    process.exit(1);
  }

  if (stderr) {
    console.error('⚠️  Warnings/Errors:');
    console.error(stderr);
  }

  console.log('📊 Seed Output:');
  console.log(stdout);

  console.log('\n✅ High school seed test completed!');
  console.log('\n📋 Next steps:');
  console.log('1. Check your database to verify the data was created');
  console.log('2. Test the API endpoints with the new data');
  console.log('3. Verify user authentication with usernames');
  console.log('\n🔑 Test credentials (new username format):');
  console.log('   Username: athompson (first letter + last name)');
  console.log('   Password: Welcome2ES!');
  console.log('   Role: STUDENT');
  console.log('\n   Username: sjohnson');
  console.log('   Password: Welcome2ES!');
  console.log('   Role: TEACHER');
  console.log('\n   Other examples: bchen, cdavis, devans, etc.');
});
