import React, { useState } from 'react';
import { User, Lock, Mail, Sparkles, ArrowRight, ShieldCheck, Globe } from 'lucide-react';
import { api, setToken } from '../api';
import { useCurrency, COUNTRIES_CURRENCIES, getCountryCurrency } from '../context/CurrencyContext';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const { selectedCountry, setCountry } = useCurrency();
  const [isRegister, setIsRegister] = useState(false);
  const [modalCountry, setModalCountry] = useState(selectedCountry || 'India');
  const [gender, setGender] = useState('male');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const activeCurrency = getCountryCurrency(modalCountry);
  const maleAnimeAvatar = 'https://api.dicebear.com/7.x/lorelei/svg?seed=Kenji';
  const femaleAnimeAvatar = 'https://api.dicebear.com/7.x/lorelei/svg?seed=Aiko';
  const selectedAnimeAvatar = gender === 'female' ? femaleAnimeAvatar : maleAnimeAvatar;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      setCountry(modalCountry);
      let res;
      if (isRegister) {
        res = await api.register({ 
          name, 
          email, 
          password, 
          country: modalCountry, 
          currency: activeCurrency.code,
          gender,
          avatar: selectedAnimeAvatar
        });
      } else {
        res = await api.login({ 
          email, 
          password, 
          country: modalCountry, 
          currency: activeCurrency.code,
          gender,
          avatar: selectedAnimeAvatar
        });
      }
      setToken(res.token);
      onAuthSuccess({
        ...res.user,
        country: modalCountry,
        currency: activeCurrency.code,
        gender,
        avatar: selectedAnimeAvatar
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setLoading(true);
    try {
      setCountry(modalCountry);
      const res = await api.demoLogin({ 
        country: modalCountry, 
        currency: activeCurrency.code,
        gender,
        avatar: selectedAnimeAvatar
      });
      setToken(res.token);
      onAuthSuccess({
        ...res.user,
        country: modalCountry,
        currency: activeCurrency.code,
        gender,
        avatar: selectedAnimeAvatar
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content auth-modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <User size={20} className="text-cyan" />
            <h3>{isRegister ? 'Create Your Account' : 'Welcome Back to TripMate'}</h3>
          </div>
          <button className="btn-icon btn-ghost" onClick={onClose}>✕</button>
        </div>

        {/* Demo Account Callout */}
        <div className="demo-box glass-panel">
          <div className="demo-text">
            <span className="demo-badge">Quick Demo</span>
            <p>Explore with pre-populated Tokyo, Paris & Bali itineraries.</p>
          </div>
          <button 
            type="button" 
            className="btn btn-primary btn-sm"
            onClick={handleDemoLogin}
            disabled={loading}
          >
            <Sparkles size={14} />
            <span>Try Demo Account</span>
          </button>
        </div>

        <div className="auth-divider">
          <span>or continue with email</span>
        </div>

        {error && <div className="auth-error-msg">{error}</div>}

        <form onSubmit={handleSubmit} className="modal-form">
          
          {/* Country Selection */}
          <div className="form-group country-select-group">
            <div className="country-label-row">
              <label className="form-label mb-0">Select Your Country / Currency</label>
              <span className="currency-pill-badge">
                {activeCurrency.flag} {activeCurrency.code} ({activeCurrency.symbol})
              </span>
            </div>
            <div className="input-with-icon">
              <Globe size={16} className="field-icon text-cyan" />
              <select 
                value={modalCountry}
                onChange={e => setModalCountry(e.target.value)}
                className="form-input with-icon country-dropdown"
              >
                {COUNTRIES_CURRENCIES.map(c => (
                  <option key={c.country} value={c.country}>
                    {c.flag} {c.country} — {c.code} ({c.symbol} • {c.unitLabel})
                  </option>
                ))}
              </select>
            </div>
            <div className="country-currency-note">
              {modalCountry.toLowerCase() === 'india' ? (
                <span className="text-emerald">
                  🇮🇳 In portal: All trip expenses & payments will display in <strong>Indian Rupee (INR ₹)</strong>
                </span>
              ) : (
                <span className="text-cyan">
                  {activeCurrency.flag} In portal: All trip expenses & payments will display in <strong>{activeCurrency.country} {activeCurrency.unitLabel} ({activeCurrency.code} {activeCurrency.symbol})</strong>
                </span>
              )}
            </div>
          </div>

          {/* Gender Selection & Anime Character */}
          <div className="form-group gender-select-group">
            <div className="gender-label-row">
              <label className="form-label mb-0">Gender & Anime Character</label>
              <span className="gender-pill-badge">
                {gender === 'female' ? '🌸 Female Character' : '⚡ Male Character'}
              </span>
            </div>
            <div className="gender-toggle-grid">
              <button
                type="button"
                className={`gender-option-btn ${gender === 'male' ? 'active' : ''}`}
                onClick={() => setGender('male')}
              >
                <span className="gender-emoji">👦</span>
                <div className="gender-btn-text">
                  <span className="gender-title">Male</span>
                  <span className="gender-char-sub">Kenji (Male Anime)</span>
                </div>
              </button>
              <button
                type="button"
                className={`gender-option-btn ${gender === 'female' ? 'active' : ''}`}
                onClick={() => setGender('female')}
              >
                <span className="gender-emoji">👧</span>
                <div className="gender-btn-text">
                  <span className="gender-title">Female</span>
                  <span className="gender-char-sub">Aiko (Female Anime)</span>
                </div>
              </button>
            </div>
            <div className="anime-preview-card">
              <div className="anime-avatar-frame">
                <img 
                  src={selectedAnimeAvatar} 
                  alt={gender === 'female' ? 'Aiko' : 'Kenji'}
                  className="anime-preview-img"
                />
              </div>
              <div className="anime-preview-details">
                <div className="anime-header-row">
                  <span className="anime-badge-pill">
                    {gender === 'female' ? '🌸 Anime Girl' : '⚡ Anime Guy'}
                  </span>
                  <span className="anime-name-tag">
                    {gender === 'female' ? 'Aiko' : 'Kenji'}
                  </span>
                </div>
                <p className="anime-desc-text">
                  {gender === 'female' 
                    ? 'Female anime character shown in top bar beside username.'
                    : 'Male anime character shown in top bar beside username.'}
                </p>
              </div>
            </div>
          </div>

          {isRegister && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="input-with-icon">
                <User size={16} className="field-icon" />
                <input 
                  type="text"
                  required
                  placeholder="Alex Morgan"
                  className="form-input with-icon"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-with-icon">
              <Mail size={16} className="field-icon" />
              <input 
                type="email"
                required
                placeholder="name@example.com"
                className="form-input with-icon"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-with-icon">
              <Lock size={16} className="field-icon" />
              <input 
                type="password"
                required
                placeholder="••••••••"
                className="form-input with-icon"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-full mt-2" disabled={loading}>
            {loading ? 'Processing...' : isRegister ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        <div className="auth-switch-footer">
          {isRegister ? (
            <p>
              Already have an account?{' '}
              <button className="auth-link" onClick={() => setIsRegister(false)}>
                Sign In
              </button>
            </p>
          ) : (
            <p>
              Don't have an account?{' '}
              <button className="auth-link" onClick={() => setIsRegister(true)}>
                Create one now
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
