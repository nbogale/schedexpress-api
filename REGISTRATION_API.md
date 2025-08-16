# Registration API Documentation

## Overview
The registration API allows users to create new accounts in the SchedExpress system with role-specific data.

## Endpoint
```
POST /api/auth/register
```

## Request Body

### Required Fields (All Users)
- `firstName` (string): User's first name
- `lastName` (string): User's last name  
- `email` (string): User's email address (must be unique)
- `username` (string): User's username (required in form, auto-generated if not provided to API)
- `password` (string): User's password (minimum 6 characters)
- `role` (enum): User role - `STUDENT`, `COUNSELOR`, `ADMIN`, or `TEACHER`
- `studentId` (string): Student ID (required for all registrations)

### Optional Fields
- `username` (string): Custom username (auto-generated from email if not provided to API)
- `department` (string): Department name (required for staff members)

## Example Requests

### Student Registration (Default)
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "email": "john.smith@school.edu",
  "username": "johnsmith",
  "password": "Welcome2ES!",
  "role": "STUDENT",
  "studentId": "STU123456"
}
```

**Note**: The registration form is designed for student registration. For staff registration (teachers, counselors, admins), use the API directly or create a separate admin interface.

## Response

### Success Response (201 Created)
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "clx1234567890",
    "email": "john.smith@school.edu",
    "username": "johnsmith",
    "firstName": "John",
    "lastName": "Smith",
    "role": "STUDENT",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Error Responses

#### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Student ID is required",
  "error": "Bad Request"
}
```

#### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "User with this email or username already exists",
  "error": "Conflict"
}
```

## Features

### Username Field
- **Form Requirement**: Username field is mandatory in the registration form
- **API Flexibility**: Backend API still accepts requests without username (auto-generates if missing)
- **Placement**: Username field appears after email and before password in the registration form
- **Custom**: Users must provide their own username in the form

### Role Selection
- **Hidden Field**: Role field is hidden from the registration form
- **Default Role**: Automatically set to "Student" for all registrations
- **Simplified UX**: Users don't need to select a role during registration
- **Role-Specific Fields**: Only Student ID field is shown (for Student role)

### Form Flow:

1. **Page Loads**: Role automatically set to "Student" (hidden)
2. **Student ID Field**: Always visible for student registration
3. **User Fills Form**: Only student-specific fields are shown
4. **Simplified Process**: No role selection needed

### Automatic Username Generation
If no username is provided, one is automatically generated from the email address:
- Extracts the part before `@`
- Removes special characters
- Converts to lowercase

Example: `john.smith@school.edu` → `johnsmith`

### Role-Specific Data Creation
- **Students**: Creates User record (Student record creation requires grade level assignment)
- **Teachers**: Creates Teacher record with Department
- **Counselors/Admins**: Creates User record (department stored in user data)

### Automatic Department Creation
If the specified Department doesn't exist, it's automatically created:
- Department: Creates with the provided name

### Password Security
- Passwords are hashed using bcrypt with 10 salt rounds
- Password hash is never returned in responses

## Validation Rules

1. **Email**: Must be valid email format and unique
2. **Username**: Required in form, minimum 1 character
3. **Password**: Minimum 6 characters
4. **Role**: Must be one of the defined enum values
5. **Student ID**: Required for all registrations, minimum 1 character
6. **Department**: Required for staff members

## Database Transactions
All user creation operations use database transactions to ensure data consistency. If any part of the registration fails, all changes are rolled back.

## Security Considerations

1. **Password Hashing**: All passwords are hashed before storage
2. **Input Validation**: All inputs are validated using class-validator
3. **Unique Constraints**: Email and username must be unique
4. **Role Validation**: Only valid roles are accepted
5. **Data Integrity**: Uses transactions for atomic operations

## Notes

### Student Registration
- Student users are created but Student records are not automatically created
- Student records require a grade level assignment which should be done separately
- This allows for more flexible student onboarding where grade levels can be assigned later 