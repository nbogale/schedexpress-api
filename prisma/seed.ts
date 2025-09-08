import { PrismaClient, UserRole, ConflictType, RequestStatus, NotificationType, RotationDay, RelationshipType, ContactMethod, DigestFrequency } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {

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
    prisma.academicCycle.deleteMany(),
    prisma.academicCycleRule.deleteMany(),
    prisma.academicCycleConfig.deleteMany(),
    prisma.schedule.deleteMany(),
    prisma.coursePrerequisite.deleteMany(),
    prisma.courseSequence.deleteMany(),
    prisma.courseRule.deleteMany(),
    prisma.course.deleteMany(),
    prisma.student.deleteMany(),
    prisma.teacher.deleteMany(),
    prisma.timeBlock.deleteMany(),
    prisma.room.deleteMany(),
    prisma.gradeLevel.deleteMany(),
    prisma.courseLevel.deleteMany(),
    prisma.department.deleteMany(),
    prisma.term.deleteMany(),
    prisma.schoolYear.deleteMany(),
    prisma.userStatusHistory.deleteMany(),
    prisma.userAccountHistory.deleteMany(),
    prisma.userAccount.deleteMany(),
    prisma.user.deleteMany(),
    prisma.gradeLookup.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.notificationPreferences.deleteMany(),
    prisma.parentGuardian.deleteMany(),
  ]);

  // Create Users
  const users = await Promise.all([
    prisma.user.create({ data: { email: 'admin@schedexpress.com', passwordHash: await bcrypt.hash('Welcome2ES!', 10), role: UserRole.ADMIN, firstName: 'Admin', lastName: 'User', username: 'admin' } }),
    prisma.user.create({ data: { email: 'ashenafi.nebro@gmail.com', passwordHash: await bcrypt.hash('Welcome2ES!', 10), role: UserRole.COUNSELOR, firstName: 'Audra', lastName: 'Smith', username: 'asmith' } }),
    prisma.user.create({ data: { email: 'teacher1@schedexpress.com', passwordHash: await bcrypt.hash('Welcome2ES!', 10), role: UserRole.TEACHER, firstName: 'Brown', lastName: 'Johnson', username: 'bjohnson' } }),
    prisma.user.create({ data: { email: 'teacher2@schedexpress.com', passwordHash: await bcrypt.hash('Welcome2ES!', 10), role: UserRole.TEACHER, firstName: 'Ben', lastName: 'Williams', username: 'bwilliams' } }),
    prisma.user.create({ data: { email: 'teacher3@schedexpress.com', passwordHash: await bcrypt.hash('Welcome2ES!', 10), role: UserRole.TEACHER, firstName: 'Payal', lastName: 'Brown', username: 'pbrown' } }),
    prisma.user.create({ data: { email: 'teacher4@schedexpress.com', passwordHash: await bcrypt.hash('Welcome2ES!', 10), role: UserRole.TEACHER, firstName: 'Andrew', lastName: 'Davis', username: 'adavis' } }),
    prisma.user.create({ data: { email: 'teacher5@schedexpress.com', passwordHash: await bcrypt.hash('Welcome2ES!', 10), role: UserRole.TEACHER, firstName: 'Saba', lastName: 'Miller', username: 'smiller' } }),
    prisma.user.create({ data: { email: 'orbenafederalservices@gmail.com', passwordHash: await bcrypt.hash('Welcome2ES!', 10), role: UserRole.STUDENT, firstName: 'John', lastName: 'Smith', username: 'jsmith' } }),
    prisma.user.create({ data: { email: 'yirguit@gmail.com', passwordHash: await bcrypt.hash('Welcome2ES!', 10), role: UserRole.STUDENT, firstName: 'Emily', lastName: 'Johnson', username: 'ejohnson' } }),
    prisma.user.create({ data: { email: 'michael.williams@schedexpress.com', passwordHash: await bcrypt.hash('Welcome2ES!', 10), role: UserRole.STUDENT, firstName: 'Michael', lastName: 'Williams', username: 'mwilliams' } }),
    prisma.user.create({ data: { email: 'olivia.brown@schedexpress.com', passwordHash: await bcrypt.hash('Welcome2ES!', 10), role: UserRole.STUDENT, firstName: 'Olivia', lastName: 'Brown', username: 'obrown' } }),
    prisma.user.create({ data: { email: 'daniel.davis@schedexpress.com', passwordHash: await bcrypt.hash('Welcome2ES!', 10), role: UserRole.STUDENT, firstName: 'Daniel', lastName: 'Davis', username: 'ddavis' } }),   
    prisma.user.create({ data: { email: 'sophia.wilson@schedexpress.com', passwordHash: await bcrypt.hash('Welcome2ES!', 10), role: UserRole.STUDENT, firstName: 'Sophia', lastName: 'Wilson', username: 'swilson' } }),  
    prisma.user.create({ data: { email: 'james.taylor@schedexpress.com', passwordHash: await bcrypt.hash('Welcome2ES!', 10), role: UserRole.STUDENT, firstName: 'James', lastName: 'Taylor', username: 'jtaylor' } }),  
    prisma.user.create({ data: { email: 'ava.moore@schedexpress.com', passwordHash: await bcrypt.hash('Welcome2ES!', 10), role: UserRole.STUDENT, firstName: 'Ava', lastName: 'Moore', username: 'amoore' } }),  
    prisma.user.create({ data: { email: 'william.martin@schedexpress.com', passwordHash: await bcrypt.hash('Welcome2ES!', 10), role: UserRole.STUDENT, firstName: 'William', lastName: 'Martin', username: 'wmartin' } }),  
    prisma.user.create({ data: { email: 'isabella.harris@schedexpress.com', passwordHash: await bcrypt.hash('Welcome2ES!', 10), role: UserRole.STUDENT, firstName: 'Isabella', lastName: 'Harris', username: 'iharris' } }),  
    prisma.user.create({ data: { email: 'platformadmin@schedexpress.com', passwordHash: await bcrypt.hash('Welcome2ES!', 10), role: UserRole.PLATFORM_ADMIN, firstName: 'Cole', lastName: 'Jason', username: 'platformadmin' } }),  
    
    // Parent/Guardian Users
    prisma.user.create({ data: { email: 'michael.johnson@email.com', passwordHash: await bcrypt.hash('Welcome2ES!', 10), role: UserRole.PARENT_GUARDIAN, firstName: 'Michael', lastName: 'Johnson', username: 'mjohnson' } }),
    prisma.user.create({ data: { email: 'lisa.johnson@email.com', passwordHash: await bcrypt.hash('Welcome2ES!', 10), role: UserRole.PARENT_GUARDIAN, firstName: 'Lisa', lastName: 'Johnson', username: 'ljohnson' } }),
    prisma.user.create({ data: { email: 'robert.smith@email.com', passwordHash: await bcrypt.hash('Welcome2ES!', 10), role: UserRole.PARENT_GUARDIAN, firstName: 'Robert', lastName: 'Smith', username: 'rsmith' } }),
    prisma.user.create({ data: { email: 'maria.garcia@email.com', passwordHash: await bcrypt.hash('Welcome2ES!', 10), role: UserRole.PARENT_GUARDIAN, firstName: 'Maria', lastName: 'Garcia', username: 'mgarcia' } }),
    prisma.user.create({ data: { email: 'james.brown@email.com', passwordHash: await bcrypt.hash('Welcome2ES!', 10), role: UserRole.PARENT_GUARDIAN, firstName: 'James', lastName: 'Brown', username: 'jbrown' } }),
    prisma.user.create({ data: { email: 'dorothy.brown@email.com', passwordHash: await bcrypt.hash('Welcome2ES!', 10), role: UserRole.PARENT_GUARDIAN, firstName: 'Dorothy', lastName: 'Brown', username: 'dbrown' } }),
    prisma.user.create({ data: { email: 'jennifer.davis@email.com', passwordHash: await bcrypt.hash('Welcome2ES!', 10), role: UserRole.PARENT_GUARDIAN, firstName: 'Jennifer', lastName: 'Davis', username: 'jdavis' } }),
    prisma.user.create({ data: { email: 'mark.wilson@email.com', passwordHash: await bcrypt.hash('Welcome2ES!', 10), role: UserRole.PARENT_GUARDIAN, firstName: 'Mark', lastName: 'Wilson', username: 'mwilson' } }),

  ]);

  // Create School Years
  const schoolYears = await Promise.all([
    prisma.schoolYear.create({ data: { name: '2023-2024', startDate: new Date('2023-08-15'), endDate: new Date('2024-06-10'), isCurrent: false } }),
    prisma.schoolYear.create({ data: { name: '2024-2025', startDate: new Date('2024-08-14'), endDate: new Date('2025-06-09'), isCurrent: false } }),
    prisma.schoolYear.create({ data: { name: '2025-2026', startDate: new Date('2025-08-13'), endDate: new Date('2026-06-08'), isCurrent: true } }),
  ]);

  // Create Terms
  const terms = await Promise.all([
    prisma.term.create({ data: { schoolYearId: schoolYears[0].id, name: 'Fall Semester 2023', startDate: new Date('2023-08-15'), endDate: new Date('2023-12-20'), isCurrent: false } }),
    prisma.term.create({ data: { schoolYearId: schoolYears[0].id, name: 'Spring Semester 2024', startDate: new Date('2024-01-05'), endDate: new Date('2024-06-10'), isCurrent: false } }),
    prisma.term.create({ data: { schoolYearId: schoolYears[1].id, name: 'Fall Semester 2024', startDate: new Date('2024-08-14'), endDate: new Date('2024-12-19'), isCurrent: false } }),
    prisma.term.create({ data: { schoolYearId: schoolYears[1].id, name: 'Spring Semester 2025', startDate: new Date('2025-01-06'), endDate: new Date('2025-06-09'), isCurrent: false } }),
    prisma.term.create({ data: { schoolYearId: schoolYears[2].id, name: 'Fall Semester 2025', startDate: new Date('2025-08-14'), endDate: new Date('2025-12-19'), isCurrent: true } }),
    prisma.term.create({ data: { schoolYearId: schoolYears[2].id, name: 'Spring Semester 2026', startDate: new Date('2026-01-06'), endDate: new Date('2026-06-09'), isCurrent: false } }),
  ]);

  // Create Departments
  const departments = await Promise.all([
    prisma.department.create({ data: { name: 'Mathematics', code: 'MATH', description: 'Mathematics Department' } }),
    prisma.department.create({ data: { name: 'English/Language Arts', code: 'ENG', description: 'English/Language Arts Department' } }),
    prisma.department.create({ data: { name: 'Science', code: 'SCI', description: 'Science Department' } }),
    prisma.department.create({ data: { name: 'Social Studies', code: 'SOC', description: 'Social Studies Department' } }),
    prisma.department.create({ data: { name: 'Art and Design', code: 'ART', description: 'Art and Design Department' } }),
    prisma.department.create({ data: { name: 'Physical Education', code: 'PE', description: 'Physical Education Department' } }),
    prisma.department.create({ data: { name: 'Foreign Language', code: 'LANG', description: 'Foreign Language Department' } }),
    prisma.department.create({ data: { name: 'Music', code: 'MUSIC', description: 'Music Department' } }),
    prisma.department.create({ data: { name: 'Technology', code: 'TECH', description: 'Technology Department' } }),
    prisma.department.create({ data: { name: 'Health', code: 'HEALTH', description: 'Health Department' } }),
    prisma.department.create({ data: { name: 'Business', code: 'BUS', description: 'Business Department' } })
  ]);

  // Create Course Levels
  const courseLevels = await Promise.all([
    prisma.courseLevel.create({ data: { name: 'Regular', rank: 1 } }),
    prisma.courseLevel.create({ data: { name: 'Advanced', rank: 2 } }),
    prisma.courseLevel.create({ data: { name: 'Honors', rank: 3 } }),
    prisma.courseLevel.create({ data: { name: 'AP', rank: 4 } }),
    prisma.courseLevel.create({ data: { name: 'Dual Enrollment', rank: 5 } }),
  ]);

  // Create Grade Levels
  const gradeLevels = await Promise.all([
    prisma.gradeLevel.create({ data: { name: '6th Grade', level: 6 } }),
    prisma.gradeLevel.create({ data: { name: '7th Grade', level: 7 } }),
    prisma.gradeLevel.create({ data: { name: '8th Grade', level: 8 } }),
    prisma.gradeLevel.create({ data: { name: '9th Grade (Freshman)', level: 9 } }),
    prisma.gradeLevel.create({ data: { name: '10th Grade (Sophomore)', level: 10 } }),
  ]);

  // Create Rooms
  const rooms = await Promise.all([
    prisma.room.create({ data: { name: '101', capacity: 30 } }),
    prisma.room.create({ data: { name: '102', capacity: 30 } }),
    prisma.room.create({ data: { name: '103', capacity: 30 } }),
    prisma.room.create({ data: { name: '104', capacity: 30 } }),
    prisma.room.create({ data: { name: '105', capacity: 30 } }),
    prisma.room.create({ data: { name: '201', capacity: 30 } }),
    prisma.room.create({ data: { name: '202', capacity: 30 } }),
    prisma.room.create({ data: { name: '203', capacity: 30 } }),
    prisma.room.create({ data: { name: '204', capacity: 30 } }),
    prisma.room.create({ data: { name: '205', capacity: 30 } }),
    prisma.room.create({ data: { name: 'Gym', capacity: 100 } }),
    prisma.room.create({ data: { name: 'Auditorium', capacity: 200 } }),
    prisma.room.create({ data: { name: 'Lab', capacity: 20 } }),
    prisma.room.create({ data: { name: 'Art Room', capacity: 25 } }),
    prisma.room.create({ data: { name: 'Music Room', capacity: 30 } }),
    prisma.room.create({ data: { name: 'Cafeteria', capacity: 150 } }),
    prisma.room.create({ data: { name: 'Library', capacity: 50 } }),
    prisma.room.create({ data: { name: 'Computer Lab', capacity: 30 } }),
    prisma.room.create({ data: { name: 'Science Lab', capacity: 20 } }),
    prisma.room.create({ data: { name: 'Language Lab', capacity: 20 } }),
    prisma.room.create({ data: { name: 'Health Room', capacity: 10 } }),
    prisma.room.create({ data: { name: 'Business Lab', capacity: 20 } }),

  ]);

  // Create Time Blocks
  // Create TimeBlocks for A_DAY and B_DAY rotation with 90-minute periods
  const timeBlocks = await Promise.all([
    // A_DAY TimeBlocks
    prisma.timeBlock.create({ 
      data: { 
        name: 'Period 1', 
        startTime: new Date('2024-01-01T08:10:00'), 
        endTime: new Date('2024-01-01T09:40:00'),
        blockNumber: 1,
        rotationDay: 'A_DAY'
      } 
    }),
    prisma.timeBlock.create({ 
      data: { 
        name: 'Period 2', 
        startTime: new Date('2024-01-01T09:50:00'), 
        endTime: new Date('2024-01-01T11:20:00'),
        blockNumber: 2,
        rotationDay: 'A_DAY'
      } 
    }),
    prisma.timeBlock.create({ 
      data: { 
        name: 'Period 3', 
        startTime: new Date('2024-01-01T11:30:00'), 
        endTime: new Date('2024-01-01T13:00:00'),
        blockNumber: 3,
        rotationDay: 'A_DAY'
      } 
    }),
    prisma.timeBlock.create({ 
      data: { 
        name: 'Period 4', 
        startTime: new Date('2024-01-01T13:10:00'), 
        endTime: new Date('2024-01-01T14:40:00'),
        blockNumber: 4,
        rotationDay: 'A_DAY'
      } 
    }),
    prisma.timeBlock.create({ 
      data: { 
        name: 'Period 5', 
        startTime: new Date('2024-01-01T14:50:00'), 
        endTime: new Date('2024-01-01T16:20:00'),
        blockNumber: 5,
        rotationDay: 'A_DAY'
      } 
    }),
    
    // B_DAY TimeBlocks
    prisma.timeBlock.create({ 
      data: { 
        name: 'Period 1', 
        startTime: new Date('2024-01-01T08:10:00'), 
        endTime: new Date('2024-01-01T09:40:00'),
        blockNumber: 1,
        rotationDay: 'B_DAY'
      } 
    }),
    prisma.timeBlock.create({ 
      data: { 
        name: 'Period 2', 
        startTime: new Date('2024-01-01T09:50:00'), 
        endTime: new Date('2024-01-01T11:20:00'),
        blockNumber: 2,
        rotationDay: 'B_DAY'
      } 
    }),
    prisma.timeBlock.create({ 
      data: { 
        name: 'Period 3', 
        startTime: new Date('2024-01-01T11:30:00'), 
        endTime: new Date('2024-01-01T13:00:00'),
        blockNumber: 3,
        rotationDay: 'B_DAY'
      } 
    }),
    prisma.timeBlock.create({ 
      data: { 
        name: 'Period 4', 
        startTime: new Date('2024-01-01T13:10:00'), 
        endTime: new Date('2024-01-01T14:40:00'),
        blockNumber: 4,
        rotationDay: 'B_DAY'
      } 
    }),
    prisma.timeBlock.create({ 
      data: { 
        name: 'Period 5', 
        startTime: new Date('2024-01-01T14:50:00'), 
        endTime: new Date('2024-01-01T16:20:00'),
        blockNumber: 5,
        rotationDay: 'B_DAY'
      } 
    }),
  ]);

  // Create Teachers
  const teachers = await Promise.all([
    prisma.teacher.create({ data: {userId: users[2].id, name: 'Teacher Johnson', email: 'teacher1@edu.edu', departmentId: departments[0].id, maxCourses: 6 } }),
    prisma.teacher.create({ data: {userId: users[3].id, name: 'Teacher Williams', email: 'teacher2@edu.edu',departmentId: departments[1].id, maxCourses: 6 } }),
    prisma.teacher.create({ data: {userId: users[4].id, name: 'Teacher Brown', email: 'teacher3@edu.edu', departmentId: departments[2].id, maxCourses: 6 } }),
    prisma.teacher.create({ data: {userId: users[5].id, name: 'Teacher Davis', email: 'teacher4@edu.edu', departmentId: departments[3].id, maxCourses: 6 } }),
    prisma.teacher.create({ data: {userId: users[6].id, name: 'Teacher Miller', email: 'teacher5@edu.edu', departmentId: departments[4].id, maxCourses: 6 } }),
  ]);

  // Create Students
  const students = await Promise.all([
    prisma.student.create({ data: { userId: users[7].id, studentId: 'S100001', gradeLevelId: gradeLevels[3].id, graduationYear: 2028, hasIep: false, isDualEnrollment: false, isCollegeBound: true, isCreditRecovery: false, maxCreditsPerTerm: 8.0 } }),
    prisma.student.create({ data: { userId: users[8].id, studentId: 'S100002', gradeLevelId: gradeLevels[4].id, graduationYear: 2027, hasIep: false, isDualEnrollment: false, isCollegeBound: true, isCreditRecovery: false, maxCreditsPerTerm: 8.0 } }),
    prisma.student.create({ data: { userId: users[9].id, studentId: 'S100003', gradeLevelId: gradeLevels[4].id, graduationYear: 2027, hasIep: true, isDualEnrollment: false, isCollegeBound: true, isCreditRecovery: false, maxCreditsPerTerm: 7.0 } }),
    prisma.student.create({ data: { userId: users[10].id, studentId: 'S100004', gradeLevelId: gradeLevels[4].id, graduationYear: 2027, hasIep: false, isDualEnrollment: false, isCollegeBound: true, isCreditRecovery: false, maxCreditsPerTerm: 8.0 } }),  
    prisma.student.create({ data: { userId: users[11].id, studentId: 'S100005', gradeLevelId: gradeLevels[4].id, graduationYear: 2027, hasIep: false, isDualEnrollment: false, isCollegeBound: true, isCreditRecovery: false, maxCreditsPerTerm: 8.0 } }),  
    prisma.student.create({ data: { userId: users[12].id, studentId: 'S100006', gradeLevelId: gradeLevels[4].id, graduationYear: 2027, hasIep: false, isDualEnrollment: false, isCollegeBound: true, isCreditRecovery: false, maxCreditsPerTerm: 8.0 } }),  
    prisma.student.create({ data: { userId: users[13].id, studentId: 'S100007', gradeLevelId: gradeLevels[4].id, graduationYear: 2027, hasIep: false, isDualEnrollment: false, isCollegeBound: true, isCreditRecovery: false, maxCreditsPerTerm: 8.0 } }),  
    prisma.student.create({ data: { userId: users[14].id, studentId: 'S100008', gradeLevelId: gradeLevels[4].id, graduationYear: 2027, hasIep: false, isDualEnrollment: false, isCollegeBound: true, isCreditRecovery: false, maxCreditsPerTerm: 8.0 } }),  
    prisma.student.create({ data: { userId: users[15].id, studentId: 'S100009', gradeLevelId: gradeLevels[4].id, graduationYear: 2027, hasIep: false, isDualEnrollment: false, isCollegeBound: true, isCreditRecovery: false, maxCreditsPerTerm: 8.0 } }),  
    prisma.student.create({ data: { userId: users[16].id, studentId: 'S100010', gradeLevelId: gradeLevels[4].id, graduationYear: 2027, hasIep: false, isDualEnrollment: false, isCollegeBound: true, isCreditRecovery: false, maxCreditsPerTerm: 8.0 } }),  
  ]);

  // Create Courses
  const courses = await Promise.all([
    // Mathematics Courses
    prisma.course.create({ data: { code: 'MATH101', name: 'Algebra 1', description: 'Introduction to algebraic concepts', departmentId: departments[0].id, credits: 1.0, courseLevelId: courseLevels[0].id, minGradeLevelId: gradeLevels[3].id, isElective: false, isCore: true } }),
    prisma.course.create({ data: { code: 'MATH201', name: 'Geometry', description: 'Study of shapes and spatial relationships', departmentId: departments[0].id, credits: 1.0, courseLevelId: courseLevels[0].id, minGradeLevelId: gradeLevels[3].id, isElective: false, isCore: true } }),
    prisma.course.create({ data: { code: 'MATH301', name: 'Algebra 2', description: 'Advanced algebraic concepts', departmentId: departments[0].id, credits: 1.0, courseLevelId: courseLevels[0].id, minGradeLevelId: gradeLevels[4].id, isElective: false, isCore: true } }),
    prisma.course.create({ data: { code: 'MATH401', name: 'Pre-Calculus', description: 'Preparation for calculus', departmentId: departments[0].id, credits: 1.0, courseLevelId: courseLevels[0].id, minGradeLevelId: gradeLevels[4].id, isElective: false, isCore: true } }),
    prisma.course.create({ data: { code: 'MATH501', name: 'Calculus', description: 'Introduction to calculus concepts', departmentId: departments[0].id, credits: 1.0, courseLevelId: courseLevels[0].id, minGradeLevelId: gradeLevels[4].id, isElective: false, isCore: true } }),
    prisma.course.create({ data: { code: 'MATH601', name: 'Statistics', description: 'Introduction to statistics and data analysis', departmentId: departments[0].id, credits: 1.0, courseLevelId: courseLevels[0].id, minGradeLevelId: gradeLevels[4].id, isElective: false, isCore: true } }),
    prisma.course.create({ data: { code: 'MATH701', name: 'Discrete Mathematics', description: 'Study of mathematical structures that are fundamentally discrete', departmentId: departments[0].id, credits: 1.0, courseLevelId: courseLevels[0].id, minGradeLevelId: gradeLevels[4].id, isElective: false, isCore: true } }),
    prisma.course.create({ data: { code: 'MATH801', name: 'Linear Algebra', description: 'Study of vector spaces and linear transformations', departmentId: departments[0].id, credits: 1.0, courseLevelId: courseLevels[0].id, minGradeLevelId: gradeLevels[4].id, isElective: false, isCore: true } }),
    prisma.course.create({ data: { code: 'MATH901', name: 'Calculus 2', description: 'Continuation of Calculus 1', departmentId: departments[0].id, credits: 1.0, courseLevelId: courseLevels[0].id, minGradeLevelId: gradeLevels[4].id, isElective: false, isCore: true } }),
    // English Courses
    prisma.course.create({ data: { code: 'ENG101', name: 'English 1', description: 'Introduction to literature and writing', departmentId: departments[1].id, credits: 1.0, courseLevelId: courseLevels[0].id, minGradeLevelId: gradeLevels[3].id, isElective: false, isCore: true } }),
    prisma.course.create({ data: { code: 'ENG201', name: 'English 2', description: 'Advanced literature and writing', departmentId: departments[1].id, credits: 1.0, courseLevelId: courseLevels[0].id, minGradeLevelId: gradeLevels[4].id, isElective: false, isCore: true } }),
    prisma.course.create({ data: { code: 'ENG301', name: 'Creative Writing', description: 'Introduction to creative writing techniques', departmentId: departments[1].id, credits: 1.0, courseLevelId: courseLevels[0].id, minGradeLevelId: gradeLevels[3].id, isElective: true, isCore: false } }),
    prisma.course.create({ data: { code: 'ENG401', name: 'Literature Analysis', description: 'In-depth analysis of literary works', departmentId: departments[1].id, credits: 1.0, courseLevelId: courseLevels[0].id, minGradeLevelId: gradeLevels[4].id, isElective: true, isCore: false } }),
    prisma.course.create({ data: { code: 'ENG501', name: 'Public Speaking', description: 'Introduction to public speaking techniques', departmentId: departments[1].id, credits: 1.0, courseLevelId: courseLevels[0].id, minGradeLevelId: gradeLevels[3].id, isElective: true, isCore: false } }),
    prisma.course.create({ data: { code: 'ENG601', name: 'Journalism', description: 'Introduction to journalism and reporting', departmentId: departments[1].id, credits: 1.0, courseLevelId: courseLevels[0].id, minGradeLevelId: gradeLevels[3].id, isElective: true, isCore: false } }),
    prisma.course.create({ data: { code: 'ENG701', name: 'Debate', description: 'Introduction to debate techniques', departmentId: departments[1].id, credits: 1.0, courseLevelId: courseLevels[0].id, minGradeLevelId: gradeLevels[3].id, isElective: true, isCore: false } }),
    prisma.course.create({ data: { code: 'ENG801', name: 'World Literature', description: 'Study of world literature', departmentId: departments[1].id, credits: 1.0, courseLevelId: courseLevels[0].id, minGradeLevelId: gradeLevels[4].id, isElective: true, isCore: false } }),
    prisma.course.create({ data: { code: 'ENG901', name: 'American Literature', description: 'Study of American literature', departmentId: departments[1].id, credits: 1.0, courseLevelId: courseLevels[0].id, minGradeLevelId: gradeLevels[4].id, isElective: true, isCore: false } }),
    // Science Courses 18
    prisma.course.create({ data: { code: 'SCI101', name: 'Biology', description: 'Study of living organisms', departmentId: departments[2].id, credits: 1.0, courseLevelId: courseLevels[0].id, minGradeLevelId: gradeLevels[3].id, isElective: false, isCore: true } }),
    prisma.course.create({ data: { code: 'SCI201', name: 'Chemistry', description: 'Study of matter and its interactions', departmentId: departments[2].id, credits: 1.0, courseLevelId: courseLevels[0].id, minGradeLevelId: gradeLevels[4].id, isElective: false, isCore: true } }),
    prisma.course.create({ data: { code: 'SCI301', name: 'Physics', description: 'Study of matter and energy', departmentId: departments[2].id, credits: 1.0, courseLevelId: courseLevels[0].id, minGradeLevelId: gradeLevels[4].id, isElective: false, isCore: true } }),
    prisma.course.create({ data: { code: 'SCI401', name: 'Environmental Science', description: 'Study of the environment and ecosystems', departmentId: departments[2].id, credits: 1.0, courseLevelId: courseLevels[0].id, minGradeLevelId: gradeLevels[3].id, isElective: true, isCore: false } }),
    // Social Studies Courses
    prisma.course.create({ data: { code: 'SS101', name: 'World History', description: 'Study of global history', departmentId: departments[3].id, credits: 1.0, courseLevelId: courseLevels[0].id, minGradeLevelId: gradeLevels[3].id, isElective: false, isCore: true } }),
    prisma.course.create({ data: { code: 'SS201', name: 'US History', description: 'Study of American history', departmentId: departments[3].id, credits: 1.0, courseLevelId: courseLevels[0].id, minGradeLevelId: gradeLevels[4].id, isElective: false, isCore: true } }),
    // Art Courses
    prisma.course.create({ data: { code: 'ART101', name: 'Art History', description: 'Study of art movements and styles', departmentId: departments[4].id, credits: 1.0, courseLevelId: courseLevels[0].id, minGradeLevelId: gradeLevels[3].id, isElective: true, isCore: false } }),
    prisma.course.create({ data: { code: 'ART201', name: 'Painting', description: 'Introduction to painting techniques', departmentId: departments[4].id, credits: 1.0, courseLevelId: courseLevels[0].id, minGradeLevelId: gradeLevels[3].id, isElective: true, isCore: false } }),
    // Physical Education Courses
    prisma.course.create({ data: { code: 'PE101', name: 'Physical Education 1', description: 'Introduction to physical fitness', departmentId: departments[5].id, credits: 0.5, courseLevelId: courseLevels[0].id, minGradeLevelId: gradeLevels[3].id, isElective: false, isCore: true } }),
    prisma.course.create({ data: { code: 'PE201', name: 'Physical Education 2', description: 'Advanced physical fitness', departmentId: departments[5].id, credits: 0.5, courseLevelId: courseLevels[0].id, minGradeLevelId: gradeLevels[4].id, isElective: false, isCore: true } }),
    // Foreign Language Courses
    prisma.course.create({ data: { code: 'FL101', name: 'Spanish 1', description: 'Introduction to Spanish language', departmentId: departments[6].id, credits: 1.0, courseLevelId: courseLevels[0].id, minGradeLevelId: gradeLevels[3].id, isElective: true, isCore: false } }),
    prisma.course.create({ data: { code: 'FL201', name: 'Spanish 2', description: 'Advanced Spanish language', departmentId: departments[6].id, credits: 1.0, courseLevelId: courseLevels[0].id, minGradeLevelId: gradeLevels[4].id, isElective: true, isCore: false } }),
    // Music Courses 30
    prisma.course.create({ data: { code: 'MUS101', name: 'Music Theory', description: 'Introduction to music theory', departmentId: departments[7].id, credits: 1.0, courseLevelId: courseLevels[0].id, minGradeLevelId: gradeLevels[3].id, isElective: true, isCore: false } }),
    prisma.course.create({ data: { code: 'MUS201', name: 'Band', description: 'Introduction to band instruments', departmentId: departments[7].id, credits: 1.0, courseLevelId: courseLevels[0].id, minGradeLevelId: gradeLevels[3].id, isElective: true, isCore: false } }),
    // Technology Courses
    prisma.course.create({ data: { code: 'TECH101', name: 'Introduction to Computer Science', description: 'Basics of computer programming', departmentId: departments[8].id, credits: 1.0, courseLevelId: courseLevels[0].id, minGradeLevelId: gradeLevels[3].id, isElective: true, isCore: false } }),
    prisma.course.create({ data: { code: 'TECH201', name: 'Web Development', description: 'Basics of web development', departmentId: departments[8].id, credits: 1.0, courseLevelId: courseLevels[0].id, minGradeLevelId: gradeLevels[4].id, isElective: true, isCore: false } }),
    // Health Courses
    prisma.course.create({ data: { code: 'HEALTH101', name: 'Health Education', description: 'Basics of health and wellness', departmentId: departments[9].id, credits: 0.5, courseLevelId: courseLevels[0].id, minGradeLevelId: gradeLevels[3].id, isElective: false, isCore: true } }),
    prisma.course.create({ data: { code: 'HEALTH201', name: 'Nutrition', description: 'Basics of nutrition and diet', departmentId: departments[9].id, credits: 0.5, courseLevelId: courseLevels[0].id, minGradeLevelId: gradeLevels[4].id, isElective: false, isCore: true } }),
  ]);

  // Create Course Prerequisites
  const prerequisiteCourses = await Promise.all([
    prisma.coursePrerequisite.create({ data: { courseId: courses[1].id, prerequisiteCourseId: courses[0].id } }),
    prisma.coursePrerequisite.create({ data: { courseId: courses[2].id, prerequisiteCourseId: courses[1].id } }),
    prisma.coursePrerequisite.create({ data: { courseId: courses[3].id, prerequisiteCourseId: courses[0].id } }),
    prisma.coursePrerequisite.create({ data: { courseId: courses[4].id, prerequisiteCourseId: courses[3].id } }),
    prisma.coursePrerequisite.create({ data: { courseId: courses[5].id, prerequisiteCourseId: courses[3].id } }),
    prisma.coursePrerequisite.create({ data: { courseId: courses[6].id, prerequisiteCourseId: courses[5].id } }),
    prisma.coursePrerequisite.create({ data: { courseId: courses[7].id, prerequisiteCourseId: courses[6].id } }),
    prisma.coursePrerequisite.create({ data: { courseId: courses[8].id, prerequisiteCourseId: courses[7].id } }),
    prisma.coursePrerequisite.create({ data: { courseId: courses[10].id, prerequisiteCourseId: courses[9].id } }),
  ]);

  // Create math Course Sequences
  await Promise.all([
    prisma.courseSequence.create({ data: { departmentId: departments[0].id, courseId: courses[0].id, sequenceOrder: 1 } }),
    prisma.courseSequence.create({ data: { departmentId: departments[0].id, courseId: courses[1].id, sequenceOrder: 2 } }),
    prisma.courseSequence.create({ data: { departmentId: departments[0].id, courseId: courses[2].id, sequenceOrder: 3 } }),
    prisma.courseSequence.create({ data: { departmentId: departments[0].id, courseId: courses[3].id, sequenceOrder: 4 } }),
    prisma.courseSequence.create({ data: { departmentId: departments[0].id, courseId: courses[4].id, sequenceOrder: 5 } }),
    prisma.courseSequence.create({ data: { departmentId: departments[0].id, courseId: courses[5].id, sequenceOrder: 6 } }),
    prisma.courseSequence.create({ data: { departmentId: departments[0].id, courseId: courses[6].id, sequenceOrder: 7 } }),
  ]);

  // crete english Course Sequences
  await Promise.all([
    prisma.courseSequence.create({ data: { departmentId: departments[1].id, courseId: courses[10].id, sequenceOrder: 1 } }),
    prisma.courseSequence.create({ data: { departmentId: departments[1].id, courseId: courses[11].id, sequenceOrder: 2 } }),
    prisma.courseSequence.create({ data: { departmentId: departments[1].id, courseId: courses[12].id, sequenceOrder: 3 } }),
    prisma.courseSequence.create({ data: { departmentId: departments[1].id, courseId: courses[13].id, sequenceOrder: 4 } }),
    prisma.courseSequence.create({ data: { departmentId: departments[1].id, courseId: courses[14].id, sequenceOrder: 5 } }),
    prisma.courseSequence.create({ data: { departmentId: departments[1].id, courseId: courses[15].id, sequenceOrder: 6 } }),
    prisma.courseSequence.create({ data: { departmentId: departments[1].id, courseId: courses[16].id, sequenceOrder: 7 } }),
    prisma.courseSequence.create({ data: { departmentId: departments[1].id, courseId: courses[17].id, sequenceOrder: 8 } }),
  ]);

    // crete science Course Sequences
  await Promise.all([
    prisma.courseSequence.create({ data: { departmentId: departments[2].id, courseId: courses[18].id, sequenceOrder: 1 } }),
    prisma.courseSequence.create({ data: { departmentId: departments[2].id, courseId: courses[19].id, sequenceOrder: 2 } }),
    prisma.courseSequence.create({ data: { departmentId: departments[2].id, courseId: courses[20].id, sequenceOrder: 3 } }),
  ]);


  // Create System Settings
  await Promise.all([
    prisma.systemSetting.create({ data: { key: 'MAX_COURSES_PER_STUDENT', value: '8', description: 'Maximum number of courses a student can enroll in per term' } }),
    prisma.systemSetting.create({ data: { key: 'MIN_COURSES_PER_STUDENT', value: '6', description: 'Minimum number of courses a student must enroll in per term' } }),
  ]);

  // Create for Notifications
  await Promise.all([
    prisma.notification.create({ data: { studentId: students[0].id, userId: users[7].id, message: 'Your schedule change request has been created for Math', type: NotificationType.REQUEST_UPDATE } }),
  ]);

  // Create Grade Lookup
  await Promise.all([
    prisma.gradeLookup.create({ data: { grade: 'A', gradePoints: 4.0, description: 'Excellent', isPassing: true } }),
    prisma.gradeLookup.create({ data: { grade: 'A-', gradePoints: 3.7, description: 'Excellent', isPassing: true } }),
    prisma.gradeLookup.create({ data: { grade: 'B+', gradePoints: 3.3, description: 'Good', isPassing: true } }),
    prisma.gradeLookup.create({ data: { grade: 'B', gradePoints: 3.0, description: 'Good', isPassing: true } }),
    prisma.gradeLookup.create({ data: { grade: 'B-', gradePoints: 2.7, description: 'Good', isPassing: true } }),
    prisma.gradeLookup.create({ data: { grade: 'C+', gradePoints: 2.3, description: 'Satisfactory', isPassing: true } }),
    prisma.gradeLookup.create({ data: { grade: 'C', gradePoints: 2.0, description: 'Satisfactory', isPassing: true } }),
    prisma.gradeLookup.create({ data: { grade: 'C-', gradePoints: 1.7, description: 'Satisfactory', isPassing: true } }),
    prisma.gradeLookup.create({ data: { grade: 'D+', gradePoints: 1.3, description: 'Poor', isPassing: true } }),
    prisma.gradeLookup.create({ data: { grade: 'D', gradePoints: 1.0, description: 'Poor', isPassing: true } }),
    prisma.gradeLookup.create({ data: { grade: 'D-', gradePoints: 0.7, description: 'Poor', isPassing: true } }),
    prisma.gradeLookup.create({ data: { grade: 'F', gradePoints: 0.0, description: 'Failing', isPassing: false } }),
    prisma.gradeLookup.create({ data: { grade: 'P', gradePoints: 0.0, description: 'Pass', isPassing: true } }),
    prisma.gradeLookup.create({ data: { grade: 'NP', gradePoints: 0.0, description: 'No Pass', isPassing: false } }),
    prisma.gradeLookup.create({ data: { grade: 'I', gradePoints: 0.0, description: 'Incomplete', isPassing: false } }),
    prisma.gradeLookup.create({ data: { grade: 'W', gradePoints: 0.0, description: 'Withdrawal', isPassing: false } }),
  ]);

  // Create Student Course History
  await Promise.all([
    prisma.studentCourseHistory.create({ data: { studentId: students[1].id, courseId: courses[22].id, schoolYearId: schoolYears[0].id, termId: terms[0].id, grade: 'A', isPassed: true, creditEarned: 1.0 } }),
    prisma.studentCourseHistory.create({ data: { studentId: students[1].id, courseId: courses[28].id, schoolYearId: schoolYears[0].id, termId: terms[0].id, grade: 'B', isPassed: true, creditEarned: 1.0 } }),
    prisma.studentCourseHistory.create({ data: { studentId: students[1].id, courseId: courses[19].id, schoolYearId: schoolYears[0].id, termId: terms[0].id, grade: 'A', isPassed: true, creditEarned: 1.0 } }),
    prisma.studentCourseHistory.create({ data: { studentId: students[1].id, courseId: courses[29].id, schoolYearId: schoolYears[0].id, termId: terms[0].id, grade: 'B', isPassed: true, creditEarned: 1.0 } }),

  ]);

  // Create Academic Cycle Configuration
  const academicCycleConfig = await prisma.academicCycleConfig.create({
    data: {
      name: 'Standard Configuration',
      description: 'Standard academic cycle configuration with 2 semesters and 4 quarters for a school year',
      isActive: true,
      isDefault: true,
      hasSemesters: true,
      hasQuarters: true,
      hasTrimesters: false,
      hasSessions: false,
      enforceStructure: true,
      allowCustomCycles: false,
      requireValidation: true,
      createdBy: users[17].id, // Platform Admin
    }
  });

  // Create Academic Cycle Rules
  const academicCycleRules = await Promise.all([
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
        allowOverlap: false,
      }
    }),
    // Semester Rules
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
        allowOverlap: false,
      }
    }),
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
        allowOverlap: false,
      }
    }),
    // Quarter Rules
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
        allowOverlap: false,
      }
    }),
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
        allowOverlap: false,
      }
    }),
  ]);

  // Create Academic Cycles for 2025-2026
  const academicCycles = await Promise.all([
    // School Year
    prisma.academicCycle.create({
      data: {
        name: '2025-2026 School Year',
        cycleType: 'SCHOOL_YEAR',
        cycleNumber: null,
        startDate: new Date('2025-08-13'),
        endDate: new Date('2026-06-08'),
        isCurrent: true,
        isActive: true,
        isValidated: true,
        validatedBy: users[17].id, // Platform Admin
        validatedAt: new Date(),
        validationNotes: 'Standard school year configuration',
        description: 'Academic year 2025-2026 with two semesters and four quarters',
        configId: academicCycleConfig.id,
      }
    }),
  ]);

  const schoolYear = academicCycles[0];

  // Create Semesters
  const semesters = await Promise.all([
    prisma.academicCycle.create({
      data: {
        name: 'Fall Semester 2025-2026',
        cycleType: 'SEMESTER',
        cycleNumber: 1,
        startDate: new Date('2025-08-13'),
        endDate: new Date('2025-12-19'),
        isCurrent: true,
        isActive: true,
        isValidated: true,
        validatedBy: users[17].id,
        validatedAt: new Date(),
        validationNotes: 'Fall semester validated',
        description: 'First semester of the 2025-2026 academic year',
        parentId: schoolYear.id,
        configId: academicCycleConfig.id,
      }
    }),
    prisma.academicCycle.create({
      data: {
        name: 'Spring Semester 2025-2026',
        cycleType: 'SEMESTER',
        cycleNumber: 2,
        startDate: new Date('2026-01-06'),
        endDate: new Date('2026-06-08'),
        isCurrent: false,
        isActive: true,
        isValidated: false,
        description: 'Second semester of the 2025-2026 academic year',
        parentId: schoolYear.id,
        configId: academicCycleConfig.id,
      }
    }),
  ]);

  // Create Quarters
  const quarters = await Promise.all([
    // Fall Semester Quarters
    prisma.academicCycle.create({
      data: {
        name: 'First Quarter 2025-2026',
        cycleType: 'QUARTER',
        cycleNumber: 1,
        startDate: new Date('2025-08-13'),
        endDate: new Date('2025-10-17'),
        isCurrent: true,
        isActive: true,
        isValidated: true,
        validatedBy: users[17].id,
        validatedAt: new Date(),
        validationNotes: 'First quarter validated',
        description: 'First quarter of the fall semester',
        parentId: semesters[0].id,
        configId: academicCycleConfig.id,
      }
    }),
    prisma.academicCycle.create({
      data: {
        name: 'Second Quarter 2025-2026',
        cycleType: 'QUARTER',
        cycleNumber: 2,
        startDate: new Date('2025-10-20'),
        endDate: new Date('2025-12-19'),
        isCurrent: false,
        isActive: true,
        isValidated: false,
        description: 'Second quarter of the fall semester',
        parentId: semesters[0].id,
        configId: academicCycleConfig.id,
      }
    }),
    // Spring Semester Quarters
    prisma.academicCycle.create({
      data: {
        name: 'Third Quarter 2025-2026',
        cycleType: 'QUARTER',
        cycleNumber: 3,
        startDate: new Date('2026-01-06'),
        endDate: new Date('2026-03-14'),
        isCurrent: false,
        isActive: true,
        isValidated: false,
        description: 'First quarter of the spring semester',
        parentId: semesters[1].id,
        configId: academicCycleConfig.id,
      }
    }),
    prisma.academicCycle.create({
      data: {
        name: 'Fourth Quarter 2025-2026',
        cycleType: 'QUARTER',
        cycleNumber: 4,
        startDate: new Date('2026-03-17'),
        endDate: new Date('2026-06-08'),
        isCurrent: false,
        isActive: true,
        isValidated: false,
        description: 'Second quarter of the spring semester',
        parentId: semesters[1].id,
        configId: academicCycleConfig.id,
      }
    }),
  ]);

  // Create Course Sections
  const sections = await Promise.all([
    prisma.courseSection.create({ data: { courseId: courses[0].id, sectionNumber: 'A', academicCycleId: schoolYear.id, timeBlockId: timeBlocks[0].id, roomId: rooms[0].id, teacherId: teachers[0].id, maxEnrollment: 30, currentEnrollment: 28, rotationDay: RotationDay.A_DAY  } }),
    prisma.courseSection.create({ data: { courseId: courses[1].id, sectionNumber: 'B', academicCycleId: schoolYear.id, timeBlockId: timeBlocks[1].id, roomId: rooms[0].id, teacherId: teachers[0].id, maxEnrollment: 30, currentEnrollment: 25, rotationDay: RotationDay.A_DAY } }),
    prisma.courseSection.create({ data: { courseId: courses[2].id, sectionNumber: 'A', academicCycleId: schoolYear.id, timeBlockId: timeBlocks[2].id, roomId: rooms[1].id, teacherId: teachers[0].id, maxEnrollment: 30, currentEnrollment: 30, rotationDay: RotationDay.A_DAY } }),
    prisma.courseSection.create({ data: { courseId: courses[3].id, sectionNumber: 'A', academicCycleId: schoolYear.id, timeBlockId: timeBlocks[3].id, roomId: rooms[2].id, teacherId: teachers[0].id, maxEnrollment: 30, currentEnrollment: 20, rotationDay: RotationDay.A_DAY  } }),
    prisma.courseSection.create({ data: { courseId: courses[4].id, sectionNumber: '300', academicCycleId: schoolYear.id, timeBlockId: timeBlocks[4].id, roomId: rooms[1].id, teacherId: teachers[3].id, maxEnrollment: 30, currentEnrollment: 20, rotationDay: RotationDay.A_DAY  } }),
    prisma.courseSection.create({ data: { courseId: courses[5].id, sectionNumber: 'A', academicCycleId: schoolYear.id, timeBlockId: timeBlocks[5].id, roomId: rooms[3].id, teacherId: teachers[1].id, maxEnrollment: 30, currentEnrollment: 15, rotationDay: RotationDay.B_DAY  } }),
    prisma.courseSection.create({ data: { courseId: courses[6].id, sectionNumber: 'A', academicCycleId: schoolYear.id, timeBlockId: timeBlocks[6].id, roomId: rooms[4].id, teacherId: teachers[1].id, maxEnrollment: 30, currentEnrollment: 10, rotationDay: RotationDay.B_DAY  } }),

    prisma.courseSection.create({ data: { courseId: courses[5].id, sectionNumber: 'A', academicCycleId: schoolYear.id, timeBlockId: timeBlocks[7].id, roomId: rooms[5].id, teacherId: teachers[2].id, maxEnrollment: 30, currentEnrollment: 18, rotationDay: RotationDay.B_DAY  } }),
    prisma.courseSection.create({ data: { courseId: courses[6].id, sectionNumber: 'A', academicCycleId: schoolYear.id, timeBlockId: timeBlocks[8].id, roomId: rooms[6].id, teacherId: teachers[2].id, maxEnrollment: 30, currentEnrollment: 22, rotationDay: RotationDay.B_DAY } }),
    prisma.courseSection.create({ data: { courseId: courses[7].id, sectionNumber: 'A', academicCycleId: schoolYear.id, timeBlockId: timeBlocks[9].id, roomId: rooms[7].id, teacherId: teachers[3].id, maxEnrollment: 30, currentEnrollment: 12, rotationDay: RotationDay.B_DAY } }),
    prisma.courseSection.create({ data: { courseId: courses[8].id, sectionNumber: 'A', academicCycleId: schoolYear.id, timeBlockId: timeBlocks[0].id, roomId: rooms[8].id, teacherId: teachers[3].id, maxEnrollment: 30, currentEnrollment: 8, rotationDay: RotationDay.A_DAY  } }),
    prisma.courseSection.create({ data: { courseId: courses[9].id, sectionNumber: '150', academicCycleId: schoolYear.id, timeBlockId: timeBlocks[1].id, roomId: rooms[1].id, teacherId: teachers[4].id, maxEnrollment: 30, currentEnrollment: 5, rotationDay: RotationDay.A_DAY  } }),
    prisma.courseSection.create({ data: { courseId: courses[10].id, sectionNumber: 'A', academicCycleId: schoolYear.id, timeBlockId: timeBlocks[2].id, roomId: rooms[10].id, teacherId: teachers[4].id, maxEnrollment: 30, currentEnrollment: 20, rotationDay: RotationDay.A_DAY  } }),
    prisma.courseSection.create({ data: { courseId: courses[18].id, sectionNumber: '500', academicCycleId: schoolYear.id, timeBlockId: timeBlocks[3].id, roomId: rooms[9].id, teacherId: teachers[0].id, maxEnrollment: 30, currentEnrollment: 20, rotationDay: RotationDay.A_DAY  } }),
    prisma.courseSection.create({ data: { courseId: courses[19].id, sectionNumber: '450', academicCycleId: schoolYear.id, timeBlockId: timeBlocks[4].id, roomId: rooms[18].id, teacherId: teachers[1].id, maxEnrollment: 30, currentEnrollment: 20, rotationDay: RotationDay.A_DAY  } }),
    prisma.courseSection.create({ data: { courseId: courses[15].id, sectionNumber: '344', academicCycleId: schoolYear.id, timeBlockId: timeBlocks[5].id, roomId: rooms[16].id, teacherId: teachers[2].id, maxEnrollment: 30, currentEnrollment: 20, rotationDay: RotationDay.B_DAY  } }),
    prisma.courseSection.create({ data: { courseId: courses[22].id, sectionNumber: 'A', academicCycleId: schoolYear.id, timeBlockId: timeBlocks[6].id, roomId: rooms[10].id, teacherId: teachers[0].id, maxEnrollment: 30, currentEnrollment: 20, rotationDay: RotationDay.B_DAY  } }),
    prisma.courseSection.create({ data: { courseId: courses[14].id, sectionNumber: 'A', academicCycleId: schoolYear.id, timeBlockId: timeBlocks[7].id, roomId: rooms[10].id, teacherId: teachers[3].id, maxEnrollment: 30, currentEnrollment: 20, rotationDay: RotationDay.B_DAY  } }),
    prisma.courseSection.create({ data: { courseId: courses[31].id, sectionNumber: 'A', academicCycleId: schoolYear.id, timeBlockId: timeBlocks[8].id, roomId: rooms[10].id, teacherId: teachers[2].id, maxEnrollment: 30, currentEnrollment: 20, rotationDay: RotationDay.B_DAY  } }),
    prisma.courseSection.create({ data: { courseId: courses[35].id, sectionNumber: 'A', academicCycleId: schoolYear.id, timeBlockId: timeBlocks[9].id, roomId: rooms[10].id, teacherId: teachers[0].id, maxEnrollment: 30, currentEnrollment: 20, rotationDay: RotationDay.B_DAY  } }),
    prisma.courseSection.create({ data: { courseId: courses[7].id, sectionNumber: '300', academicCycleId: schoolYear.id, timeBlockId: timeBlocks[0].id, roomId: rooms[6].id, teacherId: teachers[0].id, maxEnrollment: 30, currentEnrollment: 10, rotationDay: RotationDay.A_DAY  } }),

  ]);


  const schedules = await Promise.all([
    // Student 1 Schedule (Freshman)
    prisma.schedule.create({
      data: {
        student: { connect: { id: students[0].id } },
        schoolYear: {connect: {id: schoolYears[2].id}},
        term: {connect: {id: terms[4].id}},
        scheduleCourseSections: {
          create: sections.slice(0, 6).map(section => ({
            courseSection: { connect: { id: section.id } }
          }))
        }
      }
    }),
    // Student 2 Schedule (Sophomore)
    prisma.schedule.create({
      data: {
        student: { connect: { id: students[1].id } },
        schoolYear: {connect: {id: schoolYears[2].id}},
        term: {connect: {id: terms[4].id}},
        scheduleCourseSections: {
          create: sections.slice(0, 7).map(section => ({
            courseSection: { connect: { id: section.id } }
          }))
        }
      }
    }),
    // Student 3 Schedule (Junior)
    prisma.schedule.create({
      data: {
        student: { connect: { id: students[2].id } },
        schoolYear: {connect: {id: schoolYears[2].id}},
        term: {connect: {id: terms[4].id}},
        scheduleCourseSections: {
          create: sections.slice(0, 7).map(section => ({
            courseSection: { connect: { id: section.id } }
          }))
        }
      }
    })
  ]);


  // Create Course Conflicts
  await Promise.all([
    prisma.courseConflict.create({ data: { courseSectionId1: sections[0].id, courseSectionId2: sections[1].id, conflictType: ConflictType.SCHEDULE_OVERLAP, isResolvable: true, resolutionNotes: 'Students can choose either section' } }),
    prisma.courseConflict.create({ data: { courseSectionId1: sections[2].id, courseSectionId2: sections[3].id, conflictType: ConflictType.SCHEDULE_OVERLAP, isResolvable: true, resolutionNotes: 'Students can choose either section' } }),
    prisma.courseConflict.create({ data: { courseSectionId1: sections[4].id, courseSectionId2: sections[5].id, conflictType: ConflictType.SCHEDULE_OVERLAP, isResolvable: true, resolutionNotes: 'Students can choose either section' } }),
    prisma.courseConflict.create({ data: { courseSectionId1: sections[6].id, courseSectionId2: sections[7].id, conflictType: ConflictType.SCHEDULE_OVERLAP, isResolvable: true, resolutionNotes: 'Students can choose either section' } }),
    prisma.courseConflict.create({ data: { courseSectionId1: sections[0].id, courseSectionId2: sections[2].id, conflictType: ConflictType.TEACHER_CONFLICT, isResolvable: false, resolutionNotes: 'Teacher is not available for both sections' } }),
    prisma.courseConflict.create({ data: { courseSectionId1: sections[1].id, courseSectionId2: sections[3].id, conflictType: ConflictType.TEACHER_CONFLICT, isResolvable: false, resolutionNotes: 'Teacher is not available for both sections' } }),
    prisma.courseConflict.create({ data: { courseSectionId1: sections[4].id, courseSectionId2: sections[6].id, conflictType: ConflictType.TEACHER_CONFLICT, isResolvable: false, resolutionNotes: 'Teacher is not available for both sections' } }),
  ]);

  // Create Course Waitlists
  await Promise.all([
    prisma.courseWaitlist.create({ data: { courseSectionId: sections[2].id, studentId: students[0].id, position: 1 } }),
  ]);

  // Create Sample Student Grades
  const studentGrades = await Promise.all([
    prisma.studentGrade.create({
      data: {
        studentId: students[0].id,
        courseId: courses[0].id, // Algebra 1
        academicCycleId: quarters[0].id, // First Quarter
        schoolYearId: schoolYear.id,
        grade: 'A',
        gradePoints: 4.0,
        percentage: 95.0,
        isPassed: true,
        creditEarned: 1.0,
        gradedBy: users[2].id, // Teacher Johnson's user ID
        gradedAt: new Date(),
        notes: 'Excellent performance in first quarter',
      }
    }),
    prisma.studentGrade.create({
      data: {
        studentId: students[0].id,
        courseId: courses[9].id, // English 1
        academicCycleId: quarters[0].id, // First Quarter
        schoolYearId: schoolYear.id,
        grade: 'B+',
        gradePoints: 3.3,
        percentage: 87.0,
        isPassed: true,
        creditEarned: 1.0,
        gradedBy: users[3].id, // Teacher Williams' user ID
        gradedAt: new Date(),
        notes: 'Good performance, room for improvement in writing',
      }
    }),
    prisma.studentGrade.create({
      data: {
        studentId: students[1].id,
        courseId: courses[2].id, // Algebra 2
        academicCycleId: quarters[0].id, // First Quarter
        schoolYearId: schoolYear.id,
        grade: 'A-',
        gradePoints: 3.7,
        percentage: 92.0,
        isPassed: true,
        creditEarned: 1.0,
        gradedBy: users[2].id, // Teacher Johnson's user ID
        gradedAt: new Date(),
        notes: 'Strong performance in advanced algebra',
      }
    }),
  ]);

  // Create Parent/Guardian data
  const parentGuardians = await Promise.all([
    // Parent for student 1 (S100001 - Sarah Johnson)
    prisma.parentGuardian.create({
      data: {
        userId: users[17].id, // Michael Johnson user
        firstName: 'Michael',
        lastName: 'Johnson',
        email: 'michael.johnson@email.com',
        primaryPhone: '+1-555-0101',
        secondaryPhone: '+1-555-0102',
        relationship: RelationshipType.PARENT,
        isPrimaryContact: true,
        isEmergencyContact: false,
        preferredContactMethod: ContactMethod.EMAIL,
        notificationPreferences: {
          create: {
            scheduleChanges: true,
            gradeUpdates: true,
            attendanceAlerts: true,
            counselorMeetings: true,
            emergencyAlerts: true,
            generalAnnouncements: false,
            emailEnabled: true,
            smsEnabled: false,
            phoneCallEnabled: false,
            digestFrequency: DigestFrequency.DAILY
          }
        }
      }
    }),
    
    // Parent for student 1 (S100001 - Sarah Johnson)
    prisma.parentGuardian.create({
      data: {
        userId: users[18].id, // Lisa Johnson user
        firstName: 'Lisa',
        lastName: 'Johnson',
        email: 'lisa.johnson@email.com',
        primaryPhone: '+1-555-0103',
        relationship: RelationshipType.PARENT,
        isPrimaryContact: false,
        isEmergencyContact: true,
        preferredContactMethod: ContactMethod.PHONE,
        notificationPreferences: {
          create: {
            scheduleChanges: true,
            gradeUpdates: true,
            attendanceAlerts: true,
            counselorMeetings: true,
            emergencyAlerts: true,
            generalAnnouncements: true,
            emailEnabled: true,
            smsEnabled: true,
            phoneCallEnabled: true,
            digestFrequency: DigestFrequency.IMMEDIATE
          }
        }
      }
    }),

    // Parent for student 2 (S100002 - David Smith)
    prisma.parentGuardian.create({
      data: {
        userId: users[19].id, // Robert Smith user
        firstName: 'Robert',
        lastName: 'Smith',
        email: 'robert.smith@email.com',
        primaryPhone: '+1-555-0201',
        relationship: RelationshipType.PARENT,
        isPrimaryContact: true,
        isEmergencyContact: false,
        preferredContactMethod: ContactMethod.EMAIL,
        notificationPreferences: {
          create: {
            scheduleChanges: true,
            gradeUpdates: true,
            attendanceAlerts: true,
            counselorMeetings: true,
            emergencyAlerts: true,
            generalAnnouncements: false,
            emailEnabled: true,
            smsEnabled: false,
            phoneCallEnabled: false,
            digestFrequency: DigestFrequency.DAILY
          }
        }
      }
    }),

    // Guardian for student 2 (S100002 - David Smith)
    prisma.parentGuardian.create({
      data: {
        userId: users[20].id, // Maria Garcia user
        firstName: 'Maria',
        lastName: 'Garcia',
        email: 'maria.garcia@email.com',
        primaryPhone: '+1-555-0202',
        relationship: RelationshipType.GUARDIAN,
        isPrimaryContact: false,
        isEmergencyContact: true,
        preferredContactMethod: ContactMethod.SMS,
        notificationPreferences: {
          create: {
            scheduleChanges: true,
            gradeUpdates: false,
            attendanceAlerts: true,
            counselorMeetings: true,
            emergencyAlerts: true,
            generalAnnouncements: false,
            emailEnabled: false,
            smsEnabled: true,
            phoneCallEnabled: false,
            digestFrequency: DigestFrequency.IMMEDIATE
          }
        }
      }
    }),

    // Parent for student 3 (S100003 - Emily Brown)
    prisma.parentGuardian.create({
      data: {
        userId: users[21].id, // James Brown user
        firstName: 'James',
        lastName: 'Brown',
        email: 'james.brown@email.com',
        primaryPhone: '+1-555-0301',
        secondaryPhone: '+1-555-0302',
        relationship: RelationshipType.PARENT,
        isPrimaryContact: true,
        isEmergencyContact: true,
        preferredContactMethod: ContactMethod.PREFERRED,
        notificationPreferences: {
          create: {
            scheduleChanges: true,
            gradeUpdates: true,
            attendanceAlerts: true,
            counselorMeetings: true,
            emergencyAlerts: true,
            generalAnnouncements: true,
            emailEnabled: true,
            smsEnabled: true,
            phoneCallEnabled: true,
            digestFrequency: DigestFrequency.DAILY
          }
        }
      }
    }),

    // Grandparent for student 3 (S100003 - Emily Brown)
    prisma.parentGuardian.create({
      data: {
        userId: users[22].id, // Dorothy Brown user
        firstName: 'Dorothy',
        lastName: 'Brown',
        email: 'dorothy.brown@email.com',
        primaryPhone: '+1-555-0303',
        relationship: RelationshipType.GRANDPARENT,
        isPrimaryContact: false,
        isEmergencyContact: false,
        preferredContactMethod: ContactMethod.PHONE,
        notificationPreferences: {
          create: {
            scheduleChanges: false,
            gradeUpdates: true,
            attendanceAlerts: false,
            counselorMeetings: false,
            emergencyAlerts: true,
            generalAnnouncements: true,
            emailEnabled: false,
            smsEnabled: false,
            phoneCallEnabled: true,
            digestFrequency: DigestFrequency.WEEKLY
          }
        }
      }
    }),

    // Parent for student 4 (S100004 - Michael Davis)
    prisma.parentGuardian.create({
      data: {
        userId: users[23].id, // Jennifer Davis user
        firstName: 'Jennifer',
        lastName: 'Davis',
        email: 'jennifer.davis@email.com',
        primaryPhone: '+1-555-0401',
        relationship: RelationshipType.PARENT,
        isPrimaryContact: true,
        isEmergencyContact: false,
        preferredContactMethod: ContactMethod.EMAIL,
        notificationPreferences: {
          create: {
            scheduleChanges: true,
            gradeUpdates: true,
            attendanceAlerts: true,
            counselorMeetings: true,
            emergencyAlerts: true,
            generalAnnouncements: false,
            emailEnabled: true,
            smsEnabled: false,
            phoneCallEnabled: false,
            digestFrequency: DigestFrequency.DAILY
          }
        }
      }
    }),

    // Step-parent for student 4 (S100004 - Michael Davis)
    prisma.parentGuardian.create({
      data: {
        userId: users[24].id, // Mark Wilson user
        firstName: 'Mark',
        lastName: 'Wilson',
        email: 'mark.wilson@email.com',
        primaryPhone: '+1-555-0402',
        relationship: RelationshipType.STEP_PARENT,
        isPrimaryContact: false,
        isEmergencyContact: true,
        preferredContactMethod: ContactMethod.SMS,
        notificationPreferences: {
          create: {
            scheduleChanges: true,
            gradeUpdates: false,
            attendanceAlerts: true,
            counselorMeetings: false,
            emergencyAlerts: true,
            generalAnnouncements: false,
            emailEnabled: false,
            smsEnabled: true,
            phoneCallEnabled: false,
            digestFrequency: DigestFrequency.IMMEDIATE
          }
        }
      }
    })
  ]);

  // Update students with parent/guardian assignments
  await Promise.all([
    // Sarah Johnson (S100001) - Primary: Michael Johnson, Emergency: Lisa Johnson
    prisma.student.update({
      where: { id: students[0].id },
      data: {
        primaryParentId: parentGuardians[0].id,
        emergencyContactId: parentGuardians[1].id
      }
    }),

    // David Smith (S100002) - Primary: Robert Smith, Emergency: Maria Garcia
    prisma.student.update({
      where: { id: students[1].id },
      data: {
        primaryParentId: parentGuardians[2].id,
        emergencyContactId: parentGuardians[3].id
      }
    }),

    // Emily Brown (S100003) - Primary: James Brown, Secondary: Dorothy Brown
    prisma.student.update({
      where: { id: students[2].id },
      data: {
        primaryParentId: parentGuardians[4].id,
        secondaryParentId: parentGuardians[5].id
      }
    }),

    // Michael Davis (S100004) - Primary: Jennifer Davis, Emergency: Mark Wilson
    prisma.student.update({
      where: { id: students[3].id },
      data: {
        primaryParentId: parentGuardians[6].id,
        emergencyContactId: parentGuardians[7].id
      }
    })
  ]);

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
