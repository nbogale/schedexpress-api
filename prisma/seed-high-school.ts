import { PrismaClient, UserRole, ConflictType, RequestStatus, NotificationType, RotationDay, RelationshipType, ContactMethod, DigestFrequency, RequestType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting high school mock data seeding...');

  // Clear existing data
  await prisma.$transaction([
    prisma.studentGrade.deleteMany(),
    prisma.auditLog.deleteMany(),
    prisma.systemSetting.deleteMany(),
    prisma.courseWaitlist.deleteMany(),
    prisma.courseConflict.deleteMany(),
    prisma.scheduleChangeAction.deleteMany(),
    prisma.scheduleChangeRequest.deleteMany(),
    prisma.studentCourseHistory.deleteMany(),
    prisma.courseSection.deleteMany(),
    prisma.schedule.deleteMany(),
    prisma.academicCycle.deleteMany(),
    prisma.academicCycleRule.deleteMany(),
    prisma.academicCycleConfig.deleteMany(),
    prisma.coursePrerequisite.deleteMany(),
    prisma.courseSequence.deleteMany(),
    prisma.courseRule.deleteMany(),
    prisma.teacherCourse.deleteMany(),
    prisma.course.deleteMany(),
    prisma.student.deleteMany(),
    prisma.teacher.deleteMany(),
    prisma.timeBlock.deleteMany(),
    prisma.room.deleteMany(),
    prisma.gradeLevel.deleteMany(),
    prisma.courseLevel.deleteMany(),
    prisma.department.deleteMany(),
    prisma.userStatusHistory.deleteMany(),
    prisma.userAccountHistory.deleteMany(),
    prisma.userAccount.deleteMany(),
    prisma.user.deleteMany(),
    prisma.gradeLookup.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.notificationPreferences.deleteMany(),
    prisma.parentGuardian.deleteMany(),
  ]);

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
    prisma.user.create({ data: { email: 'p.williams@lincolnhs.edu', username: 'pwilliams', passwordHash: bcrypt.hashSync('Welcome2ES!', 10), role: UserRole.ADMIN, firstName: 'Patricia', lastName: 'Williams' } }),
    prisma.user.create({ data: { email: 'j.anderson@lincolnhs.edu', username: 'janderson', passwordHash: bcrypt.hashSync('Welcome2ES!', 10), role: UserRole.ADMIN, firstName: 'James', lastName: 'Anderson' } }),
    
    // Platform Administrators
    prisma.user.create({ data: { email: 's.mitchell@lincolnhs.edu', username: 'smitchell', passwordHash: bcrypt.hashSync('Welcome2ES!', 10), role: UserRole.PLATFORM_ADMIN, firstName: 'Sarah', lastName: 'Mitchell' } }),
    prisma.user.create({ data: { email: 'd.foster@lincolnhs.edu', username: 'dfoster', passwordHash: bcrypt.hashSync('Welcome2ES!', 10), role: UserRole.PLATFORM_ADMIN, firstName: 'David', lastName: 'Foster' } }),
    
    // Counselors
    prisma.user.create({ data: { email: 'p.lee@lincolnhs.edu', username: 'plee', passwordHash: bcrypt.hashSync('Welcome2ES!', 10), role: UserRole.COUNSELOR, firstName: 'Patricia', lastName: 'Lee' } }),
    prisma.user.create({ data: { email: 'm.torres@lincolnhs.edu', username: 'mtorres', passwordHash: bcrypt.hashSync('Welcome2ES!', 10), role: UserRole.COUNSELOR, firstName: 'Michael', lastName: 'Torres' } }),
    prisma.user.create({ data: { email: 'j.adams@lincolnhs.edu', username: 'jadams', passwordHash: bcrypt.hashSync('Welcome2ES!', 10), role: UserRole.COUNSELOR, firstName: 'Jennifer', lastName: 'Adams' } }),
    prisma.user.create({ data: { email: 'r.kim@lincolnhs.edu', username: 'rkim', passwordHash: bcrypt.hashSync('Welcome2ES!', 10), role: UserRole.COUNSELOR, firstName: 'Robert', lastName: 'Kim' } }),
    prisma.user.create({ data: { email: 's.garcia@lincolnhs.edu', username: 'sgarcia', passwordHash: bcrypt.hashSync('Welcome2ES!', 10), role: UserRole.COUNSELOR, firstName: 'Sarah', lastName: 'Garcia' } }),
    prisma.user.create({ data: { email: 'd.martinez@lincolnhs.edu', username: 'dmartinez', passwordHash: bcrypt.hashSync('Welcome2ES!', 10), role: UserRole.COUNSELOR, firstName: 'David', lastName: 'Martinez' } }),
    
    // Teachers
    prisma.user.create({ data: { email: 's.johnson@lincolnhs.edu', username: 'sjohnson', passwordHash: bcrypt.hashSync('Welcome2ES!', 10), role: UserRole.TEACHER, firstName: 'Sarah', lastName: 'Johnson' } }),
    prisma.user.create({ data: { email: 'j.miller@lincolnhs.edu', username: 'jmiller', passwordHash: bcrypt.hashSync('Welcome2ES!', 10), role: UserRole.TEACHER, firstName: 'James', lastName: 'Miller' } }),
    prisma.user.create({ data: { email: 'r.green@lincolnhs.edu', username: 'rgreen', passwordHash: bcrypt.hashSync('Welcome2ES!', 10), role: UserRole.TEACHER, firstName: 'Rachel', lastName: 'Green' } }),
    prisma.user.create({ data: { email: 'k.park@lincolnhs.edu', username: 'kpark', passwordHash: bcrypt.hashSync('Welcome2ES!', 10), role: UserRole.TEACHER, firstName: 'Kevin', lastName: 'Park' } }),
    prisma.user.create({ data: { email: 's.white@lincolnhs.edu', username: 'swhite', passwordHash: bcrypt.hashSync('Welcome2ES!', 10), role: UserRole.TEACHER, firstName: 'Susan', lastName: 'White' } }),
    prisma.user.create({ data: { email: 'd.kim@lincolnhs.edu', username: 'dkim', passwordHash: bcrypt.hashSync('Welcome2ES!', 10), role: UserRole.TEACHER, firstName: 'Daniel', lastName: 'Kim' } }),
    prisma.user.create({ data: { email: 'l.martinez@lincolnhs.edu', username: 'lmartinez', passwordHash: bcrypt.hashSync('Welcome2ES!', 10), role: UserRole.TEACHER, firstName: 'Laura', lastName: 'Martinez' } }),
    prisma.user.create({ data: { email: 't.anderson@lincolnhs.edu', username: 'tanderson', passwordHash: bcrypt.hashSync('Welcome2ES!', 10), role: UserRole.TEACHER, firstName: 'Thomas', lastName: 'Anderson' } }),
    prisma.user.create({ data: { email: 'e.rodriguez@lincolnhs.edu', username: 'erodriguez', passwordHash: bcrypt.hashSync('Welcome2ES!', 10), role: UserRole.TEACHER, firstName: 'Emily', lastName: 'Rodriguez' } }),
    prisma.user.create({ data: { email: 'c.taylor@lincolnhs.edu', username: 'ctaylor', passwordHash: bcrypt.hashSync('Welcome2ES!', 10), role: UserRole.TEACHER, firstName: 'Christopher', lastName: 'Taylor' } }),
    prisma.user.create({ data: { email: 'a.brown@lincolnhs.edu', username: 'abrown', passwordHash: bcrypt.hashSync('Welcome2ES!', 10), role: UserRole.TEACHER, firstName: 'Amanda', lastName: 'Brown' } }),
    prisma.user.create({ data: { email: 'm.davis@lincolnhs.edu', username: 'mdavis', passwordHash: bcrypt.hashSync('Welcome2ES!', 10), role: UserRole.TEACHER, firstName: 'Michael', lastName: 'Davis' } }),
    prisma.user.create({ data: { email: 'j.wilson@lincolnhs.edu', username: 'jwilson', passwordHash: bcrypt.hashSync('Welcome2ES!', 10), role: UserRole.TEACHER, firstName: 'Jessica', lastName: 'Wilson' } }),
    prisma.user.create({ data: { email: 'r.moore@lincolnhs.edu', username: 'rmoore', passwordHash: bcrypt.hashSync('Welcome2ES!', 10), role: UserRole.TEACHER, firstName: 'Robert', lastName: 'Moore' } }),
    prisma.user.create({ data: { email: 's.jackson@lincolnhs.edu', username: 'sjackson', passwordHash: bcrypt.hashSync('Welcome2ES!', 10), role: UserRole.TEACHER, firstName: 'Stephanie', lastName: 'Jackson' } }),
    prisma.user.create({ data: { email: 'b.thompson@lincolnhs.edu', username: 'bthompson', passwordHash: bcrypt.hashSync('Welcome2ES!', 10), role: UserRole.TEACHER, firstName: 'Brian', lastName: 'Thompson' } }),
    prisma.user.create({ data: { email: 'n.garcia@lincolnhs.edu', username: 'ngarcia', passwordHash: bcrypt.hashSync('Welcome2ES!', 10), role: UserRole.TEACHER, firstName: 'Nicole', lastName: 'Garcia' } }),
    prisma.user.create({ data: { email: 'h.martinez@lincolnhs.edu', username: 'hmartinez', passwordHash: bcrypt.hashSync('Welcome2ES!', 10), role: UserRole.TEACHER, firstName: 'Heather', lastName: 'Martinez' } }),
    prisma.user.create({ data: { email: 'j.robinson@lincolnhs.edu', username: 'jrobinson', passwordHash: bcrypt.hashSync('Welcome2ES!', 10), role: UserRole.TEACHER, firstName: 'Jason', lastName: 'Robinson' } }),
    prisma.user.create({ data: { email: 'k.clark@lincolnhs.edu', username: 'kclark', passwordHash: bcrypt.hashSync('Welcome2ES!', 10), role: UserRole.TEACHER, firstName: 'Katherine', lastName: 'Clark' } }),
    prisma.user.create({ data: { email: 'd.rodriguez@lincolnhs.edu', username: 'drodriguez', passwordHash: bcrypt.hashSync('Welcome2ES!', 10), role: UserRole.TEACHER, firstName: 'Derek', lastName: 'Rodriguez' } }),
    prisma.user.create({ data: { email: 'l.lewis@lincolnhs.edu', username: 'llewis', passwordHash: bcrypt.hashSync('Welcome2ES!', 10), role: UserRole.TEACHER, firstName: 'Lisa', lastName: 'Lewis' } }),
    prisma.user.create({ data: { email: 'm.walker@lincolnhs.edu', username: 'mwalker', passwordHash: bcrypt.hashSync('Welcome2ES!', 10), role: UserRole.TEACHER, firstName: 'Matthew', lastName: 'Walker' } }),
    prisma.user.create({ data: { email: 'a.hall@lincolnhs.edu', username: 'ahall', passwordHash: bcrypt.hashSync('Welcome2ES!', 10), role: UserRole.TEACHER, firstName: 'Ashley', lastName: 'Hall' } }),
    prisma.user.create({ data: { email: 'j.allen@lincolnhs.edu', username: 'jallen', passwordHash: bcrypt.hashSync('Welcome2ES!', 10), role: UserRole.TEACHER, firstName: 'Justin', lastName: 'Allen' } }),
    prisma.user.create({ data: { email: 'r.young@lincolnhs.edu', username: 'ryoung', passwordHash: bcrypt.hashSync('Welcome2ES!', 10), role: UserRole.TEACHER, firstName: 'Rachel', lastName: 'Young' } }),
    
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
          passwordHash: bcrypt.hashSync('Welcome2ES!', 10), 
          role: UserRole.STUDENT, 
          firstName, 
          lastName 
        } 
      });
    }),
    
    // Parents
    prisma.user.create({ data: { email: 'john.thompson@email.com', username: 'jthompson', passwordHash: bcrypt.hashSync('Welcome2ES!', 10), role: UserRole.PARENT_GUARDIAN, firstName: 'John', lastName: 'Thompson' } }),
    prisma.user.create({ data: { email: 'maria.rodriguez@email.com', username: 'mrodriguez', passwordHash: bcrypt.hashSync('Welcome2ES!', 10), role: UserRole.PARENT_GUARDIAN, firstName: 'Maria', lastName: 'Rodriguez' } }),
    prisma.user.create({ data: { email: 'robert.johnson@email.com', username: 'rjohnson', passwordHash: bcrypt.hashSync('Welcome2ES!', 10), role: UserRole.PARENT_GUARDIAN, firstName: 'Robert', lastName: 'Johnson' } }),
    prisma.user.create({ data: { email: 'lisa.martinez@email.com', username: 'lisamartinez', passwordHash: bcrypt.hashSync('Welcome2ES!', 10), role: UserRole.PARENT_GUARDIAN, firstName: 'Lisa', lastName: 'Martinez' } }),
    prisma.user.create({ data: { email: 'david.williams@email.com', username: 'dwilliams', passwordHash: bcrypt.hashSync('Welcome2ES!', 10), role: UserRole.PARENT_GUARDIAN, firstName: 'David', lastName: 'Williams' } })
  ]);

  // Add existing usernames to the Set to prevent conflicts
  users.forEach(user => {
    if (user.username) {
      usedUsernames.add(user.username);
    }
  });

  console.log('👥 Created users with usernames');

  // Create Teachers (25 total) with teacherId, roomId, and departmentId
  // Assign rooms to teachers (cycling through available rooms)
  const teachers = await Promise.all([
    prisma.teacher.create({ data: { teacherId: 'TCH001', userId: users[8].id, departmentId: departments[0].id, roomId: rooms[0].id, email: 's.johnson@lincolnhs.edu', name: `${users[8].firstName} ${users[8].lastName}` } }), // Sarah Johnson - Math
    prisma.teacher.create({ data: { teacherId: 'TCH002', userId: users[9].id, departmentId: departments[0].id, roomId: rooms[1].id, email: 'j.miller@lincolnhs.edu', name: `${users[9].firstName} ${users[9].lastName}` } }), // James Miller - Math
    prisma.teacher.create({ data: { teacherId: 'TCH003', userId: users[10].id, departmentId: departments[0].id, roomId: rooms[2].id, email: 'r.green@lincolnhs.edu', name: `${users[10].firstName} ${users[10].lastName}` } }), // Rachel Green - Math
    prisma.teacher.create({ data: { teacherId: 'TCH004', userId: users[11].id, departmentId: departments[0].id, roomId: rooms[3].id, email: 'k.park@lincolnhs.edu', name: `${users[11].firstName} ${users[11].lastName}` } }), // Kevin Park - Math
    prisma.teacher.create({ data: { teacherId: 'TCH005', userId: users[12].id, departmentId: departments[0].id, roomId: rooms[4].id, email: 's.white@lincolnhs.edu', name: `${users[12].firstName} ${users[12].lastName}` } }), // Susan White - Math
    prisma.teacher.create({ data: { teacherId: 'TCH006', userId: users[13].id, departmentId: departments[0].id, roomId: rooms[5].id, email: 'd.kim@lincolnhs.edu', name: `${users[13].firstName} ${users[13].lastName}` } }), // Daniel Kim - Math
    prisma.teacher.create({ data: { teacherId: 'TCH007', userId: users[14].id, departmentId: departments[0].id, roomId: rooms[6].id, email: 'l.martinez@lincolnhs.edu', name: `${users[14].firstName} ${users[14].lastName}` } }), // Laura Martinez - Math
    prisma.teacher.create({ data: { teacherId: 'TCH008', userId: users[15].id, departmentId: departments[0].id, roomId: rooms[7].id, email: 't.anderson@lincolnhs.edu', name: `${users[15].firstName} ${users[15].lastName}` } }), // Thomas Anderson - Math
    prisma.teacher.create({ data: { teacherId: 'TCH009', userId: users[16].id, departmentId: departments[1].id, roomId: rooms[10].id, email: 'e.rodriguez@lincolnhs.edu', name: `${users[16].firstName} ${users[16].lastName}` } }), // Emily Rodriguez - English
    prisma.teacher.create({ data: { teacherId: 'TCH010', userId: users[17].id, departmentId: departments[1].id, roomId: rooms[11].id, email: 'c.taylor@lincolnhs.edu', name: `${users[17].firstName} ${users[17].lastName}` } }), // Christopher Taylor - English
    prisma.teacher.create({ data: { teacherId: 'TCH011', userId: users[18].id, departmentId: departments[0].id, roomId: rooms[8].id, email: 'a.brown@lincolnhs.edu', name: `${users[18].firstName} ${users[18].lastName}` } }), // Amanda Brown - Math
    prisma.teacher.create({ data: { teacherId: 'TCH012', userId: users[19].id, departmentId: departments[0].id, roomId: rooms[9].id, email: 'm.davis@lincolnhs.edu', name: `${users[19].firstName} ${users[19].lastName}` } }), // Michael Davis - Math
    prisma.teacher.create({ data: { teacherId: 'TCH013', userId: users[20].id, departmentId: departments[1].id, roomId: rooms[12].id, email: 'j.wilson@lincolnhs.edu', name: `${users[20].firstName} ${users[20].lastName}` } }), // Jessica Wilson - English
    prisma.teacher.create({ data: { teacherId: 'TCH014', userId: users[21].id, departmentId: departments[1].id, roomId: rooms[13].id, email: 'r.moore@lincolnhs.edu', name: `${users[21].firstName} ${users[21].lastName}` } }), // Robert Moore - English
    prisma.teacher.create({ data: { teacherId: 'TCH015', userId: users[22].id, departmentId: departments[1].id, roomId: rooms[14].id, email: 's.jackson@lincolnhs.edu', name: `${users[22].firstName} ${users[22].lastName}` } }), // Stephanie Jackson - English
    prisma.teacher.create({ data: { teacherId: 'TCH016', userId: users[23].id, departmentId: departments[2].id, roomId: rooms[20].id, email: 'b.thompson@lincolnhs.edu', name: `${users[23].firstName} ${users[23].lastName}` } }), // Brian Thompson - Science (Science Lab 1)
    prisma.teacher.create({ data: { teacherId: 'TCH017', userId: users[24].id, departmentId: departments[2].id, roomId: rooms[21].id, email: 'n.garcia@lincolnhs.edu', name: `${users[24].firstName} ${users[24].lastName}` } }), // Nicole Garcia - Science (Science Lab 2)
    prisma.teacher.create({ data: { teacherId: 'TCH018', userId: users[25].id, departmentId: departments[2].id, roomId: rooms[22].id, email: 'h.martinez@lincolnhs.edu', name: `${users[25].firstName} ${users[25].lastName}` } }), // Heather Martinez - Science (Science Lab 3)
    prisma.teacher.create({ data: { teacherId: 'TCH019', userId: users[26].id, departmentId: departments[2].id, roomId: rooms[23].id, email: 'j.robinson@lincolnhs.edu', name: `${users[26].firstName} ${users[26].lastName}` } }), // Jason Robinson - Science (Science Lab 4)
    prisma.teacher.create({ data: { teacherId: 'TCH020', userId: users[27].id, departmentId: departments[2].id, roomId: rooms[15].id, email: 'k.clark@lincolnhs.edu', name: `${users[27].firstName} ${users[27].lastName}` } }), // Katherine Clark - Science
    prisma.teacher.create({ data: { teacherId: 'TCH021', userId: users[28].id, departmentId: departments[3].id, roomId: rooms[16].id, email: 'd.rodriguez@lincolnhs.edu', name: `${users[28].firstName} ${users[28].lastName}` } }), // Derek Rodriguez - Social Studies
    prisma.teacher.create({ data: { teacherId: 'TCH022', userId: users[29].id, departmentId: departments[3].id, roomId: rooms[17].id, email: 'l.lewis@lincolnhs.edu', name: `${users[29].firstName} ${users[29].lastName}` } }), // Lisa Lewis - Social Studies
    prisma.teacher.create({ data: { teacherId: 'TCH023', userId: users[30].id, departmentId: departments[3].id, roomId: rooms[18].id, email: 'm.walker@lincolnhs.edu', name: `${users[30].firstName} ${users[30].lastName}` } }), // Matthew Walker - Social Studies
    prisma.teacher.create({ data: { teacherId: 'TCH024', userId: users[31].id, departmentId: departments[4].id, roomId: rooms[19].id, email: 'a.hall@lincolnhs.edu', name: `${users[31].firstName} ${users[31].lastName}` } }), // Ashley Hall - Foreign Language
    prisma.teacher.create({ data: { teacherId: 'TCH025', userId: users[32].id, departmentId: departments[4].id, roomId: rooms[24].id, email: 'j.allen@lincolnhs.edu', name: `${users[32].firstName} ${users[32].lastName}` } }), // Justin Allen - Foreign Language
    prisma.teacher.create({ data: { teacherId: 'TCH026', userId: users[33].id, departmentId: departments[5].id, roomId: rooms[14].id, email: 'r.young@lincolnhs.edu', name: `${users[33].firstName} ${users[33].lastName}` } })  // Rachel Young - Physical Education (Gym)
  ]);

  console.log('👨‍🏫 Created teachers');

  // Create Students (500 total - 125 per grade)
  const students = await Promise.all(
    Array.from({ length: 500 }, (_, i) => {
      const studentNumber = String(240001 + i).padStart(6, '0');
      const gradeIndex = Math.floor(i / 125); // 125 students per grade
      const userIndex = 34 + i; // Students start at index 34 (after 34 non-student users)
      
      return prisma.student.create({ 
        data: { 
          userId: users[userIndex].id, 
          studentId: studentNumber, 
          gradeLevelId: gradeLevels[gradeIndex].id 
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
      name: '2025-2026',
      cycleType: 'SCHOOL_YEAR',
      cycleNumber: null,
      startDate: new Date('2025-08-15'),
      endDate: new Date('2026-06-15'),
      isCurrent: true,
      isActive: true,
      isValidated: true,
      validatedBy: users[0].id, // Admin user
      description: '2025-2026 Academic Year',
      scheduleChangeConfig: {
        enabled: true,
        deadlineDays: 14,
        studentCanRequest: true,
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
      startDate: new Date('2025-08-15'),
      endDate: new Date('2025-12-20'),
      isCurrent: true,
      isActive: true,
      isValidated: true,
      validatedBy: users[0].id,
      description: 'Fall semester of the 2025-2026 academic year',
      scheduleChangeConfig: {
        enabled: true,
        deadlineDays: 14,
        studentCanRequest: true,
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
      startDate: new Date('2026-01-15'),
      endDate: new Date('2026-06-15'),
      isCurrent: false,
      isActive: true,
      isValidated: false,
      description: 'Spring semester of the 2025-2026 academic year',
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
        startDate: new Date('2025-08-15'),
        endDate: new Date('2025-10-18'),
        isCurrent: true,
        isActive: true,
        isValidated: true,
        validatedBy: users[0].id,
        description: 'First quarter of the fall semester',
        scheduleChangeConfig: {
          enabled: true,
          deadlineDays: 14,
          studentCanRequest: true,
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
        startDate: new Date('2025-10-21'),
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
        startDate: new Date('2026-01-15'),
        endDate: new Date('2026-03-20'),
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
        startDate: new Date('2026-03-23'),
        endDate: new Date('2026-06-15'),
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

  // Create Course Sections (Expanded for 500 students)
  const courseSections = await Promise.all([
    // Math sections (multiple sections per course to handle 500 students)
    // Algebra I - 6 sections (125 Grade 9 students)
    prisma.courseSection.create({ data: { sectionNumber: 'A', courseId: courses[0].id, teacherId: teachers[0].id, roomId: rooms[0].id, timeBlockId: timeBlocks[0].id, maxEnrollment: 25, currentEnrollment: 25, academicCycleId: currentAcademicCycle.id } }),
    prisma.courseSection.create({ data: { sectionNumber: 'B', courseId: courses[0].id, teacherId: teachers[1].id, roomId: rooms[1].id, timeBlockId: timeBlocks[1].id, maxEnrollment: 25, currentEnrollment: 24, academicCycleId: currentAcademicCycle.id } }),
    prisma.courseSection.create({ data: { sectionNumber: 'C', courseId: courses[0].id, teacherId: teachers[2].id, roomId: rooms[2].id, timeBlockId: timeBlocks[2].id, maxEnrollment: 25, currentEnrollment: 22, academicCycleId: currentAcademicCycle.id } }),
    prisma.courseSection.create({ data: { sectionNumber: 'D', courseId: courses[0].id, teacherId: teachers[3].id, roomId: rooms[3].id, timeBlockId: timeBlocks[3].id, maxEnrollment: 25, currentEnrollment: 24, academicCycleId: currentAcademicCycle.id } }),
    prisma.courseSection.create({ data: { sectionNumber: 'E', courseId: courses[0].id, teacherId: teachers[4].id, roomId: rooms[4].id, timeBlockId: timeBlocks[4].id, maxEnrollment: 25, currentEnrollment: 22, academicCycleId: currentAcademicCycle.id } }),
    prisma.courseSection.create({ data: { sectionNumber: 'F', courseId: courses[0].id, teacherId: teachers[5].id, roomId: rooms[5].id, timeBlockId: timeBlocks[5].id, maxEnrollment: 25, currentEnrollment: 20, academicCycleId: currentAcademicCycle.id } }),
    
    // Geometry - 5 sections (125 Grade 10 students)
    prisma.courseSection.create({ data: { sectionNumber: 'A', courseId: courses[1].id, teacherId: teachers[6].id, roomId: rooms[6].id, timeBlockId: timeBlocks[0].id, maxEnrollment: 25, currentEnrollment: 25, academicCycleId: currentAcademicCycle.id } }),
    prisma.courseSection.create({ data: { sectionNumber: 'B', courseId: courses[1].id, teacherId: teachers[7].id, roomId: rooms[7].id, timeBlockId: timeBlocks[1].id, maxEnrollment: 25, currentEnrollment: 24, academicCycleId: currentAcademicCycle.id } }),
    prisma.courseSection.create({ data: { sectionNumber: 'C', courseId: courses[1].id, teacherId: teachers[8].id, roomId: rooms[8].id, timeBlockId: timeBlocks[2].id, maxEnrollment: 25, currentEnrollment: 22, academicCycleId: currentAcademicCycle.id } }),
    prisma.courseSection.create({ data: { sectionNumber: 'D', courseId: courses[1].id, teacherId: teachers[9].id, roomId: rooms[9].id, timeBlockId: timeBlocks[3].id, maxEnrollment: 25, currentEnrollment: 24, academicCycleId: currentAcademicCycle.id } }),
    prisma.courseSection.create({ data: { sectionNumber: 'E', courseId: courses[1].id, teacherId: teachers[10].id, roomId: rooms[10].id, timeBlockId: timeBlocks[4].id, maxEnrollment: 25, currentEnrollment: 22, academicCycleId: currentAcademicCycle.id } }),
    
    // Algebra II - 5 sections (125 Grade 11 students)
    prisma.courseSection.create({ data: { sectionNumber: 'A', courseId: courses[2].id, teacherId: teachers[11].id, roomId: rooms[11].id, timeBlockId: timeBlocks[0].id, maxEnrollment: 25, currentEnrollment: 25, academicCycleId: currentAcademicCycle.id } }),
    prisma.courseSection.create({ data: { sectionNumber: 'B', courseId: courses[2].id, teacherId: teachers[12].id, roomId: rooms[12].id, timeBlockId: timeBlocks[1].id, maxEnrollment: 25, currentEnrollment: 24, academicCycleId: currentAcademicCycle.id } }),
    prisma.courseSection.create({ data: { sectionNumber: 'C', courseId: courses[2].id, teacherId: teachers[13].id, roomId: rooms[13].id, timeBlockId: timeBlocks[2].id, maxEnrollment: 25, currentEnrollment: 22, academicCycleId: currentAcademicCycle.id } }),
    prisma.courseSection.create({ data: { sectionNumber: 'D', courseId: courses[2].id, teacherId: teachers[14].id, roomId: rooms[14].id, timeBlockId: timeBlocks[3].id, maxEnrollment: 25, currentEnrollment: 24, academicCycleId: currentAcademicCycle.id } }),
    prisma.courseSection.create({ data: { sectionNumber: 'E', courseId: courses[2].id, teacherId: teachers[15].id, roomId: rooms[15].id, timeBlockId: timeBlocks[4].id, maxEnrollment: 25, currentEnrollment: 22, academicCycleId: currentAcademicCycle.id } }),
    
    // Pre-Calculus - 3 sections (75 Grade 12 students)
    prisma.courseSection.create({ data: { sectionNumber: 'A', courseId: courses[3].id, teacherId: teachers[16].id, roomId: rooms[16].id, timeBlockId: timeBlocks[0].id, maxEnrollment: 25, currentEnrollment: 20, academicCycleId: currentAcademicCycle.id } }),
    prisma.courseSection.create({ data: { sectionNumber: 'B', courseId: courses[3].id, teacherId: teachers[17].id, roomId: rooms[17].id, timeBlockId: timeBlocks[1].id, maxEnrollment: 25, currentEnrollment: 22, academicCycleId: currentAcademicCycle.id } }),
    prisma.courseSection.create({ data: { sectionNumber: 'C', courseId: courses[3].id, teacherId: teachers[18].id, roomId: rooms[18].id, timeBlockId: timeBlocks[2].id, maxEnrollment: 25, currentEnrollment: 18, academicCycleId: currentAcademicCycle.id } }),
    
    // AP Calculus AB - 2 sections (50 Grade 12 students)
    prisma.courseSection.create({ data: { sectionNumber: 'A', courseId: courses[4].id, teacherId: teachers[19].id, roomId: rooms[19].id, timeBlockId: timeBlocks[0].id, maxEnrollment: 25, currentEnrollment: 20, academicCycleId: currentAcademicCycle.id } }),
    prisma.courseSection.create({ data: { sectionNumber: 'B', courseId: courses[4].id, teacherId: teachers[20].id, roomId: rooms[20].id, timeBlockId: timeBlocks[1].id, maxEnrollment: 25, currentEnrollment: 18, academicCycleId: currentAcademicCycle.id } }),
    
    // English sections (multiple sections per course)
    // English 9 - 5 sections (125 Grade 9 students)
    prisma.courseSection.create({ data: { sectionNumber: 'A', courseId: courses[5].id, teacherId: teachers[21].id, roomId: rooms[21].id, timeBlockId: timeBlocks[0].id, maxEnrollment: 25, currentEnrollment: 25, academicCycleId: currentAcademicCycle.id } }),
    prisma.courseSection.create({ data: { sectionNumber: 'B', courseId: courses[5].id, teacherId: teachers[22].id, roomId: rooms[22].id, timeBlockId: timeBlocks[1].id, maxEnrollment: 25, currentEnrollment: 24, academicCycleId: currentAcademicCycle.id } }),
    prisma.courseSection.create({ data: { sectionNumber: 'C', courseId: courses[5].id, teacherId: teachers[23].id, roomId: rooms[23].id, timeBlockId: timeBlocks[2].id, maxEnrollment: 25, currentEnrollment: 22, academicCycleId: currentAcademicCycle.id } }),
    prisma.courseSection.create({ data: { sectionNumber: 'D', courseId: courses[5].id, teacherId: teachers[24].id, roomId: rooms[24].id, timeBlockId: timeBlocks[3].id, maxEnrollment: 25, currentEnrollment: 24, academicCycleId: currentAcademicCycle.id } }),
    prisma.courseSection.create({ data: { sectionNumber: 'E', courseId: courses[5].id, teacherId: teachers[0].id, roomId: rooms[25].id, timeBlockId: timeBlocks[4].id, maxEnrollment: 25, currentEnrollment: 22, academicCycleId: currentAcademicCycle.id } }),
    
    // English 10 - 5 sections (125 Grade 10 students)
    prisma.courseSection.create({ data: { sectionNumber: 'A', courseId: courses[6].id, teacherId: teachers[1].id, roomId: rooms[26].id, timeBlockId: timeBlocks[0].id, maxEnrollment: 25, currentEnrollment: 25, academicCycleId: currentAcademicCycle.id } }),
    prisma.courseSection.create({ data: { sectionNumber: 'B', courseId: courses[6].id, teacherId: teachers[2].id, roomId: rooms[27].id, timeBlockId: timeBlocks[1].id, maxEnrollment: 25, currentEnrollment: 24, academicCycleId: currentAcademicCycle.id } }),
    prisma.courseSection.create({ data: { sectionNumber: 'C', courseId: courses[6].id, teacherId: teachers[3].id, roomId: rooms[28].id, timeBlockId: timeBlocks[2].id, maxEnrollment: 25, currentEnrollment: 22, academicCycleId: currentAcademicCycle.id } }),
    prisma.courseSection.create({ data: { sectionNumber: 'D', courseId: courses[6].id, teacherId: teachers[4].id, roomId: rooms[29].id, timeBlockId: timeBlocks[3].id, maxEnrollment: 25, currentEnrollment: 24, academicCycleId: currentAcademicCycle.id } }),
    prisma.courseSection.create({ data: { sectionNumber: 'E', courseId: courses[6].id, teacherId: teachers[5].id, roomId: rooms[30].id, timeBlockId: timeBlocks[4].id, maxEnrollment: 25, currentEnrollment: 22, academicCycleId: currentAcademicCycle.id } }),
    
    // English 11 - 5 sections (125 Grade 11 students)
    prisma.courseSection.create({ data: { sectionNumber: 'A', courseId: courses[7].id, teacherId: teachers[6].id, roomId: rooms[31].id, timeBlockId: timeBlocks[0].id, maxEnrollment: 25, currentEnrollment: 25, academicCycleId: currentAcademicCycle.id } }),
    prisma.courseSection.create({ data: { sectionNumber: 'B', courseId: courses[7].id, teacherId: teachers[7].id, roomId: rooms[32].id, timeBlockId: timeBlocks[1].id, maxEnrollment: 25, currentEnrollment: 24, academicCycleId: currentAcademicCycle.id } }),
    prisma.courseSection.create({ data: { sectionNumber: 'C', courseId: courses[7].id, teacherId: teachers[8].id, roomId: rooms[33].id, timeBlockId: timeBlocks[2].id, maxEnrollment: 25, currentEnrollment: 22, academicCycleId: currentAcademicCycle.id } }),
    prisma.courseSection.create({ data: { sectionNumber: 'D', courseId: courses[7].id, teacherId: teachers[9].id, roomId: rooms[34].id, timeBlockId: timeBlocks[3].id, maxEnrollment: 25, currentEnrollment: 24, academicCycleId: currentAcademicCycle.id } }),
    prisma.courseSection.create({ data: { sectionNumber: 'E', courseId: courses[7].id, teacherId: teachers[10].id, roomId: rooms[35].id, timeBlockId: timeBlocks[4].id, maxEnrollment: 25, currentEnrollment: 22, academicCycleId: currentAcademicCycle.id } }),
    
    // AP English Language - 2 sections (50 Grade 11 students)
    prisma.courseSection.create({ data: { sectionNumber: 'A', courseId: courses[8].id, teacherId: teachers[11].id, roomId: rooms[36].id, timeBlockId: timeBlocks[0].id, maxEnrollment: 25, currentEnrollment: 20, academicCycleId: currentAcademicCycle.id } }),
    prisma.courseSection.create({ data: { sectionNumber: 'B', courseId: courses[8].id, teacherId: teachers[12].id, roomId: rooms[37].id, timeBlockId: timeBlocks[1].id, maxEnrollment: 25, currentEnrollment: 18, academicCycleId: currentAcademicCycle.id } }),
    
    // English 12 - 5 sections (125 Grade 12 students)
    prisma.courseSection.create({ data: { sectionNumber: 'A', courseId: courses[9].id, teacherId: teachers[13].id, roomId: rooms[38].id, timeBlockId: timeBlocks[0].id, maxEnrollment: 25, currentEnrollment: 25, academicCycleId: currentAcademicCycle.id } }),
    prisma.courseSection.create({ data: { sectionNumber: 'B', courseId: courses[9].id, teacherId: teachers[14].id, roomId: rooms[39].id, timeBlockId: timeBlocks[1].id, maxEnrollment: 25, currentEnrollment: 24, academicCycleId: currentAcademicCycle.id } }),
    prisma.courseSection.create({ data: { sectionNumber: 'C', courseId: courses[9].id, teacherId: teachers[15].id, roomId: rooms[40].id, timeBlockId: timeBlocks[2].id, maxEnrollment: 25, currentEnrollment: 22, academicCycleId: currentAcademicCycle.id } }),
    prisma.courseSection.create({ data: { sectionNumber: 'D', courseId: courses[9].id, teacherId: teachers[16].id, roomId: rooms[41].id, timeBlockId: timeBlocks[3].id, maxEnrollment: 25, currentEnrollment: 24, academicCycleId: currentAcademicCycle.id } }),
    prisma.courseSection.create({ data: { sectionNumber: 'E', courseId: courses[9].id, teacherId: teachers[17].id, roomId: rooms[42].id, timeBlockId: timeBlocks[4].id, maxEnrollment: 25, currentEnrollment: 22, academicCycleId: currentAcademicCycle.id } }),
    
    // Science sections (multiple sections per course)
    // Biology - 4 sections (100 Grade 10 students)
    prisma.courseSection.create({ data: { sectionNumber: 'A', courseId: courses[10].id, teacherId: teachers[18].id, roomId: rooms[31].id, timeBlockId: timeBlocks[0].id, maxEnrollment: 25, currentEnrollment: 20, academicCycleId: currentAcademicCycle.id } }),
    prisma.courseSection.create({ data: { sectionNumber: 'B', courseId: courses[10].id, teacherId: teachers[19].id, roomId: rooms[32].id, timeBlockId: timeBlocks[1].id, maxEnrollment: 25, currentEnrollment: 22, academicCycleId: currentAcademicCycle.id } }),
    prisma.courseSection.create({ data: { sectionNumber: 'C', courseId: courses[10].id, teacherId: teachers[20].id, roomId: rooms[33].id, timeBlockId: timeBlocks[2].id, maxEnrollment: 25, currentEnrollment: 18, academicCycleId: currentAcademicCycle.id } }),
    prisma.courseSection.create({ data: { sectionNumber: 'D', courseId: courses[10].id, teacherId: teachers[21].id, roomId: rooms[34].id, timeBlockId: timeBlocks[3].id, maxEnrollment: 25, currentEnrollment: 16, academicCycleId: currentAcademicCycle.id } }),
    
    // Chemistry - 4 sections (100 Grade 11 students)
    prisma.courseSection.create({ data: { sectionNumber: 'A', courseId: courses[11].id, teacherId: teachers[22].id, roomId: rooms[35].id, timeBlockId: timeBlocks[0].id, maxEnrollment: 25, currentEnrollment: 20, academicCycleId: currentAcademicCycle.id } }),
    prisma.courseSection.create({ data: { sectionNumber: 'B', courseId: courses[11].id, teacherId: teachers[23].id, roomId: rooms[0].id, timeBlockId: timeBlocks[1].id, maxEnrollment: 25, currentEnrollment: 22, academicCycleId: currentAcademicCycle.id } }),
    prisma.courseSection.create({ data: { sectionNumber: 'C', courseId: courses[11].id, teacherId: teachers[24].id, roomId: rooms[1].id, timeBlockId: timeBlocks[2].id, maxEnrollment: 25, currentEnrollment: 18, academicCycleId: currentAcademicCycle.id } }),
    prisma.courseSection.create({ data: { sectionNumber: 'D', courseId: courses[11].id, teacherId: teachers[0].id, roomId: rooms[2].id, timeBlockId: timeBlocks[3].id, maxEnrollment: 25, currentEnrollment: 16, academicCycleId: currentAcademicCycle.id } }),
    
    // Physics - 3 sections (75 Grade 12 students)
    prisma.courseSection.create({ data: { sectionNumber: 'A', courseId: courses[12].id, teacherId: teachers[1].id, roomId: rooms[3].id, timeBlockId: timeBlocks[0].id, maxEnrollment: 25, currentEnrollment: 20, academicCycleId: currentAcademicCycle.id } }),
    prisma.courseSection.create({ data: { sectionNumber: 'B', courseId: courses[12].id, teacherId: teachers[2].id, roomId: rooms[4].id, timeBlockId: timeBlocks[1].id, maxEnrollment: 25, currentEnrollment: 22, academicCycleId: currentAcademicCycle.id } }),
    prisma.courseSection.create({ data: { sectionNumber: 'C', courseId: courses[12].id, teacherId: teachers[3].id, roomId: rooms[5].id, timeBlockId: timeBlocks[2].id, maxEnrollment: 25, currentEnrollment: 18, academicCycleId: currentAcademicCycle.id } }),
    
    // AP Biology - 2 sections (50 Grade 11 students)
    prisma.courseSection.create({ data: { sectionNumber: 'A', courseId: courses[13].id, teacherId: teachers[4].id, roomId: rooms[6].id, timeBlockId: timeBlocks[0].id, maxEnrollment: 25, currentEnrollment: 20, academicCycleId: currentAcademicCycle.id } }),
    prisma.courseSection.create({ data: { sectionNumber: 'B', courseId: courses[13].id, teacherId: teachers[5].id, roomId: rooms[7].id, timeBlockId: timeBlocks[1].id, maxEnrollment: 25, currentEnrollment: 18, academicCycleId: currentAcademicCycle.id } }),
    
    // AP Chemistry - 2 sections (50 Grade 12 students)
    prisma.courseSection.create({ data: { sectionNumber: 'A', courseId: courses[14].id, teacherId: teachers[6].id, roomId: rooms[8].id, timeBlockId: timeBlocks[0].id, maxEnrollment: 25, currentEnrollment: 20, academicCycleId: currentAcademicCycle.id } }),
    prisma.courseSection.create({ data: { sectionNumber: 'B', courseId: courses[14].id, teacherId: teachers[7].id, roomId: rooms[9].id, timeBlockId: timeBlocks[1].id, maxEnrollment: 25, currentEnrollment: 18, academicCycleId: currentAcademicCycle.id } }),
    
    // AP Physics 1 - 2 sections (50 Grade 12 students)
    prisma.courseSection.create({ data: { sectionNumber: 'A', courseId: courses[15].id, teacherId: teachers[8].id, roomId: rooms[10].id, timeBlockId: timeBlocks[0].id, maxEnrollment: 25, currentEnrollment: 20, academicCycleId: currentAcademicCycle.id } }),
    prisma.courseSection.create({ data: { sectionNumber: 'B', courseId: courses[15].id, teacherId: teachers[9].id, roomId: rooms[11].id, timeBlockId: timeBlocks[1].id, maxEnrollment: 25, currentEnrollment: 18, academicCycleId: currentAcademicCycle.id } }),
    
    // Environmental Science - 2 sections (50 Grade 12 students)
    prisma.courseSection.create({ data: { sectionNumber: 'A', courseId: courses[16].id, teacherId: teachers[10].id, roomId: rooms[12].id, timeBlockId: timeBlocks[0].id, maxEnrollment: 25, currentEnrollment: 20, academicCycleId: currentAcademicCycle.id } }),
    prisma.courseSection.create({ data: { sectionNumber: 'B', courseId: courses[16].id, teacherId: teachers[11].id, roomId: rooms[13].id, timeBlockId: timeBlocks[1].id, maxEnrollment: 25, currentEnrollment: 18, academicCycleId: currentAcademicCycle.id } }),
    
    // Social Studies sections (multiple sections per course)
    // World History - 4 sections (100 Grade 10 students)
    prisma.courseSection.create({ data: { sectionNumber: 'A', courseId: courses[17].id, teacherId: teachers[12].id, roomId: rooms[14].id, timeBlockId: timeBlocks[0].id, maxEnrollment: 25, currentEnrollment: 25, academicCycleId: currentAcademicCycle.id } }),
    prisma.courseSection.create({ data: { sectionNumber: 'B', courseId: courses[17].id, teacherId: teachers[13].id, roomId: rooms[15].id, timeBlockId: timeBlocks[1].id, maxEnrollment: 25, currentEnrollment: 24, academicCycleId: currentAcademicCycle.id } }),
    prisma.courseSection.create({ data: { sectionNumber: 'C', courseId: courses[17].id, teacherId: teachers[14].id, roomId: rooms[16].id, timeBlockId: timeBlocks[2].id, maxEnrollment: 25, currentEnrollment: 22, academicCycleId: currentAcademicCycle.id } }),
    prisma.courseSection.create({ data: { sectionNumber: 'D', courseId: courses[17].id, teacherId: teachers[15].id, roomId: rooms[17].id, timeBlockId: timeBlocks[3].id, maxEnrollment: 25, currentEnrollment: 24, academicCycleId: currentAcademicCycle.id } }),
    
    // US History - 4 sections (100 Grade 11 students)
    prisma.courseSection.create({ data: { sectionNumber: 'A', courseId: courses[18].id, teacherId: teachers[16].id, roomId: rooms[18].id, timeBlockId: timeBlocks[0].id, maxEnrollment: 25, currentEnrollment: 25, academicCycleId: currentAcademicCycle.id } }),
    prisma.courseSection.create({ data: { sectionNumber: 'B', courseId: courses[18].id, teacherId: teachers[17].id, roomId: rooms[19].id, timeBlockId: timeBlocks[1].id, maxEnrollment: 25, currentEnrollment: 24, academicCycleId: currentAcademicCycle.id } }),
    prisma.courseSection.create({ data: { sectionNumber: 'C', courseId: courses[18].id, teacherId: teachers[18].id, roomId: rooms[20].id, timeBlockId: timeBlocks[2].id, maxEnrollment: 25, currentEnrollment: 22, academicCycleId: currentAcademicCycle.id } }),
    prisma.courseSection.create({ data: { sectionNumber: 'D', courseId: courses[18].id, teacherId: teachers[19].id, roomId: rooms[21].id, timeBlockId: timeBlocks[3].id, maxEnrollment: 25, currentEnrollment: 24, academicCycleId: currentAcademicCycle.id } }),
    
    // AP US History - 2 sections (50 Grade 11 students)
    prisma.courseSection.create({ data: { sectionNumber: 'A', courseId: courses[19].id, teacherId: teachers[20].id, roomId: rooms[22].id, timeBlockId: timeBlocks[0].id, maxEnrollment: 25, currentEnrollment: 20, academicCycleId: currentAcademicCycle.id } }),
    prisma.courseSection.create({ data: { sectionNumber: 'B', courseId: courses[19].id, teacherId: teachers[21].id, roomId: rooms[23].id, timeBlockId: timeBlocks[1].id, maxEnrollment: 25, currentEnrollment: 18, academicCycleId: currentAcademicCycle.id } }),
    
    // Government - 3 sections (75 Grade 12 students)
    prisma.courseSection.create({ data: { sectionNumber: 'A', courseId: courses[20].id, teacherId: teachers[22].id, roomId: rooms[24].id, timeBlockId: timeBlocks[0].id, maxEnrollment: 25, currentEnrollment: 25, academicCycleId: currentAcademicCycle.id } }),
    prisma.courseSection.create({ data: { sectionNumber: 'B', courseId: courses[20].id, teacherId: teachers[23].id, roomId: rooms[25].id, timeBlockId: timeBlocks[1].id, maxEnrollment: 25, currentEnrollment: 24, academicCycleId: currentAcademicCycle.id } }),
    prisma.courseSection.create({ data: { sectionNumber: 'C', courseId: courses[20].id, teacherId: teachers[24].id, roomId: rooms[26].id, timeBlockId: timeBlocks[2].id, maxEnrollment: 25, currentEnrollment: 22, academicCycleId: currentAcademicCycle.id } }),
    
    // Economics - 2 sections (50 Grade 12 students)
    prisma.courseSection.create({ data: { sectionNumber: 'A', courseId: courses[21].id, teacherId: teachers[0].id, roomId: rooms[27].id, timeBlockId: timeBlocks[0].id, maxEnrollment: 25, currentEnrollment: 25, academicCycleId: currentAcademicCycle.id } }),
    prisma.courseSection.create({ data: { sectionNumber: 'B', courseId: courses[21].id, teacherId: teachers[1].id, roomId: rooms[28].id, timeBlockId: timeBlocks[1].id, maxEnrollment: 25, currentEnrollment: 24, academicCycleId: currentAcademicCycle.id } }),
    
    // AP World History - 2 sections (50 Grade 11 students)
    prisma.courseSection.create({ data: { sectionNumber: 'A', courseId: courses[22].id, teacherId: teachers[2].id, roomId: rooms[29].id, timeBlockId: timeBlocks[0].id, maxEnrollment: 25, currentEnrollment: 20, academicCycleId: currentAcademicCycle.id } }),
    prisma.courseSection.create({ data: { sectionNumber: 'B', courseId: courses[22].id, teacherId: teachers[3].id, roomId: rooms[30].id, timeBlockId: timeBlocks[1].id, maxEnrollment: 25, currentEnrollment: 18, academicCycleId: currentAcademicCycle.id } }),
    
    // Foreign Language sections (multiple sections per course)
    // Spanish I - 3 sections (75 Grade 10 students)
    prisma.courseSection.create({ data: { sectionNumber: 'A', courseId: courses[23].id, teacherId: teachers[4].id, roomId: rooms[31].id, timeBlockId: timeBlocks[0].id, maxEnrollment: 25, currentEnrollment: 20, academicCycleId: currentAcademicCycle.id } }),
    prisma.courseSection.create({ data: { sectionNumber: 'B', courseId: courses[23].id, teacherId: teachers[5].id, roomId: rooms[32].id, timeBlockId: timeBlocks[1].id, maxEnrollment: 25, currentEnrollment: 22, academicCycleId: currentAcademicCycle.id } }),
    prisma.courseSection.create({ data: { sectionNumber: 'C', courseId: courses[23].id, teacherId: teachers[6].id, roomId: rooms[33].id, timeBlockId: timeBlocks[2].id, maxEnrollment: 25, currentEnrollment: 18, academicCycleId: currentAcademicCycle.id } }),
    
    // Spanish II - 3 sections (75 Grade 11 students)
    prisma.courseSection.create({ data: { sectionNumber: 'A', courseId: courses[24].id, teacherId: teachers[7].id, roomId: rooms[34].id, timeBlockId: timeBlocks[0].id, maxEnrollment: 25, currentEnrollment: 20, academicCycleId: currentAcademicCycle.id } }),
    prisma.courseSection.create({ data: { sectionNumber: 'B', courseId: courses[24].id, teacherId: teachers[8].id, roomId: rooms[35].id, timeBlockId: timeBlocks[1].id, maxEnrollment: 25, currentEnrollment: 22, academicCycleId: currentAcademicCycle.id } }),
    prisma.courseSection.create({ data: { sectionNumber: 'C', courseId: courses[24].id, teacherId: teachers[9].id, roomId: rooms[0].id, timeBlockId: timeBlocks[2].id, maxEnrollment: 25, currentEnrollment: 18, academicCycleId: currentAcademicCycle.id } }),
    
    // AP Spanish Language - 2 sections (50 Grade 12 students)
    prisma.courseSection.create({ data: { sectionNumber: 'A', courseId: courses[25].id, teacherId: teachers[10].id, roomId: rooms[1].id, timeBlockId: timeBlocks[0].id, maxEnrollment: 25, currentEnrollment: 20, academicCycleId: currentAcademicCycle.id } }),
    prisma.courseSection.create({ data: { sectionNumber: 'B', courseId: courses[25].id, teacherId: teachers[11].id, roomId: rooms[2].id, timeBlockId: timeBlocks[1].id, maxEnrollment: 25, currentEnrollment: 18, academicCycleId: currentAcademicCycle.id } }),
    
    // French I - 2 sections (50 Grade 10 students)
    prisma.courseSection.create({ data: { sectionNumber: 'A', courseId: courses[26].id, teacherId: teachers[12].id, roomId: rooms[3].id, timeBlockId: timeBlocks[0].id, maxEnrollment: 25, currentEnrollment: 20, academicCycleId: currentAcademicCycle.id } }),
    prisma.courseSection.create({ data: { sectionNumber: 'B', courseId: courses[26].id, teacherId: teachers[13].id, roomId: rooms[4].id, timeBlockId: timeBlocks[1].id, maxEnrollment: 25, currentEnrollment: 18, academicCycleId: currentAcademicCycle.id } }),
    
    // French II - 2 sections (50 Grade 11 students)
    prisma.courseSection.create({ data: { sectionNumber: 'A', courseId: courses[27].id, teacherId: teachers[14].id, roomId: rooms[5].id, timeBlockId: timeBlocks[0].id, maxEnrollment: 25, currentEnrollment: 20, academicCycleId: currentAcademicCycle.id } }),
    prisma.courseSection.create({ data: { sectionNumber: 'B', courseId: courses[27].id, teacherId: teachers[15].id, roomId: rooms[6].id, timeBlockId: timeBlocks[1].id, maxEnrollment: 25, currentEnrollment: 18, academicCycleId: currentAcademicCycle.id } }),
    
    // Physical Education sections (multiple sections per course)
    // PE 9 - 5 sections (125 Grade 9 students)
    prisma.courseSection.create({ data: { sectionNumber: 'A', courseId: courses[28].id, teacherId: teachers[16].id, roomId: rooms[7].id, timeBlockId: timeBlocks[0].id, maxEnrollment: 25, currentEnrollment: 25, academicCycleId: currentAcademicCycle.id } }),
    prisma.courseSection.create({ data: { sectionNumber: 'B', courseId: courses[28].id, teacherId: teachers[17].id, roomId: rooms[8].id, timeBlockId: timeBlocks[1].id, maxEnrollment: 25, currentEnrollment: 24, academicCycleId: currentAcademicCycle.id } }),
    prisma.courseSection.create({ data: { sectionNumber: 'C', courseId: courses[28].id, teacherId: teachers[18].id, roomId: rooms[9].id, timeBlockId: timeBlocks[2].id, maxEnrollment: 25, currentEnrollment: 22, academicCycleId: currentAcademicCycle.id } }),
    prisma.courseSection.create({ data: { sectionNumber: 'D', courseId: courses[28].id, teacherId: teachers[19].id, roomId: rooms[10].id, timeBlockId: timeBlocks[3].id, maxEnrollment: 25, currentEnrollment: 24, academicCycleId: currentAcademicCycle.id } }),
    prisma.courseSection.create({ data: { sectionNumber: 'E', courseId: courses[28].id, teacherId: teachers[20].id, roomId: rooms[11].id, timeBlockId: timeBlocks[4].id, maxEnrollment: 25, currentEnrollment: 22, academicCycleId: currentAcademicCycle.id } }),
    
    // PE 10 - 5 sections (125 Grade 10 students)
    prisma.courseSection.create({ data: { sectionNumber: 'A', courseId: courses[29].id, teacherId: teachers[21].id, roomId: rooms[22].id, timeBlockId: timeBlocks[0].id, maxEnrollment: 25, currentEnrollment: 25, academicCycleId: currentAcademicCycle.id } }),
    prisma.courseSection.create({ data: { sectionNumber: 'B', courseId: courses[29].id, teacherId: teachers[22].id, roomId: rooms[23].id, timeBlockId: timeBlocks[1].id, maxEnrollment: 25, currentEnrollment: 24, academicCycleId: currentAcademicCycle.id } }),
    prisma.courseSection.create({ data: { sectionNumber: 'C', courseId: courses[29].id, teacherId: teachers[23].id, roomId: rooms[24].id, timeBlockId: timeBlocks[2].id, maxEnrollment: 25, currentEnrollment: 22, academicCycleId: currentAcademicCycle.id } }),
    prisma.courseSection.create({ data: { sectionNumber: 'D', courseId: courses[29].id, teacherId: teachers[24].id, roomId: rooms[25].id, timeBlockId: timeBlocks[3].id, maxEnrollment: 25, currentEnrollment: 24, academicCycleId: currentAcademicCycle.id } }),
    prisma.courseSection.create({ data: { sectionNumber: 'E', courseId: courses[29].id, teacherId: teachers[0].id, roomId: rooms[26].id, timeBlockId: timeBlocks[4].id, maxEnrollment: 25, currentEnrollment: 22, academicCycleId: currentAcademicCycle.id } }),
    
    // Health - 4 sections (100 Grade 11 students)
    prisma.courseSection.create({ data: { sectionNumber: 'A', courseId: courses[30].id, teacherId: teachers[1].id, roomId: rooms[27].id, timeBlockId: timeBlocks[0].id, maxEnrollment: 25, currentEnrollment: 25, academicCycleId: currentAcademicCycle.id } }),
    prisma.courseSection.create({ data: { sectionNumber: 'B', courseId: courses[30].id, teacherId: teachers[2].id, roomId: rooms[28].id, timeBlockId: timeBlocks[1].id, maxEnrollment: 25, currentEnrollment: 24, academicCycleId: currentAcademicCycle.id } }),
    prisma.courseSection.create({ data: { sectionNumber: 'C', courseId: courses[30].id, teacherId: teachers[3].id, roomId: rooms[29].id, timeBlockId: timeBlocks[2].id, maxEnrollment: 25, currentEnrollment: 22, academicCycleId: currentAcademicCycle.id } }),
    prisma.courseSection.create({ data: { sectionNumber: 'D', courseId: courses[30].id, teacherId: teachers[4].id, roomId: rooms[30].id, timeBlockId: timeBlocks[3].id, maxEnrollment: 25, currentEnrollment: 24, academicCycleId: currentAcademicCycle.id } })
  ]);

  console.log('📚 Created course sections');

  // Create schedules for all students in batches to avoid connection pool timeout
  console.log('📋 Creating schedules...');
  
  // Track how many courses each student is enrolled in
  const studentCourseCount: { [studentId: string]: number } = {};
  students.forEach(student => {
    studentCourseCount[student.id] = 0;
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
    // Find the first 25 students who don't have 6 courses yet
    const enrolledStudents = students
      .filter(student => studentCourseCount[student.id] < 6)
      .slice(0, 25);

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
    });

    console.log(`✓ Enrolled ${enrolledStudents.length} students in section ${section.sectionNumber}`);
  }

  // Now create schedules in batches
  // First, group schedules by student
  const schedulesByStudent: { [studentId: string]: Array<{ courseSectionId: string }> } = {};
  schedulesToCreate.forEach(item => {
    if (!schedulesByStudent[item.studentId]) {
      schedulesByStudent[item.studentId] = [];
    }
    schedulesByStudent[item.studentId].push({ courseSectionId: item.courseSectionId });
  });

  // Create schedule records with their course sections
  const schedules = [];
  const studentIds = Object.keys(schedulesByStudent);

  for (let i = 0; i < studentIds.length; i += batchSize) {
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
