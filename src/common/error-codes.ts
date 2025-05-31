/**
 * Error codes for the application
 * Format: XXXX where:
 * - First 3 letters: Module identifier
 * - Last letter: Type of error (C for Conflict, N for Not Found, B for Bad Request, A for Auth)
 */
export enum ErrorCode {
  // Schedule Change Request Error Codes
  SCRN = 'SCRN', // Schedule change request not found
  SCRB = 'SCRB', // Schedule change request validation error
  SCRC = 'SCRC', // Schedule change request conflict
  SCRD = 'SCRD', // The specified course is not in student's schedule
  SCRE = 'SCRE', // No active school year found
  SCRF = 'SCRF', // No active term found
  SCRG = 'SCRG', // Missing prerequisite
  SCRH = 'SCRH', // Course conflict with another course
  SCRI = 'SCRI', // Cannot update a request that is no longer pending
  SCRJ = 'SCRJ', // You can only update your own schedule change requests
  SCRK = 'SCRK', // This request has already been processed
  SCRL = 'SCRL', // Only administrators and counselors can process requests
  SCRM = 'SCRM', // This request can no longer be canceled

  // Schedule Error Codes
  SCHN = 'SCHN', // Schedule not found
  SCHC = 'SCHC', // Schedule conflict (period conflict, course at capacity)
  SCHB = 'SCHB', // Schedule validation error (max course load, empty schedule)

  // Course Section Error Codes
  CSSN = 'CSSN', // Course section not found
  CSSB = 'CSSB', // Time block conflict: Room or teacher is already assigned
  CSSC = 'CSSC', // Time block conflict during update
  CSSD = 'CSSD', // Cannot delete section with enrolled students
  CSSE = 'CSSE', // Section is already at maximum enrollment
  CSSF = 'CSSF', // Section has no enrolled students

  // Course Prerequisite Error Codes
  CPAA = 'CPAA', // Course prerequisite not found
  CPAB = 'CPAB', // Prerequisite already exists

  // Course Rule Error Codes
  CRLC = 'CRLC', // Similar rule already exists
  CRLN = 'CRLN', // Course rule not found

  // Course Error Codes
  CRSC = 'CRSC', // Course code already exists
  CRSN = 'CRSN', // Course not found
  CRSD = 'CRSD', // Course in use by schedules
  CRSE = 'CRSE', // Course has pending change requests

  // User Error Codes
  USRC = 'USRC', // Email already in use
  USRD = 'USRD', // Grade level required for students
  USRN = 'USRN', // User not found

  // Rule Error Codes
  RULC = 'RULC', // Rule name already exists
  RULN = 'RULN', // Rule not found

  // Auth Error Codes
  AUTH = 'AUTH', // Authentication error

  // Department Error Codes
  DEPN = 'DEPN', // Department not found
  DEPC = 'DEPC', // Department has courses or teachers

  // Time Block Error Codes
  TBDA = 'TBDA', // Cannot delete time block that is used in course sections
  TBDB = 'TBDB', // Time block not found

  // Teacher Error Codes
  TCHD = 'TCHD', // Teacher is used in course sections
  TCHB = 'TCHB', // Teacher not found

  // Term Error Codes
  TRMA = 'TRMA', // Term is used in course sections

  // School Year Error Codes
  SCYA = 'SCYA', // School year is used in course sections
} 