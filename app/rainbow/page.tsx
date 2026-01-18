'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useAuth } from '@clerk/nextjs';

const SignInButton = dynamic(() => import('@clerk/nextjs').then(m => m.SignInButton), { ssr: false });

interface Parallel {
  id: string;
  card_number: string;
  subset_name: string;
  is_autograph: boolean;
  owned: boolean;
  inventory_id?: string;
  purchase_price?: number;
  grade?: string;
  grading_company?: string;
  // Pricing data
  last_sale_price?: number;
  last_sale_date?: string;
  avg_price?: number;
  listings_count?: number;
}

interface SetInfo {
  id: string;
  name: string;
  year: string;
  sport: string;
}

interface RainbowData {
  player_name: string;
  card_number: string;
  set: SetInfo;
  base_parallels: Parallel[];
  auto_parallels: Parallel[];
  completion: {
    base: { owned: number; total: number };
    auto: { owned: number; total: number };
  };
}

// Parallel rarity order (most common to rarest)
const PARALLEL_ORDER = [
  'Base', 'Purple', 'Blue', 'Pink', 'Green', 'Gold', 'Orange', 'Red',
  'Black', 'Superfractor', '1/1'
];

function getParallelColor(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('superfractor') || lower.includes('1/1')) return 'bg-gradient-to-br from-yellow-400 via-red-500 to-purple-600';
  if (lower.includes('red')) return 'bg-red-600';
  if (lower.includes('orange')) return 'bg-orange-500';
  if (lower.includes('gold')) return 'bg-yellow-500';
  if (lower.includes('green')) return 'bg-green-600';
  if (lower.includes('pink')) return 'bg-pink-500';
  if (lower.includes('blue')) return 'bg-blue-600';
  if (lower.includes('purple')) return 'bg-purple-600';
  if (lower.includes('black')) return 'bg-gray-900';
  return 'bg-gray-700'; // Base
}

function getParallelNumbering(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('superfractor') || lower.includes('1/1')) return '1/1';
  if (lower.includes('red')) return '/5';
  if (lower.includes('orange')) return '/10';
  if (lower.includes('gold')) return '/25';
  if (lower.includes('green')) return '/50';
  if (lower.includes('pink')) return '/75';
  if (lower.includes('blue')) return '/99';
  if (lower.includes('purple')) return '/199';
  return ''; // Base - no numbering
}

function sortParallels(parallels: Parallel[]): Parallel[] {
  return [...parallels].sort((a, b) => {
    const aIndex = PARALLEL_ORDER.findIndex(p => a.subset_name.toLowerCase().includes(p.toLowerCase()));
    const bIndex = PARALLEL_ORDER.findIndex(p => b.subset_name.toLowerCase().includes(p.toLowerCase()));
    return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
  });
}

function ParallelTile({ parallel, onToggleOwned }: { parallel: Parallel; onToggleOwned: (id: string, owned: boolean) => void }) {
  const color = getParallelColor(parallel.subset_name);
  const numbering = getParallelNumbering(parallel.subset_name);
  const displayName = parallel.subset_name.replace('Autographs - ', '');

  return (
    <div
      className={`relative rounded-xl overflow-hidden transition-all ${
        parallel.owned
          ? 'ring-2 ring-green-500 shadow-lg shadow-green-500/20'
          : 'opacity-60 grayscale hover:opacity-80 hover:grayscale-0'
      }`}
    >
      {/* Card Visual */}
      <div className={`aspect-[3/4] ${color} flex flex-col items-center justify-center p-3`}>
        {/* Numbering Badge */}
        {numbering && (
          <div className="absolute top-2 right-2 bg-black/60 px-2 py-0.5 rounded text-xs font-bold text-white">
            {numbering}
          </div>
        )}

        {/* Card Content */}
        <div className="text-center">
          <div className="text-white/90 text-xs font-medium mb-1">{displayName}</div>
          {parallel.is_autograph && (
            <div className="text-yellow-300 text-xs font-bold">AUTO</div>
          )}
        </div>

        {/* Owned Overlay */}
        {parallel.owned && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <div className="bg-green-500 rounded-full p-2">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        )}

        {/* Missing - Show Pricing */}
        {!parallel.owned && parallel.last_sale_price && (
          <div className="absolute bottom-2 left-2 right-2">
            <div className="bg-black/70 rounded px-2 py-1 text-center">
              <div className="text-green-400 text-sm font-bold">${parallel.last_sale_price.toFixed(0)}</div>
              <div className="text-gray-400 text-xs">last sale</div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Info */}
      <div className="bg-gray-900 p-2">
        {parallel.owned ? (
          <div className="text-center">
            {parallel.grade && (
              <div className="text-xs text-blue-400 font-medium">
                {parallel.grading_company} {parallel.grade}
              </div>
            )}
            {parallel.purchase_price && (
              <div className="text-xs text-gray-400">
                Paid ${parallel.purchase_price.toFixed(0)}
              </div>
            )}
            <button
              onClick={() => onToggleOwned(parallel.id, false)}
              className="mt-1 text-xs text-red-400 hover:text-red-300"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="text-center">
            <button
              onClick={() => onToggleOwned(parallel.id, true)}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium"
            >
              + Mark Owned
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function CompletionBar({ owned, total, label }: { owned: number; total: number; label: string }) {
  const pct = total > 0 ? (owned / total) * 100 : 0;
  const isComplete = owned === total;

  return (
    <div className="bg-gray-800/50 rounded-lg p-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-gray-300 font-medium">{label}</span>
        <span className={`font-bold ${isComplete ? 'text-green-400' : 'text-white'}`}>
          {owned}/{total}
        </span>
      </div>
      <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${isComplete ? 'bg-green-500' : 'bg-blue-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {isComplete && (
        <div className="text-center mt-2 text-green-400 text-sm font-medium">
          Rainbow Complete!
        </div>
      )}
    </div>
  );
}

export default function RainbowPage() {
  const { isSignedIn } = useAuth();
  const [loading, setLoading] = useState(true);
  const [rainbowData, setRainbowData] = useState<RainbowData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ player_name: string; set_name: string; set_id: string; card_number: string }>>([]);
  const [searching, setSearching] = useState(false);

  // Default to Ekitike PSG for demo
  const [selectedCard, setSelectedCard] = useState({
    player_name: 'Hugo Ekitike',
    set_id: '12628365-a025-4158-b355-40bf6e2ae8ed',
    card_number: '13',
  });

  const fetchRainbow = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/rainbow?player=${encodeURIComponent(selectedCard.player_name)}&set_id=${selectedCard.set_id}&card_number=${selectedCard.card_number}`);
      const data = await res.json();
      if (data.success) {
        setRainbowData(data.rainbow);
      }
    } catch (error) {
      console.error('Failed to fetch rainbow:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedCard]);

  useEffect(() => {
    fetchRainbow();
  }, [fetchRainbow]);

  const handleSearch = async () => {
    if (searchQuery.length < 2) return;
    setSearching(true);
    try {
      const res = await fetch(`/api/rainbow/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleToggleOwned = async (parallelId: string, owned: boolean) => {
    if (!isSignedIn) return;

    try {
      await fetch('/api/rainbow/ownership', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ catalog_id: parallelId, owned }),
      });
      fetchRainbow(); // Refresh
    } catch (error) {
      console.error('Failed to update ownership:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="bg-gray-900/50 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-xl font-bold text-white">Card Comps</Link>
            <div className="flex items-center gap-3">
              <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">Search</Link>
              <Link href="/labs" className="text-sm text-gray-400 hover:text-white transition-colors">Labs</Link>
              <span className="text-sm text-white font-medium">Rainbow</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Search Section */}
        <div className="mb-8">
          <div className="flex gap-3 mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search for a player..."
              className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleSearch}
              disabled={searching}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
            >
              {searching ? 'Searching...' : 'Search'}
            </button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden mb-4">
              {searchResults.slice(0, 10).map((result, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setSelectedCard({
                      player_name: result.player_name,
                      set_id: result.set_id,
                      card_number: result.card_number,
                    });
                    setSearchResults([]);
                    setSearchQuery('');
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-gray-800 transition-colors border-b border-gray-800 last:border-b-0"
                >
                  <div className="text-white font-medium">{result.player_name}</div>
                  <div className="text-sm text-gray-400">{result.set_name} #{result.card_number}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : rainbowData ? (
          <>
            {/* Card Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {rainbowData.player_name}
              </h1>
              <p className="text-gray-400">
                {rainbowData.set.year} {rainbowData.set.name} #{rainbowData.card_number}
              </p>
            </div>

            {/* Completion Stats */}
            <div className="grid md:grid-cols-2 gap-4 mb-10">
              <CompletionBar
                owned={rainbowData.completion.base.owned}
                total={rainbowData.completion.base.total}
                label="Base Rainbow"
              />
              <CompletionBar
                owned={rainbowData.completion.auto.owned}
                total={rainbowData.completion.auto.total}
                label="Auto Rainbow"
              />
            </div>

            {/* Sign In Prompt */}
            {!isSignedIn && (
              <div className="bg-blue-900/30 border border-blue-800 rounded-lg p-4 mb-8 text-center">
                <p className="text-gray-300 mb-3">Sign in to track your rainbow progress</p>
                <SignInButton mode="modal">
                  <button className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors">
                    Sign In
                  </button>
                </SignInButton>
              </div>
            )}

            {/* Base Parallels */}
            {rainbowData.base_parallels.length > 0 && (
              <section className="mb-10">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span>Base Parallels</span>
                  <span className="text-sm font-normal text-gray-400">
                    ({rainbowData.completion.base.owned}/{rainbowData.completion.base.total})
                  </span>
                </h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-3">
                  {sortParallels(rainbowData.base_parallels).map((parallel) => (
                    <ParallelTile
                      key={parallel.id}
                      parallel={parallel}
                      onToggleOwned={handleToggleOwned}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Auto Parallels */}
            {rainbowData.auto_parallels.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span>Autograph Parallels</span>
                  <span className="text-sm font-normal text-gray-400">
                    ({rainbowData.completion.auto.owned}/{rainbowData.completion.auto.total})
                  </span>
                </h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-3">
                  {sortParallels(rainbowData.auto_parallels).map((parallel) => (
                    <ParallelTile
                      key={parallel.id}
                      parallel={parallel}
                      onToggleOwned={handleToggleOwned}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🌈</div>
            <h2 className="text-xl text-gray-400">Search for a player to start tracking</h2>
          </div>
        )}
      </main>
    </div>
  );
}
