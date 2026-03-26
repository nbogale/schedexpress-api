# Grade Lookup API

This module provides API endpoints for managing grade lookup records, which define the mapping between letter grades and grade points for GPA calculations.

## Default Grade Scale

The system includes a comprehensive grade scale with the following default values:

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

## Endpoints

### Basic CRUD Operations

- `POST /grade-lookup` - Create a new grade lookup record
- `GET /grade-lookup` - Get all grade lookup records
- `GET /grade-lookup/:id` - Get a specific grade lookup record
- `PATCH /grade-lookup/:id` - Update a grade lookup record
- `DELETE /grade-lookup/:id` - Delete a grade lookup record

### Specialized Endpoints

- `POST /grade-lookup/seed` - Seed default grade lookup records
- `GET /grade-lookup/active` - Get all active grade lookup records
- `GET /grade-lookup/passing` - Get all passing grade lookup records
- `GET /grade-lookup/grade/:grade` - Get grade lookup record by grade letter
- `GET /grade-lookup/points/:grade` - Get grade points for a specific grade
- `GET /grade-lookup/passing/:grade` - Check if a grade is considered passing

### GPA Calculation Endpoints

- `GET /grade-lookup/gpa/student/:studentId` - Calculate GPA for a student
- `GET /grade-lookup/gpa/student/:studentId/term/:termId` - Calculate GPA for a student in a specific term

## Data Model

The GradeLookup model includes:

- `grade` - Grade letter (e.g., A, B, C, D, F)
- `gradePoints` - Grade points (e.g., 4.0 for A, 3.0 for B)
- `description` - Description of the grade (optional)
- `isPassing` - Whether this grade is considered passing
- `isActive` - Whether this grade lookup is active

## Usage Examples

### Seed default grades

```bash
POST /grade-lookup/seed
```

### Create a custom grade

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

### Get grade points for a grade

```bash
GET /grade-lookup/points/A
```

Response:
```json
{
  "gradePoints": 4.0
}
```

### Calculate student GPA

```bash
GET /grade-lookup/gpa/student/clg123xyz
```

Response:
```json
{
  "gpa": 3.45
}
```

### Calculate term GPA

```bash
GET /grade-lookup/gpa/student/clg123xyz/term/clg012ghi
```

Response:
```json
{
  "gpa": 3.67
}
```

## GPA Calculation

The GPA calculation uses the following formula:

```
GPA = (Sum of (Grade Points × Course Credits)) / (Total Credits)
```

For example:
- Course 1: A (4.0) × 3 credits = 12.0 grade points
- Course 2: B (3.0) × 4 credits = 12.0 grade points
- Course 3: C (2.0) × 3 credits = 6.0 grade points
- Total: 30.0 grade points / 10 credits = 3.0 GPA

## Integration with Student Course History

The GradeLookup API integrates with the StudentCourseHistory API to provide:

1. **Automatic grade point calculation** when grades are assigned
2. **GPA calculation** for students across all terms
3. **Term-specific GPA calculation** for academic tracking
4. **Passing grade validation** for course completion requirements

## Features

- **Comprehensive grade scale** with plus/minus grades
- **Flexible grade definitions** with custom descriptions
- **Active/inactive grade management** for different academic periods
- **Automatic GPA calculation** with weighted grade points
- **Passing grade validation** for academic requirements
- **Default grade seeding** for quick setup
- **Grade point lookup** for external integrations 