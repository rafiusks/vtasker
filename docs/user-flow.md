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

1. Navigate to /login
2. Enter email and password
3. Click on login button
4. Redirect to /dashboard on success

## Create a board

1. Navigate to /dashboard
2. Click on "Create a board"
3. Navigate to /boards
4. Enter board name and description
5. Click on "Create board"
6. Redirect to /b/{board-slug}


