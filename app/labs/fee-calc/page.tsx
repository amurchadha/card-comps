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
  { id: 'private', name: 'Private Sale', fee: 0, paymentFee: 0, note: 'Custom fees' },
];

type Mode = 'seller' | 'buyer';

export default function FeeCalcPage() {
  const [mode, setMode] = useState<Mode>('buyer');

  // Seller mode state
  const [salePrice, setSalePrice] = useState('');
  const [platform, setPlatform] = useState('ebay');
  const [shippingCost, setShippingCost] = useState('');
  const [customFee, setCustomFee] = useState('');
  const [costBasis, setCostBasis] = useState('');

  // Buyer mode state
  const [cardPrice, setCardPrice] = useState('');
  const [currency, setCurrency] = useState('EUR');
  const [shippingPaid, setShippingPaid] = useState('');
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [loadingRate, setLoadingRate] = useState(false);

  // Buyer fee options
  const [includePaypalFee, setIncludePaypalFee] = useState(true);
  const [includeConversionFee, setIncludeConversionFee] = useState(true);
  const [includeTariff, setIncludeTariff] = useState(true);
  const [customTariffRate, setCustomTariffRate] = useState('15');
  const [paypalFeeRate, setPaypalFeeRate] = useState('2.99');
  const [conversionFeeRate, setConversionFeeRate] = useState('4');

  // Fetch exchange rate when currency changes
  useEffect(() => {
    if (currency === 'USD') {
      setExchangeRate(1);
      return;
    }
    setLoadingRate(true);
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
  const currencyInfo = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];

  // Buyer calculations
  const buyerCalcs = useMemo(() => {
    const rawPrice = parseFloat(cardPrice) || 0;
    const shipping = parseFloat(shippingPaid) || 0;
    const tariffRate = parseFloat(customTariffRate) || 15;
    const paypalRate = parseFloat(paypalFeeRate) || 2.99;
    const conversionRate = parseFloat(conversionFeeRate) || 4;

    // Subtotal in foreign currency
    const subtotalForeign = rawPrice + shipping;

    // Convert to USD using market rate
    const marketRateUSD = exchangeRate ? subtotalForeign * exchangeRate : 0;

    // PayPal/payment conversion markup (they give you a worse rate)
    const conversionFee = includeConversionFee ? marketRateUSD * (conversionRate / 100) : 0;

    // What PayPal actually charges you (their inflated rate)
    const actualUSD = marketRateUSD + conversionFee;

    // PayPal G&S fee on the transaction
    const paypalFee = includePaypalFee ? actualUSD * (paypalRate / 100) + 0.49 : 0;

    // Total before tariff
    const totalBeforeTariff = actualUSD + paypalFee;

    // Import tariff (on declared value, usually card price only)
    const tariffBase = exchangeRate ? rawPrice * exchangeRate : 0;
    const tariffAmount = includeTariff ? tariffBase * (tariffRate / 100) : 0;

    // Grand total
    const totalCostUSD = totalBeforeTariff + tariffAmount;

    // Effective exchange rate you're paying
    const effectiveRate = subtotalForeign > 0 ? totalCostUSD / subtotalForeign : 0;

    // Markup over market rate
    const rateMarkup = exchangeRate && subtotalForeign > 0
      ? ((effectiveRate / exchangeRate) - 1) * 100
      : 0;

    return {
      rawPrice,
      shipping,
      subtotalForeign,
      marketRateUSD,
      conversionFee,
      actualUSD,
      paypalFee,
      totalBeforeTariff,
      tariffBase,
      tariffAmount,
      totalCostUSD,
      effectiveRate,
      rateMarkup,
      exchangeRate,
    };
  }, [cardPrice, shippingPaid, currency, exchangeRate, includePaypalFee, includeConversionFee, includeTariff, customTariffRate, paypalFeeRate, conversionFeeRate]);

  // Seller calculations
  const sellerCalcs = useMemo(() => {
    const sale = parseFloat(salePrice) || 0;
    const shipping = parseFloat(shippingCost) || 0;
    const cost = parseFloat(costBasis) || 0;

    let platformFee = 0;
    let paymentFee = 0;

    if (isPrivate) {
      platformFee = sale * ((parseFloat(customFee) || 0) / 100);
    } else {
      platformFee = sale * (selectedPlatform.fee / 100);
      paymentFee = sale * (selectedPlatform.paymentFee / 100);
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
      sale,
      platformFee,
      paymentFee,
      totalFees,
      netAfterFees,
      shipping,
      netAfterShipping,
      cost,
      profit,
      roi,
      effectiveFeeRate,
    };
  }, [salePrice, platform, shippingCost, customFee, costBasis, selectedPlatform, isPrivate]);

  const formatUSD = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatForeign = (amount: number) => {
    return `${currencyInfo.symbol}${amount.toFixed(2)}`;
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

        <div className="text-center mb-8">
          <span className="text-5xl mb-4 block">🧮</span>
          <h1 className="text-3xl font-bold text-white mb-2">Fee Calculator</h1>
          <p className="text-gray-400">Calculate buyer or seller fees for card transactions</p>
        </div>

        {/* Mode Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-900 rounded-lg p-1 inline-flex">
            <button
              onClick={() => setMode('buyer')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                mode === 'buyer'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              🛒 Buying
            </button>
            <button
              onClick={() => setMode('seller')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                mode === 'seller'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              💰 Selling
            </button>
          </div>
        </div>

        {/* BUYER MODE */}
        {mode === 'buyer' && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-6">Purchase Details</h2>

              {/* Currency Selection */}
              <div className="mb-5">
                <label className="block text-sm text-gray-400 mb-2">Seller&apos;s Currency</label>
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
                {exchangeRate && currency !== 'USD' && (
                  <p className="text-xs text-green-400 mt-1">Market rate: 1 {currency} = ${exchangeRate.toFixed(4)} USD</p>
                )}
              </div>

              {/* Card Price */}
              <div className="mb-5">
                <label className="block text-sm text-gray-400 mb-2">Card Price</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">{currencyInfo.symbol}</span>
                  <input
                    type="number"
                    step="0.01"
                    value={cardPrice}
                    onChange={(e) => setCardPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-8 pr-4 py-3 text-white text-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Shipping */}
              <div className="mb-5">
                <label className="block text-sm text-gray-400 mb-2">Shipping Cost</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">{currencyInfo.symbol}</span>
                  <input
                    type="number"
                    step="0.01"
                    value={shippingPaid}
                    onChange={(e) => setShippingPaid(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-8 pr-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Fee Options */}
              <div className="border-t border-gray-700 pt-5 mt-5">
                <h3 className="text-sm font-medium text-gray-400 mb-4">Fees & Charges</h3>

                {/* PayPal G&S */}
                <div className="mb-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includePaypalFee}
                      onChange={(e) => setIncludePaypalFee(e.target.checked)}
                      className="w-5 h-5 rounded bg-gray-800 border-gray-700 text-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-gray-300">PayPal G&S Fee</span>
                  </label>
                  {includePaypalFee && (
                    <div className="ml-8 mt-2 flex items-center gap-2">
                      <input
                        type="number"
                        step="0.01"
                        value={paypalFeeRate}
                        onChange={(e) => setPaypalFeeRate(e.target.value)}
                        className="w-20 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm"
                      />
                      <span className="text-gray-500 text-sm">% + $0.49</span>
                    </div>
                  )}
                </div>

                {/* Currency Conversion Fee */}
                {currency !== 'USD' && (
                  <div className="mb-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeConversionFee}
                        onChange={(e) => setIncludeConversionFee(e.target.checked)}
                        className="w-5 h-5 rounded bg-gray-800 border-gray-700 text-blue-500 focus:ring-blue-500"
                      />
                      <span className="text-gray-300">Currency Conversion Markup</span>
                    </label>
                    {includeConversionFee && (
                      <div className="ml-8 mt-2 flex items-center gap-2">
                        <input
                          type="number"
                          step="0.1"
                          value={conversionFeeRate}
                          onChange={(e) => setConversionFeeRate(e.target.value)}
                          className="w-20 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm"
                        />
                        <span className="text-gray-500 text-sm">% (PayPal typically charges 3-4%)</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Import Tariff */}
                <div className="mb-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeTariff}
                      onChange={(e) => setIncludeTariff(e.target.checked)}
                      className="w-5 h-5 rounded bg-gray-800 border-gray-700 text-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-gray-300">Import Tariff (US)</span>
                  </label>
                  {includeTariff && (
                    <div className="ml-8 mt-2 flex items-center gap-2">
                      <input
                        type="number"
                        step="1"
                        value={customTariffRate}
                        onChange={(e) => setCustomTariffRate(e.target.value)}
                        className="w-20 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm"
                      />
                      <span className="text-gray-500 text-sm">% on card value</span>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-1 ml-8">Customs duty on imports over $800</p>
                </div>
              </div>
            </div>

            {/* Results Section */}
            <div className="space-y-4">
              {/* Main Result */}
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
                <div className="text-center">
                  <div className="text-sm text-gray-400 mb-1">Total Cost (USD)</div>
                  <div className="text-4xl font-bold text-white mb-2">
                    {formatUSD(buyerCalcs.totalCostUSD)}
                  </div>
                  {buyerCalcs.subtotalForeign > 0 && currency !== 'USD' && (
                    <div className="text-gray-400">
                      for {formatForeign(buyerCalcs.subtotalForeign)} {currency}
                    </div>
                  )}
                  {buyerCalcs.rateMarkup > 0 && (
                    <div className="text-orange-400 text-sm mt-2">
                      +{buyerCalcs.rateMarkup.toFixed(1)}% over market rate
                    </div>
                  )}
                </div>
              </div>

              {/* Breakdown */}
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                <h3 className="text-sm font-medium text-gray-400 mb-4 uppercase tracking-wide">Breakdown</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Card Price</span>
                    <span className="text-white">{formatForeign(buyerCalcs.rawPrice)}</span>
                  </div>
                  {buyerCalcs.shipping > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Shipping</span>
                      <span className="text-white">{formatForeign(buyerCalcs.shipping)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-700 pt-3 flex justify-between">
                    <span className="text-gray-400">Subtotal ({currency})</span>
                    <span className="text-white font-medium">{formatForeign(buyerCalcs.subtotalForeign)}</span>
                  </div>

                  {currency !== 'USD' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-400">@ Market Rate</span>
                        <span className="text-white">{formatUSD(buyerCalcs.marketRateUSD)}</span>
                      </div>
                      {buyerCalcs.conversionFee > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Conversion Fee ({conversionFeeRate}%)</span>
                          <span className="text-red-400">+{formatUSD(buyerCalcs.conversionFee)}</span>
                        </div>
                      )}
                    </>
                  )}

                  {buyerCalcs.paypalFee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">PayPal G&S ({paypalFeeRate}% + $0.49)</span>
                      <span className="text-red-400">+{formatUSD(buyerCalcs.paypalFee)}</span>
                    </div>
                  )}

                  {buyerCalcs.tariffAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Import Tariff ({customTariffRate}%)</span>
                      <span className="text-red-400">+{formatUSD(buyerCalcs.tariffAmount)}</span>
                    </div>
                  )}

                  <div className="border-t border-gray-700 pt-3 flex justify-between">
                    <span className="text-white font-medium">Total Cost (USD)</span>
                    <span className="text-white font-bold">{formatUSD(buyerCalcs.totalCostUSD)}</span>
                  </div>
                </div>
              </div>

              {/* Effective Rate */}
              {currency !== 'USD' && buyerCalcs.effectiveRate > 0 && (
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Effective Exchange Rate</span>
                    <span className="text-white font-semibold">1 {currency} = ${buyerCalcs.effectiveRate.toFixed(4)} USD</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-gray-400 text-sm">Market Rate</span>
                    <span className="text-green-400 font-semibold">1 {currency} = ${exchangeRate?.toFixed(4)} USD</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SELLER MODE */}
        {mode === 'seller' && (
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
                  <label className="block text-sm text-gray-400 mb-2">Custom Fee %</label>
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
                  <p className="text-xs text-gray-500 mt-1">PayPal G&S: 2.89% + $0.49 • Venmo: 1.9% + $0.10</p>
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
                <label className="block text-sm text-gray-400 mb-2">Cost Basis (for profit calc)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
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
            </div>

            {/* Results Section */}
            <div className="space-y-4">
              {/* Main Result */}
              <div className={`rounded-xl p-6 ${sellerCalcs.profit >= 0 || sellerCalcs.cost === 0 ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
                <div className="text-center">
                  <div className="text-sm text-gray-400 mb-1">You Keep</div>
                  <div className="text-4xl font-bold text-white mb-2">
                    {formatUSD(sellerCalcs.netAfterShipping)}
                  </div>
                  {sellerCalcs.cost > 0 && (
                    <div className={`text-lg font-semibold ${sellerCalcs.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {sellerCalcs.profit >= 0 ? '+' : ''}{formatUSD(sellerCalcs.profit)} profit
                      <span className="text-sm ml-2">({sellerCalcs.roi >= 0 ? '+' : ''}{sellerCalcs.roi.toFixed(1)}% ROI)</span>
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
                    <span className="text-white font-medium">{formatUSD(sellerCalcs.sale)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Platform Fee ({selectedPlatform.fee}%)</span>
                    <span className="text-red-400">-{formatUSD(sellerCalcs.platformFee)}</span>
                  </div>
                  {sellerCalcs.paymentFee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Payment Processing</span>
                      <span className="text-red-400">-{formatUSD(sellerCalcs.paymentFee)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-700 pt-3 flex justify-between">
                    <span className="text-gray-400">After Fees</span>
                    <span className="text-white">{formatUSD(sellerCalcs.netAfterFees)}</span>
                  </div>
                  {sellerCalcs.shipping > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Shipping Cost</span>
                      <span className="text-red-400">-{formatUSD(sellerCalcs.shipping)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-700 pt-3 flex justify-between">
                    <span className="text-white font-medium">Net Proceeds</span>
                    <span className="text-white font-bold">{formatUSD(sellerCalcs.netAfterShipping)}</span>
                  </div>
                  {sellerCalcs.cost > 0 && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Cost Basis</span>
                        <span className="text-gray-300">-{formatUSD(sellerCalcs.cost)}</span>
                      </div>
                      <div className="border-t border-gray-700 pt-3 flex justify-between">
                        <span className={`font-medium ${sellerCalcs.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {sellerCalcs.profit >= 0 ? 'Profit' : 'Loss'}
                        </span>
                        <span className={`font-bold ${sellerCalcs.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {sellerCalcs.profit >= 0 ? '+' : ''}{formatUSD(sellerCalcs.profit)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Effective Rate */}
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-center">
                <span className="text-gray-400 text-sm">Effective Fee Rate: </span>
                <span className="text-white font-semibold">{sellerCalcs.effectiveFeeRate.toFixed(2)}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Platform Comparison (Seller Mode Only) */}
        {mode === 'seller' && (
          <div className="mt-12 bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Platform Comparison</h2>
            <p className="text-gray-400 text-sm mb-6">How much you&apos;d keep on each platform for a {formatUSD(sellerCalcs.sale || 100)} sale:</p>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
              {PLATFORMS.filter(p => p.id !== 'private').map((p) => {
                const sale = sellerCalcs.sale || 100;
                const fees = sale * ((p.fee + p.paymentFee) / 100) + (p.id === 'mercari' ? 0.5 : 0);
                const net = sale - fees;
                return (
                  <div key={p.id} className={`p-4 rounded-lg ${platform === p.id ? 'bg-green-500/20 border border-green-500/30' : 'bg-gray-800/50'}`}>
                    <div className="text-sm text-gray-400 mb-1">{p.name}</div>
                    <div className="text-xl font-bold text-white">{formatUSD(net)}</div>
                    <div className="text-xs text-red-400">-{formatUSD(fees)} fees</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
