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

## Create a board

1. Navigate to /dashboard
2. Click on "Create a board"
3. Navigate to /boards
4. Enter board name and description
5. Click on "Create board"
6. Redirect to /b/{board-slug}


