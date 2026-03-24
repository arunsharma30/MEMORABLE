// ============================================================
//  Memorable - Enhanced TMDB Poster Fetcher (v2)
//  Improved search with better matching and debugging
// ============================================================

const mysql = require('mysql2');
const https = require('https');

const TMDB_API_KEY = process.env.TMDB_API_KEY || 'YOUR_API_KEY_HERE';
const TMDB_IMG_BASE = 'https://image.tmdb.org/t/p/w500';

// Test data - some known titles that should work
const TEST_TITLES = [
  'Game of Thrones',
  'Breaking Bad',
  'Stranger Things',
  'Avatar'
];

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
  
  if (TMDB_API_KEY === 'YOUR_API_KEY_HERE') {
    console.error('❌ TMDB_API_KEY not set!');
    process.exit(1);
  }
  
  // First test the API key
  testTMDBAPI();
});

// Test if API key works
async function testTMDBAPI() {
  console.log('🧪 Testing TMDB API connection...\n');
  
  try {
    for (const title of TEST_TITLES) {
      process.stdout.write(`Testing "${title}"... `);
      const result = await searchTMDBEnhanced(title);
      
      if (result) {
        console.log(`✅ Found! (Type: ${result.type})`);
      } else {
        console.log('❌ Not found');
      }
    }
    
    console.log('\nProceeding with full database update...\n');
    await updateAllPosters();
    
  } catch (e) {
    console.error('❌ API Test Error:', e.message);
    db.end();
    process.exit(1);
  }
}

// Enhanced HTTPS request with timeout
function httpsGet(url, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { timeout }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error('Invalid JSON response'));
        }
      });
    });
    
    req.on('error', reject);
    req.on('timeout', () => {
      req.abort();
      reject(new Error('Request timeout'));
    });
  });
}

// Enhanced search with better matching
async function searchTMDBEnhanced(title) {
  const cleanTitle = title.trim();
  
  try {
    // Try 1: Exact search with TV first (most content is TV series now)
    let result = await trySearch('tv', cleanTitle);
    if (result) return { ...result, type: 'tv' };
    
    // Try 2: Search movies
    result = await trySearch('movie', cleanTitle);
    if (result) return { ...result, type: 'movie' };
    
    // Try 3: Remove year if present (e.g., "Title (2020)" -> "Title")
    const titleWithoutYear = cleanTitle.replace(/\s*\(\d{4}\)\s*$/, '').trim();
    if (titleWithoutYear !== cleanTitle) {
      result = await trySearch('tv', titleWithoutYear);
      if (result) return { ...result, type: 'tv' };
      
      result = await trySearch('movie', titleWithoutYear);
      if (result) return { ...result, type: 'movie' };
    }
    
    // Try 4: Multi search (fallback)
    result = await trySearch('multi', cleanTitle);
    if (result) return { ...result, type: 'multi' };
    
    return null;
    
  } catch (e) {
    return null;
  }
}

// Try search on specific endpoint
async function trySearch(endpoint, query) {
  try {
    const url = `https://api.themoviedb.org/3/search/${endpoint}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US`;
    const data = await httpsGet(url);
    
    if (data.results && data.results.length > 0) {
      const first = data.results[0];
      
      // Validate result has poster
      if (first.poster_path) {
        return first;
      }
    }
    
    return null;
    
  } catch (e) {
    return null;
  }
}

// Main function: Update all posters
async function updateAllPosters() {
  try {
    const content = await query('SELECT Content_ID, Title FROM Content ORDER BY Title ASC');
    
    console.log(`📚 Fetching ${content.length} titles from TMDB API...\n`);
    
    let success = 0;
    let failed = 0;
    let updates = [];
    
    for (let i = 0; i < content.length; i++) {
      const item = content[i];
      const progress = `[${(i + 1).toString().padStart(3, ' ')}/${content.length}]`;
      const titleDisplay = item.Title.substring(0, 35).padEnd(35, ' ');
      
      process.stdout.write(`${progress} "${titleDisplay}" `);
      
      try {
        const tmdbResult = await searchTMDBEnhanced(item.Title);
        
        if (tmdbResult && tmdbResult.poster_path) {
          const posterUrl = TMDB_IMG_BASE + tmdbResult.poster_path;
          updates.push({ id: item.Content_ID, url: posterUrl });
          console.log('✅');
          success++;
        } else {
          console.log('⚠️ ');
          failed++;
        }
      } catch (e) {
        console.log('❌');
        failed++;
      }
      
      await sleep(250);  // Rate limiting
    }
    
    // Batch update database
    console.log(`\n📝 Updating database with ${updates.length} posters...\n`);
    
    for (let i = 0; i < updates.length; i++) {
      const { id, url } = updates[i];
      await query(
        'UPDATE Content SET Poster_Image_URL = ? WHERE Content_ID = ?',
        [url, id]
      );
      
      if ((i + 1) % 15 === 0) {
        process.stdout.write(`   Updated ${i + 1}/${updates.length}...\r`);
      }
    }
    
    console.log(`\n\n🎬 ════════════════════════════════════════════════════`);
    console.log(`✅ Successfully fetched: ${success} posters`);
    console.log(`⚠️  No poster found: ${failed}`);
    console.log(`📊 Success rate: ${Math.round((success / content.length) * 100)}%`);
    console.log(`════════════════════════════════════════════════════ 🎬\n`);
    
    if (success > 0) {
      console.log('🎉 Posters updated! Refresh your browser to see the changes.');
      console.log('   URL: http://localhost:3000/browse.html\n');
    } else {
      console.log('❌ No posters were found. This might be an API issue.');
      console.log('   Troubleshooting:');
      console.log('   1. Verify your API key is correct');
      console.log('   2. Check TMDB website: https://www.themoviedb.org');
      console.log('   3. Make sure your account is active\n');
    }
    
    db.end();
    
  } catch (e) {
    console.error('\n❌ Error:', e.message);
    db.end();
    process.exit(1);
  }
}

// Helpers
function query(sql, params = []) {
  return new Promise((res, rej) => {
    db.query(sql, params, (e, r) => e ? rej(e) : res(r));
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
