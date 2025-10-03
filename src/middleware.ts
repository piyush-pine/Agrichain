import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedPaths = ['/admin', '/buyer', '/farmer', '/logistics'];

function getCookie(request: NextRequest, name: string): string | undefined {
  const cookie = request.cookies.get(name);
  return cookie?.value;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));

  if (isProtected) {
    // We are not using firebase-admin here to avoid edge runtime issues.
    // Auth is handled on the client-side by firebase-js-sdk, and we can
    // assume that if the firebaseIdToken cookie is present, the user is authenticated.
    const token = getCookie(request, 'firebaseIdToken');

    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Role-based redirection logic
    const role = getCookie(request, 'userRole');
    if (role) {
      const rolePath = `/${role}`;
      if (!pathname.startsWith(rolePath)) {
        return NextResponse.redirect(new URL(`${rolePath}/dashboard`, request.url));
      }
    } else {
        // If role is not in cookie, redirect to login to be safe
        const url = new URL('/login', request.url);
        url.searchParams.set('error', 'session-expired');
        const response = NextResponse.redirect(url);
        response.cookies.delete('firebaseIdToken');
        response.cookies.delete('userRole');
        return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
