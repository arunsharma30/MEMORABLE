// ============================================================
//  Memorable - Import Content Script
//  Imports movie and web series data into the database
// ============================================================

const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');

// Database connection
const db = mysql.createConnection({
  host    : 'localhost',
  user    : 'root',
  password: 'arun2006',
  database: 'netflixdb'
});

// Connect to database
db.connect(err => {
  if (err) {
    console.error('❌ DB Connection failed:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to MySQL - netflixdb');
  importData();
});

// Content data to import
const contentData = [
  // ================= ENGLISH WEB SERIES =================
  { title: 'Game of Thrones', genre: 'Fantasy / Drama', language: 'English', duration: 60, release: '2011-04-17', rating: 'TV-MA' },
  { title: 'The Boys', genre: 'Action / Superhero', language: 'English', duration: 60, release: '2019-07-26', rating: 'TV-MA' },
  { title: 'Peaky Blinders', genre: 'Crime / Drama', language: 'English', duration: 60, release: '2013-09-12', rating: 'TV-MA' },
  { title: 'Breaking Bad', genre: 'Crime / Drama', language: 'English', duration: 47, release: '2008-01-20', rating: 'TV-MA' },
  { title: 'Better Call Saul', genre: 'Crime / Drama', language: 'English', duration: 46, release: '2015-02-08', rating: 'TV-MA' },
  { title: 'The Office', genre: 'Comedy', language: 'English', duration: 22, release: '2005-03-24', rating: 'TV-14' },
  { title: 'Friends', genre: 'Comedy / Romance', language: 'English', duration: 22, release: '1994-09-22', rating: 'TV-14' },
  { title: 'The Crown', genre: 'Drama / History', language: 'English', duration: 55, release: '2016-11-04', rating: 'TV-MA' },
  { title: 'The Crown Season 5', genre: 'Drama / History', language: 'English', duration: 55, release: '2022-11-09', rating: 'TV-MA' },
  { title: 'The Crown Season 6', genre: 'Drama / History', language: 'English', duration: 55, release: '2023-11-16', rating: 'TV-MA' },
  { title: 'Narcos', genre: 'Crime / Drama', language: 'English', duration: 49, release: '2015-08-28', rating: 'TV-MA' },
  { title: 'Narcos: Mexico', genre: 'Crime / Drama', language: 'English', duration: 50, release: '2018-11-16', rating: 'TV-MA' },
  { title: 'Ozark', genre: 'Crime / Thriller', language: 'English', duration: 60, release: '2017-07-21', rating: 'TV-MA' },
  { title: 'Black Mirror', genre: 'Sci-Fi / Thriller', language: 'English', duration: 60, release: '2011-12-04', rating: 'TV-MA' },
  { title: 'Sherlock', genre: 'Crime / Mystery', language: 'English', duration: 88, release: '2010-07-25', rating: 'TV-14' },
  { title: 'The Sopranos', genre: 'Crime / Drama', language: 'English', duration: 55, release: '1999-01-10', rating: 'TV-MA' },
  { title: 'The Wire', genre: 'Crime / Drama', language: 'English', duration: 60, release: '2002-06-02', rating: 'TV-MA' },
  { title: 'True Detective', genre: 'Crime / Mystery', language: 'English', duration: 60, release: '2014-01-12', rating: 'TV-MA' },
  { title: 'Succession', genre: 'Drama', language: 'English', duration: 60, release: '2018-06-03', rating: 'TV-MA' },
  { title: 'The Last of Us', genre: 'Sci-Fi / Drama', language: 'English', duration: 50, release: '2023-01-15', rating: 'TV-MA' },
  { title: 'Severance', genre: 'Sci-Fi / Thriller', language: 'English', duration: 45, release: '2022-02-18', rating: 'TV-MA' },
  { title: 'Ted Lasso', genre: 'Comedy / Drama', language: 'English', duration: 30, release: '2020-08-14', rating: 'TV-MA' },
  { title: 'Chernobyl', genre: 'Drama / History', language: 'English', duration: 60, release: '2019-05-06', rating: 'TV-MA' },
  { title: 'Band of Brothers', genre: 'Action / History', language: 'English', duration: 60, release: '2001-09-09', rating: 'TV-MA' },
  { title: 'The Pacific', genre: 'Action / History', language: 'English', duration: 55, release: '2010-03-14', rating: 'TV-MA' },
  { title: 'Westworld', genre: 'Sci-Fi / Drama', language: 'English', duration: 60, release: '2016-10-02', rating: 'TV-MA' },
  { title: 'True Blood', genre: 'Fantasy / Drama', language: 'English', duration: 56, release: '2008-09-07', rating: 'TV-MA' },
  { title: 'House', genre: 'Drama / Medical', language: 'English', duration: 42, release: '2004-11-16', rating: 'TV-14' },
  { title: 'Stranger Things', genre: 'Sci-Fi / Horror', language: 'English', duration: 50, release: '2016-07-15', rating: 'TV-14' },
  { title: 'Wednesday', genre: 'Comedy / Crime', language: 'English', duration: 50, release: '2022-11-23', rating: 'TV-14' },
  { title: 'The Witcher', genre: 'Fantasy / Action', language: 'English', duration: 60, release: '2019-12-20', rating: 'TV-MA' },
  { title: 'Bridgerton', genre: 'Romance / Drama', language: 'English', duration: 60, release: '2020-12-25', rating: 'TV-14' },
  { title: 'Bridgerton Season 2', genre: 'Romance / Drama', language: 'English', duration: 60, release: '2022-03-25', rating: 'TV-14' },
  { title: 'Bridgerton Season 3', genre: 'Romance / Drama', language: 'English', duration: 60, release: '2023-06-16', rating: 'TV-14' },
  { title: 'Outlander', genre: 'Romance / Drama', language: 'English', duration: 60, release: '2014-08-09', rating: 'TV-MA' },
  { title: 'Vikings', genre: 'Action / Drama', language: 'English', duration: 46, release: '2013-03-03', rating: 'TV-14' },
  { title: 'The Witcher: Blood Origin', genre: 'Fantasy / Action', language: 'English', duration: 55, release: '2022-12-25', rating: 'TV-MA' },
  { title: 'The Diplomat', genre: 'Drama / Thriller', language: 'English', duration: 50, release: '2023-11-03', rating: 'TV-14' },
  { title: 'You', genre: 'Crime / Thriller', language: 'English', duration: 50, release: '2018-09-09', rating: 'TV-MA' },
  { title: 'Virgin River', genre: 'Drama / Romance', language: 'English', duration: 50, release: '2019-12-06', rating: 'TV-14' },
  { title: 'Ginny & Georgia', genre: 'Comedy / Drama', language: 'English', duration: 45, release: '2021-02-24', rating: 'TV-14' },
  { title: 'Never Have I Ever', genre: 'Comedy / Drama', language: 'English', duration: 30, release: '2020-04-27', rating: 'TV-14' },
  { title: 'Atypical', genre: 'Comedy / Drama', language: 'English', duration: 32, release: '2017-08-11', rating: 'TV-14' },
  { title: 'Umbrella Academy', genre: 'Action / Fantasy', language: 'English', duration: 55, release: '2019-02-15', rating: 'TV-14' },
  { title: 'Lucifer', genre: 'Crime / Drama', language: 'English', duration: 42, release: '2015-01-25', rating: 'TV-14' },
  { title: 'Midnight Club', genre: 'Horror / Mystery', language: 'English', duration: 55, release: '2022-10-07', rating: 'TV-14' },
  { title: 'Archive 81', genre: 'Thriller / Mystery', language: 'English', duration: 50, release: '2022-01-14', rating: 'TV-MA' },
  { title: '13 Reasons Why', genre: 'Drama / Thriller', language: 'English', duration: 52, release: '2017-03-31', rating: 'TV-14' },
  { title: 'Sex Education', genre: 'Comedy / Drama', language: 'English', duration: 50, release: '2019-01-11', rating: 'TV-14' },
  { title: 'Outer Banks', genre: 'Adventure / Mystery', language: 'English', duration: 55, release: '2020-04-15', rating: 'TV-14' },
  { title: 'Elite', genre: 'Drama / Crime', language: 'Spanish', duration: 50, release: '2018-10-05', rating: 'TV-MA' },
  { title: 'Money Heist', genre: 'Crime / Thriller', language: 'Spanish', duration: 50, release: '2017-05-02', rating: 'TV-MA' },
  { title: 'La Casa de Papel', genre: 'Crime / Heist', language: 'Spanish', duration: 50, release: '2017-05-02', rating: 'TV-MA' },
  { title: 'Dark', genre: 'Sci-Fi / Mystery', language: 'German', duration: 56, release: '2017-12-01', rating: 'TV-14' },
  { title: 'Godless', genre: 'Western / Drama', language: 'English', duration: 57, release: '2017-11-22', rating: 'TV-MA' },
  { title: 'The Haunting of Hill House', genre: 'Horror / Drama', language: 'English', duration: 60, release: '2018-10-12', rating: 'TV-14' },
  { title: 'The Haunting of Bly Manor', genre: 'Horror / Drama', language: 'English', duration: 50, release: '2020-10-09', rating: 'TV-14' },
  { title: 'Mindhunter', genre: 'Crime / Drama', language: 'English', duration: 60, release: '2017-10-13', rating: 'TV-MA' },
  { title: 'Godfather of Harlem', genre: 'Crime / Drama', language: 'English', duration: 50, release: '2019-09-29', rating: 'TV-MA' },
  { title: 'The Marvelous Mrs. Maisel', genre: 'Comedy / Drama', language: 'English', duration: 55, release: '2017-03-17', rating: 'TV-14' },
  { title: 'Fleabag', genre: 'Comedy / Drama', language: 'English', duration: 30, release: '2016-07-21', rating: 'TV-14' },
  { title: 'Schitt\'s Creek', genre: 'Comedy / Drama', language: 'English', duration: 22, release: '2015-01-12', rating: 'TV-14' },
  { title: 'The Good Place', genre: 'Comedy / Drama', language: 'English', duration: 26, release: '2016-09-19', rating: 'TV-14' },
  { title: 'Halt and Catch Fire', genre: 'Drama / Tech', language: 'English', duration: 50, release: '2014-06-01', rating: 'TV-14' },
  { title: 'The Newsroom', genre: 'Drama', language: 'English', duration: 54, release: '2012-06-24', rating: 'TV-MA' },
  { title: 'Silicon Valley', genre: 'Comedy', language: 'English', duration: 29, release: '2014-04-06', rating: 'TV-14' },
  { title: 'Veep', genre: 'Political Comedy', language: 'English', duration: 30, release: '2012-04-22', rating: 'TV-14' },
  { title: 'Insecure', genre: 'Comedy / Drama', language: 'English', duration: 30, release: '2016-10-09', rating: 'TV-14' },
  { title: 'Atlanta', genre: 'Comedy / Drama', language: 'English', duration: 30, release: '2016-03-21', rating: 'TV-14' },
  { title: 'Ramy', genre: 'Comedy / Drama', language: 'English', duration: 30, release: '2019-04-29', rating: 'TV-MA' },
  { title: 'Master of None', genre: 'Comedy / Drama', language: 'English', duration: 30, release: '2015-11-06', rating: 'TV-14' },

  // ================= ASIAN WEB SERIES =================
  { title: 'Squid Game', genre: 'Thriller / Drama', language: 'Korean', duration: 60, release: '2021-09-17', rating: 'TV-MA' },
  { title: 'Itaewon Class', genre: 'Drama / Crime', language: 'Korean', duration: 50, release: '2020-03-31', rating: 'TV-MA' },
  { title: 'Crash Landing on You', genre: 'Romance / Comedy', language: 'Korean', duration: 50, release: '2019-12-14', rating: 'TV-14' },
  { title: 'Start-Up', genre: 'Drama / Thriller', language: 'Korean', duration: 50, release: '2020-07-06', rating: 'TV-14' },
  { title: 'My Name', genre: 'Action / Thriller', language: 'Korean', duration: 55, release: '2021-10-15', rating: 'TV-MA' },
  { title: 'Bodyguard', genre: 'Action / Thriller', language: 'Korean', duration: 50, release: '2020-08-07', rating: 'TV-14' },
  { title: 'Extracurricular', genre: 'Drama / Thriller', language: 'Korean', duration: 50, release: '2020-04-29', rating: 'TV-MA' },
  { title: 'Hellbound', genre: 'Horror / Thriller', language: 'Korean', duration: 60, release: '2021-11-19', rating: 'TV-MA' },
  { title: 'All of Us Are Dead', genre: 'Horror / Thriller', language: 'Korean', duration: 70, release: '2022-01-28', rating: 'TV-MA' },
  { title: 'Juvenile Justice', genre: 'Drama / Crime', language: 'Korean', duration: 50, release: '2022-03-04', rating: 'TV-14' },
  { title: 'Alchemy of Souls', genre: 'Fantasy / Romance', language: 'Korean', duration: 55, release: '2022-06-18', rating: 'TV-14' },
  { title: 'Business Proposal', genre: 'Comedy / Romance', language: 'Korean', duration: 50, release: '2022-02-14', rating: 'TV-14' },
  { title: 'Happiness', genre: 'Thriller / Drama', language: 'Korean', duration: 50, release: '2021-11-10', rating: 'TV-MA' },
  { title: 'Snowdrop', genre: 'Drama / Thriller', language: 'Korean', duration: 65, release: '2021-12-18', rating: 'TV-MA' },
  { title: 'Glitch', genre: 'Sci-Fi / Thriller', language: 'Korean', duration: 55, release: '2020-08-07', rating: 'TV-14' },
  { title: 'Mystic Pop', genre: 'Fantasy / Comedy', language: 'Korean', duration: 60, release: '2020-06-16', rating: 'TV-14' },
  { title: 'The Cursed', genre: 'Dark / Fantasy', language: 'Korean', duration: 54, release: '2020-09-04', rating: 'TV-MA' },
  { title: 'Mouse', genre: 'Crime / Thriller', language: 'Korean', duration: 60, release: '2021-03-03', rating: 'TV-MA' },
  { title: 'Beyond Evil', genre: 'Crime / Thriller', language: 'Korean', duration: 60, release: '2021-02-19', rating: 'TV-MA' },
  { title: 'Hospital Playlist', genre: 'Drama / Medical', language: 'Korean', duration: 70, release: '2020-03-12', rating: 'TV-14' },
  { title: 'Record of Youth', genre: 'Drama / Romance', language: 'Korean', duration: 50, release: '2020-09-14', rating: 'TV-14' },

  { title: 'Attack on Titan', genre: 'Action / Fantasy', language: 'Japanese', duration: 24, release: '2013-04-07', rating: 'TV-MA' },
  { title: 'Death Note', genre: 'Mystery / Thriller', language: 'Japanese', duration: 24, release: '2006-10-03', rating: 'TV-14' },
  { title: 'Fullmetal Alchemist: Brotherhood', genre: 'Action / Fantasy', language: 'Japanese', duration: 24, release: '2009-04-05', rating: 'TV-14' },
  { title: 'Demon Slayer', genre: 'Action / Fantasy', language: 'Japanese', duration: 24, release: '2019-04-06', rating: 'TV-MA' },
  { title: 'Jujutsu Kaisen', genre: 'Action / Fantasy', language: 'Japanese', duration: 24, release: '2020-10-03', rating: 'TV-MA' },

  // ================= INDIAN WEB SERIES =================
  { title: 'Sacred Games', genre: 'Crime / Thriller', language: 'Hindi', duration: 55, release: '2018-07-06', rating: 'TV-MA' },
  { title: 'Sacred Games Season 2', genre: 'Crime / Thriller', language: 'Hindi', duration: 55, release: '2019-08-15', rating: 'TV-MA' },
  { title: 'Mirzapur', genre: 'Crime / Action', language: 'Hindi', duration: 50, release: '2018-11-16', rating: 'TV-MA' },
  { title: 'Mirzapur Season 2', genre: 'Crime / Action', language: 'Hindi', duration: 50, release: '2020-10-23', rating: 'TV-MA' },
  { title: 'The Family Man', genre: 'Action / Thriller', language: 'Hindi', duration: 45, release: '2019-09-20', rating: 'TV-MA' },
  { title: 'The Family Man Season 2', genre: 'Action / Thriller', language: 'Hindi', duration: 45, release: '2021-06-04', rating: 'TV-MA' },
  { title: 'Panchayat', genre: 'Comedy / Drama', language: 'Hindi', duration: 35, release: '2020-04-03', rating: 'TV-14' },
  { title: 'Panchayat Season 2', genre: 'Comedy / Drama', language: 'Hindi', duration: 35, release: '2022-05-20', rating: 'TV-14' },
  { title: 'Farzi', genre: 'Crime / Thriller', language: 'Hindi', duration: 50, release: '2023-02-10', rating: 'TV-MA' },
  { title: 'Scam 1992', genre: 'Crime / Drama', language: 'Hindi', duration: 50, release: '2020-10-09', rating: 'TV-MA' },
  { title: 'Kota Factory', genre: 'Drama / Comedy', language: 'Hindi', duration: 40, release: '2019-04-16', rating: 'TV-14' },
  { title: 'Asur', genre: 'Crime / Thriller', language: 'Hindi', duration: 45, release: '2020-03-02', rating: 'TV-MA' },
  { title: 'Special OPS', genre: 'Action / Thriller', language: 'Hindi', duration: 45, release: '2020-03-17', rating: 'TV-MA' },
  { title: 'Bad Boys', genre: 'Action / Crime', language: 'Hindi', duration: 45, release: '2021-04-08', rating: 'TV-14' },
  { title: 'Aarya', genre: 'Drama / Thriller', language: 'Hindi', duration: 45, release: '2020-06-19', rating: 'TV-MA' },

  // ================= HOLLYWOOD BLOCKBUSTER MOVIES =================
  { title: 'The Godfather', genre: 'Crime / Drama', language: 'English', duration: 175, release: '1972-03-24', rating: 'R' },
  { title: 'The Godfather Part II', genre: 'Crime / Drama', language: 'English', duration: 202, release: '1974-12-12', rating: 'R' },
  { title: 'The Dark Knight', genre: 'Action / Crime', language: 'English', duration: 152, release: '2008-07-18', rating: 'PG-13' },
  { title: 'The Dark Knight Rises', genre: 'Action / Crime', language: 'English', duration: 165, release: '2012-07-20', rating: 'PG-13' },
  { title: 'Batman Begins', genre: 'Action / Crime', language: 'English', duration: 140, release: '2005-06-15', rating: 'PG-13' },
  { title: 'Pulp Fiction', genre: 'Crime / Drama', language: 'English', duration: 154, release: '1994-10-14', rating: 'R' },
  { title: 'The Lord of the Rings: The Fellowship of the Ring', genre: 'Action / Fantasy', language: 'English', duration: 178, release: '2001-12-19', rating: 'PG-13' },
  { title: 'The Lord of the Rings: The Two Towers', genre: 'Action / Fantasy', language: 'English', duration: 179, release: '2002-12-18', rating: 'PG-13' },
  { title: 'The Lord of the Rings: The Return of the King', genre: 'Action / Fantasy', language: 'English', duration: 201, release: '2003-12-17', rating: 'PG-13' },
  { title: 'Fight Club', genre: 'Drama', language: 'English', duration: 139, release: '1999-10-15', rating: 'R' },
  { title: 'Forrest Gump', genre: 'Drama / Romance', language: 'English', duration: 142, release: '1994-07-06', rating: 'PG-13' },
  { title: 'The Shawshank Redemption', genre: 'Drama', language: 'English', duration: 142, release: '1994-09-23', rating: 'R' },
  { title: 'The Matrix', genre: 'Action / Sci-Fi', language: 'English', duration: 136, release: '1999-03-31', rating: 'R' },
  { title: 'The Matrix Reloaded', genre: 'Action / Sci-Fi', language: 'English', duration: 138, release: '2003-05-15', rating: 'R' },
  { title: 'Inception', genre: 'Sci-Fi / Thriller', language: 'English', duration: 148, release: '2010-07-16', rating: 'PG-13' },
  { title: 'Interstellar', genre: 'Sci-Fi / Drama', language: 'English', duration: 169, release: '2014-11-07', rating: 'PG-13' },
  { title: 'Avengers: Endgame', genre: 'Action / Sci-Fi', language: 'English', duration: 181, release: '2019-04-26', rating: 'PG-13' },
  { title: 'Avengers: Infinity War', genre: 'Action / Sci-Fi', language: 'English', duration: 149, release: '2018-04-27', rating: 'PG-13' },
  { title: 'Spider-Man: No Way Home', genre: 'Action / Sci-Fi', language: 'English', duration: 148, release: '2021-12-17', rating: 'PG-13' },
  { title: 'Spider-Man: Into the Spider-Verse', genre: 'Action / Animation', language: 'English', duration: 117, release: '2018-12-14', rating: 'PG' },
  { title: 'Jurassic Park', genre: 'Action / Sci-Fi', language: 'English', duration: 127, release: '1993-06-11', rating: 'PG-13' },
  { title: 'Jurassic World', genre: 'Action / Sci-Fi', language: 'English', duration: 124, release: '2015-06-12', rating: 'PG-13' },
  { title: 'Dune: Part One', genre: 'Action / Sci-Fi', language: 'English', duration: 155, release: '2021-10-22', rating: 'PG-13' },
  { title: 'Dune: Part Two', genre: 'Action / Sci-Fi', language: 'English', duration: 166, release: '2024-03-01', rating: 'PG-13' },
  { title: 'Mad Max: Fury Road', genre: 'Action / Sci-Fi', language: 'English', duration: 120, release: '2015-05-15', rating: 'R' },
  { title: 'Blade Runner 2049', genre: 'Action / Sci-Fi', language: 'English', duration: 164, release: '2017-10-06', rating: 'R' },
  { title: 'Oppenheimer', genre: 'Drama / History', language: 'English', duration: 180, release: '2023-07-21', rating: 'R' },
  { title: 'Joker', genre: 'Crime / Drama', language: 'English', duration: 122, release: '2019-10-04', rating: 'R' },
  { title: 'The Wolf of Wall Street', genre: 'Comedy / Crime', language: 'English', duration: 180, release: '2013-12-25', rating: 'R' },
  { title: 'Titanic', genre: 'Drama / Romance', language: 'English', duration: 194, release: '1997-12-19', rating: 'PG-13' },
  { title: 'Avatar', genre: 'Action / Sci-Fi', language: 'English', duration: 162, release: '2009-12-18', rating: 'PG-13' },
  { title: 'Avatar: The Way of Water', genre: 'Action / Sci-Fi', language: 'English', duration: 192, release: '2022-12-16', rating: 'PG-13' },
  { title: 'Top Gun: Maverick', genre: 'Action / Drama', language: 'English', duration: 131, release: '2022-05-27', rating: 'PG' },

  // ================= INDIAN BLOCKBUSTER MOVIES =================
  { title: 'Dangal', genre: 'Action / Drama', language: 'Hindi', duration: 161, release: '2016-12-23', rating: 'TV-PG' },
  { title: '3 Idiots', genre: 'Comedy / Drama', language: 'Hindi', duration: 170, release: '2009-12-25', rating: 'TV-14' },
  { title: 'Bahubali: The Beginning', genre: 'Action / Drama', language: 'Telugu', duration: 159, release: '2015-07-10', rating: 'TV-14' },
  { title: 'Bahubali 2: The Conclusion', genre: 'Action / Drama', language: 'Telugu', duration: 167, release: '2017-04-28', rating: 'TV-14' },
  { title: 'KGF: Chapter 1', genre: 'Action / Thriller', language: 'Kannada', duration: 156, release: '2018-12-21', rating: 'TV-MA' },
  { title: 'KGF: Chapter 2', genre: 'Action / Thriller', language: 'Kannada', duration: 168, release: '2022-04-14', rating: 'TV-MA' },
  { title: 'Pushpa: The Rise', genre: 'Action / Thriller', language: 'Telugu', duration: 179, release: '2021-12-17', rating: 'TV-14' },
  { title: 'Pushpa 2: The Rule', genre: 'Action / Thriller', language: 'Telugu', duration: 200, release: '2024-12-05', rating: 'TV-14' },
  { title: 'Kantara', genre: 'Action / Thriller', language: 'Kannada', duration: 148, release: '2022-09-30', rating: 'TV-14' },
  { title: 'Andhadhun', genre: 'Crime / Thriller', language: 'Hindi', duration: 139, release: '2018-10-05', rating: 'TV-14' },
  { title: 'Drishyam', genre: 'Crime / Mystery', language: 'Malayalam', duration: 160, release: '2013-12-19', rating: 'TV-14' },
  { title: 'RRR', genre: 'Action / Drama', language: 'Telugu', duration: 187, release: '2022-03-25', rating: 'TV-14' },
  { title: 'Pathaan', genre: 'Action / Thriller', language: 'Hindi', duration: 146, release: '2023-01-25', rating: 'TV-14' },
  { title: 'Fighter', genre: 'Action / War', language: 'Hindi', duration: 153, release: '2024-01-25', rating: 'TV-14' },

  // ================= INTERNATIONAL MOVIES =================
  { title: 'Parasite', genre: 'Thriller / Drama', language: 'Korean', duration: 132, release: '2019-05-30', rating: 'R' },
  { title: 'Train to Busan', genre: 'Action / Horror', language: 'Korean', duration: 118, release: '2016-07-15', rating: 'R' },
  { title: 'Memories of Murder', genre: 'Crime / Thriller', language: 'Korean', duration: 129, release: '2003-02-28', rating: 'R' },
  { title: 'The Handmaiden', genre: 'Thriller / Romance', language: 'Korean', duration: 145, release: '2016-06-01', rating: 'R' },
  { title: 'Oldboy', genre: 'Action / Thriller', language: 'Korean', duration: 120, release: '2003-11-21', rating: 'R' },
];

function importData() {
  let count = 0;
  const total = contentData.length;

  contentData.forEach((content, index) => {
    const sql = 'INSERT INTO Content (Title, Genre, Language, Duration, Release_Date, Age_Rating) VALUES (?, ?, ?, ?, ?, ?)';
    const values = [content.title, content.genre, content.language, content.duration, content.release, content.rating];

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error(`❌ Error inserting "${content.title}":`, err.message);
      } else {
        count++;
        console.log(`✅ [${count}/${total}] ${content.title} inserted successfully`);
      }

      if (index === total - 1) {
        setTimeout(() => {
          console.log('\n🎬 ═══════════════════════════════════════════════');
          console.log(`   ✨ Successfully imported ${count} titles!`);
          console.log('   Your Netflix-like website is now ready!');
          console.log('═══════════════════════════════════════════════🎬\n');
          db.end();
          process.exit(0);
        }, 500);
      }
    });
  });
}

// Handle errors
db.on('error', (err) => {
  console.error('❌ Database error:', err.message);
  process.exit(1);
});
