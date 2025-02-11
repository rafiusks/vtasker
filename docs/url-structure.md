Now the URL structure is:

1. Public Routes:
/ - Landing page
/login - Login page
/register - Register page

2. Protected Routes:

- After login, the user will be redirected to the dashboard.

/dashboard - User landing page (shows boards)
/dashboard/settings - User settings
/boards - Boards list view
/boards/settings - Boards settings
/b/{board-slug} - Individual board view
/b/{board-slug}/settings - Individual board settings
/b/{board-slug}/{task-id} - Task view within a board