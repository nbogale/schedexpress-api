/**
 * Script to clean up orphaned schedule import files
 * This removes files from the uploads directory that are not referenced in the database
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs/promises');
const path = require('path');

const prisma = new PrismaClient();
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'schedule-imports');

async function cleanupOrphanedFiles() {
  try {
    console.log('Starting cleanup of orphaned import files...');
    
    // Get all file paths from database
    const importFiles = await prisma.scheduleImportFile.findMany({
      select: { filePath: true },
    });
    const dbFilePaths = new Set(importFiles.map((f) => f.filePath));
    
    console.log(`Found ${dbFilePaths.size} files referenced in database`);

    // Check if upload directory exists
    try {
      await fs.access(UPLOAD_DIR);
    } catch {
      console.log('Upload directory does not exist, nothing to clean up.');
      return;
    }

    // Get all files in upload directory
    const files = await fs.readdir(UPLOAD_DIR);
    console.log(`Found ${files.length} files in upload directory`);

    let deleted = 0;
    let errors = 0;

    // Delete files that are not in database
    for (const file of files) {
      const filePath = path.join(UPLOAD_DIR, file);
      if (!dbFilePaths.has(filePath)) {
        try {
          await fs.unlink(filePath);
          deleted++;
          console.log(`✓ Deleted orphaned file: ${file}`);
        } catch (error) {
          errors++;
          console.error(`✗ Could not delete ${file}: ${error.message}`);
        }
      }
    }

    console.log(`\nCleanup complete:`);
    console.log(`  - ${deleted} files deleted`);
    console.log(`  - ${errors} errors`);
    console.log(`  - ${files.length - deleted - errors} files kept (referenced in database)`);
  } catch (error) {
    console.error('Error during cleanup:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupOrphanedFiles();

