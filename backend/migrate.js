const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'tripmate.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to open database:', err);
    process.exit(1);
  }
  console.log('Opened database for migration to INR');
});

db.serialize(() => {
  // Update currency and budgets
  db.run(`UPDATE trips SET currency = 'INR'`);
  db.run(`UPDATE trips SET budget = 210000 WHERE id = 'trip-tokyo-01'`);
  db.run(`UPDATE trips SET budget = 280000 WHERE id = 'trip-paris-02'`);
  db.run(`UPDATE trips SET budget = 150000 WHERE id = 'trip-bali-03'`);

  // Update seeded Tokyo expenses
  db.run(`UPDATE expenses SET amount = 42000 WHERE id = 'exp-1'`);
  db.run(`UPDATE expenses SET amount = 1300 WHERE id = 'exp-2'`);
  db.run(`UPDATE expenses SET amount = 3000 WHERE id = 'exp-3'`);
  db.run(`UPDATE expenses SET amount = 6500 WHERE id = 'exp-4'`);
  db.run(`UPDATE expenses SET amount = 4200 WHERE id = 'exp-5'`);

  // Update any other expenses if budget was in USD (multiply small numbers by 85)
  db.run(`UPDATE expenses SET amount = amount * 85 WHERE amount < 1000 AND id NOT IN ('exp-1','exp-2','exp-3','exp-4','exp-5')`);

  // Update seeded itinerary costs
  db.run(`UPDATE itinerary_items SET cost = 5000 WHERE id = 'tokyo-it-1'`);
  db.run(`UPDATE itinerary_items SET cost = 1200 WHERE id = 'tokyo-it-2'`);
  db.run(`UPDATE itinerary_items SET cost = 2100 WHERE id = 'tokyo-it-3'`);
  db.run(`UPDATE itinerary_items SET cost = 0 WHERE id = 'tokyo-it-4'`);
  db.run(`UPDATE itinerary_items SET cost = 3500 WHERE id = 'tokyo-it-5'`);
  db.run(`UPDATE itinerary_items SET cost = 1900 WHERE id = 'tokyo-it-6'`);
  db.run(`UPDATE itinerary_items SET cost = 3000 WHERE id = 'tokyo-it-7'`);

  db.run(`UPDATE itinerary_items SET cost = 2200 WHERE id = 'paris-it-1'`);
  db.run(`UPDATE itinerary_items SET cost = 1900 WHERE id = 'paris-it-2'`);
  db.run(`UPDATE itinerary_items SET cost = 0 WHERE id = 'paris-it-3'`);

  console.log('Database records converted to INR successfully!');
});

db.close();
