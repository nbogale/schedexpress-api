import { ErrorCode } from './error-codes';

export const errorMessages: Record<ErrorCode, string> = {
  // Schedule Change Request Error Messages
  [ErrorCode.SCRN]: 'The requested schedule change could not be found.',
  [ErrorCode.SCRB]: 'The schedule change request contains invalid information.',
  [ErrorCode.SCRC]: 'This schedule change request conflicts with existing schedules.',
  [ErrorCode.SCRD]: 'The specified course is not in your current schedule.',
  [ErrorCode.SCRE]: 'No active school year has been found.',
  [ErrorCode.SCRF]: 'No active term has been found.',
  [ErrorCode.SCRG]: 'You do not meet the prerequisites for this course.',
  [ErrorCode.SCRH]: 'This course conflicts with another course in your schedule.',
  [ErrorCode.SCRI]: 'This request can no longer be updated as it is no longer pending.',
  [ErrorCode.SCRJ]: 'You can only update your own schedule change requests.',
  [ErrorCode.SCRK]: 'This request has already been processed.',
  [ErrorCode.SCRL]: 'Only administrators and counselors can process requests.',
  [ErrorCode.SCRM]: 'This request can no longer be canceled.',
  [ErrorCode.SCRP]: 'You already have a pending schedule change request for this course change.',
  [ErrorCode.SCRQ]: 'Invalid request type.',
  [ErrorCode.SCRR]: 'Requested course section not found.',
  [ErrorCode.SCRS]: 'Current course section not found.',
  [ErrorCode.SCRT]: 'Both current and requested course sections are required.',
  [ErrorCode.SCRU]: 'Requested course section is required for ADD_COURSE requests.',
  [ErrorCode.SCRV]: 'Current course section is required for DROP_COURSE requests.',
  [ErrorCode.SCRW]: 'Both current and requested course sections are required for CHANGE_SECTION requests.',
  [ErrorCode.SCRX]: 'Current academic cycle not found.',

  // Schedule Error Messages
  [ErrorCode.SCHN]: 'The requested schedule could not be found.',
  [ErrorCode.SCHC]: 'This schedule conflicts with existing schedules or course capacity.',
  [ErrorCode.SCHB]: 'The schedule contains invalid information or exceeds course load limits.',

  // Course Section Error Messages
  [ErrorCode.CSSN]: 'The requested course section could not be found.',
  [ErrorCode.CSSB]: 'This time block conflicts with existing room or teacher assignments.',
  [ErrorCode.CSSC]: 'This time block conflicts with existing schedules.',
  [ErrorCode.CSSD]: 'Cannot delete a section that has enrolled students.',
  [ErrorCode.CSSE]: 'This section has reached its maximum enrollment capacity.',
  [ErrorCode.CSSF]: 'This section has no enrolled students.',
  [ErrorCode.CSSG]: 'Room conflict: Room is already assigned during this time.',
  [ErrorCode.CSSH]: 'Teacher conflict: Teacher is already assigned during this time.',

  // Course Prerequisite Error Messages
  [ErrorCode.CPAA]: 'The requested course prerequisite could not be found.',
  [ErrorCode.CPAB]: 'This prerequisite already exists for the course.',

  // Course Rule Error Messages
  [ErrorCode.CRLC]: 'A similar rule already exists for this course.',
  [ErrorCode.CRLN]: 'The requested course rule could not be found.',

  // Course Error Messages
  [ErrorCode.CRSC]: 'A course with this code already exists.',
  [ErrorCode.CRSN]: 'The requested course could not be found.',
  [ErrorCode.CRSD]: 'This course cannot be deleted as it is being used in schedules.',
  [ErrorCode.CRSE]: 'This course has pending change requests.',

  // User Error Messages
  [ErrorCode.USRC]: 'This email address is already in use.',
  [ErrorCode.USRD]: 'Grade level is required for student accounts.',
  [ErrorCode.USRN]: 'The requested user could not be found.',
  [ErrorCode.USRE]: 'This email or username is already in use.',

  // Rule Error Messages
  [ErrorCode.RULC]: 'A rule with this name already exists.',
  [ErrorCode.RULN]: 'The requested rule could not be found.',

  // Auth Error Messages
  [ErrorCode.AUTH]: 'Authentication failed. Please check your credentials.',
  [ErrorCode.AUTB]: 'Invalid credentials. Please try again.',
  [ErrorCode.AUTC]: 'Account is deactivated. Please contact support.',
  [ErrorCode.AUTD]: 'Account is locked. Please contact support.',

  // Department Error Messages
  [ErrorCode.DEPN]: 'The requested department could not be found.',
  [ErrorCode.DEPC]: 'This department cannot be deleted as it has associated courses or teachers.',

  // Time Block Error Messages
  [ErrorCode.TBDA]: 'Cannot delete time block that is used in course sections.',
  [ErrorCode.TBDB]: 'Time block not found.',
  [ErrorCode.TBDC]: 'Overlapping time blocks are not allowed by current institution settings.',

  // Teacher Error Messages
  [ErrorCode.TCHD]: 'Teacher is used in course sections.',
  [ErrorCode.TCHB]: 'Teacher not found.',

  // Term Error Messages
  [ErrorCode.TRMA]: 'Term is used in course sections.',

  // School Year Error Messages
  [ErrorCode.SCYA]: 'School year is used in course sections.',

  // Academic Cycle Error Messages
  [ErrorCode.ACCA]: 'Academic period start date can not be before academic cycle date.',
  [ErrorCode.ACCB]: 'Academic cycle end date must be after start date.',
  [ErrorCode.ACCC]: 'Academic period start date must be before end date.',
  [ErrorCode.ACCD]: 'Academic period dates are not within the cycle dates.',
  [ErrorCode.ACCE]: 'Academic cycle not found.',
  [ErrorCode.ACCF]: 'Period overlaps with existing period(s). Please adjust the dates.',
  [ErrorCode.ACCG]: 'Academic periods are disabled in Academic Settings.',

  // Academic Period Business Rules Error Messages - Enrollment
  [ErrorCode.ACRE1]: 'No active period found. Enrollment is only allowed during active periods.',
  [ErrorCode.ACRE2]: 'Enrollment is not allowed during this period type.',
  [ErrorCode.ACRE3]: 'Enrollment is not allowed during the current period.',
  [ErrorCode.ACRE4]: 'Enrollment deadline has passed.',
  [ErrorCode.ACRE5]: 'Late enrollment requires approval.',
  [ErrorCode.ACRE6]: 'Course is at capacity and over-enrollment is not allowed.',
  [ErrorCode.ACRE7]: 'Course exceeds the maximum over-enrollment limit.',
  [ErrorCode.ACRE8]: 'Add window has closed. No new courses can be added.',
  [ErrorCode.ACRE9]: 'Drop window has closed. No courses can be dropped.',
  [ErrorCode.ACREA]: 'Adding courses requires approval.',
  [ErrorCode.ACREB]: 'Dropping courses requires approval.',

  // Academic Period Business Rules Error Messages - Schedule Changes
  [ErrorCode.ACRS1]: 'No active period found. Schedule changes are only allowed during active periods.',
  [ErrorCode.ACRS2]: 'Schedule changes are not allowed during this period type.',
  [ErrorCode.ACRS3]: 'Schedule changes are not allowed during the current period.',
  [ErrorCode.ACRS4]: 'Schedule change window has closed.',
  [ErrorCode.ACRS5]: 'This schedule change type is not allowed.',
  [ErrorCode.ACRS6]: 'This schedule change type is not allowed during this period type.',
  [ErrorCode.ACRS7]: 'Maximum number of schedule change requests per cycle reached.',
  [ErrorCode.ACRS8]: 'Maximum number of schedule change requests per period reached.',
  [ErrorCode.ACRS9]: 'Maximum concurrent schedule change requests reached.',
  [ErrorCode.ACRSA]: 'Concurrent requests not allowed. Please wait for your pending request to be processed.',

  // Academic Period Business Rules Error Messages - Grading
  [ErrorCode.ACRG1]: 'No active period found. Grading is only allowed during active periods.',
  [ErrorCode.ACRG2]: 'Grading is not allowed during this period type.',
  [ErrorCode.ACRG3]: 'Grading is not allowed during the current period.',
  [ErrorCode.ACRG4]: 'Grading deadline has passed.',
  [ErrorCode.ACRG5]: 'Early grading is not allowed.',
  [ErrorCode.ACRG6]: 'Late grading is not allowed.',
  [ErrorCode.ACRG7]: 'Grading deadline has passed. No grades can be submitted.',
  [ErrorCode.ACRG8]: 'All assignments must be graded before submission.',
  [ErrorCode.ACRG9]: 'Minimum number of grades required before submission.',
  [ErrorCode.ACRGA]: 'Comments are required for low grades.',
  [ErrorCode.ACRGB]: 'Grade is locked and cannot be modified.',
  [ErrorCode.ACRGC]: 'Grade correction requires approval.',

  // Academic Period Business Rules Error Messages - Instruction
  [ErrorCode.ACRI1]: 'No instructional period found.',
  [ErrorCode.ACRI2]: 'Instruction is not allowed during this period type.',
  [ErrorCode.ACRI3]: 'Instruction is not allowed during break periods.',
  [ErrorCode.ACRI4]: 'Attendance tracking is required but not enabled for this period.',
  [ErrorCode.ACRI5]: 'Assignment creation is not allowed during this period.',
  [ErrorCode.ACRI6]: 'Quiz creation is not allowed during this period.',

  // Academic Period Business Rules Error Messages - Break Period
  [ErrorCode.ACRB1]: 'Enrollment is disabled during break periods.',
  [ErrorCode.ACRB2]: 'Schedule changes are disabled during break periods.',
  [ErrorCode.ACRB3]: 'Grading is disabled during break periods.',
};