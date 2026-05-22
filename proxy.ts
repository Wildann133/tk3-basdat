import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const session = request.cookies.get('tiktaktuk_session');
  const { pathname } = request.nextUrl;

  // 1. path publik yang bisa diakses tanpa login
  const isPublicPath = 
    pathname === '/' ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/promotions') ||
    pathname.startsWith('/ticket-category');

  // 2. Jika user BELUM login dan mencoba akses path terproteksi
  if (!session && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 3. (Opsional) Jika user SUDAH login dan mencoba akses login/register
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};