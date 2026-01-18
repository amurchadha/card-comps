'use client';

import { useState, useCallback, FormEvent, useMemo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useAuth } from '@clerk/nextjs';

const UserButton = dynamic(() => import('@clerk/nextjs').then(m => m.UserButton), { ssr: false });
const SignInButton = dynamic(() => import('@clerk/nextjs').then(m => m.SignInButton), { ssr: false });

interface SaleItem {
  itemId: string;
  title: string;
  currentPrice: string;
  currentPriceCurrency: string;
  salePrice: string;
  salePriceCurrency: string;
  BestOfferPrice: string;
  BestOfferPriceCurrency: string;
  bids: string;
  saleType: 'auction' | 'fixedprice' | 'bestoffer';
  galleryURL: string;
  endTime: string;
  shippingServiceCost: string;
}

type SortOption = 'date_desc' | 'date_asc' | 'price_desc' | 'price_asc';

export default function Home() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SaleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [sortOrder, setSortOrder] = useState<SortOption>('date_desc');
  const { isSignedIn } = useAuth();

  const parsePrice = (price: string | undefined | null): number => {
    if (!price) return 0;
    const cleaned = String(price).replace(/[^0-9.]/g, '');
    return parseFloat(cleaned) || 0;
  };

  const handleSearch = useCallback(async (e?: FormEvent) => {
    if (e) e.preventDefault();
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      setError('Please enter a search query');
      return;
    }
    if (trimmedQuery.split(/\s+/).length < 2) {
      setError('Search must contain at least 2 words (e.g., "Michael Jordan" not just "Jordan")');
      return;
    }

    setLoading(true);
    setError('');
    setHasSearched(true);

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ query: trimmedQuery, type: 'sold_items' }).toString(),
      });
      const data = await response.json();

      if (data.success && data.items) {
        const uniqueItems = Array.from(
          new Map(data.items.map((item: SaleItem) => [item.itemId, item])).values()
        ) as SaleItem[];

        uniqueItems.sort((a, b) => {
          const priceA = parsePrice(a.salePrice);
          const priceB = parsePrice(b.salePrice);
          const dateA = new Date(a.endTime).getTime();
          const dateB = new Date(b.endTime).getTime();

          switch (sortOrder) {
            case 'price_desc': return priceB - priceA;
            case 'price_asc': return priceA - priceB;
            case 'date_asc': return dateA - dateB;
            default: return dateB - dateA;
          }
        });

        setResults(uniqueItems);
        if (uniqueItems.length === 0) setError('No sold listings found');
      } else {
        setError(data.error || 'Search failed');
        setResults([]);
      }
    } catch {
      setError('Failed to connect to search service');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [query, sortOrder]);

  const stats = useMemo(() => {
    if (results.length === 0) return null;
    const prices = results.map(item => parsePrice(item.salePrice)).filter(p => p > 0);
    if (prices.length === 0) return null;
    const sorted = [...prices].sort((a, b) => a - b);
    const median = sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)];
    return {
      count: results.length,
      avg: prices.reduce((a, b) => a + b, 0) / prices.length,
      median,
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }, [results]);

  const formatPrice = (price: string | number) => {
    const num = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(num)) return String(price);
    return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const getSaleTypeLabel = (item: SaleItem) => {
    if (item.saleType === 'auction' && parseInt(item.bids) > 0) return { label: 'Auction', color: 'bg-orange-500' };
    if (item.saleType === 'bestoffer') return { label: 'Best Offer', color: 'bg-green-500' };
    return { label: 'BIN', color: 'bg-blue-500' };
  };

  const getDisplayPrice = (item: SaleItem) => {
    if (item.saleType === 'bestoffer' && item.BestOfferPrice !== '0.00') {
      return formatPrice(item.BestOfferPrice);
    }
    return formatPrice(item.salePrice);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Minimal Header */}
      <header className="bg-gray-900/50 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-xl font-bold text-white">Card Comps</Link>
            <div className="flex items-center gap-3">
              <Link href="/labs" className="text-sm text-gray-400 hover:text-white transition-colors">Labs</Link>
              {isSignedIn ? (
                <>
                  <Link href="/dashboard" className="text-sm text-gray-400 hover:text-white transition-colors">Dashboard</Link>
                  <UserButton afterSignOutUrl="/" />
                </>
              ) : (
                <SignInButton mode="modal">
                  <button className="px-4 py-1.5 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors">
                    Sign In
                  </button>
                </SignInButton>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Search Section */}
      <section className="bg-gradient-to-b from-gray-900 to-gray-950 py-12 md:py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            What&apos;s it worth?
          </h1>
          <p className="text-xl text-gray-400 mb-8">
            Search actual eBay sold prices including accepted Best Offers
          </p>

          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. Wembanyama Prizm Silver PSA 10"
                  className="w-full px-5 py-4 bg-gray-800 border border-gray-700 rounded-xl text-white text-lg placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-semibold rounded-xl transition-colors text-lg"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
            <div className="flex items-center justify-center gap-4 mt-4">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as SortOption)}
                className="px-3 py-1.5 bg-gray-800/50 border border-gray-700 rounded-lg text-sm text-gray-300 focus:outline-none"
              >
                <option value="date_desc">Newest First</option>
                <option value="date_asc">Oldest First</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="price_asc">Price: Low to High</option>
              </select>
              <span className="text-sm text-gray-500">Free • No signup required</span>
            </div>
          </form>

          {error && (
            <div className="mt-6 bg-red-900/30 border border-red-700 rounded-lg px-4 py-3 text-red-300 max-w-2xl mx-auto">
              {error}
            </div>
          )}
        </div>
      </section>

      {/* Stats Bar */}
      {stats && (
        <section className="bg-gray-900/50 border-y border-gray-800">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-white">{stats.count}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Results</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400">{formatPrice(stats.avg)}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Average</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-400">{formatPrice(stats.median)}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Median</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-300">{formatPrice(stats.min)}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Low</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-300">{formatPrice(stats.max)}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">High</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Results */}
      {hasSearched && (
        <section className="py-8 flex-1">
          <div className="max-w-7xl mx-auto px-4">
            {loading && (
              <div className="flex justify-center py-12">
                <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {!loading && results.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {results.map((item) => {
                  const saleType = getSaleTypeLabel(item);
                  const ebayUrl = `https://www.ebay.com/itm/${item.itemId}?mkcid=1&mkrid=711-53200-19255-0&siteid=0&campid=5339137501&toolid=10001&mkevt=1`;
                  return (
                    <a
                      key={item.itemId}
                      href={ebayUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden hover:border-gray-600 transition-colors group"
                    >
                      <div className="aspect-square bg-gray-800 relative overflow-hidden">
                        {item.galleryURL ? (
                          <img
                            src={item.galleryURL.replace('s-l225', 's-l500')}
                            alt={item.title}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-600">No Image</div>
                        )}
                        <div className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-semibold text-white ${saleType.color}`}>
                          {saleType.label}
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="text-white text-sm font-medium line-clamp-2 mb-2 group-hover:text-blue-400 transition-colors">
                          {item.title}
                        </h3>
                        <div className="flex items-baseline justify-between">
                          <span className="text-xl font-bold text-green-400">{getDisplayPrice(item)}</span>
                          <span className="text-xs text-gray-500">{formatDate(item.endTime)}</span>
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
            )}

            {!loading && hasSearched && results.length === 0 && !error && (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">📭</div>
                <h2 className="text-xl text-gray-400">No results found</h2>
                <p className="text-gray-600 mt-2">Try different search terms</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Landing Content - Only show when no search */}
      {!hasSearched && (
        <>
          {/* Value Props */}
          <section className="py-16 border-b border-gray-800">
            <div className="max-w-6xl mx-auto px-4">
              <div className="grid md:grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-4xl mb-4">💰</div>
                  <h3 className="text-xl font-semibold text-white mb-2">Real Sold Prices</h3>
                  <p className="text-gray-400">See what cards actually sold for, including accepted Best Offer amounts that others hide.</p>
                </div>
                <div>
                  <div className="text-4xl mb-4">📊</div>
                  <h3 className="text-xl font-semibold text-white mb-2">Price Analytics</h3>
                  <p className="text-gray-400">Average, median, and price ranges so you know if a deal is good before you buy.</p>
                </div>
                <div>
                  <div className="text-4xl mb-4">⚡</div>
                  <h3 className="text-xl font-semibold text-white mb-2">Always Free</h3>
                  <p className="text-gray-400">No paywalls for price searches. Ever. Sign up only if you want the extra tools.</p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20 bg-gradient-to-b from-gray-950 to-blue-950/30">
            <div className="max-w-4xl mx-auto px-4 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Serious about collecting?
              </h2>
              <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
                Track your inventory, calculate profits with platform fees, build rainbows, and set goals for your grails.
              </p>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5 text-left">
                  <div className="text-2xl mb-2">📦</div>
                  <h4 className="font-semibold text-white mb-1">Inventory Tracker</h4>
                  <p className="text-sm text-gray-500">Track every card with purchase price, grade, and cost basis</p>
                </div>
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5 text-left">
                  <div className="text-2xl mb-2">💵</div>
                  <h4 className="font-semibold text-white mb-1">Profit Calculator</h4>
                  <p className="text-sm text-gray-500">Auto-calculate fees for eBay, Whatnot, COMC, and more</p>
                </div>
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5 text-left">
                  <div className="text-2xl mb-2">🌈</div>
                  <h4 className="font-semibold text-white mb-1">Rainbow Builder</h4>
                  <p className="text-sm text-gray-500">Track parallel collections from base to superfractor</p>
                </div>
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5 text-left">
                  <div className="text-2xl mb-2">🎯</div>
                  <h4 className="font-semibold text-white mb-1">Grail Goals</h4>
                  <p className="text-sm text-gray-500">Set savings targets for your dream cards</p>
                </div>
              </div>

              <SignInButton mode="modal">
                <button className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors text-lg">
                  Get Started Free
                </button>
              </SignInButton>
              <p className="text-gray-600 text-sm mt-4">No credit card required</p>
            </div>
          </section>

          {/* Labs Teaser */}
          <section className="py-16 border-t border-gray-800">
            <div className="max-w-4xl mx-auto px-4 text-center">
              <div className="inline-flex items-center px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-400 text-sm font-medium mb-4">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                Labs
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Experimental Tools</h2>
              <p className="text-gray-400 mb-6">Free utilities for collectors. No signup required.</p>
              <Link
                href="/labs"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Explore Labs
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </section>
        </>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-blue-900/20 border border-blue-800/30 rounded-lg p-4 mb-6 text-sm">
            <p className="text-gray-400">
              <span className="text-white font-medium">Affiliate Disclosure:</span> Card Comps participates in the eBay Partner Network. We may earn a commission when you click links to eBay.
            </p>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} Noshu LLC</p>
            <div className="flex gap-6">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
              <Link href="/labs" className="hover:text-white transition-colors">Labs</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
