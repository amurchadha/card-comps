'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect, useCallback } from 'react';
import { useApi } from '@/lib/api-client';

// Dynamic import to avoid SSR issues with Clerk
const AppNav = dynamic(() => import('@/components/app-nav').then(m => m.AppNav), { ssr: false });

interface InventoryItem {
  id: string;
  player_name: string;
  card_number: string;
  purchase_price: number;
  purchase_tax: number;
  shipping_paid: number;
  total_cost: number;
  purchase_date: string;
  purchase_source: string;
  purchase_platform: string;
  grade: string;
  grading_company: string;
  cert_number: string;
  notes: string;
  status: string;
  created_at: string;
}

interface CatalogCard {
  id: string;
  card_number: string;
  player_name: string;
  team: string;
  subset_name: string;
  is_rookie: boolean;
  is_autograph: boolean;
  card_sets: {
    id: string;
    name: string;
    year: string;
    manufacturer: string;
    product_line: string;
  };
}

const PLATFORMS = ['eBay', 'Whatnot', 'Mercari', 'COMC', 'MySlabs', 'Card Show', 'LCS', 'Trade', 'Other'];
const GRADING_COMPANIES = ['PSA', 'BGS', 'SGC', 'CGC', 'HGA', 'Raw'];

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const api = useApi();

  // Catalog search state
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [catalogQuery, setCatalogQuery] = useState('');
  const [catalogResults, setCatalogResults] = useState<CatalogCard[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    player_name: '',
    card_number: '',
    purchase_price: '',
    purchase_tax: '',
    shipping_paid: '',
    purchase_date: '',
    purchase_source: '',
    purchase_platform: '',
    grade: '',
    grading_company: '',
    cert_number: '',
    notes: '',
  });

  const fetchInventory = useCallback(async () => {
    try {
      const res = await api.get('/api/inventory');
      const data = await res.json();
      setItems(data.items || []);
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // Search catalog
  const searchCatalog = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setCatalogResults([]);
      return;
    }

    setCatalogLoading(true);
    try {
      const res = await fetch(`/api/catalog?q=${encodeURIComponent(query)}&limit=30`);
      const data = await res.json();
      setCatalogResults(data.cards || []);
    } catch (error) {
      console.error('Catalog search failed:', error);
      setCatalogResults([]);
    } finally {
      setCatalogLoading(false);
    }
  }, []);

  // Debounced catalog search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (catalogQuery) {
        searchCatalog(catalogQuery);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [catalogQuery, searchCatalog]);

  // Select card from catalog
  const selectFromCatalog = (card: CatalogCard) => {
    const setName = card.card_sets?.name || '';
    const cardDesc = [
      setName,
      card.card_number ? `#${card.card_number}` : '',
      card.subset_name && card.subset_name !== 'Base' ? card.subset_name : '',
      card.is_rookie ? 'RC' : '',
      card.is_autograph ? 'AUTO' : '',
    ].filter(Boolean).join(' ');

    setFormData(f => ({
      ...f,
      player_name: card.player_name,
      card_number: cardDesc.trim(),
      notes: card.team || '',
    }));

    setShowCatalogModal(false);
    setCatalogQuery('');
    setCatalogResults([]);
    setShowAddModal(true);
  };

  const resetForm = () => {
    setFormData({
      player_name: '',
      card_number: '',
      purchase_price: '',
      purchase_tax: '',
      shipping_paid: '',
      purchase_date: '',
      purchase_source: '',
      purchase_platform: '',
      grade: '',
      grading_company: '',
      cert_number: '',
      notes: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...formData,
      purchase_price: parseFloat(formData.purchase_price) || 0,
      purchase_tax: parseFloat(formData.purchase_tax) || 0,
      shipping_paid: parseFloat(formData.shipping_paid) || 0,
    };

    try {
      if (editingItem) {
        const res = await api.patch('/api/inventory', { id: editingItem.id, ...payload });
        if (res.ok) {
          fetchInventory();
          setEditingItem(null);
          setShowAddModal(false);
          resetForm();
        }
      } else {
        const res = await api.post('/api/inventory', payload);
        if (res.ok) {
          fetchInventory();
          setShowAddModal(false);
          resetForm();
        }
      }
    } catch (error) {
      console.error('Failed to save item:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this card from inventory?')) return;

    try {
      const res = await api.delete(`/api/inventory?id=${id}`);
      if (res.ok) {
        fetchInventory();
      }
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  const openEditModal = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      player_name: item.player_name || '',
      card_number: item.card_number || '',
      purchase_price: item.purchase_price?.toString() || '',
      purchase_tax: item.purchase_tax?.toString() || '',
      shipping_paid: item.shipping_paid?.toString() || '',
      purchase_date: item.purchase_date || '',
      purchase_source: item.purchase_source || '',
      purchase_platform: item.purchase_platform || '',
      grade: item.grade || '',
      grading_company: item.grading_company || '',
      cert_number: item.cert_number || '',
      notes: item.notes || '',
    });
    setShowAddModal(true);
  };

  const filteredItems = items.filter(item =>
    item.player_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.card_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.notes?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalValue = items.reduce((sum, item) => sum + (item.total_cost || 0), 0);
  const totalCards = items.length;

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
            <h1 className="text-3xl font-bold">Inventory</h1>
            <p className="text-gray-400 mt-1">Track your card collection</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowCatalogModal(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              <span>🔍</span> <span className="hidden sm:inline">Search</span> Catalog
            </button>
            <button
              onClick={() => { resetForm(); setEditingItem(null); setShowAddModal(true); }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              <span className="text-lg">+</span> <span className="hidden sm:inline">Add</span> Card
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <div className="text-gray-400 text-sm">Total Cards</div>
            <div className="text-2xl font-bold text-white">{totalCards}</div>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <div className="text-gray-400 text-sm">Total Invested</div>
            <div className="text-2xl font-bold text-blue-400">{formatMoney(totalValue)}</div>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <div className="text-gray-400 text-sm">Avg Cost/Card</div>
            <div className="text-2xl font-bold text-green-400">
              {formatMoney(totalCards > 0 ? totalValue / totalCards : 0)}
            </div>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <div className="text-gray-400 text-sm">Graded Cards</div>
            <div className="text-2xl font-bold text-purple-400">
              {items.filter(i => i.grading_company && i.grading_company !== 'Raw').length}
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by player, card number, or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-md bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Inventory List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-gray-900/30 border border-gray-800 rounded-xl">
            <div className="text-5xl mb-4">📦</div>
            <h2 className="text-xl text-gray-400 mb-2">
              {searchQuery ? 'No matching cards found' : 'No cards in inventory'}
            </h2>
            <p className="text-gray-600">
              {searchQuery ? 'Try a different search term' : 'Add your first card to start tracking'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate">{item.player_name}</h3>
                    {item.card_number && (
                      <p className="text-sm text-gray-400">#{item.card_number}</p>
                    )}
                  </div>
                  <div className="flex gap-1 ml-2">
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
                      title="Edit"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded transition-colors"
                      title="Delete"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Grade badge */}
                {item.grading_company && item.grade && (
                  <div className="mb-3">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-purple-600/20 text-purple-400 border border-purple-600/30">
                      {item.grading_company} {item.grade}
                    </span>
                  </div>
                )}

                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Cost Basis</span>
                    <span className="text-white font-medium">{formatMoney(item.total_cost)}</span>
                  </div>
                  {item.purchase_platform && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Source</span>
                      <span className="text-gray-300">{item.purchase_platform}</span>
                    </div>
                  )}
                  {item.purchase_date && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Purchased</span>
                      <span className="text-gray-300">
                        {new Date(item.purchase_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                {item.notes && (
                  <p className="mt-3 text-sm text-gray-500 border-t border-gray-800 pt-3 truncate">
                    {item.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">
                  {editingItem ? 'Edit Card' : 'Add Card'}
                </h2>
                <button
                  onClick={() => { setShowAddModal(false); setEditingItem(null); resetForm(); }}
                  className="text-gray-400 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Card Info */}
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Player Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.player_name}
                    onChange={(e) => setFormData(f => ({ ...f, player_name: e.target.value }))}
                    placeholder="e.g., Michael Jordan"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Card Description</label>
                  <input
                    type="text"
                    value={formData.card_number}
                    onChange={(e) => setFormData(f => ({ ...f, card_number: e.target.value }))}
                    placeholder="e.g., 1986 Fleer #57 Rookie"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>

                {/* Grading */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Grading Company</label>
                    <select
                      value={formData.grading_company}
                      onChange={(e) => setFormData(f => ({ ...f, grading_company: e.target.value }))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                    >
                      <option value="">Select...</option>
                      {GRADING_COMPANIES.map(gc => (
                        <option key={gc} value={gc}>{gc}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Grade</label>
                    <input
                      type="text"
                      value={formData.grade}
                      onChange={(e) => setFormData(f => ({ ...f, grade: e.target.value }))}
                      placeholder="e.g., 10, 9.5"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                {formData.grading_company && formData.grading_company !== 'Raw' && (
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Cert Number</label>
                    <input
                      type="text"
                      value={formData.cert_number}
                      onChange={(e) => setFormData(f => ({ ...f, cert_number: e.target.value }))}
                      placeholder="Certificate number"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                  </div>
                )}

                {/* Purchase Info */}
                <div className="border-t border-gray-800 pt-4">
                  <h3 className="text-sm font-medium text-gray-300 mb-3">Purchase Info</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Price</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.purchase_price}
                          onChange={(e) => setFormData(f => ({ ...f, purchase_price: e.target.value }))}
                          placeholder="0.00"
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-7 pr-3 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Tax</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.purchase_tax}
                          onChange={(e) => setFormData(f => ({ ...f, purchase_tax: e.target.value }))}
                          placeholder="0.00"
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-7 pr-3 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Shipping</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.shipping_paid}
                          onChange={(e) => setFormData(f => ({ ...f, shipping_paid: e.target.value }))}
                          placeholder="0.00"
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-7 pr-3 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Platform</label>
                    <select
                      value={formData.purchase_platform}
                      onChange={(e) => setFormData(f => ({ ...f, purchase_platform: e.target.value }))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                    >
                      <option value="">Select...</option>
                      {PLATFORMS.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Date</label>
                    <input
                      type="date"
                      value={formData.purchase_date}
                      onChange={(e) => setFormData(f => ({ ...f, purchase_date: e.target.value }))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(f => ({ ...f, notes: e.target.value }))}
                    placeholder="Any additional notes..."
                    rows={2}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => { setShowAddModal(false); setEditingItem(null); resetForm(); }}
                    className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  >
                    {editingItem ? 'Save Changes' : 'Add Card'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Catalog Search Modal */}
      {showCatalogModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Search Card Catalog</h2>
                <button
                  onClick={() => { setShowCatalogModal(false); setCatalogQuery(''); setCatalogResults([]); }}
                  className="text-gray-400 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <input
                type="text"
                value={catalogQuery}
                onChange={(e) => setCatalogQuery(e.target.value)}
                placeholder="Search by player name (e.g., Wembanyama, LeBron)..."
                autoFocus
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
              />
              <p className="text-xs text-gray-500 mt-2">
                Search our database of basketball card checklists. Select a card to pre-fill the inventory form.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {catalogLoading ? (
                <div className="flex justify-center py-8">
                  <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : catalogResults.length === 0 ? (
                <div className="text-center py-8">
                  {catalogQuery.length >= 2 ? (
                    <>
                      <div className="text-4xl mb-3">🔍</div>
                      <p className="text-gray-400">No cards found for &quot;{catalogQuery}&quot;</p>
                      <p className="text-gray-600 text-sm mt-1">Try a different search term</p>
                    </>
                  ) : (
                    <>
                      <div className="text-4xl mb-3">📚</div>
                      <p className="text-gray-400">Type at least 2 characters to search</p>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {catalogResults.map((card) => (
                    <button
                      key={card.id}
                      onClick={() => selectFromCatalog(card)}
                      className="w-full text-left p-3 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 hover:border-purple-600/50 rounded-lg transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-white">
                            {card.player_name}
                            {card.is_rookie && <span className="ml-2 px-1.5 py-0.5 text-xs bg-green-600/20 text-green-400 rounded">RC</span>}
                            {card.is_autograph && <span className="ml-1 px-1.5 py-0.5 text-xs bg-yellow-600/20 text-yellow-400 rounded">AUTO</span>}
                          </div>
                          <div className="text-sm text-gray-400 truncate">
                            {card.card_sets?.name} {card.card_number && `#${card.card_number}`}
                          </div>
                          {card.team && (
                            <div className="text-xs text-gray-500">{card.team}</div>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 ml-2">
                          {card.subset_name !== 'Base' && card.subset_name}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-700 bg-gray-900/50">
              <button
                onClick={() => { setShowCatalogModal(false); resetForm(); setShowAddModal(true); }}
                className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors text-sm"
              >
                Can&apos;t find it? Add card manually
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
