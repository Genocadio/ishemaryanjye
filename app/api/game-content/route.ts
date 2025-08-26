import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Build query string from search params
    const queryString = searchParams.toString();
    const backendUrl = `https://admin.hporwanda.org/api/game-content/${queryString ? `?${queryString}` : ''}`;
    
    console.log('Fetching from backend:', backendUrl);
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Backend response not ok:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'Failed to fetch content from backend' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Successfully fetched content, count:', data.count);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching game content:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
