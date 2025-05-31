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

  // Rule Error Messages
  [ErrorCode.RULC]: 'A rule with this name already exists.',
  [ErrorCode.RULN]: 'The requested rule could not be found.',

  // Auth Error Messages
  [ErrorCode.AUTH]: 'Authentication failed. Please check your credentials.',

  // Department Error Messages
  [ErrorCode.DEPN]: 'The requested department could not be found.',
  [ErrorCode.DEPC]: 'This department cannot be deleted as it has associated courses or teachers.',

  // Time Block Error Messages
  [ErrorCode.TBDA]: 'Cannot delete time block that is used in course sections.',
  [ErrorCode.TBDB]: 'Time block not found.',

  // Teacher Error Messages
  [ErrorCode.TCHD]: 'Teacher is used in course sections.',
  [ErrorCode.TCHB]: 'Teacher not found.',

  // Term Error Messages
  [ErrorCode.TRMA]: 'Term is used in course sections.',

  // School Year Error Messages
  [ErrorCode.SCYA]: 'School year is used in course sections.',
};