import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/user';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    await connectDB();
    
    const { name, email, password, username, phone } = await request.json();

    // Validate required fields
    if (!name || !email || !password || !username || !phone) {
      return NextResponse.json(
        { error: 'All fields (name, email, password, username, phone) are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Check if username is already taken
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
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
    const user = new User(userData);
    await user.save();

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