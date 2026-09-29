import React from 'react';
import { 
  Compass, 
  Luggage, 
  CalendarDays, 
  WalletCards, 
  CheckSquare, 
  Plus, 
  User, 
  LogOut, 
  Sparkles,
  MapPin,
  Mail,
  Globe
} from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';

export default function Navbar({
  activeTab,
  setActiveTab,
  user,
  onOpenAuth,
  onLogout,
  onOpenNewTrip,
  activeTrip,
  onOpenMailbox
}) {
  const { selectedCountry, setCountry, currencyInfo, availableCountries } = useCurrency();
  return (
    <header className="glass-header">
      <div className="navbar-container">
        {/* Brand */}
        <div className="navbar-brand" onClick={() => setActiveTab('explore')}>
          <div className="brand-icon-wrapper">
            <img src="/logo.png" alt="TripMate Logo" className="brand-logo-img" />
          </div>
          <div className="brand-text">
            <span className="brand-title">Trip<span className="brand-accent">Mate</span></span>
            <span className="brand-subtitle">Smart Travel Companion</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="nav-tabs" aria-label="Main Navigation">
          <button 
            id="nav-tab-explore"
            className={`nav-tab-btn ${activeTab === 'explore' ? 'active' : ''}`}
            onClick={() => setActiveTab('explore')}
          >
            <Compass size={17} />
            <span>Explore</span>
          </button>

          <button 
            id="nav-tab-trips"
            className={`nav-tab-btn ${activeTab === 'trips' ? 'active' : ''}`}
            onClick={() => setActiveTab('trips')}
          >
            <Luggage size={17} />
            <span>My Trips</span>
          </button>

          <button 
            id="nav-tab-itinerary"
            className={`nav-tab-btn ${activeTab === 'itinerary' ? 'active' : ''} ${!activeTrip ? 'disabled' : ''}`}
            onClick={() => activeTrip && setActiveTab('itinerary')}
            title={activeTrip ? `Itinerary for ${activeTrip.destination}` : 'Select a trip to view itinerary'}
          >
            <CalendarDays size={17} />
            <span>Itinerary</span>
            {activeTrip && <span className="tab-indicator-dot"></span>}
          </button>

          <button 
            id="nav-tab-expenses"
            className={`nav-tab-btn ${activeTab === 'expenses' ? 'active' : ''} ${!activeTrip ? 'disabled' : ''}`}
            onClick={() => activeTrip && setActiveTab('expenses')}
            title={activeTrip ? `Budget for ${activeTrip.destination}` : 'Select a trip to view expenses'}
          >
            <WalletCards size={17} />
            <span>Expenses</span>
          </button>

          <button 
            id="nav-tab-packing"
            className={`nav-tab-btn ${activeTab === 'packing' ? 'active' : ''} ${!activeTrip ? 'disabled' : ''}`}
            onClick={() => activeTrip && setActiveTab('packing')}
            title={activeTrip ? `Packing for ${activeTrip.destination}` : 'Select a trip to view packing list'}
          >
            <CheckSquare size={17} />
            <span>Packing</span>
          </button>
        </nav>

        {/* Right Actions */}
        <div className="navbar-actions">
          {activeTrip && (
            <div className="active-trip-pill" onClick={() => setActiveTab('itinerary')} title="Currently Selected Trip">
              <MapPin size={13} className="text-cyan" />
              <span className="active-trip-name">{activeTrip.destination}</span>
            </div>
          )}

          {/* Country / Currency Selector */}
          <div className="nav-currency-wrap" title={`Current Currency: ${currencyInfo.name} (${currencyInfo.symbol})`}>
            <Globe size={13} className="text-cyan nav-currency-icon" />
            <select
              value={selectedCountry}
              onChange={(e) => setCountry(e.target.value)}
              className="nav-currency-select"
              aria-label="Portal Currency Selector"
            >
              {availableCountries.map(c => (
                <option key={c.country} value={c.country}>
                  {c.flag} {c.code} ({c.symbol})
                </option>
              ))}
            </select>
          </div>

          <button 
            id="btn-mailbox"
            className="btn btn-secondary btn-sm mailbox-nav-btn"
            onClick={onOpenMailbox}
            title="View Payment Receipts, Emails & Invoices"
          >
            <Mail size={15} className="text-cyan" />
            <span>Mail</span>
          </button>

          <button 
            id="btn-plan-trip"
            className="btn btn-primary btn-sm"
            onClick={onOpenNewTrip}
          >
            <Plus size={16} />
            <span>Plan Trip</span>
          </button>

          {user ? (
            <div className="user-profile-menu">
              <div className="user-avatar-badge" title={`Signed in as ${user.name} (${user.gender === 'female' ? 'Female Anime Character: Aiko' : 'Male Anime Character: Kenji'})`}>
                <img 
                  src={user.avatar || (user.gender === 'female' ? 'https://api.dicebear.com/7.x/lorelei/svg?seed=Aiko' : 'https://api.dicebear.com/7.x/lorelei/svg?seed=Kenji')} 
                  alt={user.name} 
                  className="user-avatar-img anime-avatar-img"
                />
                <span className="user-name-short">{user.name.split(' ')[0]}</span>
              </div>
              <button 
                id="btn-logout" 
                className="btn-icon btn-ghost" 
                onClick={onLogout} 
                title="Sign out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button 
              id="btn-signin"
              className="btn btn-secondary btn-sm"
              onClick={onOpenAuth}
            >
              <User size={15} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
