# Mock Data for SchedExpress API

This directory contains comprehensive mock data for the SchedExpress API, specifically designed for a high school environment.

## Files Overview

### 📁 Core Files
- **`seed-high-school.ts`** - Main seeding script with comprehensive high school data
- **`mock-data.sql`** - SQL INSERT statements for all entities
- **`mock-data.json`** - JSON structure of the mock data
- **`scripts/seed-mock-data.js`** - JavaScript generator for mock data

### 📋 Documentation
- **`MOCK_DATA_GENERATOR.md`** - Detailed documentation of the mock data structure
- **`MOCK_DATA_README.md`** - This file

## Quick Start

### Option 1: Use the High School Seed Script (Recommended)
```bash
# Run the comprehensive high school seed
npm run prisma:seed:highschool
```

### Option 2: Use the Original Seed
```bash
# Run the original seed
npm run prisma:seed
```

### Option 3: Manual SQL Import
```bash
# Import SQL directly (requires database setup)
psql -d your_database -f mock-data.sql
```

## High School Mock Data Features

### 🏫 School Information
- **School Name**: Lincoln High School
- **Type**: Public High School (Grades 9-12)
- **Total Students**: 1,200
- **Total Teachers**: 85
- **Total Staff**: 110

### 👥 User Accounts (All with Usernames)
- **Administrators**: 2 (Principal, Vice Principal)
- **Platform Administrators**: 2
- **Counselors**: 6 (Head Counselor + Grade-level Counselors + College & Career Counselor)
- **Teachers**: 55+ (across all departments)
- **Students**: 1,200 (300 per grade level)
- **Parents/Guardians**: 1,200+ (linked to students)

### 📚 Academic Structure
- **Departments**: 10 (Mathematics, English, Science, Social Studies, World Languages, Technology, CTE, PE, Arts, Special Education)
- **Grade Levels**: 4 (Grades 9-12)
- **Course Levels**: 5 (Regular, Honors, AP, Dual Enrollment, CTE)
- **Courses**: 50+ (including AP courses)
- **Course Sections**: 200+ (multiple sections per course)

### 🏢 Infrastructure
- **Rooms**: 23 (classrooms, labs, gym, auditorium, etc.)
- **Time Blocks**: 8 periods (8:00 AM - 3:50 PM)
- **Academic Cycles**: 2024-2025 School Year
- **Terms**: Fall 2024, Spring 2025

### 📝 Schedule Management
- **Schedules**: Individual student schedules
- **Schedule Change Requests**: 3 types (Add Course, Drop Course, Change Section)
- **Request Statuses**: Pending, Approved, Rejected
- **Academic Cycle Configuration**: Schedule change rules and deadlines

### 📊 Grading System
- **Grade Lookup**: 12 grade levels (A+ to F)
- **GPA Points**: 0.0 to 4.0 scale
- **Grade Descriptions**: Excellent, Good, Satisfactory, etc.

## Username Format

All users have usernames following the pattern: `firstname.lastname`

### Examples:
- **Students**: `alex.thompson`, `bella.rodriguez`, `caleb.johnson`
- **Teachers**: `s.johnson`, `j.miller`, `r.green`
- **Administrators**: `p.williams`, `j.anderson`
- **Counselors**: `p.lee`, `m.torres`, `j.adams`

## Email Domains

- **Staff**: `@lincolnhs.edu`
- **Students**: `@student.lincolnhs.edu`
- **Parents**: `@email.com`

## Default Passwords

All accounts use the default password: `Welcome2ES!`

## Sample Data Highlights

### 🎓 Sample Students (Grade 9)
- Alex Thompson (240001)
- Bella Rodriguez (240002)
- Caleb Johnson (240003)
- Diana Martinez (240004)
- Ethan Williams (240005)

### 👨‍🏫 Sample Teachers
- Sarah Johnson (Mathematics - Algebra I, AP Calculus AB)
- James Miller (Mathematics - Geometry, Pre-Calculus)
- Emily Rodriguez (English - English 11, AP English Language)
- Christopher Taylor (English - English 9, English 10)

### 📋 Sample Schedule Change Requests
1. **Add Course**: Alex wants to add AP Calculus AB
2. **Drop Course**: Bella needs to drop Algebra I due to work-study conflict
3. **Change Section**: Caleb wants to switch English sections

### 🏛️ Sample Departments
- **Mathematics**: Algebra, Geometry, Pre-Calculus, Calculus, AP Courses
- **English Language Arts**: English 9-12, AP English Language, AP English Literature
- **Science**: Biology, Chemistry, Physics, AP Sciences
- **Social Studies**: World History, US History, AP History, Government

## Database Schema Compliance

The mock data is fully compliant with the Prisma schema and includes:
- ✅ All required fields
- ✅ Proper foreign key relationships
- ✅ Valid enum values
- ✅ Appropriate data types
- ✅ Realistic data ranges

## Customization

### Adding More Data
1. Edit `seed-high-school.ts` to add more entities
2. Update the generator arrays (names, courses, etc.)
3. Run the seed script again

### Modifying Existing Data
1. Update the data arrays in `seed-high-school.ts`
2. Clear the database: `npx prisma migrate reset`
3. Run the seed script: `npm run prisma:seed:highschool`

## Troubleshooting

### Common Issues
1. **Database Connection**: Ensure your database is running and accessible
2. **Prisma Client**: Run `npm run prisma:generate` if you get Prisma client errors
3. **Migrations**: Run `npm run prisma:migrate` if schema changes are needed

### Reset Database
```bash
# Reset database and run migrations
npx prisma migrate reset

# Then run the seed
npm run prisma:seed:highschool
```

## Support

For questions or issues with the mock data:
1. Check the `MOCK_DATA_GENERATOR.md` for detailed documentation
2. Review the Prisma schema for field requirements
3. Check the console output for specific error messages

---

**Note**: This mock data is designed for development and testing purposes. For production use, ensure all passwords are changed and sensitive data is properly secured.
