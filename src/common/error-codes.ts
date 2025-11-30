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
  SCRP = 'SCRP', // You already have a pending schedule change request for this course change
  SCRQ = 'SCRQ', // Invalid request type
  SCRR = 'SCRR', // Requested course section not found
  SCRS = 'SCRS', // Current course section not found
  SCRT = 'SCRT', // Both current and requested course sections are required
  SCRU = 'SCRU', // Requested course section is required for ADD_COURSE requests
  SCRV = 'SCRV', // Current course section is required for DROP_COURSE requests
  SCRW = 'SCRW', // Both current and requested course sections are required for CHANGE_SECTION requests
  SCRX = 'SCRX', // Current academic cycle not found

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
  CSSG = 'CSSG', // Room conflict: Room is already assigned during this time
  CSSH = 'CSSH', // Teacher conflict: Teacher is already assigned during this time

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
  USRE = 'USRE', // Email or username already in use

  // Rule Error Codes
  RULC = 'RULC', // Rule name already exists
  RULN = 'RULN', // Rule not found

  // Auth Error Codes
  AUTH = 'AUTH', // Authentication error
  AUTB = 'AUTB', // Bad credentials
  AUTC = 'AUTC', // Account is locked
  AUTD = 'AUTD', // Account is deactivated

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

  // Academic Cycle Error Codes
  ACCA = 'ACCA', // Academic period start date can not be before academic cycle date
  ACCB = 'ACCB', // Academic cycle end date must be after start date
  ACCC = 'ACCC', // Academic period start date must be before end date
  ACCD = 'ACCD', // Academic period dates are not within the cycle dates
  ACCE = 'ACCE', // Academic cycle not found
  ACCF = 'ACCF', // Period overlaps with existing period(s)
} 