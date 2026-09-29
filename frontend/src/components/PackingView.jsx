import React, { useState } from 'react';
import { 
  CheckSquare, 
  Square, 
  Plus, 
  Trash2, 
  Briefcase, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck,
  FileCheck,
  Smartphone,
  Shirt,
  Sparkle
} from 'lucide-react';
import { api } from '../api';

export default function PackingView({ trip, onRefreshTrip }) {
  const [newItemName, setNewItemName] = useState('');
  const [newCategory, setNewCategory] = useState('Essentials');
  const [submitting, setSubmitting] = useState(false);

  if (!trip) {
    return (
      <div className="glass-panel text-center p-5">
        <h2>No Trip Selected</h2>
        <p className="text-secondary">Please select a trip to access its packing checklist.</p>
      </div>
    );
  }

  const packing = trip.packing || [];
  const packedCount = packing.filter(i => i.is_packed === 1).length;
  const totalCount = packing.length;
  const progressPercent = totalCount > 0 ? Math.round((packedCount / totalCount) * 100) : 0;

  const categories = ['Documents', 'Clothing', 'Electronics', 'Essentials', 'Toiletries'];

  const handleToggle = async (itemId) => {
    try {
      await api.togglePackingItem(itemId);
      await onRefreshTrip(trip.id);
    } catch (err) {
      alert(err.message || 'Failed to toggle item');
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    try {
      setSubmitting(true);
      await api.addPackingItem(trip.id, {
        item_name: newItemName.trim(),
        category: newCategory
      });
      setNewItemName('');
      await onRefreshTrip(trip.id);
    } catch (err) {
      alert(err.message || 'Failed to add item');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      await api.deletePackingItem(itemId);
      await onRefreshTrip(trip.id);
    } catch (err) {
      alert(err.message || 'Failed to remove item');
    }
  };

  const handleAddPreset = async (presetItems) => {
    try {
      for (const item of presetItems) {
        await api.addPackingItem(trip.id, item);
      }
      await onRefreshTrip(trip.id);
    } catch (err) {
      alert('Failed to add preset items');
    }
  };

  const beachPreset = [
    { category: 'Clothing', item_name: 'Swimsuits & Rash guards' },
    { category: 'Essentials', item_name: 'Reef-safe Sunscreen SPF 50' },
    { category: 'Clothing', item_name: 'Polarized Sunglasses & Sun Hat' },
    { category: 'Essentials', item_name: 'Quick-dry microfiber beach towel' }
  ];

  const techPreset = [
    { category: 'Electronics', item_name: 'Noise-cancelling headphones' },
    { category: 'Electronics', item_name: 'Multi-device charging hub' },
    { category: 'Electronics', item_name: '20,000mAh Power bank' }
  ];

  return (
    <div className="packing-view animate-fade-in">
      {/* Header */}
      <div className="section-header-row">
        <div>
          <h1 className="section-title">Packing Checklist</h1>
          <p className="section-subtitle">Ensure nothing stays behind for {trip.destination}</p>
        </div>
        <div className="packing-header-stats">
          <span className="badge badge-emerald">
            <CheckCircle2 size={14} />
            <span>{packedCount} / {totalCount} Packed</span>
          </span>
        </div>
      </div>

      {/* Progress Card */}
      <div className="packing-progress-panel glass-panel">
        <div className="progress-info-row">
          <div className="progress-text-block">
            <span className="progress-percent-large">{progressPercent}%</span>
            <span className="progress-label">Ready for Departure</span>
          </div>
          <p className="progress-sub">
            {progressPercent === 100 
              ? '🎉 All packed and ready to explore!' 
              : `${totalCount - packedCount} items remaining on your checklist.`}
          </p>
        </div>
        <div className="packing-track">
          <div 
            className="packing-fill" 
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Quick Presets */}
      <div className="presets-banner glass-panel">
        <div className="presets-title">
          <Sparkles size={16} className="text-amber" />
          <span>Quick Packing Presets:</span>
        </div>
        <div className="presets-chips">
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => handleAddPreset(beachPreset)}
          >
            + Beach & Sun Essentials
          </button>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => handleAddPreset(techPreset)}
          >
            + Digital Nomad & Tech Gear
          </button>
        </div>
      </div>

      {/* Add New Item Form */}
      <form onSubmit={handleAddItem} className="packing-add-bar glass-panel">
        <input 
          type="text"
          placeholder="Add an item to pack (e.g. Passport, Camera charger, Rain jacket)..."
          className="form-input packing-input"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
        />
        <select 
          className="form-select packing-cat-select"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
        >
          {categories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <button type="submit" className="btn btn-primary" disabled={submitting || !newItemName.trim()}>
          <Plus size={16} />
          <span>Add</span>
        </button>
      </form>

      {/* Categorized Checklist Cards */}
      <div className="packing-categories-grid">
        {categories.map(cat => {
          const items = packing.filter(i => i.category === cat);
          if (items.length === 0) return null;

          const catPacked = items.filter(i => i.is_packed === 1).length;

          return (
            <div key={cat} className="packing-cat-card glass-panel">
              <div className="cat-card-header">
                <h3 className="cat-name">{cat}</h3>
                <span className="cat-counter">{catPacked}/{items.length}</span>
              </div>

              <div className="cat-items-list">
                {items.map(item => (
                  <div 
                    key={item.id} 
                    className={`packing-item-row ${item.is_packed ? 'item-checked' : ''}`}
                    onClick={() => handleToggle(item.id)}
                  >
                    <div className="item-checkbox-wrap">
                      {item.is_packed ? (
                        <CheckSquare size={18} className="text-emerald" />
                      ) : (
                        <Square size={18} className="text-muted" />
                      )}
                    </div>
                    <span className="item-title">{item.item_name}</span>
                    <button 
                      className="btn-icon btn-ghost text-coral-hover item-del-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteItem(item.id);
                      }}
                      title="Remove item"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
