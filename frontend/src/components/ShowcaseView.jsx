import React, { useState } from 'react';
import { 
  Bell, 
  Plane, 
  Car, 
  Landmark, 
  Mountain, 
  Calendar, 
  Compass, 
  User, 
  Home, 
  Sparkles, 
  Sun, 
  ChevronRight, 
  Users, 
  MapPin, 
  Plus, 
  DollarSign,
  Maximize2,
  Layers,
  ArrowRight,
  Eye,
  CheckCircle2
} from 'lucide-react';

export default function ShowcaseView({ 
  activeTrip, 
  onSelectTrip, 
  allTrips = [], 
  onOpenNewTrip,
  onOpenDetailedItinerary,
  onOpenExpenses 
}) {
  const [activeDayIndex, setActiveDayIndex] = useState(3); // Wednesday (Mountain)
  const [activeDockTab, setActiveDockTab] = useState('home'); // home, calendar, map, user
  const [selectedPin, setSelectedPin] = useState(null);
  const [deviceMode, setDeviceMode] = useState('tri-screen'); // 'tri-screen' or 'focused'
  const [activePaneIndex, setActivePaneIndex] = useState(0); // 0 = Left, 1 = Center, 2 = Right (for mobile focused mode)

  // Curated journeys matching user's image + INR
  const journeys = [
    {
      id: 'rome-escape',
      title: 'Rome & Mountain Escape',
      dates: '11–17 June',
      country: 'Italy',
      travelersCount: 5,
      theme: 'Culture & Mountains',
      weatherGreeting: {
        salute: 'Ciao 🇮🇹',
        city: 'Rome',
        country: 'Italy',
        time: '7:00 AM',
        temp: '25°C',
        condition: 'sunny ☀️'
      },
      heroImage: 'https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=1200&q=80',
      description: 'Discover 🌍 the timeless charm of Rome paired with breathtaking mountain landscapes for a perfect blend of 🎭 culture and nature 🌿',
      budgetINR: 210000,
      spentINR: 57000,
      avatars: [
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
        'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80'
      ],
      plannedCards: [
        {
          id: 'card-iceland',
          title: 'Frozen Iceland',
          dateDay: '07',
          dateMonth: 'March',
          avatarsCount: '+5',
          image: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=800&q=80',
          budgetINR: 165000,
          avatars: [
            'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
            'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80'
          ]
        },
        {
          id: 'card-morocco',
          title: 'Moroccan Desert',
          dateDay: '19',
          dateMonth: 'March',
          avatarsCount: '+9',
          image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80',
          budgetINR: 98000,
          avatars: [
            'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=100&q=80',
            'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80'
          ]
        }
      ],
      mapPins: [
        {
          id: 'pin-paris',
          name: 'Paris',
          dayDate: '28',
          top: '12%',
          left: '28%',
          rotation: '-5deg',
          image1: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=400&q=80',
          image2: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=400&q=80',
          highlights: 'Eiffel Tower & Louvre',
          costINR: 32000
        },
        {
          id: 'pin-zermatt',
          name: 'Zermatt',
          dayDate: '18',
          top: '38%',
          left: '18%',
          rotation: '4deg',
          image1: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=400&q=80',
          image2: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=400&q=80',
          highlights: 'Matterhorn Alpine Peak',
          costINR: 45000
        },
        {
          id: 'pin-vienna',
          name: 'Vienna',
          dayDate: '22',
          top: '26%',
          left: '70%',
          rotation: '-6deg',
          image1: 'https://images.unsplash.com/photo-1516550893923-42d28e5677af?auto=format&fit=crop&w=400&q=80',
          image2: 'https://images.unsplash.com/photo-1560969184-10fe8719e047?auto=format&fit=crop&w=400&q=80',
          highlights: 'Schönbrunn Palace',
          costINR: 28000
        },
        {
          id: 'pin-rome',
          name: 'Rome',
          dayDate: '13',
          top: '60%',
          left: '42%',
          rotation: '3deg',
          image1: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=400&q=80',
          image2: 'https://images.unsplash.com/photo-1531572753322-ad063cecc140?auto=format&fit=crop&w=400&q=80',
          highlights: 'Colosseum & Roman Forum',
          costINR: 38000
        }
      ]
    }
  ];

  const currentJourney = journeys[0];

  // Week days with icons matching image
  const weekDays = [
    { day: 'S', icon: Plane, label: 'Flight' },
    { day: 'M', icon: Car, label: 'Road' },
    { day: 'T', icon: Landmark, label: 'Museum' },
    { day: 'W', icon: Mountain, label: 'Hike', active: true },
    { day: 'T', number: 12, label: 'Day 12' },
    { day: 'F', number: 13, label: 'Day 13' },
    { day: 'S', number: 14, label: 'Day 14' }
  ];

  return (
    <div className="showcase-studio-wrapper">
      {/* Top Studio Control Bar */}
      <div className="studio-control-bar glass-panel">
        <div className="studio-left">
          <div className="studio-title-badge">
            <Sparkles size={14} className="text-amber" />
            <span>TripMate Luxury UI</span>
          </div>
          <span className="studio-subtext">3-Pane Experience with Live INR Currency</span>
        </div>

        <div className="studio-actions">
          <div className="view-mode-toggle">
            <button 
              className={`mode-btn ${deviceMode === 'tri-screen' ? 'active' : ''}`}
              onClick={() => setDeviceMode('tri-screen')}
            >
              <Layers size={14} />
              <span>Panoramic Showcase</span>
            </button>
            <button 
              className={`mode-btn ${deviceMode === 'focused' ? 'active' : ''}`}
              onClick={() => setDeviceMode('focused')}
            >
              <Maximize2 size={14} />
              <span>Interactive Phone</span>
            </button>
          </div>

          <button className="btn btn-primary btn-sm" onClick={onOpenNewTrip}>
            <Plus size={15} />
            <span>New Journey</span>
          </button>
        </div>
      </div>

      {/* If focused device mode on smaller view, pane selector tabs */}
      {deviceMode === 'focused' && (
        <div className="pane-switcher-bar">
          <button 
            className={`pane-switch-btn ${activePaneIndex === 0 ? 'active' : ''}`}
            onClick={() => setActivePaneIndex(0)}
          >
            1. Daily Pulse & Journeys
          </button>
          <button 
            className={`pane-switch-btn ${activePaneIndex === 1 ? 'active' : ''}`}
            onClick={() => setActivePaneIndex(1)}
          >
            2. Destination Hero & Story
          </button>
          <button 
            className={`pane-switch-btn ${activePaneIndex === 2 ? 'active' : ''}`}
            onClick={() => setActivePaneIndex(2)}
          >
            3. Visual Polaroid Map
          </button>
        </div>
      )}

      {/* Main Showcase Grid / Phones Container */}
      <div className={`showcase-panes-grid ${deviceMode === 'focused' ? 'focused-mode' : ''}`}>
        
        {/* =========================================================================
            PANE 1: DAILY PULSE & PLANNED JOURNEYS (LEFT SCREEN)
            ========================================================================= */}
        {(deviceMode === 'tri-screen' || activePaneIndex === 0) && (
          <div className="phone-device-frame screen-left animate-fade-in">
            <div className="device-screen-inner">
              {/* Header */}
              <div className="device-header-row">
                <div className="trip-breadcrumb" onClick={onOpenDetailedItinerary}>
                  <h3 className="trip-breadcrumb-title">
                    {currentJourney.title}
                    <ChevronRight size={16} className="inline-chevron" />
                  </h3>
                  <span className="trip-breadcrumb-dates">{currentJourney.dates}</span>
                </div>

                <div className="notification-bell-btn">
                  <Bell size={18} />
                  <span className="bell-badge-yellow">3</span>
                </div>
              </div>

              {/* Day of Week Selector Strip */}
              <div className="week-strip-container">
                {weekDays.map((item, idx) => {
                  const isSelected = activeDayIndex === idx;
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      className={`week-day-pill ${isSelected ? 'selected-day-pill' : ''}`}
                      onClick={() => setActiveDayIndex(idx)}
                    >
                      <span className="week-day-letter">{item.day}</span>
                      <div className="week-day-icon-circle">
                        {Icon ? (
                          <Icon size={14} />
                        ) : (
                          <span className="day-number-text">{item.number}</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Greeting & Real-time Weather Banner */}
              <div className="weather-greeting-box">
                <p className="greeting-text">
                  {currentJourney.weatherGreeting.salute} from <strong>{currentJourney.weatherGreeting.city}</strong>, {currentJourney.weatherGreeting.country}!
                  <br />
                  It's <strong>{currentJourney.weatherGreeting.time} ✨</strong>, <strong>{currentJourney.weatherGreeting.temp}</strong> and <strong>{currentJourney.weatherGreeting.condition}</strong> weather.
                </p>
              </div>

              {/* Planned Journeys Section */}
              <div className="planned-journeys-section">
                <div className="planned-header-row">
                  <h4 className="planned-title">Planned Journeys</h4>
                  <ChevronRight size={16} className="text-secondary" />
                </div>

                <div className="planned-cards-stack">
                  {currentJourney.plannedCards.map(card => (
                    <div key={card.id} className="planned-journey-card" onClick={onOpenDetailedItinerary}>
                      <img src={card.image} alt={card.title} className="planned-card-bg" />
                      <div className="planned-card-gradient"></div>
                      
                      <div className="planned-card-top">
                        <div className="planned-card-title-group">
                          <h5 className="planned-card-name">{card.title}</h5>
                          <div className="avatar-group-stack">
                            {card.avatars.map((av, i) => (
                              <img key={i} src={av} alt="Traveler" className="stack-avatar-circle" />
                            ))}
                            <span className="stack-count-circle">{card.avatarsCount}</span>
                          </div>
                        </div>

                        <div className="planned-date-box">
                          <span className="planned-date-day">{card.dateDay}</span>
                          <span className="planned-date-month">{card.dateMonth}</span>
                        </div>
                      </div>

                      <div className="planned-card-bottom-inr">
                        <span className="inr-tag">Budget: ₹{card.budgetINR.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating Bottom Navigation Pill Dock */}
              <div className="bottom-dock-wrapper">
                <div className="floating-dock-capsule">
                  <button 
                    className={`dock-btn ${activeDockTab === 'home' ? 'dock-btn-active-yellow' : ''}`}
                    onClick={() => setActiveDockTab('home')}
                  >
                    <Home size={18} />
                  </button>
                  <button 
                    className={`dock-btn ${activeDockTab === 'calendar' ? 'dock-btn-active-yellow' : ''}`}
                    onClick={() => {
                      setActiveDockTab('calendar');
                      onOpenDetailedItinerary();
                    }}
                  >
                    <Calendar size={18} />
                  </button>
                  <button 
                    className={`dock-btn ${activeDockTab === 'map' ? 'dock-btn-active-yellow' : ''}`}
                    onClick={() => {
                      setActiveDockTab('map');
                      if (deviceMode === 'focused') setActivePaneIndex(2);
                    }}
                  >
                    <Compass size={18} />
                  </button>
                  <button 
                    className={`dock-btn ${activeDockTab === 'user' ? 'dock-btn-active-yellow' : ''}`}
                    onClick={() => {
                      setActiveDockTab('user');
                      onOpenExpenses();
                    }}
                  >
                    <User size={18} />
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* =========================================================================
            PANE 2: DESTINATION HERO & STORY SHOWCASE (CENTER SCREEN)
            ========================================================================= */}
        {(deviceMode === 'tri-screen' || activePaneIndex === 1) && (
          <div className="phone-device-frame screen-center animate-fade-in">
            <div className="device-screen-inner hero-screen-inner">
              {/* Full Bleed Portrait Image with Gradient */}
              <img 
                src={currentJourney.heroImage} 
                alt={currentJourney.title} 
                className="hero-full-bg"
              />
              <div className="hero-vignette-overlay"></div>

              {/* Traveler Avatars Constellation */}
              <div className="avatars-constellation-wrap">
                <div className="center-avatar-glow">
                  <img 
                    src={currentJourney.avatars[0]} 
                    alt="Lead traveler" 
                    className="lead-traveler-avatar" 
                  />
                  <div className="orbit-avatar orbit-1">
                    <img src={currentJourney.avatars[1]} alt="Companion" />
                  </div>
                  <div className="orbit-avatar orbit-2">
                    <img src={currentJourney.avatars[2]} alt="Companion" />
                  </div>
                  <div className="orbit-avatar orbit-3">
                    <img src={currentJourney.avatars[3]} alt="Companion" />
                  </div>
                </div>
              </div>

              {/* Hero Story Card Content */}
              <div className="hero-content-footer">
                <h2 className="hero-trip-title">{currentJourney.title}</h2>

                {/* Metadata Pills */}
                <div className="hero-meta-row">
                  <span className="hero-meta-pill">
                    <Calendar size={13} /> {currentJourney.dates}
                  </span>
                  <span className="hero-meta-pill">
                    <Users size={13} /> {currentJourney.travelersCount} travelers
                  </span>
                  <span className="hero-meta-pill">
                    🎨 {currentJourney.theme}
                  </span>
                </div>

                {/* Description snippet with emoji emphasis */}
                <p className="hero-story-description">
                  {currentJourney.description}
                </p>

                {/* Budget summary in INR with Action */}
                <div className="hero-budget-row">
                  <div className="hero-budget-stat">
                    <span className="h-stat-label">Budget</span>
                    <span className="h-stat-val">₹{currentJourney.budgetINR.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="hero-budget-stat">
                    <span className="h-stat-label">Spent</span>
                    <span className="h-stat-val text-emerald">₹{currentJourney.spentINR.toLocaleString('en-IN')}</span>
                  </div>

                  <button className="btn btn-primary btn-sm hero-plan-cta" onClick={onOpenDetailedItinerary}>
                    <span>Open Planner</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* =========================================================================
            PANE 3: VISUAL MAP & POLAROID JOURNEY PINS (RIGHT SCREEN)
            ========================================================================= */}
        {(deviceMode === 'tri-screen' || activePaneIndex === 2) && (
          <div className="phone-device-frame screen-right animate-fade-in">
            <div className="device-screen-inner map-screen-inner">
              
              {/* Illustrated Map Canvas Backdrop */}
              <div className="map-illustrated-backdrop">
                <svg className="map-contour-svg" viewBox="0 0 400 700" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M50 80 Q150 50 250 120 T350 250 T280 450 T150 620" stroke="rgba(255,255,255,0.06)" strokeWidth="48" strokeLinecap="round" />
                  <path d="M80 180 Q180 140 280 200 T320 380 T200 520 T80 650" stroke="rgba(14,165,233,0.08)" strokeWidth="60" strokeLinecap="round" />
                  <circle cx="280" cy="140" r="140" fill="rgba(99, 102, 241, 0.05)" />
                  <circle cx="160" cy="480" r="160" fill="rgba(16, 185, 129, 0.04)" />
                </svg>
              </div>

              {/* Top Notification Bell */}
              <div className="map-top-bar">
                <div className="map-title-tag">
                  <Compass size={14} className="text-cyan" />
                  <span>Stops & Sightseeing</span>
                </div>
                <div className="notification-bell-btn">
                  <Bell size={18} />
                  <span className="bell-badge-yellow">3</span>
                </div>
              </div>

              {/* Polaroid Photo Pins Container */}
              <div className="map-pins-container">
                {currentJourney.mapPins.map(pin => (
                  <div 
                    key={pin.id} 
                    className="polaroid-pin-wrapper"
                    style={{ 
                      top: pin.top, 
                      left: pin.left,
                      transform: `rotate(${pin.rotation})`
                    }}
                    onClick={() => setSelectedPin(pin)}
                  >
                    <span className="pin-location-label">{pin.name}</span>
                    
                    <div className="polaroid-card-stack">
                      {/* Red Calendar Date Tag */}
                      <div className="calendar-date-tag">
                        <div className="cal-tag-hanger"></div>
                        <span className="cal-tag-number">{pin.dayDate}</span>
                      </div>

                      {/* Photo Stack (Layered Polaroid Look) */}
                      <div className="polaroid-photo-layer layer-back">
                        <img src={pin.image2} alt={pin.name} />
                      </div>
                      <div className="polaroid-photo-layer layer-front">
                        <img src={pin.image1} alt={pin.name} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Selected Pin Mini Drawer */}
              {selectedPin && (
                <div className="selected-pin-modal glass-panel animate-fade-in">
                  <div className="pin-modal-header">
                    <div>
                      <h4 className="pin-modal-name">{selectedPin.name} Stop</h4>
                      <p className="pin-modal-highlights">{selectedPin.highlights}</p>
                    </div>
                    <button className="btn-icon btn-ghost btn-sm" onClick={() => setSelectedPin(null)}>✕</button>
                  </div>
                  <div className="pin-modal-footer">
                    <span className="pin-modal-cost">Est. Cost: <strong>₹{selectedPin.costINR.toLocaleString('en-IN')}</strong></span>
                    <button className="btn btn-primary btn-sm" onClick={onOpenDetailedItinerary}>
                      View Day {selectedPin.dayDate}
                    </button>
                  </div>
                </div>
              )}

              {/* Floating Bottom Navigation Dock with Compass Active */}
              <div className="bottom-dock-wrapper">
                <div className="floating-dock-capsule">
                  <button 
                    className={`dock-btn ${activeDockTab === 'home' && deviceMode === 'tri-screen' ? '' : ''}`}
                    onClick={() => {
                      setActiveDockTab('home');
                      if (deviceMode === 'focused') setActivePaneIndex(0);
                    }}
                  >
                    <Home size={18} />
                  </button>
                  <button 
                    className="dock-btn"
                    onClick={() => {
                      setActiveDockTab('calendar');
                      onOpenDetailedItinerary();
                    }}
                  >
                    <Calendar size={18} />
                  </button>
                  <button 
                    className="dock-btn dock-btn-active-yellow"
                    onClick={() => setActiveDockTab('map')}
                  >
                    <Compass size={18} />
                  </button>
                  <button 
                    className="dock-btn"
                    onClick={() => {
                      setActiveDockTab('user');
                      onOpenExpenses();
                    }}
                  >
                    <User size={18} />
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
