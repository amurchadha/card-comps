import type { Metadata } from 'next';
import Script from 'next/script';
import { ClerkProvider, SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import './globals.css';

export const metadata: Metadata = {
  title: 'Card Comps - Sports Card Sales Search',
  description: 'Search completed eBay sales for sports cards. Find accurate sold prices for basketball, football, baseball, and more.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-HYJNMKWK2X"
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-HYJNMKWK2X');
            `}
          </Script>
        </head>
        <body className="min-h-screen bg-gray-950 antialiased">
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
        </body>
      </html>
    </ClerkProvider>
  );
}
