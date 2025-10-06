import { NextResponse } from 'next/server';
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

// Get all players - public endpoint (no authentication required)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const playerId = searchParams.get('id');
    const limit = searchParams.get('limit');
    const page = searchParams.get('page');
    
    console.log('Public players endpoint accessed');
    
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
      console.log('Fetching public player by ID:', playerId);
      
      // Validate MongoDB ObjectId format
      if (!playerId.match(/^[0-9a-fA-F]{24}$/)) {
        console.log('Invalid player ID format:', playerId);
        const errorResponse = NextResponse.json(
          { error: 'Invalid player ID format' },
          { status: 400 }
        );
        return addCorsHeaders(errorResponse);
      }
      
      // Only return public information (exclude email and phone)
      const player = await User.findById(playerId)
        .select('name username profilePicture createdAt')
        .lean();
      
      if (!player) {
        console.log('Player not found with ID:', playerId);
        const errorResponse = NextResponse.json({ error: 'Player not found' }, { status: 404 });
        return addCorsHeaders(errorResponse);
      }
      
      console.log('Public player fetched successfully:', playerId);
      const successResponse = NextResponse.json({
        success: true,
        player
      });
      return addCorsHeaders(successResponse);
    }

    // If no playerId, get all players with pagination support
    console.log('Fetching all public players...');
    
    // Parse pagination parameters with stricter limits for public endpoint
    const pageNumber = parseInt(page || '1', 10);
    const limitNumber = Math.min(parseInt(limit || '20', 10), 50); // Default to 20, max 50 for public
    const skip = (pageNumber - 1) * limitNumber;
    
    // Validate pagination parameters
    if (pageNumber < 1 || limitNumber < 1) {
      const errorResponse = NextResponse.json(
        { error: 'Invalid pagination parameters. Page and limit must be >= 1.' },
        { status: 400 }
      );
      return addCorsHeaders(errorResponse);
    }
    
    // Get total count for pagination info
    const totalPlayers = await User.countDocuments({});
    
    // Fetch players with pagination - only public information
    const players = await User.find({})
      .select('name username profilePicture createdAt')
      .sort({ createdAt: -1 }) // Sort by newest first
      .skip(skip)
      .limit(limitNumber)
      .lean();
    
    // Calculate pagination info
    const totalPages = Math.ceil(totalPlayers / limitNumber);
    const hasNextPage = pageNumber < totalPages;
    const hasPrevPage = pageNumber > 1;
    
    console.log(`Found ${players.length} public players on page ${pageNumber} of ${totalPages}`);
    
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
    console.error('Error in public players endpoint:', error);
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
