import { NextResponse } from 'next/server'

const VALID_PASSWORD = process.env.APP_PASSWORD || 'skeepers2024'

export async function POST(request: Request) {
  try {
    const { password } = await request.json()

    if (password !== VALID_PASSWORD) {
      return NextResponse.json(
        { error: 'Mot de passe incorrect.' },
        { status: 401 }
      )
    }

    const response = NextResponse.json({ success: true })
    
    // Définir un cookie d'authentification
    response.cookies.set('skeepers_auth', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 jours
      path: '/',
    })

    return response
  } catch {
    return NextResponse.json(
      { error: 'Une erreur est survenue.' },
      { status: 500 }
    )
  }
}
