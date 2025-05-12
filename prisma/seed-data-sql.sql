-- School Schedule Management System Seed Data
-- Based on provided document and supplementary mock data

-- Clear existing data (if running this multiple times)
TRUNCATE users, school_years, terms, departments, course_levels, grade_levels,
        courses, course_prerequisites, course_sequences, rooms, time_blocks,
        teachers, students, student_course_history, course_sections,
        student_schedules, schedule_change_requests, schedule_change_actions,
        course_conflicts, course_waitlists, system_settings, audit_logs CASCADE;

-- Reset sequences
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE school_years_id_seq RESTART WITH 1;
ALTER SEQUENCE terms_id_seq RESTART WITH 1;
ALTER SEQUENCE departments_id_seq RESTART WITH 1;
ALTER SEQUENCE course_levels_id_seq RESTART WITH 1;
ALTER SEQUENCE grade_levels_id_seq RESTART WITH 1;
ALTER SEQUENCE courses_id_seq RESTART WITH 1;
ALTER SEQUENCE course_prerequisites_id_seq RESTART WITH 1;
ALTER SEQUENCE course_sequences_id_seq RESTART WITH 1;
ALTER SEQUENCE rooms_id_seq RESTART WITH 1;
ALTER SEQUENCE time_blocks_id_seq RESTART WITH 1;
ALTER SEQUENCE teachers_id_seq RESTART WITH 1;
ALTER SEQUENCE students_id_seq RESTART WITH 1;
ALTER SEQUENCE student_course_history_id_seq RESTART WITH 1;
ALTER SEQUENCE course_sections_id_seq RESTART WITH 1;
ALTER SEQUENCE student_schedules_id_seq RESTART WITH 1;
ALTER SEQUENCE schedule_change_requests_id_seq RESTART WITH 1;
ALTER SEQUENCE schedule_change_actions_id_seq RESTART WITH 1;
ALTER SEQUENCE course_conflicts_id_seq RESTART WITH 1;
ALTER SEQUENCE course_waitlists_id_seq RESTART WITH 1;
ALTER SEQUENCE system_settings_id_seq RESTART WITH 1;
ALTER SEQUENCE audit_logs_id_seq RESTART WITH 1;

-- Users (sample users for each role)
INSERT INTO users (email, password_hash, role, first_name, last_name) VALUES
('admin@school.edu', '$2b$10$XSNkOBNMJlljDgXOmyO3CO6OJg2kYeS.ZVrKtU7B8fCsfh8WgXRJm', 'admin', 'Admin', 'User'),
('counselor@school.edu', '$2b$10$XSNkOBNMJlljDgXOmyO3CO6OJg2kYeS.ZVrKtU7B8fCsfh8WgXRJm', 'counselor', 'Counselor', 'Smith'),
('teacher1@school.edu', '$2b$10$XSNkOBNMJlljDgXOmyO3CO6OJg2kYeS.ZVrKtU7B8fCsfh8WgXRJm', 'teacher', 'Teacher', 'Johnson'),
('teacher2@school.edu', '$2b$10$XSNkOBNMJlljDgXOmyO3CO6OJg2kYeS.ZVrKtU7B8fCsfh8WgXRJm', 'teacher', 'Teacher', 'Williams'),
('teacher3@school.edu', '$2b$10$XSNkOBNMJlljDgXOmyO3CO6OJg2kYeS.ZVrKtU7B8fCsfh8WgXRJm', 'teacher', 'Teacher', 'Brown'),
('teacher4@school.edu', '$2b$10$XSNkOBNMJlljDgXOmyO3CO6OJg2kYeS.ZVrKtU7B8fCsfh8WgXRJm', 'teacher', 'Teacher', 'Davis'),
('teacher5@school.edu', '$2b$10$XSNkOBNMJlljDgXOmyO3CO6OJg2kYeS.ZVrKtU7B8fCsfh8WgXRJm', 'teacher', 'Teacher', 'Miller'),
('student1@school.edu', '$2b$10$XSNkOBNMJlljDgXOmyO3CO6OJg2kYeS.ZVrKtU7B8fCsfh8WgXRJm', 'student', 'John', 'Smith'),
('student2@school.edu', '$2b$10$XSNkOBNMJlljDgXOmyO3CO6OJg2kYeS.ZVrKtU7B8fCsfh8WgXRJm', 'student', 'Emily', 'Johnson'),
('student3@school.edu', '$2b$10$XSNkOBNMJlljDgXOmyO3CO6OJg2kYeS.ZVrKtU7B8fCsfh8WgXRJm', 'student', 'Michael', 'Williams'),
('student4@school.edu', '$2b$10$XSNkOBNMJlljDgXOmyO3CO6OJg2kYeS.ZVrKtU7B8fCsfh8WgXRJm', 'student', 'Emma', 'Brown'),
('student5@school.edu', '$2b$10$XSNkOBNMJlljDgXOmyO3CO6OJg2kYeS.ZVrKtU7B8fCsfh8WgXRJm', 'student', 'James', 'Davis'),
('student6@school.edu', '$2b$10$XSNkOBNMJlljDgXOmyO3CO6OJg2kYeS.ZVrKtU7B8fCsfh8WgXRJm', 'student', 'Olivia', 'Miller'),
('student7@school.edu', '$2b$10$XSNkOBNMJlljDgXOmyO3CO6OJg2kYeS.ZVrKtU7B8fCsfh8WgXRJm', 'student', 'William', 'Wilson'),
('student8@school.edu', '$2b$10$XSNkOBNMJlljDgXOmyO3CO6OJg2kYeS.ZVrKtU7B8fCsfh8WgXRJm', 'student', 'Sophia', 'Moore'),
('student9@school.edu', '$2b$10$XSNkOBNMJlljDgXOmyO3CO6OJg2kYeS.ZVrKtU7B8fCsfh8WgXRJm', 'student', 'Alexander', 'Taylor'),
('student10@school.edu', '$2b$10$XSNkOBNMJlljDgXOmyO3CO6OJg2kYeS.ZVrKtU7B8fCsfh8WgXRJm', 'student', 'Ava', 'Anderson');

-- School Years
INSERT INTO school_years (name, start_date, end_date, is_current) VALUES
('2023-2024', '2023-08-15', '2024-06-10', FALSE),
('2024-2025', '2024-08-14', '2025-06-09', TRUE),
('2025-2026', '2025-08-13', '2026-06-08', FALSE);

-- Terms
INSERT INTO terms (school_year_id, name, start_date, end_date, is_current) VALUES
(1, 'Fall Semester 2023', '2023-08-15', '2023-12-20', FALSE),
(1, 'Spring Semester 2024', '2024-01-05', '2024-06-10', FALSE),
(2, 'Fall Semester 2024', '2024-08-14', '2024-12-19', FALSE),
(2, 'Spring Semester 2025', '2025-01-06', '2025-06-09', TRUE),
(3, 'Fall Semester 2025', '2025-08-13', '2025-12-18', FALSE),
(3, 'Spring Semester 2026', '2026-01-04', '2026-06-08', FALSE);

-- Departments (based on document)
INSERT INTO departments (name) VALUES
('Mathematics'),
('English/Language Arts'),
('Science'),
('Social Studies'),
('Art and Design'),
('Music'),
('Physical Education & Health'),
('Foreign Languages'),
('Technology and Computer Science'),
('Family and Consumer Science'),
('Drama and Theater'),
('Business and Entrepreneurship');

-- Course Levels
INSERT INTO course_levels (name, rank) VALUES
('Regular', 1),
('Advanced', 2),
('Honors', 3),
('AP', 4),
('Dual Enrollment', 5);

-- Grade Levels
INSERT INTO grade_levels (name, level) VALUES
('6th Grade', 6),
('7th Grade', 7),
('8th Grade', 8),
('9th Grade (Freshman)', 9),
('10th Grade (Sophomore)', 10),
('11th Grade (Junior)', 11),
('12th Grade (Senior)', 12);

-- Rooms
INSERT INTO rooms (name, capacity) VALUES
('101', 30),
('102', 30),
('103', 30),
('104', 30),
('105', 30),
('201', 30),
('202', 30),
('203', 30),
('204', 30),
('205', 30),
('Gym', 60),
('Computer Lab 1', 25),
('Computer Lab 2', 25),
('Science Lab 1', 24),
('Science Lab 2', 24),
('Art Room', 25),
('Music Room', 30),
('Theater', 40);

-- Time Blocks
INSERT INTO time_blocks (name, start_time, end_time) VALUES
('Period 1', '08:00:00', '08:50:00'),
('Period 2', '08:55:00', '09:45:00'),
('Period 3', '09:50:00', '10:40:00'),
('Period 4', '10:45:00', '11:35:00'),
('Period 5', '11:40:00', '12:30:00'),
('Lunch', '12:30:00', '13:00:00'),
('Period 6', '13:05:00', '13:55:00'),
('Period 7', '14:00:00', '14:50:00'),
('Period 8', '14:55:00', '15:45:00');

-- Teachers
INSERT INTO teachers (user_id, department_id, max_courses) VALUES
(3, 1, 6), -- Mathematics
(4, 2, 6), -- English
(5, 3, 6), -- Science
(6, 4, 6), -- Social Studies
(7, 5, 6); -- Art and Design

-- Students
INSERT INTO students (user_id, student_id, grade_level_id, graduation_year, has_iep, is_dual_enrollment, is_college_bound, is_credit_recovery, max_credits_per_term) VALUES
(8, 'S100001', 4, 2028, FALSE, FALSE, TRUE, FALSE, 8.0),  -- 9th grade
(9, 'S100002', 5, 2027, FALSE, FALSE, TRUE, FALSE, 8.0),  -- 10th grade
(10, 'S100003', 6, 2026, TRUE, FALSE, TRUE, FALSE, 7.0),  -- 11th grade with IEP
(11, 'S100004', 7, 2025, FALSE, TRUE, TRUE, FALSE, 9.0),  -- 12th grade with dual enrollment
(12, 'S100005', 5, 2027, FALSE, FALSE, FALSE, TRUE, 7.0), -- 10th grade with credit recovery
(13, 'S100006', 6, 2026, FALSE, FALSE, TRUE, FALSE, 8.0), -- 11th grade
(14, 'S100007', 7, 2025, FALSE, FALSE, TRUE, FALSE, 8.0), -- 12th grade
(15, 'S100008', 4, 2028, FALSE, FALSE, TRUE, FALSE, 8.0), -- 9th grade
(16, 'S100009', 5, 2027, TRUE, FALSE, TRUE, FALSE, 7.0),  -- 10th grade with IEP
(17, 'S100010', 6, 2026, FALSE, FALSE, TRUE, FALSE, 8.0); -- 11th grade

-- Courses (based on document)
-- Mathematics Courses
INSERT INTO courses (code, name, description, department_id, credits, course_level_id, min_grade_level, is_elective, is_core) VALUES
('MATH101', 'Algebra 1', 'Introduction to algebraic concepts', 1, 1.0, 1, 9, FALSE, TRUE),
('MATH201', 'Geometry', 'Study of shapes and spatial relationships', 1, 1.0, 1, 9, FALSE, TRUE),
('MATH301', 'Algebra 2', 'Advanced algebraic concepts', 1, 1.0, 1, 10, FALSE, TRUE),
('MATH401', 'Pre-Calculus', 'Preparation for calculus', 1, 1.0, 1, 11, FALSE, TRUE),
('MATH501', 'AP Calculus AB', 'First semester college calculus', 1, 1.0, 4, 11, FALSE, TRUE),
('MATH502', 'AP Calculus BC', 'Full year of college calculus', 1, 1.0, 4, 12, FALSE, TRUE),
('MATH601', 'AP Statistics', 'College-level statistics', 1, 1.0, 4, 11, FALSE, TRUE),
('MATH701', 'Probability & Statistics', 'Introduction to statistics', 1, 1.0, 1, 11, FALSE, TRUE),
('MATH801', 'Honors Geometry', 'Advanced geometry concepts', 1, 1.0, 3, 9, FALSE, TRUE),
('MATH901', 'Honors Algebra 2', 'Advanced algebra 2 concepts', 1, 1.0, 3, 10, FALSE, TRUE);

-- English Courses
INSERT INTO courses (code, name, description, department_id, credits, course_level_id, min_grade_level, is_elective, is_core) VALUES
('ENG101', 'English 9', 'Freshman English', 2, 1.0, 1, 9, FALSE, TRUE),
('ENG201', 'English 10', 'Sophomore English', 2, 1.0, 1, 10, FALSE, TRUE),
('ENG301', 'English 11', 'American Literature', 2, 1.0, 1, 11, FALSE, TRUE),
('ENG401', 'English 12', 'British/World Literature', 2, 1.0, 1, 12, FALSE, TRUE),
('ENG501', 'Honors English 9', 'Advanced freshman English', 2, 1.0, 3, 9, FALSE, TRUE),
('ENG601', 'Honors English 10', 'Advanced sophomore English', 2, 1.0, 3, 10, FALSE, TRUE),
('ENG701', 'Honors English 11', 'Advanced American Literature', 2, 1.0, 3, 11, FALSE, TRUE),
('ENG801', 'Honors English 12', 'Advanced British/World Literature', 2, 1.0, 3, 12, FALSE, TRUE),
('ENG901', 'AP English Language and Composition', 'College-level writing course', 2, 1.0, 4, 11, FALSE, TRUE),
('ENG902', 'AP English Literature and Composition', 'College-level literature analysis', 2, 1.0, 4, 12, FALSE, TRUE),
('ENG601', 'Creative Writing', 'Fiction and poetry writing workshop', 2, 1.0, 1, 9, TRUE, FALSE),
('ENG701', 'Journalism', 'News writing and reporting', 2, 1.0, 1, 10, TRUE, FALSE),
('ENG801', 'Speech and Debate', 'Public speaking and argumentation', 2, 1.0, 1, 9, TRUE, FALSE);

-- Science Courses
INSERT INTO courses (code, name, description, department_id, credits, course_level_id, min_grade_level, is_elective, is_core) VALUES
('SCI101', 'Biology', 'Study of living organisms', 3, 1.0, 1, 9, FALSE, TRUE),
('SCI201', 'Chemistry', 'Study of matter and its properties', 3, 1.0, 1, 10, FALSE, TRUE),
('SCI301', 'Physics', 'Study of matter and energy', 3, 1.0, 1, 11, FALSE, TRUE),
('SCI401', 'Earth & Space Science', 'Study of Earth and astronomical objects', 3, 1.0, 1, 9, FALSE, TRUE),
('SCI501', 'Environmental Science', 'Study of environmental systems', 3, 1.0, 1, 11, TRUE, FALSE),
('SCI601', 'Honors Biology', 'Advanced biology concepts', 3, 1.0, 3, 9, FALSE, TRUE),
('SCI701', 'Honors Chemistry', 'Advanced chemistry concepts', 3, 1.0, 3, 10, FALSE, TRUE),
('SCI801', 'Honors Physics', 'Advanced physics concepts', 3, 1.0, 3, 11, FALSE, TRUE),
('SCI901', 'AP Biology', 'College-level biology', 3, 1.0, 4, 11, FALSE, TRUE),
('SCI902', 'AP Chemistry', 'College-level chemistry', 3, 1.0, 4, 11, FALSE, TRUE),
('SCI903', 'AP Physics 1', 'College-level mechanics', 3, 1.0, 4, 11, FALSE, TRUE),
('SCI904', 'AP Environmental Science', 'College-level environmental science', 3, 1.0, 4, 11, FALSE, TRUE),
('SCI601', 'Anatomy & Physiology', 'Human body structure and function', 3, 1.0, 1, 11, TRUE, FALSE),
('SCI701', 'Marine Science', 'Study of oceans and marine life', 3, 1.0, 1, 10, TRUE, FALSE),
('SCI801', 'Forensic Science', 'Application of science to criminal investigation', 3, 1.0, 1, 11, TRUE, FALSE);

-- Social Studies Courses
INSERT INTO courses (code, name, description, department_id, credits, course_level_id, min_grade_level, is_elective, is_core) VALUES
('SOC101', 'World History', 'Survey of human history', 4, 1.0, 1, 9, FALSE, TRUE),
('SOC201', 'U.S. History', 'Survey of American history', 4, 1.0, 1, 11, FALSE, TRUE),
('SOC301', 'American Government', 'Structure and function of government', 4, 1.0, 1, 12, FALSE, TRUE),
('SOC401', 'Economics', 'Principles of economics', 4, 1.0, 1, 12, FALSE, TRUE),
('SOC501', 'Honors World History', 'Advanced world history', 4, 1.0, 3, 9, FALSE, TRUE),
('SOC601', 'Honors U.S. History', 'Advanced American history', 4, 1.0, 3, 11, FALSE, TRUE),
('SOC701', 'AP U.S. History', 'College-level American history', 4, 1.0, 4, 11, FALSE, TRUE),
('SOC801', 'AP World History', 'College-level world history', 4, 1.0, 4, 10, FALSE, TRUE),
('SOC901', 'AP U.S. Government & Politics', 'College-level political science', 4, 1.0, 4, 12, FALSE, TRUE),
('SOC902', 'AP Macroeconomics', 'College-level macroeconomics', 4, 1.0, 4, 12, FALSE, TRUE),
('SOC401', 'Psychology', 'Introduction to psychological concepts', 4, 1.0, 1, 11, TRUE, FALSE),
('SOC402', 'AP Psychology', 'College-level psychology', 4, 1.0, 4, 11, TRUE, FALSE),
('SOC501', 'Sociology', 'Study of human society', 4, 1.0, 1, 10, TRUE, FALSE),
('SOC601', 'Law Studies', 'Introduction to legal concepts', 4, 1.0, 1, 11, TRUE, FALSE);

-- Elective Courses 
INSERT INTO courses (code, name, description, department_id, credits, course_level_id, min_grade_level, is_elective, is_core) VALUES
-- Art and Design
('ART101', 'Visual Arts', 'Introduction to visual arts', 5, 1.0, 1, 9, TRUE, FALSE),
('ART201', 'Drawing and Painting', 'Techniques in drawing and painting', 5, 1.0, 1, 9, TRUE, FALSE),
('ART301', 'Sculpture', 'Three-dimensional art forms', 5, 1.0, 1, 9, TRUE, FALSE),
('ART401', 'Photography', 'Digital and film photography', 5, 1.0, 1, 9, TRUE, FALSE),
('ART501', 'Digital Art', 'Computer-based art creation', 5, 1.0, 1, 9, TRUE, FALSE),

-- Music
('MUS101', 'Choir', 'Vocal music ensemble', 6, 1.0, 1, 9, TRUE, FALSE),
('MUS201', 'Band', 'Instrumental music ensemble', 6, 1.0, 1, 9, TRUE, FALSE),
('MUS301', 'Orchestra', 'String instruments ensemble', 6, 1.0, 1, 9, TRUE, FALSE),
('MUS401', 'Music Theory', 'Study of music composition', 6, 1.0, 1, 9, TRUE, FALSE),
('MUS501', 'Guitar', 'Guitar instruction', 6, 1.0, 1, 9, TRUE, FALSE),

-- Physical Education & Health
('PE101', 'Physical Education', 'General physical fitness', 7, 0.5, 1, 9, FALSE, TRUE),
('PE201', 'Health', 'Health and wellness education', 7, 0.5, 1, 9, FALSE, TRUE),
('PE301', 'Weight Training', 'Strength training', 7, 0.5, 1, 9, TRUE, FALSE),
('PE401', 'Team Sports', 'Competitive team activities', 7, 0.5, 1, 9, TRUE, FALSE),
('PE501', 'Dance', 'Various dance styles', 7, 0.5, 1, 9, TRUE, FALSE),

-- Foreign Languages
('LANG101', 'Spanish I', 'Beginning Spanish', 8, 1.0, 1, 9, TRUE, FALSE),
('LANG201', 'Spanish II', 'Intermediate Spanish', 8, 1.0, 1, 9, TRUE, FALSE),
('LANG301', 'Spanish III', 'Advanced Spanish', 8, 1.0, 1, 10, TRUE, FALSE),
('LANG401', 'Spanish IV', 'Fluent Spanish', 8, 1.0, 1, 11, TRUE, FALSE),
('LANG501', 'French I', 'Beginning French', 8, 1.0, 1, 9, TRUE, FALSE),
('LANG601', 'French II', 'Intermediate French', 8, 1.0, 1, 9, TRUE, FALSE),
('LANG701', 'French III', 'Advanced French', 8, 1.0, 1, 10, TRUE, FALSE),
('LANG801', 'French IV', 'Fluent French', 8, 1.0, 1, 11, TRUE, FALSE);

-- Course Prerequisites (based on the form responses from document)
INSERT INTO course_prerequisites (course_id, prerequisite_course_id) VALUES
-- Geometry requires Algebra 1
(2, 1),
-- Algebra 2 requires Geometry
(3, 2),
-- Pre-Calculus requires Algebra 2
(4, 3),
-- AP Calculus AB requires Pre-Calculus
(5, 4),
-- AP Calculus BC requires AP Calculus AB
(6, 5),
-- Chemistry requires Biology
(17, 16),
-- Physics requires Chemistry
(18, 17),
-- AP Biology requires Biology
(24, 16),
-- AP Chemistry requires Chemistry
(25, 17),
-- AP Physics 1 requires Physics
(26, 18),
-- English 10 requires English 9
(12, 11),
-- English 11 requires English 10
(13, 12),
-- English 12 requires English 11
(14, 13),
-- Spanish II requires Spanish I
(46, 45),
-- Spanish III requires Spanish II
(47, 46),
-- Spanish IV requires Spanish III
(48, 47),
-- French II requires French I
(50, 49),
-- French III requires French II
(51, 50),
-- French IV requires French III
(52, 51);

-- Course Sequences (based on provided sequence information)
-- Mathematics sequence
INSERT INTO course_sequences (department_id, course_id, sequence_order) VALUES
(1, 1, 1),  -- Algebra 1
(1, 2, 2),  -- Geometry
(1, 3, 3),  -- Algebra 2
(1, 4, 4),  -- Pre-Calculus
(1, 5, 5),  -- AP Calculus AB
(1, 6, 6),  -- AP Calculus BC
(1, 7, 5),  -- AP Statistics (alternative to Calculus)
(1, 8, 5);  -- Probability & Statistics (alternative to Calculus)

-- English sequence
INSERT INTO course_sequences (department_id, course_id, sequence_order) VALUES
(2, 11, 1),  -- English 9
(2, 12, 2),  -- English 10
(2, 13, 3),  -- English 11
(2, 14, 4),  -- English 12
(2, 19, 3),  -- AP English Language (alternative to English 11)
(2, 20, 4);  -- AP English Literature (alternative to English 12)

-- Science sequence (based on form)
INSERT INTO course_sequences (department_id, course_id, sequence_order) VALUES
(3, 16, 1),  -- Biology
(3, 17, 2),  -- Chemistry
(3, 18, 3),  -- Physics
(3, 19, 4),  -- Earth & Space Science
(3, 20, 5);  -- Environmental Science

-- Sample Course Sections for current term
-- Math Sections
INSERT INTO course_sections (course_id, section_number, school_year_id, term_id, time_block_id, room_id, teacher_id, max_enrollment, current_enrollment) VALUES
(1, 'A', 2, 4, 1, 1, 1, 30, 28),  -- Algebra 1, Period 1
(1, 'B', 2, 4, 3, 1, 1, 30, 25),  -- Algebra 1, Period 3
(2, 'A', 2, 4, 2, 2, 1, 30, 30),  -- Geometry, Period 2
(2, 'B', 2, 4, 4, 2, 1, 30, 29),  -- Geometry, Period 4
(3, 'A', 2, 4, 5, 1, 1, 30, 22),  -- Algebra 2, Period 5
(4, 'A', 2, 4, 7, 2, 1, 30, 18),  -- Pre-Calculus, Period 6
(5, 'A', 2, 4, 8, 1, 1, 25, 15);  -- AP Calculus AB, Period 7

-- English Sections
INSERT INTO course_sections (course_id, section_number, school_year_id, term_id, time_block_id, room_id, teacher_id, max_enrollment, current_enrollment) VALUES
(11, 'A', 2, 4, 1, 3, 2, 30, 27),  -- English 9, Period 1
(11, 'B', 2, 4, 3, 3, 2, 30, 26),  -- English 9, Period 3
(12, 'A', 2, 4, 2, 4, 2, 30, 28),  -- English 10, Period 2
(12, 'B', 2, 4, 4, 4, 2, 30, 27),  -- English 10, Period 4
(13, 'A', 2, 4, 5, 3, 2, 30, 24),  -- English 11, Period 5
(14, 'A', 2, 4, 7, 4, 2, 30, 21);  -- English 12, Period 6

-- Science Sections
INSERT INTO course_sections (course_id, section_number, school_year_id, term_id, time_block_id, room_id, teacher_id, max_enrollment, current_enrollment) VALUES
(16, 'A', 2, 4, 1, 14, 3, 24, 23),  -- Biology, Period 1
(16, 'B', 2, 4, 3, 14, 3, 24, 22),  -- Biology, Period 3
(17, 'A', 2, 4, 2, 15, 3, 24, 24),  -- Chemistry, Period 2
(17, 'B', 2, 4, 4, 15, 3, 24, 23),  -- Chemistry, Period 4
(18, 'A', 2, 4, 5, 14, 3, 24, 20),  -- Physics, Period 5
(20, 'A', 2, 4, 7, 15, 3, 24, 15);  -- Environmental Science, Period 6

-- Social Studies Sections
INSERT INTO course_sections (course_id, section_number, school_year_id, term_id, time_block_id, room_id, teacher_id, max_enrollment, current_enrollment) VALUES
(31, 'A', 2, 4, 1, 5, 4, 30, 28),  -- World History, Period 1
(31, 'B', 2, 4, 3, 5, 4, 30, 27),  -- World History, Period 3
(32, 'A