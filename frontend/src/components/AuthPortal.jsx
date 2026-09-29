import React, { useState } from 'react';
import { 
  Compass, 
  User, 
  Lock, 
  Mail, 
  Globe, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Plane, 
  CalendarDays, 
  WalletCards, 
  Receipt 
} from 'lucide-react';
import { api, setToken } from '../api';
import { useCurrency, COUNTRIES_CURRENCIES, getCountryCurrency } from '../context/CurrencyContext';

export default function AuthPortal({ onAuthSuccess }) {
  const { selectedCountry, setCountry } = useCurrency();
  const [isRegister, setIsRegister] = useState(false);
  const [country, setLocalCountry] = useState(selectedCountry || 'India');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const activeCurrency = getCountryCurrency(country);
  const defaultAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      setCountry(country);
      let res;
      if (isRegister) {
        if (!name.trim()) throw new Error('Please enter your full name');
        res = await api.register({
          name: name.trim(),
          email: email.trim(),
          password,
          country,
          currency: activeCurrency.code,
          gender: 'traveler',
          avatar: defaultAvatar
        });
      } else {
        res = await api.login({
          email: email.trim(),
          password,
          country,
          currency: activeCurrency.code,
          gender: 'traveler',
          avatar: defaultAvatar
        });
      }

      setToken(res.token);
      onAuthSuccess({
        ...res.user,
        country,
        currency: activeCurrency.code,
        gender: 'traveler',
        avatar: defaultAvatar
      });
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setLoading(true);
    try {
      setCountry(country);
      const res = await api.demoLogin({
        country,
        currency: activeCurrency.code,
        gender: 'traveler',
        avatar: defaultAvatar
      });
      setToken(res.token);
      onAuthSuccess({
        ...res.user,
        country,
        currency: activeCurrency.code,
        gender: 'traveler',
        avatar: defaultAvatar
      });
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-portal-page">
      <div className="auth-portal-container">
        <div className="auth-portal-card glass-panel">
          {/* Brand Header */}
          <div className="auth-card-brand">
            <div className="auth-brand-logo">
              <img src="/logo.png" alt="TripMate Logo" className="auth-brand-logo-img" />
            </div>
            <div className="auth-brand-text">
              <h1 className="auth-brand-title">Trip<span className="brand-accent">Mate</span></h1>
              <p className="auth-brand-tagline">Smart Travel Companion</p>
            </div>
          </div>

            {/* Tab Switcher */}
            <div className="auth-portal-tabs">
              <button 
                type="button"
                className={`auth-tab-btn ${!isRegister ? 'active' : ''}`}
                onClick={() => { setIsRegister(false); setError(''); }}
              >
                Sign In
              </button>
              <button 
                type="button"
                className={`auth-tab-btn ${isRegister ? 'active' : ''}`}
                onClick={() => { setIsRegister(true); setError(''); }}
              >
                Create Account
              </button>
            </div>
            
            <p className="auth-card-subtext">
              {isRegister 
                ? 'Create your free account to start organizing trips and tracking budgets.'
                : 'Welcome back! Enter your details to continue your journey.'}
            </p>

            {error && (
              <div className="auth-portal-alert animate-fade-in">
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="auth-portal-form">
              {/* Full Name (Registration only) */}
              {isRegister && (
                <div className="form-group animate-fade-in">
                  <label className="form-label">Full Name</label>
                  <div className="input-with-icon">
                    <User size={16} className="field-icon" />
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Alex Morgan"
                      className="form-input with-icon"
                      value={name}
                      onChange={e => setName(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Email Address */}
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

              {/* Password */}
              <div className="form-group">
                <div className="form-label-row">
                  <label className="form-label mb-0">Password</label>
                </div>
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

              {/* Country & Currency (Registration only) */}
              {isRegister && (
                <div className="form-group animate-fade-in">
                  <div className="country-label-row">
                    <label className="form-label mb-0">Home Country & Currency</label>
                    <span className="currency-pill-badge">
                      {activeCurrency.flag} {activeCurrency.code} ({activeCurrency.symbol})
                    </span>
                  </div>
                  <div className="input-with-icon">
                    <Globe size={16} className="field-icon" />
                    <select 
                      value={country}
                      onChange={e => {
                        const chosen = e.target.value;
                        setLocalCountry(chosen);
                        setCountry(chosen);
                      }}
                      className="form-input with-icon"
                    >
                      {COUNTRIES_CURRENCIES.map(c => (
                        <option key={c.country} value={c.country}>
                          {c.flag} {c.country} — {c.code} ({c.symbol})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Autofill chip for Sign In */}
              {!isRegister && (
                <div className="auth-credentials-hint">
                  <span>Demo Account: <strong>alex@tripmate.com</strong></span>
                  <button 
                    type="button" 
                    className="auth-autofill-btn"
                    onClick={() => {
                      setEmail('alex@tripmate.com');
                      setPassword('password123');
                    }}
                  >
                    Fill Demo Details
                  </button>
                </div>
              )}

              {/* Submit Button */}
              <button 
                type="submit" 
                className="btn btn-primary w-full auth-portal-submit-btn" 
                disabled={loading}
              >
                {loading ? (
                  <span>Please wait...</span>
                ) : isRegister ? (
                  <>
                    <span>Create Account</span>
                    <ArrowRight size={16} />
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              {/* Clean 1-Click Demo Login */}
              {!isRegister && (
                <button 
                  type="button"
                  className="btn btn-secondary w-full auth-demo-btn"
                  onClick={handleDemoLogin}
                  disabled={loading}
                >
                  <Sparkles size={15} className="text-primary" />
                  <span>Explore with 1-Click Demo Login</span>
                </button>
              )}
            </form>

            {/* Footer Switch */}
            <div className="auth-portal-switch">
              {isRegister ? (
                <p>
                  Already have an account?{' '}
                  <button type="button" className="auth-link" onClick={() => { setIsRegister(false); setError(''); }}>
                    Sign In
                  </button>
                </p>
              ) : (
                <p>
                  Don't have an account yet?{' '}
                  <button type="button" className="auth-link" onClick={() => { setIsRegister(true); setError(''); }}>
                    Create an account
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
