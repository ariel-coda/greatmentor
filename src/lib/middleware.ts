// src/middleware.ts
// Ce fichier se place à la RACINE de src/, pas dans app/

import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {

    // On prépare la réponse — le middleware peut la modifier avant
    // de l'envoyer au navigateur (ex: ajouter des cookies de session)
    let response = NextResponse.next({
        request: { headers: request.headers },
    })

    // On crée un client Supabase adapté au middleware
    // (différent du client navigateur et du client serveur)
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )
                    response = NextResponse.next({ request })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            }
        }
    )

    // On demande à Supabase : "est-ce qu'il y a un utilisateur connecté ?"
    // getUser() va lire le cookie de session automatiquement
    const { data: { user } } = await supabase.auth.getUser()

    const url = request.nextUrl.pathname  // ex: "/dashboard" ou "/login"

    // ── Règle 1 ──────────────────────────────────────────────
    // Si l'utilisateur N'EST PAS connecté et essaie d'accéder
    // à une page protégée → on le renvoie vers /login
    const isProtectedRoute = url.startsWith('/dashboard') ||
        url.startsWith('/games') ||
        url.startsWith('/coach') ||
        url.startsWith('/progress') ||
        url.startsWith('/settings')

    if (!user && isProtectedRoute) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // ── Règle 2 ──────────────────────────────────────────────
    // Si l'utilisateur EST connecté et essaie d'aller sur /login
    // ou /register → inutile, on le renvoie vers /dashboard
    const isAuthRoute = url.startsWith('/login') || url.startsWith('/register')

    if (user && isAuthRoute) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Dans tous les autres cas → on laisse passer normalement
    return response
}

// ── Config du middleware ──────────────────────────────────
// On dit à Next.js sur quelles URLs ce middleware doit s'exécuter
// Le "matcher" évite de le lancer sur les fichiers statiques
// (images, fonts, icônes...) ce qui ralentirait l'app inutilement
export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}