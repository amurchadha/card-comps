'use client';

import { useState, useCallback, FormEvent, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

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

interface ChartDataPoint {
  date: string;
  timestamp: number;
  price: number;
  avg: number;
  min: number;
  max: number;
  count: number;
}

type SortOption = 'date_desc' | 'date_asc' | 'price_desc' | 'price_asc';
type SearchType = 'sold_items' | 'for_sale';

export default function Home() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SaleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [sortOrder, setSortOrder] = useState<SortOption>('date_desc');
  const [searchType, setSearchType] = useState<SearchType>('sold_items');
  const [timeRange, setTimeRange] = useState(365); // days

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
      const params = new URLSearchParams({
        query: trimmedQuery,
        type: searchType,
      });

      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });

      const data: SearchResult = await response.json();

      if (data.success && data.items) {
        const uniqueItems = Array.from(
          new Map(data.items.map(item => [item.itemId, item])).values()
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
          setError(searchType === 'sold_items' ? 'No sold listings found' : 'No active listings found');
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
  }, [query, sortOrder, searchType]);

  // Generate chart data from results
  const chartData = useMemo(() => {
    if (results.length === 0) return [];

    const now = Date.now();
    const cutoff = now - timeRange * 24 * 60 * 60 * 1000;

    // Filter by time range and sort by date
    const filtered = results
      .filter(item => {
        const date = new Date(item.endTime).getTime();
        return date >= cutoff && date <= now;
      })
      .sort((a, b) => new Date(a.endTime).getTime() - new Date(b.endTime).getTime());

    if (filtered.length === 0) return [];

    // Group by date for aggregation
    const byDate = new Map<string, number[]>();
    filtered.forEach(item => {
      const date = new Date(item.endTime).toISOString().split('T')[0];
      const price = parsePrice(item.salePrice);
      if (price > 0) {
        if (!byDate.has(date)) byDate.set(date, []);
        byDate.get(date)!.push(price);
      }
    });

    // Create data points
    const points: ChartDataPoint[] = [];
    byDate.forEach((prices, date) => {
      const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
      points.push({
        date,
        timestamp: new Date(date).getTime(),
        price: avg,
        avg,
        min: Math.min(...prices),
        max: Math.max(...prices),
        count: prices.length,
      });
    });

    return points.sort((a, b) => a.timestamp - b.timestamp);
  }, [results, timeRange]);

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

  // Chart stats (filtered by time range)
  const chartStats = useMemo(() => {
    if (chartData.length === 0) return null;

    const prices = chartData.map(d => d.avg);
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
    const recent = chartData.slice(-7);
    const recentAvg = recent.length > 0
      ? recent.map(d => d.avg).reduce((a, b) => a + b, 0) / recent.length
      : avg;

    const trend = recentAvg > avg ? 'up' : recentAvg < avg ? 'down' : 'flat';
    const trendPct = avg > 0 ? ((recentAvg - avg) / avg) * 100 : 0;

    return { avg, recentAvg, trend, trendPct };
  }, [chartData]);

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

  const formatChartDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: ChartDataPoint }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-xl">
          <p className="text-gray-400 text-xs mb-1">{formatDate(data.date)}</p>
          <p className="text-green-400 font-bold">{formatPrice(data.avg)}</p>
          <p className="text-gray-500 text-xs mt-1">
            {data.count} sale{data.count !== 1 ? 's' : ''}
            {data.count > 1 && ` (${formatPrice(data.min)} - ${formatPrice(data.max)})`}
          </p>
        </div>
      );
    }
    return null;
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
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setSearchType('sold_items')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                searchType === 'sold_items'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Sold Listings
            </button>
            <button
              disabled
              className="px-6 py-2 rounded-lg font-medium bg-gray-800 text-gray-600 cursor-not-allowed"
              title="Coming soon"
            >
              For Sale Now
            </button>
          </div>

          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={searchType === 'sold_items'
                    ? "Search sold cards (e.g., Michael Jordan Fleer rookie)"
                    : "Search cards for sale (e.g., LeBron James Prizm)"
                  }
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
              {searchType === 'sold_items'
                ? 'Find actual sold prices including accepted Best Offers'
                : 'Find cards currently available for purchase'
              }
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

      {/* Price Chart */}
      {!loading && searchType === 'sold_items' && chartData.length > 0 && (
        <section className="bg-gray-900/30 border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 py-6">
            {/* Chart Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
              <div>
                <h2 className="text-lg font-semibold text-white">Price History</h2>
                {chartStats && (
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-gray-400 text-sm">
                      Avg: <span className="text-green-400 font-semibold">{formatPrice(chartStats.avg)}</span>
                    </span>
                    <span className={`text-sm font-medium flex items-center gap-1 ${
                      chartStats.trend === 'up' ? 'text-green-400' :
                      chartStats.trend === 'down' ? 'text-red-400' : 'text-gray-400'
                    }`}>
                      {chartStats.trend === 'up' && '↑'}
                      {chartStats.trend === 'down' && '↓'}
                      {chartStats.trend === 'flat' && '→'}
                      {Math.abs(chartStats.trendPct).toFixed(1)}% (7d)
                    </span>
                  </div>
                )}
              </div>

              {/* Time Range Slider */}
              <div className="flex items-center gap-3">
                <span className="text-gray-500 text-sm">Range:</span>
                <input
                  type="range"
                  min="30"
                  max="730"
                  step="30"
                  value={timeRange}
                  onChange={(e) => setTimeRange(parseInt(e.target.value))}
                  className="w-32 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <span className="text-white text-sm font-medium w-16">
                  {timeRange >= 365 ? `${(timeRange / 365).toFixed(1)}y` : `${timeRange}d`}
                </span>
              </div>
            </div>

            {/* Chart */}
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatChartDate}
                    stroke="#6b7280"
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                    tickLine={false}
                    axisLine={{ stroke: '#374151' }}
                  />
                  <YAxis
                    tickFormatter={(val) => `$${val}`}
                    stroke="#6b7280"
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    width={60}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  {chartStats && (
                    <ReferenceLine
                      y={chartStats.avg}
                      stroke="#6b7280"
                      strokeDasharray="3 3"
                      label={{ value: 'Avg', fill: '#6b7280', fontSize: 10 }}
                    />
                  )}
                  <Area
                    type="monotone"
                    dataKey="avg"
                    stroke="#22c55e"
                    strokeWidth={2}
                    fill="url(#priceGradient)"
                    dot={{ fill: '#22c55e', strokeWidth: 0, r: 3 }}
                    activeDot={{ fill: '#22c55e', strokeWidth: 2, stroke: '#fff', r: 5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
      )}

      {/* Stats Bar */}
      {stats && (
        <div className="bg-gray-900/30 border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex flex-wrap gap-6 text-sm">
              <div>
                <span className="text-gray-500">Results:</span>
                <span className="text-white ml-2 font-semibold">{stats.count}</span>
              </div>
              <div>
                <span className="text-gray-500">{searchType === 'sold_items' ? 'Avg Sold:' : 'Avg Price:'}</span>
                <span className="text-green-400 ml-2 font-semibold">{formatPrice(stats.avg)}</span>
              </div>
              <div>
                <span className="text-gray-500">Range:</span>
                <span className="text-white ml-2 font-semibold">{formatPrice(stats.min)} - {formatPrice(stats.max)}</span>
              </div>
            </div>
          </div>
        </div>
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
            <div className="text-6xl mb-4">{searchType === 'sold_items' ? '📊' : '🛒'}</div>
            <h2 className="text-xl text-gray-400">
              {searchType === 'sold_items'
                ? 'Search completed sales above'
                : 'Search available listings above'
              }
            </h2>
            <p className="text-gray-600 mt-2">
              {searchType === 'sold_items'
                ? 'Find accurate sold prices including Best Offer amounts'
                : 'Find cards currently listed for sale on eBay'
              }
            </p>
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
              const isOldListing = daysSinceSale > 90;
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
                    {searchType === 'for_sale' && (
                      <div className="absolute top-2 right-2 px-2 py-1 rounded text-xs font-semibold bg-green-600 text-white">
                        Active
                      </div>
                    )}
                    {isOldListing && searchType === 'sold_items' && (
                      <div className="absolute top-2 right-2 px-2 py-1 rounded text-xs font-semibold bg-yellow-600 text-white" title="Listing may redirect to similar items">
                        90+ days
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
                      {searchType === 'sold_items' ? 'Sold' : 'Listed'} {formatDate(item.endTime)}
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
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-white font-semibold mb-3">Card Comps</h3>
              <p className="text-gray-400 text-sm">
                Search completed eBay sales and active listings for sports cards.
                See actual sold prices including accepted Best Offer amounts.
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
              Not affiliated with eBay Inc. Card images and data are property of their respective owners.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
