import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/user';

export async function GET() {
  try {
    console.log('Starting profile fetch...');
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.log('Unauthorized access attempt');
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

    console.log('Fetching user profile for ID:', session.user.id);
    const user = await User.findById(session.user.id)
      .select('name email username phone profilePicture createdAt')
      .lean();
    
    if (!user) {
      console.log('User not found with ID:', session.user.id);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('Profile fetched successfully for user:', session.user.id);
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    console.log('Starting profile update...');
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.log('Unauthorized update attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, username, phone, profilePicture } = body;
    console.log('Received update data for user:', session.user.id);

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

    // Check if username is already taken by another user
    if (username) {
      console.log('Checking if username is available:', username);
      const existingUser = await User.findOne({
        username,
        _id: { $ne: session.user.id }
      });
      if (existingUser) {
        console.log('Username already taken:', username);
        return NextResponse.json(
          { error: 'Username already taken' },
          { status: 400 }
        );
      }
    }

    // Update the user with the new data
    const updateData = {
      name,
      username,
      phone,
      ...(profilePicture && { profilePicture })
    };

    console.log('Updating user with data:', updateData);

    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
    .select('name email username phone profilePicture createdAt')
    .lean();

    if (!updatedUser) {
      console.log('User not found during update:', session.user.id);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('Profile updated successfully for user:', session.user.id);
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating profile:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
} 