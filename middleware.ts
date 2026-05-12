import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const session = request.cookies.get('tiktaktuk_session');
  const { pathname } = request.nextUrl;

  // Define public paths that can be accessed without logging in
  const isPublicPath = 
    pathname === '/' ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/promotions');

  // If the user is NOT logged in and tries to access a protected path
  if (!session && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If the user IS logged in and tries to access login/register, 
  // we could redirect them to dashboard, but keeping it simple for now as per request.

  return NextResponse.next();
}

// Match all paths except static files and API routes
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
