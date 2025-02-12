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