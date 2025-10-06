import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/user';

// Handle CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}

// Helper function to add CORS headers
function addCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

// Get all players
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const playerId = searchParams.get('id');
    const limit = searchParams.get('limit');
    const page = searchParams.get('page');
    
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.log('Unauthorized access attempt to players endpoint');
      const errorResponse = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      return addCorsHeaders(errorResponse);
    }
    
    console.log('Attempting to connect to MongoDB...');
    try {
      await connectDB();
      console.log('Successfully connected to MongoDB');
    } catch (dbError) {
      console.error('MongoDB connection error:', dbError);
      const errorResponse = NextResponse.json(
        { error: 'Database connection failed. Please try again later.' },
        { status: 503 }
      );
      return addCorsHeaders(errorResponse);
    }

    // If playerId is provided, get specific player
    if (playerId) {
      console.log('Fetching player by ID:', playerId);
      
      // Validate MongoDB ObjectId format
      if (!playerId.match(/^[0-9a-fA-F]{24}$/)) {
        console.log('Invalid player ID format:', playerId);
        const errorResponse = NextResponse.json(
          { error: 'Invalid player ID format' },
          { status: 400 }
        );
        return addCorsHeaders(errorResponse);
      }
      
      const player = await User.findById(playerId)
        .select('name email username phone profilePicture createdAt')
        .lean();
      
      if (!player) {
        console.log('Player not found with ID:', playerId);
        const errorResponse = NextResponse.json({ error: 'Player not found' }, { status: 404 });
        return addCorsHeaders(errorResponse);
      }
      
      console.log('Player fetched successfully:', playerId);
      const successResponse = NextResponse.json({
        success: true,
        player
      });
      return addCorsHeaders(successResponse);
    }

    // If no playerId, get all players with pagination support
    console.log('Fetching all players...');
    
    // Parse pagination parameters
    const pageNumber = parseInt(page || '1', 10);
    const limitNumber = parseInt(limit || '50', 10); // Default to 50 players per page
    const skip = (pageNumber - 1) * limitNumber;
    
    // Validate pagination parameters
    if (pageNumber < 1 || limitNumber < 1 || limitNumber > 100) {
      const errorResponse = NextResponse.json(
        { error: 'Invalid pagination parameters. Page must be >= 1, limit must be between 1 and 100.' },
        { status: 400 }
      );
      return addCorsHeaders(errorResponse);
    }
    
    // Get total count for pagination info
    const totalPlayers = await User.countDocuments({});
    
    // Fetch players with pagination
    const players = await User.find({})
      .select('name email username phone profilePicture createdAt')
      .sort({ createdAt: -1 }) // Sort by newest first
      .skip(skip)
      .limit(limitNumber)
      .lean();
    
    // Calculate pagination info
    const totalPages = Math.ceil(totalPlayers / limitNumber);
    const hasNextPage = pageNumber < totalPages;
    const hasPrevPage = pageNumber > 1;
    
    console.log(`Found ${players.length} players on page ${pageNumber} of ${totalPages}`);
    
    const successResponse = NextResponse.json({
      success: true,
      players,
      pagination: {
        current_page: pageNumber,
        total_pages: totalPages,
        total_players: totalPlayers,
        players_per_page: limitNumber,
        players_on_page: players.length,
        has_next_page: hasNextPage,
        has_prev_page: hasPrevPage
      }
    });
    return addCorsHeaders(successResponse);
    
  } catch (error) {
    console.error('Error in players endpoint:', error);
    if (error instanceof Error) {
      const errorResponse = NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
      return addCorsHeaders(errorResponse);
    }
    const errorResponse = NextResponse.json(
      { error: 'Failed to fetch players' },
      { status: 500 }
    );
    return addCorsHeaders(errorResponse);
  }
}
