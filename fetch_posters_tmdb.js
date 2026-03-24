// ============================================================
//  Memorable - Fetch & Update Poster Images from TMDB
//  The Movie Database (TMDB) - Official Source
//  Get your free API key at: https://www.themoviedb.org/settings/api
// ============================================================

const mysql = require('mysql2');
const https = require('https');

// ⚠️ IMPORTANT: Add your TMDB API key here
// Get it for free at: https://www.themoviedb.org/settings/api
const TMDB_API_KEY = 'YOUR_TMDB_API_KEY_HERE';  // ← Add your key here

// Image base URL from TMDB
const TMDB_IMG_BASE = 'https://image.tmdb.org/t/p/w500';

// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'arun2006',
  database: 'netflixdb'
});

db.connect(err => {
  if (err) {
    console.error('❌ DB Connection failed:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to MySQL - netflixdb\n');
  
  if (TMDB_API_KEY === 'YOUR_TMDB_API_KEY_HERE') {
    console.error('❌ ERROR: TMDB API key not set!');
    console.error('⚠️  Please add your TMDB API key to this file:');
    console.error('   1. Go to: https://www.themoviedb.org/settings/api');
    console.error('   2. Copy your API key');
    console.error('   3. Replace "YOUR_TMDB_API_KEY_HERE" on line 12');
    process.exit(1);
  }
  
  fetchAndUpdatePosters();
});

// Helper: Make HTTPS request
function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

// Search for movie/series on TMDB
async function searchTMDB(title, type = 'multi') {
  try {
    const url = `https://api.themoviedb.org/3/search/${type}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}&language=en-US`;
    const data = await httpsGet(url);
    
    if (data.results && data.results.length > 0) {
      return data.results[0];  // Return first (best) match
    }
    return null;
  } catch (e) {
    console.error(`⚠️  Search error for "${title}":`, e.message);
    return null;
  }
}

// Fetch all content from database and update with posters
async function fetchAndUpdatePosters() {
  try {
    // Step 1: Get all content without posters
    const content = await new Promise((res, rej) => {
      db.query('SELECT Content_ID, Title, Genre FROM Content ORDER BY Title ASC', (e, r) => {
        e ? rej(e) : res(r);
      });
    });
    
    console.log(`🎬 Found ${content.length} titles in database`);
    console.log(`📡 Fetching posters from TMDB API...\n`);
    
    let successCount = 0;
    let failCount = 0;
    
    // Step 2: For each title, search TMDB and get poster
    for (let i = 0; i < content.length; i++) {
      const item = content[i];
      process.stdout.write(`[${i + 1}/${content.length}] Searching for "${item.Title}"... `);
      
      // Search TMDB
      const tmdbResult = await searchTMDB(item.Title, 'multi');
      
      if (tmdbResult && tmdbResult.poster_path) {
        const posterUrl = TMDB_IMG_BASE + tmdbResult.poster_path;
        
        // Update database
        await new Promise((res, rej) => {
          db.query(
            'UPDATE Content SET Poster_Image_URL = ? WHERE Content_ID = ?',
            [posterUrl, item.Content_ID],
            (e) => e ? rej(e) : res()
          );
        });
        
        console.log(`✅ Added`);
        successCount++;
      } else {
        console.log(`⚠️  No poster found`);
        failCount++;
      }
      
      // Rate limiting (TMDB allows ~40 requests per 10 seconds)
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    console.log(`\n🎬 ════════════════════════════════════════════════`);
    console.log(`✅ Successfully added ${successCount} posters`);
    console.log(`⚠️  Failed to find ${failCount} posters`);
    console.log(`📊 Success rate: ${Math.round((successCount / content.length) * 100)}%`);
    console.log(`════════════════════════════════════════════════ 🎬`);
    
    db.end();
  } catch (e) {
    console.error('❌ Error:', e.message);
    db.end();
    process.exit(1);
  }
}
