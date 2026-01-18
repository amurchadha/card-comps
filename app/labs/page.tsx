'use client';

import Link from 'next/link';

interface LabTool {
  title: string;
  description: string;
  href: string;
  status: 'live' | 'beta' | 'coming-soon';
  icon: string;
}

const tools: LabTool[] = [
  {
    title: 'Fee Calculator',
    description: 'Calculate your take-home after platform fees. Supports eBay, Whatnot, Mercari, COMC, MySlabs, and custom fees.',
    href: '/labs/fee-calc',
    status: 'live',
    icon: '🧮',
  },
  {
    title: 'Grade Value Estimator',
    description: 'See how much PSA, BGS, and SGC grades affect card values based on recent sales data.',
    href: '/labs/grade-value',
    status: 'beta',
    icon: '📈',
  },
  {
    title: 'Set Checklist Browser',
    description: 'Browse our database of 1M+ cards across basketball, football, and soccer sets.',
    href: '/labs/checklist',
    status: 'beta',
    icon: '📋',
  },
  {
    title: 'Flip Finder',
    description: 'Find cards selling below market value based on recent comp data.',
    href: '/labs/flip-finder',
    status: 'coming-soon',
    icon: '🔍',
  },
  {
    title: 'Rainbow Tracker',
    description: 'Track your parallel rainbow progress for any card. From base to superfractor.',
    href: '/rainbow',
    status: 'live',
    icon: '🌈',
  },
  {
    title: 'Break Calculator',
    description: 'Calculate expected value and odds for box breaks by team or slot.',
    href: '/labs/break-calc',
    status: 'coming-soon',
    icon: '📦',
  },
];

function StatusBadge({ status }: { status: LabTool['status'] }) {
  const styles = {
    live: 'bg-green-500/20 text-green-400 border-green-500/30',
    beta: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'coming-soon': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  };
  const labels = {
    live: 'Live',
    beta: 'Beta',
    'coming-soon': 'Coming Soon',
  };
  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

export default function LabsPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="bg-gray-900/50 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-xl font-bold text-white">Card Comps</Link>
            <div className="flex items-center gap-3">
              <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">Search</Link>
              <span className="text-sm text-white font-medium">Labs</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 bg-gradient-to-b from-purple-900/20 to-gray-950">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-400 text-sm font-medium mb-6">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            Experimental
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Card Comps Labs</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Free tools for collectors. No signup required. We build these for fun—let us know what you want next.
          </p>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.status === 'coming-soon' ? '#' : tool.href}
                className={`group bg-gray-900/50 border border-gray-800 rounded-xl p-6 transition-all ${
                  tool.status === 'coming-soon'
                    ? 'opacity-60 cursor-not-allowed'
                    : 'hover:border-purple-500/50 hover:bg-gray-900'
                }`}
                onClick={(e) => tool.status === 'coming-soon' && e.preventDefault()}
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="text-4xl">{tool.icon}</span>
                  <StatusBadge status={tool.status} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-purple-400 transition-colors">
                  {tool.title}
                </h3>
                <p className="text-gray-400 text-sm">{tool.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Request Section */}
      <section className="py-12 border-t border-gray-800">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Have an idea?</h2>
          <p className="text-gray-400 mb-6">We&apos;re always looking for new tools to build. Drop us a suggestion.</p>
          <a
            href="mailto:labs@cardcomps.com?subject=Labs%20Tool%20Suggestion"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors"
          >
            Suggest a Tool
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Noshu LLC. All tools are free and provided as-is.</p>
        </div>
      </footer>
    </div>
  );
}
