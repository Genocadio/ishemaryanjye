import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/user';

// Get all users or get user by ID
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');
    
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.log('Unauthorized access attempt to users endpoint');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log('Attempting to connect to MongoDB...');
    try {
      await connectDB();
      console.log('Successfully connected to MongoDB');
    } catch (dbError) {
      console.error('MongoDB connection error:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed. Please try again later.' },
        { status: 503 }
      );
    }

    // If userId is provided, get specific user
    if (userId) {
      console.log('Fetching user by ID:', userId);
      
      // Validate MongoDB ObjectId format
      if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
        console.log('Invalid user ID format:', userId);
        return NextResponse.json(
          { error: 'Invalid user ID format' },
          { status: 400 }
        );
      }
      
      const user = await User.findById(userId)
        .select('name email username phone profilePicture createdAt')
        .lean();
      
      if (!user) {
        console.log('User not found with ID:', userId);
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      
      console.log('User fetched successfully:', userId);
      return NextResponse.json({
        success: true,
        user
      });
    }

    // If no userId, get all users
    console.log('Fetching all users...');
    const users = await User.find({})
      .select('name email username phone profilePicture createdAt')
      .sort({ createdAt: -1 }) // Sort by newest first
      .lean();
    
    console.log(`Found ${users.length} users`);
    return NextResponse.json({
      success: true,
      users,
      count: users.length
    });
    
  } catch (error) {
    console.error('Error in users endpoint:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// Create new user (admin only)
export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.log('Unauthorized access attempt to create user');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // TODO: Add admin role check here
    // For now, allowing any authenticated user to create users
    
    const { name, email, password, username, phone } = await request.json();
    console.log('Received user creation data:', { name, email, username, phone });

    // Validate required fields
    if (!name || !email || !password || !username || !phone) {
      console.log('Missing required fields for user creation');
      return NextResponse.json(
        { error: 'All fields (name, email, password, username, phone) are required' },
        { status: 400 }
      );
    }

    console.log('Attempting to connect to MongoDB...');
    try {
      await connectDB();
      console.log('Successfully connected to MongoDB');
    } catch (dbError) {
      console.error('MongoDB connection error:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed. Please try again later.' },
        { status: 503 }
      );
    }

    // Check if user already exists
    console.log('Checking for existing user with email:', email);
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists with email:', email);
      return NextResponse.json(
        { error: 'User already exists with this email' },
        { status: 400 }
      );
    }

    // Check if username is already taken
    console.log('Checking for existing username:', username);
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      console.log('Username already taken:', username);
      return NextResponse.json(
        { error: 'Username already taken' },
        { status: 400 }
      );
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
    
    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      user: userWithoutPassword
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating user:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

// Update user by ID (admin only)
export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.log('Unauthorized access attempt to update user');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // TODO: Add admin role check here
    // For now, allowing any authenticated user to update users
    
    const body = await request.json();
    const { name, username, phone, profilePicture } = body;
    
    if (!name && !username && !phone && !profilePicture) {
      return NextResponse.json(
        { error: 'At least one field to update is required' },
        { status: 400 }
      );
    }
    
    console.log('Attempting to connect to MongoDB...');
    try {
      await connectDB();
      console.log('Successfully connected to MongoDB');
    } catch (dbError) {
      console.error('MongoDB connection error:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed. Please try again later.' },
        { status: 503 }
      );
    }

    // Validate MongoDB ObjectId format
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      console.log('Invalid user ID format:', userId);
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      );
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
        return NextResponse.json(
          { error: 'Username already taken' },
          { status: 400 }
        );
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
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    console.log('User updated successfully:', userId);
    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      user: updatedUser
    });
    
  } catch (error) {
    console.error('Error updating user:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// Delete user by ID (admin only)
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.log('Unauthorized access attempt to delete user');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // TODO: Add admin role check here
    // For now, allowing any authenticated user to delete users
    
    // Prevent self-deletion
    if (session.user.id === userId) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }
    
    console.log('Attempting to connect to MongoDB...');
    try {
      await connectDB();
      console.log('Successfully connected to MongoDB');
    } catch (dbError) {
      console.error('MongoDB connection error:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed. Please try again later.' },
        { status: 503 }
      );
    }

    // Validate MongoDB ObjectId format
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      console.log('Invalid user ID format:', userId);
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      );
    }
    
    console.log('Attempting to delete user:', userId);
    
    const deletedUser = await User.findByIdAndDelete(userId);
    
    if (!deletedUser) {
      console.log('User not found for deletion:', userId);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    console.log('User deleted successfully:', userId);
    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting user:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
