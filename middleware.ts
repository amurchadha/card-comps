import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple middleware that passes through all requests
// Auth is handled by API routes and client-side Clerk
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
  ],
};
