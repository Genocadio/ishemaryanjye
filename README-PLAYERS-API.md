# Players API Endpoint

This document describes the players endpoint that provides access to all users (players) in the game system.

## Base URL
All endpoints are prefixed with `/api/players`

## Authentication
All endpoints require authentication. Include your session cookie or authentication token in the request.

## CORS Support
All endpoints support Cross-Origin Resource Sharing (CORS) with the following configuration:

- **Access-Control-Allow-Origin**: `*` (allows requests from any origin)
- **Access-Control-Allow-Methods**: `GET, OPTIONS`
- **Access-Control-Allow-Headers**: `Content-Type, Authorization`
- **Access-Control-Max-Age**: `86400` (24 hours)

The endpoint automatically handles preflight OPTIONS requests and adds CORS headers to all responses.

## Endpoints

### 1. Get All Players
**GET** `/api/players`

Returns a paginated list of all players in the system.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of players per page (default: 50, max: 100)

**Response:**
```json
{
  "success": true,
  "players": [
    {
      "_id": "player_id_here",
      "name": "John Doe",
      "email": "john@example.com",
      "username": "johndoe",
      "phone": "+1234567890",
      "profilePicture": "",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 5,
    "total_players": 250,
    "players_per_page": 50,
    "players_on_page": 50,
    "has_next_page": true,
    "has_prev_page": false
  }
}
```

### 2. Get Player by ID
**GET** `/api/players?id=player_id_here`

Returns a specific player by their ID.

**Parameters:**
- `id` (query parameter): The MongoDB ObjectId of the player

**Response:**
```json
{
  "success": true,
  "player": {
    "_id": "player_id_here",
    "name": "John Doe",
    "email": "john@example.com",
    "username": "johndoe",
    "phone": "+1234567890",
    "profilePicture": "",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## Error Responses

All endpoints return appropriate HTTP status codes and error messages:

- **400 Bad Request**: Invalid input data, pagination parameters, or player ID format
- **401 Unauthorized**: Authentication required
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
// Get all players (first page, default limit)
const response = await fetch('/api/players', {
  credentials: 'include' // Include session cookies
});
const data = await response.json();

// Get players with pagination
const pageResponse = await fetch('/api/players?page=2&limit=25', {
  credentials: 'include'
});
const pageData = await pageResponse.json();

// Get specific player
const playerId = 'player_id_here';
const playerResponse = await fetch(`/api/players?id=${playerId}`, {
  credentials: 'include'
});
const playerData = await playerResponse.json();

// Example of handling pagination
async function getAllPlayers() {
  let allPlayers = [];
  let currentPage = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await fetch(`/api/players?page=${currentPage}&limit=50`, {
      credentials: 'include'
    });
    const data = await response.json();
    
    if (data.success) {
      allPlayers = [...allPlayers, ...data.players];
      hasMore = data.pagination.has_next_page;
      currentPage++;
    } else {
      hasMore = false;
    }
  }

  return allPlayers;
}
```

### Using with React/Next.js

```typescript
import { useEffect, useState } from 'react';

interface Player {
  _id: string;
  name: string;
  email: string;
  username: string;
  phone: string;
  profilePicture: string;
  createdAt: string;
}

interface PlayersResponse {
  success: boolean;
  players: Player[];
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

function PlayersComponent() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchPlayers = async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/players?page=${page}&limit=20`, {
        credentials: 'include'
      });
      const data: PlayersResponse = await response.json();
      
      if (data.success) {
        setPlayers(data.players);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching players:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayers(currentPage);
  }, [currentPage]);

  return (
    <div>
      {loading ? (
        <p>Loading players...</p>
      ) : (
        <div>
          <h2>Players ({pagination?.total_players} total)</h2>
          <div>
            {players.map(player => (
              <div key={player._id}>
                <h3>{player.name} (@{player.username})</h3>
                <p>{player.email}</p>
              </div>
            ))}
          </div>
          
          {/* Pagination controls */}
          <div>
            <button 
              disabled={!pagination?.has_prev_page}
              onClick={() => setCurrentPage(prev => prev - 1)}
            >
              Previous
            </button>
            <span>Page {pagination?.current_page} of {pagination?.total_pages}</span>
            <button 
              disabled={!pagination?.has_next_page}
              onClick={() => setCurrentPage(prev => prev + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

## Security Notes

- All endpoints require authentication
- Player IDs are validated to ensure they are valid MongoDB ObjectIds
- Pagination limits are enforced (max 100 players per page)
- All sensitive user data (like passwords) is excluded from responses
- Players are sorted by creation date (newest first)

## Pagination Details

The endpoint supports pagination to efficiently handle large numbers of players:

- **Default page size**: 50 players
- **Maximum page size**: 100 players
- **Minimum page size**: 1 player
- **Default page**: 1 (first page)

The pagination object in the response provides all necessary information for implementing pagination UI:
- `current_page`: Current page number
- `total_pages`: Total number of pages
- `total_players`: Total number of players in the system
- `players_per_page`: Number of players requested per page
- `players_on_page`: Actual number of players returned on current page
- `has_next_page`: Boolean indicating if there are more pages
- `has_prev_page`: Boolean indicating if there are previous pages

## Notes

- This endpoint is read-only (GET requests only)
- For user management operations (create, update, delete), use the `/api/users` endpoint
- The endpoint returns the same user data structure as `/api/users` but with player-specific naming conventions
- Players are essentially users in the system, but this endpoint provides a game-focused interface
