import { NextRequest, NextResponse } from 'next/server';
import { googleTasksClient } from '@/lib/google-tasks';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // This contains the redirect URL
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect(
        new URL('/?google_auth_error=' + encodeURIComponent(error), request.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/?google_auth_error=no_code', request.url)
      );
    }

    // Exchange code for tokens
    const tokens = await googleTasksClient.exchangeCodeForTokens(code);

    // Store tokens securely in cookies
    const response = NextResponse.redirect(
      new URL(state || '/', request.url)
    );

    // Set secure HTTP-only cookies for the tokens
    response.cookies.set('google_access_token', tokens.access_token || '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600 // 1 hour
    });

    if (tokens.refresh_token) {
      response.cookies.set('google_refresh_token', tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30 // 30 days
      });
    }

    return response;

  } catch (error) {
    console.error('Error in Google auth callback:', error);
    return NextResponse.redirect(
      new URL('/?google_auth_error=callback_failed', request.url)
    );
  }
}