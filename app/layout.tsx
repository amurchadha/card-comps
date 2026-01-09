import type { Metadata } from 'next';
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
    <html lang="en">
      <body className="min-h-screen bg-gray-950 antialiased">
        {children}
      </body>
    </html>
  );
}
