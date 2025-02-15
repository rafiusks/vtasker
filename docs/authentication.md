# Authentication System

vTasker implements a secure and flexible authentication system that provides user authentication, protected routes, and a seamless login experience. This document outlines the key components and usage of the authentication system.

## Components Overview

### Authentication Hook (`useAuth`)

The `useAuth` hook provides centralized authentication state management using Zustand. It handles user authentication state, loading states, and authentication methods.

```typescript
import { useAuth } from "@/hooks/use-auth";

function MyComponent() {
  const { user, isAuthenticated, isLoading, signIn, signOut } = useAuth();
  
  // Use authentication state and methods
}
```

#### Features
- 🔐 Centralized authentication state
- 👤 User information management
- ⏳ Loading state handling
- 🔄 Sign-in and sign-out methods

#### Interface
```typescript
interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}
```

### Protected Route Component

The `ProtectedRoute` component provides route protection by checking authentication status and managing redirects for protected routes.

```typescript
import { ProtectedRoute } from "@/components/auth/protected-route";

function App() {
  return (
    <ProtectedRoute>
      <YourProtectedContent />
    </ProtectedRoute>
  );
}
```

#### Features
- 🛡️ Automatic route protection
- 🔄 Authentication status checking
- 📍 Return URL preservation
- 🚦 Loading state handling

### Login Page

A fully-featured login page component that handles user authentication with a clean and responsive interface.

```typescript
import LoginPage from "@/app/login/page";

// The page is already configured in the app router
// Access at /login
```

#### Features
- 📝 Email and password form
- ⏳ Loading states
- ❌ Error handling with toast notifications
- 🔗 Links to registration and password recovery
- 🔙 Return URL support

## Route Configuration

The authentication system uses a route configuration system to determine which routes require protection.

```typescript
// config/routes.ts

// Protected routes
export const protectedPaths = [
  "/dashboard",
  "/projects",
  "/calendar",
  "/team",
  "/analytics",
  "/settings",
  "/projects/*", // All project sub-routes
];

// Public routes
export const publicPaths = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];
```

## Usage Examples

### Basic Authentication Flow

```typescript
function LoginForm() {
  const { signIn } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      await signIn(
        formData.get("email") as string,
        formData.get("password") as string
      );
      
      toast({
        title: "Success",
        description: "Successfully logged in",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Invalid credentials",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

### Protected Component

```typescript
function ProtectedComponent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <UnauthorizedMessage />;
  }

  return <YourProtectedContent />;
}
```

### User Profile Access

```typescript
function UserProfile() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div>
      <h1>Welcome, {user.name}</h1>
      <p>Email: {user.email}</p>
    </div>
  );
}
```

### Sign Out Button

```typescript
function SignOutButton() {
  const { signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <Button onClick={handleSignOut}>
      Sign Out
    </Button>
  );
}
```

## Best Practices

1. **State Management**
   - Always check `isLoading` before making authentication decisions
   - Use `isAuthenticated` for conditional rendering
   - Handle authentication errors gracefully

2. **Route Protection**
   - Use the `ProtectedRoute` component at the root level
   - Configure protected routes in `config/routes.ts`
   - Include return URLs for better user experience

3. **Error Handling**
   - Implement proper error boundaries
   - Use toast notifications for user feedback
   - Provide clear error messages

4. **User Experience**
   - Show loading states during authentication
   - Preserve user context and return URLs
   - Implement proper form validation

## Security Considerations

1. **Token Management**
   - Store tokens securely (e.g., HTTP-only cookies)
   - Implement token refresh mechanism
   - Clear tokens on sign out

2. **Route Protection**
   - Always verify authentication on the server
   - Implement proper CSRF protection
   - Use HTTPS in production

3. **Input Validation**
   - Validate all user inputs
   - Implement rate limiting
   - Use proper password hashing

## Future Enhancements

Planned improvements include:
- OAuth2 integration
- Two-factor authentication
- Remember me functionality
- Session management
- Password strength requirements
- Social login options
- Audit logging
- Account recovery flow 