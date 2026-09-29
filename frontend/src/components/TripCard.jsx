import React from 'react';
import { 
  Calendar, 
  MapPin, 
  DollarSign, 
  CheckCircle2, 
  ListTodo, 
  Trash2, 
  ArrowRight,
  Users
} from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';

export default function TripCard({ trip, onSelect, onDelete, isActive }) {
  const { formatAmount } = useCurrency();
  const spent = trip.total_spent || 0;
  const budget = trip.budget || 0;
  const budgetPercent = budget > 0 ? Math.min(Math.round((spent / budget) * 100), 100) : 0;
  const isOverBudget = budget > 0 && spent > budget;

  // Format dates
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="badge badge-emerald">Completed</span>;
      case 'active':
        return <span className="badge badge-cyan">In Progress</span>;
      default:
        return <span className="badge badge-amber">Upcoming</span>;
    }
  };

  return (
    <div className={`trip-card glass-panel ${isActive ? 'active-trip-card' : ''}`}>
      {/* Cover Image */}
      <div className="trip-card-image-wrap">
        <img 
          src={trip.cover_image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80'} 
          alt={trip.title} 
          className="trip-card-image"
          loading="lazy"
        />
        <div className="trip-card-image-gradient"></div>
        <div className="trip-card-badges">
          {getStatusBadge(trip.status)}
          <span className="badge badge-purple">
            <Users size={12} /> {trip.trip_type || 'Solo'}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="trip-card-body">
        <div className="trip-card-header">
          <div className="trip-card-location">
            <MapPin size={14} className="text-cyan" />
            <span>{trip.destination}{trip.country ? `, ${trip.country}` : ''}</span>
          </div>
          <h3 className="trip-card-title">{trip.title}</h3>
        </div>

        <div className="trip-card-date">
          <Calendar size={14} />
          <span>{formatDate(trip.start_date)} — {formatDate(trip.end_date)}</span>
        </div>

        {/* Budget Progress */}
        <div className="trip-card-budget">
          <div className="budget-labels">
            <span className="budget-spent-text">
              <strong>{formatAmount(spent)}</strong> spent
            </span>
            <span className="budget-total-text">of {formatAmount(budget)}</span>
          </div>
          <div className="budget-progress-track">
            <div 
              className={`budget-progress-fill ${isOverBudget ? 'over-budget' : budgetPercent > 80 ? 'near-budget' : 'healthy-budget'}`}
              style={{ width: `${budgetPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Quick Highlights */}
        <div className="trip-card-stats">
          <div className="trip-stat-pill" title="Scheduled Activities">
            <ListTodo size={14} />
            <span>{trip.activity_count || 0} activities</span>
          </div>
          <div className="trip-stat-pill" title="Packing Items Packed">
            <CheckCircle2 size={14} />
            <span>{trip.packed_count || 0}/{trip.packing_count || 0} packed</span>
          </div>
        </div>

        {/* Actions */}
        <div className="trip-card-actions">
          <button 
            className="btn btn-secondary btn-sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(trip.id);
            }}
            title="Delete Trip"
          >
            <Trash2 size={14} className="text-muted hover-coral" />
          </button>

          <button 
            className="btn btn-primary btn-sm btn-plan-action"
            onClick={() => onSelect(trip)}
          >
            <span>Open Itinerary</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
