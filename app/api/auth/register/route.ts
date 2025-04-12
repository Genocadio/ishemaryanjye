import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/user';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    console.log('Starting registration process...');
    
    // Attempt to connect to MongoDB
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
    
    const { name, email, password, username, phone } = await request.json();
    console.log('Received registration data:', { name, email, username, phone });

    // Validate required fields
    if (!name || !email || !password || !username || !phone) {
      console.log('Missing required fields:', { name, email, username, phone });
      return NextResponse.json(
        { error: 'All fields (name, email, password, username, phone) are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    console.log('Checking for existing user with email:', email);
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists with email:', email);
      return NextResponse.json(
        { error: 'User already exists' },
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

    const userData = {
      name,
      email,
      password: password,
      username,
      phone
    };

    // Create new user
    console.log('Creating new user...');
    try {
      const user = new User(userData);
      await user.save();
      console.log('User created successfully:', user._id);
    } catch (saveError) {
      console.error('Error saving user:', saveError);
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      );
    }

    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = user.toObject();
    
    return NextResponse.json(
      { 
        message: 'User registered successfully',
        user: userWithoutPassword 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    // Return more specific error messages
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    );
  }
} 