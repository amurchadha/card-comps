'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect, useCallback, useMemo } from 'react';

// Dynamic import to avoid SSR issues with Clerk
const AppNav = dynamic(() => import('@/components/app-nav').then(m => m.AppNav), { ssr: false });

interface Goal {
  id: string;
  player_name: string;
  card_description: string;
  set_name: string;
  parallel_name: string;
  target_price: number;
  current_funding: number;
  target_image_url: string;
  ebay_search_url: string;
  status: string;
  achieved_at: string;
  created_at: string;
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    player_name: '',
    card_description: '',
    set_name: '',
    parallel_name: '',
    target_price: '',
    current_funding: '',
    target_image_url: '',
    ebay_search_url: '',
  });

  const fetchGoals = useCallback(async () => {
    try {
      const res = await fetch('/api/goals');
      const data = await res.json();
      setGoals(data.goals || []);
    } catch (error) {
      console.error('Failed to fetch goals:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const resetForm = () => {
    setFormData({
      player_name: '',
      card_description: '',
      set_name: '',
      parallel_name: '',
      target_price: '',
      current_funding: '',
      target_image_url: '',
      ebay_search_url: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingGoal) {
        const res = await fetch('/api/goals', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingGoal.id,
            ...formData,
            target_price: parseFloat(formData.target_price) || 0,
            current_funding: parseFloat(formData.current_funding) || 0,
          }),
        });
        if (res.ok) {
          fetchGoals();
          setEditingGoal(null);
          setShowAddModal(false);
          resetForm();
        }
      } else {
        const res = await fetch('/api/goals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          fetchGoals();
          setShowAddModal(false);
          resetForm();
        }
      }
    } catch (error) {
      console.error('Failed to save goal:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this goal?')) return;

    try {
      const res = await fetch(`/api/goals?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchGoals();
      }
    } catch (error) {
      console.error('Failed to delete goal:', error);
    }
  };

  const handleAddFunding = async (goal: Goal, amount: number) => {
    try {
      const newFunding = (goal.current_funding || 0) + amount;
      const res = await fetch('/api/goals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: goal.id,
          current_funding: newFunding,
          target_price: goal.target_price,
          status: goal.status,
        }),
      });
      if (res.ok) {
        fetchGoals();
      }
    } catch (error) {
      console.error('Failed to add funding:', error);
    }
  };

  const openEditModal = (goal: Goal) => {
    setEditingGoal(goal);
    setFormData({
      player_name: goal.player_name || '',
      card_description: goal.card_description || '',
      set_name: goal.set_name || '',
      parallel_name: goal.parallel_name || '',
      target_price: goal.target_price?.toString() || '',
      current_funding: goal.current_funding?.toString() || '',
      target_image_url: goal.target_image_url || '',
      ebay_search_url: goal.ebay_search_url || '',
    });
    setShowAddModal(true);
  };

  // Stats
  const stats = useMemo(() => {
    const active = goals.filter(g => g.status === 'active');
    const achieved = goals.filter(g => g.status === 'achieved');
    const totalTarget = active.reduce((sum, g) => sum + (g.target_price || 0), 0);
    const totalFunded = active.reduce((sum, g) => sum + (g.current_funding || 0), 0);

    return {
      active: active.length,
      achieved: achieved.length,
      totalTarget,
      totalFunded,
      progress: totalTarget > 0 ? (totalFunded / totalTarget) * 100 : 0,
    };
  }, [goals]);

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  const activeGoals = goals.filter(g => g.status === 'active');
  const achievedGoals = goals.filter(g => g.status === 'achieved');

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <AppNav />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Grail Goals</h1>
            <p className="text-gray-400 mt-1">Save up for your dream cards</p>
          </div>
          <button
            onClick={() => { resetForm(); setEditingGoal(null); setShowAddModal(true); }}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            <span className="text-lg">+</span> New Goal
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <div className="text-gray-400 text-sm">Active Goals</div>
            <div className="text-2xl font-bold text-purple-400">{stats.active}</div>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <div className="text-gray-400 text-sm">Achieved</div>
            <div className="text-2xl font-bold text-green-400">{stats.achieved}</div>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <div className="text-gray-400 text-sm">Total Target</div>
            <div className="text-2xl font-bold text-white">{formatMoney(stats.totalTarget)}</div>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <div className="text-gray-400 text-sm">Overall Progress</div>
            <div className="text-2xl font-bold text-blue-400">{stats.progress.toFixed(0)}%</div>
          </div>
        </div>

        {/* Goals List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : goals.length === 0 ? (
          <div className="text-center py-16 bg-gray-900/30 border border-gray-800 rounded-xl">
            <div className="text-5xl mb-4">🎯</div>
            <h2 className="text-xl text-gray-400 mb-2">No goals yet</h2>
            <p className="text-gray-600">Create your first goal to start saving for a grail</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Active Goals */}
            {activeGoals.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-purple-400 mb-4">Active Goals</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {activeGoals.map((goal) => {
                    const progress = goal.target_price > 0
                      ? (goal.current_funding / goal.target_price) * 100
                      : 0;
                    const remaining = Math.max(0, goal.target_price - goal.current_funding);

                    return (
                      <div
                        key={goal.id}
                        className="bg-gray-900/50 border border-gray-800 rounded-xl p-5 hover:border-purple-600/50 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-white text-lg">{goal.player_name}</h3>
                            {goal.card_description && (
                              <p className="text-sm text-gray-400 mt-0.5">{goal.card_description}</p>
                            )}
                            {(goal.set_name || goal.parallel_name) && (
                              <p className="text-xs text-gray-500 mt-1">
                                {goal.set_name}{goal.parallel_name && ` - ${goal.parallel_name}`}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-1 ml-2">
                            <button
                              onClick={() => openEditModal(goal)}
                              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
                              title="Edit"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(goal.id)}
                              className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded transition-colors"
                              title="Delete"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        {/* Progress */}
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-400">
                              {formatMoney(goal.current_funding)} of {formatMoney(goal.target_price)}
                            </span>
                            <span className="text-purple-400 font-medium">{progress.toFixed(0)}%</span>
                          </div>
                          <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-500"
                              style={{ width: `${Math.min(100, progress)}%` }}
                            />
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            {formatMoney(remaining)} to go
                          </p>
                        </div>

                        {/* Quick add funding */}
                        <div className="flex gap-2">
                          {[10, 25, 50, 100].map((amount) => (
                            <button
                              key={amount}
                              onClick={() => handleAddFunding(goal, amount)}
                              className="flex-1 px-2 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 rounded transition-colors"
                            >
                              +${amount}
                            </button>
                          ))}
                        </div>

                        {/* eBay link */}
                        {goal.ebay_search_url && (
                          <a
                            href={goal.ebay_search_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300"
                          >
                            Search on eBay
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Achieved Goals */}
            {achievedGoals.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-green-400 mb-4">Achieved Goals</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {achievedGoals.map((goal) => (
                    <div
                      key={goal.id}
                      className="bg-green-900/20 border border-green-600/30 rounded-xl p-4"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">🏆</span>
                        <h3 className="font-semibold text-white">{goal.player_name}</h3>
                      </div>
                      {goal.card_description && (
                        <p className="text-sm text-gray-400">{goal.card_description}</p>
                      )}
                      <div className="mt-2 flex justify-between text-sm">
                        <span className="text-gray-500">Goal</span>
                        <span className="text-green-400 font-medium">{formatMoney(goal.target_price)}</span>
                      </div>
                      {goal.achieved_at && (
                        <p className="text-xs text-gray-600 mt-2">
                          Achieved {new Date(goal.achieved_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
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
                  {editingGoal ? 'Edit Goal' : 'New Goal'}
                </h2>
                <button
                  onClick={() => { setShowAddModal(false); setEditingGoal(null); resetForm(); }}
                  className="text-gray-400 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Player Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.player_name}
                    onChange={(e) => setFormData(f => ({ ...f, player_name: e.target.value }))}
                    placeholder="e.g., Michael Jordan"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Card Description</label>
                  <input
                    type="text"
                    value={formData.card_description}
                    onChange={(e) => setFormData(f => ({ ...f, card_description: e.target.value }))}
                    placeholder="e.g., 1986 Fleer #57 Rookie PSA 10"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Set Name</label>
                    <input
                      type="text"
                      value={formData.set_name}
                      onChange={(e) => setFormData(f => ({ ...f, set_name: e.target.value }))}
                      placeholder="e.g., 1986 Fleer"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Parallel</label>
                    <input
                      type="text"
                      value={formData.parallel_name}
                      onChange={(e) => setFormData(f => ({ ...f, parallel_name: e.target.value }))}
                      placeholder="e.g., Base"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Target Price *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={formData.target_price}
                        onChange={(e) => setFormData(f => ({ ...f, target_price: e.target.value }))}
                        placeholder="0.00"
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-7 pr-3 py-2 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Current Funding</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.current_funding}
                        onChange={(e) => setFormData(f => ({ ...f, current_funding: e.target.value }))}
                        placeholder="0.00"
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-7 pr-3 py-2 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">eBay Search URL (optional)</label>
                  <input
                    type="url"
                    value={formData.ebay_search_url}
                    onChange={(e) => setFormData(f => ({ ...f, ebay_search_url: e.target.value }))}
                    placeholder="https://www.ebay.com/sch/..."
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Add an eBay search URL to quickly check listings
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => { setShowAddModal(false); setEditingGoal(null); resetForm(); }}
                    className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
                  >
                    {editingGoal ? 'Save Changes' : 'Create Goal'}
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
