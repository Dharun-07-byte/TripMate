const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.resolve(__dirname, 'tripmate.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to connect to SQLite database:', err.message);
  } else {
    console.log('Connected to SQLite database at', dbPath);
  }
});

// Initialize Tables
db.serialize(() => {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      avatar TEXT,
      country TEXT DEFAULT 'India',
      currency TEXT DEFAULT 'INR',
      gender TEXT DEFAULT 'male',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Migration for existing tables
  db.run(`ALTER TABLE users ADD COLUMN country TEXT DEFAULT 'India'`, () => {});
  db.run(`ALTER TABLE users ADD COLUMN currency TEXT DEFAULT 'INR'`, () => {});
  db.run(`ALTER TABLE users ADD COLUMN gender TEXT DEFAULT 'male'`, () => {});

  // Trips table
  db.run(`
    CREATE TABLE IF NOT EXISTS trips (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      destination TEXT NOT NULL,
      country TEXT,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      budget REAL DEFAULT 0,
      currency TEXT DEFAULT 'USD',
      trip_type TEXT DEFAULT 'Solo',
      cover_image TEXT,
      status TEXT DEFAULT 'upcoming',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Itinerary Items table
  db.run(`
    CREATE TABLE IF NOT EXISTS itinerary_items (
      id TEXT PRIMARY KEY,
      trip_id TEXT NOT NULL,
      day_number INTEGER NOT NULL,
      time TEXT,
      activity TEXT NOT NULL,
      location TEXT,
      cost REAL DEFAULT 0,
      notes TEXT,
      category TEXT DEFAULT 'Sightseeing',
      order_index INTEGER DEFAULT 0,
      FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
    )
  `);

  // Expenses table
  db.run(`
    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      trip_id TEXT NOT NULL,
      title TEXT NOT NULL,
      amount REAL NOT NULL,
      category TEXT NOT NULL,
      date TEXT NOT NULL,
      notes TEXT,
      FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
    )
  `);

  // Packing Checklist table
  db.run(`
    CREATE TABLE IF NOT EXISTS packing_items (
      id TEXT PRIMARY KEY,
      trip_id TEXT NOT NULL,
      category TEXT NOT NULL,
      item_name TEXT NOT NULL,
      is_packed INTEGER DEFAULT 0,
      FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
    )
  `);

  // Payment Receipts table (Mailbox)
  db.run(`
    CREATE TABLE IF NOT EXISTS payment_receipts (
      id TEXT PRIMARY KEY,
      trip_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      recipient_email TEXT NOT NULL,
      transaction_id TEXT NOT NULL,
      amount REAL NOT NULL,
      payment_method TEXT NOT NULL,
      split_json TEXT NOT NULL,
      preview_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Optimize Query Performance with Indexes
  db.run(`CREATE INDEX IF NOT EXISTS idx_trips_user_id ON trips(user_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_itinerary_items_trip_id ON itinerary_items(trip_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_expenses_trip_id ON expenses(trip_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_payment_receipts_user_id ON payment_receipts(user_id)`);

  // Seed default demo user and initial trips if empty
  db.get("SELECT COUNT(*) as count FROM users", async (err, row) => {
    if (err) return console.error(err);
    if (row.count === 0) {
      console.log('Seeding initial demo data...');
      const demoUserId = 'demo-user-123';
      const hashedPassword = await bcrypt.hash('password123', 10);

      db.run(
        `INSERT INTO users (id, name, email, password, avatar) VALUES (?, ?, ?, ?, ?)`,
        [demoUserId, 'Alex Morgan', 'alex@tripmate.com', hashedPassword, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80']
      );

      // Seed Trip 1: Tokyo
      const trip1Id = 'trip-tokyo-01';
      db.run(
        `INSERT INTO trips (id, user_id, title, destination, country, start_date, end_date, budget, currency, trip_type, cover_image, status, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          trip1Id,
          demoUserId,
          'Tokyo Neon & Cherry Blossoms',
          'Tokyo',
          'Japan',
          '2026-10-15',
          '2026-10-22',
          210000,
          'INR',
          'Solo',
          'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
          'upcoming',
          'Passport renewed, JR Rail Pass ordered. Don’t forget camera lenses!'
        ]
      );

      // Seed Tokyo Itinerary
      const tokyoItinerary = [
        { id: 'tokyo-it-1', day: 1, time: '09:00 AM', act: 'Arrival at Haneda & Hotel Check-in', loc: 'Shinjuku Prince Hotel', cost: 5000, cat: 'Transport', notes: 'Pick up Suica Card at station' },
        { id: 'tokyo-it-2', day: 1, time: '02:00 PM', act: 'Explore Shinjuku Gyoen National Garden', loc: 'Shinjuku', cost: 1200, cat: 'Sightseeing', notes: 'Enjoy cherry blossom paths' },
        { id: 'tokyo-it-3', day: 1, time: '07:30 PM', act: 'Ramen Tasting at Omoide Yokocho', loc: 'Memory Lane, Shinjuku', cost: 2100, cat: 'Food', notes: 'Classic Tokyo alleyway vibe' },
        { id: 'tokyo-it-4', day: 2, time: '08:30 AM', act: 'Senso-ji Temple Morning Visit', loc: 'Asakusa', cost: 0, cat: 'Sightseeing', notes: 'Get early before the crowds arrive' },
        { id: 'tokyo-it-5', day: 2, time: '01:00 PM', act: 'Akihabara Tech & Arcade Walk', loc: 'Akihabara', cost: 3500, cat: 'Shopping', notes: 'Look for retro games' },
        { id: 'tokyo-it-6', day: 2, time: '06:00 PM', act: 'Shibuya Crossing & Sky Observatory', loc: 'Shibuya Scramble Square', cost: 1900, cat: 'Sightseeing', notes: 'Sunset views over Shibuya' },
        { id: 'tokyo-it-7', day: 3, time: '10:00 AM', act: 'TeamLab Borderless Digital Museum', loc: 'Azabudai Hills', cost: 3000, cat: 'Sightseeing', notes: 'Pre-booked tickets' }
      ];

      tokyoItinerary.forEach((it, idx) => {
        db.run(
          `INSERT INTO itinerary_items (id, trip_id, day_number, time, activity, location, cost, notes, category, order_index)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [it.id, trip1Id, it.day, it.time, it.act, it.loc, it.cost, it.notes, it.cat, idx]
        );
      });

      // Seed Tokyo Expenses
      const tokyoExpenses = [
        { id: 'exp-1', title: 'Shinjuku Hotel Deposit', amount: 42000, cat: 'Accommodation', date: '2026-10-15', notes: '3 nights stay' },
        { id: 'exp-2', title: 'Tokyo Metro Pass 72h', amount: 1300, cat: 'Transport', date: '2026-10-15', notes: 'Subway unlimited' },
        { id: 'exp-3', title: 'TeamLab Digital Art Tickets', amount: 3000, cat: 'Activities', date: '2026-10-16', notes: 'Online booking' },
        { id: 'exp-4', title: 'Sushi dinner in Ginza', amount: 6500, cat: 'Food', date: '2026-10-16', notes: 'Chef selection omakase' },
        { id: 'exp-5', title: 'Souvenirs in Nakamise-dori', amount: 4200, cat: 'Shopping', date: '2026-10-17', notes: 'Traditional sweets & charms' }
      ];

      tokyoExpenses.forEach(exp => {
        db.run(
          `INSERT INTO expenses (id, trip_id, title, amount, category, date, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [exp.id, trip1Id, exp.title, exp.amount, exp.cat, exp.date, exp.notes]
        );
      });

      // Seed Tokyo Packing items
      const tokyoPacking = [
        { id: 'pack-1', cat: 'Documents', name: 'Passport & Japan Visa QR Code', packed: 1 },
        { id: 'pack-2', cat: 'Electronics', name: 'Power Bank & Universal Travel Adapter', packed: 1 },
        { id: 'pack-3', cat: 'Clothing', name: 'Comfortable walking sneakers', packed: 1 },
        { id: 'pack-4', cat: 'Clothing', name: 'Light windbreaker jacket', packed: 0 },
        { id: 'pack-5', cat: 'Essentials', name: 'Pocket WiFi / eSIM setup', packed: 1 },
        { id: 'pack-6', cat: 'Essentials', name: 'Prescription medicines & mini first aid', packed: 0 }
      ];

      tokyoPacking.forEach(p => {
        db.run(
          `INSERT INTO packing_items (id, trip_id, category, item_name, is_packed)
           VALUES (?, ?, ?, ?, ?)`,
          [p.id, trip1Id, p.cat, p.name, p.packed]
        );
      });

      // Seed Trip 2: Paris
      const trip2Id = 'trip-paris-02';
      db.run(
        `INSERT INTO trips (id, user_id, title, destination, country, start_date, end_date, budget, currency, trip_type, cover_image, status, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          trip2Id,
          demoUserId,
          'Parisian Romance & Art Stroll',
          'Paris',
          'France',
          '2026-11-04',
          '2026-11-10',
          280000,
          'INR',
          'Couple',
          'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
          'upcoming',
          'Museum passes reserved, book Seine river dinner cruise.'
        ]
      );

      // Seed Paris Itinerary
      const parisItinerary = [
        { id: 'paris-it-1', day: 1, time: '10:00 AM', act: 'Croissant breakfast at Saint-Germain', loc: 'Café de Flore', cost: 2200, cat: 'Food', notes: 'Iconic Parisian café' },
        { id: 'paris-it-2', day: 1, time: '01:30 PM', act: 'Louvre Masterpieces Tour', loc: 'Musée du Louvre', cost: 1900, cat: 'Sightseeing', notes: 'Mona Lisa & Venus de Milo' },
        { id: 'paris-it-3', day: 1, time: '08:00 PM', act: 'Eiffel Tower Night Illumination', loc: 'Champ de Mars', cost: 0, cat: 'Sightseeing', notes: 'Sparkling lights at the hour' }
      ];

      parisItinerary.forEach((it, idx) => {
        db.run(
          `INSERT INTO itinerary_items (id, trip_id, day_number, time, activity, location, cost, notes, category, order_index)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [it.id, trip2Id, it.day, it.time, it.act, it.loc, it.cost, it.notes, it.cat, idx]
        );
      });

      // Seed Trip 3: Bali (Past trip)
      const trip3Id = 'trip-bali-03';
      db.run(
        `INSERT INTO trips (id, user_id, title, destination, country, start_date, end_date, budget, currency, trip_type, cover_image, status, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          trip3Id,
          demoUserId,
          'Bali Sunset & Jungle Retreat',
          'Bali',
          'Indonesia',
          '2026-05-10',
          '2026-05-18',
          150000,
          'INR',
          'Friends',
          'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80',
          'completed',
          'Unforgettable surf sessions in Canggu and waterfalls in Ubud.'
        ]
      );

      console.log('Initial demo data seeded successfully!');
    }
  });
});

module.exports = db;
