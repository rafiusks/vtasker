# User Flow

## User Registration
file: docs/user-flow/user-registration.md
test: e2e/auth/registration.spec.ts
command: pnpm test e2e/auth/registration.spec.ts

## User Login
file: docs/user-flow/user-login.md
test: e2e/auth/login.spec.ts
command: pnpm test e2e/auth/login.spec.ts

## Board Management
file: docs/user-flow/board-management.md
test: e2e/board/board.spec.ts
command: pnpm test e2e/board/board.spec.ts

## Task Management
file: docs/user-flow/task-management.md
test: e2e/task/task.spec.ts
command: pnpm test e2e/task/task.spec.ts

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


