import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import TripCard from './components/TripCard';
import ExploreView from './components/ExploreView';
import ItineraryView from './components/ItineraryView';
import ExpensesView from './components/ExpensesView';
import PackingView from './components/PackingView';
import NewTripModal from './components/NewTripModal';
import AuthModal from './components/AuthModal';
import AuthPortal from './components/AuthPortal';
import MailboxModal from './components/MailboxModal';
import { api, getToken, setToken, removeToken } from './api';
import { Plus, Compass, Sparkles, Loader2, Plane, Calendar, Luggage } from 'lucide-react';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('explore');
  const [user, setUser] = useState(null);
  const [trips, setTrips] = useState([]);
  const [activeTrip, setActiveTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tripFilter, setTripFilter] = useState('all');

  // Modals
  const [showNewTripModal, setShowNewTripModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showMailboxModal, setShowMailboxModal] = useState(false);
  const [modalPrefillCountry, setModalPrefillCountry] = useState('');
  const [modalPrefillCity, setModalPrefillCity] = useState('');
  const [modalPrefillCost, setModalPrefillCost] = useState(null);
  const [modalPrefillCover, setModalPrefillCover] = useState('');

  const handleOpenCustomTripWithCountry = (country = '', city = '', cost = null, cover = '') => {
    setModalPrefillCountry(country);
    setModalPrefillCity(city);
    setModalPrefillCost(cost);
    setModalPrefillCover(cover);
    setShowNewTripModal(true);
  };

  // Initialize app
  useEffect(() => {
    initApp();
  }, []);

  const initApp = async () => {
    try {
      setLoading(true);
      // Enforce Login / Register first: Always clear any previous session when launching the web portal
      removeToken();
      setUser(null);
    } catch (err) {
      console.error('Initialization error:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const loadTrips = async () => {
    try {
      const res = await api.getTrips();
      const list = res.trips || [];
      setTrips(list);

      // Default active trip to the first trip if none is set
      if (list.length > 0 && !activeTrip) {
        await selectTrip(list[0]);
      }
    } catch (err) {
      console.error('Failed to load trips:', err);
    }
  };

  const selectTrip = async (tripItem) => {
    try {
      const res = await api.getTrip(tripItem.id);
      setActiveTrip(res.trip);
    } catch (err) {
      console.error('Failed to load full trip details:', err);
    }
  };

  const handleSelectTripAndNavigate = async (tripItem) => {
    await selectTrip(tripItem);
    setActiveTab('itinerary');
  };

  const handleRefreshActiveTrip = async (tripId) => {
    if (!tripId) return;
    try {
      const res = await api.getTrip(tripId);
      setActiveTrip(res.trip);
      // Also refresh summary list
      const listRes = await api.getTrips();
      setTrips(listRes.trips || []);
    } catch (err) {
      console.error('Error refreshing active trip:', err);
    }
  };

  const handleDeleteTrip = async (tripId) => {
    if (!confirm('Are you sure you want to delete this trip? All its itinerary and expenses will be removed.')) return;
    try {
      await api.deleteTrip(tripId);
      const updated = trips.filter(t => t.id !== tripId);
      setTrips(updated);
      if (activeTrip?.id === tripId) {
        if (updated.length > 0) {
          await selectTrip(updated[0]);
        } else {
          setActiveTrip(null);
          setActiveTab('explore');
        }
      }
    } catch (err) {
      alert(err.message || 'Failed to delete trip');
    }
  };

  const handleTripCreated = async (newTripId) => {
    await loadTrips();
    const res = await api.getTrip(newTripId);
    setActiveTrip(res.trip);
    setActiveTab('itinerary');
  };

  const handleLogout = () => {
    removeToken();
    setUser(null);
    setTrips([]);
    setActiveTrip(null);
    setActiveTab('explore');
  };

  const handleAuthSuccess = async (userData) => {
    setUser(userData);
    setShowAuthModal(false);
    await loadTrips();
  };

  const filteredTrips = trips.filter(t => {
    if (tripFilter === 'all') return true;
    return t.status === tripFilter;
  });

  // Loading state
  if (loading) {
    return (
      <div className="auth-portal-page">
        <div className="text-center p-5 animate-fade-in" style={{ zIndex: 10 }}>
          <Loader2 className="spinner mx-auto mb-3 text-cyan" size={44} />
          <h2 style={{ color: '#f8fafc', fontSize: '20px', fontWeight: 600 }}>Loading TripMate...</h2>
        </div>
      </div>
    );
  }

  // Enforce Login / Register screen first if user is not authenticated
  if (!user) {
    return <AuthPortal onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="app-wrapper">
      <Navbar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onOpenAuth={() => setShowAuthModal(true)}
        onLogout={handleLogout}
        onOpenNewTrip={() => setShowNewTripModal(true)}
        activeTrip={activeTrip}
        onOpenMailbox={() => setShowMailboxModal(true)}
      />

      <main className="main-content">
        {/* EXPLORE VIEW */}
        {activeTab === 'explore' && (
          <ExploreView 
            onTripCreated={handleTripCreated} 
            onOpenCustomTripWithCountry={handleOpenCustomTripWithCountry}
          />
        )}

            {/* MY TRIPS VIEW */}
            {activeTab === 'trips' && (
              <div className="my-trips-view animate-fade-in">
                <div className="trips-dashboard-header">
                  <div className="section-header-row">
                    <div>
                      <h1 className="section-title">My Travel Journeys</h1>
                      <p className="section-subtitle">
                        {trips.length} adventures planned and recorded
                      </p>
                    </div>

                    <button 
                      className="btn btn-primary"
                      onClick={() => setShowNewTripModal(true)}
                    >
                      <Plus size={16} />
                      <span>Plan New Trip</span>
                    </button>
                  </div>

                  <div className="trips-filter-tabs">
                    <button 
                      className={`trips-filter-btn ${tripFilter === 'all' ? 'active' : ''}`}
                      onClick={() => setTripFilter('all')}
                    >
                      All Trips ({trips.length})
                    </button>
                    <button 
                      className={`trips-filter-btn ${tripFilter === 'upcoming' ? 'active' : ''}`}
                      onClick={() => setTripFilter('upcoming')}
                    >
                      Upcoming
                    </button>
                    <button 
                      className={`trips-filter-btn ${tripFilter === 'completed' ? 'active' : ''}`}
                      onClick={() => setTripFilter('completed')}
                    >
                      Completed
                    </button>
                  </div>
                </div>

                {filteredTrips.length === 0 ? (
                  <div className="empty-trips-panel glass-panel text-center p-5">
                    <Plane size={48} className="text-cyan mx-auto mb-3" />
                    <h2>No trips found in this category</h2>
                    <p className="text-secondary mb-4">Start planning your dream itinerary today!</p>
                    <button className="btn btn-primary" onClick={() => setShowNewTripModal(true)}>
                      <Plus size={16} />
                      <span>Create Your First Trip</span>
                    </button>
                  </div>
                ) : (
                  <div className="trips-grid">
                    {filteredTrips.map(trip => (
                      <TripCard 
                        key={trip.id}
                        trip={trip}
                        isActive={activeTrip?.id === trip.id}
                        onSelect={handleSelectTripAndNavigate}
                        onDelete={handleDeleteTrip}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ITINERARY PLANNER VIEW */}
            {activeTab === 'itinerary' && (
              <ItineraryView 
                trip={activeTrip}
                onRefreshTrip={handleRefreshActiveTrip}
                allTrips={trips}
                onSelectTrip={selectTrip}
                onBackToTrips={() => setActiveTab('trips')}
              />
            )}

            {/* EXPENSES VIEW */}
            {activeTab === 'expenses' && (
              <ExpensesView 
                trip={activeTrip}
                onRefreshTrip={handleRefreshActiveTrip}
                currentUser={user}
              />
            )}

            {/* PACKING CHECKLIST VIEW */}
            {activeTab === 'packing' && (
              <PackingView 
                trip={activeTrip}
                onRefreshTrip={handleRefreshActiveTrip}
              />
            )}
      </main>

      {/* New Trip Modal */}
      <NewTripModal 
        isOpen={showNewTripModal}
        onClose={() => {
          setShowNewTripModal(false);
          setModalPrefillCountry('');
          setModalPrefillCity('');
          setModalPrefillCost(null);
          setModalPrefillCover('');
        }}
        onTripCreated={handleTripCreated}
        prefillCountry={modalPrefillCountry}
        prefillCity={modalPrefillCity}
        prefillCost={modalPrefillCost}
        prefillCover={modalPrefillCover}
      />

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Mailbox & Invoices Modal */}
      <MailboxModal 
        isOpen={showMailboxModal}
        onClose={() => setShowMailboxModal(false)}
        user={user}
        onOpenExpenses={() => setActiveTab('expenses')}
      />
    </div>
  );
}
