# Authentication System Implementation

## Overview

Implemented a complete authentication system with role-based access control (RBAC) for NovaCar application.

## Components Created/Modified

### 1. Auth Context Provider

**File**: `lib/contexts/auth-context.tsx`

**Features**:

- Manages global authentication state
- Tracks current user and user data (including access_level)
- Provides `isAdmin` boolean (true if access_level === 0)
- Handles sign out functionality
- Auto-refreshes user data
- Listens to Supabase auth state changes

**Exports**:

- `AuthProvider` - Wrap your app with this component
- `useAuth()` - Hook to access auth state anywhere in the app

**Usage**:

```tsx
const { user, userData, isLoading, isAdmin, signOut, refreshUserData } =
  useAuth();
```

### 2. Supabase Client

**File**: `lib/supabase/client.ts`

Browser-side Supabase client for client components.

### 3. Login API Route

**File**: `app/api/auth/login/route.ts`

**Endpoint**: `POST /api/auth/login`

**Request Body**:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response**:

```json
{
  "message": "Login successful",
  "user": { ... },
  "access_level": 0 or 1
}
```

**Features**:

- Authenticates user with Supabase
- Fetches user data including access_level
- Returns user info and access level

### 4. Updated Login Form

**File**: `components/login-form.tsx`

**Features**:

- Form state management (email, password, error, loading)
- Calls login API endpoint
- **Role-Based Redirect**:
  - `access_level === 0` (Admin) → `/dashboard`
  - `access_level === 1` (Regular User) → `/home`
- Error handling and display
- Loading states

### 5. Updated Home Page

**File**: `app/home/page.tsx`

**Features**:

- Protected route (redirects to login if not authenticated)
- Displays personalized welcome message with user's first name
- **Logout Button** with icon
- Loading state while checking authentication
- Uses `useAuth()` hook to access user data

### 6. Root Layout Update

**File**: `app/layout.tsx`

Wrapped entire app with `AuthProvider` to provide auth context globally.

## Access Levels

### Level 0 - Admin

- Full access to dashboard
- Can add/edit/delete cars
- Can manage users (future feature)
- Redirect: `/dashboard`

### Level 1 - Regular User

- Can browse cars
- Can view car details
- Cannot access admin dashboard
- Redirect: `/home`

## User Flow

### Login Process

1. User enters email and password
2. Form submits to `/api/auth/login`
3. API authenticates with Supabase
4. API fetches user data including `access_level`
5. Client receives response with access_level
6. Client redirects based on access_level:
   - Admin (0) → `/dashboard`
   - User (1) → `/home`

### Logout Process

1. User clicks logout button (on `/home` page)
2. `signOut()` function called from `useAuth()`
3. Supabase auth session cleared
4. User and userData state reset to null
5. User redirected to landing page (`/`)

### Protected Routes

Routes can check authentication status:

```tsx
const { user, isLoading } = useAuth();

useEffect(() => {
  if (!isLoading && !user) {
    router.push("/");
  }
}, [user, isLoading, router]);
```

## Database Schema

### users table

```sql
- user_id (UUID, references auth.users)
- email (TEXT)
- first_name (TEXT)
- middle_name (TEXT, nullable)
- last_name (TEXT)
- contact_number (TEXT)
- access_level (INTEGER)
  - 0 = Admin
  - 1 = Regular User
```

## Testing

### Test Admin User

To test admin functionality:

1. Manually update a user's `access_level` to 0 in Supabase:

```sql
UPDATE users
SET access_level = 0
WHERE email = 'admin@example.com';
```

2. Login with that user
3. Should redirect to `/dashboard`

### Test Regular User

1. Sign up normally (defaults to access_level = 1)
2. Login with credentials
3. Should redirect to `/home`
4. Logout button should appear

## Security Considerations

1. **Server-Side Validation**: API routes validate authentication
2. **RLS Policies**: Database enforces row-level security
3. **Client-Side Protection**: useAuth hook checks authentication state
4. **Secure Sessions**: Supabase handles session management
5. **Protected Routes**: Routes check auth before rendering content

## Future Enhancements

- [ ] Remember me functionality
- [ ] Password reset flow
- [ ] Email verification requirement
- [ ] Admin panel to manage user access levels
- [ ] More granular permissions (beyond just 2 levels)
- [ ] Session timeout handling
- [ ] Multi-factor authentication
- [ ] Social login (Google, Facebook)

## Usage in Components

### Check if User is Logged In

```tsx
const { user, isLoading } = useAuth();

if (isLoading) return <Loading />;
if (!user) return <LoginPrompt />;
```

### Check if User is Admin

```tsx
const { isAdmin } = useAuth();

if (isAdmin) {
  return <AdminPanel />;
}
```

### Get User Data

```tsx
const { userData } = useAuth();

return <p>Welcome, {userData?.first_name}!</p>;
```

### Logout

```tsx
const { signOut } = useAuth();

<Button onClick={signOut}>Logout</Button>;
```

## Files Summary

**Created**:

- `lib/supabase/client.ts` - Browser Supabase client
- `lib/contexts/auth-context.tsx` - Auth context provider
- `app/api/auth/login/route.ts` - Login API endpoint

**Modified**:

- `app/layout.tsx` - Added AuthProvider wrapper
- `components/login-form.tsx` - Added login functionality with role-based redirect
- `app/home/page.tsx` - Added logout button and auth protection

## Environment Variables Required

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Installation Complete ✅

The authentication system is now fully implemented and ready to use!
