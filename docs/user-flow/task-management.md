# Task Management Flow

## Overview
The task management system allows users to create, update, delete, and organize tasks within boards. Tasks include various properties like title, description, type, priority, and status, with comprehensive validation and error handling.

## Flow Steps

1. **Access Task Board**
   - User navigates to a board page (`/b/{board-slug}`)
   - System displays board with task columns by status
   - "Create Task" button is visible

2. **Task Creation**
   - User clicks "Create Task" button
   - System displays task creation modal
   - Required fields:
     - Title
   - Optional fields:
     - Description
     - Type (Feature, Bug, etc.)
     - Priority (Low, Medium, High)
     - Status (Backlog, In Progress, etc.)
   - Validation:
     - Title cannot be empty
     - Form shows validation errors immediately
   - On successful creation:
     - Task is created and appears in appropriate status column
     - Modal closes automatically
     - Success message is displayed
   - On validation error:
     - Error messages are shown below fields
     - Form retains entered values
     - Modal remains open

3. **Task Updates**
   - User clicks on a task card
   - System displays task details modal
   - All fields can be updated:
     - Title
     - Description
     - Type
     - Priority
     - Status
   - On successful update:
     - Task details are updated
     - Modal closes automatically
     - Success message is displayed
   - On validation error:
     - Error messages are shown
     - Form retains entered values
     - Modal remains open

4. **Task Deletion**
   - User opens task details modal
   - Clicks "Delete Task" button
   - System displays confirmation dialog
   - On confirmation:
     - Task is deleted
     - Modal closes
     - Success message is displayed
   - On cancellation:
     - Dialog closes
     - No changes are made

5. **Status Changes**
   - Two methods available:
     a. Drag and Drop:
        - User drags task card to new status column
        - System updates task status immediately
        - Visual feedback during drag
        - Success message on completion
     
     b. Status Dropdown:
        - User opens task details
        - Changes status in dropdown
        - Saves changes
        - Task moves to new column
        - Success message displayed

6. **Error Flows**

   a. **Validation Errors**
   - Empty title: Shows "Title is required" message
   - User remains on form
   - Form retains valid values

   b. **Network Errors**
   - Shows appropriate error message
   - Form state is preserved
   - Retry options available

7. **Modal Behavior**
   - Modal can be closed by:
     - Clicking Cancel button
     - Clicking outside modal
     - Pressing Escape key
   - Form state is reset on modal close
   - Unsaved changes are discarded

## Test Coverage

The task management flow is covered by end-to-end tests in `e2e/task/task.spec.ts`:

1. ✓ Task Creation with Validation
   - Create task with valid data
   - Validate required fields
   - Test form state preservation
   - Verify success messages

2. ✓ Task Updates
   - Update task details
   - Verify changes are reflected
   - Test form validation
   - Check success messages

3. ✓ Task Deletion
   - Delete task with confirmation
   - Verify task removal
   - Test cancellation flow

4. ✓ Status Changes
   - Test drag and drop functionality (Note: Automated test is currently flaky but functionality works manually)
   - Update status via dropdown
   - Verify column changes
   - Check success messages

5. ✓ Error Handling
   - Test validation errors
   - Handle network errors
   - Verify error messages
   - Test form state preservation

> Note: The drag-and-drop test is currently experiencing intermittent failures in automated testing, but the functionality has been verified to work correctly in manual testing. This is being tracked as a test improvement item.

## Implementation Notes

- Task operations require authentication
- Tasks belong to a specific board
- Task status changes trigger real-time updates
- Form validation is handled both client-side and server-side
- Success/error messages use toast notifications
- Modal state is managed through React context
- Task data is cached for performance
- Drag and drop uses HTML5 drag and drop API
- Network operations use React Query for state management

## Accessibility Features
- Modal is keyboard navigable (Tab, Escape)
- Form fields have proper labels and ARIA attributes
- Error messages are screen-reader friendly
- Drag and drop has keyboard alternative (status dropdown)
- Loading states announced to screen readers
- Proper heading hierarchy in modals
- ARIA labels for actions
- Focus management for modals
- Required field indicators
- Validation feedback via ARIA attributes