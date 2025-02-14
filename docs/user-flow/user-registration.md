# User Registration Flow

## Overview
The user registration process allows new users to create an account in the system. The registration form includes validation to ensure data quality and prevent duplicate accounts.

## Flow Steps

1. **Access Registration Page**
   - User clicks the "Register" link from the homepage
   - System navigates to `/register` page

2. **Fill Registration Form**
   - Required fields:
     - Full Name
     - Email
     - Password
     - Confirm Password

3. **Form Validation**
   - Real-time validation as user types:
     - All fields are required
     - Email must be in valid format
     - Passwords must match
     - Password requirements (TBD)
   - Validation errors are shown immediately below each field
   - Submit button remains enabled to allow resubmission

4. **Form Submission**
   - User clicks "Register" button
   - System validates all fields
   - System checks for existing email

5. **Success Flow**
   - Account is created
   - User receives "Account created successfully" toast message
   - User is redirected to `/login` page
   - User can proceed to log in with their credentials

6. **Error Flows**

   a. **Validation Errors**
   - Empty fields: Shows "X is required" message
   - Invalid email: Shows "Invalid email format" message
   - Mismatched passwords: Shows "Passwords do not match" message
   - User remains on registration page
   - Form retains valid field values

   b. **Duplicate Email**
   - Shows "User already exists" error message
   - User remains on registration page
   - Form retains non-email field values

## Test Coverage

The registration flow is covered by end-to-end tests in `e2e/auth/registration.spec.ts`:

1. ✓ Successful registration with valid data
2. ✓ Validation errors for empty fields
3. ✓ Validation error for invalid email format
4. ✓ Validation error for mismatched passwords
5. ✓ Error handling for duplicate email registration

## Implementation Notes

- Form validation is handled both client-side and server-side
- Passwords are never sent in plain text
- Success/error messages use the toast notification system
- Form state is preserved after validation errors
- Navigation uses client-side routing for smooth transitions