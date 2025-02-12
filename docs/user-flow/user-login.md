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
