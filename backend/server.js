const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const db = require('./db');
const { sendPaymentReceiptEmail, getReceiptHtml, buildReceiptHtml } = require('./emailService');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'tripmate_super_secret_key_2026';

app.use(cors());
app.use(express.json());

// --- HEALTH CHECK ENDPOINT ---
app.get(['/health', '/api/health'], (req, res) => {
  db.get('SELECT 1', [], (err) => {
    if (err) {
      return res.status(500).json({
        status: 'error',
        message: 'Database connection failed',
        error: err.message,
        timestamp: new Date().toISOString()
      });
    }
    res.json({
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  });
});

// Authentication Middleware
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Check if demo query or header allowed
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

// --- AUTH ROUTES ---

// Register
app.post('/api/auth/register', (req, res) => {
  const { name, email, password, country = 'India', currency = 'INR', gender = 'male', avatar } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email.toLowerCase()], async (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (user) return res.status(400).json({ error: 'An account with this email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();
    
    // Anime character avatar based on gender (Lorelei anime manga style)
    const defaultAvatar = (gender === 'female')
      ? 'https://api.dicebear.com/7.x/lorelei/svg?seed=Aiko'
      : 'https://api.dicebear.com/7.x/lorelei/svg?seed=Kenji';
    const finalAvatar = avatar || defaultAvatar;

    db.run(
      'INSERT INTO users (id, name, email, password, avatar, country, currency, gender) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, name, email.toLowerCase(), hashedPassword, finalAvatar, country, currency, gender],
      function (insertErr) {
        if (insertErr) return res.status(500).json({ error: insertErr.message });
        const token = jwt.sign({ id: userId, email: email.toLowerCase(), name }, JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({
          user: { id: userId, name, email: email.toLowerCase(), avatar: finalAvatar, country, currency, gender },
          token
        });
      }
    );
  });
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { email, password, country, currency, gender, avatar } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email.toLowerCase()], async (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid email or password' });

    const finalCountry = country || user.country || 'India';
    const finalCurrency = currency || user.currency || 'INR';
    const finalGender = gender || user.gender || 'male';
    
    let finalAvatar = avatar || user.avatar;
    if (!finalAvatar || gender) {
      finalAvatar = (finalGender === 'female')
        ? 'https://api.dicebear.com/7.x/lorelei/svg?seed=Aiko'
        : 'https://api.dicebear.com/7.x/lorelei/svg?seed=Kenji';
    }

    db.run(
      'UPDATE users SET country = ?, currency = ?, gender = ?, avatar = ? WHERE id = ?', 
      [finalCountry, finalCurrency, finalGender, finalAvatar, user.id]
    );

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
      user: { id: user.id, name: user.name, email: user.email, avatar: finalAvatar, country: finalCountry, currency: finalCurrency, gender: finalGender },
      token
    });
  });
});

// Demo Login (One-click explore)
app.post('/api/auth/demo', (req, res) => {
  const { country, currency, gender = 'male', avatar } = req.body || {};
  db.get('SELECT * FROM users WHERE email = ?', ['alex@tripmate.com'], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) {
      return res.status(404).json({ error: 'Demo user not initialized' });
    }
    const finalCountry = country || user.country || 'India';
    const finalCurrency = currency || user.currency || 'INR';
    const finalGender = gender || 'male';
    const finalAvatar = avatar || ((finalGender === 'female')
      ? 'https://api.dicebear.com/7.x/lorelei/svg?seed=Aiko'
      : 'https://api.dicebear.com/7.x/lorelei/svg?seed=Kenji');
    const finalName = finalGender === 'female' ? 'Aiko' : 'Alex Morgan';

    db.run(
      'UPDATE users SET name = ?, country = ?, currency = ?, gender = ?, avatar = ? WHERE id = ?',
      [finalName, finalCountry, finalCurrency, finalGender, finalAvatar, user.id]
    );

    const token = jwt.sign({ id: user.id, email: user.email, name: finalName }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
      user: { id: user.id, name: finalName, email: user.email, avatar: finalAvatar, country: finalCountry, currency: finalCurrency, gender: finalGender },
      token
    });
  });
});

// Current User Me
app.get('/api/auth/me', authenticate, (req, res) => {
  db.get('SELECT id, name, email, avatar, country, currency, gender, created_at FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  });
});

// Update User Preferred Country & Currency
app.put('/api/auth/country', authenticate, (req, res) => {
  const { country, currency } = req.body;
  if (!country) return res.status(400).json({ error: 'Country is required' });
  db.run(
    'UPDATE users SET country = ?, currency = ? WHERE id = ?',
    [country, currency || 'INR', req.user.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, country, currency: currency || 'INR' });
    }
  );
});

// --- TRIPS ROUTES ---

// List all trips for current user with aggregated spent and item count
app.get('/api/trips', authenticate, (req, res) => {
  const query = `
    SELECT 
      t.*,
      COALESCE((SELECT SUM(amount) FROM expenses WHERE trip_id = t.id), 0) AS total_spent,
      (SELECT COUNT(*) FROM itinerary_items WHERE trip_id = t.id) AS activity_count,
      (SELECT COUNT(*) FROM packing_items WHERE trip_id = t.id) AS packing_count,
      (SELECT COUNT(*) FROM packing_items WHERE trip_id = t.id AND is_packed = 1) AS packed_count
    FROM trips t
    WHERE t.user_id = ?
    ORDER BY t.start_date ASC
  `;

  db.all(query, [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ trips: rows });
  });
});

// Get single trip detail with itinerary, expenses, and packing items
app.get('/api/trips/:id', authenticate, (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM trips WHERE id = ? AND user_id = ?', [id, req.user.id], (err, trip) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!trip) return res.status(404).json({ error: 'Trip not found' });

    // Fetch itinerary items
    db.all(
      'SELECT * FROM itinerary_items WHERE trip_id = ? ORDER BY day_number ASC, order_index ASC',
      [id],
      (errIt, itinerary) => {
        if (errIt) return res.status(500).json({ error: errIt.message });

        // Fetch expenses
        db.all(
          'SELECT * FROM expenses WHERE trip_id = ? ORDER BY date DESC',
          [id],
          (errExp, expenses) => {
            if (errExp) return res.status(500).json({ error: errExp.message });

            // Fetch packing items
            db.all(
              'SELECT * FROM packing_items WHERE trip_id = ? ORDER BY category ASC, item_name ASC',
              [id],
              (errPack, packing) => {
                if (errPack) return res.status(500).json({ error: errPack.message });

                const totalSpent = expenses.reduce((sum, item) => sum + item.amount, 0);

                res.json({
                  trip: {
                    ...trip,
                    total_spent: totalSpent,
                    itinerary,
                    expenses,
                    packing
                  }
                });
              }
            );
          }
        );
      }
    );
  });
});

// Create new trip
app.post('/api/trips', authenticate, (req, res) => {
  const {
    title,
    destination,
    country,
    start_date,
    end_date,
    budget,
    currency = 'INR',
    trip_type = 'Solo',
    cover_image,
    notes = ''
  } = req.body;

  if (!title || !destination || !start_date || !end_date) {
    return res.status(400).json({ error: 'Title, destination, start date, and end date are required' });
  }

  const tripId = uuidv4();
  const defaultImages = [
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1512100356356-de1b84283e18?auto=format&fit=crop&w=1200&q=80'
  ];
  const finalCover = cover_image || defaultImages[Math.floor(Math.random() * defaultImages.length)];

  db.run(
    `INSERT INTO trips (id, user_id, title, destination, country, start_date, end_date, budget, currency, trip_type, cover_image, status, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'upcoming', ?)`,
    [tripId, req.user.id, title, destination, country || '', start_date, end_date, budget || 0, currency, trip_type, finalCover, notes],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      // Automatically add essential packing checklist starter items
      const defaultPacks = [
        { cat: 'Documents', name: 'Passport / Travel ID' },
        { cat: 'Documents', name: 'Boarding passes / Bookings' },
        { cat: 'Electronics', name: 'Phone charger & Power bank' },
        { cat: 'Clothing', name: 'Comfortable walking shoes' },
        { cat: 'Essentials', name: 'Toiletries & Personal meds' }
      ];

      const stmt = db.prepare('INSERT INTO packing_items (id, trip_id, category, item_name, is_packed) VALUES (?, ?, ?, ?, 0)');
      defaultPacks.forEach(p => {
        stmt.run(uuidv4(), tripId, p.cat, p.name);
      });
      stmt.finalize();

      res.status(201).json({ id: tripId, message: 'Trip created successfully' });
    }
  );
});

// Update trip
app.put('/api/trips/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const { title, destination, country, start_date, end_date, budget, currency, trip_type, cover_image, status, notes } = req.body;

  db.run(
    `UPDATE trips SET 
      title = COALESCE(?, title),
      destination = COALESCE(?, destination),
      country = COALESCE(?, country),
      start_date = COALESCE(?, start_date),
      end_date = COALESCE(?, end_date),
      budget = COALESCE(?, budget),
      currency = COALESCE(?, currency),
      trip_type = COALESCE(?, trip_type),
      cover_image = COALESCE(?, cover_image),
      status = COALESCE(?, status),
      notes = COALESCE(?, notes)
     WHERE id = ? AND user_id = ?`,
    [title, destination, country, start_date, end_date, budget, currency, trip_type, cover_image, status, notes, id, req.user.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Trip updated successfully' });
    }
  );
});

// Delete trip
app.delete('/api/trips/:id', authenticate, (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM trips WHERE id = ? AND user_id = ?', [id, req.user.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    // Cascades
    db.run('DELETE FROM itinerary_items WHERE trip_id = ?', [id]);
    db.run('DELETE FROM expenses WHERE trip_id = ?', [id]);
    db.run('DELETE FROM packing_items WHERE trip_id = ?', [id]);
    res.json({ message: 'Trip deleted successfully' });
  });
});

// --- ITINERARY ROUTES ---

// Add itinerary activity
app.post('/api/trips/:id/itinerary', authenticate, (req, res) => {
  const { id: trip_id } = req.params;
  const { day_number, time, activity, location, cost = 0, notes = '', category = 'Sightseeing' } = req.body;

  if (!day_number || !activity) {
    return res.status(400).json({ error: 'Day number and activity title are required' });
  }

  const itemId = uuidv4();
  db.run(
    `INSERT INTO itinerary_items (id, trip_id, day_number, time, activity, location, cost, notes, category)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [itemId, trip_id, day_number, time || '', activity, location || '', cost, notes, category],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: itemId, message: 'Activity added successfully' });
    }
  );
});

// Delete itinerary activity
app.delete('/api/itinerary/:itemId', authenticate, (req, res) => {
  const { itemId } = req.params;
  db.run('DELETE FROM itinerary_items WHERE id = ?', [itemId], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Activity removed' });
  });
});

// --- EXPENSES ROUTES ---

// Add expense
app.post('/api/trips/:id/expenses', authenticate, (req, res) => {
  const { id: trip_id } = req.params;
  const { title, amount, category, date, notes = '' } = req.body;

  if (!title || amount === undefined || !category || !date) {
    return res.status(400).json({ error: 'Title, amount, category, and date are required' });
  }

  const expenseId = uuidv4();
  db.run(
    `INSERT INTO expenses (id, trip_id, title, amount, category, date, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [expenseId, trip_id, title, parseFloat(amount), category, date, notes],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: expenseId, message: 'Expense logged successfully' });
    }
  );
});

// Delete expense
app.delete('/api/expenses/:expenseId', authenticate, (req, res) => {
  const { expenseId } = req.params;
  db.run('DELETE FROM expenses WHERE id = ?', [expenseId], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Expense removed' });
  });
});

// Process Trip Payment, Split Amount into 6 Categories, and Send Confirmation Email
app.post('/api/trips/:id/pay', authenticate, async (req, res) => {
  const { id: tripId } = req.params;
  const {
    amount,
    paymentMethod = 'UPI',
    paymentDetails = {},
    recipientEmail,
    categorySplit
  } = req.body;

  db.get('SELECT * FROM trips WHERE id = ? AND user_id = ?', [tripId, req.user.id], async (err, trip) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!trip) return res.status(404).json({ error: 'Trip not found' });

    const targetEmail = (recipientEmail && recipientEmail.trim()) || req.user.email || 'guest@tripmate.com';

    const totalToPay = Math.round(parseFloat(amount || trip.budget || 50000));
    if (totalToPay <= 0) {
      return res.status(400).json({ error: 'Payment amount must be greater than zero' });
    }

    // Default 6-category percentage breakdown matching user screenshot:
    // 1. Accommodation (35%), 2. Transport (25%), 3. Food (18%), 4. Activities (12%), 5. Shopping (7%), 6. Other (3%)
    const defaultSplit = {
      'Accommodation': 35,
      'Transport': 25,
      'Food': 18,
      'Activities': 12,
      'Shopping': 7,
      'Other': 3
    };

    const splitConfig = categorySplit || defaultSplit;
    const categoryEntries = Object.entries(splitConfig);
    
    // Calculate rounded rupee amounts ensuring exact total sum
    let allocatedSum = 0;
    const splitResults = categoryEntries.map(([cat, pct], idx) => {
      let catAmount;
      if (idx === categoryEntries.length - 1) {
        catAmount = totalToPay - allocatedSum; // Absorb any rounding difference
      } else {
        catAmount = Math.round((totalToPay * pct) / 100);
        allocatedSum += catAmount;
      }
      return {
        category: cat,
        percent: pct,
        amount: catAmount
      };
    });

    const transactionId = 'TXN_TM_' + Math.random().toString(36).substring(2, 10).toUpperCase();
    const currentDate = new Date().toISOString().split('T')[0];

    // Expense descriptive titles for realistic tracking
    const itemTitles = {
      'Accommodation': 'Hotel, Resort & Stay Booking',
      'Transport': 'Flights, Train & Transit Commute',
      'Food': 'Daily Dining, Cafes & Culinary Treats',
      'Activities': 'Sightseeing Passes & Adventure Tours',
      'Shopping': 'Local Markets & Souvenirs Allowance',
      'Other': 'Travel Insurance & Contingency Fund'
    };

    // Insert 6 expense records into the database
    const insertStmt = db.prepare(
      `INSERT INTO expenses (id, trip_id, title, amount, category, date, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    );

    splitResults.forEach(item => {
      const expId = uuidv4();
      const title = itemTitles[item.category] || `${item.category} Allocation`;
      const notes = `Auto-split payment via ${paymentMethod} (${item.percent}%). Ref: ${transactionId}`;
      insertStmt.run(expId, tripId, title, item.amount, item.category, currentDate, notes);
    });

    insertStmt.finalize(async (insertErr) => {
      if (insertErr) {
        return res.status(500).json({ error: 'Failed to log expenses: ' + insertErr.message });
      }

      // Save receipt to payment_receipts table
      const receiptId = uuidv4();
      db.run(
        `INSERT INTO payment_receipts (id, trip_id, user_id, recipient_email, transaction_id, amount, payment_method, split_json, preview_url)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [receiptId, tripId, req.user.id, targetEmail, transactionId, totalToPay, paymentMethod, JSON.stringify(splitResults), null]
      );

      res.json({
        success: true,
        message: `Payment of ₹${totalToPay.toLocaleString('en-IN')} completed successfully!`,
        transactionId,
        receiptId,
        amount: totalToPay,
        currency: 'INR',
        paymentMethod,
        emailSentTo: targetEmail,
        emailPreviewUrl: null,
        isRealDelivery: false,
        split: splitResults
      });
    });
  });
});

// Get all payment receipts for current user (Mailbox)
app.get('/api/user/receipts', authenticate, (req, res) => {
  db.all(
    `SELECT pr.*, t.destination, t.country, t.title as trip_title
     FROM payment_receipts pr
     JOIN trips t ON pr.trip_id = t.id
     WHERE pr.user_id = ?
     ORDER BY pr.created_at DESC`,
    [req.user.id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      const parsedRows = (rows || []).map(r => ({
        ...r,
        split: JSON.parse(r.split_json || '[]')
      }));
      res.json({ receipts: parsedRows });
    }
  );
});

// View Full HTML Receipt / Invoice in Browser
app.get('/api/receipts/:txnId', (req, res) => {
  const { txnId } = req.params;
  const html = getReceiptHtml(txnId);
  if (html) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(html);
  }

  // Fallback to SQLite lookup
  db.get(
    `SELECT pr.*, t.destination, t.country, t.title as trip_title, t.trip_type
     FROM payment_receipts pr
     JOIN trips t ON pr.trip_id = t.id
     WHERE pr.transaction_id = ?`,
    [txnId],
    (err, row) => {
      if (err || !row) {
        return res.status(404).send(`
          <!DOCTYPE html><html><body style="font-family: sans-serif; background: #0b1120; color: #fff; padding: 40px; text-align: center;">
            <h2>Receipt Not Found or Session Expired</h2>
            <p>No invoice found for transaction ID: ${txnId}</p>
            <a href="/" style="color: #38bdf8;">Return to TripMate</a>
          </body></html>
        `);
      }

      const generated = buildReceiptHtml({
        recipientEmail: row.recipient_email,
        trip: {
          destination: row.destination,
          country: row.country,
          title: row.trip_title,
          trip_type: row.trip_type
        },
        paymentMethod: row.payment_method,
        split: JSON.parse(row.split_json || '[]'),
        transactionId: row.transaction_id,
        totalAmount: row.amount
      });
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(generated);
    }
  );
});

// --- PACKING ROUTES ---

// Add packing item
app.post('/api/trips/:id/packing', authenticate, (req, res) => {
  const { id: trip_id } = req.params;
  const { item_name, category = 'Essentials' } = req.body;

  if (!item_name) {
    return res.status(400).json({ error: 'Item name is required' });
  }

  const itemId = uuidv4();
  db.run(
    `INSERT INTO packing_items (id, trip_id, category, item_name, is_packed)
     VALUES (?, ?, ?, ?, 0)`,
    [itemId, trip_id, category, item_name],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: itemId, message: 'Packing item added' });
    }
  );
});

// Toggle packing item packed state
app.patch('/api/packing/:itemId/toggle', authenticate, (req, res) => {
  const { itemId } = req.params;
  db.run(
    'UPDATE packing_items SET is_packed = CASE WHEN is_packed = 1 THEN 0 ELSE 1 END WHERE id = ?',
    [itemId],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Toggled packing status' });
    }
  );
});

// Delete packing item
app.delete('/api/packing/:itemId', authenticate, (req, res) => {
  const { itemId } = req.params;
  db.run('DELETE FROM packing_items WHERE id = ?', [itemId], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Packing item removed' });
  });
});

// --- CURATED DESTINATIONS FOR DISCOVERY ---
const DESTINATIONS = [
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

app.get('/api/destinations', (req, res) => {
  res.json({ destinations: DESTINATIONS });
});

// One-click instant trip generation from curated destination
app.post('/api/destinations/:id/create-trip', authenticate, (req, res) => {
  const dest = DESTINATIONS.find(d => d.id === req.params.id);
  if (!dest) {
    return res.status(404).json({ error: 'Destination not found' });
  }

  const tripId = uuidv4();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 30); // 1 month from now
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + dest.suggestedDays);

  const startStr = startDate.toISOString().split('T')[0];
  const endStr = endDate.toISOString().split('T')[0];
  const totalBudget = dest.avgDailyCost * dest.suggestedDays;

  db.run(
    `INSERT INTO trips (id, user_id, title, destination, country, start_date, end_date, budget, currency, trip_type, cover_image, status, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'INR', 'Solo', ?, 'upcoming', ?)`,
    [
      tripId,
      req.user.id,
      `${dest.name} Discovery & Highlights`,
      dest.name,
      dest.country,
      startStr,
      endStr,
      totalBudget,
      dest.image,
      `Curated itinerary for ${dest.name}, ${dest.country}. Best season: ${dest.bestSeason}`
    ],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      // Insert sample itinerary
      const stmtIt = db.prepare(
        `INSERT INTO itinerary_items (id, trip_id, day_number, time, activity, location, cost, notes, category, order_index)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      );
      dest.sampleItinerary.forEach((it, idx) => {
        stmtIt.run(uuidv4(), tripId, it.day, it.time, it.activity, it.location, it.cost, '', it.category, idx);
      });
      stmtIt.finalize();

      // Insert default packing items
      const defaultPacks = [
        { cat: 'Documents', name: 'Passport & Travel Insurance' },
        { cat: 'Electronics', name: 'Camera & Portable Charger' },
        { cat: 'Clothing', name: 'Comfortable day shoes' },
        { cat: 'Essentials', name: 'Travel adapter & Sunscreen' }
      ];
      const stmtPack = db.prepare('INSERT INTO packing_items (id, trip_id, category, item_name, is_packed) VALUES (?, ?, ?, ?, 0)');
      defaultPacks.forEach(p => {
        stmtPack.run(uuidv4(), tripId, p.cat, p.name);
      });
      stmtPack.finalize();

      res.status(201).json({ id: tripId, message: 'Trip successfully created from destination!' });
    }
  );
});

// Countries route (All world countries stored in alphabetical order)
app.get('/api/countries', (req, res) => {
  try {
    const countriesFilePath = path.resolve(__dirname, 'countries.json');
    if (fs.existsSync(countriesFilePath)) {
      const data = JSON.parse(fs.readFileSync(countriesFilePath, 'utf8'));
      return res.json({ countries: data, total: data.length });
    }
    return res.status(404).json({ error: 'Countries data file not found' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'TripMate Backend', timestamp: new Date() });
});

// Start Server
app.listen(PORT, () => {
  console.log(`TripMate Backend Server running on http://localhost:${PORT}`);
});
