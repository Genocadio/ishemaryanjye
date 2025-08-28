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
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}

// Helper function to add CORS headers
function addCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

// Get all users or get user by ID
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');
    
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.log('Unauthorized access attempt to users endpoint');
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

    // If userId is provided, get specific user
    if (userId) {
      console.log('Fetching user by ID:', userId);
      
      // Validate MongoDB ObjectId format
      if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
        console.log('Invalid user ID format:', userId);
        const errorResponse = NextResponse.json(
          { error: 'Invalid user ID format' },
          { status: 400 }
        );
        return addCorsHeaders(errorResponse);
      }
      
      const user = await User.findById(userId)
        .select('name email username phone profilePicture createdAt')
        .lean();
      
      if (!user) {
        console.log('User not found with ID:', userId);
        const errorResponse = NextResponse.json({ error: 'User not found' }, { status: 404 });
        return addCorsHeaders(errorResponse);
      }
      
      console.log('User fetched successfully:', userId);
      const successResponse = NextResponse.json({
        success: true,
        user
      });
      return addCorsHeaders(successResponse);
    }

    // If no userId, get all users
    console.log('Fetching all users...');
    const users = await User.find({})
      .select('name email username phone profilePicture createdAt')
      .sort({ createdAt: -1 }) // Sort by newest first
      .lean();
    
    console.log(`Found ${users.length} users`);
    const successResponse = NextResponse.json({
      success: true,
      users,
      count: users.length
    });
    return addCorsHeaders(successResponse);
    
  } catch (error) {
    console.error('Error in users endpoint:', error);
    if (error instanceof Error) {
      const errorResponse = NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
      return addCorsHeaders(errorResponse);
    }
    const errorResponse = NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
    return addCorsHeaders(errorResponse);
  }
}

// Create new user (admin only)
export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.log('Unauthorized access attempt to create user');
      const errorResponse = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      return addCorsHeaders(errorResponse);
    }
    
    // TODO: Add admin role check here
    // For now, allowing any authenticated user to create users
    
    const { name, email, password, username, phone } = await request.json();
    console.log('Received user creation data:', { name, email, username, phone });

    // Validate required fields
    if (!name || !email || !password || !username || !phone) {
      console.log('Missing required fields for user creation');
      const errorResponse = NextResponse.json(
        { error: 'All fields (name, email, password, username, phone) are required' },
        { status: 400 }
      );
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

    // Check if user already exists
    console.log('Checking for existing user with email:', email);
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists with email:', email);
      const errorResponse = NextResponse.json(
        { error: 'User already exists with this email' },
        { status: 400 }
      );
      return addCorsHeaders(errorResponse);
    }

    // Check if username is already taken
    console.log('Checking for existing username:', username);
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      console.log('Username already taken:', username);
      const errorResponse = NextResponse.json(
        { error: 'Username already taken' },
        { status: 400 }
      );
      return addCorsHeaders(errorResponse);
    }

    // Create new user
    console.log('Creating new user...');
    const user = new User({
      name,
      email,
      password,
      username,
      phone
    });
    
    await user.save();
    console.log('User created successfully:', user._id);

    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = user.toObject();
    
    const successResponse = NextResponse.json({
      success: true,
      message: 'User created successfully',
      user: userWithoutPassword
    }, { status: 201 });
    return addCorsHeaders(successResponse);
    
  } catch (error) {
    console.error('Error creating user:', error);
    if (error instanceof Error) {
      const errorResponse = NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
      return addCorsHeaders(errorResponse);
    }
    const errorResponse = NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
    return addCorsHeaders(errorResponse);
  }
}

// Update user by ID (admin only)
export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');
    
    if (!userId) {
      const errorResponse = NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
      return addCorsHeaders(errorResponse);
    }
    
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.log('Unauthorized access attempt to update user');
      const errorResponse = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      return addCorsHeaders(errorResponse);
    }
    
    // TODO: Add admin role check here
    // For now, allowing any authenticated user to update users
    
    const body = await request.json();
    const { name, username, phone, profilePicture } = body;
    
    if (!name && !username && !phone && !profilePicture) {
      const errorResponse = NextResponse.json(
        { error: 'At least one field to update is required' },
        { status: 400 }
      );
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

    // Validate MongoDB ObjectId format
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      console.log('Invalid user ID format:', userId);
      const errorResponse = NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      );
      return addCorsHeaders(errorResponse);
    }
    
    // Check if username is already taken by another user
    if (username) {
      console.log('Checking if username is available:', username);
      const existingUser = await User.findOne({
        username,
        _id: { $ne: userId }
      });
      if (existingUser) {
        console.log('Username already taken:', username);
        const errorResponse = NextResponse.json(
          { error: 'Username already taken' },
          { status: 400 }
        );
        return addCorsHeaders(errorResponse);
      }
    }
    
    // Build update object with only provided fields
    const updateData: any = {};
    if (name) updateData.name = name;
    if (username) updateData.username = username;
    if (phone) updateData.phone = phone;
    if (profilePicture !== undefined) updateData.profilePicture = profilePicture;
    
    console.log('Updating user with data:', updateData);
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    )
    .select('name email username phone profilePicture createdAt')
    .lean();
    
    if (!updatedUser) {
      console.log('User not found during update:', userId);
      const errorResponse = NextResponse.json({ error: 'User not found' }, { status: 404 });
      return addCorsHeaders(errorResponse);
    }
    
    console.log('User updated successfully:', userId);
    const successResponse = NextResponse.json({
      success: true,
      message: 'User updated successfully',
      user: updatedUser
    });
    return addCorsHeaders(successResponse);
    
  } catch (error) {
    console.error('Error updating user:', error);
    if (error instanceof Error) {
      const errorResponse = NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
      return addCorsHeaders(errorResponse);
    }
    const errorResponse = NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
    return addCorsHeaders(errorResponse);
  }
}

// Delete user by ID (admin only)
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');
    
    if (!userId) {
      const errorResponse = NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
      return addCorsHeaders(errorResponse);
    }
    
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.log('Unauthorized access attempt to delete user');
      const errorResponse = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      return addCorsHeaders(errorResponse);
    }
    
    // TODO: Add admin role check here
    // For now, allowing any authenticated user to delete users
    
    // Prevent self-deletion
    if (session.user.id === userId) {
      const errorResponse = NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
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

    // Validate MongoDB ObjectId format
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      console.log('Invalid user ID format:', userId);
      const errorResponse = NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      );
      return addCorsHeaders(errorResponse);
    }
    
    console.log('Attempting to delete user:', userId);
    
    const deletedUser = await User.findByIdAndDelete(userId);
    
    if (!deletedUser) {
      console.log('User not found for deletion:', userId);
      const errorResponse = NextResponse.json({ error: 'User not found' }, { status: 404 });
      return addCorsHeaders(errorResponse);
    }
    
    console.log('User deleted successfully:', userId);
    const successResponse = NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });
    return addCorsHeaders(successResponse);
    
  } catch (error) {
    console.error('Error deleting user:', error);
    if (error instanceof Error) {
      const errorResponse = NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
      return addCorsHeaders(errorResponse);
    }
    const errorResponse = NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
    return addCorsHeaders(errorResponse);
  }
}
