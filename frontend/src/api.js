const API_BASE = '/api';

// Store token in localStorage
export const getToken = () => localStorage.getItem('tripmate_token');
export const setToken = (token) => localStorage.setItem('tripmate_token', token);
export const removeToken = () => localStorage.removeItem('tripmate_token');

const request = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong');
  }
  return data;
};

export const api = {
  // Auth
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  demoLogin: (data = {}) => request('/auth/demo', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => request('/auth/me'),
  updateCountry: (country, currency) => request('/auth/country', { method: 'PUT', body: JSON.stringify({ country, currency }) }),

  // Trips
  getTrips: () => request('/trips'),
  getTrip: (id) => request(`/trips/${id}`),
  createTrip: (tripData) => request('/trips', { method: 'POST', body: JSON.stringify(tripData) }),
  updateTrip: (id, tripData) => request(`/trips/${id}`, { method: 'PUT', body: JSON.stringify(tripData) }),
  deleteTrip: (id) => request(`/trips/${id}`, { method: 'DELETE' }),
  payTrip: (id, paymentData) => request(`/trips/${id}/pay`, { method: 'POST', body: JSON.stringify(paymentData) }),
  getReceipts: () => request('/user/receipts'),

  // Itinerary
  addItineraryItem: (tripId, item) => request(`/trips/${tripId}/itinerary`, { method: 'POST', body: JSON.stringify(item) }),
  deleteItineraryItem: (itemId) => request(`/itinerary/${itemId}`, { method: 'DELETE' }),

  // Expenses
  addExpense: (tripId, expense) => request(`/trips/${tripId}/expenses`, { method: 'POST', body: JSON.stringify(expense) }),
  deleteExpense: (expenseId) => request(`/expenses/${expenseId}`, { method: 'DELETE' }),

  // Packing
  addPackingItem: (tripId, item) => request(`/trips/${tripId}/packing`, { method: 'POST', body: JSON.stringify(item) }),
  togglePackingItem: (itemId) => request(`/packing/${itemId}/toggle`, { method: 'PATCH' }),
  deletePackingItem: (itemId) => request(`/packing/${itemId}`, { method: 'DELETE' }),

  // Destinations & Countries
  getDestinations: () => request('/destinations'),
  createTripFromDestination: (destId) => request(`/destinations/${destId}/create-trip`, { method: 'POST' }),
  getCountries: () => request('/countries'),
};
