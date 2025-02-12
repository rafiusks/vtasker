# User Flow

## User Registration
file: docs/user-flow/user-registration.md

## User Login
file: docs/user-flow/user-login.md

## Board Management
file: docs/user-flow/board-management.md

## Task Management

### Create a Task

#### Happy Path
1. Navigate to a board (/b/{board-slug})
2. Click on "Create Task" button
3. Fill in task details in modal:
   - Title (required)
   - Description (optional)
   - Type (required, default: 'task')
   - Priority (required, default: 'medium')
   - Status (required, default: 'backlog')
   - Assignee (optional)
   - Due Date (optional)
4. Click "Create" button
5. System validates input
6. If validation passes:
   - Backend creates new task
   - Task appears in the board
   - Success message displayed
   - Modal closes automatically

#### Validation Scenarios
1. Empty Fields:
   - Title is required
   - Error message: "Title is required"
   - Other fields are optional

2. Title Validation:
   - Maximum length enforced
   - Error message: "Title too long"

#### Form Behavior
- Submit button is disabled until required fields are filled
- Validation occurs on field blur
- Error messages are cleared when user starts typing
- Loading state shown during submission
- Modal can be closed with escape key or clicking outside
- Form maintains state during validation errors

#### Error Handling
- Backend errors are displayed in error message box
- User stays in modal after errors
- Form data is preserved after validation errors
- Network errors show generic "Failed to create task" message
- Error messages are displayed in red with appropriate styling

### Update a Task

#### Happy Path
1. Click on task to open task details
2. Edit task fields:
   - Title
   - Description
   - Type
   - Priority
   - Status
   - Assignee
   - Due Date
3. Changes are auto-saved after typing stops
4. Success message shown for each saved change

#### Validation Scenarios
1. Empty Title:
   - Cannot save empty title
   - Error message shown
   - Previous title restored

2. Invalid Fields:
   - Due date validation
   - Status validation
   - Priority validation

#### Auto-save Behavior
- Changes are saved 500ms after typing stops
- Loading indicator shows save status
- Error message shown if save fails
- Successful save indicated with checkmark

### Delete a Task

#### Happy Path
1. Open task details
2. Click "Delete Task" button
3. Confirmation modal appears
4. Click "Delete" to confirm
5. Task is removed from board
6. Success message displayed

#### Safety Features
- Requires explicit confirmation
- Warning about permanent deletion
- Cannot delete if task has subtasks (optional)

### Task Status Changes

#### Happy Path
1. Drag task to new status column
2. Task position updates in real-time
3. Backend updates task status
4. Success indicator shown

#### Alternative Path
1. Open task details
2. Change status from dropdown
3. Task moves to new column
4. Success message shown

#### Error Handling
- Task returns to original position if update fails
- Error message shown if status change fails
- Network error handling with retry option

### Task Validation

#### Required Fields
- Title: String, 1-255 characters
- Status: Must be valid status
- Type: Must be valid type
- Priority: Must be valid priority

#### Optional Fields
- Description: Text
- Due Date: Valid future date
- Assignee: Valid user ID
- Labels: Array of strings
- Attachments: Array of valid URLs

#### Business Rules
- Due dates cannot be in the past
- Status changes must follow workflow
- Dependencies must be valid tasks
- Circular dependencies prevented

### Test Coverage
- ✅ Task creation with valid data
- ✅ Validation errors for empty fields
- ✅ Task update operations
- ✅ Task deletion with confirmation
- ✅ Status change operations
- ✅ Auto-save functionality
- ✅ Error handling scenarios

## Additional Board Features

### Board Updates/Editing

#### Happy Path
1. Open board settings
2. Edit board details:
   - Name
   - Description
   - Visibility
3. Click "Save Changes"
4. Changes are saved
5. Success message shown

#### Validation
- Board name required
- Name uniqueness check
- Valid visibility setting

### Board Member Management

#### Add Member
1. Open board settings
2. Go to "Members" section
3. Click "Add Member"
4. Enter email or search user
5. Select role (viewer/editor/admin)
6. Send invitation
7. Success message shown

#### Update Member Role
1. Open board settings
2. Find member in list
3. Change role from dropdown
4. Confirmation for role change
5. Success message shown

#### Remove Member
1. Open board settings
2. Find member in list
3. Click remove button
4. Confirm removal
5. Member removed from board

### Board Visibility Settings

#### Change Visibility
1. Open board settings
2. Toggle visibility (public/private)
3. Confirm change
4. Success message shown

#### Public Board Features
- Accessible via URL without login
- Read-only for non-members
- Member list hidden
- Sensitive data protected

#### Private Board Features
- Requires authentication
- Only visible to members
- Full feature access based on role

### Test Coverage
- ✅ Board updates with validation
- ✅ Member addition and removal
- ✅ Role changes with validation
- ✅ Visibility changes
- ✅ Permission checks
- ✅ Error handling

### Accessibility
- Modal is properly trapped for keyboard navigation
- Form fields have associated labels
- Error messages are properly associated with inputs
- Submit button state clearly indicates when form can be submitted
- Loading state is properly indicated to screen readers
- Proper heading hierarchy in modals
- ARIA labels for close buttons
- Focus management for modal open/close


