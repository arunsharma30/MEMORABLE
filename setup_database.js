// ============================================================
//  Memorable - Add Poster Column to Database
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
    console.error('❌ Connection failed:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to MySQL\n');
  
  // Add the Poster_Image_URL column if it doesn't exist
  const addColumnSql = `
    ALTER TABLE Content 
    ADD COLUMN Poster_Image_URL VARCHAR(500) 
    DEFAULT 'https://via.placeholder.com/300x450?text=No+Image' 
    AFTER Age_Rating;
  `;
  
  db.query(addColumnSql, (err) => {
    if (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('✅ Column already exists\n');
      } else {
        console.error('❌ Error adding column:', err.message);
        process.exit(1);
      }
    } else {
      console.log('✅ Column added successfully\n');
    }
    
    console.log('🎬 ═══════════════════════════════════════════════');
    console.log('   Database schema updated!');
    console.log('═══════════════════════════════════════════════🎬\n');
    
    db.end();
    process.exit(0);
  });
});
