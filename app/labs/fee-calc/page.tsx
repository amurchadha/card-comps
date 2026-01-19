'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
];

const PLATFORMS = [
  { id: 'ebay', name: 'eBay', fee: 13.25, paymentFee: 0, note: '13.25% final value fee' },
  { id: 'whatnot', name: 'Whatnot', fee: 9.9, paymentFee: 2.9, note: '9.9% + 2.9% payment processing' },
  { id: 'mercari', name: 'Mercari', fee: 10, paymentFee: 2.9, note: '10% + 2.9% + $0.50 payment' },
  { id: 'comc', name: 'COMC', fee: 5, paymentFee: 2.5, note: '5% seller fee + 2.5% cash out' },
  { id: 'myslabs', name: 'MySlabs', fee: 9, paymentFee: 0, note: '9% marketplace fee' },
  { id: 'fanatics', name: 'Fanatics Collect', fee: 10, paymentFee: 0, note: '10% fee (new platform)' },
  { id: 'alt', name: 'ALT', fee: 0, paymentFee: 3, note: '$0 seller fee, 3% processing' },
  { id: 'private', name: 'Private Sale', fee: 0, paymentFee: 0, note: 'Custom fees (PayPal, Venmo, etc.)' },
];

export default function FeeCalcPage() {
  const [salePrice, setSalePrice] = useState('');
  const [platform, setPlatform] = useState('ebay');
  const [shippingCost, setShippingCost] = useState('');
  const [customFee, setCustomFee] = useState('');
  const [costBasis, setCostBasis] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [includeTariff, setIncludeTariff] = useState(false);
  const [loadingRate, setLoadingRate] = useState(false);

  // Fetch exchange rate when currency changes
  useEffect(() => {
    if (currency === 'USD') {
      setExchangeRate(null);
      return;
    }
    setLoadingRate(true);
    // Using a free exchange rate API
    fetch(`https://api.exchangerate-api.com/v4/latest/${currency}`)
      .then(res => res.json())
      .then(data => {
        setExchangeRate(data.rates?.USD || null);
        setLoadingRate(false);
      })
      .catch(() => {
        setExchangeRate(null);
        setLoadingRate(false);
      });
  }, [currency]);

  const selectedPlatform = PLATFORMS.find(p => p.id === platform) || PLATFORMS[0];
  const isPrivate = platform === 'private';

  const calculations = useMemo(() => {
    const rawPrice = parseFloat(salePrice) || 0;
    const shipping = parseFloat(shippingCost) || 0;
    const rawCost = parseFloat(costBasis) || 0;

    // Convert to USD if needed
    const sale = currency !== 'USD' && exchangeRate ? rawPrice * exchangeRate : rawPrice;
    let cost = currency !== 'USD' && exchangeRate ? rawCost * exchangeRate : rawCost;

    // Add 15% tariff if selected
    const tariffAmount = includeTariff ? cost * 0.15 : 0;
    cost = cost + tariffAmount;

    // Platform fees
    let platformFee = 0;
    let paymentFee = 0;

    if (isPrivate) {
      platformFee = sale * ((parseFloat(customFee) || 0) / 100);
    } else {
      platformFee = sale * (selectedPlatform.fee / 100);
      paymentFee = sale * (selectedPlatform.paymentFee / 100);
      // Mercari has $0.50 flat fee
      if (platform === 'mercari' && sale > 0) {
        paymentFee += 0.50;
      }
    }

    const totalFees = platformFee + paymentFee;
    const netAfterFees = sale - totalFees;
    const netAfterShipping = netAfterFees - shipping;
    const profit = netAfterShipping - cost;
    const roi = cost > 0 ? (profit / cost) * 100 : 0;
    const effectiveFeeRate = sale > 0 ? (totalFees / sale) * 100 : 0;

    return {
      rawPrice,
      sale,
      platformFee,
      paymentFee,
      totalFees,
      netAfterFees,
      shipping,
      netAfterShipping,
      rawCost,
      cost,
      tariffAmount,
      profit,
      roi,
      effectiveFeeRate,
      exchangeRate: currency !== 'USD' ? exchangeRate : null,
    };
  }, [salePrice, platform, shippingCost, customFee, costBasis, selectedPlatform, isPrivate, currency, exchangeRate, includeTariff]);

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
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
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Back Link */}
        <Link href="/labs" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Labs
        </Link>

        <div className="text-center mb-10">
          <span className="text-5xl mb-4 block">🧮</span>
          <h1 className="text-3xl font-bold text-white mb-2">Fee Calculator</h1>
          <p className="text-gray-400">See exactly what you&apos;ll take home after platform fees</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-6">Sale Details</h2>

            {/* Sale Price */}
            <div className="mb-5">
              <label className="block text-sm text-gray-400 mb-2">Sale Price</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-8 pr-4 py-3 text-white text-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Platform */}
            <div className="mb-5">
              <label className="block text-sm text-gray-400 mb-2">Platform</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              >
                {PLATFORMS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.fee}%{p.paymentFee > 0 ? ` + ${p.paymentFee}%` : ''})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">{selectedPlatform.note}</p>
            </div>

            {/* Custom Fee (for private sales) */}
            {isPrivate && (
              <div className="mb-5">
                <label className="block text-sm text-gray-400 mb-2">Custom Fee % (PayPal, Venmo, etc.)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={customFee}
                    onChange={(e) => setCustomFee(e.target.value)}
                    placeholder="2.9"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">PayPal G&S: 2.89% + $0.49 • Venmo: 1.9% + $0.10 • Zelle/Cash: 0%</p>
              </div>
            )}

            {/* Shipping Cost */}
            <div className="mb-5">
              <label className="block text-sm text-gray-400 mb-2">Shipping Cost (your expense)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={shippingCost}
                  onChange={(e) => setShippingCost(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-8 pr-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Cost Basis */}
            <div className="mb-5">
              <label className="block text-sm text-gray-400 mb-2">Cost Basis (optional, for profit calc)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">{CURRENCIES.find(c => c.code === currency)?.symbol || '$'}</span>
                <input
                  type="number"
                  step="0.01"
                  value={costBasis}
                  onChange={(e) => setCostBasis(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-8 pr-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Currency Conversion */}
            <div className="mb-5">
              <label className="block text-sm text-gray-400 mb-2">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.symbol} {c.code} - {c.name}
                  </option>
                ))}
              </select>
              {loadingRate && <p className="text-xs text-gray-500 mt-1">Loading exchange rate...</p>}
              {currency !== 'USD' && exchangeRate && (
                <p className="text-xs text-green-400 mt-1">1 {currency} = ${exchangeRate.toFixed(4)} USD</p>
              )}
            </div>

            {/* Import Tariff */}
            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeTariff}
                  onChange={(e) => setIncludeTariff(e.target.checked)}
                  className="w-5 h-5 rounded bg-gray-800 border-gray-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-900"
                />
                <span className="text-gray-300">Include 15% import tariff</span>
              </label>
              <p className="text-xs text-gray-500 mt-1 ml-8">For international purchases (e.g., from Germany/EU)</p>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-4">
            {/* Main Result */}
            <div className={`rounded-xl p-6 ${calculations.profit >= 0 ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
              <div className="text-center">
                <div className="text-sm text-gray-400 mb-1">You Keep</div>
                <div className="text-4xl font-bold text-white mb-2">
                  {formatMoney(calculations.netAfterShipping)}
                </div>
                {calculations.cost > 0 && (
                  <div className={`text-lg font-semibold ${calculations.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {calculations.profit >= 0 ? '+' : ''}{formatMoney(calculations.profit)} profit
                    <span className="text-sm ml-2">({calculations.roi >= 0 ? '+' : ''}{calculations.roi.toFixed(1)}% ROI)</span>
                  </div>
                )}
              </div>
            </div>

            {/* Breakdown */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <h3 className="text-sm font-medium text-gray-400 mb-4 uppercase tracking-wide">Breakdown</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Sale Price</span>
                  <span className="text-white font-medium">{formatMoney(calculations.sale)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Platform Fee ({selectedPlatform.fee}%)</span>
                  <span className="text-red-400">-{formatMoney(calculations.platformFee)}</span>
                </div>
                {calculations.paymentFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Payment Processing</span>
                    <span className="text-red-400">-{formatMoney(calculations.paymentFee)}</span>
                  </div>
                )}
                <div className="border-t border-gray-700 pt-3 flex justify-between">
                  <span className="text-gray-400">After Fees</span>
                  <span className="text-white">{formatMoney(calculations.netAfterFees)}</span>
                </div>
                {calculations.shipping > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Shipping Cost</span>
                    <span className="text-red-400">-{formatMoney(calculations.shipping)}</span>
                  </div>
                )}
                <div className="border-t border-gray-700 pt-3 flex justify-between">
                  <span className="text-white font-medium">Net Proceeds</span>
                  <span className="text-white font-bold">{formatMoney(calculations.netAfterShipping)}</span>
                </div>
                {calculations.rawCost > 0 && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-400">
                        Cost Basis
                        {calculations.exchangeRate && ` (${CURRENCIES.find(c => c.code === currency)?.symbol}${calculations.rawCost.toFixed(2)} × ${calculations.exchangeRate.toFixed(4)})`}
                      </span>
                      <span className="text-gray-300">-{formatMoney(calculations.rawCost * (calculations.exchangeRate || 1))}</span>
                    </div>
                    {calculations.tariffAmount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Import Tariff (15%)</span>
                        <span className="text-red-400">-{formatMoney(calculations.tariffAmount)}</span>
                      </div>
                    )}
                    <div className="border-t border-gray-700 pt-3 flex justify-between">
                      <span className={`font-medium ${calculations.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {calculations.profit >= 0 ? 'Profit' : 'Loss'}
                      </span>
                      <span className={`font-bold ${calculations.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {calculations.profit >= 0 ? '+' : ''}{formatMoney(calculations.profit)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Effective Rate */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-center">
              <span className="text-gray-400 text-sm">Effective Fee Rate: </span>
              <span className="text-white font-semibold">{calculations.effectiveFeeRate.toFixed(2)}%</span>
            </div>
          </div>
        </div>

        {/* Platform Comparison */}
        <div className="mt-12 bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Platform Comparison</h2>
          <p className="text-gray-400 text-sm mb-6">How much you&apos;d keep on each platform for a {formatMoney(calculations.sale || 100)} sale:</p>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {PLATFORMS.filter(p => p.id !== 'private').map((p) => {
              const sale = calculations.sale || 100;
              const fees = sale * ((p.fee + p.paymentFee) / 100) + (p.id === 'mercari' ? 0.5 : 0);
              const net = sale - fees;
              return (
                <div key={p.id} className={`p-4 rounded-lg ${platform === p.id ? 'bg-blue-500/20 border border-blue-500/30' : 'bg-gray-800/50'}`}>
                  <div className="text-sm text-gray-400 mb-1">{p.name}</div>
                  <div className="text-xl font-bold text-white">{formatMoney(net)}</div>
                  <div className="text-xs text-red-400">-{formatMoney(fees)} fees</div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
