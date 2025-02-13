# Task Management

## Overview
The task management system allows users to create, update, delete, and organize tasks within a board. Tasks can be moved between different status columns and include various properties such as title, description, type, priority, and status.

## Task Creation and Validation
test: `pnpm test e2e/task/task.spec.ts --grep "should handle task creation with validation"`

### Creation Flow
1. Click "Create Task" button
2. Fill in task details:
   - Title (required)
   - Description
   - Type (Feature/Bug/etc)
   - Priority (Low/Medium/High)
   - Status (Backlog/etc)
3. Submit form
4. Task appears in correct column
5. Success message shown

### Validation Flow
1. Click "Create Task" button
2. Submit without required fields
3. Validation errors shown:
   - Required field indicators
   - Error messages
   - Form remains open
4. Fill required fields
5. Submit successfully
6. Modal closes

## Task Updates
test: `pnpm test e2e/task/task.spec.ts --grep "should update task details"`

1. Click on existing task
2. Edit task details:
   - Title
   - Description
   - Status
   - Priority
   - Type
3. Changes auto-save
4. Success message shown
5. UI updates to reflect changes

## Task Deletion
test: `pnpm test e2e/task/task.spec.ts --grep "should delete a task"`

1. Open task details
2. Click delete button
3. Confirm deletion in modal
4. Task removed from board
5. Success message shown

## Task Status Changes

### Via Drag and Drop
test: `pnpm test e2e/task/task.spec.ts --grep "should change task status via drag and drop"`

1. Drag task card
2. Drop in new status column
3. Task moves to new column
4. Success message shown

### Via Status Select
test: `pnpm test e2e/task/task.spec.ts --grep "should change task status via dropdown"`

1. Open task details
2. Change status in dropdown
3. Task moves to new column
4. Success message shown

## Error Handling

### Validation Errors
test: `pnpm test e2e/task/task.spec.ts --grep "should handle validation errors when updating task"`

1. Open task details
2. Clear required fields
3. Validation errors shown
4. Save button disabled
5. Form prevents submission

### Network Errors
test: `pnpm test e2e/task/task.spec.ts --grep "should handle network errors gracefully"`

1. Open task details
2. Simulate network error
3. Error message shown
4. UI remains responsive
5. Changes preserved for retry

## Test Coverage
- ✅ Task creation with validation
- ✅ Task updates and auto-save
- ✅ Task deletion with confirmation
- ✅ Status changes (drag-drop & dropdown)
- ✅ Error handling (validation & network)
- ✅ UI feedback (toasts & loading states)

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