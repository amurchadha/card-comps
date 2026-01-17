'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

// Dynamic import to avoid SSR issues with Clerk
const AppNav = dynamic(() => import('@/components/app-nav').then(m => m.AppNav), { ssr: false });

interface Stats {
  inventory: { count: number; totalCost: number };
  transactions: { count: number; totalRevenue: number; totalProfit: number; avgRoi: number };
  goals: { active: number; achieved: number; totalTarget: number; totalFunded: number };
  recentActivity: Array<{ type: string; amount: number; date: string }>;
}

// Platform fee presets
const PLATFORM_FEES = {
  ebay: { name: 'eBay', fee: 13.25, processing: 0 },
  whatnot: { name: 'Whatnot', fee: 9.9, processing: 2.9 },
  mercari: { name: 'Mercari', fee: 10, processing: 2.9 },
  comc: { name: 'COMC', fee: 5, processing: 2.5 },
  myslabs: { name: 'MySlabs', fee: 10, processing: 0 },
  private: { name: 'Private Sale', fee: 0, processing: 0 },
};

type Platform = keyof typeof PLATFORM_FEES;

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  // Profit Calculator state
  const [showCalculator, setShowCalculator] = useState(false);
  const [salePrice, setSalePrice] = useState<string>('');
  const [platform, setPlatform] = useState<Platform>('ebay');
  const [shippingCharged, setShippingCharged] = useState<string>('');
  const [shippingCost, setShippingCost] = useState<string>('');
  const [purchasePrice, setPurchasePrice] = useState<string>('');
  const [purchaseTax, setPurchaseTax] = useState<string>('');
  const [purchaseShipping, setPurchaseShipping] = useState<string>('');

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        if (!data.error) setStats(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Calculator logic
  const calculations = useMemo(() => {
    const sale = parseFloat(salePrice) || 0;
    const shipCharged = parseFloat(shippingCharged) || 0;
    const shipCost = parseFloat(shippingCost) || 0;
    const purchase = parseFloat(purchasePrice) || 0;
    const tax = parseFloat(purchaseTax) || 0;
    const purchaseShip = parseFloat(purchaseShipping) || 0;

    const platformInfo = PLATFORM_FEES[platform];
    const grossAmount = sale + shipCharged;
    const platformFeeAmount = grossAmount * (platformInfo.fee / 100);
    const processingFeeAmount = grossAmount * (platformInfo.processing / 100);
    const totalFees = platformFeeAmount + processingFeeAmount;
    const netFromSale = grossAmount - totalFees - shipCost;
    const totalCostBasis = purchase + tax + purchaseShip;
    const profit = netFromSale - totalCostBasis;
    const roi = totalCostBasis > 0 ? (profit / totalCostBasis) * 100 : 0;

    return { grossAmount, platformFeeAmount, processingFeeAmount, totalFees, netFromSale, totalCostBasis, profit, roi, platformInfo };
  }, [salePrice, platform, shippingCharged, shippingCost, purchasePrice, purchaseTax, purchaseShipping]);

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <AppNav />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-400 mt-1">Your collection at a glance</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {/* Inventory */}
              <Link href="/inventory" className="bg-gray-900/50 border border-gray-800 rounded-xl p-5 hover:border-blue-600/50 transition-colors group">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">📦</span>
                  <svg className="w-5 h-5 text-gray-600 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <div className="text-gray-400 text-sm">Inventory</div>
                <div className="text-2xl font-bold text-white">{stats?.inventory.count || 0} cards</div>
                <div className="text-sm text-blue-400 mt-1">{formatMoney(stats?.inventory.totalCost || 0)} invested</div>
              </Link>

              {/* Sales */}
              <Link href="/transactions" className="bg-gray-900/50 border border-gray-800 rounded-xl p-5 hover:border-green-600/50 transition-colors group">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">💰</span>
                  <svg className="w-5 h-5 text-gray-600 group-hover:text-green-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <div className="text-gray-400 text-sm">Total Profit</div>
                <div className={`text-2xl font-bold ${(stats?.transactions.totalProfit || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatMoney(stats?.transactions.totalProfit || 0)}
                </div>
                <div className="text-sm text-gray-500 mt-1">{stats?.transactions.count || 0} sales</div>
              </Link>

              {/* ROI */}
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">📈</span>
                </div>
                <div className="text-gray-400 text-sm">Average ROI</div>
                <div className={`text-2xl font-bold ${(stats?.transactions.avgRoi || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {(stats?.transactions.avgRoi || 0).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-500 mt-1">per sale</div>
              </div>

              {/* Goals */}
              <Link href="/goals" className="bg-gray-900/50 border border-gray-800 rounded-xl p-5 hover:border-purple-600/50 transition-colors group">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">🎯</span>
                  <svg className="w-5 h-5 text-gray-600 group-hover:text-purple-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <div className="text-gray-400 text-sm">Goals</div>
                <div className="text-2xl font-bold text-purple-400">{stats?.goals.active || 0} active</div>
                <div className="text-sm text-green-400 mt-1">{stats?.goals.achieved || 0} achieved</div>
              </Link>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Profit Calculator Toggle */}
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <span>🧮</span> Profit Calculator
                  </h2>
                  <button
                    onClick={() => setShowCalculator(!showCalculator)}
                    className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    {showCalculator ? 'Hide' : 'Open'}
                  </button>
                </div>
                <p className="text-gray-400 text-sm">
                  Calculate your profit after fees, shipping, and cost basis before making a sale.
                </p>
              </div>

              {/* Quick Links */}
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
                <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href="/inventory"
                    className="px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-center transition-colors"
                  >
                    <div className="text-xl mb-1">+📦</div>
                    <div className="text-sm text-gray-300">Add Card</div>
                  </Link>
                  <Link
                    href="/transactions"
                    className="px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-center transition-colors"
                  >
                    <div className="text-xl mb-1">+💰</div>
                    <div className="text-sm text-gray-300">Log Sale</div>
                  </Link>
                  <Link
                    href="/goals"
                    className="px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-center transition-colors"
                  >
                    <div className="text-xl mb-1">+🎯</div>
                    <div className="text-sm text-gray-300">New Goal</div>
                  </Link>
                  <Link
                    href="/"
                    className="px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-center transition-colors"
                  >
                    <div className="text-xl mb-1">🔍</div>
                    <div className="text-sm text-gray-300">Search Comps</div>
                  </Link>
                </div>
              </div>
            </div>

            {/* Profit Calculator */}
            {showCalculator && (
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mb-8">
                <h2 className="text-xl font-bold mb-6">Profit Calculator</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Sale Details */}
                  <div className="space-y-4">
                    <h3 className="text-green-400 font-medium flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-green-400/20 flex items-center justify-center text-xs">$</span>
                      Sale Details
                    </h3>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Platform</label>
                      <select
                        value={platform}
                        onChange={(e) => setPlatform(e.target.value as Platform)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                      >
                        {Object.entries(PLATFORM_FEES).map(([key, { name, fee, processing }]) => (
                          <option key={key} value={key}>{name} ({fee + processing}% fees)</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Sale Price</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                        <input
                          type="number"
                          value={salePrice}
                          onChange={(e) => setSalePrice(e.target.value)}
                          placeholder="0.00"
                          step="0.01"
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-7 pr-3 py-2 text-white"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Shipping Charged</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                          <input
                            type="number"
                            value={shippingCharged}
                            onChange={(e) => setShippingCharged(e.target.value)}
                            placeholder="0.00"
                            step="0.01"
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-7 pr-3 py-2 text-white"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Actual Cost</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                          <input
                            type="number"
                            value={shippingCost}
                            onChange={(e) => setShippingCost(e.target.value)}
                            placeholder="0.00"
                            step="0.01"
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-7 pr-3 py-2 text-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cost Basis */}
                  <div className="space-y-4">
                    <h3 className="text-red-400 font-medium flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-red-400/20 flex items-center justify-center text-xs">-</span>
                      Cost Basis
                    </h3>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Purchase Price</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                        <input
                          type="number"
                          value={purchasePrice}
                          onChange={(e) => setPurchasePrice(e.target.value)}
                          placeholder="0.00"
                          step="0.01"
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-7 pr-3 py-2 text-white"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Tax Paid</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                          <input
                            type="number"
                            value={purchaseTax}
                            onChange={(e) => setPurchaseTax(e.target.value)}
                            placeholder="0.00"
                            step="0.01"
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-7 pr-3 py-2 text-white"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Shipping Paid</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                          <input
                            type="number"
                            value={purchaseShipping}
                            onChange={(e) => setPurchaseShipping(e.target.value)}
                            placeholder="0.00"
                            step="0.01"
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-7 pr-3 py-2 text-white"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-gray-700">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Total Cost Basis</span>
                        <span className="text-red-400 font-medium">{formatMoney(calculations.totalCostBasis)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Result */}
                <div className={`mt-6 p-4 rounded-lg ${calculations.profit >= 0 ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm text-gray-400">Net Profit</span>
                      <div className={`text-3xl font-bold ${calculations.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {calculations.profit >= 0 ? '+' : ''}{formatMoney(calculations.profit)}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-gray-400">ROI</span>
                      <div className={`text-2xl font-bold ${calculations.roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {calculations.roi >= 0 ? '+' : ''}{calculations.roi.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Goals Progress */}
            {stats && stats.goals.active > 0 && (
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Goal Progress</h2>
                  <Link href="/goals" className="text-sm text-purple-400 hover:text-purple-300">
                    View all
                  </Link>
                </div>
                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">
                      {formatMoney(stats.goals.totalFunded)} of {formatMoney(stats.goals.totalTarget)}
                    </span>
                    <span className="text-purple-400 font-medium">
                      {stats.goals.totalTarget > 0
                        ? ((stats.goals.totalFunded / stats.goals.totalTarget) * 100).toFixed(0)
                        : 0}%
                    </span>
                  </div>
                  <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-600 to-purple-400"
                      style={{
                        width: `${stats.goals.totalTarget > 0
                          ? Math.min(100, (stats.goals.totalFunded / stats.goals.totalTarget) * 100)
                          : 0}%`
                      }}
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  {formatMoney(Math.max(0, stats.goals.totalTarget - stats.goals.totalFunded))} to go across {stats.goals.active} goal{stats.goals.active !== 1 ? 's' : ''}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
