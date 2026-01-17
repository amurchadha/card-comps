'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

// Platform fee presets (matching database)
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
  // Sale details
  const [salePrice, setSalePrice] = useState<string>('');
  const [platform, setPlatform] = useState<Platform>('ebay');
  const [shippingCharged, setShippingCharged] = useState<string>('');
  const [shippingCost, setShippingCost] = useState<string>('');

  // Cost basis
  const [purchasePrice, setPurchasePrice] = useState<string>('');
  const [purchaseTax, setPurchaseTax] = useState<string>('');
  const [purchaseShipping, setPurchaseShipping] = useState<string>('');

  // Calculate everything
  const calculations = useMemo(() => {
    const sale = parseFloat(salePrice) || 0;
    const shipCharged = parseFloat(shippingCharged) || 0;
    const shipCost = parseFloat(shippingCost) || 0;

    const purchase = parseFloat(purchasePrice) || 0;
    const tax = parseFloat(purchaseTax) || 0;
    const purchaseShip = parseFloat(purchaseShipping) || 0;

    const platformInfo = PLATFORM_FEES[platform];
    const grossAmount = sale + shipCharged;

    // Platform takes fees on total amount
    const platformFeeAmount = grossAmount * (platformInfo.fee / 100);
    const processingFeeAmount = grossAmount * (platformInfo.processing / 100);
    const totalFees = platformFeeAmount + processingFeeAmount;

    // Net from sale
    const netFromSale = grossAmount - totalFees - shipCost;

    // Total cost basis
    const totalCostBasis = purchase + tax + purchaseShip;

    // Profit
    const profit = netFromSale - totalCostBasis;

    // ROI (return on investment)
    const roi = totalCostBasis > 0 ? (profit / totalCostBasis) * 100 : 0;

    return {
      grossAmount,
      platformFeeAmount,
      processingFeeAmount,
      totalFees,
      netFromSale,
      totalCostBasis,
      profit,
      roi,
      platformInfo,
    };
  }, [salePrice, platform, shippingCharged, shippingCost, purchasePrice, purchaseTax, purchaseShipping]);

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-blue-400 hover:text-blue-300 transition-colors">
            Card Comps
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm font-medium text-blue-400">
              Profit Calculator
            </Link>
          </nav>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Profit Calculator</h1>
        <p className="text-gray-400 mb-8">Calculate your exact profit after fees, shipping, and cost basis.</p>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Sale Details */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-green-400/20 flex items-center justify-center text-sm">$</span>
              Sale Details
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Platform</label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value as Platform)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                >
                  {Object.entries(PLATFORM_FEES).map(([key, { name, fee, processing }]) => (
                    <option key={key} value={key}>
                      {name} ({fee + processing}% fees)
                    </option>
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
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-7 pr-3 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
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
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-7 pr-3 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Actual Shipping Cost</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={shippingCost}
                      onChange={(e) => setShippingCost(e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-7 pr-3 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cost Basis */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-red-400/20 flex items-center justify-center text-sm">-</span>
              Cost Basis
            </h2>

            <div className="space-y-4">
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
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-7 pr-3 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
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
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-7 pr-3 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
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
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-7 pr-3 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
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
        </div>

        {/* Results */}
        <div className="mt-8 bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Breakdown</h2>

          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-800">
              <span className="text-gray-400">Gross Amount (Sale + Shipping)</span>
              <span className="text-white font-medium">{formatMoney(calculations.grossAmount)}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-gray-800">
              <span className="text-gray-400">{calculations.platformInfo.name} Fee ({calculations.platformInfo.fee}%)</span>
              <span className="text-red-400">-{formatMoney(calculations.platformFeeAmount)}</span>
            </div>

            {calculations.platformInfo.processing > 0 && (
              <div className="flex justify-between py-2 border-b border-gray-800">
                <span className="text-gray-400">Payment Processing ({calculations.platformInfo.processing}%)</span>
                <span className="text-red-400">-{formatMoney(calculations.processingFeeAmount)}</span>
              </div>
            )}

            <div className="flex justify-between py-2 border-b border-gray-800">
              <span className="text-gray-400">Shipping Cost</span>
              <span className="text-red-400">-{formatMoney(parseFloat(shippingCost) || 0)}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-gray-800 font-medium">
              <span className="text-gray-300">Net From Sale</span>
              <span className="text-white">{formatMoney(calculations.netFromSale)}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-gray-800">
              <span className="text-gray-400">Cost Basis</span>
              <span className="text-red-400">-{formatMoney(calculations.totalCostBasis)}</span>
            </div>
          </div>

          {/* Final Profit */}
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

          {/* Quick Fee Reference */}
          <div className="mt-6 pt-4 border-t border-gray-800">
            <h3 className="text-sm font-medium text-gray-400 mb-3">Platform Fee Reference</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
              {Object.entries(PLATFORM_FEES).map(([key, { name, fee, processing }]) => (
                <div key={key} className="bg-gray-800/50 rounded px-2 py-1">
                  <span className="text-gray-300">{name}:</span>{' '}
                  <span className="text-blue-400">{fee + processing}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
