export enum RequestType {
  ADD_COURSE = 'ADD_COURSE',
  DROP_COURSE = 'DROP_COURSE',
  CHANGE_SECTION = 'CHANGE_SECTION',
  CHANGE_TIME = 'CHANGE_TIME',
  CHANGE_TEACHER = 'CHANGE_TEACHER',
  SWAP_COURSE = 'SWAP_COURSE'
}

export interface AutoApproveConditions {
  sameTeacher: boolean;        // Auto-approve if same teacher
  sameTimeSlot: boolean;       // Auto-approve if same time
  withinDeadline: boolean;     // Auto-approve if before deadline
  sameCourse: boolean;         // Auto-approve if same course, different section
  lowEnrollment: boolean;      // Auto-approve if target class has low enrollment
}

export interface ScheduleChangeConfig {
  // Basic Settings
  enabled: boolean;
  deadlineDays: number;                    // Days before cycle starts
  allowEmergencyChanges: boolean;          // Admin override capability
  
  // Request Permissions
  studentCanRequest: boolean;              // Students can initiate requests
  parentCanRequest: boolean;               // Parents can request on behalf
  counselorCanApprove: boolean;            // Counselor approval required
  
  // Request Limitations
  maxRequestsPerStudent: number;           // Limit requests per cycle
  requireReason: boolean;                  // Mandatory reason for change
  allowChangesAfterDeadline: boolean;      // Special circumstances
  
  // Notification Settings
  notifyTeachers: boolean;                 // Email teachers about changes
  notifyParents: boolean;                  // Email parents about requests
  notifyCounselors: boolean;               // Email counselors about requests
  
  // Advanced Settings
  autoApproveConditions: AutoApproveConditions;
  
  // Request Types Allowed
  allowedRequestTypes: RequestType[];      // Types of changes allowed
  
  // Additional Settings
  requireParentApproval: boolean;          // Require parent approval for minors
  allowConcurrentRequests: boolean;        // Allow multiple pending requests
  maxConcurrentRequests: number;           // Maximum concurrent requests per student
}

export interface ScheduleChangeConfigValidation {
  canRequest: boolean;
  reason?: string;
  deadline?: Date;
  remainingRequests?: number;
}

export const DEFAULT_SCHEDULE_CHANGE_CONFIG: ScheduleChangeConfig = {
  enabled: true,
  deadlineDays: 14,                        // 2 weeks before cycle starts
  allowEmergencyChanges: true,             // Admin can override
  studentCanRequest: true,                 // Students can initiate
  parentCanRequest: true,                  // Parents can request
  counselorCanApprove: true,               // Counselor approval required
  maxRequestsPerStudent: 2,                // Limit to 2 requests per cycle
  requireReason: true,                     // Always require reason
  allowChangesAfterDeadline: false,        // No changes after deadline
  notifyTeachers: true,                    // Notify affected teachers
  notifyParents: true,                     // Notify parents of status
  notifyCounselors: true,                  // Notify counselors
  autoApproveConditions: {
    sameTeacher: false,                    // Don't auto-approve same teacher
    sameTimeSlot: false,                   // Don't auto-approve same time
    withinDeadline: false,                 // Don't auto-approve based on deadline
    sameCourse: true,                      // Auto-approve same course, different section
    lowEnrollment: false                   // Don't auto-approve based on enrollment
  },
  allowedRequestTypes: [
    RequestType.ADD_COURSE,
    RequestType.DROP_COURSE,
    RequestType.CHANGE_SECTION,
    RequestType.SWAP_COURSE
  ],
  requireParentApproval: false,            // Don't require parent approval by default
  allowConcurrentRequests: true,           // Allow multiple pending requests
  maxConcurrentRequests: 3                 // Maximum 3 concurrent requests
};
