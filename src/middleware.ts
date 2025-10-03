import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : null;

if (serviceAccount && !getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

const protectedPaths = ['/admin', '/buyer', '/farmer', '/logistics'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('firebaseIdToken')?.value;

  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));

  if (isProtected) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      if (!serviceAccount) throw new Error('Firebase Admin SDK not initialized');
      const decodedToken = await getAuth().verifyIdToken(token);
      const role = decodedToken.role as string;
      const rolePath = `/${role}`;

      if (!pathname.startsWith(rolePath)) {
        return NextResponse.redirect(new URL(`${rolePath}/dashboard`, request.url));
      }
    } catch (error) {
      console.error('Middleware auth error:', error);
      const url = new URL('/login', request.url);
      url.searchParams.set('error', 'session-expired');
      const response = NextResponse.redirect(url);
      response.cookies.delete('firebaseIdToken');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
