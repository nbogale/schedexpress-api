import { PrismaClient, UserRole, ConflictType, RequestStatus, NotificationType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.$transaction([
    prisma.auditLog.deleteMany(),
    prisma.systemSetting.deleteMany(),
    prisma.courseWaitlist.deleteMany(),
    prisma.courseConflict.deleteMany(),
    prisma.scheduleChangeAction.deleteMany(),
    prisma.scheduleChangeRequest.deleteMany(),
    prisma.studentCourseHistory.deleteMany(),
    prisma.courseSection.deleteMany(),
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
    prisma.user.deleteMany(),
  ]);

  // Create Users
  const users = await Promise.all([
    prisma.user.create({ data: { email: 'admin@schedexpress.com', passwordHash: await bcrypt.hash('Welcome2ES!', 10), role: UserRole.ADMIN, firstName: 'Admin', lastName: 'User' } }),
    prisma.user.create({ data: { email: 'counselor@schedexpress.com', passwordHash: await bcrypt.hash('Welcome2ES!', 10), role: UserRole.COUNSELOR, firstName: 'Counselor', lastName: 'Smith' } }),
    prisma.user.create({ data: { email: 'teacher1@schedexpress.com', passwordHash: await bcrypt.hash('Welcome2ES!', 10), role: UserRole.TEACHER, firstName: 'Teacher', lastName: 'Johnson' } }),
    prisma.user.create({ data: { email: 'teacher2@schedexpress.com', passwordHash: await bcrypt.hash('Welcome2ES!', 10), role: UserRole.TEACHER, firstName: 'Teacher', lastName: 'Williams' } }),
    prisma.user.create({ data: { email: 'teacher3@schedexpress.com', passwordHash: await bcrypt.hash('Welcome2ES!', 10), role: UserRole.TEACHER, firstName: 'Teacher', lastName: 'Brown' } }),
    prisma.user.create({ data: { email: 'teacher4@schedexpress.com', passwordHash: await bcrypt.hash('Welcome2ES!', 10), role: UserRole.TEACHER, firstName: 'Teacher', lastName: 'Davis' } }),
    prisma.user.create({ data: { email: 'teacher5@schedexpress.com', passwordHash: await bcrypt.hash('Welcome2ES!', 10), role: UserRole.TEACHER, firstName: 'Teacher', lastName: 'Miller' } }),
    prisma.user.create({ data: { email: 'john.smith@schedexpress.com', passwordHash: await bcrypt.hash('Welcome2ES!', 10), role: UserRole.STUDENT, firstName: 'John', lastName: 'Smith' } }),
    prisma.user.create({ data: { email: 'yirguit@gmail.com', passwordHash: await bcrypt.hash('Welcome2ES!', 10), role: UserRole.STUDENT, firstName: 'Emily', lastName: 'Johnson' } }),
    prisma.user.create({ data: { email: 'michael.williams@schedexpress.com', passwordHash: await bcrypt.hash('Welcome2ES!', 10), role: UserRole.STUDENT, firstName: 'Michael', lastName: 'Williams' } }),
    prisma.user.create({ data: { email: 'olivia.brown@schedexpress.com', passwordHash: await bcrypt.hash('Welcome2ES!', 10), role: UserRole.STUDENT, firstName: 'Olivia', lastName: 'Brown' } }),
    prisma.user.create({ data: { email: 'daniel.davis@schedexpress.com', passwordHash: await bcrypt.hash('Welcome2ES!', 10), role: UserRole.STUDENT, firstName: 'Daniel', lastName: 'Davis' } }),   
    prisma.user.create({ data: { email: 'sophia.wilson  @schedexpress.com', passwordHash: await bcrypt.hash('Welcome2ES!', 10), role: UserRole.STUDENT, firstName: 'Sophia', lastName: 'Wilson' } }),  
    prisma.user.create({ data: { email: 'james.taylor@schedexpress.com', passwordHash: await bcrypt.hash('Welcome2ES!', 10), role: UserRole.STUDENT, firstName: 'James', lastName: 'Taylor' } }),  
    prisma.user.create({ data: { email: 'ava.moore@schedexpress.com', passwordHash: await bcrypt.hash('Welcome2ES!', 10), role: UserRole.STUDENT, firstName: 'Ava', lastName: 'Moore' } }),  
    prisma.user.create({ data: { email: 'william.martin@schedexpress.com', passwordHash: await bcrypt.hash('Welcome2ES!', 10), role: UserRole.STUDENT, firstName: 'William', lastName: 'Martin' } }),  
    prisma.user.create({ data: { email: 'isabella.harris@schedexpress.com', passwordHash: await bcrypt.hash('Welcome2ES!', 10), role: UserRole.STUDENT, firstName: 'Isabella', lastName: 'Harris' } }),  
  ]);

  // Create School Years
  const schoolYears = await Promise.all([
    prisma.schoolYear.create({ data: { name: '2023-2024', startDate: new Date('2023-08-15'), endDate: new Date('2024-06-10'), isCurrent: false } }),
    prisma.schoolYear.create({ data: { name: '2024-2025', startDate: new Date('2024-08-14'), endDate: new Date('2025-06-09'), isCurrent: true } }),
    prisma.schoolYear.create({ data: { name: '2025-2026', startDate: new Date('2025-08-13'), endDate: new Date('2026-06-08'), isCurrent: false } }),
  ]);

  // Create Terms
  const terms = await Promise.all([
    prisma.term.create({ data: { schoolYearId: schoolYears[0].id, name: 'Fall Semester 2023', startDate: new Date('2023-08-15'), endDate: new Date('2023-12-20'), isCurrent: false } }),
    prisma.term.create({ data: { schoolYearId: schoolYears[0].id, name: 'Spring Semester 2024', startDate: new Date('2024-01-05'), endDate: new Date('2024-06-10'), isCurrent: false } }),
    prisma.term.create({ data: { schoolYearId: schoolYears[1].id, name: 'Fall Semester 2024', startDate: new Date('2024-08-14'), endDate: new Date('2024-12-19'), isCurrent: false } }),
    prisma.term.create({ data: { schoolYearId: schoolYears[1].id, name: 'Spring Semester 2025', startDate: new Date('2025-01-06'), endDate: new Date('2025-06-09'), isCurrent: true } }),
  ]);

  // Create Departments
  const departments = await Promise.all([
    prisma.department.create({ data: { name: 'Mathematics' } }),
    prisma.department.create({ data: { name: 'English/Language Arts' } }),
    prisma.department.create({ data: { name: 'Science' } }),
    prisma.department.create({ data: { name: 'Social Studies' } }),
    prisma.department.create({ data: { name: 'Art and Design' } }),
    prisma.department.create({ data: { name: 'Physical Education' } }),
    prisma.department.create({ data: { name: 'Foreign Language' } }),
    prisma.department.create({ data: { name: 'Music' } }),
    prisma.department.create({ data: { name: 'Technology' } }),
    prisma.department.create({ data: { name: 'Health' } }),
    prisma.department.create({ data: { name: 'Business' } }),
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
  const timeBlocks = await Promise.all([
    prisma.timeBlock.create({ data: { name: 'Period 1', startTime: new Date('2024-01-01T08:00:00'), endTime: new Date('2024-01-01T08:50:00') } }),
    prisma.timeBlock.create({ data: { name: 'Period 2', startTime: new Date('2024-01-01T08:55:00'), endTime: new Date('2024-01-01T09:45:00') } }),
    prisma.timeBlock.create({ data: { name: 'Period 3', startTime: new Date('2024-01-01T09:50:00'), endTime: new Date('2024-01-01T10:40:00') } }),
    prisma.timeBlock.create({ data: { name: 'Period 4', startTime: new Date('2024-01-01T10:45:00'), endTime: new Date('2024-01-01T11:35:00') } }),
    prisma.timeBlock.create({ data: { name: 'Period 5', startTime: new Date('2024-01-01T11:40:00'), endTime: new Date('2024-01-01T12:30:00') } }),
    prisma.timeBlock.create({ data: { name: 'Period 6', startTime: new Date('2024-01-01T12:35:00'), endTime: new Date('2024-01-01T13:25:00') } }),
    prisma.timeBlock.create({ data: { name: 'Period 7', startTime: new Date('2024-01-01T13:30:00'), endTime: new Date('2024-01-01T14:20:00') } }),
    prisma.timeBlock.create({ data: { name: 'Period 8', startTime: new Date('2024-01-01T14:25:00'), endTime: new Date('2024-01-01T15:15:00') } }),
  ]);

  // Create Teachers
  const teachers = await Promise.all([
    prisma.teacher.create({ data: {name: 'Teacher Johnson', email: 'teacher1@edu.edu', departmentId: departments[0].id, maxCourses: 6 } }),
    prisma.teacher.create({ data: {name: 'Teacher Williams', email: 'teacher2@edu.edu',departmentId: departments[1].id, maxCourses: 6 } }),
    prisma.teacher.create({ data: {name: 'Teacher Brown', email: 'teacher3@edu.edu', departmentId: departments[2].id, maxCourses: 6 } }),
    prisma.teacher.create({ data: {name: 'Teacher Davis', email: 'teacher4@edu.edu', departmentId: departments[3].id, maxCourses: 6 } }),
    prisma.teacher.create({ data: {name: 'Teacher Miller', email: 'teacher5@edu.edu', departmentId: departments[4].id, maxCourses: 6 } }),
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
    // Science Courses
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
    // Music Courses
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
  

  // Create Course Sections
  const sections = await Promise.all([
    prisma.courseSection.create({ data: { courseId: courses[0].id, sectionNumber: 'A', schoolYearId: schoolYears[1].id, termId: terms[3].id, timeBlockId: timeBlocks[0].id, roomId: rooms[0].id, teacherId: teachers[0].id, maxEnrollment: 30, currentEnrollment: 28 } }),
    prisma.courseSection.create({ data: { courseId: courses[0].id, sectionNumber: 'B', schoolYearId: schoolYears[1].id, termId: terms[3].id, timeBlockId: timeBlocks[2].id, roomId: rooms[0].id, teacherId: teachers[0].id, maxEnrollment: 30, currentEnrollment: 25 } }),
    prisma.courseSection.create({ data: { courseId: courses[1].id, sectionNumber: 'A', schoolYearId: schoolYears[1].id, termId: terms[3].id, timeBlockId: timeBlocks[1].id, roomId: rooms[1].id, teacherId: teachers[0].id, maxEnrollment: 30, currentEnrollment: 30 } }),
    prisma.courseSection.create({ data: { courseId: courses[2].id, sectionNumber: 'A', schoolYearId: schoolYears[1].id, termId: terms[3].id, timeBlockId: timeBlocks[3].id, roomId: rooms[2].id, teacherId: teachers[0].id, maxEnrollment: 30, currentEnrollment: 20 } }),
    prisma.courseSection.create({ data: { courseId: courses[3].id, sectionNumber: 'A', schoolYearId: schoolYears[1].id, termId: terms[3].id, timeBlockId: timeBlocks[4].id, roomId: rooms[3].id, teacherId: teachers[1].id, maxEnrollment: 30, currentEnrollment: 15 } }),
    prisma.courseSection.create({ data: { courseId: courses[4].id, sectionNumber: 'A', schoolYearId: schoolYears[1].id, termId: terms[3].id, timeBlockId: timeBlocks[5].id, roomId: rooms[4].id, teacherId: teachers[1].id, maxEnrollment: 30, currentEnrollment: 10 } }),
    prisma.courseSection.create({ data: { courseId: courses[5].id, sectionNumber: 'A', schoolYearId: schoolYears[1].id, termId: terms[3].id, timeBlockId: timeBlocks[6].id, roomId: rooms[5].id, teacherId: teachers[2].id, maxEnrollment: 30, currentEnrollment: 18 } }),
    prisma.courseSection.create({ data: { courseId: courses[6].id, sectionNumber: 'A', schoolYearId: schoolYears[1].id, termId: terms[3].id, timeBlockId: timeBlocks[7].id, roomId: rooms[6].id, teacherId: teachers[2].id, maxEnrollment: 30, currentEnrollment: 22 } }),
    prisma.courseSection.create({ data: { courseId: courses[7].id, sectionNumber: 'A', schoolYearId: schoolYears[1].id, termId: terms[3].id, timeBlockId: timeBlocks[0].id, roomId: rooms[7].id, teacherId: teachers[3].id, maxEnrollment: 30, currentEnrollment: 12 } }),
    prisma.courseSection.create({ data: { courseId: courses[8].id, sectionNumber: 'A', schoolYearId: schoolYears[1].id, termId: terms[3].id, timeBlockId: timeBlocks[1].id, roomId: rooms[8].id, teacherId: teachers[3].id, maxEnrollment: 30, currentEnrollment: 8 } }),
    prisma.courseSection.create({ data: { courseId: courses[9].id, sectionNumber: 'A', schoolYearId: schoolYears[1].id, termId: terms[3].id, timeBlockId: timeBlocks[2].id, roomId: rooms[9].id, teacherId: teachers[4].id, maxEnrollment: 30, currentEnrollment: 5 } }),
    prisma.courseSection.create({ data: { courseId: courses[10].id, sectionNumber: 'A', schoolYearId: schoolYears[1].id, termId: terms[3].id, timeBlockId: timeBlocks[3].id, roomId: rooms[10].id, teacherId: teachers[4].id, maxEnrollment: 30, currentEnrollment: 20 } }),
  ]);

  // Create Schedules for Students
  const schedules = await Promise.all([
    // Student 1 Schedule (Freshman)
    prisma.schedule.create({
      data: {
        studentId: students[0].id,
        semester: 'Spring',
        year: 2025,
        courseSections: {
          connect: sections.slice(0, 6).map(section => ({ id: section.id }))
        }
      }
    }),

    // Student 2 Schedule (Sophomore)
    prisma.schedule.create({
      data: {
        studentId: students[1].id,
        semester: 'Spring',
        year: 2025,
        courseSections: {
          connect: sections.slice(0, 7).map(section => ({ id: section.id }))
        }
      }
    }),

    // Student 3 Schedule (Junior with IEP)
    prisma.schedule.create({
      data: {
        studentId: students[2].id,
        semester: 'Spring',
        year: 2025,
        courseSections: {
          connect: sections.slice(0, 7).map(section => ({ id: section.id }))
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

  // Create System Settings
  await Promise.all([
    prisma.systemSetting.create({ data: { key: 'MAX_COURSES_PER_STUDENT', value: '8', description: 'Maximum number of courses a student can enroll in per term' } }),
    prisma.systemSetting.create({ data: { key: 'MIN_COURSES_PER_STUDENT', value: '6', description: 'Minimum number of courses a student must enroll in per term' } }),
  ]);

  // Create for Notifications
  await Promise.all([
    prisma.notification.create({ data: { studentId: students[0].id, userId: users[7].id, message: 'Your schedule change request has been created for Math', type: NotificationType.REQUEST_UPDATE } }),
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
