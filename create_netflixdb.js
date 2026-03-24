const mysql = require('mysql2/promise');

async function setup() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'arun2006',
    multipleStatements: false
  });

  const statements = [
    "CREATE DATABASE IF NOT EXISTS netflixdb",
    "USE netflixdb",
    `CREATE TABLE IF NOT EXISTS Subscription_Plan (
      Plan_ID INT AUTO_INCREMENT PRIMARY KEY,
      Plan_Name VARCHAR(50) NOT NULL UNIQUE,
      Price DECIMAL(8,2) NOT NULL,
      Video_Quality VARCHAR(10) NOT NULL,
      Max_Screens INT NOT NULL,
      CONSTRAINT chk_quality CHECK (Video_Quality IN ('SD','HD','UHD')),
      CONSTRAINT chk_screens CHECK (Max_Screens BETWEEN 1 AND 4)
    )`,
    `CREATE TABLE IF NOT EXISTS Content (
      Content_ID INT AUTO_INCREMENT PRIMARY KEY,
      Title VARCHAR(200) NOT NULL,
      Genre VARCHAR(50),
      Language VARCHAR(30),
      Duration INT,
      Release_Date DATE,
      Age_Rating VARCHAR(10),
      Poster_Image_URL VARCHAR(500) DEFAULT 'https://via.placeholder.com/300x450?text=No+Image'
    )`,
    `CREATE TABLE IF NOT EXISTS User (
      User_ID INT AUTO_INCREMENT PRIMARY KEY,
      Name VARCHAR(100) NOT NULL,
      Email VARCHAR(150) NOT NULL UNIQUE,
      Phone VARCHAR(15),
      Password VARCHAR(255) NOT NULL,
      Registration_Date DATE NOT NULL DEFAULT (CURDATE())
    )`,
    `CREATE TABLE IF NOT EXISTS Subscription (
      Subscription_ID INT AUTO_INCREMENT PRIMARY KEY,
      User_ID INT NOT NULL,
      Plan_ID INT NOT NULL,
      Start_Date DATE NOT NULL,
      End_Date DATE NOT NULL,
      Status ENUM('Active','Inactive','Cancelled') NOT NULL DEFAULT 'Active',
      CONSTRAINT fk_sub_user FOREIGN KEY (User_ID) REFERENCES User(User_ID) ON DELETE CASCADE,
      CONSTRAINT fk_sub_plan FOREIGN KEY (Plan_ID) REFERENCES Subscription_Plan(Plan_ID) ON DELETE RESTRICT,
      CONSTRAINT chk_dates CHECK (End_Date > Start_Date)
    )`,
    `CREATE TABLE IF NOT EXISTS Payment (
      Payment_ID INT AUTO_INCREMENT PRIMARY KEY,
      Subscription_ID INT NOT NULL,
      Payment_Date DATE NOT NULL,
      Amount DECIMAL(8,2) NOT NULL,
      Payment_Method VARCHAR(50),
      Payment_Status ENUM('Pending','Completed','Failed') NOT NULL DEFAULT 'Pending',
      CONSTRAINT fk_pay_sub FOREIGN KEY (Subscription_ID) REFERENCES Subscription(Subscription_ID) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS Watch_History (
      History_ID INT AUTO_INCREMENT PRIMARY KEY,
      Watch_ID INT,
      User_ID INT NOT NULL,
      Content_ID INT NOT NULL,
      Watch_Date DATE NOT NULL DEFAULT (CURDATE()),
      CONSTRAINT fk_wh_user FOREIGN KEY (User_ID) REFERENCES User(User_ID) ON DELETE CASCADE,
      CONSTRAINT fk_wh_content FOREIGN KEY (Content_ID) REFERENCES Content(Content_ID) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS Watchlist (
      Watchlist_ID INT AUTO_INCREMENT PRIMARY KEY,
      User_ID INT NOT NULL,
      Content_ID INT NOT NULL,
      Added_Date DATE NOT NULL DEFAULT (CURDATE()),
      CONSTRAINT uq_watchlist_user_content UNIQUE (User_ID, Content_ID),
      CONSTRAINT fk_wl_user FOREIGN KEY (User_ID) REFERENCES User(User_ID) ON DELETE CASCADE,
      CONSTRAINT fk_wl_content FOREIGN KEY (Content_ID) REFERENCES Content(Content_ID) ON DELETE CASCADE
    )`,
    `INSERT IGNORE INTO Subscription_Plan (Plan_ID, Plan_Name, Price, Video_Quality, Max_Screens) VALUES
      (1, 'Basic', 149.00, 'SD', 1),
      (2, 'Standard', 499.00, 'HD', 2),
      (3, 'Premium', 799.00, 'UHD', 4)`,
    `INSERT IGNORE INTO User (User_ID, Name, Email, Phone, Password, Registration_Date) VALUES
      (1, 'Arjun Sharma', 'arjun@gmail.com', '9876543210', SHA2('pass123', 256), '2023-01-10'),
      (2, 'Priya Patel', 'priya@gmail.com', '9123456780', SHA2('pass456', 256), '2023-03-15'),
      (3, 'Rohan Mehta', 'rohan@gmail.com', '9988776655', SHA2('pass789', 256), '2023-06-20'),
      (4, 'Sneha Iyer', 'sneha@gmail.com', '9001234567', SHA2('passabc', 256), '2023-08-05'),
      (5, 'Demo User', 'demo@netflix.com', '9000000000', SHA2('demo123', 256), '2024-01-01')`,
    `INSERT IGNORE INTO Content (Content_ID, Title, Genre, Language, Duration, Release_Date, Age_Rating) VALUES
      (1, 'Stranger Things', 'Sci-Fi / Horror', 'English', 50, '2016-07-15', 'TV-14'),
      (2, 'Money Heist', 'Thriller', 'Spanish', 45, '2017-05-02', 'TV-MA'),
      (3, 'Dark', 'Sci-Fi / Mystery', 'German', 60, '2017-12-01', 'TV-MA'),
      (4, 'The Crown', 'Drama', 'English', 58, '2016-11-04', 'TV-MA'),
      (5, 'Squid Game', 'Thriller', 'Korean', 55, '2021-09-17', 'TV-MA'),
      (6, 'Breaking Bad', 'Crime / Drama', 'English', 47, '2008-01-20', 'TV-MA'),
      (7, 'Sacred Games', 'Crime / Thriller', 'Hindi', 50, '2018-07-06', 'TV-MA'),
      (8, 'Mirzapur', 'Crime / Action', 'Hindi', 45, '2018-11-16', 'TV-MA'),
      (9, 'Wednesday', 'Comedy / Horror', 'English', 48, '2022-11-23', 'TV-14'),
      (10, 'The Witcher', 'Fantasy', 'English', 60, '2019-12-20', 'TV-MA')`,
    `INSERT IGNORE INTO Subscription (Subscription_ID, User_ID, Plan_ID, Start_Date, End_Date, Status) VALUES
      (1, 1, 3, '2024-01-01', '2025-01-01', 'Active'),
      (2, 2, 2, '2024-02-01', '2025-02-01', 'Active'),
      (3, 3, 1, '2024-03-01', '2024-09-01', 'Inactive'),
      (4, 4, 3, '2024-04-01', '2025-04-01', 'Active'),
      (5, 5, 2, '2024-01-01', '2025-01-01', 'Active')`,
    `INSERT IGNORE INTO Payment (Payment_ID, Subscription_ID, Payment_Date, Amount, Payment_Method, Payment_Status) VALUES
      (1, 1, '2024-01-01', 799.00, 'Credit Card', 'Completed'),
      (2, 2, '2024-02-01', 499.00, 'UPI', 'Completed'),
      (3, 3, '2024-03-01', 149.00, 'Debit Card', 'Completed'),
      (4, 4, '2024-04-01', 799.00, 'Net Banking', 'Completed'),
      (5, 5, '2024-01-01', 499.00, 'UPI', 'Completed')`,
    `INSERT IGNORE INTO Watch_History (History_ID, User_ID, Content_ID, Watch_Date) VALUES
      (1, 1, 1, '2024-01-05'),
      (2, 1, 5, '2024-01-10'),
      (3, 1, 6, '2024-01-15'),
      (4, 2, 2, '2024-02-05'),
      (5, 2, 3, '2024-02-10'),
      (6, 3, 6, '2024-03-05'),
      (7, 4, 7, '2024-04-05'),
      (8, 4, 8, '2024-04-12'),
      (9, 5, 9, '2024-01-05'),
      (10, 5, 4, '2024-01-12')`
  ];

  for (const statement of statements) {
    await conn.query(statement);
  }

  const [tableRows] = await conn.query('SHOW TABLES');

  const [plansCount] = await conn.query('SELECT COUNT(*) AS c FROM Subscription_Plan');
  const [contentCount] = await conn.query('SELECT COUNT(*) AS c FROM Content');
  const [usersCount] = await conn.query('SELECT COUNT(*) AS c FROM User');
  const [subsCount] = await conn.query('SELECT COUNT(*) AS c FROM Subscription');
  const [paymentsCount] = await conn.query('SELECT COUNT(*) AS c FROM Payment');
  const [historyCount] = await conn.query('SELECT COUNT(*) AS c FROM Watch_History');
  const [watchlistCount] = await conn.query('SELECT COUNT(*) AS c FROM Watchlist');

  console.log('DB_READY: netflixdb');
  console.log('TABLES:', tableRows.length);
  console.log('COUNTS:', {
    Subscription_Plan: plansCount[0].c,
    Content: contentCount[0].c,
    User: usersCount[0].c,
    Subscription: subsCount[0].c,
    Payment: paymentsCount[0].c,
    Watch_History: historyCount[0].c,
    Watchlist: watchlistCount[0].c
  });

  await conn.end();
}

setup().catch((err) => {
  console.error('SETUP_ERR:', err.message);
  process.exit(1);
});
