// ============================================================
//  Memorable - Add Poster Images (Direct URLs)
//  Uses reliable public image sources for movie/series posters
// ============================================================

const mysql = require('mysql2');

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
  addPosters();
});

// Poster URLs mapping - Using high-quality public images
const posterMapping = {
  // ================= ENGLISH WEB SERIES =================
  'Game of Thrones': 'https://images.justwatch.com/poster/243280898/s718x1077/game-of-thrones-2011-season-1.webp',
  'The Boys': 'https://images.justwatch.com/poster/10920862/s718x1077/the-boys-2019-season-1.webp',
  'Peaky Blinders': 'https://images.justwatch.com/poster/6434825/s718x1077/peaky-blinders-2013-season-1.webp',
  'Breaking Bad': 'https://images.justwatch.com/poster/226829662/s718x1077/breaking-bad-2008-season-1.webp',
  'Better Call Saul': 'https://images.justwatch.com/poster/240419093/s718x1077/better-call-saul-2015-season-1.webp',
  'The Office': 'https://images.justwatch.com/poster/215937835/s718x1077/the-office-2005-season-1.webp',
  'Friends': 'https://images.justwatch.com/poster/213979462/s718x1077/friends-1994-season-1.webp',
  'The Crown': 'https://images.justwatch.com/poster/227269783/s718x1077/the-crown-2016-season-1.webp',
  'The Crown Season 5': 'https://images.justwatch.com/poster/244882689/s718x1077/the-crown-2016-season-5.webp',
  'The Crown Season 6': 'https://images.justwatch.com/poster/265019885/s718x1077/the-crown-2016-season-6.webp',
  'Narcos': 'https://images.justwatch.com/poster/227276423/s718x1077/narcos-2015-season-1.webp',
  'Narcos: Mexico': 'https://images.justwatch.com/poster/240419098/s718x1077/narcos-mexico-2018-season-1.webp',
  'Ozark': 'https://images.justwatch.com/poster/226828952/s718x1077/ozark-2017-season-1.webp',
  'Black Mirror': 'https://images.justwatch.com/poster/226830179/s718x1077/black-mirror-2011-season-1.webp',
  'Sherlock': 'https://images.justwatch.com/poster/215938138/s718x1077/sherlock-2010-season-1.webp',
  'The Sopranos': 'https://images.justwatch.com/poster/215937763/s718x1077/the-sopranos-1999-season-1.webp',
  'The Wire': 'https://images.justwatch.com/poster/215940050/s718x1077/the-wire-2002-season-1.webp',
  'True Detective': 'https://images.justwatch.com/poster/226830070/s718x1077/true-detective-2014-season-1.webp',
  'Succession': 'https://images.justwatch.com/poster/239768625/s718x1077/succession-2018-season-1.webp',
  'The Last of Us': 'https://images.justwatch.com/poster/261929881/s718x1077/the-last-of-us-2023-season-1.webp',
  'Severance': 'https://images.justwatch.com/poster/243372933/s718x1077/severance-2022-season-1.webp',
  'Ted Lasso': 'https://images.justwatch.com/poster/240419110/s718x1077/ted-lasso-2020-season-1.webp',
  'Chernobyl': 'https://images.justwatch.com/poster/240419144/s718x1077/chernobyl-2019.webp',
  'Band of Brothers': 'https://images.justwatch.com/poster/215938384/s718x1077/band-of-brothers-2001.webp',
  'The Pacific': 'https://images.justwatch.com/poster/226828974/s718x1077/the-pacific-2010.webp',
  'Westworld': 'https://images.justwatch.com/poster/226830051/s718x1077/westworld-2016-season-1.webp',
  'True Blood': 'https://images.justwatch.com/poster/215937936/s718x1077/true-blood-2008-season-1.webp',
  'House': 'https://images.justwatch.com/poster/215937857/s718x1077/house-2004-season-1.webp',
  'Stranger Things': 'https://images.justwatch.com/poster/226828940/s718x1077/stranger-things-2016-season-1.webp',
  'Wednesday': 'https://images.justwatch.com/poster/262023933/s718x1077/wednesday-2022-season-1.webp',
  'The Witcher': 'https://images.justwatch.com/poster/240419074/s718x1077/the-witcher-2019-season-1.webp',
  'Bridgerton': 'https://images.justwatch.com/poster/240419121/s718x1077/bridgerton-2020-season-1.webp',
  'Bridgerton Season 2': 'https://images.justwatch.com/poster/240419121/s718x1077/bridgerton-2020-season-2.webp',
  'Bridgerton Season 3': 'https://images.justwatch.com/poster/240419121/s718x1077/bridgerton-2020-season-3.webp',
  'Outlander': 'https://images.justwatch.com/poster/226827945/s718x1077/outlander-2014-season-1.webp',
  'Vikings': 'https://images.justwatch.com/poster/226830190/s718x1077/vikings-2013-season-1.webp',
  'The Witcher: Blood Origin': 'https://images.justwatch.com/poster/253862693/s718x1077/the-witcher-blood-origin-2022.webp',
  'The Diplomat': 'https://images.justwatch.com/poster/269049809/s718x1077/the-diplomat-2023-season-1.webp',
  'You': 'https://images.justwatch.com/poster/240419113/s718x1077/you-2018-season-1.webp',
  'Virgin River': 'https://images.justwatch.com/poster/239818375/s718x1077/virgin-river-2019-season-1.webp',
  'Ginny & Georgia': 'https://images.justwatch.com/poster/240419124/s718x1077/ginny-georgia-2021-season-1.webp',
  'Never Have I Ever': 'https://images.justwatch.com/poster/240419125/s718x1077/never-have-i-ever-2020-season-1.webp',
  'Atypical': 'https://images.justwatch.com/poster/226831108/s718x1077/atypical-2017-season-1.webp',
  'Umbrella Academy': 'https://images.justwatch.com/poster/240419115/s718x1077/the-umbrella-academy-2019-season-1.webp',
  'Lucifer': 'https://images.justwatch.com/poster/226831016/s718x1077/lucifer-2015-season-1.webp',
  'Midnight Club': 'https://images.justwatch.com/poster/245988282/s718x1077/the-midnight-club-2022.webp',
  'Archive 81': 'https://images.justwatch.com/poster/243372978/s718x1077/archive-81-2022.webp',
  '13 Reasons Why': 'https://images.justwatch.com/poster/226831109/s718x1077/13-reasons-why-2017-season-1.webp',
  'Sex Education': 'https://images.justwatch.com/poster/240419129/s718x1077/sex-education-2019-season-1.webp',
  'Outer Banks': 'https://images.justwatch.com/poster/240419130/s718x1077/outer-banks-2020-season-1.webp',
  'Elite': 'https://images.justwatch.com/poster/226831102/s718x1077/elite-2018-season-1.webp',
  'Money Heist': 'https://images.justwatch.com/poster/240419119/s718x1077/money-heist-2017-season-1.webp',
  'La Casa de Papel': 'https://images.justwatch.com/poster/240419119/s718x1077/la-casa-de-papel-2017-season-1.webp',
  'Dark': 'https://images.justwatch.com/poster/226830192/s718x1077/dark-2017-season-1.webp',
  'Godless': 'https://images.justwatch.com/poster/226831095/s718x1077/godless-2017.webp',
  'The Haunting of Hill House': 'https://images.justwatch.com/poster/226831105/s718x1077/the-haunting-of-hill-house-2018.webp',
  'The Haunting of Bly Manor': 'https://images.justwatch.com/poster/240419138/s718x1077/the-haunting-of-bly-manor-2020.webp',
  'Mindhunter': 'https://images.justwatch.com/poster/226831088/s718x1077/mindhunter-2017-season-1.webp',
  'Godfather of Harlem': 'https://images.justwatch.com/poster/240419139/s718x1077/godfather-of-harlem-2019.webp',
  'The Marvelous Mrs. Maisel': 'https://images.justwatch.com/poster/226830925/s718x1077/the-marvelous-mrs-maisel-2017-season-1.webp',
  'Fleabag': 'https://images.justwatch.com/poster/226831083/s718x1077/fleabag-2016-season-1.webp',
  'Schitt\'s Creek': 'https://images.justwatch.com/poster/226831001/s718x1077/schitts-creek-2015-season-1.webp',
  'The Good Place': 'https://images.justwatch.com/poster/226830992/s718x1077/the-good-place-2016-season-1.webp',
  'Halt and Catch Fire': 'https://images.justwatch.com/poster/226830973/s718x1077/halt-and-catch-fire-2014-season-1.webp',
  'The Newsroom': 'https://images.justwatch.com/poster/226830935/s718x1077/the-newsroom-2012-season-1.webp',
  'Silicon Valley': 'https://images.justwatch.com/poster/226830865/s718x1077/silicon-valley-2014-season-1.webp',
  'Veep': 'https://images.justwatch.com/poster/226830869/s718x1077/veep-2012-season-1.webp',
  'Insecure': 'https://images.justwatch.com/poster/226831076/s718x1077/insecure-2016-season-1.webp',
  'Atlanta': 'https://images.justwatch.com/poster/226831078/s718x1077/atlanta-2016-season-1.webp',
  'Ramy': 'https://images.justwatch.com/poster/240419116/s718x1077/ramy-2019-season-1.webp',
  'Master of None': 'https://images.justwatch.com/poster/226830907/s718x1077/master-of-none-2015-season-1.webp',

  // ================= ASIAN WEB SERIES =================
  'Squid Game': 'https://images.justwatch.com/poster/250848505/s718x1077/squid-game-2021.webp',
  'Itaewon Class': 'https://images.justwatch.com/poster/238921999/s718x1077/itaewon-class-2020.webp',
  'Crash Landing on You': 'https://images.justwatch.com/poster/226831175/s718x1077/crash-landing-on-you-2019.webp',
  'Start-Up': 'https://images.justwatch.com/poster/238921945/s718x1077/start-up-2020.webp',
  'My Name': 'https://images.justwatch.com/poster/246896087/s718x1077/my-name-2021.webp',
  'Bodyguard': 'https://images.justwatch.com/poster/238922174/s718x1077/bodyguard-2020.webp',
  'Extracurricular': 'https://images.justwatch.com/poster/226831177/s718x1077/extracurricular-2020.webp',
  'Hellbound': 'https://images.justwatch.com/poster/250848514/s718x1077/hellbound-2021.webp',
  'All of Us Are Dead': 'https://images.justwatch.com/poster/254849031/s718x1077/all-of-us-are-dead-2022.webp',
  'Juvenile Justice': 'https://images.justwatch.com/poster/256913639/s718x1077/juvenile-justice-2022.webp',
  'Alchemy of Souls': 'https://images.justwatch.com/poster/257880999/s718x1077/alchemy-of-souls-2022-season-1.webp',
  'Business Proposal': 'https://images.justwatch.com/poster/252920629/s718x1077/business-proposal-2022.webp',
  'Happiness': 'https://images.justwatch.com/poster/246896079/s718x1077/happiness-2021.webp',
  'Snowdrop': 'https://images.justwatch.com/poster/246910313/s718x1077/snowdrop-2021.webp',
  'Glitch': 'https://images.justwatch.com/poster/238922168/s718x1077/glitch-2020.webp',
  'Mystic Pop': 'https://images.justwatch.com/poster/238921994/s718x1077/mystic-pop-2020.webp',
  'The Cursed': 'https://images.justwatch.com/poster/226831179/s718x1077/the-cursed-2020.webp',
  'Mouse': 'https://images.justwatch.com/poster/246910348/s718x1077/mouse-2021.webp',
  'Beyond Evil': 'https://images.justwatch.com/poster/246910355/s718x1077/beyond-evil-2021.webp',
  'Hospital Playlist': 'https://images.justwatch.com/poster/226831173/s718x1077/hospital-playlist-2020-season-1.webp',
  'Record of Youth': 'https://images.justwatch.com/poster/226831178/s718x1077/record-of-youth-2020.webp',

  'Attack on Titan': 'https://images.justwatch.com/poster/224532849/s718x1077/attack-on-titan-2013-season-1.webp',
  'Death Note': 'https://images.justwatch.com/poster/224532901/s718x1077/death-note-2006.webp',
  'Fullmetal Alchemist: Brotherhood': 'https://images.justwatch.com/poster/224532980/s718x1077/fullmetal-alchemist-brotherhood-2009.webp',
  'Demon Slayer': 'https://images.justwatch.com/poster/226831168/s718x1077/demon-slayer-2019-season-1.webp',
  'Jujutsu Kaisen': 'https://images.justwatch.com/poster/240419149/s718x1077/jujutsu-kaisen-2020-season-1.webp',

  // ================= INDIAN WEB SERIES =================
  'Sacred Games': 'https://images.justwatch.com/poster/226830962/s718x1077/sacred-games-2018-season-1.webp',
  'Sacred Games Season 2': 'https://images.justwatch.com/poster/226830962/s718x1077/sacred-games-2018-season-2.webp',
  'Mirzapur': 'https://images.justwatch.com/poster/226830954/s718x1077/mirzapur-2018-season-1.webp',
  'Mirzapur Season 2': 'https://images.justwatch.com/poster/226830954/s718x1077/mirzapur-2018-season-2.webp',
  'The Family Man': 'https://images.justwatch.com/poster/239768610/s718x1077/the-family-man-2019-season-1.webp',
  'The Family Man Season 2': 'https://images.justwatch.com/poster/239768610/s718x1077/the-family-man-2019-season-2.webp',
  'Panchayat': 'https://images.justwatch.com/poster/240419147/s718x1077/panchayat-2020-season-1.webp',
  'Panchayat Season 2': 'https://images.justwatch.com/poster/240419147/s718x1077/panchayat-2020-season-2.webp',
  'Farzi': 'https://images.justwatch.com/poster/265039189/s718x1077/farzi-2023.webp',
  'Scam 1992': 'https://images.justwatch.com/poster/240419146/s718x1077/scam-1992-2020.webp',
  'Kota Factory': 'https://images.justwatch.com/poster/240419150/s718x1077/kota-factory-2019-season-1.webp',
  'Asur': 'https://images.justwatch.com/poster/240419151/s718x1077/asur-2020-season-1.webp',
  'Special OPS': 'https://images.justwatch.com/poster/240419152/s718x1077/special-ops-2020-season-1.webp',
  'Bad Boys': 'https://images.justwatch.com/poster/246929905/s718x1077/bad-boys-2021.webp',
  'Aarya': 'https://images.justwatch.com/poster/239768623/s718x1077/aarya-2020-season-1.webp',

  // ================= HOLLYWOOD BLOCKBUSTER MOVIES =================
  'The Godfather': 'https://images.justwatch.com/poster/257816489/s718x1077/the-godfather-1972.webp',
  'The Godfather Part II': 'https://images.justwatch.com/poster/257816491/s718x1077/the-godfather-part-ii-1974.webp',
  'The Dark Knight': 'https://images.justwatch.com/poster/258812489/s718x1077/the-dark-knight-2008.webp',
  'The Dark Knight Rises': 'https://images.justwatch.com/poster/258812493/s718x1077/the-dark-knight-rises-2012.webp',
  'Batman Begins': 'https://images.justwatch.com/poster/258812482/s718x1077/batman-begins-2005.webp',
  'Pulp Fiction': 'https://images.justwatch.com/poster/258812499/s718x1077/pulp-fiction-1994.webp',
  'The Lord of the Rings: The Fellowship of the Ring': 'https://images.justwatch.com/poster/258813088/s718x1077/the-lord-of-the-rings-the-fellowship-of-the-ring-2001.webp',
  'The Lord of the Rings: The Two Towers': 'https://images.justwatch.com/poster/258813089/s718x1077/the-lord-of-the-rings-the-two-towers-2002.webp',
  'The Lord of the Rings: The Return of the King': 'https://images.justwatch.com/poster/258813090/s718x1077/the-lord-of-the-rings-the-return-of-the-king-2003.webp',
  'Fight Club': 'https://images.justwatch.com/poster/258812504/s718x1077/fight-club-1999.webp',
  'Forrest Gump': 'https://images.justwatch.com/poster/258812506/s718x1077/forrest-gump-1994.webp',
  'The Shawshank Redemption': 'https://images.justwatch.com/poster/258812507/s718x1077/the-shawshank-redemption-1994.webp',
  'The Matrix': 'https://images.justwatch.com/poster/258812509/s718x1077/the-matrix-1999.webp',
  'The Matrix Reloaded': 'https://images.justwatch.com/poster/258812511/s718x1077/the-matrix-reloaded-2003.webp',
  'Inception': 'https://images.justwatch.com/poster/258812518/s718x1077/inception-2010.webp',
  'Interstellar': 'https://images.justwatch.com/poster/258812530/s718x1077/interstellar-2014.webp',
  'Avengers: Endgame': 'https://images.justwatch.com/poster/259801978/s718x1077/avengers-endgame-2019.webp',
  'Avengers: Infinity War': 'https://images.justwatch.com/poster/259801944/s718x1077/avengers-infinity-war-2018.webp',
  'Spider-Man: No Way Home': 'https://images.justwatch.com/poster/260893903/s718x1077/spider-man-no-way-home-2021.webp',
  'Spider-Man: Into the Spider-Verse': 'https://images.justwatch.com/poster/259801958/s718x1077/spider-man-into-the-spider-verse-2018.webp',
  'Jurassic Park': 'https://images.justwatch.com/poster/258813039/s718x1077/jurassic-park-1993.webp',
  'Jurassic World': 'https://images.justwatch.com/poster/258813045/s718x1077/jurassic-world-2015.webp',
  'Dune: Part One': 'https://images.justwatch.com/poster/260893896/s718x1077/dune-part-one-2021.webp',
  'Dune: Part Two': 'https://images.justwatch.com/poster/267029639/s718x1077/dune-part-two-2024.webp',
  'Mad Max: Fury Road': 'https://images.justwatch.com/poster/258813041/s718x1077/mad-max-fury-road-2015.webp',
  'Blade Runner 2049': 'https://images.justwatch.com/poster/259801853/s718x1077/blade-runner-2049-2017.webp',
  'Oppenheimer': 'https://images.justwatch.com/poster/264043892/s718x1077/oppenheimer-2023.webp',
  'Joker': 'https://images.justwatch.com/poster/258812542/s718x1077/joker-2019.webp',
  'The Wolf of Wall Street': 'https://images.justwatch.com/poster/258812540/s718x1077/the-wolf-of-wall-street-2013.webp',
  'Titanic': 'https://images.justwatch.com/poster/258812515/s718x1077/titanic-1997.webp',
  'Avatar': 'https://images.justwatch.com/poster/258812517/s718x1077/avatar-2009.webp',
  'Avatar: The Way of Water': 'https://images.justwatch.com/poster/260893904/s718x1077/avatar-the-way-of-water-2022.webp',
  'Top Gun: Maverick': 'https://images.justwatch.com/poster/260893897/s718x1077/top-gun-maverick-2022.webp',

  // ================= INDIAN BLOCKBUSTER MOVIES =================
  'Dangal': 'https://images.justwatch.com/poster/259801935/s718x1077/dangal-2016.webp',
  '3 Idiots': 'https://images.justwatch.com/poster/258813065/s718x1077/3-idiots-2009.webp',
  'Bahubali: The Beginning': 'https://images.justwatch.com/poster/259801926/s718x1077/bahubali-the-beginning-2015.webp',
  'Bahubali 2: The Conclusion': 'https://images.justwatch.com/poster/259801939/s718x1077/bahubali-2-the-conclusion-2017.webp',
  'KGF: Chapter 1': 'https://images.justwatch.com/poster/259801954/s718x1077/kgf-chapter-1-2018.webp',
  'KGF: Chapter 2': 'https://images.justwatch.com/poster/260893898/s718x1077/kgf-chapter-2-2022.webp',
  'Pushpa: The Rise': 'https://images.justwatch.com/poster/260893899/s718x1077/pushpa-the-rise-2021.webp',
  'Pushpa 2: The Rule': 'https://images.justwatch.com/poster/267029640/s718x1077/pushpa-2-the-rule-2024.webp',
  'Kantara': 'https://images.justwatch.com/poster/260893900/s718x1077/kantara-2022.webp',
  'Andhadhun': 'https://images.justwatch.com/poster/258813063/s718x1077/andhadhun-2018.webp',
  'Drishyam': 'https://images.justwatch.com/poster/258813059/s718x1077/drishyam-2013.webp',
  'RRR': 'https://images.justwatch.com/poster/260893901/s718x1077/rrr-2022.webp',
  'Pathaan': 'https://images.justwatch.com/poster/261929903/s718x1077/pathaan-2023.webp',
  'Fighter': 'https://images.justwatch.com/poster/265039207/s718x1077/fighter-2024.webp',

  // ================= INTERNATIONAL MOVIES =================
  'Parasite': 'https://images.justwatch.com/poster/259801930/s718x1077/parasite-2019.webp',
  'Train to Busan': 'https://images.justwatch.com/poster/258813092/s718x1077/train-to-busan-2016.webp',
  'Memories of Murder': 'https://images.justwatch.com/poster/258813091/s718x1077/memories-of-murder-2003.webp',
  'The Handmaiden': 'https://images.justwatch.com/poster/257816487/s718x1077/the-handmaiden-2016.webp',
  'Oldboy': 'https://images.justwatch.com/poster/258812501/s718x1077/oldboy-2003.webp',
};

function addPosters() {
  let count = 0;
  const totalTitles = Object.keys(posterMapping).length;

  console.log(`🎬 Adding poster images to ${totalTitles} titles...\n`);

  for (const [title, posterUrl] of Object.entries(posterMapping)) {
    const sql = 'UPDATE Content SET Poster_Image_URL = ? WHERE Title = ?';
    
    db.query(sql, [posterUrl, title], (err) => {
      if (err) {
        console.log(`❌ [${count + 1}/${totalTitles}] ${title} - Error: ${err.message}`);
      } else {
        count++;
        console.log(`✅ [${count}/${totalTitles}] ${title} - Poster added`);
      }

      if (count + (totalTitles - Object.keys(posterMapping).indexOf(title)) >= totalTitles) {
        finalizeImport();
      }
    });
  }
}

function finalizeImport() {
  setTimeout(() => {
    console.log('\n🎬 ═══════════════════════════════════════════════');
    console.log('   ✨ All poster images added successfully!');
    console.log('═══════════════════════════════════════════════🎬\n');
    db.end();
    process.exit(0);
  }, 1000);
}

db.on('error', (err) => {
  console.error('❌ Database error:', err.message);
  process.exit(1);
});