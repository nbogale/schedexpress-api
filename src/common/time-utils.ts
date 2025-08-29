/**
 * Utility functions for handling time formatting with AM/PM support
 * for the TimeBlock model
 */

/**
 * Convert a Date object to a time string in 12-hour format with AM/PM
 * @param date - Date object (time will be extracted)
 * @returns Time string in format "HH:MM AM/PM"
 */
export function formatTimeWithAMPM(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Convert a time string in 12-hour format to a Date object
 * @param timeString - Time string in format "HH:MM AM/PM" or "H:MM AM/PM"
 * @returns Date object with the specified time (date will be 1970-01-01)
 */
export function parseTimeString(timeString: string): Date {
  // Handle various input formats
  const cleanTime = timeString.trim().toUpperCase();
  
  // Try to parse with different formats
  const timeRegex = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/;
  const match = cleanTime.match(timeRegex);
  
  if (!match) {
    throw new Error(`Invalid time format: ${timeString}. Expected format: "HH:MM AM/PM"`);
  }
  
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3];
  
  // Convert to 24-hour format
  if (period === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period === 'AM' && hours === 12) {
    hours = 0;
  }
  
  // Create a date object with the specified time
  const date = new Date('1970-01-01');
  date.setHours(hours, minutes, 0, 0);
  
  return date;
}

/**
 * Create a Date object from hours and minutes
 * @param hours - Hour (0-23)
 * @param minutes - Minutes (0-59)
 * @returns Date object with the specified time
 */
export function createTimeDate(hours: number, minutes: number): Date {
  const date = new Date('1970-01-01');
  date.setHours(hours, minutes, 0, 0);
  return date;
}

/**
 * Get time range display string
 * @param startTime - Start time Date object
 * @param endTime - End time Date object
 * @returns Formatted time range string
 */
export function getTimeRangeDisplay(startTime: Date, endTime: Date): string {
  const startFormatted = formatTimeWithAMPM(startTime);
  const endFormatted = formatTimeWithAMPM(endTime);
  return `${startFormatted} - ${endFormatted}`;
}

/**
 * Validate if a time string is in correct format
 * @param timeString - Time string to validate
 * @returns True if valid, false otherwise
 */
export function isValidTimeFormat(timeString: string): boolean {
  try {
    parseTimeString(timeString);
    return true;
  } catch {
    return false;
  }
}

/**
 * Convert 24-hour time to 12-hour format with AM/PM
 * @param hours - Hour in 24-hour format (0-23)
 * @param minutes - Minutes (0-59)
 * @returns Time string in 12-hour format
 */
export function convert24To12Hour(hours: number, minutes: number): string {
  const date = createTimeDate(hours, minutes);
  return formatTimeWithAMPM(date);
}

/**
 * Convert 12-hour time to 24-hour format
 * @param timeString - Time string in 12-hour format
 * @returns Object with hours and minutes in 24-hour format
 */
export function convert12To24Hour(timeString: string): { hours: number; minutes: number } {
  const date = parseTimeString(timeString);
  return {
    hours: date.getHours(),
    minutes: date.getMinutes()
  };
}
