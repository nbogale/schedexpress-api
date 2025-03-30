import { PrismaClient, UserRole, RuleType, RequestStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Clear existing data
  await prisma.courseRule.deleteMany();
  await prisma.rule.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.conflict.deleteMany();
  await prisma.scheduleChangeRequest.deleteMany();
  await prisma.course.deleteMany();
  await prisma.schedule.deleteMany();
  await prisma.adminAction.deleteMany();
  await prisma.admin.deleteMany();
  await prisma.counselor.deleteMany();
  await prisma.student.deleteMany();
  await prisma.user.deleteMany();
  await prisma.settings.deleteMany();

  // Create settings
  await prisma.settings.create({
    data: {
      schoolName: 'East High School',
      academicYear: '2024-2025',
      semester: 'Fall',
      maxCourseLoad: 8,
      allowConflicts: false,
    },
  });

  // Hash password for all test accounts
  const password = await bcrypt.hash('Welcome2ES!', 10);

  // Create admin user
  const adminUser = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@schedexpress.com',
      password,
      role: UserRole.ADMIN,
    },
  });

  await prisma.admin.create({
    data: {
      userId: adminUser.id,
      department: 'Administration',
    },
  });

  // Create counselor user
  const counselorUser = await prisma.user.create({
    data: {
      name: 'Counselor User',
      email: 'counselor@schedexpress.com',
      password,
      role: UserRole.COUNSELOR,
    },
  });

  const counselor = await prisma.counselor.create({
    data: {
      userId: counselorUser.id,
      department: 'Guidance',
    },
  });

  // Create student users
  const studentData = [
    {
      name: 'John Smith',
      email: 'john.smith@schedexpress.com',
      gradeLevel: 10,
    },
    {
      name: 'Emma Johnson',
      email: 'emma.johnson@schedexpress.com',
      gradeLevel: 11,
    },
    {
      name: 'Alex Martinez',
      email: 'alex.martinez@schedexpress.com',
      gradeLevel: 9,
    },
    {
      name: 'Sophia Lee',
      email: 'sophia.lee@schedexpress.com',
      gradeLevel: 12,
    },
  ];

  const students = {};

  for (const student of studentData) {
    const user = await prisma.user.create({
      data: {
        name: student.name,
        email: student.email,
        password,
        role: UserRole.STUDENT,
      },
    });

    const createdStudent = await prisma.student.create({
      data: {
        userId: user.id,
        gradeLevel: student.gradeLevel,
      },
    });
    
    students[student.name] = createdStudent;
  }

  // Create courses
  const coursesData = [
    {
      name: 'Algebra II',
      courseCode: 'MATH201',
      teacher: 'Mr. Johnson',
      period: 1,
      room: 'Room 101',
      capacity: 25,
    },
    {
      name: 'Biology',
      courseCode: 'BIO101',
      teacher: 'Mrs. Smith',
      period: 2,
      room: 'Room 230',
      capacity: 24,
    },
    {
      name: 'English Literature',
      courseCode: 'ENG103',
      teacher: 'Ms. Davis',
      period: 3,
      room: 'Room 310',
      capacity: 30,
    },
    {
      name: 'World History',
      courseCode: 'HIST102',
      teacher: 'Mr. Williams',
      period: 4,
      room: 'Room 220',
      capacity: 28,
    },
    {
      name: 'Chemistry',
      courseCode: 'CHEM201',
      teacher: 'Dr. Brown',
      period: 5,
      room: 'Room 240',
      capacity: 20,
    },
    {
      name: 'Physics',
      courseCode: 'PHYS201',
      teacher: 'Dr. Miller',
      period: 3,
      room: 'Room 245',
      capacity: 20,
    },
    {
      name: 'Spanish I',
      courseCode: 'SPAN101',
      teacher: 'Sr. Rodriguez',
      period: 6,
      room: 'Room 150',
      capacity: 22,
    },
    {
      name: 'Art History',
      courseCode: 'ART102',
      teacher: 'Ms. Wilson',
      period: 7,
      room: 'Room 400',
      capacity: 25,
    },
    {
      name: 'Algebra I',
      courseCode: 'MATH101',
      teacher: 'Mrs. Thompson',
      period: 1,
      room: 'Room 102',
      capacity: 28,
    },
    {
      name: 'Advanced Biology',
      courseCode: 'BIO201',
      teacher: 'Dr. Wilson',
      period: 2,
      room: 'Room 231',
      capacity: 22,
    },
  ];

  const courses = {};

  for (const courseData of coursesData) {
    const course = await prisma.course.create({
      data: courseData,
    });
    courses[courseData.courseCode] = course;
  }

  // Create general rules
  const rulesData = [
    {
      name: 'Maximum Course Load',
      type: RuleType.OTHER,
      description: 'Students cannot take more than 8 courses per semester.',
      isActive: true,
    },
    {
      name: 'Schedule Conflicts',
      type: RuleType.SCHEDULE_OVERLAP,
      description: 'Students cannot have overlapping course periods.',
      isActive: true,
    },
    {
      name: 'Grade Level Requirements',
      type: RuleType.GRADE_REQUIREMENT,
      description: 'Students must meet the minimum grade level for certain courses.',
      isActive: true,
    },
    {
      name: 'Course Capacity Limits',
      type: RuleType.CAPACITY,
      description: 'Courses cannot exceed their maximum capacity.',
      isActive: true,
    },
    {
      name: 'Prerequisite Requirements',
      type: RuleType.PREREQUISITE,
      description: 'Students must complete prerequisite courses before advanced courses.',
      isActive: true,
    },
  ];

  for (const ruleData of rulesData) {
    await prisma.rule.create({
      data: ruleData,
    });
  }

  // Create course-specific rules
  const courseRulesData = [
    {
      courseId: courses['MATH201'].id, // Algebra II
      conflictingCourseId: courses['MATH101'].id, // Algebra I
      type: RuleType.PREREQUISITE,
      description: 'Algebra I is a prerequisite for Algebra II',
      isActive: true,
    },
    {
      courseId: courses['CHEM201'].id, // Chemistry
      conflictingCourseId: courses['BIO101'].id, // Biology
      type: RuleType.PREREQUISITE,
      description: 'Biology is a prerequisite for Chemistry',
      isActive: true,
    },
    {
      courseId: courses['PHYS201'].id, // Physics
      conflictingCourseId: courses['MATH201'].id, // Algebra II
      type: RuleType.PREREQUISITE,
      description: 'Algebra II is a prerequisite for Physics',
      isActive: true,
    },
    {
      courseId: courses['BIO201'].id, // Advanced Biology
      conflictingCourseId: courses['BIO101'].id, // Biology
      type: RuleType.PREREQUISITE,
      description: 'Biology is a prerequisite for Advanced Biology',
      isActive: true,
    },
    {
      courseId: courses['PHYS201'].id, // Physics
      conflictingCourseId: courses['ENG103'].id, // English Literature
      type: RuleType.SCHEDULE_OVERLAP,
      description: 'Physics and English Literature are scheduled at the same time (Period 3)',
      isActive: true,
    },
  ];

  for (const courseRuleData of courseRulesData) {
    await prisma.courseRule.create({
      data: courseRuleData,
    });
  }

  // Create a schedule for John Smith
  const johnSmithSchedule = await prisma.schedule.create({
    data: {
      studentId: students['John Smith'].id,
      semester: 'Fall',
      year: 2024,
      courses: {
        connect: [
          { id: courses['MATH101'].id }, // Algebra I
          { id: courses['BIO101'].id },  // Biology
          { id: courses['ENG103'].id },  // English Literature
          { id: courses['HIST102'].id }, // World History
          { id: courses['SPAN101'].id }, // Spanish I
          { id: courses['ART102'].id },  // Art History
        ]
      }
    }
  });

  console.log(`Created schedule for John Smith with ID: ${johnSmithSchedule.id}`);

  // Update course enrollment numbers
  await prisma.course.update({
    where: { id: courses['MATH101'].id },
    data: { currentEnrollment: { increment: 1 } }
  });
  await prisma.course.update({
    where: { id: courses['BIO101'].id },
    data: { currentEnrollment: { increment: 1 } }
  });
  await prisma.course.update({
    where: { id: courses['ENG103'].id },
    data: { currentEnrollment: { increment: 1 } }
  });
  await prisma.course.update({
    where: { id: courses['HIST102'].id },
    data: { currentEnrollment: { increment: 1 } }
  });
  await prisma.course.update({
    where: { id: courses['SPAN101'].id },
    data: { currentEnrollment: { increment: 1 } }
  });
  await prisma.course.update({
    where: { id: courses['ART102'].id },
    data: { currentEnrollment: { increment: 1 } }
  });

  // Create a schedule change request for John Smith
  // John wants to switch from Algebra I to Algebra II
  const scheduleChangeRequest = await prisma.scheduleChangeRequest.create({
    data: {
      studentId: students['John Smith'].id,
      counselorId: counselor.id,
      currentCourseId: courses['MATH101'].id, // Algebra I
      newCourseId: courses['MATH201'].id,     // Algebra II
      reason: "I've completed the Algebra I summer course and would like to advance to Algebra II.",
      comments: "Student provided certificate of completion for summer Algebra I course.",
      status: RequestStatus.PENDING
    }
  });

  console.log(`Created schedule change request for John Smith with ID: ${scheduleChangeRequest.id}`);

  // Create a conflict for this request based on the prerequisite rule
  const conflict = await prisma.conflict.create({
    data: {
      description: "Prerequisite course (Algebra I) is currently enrolled and not completed",
      courseId: courses['MATH201'].id,
      requestId: scheduleChangeRequest.id,
      resolved: false,
      type: "PREREQUISITE"
    }
  });

  console.log(`Created conflict for John's schedule change request with ID: ${conflict.id}`);

  // Create a notification for John about his request
  const notification = await prisma.notification.create({
    data: {
      studentId: students['John Smith'].id,
      message: "Your schedule change request has been submitted. A counselor will review it shortly.",
      read: false,
      type: "REQUEST_UPDATE"
    }
  });

  console.log(`Created notification for John Smith with ID: ${notification.id}`);

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error in seed script:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
