'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle } from 'lucide-react'
import Link from 'next/link'

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const message = searchParams.get('message')

  // Check if this might be a successful auth that just needs a page refresh
  // This can happen when OAuth completes in a new window
  const isLikelySuccess = error === 'exchange_failed' && message?.includes('code')

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md bg-card border-border">
        <CardHeader className="text-center">
          <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${
            isLikelySuccess ? 'bg-green-500/10' : 'bg-destructive/10'
          }`}>
            {isLikelySuccess ? (
              <CheckCircle className="h-6 w-6 text-green-500" />
            ) : (
              <AlertCircle className="h-6 w-6 text-destructive" />
            )}
          </div>
          <CardTitle className="text-xl text-foreground">
            {isLikelySuccess ? 'Almost Done!' : 'Authentication Error'}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {isLikelySuccess 
              ? 'Your sign-in may have completed. Click below to continue and check your sign-in status.'
              : 'There was a problem signing you in. Please try again.'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {error && !isLikelySuccess && (
            <div className="rounded-md bg-secondary p-3 text-sm">
              <p className="font-medium text-foreground">Error: {error}</p>
              {message && (
                <p className="mt-1 text-muted-foreground text-xs">{message}</p>
              )}
            </div>
          )}
          <Button asChild className="w-full">
            <Link href="/">
              {isLikelySuccess ? 'Continue to App' : 'Return to Home'}
            </Link>
          </Button>
          {!isLikelySuccess && (
            <p className="text-center text-xs text-muted-foreground">
              If you were signing in from an embedded page, try signing in directly on the main site.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  )
}
