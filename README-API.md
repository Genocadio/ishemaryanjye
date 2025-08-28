# User Management API Endpoints

This document describes the user management endpoints that have been added to the backend.

## Base URL
All endpoints are prefixed with `/api/users`

## Authentication
All endpoints require authentication. Include your session cookie or authentication token in the request.

## CORS Support
All endpoints support Cross-Origin Resource Sharing (CORS) with the following configuration:

- **Access-Control-Allow-Origin**: `*` (allows requests from any origin)
- **Access-Control-Allow-Methods**: `GET, POST, PUT, DELETE, OPTIONS`
- **Access-Control-Allow-Headers**: `Content-Type, Authorization`
- **Access-Control-Max-Age**: `86400` (24 hours)

The endpoint automatically handles preflight OPTIONS requests and adds CORS headers to all responses.

## Endpoints

### 1. Get All Users
**GET** `/api/users`

Returns a list of all users in the system.

**Response:**
```json
{
  "success": true,
  "users": [
    {
      "_id": "user_id_here",
      "name": "John Doe",
      "email": "john@example.com",
      "username": "johndoe",
      "phone": "+1234567890",
      "profilePicture": "",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

### 2. Get User by ID
**GET** `/api/users?id=user_id_here`

Returns a specific user by their ID.

**Parameters:**
- `id` (query parameter): The MongoDB ObjectId of the user

**Response:**
```json
{
  "success": true,
  "user": {
    "_id": "user_id_here",
    "name": "John Doe",
    "email": "john@example.com",
    "username": "johndoe",
    "phone": "+1234567890",
    "profilePicture": "",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 3. Create New User
**POST** `/api/users`

Creates a new user account.

**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "securepassword123",
  "username": "janedoe",
  "phone": "+1234567891"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "user": {
    "_id": "new_user_id_here",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "username": "janedoe",
    "phone": "+1234567891",
    "profilePicture": "",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 4. Update User
**PUT** `/api/users?id=user_id_here`

Updates an existing user's information.

**Parameters:**
- `id` (query parameter): The MongoDB ObjectId of the user to update

**Request Body:**
```json
{
  "name": "Updated Name",
  "username": "newusername",
  "phone": "+1234567892",
  "profilePicture": "https://example.com/avatar.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User updated successfully",
  "user": {
    "_id": "user_id_here",
    "name": "Updated Name",
    "email": "jane@example.com",
    "username": "newusername",
    "phone": "+1234567892",
    "profilePicture": "https://example.com/avatar.jpg",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 5. Delete User
**DELETE** `/api/users?id=user_id_here`

Deletes a user account.

**Parameters:**
- `id` (query parameter): The MongoDB ObjectId of the user to delete

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

## Error Responses

All endpoints return appropriate HTTP status codes and error messages:

- **400 Bad Request**: Invalid input data or missing required fields
- **401 Unauthorized**: Authentication required
- **404 Not Found**: User not found
- **500 Internal Server Error**: Server-side error

**Error Response Format:**
```json
{
  "error": "Error message description"
}
```

## Security Notes

- All endpoints require authentication
- Passwords are automatically hashed using bcrypt
- User IDs are validated to ensure they are valid MongoDB ObjectIds
- Self-deletion is prevented
- Username uniqueness is enforced across all users
- Email uniqueness is enforced across all users

## Usage Examples

### Using fetch in JavaScript

```javascript
// Get all users
const response = await fetch('/api/users', {
  credentials: 'include' // Include session cookies
});
const data = await response.json();

// Get specific user
const userId = 'user_id_here';
const userResponse = await fetch(`/api/users?id=${userId}`, {
  credentials: 'include'
});
const userData = await userResponse.json();

// Create new user
const newUserResponse = await fetch('/api/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
  body: JSON.stringify({
    name: 'New User',
    email: 'newuser@example.com',
    password: 'password123',
    username: 'newuser',
    phone: '+1234567890'
  })
});
const newUserData = await newUserResponse.json();
```

## Notes

- The existing `/api/profile` endpoint remains unchanged and continues to work for individual user profile management
- These new endpoints provide admin-level user management capabilities
- All sensitive user data (like passwords) is excluded from responses
- Users are sorted by creation date (newest first) when fetching all users
