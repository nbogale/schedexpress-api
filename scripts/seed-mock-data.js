/**
 * SchedExpress Mock Data Seeding Script
 * 
 * This script generates comprehensive mock data for Lincoln Middle School
 * and seeds the database with realistic test data.
 * 
 * Usage:
 * node scripts/seed-mock-data.js
 * 
 * Or with specific options:
 * node scripts/seed-mock-data.js --students=1000 --teachers=65 --clear=true
 */

const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  schoolName: 'Lincoln High School',
  academicYear: '2024-2025',
  totalStudents: 1200,
  totalTeachers: 85,
  totalStaff: 110,
  clearExisting: false
};

// Parse command line arguments
const args = process.argv.slice(2);
args.forEach(arg => {
  if (arg.startsWith('--students=')) {
    config.totalStudents = parseInt(arg.split('=')[1]);
  } else if (arg.startsWith('--teachers=')) {
    config.totalTeachers = parseInt(arg.split('=')[1]);
  } else if (arg.startsWith('--clear=')) {
    config.clearExisting = arg.split('=')[1] === 'true';
  }
});

// Data generators
class MockDataGenerator {
  constructor() {
    this.departments = [
      { name: 'Mathematics', head: 'Dr. Sarah Johnson' },
      { name: 'English Language Arts', head: 'Ms. Emily Rodriguez' },
      { name: 'Science', head: 'Mr. David Chen' },
      { name: 'Social Studies', head: 'Mrs. Lisa Thompson' },
      { name: 'Physical Education', head: 'Coach Michael Brown' },
      { name: 'Arts & Music', head: 'Ms. Jennifer Davis' },
      { name: 'World Languages', head: 'Señora Maria Garcia' },
      { name: 'Technology & Computer Science', head: 'Mr. Robert Wilson' },
      { name: 'Special Education', head: 'Mrs. Amanda Foster' },
      { name: 'Counseling', head: 'Dr. Patricia Lee' }
    ];

    this.gradeLevels = [
      { name: 'Grade 9', level: 9, studentCount: Math.floor(config.totalStudents * 0.25) },
      { name: 'Grade 10', level: 10, studentCount: Math.floor(config.totalStudents * 0.25) },
      { name: 'Grade 11', level: 11, studentCount: Math.floor(config.totalStudents * 0.25) },
      { name: 'Grade 12', level: 12, studentCount: Math.floor(config.totalStudents * 0.25) }
    ];

    this.timeBlocks = [
      { name: 'Period 1', startTime: '08:00:00', endTime: '08:50:00' },
      { name: 'Period 2', startTime: '08:55:00', endTime: '09:45:00' },
      { name: 'Period 3', startTime: '09:50:00', endTime: '10:40:00' },
      { name: 'Period 4', startTime: '10:45:00', endTime: '11:35:00' },
      { name: 'Period 5', startTime: '12:25:00', endTime: '13:15:00' },
      { name: 'Period 6', startTime: '13:20:00', endTime: '14:10:00' },
      { name: 'Period 7', startTime: '14:15:00', endTime: '15:05:00' },
      { name: 'Period 8', startTime: '15:10:00', endTime: '16:00:00' },
      { name: 'Advisory', startTime: '07:45:00', endTime: '08:00:00' },
      { name: 'Lunch', startTime: '11:40:00', endTime: '12:20:00' }
    ];

    this.firstNames = {
      male: ['Alex', 'Caleb', 'Ethan', 'Gabriel', 'Isaac', 'Kyle', 'Marcus', 'Oscar', 'Quinn', 'Samuel', 'Ulysses', 'William', 'Yusuf', 'Aaron', 'Cameron', 'David', 'Felix', 'Henry', 'Jake', 'Liam', 'Noah', 'Peter', 'Ryan', 'Tyler', 'Victor', 'Zachary'],
      female: ['Bella', 'Diana', 'Fiona', 'Hannah', 'Julia', 'Luna', 'Nina', 'Penelope', 'Ruby', 'Tessa', 'Violet', 'Ximena', 'Amanda', 'Brooke', 'Chloe', 'Emma', 'Grace', 'Isabella', 'Kate', 'Maya', 'Olivia', 'Paige', 'Sophia', 'Zoe', 'Ava', 'Charlotte']
    };

    this.lastNames = ['Thompson', 'Rodriguez', 'Johnson', 'Martinez', 'Williams', 'Chen', 'Brown', 'Davis', 'Wilson', 'Garcia', 'Anderson', 'Taylor', 'Lee', 'Park', 'Kim', 'White', 'Jackson', 'Harris', 'Martin', 'Thompson', 'Garcia', 'Martinez', 'Robinson', 'Clark', 'Rodriguez', 'Lewis', 'Lee', 'Walker', 'Hall', 'Allen', 'Young', 'Hernandez', 'King', 'Wright', 'Lopez', 'Hill', 'Scott', 'Green', 'Adams', 'Baker', 'Gonzalez', 'Nelson', 'Carter', 'Mitchell', 'Perez', 'Roberts', 'Turner', 'Phillips', 'Campbell', 'Parker', 'Evans', 'Edwards', 'Collins', 'Stewart', 'Sanchez', 'Morris', 'Rogers', 'Reed', 'Cook', 'Morgan', 'Bell', 'Murphy', 'Bailey', 'Rivera', 'Cooper', 'Richardson', 'Cox', 'Howard', 'Ward', 'Torres', 'Peterson', 'Gray', 'Ramirez', 'James', 'Watson', 'Brooks', 'Kelly', 'Sanders', 'Price', 'Bennett', 'Wood', 'Barnes', 'Ross', 'Henderson', 'Coleman', 'Jenkins', 'Perry', 'Powell', 'Long', 'Patterson', 'Hughes', 'Flores', 'Washington', 'Butler', 'Simmons', 'Foster', 'Gonzales', 'Bryant', 'Alexander', 'Russell', 'Griffin', 'Diaz', 'Hayes'];
  }

  generateId(prefix, index) {
    return `${prefix}-${String(index).padStart(3, '0')}`;
  }

  generateEmail(firstName, lastName, role) {
    const domain = role === 'STUDENT' ? 'student.lincolnhs.edu' : 'lincolnhs.edu';
    return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`;
  }

  generateUsername(firstName, lastName) {
    return `${firstName.toLowerCase()}.${lastName.toLowerCase()}`;
  }

  generateStudentId(gradeLevel, index) {
    const year = '24';
    const grade = gradeLevel === 9 ? '9' : gradeLevel === 10 ? '10' : gradeLevel === 11 ? '11' : '12';
    return `${year}${grade}${String(index).padStart(3, '0')}`;
  }

  generateStudents() {
    const students = [];
    let studentIndex = 1;

    this.gradeLevels.forEach(grade => {
      for (let i = 0; i < grade.studentCount; i++) {
        const isMale = Math.random() < 0.5;
        const firstName = isMale 
          ? this.firstNames.male[Math.floor(Math.random() * this.firstNames.male.length)]
          : this.firstNames.female[Math.floor(Math.random() * this.firstNames.female.length)];
        const lastName = this.lastNames[Math.floor(Math.random() * this.lastNames.length)];
        
        students.push({
          id: this.generateId('user-student', studentIndex),
          email: this.generateEmail(firstName, lastName, 'STUDENT'),
          username: this.generateUsername(firstName, lastName),
          firstName,
          lastName,
          role: 'STUDENT',
          gradeLevel: grade.name,
          studentId: this.generateStudentId(grade.level, i + 1),
          isActive: true
        });
        studentIndex++;
      }
    });

    return students;
  }

  generateTeachers() {
    const teachers = [];
    const teacherNames = [
      { firstName: 'Sarah', lastName: 'Johnson', department: 'Mathematics' },
      { firstName: 'James', lastName: 'Miller', department: 'Mathematics' },
      { firstName: 'Emily', lastName: 'Rodriguez', department: 'English Language Arts' },
      { firstName: 'Christopher', lastName: 'Taylor', department: 'English Language Arts' },
      { firstName: 'David', lastName: 'Chen', department: 'Science' },
      { firstName: 'Maria', lastName: 'Rodriguez', department: 'Science' },
      { firstName: 'Lisa', lastName: 'Thompson', department: 'Social Studies' },
      { firstName: 'Michael', lastName: 'Brown', department: 'Physical Education' },
      { firstName: 'Jennifer', lastName: 'Davis', department: 'Arts & Music' },
      { firstName: 'Maria', lastName: 'Garcia', department: 'World Languages' },
      { firstName: 'Robert', lastName: 'Wilson', department: 'Technology & Computer Science' },
      { firstName: 'Amanda', lastName: 'Foster', department: 'Special Education' }
    ];

    teacherNames.forEach((teacher, index) => {
      teachers.push({
        id: this.generateId('user-teacher', index + 1),
        email: this.generateEmail(teacher.firstName, teacher.lastName, 'TEACHER'),
        username: this.generateUsername(teacher.firstName, teacher.lastName),
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        role: 'TEACHER',
        department: teacher.department,
        isActive: true
      });
    });

    return teachers;
  }

  generateParents(students) {
    const parents = [];
    const parentNames = ['John', 'Maria', 'Robert', 'Lisa', 'David', 'Jennifer', 'Michael', 'Sarah', 'Christopher', 'Amanda'];

    students.forEach((student, index) => {
      if (index < parentNames.length) {
        const parentName = parentNames[index];
        parents.push({
          id: this.generateId('user-parent', index + 1),
          email: this.generateEmail(parentName, student.lastName, 'PARENT_GUARDIAN'),
          username: this.generateUsername(parentName, student.lastName),
          firstName: parentName,
          lastName: student.lastName,
          role: 'PARENT_GUARDIAN',
          isActive: true,
          children: [student.id]
        });
      }
    });

    return parents;
  }

  generateAdministrators() {
    return [
      {
        id: 'user-admin-001',
        email: 'p.williams@lincolnhs.edu',
        username: 'p.williams',
        firstName: 'Patricia',
        lastName: 'Williams',
        role: 'ADMIN',
        position: 'Principal',
        isActive: true
      },
      {
        id: 'user-admin-002',
        email: 'j.anderson@lincolnhs.edu',
        username: 'j.anderson',
        firstName: 'James',
        lastName: 'Anderson',
        role: 'ADMIN',
        position: 'Vice Principal',
        isActive: true
      }
    ];
  }

  generateCounselors() {
    return [
      {
        id: 'user-counselor-001',
        email: 'p.lee@lincolnhs.edu',
        username: 'p.lee',
        firstName: 'Patricia',
        lastName: 'Lee',
        role: 'COUNSELOR',
        position: 'Head Counselor',
        isActive: true
      },
      {
        id: 'user-counselor-002',
        email: 'm.torres@lincolnhs.edu',
        username: 'm.torres',
        firstName: 'Michael',
        lastName: 'Torres',
        role: 'COUNSELOR',
        position: 'Grade 9 Counselor',
        isActive: true
      },
      {
        id: 'user-counselor-003',
        email: 'j.adams@lincolnhs.edu',
        username: 'j.adams',
        firstName: 'Jennifer',
        lastName: 'Adams',
        role: 'COUNSELOR',
        position: 'Grade 10 Counselor',
        isActive: true
      },
      {
        id: 'user-counselor-004',
        email: 'r.kim@lincolnhs.edu',
        username: 'r.kim',
        firstName: 'Robert',
        lastName: 'Kim',
        role: 'COUNSELOR',
        position: 'Grade 11 Counselor',
        isActive: true
      },
      {
        id: 'user-counselor-005',
        email: 's.garcia@lincolnhs.edu',
        username: 's.garcia',
        firstName: 'Sarah',
        lastName: 'Garcia',
        role: 'COUNSELOR',
        position: 'Grade 12 Counselor',
        isActive: true
      },
      {
        id: 'user-counselor-006',
        email: 'd.martinez@lincolnhs.edu',
        username: 'd.martinez',
        firstName: 'David',
        lastName: 'Martinez',
        role: 'COUNSELOR',
        position: 'College & Career Counselor',
        isActive: true
      }
    ];
  }

  generateCourses() {
    return [
      // Mathematics
      { id: 'course-math-901', name: 'Algebra I', code: 'MATH-901', department: 'Mathematics', gradeLevel: 'Grade 9', credits: 1.0 },
      { id: 'course-math-902', name: 'Geometry', code: 'MATH-902', department: 'Mathematics', gradeLevel: 'Grade 10', credits: 1.0 },
      { id: 'course-math-903', name: 'Algebra II', code: 'MATH-903', department: 'Mathematics', gradeLevel: 'Grade 11', credits: 1.0 },
      { id: 'course-math-904', name: 'Pre-Calculus', code: 'MATH-904', department: 'Mathematics', gradeLevel: 'Grade 12', credits: 1.0 },
      { id: 'course-math-905', name: 'AP Calculus AB', code: 'MATH-905', department: 'Mathematics', gradeLevel: 'Grade 12', credits: 1.0 },

      // English
      { id: 'course-eng-901', name: 'English 9', code: 'ENG-901', department: 'English Language Arts', gradeLevel: 'Grade 9', credits: 1.0 },
      { id: 'course-eng-902', name: 'English 10', code: 'ENG-902', department: 'English Language Arts', gradeLevel: 'Grade 10', credits: 1.0 },
      { id: 'course-eng-903', name: 'English 11', code: 'ENG-903', department: 'English Language Arts', gradeLevel: 'Grade 11', credits: 1.0 },
      { id: 'course-eng-904', name: 'English 12', code: 'ENG-904', department: 'English Language Arts', gradeLevel: 'Grade 12', credits: 1.0 },
      { id: 'course-eng-905', name: 'AP English Language', code: 'ENG-905', department: 'English Language Arts', gradeLevel: 'Grade 11', credits: 1.0 },

      // Science
      { id: 'course-sci-901', name: 'Biology', code: 'SCI-901', department: 'Science', gradeLevel: 'Grade 9', credits: 1.0 },
      { id: 'course-sci-902', name: 'Chemistry', code: 'SCI-902', department: 'Science', gradeLevel: 'Grade 10', credits: 1.0 },
      { id: 'course-sci-903', name: 'Physics', code: 'SCI-903', department: 'Science', gradeLevel: 'Grade 11', credits: 1.0 },
      { id: 'course-sci-904', name: 'AP Biology', code: 'SCI-904', department: 'Science', gradeLevel: 'Grade 11', credits: 1.0 },
      { id: 'course-sci-905', name: 'AP Chemistry', code: 'SCI-905', department: 'Science', gradeLevel: 'Grade 11', credits: 1.0 },

      // Social Studies
      { id: 'course-ss-901', name: 'World History', code: 'SS-901', department: 'Social Studies', gradeLevel: 'Grade 9', credits: 1.0 },
      { id: 'course-ss-902', name: 'US History', code: 'SS-902', department: 'Social Studies', gradeLevel: 'Grade 11', credits: 1.0 },
      { id: 'course-ss-903', name: 'Government', code: 'SS-903', department: 'Social Studies', gradeLevel: 'Grade 12', credits: 0.5 },
      { id: 'course-ss-904', name: 'Economics', code: 'SS-904', department: 'Social Studies', gradeLevel: 'Grade 12', credits: 0.5 },
      { id: 'course-ss-905', name: 'AP World History', code: 'SS-905', department: 'Social Studies', gradeLevel: 'Grade 10', credits: 1.0 },

      // Physical Education
      { id: 'course-pe-901', name: 'Physical Education 9', code: 'PE-901', department: 'Physical Education & Health', gradeLevel: 'Grade 9', credits: 0.5 },
      { id: 'course-pe-902', name: 'Physical Education 10', code: 'PE-902', department: 'Physical Education & Health', gradeLevel: 'Grade 10', credits: 0.5 },
      { id: 'course-pe-903', name: 'Physical Education 11', code: 'PE-903', department: 'Physical Education & Health', gradeLevel: 'Grade 11', credits: 0.5 },
      { id: 'course-pe-904', name: 'Physical Education 12', code: 'PE-904', department: 'Physical Education & Health', gradeLevel: 'Grade 12', credits: 0.5 },

      // Arts & Music
      { id: 'course-art-901', name: 'Art 9', code: 'ART-901', department: 'Arts & Music', gradeLevel: 'Grade 9', credits: 0.5 },
      { id: 'course-art-902', name: 'Art 10', code: 'ART-902', department: 'Arts & Music', gradeLevel: 'Grade 10', credits: 0.5 },
      { id: 'course-art-903', name: 'Art 11', code: 'ART-903', department: 'Arts & Music', gradeLevel: 'Grade 11', credits: 0.5 },
      { id: 'course-art-904', name: 'Art 12', code: 'ART-904', department: 'Arts & Music', gradeLevel: 'Grade 12', credits: 0.5 },
      { id: 'course-art-905', name: 'AP Studio Art', code: 'ART-905', department: 'Arts & Music', gradeLevel: 'Grade 12', credits: 1.0 },

      // Technology
      { id: 'course-tech-901', name: 'Computer Science I', code: 'TECH-901', department: 'Technology & Computer Science', gradeLevel: 'Grade 9', credits: 1.0 },
      { id: 'course-tech-902', name: 'Computer Science II', code: 'TECH-902', department: 'Technology & Computer Science', gradeLevel: 'Grade 10', credits: 1.0 },
      { id: 'course-tech-903', name: 'AP Computer Science A', code: 'TECH-903', department: 'Technology & Computer Science', gradeLevel: 'Grade 11', credits: 1.0 },

      // World Languages
      { id: 'course-lang-901', name: 'Spanish I', code: 'SPAN-901', department: 'World Languages', gradeLevel: 'Grade 9', credits: 1.0 },
      { id: 'course-lang-902', name: 'Spanish II', code: 'SPAN-902', department: 'World Languages', gradeLevel: 'Grade 10', credits: 1.0 },
      { id: 'course-lang-903', name: 'Spanish III', code: 'SPAN-903', department: 'World Languages', gradeLevel: 'Grade 11', credits: 1.0 },
      { id: 'course-lang-904', name: 'Spanish IV', code: 'SPAN-904', department: 'World Languages', gradeLevel: 'Grade 12', credits: 1.0 },
      { id: 'course-lang-905', name: 'AP Spanish', code: 'SPAN-905', department: 'World Languages', gradeLevel: 'Grade 12', credits: 1.0 },

      // Career & Technical Education
      { id: 'course-cte-901', name: 'Business Management', code: 'CTE-901', department: 'Career & Technical Education', gradeLevel: 'Grade 10', credits: 1.0 },
      { id: 'course-cte-902', name: 'Marketing', code: 'CTE-902', department: 'Career & Technical Education', gradeLevel: 'Grade 11', credits: 1.0 },
      { id: 'course-cte-903', name: 'Accounting', code: 'CTE-903', department: 'Career & Technical Education', gradeLevel: 'Grade 12', credits: 1.0 },
      { id: 'course-cte-904', name: 'Culinary Arts', code: 'CTE-904', department: 'Career & Technical Education', gradeLevel: 'Grade 11', credits: 1.0 },
      { id: 'course-cte-905', name: 'Automotive Technology', code: 'CTE-905', department: 'Career & Technical Education', gradeLevel: 'Grade 12', credits: 1.0 }
    ];
  }

  generateScheduleChangeRequests(students) {
    const requests = [];
    const requestTypes = ['ADD_COURSE', 'DROP_COURSE', 'CHANGE_SECTION'];
    const priorities = ['LOW', 'MEDIUM', 'HIGH'];
    const statuses = ['PENDING', 'APPROVED', 'REJECTED', 'UNDER_REVIEW'];

    // Generate 50 sample requests
    for (let i = 0; i < 50; i++) {
      const student = students[Math.floor(Math.random() * students.length)];
      const requestType = requestTypes[Math.floor(Math.random() * requestTypes.length)];
      const priority = priorities[Math.floor(Math.random() * priorities.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      requests.push({
        id: this.generateId('scr', i + 1),
        studentId: student.id,
        requestType,
        reason: this.generateRequestReason(requestType),
        priority,
        status,
        academicCycleId: 'cycle-2024-2025'
      });
    }

    return requests;
  }

  generateRequestReason(requestType) {
    const reasons = {
      'ADD_COURSE': [
        'Interested in pursuing this subject for college preparation',
        'Need to meet graduation requirements',
        'Want to explore new academic interests',
        'Recommended by counselor for college readiness',
        'Need AP course for college applications',
        'Want to build college portfolio'
      ],
      'DROP_COURSE': [
        'Schedule conflict with other activities',
        'Already proficient in this subject',
        'Need to focus on other academic priorities',
        'Health-related accommodation needed',
        'Want to focus on AP courses',
        'Need to balance workload for college prep'
      ],
      'CHANGE_SECTION': [
        'Schedule conflict with band practice',
        'Need different time slot for transportation',
        'Prefer different teacher',
        'Time conflict with other commitments',
        'Need to balance AP course schedule',
        'Want to align with college prep timeline'
      ]
    };

    const typeReasons = reasons[requestType];
    return typeReasons[Math.floor(Math.random() * typeReasons.length)];
  }

  generateAllData() {
    console.log('🎓 Generating mock data for Lincoln High School...');
    
    const students = this.generateStudents();
    const teachers = this.generateTeachers();
    const parents = this.generateParents(students);
    const administrators = this.generateAdministrators();
    const counselors = this.generateCounselors();
    const courses = this.generateCourses();
    const scheduleChangeRequests = this.generateScheduleChangeRequests(students);

    const mockData = {
      school: {
        name: config.schoolName,
        type: 'Public Middle School (Grades 6-8)',
        academicYear: config.academicYear,
        totalStudents: students.length,
        totalTeachers: teachers.length,
        totalStaff: teachers.length + administrators.length + counselors.length
      },
      departments: this.departments,
      gradeLevels: this.gradeLevels,
      timeBlocks: this.timeBlocks,
      students,
      teachers,
      parents,
      administrators,
      counselors,
      courses,
      scheduleChangeRequests,
      generatedAt: new Date().toISOString(),
      config
    };

    return mockData;
  }
}

// Main execution
function main() {
  console.log('🚀 SchedExpress Mock Data Generator');
  console.log('=====================================');
  console.log(`School: ${config.schoolName}`);
  console.log(`Academic Year: ${config.academicYear}`);
  console.log(`Students: ${config.totalStudents}`);
  console.log(`Teachers: ${config.totalTeachers}`);
  console.log(`Clear Existing: ${config.clearExisting}`);
  console.log('');

  const generator = new MockDataGenerator();
  const mockData = generator.generateAllData();

  // Save to JSON file
  const outputPath = path.join(__dirname, '..', 'mock-data-generated.json');
  fs.writeFileSync(outputPath, JSON.stringify(mockData, null, 2));
  
  console.log('✅ Mock data generated successfully!');
  console.log(`📁 Output file: ${outputPath}`);
  console.log('');
  console.log('📊 Generated Data Summary:');
  console.log(`   - Students: ${mockData.students.length}`);
  console.log(`   - Teachers: ${mockData.teachers.length}`);
  console.log(`   - Parents: ${mockData.parents.length}`);
  console.log(`   - Administrators: ${mockData.administrators.length}`);
  console.log(`   - Counselors: ${mockData.counselors.length}`);
  console.log(`   - Courses: ${mockData.courses.length}`);
  console.log(`   - Schedule Change Requests: ${mockData.scheduleChangeRequests.length}`);
  console.log('');
  console.log('🎯 Next Steps:');
  console.log('   1. Review the generated data in mock-data-generated.json');
  console.log('   2. Import the data into your database using your preferred method');
  console.log('   3. Test the SchedExpress application with the mock data');
  console.log('');
  console.log('💡 Tips:');
  console.log('   - Adjust the configuration at the top of this script for different data sizes');
  console.log('   - Use command line arguments to customize generation: --students=500 --teachers=30');
  console.log('   - The data includes realistic relationships between students, parents, and courses');
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { MockDataGenerator, config };
