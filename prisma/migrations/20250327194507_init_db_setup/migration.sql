-- Drop existing tables if they exist
DROP TABLE IF EXISTS "course_rule" CASCADE;
DROP TABLE IF EXISTS "rule" CASCADE;
DROP TABLE IF EXISTS "audit_log" CASCADE;
DROP TABLE IF EXISTS "system_setting" CASCADE;
DROP TABLE IF EXISTS "course_waitlist" CASCADE;
DROP TABLE IF EXISTS "course_conflict" CASCADE;
DROP TABLE IF EXISTS "schedule_change_action" CASCADE;
DROP TABLE IF EXISTS "schedule_change_request" CASCADE;
DROP TABLE IF EXISTS "schedule" CASCADE;
DROP TABLE IF EXISTS "student_course_history" CASCADE;
DROP TABLE IF EXISTS "course_section" CASCADE;
DROP TABLE IF EXISTS "course_prerequisite" CASCADE;
DROP TABLE IF EXISTS "course_sequence" CASCADE;
DROP TABLE IF EXISTS "course" CASCADE;
DROP TABLE IF EXISTS "student" CASCADE;
DROP TABLE IF EXISTS "teacher" CASCADE;
DROP TABLE IF EXISTS "time_block" CASCADE;
DROP TABLE IF EXISTS "room" CASCADE;
DROP TABLE IF EXISTS "grade_level" CASCADE;
DROP TABLE IF EXISTS "course_level" CASCADE;
DROP TABLE IF EXISTS "department" CASCADE;
DROP TABLE IF EXISTS "term" CASCADE;
DROP TABLE IF EXISTS "school_year" CASCADE;
DROP TABLE IF EXISTS "settings" CASCADE;
DROP TABLE IF EXISTS "notification" CASCADE;
DROP TABLE IF EXISTS "user" CASCADE;

-- Create enums
CREATE TYPE "user_role" AS ENUM ('ADMIN', 'TEACHER', 'STUDENT', 'COUNSELOR');
CREATE TYPE "notification_type" AS ENUM ('CAPACITY_ALERT', 'DEADLINE_REMINDER', 'SYSTEM_UPDATE', 'CONFLICT_DETECTED', 'GENERAL', 'REQUEST_UPDATE', 'REQUEST_APPROVED', 'REQUEST_DENIED');
CREATE TYPE "request_status" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELED', 'DENIED');
CREATE TYPE "request_priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE "conflict_type" AS ENUM ('SCHEDULE_OVERLAP', 'TIME_OVERLAP', 'TEACHER_CONFLICT', 'ROOM_CONFLICT', 'PREREQUISITE_NOT_MET', 'MAX_ENROLLMENT_REACHED', 'OTHER');
CREATE TYPE "rule_type" AS ENUM ('SCHEDULE_OVERLAP', 'PREREQUISITE', 'GRADE_REQUIREMENT', 'CAPACITY', 'OTHER');

-- Create base tables first (no foreign key dependencies)
CREATE TABLE "user" (
    "id" TEXT PRIMARY KEY,
    "email" VARCHAR(255) UNIQUE NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "role" "user_role" NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "school_year" (
    "id" TEXT PRIMARY KEY,
    "name" VARCHAR(50) NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "is_current" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "department" (
    "id" TEXT PRIMARY KEY,
    "name" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "course_level" (
    "id" TEXT PRIMARY KEY,
    "name" VARCHAR(50) NOT NULL,
    "rank" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "grade_level" (
    "id" TEXT PRIMARY KEY,
    "name" VARCHAR(50) NOT NULL,
    "level" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "room" (
    "id" TEXT PRIMARY KEY,
    "name" VARCHAR(50) NOT NULL,
    "capacity" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "time_block" (
    "id" TEXT PRIMARY KEY,
    "name" VARCHAR(50) NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL
);

-- Create tables with first-level dependencies
CREATE TABLE "term" (
    "id" TEXT PRIMARY KEY,
    "school_year_id" TEXT NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "is_current" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    FOREIGN KEY ("school_year_id") REFERENCES "school_year"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "teacher" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT,
    "email" TEXT UNIQUE NOT NULL,
    "password" TEXT,
    "department_id" TEXT NOT NULL,
    "max_courses" INTEGER NOT NULL DEFAULT 6,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    FOREIGN KEY ("department_id") REFERENCES "department"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "student" (
    "id" TEXT PRIMARY KEY,
    "user_id" TEXT UNIQUE NOT NULL,
    "student_id" VARCHAR(20) UNIQUE NOT NULL,
    "grade_level_id" TEXT NOT NULL,
    "graduation_year" INTEGER,
    "has_iep" BOOLEAN NOT NULL DEFAULT false,
    "is_dual_enrollment" BOOLEAN NOT NULL DEFAULT false,
    "is_college_bound" BOOLEAN NOT NULL DEFAULT false,
    "is_credit_recovery" BOOLEAN NOT NULL DEFAULT false,
    "max_credits_per_term" DECIMAL(3,1) NOT NULL DEFAULT 8.0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY ("grade_level_id") REFERENCES "grade_level"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "course" (
    "id" TEXT PRIMARY KEY,
    "code" VARCHAR(20) UNIQUE NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "department_id" TEXT NOT NULL,
    "credits" DECIMAL(3,1) NOT NULL DEFAULT 1.0,
    "course_level_id" TEXT NOT NULL,
    "min_grade_level_id" TEXT NOT NULL,
    "max_students" INTEGER NOT NULL DEFAULT 30,
    "is_elective" BOOLEAN NOT NULL DEFAULT false,
    "is_core" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    FOREIGN KEY ("department_id") REFERENCES "department"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY ("course_level_id") REFERENCES "course_level"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY ("min_grade_level_id") REFERENCES "grade_level"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Create tables with second-level dependencies
CREATE TABLE "course_prerequisite" (
    "id" TEXT PRIMARY KEY,
    "course_id" TEXT NOT NULL,
    "prerequisite_course_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    FOREIGN KEY ("course_id") REFERENCES "course"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY ("prerequisite_course_id") REFERENCES "course"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    UNIQUE("course_id", "prerequisite_course_id")
);

CREATE TABLE "course_sequence" (
    "id" TEXT PRIMARY KEY,
    "department_id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "sequence_order" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    FOREIGN KEY ("department_id") REFERENCES "department"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY ("course_id") REFERENCES "course"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    UNIQUE("department_id", "course_id")
);

CREATE TABLE "course_section" (
    "id" TEXT PRIMARY KEY,
    "course_id" TEXT NOT NULL,
    "section_number" VARCHAR(10) NOT NULL,
    "school_year_id" TEXT NOT NULL,
    "term_id" TEXT NOT NULL,
    "time_block_id" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "teacher_id" TEXT NOT NULL,
    "max_enrollment" INTEGER NOT NULL,
    "current_enrollment" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    FOREIGN KEY ("course_id") REFERENCES "course"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY ("school_year_id") REFERENCES "school_year"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY ("term_id") REFERENCES "term"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY ("time_block_id") REFERENCES "time_block"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY ("room_id") REFERENCES "room"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY ("teacher_id") REFERENCES "teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    UNIQUE("course_id", "section_number", "school_year_id", "term_id")
);

CREATE TABLE "schedule" (
    "id" TEXT PRIMARY KEY,
    "student_id" TEXT UNIQUE NOT NULL,
    "semester" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    FOREIGN KEY ("student_id") REFERENCES "student"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "student_course_history" (
    "id" TEXT PRIMARY KEY,
    "student_id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "school_year_id" TEXT NOT NULL,
    "term_id" TEXT NOT NULL,
    "grade" VARCHAR(2),
    "is_passed" BOOLEAN NOT NULL DEFAULT true,
    "credit_earned" DECIMAL(3,1) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    FOREIGN KEY ("student_id") REFERENCES "student"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY ("course_id") REFERENCES "course"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY ("school_year_id") REFERENCES "school_year"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY ("term_id") REFERENCES "term"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "schedule_change_request" (
    "id" TEXT PRIMARY KEY,
    "student_id" TEXT NOT NULL,
    "school_year_id" TEXT NOT NULL,
    "term_id" TEXT NOT NULL,
    "current_course_section_id" TEXT NOT NULL,
    "requested_course_id" TEXT NOT NULL,
    "preferred_time_block_id" TEXT,
    "reason" TEXT NOT NULL,
    "status" "request_status" NOT NULL DEFAULT 'PENDING',
    "priority" "request_priority" NOT NULL DEFAULT 'MEDIUM',
    "reviewed_by_id" TEXT,
    "resolution_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    FOREIGN KEY ("student_id") REFERENCES "student"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY ("school_year_id") REFERENCES "school_year"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY ("term_id") REFERENCES "term"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY ("current_course_section_id") REFERENCES "course_section"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY ("requested_course_id") REFERENCES "course"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY ("preferred_time_block_id") REFERENCES "time_block"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY ("reviewed_by_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "schedule_change_action" (
    "id" TEXT PRIMARY KEY,
    "request_id" TEXT NOT NULL,
    "removed_course_section_id" TEXT,
    "added_course_section_id" TEXT,
    "action_by_id" TEXT NOT NULL,
    "action_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    FOREIGN KEY ("request_id") REFERENCES "schedule_change_request"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY ("removed_course_section_id") REFERENCES "course_section"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY ("added_course_section_id") REFERENCES "course_section"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY ("action_by_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "course_conflict" (
    "id" TEXT PRIMARY KEY,
    "course_section_id1" TEXT NOT NULL,
    "course_section_id2" TEXT NOT NULL,
    "conflict_type" "conflict_type" NOT NULL,
    "is_resolvable" BOOLEAN NOT NULL DEFAULT false,
    "resolution_notes" TEXT,
    "request_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    FOREIGN KEY ("course_section_id1") REFERENCES "course_section"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY ("course_section_id2") REFERENCES "course_section"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY ("request_id") REFERENCES "schedule_change_request"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    UNIQUE("course_section_id1", "course_section_id2")
);

CREATE TABLE "course_waitlist" (
    "id" TEXT PRIMARY KEY,
    "course_section_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "request_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    FOREIGN KEY ("course_section_id") REFERENCES "course_section"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY ("student_id") REFERENCES "student"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY ("request_id") REFERENCES "schedule_change_request"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    UNIQUE("course_section_id", "student_id")
);

CREATE TABLE "system_setting" (
    "id" TEXT PRIMARY KEY,
    "key" VARCHAR(100) UNIQUE NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "audit_log" (
    "id" TEXT PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "action" VARCHAR(255) NOT NULL,
    "entity_type" VARCHAR(50) NOT NULL,
    "entity_id" TEXT NOT NULL,
    "details" JSONB,
    "ip_address" VARCHAR(45),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "rule" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT UNIQUE NOT NULL,
    "type" "rule_type" NOT NULL,
    "description" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "course_rule" (
    "id" TEXT PRIMARY KEY,
    "course_id" TEXT NOT NULL,
    "conflicting_course_id" TEXT NOT NULL,
    "type" "rule_type" NOT NULL,
    "description" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    FOREIGN KEY ("course_id") REFERENCES "course"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY ("conflicting_course_id") REFERENCES "course"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);


-- Create notification table
CREATE TABLE notification (
    id VARCHAR(255) PRIMARY KEY,
    student_id VARCHAR(255),
    user_id VARCHAR(255),
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    type notification_type NOT NULL,
    FOREIGN KEY (student_id) REFERENCES student(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE SET NULL
);

-- Create settings table
CREATE TABLE settings (
    id VARCHAR(255) PRIMARY KEY,
    school_name VARCHAR(255) NOT NULL,
    academic_year VARCHAR(255) NOT NULL,
    semester VARCHAR(255) NOT NULL,
    max_course_load INTEGER DEFAULT 8,
    allow_conflicts BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX notification_student_id_idx ON notification(student_id);
CREATE INDEX notification_user_id_idx ON notification(user_id);
CREATE INDEX notification_created_at_idx ON notification(created_at);
CREATE INDEX "course_section_course_id_idx" ON "course_section"("course_id");
CREATE INDEX "course_section_term_id_idx" ON "course_section"("term_id");
CREATE INDEX "course_section_teacher_id_idx" ON "course_section"("teacher_id");
CREATE INDEX "schedule_change_request_student_id_idx" ON "schedule_change_request"("student_id");
CREATE INDEX "schedule_change_request_status_idx" ON "schedule_change_request"("status");
CREATE INDEX "course_conflict_course_section_id1_idx" ON "course_conflict"("course_section_id1");
CREATE INDEX "course_conflict_course_section_id2_idx" ON "course_conflict"("course_section_id2");
CREATE INDEX "course_waitlist_course_section_id_idx" ON "course_waitlist"("course_section_id");
CREATE INDEX "course_waitlist_student_id_idx" ON "course_waitlist"("student_id");
CREATE INDEX "course_waitlist_request_id_idx" ON "course_waitlist"("request_id");
CREATE INDEX "audit_log_user_id_idx" ON "audit_log"("user_id");
CREATE INDEX "audit_log_entity_type_entity_id_idx" ON "audit_log"("entity_type", "entity_id");
CREATE INDEX "audit_log_created_at_idx" ON "audit_log"("created_at"); 