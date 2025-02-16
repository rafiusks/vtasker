# Layout System

_Last updated: 2024-02-16 05:44 UTC_
_Reason: Updated layout documentation to reflect current component structure, added responsive design patterns, and included accessibility considerations_

## Overview

vTasker uses Next.js 14 App Router layouts with a component-based architecture. The layout system is designed to be responsive, maintainable, and consistent across the application.

## Layout Structure

### Root Layout
```typescript
// app/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

### Dashboard Layout
```typescript
// app/(dashboard)/layout.tsx
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b">
        <MainNav />
      </header>
      <div className="flex flex-1">
        <aside className="fixed inset-y-0 left-0 mt-14">
          <SideNav />
        </aside>
        <main className="flex-1 ml-72">
          {children}
        </main>
      </div>
    </div>
  );
}
```

### Auth Layout
```typescript
// app/(auth)/layout.tsx
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md space-y-8">
        {children}
      </div>
    </div>
  );
}
```

## Components

### Navigation Components

#### MainNav
```typescript
interface MainNavProps {
  className?: string;
}

export function MainNav({ className }: MainNavProps) {
  return (
    <div className={cn("container flex h-14 items-center", className)}>
      <Link href="/" className="flex items-center space-x-2">
        <Logo />
        <span className="font-bold">vTasker</span>
      </Link>
      <div className="flex flex-1 items-center justify-end space-x-4">
        <UserNav />
      </div>
    </div>
  );
}
```

#### SideNav
```typescript
export function SideNav() {
  const [isCollapsed, setIsCollapsed] = useLocalStorage("nav-collapsed", false);
  
  return (
    <nav className={cn(
      "h-screen border-r bg-background transition-all",
      isCollapsed ? "w-16" : "w-72"
    )}>
      <div className="space-y-4 py-4">
        <NavItems />
      </div>
    </nav>
  );
}
```

### Layout Components

#### Card
```typescript
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
```

#### Grid
```typescript
interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  cols?: number;
  gap?: number;
}

export function Grid({ children, cols = 1, gap = 4, className }: GridProps) {
  return (
    <div
      className={cn(
        "grid",
        `grid-cols-${cols}`,
        `gap-${gap}`,
        className
      )}
    >
      {children}
    </div>
  );
}
```

## Page Layouts

### Project List
```typescript
export default function ProjectsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Projects</h2>
        <CreateProjectButton />
      </div>
      <div className="grid gap-4">
        <ProjectFilters />
        <ProjectGrid />
      </div>
    </div>
  );
}
```

### Project Details
```typescript
export default function ProjectDetailsPage() {
  return (
    <div className="space-y-6">
      <ProjectHeader />
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="issues">Issues</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <ProjectDashboard />
        </TabsContent>
        {/* Other tab contents */}
      </Tabs>
    </div>
  );
}
```

## Responsive Design

### Breakpoints
```typescript
const breakpoints = {
  sm: "640px",   // Small devices
  md: "768px",   // Medium devices
  lg: "1024px",  // Large devices
  xl: "1280px",  // Extra large devices
  "2xl": "1536px" // 2X large devices
};
```

### Media Queries
```typescript
const queries = {
  sm: `(min-width: ${breakpoints.sm})`,
  md: `(min-width: ${breakpoints.md})`,
  lg: `(min-width: ${breakpoints.lg})`,
  xl: `(min-width: ${breakpoints.xl})`,
  "2xl": `(min-width: ${breakpoints["2xl"]})`
};
```

## Current Status

### Implemented
- ✅ Root layout with providers
- ✅ Dashboard layout with navigation
- ✅ Authentication layout
- ✅ Responsive navigation
- ✅ Dark mode support
- ✅ Grid system

### In Progress
- 🔄 Mobile navigation improvements
- 🔄 Layout transitions
- 🔄 Loading states

### Planned
- ⏳ Custom scrollbars
- ⏳ Advanced animations
- ⏳ RTL support
- ⏳ Accessibility improvements

## Best Practices

1. **Component Organization**
   - Keep components small and focused
   - Use composition over inheritance
   - Implement proper prop typing

2. **Styling**
   - Use Tailwind utility classes
   - Maintain consistent spacing
   - Follow design system tokens

3. **Performance**
   - Lazy load components when possible
   - Optimize images and assets
   - Minimize layout shifts

4. **Accessibility**
   - Proper ARIA attributes
   - Keyboard navigation
   - Screen reader support 