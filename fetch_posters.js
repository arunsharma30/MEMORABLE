// ============================================================
//  Memorable - Fetch Poster Images from TMDB API
//  Automatically downloads and adds poster images to all movies/series
// ============================================================

const mysql = require('mysql2');
const axios = require('axios');

// TMDB API Configuration
const TMDB_API_KEY = '8265bd1679663a7ea12ac168da84d2c8'; // Free API Key
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500'; // 500px width poster

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
  fetchAllPosters();
});

// List of content with release info for more accurate TMDB matching
const movieDatabase = [
  // ================= ENGLISH WEB SERIES =================
  { title: 'Game of Thrones', year: 2011, type: 'tv' },
  { title: 'The Boys', year: 2019, type: 'tv' },
  { title: 'Peaky Blinders', year: 2013, type: 'tv' },
  { title: 'Breaking Bad', year: 2008, type: 'tv' },
  { title: 'Better Call Saul', year: 2015, type: 'tv' },
  { title: 'The Office', year: 2005, type: 'tv' },
  { title: 'Friends', year: 1994, type: 'tv' },
  { title: 'The Crown', year: 2016, type: 'tv' },
  { title: 'The Crown Season 5', year: 2022, type: 'tv', search: 'The Crown' },
  { title: 'The Crown Season 6', year: 2023, type: 'tv', search: 'The Crown' },
  { title: 'Narcos', year: 2015, type: 'tv' },
  { title: 'Narcos: Mexico', year: 2018, type: 'tv' },
  { title: 'Ozark', year: 2017, type: 'tv' },
  { title: 'Black Mirror', year: 2011, type: 'tv' },
  { title: 'Sherlock', year: 2010, type: 'tv' },
  { title: 'The Sopranos', year: 1999, type: 'tv' },
  { title: 'The Wire', year: 2002, type: 'tv' },
  { title: 'True Detective', year: 2014, type: 'tv' },
  { title: 'Succession', year: 2018, type: 'tv' },
  { title: 'The Last of Us', year: 2023, type: 'tv' },
  { title: 'Severance', year: 2022, type: 'tv' },
  { title: 'Ted Lasso', year: 2020, type: 'tv' },
  { title: 'Chernobyl', year: 2019, type: 'tv' },
  { title: 'Band of Brothers', year: 2001, type: 'tv' },
  { title: 'The Pacific', year: 2010, type: 'tv' },
  { title: 'Westworld', year: 2016, type: 'tv' },
  { title: 'True Blood', year: 2008, type: 'tv' },
  { title: 'House', year: 2004, type: 'tv' },
  { title: 'Stranger Things', year: 2016, type: 'tv' },
  { title: 'Wednesday', year: 2022, type: 'tv' },
  { title: 'The Witcher', year: 2019, type: 'tv' },
  { title: 'Bridgerton', year: 2020, type: 'tv' },
  { title: 'Bridgerton Season 2', year: 2022, type: 'tv', search: 'Bridgerton' },
  { title: 'Bridgerton Season 3', year: 2023, type: 'tv', search: 'Bridgerton' },
  { title: 'Outlander', year: 2014, type: 'tv' },
  { title: 'Vikings', year: 2013, type: 'tv' },
  { title: 'The Witcher: Blood Origin', year: 2022, type: 'tv' },
  { title: 'The Diplomat', year: 2023, type: 'tv' },
  { title: 'You', year: 2018, type: 'tv' },
  { title: 'Virgin River', year: 2019, type: 'tv' },
  { title: 'Ginny & Georgia', year: 2021, type: 'tv' },
  { title: 'Never Have I Ever', year: 2020, type: 'tv' },
  { title: 'Atypical', year: 2017, type: 'tv' },
  { title: 'Umbrella Academy', year: 2019, type: 'tv' },
  { title: 'Lucifer', year: 2015, type: 'tv' },
  { title: 'Midnight Club', year: 2022, type: 'tv' },
  { title: 'Archive 81', year: 2022, type: 'tv' },
  { title: '13 Reasons Why', year: 2017, type: 'tv' },
  { title: 'Sex Education', year: 2019, type: 'tv' },
  { title: 'Outer Banks', year: 2020, type: 'tv' },
  { title: 'Elite', year: 2018, type: 'tv' },
  { title: 'Money Heist', year: 2017, type: 'tv' },
  { title: 'La Casa de Papel', year: 2017, type: 'tv' },
  { title: 'Dark', year: 2017, type: 'tv' },
  { title: 'Godless', year: 2017, type: 'tv' },
  { title: 'The Haunting of Hill House', year: 2018, type: 'tv' },
  { title: 'The Haunting of Bly Manor', year: 2020, type: 'tv' },
  { title: 'Mindhunter', year: 2017, type: 'tv' },
  { title: 'Godfather of Harlem', year: 2019, type: 'tv' },
  { title: 'The Marvelous Mrs. Maisel', year: 2017, type: 'tv' },
  { title: 'Fleabag', year: 2016, type: 'tv' },
  { title: 'Schitt\'s Creek', year: 2015, type: 'tv' },
  { title: 'The Good Place', year: 2016, type: 'tv' },
  { title: 'Halt and Catch Fire', year: 2014, type: 'tv' },
  { title: 'The Newsroom', year: 2012, type: 'tv' },
  { title: 'Silicon Valley', year: 2014, type: 'tv' },
  { title: 'Veep', year: 2012, type: 'tv' },
  { title: 'Insecure', year: 2016, type: 'tv' },
  { title: 'Atlanta', year: 2016, type: 'tv' },
  { title: 'Ramy', year: 2019, type: 'tv' },
  { title: 'Master of None', year: 2015, type: 'tv' },

  // ================= ASIAN WEB SERIES =================
  { title: 'Squid Game', year: 2021, type: 'tv' },
  { title: 'Itaewon Class', year: 2020, type: 'tv' },
  { title: 'Crash Landing on You', year: 2019, type: 'tv' },
  { title: 'Start-Up', year: 2020, type: 'tv' },
  { title: 'My Name', year: 2021, type: 'tv' },
  { title: 'Bodyguard', year: 2020, type: 'tv' },
  { title: 'Extracurricular', year: 2020, type: 'tv' },
  { title: 'Hellbound', year: 2021, type: 'tv' },
  { title: 'All of Us Are Dead', year: 2022, type: 'tv' },
  { title: 'Juvenile Justice', year: 2022, type: 'tv' },
  { title: 'Alchemy of Souls', year: 2022, type: 'tv' },
  { title: 'Business Proposal', year: 2022, type: 'tv' },
  { title: 'Happiness', year: 2021, type: 'tv' },
  { title: 'Snowdrop', year: 2021, type: 'tv' },
  { title: 'Glitch', year: 2020, type: 'tv' },
  { title: 'Mystic Pop', year: 2020, type: 'tv' },
  { title: 'The Cursed', year: 2020, type: 'tv' },
  { title: 'Mouse', year: 2021, type: 'tv' },
  { title: 'Beyond Evil', year: 2021, type: 'tv' },
  { title: 'Hospital Playlist', year: 2020, type: 'tv' },
  { title: 'Record of Youth', year: 2020, type: 'tv' },

  { title: 'Attack on Titan', year: 2013, type: 'tv' },
  { title: 'Death Note', year: 2006, type: 'tv' },
  { title: 'Fullmetal Alchemist: Brotherhood', year: 2009, type: 'tv' },
  { title: 'Demon Slayer', year: 2019, type: 'tv' },
  { title: 'Jujutsu Kaisen', year: 2020, type: 'tv' },

  // ================= INDIAN WEB SERIES =================
  { title: 'Sacred Games', year: 2018, type: 'tv' },
  { title: 'Sacred Games Season 2', year: 2019, type: 'tv', search: 'Sacred Games' },
  { title: 'Mirzapur', year: 2018, type: 'tv' },
  { title: 'Mirzapur Season 2', year: 2020, type: 'tv', search: 'Mirzapur' },
  { title: 'The Family Man', year: 2019, type: 'tv' },
  { title: 'The Family Man Season 2', year: 2021, type: 'tv', search: 'The Family Man' },
  { title: 'Panchayat', year: 2020, type: 'tv' },
  { title: 'Panchayat Season 2', year: 2022, type: 'tv', search: 'Panchayat' },
  { title: 'Farzi', year: 2023, type: 'tv' },
  { title: 'Scam 1992', year: 2020, type: 'tv' },
  { title: 'Kota Factory', year: 2019, type: 'tv' },
  { title: 'Asur', year: 2020, type: 'tv' },
  { title: 'Special OPS', year: 2020, type: 'tv' },
  { title: 'Bad Boys', year: 2021, type: 'tv' },
  { title: 'Aarya', year: 2020, type: 'tv' },

  // ================= HOLLYWOOD BLOCKBUSTER MOVIES =================
  { title: 'The Godfather', year: 1972, type: 'movie' },
  { title: 'The Godfather Part II', year: 1974, type: 'movie' },
  { title: 'The Dark Knight', year: 2008, type: 'movie' },
  { title: 'The Dark Knight Rises', year: 2012, type: 'movie' },
  { title: 'Batman Begins', year: 2005, type: 'movie' },
  { title: 'Pulp Fiction', year: 1994, type: 'movie' },
  { title: 'The Lord of the Rings: The Fellowship of the Ring', year: 2001, type: 'movie' },
  { title: 'The Lord of the Rings: The Two Towers', year: 2002, type: 'movie' },
  { title: 'The Lord of the Rings: The Return of the King', year: 2003, type: 'movie' },
  { title: 'Fight Club', year: 1999, type: 'movie' },
  { title: 'Forrest Gump', year: 1994, type: 'movie' },
  { title: 'The Shawshank Redemption', year: 1994, type: 'movie' },
  { title: 'The Matrix', year: 1999, type: 'movie' },
  { title: 'The Matrix Reloaded', year: 2003, type: 'movie' },
  { title: 'Inception', year: 2010, type: 'movie' },
  { title: 'Interstellar', year: 2014, type: 'movie' },
  { title: 'Avengers: Endgame', year: 2019, type: 'movie' },
  { title: 'Avengers: Infinity War', year: 2018, type: 'movie' },
  { title: 'Spider-Man: No Way Home', year: 2021, type: 'movie' },
  { title: 'Spider-Man: Into the Spider-Verse', year: 2018, type: 'movie' },
  { title: 'Jurassic Park', year: 1993, type: 'movie' },
  { title: 'Jurassic World', year: 2015, type: 'movie' },
  { title: 'Dune: Part One', year: 2021, type: 'movie' },
  { title: 'Dune: Part Two', year: 2024, type: 'movie' },
  { title: 'Mad Max: Fury Road', year: 2015, type: 'movie' },
  { title: 'Blade Runner 2049', year: 2017, type: 'movie' },
  { title: 'Oppenheimer', year: 2023, type: 'movie' },
  { title: 'Joker', year: 2019, type: 'movie' },
  { title: 'The Wolf of Wall Street', year: 2013, type: 'movie' },
  { title: 'Titanic', year: 1997, type: 'movie' },
  { title: 'Avatar', year: 2009, type: 'movie' },
  { title: 'Avatar: The Way of Water', year: 2022, type: 'movie' },
  { title: 'Top Gun: Maverick', year: 2022, type: 'movie' },

  // ================= INDIAN BLOCKBUSTER MOVIES =================
  { title: 'Dangal', year: 2016, type: 'movie' },
  { title: '3 Idiots', year: 2009, type: 'movie' },
  { title: 'Bahubali: The Beginning', year: 2015, type: 'movie' },
  { title: 'Bahubali 2: The Conclusion', year: 2017, type: 'movie' },
  { title: 'KGF: Chapter 1', year: 2018, type: 'movie' },
  { title: 'KGF: Chapter 2', year: 2022, type: 'movie' },
  { title: 'Pushpa: The Rise', year: 2021, type: 'movie' },
  { title: 'Pushpa 2: The Rule', year: 2024, type: 'movie' },
  { title: 'Kantara', year: 2022, type: 'movie' },
  { title: 'Andhadhun', year: 2018, type: 'movie' },
  { title: 'Drishyam', year: 2013, type: 'movie' },
  { title: 'RRR', year: 2022, type: 'movie' },
  { title: 'Pathaan', year: 2023, type: 'movie' },
  { title: 'Fighter', year: 2024, type: 'movie' },

  // ================= INTERNATIONAL MOVIES =================
  { title: 'Parasite', year: 2019, type: 'movie' },
  { title: 'Train to Busan', year: 2016, type: 'movie' },
  { title: 'Memories of Murder', year: 2003, type: 'movie' },
  { title: 'The Handmaiden', year: 2016, type: 'movie' },
  { title: 'Oldboy', year: 2003, type: 'movie' },
];

async function fetchAllPosters() {
  let completed = 0;
  let failed = 0;
  let skipped = 0;

  console.log(`🎬 Starting poster fetch for ${movieDatabase.length} titles...\n`);

  for (const media of movieDatabase) {
    try {
      // Use custom search title if provided, otherwise use regular title
      const searchTitle = media.search || media.title;
      
      // Search on TMDB
      const searchUrl = `${TMDB_BASE_URL}/search/${media.type}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(searchTitle)}&year=${media.year}`;
      
      const searchResponse = await axios.get(searchUrl, { timeout: 5000 });
      
      if (searchResponse.data.results && searchResponse.data.results.length > 0) {
        const result = searchResponse.data.results[0];
        const posterPath = media.type === 'movie' 
          ? result.poster_path 
          : result.poster_path;
        
        if (posterPath) {
          const posterUrl = `${TMDB_IMAGE_BASE}${posterPath}`;
          
          // Update database with poster URL
          const updateSql = 'UPDATE Content SET Poster_Image_URL = ? WHERE Title = ?';
          db.query(updateSql, [posterUrl, media.title], (err) => {
            if (err) {
              console.log(`❌ [${completed + failed + skipped + 1}/${movieDatabase.length}] ${media.title} - DB Error`);
              failed++;
            } else {
              completed++;
              console.log(`✅ [${completed + failed + skipped}/${movieDatabase.length}] ${media.title} - Poster added`);
            }
            
            if (completed + failed + skipped === movieDatabase.length) {
              finalizeImport();
            }
          });
        } else {
          skipped++;
          console.log(`⏭️  [${completed + failed + skipped}/${movieDatabase.length}] ${media.title} - No poster available`);
          
          if (completed + failed + skipped === movieDatabase.length) {
            finalizeImport();
          }
        }
      } else {
        skipped++;
        console.log(`⏭️  [${completed + failed + skipped}/${movieDatabase.length}] ${media.title} - Not found on TMDB`);
        
        if (completed + failed + skipped === movieDatabase.length) {
          finalizeImport();
        }
      }
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 300));
      
    } catch (error) {
      failed++;
      console.log(`❌ [${completed + failed + skipped}/${movieDatabase.length}] ${media.title} - API Error: ${error.message}`);
      
      if (completed + failed + skipped === movieDatabase.length) {
        finalizeImport();
      }
    }
  }
}

function finalizeImport() {
  setTimeout(() => {
    console.log('\n🎬 ═══════════════════════════════════════════════');
    console.log('   ✨ Poster fetch complete!');
    console.log('═══════════════════════════════════════════════🎬\n');
    db.end();
    process.exit(0);
  }, 1000);
}

db.on('error', (err) => {
  console.error('❌ Database error:', err.message);
  process.exit(1);
});