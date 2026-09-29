import React, { useState } from 'react';
import { 
  Calendar, 
  MapPin, 
  Plus, 
  Clock, 
  DollarSign, 
  Trash2, 
  Tag, 
  FileText, 
  ChevronRight, 
  Sparkles,
  Printer,
  Compass,
  ArrowLeft
} from 'lucide-react';
import { api } from '../api';

export default function ItineraryView({ 
  trip, 
  onRefreshTrip, 
  allTrips, 
  onSelectTrip,
  onBackToTrips 
}) {
  const [selectedDay, setSelectedDay] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newActivity, setNewActivity] = useState({
    day_number: 1,
    time: '10:00 AM',
    activity: '',
    location: '',
    cost: '',
    category: 'Sightseeing',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  if (!trip) {
    return (
      <div className="empty-itinerary glass-panel text-center">
        <Compass size={48} className="text-cyan mx-auto mb-3" />
        <h2>No Trip Selected</h2>
        <p className="text-secondary mb-4">Select one of your trips or create a new one to view its itinerary.</p>
        <button className="btn btn-primary" onClick={onBackToTrips}>
          Browse My Trips
        </button>
      </div>
    );
  }

  const itinerary = trip.itinerary || [];
  
  // Calculate max day present in itinerary or default to 3
  const maxDay = Math.max(3, ...itinerary.map(i => i.day_number));
  const daysList = Array.from({ length: maxDay }, (_, i) => i + 1);

  const dayActivities = itinerary
    .filter(item => item.day_number === selectedDay)
    .sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

  const handleAddActivity = async (e) => {
    e.preventDefault();
    if (!newActivity.activity.trim()) return;

    try {
      setSubmitting(true);
      await api.addItineraryItem(trip.id, {
        ...newActivity,
        day_number: selectedDay,
        cost: parseFloat(newActivity.cost) || 0
      });
      await onRefreshTrip(trip.id);
      setShowAddModal(false);
      setNewActivity({
        day_number: selectedDay,
        time: '12:00 PM',
        activity: '',
        location: '',
        cost: '',
        category: 'Sightseeing',
        notes: ''
      });
    } catch (err) {
      alert(err.message || 'Failed to add activity');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteActivity = async (itemId) => {
    if (!confirm('Remove this activity from your itinerary?')) return;
    try {
      await api.deleteItineraryItem(itemId);
      await onRefreshTrip(trip.id);
    } catch (err) {
      alert(err.message || 'Failed to delete activity');
    }
  };

  const getCategoryBadgeClass = (category) => {
    switch (category) {
      case 'Food': return 'badge-coral';
      case 'Sightseeing': return 'badge-cyan';
      case 'Transport': return 'badge-purple';
      case 'Shopping': return 'badge-amber';
      default: return 'badge-emerald';
    }
  };

  const printItinerary = () => {
    window.print();
  };

  return (
    <div className="itinerary-view animate-fade-in">
      {/* Trip Banner Header */}
      <div className="itinerary-banner glass-panel">
        <div className="banner-bg-img" style={{ backgroundImage: `url(${trip.cover_image})` }}></div>
        <div className="banner-overlay"></div>
        
        <div className="banner-content">
          <div className="banner-top-row">
            <button className="btn btn-secondary btn-sm banner-back-btn" onClick={onBackToTrips}>
              <ArrowLeft size={14} />
              <span>All Trips</span>
            </button>

            {/* Trip Switcher Dropdown */}
            {allTrips && allTrips.length > 1 && (
              <div className="trip-switcher">
                <span className="switcher-label">Switch Trip:</span>
                <select 
                  value={trip.id} 
                  onChange={(e) => {
                    const selected = allTrips.find(t => t.id === e.target.value);
                    if (selected) onSelectTrip(selected);
                  }}
                  className="trip-switcher-select"
                >
                  {allTrips.map(t => (
                    <option key={t.id} value={t.id}>{t.destination} — {t.title}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="banner-main-info">
            <div className="banner-location">
              <MapPin size={16} className="text-cyan" />
              <span>{trip.destination}, {trip.country}</span>
              <span className="badge badge-purple ml-2">{trip.trip_type || 'Solo'}</span>
            </div>
            <h1 className="banner-title">{trip.title}</h1>
            
            <div className="banner-meta">
              <div className="meta-pill">
                <Calendar size={14} />
                <span>{trip.start_date} to {trip.end_date}</span>
              </div>
              <div className="meta-pill">
                <span>Budget: ₹{trip.budget?.toLocaleString('en-IN')} {trip.currency || 'INR'}</span>
              </div>
              {trip.notes && (
                <div className="meta-pill notes-pill" title={trip.notes}>
                  <FileText size={14} />
                  <span>{trip.notes}</span>
                </div>
              )}
            </div>
          </div>

          <div className="banner-actions">
            <button className="btn btn-secondary btn-sm" onClick={printItinerary} title="Print or save as PDF">
              <Printer size={15} />
              <span>Print Itinerary</span>
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>
              <Plus size={16} />
              <span>Add Activity</span>
            </button>
          </div>
        </div>
      </div>

      {/* Day Navigation Tabs */}
      <div className="day-selector-bar glass-panel">
        <div className="day-tabs-scroll">
          {daysList.map(day => {
            const count = itinerary.filter(i => i.day_number === day).length;
            return (
              <button
                key={day}
                className={`day-tab-btn ${selectedDay === day ? 'active' : ''}`}
                onClick={() => setSelectedDay(day)}
              >
                <span className="day-number">Day {day}</span>
                <span className="day-count-badge">{count} items</span>
              </button>
            );
          })}
          <button 
            className="day-tab-btn add-day-btn"
            onClick={() => setSelectedDay(daysList.length + 1)}
            title="Plan another day"
          >
            <Plus size={15} />
            <span>Add Day</span>
          </button>
        </div>
      </div>

      {/* Activities Timeline for Selected Day */}
      <div className="timeline-container">
        <div className="timeline-header-row">
          <div>
            <h2 className="timeline-title">Day {selectedDay} Schedule</h2>
            <p className="timeline-subtitle">{dayActivities.length} activities scheduled for this day</p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>
            <Plus size={15} />
            <span>Add Activity</span>
          </button>
        </div>

        {dayActivities.length === 0 ? (
          <div className="timeline-empty glass-panel text-center">
            <Calendar size={36} className="text-dim mb-2 mx-auto" />
            <h3>No activities planned for Day {selectedDay} yet</h3>
            <p className="text-secondary mb-3">Add sightseeing spots, restaurants, transport, or memorable experiences.</p>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>
              <Plus size={15} />
              <span>Add First Activity</span>
            </button>
          </div>
        ) : (
          <div className="timeline-list">
            {dayActivities.map((act, index) => (
              <div key={act.id} className="timeline-card glass-panel">
                <div className="timeline-bullet-wrapper">
                  <div className="timeline-bullet">
                    <span className="bullet-index">{index + 1}</span>
                  </div>
                  {index < dayActivities.length - 1 && <div className="timeline-line"></div>}
                </div>

                <div className="timeline-card-content">
                  <div className="card-top-row">
                    <div className="time-badge">
                      <Clock size={13} />
                      <span>{act.time || 'Anytime'}</span>
                    </div>
                    <span className={`badge ${getCategoryBadgeClass(act.category)}`}>
                      {act.category}
                    </span>
                    {act.cost > 0 && (
                      <span className="badge badge-emerald">
                        ₹{act.cost.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>

                  <h3 className="activity-title">{act.activity}</h3>

                  {act.location && (
                    <div className="activity-location">
                      <MapPin size={14} className="text-cyan" />
                      <span>{act.location}</span>
                    </div>
                  )}

                  {act.notes && (
                    <p className="activity-notes">
                      <FileText size={13} className="text-dim" />
                      <span>{act.notes}</span>
                    </p>
                  )}
                </div>

                <div className="timeline-card-actions">
                  <button 
                    className="btn-icon btn-ghost text-coral-hover"
                    onClick={() => handleDeleteActivity(act.id)}
                    title="Delete activity"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Activity Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Activity to Day {selectedDay}</h3>
              <button className="btn-icon btn-ghost" onClick={() => setShowAddModal(false)}>✕</button>
            </div>

            <form onSubmit={handleAddActivity} className="modal-form">
              <div className="form-group">
                <label className="form-label">Activity Title *</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Visit Louvre Museum, Sunset Tapas, Ferry to Capri"
                  className="form-input"
                  value={newActivity.activity}
                  onChange={e => setNewActivity({ ...newActivity, activity: e.target.value })}
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Time</label>
                  <input 
                    type="text"
                    placeholder="e.g. 10:00 AM or Morning"
                    className="form-input"
                    value={newActivity.time}
                    onChange={e => setNewActivity({ ...newActivity, time: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select 
                    className="form-select"
                    value={newActivity.category}
                    onChange={e => setNewActivity({ ...newActivity, category: e.target.value })}
                  >
                    <option value="Sightseeing">Sightseeing</option>
                    <option value="Food">Food & Dining</option>
                    <option value="Transport">Transport</option>
                    <option value="Activities">Activities & Tours</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Relaxation">Relaxation / Beach</option>
                  </select>
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Location / Address</label>
                  <input 
                    type="text"
                    placeholder="e.g. Rue de Rivoli, Paris"
                    className="form-input"
                    value={newActivity.location}
                    onChange={e => setNewActivity({ ...newActivity, location: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Estimated Cost (₹)</label>
                  <input 
                    type="number"
                    step="10"
                    placeholder="0"
                    className="form-input"
                    value={newActivity.cost}
                    onChange={e => setNewActivity({ ...newActivity, cost: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Notes & Booking Tips</label>
                <textarea 
                  rows={2}
                  placeholder="e.g. Entrance ticket QR saved in Apple Wallet, arrive 15 min early"
                  className="form-textarea"
                  value={newActivity.notes}
                  onChange={e => setNewActivity({ ...newActivity, notes: e.target.value })}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Adding...' : 'Add to Day Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
