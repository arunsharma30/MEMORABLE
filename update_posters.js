// ============================================================
//  Memorable - Update Posters from TMDB API
//  Fetches poster images from The Movie Database
//  TMDB API Key Required (free): https://www.themoviedb.org/settings/api
// ============================================================

const mysql = require('mysql2');
const https = require('https');

// 🔑 IMPORTANT: Add your TMDB API key here
// Get it for FREE (takes 2 minutes): https://www.themoviedb.org/settings/api
const TMDB_API_KEY = process.env.TMDB_API_KEY || 'YOUR_API_KEY_HERE';

const TMDB_IMG_BASE = 'https://image.tmdb.org/t/p/w500';  // 500px width posters

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
  
  if (TMDB_API_KEY === 'YOUR_API_KEY_HERE') {
    showInstructions();
    process.exit(0);
  }
  
  updatePostersFromTMDB();
});

function showInstructions() {
  console.log('🔑 TMDB API KEY REQUIRED\n');
  console.log('═══════════════════════════════════════════════════════');
  console.log('\n📌 STEPS TO GET YOUR FREE API KEY:\n');
  console.log('1️⃣  Go to: https://www.themoviedb.org/settings/api');
  console.log('2️⃣  Sign up (free) or login with your account');
  console.log('3️⃣  Click "Request an API Key"');
  console.log('4️⃣  Accept the terms and click "Agree"');
  console.log('5️⃣  Fill out the form (2 minutes)');
  console.log('6️⃣  Copy your API Key from the dashboard\n');
  console.log('═══════════════════════════════════════════════════════\n');
  
  console.log('📖 OPTION 1: Set as Environment Variable (Recommended)');
  console.log('   Windows (Command Prompt):');
  console.log('   set TMDB_API_KEY=YOUR_KEY_HERE && node update_posters.js\n');
  console.log('   Windows (PowerShell):');
  console.log('   $env:TMDB_API_KEY="YOUR_KEY_HERE"; node update_posters.js\n');
  
  console.log('📖 OPTION 2: Edit This File');
  console.log('   Replace "YOUR_API_KEY_HERE" on line 11 with your API key\n');
  
  console.log('✅ After you do that, run:');
  console.log('   node update_posters.js\n');
  console.log('═══════════════════════════════════════════════════════\n');
}

// Make HTTPS request
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

// Search TMDB for title
async function searchTMDB(title, type = 'multi') {
  try {
    const url = `https://api.themoviedb.org/3/search/${type}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}&language=en-US`;
    const data = await httpsGet(url);
    if (data.results && data.results.length > 0) {
      return data.results[0];
    }
    return null;
  } catch (e) {
    return null;
  }
}

// Main function: Update all posters
async function updatePostersFromTMDB() {
  try {
    // Fetch all content
    const content = await query('SELECT Content_ID, Title FROM Content ORDER BY Title ASC');
    
    console.log(`📚 Fetching ${content.length} titles from TMDB API...\n`);
    
    let success = 0;
    let failed = 0;
    let noImage = 0;
    let updates = [];
    
    // Search each title
    for (let i = 0; i < content.length; i++) {
      const item = content[i];
      const progress = `[${(i + 1).toString().padStart(3, ' ')}/${content.length}]`;
      
      process.stdout.write(`${progress} "${item.Title.substring(0, 35).padEnd(35, ' ')}" `);
      
      try {
        const tmdbResult = await searchTMDB(item.Title);
        
        if (tmdbResult && tmdbResult.poster_path) {
          const posterUrl = TMDB_IMG_BASE + tmdbResult.poster_path;
          updates.push({ id: item.Content_ID, url: posterUrl });
          console.log('✅');
          success++;
        } else {
          console.log('⚠️  No poster');
          noImage++;
        }
      } catch (e) {
        console.log('❌');
        failed++;
      }
      
      // Rate limiting (TMDB: ~40 req/10 sec)
      await sleep(300);
    }
    
    // Batch update database
    console.log(`\n📝 Updating database with ${updates.length} posters...\n`);
    
    for (let i = 0; i < updates.length; i++) {
      const { id, url } = updates[i];
      await query(
        'UPDATE Content SET Poster_Image_URL = ? WHERE Content_ID = ?',
        [url, id]
      );
      
      if ((i + 1) % 10 === 0) {
        process.stdout.write(`   Updated ${i + 1}/${updates.length}...\r`);
      }
    }
    
    console.log(`\n\n🎬 ════════════════════════════════════════════════════`);
    console.log(`✅ Successfully fetched: ${success} posters`);
    console.log(`⚠️  No poster found: ${noImage}`);
    console.log(`❌ API errors: ${failed}`);
    console.log(`📊 Success rate: ${Math.round((success / content.length) * 100)}%`);
    console.log(`════════════════════════════════════════════════════ 🎬\n`);
    
    console.log('🎉 All posters updated! Refresh your browser to see the changes.');
    console.log('   URL: http://localhost:3000/browse.html\n');
    
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
