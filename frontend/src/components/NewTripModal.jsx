import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar, MapPin, Globe2, Check, Plane } from 'lucide-react';
import { api } from '../api';
import { WORLD_COUNTRIES } from '../countriesData';
import { useCurrency } from '../context/CurrencyContext';

const PRESET_COVERS = [
  { name: 'Tropical Beach', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80' },
  { name: 'Tokyo Cityscape', url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1000&q=80' },
  { name: 'European City', url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1000&q=80' },
  { name: 'Mountain & Nature', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80' },
  { name: 'Italian Coast', url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1000&q=80' }
];

export default function NewTripModal({ 
  isOpen, 
  onClose, 
  onTripCreated, 
  prefillCountry = '', 
  prefillCity = '',
  prefillCost = null,
  prefillCover = ''
}) {
  const { convertToINR, currencyInfo } = useCurrency();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 14);
  const nextWeek = new Date(tomorrow);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const [formData, setFormData] = useState({
    title: '',
    destination: '',
    country: 'India',
    start_date: tomorrow.toISOString().split('T')[0],
    end_date: nextWeek.toISOString().split('T')[0],
    budget: 85000,
    currency: 'INR',
    trip_type: 'Solo',
    cover_image: PRESET_COVERS[0].url,
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // When prefill props change
  useEffect(() => {
    if (prefillCountry || prefillCity) {
      const foundCountry = WORLD_COUNTRIES.find(c => c.name.toLowerCase() === prefillCountry.toLowerCase());
      const foundPlace = foundCountry?.places?.find(p => p.name.toLowerCase() === prefillCity.toLowerCase());
      
      const dailyCost = prefillCost || foundPlace?.costINR || foundCountry?.avgDailyCostINR || 8000;
      const coverImg = prefillCover || foundPlace?.image || foundCountry?.coverImage || PRESET_COVERS[0].url;

      setFormData(prev => ({
        ...prev,
        country: prefillCountry || prev.country,
        destination: prefillCity || prev.destination,
        title: prefillCity ? `${prefillCity.split(' (')[0]} Exploration` : `${prefillCountry || 'World'} Journey`,
        budget: dailyCost * 7,
        cover_image: coverImg
      }));
    }
  }, [prefillCountry, prefillCity, prefillCost, prefillCover]);

  if (!isOpen) return null;

  // Selected country details
  const activeCountryData = WORLD_COUNTRIES.find(c => c.name.toLowerCase() === formData.country.toLowerCase());

  const handleCountryChange = (selectedCountryName) => {
    const found = WORLD_COUNTRIES.find(c => c.name === selectedCountryName);
    const firstPlace = found?.places?.[0];
    const newCover = firstPlace?.image || found?.coverImage || formData.cover_image;
    const estBudget = firstPlace ? firstPlace.costINR * 7 : (found ? found.avgDailyCostINR * 7 : 85000);
    const destName = firstPlace?.name || found?.topCities[0] || '';
    
    setFormData({
      ...formData,
      country: selectedCountryName,
      destination: destName,
      title: destName ? `${destName.split(' (')[0]} Holiday` : `${selectedCountryName} Getaway`,
      budget: estBudget,
      cover_image: newCover
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.destination.trim() || !formData.country.trim()) return;

    try {
      setSubmitting(true);
      const title = formData.title.trim() || `${formData.destination}, ${formData.country} Adventure`;
      const baseInrBudget = convertToINR(formData.budget);
      const res = await api.createTrip({
        ...formData,
        title,
        budget: baseInrBudget,
        currency: currencyInfo.code
      });
      onTripCreated(res.id);
      onClose();
    } catch (err) {
      alert(err.message || 'Failed to create trip');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <Globe2 size={20} className="text-cyan" />
            <h3>Choose Country & Plan Journey</h3>
          </div>
          <button className="btn-icon btn-ghost" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Country Selection Dropdown */}
          <div className="form-group">
            <label className="form-label">Choose Travel Country *</label>
            <select 
              className="form-select country-select-highlight"
              value={formData.country}
              onChange={e => handleCountryChange(e.target.value)}
            >
              <optgroup label="All Global Countries (A – Z)">
                {WORLD_COUNTRIES.map(c => (
                  <option key={c.name} value={c.name}>
                    {c.flag} {c.name} (~₹{c.avgDailyCostINR.toLocaleString('en-IN')}/day)
                  </option>
                ))}
              </optgroup>
              <option value="Other">Other / Custom Country...</option>
            </select>
          </div>

          {/* If Other Country is selected, show text input */}
          {formData.country === 'Other' && (
            <div className="form-group">
              <label className="form-label">Type Custom Country Name *</label>
              <input 
                type="text"
                required
                placeholder="e.g. Netherlands, South Africa, Peru, Argentina"
                className="form-input"
                onChange={e => setFormData({ ...formData, country: e.target.value })}
              />
            </div>
          )}

          {/* Suggested Cities Chips with Separate Costs if known country */}
          {activeCountryData && (
            <div className="form-group">
              <span className="form-label">Top Destinations in {activeCountryData.name}:</span>
              <div className="suggested-cities-row">
                {(activeCountryData.places || activeCountryData.topCities).map(item => {
                  const cityName = typeof item === 'string' ? item : item.name;
                  const cost = typeof item === 'object' ? item.costINR : activeCountryData.avgDailyCostINR;
                  const image = typeof item === 'object' ? item.image : activeCountryData.coverImage;
                  return (
                    <button
                      type="button"
                      key={cityName}
                      className={`city-pill-selector ${formData.destination === cityName ? 'active' : ''}`}
                      onClick={() => setFormData({
                        ...formData,
                        destination: cityName,
                        title: `${cityName.split(' (')[0]} Highlights & Leisure`,
                        budget: cost * 7,
                        cover_image: image || formData.cover_image
                      })}
                      title={`~₹${cost.toLocaleString('en-IN')}/day`}
                    >
                      <span>{cityName}</span>
                      <span className="pill-cost-tag">~₹{cost.toLocaleString('en-IN')}/d</span>
                      {formData.destination === cityName && <Check size={12} className="ml-1" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* City / Place Input */}
          <div className="form-group">
            <label className="form-label">Destination City / Place *</label>
            <div className="input-with-icon">
              <MapPin size={16} className="field-icon text-cyan" />
              <input 
                type="text"
                required
                placeholder="e.g. Goa, Tokyo, Paris, Bali, Dubai, Zermatt"
                className="form-input with-icon"
                value={formData.destination}
                onChange={e => setFormData({ ...formData, destination: e.target.value })}
              />
            </div>
          </div>

          {/* Trip Title */}
          <div className="form-group">
            <label className="form-label">Trip Title</label>
            <input 
              type="text"
              placeholder="e.g. 7-Day Coastal Relaxation & Sightseeing"
              className="form-input"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          {/* Dates */}
          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Start Date *</label>
              <input 
                type="date"
                required
                className="form-input"
                value={formData.start_date}
                onChange={e => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">End Date *</label>
              <input 
                type="date"
                required
                className="form-input"
                value={formData.end_date}
                onChange={e => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>
          </div>

          {/* Budget and Travel Style */}
          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Estimated Budget ({currencyInfo.code} {currencyInfo.symbol})</label>
              <input 
                type="number"
                step="any"
                className="form-input"
                value={formData.budget}
                onChange={e => setFormData({ ...formData, budget: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Travel Style</label>
              <select 
                className="form-select"
                value={formData.trip_type}
                onChange={e => setFormData({ ...formData, trip_type: e.target.value })}
              >
                <option value="Solo">Solo Traveler</option>
                <option value="Couple">Romantic Couple</option>
                <option value="Friends">Friends Getaway</option>
                <option value="Family">Family Vacation</option>
              </select>
            </div>
          </div>

          {/* Choose Cover Theme */}
          <div className="form-group">
            <label className="form-label">Choose Cover Theme</label>
            <div className="cover-preset-grid">
              {PRESET_COVERS.map(cover => (
                <div 
                  key={cover.name} 
                  className={`cover-preset-chip ${formData.cover_image === cover.url ? 'selected' : ''}`}
                  onClick={() => setFormData({ ...formData, cover_image: cover.url })}
                >
                  <img src={cover.url} alt={cover.name} />
                  <span>{cover.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="form-group">
            <label className="form-label">Travel Notes & Aspirations</label>
            <textarea 
              rows={2}
              placeholder="e.g. Try authentic local cuisine, visit historic viewpoints, relax on the beach"
              className="form-textarea"
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Creating Journey...' : 'Create & Plan Itinerary'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
