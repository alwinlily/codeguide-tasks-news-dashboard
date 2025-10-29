import { NextRequest, NextResponse } from 'next/server';
import { googleTasksClient } from '@/lib/google-tasks';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const redirectUrl = searchParams.get('redirect') || '/admin';

    // Generate authorization URL with redirect URL as state
    const authUrl = googleTasksClient.getAuthUrl(redirectUrl);

    return NextResponse.json({ authUrl });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate auth URL' },
      { status: 500 }
    );
  }
}