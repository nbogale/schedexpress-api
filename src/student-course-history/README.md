# Student Course History API

This module provides API endpoints for managing student course history records, which track the courses students have taken, their grades, and credits earned.

## Endpoints

### Basic CRUD Operations

- `POST /student-course-history` - Create a new student course history record
- `POST /student-course-history/bulk` - Create multiple student course history records for the same course, school year, and term
- `GET /student-course-history` - Get all student course history records
- `GET /student-course-history/:id` - Get a specific student course history record
- `PATCH /student-course-history/:id` - Update a student course history record
- `DELETE /student-course-history/:id` - Delete a student course history record

### Filtering Endpoints

- `GET /student-course-history/student/:studentId` - Get all course history records for a specific student
- `GET /student-course-history/course/:courseId` - Get all course history records for a specific course
- `GET /student-course-history/academic-cycle/:academicCycleId` - Get all course history records for a specific accademic cycle
- `GET /student-course-history/term/:termId` - Get all course history records for a specific term

### Specialized Endpoints

- `GET /student-course-history/transcript/:studentId` - Get student transcript (ordered by school year and term)
- `GET /student-course-history/credits/student/:studentId/term/:termId` - Get total credits earned by student for a specific term
- `GET /student-course-history/credits/student/:studentId/total` - Get total credits earned by student

## Data Model

The StudentCourseHistory model includes:

- `studentId` - Reference to the student
- `courseId` - Reference to the course
- `schoolYearId` - Reference to the school year
- `termId` - Reference to the term
- `grade` - Grade received (optional)
- `isPassed` - Whether the student passed the course (default: true)
- `creditEarned` - Credits earned (default: 1.0)

## Usage Examples

### Create a new course history record

```json
POST /student-course-history
{
  "studentId": "clg123xyz",
  "courseId": "clg456abc",
  "schoolYearId": "clg789def",
  "termId": "clg012ghi",
  "grade": "A",
  "isPassed": true,
  "creditEarned": 3.0
}
```

### Create multiple course history records (Bulk)

```json
POST /student-course-history/bulk
{
  "courseId": "clg456abc",
  "schoolYearId": "clg789def",
  "termId": "clg012ghi",
  "students": [
    {
      "studentId": "clg123xyz",
      "grade": "A",
      "creditEarned": 3.0
    },
    {
      "studentId": "clg456abc",
      "grade": "B",
      "creditEarned": 3.0
    },
    {
      "studentId": "clg789def",
      "grade": "C",
      "creditEarned": 3.0
    }
  ]
}
```

**Response:**
```json
{
  "created": [...],
  "errors": [...],
  "summary": {
    "total": 3,
    "successful": 2,
    "failed": 1
  }
}
```

### Get student transcript

```
GET /student-course-history/transcript/clg123xyz
```

### Get total credits for a term

```
GET /student-course-history/credits/student/clg123xyz/term/clg012ghi
```

## Relationships

The StudentCourseHistory model is related to:
- Student (via studentId)
- Course (via courseId)
- SchoolYear (via schoolYearId)
- Term (via termId)

All endpoints include these related data in the response for comprehensive information. 