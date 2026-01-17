'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect, useCallback, useMemo } from 'react';

// Dynamic import to avoid SSR issues with Clerk
const AppNav = dynamic(() => import('@/components/app-nav').then(m => m.AppNav), { ssr: false });

interface InventoryItem {
  id: string;
  player_name: string;
  card_number: string;
  total_cost: number;
  grade: string;
  grading_company: string;
  status: string;
}

interface Transaction {
  id: string;
  type: string;
  platform: string;
  gross_amount: number;
  platform_fee_pct: number;
  platform_fees: number;
  shipping_cost: number;
  net_amount: number;
  cost_basis: number;
  profit: number;
  roi_pct: number;
  transaction_date: string;
  buyer_username: string;
  tracking_number: string;
  notes: string;
  inventory_id: string;
  inventory?: {
    player_name: string;
    card_number: string;
    grade: string;
    grading_company: string;
  };
  created_at: string;
}

const PLATFORMS = {
  ebay: { name: 'eBay', fee: 13.25 },
  whatnot: { name: 'Whatnot', fee: 12.8 },
  mercari: { name: 'Mercari', fee: 12.9 },
  comc: { name: 'COMC', fee: 7.5 },
  myslabs: { name: 'MySlabs', fee: 10 },
  private: { name: 'Private Sale', fee: 0 },
};

type PlatformKey = keyof typeof PLATFORMS;

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    inventory_id: '',
    platform: 'ebay' as PlatformKey,
    gross_amount: '',
    shipping_cost: '',
    cost_basis: '',
    transaction_date: new Date().toISOString().split('T')[0],
    buyer_username: '',
    tracking_number: '',
    notes: '',
  });

  const fetchData = useCallback(async () => {
    try {
      const [transRes, invRes] = await Promise.all([
        fetch('/api/transactions'),
        fetch('/api/inventory'),
      ]);
      const transData = await transRes.json();
      const invData = await invRes.json();
      setTransactions(transData.transactions || []);
      setInventory(invData.items || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Available inventory (not sold)
  const availableInventory = useMemo(() => {
    return inventory.filter(item => item.status !== 'sold');
  }, [inventory]);

  // Auto-populate cost basis when inventory item selected
  useEffect(() => {
    if (formData.inventory_id) {
      const item = inventory.find(i => i.id === formData.inventory_id);
      if (item) {
        setFormData(f => ({ ...f, cost_basis: item.total_cost.toString() }));
      }
    }
  }, [formData.inventory_id, inventory]);

  // Calculate live profit preview
  const profitPreview = useMemo(() => {
    const gross = parseFloat(formData.gross_amount) || 0;
    const feePct = PLATFORMS[formData.platform].fee;
    const fees = gross * (feePct / 100);
    const shipping = parseFloat(formData.shipping_cost) || 0;
    const net = gross - fees - shipping;
    const cost = parseFloat(formData.cost_basis) || 0;
    const profit = net - cost;
    const roi = cost > 0 ? (profit / cost) * 100 : 0;

    return { gross, feePct, fees, shipping, net, cost, profit, roi };
  }, [formData.gross_amount, formData.platform, formData.shipping_cost, formData.cost_basis]);

  const resetForm = () => {
    setFormData({
      inventory_id: '',
      platform: 'ebay',
      gross_amount: '',
      shipping_cost: '',
      cost_basis: '',
      transaction_date: new Date().toISOString().split('T')[0],
      buyer_username: '',
      tracking_number: '',
      notes: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          type: 'sale',
          platform_fee_pct: PLATFORMS[formData.platform].fee,
        }),
      });

      if (res.ok) {
        fetchData();
        setShowAddModal(false);
        resetForm();
      }
    } catch (error) {
      console.error('Failed to save transaction:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this transaction?')) return;

    try {
      const res = await fetch(`/api/transactions?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Failed to delete transaction:', error);
    }
  };

  // Stats
  const stats = useMemo(() => {
    const totalSales = transactions.reduce((sum, t) => sum + (t.gross_amount || 0), 0);
    const totalProfit = transactions.reduce((sum, t) => sum + (t.profit || 0), 0);
    const totalFees = transactions.reduce((sum, t) => sum + (t.platform_fees || 0), 0);
    const avgRoi = transactions.length > 0
      ? transactions.reduce((sum, t) => sum + (t.roi_pct || 0), 0) / transactions.length
      : 0;

    return { totalSales, totalProfit, totalFees, avgRoi, count: transactions.length };
  }, [transactions]);

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <AppNav />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Sales & Transactions</h1>
            <p className="text-gray-400 mt-1">Track your sales and profits</p>
          </div>
          <button
            onClick={() => { resetForm(); setShowAddModal(true); }}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            <span className="text-lg">+</span> Log Sale
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <div className="text-gray-400 text-sm">Total Sales</div>
            <div className="text-2xl font-bold text-white">{stats.count}</div>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <div className="text-gray-400 text-sm">Gross Revenue</div>
            <div className="text-2xl font-bold text-blue-400">{formatMoney(stats.totalSales)}</div>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <div className="text-gray-400 text-sm">Total Profit</div>
            <div className={`text-2xl font-bold ${stats.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatMoney(stats.totalProfit)}
            </div>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <div className="text-gray-400 text-sm">Platform Fees</div>
            <div className="text-2xl font-bold text-red-400">{formatMoney(stats.totalFees)}</div>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <div className="text-gray-400 text-sm">Avg ROI</div>
            <div className={`text-2xl font-bold ${stats.avgRoi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {stats.avgRoi.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Transactions List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-16 bg-gray-900/30 border border-gray-800 rounded-xl">
            <div className="text-5xl mb-4">💰</div>
            <h2 className="text-xl text-gray-400 mb-2">No sales recorded yet</h2>
            <p className="text-gray-600">Log your first sale to start tracking profits</p>
          </div>
        ) : (
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800 text-left">
                    <th className="px-4 py-3 text-sm font-medium text-gray-400">Card</th>
                    <th className="px-4 py-3 text-sm font-medium text-gray-400">Platform</th>
                    <th className="px-4 py-3 text-sm font-medium text-gray-400 text-right">Sale</th>
                    <th className="px-4 py-3 text-sm font-medium text-gray-400 text-right">Fees</th>
                    <th className="px-4 py-3 text-sm font-medium text-gray-400 text-right">Net</th>
                    <th className="px-4 py-3 text-sm font-medium text-gray-400 text-right">Cost</th>
                    <th className="px-4 py-3 text-sm font-medium text-gray-400 text-right">Profit</th>
                    <th className="px-4 py-3 text-sm font-medium text-gray-400 text-right">ROI</th>
                    <th className="px-4 py-3 text-sm font-medium text-gray-400">Date</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => (
                    <tr key={t.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                      <td className="px-4 py-3">
                        <div className="font-medium text-white">
                          {t.inventory?.player_name || t.notes || 'Unlisted Sale'}
                        </div>
                        {t.inventory?.card_number && (
                          <div className="text-xs text-gray-500">{t.inventory.card_number}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-300">{t.platform}</td>
                      <td className="px-4 py-3 text-right text-white">{formatMoney(t.gross_amount)}</td>
                      <td className="px-4 py-3 text-right text-red-400">-{formatMoney(t.platform_fees + t.shipping_cost)}</td>
                      <td className="px-4 py-3 text-right text-gray-300">{formatMoney(t.net_amount)}</td>
                      <td className="px-4 py-3 text-right text-gray-400">{formatMoney(t.cost_basis)}</td>
                      <td className={`px-4 py-3 text-right font-semibold ${t.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {t.profit >= 0 ? '+' : ''}{formatMoney(t.profit)}
                      </td>
                      <td className={`px-4 py-3 text-right ${t.roi_pct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {t.roi_pct >= 0 ? '+' : ''}{t.roi_pct?.toFixed(1)}%
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-sm">
                        {t.transaction_date ? new Date(t.transaction_date).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded transition-colors"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add Sale Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Log Sale</h2>
                <button
                  onClick={() => { setShowAddModal(false); resetForm(); }}
                  className="text-gray-400 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Link to inventory */}
                {availableInventory.length > 0 && (
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Link to Inventory (optional)</label>
                    <select
                      value={formData.inventory_id}
                      onChange={(e) => setFormData(f => ({ ...f, inventory_id: e.target.value }))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                    >
                      <option value="">-- Manual Entry --</option>
                      {availableInventory.map(item => (
                        <option key={item.id} value={item.id}>
                          {item.player_name} {item.card_number && `- ${item.card_number}`} ({formatMoney(item.total_cost)})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Platform */}
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Platform</label>
                  <select
                    value={formData.platform}
                    onChange={(e) => setFormData(f => ({ ...f, platform: e.target.value as PlatformKey }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  >
                    {Object.entries(PLATFORMS).map(([key, { name, fee }]) => (
                      <option key={key} value={key}>{name} ({fee}% fees)</option>
                    ))}
                  </select>
                </div>

                {/* Sale Amount */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Sale Price</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={formData.gross_amount}
                        onChange={(e) => setFormData(f => ({ ...f, gross_amount: e.target.value }))}
                        placeholder="0.00"
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-7 pr-3 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Shipping Cost</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.shipping_cost}
                        onChange={(e) => setFormData(f => ({ ...f, shipping_cost: e.target.value }))}
                        placeholder="0.00"
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-7 pr-3 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Cost Basis */}
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Cost Basis</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.cost_basis}
                      onChange={(e) => setFormData(f => ({ ...f, cost_basis: e.target.value }))}
                      placeholder="0.00"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-7 pr-3 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                {/* Live Profit Preview */}
                <div className={`p-4 rounded-lg ${profitPreview.profit >= 0 ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
                  <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Gross</span>
                      <span className="text-white">{formatMoney(profitPreview.gross)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Fees ({profitPreview.feePct}%)</span>
                      <span className="text-red-400">-{formatMoney(profitPreview.fees)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Shipping</span>
                      <span className="text-red-400">-{formatMoney(profitPreview.shipping)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Cost Basis</span>
                      <span className="text-gray-300">-{formatMoney(profitPreview.cost)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-700">
                    <span className="font-medium">Profit</span>
                    <div className="text-right">
                      <span className={`text-2xl font-bold ${profitPreview.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {profitPreview.profit >= 0 ? '+' : ''}{formatMoney(profitPreview.profit)}
                      </span>
                      <span className={`ml-2 text-sm ${profitPreview.roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        ({profitPreview.roi >= 0 ? '+' : ''}{profitPreview.roi.toFixed(1)}% ROI)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Sale Date</label>
                  <input
                    type="date"
                    value={formData.transaction_date}
                    onChange={(e) => setFormData(f => ({ ...f, transaction_date: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>

                {/* Notes */}
                {!formData.inventory_id && (
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Card Description</label>
                    <input
                      type="text"
                      value={formData.notes}
                      onChange={(e) => setFormData(f => ({ ...f, notes: e.target.value }))}
                      placeholder="e.g., 2023 Topps Chrome Wemby RC PSA 10"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => { setShowAddModal(false); resetForm(); }}
                    className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Log Sale
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
