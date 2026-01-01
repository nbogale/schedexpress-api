import { PrismaClient, UserRole, ConflictType, RequestStatus, NotificationType, RotationDay, RelationshipType, ContactMethod, DigestFrequency, RequestType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting high school mock data seeding...');

  // Clear existing data
  // Delete in order: child tables first, then parent tables (respecting foreign key constraints)
  // Run sequentially to avoid deadlocks
  const deleteOperations = [
    // Level 1: Most dependent tables (have foreign keys to multiple other tables)
    () => prisma.scheduleCourseSection.deleteMany().catch(() => {}),
    () => prisma.scheduleImportDetail.deleteMany().catch(() => {}),
    () => prisma.studentCourseHistory.deleteMany().catch(() => {}),
    () => prisma.studentGrade.deleteMany().catch(() => {}),
    () => prisma.scheduleChangeAction.deleteMany().catch(() => {}),
    () => prisma.courseWaitlist.deleteMany().catch(() => {}),
    () => prisma.courseConflict.deleteMany().catch(() => {}),
    
    // Level 2: Tables that depend on Level 1 or other Level 2 tables
    () => prisma.schedule.deleteMany().catch(() => {}),
    () => prisma.scheduleChangeRequest.deleteMany().catch(() => {}),
    () => prisma.scheduleImportFile.deleteMany().catch(() => {}),
    () => prisma.courseSection.deleteMany().catch(() => {}),
    () => prisma.academicPeriod.deleteMany().catch(() => {}),
    () => prisma.coursePrerequisite.deleteMany().catch(() => {}),
    () => prisma.courseSequence.deleteMany().catch(() => {}),
    () => prisma.courseRule.deleteMany().catch(() => {}),
    () => prisma.academicCycleRule.deleteMany().catch(() => {}),
    () => prisma.teacherCourse.deleteMany().catch(() => {}),
    
    // Level 3: Tables that depend on Level 2
    () => prisma.academicCycle.deleteMany().catch(() => {}),
    () => prisma.course.deleteMany().catch(() => {}),
    () => prisma.student.deleteMany().catch(() => {}),
    () => prisma.notification.deleteMany().catch(() => {}),
    () => prisma.auditLog.deleteMany().catch(() => {}),
    
    // Level 4: User-related tables
    () => prisma.userStatusHistory.deleteMany().catch(() => {}),
    () => prisma.userAccountHistory.deleteMany().catch(() => {}),
    () => prisma.userAccount.deleteMany().catch(() => {}),
    () => prisma.parentGuardian.deleteMany().catch(() => {}),
    () => prisma.notificationPreferences.deleteMany().catch(() => {}),
    () => prisma.teacher.deleteMany().catch(() => {}),
    
    // Level 5: Base reference tables (few or no dependencies)
    () => prisma.academicCycleConfig.deleteMany().catch(() => {}),
    () => prisma.academicSettings.deleteMany().catch(() => {}),
    () => prisma.timeBlock.deleteMany().catch(() => {}),
    () => prisma.room.deleteMany().catch(() => {}),
    () => prisma.gradeLevel.deleteMany().catch(() => {}),
    () => prisma.courseLevel.deleteMany().catch(() => {}),
    () => prisma.department.deleteMany().catch(() => {}),
    () => prisma.gradeLookup.deleteMany().catch(() => {}),
    () => prisma.systemSetting.deleteMany().catch(() => {}),
    () => prisma.settings.deleteMany().catch(() => {}),
    
    // Level 6: User table (depends on nothing, but many depend on it)
    () => prisma.user.deleteMany().catch(() => {}),
  ];

  // Run sequentially to avoid deadlocks
  for (const operation of deleteOperations) {
    await operation();
  }

  console.log('🧹 Cleared existing data');

  // Create Departments
  const departments = await Promise.all([
    prisma.department.create({ data: { name: 'Mathematics', code: 'MATH', description: 'Algebra, Geometry, Pre-Calculus, Calculus, and AP Courses' } }),
    prisma.department.create({ data: { name: 'English Language Arts', code: 'ELA', description: 'English 9-12, AP English Language, AP English Literature' } }),
    prisma.department.create({ data: { name: 'Science', code: 'SCI', description: 'Biology, Chemistry, Physics, AP Sciences' } }),
    prisma.department.create({ data: { name: 'Social Studies', code: 'SOC', description: 'World History, US History, AP History, Government' } }),
    prisma.department.create({ data: { name: 'World Languages', code: 'LANG', description: 'Spanish, French, German, AP Languages' } }),
    prisma.department.create({ data: { name: 'Technology & Computer Science', code: 'TECH', description: 'Computer Science, AP Computer Science, Digital Media' } }),
    prisma.department.create({ data: { name: 'Career & Technical Education', code: 'CTE', description: 'Business, Marketing, Engineering, Health Sciences' } }),
    prisma.department.create({ data: { name: 'Physical Education', code: 'PE', description: 'Physical Education, Health, Sports' } }),
    prisma.department.create({ data: { name: 'Arts & Music', code: 'ARTS', description: 'Visual Arts, Music, Theater, AP Art' } }),
    prisma.department.create({ data: { name: 'Special Education', code: 'SPED', description: 'Special Education Services' } })
  ]);

  console.log('📚 Created departments');

  // Create Course Levels
  const courseLevels = await Promise.all([
    prisma.courseLevel.create({ data: { name: 'Regular', rank: 1 } }),
    prisma.courseLevel.create({ data: { name: 'Honors', rank: 2 } }),
    prisma.courseLevel.create({ data: { name: 'AP', rank: 3 } }),
    prisma.courseLevel.create({ data: { name: 'Dual Enrollment', rank: 4 } }),
    prisma.courseLevel.create({ data: { name: 'CTE', rank: 5 } })
  ]);

  // Create Grade Levels (High School)
  const gradeLevels = await Promise.all([
    prisma.gradeLevel.create({ data: { name: 'Grade 9', level: 9 } }),
    prisma.gradeLevel.create({ data: { name: 'Grade 10', level: 10 } }),
    prisma.gradeLevel.create({ data: { name: 'Grade 11', level: 11 } }),
    prisma.gradeLevel.create({ data: { name: 'Grade 12', level: 12 } })
  ]);

  console.log('🎓 Created grade levels');

  // Create Rooms (Expanded for medium-sized high school)
  const rooms = await Promise.all([
    // First Floor
    prisma.room.create({ data: { roomNo: 'R101', name: 'Room 101', capacity: 30 } }),
    prisma.room.create({ data: { roomNo: 'R102', name: 'Room 102', capacity: 30 } }),
    prisma.room.create({ data: { roomNo: 'R103', name: 'Room 103', capacity: 30 } }),
    prisma.room.create({ data: { roomNo: 'R104', name: 'Room 104', capacity: 30 } }),
    prisma.room.create({ data: { roomNo: 'R105', name: 'Room 105', capacity: 30 } }),
    prisma.room.create({ data: { roomNo: 'R106', name: 'Room 106', capacity: 30 } }),
    prisma.room.create({ data: { roomNo: 'R107', name: 'Room 107', capacity: 30 } }),
    prisma.room.create({ data: { roomNo: 'R108', name: 'Room 108', capacity: 30 } }),
    prisma.room.create({ data: { roomNo: 'R109', name: 'Room 109', capacity: 30 } }),
    prisma.room.create({ data: { roomNo: 'R110', name: 'Room 110', capacity: 30 } }),
    
    // Second Floor
    prisma.room.create({ data: { roomNo: 'R201', name: 'Room 201', capacity: 30 } }),
    prisma.room.create({ data: { roomNo: 'R202', name: 'Room 202', capacity: 30 } }),
    prisma.room.create({ data: { roomNo: 'R203', name: 'Room 203', capacity: 30 } }),
    prisma.room.create({ data: { roomNo: 'R204', name: 'Room 204', capacity: 30 } }),
    prisma.room.create({ data: { roomNo: 'R205', name: 'Room 205', capacity: 30 } }),
    prisma.room.create({ data: { roomNo: 'R206', name: 'Room 206', capacity: 30 } }),
    prisma.room.create({ data: { roomNo: 'R207', name: 'Room 207', capacity: 30 } }),
    prisma.room.create({ data: { roomNo: 'R208', name: 'Room 208', capacity: 30 } }),
    prisma.room.create({ data: { roomNo: 'R209', name: 'Room 209', capacity: 30 } }),
    prisma.room.create({ data: { roomNo: 'R210', name: 'Room 210', capacity: 30 } }),
    
    // Third Floor
    prisma.room.create({ data: { roomNo: 'R301', name: 'Room 301', capacity: 30 } }),
    prisma.room.create({ data: { roomNo: 'R302', name: 'Room 302', capacity: 30 } }),
    prisma.room.create({ data: { roomNo: 'R303', name: 'Room 303', capacity: 30 } }),
    prisma.room.create({ data: { roomNo: 'R304', name: 'Room 304', capacity: 30 } }),
    prisma.room.create({ data: { roomNo: 'R305', name: 'Room 305', capacity: 30 } }),
    prisma.room.create({ data: { roomNo: 'R306', name: 'Room 306', capacity: 30 } }),
    prisma.room.create({ data: { roomNo: 'R307', name: 'Room 307', capacity: 30 } }),
    prisma.room.create({ data: { roomNo: 'R308', name: 'Room 308', capacity: 30 } }),
    prisma.room.create({ data: { roomNo: 'R309', name: 'Room 309', capacity: 30 } }),
    prisma.room.create({ data: { roomNo: 'R310', name: 'Room 310', capacity: 30 } }),
    
    // Specialized Rooms
    prisma.room.create({ data: { roomNo: 'GYM', name: 'Gym', capacity: 100 } }),
    prisma.room.create({ data: { roomNo: 'AUD', name: 'Auditorium', capacity: 200 } }),
    prisma.room.create({ data: { roomNo: 'LAB-01', name: 'Science Lab 1', capacity: 20 } }),
    prisma.room.create({ data: { roomNo: 'LAB-02', name: 'Science Lab 2', capacity: 20 } }),
    prisma.room.create({ data: { roomNo: 'LAB-03', name: 'Science Lab 3', capacity: 20 } }),
    prisma.room.create({ data: { roomNo: 'LAB-04', name: 'Science Lab 4', capacity: 20 } }),
    prisma.room.create({ data: { roomNo: 'ART-01', name: 'Art Room 1', capacity: 25 } }),
    prisma.room.create({ data: { roomNo: 'ART-02', name: 'Art Room 2', capacity: 25 } }),
    prisma.room.create({ data: { roomNo: 'MUS', name: 'Music Room', capacity: 30 } }),
    prisma.room.create({ data: { roomNo: 'BAND', name: 'Band Room', capacity: 40 } }),
    prisma.room.create({ data: { roomNo: 'COMP-01', name: 'Computer Lab 1', capacity: 30 } }),
    prisma.room.create({ data: { roomNo: 'COMP-02', name: 'Computer Lab 2', capacity: 30 } }),
    prisma.room.create({ data: { roomNo: 'LIB', name: 'Library', capacity: 50 } }),
    prisma.room.create({ data: { roomNo: 'CAF', name: 'Cafeteria', capacity: 150 } }),
    prisma.room.create({ data: { roomNo: 'WR', name: 'Weight Room', capacity: 30 } }),
    prisma.room.create({ data: { roomNo: 'DRAMA', name: 'Drama Room', capacity: 35 } })
  ]);

  console.log('🏫 Created rooms');

  // Create Time Blocks
  const timeBlocks = await Promise.all([
    prisma.timeBlock.create({ data: { name: 'Period 1', startTime: new Date('1970-01-01T08:00:00'), endTime: new Date('1970-01-01T08:50:00'), rotationDay: RotationDay.A_DAY } }),
    prisma.timeBlock.create({ data: { name: 'Period 2', startTime: new Date('1970-01-01T09:00:00'), endTime: new Date('1970-01-01T09:50:00'), rotationDay: RotationDay.A_DAY } }),
    prisma.timeBlock.create({ data: { name: 'Period 3', startTime: new Date('1970-01-01T10:00:00'), endTime: new Date('1970-01-01T10:50:00'), rotationDay: RotationDay.A_DAY } }),
    prisma.timeBlock.create({ data: { name: 'Period 4', startTime: new Date('1970-01-01T11:00:00'), endTime: new Date('1970-01-01T11:50:00'), rotationDay: RotationDay.A_DAY } }),
    prisma.timeBlock.create({ data: { name: 'Period 5', startTime: new Date('1970-01-01T12:00:00'), endTime: new Date('1970-01-01T12:50:00'), rotationDay: RotationDay.A_DAY } }),
    prisma.timeBlock.create({ data: { name: 'Period 6', startTime: new Date('1970-01-01T13:00:00'), endTime: new Date('1970-01-01T13:50:00'), rotationDay: RotationDay.A_DAY } }),
    prisma.timeBlock.create({ data: { name: 'Period 7', startTime: new Date('1970-01-01T14:00:00'), endTime: new Date('1970-01-01T14:50:00'), rotationDay: RotationDay.A_DAY } }),
    prisma.timeBlock.create({ data: { name: 'Period 8', startTime: new Date('1970-01-01T15:00:00'), endTime: new Date('1970-01-01T15:50:00'), rotationDay: RotationDay.A_DAY } })
  ]);

  console.log('⏰ Created time blocks');

  // Create Users with usernames
  const usedUsernames = new Set<string>();
  
  const users = await Promise.all([
    // Administrators
    prisma.user.create({ data: { email: 'p.williams@lincolnhs.edu', username: 'pwilliams', passwordHash: await bcrypt.hash('Welcome2ES!', 10), role: UserRole.ADMIN, firstName: 'Patricia', lastName: 'Williams' } }),
    prisma.user.create({ data: { email: 'j.anderson@lincolnhs.edu', username: 'janderson', passwordHash: await bcrypt.hash('Welcome2ES!', 10), role: UserRole.ADMIN, firstName: 'James', lastName: 'Anderson' } }),
    
    // Platform Administrators
    prisma.user.create({ data: { email: 's.mitchell@lincolnhs.edu', username: 'smitchell', passwordHash: await bcrypt.hash('Welcome2ES!', 10), role: UserRole.PLATFORM_ADMIN, firstName: 'Sarah', lastName: 'Mitchell' } }),
    prisma.user.create({ data: { email: 'd.foster@lincolnhs.edu', username: 'dfoster', passwordHash: await bcrypt.hash('Welcome2ES!', 10), role: UserRole.PLATFORM_ADMIN, firstName: 'David', lastName: 'Foster' } }),
    
    // Principal
    prisma.user.create({ data: { email: 'r.martinez@lincolnhs.edu', username: 'rmartinez', passwordHash: await bcrypt.hash('Welcome2ES!', 10), role: UserRole.PRINCIPAL, firstName: 'Robert', lastName: 'Martinez' } }),
    
    // Counselors
    prisma.user.create({ data: { email: 'p.lee@lincolnhs.edu', username: 'plee', passwordHash: await bcrypt.hash('Welcome2ES!', 10), role: UserRole.COUNSELOR, firstName: 'Patricia', lastName: 'Lee' } }),
    prisma.user.create({ data: { email: 'm.torres@lincolnhs.edu', username: 'mtorres', passwordHash: await bcrypt.hash('Welcome2ES!', 10), role: UserRole.COUNSELOR, firstName: 'Michael', lastName: 'Torres' } }),
    prisma.user.create({ data: { email: 'j.adams@lincolnhs.edu', username: 'jadams', passwordHash: await bcrypt.hash('Welcome2ES!', 10), role: UserRole.COUNSELOR, firstName: 'Jennifer', lastName: 'Adams' } }),
    prisma.user.create({ data: { email: 'r.kim@lincolnhs.edu', username: 'rkim', passwordHash: await bcrypt.hash('Welcome2ES!', 10), role: UserRole.COUNSELOR, firstName: 'Robert', lastName: 'Kim' } }),
    prisma.user.create({ data: { email: 's.garcia@lincolnhs.edu', username: 'sgarcia', passwordHash: await bcrypt.hash('Welcome2ES!', 10), role: UserRole.COUNSELOR, firstName: 'Sarah', lastName: 'Garcia' } }),
    prisma.user.create({ data: { email: 'd.martinez@lincolnhs.edu', username: 'dmartinez', passwordHash: await bcrypt.hash('Welcome2ES!', 10), role: UserRole.COUNSELOR, firstName: 'David', lastName: 'Martinez' } }),
    
    // Teachers
    prisma.user.create({ data: { email: 's.johnson@lincolnhs.edu', username: 'sjohnson', passwordHash: await bcrypt.hash('Welcome2ES!', 10), role: UserRole.TEACHER, firstName: 'Sarah', lastName: 'Johnson' } }),
    prisma.user.create({ data: { email: 'j.miller@lincolnhs.edu', username: 'jmiller', passwordHash: await bcrypt.hash('Welcome2ES!', 10), role: UserRole.TEACHER, firstName: 'James', lastName: 'Miller' } }),
    prisma.user.create({ data: { email: 'r.green@lincolnhs.edu', username: 'rgreen', passwordHash: await bcrypt.hash('Welcome2ES!', 10), role: UserRole.TEACHER, firstName: 'Rachel', lastName: 'Green' } }),
    prisma.user.create({ data: { email: 'k.park@lincolnhs.edu', username: 'kpark', passwordHash: await bcrypt.hash('Welcome2ES!', 10), role: UserRole.TEACHER, firstName: 'Kevin', lastName: 'Park' } }),
    prisma.user.create({ data: { email: 's.white@lincolnhs.edu', username: 'swhite', passwordHash: await bcrypt.hash('Welcome2ES!', 10), role: UserRole.TEACHER, firstName: 'Susan', lastName: 'White' } }),
    prisma.user.create({ data: { email: 'd.kim@lincolnhs.edu', username: 'dkim', passwordHash: await bcrypt.hash('Welcome2ES!', 10), role: UserRole.TEACHER, firstName: 'Daniel', lastName: 'Kim' } }),
    prisma.user.create({ data: { email: 'l.martinez@lincolnhs.edu', username: 'lmartinez', passwordHash: await bcrypt.hash('Welcome2ES!', 10), role: UserRole.TEACHER, firstName: 'Laura', lastName: 'Martinez' } }),
    prisma.user.create({ data: { email: 't.anderson@lincolnhs.edu', username: 'tanderson', passwordHash: await bcrypt.hash('Welcome2ES!', 10), role: UserRole.TEACHER, firstName: 'Thomas', lastName: 'Anderson' } }),
    prisma.user.create({ data: { email: 'e.rodriguez@lincolnhs.edu', username: 'erodriguez', passwordHash: await bcrypt.hash('Welcome2ES!', 10), role: UserRole.TEACHER, firstName: 'Emily', lastName: 'Rodriguez' } }),
    prisma.user.create({ data: { email: 'c.taylor@lincolnhs.edu', username: 'ctaylor', passwordHash: await bcrypt.hash('Welcome2ES!', 10), role: UserRole.TEACHER, firstName: 'Christopher', lastName: 'Taylor' } }),
    prisma.user.create({ data: { email: 'a.brown@lincolnhs.edu', username: 'abrown', passwordHash: await bcrypt.hash('Welcome2ES!', 10), role: UserRole.TEACHER, firstName: 'Amanda', lastName: 'Brown' } }),
    prisma.user.create({ data: { email: 'm.davis@lincolnhs.edu', username: 'mdavis', passwordHash: await bcrypt.hash('Welcome2ES!', 10), role: UserRole.TEACHER, firstName: 'Michael', lastName: 'Davis' } }),
    prisma.user.create({ data: { email: 'j.wilson@lincolnhs.edu', username: 'jwilson', passwordHash: await bcrypt.hash('Welcome2ES!', 10), role: UserRole.TEACHER, firstName: 'Jessica', lastName: 'Wilson' } }),
    prisma.user.create({ data: { email: 'r.moore@lincolnhs.edu', username: 'rmoore', passwordHash: await bcrypt.hash('Welcome2ES!', 10), role: UserRole.TEACHER, firstName: 'Robert', lastName: 'Moore' } }),
    prisma.user.create({ data: { email: 's.jackson@lincolnhs.edu', username: 'sjackson', passwordHash: await bcrypt.hash('Welcome2ES!', 10), role: UserRole.TEACHER, firstName: 'Stephanie', lastName: 'Jackson' } }),
    prisma.user.create({ data: { email: 'b.thompson@lincolnhs.edu', username: 'bthompson', passwordHash: await bcrypt.hash('Welcome2ES!', 10), role: UserRole.TEACHER, firstName: 'Brian', lastName: 'Thompson' } }),
    prisma.user.create({ data: { email: 'n.garcia@lincolnhs.edu', username: 'ngarcia', passwordHash: await bcrypt.hash('Welcome2ES!', 10), role: UserRole.TEACHER, firstName: 'Nicole', lastName: 'Garcia' } }),
    prisma.user.create({ data: { email: 'h.martinez@lincolnhs.edu', username: 'hmartinez', passwordHash: await bcrypt.hash('Welcome2ES!', 10), role: UserRole.TEACHER, firstName: 'Heather', lastName: 'Martinez' } }),
    prisma.user.create({ data: { email: 'j.robinson@lincolnhs.edu', username: 'jrobinson', passwordHash: await bcrypt.hash('Welcome2ES!', 10), role: UserRole.TEACHER, firstName: 'Jason', lastName: 'Robinson' } }),
    prisma.user.create({ data: { email: 'k.clark@lincolnhs.edu', username: 'kclark', passwordHash: await bcrypt.hash('Welcome2ES!', 10), role: UserRole.TEACHER, firstName: 'Katherine', lastName: 'Clark' } }),
    prisma.user.create({ data: { email: 'd.rodriguez@lincolnhs.edu', username: 'drodriguez', passwordHash: await bcrypt.hash('Welcome2ES!', 10), role: UserRole.TEACHER, firstName: 'Derek', lastName: 'Rodriguez' } }),
    prisma.user.create({ data: { email: 'l.lewis@lincolnhs.edu', username: 'llewis', passwordHash: await bcrypt.hash('Welcome2ES!', 10), role: UserRole.TEACHER, firstName: 'Lisa', lastName: 'Lewis' } }),
    prisma.user.create({ data: { email: 'm.walker@lincolnhs.edu', username: 'mwalker', passwordHash: await bcrypt.hash('Welcome2ES!', 10), role: UserRole.TEACHER, firstName: 'Matthew', lastName: 'Walker' } }),
    prisma.user.create({ data: { email: 'a.hall@lincolnhs.edu', username: 'ahall', passwordHash: await bcrypt.hash('Welcome2ES!', 10), role: UserRole.TEACHER, firstName: 'Ashley', lastName: 'Hall' } }),
    prisma.user.create({ data: { email: 'j.allen@lincolnhs.edu', username: 'jallen', passwordHash: await bcrypt.hash('Welcome2ES!', 10), role: UserRole.TEACHER, firstName: 'Justin', lastName: 'Allen' } }),
    prisma.user.create({ data: { email: 'r.young@lincolnhs.edu', username: 'ryoung', passwordHash: await bcrypt.hash('Welcome2ES!', 10), role: UserRole.TEACHER, firstName: 'Rachel', lastName: 'Young' } }),
    
    // Students (500 students - 125 per grade level)
    ...Array.from({ length: 500 }, async (_, i) => {
      const firstNames = [
        'Alex', 'Bella', 'Caleb', 'Diana', 'Ethan', 'Fiona', 'Gabriel', 'Hannah', 'Isaac', 'Julia',
        'Kyle', 'Lily', 'Mason', 'Nora', 'Owen', 'Penelope', 'Quinn', 'Ruby', 'Samuel', 'Taylor',
        'Ulysses', 'Violet', 'Wyatt', 'Xara', 'Yusuf', 'Zoe', 'Aaron', 'Brianna', 'Cameron', 'Delilah',
        'Elijah', 'Faith', 'Grayson', 'Hazel', 'Ivan', 'Jade', 'Knox', 'Luna', 'Miles', 'Nova',
        'Oliver', 'Paisley', 'River', 'Sage', 'Theo', 'Uma', 'Victor', 'Willow', 'Xander', 'Yara',
        'Zion', 'Aria', 'Blake', 'Chloe', 'Dante', 'Elena', 'Felix', 'Grace', 'Henry', 'Iris',
        'Jasper', 'Kira', 'Leo', 'Maya', 'Noah', 'Olivia', 'Parker', 'Quinn', 'Riley', 'Sophia',
        'Tyler', 'Uma', 'Vincent', 'Wren', 'Xavier', 'Yuki', 'Zara', 'Adam', 'Brooke', 'Cole',
        'Dakota', 'Emma', 'Finn', 'Gia', 'Hunter', 'Isla', 'Jake', 'Kendall', 'Liam', 'Mia',
        'Nolan', 'Ophelia', 'Phoenix', 'Quentin', 'Rebecca', 'Sebastian', 'Tessa', 'Uriah', 'Vera', 'Wade',
        'Ximena', 'Yolanda', 'Zander', 'Amara', 'Bryce', 'Cora', 'Dexter', 'Eva', 'Flynn', 'Gemma',
        'Hugo', 'Ivy', 'Jaxon', 'Kara', 'Luca', 'Mila', 'Nash', 'Orion', 'Piper', 'Quincy',
        'Rosa', 'Sawyer', 'Talia', 'Uriel', 'Vivian', 'Weston', 'Xara', 'Yvette', 'Zoe', 'Aiden',
        'Bianca', 'Cruz', 'Dahlia', 'Eli', 'Freya', 'Gavin', 'Harper', 'Ian', 'Jasmine', 'Kai',
        'Layla', 'Max', 'Nina', 'Oscar', 'Paige', 'Rafael', 'Sienna', 'Tristan', 'Una', 'Vaughn',
        'Willa', 'Xavier', 'Yara', 'Zane', 'Ava', 'Ben', 'Cara', 'Diego', 'Ella', 'Finn',
        'Greta', 'Hudson', 'Ivy', 'Jude', 'Kira', 'Liam', 'Maya', 'Nico', 'Opal', 'Preston',
        'Quinn', 'Remy', 'Sage', 'Tate', 'Uma', 'Vera', 'Wade', 'Xara', 'Yuki', 'Emily'
      ];
      
      const lastNames = [
        'Anderson', 'Brown', 'Chen', 'Davis', 'Evans', 'Foster', 'Garcia', 'Harris', 'Ivanov', 'Johnson',
        'Kim', 'Lee', 'Martinez', 'Nelson', 'O\'Connor', 'Patel', 'Quinn', 'Rodriguez', 'Smith', 'Taylor',
        'Upton', 'Vargas', 'Williams', 'Xu', 'Young', 'Zhang', 'Adams', 'Baker', 'Clark', 'Diaz',
        'Edwards', 'Flores', 'Gonzalez', 'Hall', 'Iglesias', 'Jackson', 'Kumar', 'Lopez', 'Miller', 'Nguyen',
        'Ortiz', 'Perez', 'Ramirez', 'Sanchez', 'Thompson', 'Uribe', 'Valdez', 'White', 'Xie', 'Yamamoto',
        'Zhou', 'Allen', 'Brooks', 'Carter', 'Duncan', 'Ellis', 'Fisher', 'Green', 'Hill', 'Jones',
        'King', 'Lewis', 'Moore', 'Nelson', 'Owen', 'Parker', 'Reed', 'Scott', 'Turner', 'Walker',
        'Wright', 'Young', 'Zimmerman', 'Adams', 'Bell', 'Cooper', 'Dixon', 'Elliott', 'Ford', 'Gray',
        'Hughes', 'Jenkins', 'Kelly', 'Long', 'Murphy', 'Price', 'Roberts', 'Stewart', 'Tucker', 'Ward',
        'Wood', 'Bailey', 'Campbell', 'Cox', 'Dunn', 'Edwards', 'Fox', 'Graham', 'Howard', 'James',
        'Kennedy', 'Larson', 'Mitchell', 'Nelson', 'Owens', 'Patterson', 'Rogers', 'Simpson', 'Thomas', 'Watson',
        'Wilson', 'Anderson', 'Bennett', 'Coleman', 'Dawson', 'Erickson', 'Ferguson', 'Gibson', 'Henderson', 'Jenkins',
        'Knight', 'Lawrence', 'Marshall', 'Nichols', 'Olson', 'Pierce', 'Reynolds', 'Simmons', 'Tucker', 'Wallace',
        'Woods', 'Alexander', 'Barnes', 'Cunningham', 'Douglas', 'Elliott', 'Fletcher', 'Gardner', 'Harrison', 'Johnston',
        'Keller', 'Lynch', 'Mason', 'Newman', 'Owens', 'Porter', 'Richards', 'Sanders', 'Tucker', 'Vaughn',
        'Wagner', 'Bishop', 'Carpenter', 'Dunn', 'Eaton', 'Fowler', 'Griffin', 'Hansen', 'Ingram', 'Jensen',
        'Klein', 'Larson', 'Meyer', 'Norris', 'O\'Brien', 'Peters', 'Quinn', 'Riley', 'Snyder', 'Tyler',
        'Underwood', 'Vega', 'Walsh', 'Bauer', 'Cruz', 'Doyle', 'Ewing', 'Frost', 'Gill', 'Hoffman',
        'Ibarra', 'Jordan', 'Kane', 'Lane', 'Moss', 'Nash', 'O\'Donnell', 'Powers', 'Quinn', 'Ramos',
        'Schmidt', 'Todd', 'Ulloa', 'Vargas', 'Wells', 'Booth', 'Carr', 'Dunn', 'Eaton', 'Frost',
        'Gomez', 'Hicks', 'Ibarra', 'Jensen', 'Klein', 'Lane', 'Moss', 'Nash', 'O\'Brien', 'Powers',
        'Quinn', 'Ramos', 'Schmidt', 'Todd', 'Ulloa', 'Vargas', 'Wells', 'Booth', 'Carr', 'Dunn'
      ];
      
      // Ensure at least one student is Emily Johnson
      let firstName, lastName;
      if (i === 149) {
        firstName = 'Emily';
        lastName = 'Johnson';
      } else {
        firstName = firstNames[i % firstNames.length];
        lastName = lastNames[i % lastNames.length];
      }
      const baseUsername = `${firstName.charAt(0).toLowerCase()}${lastName.toLowerCase()}`;
      
      // Check for duplicates and add number if needed
      let username = baseUsername;
      let counter = 1;
      while (usedUsernames.has(username)) {
        username = `${baseUsername}${counter}`;
        counter++;
      }
      usedUsernames.add(username);
      
      const email = `${username}@student.lincolnhs.edu`;
      
      return prisma.user.create({ 
        data: { 
          email, 
          username, 
          passwordHash: await bcrypt.hash('Welcome2ES!', 10), 
          role: UserRole.STUDENT, 
          firstName, 
          lastName 
        } 
      });
    }),
    
    // Parents
    prisma.user.create({ data: { email: 'john.thompson@email.com', username: 'jthompson', passwordHash: await bcrypt.hash('Welcome2ES!', 10), role: UserRole.PARENT_GUARDIAN, firstName: 'John', lastName: 'Thompson' } }),
    prisma.user.create({ data: { email: 'maria.rodriguez@email.com', username: 'mrodriguez', passwordHash: await bcrypt.hash('Welcome2ES!', 10), role: UserRole.PARENT_GUARDIAN, firstName: 'Maria', lastName: 'Rodriguez' } }),
    prisma.user.create({ data: { email: 'robert.johnson@email.com', username: 'rjohnson', passwordHash: await bcrypt.hash('Welcome2ES!', 10), role: UserRole.PARENT_GUARDIAN, firstName: 'Robert', lastName: 'Johnson' } }),
    prisma.user.create({ data: { email: 'lisa.martinez@email.com', username: 'lisamartinez', passwordHash: await bcrypt.hash('Welcome2ES!', 10), role: UserRole.PARENT_GUARDIAN, firstName: 'Lisa', lastName: 'Martinez' } }),
    prisma.user.create({ data: { email: 'david.williams@email.com', username: 'dwilliams', passwordHash: await bcrypt.hash('Welcome2ES!', 10), role: UserRole.PARENT_GUARDIAN, firstName: 'David', lastName: 'Williams' } })
  ]);

  // Add existing usernames to the Set to prevent conflicts
  users.forEach(user => {
    if (user.username) {
      usedUsernames.add(user.username);
    }
  });

  console.log('👥 Created users with usernames');

  // Create Teachers (26 total) with teacherId, roomId, and departmentId
  // Assign rooms to teachers (cycling through available rooms)
  const teachers = await Promise.all([
    prisma.teacher.create({ data: { teacherId: 'TCH001', userId: users[11].id, departmentId: departments[0].id, roomId: rooms[0].id, email: 's.johnson@lincolnhs.edu', name: `${users[11].firstName} ${users[11].lastName}` } }), // Sarah Johnson - Math
    prisma.teacher.create({ data: { teacherId: 'TCH002', userId: users[12].id, departmentId: departments[0].id, roomId: rooms[1].id, email: 'j.miller@lincolnhs.edu', name: `${users[12].firstName} ${users[12].lastName}` } }), // James Miller - Math
    prisma.teacher.create({ data: { teacherId: 'TCH003', userId: users[13].id, departmentId: departments[0].id, roomId: rooms[2].id, email: 'r.green@lincolnhs.edu', name: `${users[13].firstName} ${users[13].lastName}` } }), // Rachel Green - Math
    prisma.teacher.create({ data: { teacherId: 'TCH004', userId: users[14].id, departmentId: departments[0].id, roomId: rooms[3].id, email: 'k.park@lincolnhs.edu', name: `${users[14].firstName} ${users[14].lastName}` } }), // Kevin Park - Math
    prisma.teacher.create({ data: { teacherId: 'TCH005', userId: users[15].id, departmentId: departments[0].id, roomId: rooms[4].id, email: 's.white@lincolnhs.edu', name: `${users[15].firstName} ${users[15].lastName}` } }), // Susan White - Math
    prisma.teacher.create({ data: { teacherId: 'TCH006', userId: users[16].id, departmentId: departments[0].id, roomId: rooms[5].id, email: 'd.kim@lincolnhs.edu', name: `${users[16].firstName} ${users[16].lastName}` } }), // Daniel Kim - Math
    prisma.teacher.create({ data: { teacherId: 'TCH007', userId: users[17].id, departmentId: departments[0].id, roomId: rooms[6].id, email: 'l.martinez@lincolnhs.edu', name: `${users[17].firstName} ${users[17].lastName}` } }), // Laura Martinez - Math
    prisma.teacher.create({ data: { teacherId: 'TCH008', userId: users[18].id, departmentId: departments[0].id, roomId: rooms[7].id, email: 't.anderson@lincolnhs.edu', name: `${users[18].firstName} ${users[18].lastName}` } }), // Thomas Anderson - Math
    prisma.teacher.create({ data: { teacherId: 'TCH009', userId: users[19].id, departmentId: departments[1].id, roomId: rooms[10].id, email: 'e.rodriguez@lincolnhs.edu', name: `${users[19].firstName} ${users[19].lastName}` } }), // Emily Rodriguez - English
    prisma.teacher.create({ data: { teacherId: 'TCH010', userId: users[20].id, departmentId: departments[1].id, roomId: rooms[11].id, email: 'c.taylor@lincolnhs.edu', name: `${users[20].firstName} ${users[20].lastName}` } }), // Christopher Taylor - English
    prisma.teacher.create({ data: { teacherId: 'TCH011', userId: users[21].id, departmentId: departments[0].id, roomId: rooms[8].id, email: 'a.brown@lincolnhs.edu', name: `${users[21].firstName} ${users[21].lastName}` } }), // Amanda Brown - Math
    prisma.teacher.create({ data: { teacherId: 'TCH012', userId: users[22].id, departmentId: departments[0].id, roomId: rooms[9].id, email: 'm.davis@lincolnhs.edu', name: `${users[22].firstName} ${users[22].lastName}` } }), // Michael Davis - Math
    prisma.teacher.create({ data: { teacherId: 'TCH013', userId: users[23].id, departmentId: departments[1].id, roomId: rooms[12].id, email: 'j.wilson@lincolnhs.edu', name: `${users[23].firstName} ${users[23].lastName}` } }), // Jessica Wilson - English
    prisma.teacher.create({ data: { teacherId: 'TCH014', userId: users[24].id, departmentId: departments[1].id, roomId: rooms[13].id, email: 'r.moore@lincolnhs.edu', name: `${users[24].firstName} ${users[24].lastName}` } }), // Robert Moore - English
    prisma.teacher.create({ data: { teacherId: 'TCH015', userId: users[25].id, departmentId: departments[1].id, roomId: rooms[14].id, email: 's.jackson@lincolnhs.edu', name: `${users[25].firstName} ${users[25].lastName}` } }), // Stephanie Jackson - English
    prisma.teacher.create({ data: { teacherId: 'TCH016', userId: users[26].id, departmentId: departments[2].id, roomId: rooms[20].id, email: 'b.thompson@lincolnhs.edu', name: `${users[26].firstName} ${users[26].lastName}` } }), // Brian Thompson - Science (Science Lab 1)
    prisma.teacher.create({ data: { teacherId: 'TCH017', userId: users[27].id, departmentId: departments[2].id, roomId: rooms[21].id, email: 'n.garcia@lincolnhs.edu', name: `${users[27].firstName} ${users[27].lastName}` } }), // Nicole Garcia - Science (Science Lab 2)
    prisma.teacher.create({ data: { teacherId: 'TCH018', userId: users[28].id, departmentId: departments[2].id, roomId: rooms[22].id, email: 'h.martinez@lincolnhs.edu', name: `${users[28].firstName} ${users[28].lastName}` } }), // Heather Martinez - Science (Science Lab 3)
    prisma.teacher.create({ data: { teacherId: 'TCH019', userId: users[29].id, departmentId: departments[2].id, roomId: rooms[23].id, email: 'j.robinson@lincolnhs.edu', name: `${users[29].firstName} ${users[29].lastName}` } }), // Jason Robinson - Science (Science Lab 4)
    prisma.teacher.create({ data: { teacherId: 'TCH020', userId: users[30].id, departmentId: departments[2].id, roomId: rooms[15].id, email: 'k.clark@lincolnhs.edu', name: `${users[30].firstName} ${users[30].lastName}` } }), // Katherine Clark - Science
    prisma.teacher.create({ data: { teacherId: 'TCH021', userId: users[31].id, departmentId: departments[3].id, roomId: rooms[16].id, email: 'd.rodriguez@lincolnhs.edu', name: `${users[31].firstName} ${users[31].lastName}` } }), // Derek Rodriguez - Social Studies
    prisma.teacher.create({ data: { teacherId: 'TCH022', userId: users[32].id, departmentId: departments[3].id, roomId: rooms[17].id, email: 'l.lewis@lincolnhs.edu', name: `${users[32].firstName} ${users[32].lastName}` } }), // Lisa Lewis - Social Studies
    prisma.teacher.create({ data: { teacherId: 'TCH023', userId: users[33].id, departmentId: departments[3].id, roomId: rooms[18].id, email: 'm.walker@lincolnhs.edu', name: `${users[33].firstName} ${users[33].lastName}` } }), // Matthew Walker - Social Studies
    prisma.teacher.create({ data: { teacherId: 'TCH024', userId: users[34].id, departmentId: departments[4].id, roomId: rooms[19].id, email: 'a.hall@lincolnhs.edu', name: `${users[34].firstName} ${users[34].lastName}` } }), // Ashley Hall - Foreign Language
    prisma.teacher.create({ data: { teacherId: 'TCH025', userId: users[35].id, departmentId: departments[4].id, roomId: rooms[24].id, email: 'j.allen@lincolnhs.edu', name: `${users[35].firstName} ${users[35].lastName}` } }), // Justin Allen - Foreign Language
    prisma.teacher.create({ data: { teacherId: 'TCH026', userId: users[36].id, departmentId: departments[5].id, roomId: rooms[14].id, email: 'r.young@lincolnhs.edu', name: `${users[36].firstName} ${users[36].lastName}` } })  // Rachel Young - Physical Education (Gym)
  ]);

  console.log('👨‍🏫 Created teachers');

  // Create Students (500 total - 125 per grade)
  // Count non-student users: 2 admins + 2 platform admins + 1 principal + 6 counselors + 26 teachers = 37
  const studentUserStartIndex = 37;
  const students = await Promise.all(
    Array.from({ length: 500 }, (_, i) => {
      const studentNumber = String(240001 + i).padStart(6, '0');
      const gradeIndex = Math.floor(i / 125); // 125 students per grade
      const userIndex = studentUserStartIndex + i; // Students start at index 37
      
      // Validate that we have enough users
      if (userIndex >= users.length) {
        throw new Error(`Not enough users created. Need user at index ${userIndex}, but only ${users.length} users exist.`);
      }
      
      // Validate that the user is actually a student
      if (users[userIndex].role !== UserRole.STUDENT) {
        throw new Error(`User at index ${userIndex} is not a student. Role: ${users[userIndex].role}`);
      }
      
      // Calculate graduation year based on grade level
      // Grade 9 (index 0) → 2029, Grade 10 (index 1) → 2028, Grade 11 (index 2) → 2027, Grade 12 (index 3) → 2026
      const graduationYear = 2029 - gradeIndex;
      
      // Ensure gradeLevelId is valid
      if (!gradeLevels[gradeIndex] || !gradeLevels[gradeIndex].id) {
        throw new Error(`Invalid grade level index: ${gradeIndex}`);
      }
      
      return prisma.student.create({ 
        data: { 
          userId: users[userIndex].id, 
          studentId: studentNumber, 
          gradeLevelId: gradeLevels[gradeIndex].id,
          graduationYear: graduationYear
        } 
      });
    })
  );

  console.log('🎓 Created students');

  // Create Parent-Guardian relationships (25 total)
  const parentGuardians = await Promise.all([
    prisma.parentGuardian.create({ data: { userId: users[74].id, firstName: 'John', lastName: 'Thompson', email: 'john.thompson@email.com', relationship: RelationshipType.PARENT } }), // John Thompson
    prisma.parentGuardian.create({ data: { userId: users[75].id, firstName: 'Maria', lastName: 'Rodriguez', email: 'maria.rodriguez@email.com', relationship: RelationshipType.PARENT } }), // Maria Rodriguez
    prisma.parentGuardian.create({ data: { userId: users[76].id, firstName: 'Robert', lastName: 'Johnson', email: 'robert.johnson@email.com', relationship: RelationshipType.PARENT } }), // Robert Johnson
    prisma.parentGuardian.create({ data: { userId: users[77].id, firstName: 'Lisa', lastName: 'Martinez', email: 'lisa.martinez@email.com', relationship: RelationshipType.PARENT } }), // Lisa Martinez
    prisma.parentGuardian.create({ data: { userId: users[78].id, firstName: 'David', lastName: 'Williams', email: 'david.williams@email.com', relationship: RelationshipType.PARENT } }), // David Williams
    prisma.parentGuardian.create({ data: { userId: users[79].id, firstName: 'Sarah', lastName: 'Chen', email: 'sarah.chen@email.com', relationship: RelationshipType.PARENT } }), // Sarah Chen
    prisma.parentGuardian.create({ data: { userId: users[80].id, firstName: 'Michael', lastName: 'Brown', email: 'michael.brown@email.com', relationship: RelationshipType.PARENT } })  // Michael Brown
  ]);

  console.log('👨‍👩‍👧‍👦 Created parent-guardians');

  // Create Courses
  const courses = await Promise.all([
    // Mathematics
    prisma.course.create({ data: { name: 'Algebra I', code: 'MATH-901', description: 'Introduction to algebraic concepts', credits: 1.0, departmentId: departments[0].id, courseLevelId: courseLevels[0].id, minGradeLevelId: gradeLevels[0].id } }),
    prisma.course.create({ data: { name: 'Geometry', code: 'MATH-902', description: 'Geometric principles and proofs', credits: 1.0, departmentId: departments[0].id, courseLevelId: courseLevels[0].id, minGradeLevelId: gradeLevels[1].id } }),
    prisma.course.create({ data: { name: 'Algebra II', code: 'MATH-903', description: 'Advanced algebraic concepts', credits: 1.0, departmentId: departments[0].id, courseLevelId: courseLevels[0].id, minGradeLevelId: gradeLevels[1].id } }),
    prisma.course.create({ data: { name: 'Pre-Calculus', code: 'MATH-904', description: 'Preparation for calculus', credits: 1.0, departmentId: departments[0].id, courseLevelId: courseLevels[1].id, minGradeLevelId: gradeLevels[2].id } }),
    prisma.course.create({ data: { name: 'AP Calculus AB', code: 'MATH-905', description: 'Advanced Placement Calculus AB', credits: 1.0, departmentId: departments[0].id, courseLevelId: courseLevels[2].id, minGradeLevelId: gradeLevels[2].id } }),
    
    // English Language Arts
    prisma.course.create({ data: { name: 'English 9', code: 'ELA-901', description: 'Ninth grade English', credits: 1.0, departmentId: departments[1].id, courseLevelId: courseLevels[0].id, minGradeLevelId: gradeLevels[0].id } }),
    prisma.course.create({ data: { name: 'English 10', code: 'ELA-902', description: 'Tenth grade English', credits: 1.0, departmentId: departments[1].id, courseLevelId: courseLevels[0].id, minGradeLevelId: gradeLevels[1].id } }),
    prisma.course.create({ data: { name: 'English 11', code: 'ELA-903', description: 'Eleventh grade English', credits: 1.0, departmentId: departments[1].id, courseLevelId: courseLevels[0].id, minGradeLevelId: gradeLevels[2].id } }),
    prisma.course.create({ data: { name: 'AP English Language', code: 'ELA-904', description: 'Advanced Placement English Language', credits: 1.0, departmentId: departments[1].id, courseLevelId: courseLevels[2].id, minGradeLevelId: gradeLevels[2].id } }),
    prisma.course.create({ data: { name: 'English 12', code: 'ELA-905', description: 'Twelfth grade English', credits: 1.0, departmentId: departments[1].id, courseLevelId: courseLevels[0].id, minGradeLevelId: gradeLevels[3].id } }),
    
    // Science
    prisma.course.create({ data: { name: 'Biology', code: 'SCI-901', description: 'Introduction to biology', credits: 1.0, departmentId: departments[2].id, courseLevelId: courseLevels[0].id, minGradeLevelId: gradeLevels[1].id } }),
    prisma.course.create({ data: { name: 'Chemistry', code: 'SCI-902', description: 'Introduction to chemistry', credits: 1.0, departmentId: departments[2].id, courseLevelId: courseLevels[0].id, minGradeLevelId: gradeLevels[2].id } }),
    prisma.course.create({ data: { name: 'Physics', code: 'SCI-903', description: 'Introduction to physics', credits: 1.0, departmentId: departments[2].id, courseLevelId: courseLevels[0].id, minGradeLevelId: gradeLevels[2].id } }),
    prisma.course.create({ data: { name: 'AP Biology', code: 'SCI-904', description: 'Advanced Placement Biology', credits: 1.0, departmentId: departments[2].id, courseLevelId: courseLevels[2].id, minGradeLevelId: gradeLevels[2].id } }),
    prisma.course.create({ data: { name: 'AP Chemistry', code: 'SCI-905', description: 'Advanced Placement Chemistry', credits: 1.0, departmentId: departments[2].id, courseLevelId: courseLevels[2].id, minGradeLevelId: gradeLevels[3].id } }),
    prisma.course.create({ data: { name: 'AP Physics 1', code: 'SCI-906', description: 'Advanced Placement Physics 1', credits: 1.0, departmentId: departments[2].id, courseLevelId: courseLevels[2].id, minGradeLevelId: gradeLevels[3].id } }),
    prisma.course.create({ data: { name: 'Environmental Science', code: 'SCI-907', description: 'Environmental science and sustainability', credits: 1.0, departmentId: departments[2].id, courseLevelId: courseLevels[0].id, minGradeLevelId: gradeLevels[2].id } }),
    
    // Social Studies
    prisma.course.create({ data: { name: 'World History', code: 'SOC-901', description: 'World history from ancient to modern times', credits: 1.0, departmentId: departments[3].id, courseLevelId: courseLevels[0].id, minGradeLevelId: gradeLevels[1].id } }),
    prisma.course.create({ data: { name: 'US History', code: 'SOC-902', description: 'United States history', credits: 1.0, departmentId: departments[3].id, courseLevelId: courseLevels[0].id, minGradeLevelId: gradeLevels[2].id } }),
    prisma.course.create({ data: { name: 'AP US History', code: 'SOC-903', description: 'Advanced Placement US History', credits: 1.0, departmentId: departments[3].id, courseLevelId: courseLevels[2].id, minGradeLevelId: gradeLevels[2].id } }),
    prisma.course.create({ data: { name: 'Government', code: 'SOC-904', description: 'US Government and Politics', credits: 1.0, departmentId: departments[3].id, courseLevelId: courseLevels[0].id, minGradeLevelId: gradeLevels[3].id } }),
    prisma.course.create({ data: { name: 'Economics', code: 'SOC-905', description: 'Introduction to economics', credits: 1.0, departmentId: departments[3].id, courseLevelId: courseLevels[0].id, minGradeLevelId: gradeLevels[3].id } }),
    prisma.course.create({ data: { name: 'AP World History', code: 'SOC-906', description: 'Advanced Placement World History', credits: 1.0, departmentId: departments[3].id, courseLevelId: courseLevels[2].id, minGradeLevelId: gradeLevels[2].id } }),
    
    // Foreign Language
    prisma.course.create({ data: { name: 'Spanish I', code: 'FL-901', description: 'Beginning Spanish', credits: 1.0, departmentId: departments[4].id, courseLevelId: courseLevels[0].id, minGradeLevelId: gradeLevels[1].id } }),
    prisma.course.create({ data: { name: 'Spanish II', code: 'FL-902', description: 'Intermediate Spanish', credits: 1.0, departmentId: departments[4].id, courseLevelId: courseLevels[0].id, minGradeLevelId: gradeLevels[2].id } }),
    prisma.course.create({ data: { name: 'AP Spanish Language', code: 'FL-903', description: 'Advanced Placement Spanish Language', credits: 1.0, departmentId: departments[4].id, courseLevelId: courseLevels[2].id, minGradeLevelId: gradeLevels[3].id } }),
    prisma.course.create({ data: { name: 'French I', code: 'FL-904', description: 'Beginning French', credits: 1.0, departmentId: departments[4].id, courseLevelId: courseLevels[0].id, minGradeLevelId: gradeLevels[1].id } }),
    prisma.course.create({ data: { name: 'French II', code: 'FL-905', description: 'Intermediate French', credits: 1.0, departmentId: departments[4].id, courseLevelId: courseLevels[0].id, minGradeLevelId: gradeLevels[2].id } }),
    
    // Physical Education
    prisma.course.create({ data: { name: 'PE 9', code: 'PE-901', description: 'Ninth grade physical education', credits: 0.5, departmentId: departments[5].id, courseLevelId: courseLevels[0].id, minGradeLevelId: gradeLevels[0].id } }),
    prisma.course.create({ data: { name: 'PE 10', code: 'PE-902', description: 'Tenth grade physical education', credits: 0.5, departmentId: departments[5].id, courseLevelId: courseLevels[0].id, minGradeLevelId: gradeLevels[1].id } }),
    prisma.course.create({ data: { name: 'Health', code: 'PE-903', description: 'Health and wellness', credits: 0.5, departmentId: departments[5].id, courseLevelId: courseLevels[0].id, minGradeLevelId: gradeLevels[1].id } }),
    
    // Electives
    prisma.course.create({ data: { name: 'Art I', code: 'ART-901', description: 'Introduction to visual arts', credits: 1.0, departmentId: departments[6].id, courseLevelId: courseLevels[0].id, minGradeLevelId: gradeLevels[1].id } }),
    prisma.course.create({ data: { name: 'Art II', code: 'ART-902', description: 'Intermediate visual arts', credits: 1.0, departmentId: departments[6].id, courseLevelId: courseLevels[0].id, minGradeLevelId: gradeLevels[2].id } }),
    prisma.course.create({ data: { name: 'AP Art History', code: 'ART-903', description: 'Advanced Placement Art History', credits: 1.0, departmentId: departments[6].id, courseLevelId: courseLevels[2].id, minGradeLevelId: gradeLevels[3].id } }),
    prisma.course.create({ data: { name: 'Music Theory', code: 'MUS-901', description: 'Introduction to music theory', credits: 1.0, departmentId: departments[7].id, courseLevelId: courseLevels[0].id, minGradeLevelId: gradeLevels[2].id } }),
    prisma.course.create({ data: { name: 'Band', code: 'MUS-902', description: 'Concert band', credits: 1.0, departmentId: departments[7].id, courseLevelId: courseLevels[0].id, minGradeLevelId: gradeLevels[1].id } }),
    prisma.course.create({ data: { name: 'Computer Science I', code: 'CS-901', description: 'Introduction to computer science', credits: 1.0, departmentId: departments[8].id, courseLevelId: courseLevels[0].id, minGradeLevelId: gradeLevels[2].id } }),
    prisma.course.create({ data: { name: 'AP Computer Science A', code: 'CS-902', description: 'Advanced Placement Computer Science A', credits: 1.0, departmentId: departments[8].id, courseLevelId: courseLevels[2].id, minGradeLevelId: gradeLevels[3].id } }),
    prisma.course.create({ data: { name: 'Drama', code: 'DRAMA-901', description: 'Introduction to drama and theater', credits: 1.0, departmentId: departments[9].id, courseLevelId: courseLevels[0].id, minGradeLevelId: gradeLevels[1].id } }),
    prisma.course.create({ data: { name: 'Journalism', code: 'JOUR-901', description: 'School newspaper and journalism', credits: 1.0, departmentId: departments[9].id, courseLevelId: courseLevels[0].id, minGradeLevelId: gradeLevels[2].id } })
  ]);

  console.log('📖 Created courses');

  // Assign courses to teachers based on their departments
  // Math teachers (8 teachers) - assign Math courses
  const mathCourses = courses.filter(c => c.departmentId === departments[0].id);
  const mathTeachers = teachers.filter(t => t.departmentId === departments[0].id);
  for (let i = 0; i < mathTeachers.length; i++) {
    const teacher = mathTeachers[i];
    // Assign 2-3 courses per math teacher
    const coursesToAssign = mathCourses.slice(i * 2, (i + 1) * 2 + (i < 3 ? 1 : 0));
    await Promise.all(
      coursesToAssign.map(course =>
        prisma.teacherCourse.create({
          data: {
            teacherId: teacher.id,
            courseId: course.id,
          },
        })
      )
    );
  }

  // English teachers (5 teachers) - assign English courses
  const englishCourses = courses.filter(c => c.departmentId === departments[1].id);
  const englishTeachers = teachers.filter(t => t.departmentId === departments[1].id);
  for (let i = 0; i < englishTeachers.length; i++) {
    const teacher = englishTeachers[i];
    // Assign 1-2 courses per English teacher
    const coursesToAssign = englishCourses.slice(i, i + (i < 2 ? 2 : 1));
    await Promise.all(
      coursesToAssign.map(course =>
        prisma.teacherCourse.create({
          data: {
            teacherId: teacher.id,
            courseId: course.id,
          },
        })
      )
    );
  }

  // Science teachers (5 teachers) - assign Science courses
  const scienceCourses = courses.filter(c => c.departmentId === departments[2].id);
  const scienceTeachers = teachers.filter(t => t.departmentId === departments[2].id);
  for (let i = 0; i < scienceTeachers.length; i++) {
    const teacher = scienceTeachers[i];
    // Assign 1-2 courses per Science teacher
    const coursesToAssign = scienceCourses.slice(i, i + (i < 2 ? 2 : 1));
    await Promise.all(
      coursesToAssign.map(course =>
        prisma.teacherCourse.create({
          data: {
            teacherId: teacher.id,
            courseId: course.id,
          },
        })
      )
    );
  }

  // Social Studies teachers (3 teachers) - assign Social Studies courses
  const socialStudiesCourses = courses.filter(c => c.departmentId === departments[3].id);
  const socialStudiesTeachers = teachers.filter(t => t.departmentId === departments[3].id);
  for (let i = 0; i < socialStudiesTeachers.length; i++) {
    const teacher = socialStudiesTeachers[i];
    // Assign 2 courses per Social Studies teacher
    const coursesToAssign = socialStudiesCourses.slice(i * 2, (i + 1) * 2);
    await Promise.all(
      coursesToAssign.map(course =>
        prisma.teacherCourse.create({
          data: {
            teacherId: teacher.id,
            courseId: course.id,
          },
        })
      )
    );
  }

  // Foreign Language teachers (2 teachers) - assign Foreign Language courses
  const foreignLanguageCourses = courses.filter(c => c.departmentId === departments[4].id);
  const foreignLanguageTeachers = teachers.filter(t => t.departmentId === departments[4].id);
  for (let i = 0; i < foreignLanguageTeachers.length; i++) {
    const teacher = foreignLanguageTeachers[i];
    // Assign 2-3 courses per Foreign Language teacher
    const coursesToAssign = foreignLanguageCourses.slice(i * 2, (i + 1) * 2 + (i < 1 ? 1 : 0));
    await Promise.all(
      coursesToAssign.map(course =>
        prisma.teacherCourse.create({
          data: {
            teacherId: teacher.id,
            courseId: course.id,
          },
        })
      )
    );
  }

  // Physical Education teacher (1 teacher) - assign PE courses
  const peCourses = courses.filter(c => c.departmentId === departments[5].id);
  const peTeacher = teachers.find(t => t.departmentId === departments[5].id);
  if (peTeacher) {
    await Promise.all(
      peCourses.map(course =>
        prisma.teacherCourse.create({
          data: {
            teacherId: peTeacher.id,
            courseId: course.id,
          },
        })
      )
    );
  }

  console.log('📚 Assigned courses to teachers');

  // Fetch teacher-course assignments to build a map
  const teacherCourseAssignments = await prisma.teacherCourse.findMany({
    include: {
      teacher: true,
      course: true,
    },
  });

  // Build maps: course -> teachers, teacher -> courses
  const courseToTeachers = new Map<string, Array<typeof teachers[0]>>();
  const teacherToCourses = new Map<string, Array<typeof courses[0]>>();
  
  teacherCourseAssignments.forEach(tc => {
    // Map course to teachers
    if (!courseToTeachers.has(tc.courseId)) {
      courseToTeachers.set(tc.courseId, []);
    }
    const teacher = teachers.find(t => t.id === tc.teacherId);
    if (teacher) {
      courseToTeachers.get(tc.courseId)!.push(teacher);
    }
    
    // Map teacher to courses
    if (!teacherToCourses.has(tc.teacherId)) {
      teacherToCourses.set(tc.teacherId, []);
    }
    const course = courses.find(c => c.id === tc.courseId);
    if (course) {
      teacherToCourses.get(tc.teacherId)!.push(course);
    }
  });

  console.log('📋 Built teacher-course assignment maps');

// Create Academic Cycle Config
  const academicCycleConfig = await prisma.academicCycleConfig.create({
    data: {
      name: 'High School Configuration',
      description: 'High school academic cycle configuration with 2 semesters and 4 quarters for a school year',
      isActive: true,
      isDefault: true,
      hasSemesters: true,
      hasQuarters: true,
      hasTrimesters: false,
      hasSessions: false,
      enforceStructure: true,
      allowCustomCycles: false,
      requireValidation: true,
      createdBy: users[0].id // Admin user
    }
  });

  console.log('⚙️ Created academic cycle config');

  // Create Academic Cycle Rules
  await Promise.all([
    // School Year Rule
    prisma.academicCycleRule.create({
      data: {
        configId: academicCycleConfig.id,
        cycleType: 'SCHOOL_YEAR',
        cycleName: 'School Year',
        cycleNumber: null,
        isRequired: true,
        minCount: 1,
        maxCount: 1,
        defaultDuration: 180,
        sortOrder: 1,
        mustBeSequential: true,
        mustHaveGaps: false,
        allowOverlap: false
      }
    }),
    
    // Fall Semester Rule
    prisma.academicCycleRule.create({
      data: {
        configId: academicCycleConfig.id,
        parentCycleType: 'SCHOOL_YEAR',
        cycleType: 'SEMESTER',
        cycleName: 'Fall Semester',
        cycleNumber: 1,
        isRequired: true,
        minCount: 1,
        maxCount: 1,
        defaultDuration: 90,
        sortOrder: 2,
        mustBeSequential: true,
        mustHaveGaps: false,
        allowOverlap: false
      }
    }),
    
    // Spring Semester Rule
    prisma.academicCycleRule.create({
      data: {
        configId: academicCycleConfig.id,
        parentCycleType: 'SCHOOL_YEAR',
        cycleType: 'SEMESTER',
        cycleName: 'Spring Semester',
        cycleNumber: 2,
        isRequired: true,
        minCount: 1,
        maxCount: 1,
        defaultDuration: 90,
        sortOrder: 3,
        mustBeSequential: true,
        mustHaveGaps: false,
        allowOverlap: false
      }
    }),
    
    // First Quarter Rule
    prisma.academicCycleRule.create({
      data: {
        configId: academicCycleConfig.id,
        parentCycleType: 'SEMESTER',
        cycleType: 'QUARTER',
        cycleName: 'First Quarter',
        cycleNumber: 1,
        isRequired: true,
        minCount: 1,
        maxCount: 1,
        defaultDuration: 45,
        sortOrder: 4,
        mustBeSequential: true,
        mustHaveGaps: false,
        allowOverlap: false
      }
    }),
    
    // Second Quarter Rule
    prisma.academicCycleRule.create({
      data: {
        configId: academicCycleConfig.id,
        parentCycleType: 'SEMESTER',
        cycleType: 'QUARTER',
        cycleName: 'Second Quarter',
        cycleNumber: 2,
        isRequired: true,
        minCount: 1,
        maxCount: 1,
        defaultDuration: 45,
        sortOrder: 5,
        mustBeSequential: true,
        mustHaveGaps: false,
        allowOverlap: false
      }
    }),
    
    // Third Quarter Rule
    prisma.academicCycleRule.create({
      data: {
        configId: academicCycleConfig.id,
        parentCycleType: 'SEMESTER',
        cycleType: 'QUARTER',
        cycleName: 'Third Quarter',
        cycleNumber: 3,
        isRequired: true,
        minCount: 1,
        maxCount: 1,
        defaultDuration: 45,
        sortOrder: 6,
        mustBeSequential: true,
        mustHaveGaps: false,
        allowOverlap: false
      }
    }),
    
    // Fourth Quarter Rule
    prisma.academicCycleRule.create({
      data: {
        configId: academicCycleConfig.id,
        parentCycleType: 'SEMESTER',
        cycleType: 'QUARTER',
        cycleName: 'Fourth Quarter',
        cycleNumber: 4,
        isRequired: true,
        minCount: 1,
        maxCount: 1,
        defaultDuration: 45,
        sortOrder: 7,
        mustBeSequential: true,
        mustHaveGaps: false,
        allowOverlap: false
      }
    })
  ]);

  console.log('📋 Created academic cycle rules');

  // Create Academic Cycles with Parent-Child Relationships
  // First, create the School Year (no parent)
  const schoolYearCycle = await prisma.academicCycle.create({
    data: {
      name: '2024-2025',
      cycleType: 'SCHOOL_YEAR',
      cycleNumber: null,
      startDate: new Date('2024-08-15'),
      endDate: new Date('2025-06-15'),
      openingDate: new Date('2024-08-01'), // Opening day (preparation starts)
      closingDate: new Date('2025-06-15'), // Closing day (last day of school)
      isCurrent: false,
      isActive: false,
      isValidated: true,
      validatedBy: users[0].id, // Admin user
      description: '2024-2025 Academic Year',
      scheduleChangeConfig: {
        enabled: false,
        deadlineDays: 14,
        studentCanRequest: false,
        allowChangesAfterDeadline: false
      }
    }
  });

  // Create Semesters (children of School Year)
  const fallSemester = await prisma.academicCycle.create({
    data: {
      name: 'Fall Semester',
      cycleType: 'SEMESTER',
      cycleNumber: 1,
      parentId: schoolYearCycle.id, // Parent: School Year
      startDate: new Date('2024-08-15'),
      endDate: new Date('2024-12-20'),
      isCurrent: false,
      isActive: false,
      isValidated: true,
      validatedBy: users[0].id,
      description: 'Fall semester of the 2024-2025 academic year',
      scheduleChangeConfig: {
        enabled: false,
        deadlineDays: 14,
        studentCanRequest: false,
        allowChangesAfterDeadline: false
      }
    }
  });

  const springSemester = await prisma.academicCycle.create({
    data: {
      name: 'Spring Semester',
      cycleType: 'SEMESTER',
      cycleNumber: 2,
      parentId: schoolYearCycle.id, // Parent: School Year
      startDate: new Date('2025-01-15'),
      endDate: new Date('2025-06-15'),
      isCurrent: false,
      isActive: false,
      isValidated: false,
      description: 'Spring semester of the 2024-2025 academic year',
      scheduleChangeConfig: {
        enabled: true,
        deadlineDays: 14,
        studentCanRequest: true,
        allowChangesAfterDeadline: false
      }
    }
  });

  // Create Quarters (children of respective Semesters)
  const quarters = await Promise.all([
    // First Quarter (child of Fall Semester)
    prisma.academicCycle.create({
      data: {
        name: 'First Quarter',
        cycleType: 'QUARTER',
        cycleNumber: 1,
        parentId: fallSemester.id, // Parent: Fall Semester
        startDate: new Date('2024-08-15'),
        endDate: new Date('2025-10-18'),
        isCurrent: false,
        isActive: false,
        isValidated: true,
        validatedBy: users[0].id,
        description: 'First quarter of the fall semester',
        scheduleChangeConfig: {
          enabled: false,
          deadlineDays: 14,
          studentCanRequest: false,
          allowChangesAfterDeadline: false
        }
      }
    }),
    
    // Second Quarter (child of Fall Semester)
    prisma.academicCycle.create({
      data: {
        name: 'Second Quarter',
        cycleType: 'QUARTER',
        cycleNumber: 2,
        parentId: fallSemester.id, // Parent: Fall Semester
        startDate: new Date('2024-10-21'),
        endDate: new Date('2025-12-20'),
        isCurrent: false,
        isActive: true,
        isValidated: false,
        description: 'Second quarter of the fall semester',
        scheduleChangeConfig: {
          enabled: true,
          deadlineDays: 14,
          studentCanRequest: true,
          allowChangesAfterDeadline: false
        }
      }
    }),
    
    // Third Quarter (child of Spring Semester)
    prisma.academicCycle.create({
      data: {
        name: 'Third Quarter',
        cycleType: 'QUARTER',
        cycleNumber: 3,
        parentId: springSemester.id, // Parent: Spring Semester
          startDate: new Date('2025-01-15'),
        endDate: new Date('2025-03-20'),
        isCurrent: false,
        isActive: true,
        isValidated: false,
        description: 'Third quarter of the spring semester',
        scheduleChangeConfig: {
          enabled: true,
          deadlineDays: 14,
          studentCanRequest: true,
          allowChangesAfterDeadline: false
        }
      }
    }),
    
    // Fourth Quarter (child of Spring Semester)
    prisma.academicCycle.create({
      data: {
        name: 'Fourth Quarter',
        cycleType: 'QUARTER',
        cycleNumber: 4,
        parentId: springSemester.id, // Parent: Spring Semester
        startDate: new Date('2025-03-23'),
        endDate: new Date('2025-06-15'),
        isCurrent: false,
        isActive: true,
        isValidated: false,
        description: 'Fourth quarter of the spring semester',
        scheduleChangeConfig: {
          enabled: true,
          deadlineDays: 14,
          studentCanRequest: true,
          allowChangesAfterDeadline: false
        }
      }
    })
  ]);

  // Create array of all academic cycles for reference
  const academicCycles = [schoolYearCycle, fallSemester, springSemester, ...quarters];

  // Get the current academic cycle (School Year) for course sections
  const currentAcademicCycle = academicCycles[0]; // School Year

  console.log('🔄 Created academic cycles (School Year, Semesters, Quarters)');

  // Create Academic Periods for the School Year
  console.log('📅 Creating academic periods...');
  
  const schoolYearPeriods = await Promise.all([
    // Preparation Period (before school year starts)
    prisma.academicPeriod.create({
      data: {
        cycleId: schoolYearCycle.id,
        name: '2024-2025 Preparation',
        periodType: 'PREPARATION',
        status: 'PLANNED',
        startDate: new Date('2024-08-01'),
        endDate: new Date('2025-08-14'),
        description: 'Pre-cycle setup, teacher preparation, and room assignment',
        isInstructional: false,
        allowsEnrollment: false,
        allowsGrading: false,
        allowsScheduleChanges: false,
        isBreak: false,
        sortOrder: 1,
        createdBy: users[0].id
      }
    }),
    
    // Registration Period (at school year level - Option A: Single registration)
    prisma.academicPeriod.create({
      data: {
        cycleId: schoolYearCycle.id,
        name: '2024-2025 Registration',
        periodType: 'REGISTRATION',
        status: 'PLANNED',
        startDate: new Date('2024-08-01'),
        endDate: new Date('2025-08-15'),
        description: 'Student enrollment period for the entire academic year',
        isInstructional: false,
        allowsEnrollment: true,
        allowsGrading: false,
        allowsScheduleChanges: true,
        isBreak: false,
        sortOrder: 2,
        createdBy: users[0].id
      }
    })
  ]);

  // Create Academic Periods for Fall Semester
  const fallSemesterPeriods = await Promise.all([
    // Fall Instruction Period
    prisma.academicPeriod.create({
      data: {
        cycleId: fallSemester.id,
        name: 'Fall Semester Instruction',
        periodType: 'INSTRUCTION',
        status: 'PLANNED',
        startDate: new Date('2024-08-20'),
        endDate: new Date('2025-12-10'),
        description: 'Main instruction period for fall semester',
        isInstructional: true,
        allowsEnrollment: false,
        allowsGrading: false,
        allowsScheduleChanges: true, // Allow changes in first few weeks
        isBreak: false,
        sortOrder: 1,
        createdBy: users[0].id
      }
    }),
    
    // Thanksgiving Break
    prisma.academicPeriod.create({
      data: {
        cycleId: fallSemester.id,
        name: 'Thanksgiving Break',
        periodType: 'BREAK',
        status: 'PLANNED',
        startDate: new Date('2024-11-24'),
        endDate: new Date('2025-11-28'),
        description: 'Thanksgiving holiday break',
        isInstructional: false,
        allowsEnrollment: false,
        allowsGrading: false,
        allowsScheduleChanges: false,
        isBreak: true,
        sortOrder: 2,
        createdBy: users[0].id
      }
    }),
    
    // Fall Exam Period
    prisma.academicPeriod.create({
      data: {
        cycleId: fallSemester.id,
        name: 'Fall Final Exams',
        periodType: 'EXAM',
        status: 'PLANNED',
        startDate: new Date('2024-12-11'),
        endDate: new Date('2025-12-15'),
        description: 'Final examination period for fall semester',
        isInstructional: false,
        allowsEnrollment: false,
        allowsGrading: false,
        allowsScheduleChanges: false,
        isBreak: false,
        sortOrder: 3,
        createdBy: users[0].id
      }
    }),
    
    // Fall Grading Period
    prisma.academicPeriod.create({
      data: {
        cycleId: fallSemester.id,
        name: 'Fall Grade Submission',
        periodType: 'GRADING',
        status: 'PLANNED',
        startDate: new Date('2024-12-16'),
        endDate: new Date('2025-12-20'),
        description: 'Grade submission period for fall semester',
        isInstructional: false,
        allowsEnrollment: false,
        allowsGrading: true,
        allowsScheduleChanges: false,
        isBreak: false,
        sortOrder: 4,
        createdBy: users[0].id
      }
    })
  ]);

  // Create Academic Periods for Spring Semester
  const springSemesterPeriods = await Promise.all([
    // Spring Instruction Period
    prisma.academicPeriod.create({
      data: {
        cycleId: springSemester.id,
        name: 'Spring Semester Instruction',
        periodType: 'INSTRUCTION',
        status: 'PLANNED',
          startDate: new Date('2025-01-15'),
        endDate: new Date('2025-05-15'),
        description: 'Main instruction period for spring semester',
        isInstructional: true,
        allowsEnrollment: false,
        allowsGrading: false,
        allowsScheduleChanges: true, // Allow changes in first few weeks
        isBreak: false,
        sortOrder: 1,
        createdBy: users[0].id
      }
    }),
    
    // Spring Break
    prisma.academicPeriod.create({
      data: {
        cycleId: springSemester.id,
        name: 'Spring Break',
        periodType: 'BREAK',
        status: 'PLANNED',
        startDate: new Date('2025-03-10'),
        endDate: new Date('2025-03-14'),
        description: 'Spring break holiday',
        isInstructional: false,
        allowsEnrollment: false,
        allowsGrading: false,
        allowsScheduleChanges: false,
        isBreak: true,
        sortOrder: 2,
        createdBy: users[0].id
      }
    }),
    
    // Review Period
    prisma.academicPeriod.create({
      data: {
        cycleId: springSemester.id,
        name: 'Spring Review Week',
        periodType: 'REVIEW',
        status: 'PLANNED',
        startDate: new Date('2025-05-16'),
        endDate: new Date('2025-05-20'),
        description: 'Review week before final exams',
        isInstructional: true,
        allowsEnrollment: false,
        allowsGrading: false,
        allowsScheduleChanges: false,
        isBreak: false,
        sortOrder: 3,
        createdBy: users[0].id
      }
    }),
    
    // Spring Exam Period
    prisma.academicPeriod.create({
      data: {
        cycleId: springSemester.id,
        name: 'Spring Final Exams',
        periodType: 'EXAM',
        status: 'PLANNED',
        startDate: new Date('2025-05-21'),
        endDate: new Date('2025-05-25'),
        description: 'Final examination period for spring semester',
        isInstructional: false,
        allowsEnrollment: false,
        allowsGrading: false,
        allowsScheduleChanges: false,
        isBreak: false,
        sortOrder: 4,
        createdBy: users[0].id
      }
    }),
    
    // Spring Grading Period
    prisma.academicPeriod.create({
      data: {
        cycleId: springSemester.id,
        name: 'Spring Grade Submission',
        periodType: 'GRADING',
        status: 'PLANNED',
        startDate: new Date('2025-05-26'),
        endDate: new Date('2025-05-30'),
        description: 'Grade submission period for spring semester',
        isInstructional: false,
        allowsEnrollment: false,
        allowsGrading: true,
        allowsScheduleChanges: false,
        isBreak: false,
        sortOrder: 5,
        createdBy: users[0].id
      }
    })
  ]);

  // Create Winter Break Period (spans between semesters, attached to school year)
  const winterBreak = await prisma.academicPeriod.create({
    data: {
      cycleId: schoolYearCycle.id,
      name: 'Winter Break',
      periodType: 'BREAK',
      status: 'PLANNED',
      startDate: new Date('2024-12-21'),
      endDate: new Date('2024-01-05'),
      description: 'Winter holiday break between semesters',
      isInstructional: false,
      allowsEnrollment: false,
      allowsGrading: false,
      allowsScheduleChanges: false,
      isBreak: true,
      sortOrder: 3,
      createdBy: users[0].id
    }
  });

  // Create Transition/Closing Period (end of school year)
  const closingPeriod = await prisma.academicPeriod.create({
    data: {
      cycleId: schoolYearCycle.id,
      name: '2024-2025 Closing',
      periodType: 'TRANSITION',
      status: 'PLANNED',
      startDate: new Date('2024-06-01'),
      endDate: new Date('2024-06-15'),
      description: 'End of year transition and closing activities',
      isInstructional: false,
      allowsEnrollment: false,
      allowsGrading: false,
      allowsScheduleChanges: false,
      isBreak: false,
      sortOrder: 4,
      createdBy: users[0].id
    }
  });

  const allPeriods = [...schoolYearPeriods, ...fallSemesterPeriods, ...springSemesterPeriods, winterBreak, closingPeriod];
  console.log(`📅 Created ${allPeriods.length} academic periods`);

  // Create Course Sections programmatically based on teacher assignments and avoiding conflicts
  console.log('📚 Creating course sections based on teacher assignments...');
  
  // Track used periods per teacher: Map<teacherId, Set<periodKey>>
  // periodKey = `${timeBlockId}_${rotationDay || 'null'}`
  const teacherPeriodUsage = new Map<string, Set<string>>();
  
  // Initialize period tracking for all teachers
  teachers.forEach(teacher => {
    teacherPeriodUsage.set(teacher.id, new Set());
  });

  // Helper function to check if a period is available for a teacher
  const isPeriodAvailable = (teacherId: string, timeBlockId: string, rotationDay: RotationDay | null): boolean => {
    const usedPeriods = teacherPeriodUsage.get(teacherId);
    if (!usedPeriods) return false;
    const periodKey = `${timeBlockId}_${rotationDay || 'null'}`;
    return !usedPeriods.has(periodKey);
  };

  // Helper function to mark a period as used
  const markPeriodUsed = (teacherId: string, timeBlockId: string, rotationDay: RotationDay | null): void => {
    const usedPeriods = teacherPeriodUsage.get(teacherId);
    if (usedPeriods) {
      const periodKey = `${timeBlockId}_${rotationDay || 'null'}`;
      usedPeriods.add(periodKey);
    }
  };

  // Helper function to find an available period for a teacher
  const findAvailablePeriod = (teacherId: string): { timeBlockId: string; rotationDay: RotationDay | null } | null => {
    for (const timeBlock of timeBlocks) {
      const rotationDay = timeBlock.rotationDay || null;
      if (isPeriodAvailable(teacherId, timeBlock.id, rotationDay)) {
        return { timeBlockId: timeBlock.id, rotationDay };
      }
    }
    return null;
  };

  // Define course section requirements: course index -> number of sections needed
  const courseSectionRequirements: { [courseIndex: number]: number } = {
    0: 6,  // Algebra I - 6 sections (125 Grade 9 students)
    1: 5,  // Geometry - 5 sections (125 Grade 10 students)
    2: 5,  // Algebra II - 5 sections (125 Grade 11 students)
    3: 3,  // Pre-Calculus - 3 sections (75 Grade 12 students)
    4: 2,  // AP Calculus AB - 2 sections (50 Grade 12 students)
    5: 5,  // English 9 - 5 sections (125 Grade 9 students)
    6: 5,  // English 10 - 5 sections (125 Grade 10 students)
    7: 5,  // English 11 - 5 sections (125 Grade 11 students)
    8: 2,  // AP English Language - 2 sections (50 Grade 11 students)
    9: 5,  // English 12 - 5 sections (125 Grade 12 students)
    10: 4, // Biology - 4 sections (100 Grade 10 students)
    11: 4, // Chemistry - 4 sections (100 Grade 11 students)
    12: 3, // Physics - 3 sections (75 Grade 12 students)
    13: 2, // AP Biology - 2 sections (50 Grade 11 students)
    14: 2, // AP Chemistry - 2 sections (50 Grade 12 students)
    15: 2, // AP Physics 1 - 2 sections (50 Grade 12 students)
    16: 2, // Environmental Science - 2 sections (50 Grade 12 students)
    17: 4, // World History - 4 sections (100 Grade 10 students)
    18: 4, // US History - 4 sections (100 Grade 11 students)
    19: 2, // AP US History - 2 sections (50 Grade 11 students)
    20: 3, // Government - 3 sections (75 Grade 12 students)
    21: 2, // Economics - 2 sections (50 Grade 12 students)
    22: 2, // AP World History - 2 sections (50 Grade 11 students)
    23: 3, // Spanish I - 3 sections (75 Grade 10 students)
    24: 3, // Spanish II - 3 sections (75 Grade 11 students)
    25: 2, // AP Spanish Language - 2 sections (50 Grade 12 students)
    26: 2, // French I - 2 sections (50 Grade 10 students)
    27: 2, // French II - 2 sections (50 Grade 11 students)
    28: 5, // PE 9 - 5 sections (125 Grade 9 students)
    29: 5, // PE 10 - 5 sections (125 Grade 10 students)
    30: 4, // Health - 4 sections (100 Grade 11 students)
  };

  const courseSections: any[] = [];
  // Section letters: A through Z (26 letters total, should be enough for any course)
  const sectionLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

  // Create sections for each course
  for (let courseIndex = 0; courseIndex < courses.length; courseIndex++) {
    const course = courses[courseIndex];
    const numSections = courseSectionRequirements[courseIndex] || 0;
    
    if (numSections === 0) continue; // Skip courses not in requirements

    // Get teachers assigned to this course
    const assignedTeachers = courseToTeachers.get(course.id) || [];
    
    if (assignedTeachers.length === 0) {
      console.log(`⚠️  No teachers assigned to course ${course.code} (${course.name}), skipping sections`);
      continue;
    }

    // Create sections for this course in valid order (A, B, C, D, ...)
    let sectionsCreatedForCourse = 0;
    for (let sectionIndex = 0; sectionIndex < numSections; sectionIndex++) {
      // Cycle through assigned teachers
      const teacher = assignedTeachers[sectionIndex % assignedTeachers.length];
      
      // Find an available period for this teacher
      const availablePeriod = findAvailablePeriod(teacher.id);
      
      if (!availablePeriod) {
        console.log(`⚠️  No available periods for teacher ${teacher.name} (${teacher.teacherId}), skipping section for ${course.code}`);
        continue;
      }

      // Mark the period as used
      markPeriodUsed(teacher.id, availablePeriod.timeBlockId, availablePeriod.rotationDay);

      // Calculate enrollment (slightly varied for realism)
      const baseEnrollment = 25;
      const enrollmentVariation = Math.floor(Math.random() * 6) - 2; // -2 to +3
      const currentEnrollment = Math.max(20, Math.min(baseEnrollment, baseEnrollment + enrollmentVariation));

      // Use section letter based on how many sections we've successfully created for this course
      // This ensures valid order: A, B, C, D, E... even if some sections are skipped
      const sectionLetter = sectionLetters[sectionsCreatedForCourse];
      
      if (!sectionLetter) {
        console.log(`⚠️  Maximum sections (${sectionLetters.length}) reached for course ${course.code}, skipping additional sections`);
        break;
      }

      // Create the section
      const section = await prisma.courseSection.create({
        data: {
          sectionNumber: sectionLetter,
          courseId: course.id,
          teacherId: teacher.id,
          roomId: teacher.roomId,
          timeBlockId: availablePeriod.timeBlockId,
          rotationDay: availablePeriod.rotationDay,
          maxEnrollment: baseEnrollment,
          currentEnrollment: currentEnrollment,
          academicCycleId: currentAcademicCycle.id,
        },
      });

      courseSections.push(section);
      sectionsCreatedForCourse++;
    }

    console.log(`✓ Created ${numSections} sections for ${course.code} (${course.name})`);
  }

  console.log(`📚 Created ${courseSections.length} course sections total`);

  // Course sections are now created programmatically above based on teacher assignments

  // Create schedules for all students in batches to avoid connection pool timeout
  console.log('📋 Creating schedules...');
  
  // Track how many courses each student is enrolled in
  const studentCourseCount: { [studentId: string]: number } = {};
  // Track which course sections each student is already enrolled in (to prevent duplicates)
  const studentEnrolledSections: { [studentId: string]: Set<string> } = {};
  // Track which courses each student is enrolled in (to prevent same course in different sections)
  const studentEnrolledCourses: { [studentId: string]: Set<string> } = {};
  
  students.forEach(student => {
    studentCourseCount[student.id] = 0;
    studentEnrolledSections[student.id] = new Set();
    studentEnrolledCourses[student.id] = new Set();
  });

  // Sort course sections by course ID to process them in order
  const sortedCourseSections = [...courseSections].sort((a, b) => {
    // Group by course, then by section number (A, B, C, D, E, F)
    if (a.courseId !== b.courseId) {
      return courses.findIndex(c => c.id === a.courseId) - courses.findIndex(c => c.id === b.courseId);
    }
    return a.sectionNumber.localeCompare(b.sectionNumber);
  });

  // Process each course section and enroll students
  const batchSize = 50;
  const schedulesToCreate = [];

  for (const section of sortedCourseSections) {
    // Find students who:
    // 1. Don't have 6 courses yet
    // 2. Are not already enrolled in this specific section
    // 3. Are not already enrolled in this course (different section)
    const availableStudents = students.filter(student => {
      const hasSpace = studentCourseCount[student.id] < 6;
      const notInSection = !studentEnrolledSections[student.id].has(section.id);
      const notInCourse = !studentEnrolledCourses[student.id].has(section.courseId);
      return hasSpace && notInSection && notInCourse;
    });

    // Take first 25 available students
    const enrolledStudents = availableStudents.slice(0, 25);

    // If no students available, skip this section
    if (enrolledStudents.length === 0) {
      console.log(`⚠️  No available students for course section ${section.courseId} section ${section.sectionNumber}`);
      continue;
    }

    // Create schedule entries for these students
    enrolledStudents.forEach(student => {
      schedulesToCreate.push({
        studentId: student.id,
        courseSectionId: section.id,
      });
      studentCourseCount[student.id]++;
      studentEnrolledSections[student.id].add(section.id);
      studentEnrolledCourses[student.id].add(section.courseId);
    });

    console.log(`✓ Enrolled ${enrolledStudents.length} students in section ${section.sectionNumber}`);
  }

  // Now create schedules in batches
  // First, group schedules by student and deduplicate course sections
  const schedulesByStudent: { [studentId: string]: Array<{ courseSectionId: string }> } = {};
  const seenEnrollments = new Set<string>(); // Track student-section combinations to prevent duplicates
  
  schedulesToCreate.forEach(item => {
    const enrollmentKey = `${item.studentId}-${item.courseSectionId}`;
    
    // Skip if this exact enrollment already exists
    if (seenEnrollments.has(enrollmentKey)) {
      console.log(`⚠️  Skipping duplicate enrollment: Student ${item.studentId} in section ${item.courseSectionId}`);
      return;
    }
    
    seenEnrollments.add(enrollmentKey);
    
    if (!schedulesByStudent[item.studentId]) {
      schedulesByStudent[item.studentId] = [];
    }
    
    // Also check if this course section is already in the student's list
    const alreadyHasSection = schedulesByStudent[item.studentId].some(
      existing => existing.courseSectionId === item.courseSectionId
    );
    
    if (!alreadyHasSection) {
      schedulesByStudent[item.studentId].push({ courseSectionId: item.courseSectionId });
    }
  });

  // Create schedule records with their course sections
  const schedules = [];
  const studentIds = Object.keys(schedulesByStudent);

  for (let i = 0; i > studentIds.length; i += batchSize) {
    const batchStudentIds = studentIds.slice(i, i + batchSize);
    console.log(`📋 Processing schedule batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(studentIds.length / batchSize)}`);

    const batchSchedules = await Promise.all(
      batchStudentIds.map(studentId => 
        prisma.schedule.create({
          data: {
            studentId,
            academicCycleId: currentAcademicCycle.id,
            scheduleCourseSections: {
              create: schedulesByStudent[studentId].map(item => ({
                courseSectionId: item.courseSectionId
              }))
            }
          }
        })
      )
    );

    schedules.push(...batchSchedules);
  }

  console.log('📋 Created schedules');

  // Create Student Course History for some students (previous years)
  console.log('📚 Creating student course history...');
  
  // Get some students from different grade levels for course history
  const studentsForHistory = students.slice(0, 50); // First 50 students
  const previousYearCourses = courses.slice(0, 20); // First 20 courses for history
  
  const studentCourseHistory = [];
  const historyBatchSize = 25; // Process 25 students at a time
  
  for (let i = 0; i < studentsForHistory.length; i += historyBatchSize) {
    const batch = studentsForHistory.slice(i, i + historyBatchSize);
    console.log(`📚 Processing course history batch ${Math.floor(i / historyBatchSize) + 1}/${Math.ceil(studentsForHistory.length / historyBatchSize)}`);
    
    const batchHistory = await Promise.all(
      batch.flatMap(student => 
        // Each student gets 3-6 previous courses
        Array.from({ length: Math.floor(Math.random() * 4) + 3 }, async (_, i) => {
          const course = previousYearCourses[Math.floor(Math.random() * previousYearCourses.length)];          const grade = ['A', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F', 'IN'][Math.floor(Math.random() * 11)];
          const isPassed = !['F', 'IN'].includes(grade); // All grades except F and IN are passing
          const creditEarned = isPassed ? course.credits : 0;
          
          return prisma.studentCourseHistory.create({
            data: {
              studentId: student.id,
              courseId: course.id,
              academicCycleId: currentAcademicCycle.id,
              grade: grade,
              isPassed: isPassed,
              creditEarned: creditEarned
            }
          });
        })
      )
    );
    
    studentCourseHistory.push(...batchHistory);
  }

  console.log(`📚 Created ${studentCourseHistory.length} student course history entries`);

  // Create Student Grades for current academic cycle
  console.log('📊 Creating student grades...');
  
  // Get some students and their current courses for grading
  const studentsForGrades = students.slice(0, 100); // First 100 students
  const currentCourses = courses.slice(0, 30); // First 30 courses for current grades
  
  const studentGrades = [];
  const gradesBatchSize = 25; // Process 25 students at a time
  
  for (let i = 0; i < studentsForGrades.length; i += gradesBatchSize) {
    const batch = studentsForGrades.slice(i, i + gradesBatchSize);
    console.log(`📊 Processing grades batch ${Math.floor(i / gradesBatchSize) + 1}/${Math.ceil(studentsForGrades.length / gradesBatchSize)}`);
    
    const batchGrades = await Promise.all(
      batch.flatMap(student => {
        // Each student gets 4-6 current course grades (fewer to avoid conflicts)
        const numGrades = Math.floor(Math.random() * 3) + 4; // 4-6 courses
        const usedCombinations = new Set();
        
        return Array.from({ length: numGrades }, async (_, i) => {
          let course, academicCycle, combination;
          let attempts = 0;
          
          // Ensure unique combination
          do {
            course = currentCourses[Math.floor(Math.random() * currentCourses.length)];
            academicCycle = quarters[Math.floor(Math.random() * quarters.length)]; // Random quarter
            combination = `${student.id}-${course.id}-${academicCycle.id}`;
            attempts++;
          } while (usedCombinations.has(combination) && attempts < 20);
          
          if (usedCombinations.has(combination)) {
            return null; // Skip if we can't find a unique combination
          }
          
          usedCombinations.add(combination);
          
          const grade = ['A', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F', 'IN'][Math.floor(Math.random() * 11)];
          const percentage = Math.floor(Math.random() * 40) + 60; // 60-100%
          const isPassed = !['F', 'IN'].includes(grade); // All grades except F and IN are passing
          const creditEarned = isPassed ? course.credits : 0;
          const gradePoints = isPassed ? parseFloat((Math.random() * 2 + 2).toFixed(2)) : 0; // 2.0-4.0
          
          // Get a random teacher to grade
          const teacher = teachers[Math.floor(Math.random() * teachers.length)];
          
          return prisma.studentGrade.create({
            data: {
              studentId: student.id,
              courseId: course.id,
              academicCycleId: academicCycle.id,
              grade: grade,
              gradePoints: gradePoints,
              percentage: percentage,
              isPassed: isPassed,
              creditEarned: creditEarned,
              gradedBy: teacher.userId,
              gradedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
              notes: Math.random() > 0.7 ? 'Good participation' : null // 30% chance of notes
            }
          });
        }).filter(Boolean); // Remove null entries
      })
    );
    
    studentGrades.push(...batchGrades);
  }

  console.log(`📊 Created ${studentGrades.length} student grades`);

  // Add specific academic data for Emily Johnson
  console.log('👩‍🎓 Adding specific academic data for Emily Johnson...');
  
  // Find Emily Johnson student
  const emilyJohnson = await prisma.user.findFirst({
    where: {
      firstName: 'Emily',
      lastName: 'Johnson',
      role: 'STUDENT'
    },
    include: {
      student: true
    }
  });

  if (emilyJohnson) {
    console.log(`Found Emily Johnson (${emilyJohnson.username})`);
    
    // Add specific course history for Emily Johnson
    const emilyHistoryCourses = [
      courses[0],  // Algebra I
      courses[5],  // English 9
      courses[10], // Biology
      courses[15], // World History
      courses[20]  // Spanish I
    ];

    const emilyHistoryGrades = ['A', 'B+', 'A-', 'B', 'A'];
    
    const emilyHistoryEntries = await Promise.all(
      emilyHistoryCourses.map(async (course, index) => {
        const grade = emilyHistoryGrades[index];
        const isPassed = !['F', 'IN'].includes(grade);
        const creditEarned = isPassed ? course.credits : 0;
        
        return prisma.studentCourseHistory.create({
          data: {
            studentId: emilyJohnson.student.id,
            courseId: course.id,
            academicCycleId: currentAcademicCycle.id,
            grade: grade,
            isPassed: isPassed,
            creditEarned: creditEarned
          }
        });
      })
    );

    console.log(`✅ Added ${emilyHistoryEntries.length} course history entries for Emily Johnson`);

    // Add specific current grades for Emily Johnson
    const emilyCurrentCourses = [
      courses[1],  // Geometry
      courses[6],  // English 10
      courses[11], // Chemistry
      courses[16], // US History
      courses[21]  // Spanish II
    ];

    const emilyCurrentGrades = ['A', 'B+', 'A-', 'B', 'A'];
    const emilyPercentages = [92, 88, 90, 85, 94];
    
    const emilyGradeEntries = await Promise.all(
      emilyCurrentCourses.map(async (course, index) => {
        const grade = emilyCurrentGrades[index];
        const percentage = emilyPercentages[index];
        const isPassed = !['F', 'IN'].includes(grade);
        const creditEarned = isPassed ? course.credits : 0;
        const gradePoints = isPassed ? 
          (grade === 'A' ? 4.0 : 
           grade === 'B+' ? 3.5 : 
           grade === 'B' ? 3.0 : 
           grade === 'B-' ? 2.7 : 2.5) : 0;
        
        // Get a random teacher to grade
        const teacher = teachers[Math.floor(Math.random() * teachers.length)];
        
        return prisma.studentGrade.create({
          data: {
            studentId: emilyJohnson.student.id,
            courseId: course.id,
            academicCycleId: quarters[0].id, // First Quarter
            grade: grade,
            gradePoints: gradePoints,
            percentage: percentage,
            isPassed: isPassed,
            creditEarned: creditEarned,
            gradedBy: teacher.userId,
            gradedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
            notes: grade === 'A' ? 'Excellent work!' : 'Good participation'
          }
        });
      })
    );

    console.log(`✅ Added ${emilyGradeEntries.length} current grade entries for Emily Johnson`);
    
    // Display Emily Johnson's academic summary
    console.log('\n📋 Emily Johnson Academic Summary:');
    console.log('=====================================');
    console.log('📚 Course History:');
    emilyHistoryCourses.forEach((course, index) => {
      console.log(`   ${course.name} (${course.code}): ${emilyHistoryGrades[index]}`);
    });
    console.log('\n📊 Current Grades:');
    emilyCurrentCourses.forEach((course, index) => {
      console.log(`   ${course.name} (${course.code}): ${emilyCurrentGrades[index]} (${emilyPercentages[index]}%)`);
    });
  } else {
    console.log('❌ Emily Johnson student not found');
  }

  // Create Schedule Change Requests with different types
  const scheduleChangeRequests = await Promise.all([
    prisma.scheduleChangeRequest.create({
      data: {
        studentId: students[0].id,
        requestType: RequestType.ADD_COURSE,
        requestedCourseSectionId: courseSections[5].id, // AP Calculus AB
        reason: 'Want to challenge myself with advanced mathematics',
        priority: 'MEDIUM',
        status: RequestStatus.PENDING,
        academicCycleId: currentAcademicCycle.id
      }
    }),
    prisma.scheduleChangeRequest.create({
      data: {
        studentId: students[1].id,
        requestType: RequestType.DROP_COURSE,
        currentCourseSectionId: courseSections[0].id, // Algebra I A
        reason: 'Schedule conflict with work-study program',
        priority: 'HIGH',
        status: RequestStatus.PENDING,
        academicCycleId: currentAcademicCycle.id
      }
    }),
    prisma.scheduleChangeRequest.create({
      data: {
        studentId: students[2].id,
        requestType: RequestType.CHANGE_SECTION,
        currentCourseSectionId: courseSections[6].id, // English 9 A
        requestedCourseSectionId: courseSections[7].id, // English 10 A
        reason: 'Want to move to a different time slot',
        priority: 'LOW',
        status: RequestStatus.APPROVED,
        academicCycleId: currentAcademicCycle.id
      }
    })
  ]);

  console.log('📝 Created schedule change requests');

  // Create Grade Lookup entries
  const gradeLookups = await Promise.all([
    prisma.gradeLookup.create({ data: { grade: 'A+', gradePoints: 4.0, description: 'Excellent' } }),
    prisma.gradeLookup.create({ data: { grade: 'A', gradePoints: 4.0, description: 'Excellent' } }),
    prisma.gradeLookup.create({ data: { grade: 'A-', gradePoints: 3.7, description: 'Very Good' } }),
    prisma.gradeLookup.create({ data: { grade: 'B+', gradePoints: 3.3, description: 'Good' } }),
    prisma.gradeLookup.create({ data: { grade: 'B', gradePoints: 3.0, description: 'Good' } }),
    prisma.gradeLookup.create({ data: { grade: 'B-', gradePoints: 2.7, description: 'Satisfactory' } }),
    prisma.gradeLookup.create({ data: { grade: 'C+', gradePoints: 2.3, description: 'Satisfactory' } }),
    prisma.gradeLookup.create({ data: { grade: 'C', gradePoints: 2.0, description: 'Average' } }),
    prisma.gradeLookup.create({ data: { grade: 'C-', gradePoints: 1.7, description: 'Below Average' } }),
    prisma.gradeLookup.create({ data: { grade: 'D+', gradePoints: 1.3, description: 'Below Average' } }),
    prisma.gradeLookup.create({ data: { grade: 'D', gradePoints: 1.0, description: 'Poor' } }),
    prisma.gradeLookup.create({ data: { grade: 'F', gradePoints: 0.0, description: 'Failing' } })
  ]);

  console.log('📊 Created grade lookup entries');

  // Create Settings and AcademicSettings with default period configuration
  let settings = await prisma.settings.findFirst();
  if (!settings) {
    settings = await prisma.settings.create({
      data: {
        schoolName: 'East High School',
        maxCourseLoad: 8,
        allowConflicts: false,
        scheduleType: 'STANDARD',
        hasRotationDays: false,
        minBlockDuration: 45,
        maxBlockDuration: 120,
        allowOverlappingBlocks: false,
      },
    });
  }

  const defaultPeriodConfiguration = {
    schoolYear: {
      preparation: {
        daysBeforeStart: 14,
        duration: 14,
      },
      registration: {
        timing: 'BEFORE_INSTRUCTION',
        duration: 10,
      },
      orientation: {
        duration: 5,
      },
      closing: {
        daysBeforeEnd: 14,
        duration: 14,
      },
    },
    semesterQuarter: {
      instruction: {
        nameTemplate: '{Cycle Name} Instruction',
        allowsScheduleChanges: true,
        scheduleChangeWindow: 14,
      },
      exam: {
        duration: 5,
        timing: 'END_OF_CYCLE',
      },
      grading: {
        duration: 5,
        timing: 'AFTER_EXAMS',
      },
      breaks: {
        thanksgiving: {
          enabled: true,
          duration: 5,
        },
        spring: {
          enabled: true,
          duration: 7,
        },
        winter: {
          enabled: true,
          duration: 14,
        },
      },
    },
  };

  const academicPeriodRules = {
    enrollment: {
      defaultDuration: 14,
      allowLateEnrollment: true,
      lateEnrollmentGracePeriod: 7,
      requireCounselorApproval: true,
    },
    grading: {
      defaultDuration: 5,
      allowLateSubmission: true,
      lateSubmissionGracePeriod: 3,
      requireAdminApproval: true,
    },
    scheduleChanges: {
      defaultWindow: 14,
      allowChangesAfterDeadline: false,
      requireReason: true,
      maxChangesPerStudent: 2,
    },
    uiVisibility: {
      hideEnrollmentOutsidePeriods: true,
      hideGradingOutsidePeriods: true,
      hideScheduleChangesOutsidePeriods: true,
      showPeriodWarnings: true,
    },
    notifications: {
      notifyBeforeTransitions: true,
      notifyTeachersBeforeGrading: true,
      notifyAdminsBeforeEnrollment: true,
      notificationLeadTime: 3,
    },
  };

  const academicSettings = await prisma.academicSettings.upsert({
    where: { settingsId: settings.id },
    update: {
      academicStructureType: 'SCHOOL_YEAR_ONLY',
      defaultSemesterCount: 0,
      defaultQuarterCount: 0,
      defaultTrimesterCount: 0,
      semestersHaveQuarters: false,
      defaultPeriodConfiguration: defaultPeriodConfiguration as any,
      academicPeriodRules: academicPeriodRules as any,
    },
    create: {
      settingsId: settings.id,
      academicStructureType: 'SCHOOL_YEAR_ONLY',
      defaultSemesterCount: 0,
      defaultQuarterCount: 0,
      defaultTrimesterCount: 0,
      semestersHaveQuarters: false,
      defaultPeriodConfiguration: defaultPeriodConfiguration as any,
      academicPeriodRules: academicPeriodRules as any,
    },
  });

  console.log('⚙️ Created Settings and AcademicSettings with default period configuration');

  console.log('✅ High school mock data seeding completed successfully!');
  console.log(`📈 Created:`);
  console.log(`   - ${departments.length} departments`);
  console.log(`   - ${gradeLevels.length} grade levels`);
  console.log(`   - ${rooms.length} rooms`);
  console.log(`   - ${timeBlocks.length} time blocks`);
  console.log(`   - ${users.length} users (with usernames)`);
  console.log(`   - ${teachers.length} teachers`);
  console.log(`   - ${students.length} students`);
  console.log(`   - ${parentGuardians.length} parent-guardians`);
  console.log(`   - ${courses.length} courses`);
  console.log(`   - ${courseSections.length} course sections`);
  console.log(`   - ${schedules.length} schedules`);
  console.log(`   - ${studentCourseHistory.length} student course history entries`);
  console.log(`   - ${studentGrades.length} student grades`);
  console.log(`   - Emily Johnson: 5 course history + 5 current grades`);
  console.log(`   - ${scheduleChangeRequests.length} schedule change requests`);
  console.log(`   - ${gradeLookups.length} grade lookup entries`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
