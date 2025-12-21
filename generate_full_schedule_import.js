/**
 * Script to generate a complete schedule import CSV file from seed data
 * This generates all student-course section assignments based on the seed file logic
 */

const fs = require('fs');
const path = require('path');

// Academic cycle name
const ACADEMIC_CYCLE_NAME = '2025-2026';

// Course codes (matching seed file order)
const COURSE_CODES = [
  'MATH-901', // Algebra I
  'MATH-902', // Geometry
  'MATH-903', // Algebra II
  'MATH-904', // Pre-Calculus
  'MATH-905', // AP Calculus AB
  'ELA-901',  // English 9
  'ELA-902',  // English 10
  'ELA-903',  // English 11
  'ELA-904',  // AP English Language
  'ELA-905',  // English 12
  'SCI-901',  // Biology
  'SCI-902',  // Chemistry
  'SCI-903',  // Physics
  'SCI-904',  // AP Biology
  'SCI-905',  // AP Chemistry
  'SCI-906',  // AP Physics 1
  'SCI-907',  // Environmental Science
  'SOC-901',  // World History
  'SOC-902',  // US History
  'SOC-903',  // AP US History
  'SOC-904',  // Government
  'SOC-905',  // Economics
  'SOC-906',  // AP World History
  'FL-901',   // Spanish I
  'FL-902',   // Spanish II
  'FL-903',   // AP Spanish Language
  'FL-904',   // French I
  'FL-905',   // French II
  'PE-901',   // PE 9
  'PE-902',   // PE 10
  'PE-903',   // Health
];

// Course sections configuration (matching seed file)
// Format: [courseIndex, sectionLetter, teacherIndex, roomIndex, timeBlockIndex, maxEnrollment]
const COURSE_SECTIONS = [
  // Math sections
  [0, 'A', 0, 0, 0, 25], [0, 'B', 1, 1, 1, 25], [0, 'C', 2, 2, 2, 25], [0, 'D', 3, 3, 3, 25], [0, 'E', 4, 4, 4, 25], [0, 'F', 5, 5, 5, 25], // Algebra I - 6 sections
  [1, 'A', 6, 6, 0, 25], [1, 'B', 7, 7, 1, 25], [1, 'C', 8, 8, 2, 25], [1, 'D', 9, 9, 3, 25], [1, 'E', 10, 10, 4, 25], // Geometry - 5 sections
  [2, 'A', 11, 11, 0, 25], [2, 'B', 12, 12, 1, 25], [2, 'C', 13, 13, 2, 25], [2, 'D', 14, 14, 3, 25], [2, 'E', 15, 15, 4, 25], // Algebra II - 5 sections
  [3, 'A', 16, 16, 0, 25], [3, 'B', 17, 17, 1, 25], [3, 'C', 18, 18, 2, 25], // Pre-Calculus - 3 sections
  [4, 'A', 19, 19, 0, 25], [4, 'B', 20, 20, 1, 25], // AP Calculus AB - 2 sections
  
  // English sections
  [5, 'A', 21, 21, 0, 25], [5, 'B', 22, 22, 1, 25], [5, 'C', 23, 23, 2, 25], [5, 'D', 24, 24, 3, 25], [5, 'E', 0, 25, 4, 25], // English 9 - 5 sections
  [6, 'A', 1, 26, 0, 25], [6, 'B', 2, 27, 1, 25], [6, 'C', 3, 28, 2, 25], [6, 'D', 4, 29, 3, 25], [6, 'E', 5, 30, 4, 25], // English 10 - 5 sections
  [7, 'A', 6, 31, 0, 25], [7, 'B', 7, 32, 1, 25], [7, 'C', 8, 33, 2, 25], [7, 'D', 9, 34, 3, 25], [7, 'E', 10, 35, 4, 25], // English 11 - 5 sections
  [8, 'A', 11, 36, 0, 25], [8, 'B', 12, 37, 1, 25], // AP English Language - 2 sections
  [9, 'A', 13, 38, 0, 25], [9, 'B', 14, 39, 1, 25], [9, 'C', 15, 40, 2, 25], [9, 'D', 16, 41, 3, 25], [9, 'E', 17, 42, 4, 25], // English 12 - 5 sections
  
  // Science sections
  [10, 'A', 18, 31, 0, 25], [10, 'B', 19, 32, 1, 25], [10, 'C', 20, 33, 2, 25], [10, 'D', 21, 34, 3, 25], // Biology - 4 sections
  [11, 'A', 22, 35, 0, 25], [11, 'B', 23, 0, 1, 25], [11, 'C', 24, 1, 2, 25], [11, 'D', 0, 2, 3, 25], // Chemistry - 4 sections
  [12, 'A', 1, 3, 0, 25], [12, 'B', 2, 4, 1, 25], [12, 'C', 3, 5, 2, 25], // Physics - 3 sections
  [13, 'A', 4, 6, 0, 25], [13, 'B', 5, 7, 1, 25], // AP Biology - 2 sections
  [14, 'A', 6, 8, 0, 25], [14, 'B', 7, 9, 1, 25], // AP Chemistry - 2 sections
  [15, 'A', 8, 10, 0, 25], [15, 'B', 9, 11, 1, 25], // AP Physics 1 - 2 sections
  [16, 'A', 10, 12, 0, 25], [16, 'B', 11, 13, 1, 25], // Environmental Science - 2 sections
  
  // Social Studies sections
  [17, 'A', 12, 14, 0, 25], [17, 'B', 13, 15, 1, 25], [17, 'C', 14, 16, 2, 25], [17, 'D', 15, 17, 3, 25], // World History - 4 sections
  [18, 'A', 16, 18, 0, 25], [18, 'B', 17, 19, 1, 25], [18, 'C', 18, 20, 2, 25], [18, 'D', 19, 21, 3, 25], // US History - 4 sections
  [19, 'A', 20, 22, 0, 25], [19, 'B', 21, 23, 1, 25], // AP US History - 2 sections
  [20, 'A', 22, 24, 0, 25], [20, 'B', 23, 25, 1, 25], [20, 'C', 24, 26, 2, 25], // Government - 3 sections
  [21, 'A', 0, 27, 0, 25], [21, 'B', 1, 28, 1, 25], // Economics - 2 sections
  [22, 'A', 2, 29, 0, 25], [22, 'B', 3, 30, 1, 25], // AP World History - 2 sections
  
  // Foreign Language sections
  [23, 'A', 4, 31, 0, 25], [23, 'B', 5, 32, 1, 25], [23, 'C', 6, 33, 2, 25], // Spanish I - 3 sections
  [24, 'A', 7, 34, 0, 25], [24, 'B', 8, 35, 1, 25], [24, 'C', 9, 0, 2, 25], // Spanish II - 3 sections
  [25, 'A', 10, 1, 0, 25], [25, 'B', 11, 2, 1, 25], // AP Spanish Language - 2 sections
  [26, 'A', 12, 3, 0, 25], [26, 'B', 13, 4, 1, 25], // French I - 2 sections
  [27, 'A', 14, 5, 0, 25], [27, 'B', 15, 6, 1, 25], // French II - 2 sections
  
  // Physical Education sections
  [28, 'A', 16, 7, 0, 25], [28, 'B', 17, 8, 1, 25], [28, 'C', 18, 9, 2, 25], [28, 'D', 19, 10, 3, 25], [28, 'E', 20, 11, 4, 25], // PE 9 - 5 sections
  [29, 'A', 21, 22, 0, 25], [29, 'B', 22, 23, 1, 25], [29, 'C', 23, 24, 2, 25], [29, 'D', 24, 25, 3, 25], [29, 'E', 0, 26, 4, 25], // PE 10 - 5 sections
  [30, 'A', 1, 27, 0, 25], [30, 'B', 2, 28, 1, 25], [30, 'C', 3, 29, 2, 25], [30, 'D', 4, 30, 3, 25], // Health - 4 sections
];

// Teacher IDs (TCH001-TCH026)
const getTeacherId = (index) => `TCH${String(index + 1).padStart(3, '0')}`;

// Room names (matching seed file)
const ROOM_NAMES = [
  '101', '102', '103', '104', '105', '106', '107', '108', '109', '110',
  '201', '202', '203', '204', '205', '206', '207', '208', '209', '210',
  '301', '302', '303', '304', '305', '306', '307', '308', '309', '310',
  'Gym', 'Auditorium', 'Science Lab 1', 'Science Lab 2', 'Science Lab 3', 'Science Lab 4',
  'Art Room 1', 'Art Room 2', 'Music Room', 'Band Room', 'Computer Lab 1', 'Computer Lab 2',
  'Library', 'Cafeteria', 'Weight Room', 'Drama Room'
];

// Time block names
const TIME_BLOCK_NAMES = [
  'Period 1', 'Period 2', 'Period 3', 'Period 4', 'Period 5', 'Period 6', 'Period 7', 'Period 8'
];

// Generate student IDs (240001-240500)
const generateStudentIds = () => {
  const students = [];
  for (let i = 0; i < 500; i++) {
    students.push(String(240001 + i).padStart(6, '0'));
  }
  return students;
};

// Simulate the enrollment logic from seed file
function generateScheduleRows() {
  const students = generateStudentIds();
  const studentCourseCount = {};
  students.forEach(studentId => {
    studentCourseCount[studentId] = 0;
  });

  const rows = [];
  let studentIndex = 0;

  // Process each course section
  for (const section of COURSE_SECTIONS) {
    const [courseIndex, sectionLetter, teacherIndex, roomIndex, timeBlockIndex, maxEnrollment] = section;
    const courseCode = COURSE_CODES[courseIndex];
    const teacherId = getTeacherId(teacherIndex);
    const roomName = ROOM_NAMES[roomIndex];
    const timeBlockName = TIME_BLOCK_NAMES[timeBlockIndex];

    // Enroll students (up to maxEnrollment, but respecting 6 courses per student limit)
    let enrolled = 0;
    let attempts = 0;
    const maxAttempts = students.length * 2; // Prevent infinite loop

    while (enrolled < maxEnrollment && attempts < maxAttempts) {
      const studentId = students[studentIndex % students.length];
      
      if (studentCourseCount[studentId] < 6) {
        rows.push({
          studentId,
          academicCycleName: ACADEMIC_CYCLE_NAME,
          courseCode,
          sectionNumber: sectionLetter,
          timeBlockName,
          endTimeBlockName: '', // Optional, leave empty
          roomName,
          teacherId,
          maxEnrollment: maxEnrollment.toString(),
          rotationDay: '', // Optional, leave empty for most
        });
        
        studentCourseCount[studentId]++;
        enrolled++;
      }
      
      studentIndex++;
      attempts++;
    }
  }

  return rows;
}

// Generate CSV content
function generateCSV(rows) {
  const headers = [
    'student_id',
    'academic_cycle_name',
    'course_code',
    'section_number',
    'time_block_name',
    'end_time_block_name',
    'room_name',
    'teacher_id',
    'max_enrollment',
    'rotation_day'
  ];

  const csvRows = [headers.join(',')];

  for (const row of rows) {
    const values = [
      row.studentId,
      row.academicCycleName,
      row.courseCode,
      row.sectionNumber,
      row.timeBlockName,
      row.endTimeBlockName,
      row.roomName,
      row.teacherId,
      row.maxEnrollment,
      row.rotationDay
    ];
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
}

// Main execution
console.log('Generating full schedule import CSV from seed data...');
const rows = generateScheduleRows();
console.log(`Generated ${rows.length} schedule rows for ${new Set(rows.map(r => r.studentId)).size} students`);

const csvContent = generateCSV(rows);
const outputPath = path.join(__dirname, 'full_schedule_import_from_seed.csv');

fs.writeFileSync(outputPath, csvContent, 'utf8');
console.log(`✅ CSV file generated: ${outputPath}`);
console.log(`📊 Statistics:`);
console.log(`   - Total rows: ${rows.length}`);
console.log(`   - Unique students: ${new Set(rows.map(r => r.studentId)).size}`);
console.log(`   - Unique courses: ${new Set(rows.map(r => r.courseCode)).size}`);
console.log(`   - Unique sections: ${new Set(rows.map(r => `${r.courseCode}-${r.sectionNumber}`)).size}`);

