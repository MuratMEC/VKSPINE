import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData, defaultSession } from '@/lib/session';

export async function middleware(request: NextRequest) {
    const res = NextResponse.next();

    // Middleware içinde getSession() doğrudan çalışmaz çünkü Next.js request.cookies bekliyor.
    // Bu nedenle getIronSession'ı manuel çağırıyoruz:
    const session = await getIronSession<SessionData>(request, res, sessionOptions);

    if (!session.isLoggedIn) {
        session.isLoggedIn = defaultSession.isLoggedIn;
        session.username = defaultSession.username;
    }

    const { pathname } = request.nextUrl;

    // Sadece yetkili sayfalar için kontrol et (Login, API vb. dışındaki tüm sayfalar)
    const isPublicPath = pathname === '/login' || pathname.startsWith('/_next') || pathname.startsWith('/favicon');

    if (!isPublicPath && !session.isLoggedIn) {
        // Giriş yapılmamışsa login sayfasına at
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        return NextResponse.redirect(url);
    }

    if (pathname === '/login' && session.isLoggedIn) {
        // Zaten giriş yapmışsa login sayfasından ana sayfaya yolla
        const url = request.nextUrl.clone();
        url.pathname = '/';
        return NextResponse.redirect(url);
    }

    return res;
}

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
