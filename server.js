// ============================================================
//  Memorable Backend - server.js
//  Run: node server.js
//  Requires: npm install express mysql2 cors
// ============================================================

const express = require('express');
const mysql   = require('mysql2');
const cors    = require('cors');
const path    = require('path');
const https   = require('https');

const app  = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// ── DB Connection ────────────────────────────────────────────
const db = mysql.createConnection({
  host    : 'localhost',
  user    : 'root',          // change if needed
  password: 'arun2006',              // your MySQL root password
  database: 'netflixdb'
});

db.connect(err => {
  if (err) { console.error('DB Connection failed:', err.message); process.exit(1); }
  console.log('✅ Connected to MySQL - netflixdb');
});

// ── Helper ───────────────────────────────────────────────────
const query = (sql, params) =>
  new Promise((res, rej) => db.query(sql, params, (e, r) => e ? rej(e) : res(r)));

// ============================================================
//  AUTH
// ============================================================
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const rows = await query(
      'SELECT User_ID, Name, Email FROM User WHERE Email=? AND Password=SHA2(?,256)',
      [email, password]
    );
    if (!rows.length) return res.status(401).json({ error: 'Invalid credentials' });
    res.json({ user: rows[0] });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/register', async (req, res) => {
  const { name, email, phone, password } = req.body;
  try {
    const r = await query(
      'INSERT INTO User (Name,Email,Phone,Password) VALUES (?,?,?,SHA2(?,256))',
      [name, email, phone, password]
    );
    res.json({ user_id: r.insertId, name, email });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Email already exists' });
    res.status(500).json({ error: e.message });
  }
});

// ============================================================
//  CONTENT
// ============================================================
app.get('/api/content', async (req, res) => {
  try {
    const { genre, language, search } = req.query;
    let sql = 'SELECT * FROM Content WHERE 1=1';
    const params = [];
    if (genre)    { sql += ' AND Genre LIKE ?';    params.push(`%${genre}%`); }
    if (language) { sql += ' AND Language = ?';    params.push(language); }
    if (search)   { sql += ' AND Title LIKE ?';    params.push(`%${search}%`); }
    sql += ' ORDER BY Release_Date DESC';
    res.json(await query(sql, params));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Get individual content by ID
app.get('/api/content/:id', async (req, res) => {
  try {
    const rows = await query(
      'SELECT * FROM Content WHERE Content_ID = ?',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Content not found' });
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ============================================================
//  SUBSCRIPTION PLANS
// ============================================================
app.get('/api/plans', async (req, res) => {
  try { res.json(await query('SELECT * FROM Subscription_Plan')); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

// ============================================================
//  USER SUBSCRIPTION
// ============================================================
app.get('/api/subscription/:userId', async (req, res) => {
  try {
    const rows = await query(
      `SELECT s.*, sp.Plan_Name, sp.Price, sp.Video_Quality, sp.Max_Screens
       FROM Subscription s
       JOIN Subscription_Plan sp ON s.Plan_ID = sp.Plan_ID
       WHERE s.User_ID = ? ORDER BY s.Subscription_ID DESC LIMIT 1`,
      [req.params.userId]
    );
    res.json(rows[0] || null);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/subscribe', async (req, res) => {
  const { user_id, plan_id, payment_method } = req.body;
  const start = new Date();
  const end   = new Date(); end.setFullYear(end.getFullYear() + 1);
  const fmt   = d => d.toISOString().split('T')[0];

  try {
    // Get plan price
    const [plan] = await query('SELECT Price FROM Subscription_Plan WHERE Plan_ID=?', [plan_id]);
    if (!plan) return res.status(404).json({ error: 'Plan not found' });

    // Create subscription
    const sr = await query(
      'INSERT INTO Subscription (User_ID,Plan_ID,Start_Date,End_Date,Status) VALUES (?,?,?,?,?)',
      [user_id, plan_id, fmt(start), fmt(end), 'Active']
    );
    // Create payment
    await query(
      'INSERT INTO Payment (Subscription_ID,Payment_Date,Amount,Payment_Method,Payment_Status) VALUES (?,?,?,?,?)',
      [sr.insertId, fmt(start), plan.Price, payment_method, 'Completed']
    );
    res.json({ subscription_id: sr.insertId, message: 'Subscribed successfully!' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ============================================================
//  WATCH HISTORY
// ============================================================
app.get('/api/history/:userId', async (req, res) => {
  try {
    res.json(await query(
      `SELECT wh.History_ID, c.Title, c.Genre, c.Language, c.Duration, wh.Watch_Date
       FROM Watch_History wh
       JOIN Content c ON wh.Content_ID = c.Content_ID
       WHERE wh.User_ID = ? ORDER BY wh.Watch_Date DESC`,
      [req.params.userId]
    ));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/watch', async (req, res) => {
  const { user_id, content_id, title, genre, language, duration } = req.body;
  try {
    let cid = content_id;
    // If title is provided, ensure the content exists in DB
    if (title) {
      const existing = await query('SELECT Content_ID FROM Content WHERE Title = ? LIMIT 1', [title]);
      if (existing.length) {
        cid = existing[0].Content_ID;
      } else {
        // Auto-create content entry for browse-page movies not yet in DB
        const dur = duration ? parseInt(duration) || null : null;
        const result = await query(
          'INSERT INTO Content (Title, Genre, Language, Duration) VALUES (?, ?, ?, ?)',
          [title, genre || null, language || null, dur]
        );
        cid = result.insertId;
      }
    }
    await query('INSERT INTO Watch_History (User_ID, Content_ID, Watch_Date) VALUES (?, ?, NOW())', [user_id, cid]);
    res.json({ message: 'Added to watch history' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Add to watchlist
app.post('/api/watchlist', async (req, res) => {
  const { user_id, content_id } = req.body;
  try {
    // Check if already in watchlist
    const existing = await query(
      'SELECT Watchlist_ID FROM Watchlist WHERE User_ID = ? AND Content_ID = ?',
      [user_id, content_id]
    );
    if (existing.length) return res.status(409).json({ error: 'Already in watchlist' });
    
    // Add to watchlist
    await query(
      'INSERT INTO Watchlist (User_ID, Content_ID) VALUES (?, ?)',
      [user_id, content_id]
    );
    res.json({ message: 'Added to watchlist' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Get watchlist
app.get('/api/watchlist/:userId', async (req, res) => {
  try {
    const rows = await query(
      `SELECT w.Watchlist_ID, c.* FROM Watchlist w
       JOIN Content c ON w.Content_ID = c.Content_ID
       WHERE w.User_ID = ? ORDER BY w.Added_Date DESC`,
      [req.params.userId]
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ============================================================
//  PAYMENTS
// ============================================================
app.get('/api/payments/:userId', async (req, res) => {
  try {
    res.json(await query(
      `SELECT p.*, sp.Plan_Name FROM Payment p
       JOIN Subscription s ON p.Subscription_ID = s.Subscription_ID
       JOIN Subscription_Plan sp ON s.Plan_ID = sp.Plan_ID
       WHERE s.User_ID = ? ORDER BY p.Payment_Date DESC`,
      [req.params.userId]
    ));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ============================================================
//  DASHBOARD / STATS (Admin queries)
// ============================================================
app.get('/api/stats', async (req, res) => {
  try {
    const [users]    = await query('SELECT COUNT(*) AS c FROM User');
    const [subs]     = await query("SELECT COUNT(*) AS c FROM Subscription WHERE Status='Active'");
    const [revenue]  = await query("SELECT COALESCE(SUM(Amount),0) AS c FROM Payment WHERE Payment_Status='Completed'");
    const [content]  = await query('SELECT COUNT(*) AS c FROM Content');
    const popular    = await query(
      `SELECT c.Title, COUNT(*) AS Watches FROM Watch_History wh
       JOIN Content c ON wh.Content_ID=c.Content_ID
       GROUP BY c.Content_ID ORDER BY Watches DESC LIMIT 5`
    );
    res.json({ users: users.c, active_subs: subs.c, revenue: revenue.c, content: content.c, popular });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ============================================================
//  TMDB POSTER PROXY
// ============================================================
const TMDB_API_KEY = '8265bd1679663a7ea12ac168da84d2c8';

function tmdbFetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (resp) => {
      let data = '';
      resp.on('data', chunk => data += chunk);
      resp.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

app.get('/api/tmdb/poster', async (req, res) => {
  const { title } = req.query;
  if (!title) return res.status(400).json({ error: 'Title is required' });
  try {
    // Try as multi (movie + tv) search
    const encoded = encodeURIComponent(title);
    const data = await tmdbFetch(
      `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_API_KEY}&query=${encoded}&page=1`
    );
    if (data.results && data.results.length > 0) {
      const item = data.results[0];
      const posterPath = item.poster_path;
      if (posterPath) {
        const posterUrl = `https://image.tmdb.org/t/p/w500${posterPath}`;
        // Also update in DB so future loads are instant
        await query('UPDATE Content SET Poster_Image_URL = ? WHERE Title = ? AND (Poster_Image_URL IS NULL OR Poster_Image_URL = "")', [posterUrl, title]).catch(() => {});
        return res.json({ poster_url: posterUrl });
      }
    }
    res.json({ poster_url: '' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Start ─────────────────────────────────────────────────────
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));

