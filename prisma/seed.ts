import { PrismaClient, UserRole, ConflictType, RequestStatus } from '@prisma/client';
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
    prisma.user.create({ data: { email: 'student2@schedexpress.com', passwordHash: await bcrypt.hash('Welcome2ES!', 10), role: UserRole.STUDENT, firstName: 'Emily', lastName: 'Johnson' } }),
    prisma.user.create({ data: { email: 'student3@schedexpress.com', passwordHash: await bcrypt.hash('Welcome2ES!', 10), role: UserRole.STUDENT, firstName: 'Michael', lastName: 'Williams' } }),
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
  ]);

  // Create Time Blocks
  const timeBlocks = await Promise.all([
    prisma.timeBlock.create({ data: { name: 'Period 1', startTime: new Date('2024-01-01T08:00:00'), endTime: new Date('2024-01-01T08:50:00') } }),
    prisma.timeBlock.create({ data: { name: 'Period 2', startTime: new Date('2024-01-01T08:55:00'), endTime: new Date('2024-01-01T09:45:00') } }),
    prisma.timeBlock.create({ data: { name: 'Period 3', startTime: new Date('2024-01-01T09:50:00'), endTime: new Date('2024-01-01T10:40:00') } }),
    prisma.timeBlock.create({ data: { name: 'Period 4', startTime: new Date('2024-01-01T10:45:00'), endTime: new Date('2024-01-01T11:35:00') } }),
    prisma.timeBlock.create({ data: { name: 'Period 5', startTime: new Date('2024-01-01T11:40:00'), endTime: new Date('2024-01-01T12:30:00') } }),
  ]);

  // Create Teachers
  const teachers = await Promise.all([
    prisma.teacher.create({ data: { email: 'teacher1@edu.edu', departmentId: departments[0].id, maxCourses: 6 } }),
    prisma.teacher.create({ data: { email: 'teacher2@edu.edu',departmentId: departments[1].id, maxCourses: 6 } }),
    prisma.teacher.create({ data: { email: 'teacher3@edu.edu', departmentId: departments[2].id, maxCourses: 6 } }),
    prisma.teacher.create({ data: { email: 'teacher4@edu.edu', departmentId: departments[3].id, maxCourses: 6 } }),
    prisma.teacher.create({ data: { email: 'teacher5@edu.edu', departmentId: departments[4].id, maxCourses: 6 } }),
  ]);

  /*
   id           String     @id @default(cuid())
  name         String?
  email        String     @unique
  password     String?
  departmentId String
  maxCourses   Int        @default(6)
  isActive     Boolean    @default(true)
  */

  // Create Students
  const students = await Promise.all([
    prisma.student.create({ data: { userId: users[7].id, studentId: 'S100001', gradeLevelId: gradeLevels[3].id, graduationYear: 2028, hasIep: false, isDualEnrollment: false, isCollegeBound: true, isCreditRecovery: false, maxCreditsPerTerm: 8.0 } }),
    prisma.student.create({ data: { userId: users[8].id, studentId: 'S100002', gradeLevelId: gradeLevels[4].id, graduationYear: 2027, hasIep: false, isDualEnrollment: false, isCollegeBound: true, isCreditRecovery: false, maxCreditsPerTerm: 8.0 } }),
    prisma.student.create({ data: { userId: users[9].id, studentId: 'S100003', gradeLevelId: gradeLevels[4].id, graduationYear: 2027, hasIep: true, isDualEnrollment: false, isCollegeBound: true, isCreditRecovery: false, maxCreditsPerTerm: 7.0 } }),
  ]);

  // Create Courses
  const courses = await Promise.all([
    // Mathematics Courses
    prisma.course.create({ data: { code: 'MATH101', name: 'Algebra 1', description: 'Introduction to algebraic concepts', departmentId: departments[0].id, credits: 1.0, courseLevelId: courseLevels[0].id, minGradeLevelId: gradeLevels[3].id, isElective: false, isCore: true } }),
    prisma.course.create({ data: { code: 'MATH201', name: 'Geometry', description: 'Study of shapes and spatial relationships', departmentId: departments[0].id, credits: 1.0, courseLevelId: courseLevels[0].id, minGradeLevelId: gradeLevels[3].id, isElective: false, isCore: true } }),
    prisma.course.create({ data: { code: 'MATH301', name: 'Algebra 2', description: 'Advanced algebraic concepts', departmentId: departments[0].id, credits: 1.0, courseLevelId: courseLevels[0].id, minGradeLevelId: gradeLevels[4].id, isElective: false, isCore: true } }),
  ]);

  // Create Course Prerequisites
  await Promise.all([
    prisma.coursePrerequisite.create({ data: { courseId: courses[1].id, prerequisiteCourseId: courses[0].id } }),
    prisma.coursePrerequisite.create({ data: { courseId: courses[2].id, prerequisiteCourseId: courses[1].id } }),
  ]);

  // Create Course Sections
  const sections = await Promise.all([
    prisma.courseSection.create({ data: { courseId: courses[0].id, sectionNumber: 'A', schoolYearId: schoolYears[1].id, termId: terms[3].id, timeBlockId: timeBlocks[0].id, roomId: rooms[0].id, teacherId: teachers[0].id, maxEnrollment: 30, currentEnrollment: 28 } }),
    prisma.courseSection.create({ data: { courseId: courses[0].id, sectionNumber: 'B', schoolYearId: schoolYears[1].id, termId: terms[3].id, timeBlockId: timeBlocks[2].id, roomId: rooms[0].id, teacherId: teachers[0].id, maxEnrollment: 30, currentEnrollment: 25 } }),
    prisma.courseSection.create({ data: { courseId: courses[1].id, sectionNumber: 'A', schoolYearId: schoolYears[1].id, termId: terms[3].id, timeBlockId: timeBlocks[1].id, roomId: rooms[1].id, teacherId: teachers[0].id, maxEnrollment: 30, currentEnrollment: 30 } }),
  ]);

  // Create Course Conflicts
  await Promise.all([
    prisma.courseConflict.create({ data: { courseSectionId1: sections[0].id, courseSectionId2: sections[1].id, conflictType: ConflictType.SCHEDULE_OVERLAP, isResolvable: true, resolutionNotes: 'Students can choose either section' } }),
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
