# Academic Grading System - Unified Recommendation

## Overview

This document outlines a comprehensive academic grading system that handles:
1. **Quarter/Semester Structure** - 4 quarters per school year (2 quarters = 1 semester)
2. **Transfer Student Grading** - Handling students from other schools with different grading systems
3. **Flexible Grade Management** - Support for multiple grading scales and conversion

## System Architecture

### Core Models

#### 1. Academic Period Structure
```prisma
SchoolYear (1) → (Many) Quarters
SchoolYear (1) → (Many) Semesters  
Semester (1) → (Many) Quarters
```

#### 2. Grading Models
- **StudentGrade** - Primary grading model for current students
- **TransferGrade** - Handles grades from transfer students
- **GradeConversionRule** - Converts between different grading systems

## Database Schema

### Configuration-Driven Academic Period Models

```prisma
model AcademicCycleConfig {
  id                    String    @id @default(cuid())
  name                  String    @db.VarChar(100) // "Standard 4-Quarter System", "Trimester System"
  description           String?   @db.Text
  isActive              Boolean   @default(false) @map("is_active")
  isDefault             Boolean   @default(false) @map("is_default")
  
  // Structure configuration
  hasSemesters          Boolean   @default(true) @map("has_semesters")
  hasQuarters           Boolean   @default(true) @map("has_quarters")
  hasTrimesters         Boolean   @default(false) @map("has_trimesters")
  hasSessions           Boolean   @default(false) @map("has_sessions")
  
  // Validation rules
  enforceStructure      Boolean   @default(true) @map("enforce_structure")
  allowCustomCycles     Boolean   @default(false) @map("allow_custom_cycles")
  requireValidation     Boolean   @default(true) @map("require_validation")
  
  // Metadata
  createdBy             String    @map("created_by")
  createdAt             DateTime  @default(now()) @map("created_at")
  updatedAt             DateTime  @updatedAt @map("updated_at")
  
  // Relations
  creator               User      @relation("AcademicCycleConfigCreator", fields: [createdBy], references: [id])
  cycleRules            AcademicCycleRule[]
  academicCycles        AcademicCycle[]
  
  @@map("academic_cycle_config")
}

model AcademicCycleRule {
  id                    String    @id @default(cuid())
  configId              String    @map("config_id")
  parentCycleType       CycleType? @map("parent_cycle_type") // null for root level
  cycleType             CycleType @map("cycle_type")
  cycleName             String    @db.VarChar(100) // "Quarter", "Semester", "Trimester"
  cycleNumber           Int?      @map("cycle_number") // 1, 2, 3, 4
  isRequired            Boolean   @default(true) @map("is_required")
  minCount              Int       @default(1) @map("min_count")
  maxCount              Int       @default(1) @map("max_count")
  defaultDuration       Int       @default(90) @map("default_duration") // days
  sortOrder             Int       @default(0) @map("sort_order")
  
  // Validation rules
  mustBeSequential      Boolean   @default(true) @map("must_be_sequential")
  mustHaveGaps          Boolean   @default(false) @map("must_have_gaps")
  allowOverlap          Boolean   @default(false) @map("allow_overlap")
  
  // Relations
  config                AcademicCycleConfig @relation(fields: [configId], references: [id])
  
  @@unique([configId, cycleType, cycleNumber])
  @@map("academic_cycle_rule")
}

model AcademicCycle {
  id              String          @id @default(cuid())
  parentId        String?         @map("parent_id") // Self-referencing for hierarchy
  configId        String?         @map("config_id") // Reference to active config
  name            String          @db.VarChar(100)
  cycleType       CycleType       @map("cycle_type")
  cycleNumber     Int?            @map("cycle_number")
  startDate       DateTime        @map("start_date")
  endDate         DateTime        @map("end_date")
  isCurrent       Boolean         @default(false) @map("is_current")
  isActive        Boolean         @default(true) @map("is_active")
  
  // Validation status
  isValidated     Boolean         @default(false) @map("is_validated")
  validatedBy     String?         @map("validated_by")
  validatedAt     DateTime?       @map("validated_at")
  validationNotes String?         @map("validation_notes") @db.Text
  
  // Metadata
  description     String?         @db.Text
  createdAt       DateTime        @default(now()) @map("created_at")
  updatedAt       DateTime        @updatedAt @map("updated_at")
  
  // Self-referencing relations
  parent          AcademicCycle?  @relation("CycleHierarchy", fields: [parentId], references: [id])
  children        AcademicCycle[] @relation("CycleHierarchy")
  
  // Configuration relations
  config          AcademicCycleConfig? @relation(fields: [configId], references: [id])
  validator       User?           @relation("AcademicCycleValidator", fields: [validatedBy], references: [id])
  
  // Related data
  grades          StudentGrade[]
  sections        CourseSection[]
  schedules       Schedule[]
  
  @@index([parentId])
  @@index([cycleType])
  @@index([configId])
  @@map("academic_cycle")
}

enum CycleType {
  SCHOOL_YEAR
  SEMESTER
  QUARTER
  TRIMESTER
  SESSION
  @map("cycle_type")
}
```

### Grading Models

```prisma
model StudentGrade {
  id                String          @id @default(cuid())
  studentId         String          @map("student_id")
  courseId          String          @map("course_id")
  academicCycleId   String          @map("academic_cycle_id") // Points to Quarter/Semester/SchoolYear
  schoolYearId      String          @map("school_year_id") // Always points to SchoolYear for easy queries
  
  // Grade data
  grade             String?         @db.VarChar(2) // "A", "B", "C", etc.
  gradePoints       Decimal?        @map("grade_points") @db.Decimal(3, 2)
  percentage        Decimal?        @db.Decimal(5, 2) // 85.50
  isPassed          Boolean         @default(true) @map("is_passed")
  creditEarned      Decimal         @map("credit_earned") @db.Decimal(3, 1)
  
  // Metadata
  gradedBy          String?         @map("graded_by")
  gradedAt          DateTime?       @map("graded_at")
  notes             String?         @db.Text
  
  // Relations
  student           Student         @relation(fields: [studentId], references: [id])
  course            Course          @relation(fields: [courseId], references: [id])
  academicCycle     AcademicCycle   @relation(fields: [academicCycleId], references: [id])
  schoolYear        AcademicCycle   @relation("SchoolYearGrades", fields: [schoolYearId], references: [id])
  teacher           User?           @relation("GradeTeacher", fields: [gradedBy], references: [id])
  
  @@unique([studentId, courseId, academicCycleId])
  @@map("student_grade")
}

model TransferGrade {
  id                String    @id @default(cuid())
  studentId         String    @map("student_id")
  
  // Course information
  courseName        String    @map("course_name") @db.VarChar(255)
  courseCode        String?   @map("course_code") @db.VarChar(50)
  courseCredits     Decimal   @map("course_credits") @db.Decimal(3, 1)
  
  // Grade information
  originalGrade     String    @map("original_grade") @db.VarChar(10)
  originalGradeSystem String  @map("original_grade_system") @db.VarChar(50)
  convertedGrade    String?   @map("converted_grade") @db.VarChar(2)
  convertedGradePoints Decimal? @map("converted_grade_points") @db.Decimal(3, 2)
  
  // Academic period
  academicYear      String    @map("academic_year") @db.VarChar(20)
  academicPeriod    String    @map("academic_period") @db.VarChar(50)
  
  // Status and validation
  isAccepted        Boolean   @default(false) @map("is_accepted")
  isPending         Boolean   @default(true) @map("is_pending")
  acceptedBy        String?   @map("accepted_by")
  acceptedAt        DateTime? @map("accepted_at")
  rejectionReason   String?   @map("rejection_reason") @db.Text
  
  // Relations
  student           Student   @relation(fields: [studentId], references: [id])
  counselor         User?     @relation("TransferGradeCounselor", fields: [acceptedBy], references: [id])
  
  @@map("transfer_grade")
}

model GradeConversionRule {
  id                    String    @id @default(cuid())
  fromGradeSystem       String    @map("from_grade_system") @db.VarChar(50)
  fromGrade             String    @map("from_grade") @db.VarChar(20)
  toGradeSystem         String    @map("to_grade_system") @db.VarChar(50)
  toGrade               String    @map("to_grade") @db.VarChar(10)
  toGradePoints         Decimal   @map("to_grade_points") @db.Decimal(3, 2)
  isActive              Boolean   @default(true) @map("is_active")
  
  @@unique([fromGradeSystem, fromGrade, toGradeSystem])
  @@map("grade_conversion_rule")
}
```

### Enhanced Student Model

```prisma
model Student {
  // ... existing fields ...
  
  // Transfer student fields
  isTransferStudent Boolean                 @default(false) @map("is_transfer_student")
  transferDate      DateTime?               @map("transfer_date")
  previousSchool    String?                 @map("previous_school") @db.VarChar(255)
  previousSchoolYear String?                @map("previous_school_year") @db.VarChar(50)
  transferCredits   Decimal                 @default(0.0) @map("transfer_credits") @db.Decimal(5, 1)
  
  // Relations
  grades            StudentGrade[]
  transferGrades    TransferGrade[]
}
```

## Academic Year Structure

### Configuration-Driven Setup
The system uses a configuration-driven approach where admins define the academic cycle structure once, and all school years follow that pattern.

#### Standard 4-Quarter Configuration
```
School Year: 2024-2025
├── Fall Semester (Semester 1)
│   ├── Q1: August 1 - October 15
│   └── Q2: October 16 - December 31
└── Spring Semester (Semester 2)
    ├── Q3: January 1 - March 15
    └── Q4: March 16 - June 30
```

#### Trimester Configuration
```
School Year: 2024-2025
├── Trimester 1: August 1 - November 30
├── Trimester 2: December 1 - March 31
└── Trimester 3: April 1 - June 30
```

#### Custom Configuration
Admins can create custom configurations with any combination of:
- School Years
- Semesters
- Quarters
- Trimesters
- Sessions
- Custom cycles

## Grade Calculation Logic

### 1. Cycle Grade (Quarter/Semester/Trimester)
- Direct grade entry by teacher for the specific cycle
- Stored in `StudentGrade` table with `academicCycleId`
- Unique per student-course-cycle combination

### 2. Parent Cycle Grade (Semester/Year)
- Calculated as average of child cycle grades
- Formula: `(Child1_GradePoints + Child2_GradePoints + ...) / ChildCount`
- Automatically computed when all child cycles are complete

### 3. Grade Calculation Examples
```typescript
// Quarter Grade (direct entry)
const quarterGrade = await getGrade(studentId, courseId, quarterId);

// Semester Grade (calculated from quarters)
const semesterGrade = await calculateParentGrade(studentId, courseId, semesterId);

// Year Grade (calculated from all quarters)
const yearGrade = await calculateParentGrade(studentId, courseId, schoolYearId);
```

### 4. Transfer Grade Integration
- Transfer grades are converted to internal system
- Added to student's total credits
- Can be used for course prerequisites

## Transfer Student Workflow

### Step 1: Student Registration
```typescript
// Mark student as transfer during registration
await prisma.student.update({
  where: { id: studentId },
  data: {
    isTransferStudent: true,
    transferDate: new Date(),
    previousSchool: "Previous School Name",
    previousSchoolYear: "2023-2024"
  }
});
```

### Step 2: Transcript Processing
```typescript
// Process uploaded transcript
const transcriptData = [
  {
    courseName: "Algebra I",
    courseCode: "MATH101",
    grade: "A",
    gradeSystem: "Letter",
    credits: 1.0,
    academicYear: "2023-2024",
    academicPeriod: "Full Year"
  }
];

await transferGradeService.processTranscript(studentId, transcriptData);
```

### Step 3: Grade Conversion
```typescript
// Convert external grades to internal system
const convertedGrade = await gradeConversionService.convertGrade(
  originalGrade: "A",
  fromSystem: "Letter",
  toSystem: "Letter"
);
// Returns: { grade: "A", gradePoints: 4.0 }
```

### Step 4: Counselor Review
```typescript
// Counselor approves/rejects transfer grades
await prisma.transferGrade.update({
  where: { id: transferGradeId },
  data: {
    isAccepted: true,
    isPending: false,
    acceptedBy: counselorId,
    acceptedAt: new Date()
  }
});
```

## Grade Conversion Examples

### Letter Grade System
```
A = 4.0, A- = 3.7, B+ = 3.3, B = 3.0, B- = 2.7
C+ = 2.3, C = 2.0, C- = 1.7, D+ = 1.3, D = 1.0, F = 0.0
```

### Percentage to Letter Conversion
```
93-100 = A, 90-92 = A-, 87-89 = B+, 83-86 = B
80-82 = B-, 77-79 = C+, 73-76 = C, 70-72 = C-
67-69 = D+, 63-66 = D, 60-62 = D-, 0-59 = F
```

### Descriptive to Letter Conversion
```
Excellent = A, Good = B, Satisfactory = C, Needs Improvement = D, Failing = F
```

## API Endpoints

### Academic Cycle Configuration
```
GET    /api/academic-cycle-configs
GET    /api/academic-cycle-configs/:id
POST   /api/academic-cycle-configs
PUT    /api/academic-cycle-configs/:id
DELETE /api/academic-cycle-configs/:id
PUT    /api/academic-cycle-configs/:id/activate
GET    /api/academic-cycle-configs/active
```

### Academic Cycles
```
GET    /api/academic-cycles
GET    /api/academic-cycles/:id
GET    /api/academic-cycles/:id/hierarchy
POST   /api/academic-cycles
PUT    /api/academic-cycles/:id
DELETE /api/academic-cycles/:id
POST   /api/academic-cycles/:id/validate
GET    /api/academic-cycles/current
GET    /api/academic-cycles/by-type/:cycleType
```

### Grades
```
GET    /api/grades/students/:studentId
GET    /api/grades/students/:studentId/quarters/:quarterId
GET    /api/grades/students/:studentId/semesters/:semesterId
POST   /api/grades
PUT    /api/grades/:id
DELETE /api/grades/:id
```

### Transfer Grades
```
GET    /api/transfer-grades/students/:studentId
POST   /api/transfer-grades/students/:studentId/process-transcript
PUT    /api/transfer-grades/:id/approve
PUT    /api/transfer-grades/:id/reject
```

### Grade Conversions
```
GET    /api/grade-conversions/rules
POST   /api/grade-conversions/rules
POST   /api/grade-conversions/convert
```

## Frontend Components

### 1. Academic Cycle Configuration Management
- Configuration Templates (Standard 4-Quarter, Trimester, Custom)
- Configuration Editor with Rule Builder
- Active Configuration Display
- Configuration Validation

### 2. Academic Cycle Management
- School Year Creation with Automatic Structure Generation
- Cycle Hierarchy Visualization
- Cycle Validation and Status Management
- Academic Calendar View

### 3. Grade Entry Interface
- Teacher Grade Entry Form (Cycle-specific)
- Grade Validation and Calculation
- Grade History View with Hierarchy
- Bulk Grade Entry

### 4. Transfer Student Dashboard
- Transfer Student Registration
- Transcript Upload and Processing
- Transfer Grade Review (Counselor)
- Transfer Credit Summary (Student)

### 5. Grade Reports
- Cycle-specific Grade Reports
- Hierarchical Grade Reports (Quarter → Semester → Year)
- Transfer Credit Reports
- Grade Analytics and Trends

## Migration Strategy

### Phase 1: Schema Setup
1. Add new models (AcademicCycleConfig, AcademicCycleRule, AcademicCycle, StudentGrade, TransferGrade, GradeConversionRule)
2. Update existing models (Student, SchoolYear)
3. Create initial migration

### Phase 2: Configuration Setup
1. Create default academic cycle configurations (Standard 4-Quarter, Trimester)
2. Set up grade conversion rules
3. Configure validation rules

### Phase 3: Data Migration
1. Migrate existing `StudentCourseHistory` to new `StudentGrade` structure
2. Create academic cycles for existing school years using active configuration
3. Validate migrated data against configuration rules

### Phase 4: Backend Implementation
1. Create academic cycle configuration services
2. Implement academic cycle management services
3. Build grade calculation logic with hierarchy support
4. Add transfer student processing
5. Implement grade conversion services

### Phase 5: Frontend Implementation
1. Build academic cycle configuration management UI
2. Create academic cycle management interfaces
3. Implement grade entry interfaces with cycle hierarchy
4. Build transfer student workflows
5. Add comprehensive grade reporting features

### Phase 6: Testing & Cleanup
1. Test configuration-driven cycle creation
2. Validate grade calculations across hierarchy
3. Test transfer student workflows
4. Remove old `StudentCourseHistory` model
5. Update documentation

## Benefits

### ✅ Configuration-Driven System
- One-time setup of academic period structure
- Consistent structure across all school years
- Easy to change structure without data migration
- Template-based configurations for common systems

### ✅ Flexible Parent-Child Hierarchy
- Supports any nesting level (School Year → Semester → Quarter → Session)
- Easy to add new cycle types without schema changes
- Hierarchical grade calculations
- Flexible cycle relationships

### ✅ Validation & Enforcement
- Automatic validation against configuration rules
- Enforces structure consistency
- Prevents invalid period setups
- Audit trail for all changes

### ✅ Unified Grading System
- Single approach for all grading scenarios
- Consistent data structure across all cycle types
- Hierarchical grade calculations
- Simplified maintenance

### ✅ Transfer Student Support
- Automated grade conversion
- Manual review capabilities
- Comprehensive transfer tracking
- Integration with existing credit system

### ✅ Scalable & Extensible
- Handles large student populations
- Supports multiple schools
- Easy to add new cycle types
- Future-proof architecture

## Implementation Timeline

- **Week 1-2**: Schema design and configuration models
- **Week 3-4**: Backend configuration and period management services
- **Week 5-6**: Grade calculation logic with hierarchy support
- **Week 7-8**: Frontend configuration management and period interfaces
- **Week 9-10**: Grade entry interfaces and reporting features
- **Week 11**: Transfer student integration
- **Week 12**: Testing, validation, and documentation

## Key Features Summary

### 🎯 **Configuration-Driven Approach**
- **One-time setup** of academic period structure by admins
- **Template-based configurations** for common systems (4-Quarter, Trimester)
- **Validation rules** to enforce structure consistency
- **Easy structure changes** without data migration

### 🏗️ **Parent-Child Hierarchy**
- **Single AcademicCycle model** with self-referencing relationships
- **Flexible nesting** (School Year → Semester → Quarter → Session)
- **Hierarchical grade calculations** (Quarter → Semester → Year)
- **Easy to extend** with new cycle types

### 📊 **Unified Grading System**
- **Single StudentGrade model** for all cycle types
- **Automatic grade calculations** across hierarchy
- **Transfer student support** with grade conversion
- **Comprehensive reporting** and analytics

### 🔧 **Admin Control**
- **Configuration management** interface
- **Structure validation** and enforcement
- **Template creation** for different academic systems
- **Audit trail** for all changes

This configuration-driven, parent-child approach provides maximum flexibility while maintaining consistency and validation across the entire academic grading system with clear distinction from daily class periods.
