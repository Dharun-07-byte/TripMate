import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  MapPin, 
  Calendar, 
  Compass, 
  Check, 
  ArrowRight, 
  SunMedium, 
  Search, 
  Loader2, 
  Globe2, 
  Plus, 
  ChevronRight,
  Plane
} from 'lucide-react';
import { api } from '../api';
import { WORLD_COUNTRIES } from '../countriesData';
import { useCurrency } from '../context/CurrencyContext';

export default function ExploreView({ onTripCreated, onOpenCustomTripWithCountry }) {
  const { formatAmount, currencyInfo } = useCurrency();
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCountryName, setSelectedCountryName] = useState('All');
  const [selectedLetter, setSelectedLetter] = useState('ALL');
  const [creatingId, setCreatingId] = useState(null);

  // Compute unique alphabet letters present in the countries list
  const alphabetLetters = Array.from(
    new Set(WORLD_COUNTRIES.map(c => c.name.charAt(0).toUpperCase()))
  ).sort();

  useEffect(() => {
    fetchDestinations();
  }, []);

  const fetchDestinations = async () => {
    try {
      setLoading(true);
      const res = await api.getDestinations();
      setDestinations(res.destinations || []);
    } catch (err) {
      console.error('Error fetching destinations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInstantPlan = async (destId) => {
    try {
      setCreatingId(destId);
      const res = await api.createTripFromDestination(destId);
      if (res.id) {
        onTripCreated(res.id);
      }
    } catch (err) {
      alert(err.message || 'Please sign in or use demo mode to plan trips');
    } finally {
      setCreatingId(null);
    }
  };

  // Find currently selected country data
  const selectedCountryData = WORLD_COUNTRIES.find(c => c.name === selectedCountryName);

  // Filter countries matching search & alphabetical letter filter
  const filteredCountries = WORLD_COUNTRIES.filter(c => {
    // Letter filter check
    if (selectedLetter !== 'ALL') {
      if (!c.name.toUpperCase().startsWith(selectedLetter)) {
        return false;
      }
    }
    // Search query check
    if (!search.trim()) return true;
    const query = search.toLowerCase();
    const matchName = c.name.toLowerCase().includes(query);
    const matchCity = c.topCities.some(city => city.toLowerCase().includes(query));
    return matchName || matchCity;
  });

  // Filter destinations
  const filteredDestinations = destinations.filter(d => {
    const matchCountry = selectedCountryName === 'All' || d.country.toLowerCase() === selectedCountryName.toLowerCase();
    const matchSearch = !search.trim() || 
                        d.name.toLowerCase().includes(search.toLowerCase()) || 
                        d.country.toLowerCase().includes(search.toLowerCase()) ||
                        d.description.toLowerCase().includes(search.toLowerCase());
    return matchCountry && matchSearch;
  });

  // Collect individual places when "All" is active or when user searches
  const matchingGlobalPlaces = React.useMemo(() => {
    if (selectedCountryName !== 'All' && !search.trim()) return [];
    const query = search.trim().toLowerCase();
    const list = [];

    if (!query) {
      // Pick 1 premier destination per country across diverse world countries
      const premierOrder = [
        'India', 'France', 'Japan', 'Italy', 'Switzerland', 'Australia', 
        'United States', 'United Arab Emirates', 'Spain', 'Greece', 'Brazil', 'Egypt',
        'Thailand', 'United Kingdom', 'Canada', 'Indonesia', 'Singapore', 'South Africa',
        'Germany', 'Portugal', 'Turkey', 'Norway', 'Iceland', 'New Zealand',
        'Netherlands', 'Austria', 'Vietnam', 'Mexico', 'Morocco', 'Peru'
      ];

      const scanList = selectedLetter === 'ALL'
        ? premierOrder
        : WORLD_COUNTRIES.filter(c => c.name.toUpperCase().startsWith(selectedLetter)).map(c => c.name);

      for (const countryName of scanList) {
        const c = WORLD_COUNTRIES.find(item => item.name.toLowerCase() === countryName.toLowerCase());
        if (c && c.places && c.places.length > 0) {
          list.push({ ...c.places[0], country: c.name, flag: c.flag });
          if (list.length >= 24) break;
        }
      }
      return list;
    }

    // If search query is present, scan all countries matching query
    for (const c of WORLD_COUNTRIES) {
      if (selectedLetter !== 'ALL' && !c.name.toUpperCase().startsWith(selectedLetter)) {
        continue;
      }
      if (!c.places) continue;
      for (const p of c.places) {
        if (
          p.name.toLowerCase().includes(query) || 
          p.tag.toLowerCase().includes(query) || 
          c.name.toLowerCase().includes(query)
        ) {
          list.push({ ...p, country: c.name, flag: c.flag });
          if (list.length >= 60) break;
        }
      }
    }
    return list;
  }, [selectedCountryName, search, selectedLetter]);

  return (
    <div className="explore-view animate-fade-in">
      {/* Hero Banner */}
      <section className="explore-hero glass-panel">
        <div className="explore-hero-content">
          <div className="badge badge-cyan hero-badge">
            <Sparkles size={13} />
            <span>Choose Your Country & Destination</span>
          </div>
          <h1 className="hero-title">
            Where in the <span className="hero-gradient-text">world will you travel?</span>
          </h1>
          <p className="hero-desc">
            Select any country worldwide or search your dream city. Explore pre-crafted itineraries, seasonal insights, and estimated budgets in {currencyInfo.name} ({currencyInfo.symbol}).
          </p>

          {/* Search Bar */}
          <div className="hero-search-bar">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search any country or city (e.g. India, Japan, France, Goa, Dubai, Bali)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="hero-search-input"
            />
            {search && (
              <button className="btn-icon btn-ghost btn-sm" onClick={() => setSearch('')}>✕</button>
            )}
          </div>
        </div>
      </section>

      {/* Country Selection Section */}
      <section className="country-selector-section glass-panel">
        <div className="country-section-header">
          <div className="country-header-title-wrap">
            <Globe2 size={20} className="text-cyan" />
            <div>
              <h2 className="country-section-title">Explore Countries Alphabetically (A – Z)</h2>
              <p className="country-section-sub">
                {WORLD_COUNTRIES.length} global destinations stored in alphabetical order • Filter by letter or search
              </p>
            </div>
          </div>
          
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => onOpenCustomTripWithCountry && onOpenCustomTripWithCountry(selectedCountryData?.name || '')}
          >
            <Plus size={15} />
            <span>Plan Custom Trip</span>
          </button>
        </div>

        {/* Alphabetical (A-Z) Quick Filter Bar */}
        <div className="alphabet-filter-bar">
          <button 
            className={`alpha-letter-btn ${selectedLetter === 'ALL' ? 'active' : ''}`}
            onClick={() => setSelectedLetter('ALL')}
          >
            All ({WORLD_COUNTRIES.length})
          </button>
          {alphabetLetters.map(letter => {
            const count = WORLD_COUNTRIES.filter(c => c.name.toUpperCase().startsWith(letter)).length;
            return (
              <button
                key={letter}
                className={`alpha-letter-btn ${selectedLetter === letter ? 'active' : ''}`}
                onClick={() => setSelectedLetter(letter)}
                title={`${count} countries starting with ${letter}`}
              >
                {letter}
                <span className="alpha-count">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Country Quick Pills with Flags (Alphabetically Sorted) */}
        <div className="countries-pill-scroll">
          <button 
            className={`country-pill-btn ${selectedCountryName === 'All' ? 'active' : ''}`}
            onClick={() => setSelectedCountryName('All')}
          >
            <span>🌍 All Countries</span>
          </button>

          {filteredCountries.map(c => (
            <button 
              key={c.name}
              className={`country-pill-btn ${selectedCountryName === c.name ? 'active' : ''}`}
              onClick={() => setSelectedCountryName(c.name)}
            >
              <span className="country-flag">{c.flag}</span>
              <span className="country-name">{c.name}</span>
            </button>
          ))}

          {filteredCountries.length === 0 && (
            <div className="no-countries-found">
              <span>No countries found starting with &quot;{selectedLetter}&quot;</span>
              <button className="btn-link" onClick={() => { setSelectedLetter('ALL'); setSearch(''); }}>
                Reset filter
              </button>
            </div>
          )}
        </div>

        {/* Selected Country Spotlight Banner */}
        {selectedCountryData && selectedCountryName !== 'All' && (
          <div className="country-spotlight-card animate-fade-in">
            <div className="spotlight-img-wrap">
              <img src={selectedCountryData.coverImage} alt={selectedCountryData.name} className="spotlight-img" />
              <div className="spotlight-gradient"></div>
              <div className="spotlight-flag-badge">
                <span className="spotlight-flag">{selectedCountryData.flag}</span>
                <span className="spotlight-country-name">{selectedCountryData.name}</span>
              </div>
            </div>

            <div className="spotlight-info">
              <div className="spotlight-meta-row">
                <span className="badge badge-emerald">
                  ~₹{selectedCountryData.avgDailyCostINR.toLocaleString('en-IN')}/day avg
                </span>
                <span className="badge badge-purple">{selectedCountryData.tag}</span>
                <span className="badge badge-amber">
                  <SunMedium size={12} /> {selectedCountryData.bestSeason}
                </span>
              </div>

              <p className="spotlight-desc">{selectedCountryData.description}</p>

              {/* Popular Cities in Country with Separate Daily Amounts */}
              <div className="spotlight-cities-wrap">
                <span className="spotlight-cities-label">
                  All Locations in {selectedCountryData.name} ({selectedCountryData.places ? selectedCountryData.places.length : selectedCountryData.topCities.length} Places):
                </span>
                <div className="spotlight-cities-chips">
                  {(selectedCountryData.places || selectedCountryData.topCities).map((item, idx) => {
                    const cityName = typeof item === 'string' ? item : item.name;
                    const cost = typeof item === 'object' ? item.costINR : selectedCountryData.avgDailyCostINR;
                    const image = typeof item === 'object' ? item.image : selectedCountryData.coverImage;
                    return (
                      <button 
                        key={idx} 
                        className="city-chip-btn"
                        onClick={() => onOpenCustomTripWithCountry && onOpenCustomTripWithCountry(selectedCountryData.name, cityName, cost, image)}
                        title={`Plan a trip to ${cityName} (~₹${cost.toLocaleString('en-IN')}/day)`}
                      >
                        <MapPin size={11} className="text-cyan" />
                        <span>{cityName}</span>
                        <span className="chip-cost-badge">₹{cost.toLocaleString('en-IN')}/d</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Button */}
              <div className="spotlight-action-row">
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    const firstP = selectedCountryData.places?.[0];
                    onOpenCustomTripWithCountry && onOpenCustomTripWithCountry(
                      selectedCountryData.name, 
                      firstP?.name || selectedCountryData.topCities[0],
                      firstP?.costINR || selectedCountryData.avgDailyCostINR,
                      firstP?.image || selectedCountryData.coverImage
                    );
                  }}
                >
                  <Plane size={15} />
                  <span>Plan Trip to {selectedCountryData.name}</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Individual Places Gallery for Selected Country */}
        {selectedCountryData && selectedCountryData.places && (
          <div className="country-places-gallery animate-fade-in">
            <div className="places-gallery-header">
              <div>
                <h3 className="places-gallery-title">
                  All {selectedCountryData.places.length} Destinations in {selectedCountryData.name}
                </h3>
                <p className="places-gallery-sub">
                  Each destination includes dedicated high-resolution photography & separate daily budget in INR
                </p>
              </div>
            </div>

            <div className="places-gallery-grid">
              {selectedCountryData.places.map((place, pIdx) => (
                <div key={pIdx} className="place-item-card glass-panel">
                  {/* Clean Separate Image (Unobstructed) */}
                  <div className="place-item-img-wrap">
                    <img src={place.image} alt={place.name} className="place-item-img" loading="lazy" />
                  </div>

                  <div className="place-item-body">
                    {/* Meta Row: Tag Badge */}
                    <div className="place-meta-top-row">
                      <span className="place-tag-pill">{place.tag}</span>
                    </div>

                    {/* Location Name & Separate Amount Badge */}
                    <div className="place-item-title-row">
                      <div className="place-name-wrap">
                        <MapPin size={15} className="text-cyan flex-shrink-0" />
                        <h4 className="place-item-name">{place.name}</h4>
                      </div>
                      <div className="place-item-cost-badge">
                        <span className="cost-val">{formatAmount(place.costINR)}</span>
                        <span className="cost-unit">/day</span>
                      </div>
                    </div>

                    <div className="place-item-est-row">
                      <span className="est-label">Estimated 7-day budget:</span>
                      <span className="est-val">{formatAmount(place.est7DayINR)}</span>
                    </div>

                    <button 
                      className="btn btn-secondary btn-sm place-item-action-btn"
                      onClick={() => onOpenCustomTripWithCountry && onOpenCustomTripWithCountry(selectedCountryData.name, place.name, place.costINR, place.image)}
                    >
                      <Plane size={13} />
                      <span>Plan Trip to {place.name.split(' (')[0]}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Global / Search Matching Destinations Showcase */}
        {selectedCountryName === 'All' && matchingGlobalPlaces.length > 0 && (
          <div className="country-places-gallery animate-fade-in">
            <div className="places-gallery-header">
              <div>
                <h3 className="places-gallery-title">
                  {search.trim() ? `Search Results: ${matchingGlobalPlaces.length} Destinations Found` : 'Featured Global Destinations Across Different Countries'}
                </h3>
                <p className="places-gallery-sub">
                  {search.trim() 
                    ? `Showing destinations matching "${search}" across all countries with separate INR daily amounts` 
                    : 'Explore destinations from diverse countries worldwide, each with dedicated photography & separate daily rates'}
                </p>
              </div>
            </div>

            <div className="places-gallery-grid">
              {matchingGlobalPlaces.map((place, pIdx) => (
                <div key={pIdx} className="place-item-card glass-panel">
                  {/* Clean Separate Image (Unobstructed) */}
                  <div className="place-item-img-wrap">
                    <img src={place.image} alt={place.name} className="place-item-img" loading="lazy" />
                  </div>

                  <div className="place-item-body">
                    {/* Meta Row: Country Flag + Tag Badge */}
                    <div className="place-meta-top-row">
                      <span className="place-country-pill">{place.flag} {place.country}</span>
                      <span className="place-tag-pill">{place.tag}</span>
                    </div>

                    {/* Location Name & Separate Amount Badge */}
                    <div className="place-item-title-row">
                      <div className="place-name-wrap">
                        <MapPin size={15} className="text-cyan flex-shrink-0" />
                        <h4 className="place-item-name">{place.name}</h4>
                      </div>
                      <div className="place-item-cost-badge">
                        <span className="cost-val">{formatAmount(place.costINR)}</span>
                        <span className="cost-unit">/day</span>
                      </div>
                    </div>

                    <div className="place-item-est-row">
                      <span className="est-label">Estimated 7-day budget:</span>
                      <span className="est-val">{formatAmount(place.est7DayINR)}</span>
                    </div>

                    <button 
                      className="btn btn-secondary btn-sm place-item-action-btn"
                      onClick={() => onOpenCustomTripWithCountry && onOpenCustomTripWithCountry(place.country, place.name, place.costINR, place.image)}
                    >
                      <Plane size={13} />
                      <span>Plan Trip to {place.name.split(' (')[0]}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Handcrafted Destinations Grid */}
      <section className="destinations-section">
        <div className="section-header-row">
          <div>
            <h2 className="section-title">
              {selectedCountryName === 'All' ? 'Popular Worldwide Itineraries' : `Itineraries in ${selectedCountryName}`}
            </h2>
            <p className="section-subtitle">Click "Plan Trip Here" to generate a complete multi-day schedule</p>
          </div>
          <span className="badge badge-emerald">{filteredDestinations.length} places available</span>
        </div>

        {loading ? (
          <div className="loading-state">
            <Loader2 className="spinner" size={32} />
            <p>Loading destinations...</p>
          </div>
        ) : (
          <div className="destinations-grid">
            {filteredDestinations.map(dest => (
              <div key={dest.id} className="destination-card glass-panel">
                <div className="dest-image-wrap">
                  <img src={dest.image} alt={dest.name} className="dest-img" loading="lazy" />
                  <span className="badge badge-purple dest-tag">{dest.tag}</span>
                  <div className="dest-cost-pill">
                    <span>~₹{dest.avgDailyCost?.toLocaleString('en-IN')}/day</span>
                  </div>
                </div>

                <div className="dest-body">
                  <div className="dest-header">
                    <div className="dest-location-row">
                      <MapPin size={15} className="text-cyan" />
                      <span className="dest-country">{dest.country}</span>
                    </div>
                    <h3 className="dest-title">{dest.name}</h3>
                  </div>

                  <p className="dest-desc">{dest.description}</p>

                  <div className="dest-meta-box">
                    <div className="dest-meta-item">
                      <SunMedium size={14} className="text-amber" />
                      <div className="meta-text">
                        <span className="meta-label">Best Season</span>
                        <span className="meta-val">{dest.bestSeason}</span>
                      </div>
                    </div>
                  </div>

                  {/* Highlights */}
                  <div className="dest-highlights-wrap">
                    <span className="highlights-title">Top Highlights:</span>
                    <div className="highlights-chips">
                      {dest.highlights.map((h, i) => (
                        <span key={i} className="highlight-chip">
                          <Check size={11} className="text-emerald" /> {h}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Instant Plan CTA */}
                  <button 
                    className="btn btn-primary dest-plan-btn"
                    disabled={creatingId === dest.id}
                    onClick={() => handleInstantPlan(dest.id)}
                  >
                    {creatingId === dest.id ? (
                      <>
                        <Loader2 className="spinner" size={15} />
                        <span>Crafting Itinerary...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={15} />
                        <span>Plan Trip Here</span>
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}

            {/* Custom Trip Card (Lets user plan to ANY country) */}
            <div 
              className="destination-card glass-panel custom-plan-card"
              onClick={() => onOpenCustomTripWithCountry && onOpenCustomTripWithCountry(selectedCountryData?.name || '')}
            >
              <div className="custom-plan-content">
                <div className="custom-plan-icon-wrap">
                  <Plus size={32} className="text-cyan" />
                </div>
                <h3>Plan Your Own Country & City</h3>
                <p>Choose any country in the world, enter your custom dates, and set your own travel budget in INR (₹).</p>
                <button className="btn btn-secondary btn-sm mt-3">
                  <span>Start Custom Plan</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
