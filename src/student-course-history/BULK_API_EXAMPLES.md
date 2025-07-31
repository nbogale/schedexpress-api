# Bulk Student Course History API

This document provides examples and usage patterns for the bulk student course history API endpoint.

## Endpoint

```
POST /student-course-history/bulk
```

## Purpose

The bulk API allows you to create multiple student course history records for the same course, school year, and term in a single request. This is useful for:

- Bulk grade entry for a class
- Course completion tracking
- Mass enrollment processing
- Grade import from external systems

## Request Format

```json
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

## Response Format

```json
{
  "created": [
    {
      "id": "clg111aaa",
      "studentId": "clg123xyz",
      "courseId": "clg456abc",
      "schoolYearId": "clg789def",
      "termId": "clg012ghi",
      "grade": "A",
      "isPassed": true,
      "creditEarned": "3.0",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z",
      "student": {
        "id": "clg123xyz",
        "userId": "clg123xyz",
        "studentId": "S100001",
        "gradeLevelId": "clg456abc",
        "user": {
          "id": "clg123xyz",
          "firstName": "John",
          "lastName": "Doe",
          "email": "john.doe@school.edu"
        }
      },
      "course": {
        "id": "clg456abc",
        "code": "MATH101",
        "name": "Introduction to Mathematics",
        "credits": "3.0"
      },
      "schoolYear": {
        "id": "clg789def",
        "name": "2023-2024",
        "startDate": "2023-09-01T00:00:00Z",
        "endDate": "2024-06-30T00:00:00Z"
      },
      "term": {
        "id": "clg012ghi",
        "name": "Fall 2023",
        "startDate": "2023-09-01T00:00:00Z",
        "endDate": "2023-12-15T00:00:00Z"
      }
    }
  ],
  "errors": [
    {
      "studentId": "clg456abc",
      "error": "Record already exists for this student, course, school year, and term"
    }
  ],
  "summary": {
    "total": 3,
    "successful": 1,
    "failed": 2
  }
}
```

## Examples

### Example 1: Basic Grade Entry

```bash
curl -X POST http://localhost:3000/student-course-history/bulk \
  -H "Content-Type: application/json" \
  -d '{
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
        "grade": "B+",
        "creditEarned": 3.0
      },
      {
        "studentId": "clg789def",
        "grade": "C",
        "creditEarned": 3.0
      }
    ]
  }'
```

### Example 2: Pass/Fail Course

```bash
curl -X POST http://localhost:3000/student-course-history/bulk \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": "clg456abc",
    "schoolYearId": "clg789def",
    "termId": "clg012ghi",
    "students": [
      {
        "studentId": "clg123xyz",
        "grade": "P",
        "creditEarned": 2.0
      },
      {
        "studentId": "clg456abc",
        "grade": "P",
        "creditEarned": 2.0
      },
      {
        "studentId": "clg789def",
        "grade": "NP",
        "creditEarned": 0.0
      }
    ]
  }'
```

### Example 3: No Grades (Course Completion Only)

```bash
curl -X POST http://localhost:3000/student-course-history/bulk \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": "clg456abc",
    "schoolYearId": "clg789def",
    "termId": "clg012ghi",
    "students": [
      {
        "studentId": "clg123xyz",
        "isPassed": true,
        "creditEarned": 3.0
      },
      {
        "studentId": "clg456abc",
        "isPassed": true,
        "creditEarned": 3.0
      },
      {
        "studentId": "clg789def",
        "isPassed": false,
        "creditEarned": 0.0
      }
    ]
  }'
```

### Example 4: Mixed Data (Some with grades, some without)

```bash
curl -X POST http://localhost:3000/student-course-history/bulk \
  -H "Content-Type: application/json" \
  -d '{
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
        "isPassed": true,
        "creditEarned": 3.0
      },
      {
        "studentId": "clg789def",
        "grade": "I",
        "creditEarned": 0.0
      }
    ]
  }'
```

## Error Handling

The bulk API handles various error scenarios:

### 1. Duplicate Records
If a record already exists for a student, course, school year, and term combination:
```json
{
  "studentId": "clg456abc",
  "error": "Record already exists for this student, course, school year, and term"
}
```

### 2. Invalid Student ID
If a student ID doesn't exist:
```json
{
  "studentId": "invalid-id",
  "error": "Foreign key constraint failed"
}
```

### 3. Invalid Course ID
If a course ID doesn't exist:
```json
{
  "studentId": "clg123xyz",
  "error": "Foreign key constraint failed"
}
```

### 4. Invalid Grade
If a grade is not recognized in the grade lookup:
```json
{
  "studentId": "clg123xyz",
  "error": "Grade lookup for grade 'X' not found"
}
```

## Features

### Automatic Grade Validation
- Grades are automatically validated against the grade lookup table
- Passing status is determined automatically based on grade definitions
- Unknown grades fall back to provided `isPassed` value or default to `true`

### Duplicate Prevention
- Checks for existing records before creation
- Prevents duplicate entries for the same student, course, school year, and term
- Reports duplicates in the errors array

### Parallel Processing
- Processes multiple students in parallel for better performance
- Handles large batches efficiently
- Maintains data consistency

### Comprehensive Response
- Returns detailed information about successful and failed operations
- Includes summary statistics
- Provides specific error messages for each failed record

## Best Practices

### 1. Batch Size
- Recommended batch size: 50-100 students per request
- For larger datasets, split into multiple requests
- Monitor response times for optimal batch size

### 2. Data Validation
- Validate student IDs before bulk operations
- Ensure course, school year, and term IDs are valid
- Check grade format consistency

### 3. Error Handling
- Always check the response summary
- Handle partial failures appropriately
- Retry failed records individually if needed

### 4. Performance
- Use parallel processing for large datasets
- Consider database connection limits
- Monitor memory usage for very large batches

## Integration Examples

### JavaScript/Node.js

```javascript
const axios = require('axios');

async function bulkGradeEntry(courseId, schoolYearId, termId, students) {
  try {
    const response = await axios.post('http://localhost:3000/student-course-history/bulk', {
      courseId,
      schoolYearId,
      termId,
      students
    });

    const { created, errors, summary } = response.data;
    
    console.log(`Successfully created ${summary.successful} records`);
    console.log(`Failed to create ${summary.failed} records`);
    
    if (errors.length > 0) {
      console.log('Errors:', errors);
    }
    
    return response.data;
  } catch (error) {
    console.error('Bulk operation failed:', error.response?.data || error.message);
    throw error;
  }
}

// Usage
const students = [
  { studentId: 'clg123xyz', grade: 'A', creditEarned: 3.0 },
  { studentId: 'clg456abc', grade: 'B', creditEarned: 3.0 }
];

bulkGradeEntry('clg456abc', 'clg789def', 'clg012ghi', students);
```

### Python

```python
import requests

def bulk_grade_entry(course_id, school_year_id, term_id, students):
    url = "http://localhost:3000/student-course-history/bulk"
    payload = {
        "courseId": course_id,
        "schoolYearId": school_year_id,
        "termId": term_id,
        "students": students
    }
    
    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        
        data = response.json()
        print(f"Successfully created {data['summary']['successful']} records")
        print(f"Failed to create {data['summary']['failed']} records")
        
        if data['errors']:
            print("Errors:", data['errors'])
            
        return data
    except requests.exceptions.RequestException as e:
        print(f"Bulk operation failed: {e}")
        raise

# Usage
students = [
    {"studentId": "clg123xyz", "grade": "A", "creditEarned": 3.0},
    {"studentId": "clg456abc", "grade": "B", "creditEarned": 3.0}
]

bulk_grade_entry("clg456abc", "clg789def", "clg012ghi", students)
```

## Monitoring and Logging

### Response Metrics
- Track success/failure rates
- Monitor processing times
- Log error patterns

### Database Monitoring
- Monitor database connection usage
- Track query performance
- Watch for deadlocks or timeouts

### Application Logs
- Log bulk operation attempts
- Record error details
- Track user activity 