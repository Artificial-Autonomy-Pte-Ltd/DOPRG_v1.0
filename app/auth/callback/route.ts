import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')
  const next = searchParams.get('next') ?? '/'

  // Handle OAuth errors from provider
  if (error) {
    console.error('[v0] OAuth error:', error, errorDescription)
    const errorUrl = new URL('/auth/error', origin)
    errorUrl.searchParams.set('error', error)
    if (errorDescription) {
      errorUrl.searchParams.set('message', errorDescription)
    }
    return NextResponse.redirect(errorUrl.toString())
  }

  if (code) {
    const supabase = await createClient()
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!exchangeError) {
      // Successfully authenticated - redirect to the requested page
      return NextResponse.redirect(`${origin}${next}`)
    }
    
    console.error('[v0] Code exchange error:', exchangeError.message)
    const errorUrl = new URL('/auth/error', origin)
    errorUrl.searchParams.set('error', 'exchange_failed')
    errorUrl.searchParams.set('message', exchangeError.message)
    return NextResponse.redirect(errorUrl.toString())
  }

  // No code provided
  const errorUrl = new URL('/auth/error', origin)
  errorUrl.searchParams.set('error', 'no_code')
  errorUrl.searchParams.set('message', 'No authorization code was provided')
  return NextResponse.redirect(errorUrl.toString())
}
