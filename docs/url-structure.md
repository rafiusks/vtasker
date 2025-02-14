# URL Structure for Jira Clone - Frontend

## Documentation
- `/api-docs` - Interactive API documentation
- `/api-docs/[version]` - Version-specific API docs (v1, v2)

## Authentication
### Public Routes
- `/login` - User authentication form
- `/register` - New user registration
- `/forgot-password` - Password reset request
- `/reset-password/[token]` - Password reset form (token parameterized)

### Protected Routes
- `/` - Dashboard redirect (authenticated users)
- `/dashboard` - Personal task dashboard
- `/projects` - Accessible projects list
  - `/projects/[projectId]` - Project overview (ID parameterized)
  - `/projects/[projectId]/board` - Kanban board
  - `/projects/[projectId]/backlog` - Backlog management
  - `/projects/[projectId]/settings` - Project configuration
  - `/projects/[projectId]/reports` - Project analytics
- `/issues` - Global issue tracker
  - `/issues/[issueId]` - Issue details (ID parameterized)
  - `/issues/new` - Issue creation
  - `/issues/[issueId]/edit` - Issue modification
  - `/issues/search` - Advanced search
  - `/issues/bulk-edit` - Bulk operations
- `/profile` - User management
  - `/profile/security` - Authentication settings
  - `/profile/preferences` - UI customization
  - `/profile/api-keys` - API credentials
  - `/profile/activity-log` - User actions history

### Admin Routes
- `/admin` - Admin dashboard
  - `/admin/users` - User management
    - `/admin/users/[userId]` - User details
    - `/admin/users/[userId]/edit` - User modification
  - `/admin/audit-logs` - System activity
  - `/admin/settings` - Global configuration
  - `/admin/reports` - System analytics
  - `/admin/health` - System monitoring

## Project Management
- `/projects/new` - Project creation wizard
- `/projects/[projectId]/edit` - Project settings modification
- `/projects/[projectId]/roadmap` - Project timeline view

## Reports & Analytics
- `/reports` - Consolidated analytics
  - `/reports/velocity` - Team performance
  - `/reports/burndown` - Sprint progress
  - `/reports/custom` - Report builder
  - `/reports/export` - Data exports

## Settings
- `/settings` - Application configuration
  - `/settings/team` - Collaboration settings
  - `/settings/workflows` - Process designer
  - `/styles` - `/settings/styles` - UI theming
  - `/settings/notifications` - Alert preferences
  - `/settings/integrations` - Third-party connections

## System
- `/health` - Service status
- `/not-found` - Custom 404 page
- `/unauthorized` - Access denied
