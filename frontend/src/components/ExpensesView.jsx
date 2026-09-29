import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingDown, 
  PieChart, 
  Plus, 
  Trash2, 
  Calendar, 
  CreditCard, 
  AlertCircle,
  Hotel,
  Utensils,
  Car,
  Ticket,
  ShoppingBag,
  MoreHorizontal,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { api } from '../api';
import PaymentModal from './PaymentModal';
import { useCurrency } from '../context/CurrencyContext';

export default function ExpensesView({ trip, onRefreshTrip, currentUser }) {
  const { formatAmount, convertToINR, currencyInfo } = useCurrency();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [newExpense, setNewExpense] = useState({
    title: '',
    amount: '',
    category: 'Food',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  if (!trip) {
    return (
      <div className="glass-panel text-center p-5">
        <h2>No Trip Selected</h2>
        <p className="text-secondary">Please select a trip to track its expenses.</p>
      </div>
    );
  }

  const expenses = trip.expenses || [];
  const budget = trip.budget || 0;
  const totalSpent = expenses.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  const remaining = budget - totalSpent;
  const percentSpent = budget > 0 ? Math.min(Math.round((totalSpent / budget) * 100), 100) : 0;
  const isOver = totalSpent > budget && budget > 0;

  // Category aggregations
  const categories = [
    { name: 'Accommodation', icon: Hotel, color: '#38bdf8' },
    { name: 'Food', icon: Utensils, color: '#f43f5e' },
    { name: 'Transport', icon: Car, color: '#a855f7' },
    { name: 'Activities', icon: Ticket, color: '#10b981' },
    { name: 'Shopping', icon: ShoppingBag, color: '#f59e0b' },
    { name: 'Other', icon: MoreHorizontal, color: '#94a3b8' }
  ];

  const categoryTotals = categories.map(cat => {
    const total = expenses
      .filter(e => e.category === cat.name)
      .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
    return {
      ...cat,
      total,
      percent: totalSpent > 0 ? Math.round((total / totalSpent) * 100) : 0
    };
  });

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!newExpense.title.trim() || !newExpense.amount) return;

    try {
      setSubmitting(true);
      const baseInrAmount = convertToINR(newExpense.amount);
      await api.addExpense(trip.id, {
        ...newExpense,
        amount: baseInrAmount
      });
      await onRefreshTrip(trip.id);
      setShowAddModal(false);
      setNewExpense({
        title: '',
        amount: '',
        category: 'Food',
        date: new Date().toISOString().split('T')[0],
        notes: ''
      });
    } catch (err) {
      alert(err.message || 'Failed to add expense');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!confirm('Delete this expense?')) return;
    try {
      await api.deleteExpense(expenseId);
      await onRefreshTrip(trip.id);
    } catch (err) {
      alert(err.message || 'Failed to delete expense');
    }
  };

  const getCategoryIcon = (catName) => {
    const found = categories.find(c => c.name === catName);
    const Icon = found ? found.icon : MoreHorizontal;
    return <Icon size={16} />;
  };

  return (
    <div className="expenses-view animate-fade-in">
      {/* Top Header */}
      <div className="section-header-row">
        <div>
          <h1 className="section-title">Budget & Expenses</h1>
          <p className="section-subtitle">Real-time financial tracking for {trip.destination}</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn btn-secondary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} />
            <span>Log Expense</span>
          </button>
          <button className="btn btn-primary btn-emerald-gradient" onClick={() => setShowPaymentModal(true)}>
            <CreditCard size={16} />
            <span>Pay & Auto-Split Budget</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="metrics-grid">
        <div className="metric-card glass-panel">
          <div className="metric-header">
            <span className="metric-title">Total Trip Budget</span>
            <div className="metric-icon-wrap bg-cyan-glow">
              <CreditCard size={18} className="text-cyan" />
            </div>
          </div>
          <div className="metric-value">{formatAmount(budget)}</div>
          <span className="metric-note">Target in {currencyInfo.code} ({currencyInfo.unitLabel})</span>
        </div>

        <div className="metric-card glass-panel">
          <div className="metric-header">
            <span className="metric-title">Total Spent</span>
            <div className="metric-icon-wrap bg-purple-glow">
              <TrendingDown size={18} className="text-purple" />
            </div>
          </div>
          <div className="metric-value">{formatAmount(totalSpent)}</div>
          <span className="metric-note">{percentSpent}% of total budget used</span>
        </div>

        <div className="metric-card glass-panel">
          <div className="metric-header">
            <span className="metric-title">Remaining Balance</span>
            <div className={`metric-icon-wrap ${isOver ? 'bg-coral-glow' : 'bg-emerald-glow'}`}>
              <DollarSign size={18} className={isOver ? 'text-coral' : 'text-emerald'} />
            </div>
          </div>
          <div className={`metric-value ${isOver ? 'text-coral' : 'text-emerald'}`}>
            {formatAmount(remaining)}
          </div>
          <span className="metric-note">{isOver ? 'Exceeded by ' + formatAmount(Math.abs(remaining)) : 'Available to spend'}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="budget-bar-section glass-panel">
        <div className="budget-bar-header">
          <span>Overall Budget Utilization</span>
          <span className="font-semibold">{percentSpent}% spent</span>
        </div>
        <div className="budget-bar-track">
          <div 
            className={`budget-bar-fill ${isOver ? 'over-fill' : percentSpent > 80 ? 'warn-fill' : 'good-fill'}`} 
            style={{ width: `${percentSpent}%` }}
          ></div>
        </div>
        {isOver && (
          <div className="budget-warning-banner">
            <AlertCircle size={15} />
            <span>Warning: Total expenses have exceeded your set trip budget!</span>
          </div>
        )}
      </div>

      {/* Category Breakdown and Expense Log Layout */}
      <div className="expenses-content-grid">
        {/* Category Breakdown Card */}
        <div className="categories-card glass-panel">
          <div className="card-heading-row flex items-center justify-between mb-3">
            <h2 className="card-heading mb-0">Expenses by Category</h2>
            <button 
              className="btn btn-emerald btn-xs"
              onClick={() => setShowPaymentModal(true)}
              title="Make payment and split amount into these 6 categories"
            >
              <CreditCard size={12} />
              <span>Pay & Split</span>
            </button>
          </div>

          <div className="categories-list">
            {categoryTotals.map(cat => (
              <div key={cat.name} className="category-row">
                <div className="category-info">
                  <div className="category-icon" style={{ backgroundColor: `${cat.color}22`, color: cat.color }}>
                    <cat.icon size={16} />
                  </div>
                  <span className="category-name">{cat.name}</span>
                </div>
                <div className="category-amount-wrap">
                  <span className="category-amount">{formatAmount(cat.total)}</span>
                  <span className="category-percent">{cat.percent}%</span>
                </div>
              </div>
            ))}
          </div>

          {/* If all categories are currently zero, show quick allocation callout */}
          {totalSpent === 0 && (
            <div className="empty-category-split-callout glass-panel mt-3">
              <div className="callout-icon-circle">
                <CreditCard size={16} className="text-emerald" />
              </div>
              <div className="callout-body">
                <strong className="callout-title">All Categories Currently {currencyInfo.symbol}0 (0%)</strong>
                <p className="callout-desc">
                  Pay for this trip to automatically divide {formatAmount(budget)} across Accommodation (35%), Transport (25%), Food (18%), Activities (12%), Shopping (7%), and Other (3%), and send the invoice to your email.
                </p>
                <button className="btn btn-emerald btn-sm mt-2" onClick={() => setShowPaymentModal(true)}>
                  <span>Make Payment & Split Now</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Expense History List */}
        <div className="expenses-log-card glass-panel">
          <div className="log-header">
            <h2 className="card-heading">Expense History</h2>
            <span className="badge badge-cyan">{expenses.length} records</span>
          </div>

          {expenses.length === 0 ? (
            <div className="empty-expenses text-center p-4">
              <CreditCard size={32} className="text-dim mb-2 mx-auto" />
              <p className="text-secondary">No expenses logged yet.</p>
              <button className="btn btn-secondary btn-sm mt-2" onClick={() => setShowAddModal(true)}>
                Add First Expense
              </button>
            </div>
          ) : (
            <div className="expenses-table-wrap">
              <table className="expenses-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map(exp => (
                    <tr key={exp.id}>
                      <td>
                        <div className="exp-title-cell">
                          <strong>{exp.title}</strong>
                          {exp.notes && <span className="exp-note">{exp.notes}</span>}
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-cyan exp-cat-badge">
                          {getCategoryIcon(exp.category)}
                          <span>{exp.category}</span>
                        </span>
                      </td>
                      <td className="text-muted">{exp.date}</td>
                      <td className="font-bold">{formatAmount(exp.amount)}</td>
                      <td>
                        <button 
                          className="btn-icon btn-ghost text-coral-hover" 
                          onClick={() => handleDeleteExpense(exp.id)}
                          title="Remove expense"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Log Expense Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Log New Expense</h3>
              <button className="btn-icon btn-ghost" onClick={() => setShowAddModal(false)}>✕</button>
            </div>

            <form onSubmit={handleAddExpense} className="modal-form">
              <div className="form-group">
                <label className="form-label">Expense Title *</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Hotel reservation, Gelato in Roma, Train ticket"
                  className="form-input"
                  value={newExpense.title}
                  onChange={e => setNewExpense({ ...newExpense, title: e.target.value })}
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Amount ({currencyInfo.symbol} • {currencyInfo.unitLabel}) *</label>
                  <input 
                    type="number"
                    step="any"
                    required
                    placeholder="0"
                    className="form-input"
                    value={newExpense.amount}
                    onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select 
                    className="form-select"
                    value={newExpense.category}
                    onChange={e => setNewExpense({ ...newExpense, category: e.target.value })}
                  >
                    <option value="Accommodation">Accommodation</option>
                    <option value="Food">Food & Dining</option>
                    <option value="Transport">Transport</option>
                    <option value="Activities">Activities</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Date</label>
                <input 
                  type="date"
                  required
                  className="form-input"
                  value={newExpense.date}
                  onChange={e => setNewExpense({ ...newExpense, date: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Notes (Optional)</label>
                <input 
                  type="text"
                  placeholder="e.g. Split with Sarah, cash payment"
                  className="form-input"
                  value={newExpense.notes}
                  onChange={e => setNewExpense({ ...newExpense, notes: e.target.value })}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Record Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment & Category Auto-Split Modal */}
      <PaymentModal 
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        trip={trip}
        currentUser={currentUser}
        onPaymentSuccess={() => onRefreshTrip(trip.id)}
      />
    </div>
  );
}
