// ============================================================
//  TMDB API Key Diagnostic Tool
//  Verify if your API key is valid and working
// ============================================================

const https = require('https');

const TMDB_API_KEY = process.env.TMDB_API_KEY || 'YOUR_API_KEY_HERE';

console.log('🔍 TMDB API Key Diagnostic\n');
console.log(`API Key: ${TMDB_API_KEY.substring(0, 5)}...${TMDB_API_KEY.substring(TMDB_API_KEY.length - 5)}\n`);

if (TMDB_API_KEY === 'YOUR_API_KEY_HERE') {
  console.error('❌ No API key provided!');
  process.exit(1);
}

// Test 1: Configuration endpoint
console.log('Test 1: Checking API Configuration...');
httpsGet(`https://api.themoviedb.org/3/configuration?api_key=${TMDB_API_KEY}`)
  .then(data => {
    if (data.images) {
      console.log('✅ API Configuration accessible\n');
      testSearch();
    } else if (data.status_code === 7) {
      console.error('❌ Invalid API key');
      process.exit(1);
    } else {
      console.log(data);
      testSearch();
    }
  })
  .catch(e => {
    console.error('❌ Configuration check failed:', e.message, '\n');
    testSearch();
  });

// Test 2: Search endpoint
function testSearch() {
  console.log('Test 2: Testing search endpoint...');
  
  const testQuery = 'game of thrones';
  httpsGet(`https://api.themoviedb.org/3/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(testQuery)}`)
    .then(data => {
      console.log(`Search for "${testQuery}":`);
      
      if (data.status_code) {
        console.log(`Status: ${data.status_message || data.status_code}`);
        
        if (data.status_code === 7) {
          console.log('\n❌ ERROR: Invalid API key!\n');
          console.log('Your API key appears to be invalid or expired.');
          console.log('Please verify:');
          console.log('1. You copied the correct API key (not the Access Token)');
          console.log('2. Your TMDB account is still active');
          console.log('3. Visit: https://www.themoviedb.org/settings/api to check\n');
        }
        process.exit(1);
      } else if (data.results && data.results.length > 0) {
        console.log(`✅ Found ${data.results.length} results\n`);
        
        console.log('Sample results:');
        data.results.slice(0, 3).forEach((r, i) => {
          console.log(`  ${i + 1}. "${r.title || r.name}" (${r.media_type})`);
          console.log(`     Poster: ${r.poster_path ? '✅ YES' : '❌ NO'}`);
        });
        
        console.log('\n✅ API KEY IS WORKING!\n');
        console.log('🎬 Your API key is valid and working.');
        console.log('   The issue might be with title matching.');
        process.exit(0);
      } else {
        console.log('No results for test query');
        process.exit(0);
      }
    })
    .catch(e => {
      console.error('❌ Search test failed:', e.message);
      process.exit(1);
    });
}

// HTTPS helper
function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error('Invalid JSON'));
        }
      });
    }).on('error', reject);
  });
}
