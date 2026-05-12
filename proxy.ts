import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js 16+ Proxy 
 * Menggantikan konvensi middleware lama.
 */
export function proxy(request: NextRequest) {
  const session = request.cookies.get('tiktaktuk_session');
  const { pathname } = request.nextUrl;

  // 1. Tentukan path publik yang bisa diakses tanpa login
  const isPublicPath = 
    pathname === '/' ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/promotions');

  // 2. Jika user BELUM login dan mencoba akses path terproteksi
  if (!session && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 3. (Opsional) Jika user SUDAH login dan mencoba akses login/register, 
  // kita biarkan saja sesuai permintaanmu agar tetap simpel.

  return NextResponse.next();
}

/**
 * Konfigurasi matcher untuk menentukan rute mana saja 
 * yang akan diproses oleh fungsi proxy di atas.
 */
export const config = {
  matcher: [
    /*
     * Match semua path kecuali:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};