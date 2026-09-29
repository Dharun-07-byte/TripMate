import { 
  MOCK_DESTINATIONS, 
  getStoredTrips, 
  saveStoredTrips, 
  getStoredReceipts, 
  saveStoredReceipts 
} from './mockData';

// When deployed to GitHub Pages or custom domain, VITE_API_URL can point to a hosted backend (e.g. Render/Railway)
// If not specified, it falls back to relative '/api' or the seamless client-side storage mode.
const API_BASE = import.meta.env.VITE_API_URL || '/api';

// Store token in localStorage
export const getToken = () => localStorage.getItem('tripmate_token');
export const setToken = (token) => localStorage.setItem('tripmate_token', token);
export const removeToken = () => localStorage.removeItem('tripmate_token');

// Helper to determine if we are running statically on GitHub Pages or file protocol
const isGitHubPages = typeof window !== 'undefined' && (
  window.location.hostname.includes('github.io') ||
  window.location.protocol === 'file:'
);

const request = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || 'Server request failed');
    }
    return data;
  } catch (err) {
    // If backend is unreachable (e.g. static GitHub Pages hosting), seamlessly handle via client-side storage
    const fallbackResult = handleClientFallback(endpoint, options);
    if (fallbackResult !== null) {
      return fallbackResult;
    }
    throw err;
  }
};

// Client-side fallback handler so GitHub Pages works 100% standalone out of the box
function handleClientFallback(endpoint, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const body = options.body ? JSON.parse(options.body) : {};

  // Auth: Login / Demo / Register
  if (endpoint === '/auth/login' || endpoint === '/auth/demo' || endpoint === '/auth/register') {
    const isFemale = body.gender === 'female';
    const name = body.name || (isFemale ? 'Aiko' : 'Alex Morgan');
    const user = {
      id: 'user-' + Date.now(),
      name,
      email: body.email || 'alex@tripmate.com',
      avatar: body.avatar || (isFemale ? 'https://api.dicebear.com/7.x/lorelei/svg?seed=Aiko' : 'https://api.dicebear.com/7.x/lorelei/svg?seed=Kenji'),
      country: body.country || 'India',
      currency: body.currency || 'INR',
      gender: body.gender || 'male'
    };
    const mockToken = 'mock_jwt_' + Date.now();
    localStorage.setItem('tripmate_current_user', JSON.stringify(user));
    return { user, token: mockToken };
  }

  if (endpoint === '/auth/me') {
    const stored = localStorage.getItem('tripmate_current_user');
    if (stored) {
      return { user: JSON.parse(stored) };
    }
    return {
      user: {
        id: 'demo-user-123',
        name: 'Alex Morgan',
        email: 'alex@tripmate.com',
        avatar: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Kenji',
        country: 'India',
        currency: 'INR',
        gender: 'male'
      }
    };
  }

  if (endpoint === '/auth/country') {
    return { success: true, country: body.country, currency: body.currency };
  }

  // Trips: List
  if (endpoint === '/trips' && method === 'GET') {
    const trips = getStoredTrips();
    const formatted = trips.map(t => {
      const expenses = t.expenses || [];
      const packing = t.packing || [];
      const itinerary = t.itinerary || [];
      return {
        ...t,
        total_spent: expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0),
        activity_count: itinerary.length,
        packing_count: packing.length,
        packed_count: packing.filter(p => p.is_packed).length
      };
    });
    return { trips: formatted };
  }

  // Trips: Single Trip
  const tripMatch = endpoint.match(/^\/trips\/([^/]+)$/);
  if (tripMatch) {
    const tripId = tripMatch[1];
    const trips = getStoredTrips();

    if (method === 'GET') {
      const found = trips.find(t => t.id === tripId);
      if (!found) return { trip: trips[0] || null };
      const expenses = found.expenses || [];
      return {
        trip: {
          ...found,
          total_spent: expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0)
        }
      };
    }

    if (method === 'PUT') {
      const updated = trips.map(t => t.id === tripId ? { ...t, ...body } : t);
      saveStoredTrips(updated);
      return { message: 'Trip updated successfully' };
    }

    if (method === 'DELETE') {
      const updated = trips.filter(t => t.id !== tripId);
      saveStoredTrips(updated);
      return { message: 'Trip deleted successfully' };
    }
  }

  // Trips: Create
  if (endpoint === '/trips' && method === 'POST') {
    const trips = getStoredTrips();
    const newId = 'trip-' + Date.now();
    const newTrip = {
      id: newId,
      user_id: 'demo-user-123',
      title: body.title,
      destination: body.destination,
      country: body.country || '',
      start_date: body.start_date,
      end_date: body.end_date,
      budget: Number(body.budget) || 0,
      currency: body.currency || 'INR',
      trip_type: body.trip_type || 'Solo',
      cover_image: body.cover_image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80',
      status: 'upcoming',
      notes: body.notes || '',
      itinerary: [],
      expenses: [],
      packing: [
        { id: 'p1', category: 'Documents', item_name: 'Passport & Identification', is_packed: 0 },
        { id: 'p2', category: 'Electronics', item_name: 'Phone Charger & Power Bank', is_packed: 0 },
        { id: 'p3', category: 'Clothing', item_name: 'Walking Shoes', is_packed: 0 }
      ]
    };
    trips.unshift(newTrip);
    saveStoredTrips(trips);
    return { id: newId, message: 'Trip created successfully' };
  }

  // Trips: Pay
  const payMatch = endpoint.match(/^\/trips\/([^/]+)\/pay$/);
  if (payMatch && method === 'POST') {
    const tripId = payMatch[1];
    const trips = getStoredTrips();
    const trip = trips.find(t => t.id === tripId);
    const amount = Math.round(Number(body.amount) || trip?.budget || 50000);
    const txnId = 'TXN_TM_' + Math.random().toString(36).substring(2, 10).toUpperCase();

    const splitConfig = {
      'Accommodation': 35,
      'Transport': 25,
      'Food': 18,
      'Activities': 12,
      'Shopping': 7,
      'Other': 3
    };

    let allocatedSum = 0;
    const splitResults = Object.entries(splitConfig).map(([cat, pct], idx, arr) => {
      let catAmt = idx === arr.length - 1 ? amount - allocatedSum : Math.round((amount * pct) / 100);
      allocatedSum += catAmt;
      return { category: cat, percent: pct, amount: catAmt };
    });

    if (trip) {
      if (!trip.expenses) trip.expenses = [];
      const today = new Date().toISOString().split('T')[0];
      splitResults.forEach(item => {
        trip.expenses.push({
          id: 'exp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          title: `${item.category} Booking & Allocation`,
          amount: item.amount,
          category: item.category,
          date: today,
          notes: `Auto-split payment via ${body.paymentMethod || 'UPI'} (${item.percent}%)`
        });
      });
      saveStoredTrips(trips);
    }

    const receipt = {
      id: 'rcpt-' + Date.now(),
      trip_id: tripId,
      trip_title: trip?.title || 'Trip Booking',
      destination: trip?.destination || 'Destination',
      country: trip?.country || '',
      amount,
      payment_method: body.paymentMethod || 'UPI',
      transaction_id: txnId,
      created_at: new Date().toISOString(),
      split: splitResults
    };

    const receipts = getStoredReceipts();
    receipts.unshift(receipt);
    saveStoredReceipts(receipts);

    return {
      success: true,
      message: `Payment of ₹${amount.toLocaleString('en-IN')} completed successfully!`,
      transactionId: txnId,
      receiptId: receipt.id,
      amount,
      currency: 'INR',
      paymentMethod: body.paymentMethod || 'UPI',
      split: splitResults
    };
  }

  // Itinerary: Add
  const itAddMatch = endpoint.match(/^\/trips\/([^/]+)\/itinerary$/);
  if (itAddMatch && method === 'POST') {
    const tripId = itAddMatch[1];
    const trips = getStoredTrips();
    const trip = trips.find(t => t.id === tripId);
    const itemId = 'it-' + Date.now();
    if (trip) {
      if (!trip.itinerary) trip.itinerary = [];
      trip.itinerary.push({
        id: itemId,
        day_number: body.day_number || 1,
        time: body.time || '',
        activity: body.activity,
        location: body.location || '',
        cost: Number(body.cost) || 0,
        notes: body.notes || '',
        category: body.category || 'Sightseeing'
      });
      saveStoredTrips(trips);
    }
    return { id: itemId, message: 'Activity added successfully' };
  }

  // Itinerary: Delete
  const itDelMatch = endpoint.match(/^\/itinerary\/([^/]+)$/);
  if (itDelMatch && method === 'DELETE') {
    const itemId = itDelMatch[1];
    const trips = getStoredTrips();
    trips.forEach(t => {
      if (t.itinerary) t.itinerary = t.itinerary.filter(i => i.id !== itemId);
    });
    saveStoredTrips(trips);
    return { message: 'Activity removed' };
  }

  // Expenses: Add
  const expAddMatch = endpoint.match(/^\/trips\/([^/]+)\/expenses$/);
  if (expAddMatch && method === 'POST') {
    const tripId = expAddMatch[1];
    const trips = getStoredTrips();
    const trip = trips.find(t => t.id === tripId);
    const expId = 'exp-' + Date.now();
    if (trip) {
      if (!trip.expenses) trip.expenses = [];
      trip.expenses.push({
        id: expId,
        title: body.title,
        amount: Number(body.amount) || 0,
        category: body.category || 'Food',
        date: body.date || new Date().toISOString().split('T')[0],
        notes: body.notes || ''
      });
      saveStoredTrips(trips);
    }
    return { id: expId, message: 'Expense logged successfully' };
  }

  // Expenses: Delete
  const expDelMatch = endpoint.match(/^\/expenses\/([^/]+)$/);
  if (expDelMatch && method === 'DELETE') {
    const expId = expDelMatch[1];
    const trips = getStoredTrips();
    trips.forEach(t => {
      if (t.expenses) t.expenses = t.expenses.filter(e => e.id !== expId);
    });
    saveStoredTrips(trips);
    return { message: 'Expense removed' };
  }

  // Packing: Add
  const packAddMatch = endpoint.match(/^\/trips\/([^/]+)\/packing$/);
  if (packAddMatch && method === 'POST') {
    const tripId = packAddMatch[1];
    const trips = getStoredTrips();
    const trip = trips.find(t => t.id === tripId);
    const packId = 'pack-' + Date.now();
    if (trip) {
      if (!trip.packing) trip.packing = [];
      trip.packing.push({
        id: packId,
        category: body.category || 'Essentials',
        item_name: body.item_name,
        is_packed: 0
      });
      saveStoredTrips(trips);
    }
    return { id: packId, message: 'Packing item added' };
  }

  // Packing: Toggle
  const packToggleMatch = endpoint.match(/^\/packing\/([^/]+)\/toggle$/);
  if (packToggleMatch) {
    const packId = packToggleMatch[1];
    const trips = getStoredTrips();
    trips.forEach(t => {
      if (t.packing) {
        const item = t.packing.find(p => p.id === packId);
        if (item) item.is_packed = item.is_packed ? 0 : 1;
      }
    });
    saveStoredTrips(trips);
    return { message: 'Toggled packing status' };
  }

  // Packing: Delete
  const packDelMatch = endpoint.match(/^\/packing\/([^/]+)$/);
  if (packDelMatch && method === 'DELETE') {
    const packId = packDelMatch[1];
    const trips = getStoredTrips();
    trips.forEach(t => {
      if (t.packing) t.packing = t.packing.filter(p => p.id !== packId);
    });
    saveStoredTrips(trips);
    return { message: 'Packing item removed' };
  }

  // Receipts
  if (endpoint === '/user/receipts') {
    return { receipts: getStoredReceipts() };
  }

  // Destinations
  if (endpoint === '/destinations') {
    return { destinations: MOCK_DESTINATIONS };
  }

  // Destination to Trip
  const destTripMatch = endpoint.match(/^\/destinations\/([^/]+)\/create-trip$/);
  if (destTripMatch && method === 'POST') {
    const destId = destTripMatch[1];
    const dest = MOCK_DESTINATIONS.find(d => d.id === destId);
    if (!dest) return { error: 'Destination not found' };

    const trips = getStoredTrips();
    const newId = 'trip-' + Date.now();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 30);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + dest.suggestedDays);

    const newTrip = {
      id: newId,
      user_id: 'demo-user-123',
      title: `${dest.name} Discovery & Highlights`,
      destination: dest.name,
      country: dest.country,
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      budget: dest.avgDailyCost * dest.suggestedDays,
      currency: 'INR',
      trip_type: 'Solo',
      cover_image: dest.image,
      status: 'upcoming',
      notes: `Curated itinerary for ${dest.name}, ${dest.country}. Best season: ${dest.bestSeason}`,
      itinerary: (dest.sampleItinerary || []).map((it, idx) => ({
        id: 'it-' + Date.now() + '-' + idx,
        day_number: it.day,
        time: it.time,
        activity: it.activity,
        location: it.location,
        cost: it.cost,
        category: it.category,
        notes: ''
      })),
      expenses: [],
      packing: [
        { id: 'p1', category: 'Documents', item_name: 'Passport & Travel Insurance', is_packed: 0 },
        { id: 'p2', category: 'Electronics', item_name: 'Camera & Portable Charger', is_packed: 0 },
        { id: 'p3', category: 'Clothing', item_name: 'Comfortable day shoes', is_packed: 0 },
        { id: 'p4', category: 'Essentials', item_name: 'Travel adapter & Sunscreen', is_packed: 0 }
      ]
    };
    trips.unshift(newTrip);
    saveStoredTrips(trips);
    return { id: newId, message: 'Trip successfully created from destination!' };
  }

  return null;
}

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
