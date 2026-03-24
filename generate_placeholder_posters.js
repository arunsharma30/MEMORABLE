// ============================================================
//  Memorable - Generate Placeholder Posters (Quick Fix)
//  Creates colorful placeholder images instantly
//  No API key required - displays something immediately!
// ============================================================

const mysql = require('mysql2');

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
  generatePlaceholders();
});

// Generate colorful placeholder URLs for each title
async function generatePlaceholders() {
  try {
    const content = await query('SELECT Content_ID, Title, Genre FROM Content ORDER BY Content_ID ASC');
    
    console.log(`🎨 Generating ${content.length} placeholder poster images...\n`);
    
    const colors = [
      'FF6B6B', 'FF8C42', 'FFB84D', 'F4D35E',
      '6BCF7F', '4D96FF', '6C5CE7', 'A29BFE',
      'FD79A8', 'FDCB6E', '6C7A89', 'E17EB8'
    ];
    
    let updated = 0;
    
    for (let i = 0; i < content.length; i++) {
      const item = content[i];
      const colorIndex = i % colors.length;
      const bgColor = colors[colorIndex];
      const textColor = '000000';
      
      // Using placeholder.com for instant image generation
      const title = encodeURIComponent(item.Title.substring(0, 30));
      const genre = encodeURIComponent(item.Genre || 'Movie');
      
      // Generate URL with title text on colored background
      const placeholderUrl = `https://via.placeholder.com/300x450/${bgColor}/${textColor}?text=${title}`;
      
      // Update database
      await query(
        'UPDATE Content SET Poster_Image_URL = ? WHERE Content_ID = ?',
        [placeholderUrl, item.Content_ID]
      );
      
      process.stdout.write(`[${(i + 1).toString().padStart(3, ' ')}/${content.length}] ${item.Title.substring(0, 40).padEnd(40, ' ')} ✅\r`);
      updated++;
    }
    
    console.log(`\n✅ Generated ${updated} placeholder images!\n`);
    console.log('🎨 ════════════════════════════════════════════════════');
    console.log(`   All ${updated} titles now have placeholder posters`);
    console.log('════════════════════════════════════════════════════ 🎨\n');
    
    console.log('🌐 These are temporary colorful placeholders');
    console.log('   (Perfect while you set up your TMDB account)\n');
    
    console.log('📌 To replace with REAL posters:');
    console.log('   1. Get your TMDB API key (free, 2 minutes)');
    console.log('   2. Go to: https://www.themoviedb.org/settings/api');
    console.log('   3. Run: set TMDB_API_KEY=YOUR_KEY && node update_posters.js\n');
    
    console.log('✨ Website ready! Open: http://localhost:3000/browse.html');
    console.log('   Refresh to see the new placeholder posters!\n');
    
    db.end();
    
  } catch (e) {
    console.error('❌ Error:', e.message);
    db.end();
    process.exit(1);
  }
}

// Helper: Promise-based query
function query(sql, params = []) {
  return new Promise((res, rej) => {
    db.query(sql, params, (e, r) => e ? rej(e) : res(r));
  });
}
