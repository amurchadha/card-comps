'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface GradingPreset {
  company: string;
  service_level: string;
  base_fee: number;
  estimated_turnaround_days: number;
  notes: string;
}

interface GradeScenario {
  grade: string;
  company: string;
  avgPrice: number | null;
  salesCount: number;
  netProfit: number | null;
  roi: number | null;
}

const SUPPLY_COST_DEFAULT = 3; // Penny sleeve + toploader + team bag
const SHIPPING_TO_GRADER_DEFAULT = 12;
const SHIPPING_FROM_GRADER_DEFAULT = 15;

export default function GradeCalcPage() {
  const [presets, setPresets] = useState<GradingPreset[]>([]);
  const [loading, setLoading] = useState(false);

  // Form state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCard, setSelectedCard] = useState<{ player: string; set: string; cardNumber: string } | null>(null);
  const [rawPurchasePrice, setRawPurchasePrice] = useState<string>('');
  const [purchaseShipping, setPurchaseShipping] = useState<string>('');
  const [purchaseTax, setPurchaseTax] = useState<string>('');
  const [gradingCompany, setGradingCompany] = useState<string>('PSA');
  const [serviceLevel, setServiceLevel] = useState<string>('Value');
  const [supplyCosts, setSupplyCosts] = useState<string>(SUPPLY_COST_DEFAULT.toString());
  const [inboundShipping, setInboundShipping] = useState<string>(SHIPPING_TO_GRADER_DEFAULT.toString());
  const [outboundShipping, setOutboundShipping] = useState<string>(SHIPPING_FROM_GRADER_DEFAULT.toString());

  // Results
  const [scenarios, setScenarios] = useState<GradeScenario[]>([]);
  const [calculated, setCalculated] = useState(false);

  // Fetch grading presets
  useEffect(() => {
    fetch('/api/grading-presets')
      .then(res => res.json())
      .then(data => setPresets(data.presets || []))
      .catch(() => setPresets([]));
  }, []);

  // Get available service levels for selected company
  const serviceLevels = presets
    .filter(p => p.company === gradingCompany)
    .map(p => p.service_level);

  // Get selected preset
  const selectedPreset = presets.find(
    p => p.company === gradingCompany && p.service_level === serviceLevel
  );

  // Calculate total cost basis
  const gradingFee = selectedPreset?.base_fee || 0;
  const totalCostBasis =
    (parseFloat(rawPurchasePrice) || 0) +
    (parseFloat(purchaseShipping) || 0) +
    (parseFloat(purchaseTax) || 0) +
    gradingFee +
    (parseFloat(supplyCosts) || 0) +
    (parseFloat(inboundShipping) || 0) +
    (parseFloat(outboundShipping) || 0);

  const handleCalculate = async () => {
    if (!rawPurchasePrice || parseFloat(rawPurchasePrice) <= 0) {
      alert('Enter a purchase price');
      return;
    }

    setLoading(true);
    setCalculated(false);

    try {
      // For now, generate mock scenarios
      // In production, this would fetch real comps from the pricing_data table
      const mockScenarios: GradeScenario[] = [
        { grade: '10', company: 'PSA', avgPrice: null, salesCount: 0, netProfit: null, roi: null },
        { grade: '9', company: 'PSA', avgPrice: null, salesCount: 0, netProfit: null, roi: null },
        { grade: '8', company: 'PSA', avgPrice: null, salesCount: 0, netProfit: null, roi: null },
        { grade: '9.5', company: 'BGS', avgPrice: null, salesCount: 0, netProfit: null, roi: null },
        { grade: '10', company: 'SGC', avgPrice: null, salesCount: 0, netProfit: null, roi: null },
        { grade: 'Raw', company: '-', avgPrice: null, salesCount: 0, netProfit: null, roi: null },
      ];

      // If we have a search query, try to fetch real pricing data
      if (searchQuery.length > 2) {
        const res = await fetch(`/api/grade-comps?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();

        if (data.comps) {
          for (const scenario of mockScenarios) {
            const key = scenario.grade === 'Raw' ? 'raw' : `${scenario.company.toLowerCase()}_${scenario.grade}`;
            const compData = data.comps[key];
            if (compData) {
              scenario.avgPrice = compData.avg;
              scenario.salesCount = compData.count;

              // Calculate profit (assuming 13% eBay fees + $5 shipping)
              const saleProceeds = compData.avg * 0.87 - 5;
              scenario.netProfit = saleProceeds - totalCostBasis;
              scenario.roi = totalCostBasis > 0 ? (scenario.netProfit / totalCostBasis) * 100 : 0;
            }
          }
        }
      }

      setScenarios(mockScenarios);
      setCalculated(true);
    } catch (error) {
      console.error('Calculation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val: number | null) => {
    if (val === null) return '-';
    return val >= 0 ? `$${val.toFixed(0)}` : `-$${Math.abs(val).toFixed(0)}`;
  };

  const getProfitColor = (val: number | null) => {
    if (val === null) return 'text-gray-500';
    if (val > 0) return 'text-green-400';
    if (val < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="bg-gray-900/50 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-xl font-bold text-white">Card Comps</Link>
            <div className="flex items-center gap-3">
              <Link href="/" className="text-sm text-gray-400 hover:text-white">Search</Link>
              <Link href="/labs" className="text-sm text-gray-400 hover:text-white">Labs</Link>
              <span className="text-sm text-white font-medium">Grade Calculator</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Should I Grade This?</h1>
          <p className="text-gray-400">Calculate potential ROI before sending cards to grading</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            {/* Card Search */}
            <div className="bg-gray-900 rounded-lg p-4">
              <h3 className="text-white font-medium mb-3">Card Details</h3>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search: Player name, set, year..."
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-2">Used to fetch market comps for different grades</p>
            </div>

            {/* Acquisition Costs */}
            <div className="bg-gray-900 rounded-lg p-4">
              <h3 className="text-white font-medium mb-3">Acquisition Costs</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-400">Raw Purchase Price *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={rawPurchasePrice}
                      onChange={(e) => setRawPurchasePrice(e.target.value)}
                      className="w-full pl-7 pr-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-gray-400">Shipping Paid</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">$</span>
                      <input
                        type="number"
                        value={purchaseShipping}
                        onChange={(e) => setPurchaseShipping(e.target.value)}
                        className="w-full pl-7 pr-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Tax Paid</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">$</span>
                      <input
                        type="number"
                        value={purchaseTax}
                        onChange={(e) => setPurchaseTax(e.target.value)}
                        className="w-full pl-7 pr-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Grading Costs */}
            <div className="bg-gray-900 rounded-lg p-4">
              <h3 className="text-white font-medium mb-3">Grading Costs</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-gray-400">Company</label>
                    <select
                      value={gradingCompany}
                      onChange={(e) => {
                        setGradingCompany(e.target.value);
                        const firstLevel = presets.find(p => p.company === e.target.value)?.service_level;
                        if (firstLevel) setServiceLevel(firstLevel);
                      }}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
                    >
                      {['PSA', 'BGS', 'SGC', 'CGC'].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Service Level</label>
                    <select
                      value={serviceLevel}
                      onChange={(e) => setServiceLevel(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
                    >
                      {serviceLevels.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {selectedPreset && (
                  <div className="bg-gray-800 rounded p-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Grading Fee:</span>
                      <span className="text-white font-medium">${selectedPreset.base_fee}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-400">Est. Turnaround:</span>
                      <span className="text-white">{selectedPreset.estimated_turnaround_days} days</span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-sm text-gray-400">Supplies</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">$</span>
                      <input
                        type="number"
                        value={supplyCosts}
                        onChange={(e) => setSupplyCosts(e.target.value)}
                        className="w-full pl-7 pr-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Ship To</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">$</span>
                      <input
                        type="number"
                        value={inboundShipping}
                        onChange={(e) => setInboundShipping(e.target.value)}
                        className="w-full pl-7 pr-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Ship Back</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">$</span>
                      <input
                        type="number"
                        value={outboundShipping}
                        onChange={(e) => setOutboundShipping(e.target.value)}
                        className="w-full pl-7 pr-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Calculate Button */}
            <button
              onClick={handleCalculate}
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Calculating...' : 'Calculate ROI'}
            </button>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {/* Cost Summary */}
            <div className="bg-gray-900 rounded-lg p-4">
              <h3 className="text-white font-medium mb-3">Total Cost Basis</h3>
              <div className="text-3xl font-bold text-white">${totalCostBasis.toFixed(2)}</div>
              <div className="mt-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Card + Shipping + Tax:</span>
                  <span className="text-white">
                    ${((parseFloat(rawPurchasePrice) || 0) + (parseFloat(purchaseShipping) || 0) + (parseFloat(purchaseTax) || 0)).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Grading ({gradingCompany} {serviceLevel}):</span>
                  <span className="text-white">${gradingFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Supplies + Shipping:</span>
                  <span className="text-white">
                    ${((parseFloat(supplyCosts) || 0) + (parseFloat(inboundShipping) || 0) + (parseFloat(outboundShipping) || 0)).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Grade Scenarios */}
            {calculated && (
              <div className="bg-gray-900 rounded-lg p-4">
                <h3 className="text-white font-medium mb-3">Grade Scenarios</h3>
                <p className="text-xs text-gray-500 mb-3">Assumes 13% eBay fees + $5 shipping on sale</p>

                <div className="space-y-2">
                  {scenarios.map((s, i) => (
                    <div
                      key={i}
                      className={`flex items-center justify-between p-3 rounded ${
                        s.netProfit !== null && s.netProfit > 0 ? 'bg-green-900/20 border border-green-800' : 'bg-gray-800'
                      }`}
                    >
                      <div>
                        <div className="text-white font-medium">
                          {s.company !== '-' ? `${s.company} ${s.grade}` : 'Sell Raw'}
                        </div>
                        {s.avgPrice !== null ? (
                          <div className="text-sm text-gray-400">
                            Avg: ${s.avgPrice.toFixed(0)} ({s.salesCount} sales)
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">No comp data</div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className={`font-bold ${getProfitColor(s.netProfit)}`}>
                          {formatCurrency(s.netProfit)}
                        </div>
                        {s.roi !== null && (
                          <div className={`text-sm ${getProfitColor(s.roi)}`}>
                            {s.roi > 0 ? '+' : ''}{s.roi.toFixed(0)}% ROI
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {scenarios.some(s => s.netProfit !== null && s.netProfit > 0) ? (
                  <div className="mt-4 p-3 bg-green-900/30 border border-green-700 rounded">
                    <div className="text-green-400 font-medium">Recommendation: Grade It</div>
                    <div className="text-sm text-gray-300 mt-1">
                      Profitable at {scenarios.filter(s => s.netProfit !== null && s.netProfit > 0).map(s => s.company !== '-' ? `${s.company} ${s.grade}` : 'Raw').join(', ')}
                    </div>
                  </div>
                ) : calculated && scenarios.every(s => s.avgPrice === null) ? (
                  <div className="mt-4 p-3 bg-yellow-900/30 border border-yellow-700 rounded">
                    <div className="text-yellow-400 font-medium">No Market Data</div>
                    <div className="text-sm text-gray-300 mt-1">
                      Search for a specific card to get comp data
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 p-3 bg-red-900/30 border border-red-700 rounded">
                    <div className="text-red-400 font-medium">Recommendation: Sell Raw</div>
                    <div className="text-sm text-gray-300 mt-1">
                      Grading costs exceed potential returns
                    </div>
                  </div>
                )}
              </div>
            )}

            {!calculated && (
              <div className="bg-gray-900 rounded-lg p-8 text-center">
                <div className="text-4xl mb-3">📊</div>
                <div className="text-gray-400">Enter costs and click Calculate</div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
