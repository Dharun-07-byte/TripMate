// Client-side fallback store for standalone GitHub Pages deployment
// Ensures 100% functionality even when no backend Node server is running.

export const MOCK_DESTINATIONS = [
  {
    id: 'dest-kyoto',
    name: 'Kyoto',
    country: 'Japan',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1000&q=80',
    description: 'Serene bamboo groves, iconic golden pavilions, traditional geisha districts, and zen gardens.',
    bestSeason: 'Spring & Autumn (Mar-May, Oct-Nov)',
    avgDailyCost: 9000,
    tag: 'Culture & Nature',
    highlights: ['Fushimi Inari Taisha', 'Arashiyama Bamboo Grove', 'Kinkaku-ji', 'Gion Quarter'],
    suggestedDays: 5,
    sampleItinerary: [
      { day: 1, time: '08:30 AM', activity: 'Walk through Thousands of Torii Gates', location: 'Fushimi Inari', cost: 0, category: 'Sightseeing' },
      { day: 1, time: '01:00 PM', activity: 'Matcha Tea Ceremony in Gion', location: 'Gion District', cost: 2800, category: 'Food' },
      { day: 2, time: '09:00 AM', activity: 'Morning Bamboo Grove Stroll', location: 'Arashiyama', cost: 0, category: 'Sightseeing' },
      { day: 2, time: '02:00 PM', activity: 'Visit the Golden Pavilion', location: 'Kinkaku-ji', cost: 850, category: 'Sightseeing' }
    ]
  },
  {
    id: 'dest-amalfi',
    name: 'Amalfi Coast',
    country: 'Italy',
    image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1000&q=80',
    description: 'Pastel cliffside villages tumbling down to azure Mediterranean waters and fragrant lemon groves.',
    bestSeason: 'Late Spring & Early Autumn (May-Jun, Sep-Oct)',
    avgDailyCost: 15000,
    tag: 'Coastal Luxury',
    highlights: ['Positano Cliff Village', 'Path of the Gods hike', 'Capri Day Boat Trip', 'Ravello Gardens'],
    suggestedDays: 6,
    sampleItinerary: [
      { day: 1, time: '10:00 AM', activity: 'Ferry arrival and Positano exploration', location: 'Positano Marina', cost: 2200, category: 'Transport' },
      { day: 1, time: '07:30 PM', activity: 'Seafood dinner with cliffside sunset', location: 'Ristorante La Sponda', cost: 5500, category: 'Food' },
      { day: 2, time: '09:30 AM', activity: 'Hike the Path of the Gods', location: 'Bomerano to Nocelle', cost: 0, category: 'Sightseeing' }
    ]
  },
  {
    id: 'dest-reykjavik',
    name: 'Iceland South Coast',
    country: 'Iceland',
    image: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=1000&q=80',
    description: 'Land of fire and ice: majestic roaring waterfalls, black sand volcanic beaches, and the dancing Aurora Borealis.',
    bestSeason: 'Autumn & Winter for Aurora (Sep-Mar); Summer for Roadtrips (Jun-Aug)',
    avgDailyCost: 16500,
    tag: 'Adventure & Nature',
    highlights: ['Seljalandsfoss Waterfall', 'Reynisfjara Black Sand Beach', 'Blue Lagoon', 'Golden Circle'],
    suggestedDays: 7,
    sampleItinerary: [
      { day: 1, time: '11:00 AM', activity: 'Blue Lagoon geothermal thermal soak', location: 'Grindavík', cost: 7200, category: 'Activities' },
      { day: 2, time: '09:00 AM', activity: 'Golden Circle Geysir & Gullfoss tour', location: 'Thingvellir & Gullfoss', cost: 4200, category: 'Sightseeing' },
      { day: 3, time: '08:00 PM', activity: 'Northern Lights Hunting Expedition', location: 'South Coast Wilderness', cost: 5000, category: 'Sightseeing' }
    ]
  },
  {
    id: 'dest-santorini',
    name: 'Santorini',
    country: 'Greece',
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1000&q=80',
    description: 'Whitewashed cubist buildings, vivid blue domes, volcanic beaches, and world-renowned caldera sunsets.',
    bestSeason: 'Spring & Autumn (Apr-Jun, Sep-Oct)',
    avgDailyCost: 13500,
    tag: 'Romantic Getaway',
    highlights: ['Oia Sunset Castle', 'Fira to Oia Caldera Trail', 'Red Beach', 'Santorini Wine Tasting'],
    suggestedDays: 4,
    sampleItinerary: [
      { day: 1, time: '04:00 PM', activity: 'Oia Caldera Walk & Sunset Spotting', location: 'Oia Castle', cost: 0, category: 'Sightseeing' },
      { day: 2, time: '11:00 AM', activity: 'Volcanic Catamaran Cruise & Hot Springs', location: 'Amoudi Bay', cost: 9500, category: 'Activities' }
    ]
  },
  {
    id: 'dest-zermatt',
    name: 'Zermatt & Matterhorn',
    country: 'Switzerland',
    image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1000&q=80',
    description: 'Car-free alpine paradise beneath the pyramid peak of the Matterhorn, offering world-class trails and fondue.',
    bestSeason: 'Winter for skiing (Dec-Apr), Summer for hiking (Jul-Sep)',
    avgDailyCost: 18500,
    tag: 'Alpine & Winter',
    highlights: ['Gornergrat Cogwheel Train', 'Matterhorn Glacier Paradise', 'Five Lakes Trail', 'Swiss Fondue Night'],
    suggestedDays: 5,
    sampleItinerary: [
      { day: 1, time: '09:30 AM', activity: 'Gornergrat Railway to 3,089m peak view', location: 'Gornergrat Station', cost: 7800, category: 'Transport' },
      { day: 1, time: '07:00 PM', activity: 'Authentic Swiss Cheese Fondue Dinner', location: 'Walliserstube Zermatt', cost: 3800, category: 'Food' }
    ]
  },
  {
    id: 'dest-bali',
    name: 'Ubud & Canggu',
    country: 'Indonesia',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1000&q=80',
    description: 'Emerald terraced rice paddies, ancient spiritual temples, vibrant bohemian cafes, and tropical beach breaks.',
    bestSeason: 'Dry season (Apr-Oct)',
    avgDailyCost: 5500,
    tag: 'Budget & Wellness',
    highlights: ['Tegallalang Rice Terraces', 'Sacred Monkey Forest', 'Canggu Surf Beach', 'Campuhan Ridge Walk'],
    suggestedDays: 7,
    sampleItinerary: [
      { day: 1, time: '08:00 AM', activity: 'Sunrise walk on Campuhan Ridge', location: 'Campuhan Ubud', cost: 0, category: 'Sightseeing' },
      { day: 1, time: '02:00 PM', activity: 'Traditional Balinese Herbal Spa', location: 'Karsa Spa Ubud', cost: 2500, category: 'Activities' },
      { day: 2, time: '09:00 AM', activity: 'Tegallalang Rice Terrace exploration', location: 'Tegallalang', cost: 450, category: 'Sightseeing' }
    ]
  }
];

export const INITIAL_TRIPS = [
  {
    id: 'trip-tokyo-01',
    user_id: 'demo-user-123',
    title: 'Tokyo Neon & Cherry Blossoms',
    destination: 'Tokyo',
    country: 'Japan',
    start_date: '2026-10-15',
    end_date: '2026-10-22',
    budget: 210000,
    currency: 'INR',
    trip_type: 'Solo',
    cover_image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
    status: 'upcoming',
    notes: 'Passport renewed, JR Rail Pass ordered. Don’t forget camera lenses!',
    itinerary: [
      { id: 'tokyo-it-1', day_number: 1, time: '09:00 AM', activity: 'Arrival at Haneda & Hotel Check-in', location: 'Shinjuku Prince Hotel', cost: 5000, category: 'Transport', notes: 'Pick up Suica Card at station' },
      { id: 'tokyo-it-2', day_number: 1, time: '02:00 PM', activity: 'Explore Shinjuku Gyoen National Garden', location: 'Shinjuku', cost: 1200, category: 'Sightseeing', notes: 'Enjoy cherry blossom paths' },
      { id: 'tokyo-it-3', day_number: 1, time: '07:30 PM', activity: 'Ramen Tasting at Omoide Yokocho', location: 'Memory Lane, Shinjuku', cost: 2100, category: 'Food', notes: 'Classic Tokyo alleyway vibe' },
      { id: 'tokyo-it-4', day_number: 2, time: '08:30 AM', activity: 'Senso-ji Temple Morning Visit', location: 'Asakusa', cost: 0, category: 'Sightseeing', notes: 'Get early before the crowds arrive' },
      { id: 'tokyo-it-5', day_number: 2, time: '01:00 PM', activity: 'Akihabara Tech & Arcade Walk', location: 'Akihabara', cost: 3500, category: 'Shopping', notes: 'Look for retro games' },
      { id: 'tokyo-it-6', day_number: 2, time: '06:00 PM', activity: 'Shibuya Crossing & Sky Observatory', location: 'Shibuya Scramble Square', cost: 1900, category: 'Sightseeing', notes: 'Sunset views over Shibuya' },
      { id: 'tokyo-it-7', day_number: 3, time: '10:00 AM', activity: 'TeamLab Borderless Digital Museum', location: 'Azabudai Hills', cost: 3000, category: 'Sightseeing', notes: 'Pre-booked tickets' }
    ],
    expenses: [
      { id: 'exp-1', title: 'Shinjuku Hotel Deposit', amount: 42000, category: 'Accommodation', date: '2026-10-15', notes: '3 nights stay' },
      { id: 'exp-2', title: 'Tokyo Metro Pass 72h', amount: 1300, category: 'Transport', date: '2026-10-15', notes: 'Subway unlimited' },
      { id: 'exp-3', title: 'TeamLab Digital Art Tickets', amount: 3000, category: 'Activities', date: '2026-10-16', notes: 'Online booking' },
      { id: 'exp-4', title: 'Sushi dinner in Ginza', amount: 6500, category: 'Food', date: '2026-10-16', notes: 'Chef selection omakase' },
      { id: 'exp-5', title: 'Souvenirs in Nakamise-dori', amount: 4200, category: 'Shopping', date: '2026-10-17', notes: 'Traditional sweets & charms' }
    ],
    packing: [
      { id: 'pack-1', category: 'Documents', item_name: 'Passport & Japan Visa QR Code', is_packed: 1 },
      { id: 'pack-2', category: 'Electronics', item_name: 'Power Bank & Universal Travel Adapter', is_packed: 1 },
      { id: 'pack-3', category: 'Clothing', item_name: 'Comfortable walking sneakers', is_packed: 1 },
      { id: 'pack-4', category: 'Clothing', item_name: 'Light windbreaker jacket', is_packed: 0 },
      { id: 'pack-5', category: 'Essentials', item_name: 'Pocket WiFi / eSIM setup', is_packed: 1 },
      { id: 'pack-6', category: 'Essentials', item_name: 'Prescription medicines & mini first aid', is_packed: 0 }
    ]
  },
  {
    id: 'trip-paris-02',
    user_id: 'demo-user-123',
    title: 'Parisian Romance & Art Stroll',
    destination: 'Paris',
    country: 'France',
    start_date: '2026-11-04',
    end_date: '2026-11-10',
    budget: 280000,
    currency: 'INR',
    trip_type: 'Couple',
    cover_image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
    status: 'upcoming',
    notes: 'Museum passes reserved, book Seine river dinner cruise.',
    itinerary: [
      { id: 'paris-it-1', day_number: 1, time: '10:00 AM', activity: 'Croissant breakfast at Saint-Germain', location: 'Café de Flore', cost: 2200, category: 'Food', notes: 'Iconic Parisian café' },
      { id: 'paris-it-2', day_number: 1, time: '01:30 PM', activity: 'Louvre Masterpieces Tour', location: 'Musée du Louvre', cost: 1900, category: 'Sightseeing', notes: 'Mona Lisa & Venus de Milo' },
      { id: 'paris-it-3', day_number: 1, time: '08:00 PM', activity: 'Eiffel Tower Night Illumination', location: 'Champ de Mars', cost: 0, category: 'Sightseeing', notes: 'Sparkling lights at the hour' }
    ],
    expenses: [
      { id: 'exp-p1', title: 'Saint-Germain Boutique Hotel', amount: 55000, category: 'Accommodation', date: '2026-11-04', notes: 'Deposit' },
      { id: 'exp-p2', title: 'Museum Pass 4-day', amount: 8400, category: 'Activities', date: '2026-11-04', notes: 'Access to Louvre & Orsay' }
    ],
    packing: [
      { id: 'pack-p1', category: 'Documents', item_name: 'Passports & Travel Insurance', is_packed: 1 },
      { id: 'pack-p2', category: 'Electronics', item_name: 'EU Plug Adapter', is_packed: 1 },
      { id: 'pack-p3', category: 'Clothing', item_name: 'Warm Trench Coat & Scarf', is_packed: 0 }
    ]
  },
  {
    id: 'trip-bali-03',
    user_id: 'demo-user-123',
    title: 'Bali Sunset & Jungle Retreat',
    destination: 'Bali',
    country: 'Indonesia',
    start_date: '2026-05-10',
    end_date: '2026-05-18',
    budget: 150000,
    currency: 'INR',
    trip_type: 'Friends',
    cover_image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80',
    status: 'completed',
    notes: 'Unforgettable surf sessions in Canggu and waterfalls in Ubud.',
    itinerary: [
      { id: 'bali-it-1', day_number: 1, time: '08:00 AM', activity: 'Sunrise walk on Campuhan Ridge', location: 'Campuhan Ubud', cost: 0, category: 'Sightseeing', notes: '' },
      { id: 'bali-it-2', day_number: 1, time: '02:00 PM', activity: 'Traditional Balinese Herbal Spa', location: 'Karsa Spa Ubud', cost: 2500, category: 'Activities', notes: '' }
    ],
    expenses: [
      { id: 'exp-b1', title: 'Villa in Ubud (3 nights)', amount: 28000, category: 'Accommodation', date: '2026-05-10', notes: 'Private pool' },
      { id: 'exp-b2', title: 'Scooter Rental (1 week)', amount: 3500, category: 'Transport', date: '2026-05-11', notes: 'Includes helmets' }
    ],
    packing: [
      { id: 'pack-b1', category: 'Clothing', item_name: 'Swimwear & Beach Towel', is_packed: 1 },
      { id: 'pack-b2', category: 'Essentials', item_name: 'Reef-safe Sunscreen & Mosquito Spray', is_packed: 1 }
    ]
  }
];

// Helper to load or initialize trips from localStorage
export function getStoredTrips() {
  const stored = localStorage.getItem('tripmate_local_trips');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // fallback
    }
  }
  localStorage.setItem('tripmate_local_trips', JSON.stringify(INITIAL_TRIPS));
  return JSON.parse(JSON.stringify(INITIAL_TRIPS));
}

export function saveStoredTrips(trips) {
  localStorage.setItem('tripmate_local_trips', JSON.stringify(trips));
}

export function getStoredReceipts() {
  const stored = localStorage.getItem('tripmate_local_receipts');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // fallback
    }
  }
  return [];
}

export function saveStoredReceipts(receipts) {
  localStorage.setItem('tripmate_local_receipts', JSON.stringify(receipts));
}
