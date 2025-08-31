# HPO Authentication System

This application now uses the HPO (Health Promotion Organization) API for authentication instead of the local NextAuth system.

## Configuration

### Environment Variables

Create a `.env.local` file with the following variables:

```bash
# HPO API Configuration
NEXT_PUBLIC_HPO_API_BASE_URL=https://admin.hporwanda.org

# NextAuth Configuration (if still needed for other features)
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# WebSocket Configuration
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

## Authentication Flow

### 1. Registration
- Users register through the `/auth` page
- Data is sent to the HPO API at `/api/v1/auth/register/`
- Required fields: `player_name`, `username`, `phone`, `password`, `password_confirm`
- Optional fields: `email`, `age_group`, `gender`, `province`, `district`

### 2. Login
- Users login with `username` and `password`
- Data is sent to the HPO API at `/api/v1/auth/login/`
- Returns a UUID token for authentication

### 3. Token Management
- Tokens are stored in localStorage as `hpo_auth_token`
- Tokens are automatically included in API requests
- Tokens are cleared on logout

## API Integration

### HPO Auth Service
The `lib/hpo-auth.ts` file provides:
- `HPOAuthService` class for API calls
- `TokenManager` for token storage
- TypeScript interfaces for all data structures

### Authentication Context
The `contexts/hpo-auth-context.tsx` provides:
- `useHPOAuth()` hook for authentication state
- Login, register, and logout functions
- Player profile data
- Loading states

## Migration from NextAuth

The following changes were made:

1. **Removed NextAuth dependencies**:
   - `next-auth` package
   - `lib/auth.ts` (NextAuth configuration)
   - `types/next-auth.d.ts`
   - NextAuth API routes

2. **Updated components**:
   - `components/providers.tsx` - Now uses `HPOAuthProvider`
   - `app/layout.tsx` - Removed server-side session handling
   - `components/layout/header.tsx` - Uses HPO auth context
   - All pages now use `useHPOAuth()` instead of `useSession()`

3. **Removed local API routes**:
   - `/api/auth/login`
   - `/api/auth/register`
   - `/api/profile`
   - Other NextAuth-dependent routes

## Usage

### In Components

```tsx
import { useHPOAuth } from "@/contexts/hpo-auth-context"

function MyComponent() {
  const { player, isAuthenticated, login, logout } = useHPOAuth()
  
  if (!isAuthenticated) {
    return <div>Please log in</div>
  }
  
  return (
    <div>
      Welcome, {player?.player_name}!
      <button onClick={logout}>Logout</button>
    </div>
  )
}
```

### API Calls

```tsx
import { HPOAuthService } from "@/lib/hpo-auth"

// Get player profile
const profile = await HPOAuthService.getProfile(token)

// Get form data
const ageGroups = await HPOAuthService.getAgeGroups()
const provinces = await HPOAuthService.getProvincesDistricts()
const genders = await HPOAuthService.getGenders()
```

## Benefits

1. **Centralized Authentication**: All users are managed through the HPO system
2. **Consistent Data**: Player data is synchronized across the platform
3. **Scalable**: No need to manage local user databases
4. **Secure**: Uses UUID-based token authentication
5. **Feature Rich**: Access to player statistics, game history, and more

## Notes

- The HPO API base URL is configurable via environment variables
- All authentication is now client-side only
- Player data is automatically synced from the HPO API
- The system maintains backward compatibility with existing localStorage usage
