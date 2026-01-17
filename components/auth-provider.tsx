'use client';

import { ClerkProvider, SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Only render Clerk components on client side
  if (typeof window === 'undefined') {
    return <>{children}</>;
  }

  return (
    <ClerkProvider>
      {/* Auth UI in top-right corner */}
      <div className="fixed top-4 right-4 z-50">
        <SignedOut>
          <SignInButton mode="modal">
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
              Sign In
            </button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <UserButton
            appearance={{
              elements: {
                avatarBox: 'w-10 h-10'
              }
            }}
          />
        </SignedIn>
      </div>
      {children}
    </ClerkProvider>
  );
}
