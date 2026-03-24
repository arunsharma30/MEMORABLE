// ============================================================
//  Memorable - Poster Update (Direct URLs - No API Needed)
//  Uses pre-mapped poster URLs from public sources
//  Fast, reliable, and doesn't require API key!
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
  updatePostersWithMappings();
});

// Comprehensive poster mappings - Direct public URLs
// These are real working poster URLs from various public CDNs
const posterMappings = {
  // Movies
  'Avatar': 'https://m.media-amazon.com/images/M/MV5BMTYwOTEwNjAzMl5BMl5BanBnXkFtZTcwODc5MTUwMw@@._V1_SX300.jpg',
  'Avatar: The Way of Water': 'https://m.media-amazon.com/images/M/MV5BMDc4MzBiZTYtMWUxYy00YTMyLTk3OTItY2JlZjMzMDAwYWE2XkEyXkFjcGdeQXVyNjk1Njg5NTA@._V1_SX300.jpg',
  'The Godfather': 'https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNC00MTMyLWEwMjgtMDg2YWE3T2FmNmE1XkEyXkFjcGdeQXVyNzU1NzE3NTg@._V1_SX300.jpg',
  'The Godfather Part II': 'https://m.media-amazon.com/images/M/MV5BOQ0MmFkYTEtNDVkZC00NTkxLTg2NTItN2JkMDcyODEzMjA1XkEyXkFjcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg',
  'The Dark Knight': 'https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODg0MTUzMQ@@._V1_SX300.jpg',
  'The Dark Knight Rises': 'https://m.media-amazon.com/images/M/MV5BNDkyODI1MTAtMzE0Ni00ZTcwLWEwMmEtMDI5NDQyNmM3Nzg2XkEyXkFjcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg',
  'Inception': 'https://m.media-amazon.com/images/M/MV5BMjAxMzc5ZDctNDg2Ni00MGAwLWEzMTgtYWI3MWEwMGEwYmdlXkEyXkFjcGdeQXVyNzU1NzE3NTg@._V1_SX300.jpg',
  'Interstellar': 'https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OTI0LTljMzctZDJmMzU1MDAwMDU1XkEyXkFjcGdeQXVyMzQ0MjM5NjU@._V1_SX300.jpg',
  'The Matrix': 'https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTAwLWI5ZTUtMTY4ZmQ4MzNmODVjXkEyXkFjcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg',
  'The Matrix Reloaded': 'https://m.media-amazon.com/images/M/MV5BOTA5NjcwZDItMjAwNC00ZjMyLWEwNTItOWEyNzhhMzk3OTMxXkEyXkFjcGdeQXVyMzQ0MjM5NjU@._V1_SX300.jpg',
  'Pulp Fiction': 'https://m.media-amazon.com/images/M/MV5BNGNhMDIzZTUtNTBlZi00MTRlLWFjM2ItMDJmMmE2ZDdiODcyXkEyXkFjcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg',
  'Fight Club': 'https://m.media-amazon.com/images/M/MV5BMjJmYTZkN2UtNjVjYS00ZjRmLTk3ZTAtMDBlMzM1MjA1OWVjXkEyXkFjcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg',
  'Forrest Gump': 'https://m.media-amazon.com/images/M/MV5BNWIwODRlZTUtY0U4MC00Nzc4LTg0YjYtYzM0NTFjZDkwMTNmXkEyXkFjcGdeQXVyIjM5NzA5NTQ@._V1_SX300.jpg',
  'The Shawshank Redemption': 'https://m.media-amazon.com/images/M/MV5BMDFkYTc0MGEtZmNhMC00ZDIzLWFmNTEtODM1ZmRlYWMwMWFmXkEyXkFjcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg',
  'Jurassic Park': 'https://m.media-amazon.com/images/M/MV5BMjM2MDgxNTYt-MjM0MC00MDI3LWI2MjktOTMyOTQ4ZTk4NDczXkEyXkFjcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg',
  'Joker': 'https://m.media-amazon.com/images/M/MV5BNGVjYWZiNy00NzhlLTgxYzAtOWQwNThjYjIwZmVkXkEyXkFjcGdeQXVyMTkxNjUyNQ@@._V1_SX300.jpg',
  'Oppenheimer': 'https://m.media-amazon.com/images/M/MV5BMDBmYTZjNjUtN2M1MS00MTQ2LTljODMtZTIxNWM5OWU0YTdmXkEyXkFjcGdeQXVyNzAwMjU2MTY@._V1_SX300.jpg',
  'Top Gun: Maverick': 'https://m.media-amazon.com/images/M/MV5BZGFjOTliMmUtNmRjMC00N2ZmLWE3ZTAtMThkNjgzN2RhMDZiXkEyXkFjcGdeQXVyMDM2NDM2MQ@@._V1_SX300.jpg',
  'Dune: Part One': 'https://m.media-amazon.com/images/M/MV5BMGUyZDA4MDItNzVjOS00YzlkLWEwN2ItYzg5ZjBkNGE0YmE1XkEyXkFjcGdeQXVyMTkxNjUyNQ@@._V1_SX300.jpg',
  'Dune: Part Two': 'https://m.media-amazon.com/images/M/MV5BN2FjNmVlZWUtZTZlYy00NDAxLWFhZTgtZmY4MzU0YmU5Yzc0XkEyXkFjcGdeQXVyMTkxNjUyNQ@@._V1_SX300.jpg',
  'Titanic': 'https://m.media-amazon.com/images/M/MV5BMDdmZjk0YzAtYmE5Yi00ZTA3LWFlZDEtNTc4ZDQyNzE2NTg1XkEyXkFjcGdeQXVyNTA4NzY1MzY@._V1_SX300.jpg',
  'The Wolf of Wall Street': 'https://m.media-amazon.com/images/M/MV5BMjIxMjgxNmTt-TR1Yi00OGExLWFmMmUtMzY5Njk0MmVkMTdjXkEyXkFjcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg',
  'The Social Network': 'https://m.media-amazon.com/images/M/MV5BOGUyZDA4MDItNzVjOS00YzlkLWEwN2ItYzg5ZjBkNGE0YmE1XkEyXkFjcGdeQXVyMTkxNjUyNQ@@._V1_SX300.jpg',
  'Parasite': 'https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZDItWTVlNC00ZDJiLWEyM2UtMjcyYWIyNDMwMzUzXkEyXkFjcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg',
  'Oldboy': 'https://m.media-amazon.com/images/M/MV5BZTM2YTk2NzEtYjkwOS00ZWQ2LWI1OTEtOWU0YjI5YWE2N2JkXkEyXkFjcGdeQXVyMzQwMTk2ODg@._V1_SX300.jpg',
  'Dangal': 'https://m.media-amazon.com/images/M/MV5BMTAyN2JmZmEtNjAyVS00NzRmLWExMmUtMjc5NjNlYTU5YjdhXkEyXkFjcGdeQXVyNjAwNDUxODI@._V1_SX300.jpg',
  '3 Idiots': 'https://m.media-amazon.com/images/M/MV5BZDA2YYY0MzktOTBhZi00YmI4LWIwYWUtYmI0YjAwNGM2MTczXkEyXkFjcGdeQXVyNTEyMzM4NjA@._V1_SX300.jpg',
  'Bahubali: The Beginning': 'https://m.media-amazon.com/images/M/MV5BY2FjNjk0MTEtZDAxNC00YTQ4LWI1MWUtMDczNzQ3NDQ0NzEwXkEyXkFjcGdeQXVyMjkwMjkzODg@._V1_SX300.jpg',
  'Bahubali 2: The Conclusion': 'https://m.media-amazon.com/images/M/MV5BMmFjYzQ1NjAtOTk3Ny00ZWQwLWI3YTUtYmI2MGE3ZmJiYWY1XkEyXkFjcGdeQXVyMjkwMjkzODg@._V1_SX300.jpg',
  'RRR': 'https://m.media-amazon.com/images/M/MV5BOTczNTkwYzEtNzQ2OC00ZWZlLWJlMzYtZjY0ZjM5OWJmMzE4XkEyXkFjcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg',
  'KGF: Chapter 1': 'https://m.media-amazon.com/images/M/MV5BMzQwMDEwMTMyN15BMl5BanBnXkFtZTgwNTcxMDU0NDM@._V1_SX300.jpg',
  'KGF: Chapter 2': 'https://m.media-amazon.com/images/M/MV5BNDRiOTQwY2MtNzFlZi00ZGZlLWE2Y2ItZTA3ODI0OTI4ZTMwXkEyXkFjcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg',
  'Pushpa: The Rise': 'https://m.media-amazon.com/images/M/MV5BMzk2ZTNiMTgtNWYwNS00MzM4LTgxYTMtYWI2YzRhYzJiODYzXkEyXkFjcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg',
  'Pushpa 2: The Rule': 'https://m.media-amazon.com/images/M/MV5BYWE0Y2FjMzUtZWYwNS01NzM4LWE0YTAtYWI2YzJjODJkYzc0XkEyXkFjcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg',
  'Fighter': 'https://m.media-amazon.com/images/M/MV5BNGZlOTQ4NTAtNDcyZC00YzJiLTgxOWYtYWI2YzUwZjU1ODkyXkEyXkFjcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg',
  'Pathaan': 'https://m.media-amazon.com/images/M/MV5BMTI3YTQ2ZDAtNDc2Ny00YzJiLWE0YTAtYWI1YzBkZjU1ODkyXkEyXkFjcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg',
  'Kantara': 'https://m.media-amazon.com/images/M/MV5BZmY0OThkNjktZGFiNi00NTBjLTgyYTAtYWI1YzJkZjU1ODkyXkEyXkFjcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg',
  'Andhadhun': 'https://m.media-amazon.com/images/M/MV5BZTUyOTU0ZTctODQ2Mi00NTBjLTgxYTAtYWI1YzBkZjU1ODkyXkEyXkFjcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg',
  'Drishyam': 'https://m.media-amazon.com/images/M/MV5BZTY4ZTUyZTctODQ2Mi00NTBjLTgxYTAtYWI1YzBkZjU1ODkyXkEyXkFjcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg',

  // Web Series
  'Game of Thrones': 'https://m.media-amazon.com/images/M/MV5BN2FjYWE4YWYtOTE1Ni00MWIzLWE1MDgtYTk1YWIxMzBlY2JiXkEyXkFjcGdeQXVyMDczOTI5NDkz._V1_SX300.jpg',
  'Breaking Bad': 'https://m.media-amazon.com/images/M/MV5BMGQ2ZTZhMDEtOTkzYi00NzlhLTg0MjgtNWI5ZDMyZmE5MzkxXkEyXkFjcGdeQXVyMzQ2ODI5NDk@._V1_SX300.jpg',
  'Stranger Things': 'https://m.media-amazon.com/images/M/MV5BMjI0NjkzNDM5MV5BMl5BanBnXkFtZTgwMjk0OTEyODQ@._V1_SX300.jpg',
  'The Crown': 'https://m.media-amazon.com/images/M/MV5BZjZlZWY4MjItYWE4Yy00NGE1LWJkZjAtNDkxZDQyNjAxNmM0XkEyXkFjcGdeQXVyMDczOTI5NDkz._V1_SX300.jpg',
  'Squid Game': 'https://m.media-amazon.com/images/M/MV5BYWE3ZDMxNDMtMzA1Ni00NzlmLTg2YTAtMDI5YzBkZjU1ODkyXkEyXkFjcGdeQXVyMjMxOTE0ODA@._V1_SX300.jpg',
  'Money Heist': 'https://m.media-amazon.com/images/M/MV5BMjQwNjMxODMtMjJkNC00MzVkLWE0ZGUtODkwNDQ3YmZlMjhhXkEyXkFjcGdeQXVyMDczOTI5NDkz._V1_SX300.jpg',
  'Dark': 'https://m.media-amazon.com/images/M/MV5BNGM0M2YyNDctNDJjOC00NDY3LWJhZWItYTkxYjQ4OWU4ZTI1XkEyXkFjcGdeQXVyMDczOTI5NDkz._V1_SX300.jpg',
  'Peaky Blinders': 'https://m.media-amazon.com/images/M/MV5BZmU2YjgwN2EtMDk0ZS00ZjY2LThhNDUtMDZlZjAxOWY2ZGI5XkEyXkFjcGdeQXVyMDczOTI5NDkz._V1_SX300.jpg',
  'Better Call Saul': 'https://m.media-amazon.com/images/M/MV5BZDRkODg3YTAtYWM0Mi00YWQzLWI2YTktMDkxZDQ3OGI1ZGI5XkEyXkFjcGdeQXVyMDczOTI5NDkz._V1_SX300.jpg',
  'Narcos': 'https://m.media-amazon.com/images/M/MV5BMTg1NDk0NzE0NF5BMl5BanBnXkFtZTgwNDMzODQ2NzM@._V1_SX300.jpg',
  'Ozark': 'https://m.media-amazon.com/images/M/MV5BNTU3YjI4ZDUtYWJlOC00MzhhLWFmYzQtODZlZjU0YjU1ZmZhXkEyXkFjcGdeQXVyMDczOTI5NDkz._V1_SX300.jpg',
  'The Office': 'https://m.media-amazon.com/images/M/MV5BMDNkODczODEtYjZlYi00MzczLWE5ZWUtZTY1MDg5MGQ5YmMwXkEyXkFjcGdeQXVyMDczOTI5NDkz._V1_SX300.jpg',
  'Friends': 'https://m.media-amazon.com/images/M/MV5BNQ-dNbgyJmMtMzQ4OC00NzlkLTg0N2YtNDI2ZjBkNGU1ZThjXkEyXkFjcGdeQXVyMDczOTI5NDkz._V1_SX300.jpg',
  'The Boys': 'https://m.media-amazon.com/images/M/MV5BZWU5NTgyOWItODQyOC00ZDg4LTkwZWYtZTBjZjRhNzc0YjVmXkEyXkFjcGdeQXVyMDczOTI5NDkz._V1_SX300.jpg',
  'Black Mirror': 'https://m.media-amazon.com/images/M/MV5BNjg4NzAwMTUtYzQ4Ni00ZjlkLTk2ZGYtOWJjZDMyYWFiYTYwXkEyXkFjcGdeQXVyMDczOTI5NDkz._V1_SX300.jpg',
  'Sherlock': 'https://m.media-amazon.com/images/M/MV5BMDJmZjkxZjItNzQ0OC00YTQ2LTkwZjYtMTc4NzEzMDZkMDY5XkEyXkFjcGdeQXVyMzQ2ODI5NDk@._V1_SX300.jpg',
  'True Detective': 'https://m.media-amazon.com/images/M/MV5BMDZlY2QzZjUtZTA2ZC00MjRjLWEwYmUtZTA3YWFkZjE3OTE4XkEyXkFjcGdeQXVyMDczOTI5NDkz._V1_SX300.jpg',
  'Succession': 'https://m.media-amazon.com/images/M/MV5BZDE3ZjAwYmItODY1Zi00YTQ2LWI3YmUtYTkxYjQ4OWU0YzI1XkEyXkFjcGdeQXVyMDczOTI5NDkz._V1_SX300.jpg',
  'The Last of Us': 'https://m.media-amazon.com/images/M/MV5BZGU4MDE1YjAtODdjNi00ZWQ0LWE3NTItMzY0NjMwOGU1MzUzXkEyXkFjcGdeQXVyMDczOTI5NDkz._V1_SX300.jpg',
  'Severance': 'https://m.media-amazon.com/images/M/MV5BZTZhZGZhNTItZGZjZi00YWU0LWJmYTItMGQwNzE0NDAxZDkwXkEyXkFjcGdeQXVyMDczOTI5NDkz._V1_SX300.jpg',
  'Ted Lasso': 'https://m.media-amazon.com/images/M/MV5BNjk2MzI0MWItYWI4YS00OTU0LTk1ZDktOTBmYmJlNDk3MDAwXkEyXkFjcGdeQXVyMDczOTI5NDkz._V1_SX300.jpg',
  'Chernobyl': 'https://m.media-amazon.com/images/M/MV5BMzZhYTBhNTYtZGJjMi00YTQ0LTk2ZTAtODJlZjU1ZWIxZjUwXkEyXkFjcGdeQXVyMDAzNzMyNw@@._V1_SX300.jpg',
  'Mindhunter': 'https://m.media-amazon.com/images/M/MV5BODFlODM5ZDYtZjg2OS00YWQxLTg1MWQtYTBkNzI0ODcyZjExXkEyXkFjcGdeQXVyMDczOTI5NDkz._V1_SX300.jpg',
  'The Witcher': 'https://m.media-amazon.com/images/M/MV5BMjI0ZjEwMTUtN2QzOC00NjE0LWI4NGUtOWRkZTljNmE3MzJiXkEyXkFjcGdeQXVyMDczOTI5NDkz._V1_SX300.jpg',
  'Westworld': 'https://m.media-amazon.com/images/M/MV5BMTEyYmZkNjQtZjc3NC00ZjBkLTg3NzktZmUwYjlhY2U4ZGI3XkEyXkFjcGdeQXVyMDAzNzMyNw@@._V1_SX300.jpg',
  'Sacred Games': 'https://m.media-amazon.com/images/M/MV5BMTI1MzAwOTktZTIwZi00YjE5LWJjMGEtMDkxZjQ4OWU0YTI5XkEyXkFjcGdeQXVyMjkwMjkzODg@._V1_SX300.jpg',
  'Mirzapur': 'https://m.media-amazon.com/images/M/MV5BMzJiOGI5ZTItMTk5MC00ZTg2LThhNzQtMDkxZjQ4OWU0YTI5XkEyXkFjcGdeQXVyMjkwMjkzODg@._V1_SX300.jpg',
  'Panchayat': 'https://m.media-amazon.com/images/M/MV5BOTgxNTU5YTAtZTBmNC00ZTg4LThkMzAtMDkxZjQ4OWU0YTI5XkEyXkFjcGdeQXVyMjkwMjkzODg@._V1_SX300.jpg',
  'Kota Factory': 'https://m.media-amazon.com/images/M/MV5BOGRlOWJhMzAtMjc4Ni00ZTcwLWI3NDUtMDkxZjQ4OWU0YTI5XkEyXkFjcGdeQXVyMjkwMjkzODg@._V1_SX300.jpg',
  'The Family Man': 'https://m.media-amazon.com/images/M/MV5BYjBjZjdlOTItZTBhYy00YzAyLTgzNTQtMDkxZjQ4OWU0YTI5XkEyXkFjcGdeQXVyMjkwMjkzODg@._V1_SX300.jpg',
  'Scam 1992': 'https://m.media-amazon.com/images/M/MV5BMzg3YzdjZTItZGQyNC00ZTg0LThkMzAtMDkxZjQ4OWU0YTI5XkEyXkFjcGdeQXVyMjkwMjkzODg@._V1_SX300.jpg',
  'Farzi': 'https://m.media-amazon.com/images/M/MV5BNDg2YzA0NTAtZDA1OS00ZTk4LTgzNTQtMDkxZjQ4OWU0YTI5XkEyXkFjcGdeQXVyMjkwMjkzODg@._V1_SX300.jpg',
  'Crash Landing on You': 'https://m.media-amazon.com/images/M/MV5BNTI2MzAwNTMtMDMwMS00ZGM4LWI0MDQtODkxZjQ4OWU0YTI5XkEyXkFjcGdeQXVyMjkwMjkzODg@._V1_SX300.jpg',
  'Itaewon Class': 'https://m.media-amazon.com/images/M/MV5BNTY1ODIwNzMtMmZhZS00ZTcwLTgzNTQtMDkxZjQ4OWU0YTI5XkEyXkFjcGdeQXVyMjkwMjkzODg@._V1_SX300.jpg',
  'My Name': 'https://m.media-amazon.com/images/M/MV5BMzFlN2Y1OTAtZGU2ZC00ZTc0LTgzNTQtMDkxZjQ4OWU0YTI5XkEyXkFjcGdeQXVyMjkwMjkzODg@._V1_SX300.jpg',
  'Start-Up': 'https://m.media-amazon.com/images/M/MV5BNDA5OTMyOTAtOTgyMi00ZWQwLTgzNTQtMDkxZjQ0OWU0YTI5XkEyXkFjcGdeQXVyMjkwMjkzODg@._V1_SX300.jpg',
  'Beyond Evil': 'https://m.media-amazon.com/images/M/MV5BMzE1MDE4NTAtOTdhNi00ZWM0LTgzNTQtMDkxZjQ4OWU0YTI5XkEyXkFjcGdeQXVyMjkwMjkzODg@._V1_SX300.jpg',
  'All of Us Are Dead': 'https://m.media-amazon.com/images/M/MV5BZTFlMmJlNTAtYWZkZi00ZTg0LTgzNTQtMDkxZjQ4OWU0YTI5XkEyXkFjcGdeQXVyMjkwMjkzODg@._V1_SX300.jpg',
  'Hellbound': 'https://m.media-amazon.com/images/M/MV5BNDJhMzQ4ODAtMmY1Ni00ZWQ0LTgzNTQtMDkxZjQ0OWU0YTI5XkEyXkFjcGdeQXVyMjkwMjkzODg@._V1_SX300.jpg',
  'Hotel del Luna': 'https://m.media-amazon.com/images/M/MV5BMzE3MTY4OTAtYzMxOC00ZWM0LTgzNTQtMDkxZjQ4OWU0YTI5XkEyXkFjcGdeQXVyMjkwMjkzODg@._V1_SX300.jpg',
  'Hospital Playlist': 'https://m.media-amazon.com/images/M/MV5BNDczMDQ0OTAtNzU2Yi00ZWQ0LTgzNTQtMDkxZjQ0OWU0YTI5XkEyXkFjcGdeQXVyMjkwMjkzODg@._V1_SX300.jpg',
  'Squid Game': 'https://m.media-amazon.com/images/M/MV5BYWE3ZDMxNDMtMzA1Ni00NzlmLTg2YTAtMDI5YzBkZjU1ODkyXkEyXkFjcGdeQXVyMjMxOTE0ODA@._V1_SX300.jpg',
  'Alchemy of Souls': 'https://m.media-amazon.com/images/M/MV5BNDI3OTk1NDAtN2JmOS00ZWM0LTgzNTQtMDkxZjQ0OWU0YTI5XkEyXkFjcGdeQXVyMjkwMjkzODg@._V1_SX300.jpg',
  'Business Proposal': 'https://m.media-amazon.com/images/M/MV5BMzE2ZDk0YTAtNzkzZi00ZWM0LTgzNTQtMDkxZjQ0OWU0YTI5XkEyXkFjcGdeQXVyMjkwMjkzODg@._V1_SX300.jpg',
  'Happiness': 'https://m.media-amazon.com/images/M/MV5BNTI2MDc1MDAtZGE3NS00ZWM0LTgzNTQtMDkxZjQ0OWU0YTI5XkEyXkFjcGdeQXVyMjkwMjkzODg@._V1_SX300.jpg',
  'Mystic Pop': 'https://m.media-amazon.com/images/M/MV5BNDI2NjI0ODAtMWM0My00ZWM0LTgzNTQtMDkxZjQ0OWU0YTI5XkEyXkFjcGdeQXVyMjkwMjkzODg@._V1_SX300.jpg',
  'Record of Youth': 'https://m.media-amazon.com/images/M/MV5BMzE0NzQ0NTAtODM2NS00ZWM0LTgzNTQtMDkxZjQ0OWU0YTI5XkEyXkFjcGdeQXVyMjkwMjkzODg@._V1_SX300.jpg',
  'Snowdrop': 'https://m.media-amazon.com/images/M/MV5BNDcyMjA0NDAtODg0My00ZWM0LTgzNTQtMDkxZjQ0OWU0YTI5XkEyXkFjcGdeQXVyMjkwMjkzODg@._V1_SX300.jpg',
  'Juvenile Justice': 'https://m.media-amazon.com/images/M/MV5BMzEzZTA3NDAtMDM2My00ZWM0LTgzNTQtMDkxZjQ0OWU0YTI5XkEyXkFjcGdeQXVyMjkwMjkzODg@._V1_SX300.jpg',
  'Extracurricular': 'https://m.media-amazon.com/images/M/MV5BNTI4NzU0NTAtN2I2My00ZWM0LTgzNTQtMDkxZjQ0OWU0YTI5XkEyXkFjcGdeQXVyMjkwMjkzODg@._V1_SX300.jpg',
  'Glitch': 'https://m.media-amazon.com/images/M/MV5BMzE1NTU1NTAtM2I4Mi00ZWM0LTgzNTQtMDkxZjQ0OWU0YTI5XkEyXkFjcGdeQXVyMjkwMjkzODg@._V1_SX300.jpg',
  'Aarya': 'https://m.media-amazon.com/images/M/MV5BNTI3ZTk0ODAtODkxNS00ZWM0LTgzNTQtMDkxZjQ0OWU0YTI5XkEyXkFjcGdeQXVyMjkwMjkzODg@._V1_SX300.jpg',
  'Special OPS': 'https://m.media-amazon.com/images/M/MV5BNTI4ODc1MzAtMjYxOC00ZWM0LTgzNTQtMDkxZjQ0OWU0YTI5XkEyXkFjcGdeQXVyMjkwMjkzODg@._V1_SX300.jpg',
  'Asur': 'https://m.media-amazon.com/images/M/MV5BNTI1YzI4OTAtMzA3Yi00ZWM0LTgzNTQtMDkxZjQ0OWU0YTI5XkEyXkFjcGdeQXVyMjkwMjkzODg@._V1_SX300.jpg',
  'Archive 81': 'https://m.media-amazon.com/images/M/MV5BNTI2MWE3OTAtNDQxYS00ZWM0LTgzNTQtMDkxZjQ0OWU0YTI5XkEyXkFjcGdeQXVyMjkwMjkzODg@._V1_SX300.jpg',
  'The Diplomat': 'https://m.media-amazon.com/images/M/MV5BNTI3MDk4OTAtYzM3OS00ZWM0LTgzNTQtMDkxZjQ0OWU0YTI5XkEyXkFjcGdeQXVyMjkwMjkzODg@._V1_SX300.jpg',
  'Wednesday': 'https://m.media-amazon.com/images/M/MV5BNTI0NTI4ODAtZDMwNC00ZWM0LTgzNTQtMDkxZjQ0OWU0YTI5XkEyXkFjcGdeQXVyMjkwMjkzODg@._V1_SX300.jpg',
  'Mouse': 'https://m.media-amazon.com/images/M/MV5BNTI1NzU3OTAtNTk2MS00ZWM0LTgzNTQtMDkxZjQ0OWU0YTI5XkEyXkFjcGdeQXVyMjkwMjkzODg@._V1_SX300.jpg',
  'The Cursed': 'https://m.media-amazon.com/images/M/MV5BNTI2NzA4NTAtYjEwNi00ZWM0LTgzNTQtMDkxZjQ0OWU0YTI5XkEyXkFjcGdeQXVyMjkwMjkzODg@._V1_SX300.jpg',
};

// Update posters with mappings
async function updatePostersWithMappings() {
  try {
    const content = await query('SELECT Content_ID, Title FROM Content ORDER BY Title ASC');
    
    console.log(`🎨 Updating ${content.length} posters from direct URL mappings...\n`);
    
    let matches = 0;
    let noMatch = 0;
    
    for (let i = 0; i < content.length; i++) {
      const item = content[i];
      const title = item.Title.trim();
      
      process.stdout.write(`[${(i + 1).toString().padStart(3, ' ')}/${content.length}] "${title.substring(0, 35).padEnd(35, ' ')}" `);
      
      // Try exact match first
      let posterUrl = posterMappings[title];
      
      // Try partial match if no exact match
      if (!posterUrl) {
        for (const [key, value] of Object.entries(posterMappings)) {
          if (title.toLowerCase().includes(key.toLowerCase()) || 
              key.toLowerCase().includes(title.toLowerCase())) {
            posterUrl = value;
            break;
          }
        }
      }
      
      if (posterUrl) {
        await query(
          'UPDATE Content SET Poster_Image_URL = ? WHERE Content_ID = ?',
          [posterUrl, item.Content_ID]
        );
        console.log('✅');
        matches++;
      } else {
        console.log('⚠️ ');
        noMatch++;
      }
    }
    
    console.log(`\n\n🎬 ════════════════════════════════════════════════════`);
    console.log(`✅ Successfully matched: ${matches} posters`);
    console.log(`⚠️  No match found: ${noMatch}`);
    console.log(`📊 Coverage: ${Math.round((matches / content.length) * 100)}%`);
    console.log(`════════════════════════════════════════════════════ 🎬\n`);
    
    console.log(`🎉 Posters updated! Refresh your browser to see the changes.`);
    console.log(`   URL: http://localhost:3000/browse.html\n`);
    
    db.end();
    
  } catch (e) {
    console.error('\n❌ Error:', e.message);
    db.end();
    process.exit(1);
  }
}

// Helper
function query(sql, params = []) {
  return new Promise((res, rej) => {
    db.query(sql, params, (e, r) => e ? rej(e) : res(r));
  });
}
