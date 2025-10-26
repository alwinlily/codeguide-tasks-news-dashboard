// Authentication middleware temporarily disabled
// This middleware allows all routes to be accessible without authentication
// Re-enable Clerk authentication when Supabase tables are set up

import { NextRequest, NextResponse } from 'next/server';

export default function middleware(request: NextRequest) {
  // Allow all requests to pass through without authentication
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};