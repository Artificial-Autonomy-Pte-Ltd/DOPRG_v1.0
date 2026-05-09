import { SignIn } from '@clerk/nextjs';
import Link from 'next/link';
import { Activity } from 'lucide-react';
import { clerkAppearance } from '@/lib/clerk-appearance';

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border bg-[#161A1E]">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex flex-col gap-1">
            <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground">
              <Activity className="h-5 w-5 text-primary" />
              Derivatives - Options
            </h1>
            <p className="text-xs text-muted-foreground">Price + Risk-Greeks</p>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-10">
        <SignIn
          appearance={clerkAppearance}
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          fallbackRedirectUrl="/"
        />
        <p className="mt-6 text-center text-sm text-muted-foreground">
          No account?{' '}
          <Link href="/sign-up" className="font-medium text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </main>

      <footer className="border-t border-border bg-[#161A1E] py-4 text-center text-xs text-muted-foreground">
        <p>
          Option prices calculated using Black-Scholes model. Market data via Yahoo Finance.
        </p>
      </footer>
    </div>
  );
}
