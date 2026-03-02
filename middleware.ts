import { NextResponse, type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const isAuthenticated = request.cookies.get('skeepers_auth')?.value === 'true'
  const isLoginPage = request.nextUrl.pathname === '/auth/login'

  // Si non authentifié et pas sur la page de login, rediriger vers login
  if (!isAuthenticated && !isLoginPage) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Si authentifié et sur la page de login, rediriger vers l'accueil
  if (isAuthenticated && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/.*|data/.*|.*\\.(?:svg|png|jpg|jpeg|gif|webp|csv)$).*)',
  ],
}
