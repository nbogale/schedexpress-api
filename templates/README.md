# Email Templates

This directory contains EJS email templates used by the Schedule Express notification system.

## Template Files

### `notification.ejs`
General purpose notification template used for:
- System notifications
- General announcements
- Bulk notifications

**Variables:**
- `subject` - Email subject (used in title tag)
- `title` - Email header title
- `message` - Main email content
- `actionUrl` - Optional action button URL
- `actionText` - Optional action button text

### `grade-notification.ejs`
Specialized template for grade update notifications.

**Variables:**
- `studentName` - Student's full name
- `courseName` - Course name
- `grade` - Letter grade (A, B, C, etc.)
- `isPassed` - Boolean indicating if grade is passing

### `schedule-change.ejs`
Template for schedule change request notifications.

**Variables:**
- `requesterName` - Name of person requesting change
- `courseName` - Course name
- `reason` - Reason for schedule change
- `status` - Current status of request
- `actionUrl` - Optional link to review request

## Usage

Templates are automatically loaded by the `EmailService` when using `sendTemplatedEmail()`:

```typescript
await emailService.sendTemplatedEmail({
  to: 'user@example.com',
  subject: 'Grade Update',
  template: 'grade-notification',
  data: {
    studentName: 'John Doe',
    courseName: 'Mathematics 101',
    grade: 'A',
    isPassed: true
  }
});
```

## Adding New Templates

1. Create a new `.ejs` file in this directory
2. Use EJS syntax for dynamic content: `<%= variableName %>`
3. Follow the existing template structure for consistency
4. Update the `EmailService` if needed to support the new template

## Testing Templates

### Local Testing
- **`test-templates.html`** - Interactive template tester with real-time preview
- **`run-test.html`** - Simple launcher for the template tester

### How to Test:
1. Open `run-test.html` in your browser
2. Click "Open Template Tester"
3. Select a template type
4. Fill in test data
5. Click "Render Template" to see the preview

### Test Features:
- ✅ Real-time EJS rendering
- ✅ All template variables configurable
- ✅ Mobile-responsive preview
- ✅ Beautiful gradient design testing
- ✅ Error handling and validation

## Template Structure

All templates follow this basic structure:
- HTML5 doctype
- Responsive viewport meta tag
- Inline CSS for email client compatibility
- **Modern gradient header** with SchedExpress branding
- Content area with dynamic variables
- **Enhanced styling** with gradients, shadows, and modern design
- Footer with disclaimer

## Design Features

- **Gradient Headers:** Beautiful purple-blue gradient backgrounds
- **Modern Buttons:** Gradient buttons with shadows and hover effects
- **Enhanced Typography:** Improved font weights and spacing
- **Color-coded Status:** Green for passing grades, red for failing
- **Professional Layout:** Clean, modern design that works across email clients 