# TimeBlock Usage Guide

## Overview

The TimeBlock model now uses the `@db.Time` type to store time values in HH:MM format with AM/PM support. This provides a more intuitive way to work with time-of-day values in your scheduling system.

## Database Schema Changes

The `startTime` and `endTime` fields in the TimeBlock model have been updated:

```prisma
model TimeBlock {
  id                  String                  @id @default(cuid())
  name                String                  @db.VarChar(50)
  startTime           DateTime                @db.Time @map("start_time") // Stores time in HH:MM format (e.g., "09:30 AM", "02:45 PM")
  endTime             DateTime                @db.Time @map("end_time")   // Stores time in HH:MM format (e.g., "10:45 AM", "04:00 PM")
  isActive            Boolean                 @default(true) @map("is_active")
  createdAt           DateTime                @default(now()) @map("created_at")
  updatedAt           DateTime                @updatedAt @map("updated_at")
  sections            CourseSection[]
  preferredInRequests ScheduleChangeRequest[]

  @@map("time_block")
}
```

## Time Format

### Supported Input Formats

The system accepts time strings in the following formats:

- `"09:30 AM"` - 9:30 in the morning
- `"2:45 PM"` - 2:45 in the afternoon
- `"11:00 PM"` - 11:00 at night
- `"08:15 AM"` - 8:15 in the morning

### Validation Rules

- Hours must be between 1-12
- Minutes must be between 00-59
- AM/PM must be specified
- End time must be after start time

## Usage Examples

### Creating a Time Block

```typescript
import { TimeBlocksService } from './time-blocks/time-blocks.service';

// Create a new time block
const timeBlock = await timeBlocksService.createTimeBlock({
  name: "Morning Session",
  startTime: "09:30 AM",
  endTime: "10:45 AM",
  isActive: true
});
```

### Getting Time Blocks with Formatted Display

```typescript
// Get all time blocks with formatted time display
const timeBlocks = await timeBlocksService.getAllTimeBlocks();

// Response includes formatted time fields:
// {
//   id: "...",
//   name: "Morning Session",
//   startTime: Date, // Database Date object
//   endTime: Date,   // Database Date object
//   timeRange: "9:30 AM - 10:45 AM",
//   startTimeFormatted: "9:30 AM",
//   endTimeFormatted: "10:45 AM"
// }
```

### Updating a Time Block

```typescript
// Update time block
await timeBlocksService.updateTimeBlock(id, {
  name: "Updated Session Name",
  startTime: "10:00 AM",
  endTime: "11:15 AM"
});
```

### Checking for Overlapping Time Blocks

```typescript
// Check for overlapping time blocks
const overlapping = await timeBlocksService.getOverlappingTimeBlocks(
  "09:30 AM",
  "10:45 AM"
);
```

## Utility Functions

The `time-utils.ts` file provides helper functions for working with time:

### `formatTimeWithAMPM(date: Date): string`
Converts a Date object to a time string in 12-hour format with AM/PM.

```typescript
import { formatTimeWithAMPM } from '../common/time-utils';

const timeString = formatTimeWithAMPM(new Date('1970-01-01T09:30:00'));
// Returns: "9:30 AM"
```

### `parseTimeString(timeString: string): Date`
Converts a time string in 12-hour format to a Date object.

```typescript
import { parseTimeString } from '../common/time-utils';

const date = parseTimeString("09:30 AM");
// Returns: Date object with time set to 9:30 AM
```

### `getTimeRangeDisplay(startTime: Date, endTime: Date): string`
Creates a formatted time range string.

```typescript
import { getTimeRangeDisplay } from '../common/time-utils';

const range = getTimeRangeDisplay(startTime, endTime);
// Returns: "9:30 AM - 10:45 AM"
```

### `isValidTimeFormat(timeString: string): boolean`
Validates if a time string is in the correct format.

```typescript
import { isValidTimeFormat } from '../common/time-utils';

const isValid = isValidTimeFormat("09:30 AM"); // true
const isInvalid = isValidTimeFormat("25:30"); // false
```

## API Endpoints

### Create Time Block
```
POST /time-blocks
Content-Type: application/json

{
  "name": "Morning Session",
  "startTime": "09:30 AM",
  "endTime": "10:45 AM",
  "isActive": true
}
```

### Get All Time Blocks
```
GET /time-blocks
```

### Get Time Block by ID
```
GET /time-blocks/:id
```

### Update Time Block
```
PUT /time-blocks/:id
Content-Type: application/json

{
  "name": "Updated Session",
  "startTime": "10:00 AM",
  "endTime": "11:15 AM"
}
```

### Delete Time Block
```
DELETE /time-blocks/:id
```

### Check Overlapping Time Blocks
```
GET /time-blocks/overlap/check?startTime=09:30 AM&endTime=10:45 AM
```

### Create Default Time Blocks
```
POST /time-blocks/default
```

## Migration Notes

If you have existing data in the database:

1. **Backup your data** before running migrations
2. **Convert existing DateTime values** to Time format
3. **Update application code** to use the new time format
4. **Test thoroughly** with your existing data

## Error Handling

The system provides clear error messages for invalid time formats:

- `Invalid start time format: 25:30` - Invalid time format
- `End time must be after start time` - Logical validation error
- `Invalid time format: 09:30` - Missing AM/PM specification

## Best Practices

1. **Always validate input** using `isValidTimeFormat()` before processing
2. **Use the utility functions** for consistent time formatting
3. **Handle time zones appropriately** if your application spans multiple time zones
4. **Test edge cases** like 12:00 AM/PM and single-digit hours
5. **Provide user-friendly error messages** when time validation fails
