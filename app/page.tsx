'use client';

import { useState, useCallback, FormEvent } from 'react';

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

interface SearchResult {
  success: boolean;
  items?: SaleItem[];
  error?: string;
}

type SortOption = 'date_desc' | 'date_asc' | 'price_desc' | 'price_asc';

export default function Home() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SaleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [sortOrder, setSortOrder] = useState<SortOption>('date_desc');

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
      const params = new URLSearchParams({
        query: trimmedQuery,
        sort: sortOrder,
        tab_id: '1',
        type: 'sold_items',
        mp: 'ebay',
      });

      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      const data: SearchResult = await response.json();

      if (data.success && data.items) {
        // Remove duplicates by itemId
        const uniqueItems = Array.from(
          new Map(data.items.map(item => [item.itemId, item])).values()
        );
        setResults(uniqueItems);
        if (uniqueItems.length === 0) {
          setError('No sold listings found for this search');
        }
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

  const formatPrice = (price: string, currency: string) => {
    const num = parseFloat(price);
    if (isNaN(num)) return price;

    if (currency === 'USD') {
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
      return { label: 'Auction', color: 'bg-orange-500' };
    }
    if (item.saleType === 'bestoffer') {
      return { label: 'Best Offer', color: 'bg-green-500' };
    }
    return { label: 'Buy It Now', color: 'bg-blue-500' };
  };

  const getDisplayPrice = (item: SaleItem) => {
    // For best offer, show the accepted price
    if (item.saleType === 'bestoffer' && item.BestOfferPrice !== '0.00') {
      return formatPrice(item.BestOfferPrice, item.BestOfferPriceCurrency);
    }
    return formatPrice(item.salePrice, item.salePriceCurrency);
  };

  // Calculate stats
  const stats = results.length > 0 ? {
    count: results.length,
    avg: results.reduce((sum, item) => sum + parseFloat(item.salePrice), 0) / results.length,
    min: Math.min(...results.map(item => parseFloat(item.salePrice))),
    max: Math.max(...results.map(item => parseFloat(item.salePrice))),
  } : null;

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-white">Card Comps</h1>
          <p className="text-gray-400 mt-1">Search completed eBay sales for sports cards</p>
        </div>
      </header>

      {/* Search Section */}
      <section className="bg-gray-900/50 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search sold cards (e.g., Michael Jordan Fleer rookie)"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
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
                      <svg className="w-5 h-5 spinner" fill="none" viewBox="0 0 24 24">
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
              Tip: Use specific terms like player name + year + set for best results
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

      {/* Stats Bar */}
      {stats && (
        <div className="bg-gray-900/30 border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex flex-wrap gap-6 text-sm">
              <div>
                <span className="text-gray-500">Results:</span>
                <span className="text-white ml-2 font-semibold">{stats.count}</span>
              </div>
              <div>
                <span className="text-gray-500">Average:</span>
                <span className="text-green-400 ml-2 font-semibold">${stats.avg.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-gray-500">Range:</span>
                <span className="text-white ml-2 font-semibold">${stats.min.toFixed(2)} - ${stats.max.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading && (
          <div className="flex justify-center py-12">
            <svg className="w-12 h-12 text-blue-500 spinner" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        )}

        {!loading && !hasSearched && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-xl text-gray-400">Search for completed sales above</h2>
            <p className="text-gray-600 mt-2">Find accurate sold prices for any sports card</p>
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
              return (
                <a
                  key={item.itemId}
                  href={`https://www.ebay.com/itm/${item.itemId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden hover:border-gray-700 transition-colors group"
                >
                  {/* Image */}
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
                    {/* Sale Type Badge */}
                    <div className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-semibold text-white ${saleType.color}`}>
                      {saleType.label}
                    </div>
                  </div>

                  {/* Details */}
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
                        <span className="text-xs text-gray-500">
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
      <footer className="border-t border-gray-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-600 text-sm">
          <p>Data sourced from completed eBay sales. Not affiliated with eBay Inc.</p>
        </div>
      </footer>
    </div>
  );
}
