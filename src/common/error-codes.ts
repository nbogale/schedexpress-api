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

  // Academic Period Business Rules Error Codes
  // Enrollment Rules (ACRE = ACademic Rules Enrollment)
  ACRE1 = 'ACRE1', // No active period found - enrollment requires active period
  ACRE2 = 'ACRE2', // Enrollment not allowed during this period type
  ACRE3 = 'ACRE3', // Enrollment capability disabled for current period
  ACRE4 = 'ACRE4', // Enrollment deadline has passed
  ACRE5 = 'ACRE5', // Late enrollment requires approval
  ACRE6 = 'ACRE6', // Course is at capacity and over-enrollment not allowed
  ACRE7 = 'ACRE7', // Course exceeds over-enrollment limit
  ACRE8 = 'ACRE8', // Add window has closed
  ACRE9 = 'ACRE9', // Drop window has closed
  ACREA = 'ACREA', // Add requires approval
  ACREB = 'ACREB', // Drop requires approval

  // Schedule Change Rules (ACRS = ACademic Rules Schedule)
  ACRS1 = 'ACRS1', // No active period found - schedule changes require active period
  ACRS2 = 'ACRS2', // Schedule changes not allowed during this period type
  ACRS3 = 'ACRS3', // Schedule change capability disabled for current period
  ACRS4 = 'ACRS4', // Schedule change window has closed
  ACRS5 = 'ACRS5', // Request type not allowed
  ACRS6 = 'ACRS6', // Request type not allowed during this period type
  ACRS7 = 'ACRS7', // Maximum requests per cycle reached
  ACRS8 = 'ACRS8', // Maximum requests per period reached
  ACRS9 = 'ACRS9', // Maximum concurrent requests reached
  ACRSA = 'ACRSA', // Concurrent requests not allowed - pending request exists

  // Grading Rules (ACRG = ACademic Rules Grading)
  ACRG1 = 'ACRG1', // No active period found - grading requires active period
  ACRG2 = 'ACRG2', // Grading not allowed during this period type
  ACRG3 = 'ACRG3', // Grading capability disabled for current period
  ACRG4 = 'ACRG4', // Grading deadline has passed
  ACRG5 = 'ACRG5', // Early grading not allowed
  ACRG6 = 'ACRG6', // Late grading not allowed
  ACRG7 = 'ACRG7', // Hard deadline passed - no grading allowed
  ACRG8 = 'ACRG8', // All assignments must be graded before submission
  ACRG9 = 'ACRG9', // Minimum grade count not met
  ACRGA = 'ACRGA', // Comments required for low grades
  ACRGB = 'ACRGB', // Grade locked - no modifications allowed
  ACRGC = 'ACRGC', // Grade correction requires approval

  // Instruction Rules (ACRI = ACademic Rules Instruction)
  ACRI1 = 'ACRI1', // No instructional period found
  ACRI2 = 'ACRI2', // Instruction not allowed during this period type
  ACRI3 = 'ACRI3', // Instruction not allowed during break period
  ACRI4 = 'ACRI4', // Attendance tracking required but not enabled for this period
  ACRI5 = 'ACRI5', // Assignment creation not allowed during this period
  ACRI6 = 'ACRI6', // Quiz creation not allowed during this period

  // Break Period Rules (ACRB = ACademic Rules Break)
  ACRB1 = 'ACRB1', // Enrollment disabled during break period
  ACRB2 = 'ACRB2', // Schedule changes disabled during break period
  ACRB3 = 'ACRB3', // Grading disabled during break period
} 