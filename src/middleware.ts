import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware function is currently empty and does nothing.
// It's here as a placeholder for any future middleware logic you might want to add.
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  // This matcher ensures the middleware runs on all paths except for
  // API routes, Next.js static files, and image optimization files.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
