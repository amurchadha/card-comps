'use client';

import { useState, useCallback, FormEvent, useMemo } from 'react';

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
  source: string;
}

interface LiveListing {
  itemId: string;
  title: string;
  currentPrice: string;
  currentPriceCurrency: string;
  galleryURL: string;
  ebayUrl: string;
}

interface SearchResult {
  success: boolean;
  items?: SaleItem[];
  error?: string;
}

type SortOption = 'date_desc' | 'date_asc' | 'price_desc' | 'price_asc';

export default function Home() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SaleItem[]>([]);
  const [liveListings, setLiveListings] = useState<LiveListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [sortOrder, setSortOrder] = useState<SortOption>('date_desc');

  // Parse price safely
  const parsePrice = (price: string | undefined | null): number => {
    if (!price) return 0;
    const cleaned = String(price).replace(/[^0-9.]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
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
      // Fetch sold items
      const soldResponse = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ query: trimmedQuery, type: 'sold_items' }).toString(),
      });

      const soldData: SearchResult = await soldResponse.json();

      // Process sold items
      if (soldData.success && soldData.items) {
        const uniqueItems = Array.from(
          new Map(soldData.items.map(item => [item.itemId, item])).values()
        );

        uniqueItems.sort((a, b) => {
          const priceA = parsePrice(a.salePrice);
          const priceB = parsePrice(b.salePrice);
          const dateA = new Date(a.endTime).getTime();
          const dateB = new Date(b.endTime).getTime();

          switch (sortOrder) {
            case 'price_desc':
              return priceB - priceA;
            case 'price_asc':
              return priceA - priceB;
            case 'date_asc':
              return dateA - dateB;
            case 'date_desc':
            default:
              return dateB - dateA;
          }
        });

        setResults(uniqueItems);
        if (uniqueItems.length === 0) {
          setError('No sold listings found');
        }
      } else {
        setError(soldData.error || 'Search failed');
        setResults([]);
      }

      // Fetch real live listings from eBay API
      try {
        const ebayResponse = await fetch('/api/ebay-live', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ query: trimmedQuery }).toString(),
        });
        const ebayData = await ebayResponse.json();
        if (ebayData.success && ebayData.items) {
          setLiveListings(ebayData.items);
        } else {
          setLiveListings([]);
        }
      } catch {
        setLiveListings([]);
      }
    } catch {
      setError('Failed to connect to search service');
      setResults([]);
      setLiveListings([]);
    } finally {
      setLoading(false);
    }
  }, [query, sortOrder]);

  // Calculate price distribution
  const priceDistribution = useMemo(() => {
    if (results.length === 0) return null;

    const prices = results.map(item => parsePrice(item.salePrice)).filter(p => p > 0).sort((a, b) => a - b);
    if (prices.length === 0) return null;

    const median = prices.length % 2 === 0
      ? (prices[prices.length / 2 - 1] + prices[prices.length / 2]) / 2
      : prices[Math.floor(prices.length / 2)];

    // Price ranges for histogram
    const min = prices[0];
    const max = prices[prices.length - 1];
    const range = max - min;
    const bucketSize = range / 5 || 1;

    const buckets = Array(5).fill(0);
    prices.forEach(p => {
      const idx = Math.min(Math.floor((p - min) / bucketSize), 4);
      buckets[idx]++;
    });
    const maxBucket = Math.max(...buckets);

    return { median, min, max, buckets, bucketSize, maxBucket };
  }, [results]);

  // Calculate overall stats
  const stats = useMemo(() => {
    if (results.length === 0) return null;

    const prices = results.map(item => parsePrice(item.salePrice)).filter(p => p > 0);
    if (prices.length === 0) return null;

    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;

    return {
      count: results.length,
      avg,
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }, [results]);

  const formatPrice = (price: string | number, currency?: string) => {
    const num = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(num)) return String(price);

    if (!currency || currency === 'USD') {
      return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const getSaleTypeLabel = (item: SaleItem) => {
    if (item.saleType === 'auction') {
      if (parseInt(item.bids) === 0) {
        return { label: 'BIN', color: 'bg-blue-500' };
      }
      return { label: 'Auction', color: 'bg-orange-500' };
    }
    if (item.saleType === 'bestoffer') {
      return { label: 'Best Offer', color: 'bg-green-500' };
    }
    return { label: 'Buy It Now', color: 'bg-blue-500' };
  };

  const getDisplayPrice = (item: SaleItem) => {
    if (item.saleType === 'bestoffer' && item.BestOfferPrice !== '0.00') {
      return formatPrice(item.BestOfferPrice, item.BestOfferPriceCurrency);
    }
    return formatPrice(item.salePrice, item.salePriceCurrency);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-white">Card Comps</h1>
          <p className="text-gray-400 mt-1">Search eBay sports card sales and listings</p>
        </div>
      </header>

      {/* Search Section */}
      <section className="bg-gray-900/50 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search sold cards (e.g., Michael Jordan Fleer rookie)"
                  className="w-full px-4 py-3 pr-10 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                    aria-label="Clear search"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as SortOption)}
                  className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="date_desc">Newest First</option>
                  <option value="date_asc">Oldest First</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="price_asc">Price: Low to High</option>
                </select>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Searching
                    </span>
                  ) : (
                    'Search'
                  )}
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              Find actual sold prices including accepted Best Offers
            </p>
          </form>
        </div>
      </section>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="bg-red-900/50 border border-red-700 rounded-lg px-4 py-3 text-red-300">
            {error}
          </div>
        </div>
      )}

      {/* Live Listings */}
      {!loading && liveListings.length > 0 && (
        <section className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Available Now on eBay
                </h2>
                <p className="text-gray-400 text-sm mt-1">Live listings you can buy right now</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {liveListings.map((item) => (
                <a
                  key={item.itemId}
                  href={item.ebayUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-900/80 border border-green-800/50 rounded-lg overflow-hidden hover:border-green-600 transition-colors group"
                >
                  <div className="aspect-square bg-gray-800 relative overflow-hidden">
                    {item.galleryURL ? (
                      <img
                        src={item.galleryURL}
                        alt={item.title}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600">
                        No Image
                      </div>
                    )}
                    <div className="absolute top-2 left-2 px-2 py-1 rounded text-xs font-semibold bg-green-600 text-white">
                      BUY NOW
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="text-white text-xs font-medium line-clamp-2 mb-2 group-hover:text-green-400 transition-colors">
                      {item.title}
                    </h3>
                    <span className="text-lg font-bold text-green-400">
                      {formatPrice(item.currentPrice, item.currentPriceCurrency)}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Price Stats */}
      {stats && priceDistribution && (
        <section className="bg-gray-900/30 border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <h2 className="text-lg font-semibold text-white mb-4">Price Analysis</h2>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="text-gray-400 text-sm">Results</div>
                <div className="text-2xl font-bold text-white">{stats.count}</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="text-gray-400 text-sm">Average</div>
                <div className="text-2xl font-bold text-green-400">{formatPrice(stats.avg)}</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="text-gray-400 text-sm">Median</div>
                <div className="text-2xl font-bold text-blue-400">{formatPrice(priceDistribution.median)}</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="text-gray-400 text-sm">Range</div>
                <div className="text-lg font-bold text-white">{formatPrice(stats.min)} - {formatPrice(stats.max)}</div>
              </div>
            </div>

            {/* Price Distribution */}
            <div className="text-gray-400 text-sm mb-2">Price Distribution</div>
            <div className="flex items-end gap-1 h-16">
              {priceDistribution.buckets.map((count, idx) => {
                const height = priceDistribution.maxBucket > 0 ? (count / priceDistribution.maxBucket) * 100 : 0;
                const rangeStart = priceDistribution.min + (idx * priceDistribution.bucketSize);
                const rangeEnd = rangeStart + priceDistribution.bucketSize;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-green-500/70 rounded-t transition-all"
                      style={{ height: `${Math.max(height, 4)}%` }}
                      title={`${formatPrice(rangeStart)} - ${formatPrice(rangeEnd)}: ${count} sales`}
                    />
                    <span className="text-xs text-gray-500">{formatPrice(rangeStart)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Results */}
      <main className="max-w-7xl mx-auto px-4 py-8 flex-1">
        {loading && (
          <div className="flex justify-center py-12">
            <svg className="w-12 h-12 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        )}

        {!loading && !hasSearched && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-xl text-gray-400">Search completed sales above</h2>
            <p className="text-gray-600 mt-2">Find accurate sold prices including Best Offer amounts</p>
          </div>
        )}

        {!loading && hasSearched && results.length === 0 && !error && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-xl text-gray-400">No results found</h2>
            <p className="text-gray-600 mt-2">Try adjusting your search terms</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {results.map((item) => {
              const saleType = getSaleTypeLabel(item);
              const saleDate = new Date(item.endTime);
              const daysSinceSale = Math.floor((Date.now() - saleDate.getTime()) / (1000 * 60 * 60 * 24));
              const isOldListing = daysSinceSale > 14;
              // eBay Partner Network affiliate link
              const ebayUrl = `https://www.ebay.com/itm/${item.itemId}?mkcid=1&mkrid=711-53200-19255-0&siteid=0&campid=5339137501&toolid=10001&mkevt=1`;
              return (
                <a
                  key={item.itemId}
                  href={ebayUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden hover:border-gray-700 transition-colors group"
                >
                  <div className="aspect-square bg-gray-800 relative overflow-hidden">
                    {item.galleryURL ? (
                      <img
                        src={item.galleryURL.replace('s-l225', 's-l500')}
                        alt={item.title}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23333" width="100" height="100"/><text x="50" y="50" text-anchor="middle" dy=".3em" fill="%23666" font-size="14">No Image</text></svg>';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600">
                        No Image
                      </div>
                    )}
                    <div className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-semibold text-white ${saleType.color}`}>
                      {saleType.label}
                    </div>
                                        {isOldListing && (
                      <div className="absolute top-2 right-2 px-2 py-1 rounded text-xs font-semibold bg-yellow-600 text-white" title="Listing may redirect to similar items">
                        14+ days
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="text-white text-sm font-medium line-clamp-2 mb-2 group-hover:text-blue-400 transition-colors">
                      {item.title}
                    </h3>
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-xl font-bold text-green-400">
                          {getDisplayPrice(item)}
                        </span>
                        {item.saleType === 'bestoffer' && item.BestOfferPrice !== '0.00' && (
                          <span className="ml-2 text-sm text-gray-500 line-through">
                            {formatPrice(item.currentPrice, item.currentPriceCurrency)}
                          </span>
                        )}
                      </div>
                      {item.saleType === 'auction' && parseInt(item.bids) > 0 && (
                        <span className="text-sm text-orange-400 font-medium">
                          {item.bids} bid{parseInt(item.bids) !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Sold {formatDate(item.endTime)}
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Affiliate Disclosure */}
          <div className="bg-blue-900/30 border border-blue-800/50 rounded-lg p-4 mb-8">
            <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Affiliate Disclosure
            </h3>
            <p className="text-gray-300 text-sm">
              Card Comps is a participant in the <strong>eBay Partner Network</strong>, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to eBay.com. When you click on links to eBay listings on this site and make a purchase, we may earn a commission at no additional cost to you.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-white font-semibold mb-3">Card Comps</h3>
              <p className="text-gray-400 text-sm">
                Search completed eBay sales for sports cards and collectibles.
                See actual sold prices including accepted Best Offer amounts.
                Find live listings to purchase through our affiliate links.
              </p>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-3">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
                </li>
                <li>
                  <a href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a>
                </li>
                <li>
                  <a href="/affiliate-disclosure" className="text-gray-400 hover:text-white transition-colors">Affiliate Disclosure</a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-3">Company</h3>
              <p className="text-gray-400 text-sm">
                A product of Noshu LLC
              </p>
              <p className="text-gray-500 text-xs mt-2">
                Atlanta, GA
              </p>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-6 text-center">
            <p className="text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} Noshu LLC. All rights reserved.
            </p>
            <p className="text-gray-600 text-xs mt-2">
              As an eBay Partner, we earn from qualifying purchases. Card images and data are property of their respective owners.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
