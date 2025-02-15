# Layout Components

vTasker provides a set of flexible layout components inspired by modern project management tools like JIRA and Monday.com. These layouts are designed to provide consistent, professional, and user-friendly interfaces across different parts of the application.

## Available Layouts

### WorkspaceLayout

A flexible layout inspired by Monday.com, perfect for workspace-level views and dashboards.

```tsx
import { WorkspaceLayout } from "@/components/layout/workspace-layout";

export default function DashboardPage() {
  return (
    <WorkspaceLayout
      viewPanel={<CustomViewPanel />}
      breadcrumbs={<Breadcrumbs />}
      viewOptions={customViews}
      defaultView="board"
      onViewChange={(view) => console.log(`Switched to ${view}`)}
    >
      <YourContent />
    </WorkspaceLayout>
  );
}
```

#### Features
- 🔄 Collapsible main sidebar
- 📑 Optional collapsible view panel
- 🗺️ Breadcrumbs support
- 📱 Fully responsive design
- 🎯 Built-in view options (Board, List, Calendar)
- 🔄 View state management
- 🎨 Customizable view options

#### Props
| Prop | Type | Description |
|------|------|-------------|
| `children` | `React.ReactNode` | Main content to render |
| `className` | `string?` | Optional additional CSS classes |
| `viewPanel` | `React.ReactNode?` | Optional panel for view-specific controls |
| `breadcrumbs` | `React.ReactNode?` | Optional breadcrumb navigation |
| `viewOptions` | `ViewOption[]?` | Custom view options to override defaults |
| `defaultView` | `string?` | Initial active view (defaults to "board") |
| `onViewChange` | `(view: string) => void?` | Callback when view changes |

#### ViewOption Interface
```tsx
interface ViewOption {
  icon: React.ReactNode;
  label: string;
  value: string;
}
```

#### Custom View Options Example
```tsx
import { Grid, Table, Chart } from "lucide-react";

const customViews = [
  {
    icon: <Grid className="h-4 w-4" />,
    label: "Grid View",
    value: "grid",
  },
  {
    icon: <Table className="h-4 w-4" />,
    label: "Table View",
    value: "table",
  },
  {
    icon: <Chart className="h-4 w-4" />,
    label: "Analytics",
    value: "analytics",
  },
];

<WorkspaceLayout
  viewOptions={customViews}
  defaultView="grid"
  onViewChange={(view) => {
    // Handle view change
    loadViewData(view);
  }}
>
  {/* Content */}
</WorkspaceLayout>
```

### ProjectLayout

A structured layout inspired by JIRA, ideal for project-specific views and task management.

```tsx
import { ProjectLayout } from "@/components/layout/project-layout";

export default function ProjectPage() {
  return (
    <ProjectLayout
      projectName="Marketing Campaign"
      projectKey="MKT"
      navItems={customNavItems}
      defaultView="board"
      onViewChange={(view) => console.log(`Switched to ${view}`)}
      isStarred={true}
      onStarProject={() => handleStarProject()}
      onTeamClick={() => openTeamModal()}
      onSettingsClick={() => navigateToSettings()}
    >
      <YourContent />
    </ProjectLayout>
  );
}
```

#### Features
- 📌 Fixed navigation sidebar
- 🏷️ Project context bar with key information
- 📊 Horizontal scrollable view navigation
- 👥 Quick access to team and project settings
- 🎨 Professional and clean design
- ⭐ Project starring functionality
- 🔄 View state management
- 🎯 Customizable navigation items

#### Props
| Prop | Type | Description |
|------|------|-------------|
| `children` | `React.ReactNode` | Main content to render |
| `className` | `string?` | Optional additional CSS classes |
| `projectName` | `string?` | Project display name |
| `projectKey` | `string?` | Project identifier/key |
| `navItems` | `ProjectNavItem[]?` | Custom navigation items |
| `defaultView` | `string?` | Initial active view (defaults to "board") |
| `onViewChange` | `(view: string) => void?` | Callback when view changes |
| `onStarProject` | `() => void?` | Callback when project is starred/unstarred |
| `isStarred` | `boolean?` | Whether the project is starred |
| `onTeamClick` | `() => void?` | Callback when team button is clicked |
| `onSettingsClick` | `() => void?` | Callback when settings button is clicked |

#### ProjectNavItem Interface
```tsx
interface ProjectNavItem {
  icon: React.ReactNode;
  label: string;
  value: string;
}
```

#### Custom Navigation Example
```tsx
import { Kanban, FileText, Users, Chart } from "lucide-react";

const customNavItems = [
  {
    icon: <Kanban className="h-4 w-4" />,
    label: "Sprint Board",
    value: "sprint",
  },
  {
    icon: <FileText className="h-4 w-4" />,
    label: "Documentation",
    value: "docs",
  },
  {
    icon: <Users className="h-4 w-4" />,
    label: "Team",
    value: "team",
  },
  {
    icon: <Chart className="h-4 w-4" />,
    label: "Analytics",
    value: "analytics",
  },
];

<ProjectLayout
  projectName="Marketing Campaign"
  projectKey="MKT"
  navItems={customNavItems}
  defaultView="sprint"
  onViewChange={(view) => {
    // Handle view change
    loadViewContent(view);
  }}
  isStarred={project.isStarred}
  onStarProject={() => {
    // Handle project starring
    toggleProjectStar(project.id);
  }}
  onTeamClick={() => {
    // Handle team click
    openTeamManagement();
  }}
  onSettingsClick={() => {
    // Handle settings click
    router.push(`/projects/${project.id}/settings`);
  }}
>
  {/* Content */}
</ProjectLayout>
```

## State Management

Both layouts handle their own state for:
- Active view selection
- Sidebar collapse state (WorkspaceLayout)
- View panel collapse state (WorkspaceLayout)

### View State Example
```tsx
function ProjectPage() {
  // You can integrate with your app's state management
  const { viewPreference, updateViewPreference } = useUserPreferences();
  
  return (
    <ProjectLayout
      defaultView={viewPreference}
      onViewChange={(view) => {
        // Update user preferences
        updateViewPreference(view);
        // Load view-specific data
        loadViewData(view);
      }}
    >
      {/* Content */}
    </ProjectLayout>
  );
}
```

## Responsive Behavior

Both layouts are fully responsive with specific behaviors:

### WorkspaceLayout
- Sidebar collapses to icons-only on smaller screens
- View panel can be toggled on mobile
- Content area adjusts padding based on sidebar state

### ProjectLayout
- Fixed sidebar becomes overlay on mobile
- Project navigation scrolls horizontally
- Header adapts to smaller screens

## Customization Examples

### Custom View Panel with Filters
```tsx
function DashboardPage() {
  return (
    <WorkspaceLayout
      viewPanel={
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <h3 className="font-medium">Filters</h3>
            <div className="space-y-2">
              <Select
                placeholder="Status"
                options={statusOptions}
                onChange={handleStatusChange}
              />
              <Select
                placeholder="Assignee"
                options={assigneeOptions}
                onChange={handleAssigneeChange}
              />
              <DateRangePicker
                onChange={handleDateChange}
                placeholder="Date Range"
              />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium">Quick Actions</h3>
            <div className="space-y-2">
              <Button className="w-full" variant="outline">
                Create New Task
              </Button>
              <Button className="w-full" variant="outline">
                Generate Report
              </Button>
            </div>
          </div>
        </div>
      }
    >
      {/* Content */}
    </WorkspaceLayout>
  );
}
```

### Custom Project Header Actions
```tsx
function ProjectPage() {
  return (
    <ProjectLayout
      projectName="Marketing Campaign"
      projectKey="MKT"
      onStarProject={handleStarProject}
      isStarred={isProjectStarred}
      onTeamClick={() => {
        // Open team management modal
        setTeamModalOpen(true);
      }}
      onSettingsClick={() => {
        // Navigate to settings with query params
        router.push({
          pathname: `/projects/${projectId}/settings`,
          query: { tab: 'general' }
        });
      }}
    >
      {/* Content */}
      <TeamManagementModal
        isOpen={isTeamModalOpen}
        onClose={() => setTeamModalOpen(false)}
      />
    </ProjectLayout>
  );
}
```

## Best Practices

1. **View State Management**
   - Keep view state in sync with URL parameters
   - Persist user view preferences
   - Handle view transitions smoothly

2. **Performance**
   - Lazy load view-specific content
   - Optimize panel components
   - Use proper memo and callback hooks

3. **Accessibility**
   - Maintain keyboard navigation
   - Provide ARIA labels
   - Ensure proper focus management

4. **Error Handling**
   - Handle view loading errors gracefully
   - Provide fallback views
   - Show appropriate error messages

## Future Enhancements

Planned improvements include:
- Drag-and-drop view reordering
- View preferences persistence
- Custom view panel positions
- Enhanced mobile interactions
- View-specific keyboard shortcuts
- View transition animations
- View state persistence
- Deep linking support 