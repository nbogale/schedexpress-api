# Grade System Implementation

This document describes the comprehensive grade system implemented in the ScheduleExpress API, including grade lookup tables, GPA calculations, and integration with student course history.

## Overview

The grade system consists of two main components:
1. **GradeLookup API** - Manages grade definitions and point values
2. **StudentCourseHistory API** - Tracks student grades and integrates with grade lookup

## Database Schema

### GradeLookup Model

```prisma
model GradeLookup {
  id          String   @id @default(cuid())
  grade       String   @unique @db.VarChar(2)
  gradePoints Decimal  @map("grade_points") @db.Decimal(3, 2)
  description String?  @db.VarChar(100)
  isPassing   Boolean  @map("is_passing") @default(true)
  isActive    Boolean  @map("is_active") @default(true)
  createdAt   DateTime @map("created_at") @default(now())
  updatedAt   DateTime @map("updated_at") @updatedAt

  @@map("grade_lookup")
}
```

### StudentCourseHistory Model

```prisma
model StudentCourseHistory {
  id            String     @id @default(cuid())
  studentId     String     @map("student_id")
  courseId      String     @map("course_id")
  schoolYearId  String     @map("school_year_id")
  termId        String     @map("term_id")
  grade         String?    @db.VarChar(2)
  isPassed      Boolean    @map("is_passed") @default(true)
  creditEarned  Decimal    @map("credit_earned") @db.Decimal(3, 1)
  createdAt     DateTime   @map("created_at") @default(now())
  updatedAt     DateTime   @map("updated_at") @updatedAt
  // ... relationships
}
```

## Default Grade Scale

| Grade | Grade Points | Description | Passing |
|-------|-------------|-------------|---------|
| A     | 4.0         | Excellent   | Yes     |
| A-    | 3.7         | Excellent   | Yes     |
| B+    | 3.3         | Good        | Yes     |
| B     | 3.0         | Good        | Yes     |
| B-    | 2.7         | Good        | Yes     |
| C+    | 2.3         | Satisfactory| Yes     |
| C     | 2.0         | Satisfactory| Yes     |
| C-    | 1.7         | Satisfactory| Yes     |
| D+    | 1.3         | Poor        | Yes     |
| D     | 1.0         | Poor        | Yes     |
| D-    | 0.7         | Poor        | Yes     |
| F     | 0.0         | Failing     | No      |
| P     | 0.0         | Pass        | Yes     |
| NP    | 0.0         | No Pass     | No      |
| I     | 0.0         | Incomplete  | No      |
| W     | 0.0         | Withdrawal  | No      |

## API Endpoints

### GradeLookup API

#### Basic CRUD Operations
- `POST /grade-lookup` - Create grade lookup record
- `GET /grade-lookup` - Get all grade lookup records
- `GET /grade-lookup/:id` - Get specific grade lookup record
- `PATCH /grade-lookup/:id` - Update grade lookup record
- `DELETE /grade-lookup/:id` - Delete grade lookup record

#### Specialized Operations
- `POST /grade-lookup/seed` - Seed default grades
- `GET /grade-lookup/active` - Get active grades only
- `GET /grade-lookup/passing` - Get passing grades only
- `GET /grade-lookup/grade/:grade` - Get grade by letter
- `GET /grade-lookup/points/:grade` - Get grade points for letter
- `GET /grade-lookup/passing/:grade` - Check if grade is passing

#### GPA Calculations
- `GET /grade-lookup/gpa/student/:studentId` - Calculate student GPA
- `GET /grade-lookup/gpa/student/:studentId/term/:termId` - Calculate term GPA

### StudentCourseHistory API

#### Basic CRUD Operations
- `POST /student-course-history` - Create course history record
- `GET /student-course-history` - Get all course history records
- `GET /student-course-history/:id` - Get specific record
- `PATCH /student-course-history/:id` - Update record
- `DELETE /student-course-history/:id` - Delete record

#### Filtering Operations
- `GET /student-course-history/student/:studentId` - Get by student
- `GET /student-course-history/course/:courseId` - Get by course
- `GET /student-course-history/academic-cycle/:academicCycleId` - Get academic cycle

- `GET /student-course-history/term/:termId` - Get by term

#### Specialized Operations
- `GET /student-course-history/transcript/:studentId` - Get student transcript
- `GET /student-course-history/credits/student/:studentId/term/:termId` - Get credits by term
- `GET /student-course-history/credits/student/:studentId/total` - Get total credits

## GPA Calculation

The GPA calculation uses the standard weighted formula:

```
GPA = (Sum of (Grade Points × Course Credits)) / (Total Credits)
```

### Example Calculation

| Course | Grade | Grade Points | Credits | Grade Points × Credits |
|--------|-------|--------------|---------|----------------------|
| Math 101 | A | 4.0 | 3 | 12.0 |
| English 101 | B | 3.0 | 4 | 12.0 |
| Science 101 | C | 2.0 | 3 | 6.0 |
| **Total** | | | **10** | **30.0** |

**GPA = 30.0 ÷ 10 = 3.0**

## Integration Features

### Automatic Grade Validation

When creating or updating student course history records, the system automatically:

1. **Validates grades** against the grade lookup table
2. **Determines passing status** based on grade definitions
3. **Calculates grade points** for GPA calculations
4. **Updates isPassed field** automatically

### Grade Point Lookup

The system provides grade point lookup functionality:

```javascript
// Get grade points for a specific grade
const gradePoints = await gradeLookupService.getGradePoints('A'); // Returns 4.0

// Check if a grade is passing
const isPassing = await gradeLookupService.isPassingGrade('C'); // Returns true
```

### GPA Calculation Methods

The system provides multiple GPA calculation methods:

```javascript
// Calculate overall GPA for a student
const overallGPA = await gradeLookupService.calculateGPA(studentId);

// Calculate GPA for a specific term
const termGPA = await gradeLookupService.calculateGPAByTerm(studentId, termId);
```

## Setup Instructions

### 1. Database Migration

Run the Prisma migration to create the GradeLookup table:

```bash
cd schedexpress-api
npx prisma migrate dev --name add_grade_lookup
```

### 2. Regenerate Prisma Client

After the migration, regenerate the Prisma client:

```bash
npx prisma generate
```

### 3. Seed Default Grades

Run the seeding script to populate default grades:

```bash
node scripts/seed-grade-lookup.js
```

Or use the API endpoint:

```bash
curl -X POST http://localhost:3000/grade-lookup/seed
```

### 4. Verify Installation

Test the grade system:

```bash
# Get all grades
curl http://localhost:3000/grade-lookup

# Get grade points for A
curl http://localhost:3000/grade-lookup/points/A

# Check if C is passing
curl http://localhost:3000/grade-lookup/passing/C
```

## Usage Examples

### Creating a Course History Record

```json
POST /student-course-history
{
  "studentId": "clg123xyz",
  "courseId": "clg456abc",
  "schoolYearId": "clg789def",
  "termId": "clg012ghi",
  "grade": "A",
  "creditEarned": 3.0
}
```

The system will automatically:
- Set `isPassed` to `true` (because A is a passing grade)
- Store the grade for GPA calculations

### Calculating Student GPA

```bash
GET /grade-lookup/gpa/student/clg123xyz
```

Response:
```json
{
  "gpa": 3.45
}
```

### Getting Student Transcript

```bash
GET /student-course-history/transcript/clg123xyz
```

Response includes all courses with grades, ordered by school year and term.

## Customization

### Adding Custom Grades

```json
POST /grade-lookup
{
  "grade": "A+",
  "gradePoints": 4.3,
  "description": "Outstanding",
  "isPassing": true,
  "isActive": true
}
```

### Modifying Grade Points

```json
PATCH /grade-lookup/:id
{
  "gradePoints": 4.5,
  "description": "Exceptional"
}
```

### Deactivating Grades

```json
PATCH /grade-lookup/:id
{
  "isActive": false
}
```

## Error Handling

The system handles various error scenarios:

1. **Unknown Grades** - Returns 0 grade points and false for passing
2. **Missing Grade Lookup** - Falls back to provided isPassed value
3. **Invalid Grade Format** - Validates grade format in DTOs
4. **Database Errors** - Proper error responses with status codes

## Performance Considerations

1. **Grade Lookup Caching** - Consider caching frequently accessed grades
2. **GPA Calculation** - For large datasets, consider batch processing
3. **Database Indexes** - Ensure proper indexing on grade and studentId fields
4. **API Rate Limiting** - Implement rate limiting for GPA calculation endpoints

## Future Enhancements

1. **Grade Curves** - Support for grade curving and adjustments
2. **Academic Standing** - Automatic academic standing calculations
3. **Grade Reports** - PDF generation for grade reports
4. **Grade Import/Export** - Bulk grade import/export functionality
5. **Grade History** - Track grade changes over time
6. **Grade Appeals** - Support for grade appeal processes 