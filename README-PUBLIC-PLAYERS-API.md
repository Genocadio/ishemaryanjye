# Public Players API Endpoint

This document describes the public players endpoint that provides access to player information without requiring authentication. This endpoint is designed for public features like leaderboards, player directories, or other public-facing player information.

## Base URL
All endpoints are prefixed with `/api/players/public`

## Authentication
**No authentication required** - This is a public endpoint accessible to all users.

## CORS Support
All endpoints support Cross-Origin Resource Sharing (CORS) with the following configuration:

- **Access-Control-Allow-Origin**: `*` (allows requests from any origin)
- **Access-Control-Allow-Methods**: `GET, OPTIONS`
- **Access-Control-Allow-Headers**: `Content-Type, Authorization`
- **Access-Control-Max-Age**: `86400` (24 hours)

The endpoint automatically handles preflight OPTIONS requests and adds CORS headers to all responses.

## Privacy & Security

This endpoint only returns **public player information**:
- ✅ Player name
- ✅ Username
- ✅ Profile picture
- ✅ Account creation date
- ❌ Email (private)
- ❌ Phone number (private)
- ❌ Any other sensitive information

## Rate Limiting

For public endpoints, stricter pagination limits are enforced:
- **Default page size**: 20 players
- **Maximum page size**: 50 players (lower than authenticated endpoint)
- **Minimum page size**: 1 player

## Endpoints

### 1. Get All Players (Public)
**GET** `/api/players/public`

Returns a paginated list of all players with public information only.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of players per page (default: 20, max: 50)

**Response:**
```json
{
  "success": true,
  "players": [
    {
      "_id": "player_id_here",
      "name": "John Doe",
      "username": "johndoe",
      "profilePicture": "https://example.com/avatar.jpg",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 10,
    "total_players": 200,
    "players_per_page": 20,
    "players_on_page": 20,
    "has_next_page": true,
    "has_prev_page": false
  }
}
```

### 2. Get Player by ID (Public)
**GET** `/api/players/public?id=player_id_here`

Returns public information for a specific player by their ID.

**Parameters:**
- `id` (query parameter): The MongoDB ObjectId of the player

**Response:**
```json
{
  "success": true,
  "player": {
    "_id": "player_id_here",
    "name": "John Doe",
    "username": "johndoe",
    "profilePicture": "https://example.com/avatar.jpg",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## Error Responses

All endpoints return appropriate HTTP status codes and error messages:

- **400 Bad Request**: Invalid input data, pagination parameters, or player ID format
- **404 Not Found**: Player not found
- **503 Service Unavailable**: Database connection failed
- **500 Internal Server Error**: Server-side error

**Error Response Format:**
```json
{
  "error": "Error message description"
}
```

## Usage Examples

### Using fetch in JavaScript

```javascript
// Get all players (public info only)
const response = await fetch('/api/players/public');
const data = await response.json();

// Get players with pagination
const pageResponse = await fetch('/api/players/public?page=2&limit=25');
const pageData = await pageResponse.json();

// Get specific player (public info only)
const playerId = 'player_id_here';
const playerResponse = await fetch(`/api/players/public?id=${playerId}`);
const playerData = await playerResponse.json();

// Example: Build a public leaderboard
async function buildLeaderboard() {
  try {
    const response = await fetch('/api/players/public?limit=10'); // Top 10 players
    const data = await response.json();
    
    if (data.success) {
      return data.players.map((player, index) => ({
        rank: index + 1,
        name: player.name,
        username: player.username,
        profilePicture: player.profilePicture,
        joinDate: new Date(player.createdAt).toLocaleDateString()
      }));
    }
  } catch (error) {
    console.error('Error building leaderboard:', error);
    return [];
  }
}
```

### Using with React/Next.js (Public Component)

```typescript
import { useEffect, useState } from 'react';

interface PublicPlayer {
  _id: string;
  name: string;
  username: string;
  profilePicture: string;
  createdAt: string;
}

interface PublicPlayersResponse {
  success: boolean;
  players: PublicPlayer[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_players: number;
    players_per_page: number;
    players_on_page: number;
    has_next_page: boolean;
    has_prev_page: boolean;
  };
}

function PublicLeaderboard() {
  const [players, setPlayers] = useState<PublicPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPublicPlayers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // No authentication needed!
        const response = await fetch('/api/players/public?limit=50');
        const data: PublicPlayersResponse = await response.json();
        
        if (data.success) {
          setPlayers(data.players);
        } else {
          setError('Failed to load players');
        }
      } catch (err) {
        setError('Error fetching players');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicPlayers();
  }, []);

  if (loading) return <div>Loading players...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="public-leaderboard">
      <h2>Players Leaderboard</h2>
      <div className="players-grid">
        {players.map((player, index) => (
          <div key={player._id} className="player-card">
            <div className="rank">#{index + 1}</div>
            <img 
              src={player.profilePicture || '/default-avatar.png'} 
              alt={player.name}
              className="avatar"
            />
            <h3>{player.name}</h3>
            <p>@{player.username}</p>
            <small>
              Joined: {new Date(player.createdAt).toLocaleDateString()}
            </small>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PublicLeaderboard;
```

### Server-Side Rendering (Next.js)

```typescript
// pages/leaderboard.tsx or app/leaderboard/page.tsx
import { GetServerSideProps } from 'next';

interface Props {
  players: PublicPlayer[];
  totalPlayers: number;
}

export default function LeaderboardPage({ players, totalPlayers }: Props) {
  return (
    <div>
      <h1>Public Players Leaderboard</h1>
      <p>Total Players: {totalPlayers}</p>
      {/* Render players */}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    // Server-side fetch (no CORS issues)
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/players/public?limit=50`);
    const data = await response.json();
    
    if (data.success) {
      return {
        props: {
          players: data.players,
          totalPlayers: data.pagination.total_players,
        },
      };
    }
  } catch (error) {
    console.error('Error fetching players for SSR:', error);
  }
  
  return {
    props: {
      players: [],
      totalPlayers: 0,
    },
  };
};
```

## Use Cases

This public endpoint is perfect for:

1. **Public Leaderboards**: Display top players without requiring login
2. **Player Directory**: Browse all players in the game
3. **Profile Discovery**: Find other players to connect with
4. **Statistics Display**: Show total player count and growth
5. **SEO-Friendly Pages**: Server-side rendered player lists
6. **Mobile Apps**: Access player data without complex authentication
7. **Third-party Integrations**: Allow external services to access basic player info

## Security Considerations

- **No sensitive data**: Email addresses and phone numbers are never exposed
- **Rate limiting**: Lower pagination limits prevent abuse
- **Input validation**: All parameters are validated to prevent injection attacks
- **MongoDB ObjectId validation**: Ensures valid database queries
- **Error handling**: Generic error messages prevent information leakage

## Comparison with Authenticated Endpoint

| Feature | Public Endpoint | Authenticated Endpoint |
|---------|----------------|----------------------|
| Authentication | ❌ Not required | ✅ Required |
| Email access | ❌ No | ✅ Yes |
| Phone access | ❌ No | ✅ Yes |
| Max page size | 50 players | 100 players |
| Default page size | 20 players | 50 players |
| Use case | Public features | Admin/user management |

## Notes

- This endpoint complements the authenticated `/api/players` endpoint
- Perfect for public-facing features that don't require user login
- Automatically excludes sensitive information to protect user privacy
- Lower pagination limits help prevent abuse and reduce server load
- Can be cached more aggressively since data is public
