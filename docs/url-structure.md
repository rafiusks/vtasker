# URL Structure

_Last updated: 2024-02-16 05:46 UTC_
_Reason: Updated URL structure documentation to reflect current routing implementation, added API endpoints, and included route protection information

## Overview

vTasker uses Next.js App Router for routing, with a clean URL structure that reflects the application's hierarchy.

## Route Groups

### Authentication Routes
```
/auth
├── /sign-in     # Login page
├── /sign-up     # Registration page
└── /forgot      # Password recovery
```

### Dashboard Routes
```
/dashboard
├── /            # Overview dashboard
├── /analytics   # Analytics and reports
└── /settings    # Global settings
```

### Project Routes
```
/projects
├── /                    # Project list
├── /[id]               # Project details
│   ├── /overview       # Project overview
│   ├── /issues         # Project issues
│   ├── /team           # Team management
│   ├── /settings       # Project settings
│   └── /analytics      # Project analytics
└── /archived           # Archived projects
```

### Issue Routes
```
/projects/[projectId]/issues
├── /                   # Issue list
├── /[id]              # Issue details
│   ├── /activity      # Issue activity
│   └── /settings      # Issue settings
└── /board             # Kanban board
```

### Profile Routes
```
/profile
├── /                  # User profile
├── /settings         # User settings
│   ├── /account     # Account settings
│   ├── /security    # Security settings
│   └── /preferences # User preferences
└── /notifications   # Notification settings
```

## API Routes

### Authentication
```
/api/auth
├── /sign-up          # Create account
├── /sign-in          # Login
├── /sign-out         # Logout
└── /refresh          # Refresh token
```

### Projects
```
/api/projects
├── /                 # List/create projects
├── /[id]            # Get/update/delete project
└── /[id]/issues     # Project issues
```

### Issues
```
/api/issues
├── /                # List/create issues
├── /[id]           # Get/update/delete issue
└── /[id]/comments  # Issue comments
```

### Users
```
/api/users
├── /me              # Current user
├── /me/settings     # User settings
└── /me/password     # Password update
```

## Route Protection

### Public Routes
- `/auth/*`
- `/api/auth/*`
- `/` (landing page)

### Protected Routes
- `/dashboard/*`
- `/projects/*`
- `/profile/*`
- `/api/*` (except auth)

## Current Status

### Implemented
- ✅ Authentication routes
- ✅ Project routes
- ✅ Basic API routes
- ✅ Profile routes
- ✅ Route protection

### In Progress
- 🔄 Issue management routes
- 🔄 Analytics routes
- 🔄 Team management routes

### Planned
- ⏳ Kanban board routes
- ⏳ Advanced analytics
- ⏳ API documentation routes
- ⏳ Webhook management routes
