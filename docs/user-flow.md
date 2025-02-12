# User Flow

## User Registration

### Happy Path
1. Navigate to homepage (/)
2. Click on register link
3. Fill in registration form:
   - Full Name (required)
   - Email (required, must be unique)
   - Password (required, minimum 8 characters)
   - Confirm Password (must match password)
4. Click on "Create Account" button
5. System validates all fields
6. If validation passes:
   - Backend creates new user account
   - User receives success message
   - Redirected to /login page
   - Success message displayed: "Account created successfully"

### Validation Scenarios
1. Empty Fields:
   - All fields are required
   - Error messages shown on blur:
     - "Full name is required"
     - "Email is required"
     - "Password is required"
     - "Please confirm your password"

2. Email Validation:
   - Must be in valid format (example@domain.com)
   - Error message: "Invalid email format"
   - Must be unique (not already registered)
   - Error message if exists: "User already exists"

3. Password Validation:
   - Minimum 8 characters
   - Error message: "Password must be at least 8 characters"
   - Confirmation must match
   - Error message: "Passwords do not match"

### Form Behavior
- Submit button is disabled until required fields are filled
- Validation occurs on field blur
- Error messages are cleared when user starts typing
- Loading state shown during submission
- Form maintains state during validation errors
- Form fields have appropriate autocomplete attributes
- Each field has a descriptive placeholder text

### Error Handling
- Backend errors are displayed in error message box
- User stays on registration page after errors
- Form data is preserved after validation errors
- Network errors show generic "Failed to register" message
- Error messages are displayed in red with appropriate styling
- Error state is cleared when user starts typing in the field

### Test Coverage
- ✅ Successful registration with valid data
- ✅ Validation errors for empty fields
- ✅ Validation error for invalid email format
- ✅ Validation error for mismatched passwords
- ✅ Error message for existing email
- ✅ Form interaction (blur events, typing)
- ✅ Navigation and redirects
- ✅ Success message display

### Accessibility
- Form fields have associated labels
- Error messages are properly associated with inputs
- Submit button state clearly indicates when form can be submitted
- Loading state is properly indicated to screen readers
- Form can be navigated via keyboard

## User Login

### Happy Path
1. Navigate to /login directly
2. Fill in login form:
   - Email (required)
   - Password (required)
   - Optional: Check "Remember me"
3. Click on "Login" button
4. System authenticates user
5. If authentication succeeds:
   - User receives authentication token and refresh token
   - Token expiry is set (15 minutes)
   - Refresh token expiry is set (7 days)
   - Redirected to /dashboard or original requested URL
   - Session is established
   - Token refresh is scheduled

### Validation Scenarios
1. Empty Fields:
   - All fields are required
   - Error messages shown on blur:
     - "Email is required"
     - "Password is required"

2. Email Validation:
   - Must be in valid format (example@domain.com)
   - Error message: "Invalid email format"

3. Authentication Validation:
   - Credentials must match existing user
   - Error message: "Invalid credentials" for wrong email or password
   - No indication which field is incorrect (security best practice)

### Form Behavior
- Submit button is disabled until required fields are filled
- Validation occurs on field blur and form submission
- Error messages are cleared when user starts typing
- Loading state shown during submission
- Form maintains state during validation errors
- Form fields have appropriate autocomplete attributes
- Each field has a descriptive placeholder text
- Remember me checkbox for persistent session

### Error Handling
- Authentication errors are displayed in error message box
- User stays on login page after errors
- Form data is preserved after validation errors
- Network errors show generic "Failed to login" message
- Error messages are displayed in red with appropriate styling
- Error state is cleared when user starts typing in the field
- Specific error handling for:
  - 401 Unauthorized: "Invalid credentials"
  - Network failures: "Failed to login"
  - Other errors: Error message from server or generic message

### Security Features
- Password field masks input
- No password requirements shown on login
- Session management with JWT
- Secure token storage in memory
- Refresh token rotation
- Token expiration handling
- HTTPS required (production)
- Auto token refresh before expiry
- Secure token storage with optional persistence

### Additional Features
- "Remember me" functionality implemented
- Link to registration page
- Automatic redirect handling after login
- Token refresh scheduling
- Session state management
- Protected route handling

### Test Coverage
- ✅ Successful login with valid credentials
- ✅ Validation errors for empty fields
- ✅ Validation error for invalid email format
- ✅ Error message for invalid credentials
- ✅ Form state preservation after validation
- ✅ Error message clearing on typing
- ✅ Network error handling
- ✅ Form interaction (blur events, typing)
- ✅ Navigation and redirects
- ✅ Remember me functionality
- ✅ Token and session management

### Accessibility
- Form fields have associated labels
- Error messages are properly associated with inputs
- Submit button state clearly indicates when form can be submitted
- Loading state is properly indicated to screen readers
- Form can be navigated via keyboard
- ARIA attributes for validation states
- Clear focus indicators
- Proper heading hierarchy

## Board Management

### Create a Board

#### Happy Path
1. Navigate to /boards
2. Click on "Create Board" button
3. Fill in board details in modal:
   - Board Name (required)
   - Description (optional)
   - Visibility (Public/Private)
4. Click "Create" button
5. System validates input
6. If validation passes:
   - Backend creates new board
   - User is redirected to /b/{board-slug}
   - Success message displayed
   - Board is immediately available for use

#### Validation Scenarios
1. Empty Fields:
   - Board name is required
   - Error message: "Board name is required"
   - Description is optional

2. Name Validation:
   - Must be unique per user
   - Error message if exists: "Board name already exists"
   - Maximum length enforced
   - Error message: "Board name too long"

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
- Network errors show generic "Failed to create board" message
- Error messages are displayed in red with appropriate styling

### Delete a Board

#### Happy Path
1. Navigate to board settings
2. Click "Delete Board" button
3. Confirmation modal appears
4. Enter board name to confirm
5. Click "Delete" button
6. System processes deletion
7. If successful:
   - Board is permanently deleted
   - User is redirected to /boards
   - Success message displayed

#### Safety Features
- Requires explicit confirmation
- Board name must be typed correctly
- Warning about permanent deletion
- Cannot delete if board has active tasks (optional)

#### Error Handling
- Backend errors are displayed in error message box
- User stays on confirmation modal after errors
- Network errors show generic "Failed to delete board" message
- Proper error recovery if deletion fails

### Test Coverage
- ✅ Successful board creation with valid data
- ✅ Validation errors for empty fields
- ✅ Error message for duplicate board name
- ✅ Board deletion with confirmation
- ✅ Navigation and redirects
- ✅ Success/error message display
- ✅ Modal interaction (escape, click outside)
- ✅ Form state preservation

### Accessibility
- Modal is properly trapped for keyboard navigation
- Form fields have associated labels
- Error messages are properly associated with inputs
- Submit button state clearly indicates when form can be submitted
- Loading state is properly indicated to screen readers
- Proper heading hierarchy in modals
- ARIA labels for close buttons
- Focus management for modal open/close

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


