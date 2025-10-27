import { NextRequest, NextResponse } from 'next/server';
import { googleTasksClient } from '@/lib/google-tasks';
import { createSupabaseServerClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // This contains the user ID
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

    if (!state) {
      return NextResponse.redirect(
        new URL('/?google_auth_error=no_state', request.url)
      );
    }

    // Exchange code for tokens
    const tokens = await googleTasksClient.exchangeCodeForTokens(code);

    // Store tokens in database for the user
    const supabase = await createSupabaseServerClient();

    const { error: dbError } = await supabase
      .from('user_google_tokens')
      .upsert({
        user_id: state,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expiry_date: tokens.expiry_date,
        updated_at: new Date().toISOString(),
      });

    if (dbError) {
      console.error('Error storing Google tokens:', dbError);
      return NextResponse.redirect(
        new URL('/?google_auth_error=storage_failed', request.url)
      );
    }

    // Redirect back to the main page with success message
    return NextResponse.redirect(
      new URL('/?google_auth=success', request.url)
    );

  } catch (error) {
    console.error('Error in Google auth callback:', error);
    return NextResponse.redirect(
      new URL('/?google_auth_error=callback_failed', request.url)
    );
  }
}