// This script initializes the database with migrations and seed data
const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Starting database initialization...');

try {
  // Generate Prisma client
  console.log('📝 Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });

  // Run database migrations
  console.log('🔄 Running database migrations...');
  execSync('npx prisma migrate dev --name init', { stdio: 'inherit' });

  // Seed the database
  console.log('🌱 Seeding the database...');
  execSync('npx prisma db seed', { stdio: 'inherit' });

  console.log('✅ Database initialization completed successfully!');
} catch (error) {
  console.error('❌ Error initializing database:', error.message);
  process.exit(1);
}
