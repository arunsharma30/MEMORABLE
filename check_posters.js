// ============================================================
//  Memorable - Database Diagnostic Check
//  Verify if Poster_Image_URL column exists and has data
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
  diagnose();
});

async function diagnose() {
  try {
    console.log('🔍 DIAGNOSTIC CHECK\n');
    
    // Check 1: Table structure
    console.log('📋 Step 1: Checking Content table structure...');
    const columns = await query('DESCRIBE Content');
    const posterColumnExists = columns.some(col => col.Field === 'Poster_Image_URL');
    
    if (posterColumnExists) {
      console.log('✅ Poster_Image_URL column EXISTS\n');
    } else {
      console.log('❌ Poster_Image_URL column MISSING\n');
      console.log('   → Running: ALTER TABLE Content ADD COLUMN Poster_Image_URL VARCHAR(500)...');
      await query('ALTER TABLE Content ADD COLUMN Poster_Image_URL VARCHAR(500) DEFAULT NULL');
      console.log('✅ Column added successfully!\n');
    }
    
    // Check 2: Total records
    console.log('📊 Step 2: Checking content records...');
    const allRecords = await query('SELECT COUNT(*) as count FROM Content');
    console.log(`✅ Total records: ${allRecords[0].count}\n`);
    
    // Check 3: Records with posters
    console.log('🖼️  Step 3: Checking poster coverage...');
    const withPosters = await query('SELECT COUNT(*) as count FROM Content WHERE Poster_Image_URL IS NOT NULL AND Poster_Image_URL != ""');
    const posterCount = withPosters[0].count;
    const totalCount = allRecords[0].count;
    const coverage = Math.round((posterCount / totalCount) * 100);
    
    console.log(`✅ Records with posters: ${posterCount}/${totalCount} (${coverage}%)\n`);
    
    // Check 4: Sample records
    console.log('📝 Step 4: Sample records:');
    const samples = await query('SELECT Content_ID, Title, Poster_Image_URL FROM Content LIMIT 5');
    samples.forEach((r, i) => {
      console.log(`\n  ${i + 1}. "${r.Title}"`);
      console.log(`     ID: ${r.Content_ID}`);
      console.log(`     Poster: ${r.Poster_Image_URL ? '✅ Have' : '❌ Missing'}`);
    });
    
    console.log('\n════════════════════════════════════════════════');
    console.log('📌 RECOMMENDATIONS:');
    console.log('════════════════════════════════════════════════\n');
    
    if (coverage === 0) {
      console.log('❌ NO POSTERS FOUND IN DATABASE');
      console.log('\n✅ To add posters from TMDB:');
      console.log('   1. Get your free API key at: https://www.themoviedb.org/settings/api');
      console.log('   2. Edit fetch_posters_tmdb.js and add your API key on line 12');
      console.log('   3. Run: node fetch_posters_tmdb.js');
    } else if (coverage < 100) {
      console.log(`⚠️  PARTIAL COVERAGE (${coverage}%)`);
      console.log('\n✅ To complete missing posters:');
      console.log('   1. Get your free API key at: https://www.themoviedb.org/settings/api');
      console.log('   2. Edit fetch_posters_tmdb.js and add your API key on line 12');
      console.log('   3. Run: node fetch_posters_tmdb.js');
    } else {
      console.log('✅ ALL POSTERS ARE LOADED!');
      console.log('   → Posters should now display on the website');
      console.log('   → Refresh your browser: http://localhost:3000/browse.html');
    }
    
    console.log('\n════════════════════════════════════════════════');
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
