# URL Structure

_Last updated: 2024-02-16 14:55 UTC_
_Reason: Updated API routes to reflect current implementation, added pagination parameters, and updated route status_

## Overview

vTasker uses Next.js App Router for routing, with a clean URL structure that reflects the application's hierarchy.

## Route Groups

### Authentication Routes
```
/auth
├── /sign-in     # Login page
├── /sign-up     # Registration page
└── /forgot      # Password recovery (planned)
```

### Dashboard Routes
```
/dashboard
├── /            # Overview dashboard
├── /analytics   # Analytics and reports (planned)
└── /settings    # Global settings (planned)
```

### Project Routes
```
/projects
├── /                    # Project list (implemented)
├── /[id]               # Project details (implemented)
│   ├── /overview       # Project overview (implemented)
│   ├── /issues         # Project issues (in progress)
│   ├── /team           # Team management (planned)
│   ├── /settings       # Project settings (planned)
│   └── /analytics      # Project analytics (planned)
└── /archived           # Archived projects (planned)
```

### Issue Routes
```
/projects/[projectId]/issues
├── /                   # Issue list (in progress)
├── /[id]              # Issue details (in progress)
│   ├── /activity      # Issue activity (planned)
│   └── /settings      # Issue settings (planned)
└── /board             # Kanban board (planned)
```

### Profile Routes
```
/profile
├── /                  # User profile (implemented)
├── /settings         # User settings (in progress)
│   ├── /account     # Account settings (in progress)
│   ├── /security    # Security settings (planned)
│   └── /preferences # User preferences (planned)
└── /notifications   # Notification settings (planned)
```

## API Routes

### Authentication
```
/api/v1/auth
├── /sign-up          # Create account (implemented)
├── /sign-in          # Login (implemented)
├── /sign-out         # Logout (implemented)
└── /refresh          # Refresh token (planned)
```

### Projects
```
/api/v1/projects
├── /?page=1&page_size=10  # List projects with pagination (implemented)
├── /[id]                  # Get/update/delete project (implemented)
└── /[id]/issues          # Project issues (in progress)
```

### Issues
```
/api/v1/issues
├── /?project_id=123      # List issues with filtering (in progress)
├── /[id]                 # Get/update/delete issue (in progress)
└── /[id]/comments        # Issue comments (planned)
```

### Users
```
/api/v1/users
├── /me              # Current user (implemented)
├── /me/settings     # User settings (in progress)
└── /me/password     # Password update (planned)
```

## Route Protection

### Public Routes
- `/auth/*`
- `/api/v1/auth/*`
- `/` (landing page)

### Protected Routes (Require Authorization Header)
- `/dashboard/*`
- `/projects/*`
- `/profile/*`
- `/api/v1/*` (except auth)

## Current Status

### Implemented ✅
- Authentication system
- Project CRUD operations
- Protected route middleware
- API pagination
- Authorization header handling

### In Progress 🔄
- Issue management
- User settings
- Project-issue relationships
- Team management

### Planned ⏳
- Kanban board
- Analytics dashboard
- Email notifications
- Webhooks
- Real-time updates
- File attachments
- Comments system
- Activity tracking
