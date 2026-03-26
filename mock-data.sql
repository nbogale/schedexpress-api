-- SchedExpress Mock Data for Lincoln High School
-- This file contains SQL INSERT statements for a medium-level high school

-- ==============================================
-- DEPARTMENTS
-- ==============================================

INSERT INTO "Department" (id, name, description, createdAt, updatedAt) VALUES
('dept-001', 'Mathematics', 'Mathematics Department - Algebra, Geometry, Pre-Calculus, Calculus, and AP Courses', NOW(), NOW()),
('dept-002', 'English Language Arts', 'English Language Arts Department - Literature, Composition, and AP Courses', NOW(), NOW()),
('dept-003', 'Science', 'Science Department - Biology, Chemistry, Physics, and AP Sciences', NOW(), NOW()),
('dept-004', 'Social Studies', 'Social Studies Department - History, Government, Economics, and AP Courses', NOW(), NOW()),
('dept-005', 'Physical Education & Health', 'Physical Education and Health Department', NOW(), NOW()),
('dept-006', 'Arts & Music', 'Arts and Music Department - Visual Arts, Band, Orchestra, Choir, Drama, and AP Courses', NOW(), NOW()),
('dept-007', 'World Languages', 'World Languages Department - Spanish, French, German, and AP Courses', NOW(), NOW()),
('dept-008', 'Technology & Computer Science', 'Technology and Computer Science Department - Programming, AP Computer Science', NOW(), NOW()),
('dept-009', 'Career & Technical Education', 'Career and Technical Education Department - Business, Culinary, Automotive, Health Sciences', NOW(), NOW()),
('dept-010', 'Special Education', 'Special Education Department - Resource, Life Skills, and Transition Planning', NOW(), NOW()),
('dept-011', 'Counseling', 'Student Counseling and Guidance Department - Academic, Career, and College Planning', NOW(), NOW());

-- ==============================================
-- GRADE LEVELS
-- ==============================================

INSERT INTO "GradeLevel" (id, name, level, description, createdAt, updatedAt) VALUES
('grade-9', 'Grade 9', 9, 'Ninth Grade - Freshman year of high school', NOW(), NOW()),
('grade-10', 'Grade 10', 10, 'Tenth Grade - Sophomore year of high school', NOW(), NOW()),
('grade-11', 'Grade 11', 11, 'Eleventh Grade - Junior year of high school', NOW(), NOW()),
('grade-12', 'Grade 12', 12, 'Twelfth Grade - Senior year of high school', NOW(), NOW());

-- ==============================================
-- TIME BLOCKS
-- ==============================================

INSERT INTO "TimeBlock" (id, name, startTime, endTime, rotationDay, description, createdAt, updatedAt) VALUES
('time-001', 'Period 1', '08:00:00', '08:50:00', 'MONDAY', 'First period of the day', NOW(), NOW()),
('time-002', 'Period 2', '08:55:00', '09:45:00', 'MONDAY', 'Second period of the day', NOW(), NOW()),
('time-003', 'Period 3', '09:50:00', '10:40:00', 'MONDAY', 'Third period of the day', NOW(), NOW()),
('time-004', 'Period 4', '10:45:00', '11:35:00', 'MONDAY', 'Fourth period of the day', NOW(), NOW()),
('time-005', 'Period 5', '12:25:00', '13:15:00', 'MONDAY', 'Fifth period of the day (after lunch)', NOW(), NOW()),
('time-006', 'Period 6', '13:20:00', '14:10:00', 'MONDAY', 'Sixth period of the day', NOW(), NOW()),
('time-007', 'Period 7', '14:15:00', '15:05:00', 'MONDAY', 'Seventh period of the day', NOW(), NOW()),
('time-008', 'Period 8', '15:10:00', '16:00:00', 'MONDAY', 'Eighth period of the day', NOW(), NOW()),
('time-009', 'Advisory', '07:45:00', '08:00:00', 'MONDAY', 'Advisory period for homeroom', NOW(), NOW()),
('time-010', 'Lunch', '11:40:00', '12:20:00', 'MONDAY', 'Lunch period', NOW(), NOW());

-- ==============================================
-- ROOMS
-- ==============================================

INSERT INTO "Room" (id, name, capacity, roomType, building, floor, description, createdAt, updatedAt) VALUES
-- Building A - Mathematics & Science
('room-a101', 'A101 - Math Lab', 30, 'LABORATORY', 'Building A', 1, 'Mathematics laboratory with computers', NOW(), NOW()),
('room-a102', 'A102 - Algebra I', 25, 'CLASSROOM', 'Building A', 1, 'Algebra I classroom', NOW(), NOW()),
('room-a103', 'A103 - Geometry', 25, 'CLASSROOM', 'Building A', 1, 'Geometry classroom', NOW(), NOW()),
('room-a104', 'A104 - Pre-Algebra', 25, 'CLASSROOM', 'Building A', 1, 'Pre-Algebra classroom', NOW(), NOW()),
('room-a201', 'A201 - Earth Science Lab', 30, 'LABORATORY', 'Building A', 2, 'Earth Science laboratory', NOW(), NOW()),
('room-a202', 'A202 - Life Science Lab', 30, 'LABORATORY', 'Building A', 2, 'Life Science laboratory', NOW(), NOW()),
('room-a203', 'A203 - Physical Science Lab', 30, 'LABORATORY', 'Building A', 2, 'Physical Science laboratory', NOW(), NOW()),
('room-a204', 'A204 - Environmental Science', 25, 'CLASSROOM', 'Building A', 2, 'Environmental Science classroom', NOW(), NOW()),

-- Building B - English & Social Studies
('room-b101', 'B101 - English 6', 25, 'CLASSROOM', 'Building B', 1, 'Sixth grade English classroom', NOW(), NOW()),
('room-b102', 'B102 - English 7', 25, 'CLASSROOM', 'Building B', 1, 'Seventh grade English classroom', NOW(), NOW()),
('room-b103', 'B103 - English 8', 25, 'CLASSROOM', 'Building B', 1, 'Eighth grade English classroom', NOW(), NOW()),
('room-b104', 'B104 - Creative Writing', 20, 'CLASSROOM', 'Building B', 1, 'Creative Writing classroom', NOW(), NOW()),
('room-b201', 'B201 - World History', 25, 'CLASSROOM', 'Building B', 2, 'World History classroom', NOW(), NOW()),
('room-b202', 'B202 - US History', 25, 'CLASSROOM', 'Building B', 2, 'US History classroom', NOW(), NOW()),
('room-b203', 'B203 - Geography', 25, 'CLASSROOM', 'Building B', 2, 'Geography classroom', NOW(), NOW()),
('room-b204', 'B204 - Civics', 25, 'CLASSROOM', 'Building B', 2, 'Civics classroom', NOW(), NOW()),

-- Building C - Arts & Special Programs
('room-c101', 'C101 - Art Studio', 25, 'STUDIO', 'Building C', 1, 'Art studio with easels and supplies', NOW(), NOW()),
('room-c102', 'C102 - Band Room', 30, 'MUSIC', 'Building C', 1, 'Band room with instruments', NOW(), NOW()),
('room-c103', 'C103 - Choir Room', 35, 'MUSIC', 'Building C', 1, 'Choir room with piano', NOW(), NOW()),
('room-c104', 'C104 - Drama Studio', 30, 'STUDIO', 'Building C', 1, 'Drama studio with stage', NOW(), NOW()),
('room-c201', 'C201 - Computer Lab', 30, 'LABORATORY', 'Building C', 2, 'Computer laboratory', NOW(), NOW()),
('room-c202', 'C202 - Spanish Classroom', 25, 'CLASSROOM', 'Building C', 2, 'Spanish language classroom', NOW(), NOW()),
('room-c203', 'C203 - French Classroom', 25, 'CLASSROOM', 'Building C', 2, 'French language classroom', NOW(), NOW()),
('room-c204', 'C204 - Resource Room', 15, 'SPECIAL', 'Building C', 2, 'Special education resource room', NOW(), NOW()),

-- Building D - Physical Education & Health
('room-d101', 'D101 - Gymnasium', 100, 'GYM', 'Building D', 1, 'Main gymnasium', NOW(), NOW()),
('room-d102', 'D102 - Weight Room', 20, 'FITNESS', 'Building D', 1, 'Weight training room', NOW(), NOW()),
('room-d103', 'D103 - Health Classroom', 25, 'CLASSROOM', 'Building D', 1, 'Health education classroom', NOW(), NOW()),
('room-d104', 'D104 - Locker Rooms', 50, 'LOCKER', 'Building D', 1, 'Student locker rooms', NOW(), NOW()),

-- Administrative Areas
('room-100', 'Main Office', 10, 'OFFICE', 'Main Building', 1, 'Main administrative office', NOW(), NOW()),
('room-101', 'Counseling Office', 8, 'OFFICE', 'Main Building', 1, 'Student counseling office', NOW(), NOW()),
('room-102', 'Nurse Office', 5, 'MEDICAL', 'Main Building', 1, 'School nurse office', NOW(), NOW()),
('room-200', 'Library', 50, 'LIBRARY', 'Main Building', 2, 'School library and study hall', NOW(), NOW()),
('room-300', 'Cafeteria', 200, 'CAFETERIA', 'Main Building', 3, 'School cafeteria', NOW(), NOW()),
('room-400', 'Auditorium', 300, 'AUDITORIUM', 'Main Building', 4, 'School auditorium', NOW(), NOW());

-- ==============================================
-- COURSES
-- ==============================================

INSERT INTO "Course" (id, name, code, description, credits, departmentId, gradeLevelId, createdAt, updatedAt) VALUES
-- Mathematics Courses
('course-math-901', 'Algebra I', 'MATH-901', 'First-year algebra course covering linear equations, functions, and graphing', 1.0, 'dept-001', 'grade-9', NOW(), NOW()),
('course-math-902', 'Geometry', 'MATH-902', 'Euclidean geometry, proofs, and spatial reasoning', 1.0, 'dept-001', 'grade-10', NOW(), NOW()),
('course-math-903', 'Algebra II', 'MATH-903', 'Advanced algebra including polynomials, rational functions, and trigonometry', 1.0, 'dept-001', 'grade-11', NOW(), NOW()),
('course-math-904', 'Pre-Calculus', 'MATH-904', 'Preparation for calculus including advanced functions and limits', 1.0, 'dept-001', 'grade-12', NOW(), NOW()),
('course-math-905', 'AP Calculus AB', 'MATH-905', 'Advanced Placement Calculus AB course', 1.0, 'dept-001', 'grade-12', NOW(), NOW()),
('course-math-906', 'AP Calculus BC', 'MATH-906', 'Advanced Placement Calculus BC course', 1.0, 'dept-001', 'grade-12', NOW(), NOW()),
('course-math-907', 'AP Statistics', 'MATH-907', 'Advanced Placement Statistics course', 1.0, 'dept-001', 'grade-11', NOW(), NOW()),

-- English Language Arts Courses
('course-eng-901', 'English 9', 'ENG-901', 'Ninth-grade English language arts with literature and composition', 1.0, 'dept-002', 'grade-9', NOW(), NOW()),
('course-eng-902', 'English 10', 'ENG-902', 'Tenth-grade English with world literature and research skills', 1.0, 'dept-002', 'grade-10', NOW(), NOW()),
('course-eng-903', 'English 11', 'ENG-903', 'American literature and advanced composition', 1.0, 'dept-002', 'grade-11', NOW(), NOW()),
('course-eng-904', 'English 12', 'ENG-904', 'British literature and college preparation', 1.0, 'dept-002', 'grade-12', NOW(), NOW()),
('course-eng-905', 'AP English Language', 'ENG-905', 'Advanced Placement English Language and Composition', 1.0, 'dept-002', 'grade-11', NOW(), NOW()),
('course-eng-906', 'AP English Literature', 'ENG-906', 'Advanced Placement English Literature and Composition', 1.0, 'dept-002', 'grade-12', NOW(), NOW()),
('course-eng-907', 'Creative Writing', 'ENG-907', 'Advanced creative writing techniques and portfolio development', 0.5, 'dept-002', 'grade-11', NOW(), NOW()),
('course-eng-908', 'Journalism', 'ENG-908', 'News writing, editing, and publication production', 0.5, 'dept-002', 'grade-10', NOW(), NOW()),

-- Science Courses
('course-sci-901', 'Biology', 'SCI-901', 'Introduction to biological concepts and laboratory skills', 1.0, 'dept-003', 'grade-9', NOW(), NOW()),
('course-sci-902', 'Chemistry', 'SCI-902', 'Chemical principles, reactions, and laboratory techniques', 1.0, 'dept-003', 'grade-10', NOW(), NOW()),
('course-sci-903', 'Physics', 'SCI-903', 'Mechanics, thermodynamics, and wave phenomena', 1.0, 'dept-003', 'grade-11', NOW(), NOW()),
('course-sci-904', 'AP Biology', 'SCI-904', 'Advanced Placement Biology course', 1.0, 'dept-003', 'grade-11', NOW(), NOW()),
('course-sci-905', 'AP Chemistry', 'SCI-905', 'Advanced Placement Chemistry course', 1.0, 'dept-003', 'grade-11', NOW(), NOW()),
('course-sci-906', 'AP Physics 1', 'SCI-906', 'Advanced Placement Physics 1 course', 1.0, 'dept-003', 'grade-11', NOW(), NOW()),
('course-sci-907', 'AP Physics 2', 'SCI-907', 'Advanced Placement Physics 2 course', 1.0, 'dept-003', 'grade-12', NOW(), NOW()),
('course-sci-908', 'AP Environmental Science', 'SCI-908', 'Advanced Placement Environmental Science course', 1.0, 'dept-003', 'grade-12', NOW(), NOW()),

-- Social Studies Courses
('course-ss-901', 'World History', 'SS-901', 'Comprehensive study of world history from ancient to modern times', 1.0, 'dept-004', 'grade-9', NOW(), NOW()),
('course-ss-902', 'US History', 'SS-902', 'United States history from colonial times to present', 1.0, 'dept-004', 'grade-11', NOW(), NOW()),
('course-ss-903', 'Government', 'SS-903', 'American government and political systems', 0.5, 'dept-004', 'grade-12', NOW(), NOW()),
('course-ss-904', 'Economics', 'SS-904', 'Principles of economics and personal finance', 0.5, 'dept-004', 'grade-12', NOW(), NOW()),
('course-ss-905', 'AP World History', 'SS-905', 'Advanced Placement World History course', 1.0, 'dept-004', 'grade-10', NOW(), NOW()),
('course-ss-906', 'AP US History', 'SS-906', 'Advanced Placement United States History course', 1.0, 'dept-004', 'grade-11', NOW(), NOW()),
('course-ss-907', 'AP Government', 'SS-907', 'Advanced Placement United States Government course', 0.5, 'dept-004', 'grade-12', NOW(), NOW()),
('course-ss-908', 'AP Psychology', 'SS-908', 'Advanced Placement Psychology course', 1.0, 'dept-004', 'grade-12', NOW(), NOW()),

-- Physical Education Courses
('course-pe-901', 'Physical Education 9', 'PE-901', 'Physical education for 9th grade', 0.5, 'dept-005', 'grade-9', NOW(), NOW()),
('course-pe-902', 'Physical Education 10', 'PE-902', 'Physical education for 10th grade', 0.5, 'dept-005', 'grade-10', NOW(), NOW()),
('course-pe-903', 'Physical Education 11', 'PE-903', 'Physical education for 11th grade', 0.5, 'dept-005', 'grade-11', NOW(), NOW()),
('course-pe-904', 'Physical Education 12', 'PE-904', 'Physical education for 12th grade', 0.5, 'dept-005', 'grade-12', NOW(), NOW()),
('course-pe-905', 'Health Education', 'PE-905', 'Health and wellness education', 0.5, 'dept-005', 'grade-9', NOW(), NOW()),
('course-pe-906', 'Weight Training', 'PE-906', 'Strength training and fitness development', 0.5, 'dept-005', 'grade-10', NOW(), NOW()),

-- Arts & Music Courses
('course-art-901', 'Art 9', 'ART-901', 'Visual arts for 9th grade', 0.5, 'dept-006', 'grade-9', NOW(), NOW()),
('course-art-902', 'Art 10', 'ART-902', 'Visual arts for 10th grade', 0.5, 'dept-006', 'grade-10', NOW(), NOW()),
('course-art-903', 'Art 11', 'ART-903', 'Visual arts for 11th grade', 0.5, 'dept-006', 'grade-11', NOW(), NOW()),
('course-art-904', 'Art 12', 'ART-904', 'Visual arts for 12th grade', 0.5, 'dept-006', 'grade-12', NOW(), NOW()),
('course-art-905', 'AP Studio Art', 'ART-905', 'Advanced Placement Studio Art course', 1.0, 'dept-006', 'grade-12', NOW(), NOW()),
('course-art-906', 'Band', 'ART-906', 'Concert band for all grades', 0.5, 'dept-006', 'grade-9', NOW(), NOW()),
('course-art-907', 'Orchestra', 'ART-907', 'String orchestra for all grades', 0.5, 'dept-006', 'grade-9', NOW(), NOW()),
('course-art-908', 'Choir', 'ART-908', 'Choral music for all grades', 0.5, 'dept-006', 'grade-9', NOW(), NOW()),
('course-art-909', 'Drama', 'ART-909', 'Drama and theater arts', 0.5, 'dept-006', 'grade-10', NOW(), NOW()),
('course-art-910', 'AP Music Theory', 'ART-910', 'Advanced Placement Music Theory course', 1.0, 'dept-006', 'grade-12', NOW(), NOW()),

-- World Languages
('course-lang-901', 'Spanish I', 'SPAN-901', 'Beginning Spanish language course', 1.0, 'dept-007', 'grade-9', NOW(), NOW()),
('course-lang-902', 'Spanish II', 'SPAN-902', 'Intermediate Spanish language course', 1.0, 'dept-007', 'grade-10', NOW(), NOW()),
('course-lang-903', 'Spanish III', 'SPAN-903', 'Advanced Spanish language course', 1.0, 'dept-007', 'grade-11', NOW(), NOW()),
('course-lang-904', 'Spanish IV', 'SPAN-904', 'Advanced Spanish language and culture', 1.0, 'dept-007', 'grade-12', NOW(), NOW()),
('course-lang-905', 'AP Spanish', 'SPAN-905', 'Advanced Placement Spanish Language course', 1.0, 'dept-007', 'grade-12', NOW(), NOW()),
('course-lang-906', 'French I', 'FREN-906', 'Beginning French language course', 1.0, 'dept-007', 'grade-9', NOW(), NOW()),
('course-lang-907', 'French II', 'FREN-907', 'Intermediate French language course', 1.0, 'dept-007', 'grade-10', NOW(), NOW()),
('course-lang-908', 'French III', 'FREN-908', 'Advanced French language course', 1.0, 'dept-007', 'grade-11', NOW(), NOW()),
('course-lang-909', 'French IV', 'FREN-909', 'Advanced French language and culture', 1.0, 'dept-007', 'grade-12', NOW(), NOW()),
('course-lang-910', 'AP French', 'FREN-910', 'Advanced Placement French Language course', 1.0, 'dept-007', 'grade-12', NOW(), NOW()),

-- Technology & Computer Science
('course-tech-901', 'Computer Science I', 'TECH-901', 'Introduction to computer science and programming', 1.0, 'dept-008', 'grade-9', NOW(), NOW()),
('course-tech-902', 'Computer Science II', 'TECH-902', 'Advanced programming concepts and data structures', 1.0, 'dept-008', 'grade-10', NOW(), NOW()),
('course-tech-903', 'AP Computer Science A', 'TECH-903', 'Advanced Placement Computer Science A course', 1.0, 'dept-008', 'grade-11', NOW(), NOW()),
('course-tech-904', 'AP Computer Science Principles', 'TECH-904', 'Advanced Placement Computer Science Principles course', 1.0, 'dept-008', 'grade-12', NOW(), NOW()),
('course-tech-905', 'Digital Media', 'TECH-905', 'Digital media production and design', 0.5, 'dept-008', 'grade-10', NOW(), NOW()),
('course-tech-906', 'Web Design', 'TECH-906', 'Web development and design principles', 0.5, 'dept-008', 'grade-11', NOW(), NOW()),
('course-tech-907', 'Cybersecurity', 'TECH-907', 'Cybersecurity fundamentals and practices', 0.5, 'dept-008', 'grade-12', NOW(), NOW()),

-- Career & Technical Education
('course-cte-901', 'Business Management', 'CTE-901', 'Introduction to business principles and management', 1.0, 'dept-009', 'grade-10', NOW(), NOW()),
('course-cte-902', 'Marketing', 'CTE-902', 'Marketing principles and strategies', 1.0, 'dept-009', 'grade-11', NOW(), NOW()),
('course-cte-903', 'Accounting', 'CTE-903', 'Financial accounting and bookkeeping', 1.0, 'dept-009', 'grade-12', NOW(), NOW()),
('course-cte-904', 'Culinary Arts', 'CTE-904', 'Culinary skills and food service management', 1.0, 'dept-009', 'grade-11', NOW(), NOW()),
('course-cte-905', 'Automotive Technology', 'CTE-905', 'Automotive repair and maintenance', 1.0, 'dept-009', 'grade-12', NOW(), NOW()),
('course-cte-906', 'Construction Technology', 'CTE-906', 'Construction skills and building trades', 1.0, 'dept-009', 'grade-11', NOW(), NOW()),
('course-cte-907', 'Health Sciences', 'CTE-907', 'Introduction to healthcare careers', 1.0, 'dept-009', 'grade-10', NOW(), NOW()),
('course-cte-908', 'Engineering Design', 'CTE-908', 'Engineering principles and design process', 1.0, 'dept-009', 'grade-12', NOW(), NOW()),

-- Special Education
('course-spec-901', 'Resource Room', 'SPEC-901', 'Special education resource support', 1.0, 'dept-010', 'grade-9', NOW(), NOW()),
('course-spec-902', 'Life Skills', 'SPEC-902', 'Life skills development and independent living', 1.0, 'dept-010', 'grade-10', NOW(), NOW()),
('course-spec-903', 'Study Skills', 'SPEC-903', 'Study skills and academic support', 1.0, 'dept-010', 'grade-11', NOW(), NOW()),
('course-spec-904', 'Transition Planning', 'SPEC-904', 'Post-secondary transition planning and preparation', 1.0, 'dept-010', 'grade-12', NOW(), NOW()),
('course-spec-905', 'Independent Living', 'SPEC-905', 'Independent living skills and community integration', 1.0, 'dept-010', 'grade-12', NOW(), NOW());

-- ==============================================
-- USERS (Teachers, Administrators, Counselors)
-- ==============================================

INSERT INTO "User" (id, email, username, firstName, lastName, role, isActive, createdAt, updatedAt) VALUES
-- Administrators
('user-admin-001', 'p.williams@lincolnhs.edu', 'p.williams', 'Patricia', 'Williams', 'ADMIN', true, NOW(), NOW()),
('user-admin-002', 'j.anderson@lincolnhs.edu', 'j.anderson', 'James', 'Anderson', 'ADMIN', true, NOW(), NOW()),

-- Platform Administrators
('user-platform-001', 's.mitchell@lincolnhs.edu', 's.mitchell', 'Sarah', 'Mitchell', 'PLATFORM_ADMIN', true, NOW(), NOW()),
('user-platform-002', 'd.foster@lincolnhs.edu', 'd.foster', 'David', 'Foster', 'PLATFORM_ADMIN', true, NOW(), NOW()),

-- Counselors
('user-counselor-001', 'p.lee@lincolnhs.edu', 'p.lee', 'Patricia', 'Lee', 'COUNSELOR', true, NOW(), NOW()),
('user-counselor-002', 'm.torres@lincolnhs.edu', 'm.torres', 'Michael', 'Torres', 'COUNSELOR', true, NOW(), NOW()),
('user-counselor-003', 'j.adams@lincolnhs.edu', 'j.adams', 'Jennifer', 'Adams', 'COUNSELOR', true, NOW(), NOW()),
('user-counselor-004', 'r.kim@lincolnhs.edu', 'r.kim', 'Robert', 'Kim', 'COUNSELOR', true, NOW(), NOW()),

-- Mathematics Teachers
('user-teacher-001', 's.johnson@lincolnhs.edu', 's.johnson', 'Sarah', 'Johnson', 'TEACHER', true, NOW(), NOW()),
('user-teacher-002', 'j.miller@lincolnhs.edu', 'j.miller', 'James', 'Miller', 'TEACHER', true, NOW(), NOW()),
('user-teacher-003', 'r.green@lincolnhs.edu', 'r.green', 'Rachel', 'Green', 'TEACHER', true, NOW(), NOW()),
('user-teacher-004', 'k.park@lincolnhs.edu', 'k.park', 'Kevin', 'Park', 'TEACHER', true, NOW(), NOW()),
('user-teacher-005', 's.white@lincolnhs.edu', 's.white', 'Susan', 'White', 'TEACHER', true, NOW(), NOW()),
('user-teacher-006', 'd.kim@lincolnhs.edu', 'd.kim', 'Daniel', 'Kim', 'TEACHER', true, NOW(), NOW()),
('user-teacher-007', 'l.martinez@lincolnhs.edu', 'l.martinez', 'Laura', 'Martinez', 'TEACHER', true, NOW(), NOW()),
('user-teacher-008', 't.anderson@lincolnhs.edu', 't.anderson', 'Thomas', 'Anderson', 'TEACHER', true, NOW(), NOW()),

-- English Teachers
('user-teacher-009', 'e.rodriguez@lincolnhs.edu', 'e.rodriguez', 'Emily', 'Rodriguez', 'TEACHER', true, NOW(), NOW()),
('user-teacher-010', 'c.taylor@lincolnhs.edu', 'c.taylor', 'Christopher', 'Taylor', 'TEACHER', true, NOW(), NOW()),
('user-teacher-011', 'j.clark@lincolnhs.edu', 'j.clark', 'Jennifer', 'Clark', 'TEACHER', true, NOW(), NOW()),
('user-teacher-012', 'm.davis@lincolnhs.edu', 'm.davis', 'Michael', 'Davis', 'TEACHER', true, NOW(), NOW()),
('user-teacher-013', 's.wilson@lincolnhs.edu', 's.wilson', 'Sarah', 'Wilson', 'TEACHER', true, NOW(), NOW()),
('user-teacher-014', 'r.brown@lincolnhs.edu', 'r.brown', 'Robert', 'Brown', 'TEACHER', true, NOW(), NOW()),
('user-teacher-015', 'l.garcia@lincolnhs.edu', 'l.garcia', 'Lisa', 'Garcia', 'TEACHER', true, NOW(), NOW()),
('user-teacher-016', 'd.martinez@lincolnhs.edu', 'd.martinez', 'David', 'Martinez', 'TEACHER', true, NOW(), NOW()),
('user-teacher-017', 'a.thompson@lincolnhs.edu', 'a.thompson', 'Amanda', 'Thompson', 'TEACHER', true, NOW(), NOW()),
('user-teacher-018', 'k.lee@lincolnhs.edu', 'k.lee', 'Kevin', 'Lee', 'TEACHER', true, NOW(), NOW()),

-- Science Teachers
('user-teacher-019', 'd.chen@lincolnhs.edu', 'd.chen', 'David', 'Chen', 'TEACHER', true, NOW(), NOW()),
('user-teacher-020', 'm.rodriguez@lincolnhs.edu', 'm.rodriguez', 'Maria', 'Rodriguez', 'TEACHER', true, NOW(), NOW()),
('user-teacher-021', 'j.smith@lincolnhs.edu', 'j.smith', 'John', 'Smith', 'TEACHER', true, NOW(), NOW()),
('user-teacher-022', 'l.johnson@lincolnhs.edu', 'l.johnson', 'Lisa', 'Johnson', 'TEACHER', true, NOW(), NOW()),
('user-teacher-023', 'r.williams@lincolnhs.edu', 'r.williams', 'Robert', 'Williams', 'TEACHER', true, NOW(), NOW()),
('user-teacher-024', 'j.brown@lincolnhs.edu', 'j.brown', 'Jennifer', 'Brown', 'TEACHER', true, NOW(), NOW()),
('user-teacher-025', 'm.davis@lincolnhs.edu', 'm.davis', 'Michael', 'Davis', 'TEACHER', true, NOW(), NOW()),

-- Social Studies Teachers
('user-teacher-026', 'l.thompson@lincolnhs.edu', 'l.thompson', 'Lisa', 'Thompson', 'TEACHER', true, NOW(), NOW()),
('user-teacher-027', 'm.wilson@lincolnhs.edu', 'm.wilson', 'Mark', 'Wilson', 'TEACHER', true, NOW(), NOW()),
('user-teacher-028', 's.garcia@lincolnhs.edu', 's.garcia', 'Susan', 'Garcia', 'TEACHER', true, NOW(), NOW()),
('user-teacher-029', 'j.martinez@lincolnhs.edu', 'j.martinez', 'John', 'Martinez', 'TEACHER', true, NOW(), NOW()),
('user-teacher-030', 'a.lee@lincolnhs.edu', 'a.lee', 'Andrew', 'Lee', 'TEACHER', true, NOW(), NOW()),
('user-teacher-031', 'k.park@lincolnhs.edu', 'k.park', 'Kim', 'Park', 'TEACHER', true, NOW(), NOW()),

-- Physical Education Teachers
('user-teacher-032', 'm.brown@lincolnhs.edu', 'm.brown', 'Michael', 'Brown', 'TEACHER', true, NOW(), NOW()),
('user-teacher-033', 's.davis@lincolnhs.edu', 's.davis', 'Sarah', 'Davis', 'TEACHER', true, NOW(), NOW()),
('user-teacher-034', 'j.wilson@lincolnhs.edu', 'j.wilson', 'Jennifer', 'Wilson', 'TEACHER', true, NOW(), NOW()),
('user-teacher-035', 'r.garcia@lincolnhs.edu', 'r.garcia', 'Robert', 'Garcia', 'TEACHER', true, NOW(), NOW()),

-- Arts & Music Teachers
('user-teacher-036', 'j.davis@lincolnhs.edu', 'j.davis', 'Jennifer', 'Davis', 'TEACHER', true, NOW(), NOW()),
('user-teacher-037', 'm.martinez@lincolnhs.edu', 'm.martinez', 'Maria', 'Martinez', 'TEACHER', true, NOW(), NOW()),
('user-teacher-038', 'd.thompson@lincolnhs.edu', 'd.thompson', 'David', 'Thompson', 'TEACHER', true, NOW(), NOW()),
('user-teacher-039', 'l.wilson@lincolnhs.edu', 'l.wilson', 'Lisa', 'Wilson', 'TEACHER', true, NOW(), NOW()),
('user-teacher-040', 's.garcia@lincolnhs.edu', 's.garcia', 'Steven', 'Garcia', 'TEACHER', true, NOW(), NOW()),

-- World Languages Teachers
('user-teacher-041', 'm.garcia@lincolnhs.edu', 'm.garcia', 'Maria', 'Garcia', 'TEACHER', true, NOW(), NOW()),
('user-teacher-042', 'c.rodriguez@lincolnhs.edu', 'c.rodriguez', 'Carlos', 'Rodriguez', 'TEACHER', true, NOW(), NOW()),
('user-teacher-043', 'p.dubois@lincolnhs.edu', 'p.dubois', 'Pierre', 'Dubois', 'TEACHER', true, NOW(), NOW()),
('user-teacher-044', 's.martin@lincolnhs.edu', 's.martin', 'Sophie', 'Martin', 'TEACHER', true, NOW(), NOW()),

-- Technology Teachers
('user-teacher-045', 'r.wilson@lincolnhs.edu', 'r.wilson', 'Robert', 'Wilson', 'TEACHER', true, NOW(), NOW()),
('user-teacher-046', 'j.anderson@lincolnhs.edu', 'j.anderson', 'Jennifer', 'Anderson', 'TEACHER', true, NOW(), NOW()),
('user-teacher-047', 'm.thompson@lincolnhs.edu', 'm.thompson', 'Michael', 'Thompson', 'TEACHER', true, NOW(), NOW()),

-- Special Education Teachers
('user-teacher-048', 'a.foster@lincolnhs.edu', 'a.foster', 'Amanda', 'Foster', 'TEACHER', true, NOW(), NOW()),
('user-teacher-049', 's.lee@lincolnhs.edu', 's.lee', 'Sarah', 'Lee', 'TEACHER', true, NOW(), NOW()),
('user-teacher-050', 'j.park@lincolnhs.edu', 'j.park', 'Jennifer', 'Park', 'TEACHER', true, NOW(), NOW()),
('user-teacher-051', 'm.kim@lincolnhs.edu', 'm.kim', 'Michael', 'Kim', 'TEACHER', true, NOW(), NOW()),
('user-teacher-052', 'r.davis@lincolnhs.edu', 'r.davis', 'Robert', 'Davis', 'TEACHER', true, NOW(), NOW()),
('user-teacher-053', 'l.wilson@lincolnhs.edu', 'l.wilson', 'Lisa', 'Wilson', 'TEACHER', true, NOW(), NOW()),
('user-teacher-054', 's.garcia@lincolnhs.edu', 's.garcia', 'Steven', 'Garcia', 'TEACHER', true, NOW(), NOW()),
('user-teacher-055', 'a.martinez@lincolnhs.edu', 'a.martinez', 'Amanda', 'Martinez', 'TEACHER', true, NOW(), NOW());

-- ==============================================
-- STUDENTS (Sample - Grade 9A)
-- ==============================================

INSERT INTO "User" (id, email, username, firstName, lastName, role, isActive, createdAt, updatedAt) VALUES
-- Grade 9A Students
('user-student-001', 'alex.thompson@student.lincolnhs.edu', 'alex.thompson', 'Alex', 'Thompson', 'STUDENT', true, NOW(), NOW()),
('user-student-002', 'bella.rodriguez@student.lincolnhs.edu', 'bella.rodriguez', 'Bella', 'Rodriguez', 'STUDENT', true, NOW(), NOW()),
('user-student-003', 'caleb.johnson@student.lincolnhs.edu', 'caleb.johnson', 'Caleb', 'Johnson', 'STUDENT', true, NOW(), NOW()),
('user-student-004', 'diana.martinez@student.lincolnhs.edu', 'diana.martinez', 'Diana', 'Martinez', 'STUDENT', true, NOW(), NOW()),
('user-student-005', 'ethan.williams@student.lincolnhs.edu', 'ethan.williams', 'Ethan', 'Williams', 'STUDENT', true, NOW(), NOW()),
('user-student-006', 'fiona.chen@student.lincolnhs.edu', 'fiona.chen', 'Fiona', 'Chen', 'STUDENT', true, NOW(), NOW()),
('user-student-007', 'gabriel.brown@student.lincolnhs.edu', 'gabriel.brown', 'Gabriel', 'Brown', 'STUDENT', true, NOW(), NOW()),
('user-student-008', 'hannah.davis@student.lincolnhs.edu', 'hannah.davis', 'Hannah', 'Davis', 'STUDENT', true, NOW(), NOW()),
('user-student-009', 'isaac.wilson@student.lincolnhs.edu', 'isaac.wilson', 'Isaac', 'Wilson', 'STUDENT', true, NOW(), NOW()),
('user-student-010', 'julia.garcia@student.lincolnhs.edu', 'julia.garcia', 'Julia', 'Garcia', 'STUDENT', true, NOW(), NOW()),
('user-student-011', 'kyle.anderson@student.lincolnhs.edu', 'kyle.anderson', 'Kyle', 'Anderson', 'STUDENT', true, NOW(), NOW()),
('user-student-012', 'luna.taylor@student.lincolnhs.edu', 'luna.taylor', 'Luna', 'Taylor', 'STUDENT', true, NOW(), NOW()),
('user-student-013', 'marcus.lee@student.lincolnhs.edu', 'marcus.lee', 'Marcus', 'Lee', 'STUDENT', true, NOW(), NOW()),
('user-student-014', 'nina.park@student.lincolnhs.edu', 'nina.park', 'Nina', 'Park', 'STUDENT', true, NOW(), NOW()),
('user-student-015', 'oscar.kim@student.lincolnhs.edu', 'oscar.kim', 'Oscar', 'Kim', 'STUDENT', true, NOW(), NOW()),
('user-student-016', 'penelope.white@student.lincolnhs.edu', 'penelope.white', 'Penelope', 'White', 'STUDENT', true, NOW(), NOW()),
('user-student-017', 'quinn.thompson@student.lincolnhs.edu', 'quinn.thompson', 'Quinn', 'Thompson', 'STUDENT', true, NOW(), NOW()),
('user-student-018', 'ruby.rodriguez@student.lincolnhs.edu', 'ruby.rodriguez', 'Ruby', 'Rodriguez', 'STUDENT', true, NOW(), NOW()),
('user-student-019', 'samuel.johnson@student.lincolnhs.edu', 'samuel.johnson', 'Samuel', 'Johnson', 'STUDENT', true, NOW(), NOW()),
('user-student-020', 'tessa.martinez@student.lincolnhs.edu', 'tessa.martinez', 'Tessa', 'Martinez', 'STUDENT', true, NOW(), NOW()),
('user-student-021', 'ulysses.williams@student.lincolnhs.edu', 'ulysses.williams', 'Ulysses', 'Williams', 'STUDENT', true, NOW(), NOW()),
('user-student-022', 'violet.chen@student.lincolnhs.edu', 'violet.chen', 'Violet', 'Chen', 'STUDENT', true, NOW(), NOW()),
('user-student-023', 'william.brown@student.lincolnhs.edu', 'william.brown', 'William', 'Brown', 'STUDENT', true, NOW(), NOW()),
('user-student-024', 'ximena.davis@student.lincolnhs.edu', 'ximena.davis', 'Ximena', 'Davis', 'STUDENT', true, NOW(), NOW()),
('user-student-025', 'yusuf.wilson@student.lincolnhs.edu', 'yusuf.wilson', 'Yusuf', 'Wilson', 'STUDENT', true, NOW(), NOW());

-- ==============================================
-- PARENTS/GUARDIANS (Sample)
-- ==============================================

INSERT INTO "User" (id, email, firstName, lastName, role, isActive, createdAt, updatedAt) VALUES
('user-parent-001', 'john.thompson@email.com', 'John', 'Thompson', 'PARENT_GUARDIAN', true, NOW(), NOW()),
('user-parent-002', 'maria.rodriguez@email.com', 'Maria', 'Rodriguez', 'PARENT_GUARDIAN', true, NOW(), NOW()),
('user-parent-003', 'robert.johnson@email.com', 'Robert', 'Johnson', 'PARENT_GUARDIAN', true, NOW(), NOW()),
('user-parent-004', 'lisa.martinez@email.com', 'Lisa', 'Martinez', 'PARENT_GUARDIAN', true, NOW(), NOW()),
('user-parent-005', 'david.williams@email.com', 'David', 'Williams', 'PARENT_GUARDIAN', true, NOW(), NOW());

-- ==============================================
-- COURSE SECTIONS (Sample)
-- ==============================================

INSERT INTO "CourseSection" (id, name, courseId, teacherId, timeBlockId, roomId, maxEnrollment, currentEnrollment, rotationDay, createdAt, updatedAt) VALUES
-- Mathematics Sections
('section-math-601-a', 'Pre-Algebra 6A', 'course-math-601', 'user-teacher-002', 'time-001', 'room-a104', 25, 25, 'MONDAY', NOW(), NOW()),
('section-math-601-b', 'Pre-Algebra 6B', 'course-math-601', 'user-teacher-006', 'time-003', 'room-a104', 25, 25, 'MONDAY', NOW(), NOW()),
('section-math-701-a', 'Pre-Algebra 7A', 'course-math-701', 'user-teacher-004', 'time-001', 'room-a102', 25, 25, 'MONDAY', NOW(), NOW()),
('section-math-801-a', 'Algebra I A', 'course-math-801', 'user-teacher-001', 'time-001', 'room-a102', 25, 25, 'MONDAY', NOW(), NOW()),
('section-math-802-a', 'Geometry A', 'course-math-802', 'user-teacher-001', 'time-002', 'room-a103', 25, 25, 'MONDAY', NOW(), NOW()),

-- English Sections
('section-eng-601-a', 'English 6A', 'course-eng-601', 'user-teacher-010', 'time-002', 'room-b101', 25, 25, 'MONDAY', NOW(), NOW()),
('section-eng-601-b', 'English 6B', 'course-eng-601', 'user-teacher-013', 'time-004', 'room-b101', 25, 25, 'MONDAY', NOW(), NOW()),
('section-eng-701-a', 'English 7A', 'course-eng-701', 'user-teacher-011', 'time-002', 'room-b102', 25, 25, 'MONDAY', NOW(), NOW()),
('section-eng-801-a', 'English 8A', 'course-eng-801', 'user-teacher-009', 'time-002', 'room-b103', 25, 25, 'MONDAY', NOW(), NOW()),

-- Science Sections
('section-sci-601-a', 'Earth Science 6A', 'course-sci-601', 'user-teacher-021', 'time-003', 'room-a201', 25, 25, 'MONDAY', NOW(), NOW()),
('section-sci-601-b', 'Earth Science 6B', 'course-sci-601', 'user-teacher-022', 'time-005', 'room-a201', 25, 25, 'MONDAY', NOW(), NOW()),
('section-sci-701-a', 'Life Science 7A', 'course-sci-701', 'user-teacher-020', 'time-003', 'room-a202', 25, 25, 'MONDAY', NOW(), NOW()),
('section-sci-801-a', 'Physical Science 8A', 'course-sci-801', 'user-teacher-019', 'time-003', 'room-a203', 25, 25, 'MONDAY', NOW(), NOW()),

-- Social Studies Sections
('section-ss-601-a', 'World History 6A', 'course-ss-601', 'user-teacher-026', 'time-004', 'room-b201', 25, 25, 'MONDAY', NOW(), NOW()),
('section-ss-601-b', 'World History 6B', 'course-ss-601', 'user-teacher-027', 'time-006', 'room-b201', 25, 25, 'MONDAY', NOW(), NOW()),
('section-ss-701-a', 'US History 7A', 'course-ss-701', 'user-teacher-028', 'time-004', 'room-b202', 25, 25, 'MONDAY', NOW(), NOW()),
('section-ss-801-a', 'Geography 8A', 'course-ss-801', 'user-teacher-029', 'time-004', 'room-b203', 25, 25, 'MONDAY', NOW(), NOW()),

-- Physical Education Sections
('section-pe-601-a', 'PE 6A', 'course-pe-601', 'user-teacher-032', 'time-005', 'room-d101', 25, 25, 'MONDAY', NOW(), NOW()),
('section-pe-601-b', 'PE 6B', 'course-pe-601', 'user-teacher-033', 'time-007', 'room-d101', 25, 25, 'MONDAY', NOW(), NOW()),
('section-pe-701-a', 'PE 7A', 'course-pe-701', 'user-teacher-034', 'time-005', 'room-d101', 25, 25, 'MONDAY', NOW(), NOW()),
('section-pe-801-a', 'PE 8A', 'course-pe-801', 'user-teacher-035', 'time-005', 'room-d101', 25, 25, 'MONDAY', NOW(), NOW()),

-- Arts Sections
('section-art-601-a', 'Art 6A', 'course-art-601', 'user-teacher-036', 'time-006', 'room-c101', 25, 25, 'MONDAY', NOW(), NOW()),
('section-art-601-b', 'Art 6B', 'course-art-601', 'user-teacher-037', 'time-008', 'room-c101', 25, 25, 'MONDAY', NOW(), NOW()),
('section-art-701-a', 'Art 7A', 'course-art-701', 'user-teacher-038', 'time-006', 'room-c101', 25, 25, 'MONDAY', NOW(), NOW()),
('section-art-801-a', 'Art 8A', 'course-art-801', 'user-teacher-039', 'time-006', 'room-c101', 25, 25, 'MONDAY', NOW(), NOW()),

-- Technology Sections
('section-tech-601-a', 'Computer Basics 6A', 'course-tech-601', 'user-teacher-045', 'time-007', 'room-c201', 25, 25, 'MONDAY', NOW(), NOW()),
('section-tech-601-b', 'Computer Basics 6B', 'course-tech-601', 'user-teacher-046', 'time-008', 'room-c201', 25, 25, 'MONDAY', NOW(), NOW()),
('section-tech-701-a', 'Digital Literacy 7A', 'course-tech-701', 'user-teacher-047', 'time-007', 'room-c201', 25, 25, 'MONDAY', NOW(), NOW()),
('section-tech-801-a', 'Programming 8A', 'course-tech-801', 'user-teacher-045', 'time-007', 'room-c201', 25, 25, 'MONDAY', NOW(), NOW());

-- ==============================================
-- ACADEMIC CYCLES
-- ==============================================

INSERT INTO "AcademicCycle" (id, name, cycleType, startDate, endDate, isCurrent, description, createdAt, updatedAt) VALUES
('cycle-2024-2025', '2024-2025 School Year', 'SCHOOL_YEAR', '2024-08-26', '2025-06-06', true, 'Full academic year 2024-2025', NOW(), NOW()),
('cycle-fall-2024', 'Fall Semester 2024', 'SEMESTER', '2024-08-26', '2024-12-20', true, 'Fall semester 2024', NOW(), NOW()),
('cycle-spring-2025', 'Spring Semester 2025', 'SEMESTER', '2025-01-06', '2025-06-06', false, 'Spring semester 2025', NOW(), NOW()),
('cycle-quarter-1', 'First Quarter 2024', 'QUARTER', '2024-08-26', '2024-10-25', false, 'First quarter of 2024-2025', NOW(), NOW()),
('cycle-quarter-2', 'Second Quarter 2024', 'QUARTER', '2024-10-28', '2024-12-20', false, 'Second quarter of 2024-2025', NOW(), NOW()),
('cycle-quarter-3', 'Third Quarter 2025', 'QUARTER', '2025-01-06', '2025-03-14', false, 'Third quarter of 2024-2025', NOW(), NOW()),
('cycle-quarter-4', 'Fourth Quarter 2025', 'QUARTER', '2025-03-17', '2025-06-06', false, 'Fourth quarter of 2024-2025', NOW(), NOW());

-- ==============================================
-- SCHEDULES (Sample for Grade 6A)
-- ==============================================

INSERT INTO "Schedule" (id, studentId, academicCycleId, createdAt, updatedAt) VALUES
('schedule-001', 'user-student-001', 'cycle-2024-2025', NOW(), NOW()),
('schedule-002', 'user-student-002', 'cycle-2024-2025', NOW(), NOW()),
('schedule-003', 'user-student-003', 'cycle-2024-2025', NOW(), NOW()),
('schedule-004', 'user-student-004', 'cycle-2024-2025', NOW(), NOW()),
('schedule-005', 'user-student-005', 'cycle-2024-2025', NOW(), NOW());

-- ==============================================
-- SCHEDULE COURSE SECTIONS (Sample for Alex Thompson)
-- ==============================================

INSERT INTO "ScheduleCourseSection" (id, scheduleId, courseSectionId, createdAt, updatedAt) VALUES
-- Alex Thompson's Schedule (Grade 6A)
('scs-001-001', 'schedule-001', 'section-math-601-a', NOW(), NOW()),
('scs-001-002', 'schedule-001', 'section-eng-601-a', NOW(), NOW()),
('scs-001-003', 'schedule-001', 'section-sci-601-a', NOW(), NOW()),
('scs-001-004', 'schedule-001', 'section-ss-601-a', NOW(), NOW()),
('scs-001-005', 'schedule-001', 'section-pe-601-a', NOW(), NOW()),
('scs-001-006', 'schedule-001', 'section-art-601-a', NOW(), NOW()),
('scs-001-007', 'schedule-001', 'section-tech-601-a', NOW(), NOW());

-- ==============================================
-- PARENT-GUARDIAN RELATIONSHIPS
-- ==============================================

INSERT INTO "ParentGuardian" (id, parentId, studentId, relationship, isPrimary, createdAt, updatedAt) VALUES
('pg-001', 'user-parent-001', 'user-student-001', 'FATHER', true, NOW(), NOW()),
('pg-002', 'user-parent-002', 'user-student-002', 'MOTHER', true, NOW(), NOW()),
('pg-003', 'user-parent-003', 'user-student-003', 'FATHER', true, NOW(), NOW()),
('pg-004', 'user-parent-004', 'user-student-004', 'MOTHER', true, NOW(), NOW()),
('pg-005', 'user-parent-005', 'user-student-005', 'FATHER', true, NOW(), NOW());

-- ==============================================
-- SAMPLE SCHEDULE CHANGE REQUESTS
-- ==============================================

INSERT INTO "ScheduleChangeRequest" (id, studentId, requestType, currentCourseSectionId, requestedCourseSectionId, preferredTimeBlockId, reason, priority, status, comments, academicCycleId, createdAt, updatedAt) VALUES
('scr-001', 'user-student-001', 'CHANGE_SECTION', 'section-math-601-a', 'section-math-601-b', 'time-003', 'Need to change from Period 1 to Period 3 due to band practice conflict', 'MEDIUM', 'PENDING', NULL, 'cycle-2024-2025', NOW(), NOW()),
('scr-002', 'user-student-002', 'ADD_COURSE', NULL, 'section-art-602', 'time-007', 'Interested in joining the band program', 'LOW', 'APPROVED', 'Approved - student has musical background', 'cycle-2024-2025', NOW(), NOW()),
('scr-003', 'user-student-003', 'DROP_COURSE', 'section-tech-601-a', NULL, NULL, 'Already proficient in computer skills, want to focus on other subjects', 'LOW', 'UNDER_REVIEW', 'Reviewing student proficiency level', 'cycle-2024-2025', NOW(), NOW());

-- ==============================================
-- SAMPLE NOTIFICATIONS
-- ==============================================

INSERT INTO "Notification" (id, userId, title, message, type, isRead, createdAt, updatedAt) VALUES
('notif-001', 'user-student-001', 'Schedule Change Approved', 'Your request to change from Period 1 to Period 3 for Pre-Algebra has been approved.', 'SCHEDULE_CHANGE', false, NOW(), NOW()),
('notif-002', 'user-student-002', 'New Course Added', 'Advanced Art has been added to your schedule for Period 7.', 'COURSE_ADDED', false, NOW(), NOW()),
('notif-003', 'user-parent-001', 'Child Schedule Update', 'Your child Alex Thompson''s schedule change request has been processed.', 'PARENT_NOTIFICATION', false, NOW(), NOW()),
('notif-004', 'user-teacher-001', 'New Student Assignment', 'A new student has been assigned to your Algebra I class.', 'STUDENT_ASSIGNMENT', false, NOW(), NOW()),
('notif-005', 'user-counselor-001', 'Schedule Review Required', 'A schedule change request requires your review.', 'COUNSELOR_REVIEW', false, NOW(), NOW());

-- ==============================================
-- SAMPLE SETTINGS
-- ==============================================

INSERT INTO "Settings" (id, key, value, description, category, createdAt, updatedAt) VALUES
('setting-001', 'school.name', 'Lincoln Middle School', 'Official school name', 'GENERAL', NOW(), NOW()),
('setting-002', 'school.address', '123 Education Street, Lincoln, State 12345', 'School physical address', 'GENERAL', NOW(), NOW()),
('setting-003', 'school.phone', '(555) 123-4567', 'Main school phone number', 'GENERAL', NOW(), NOW()),
('setting-004', 'school.email', 'info@lincolnms.edu', 'Main school email address', 'GENERAL', NOW(), NOW()),
('setting-005', 'schedule.change.deadline.days', '14', 'Number of days after semester start when schedule changes are allowed', 'SCHEDULE', NOW(), NOW()),
('setting-006', 'schedule.change.student.enabled', 'true', 'Whether students can submit schedule change requests', 'SCHEDULE', NOW(), NOW()),
('setting-007', 'notifications.email.enabled', 'true', 'Whether email notifications are enabled', 'NOTIFICATIONS', NOW(), NOW()),
('setting-008', 'notifications.sms.enabled', 'false', 'Whether SMS notifications are enabled', 'NOTIFICATIONS', NOW(), NOW()),
('setting-009', 'academic.year.current', '2024-2025', 'Current academic year', 'ACADEMIC', NOW(), NOW()),
('setting-010', 'system.maintenance.mode', 'false', 'Whether system is in maintenance mode', 'SYSTEM', NOW(), NOW());

-- ==============================================
-- END OF MOCK DATA
-- ==============================================

-- This completes the basic mock data for Lincoln Middle School
-- Additional data can be added as needed for specific testing scenarios
