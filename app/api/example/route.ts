import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

// Define a simple schema
const ExampleSchema = new mongoose.Schema({
  name: String,
  createdAt: { type: Date, default: Date.now }
});

// Create the model if it doesn't exist
const Example = mongoose.models.Example || mongoose.model('Example', ExampleSchema);

export async function GET() {
  try {
    await connectDB();
    
    const examples = await Example.find({});
    return NextResponse.json({ examples });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const example = await Example.create(body);
    
    return NextResponse.json({ example });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create data' }, { status: 500 });
  }
} 