# User Login Flow

## Overview
The user login process provides secure authentication for existing users. The system supports both session-based and persistent authentication through a "Remember Me" feature, with comprehensive validation and error handling.

## Flow Steps

1. **Access Login Page**
   - User clicks the "Login" link from the homepage
   - System navigates to `/login` page

2. **Fill Login Form**
   - Required fields:
     - Email
     - Password
   - Optional fields:
     - Remember Me checkbox

3. **Form Validation**
   - Real-time validation as user types:
     - All fields are required
     - Email must be in valid format
   - Validation errors are shown immediately below each field
   - Error messages clear automatically when user starts typing
   - Submit button remains enabled to allow resubmission

4. **Form Submission**
   - User clicks "Login" button
   - System validates all fields
   - System authenticates credentials

5. **Success Flow**
   - User is authenticated
   - Auth token is stored (localStorage if "Remember Me" is checked, sessionStorage if not)
   - User is redirected to `/dashboard` page

6. **Error Flows**

   a. **Validation Errors**
   - Empty fields: Shows "X is required" message
   - Invalid email: Shows "Invalid email format" message
   - User remains on login page
   - Form retains valid field values

   b. **Invalid Credentials**
   - Shows "Invalid credentials" error message
   - User remains on login page
   - Form retains entered values

   c. **Network Errors**
   - Shows "Failed to login" error message
   - User remains on login page
   - Form retains entered values

7. **Session Management**
   - Token refresh mechanism for extended sessions
   - Automatic token refresh when needed
   - Session persistence based on "Remember Me" preference

## Test Coverage

The login flow is covered by end-to-end tests in `e2e/auth/login.spec.ts`:

1. ✓ Successful login with valid credentials
2. ✓ Validation errors for empty fields
3. ✓ Validation error for invalid email format
4. ✓ Error handling for invalid credentials
5. ✓ Form state preservation after validation errors
6. ✓ Error message clearing when typing
7. ✓ Network error handling
8. ✓ Session persistence with "Remember Me"
9. ✓ Token refresh and session management

## Implementation Notes

- Form validation is handled both client-side and server-side
- Passwords are never sent in plain text
- Success/error messages use the toast notification system
- Form state is preserved after validation errors
- Navigation uses client-side routing for smooth transitions
- Session management includes token refresh mechanism
- Authentication state is managed through React context
