-- ============================================================
--  NetflixDB - DBMS Mini Project
--  Schema based on ER Diagram
-- ============================================================

CREATE DATABASE IF NOT EXISTS netflixdb;
USE netflixdb;

-- ============================================================
-- TABLE: Subscription_Plan
-- ============================================================
CREATE TABLE Subscription_Plan (
    Plan_ID     INT AUTO_INCREMENT PRIMARY KEY,
    Plan_Name   VARCHAR(50)    NOT NULL UNIQUE,
    Price       DECIMAL(8,2)   NOT NULL,
    Video_Quality VARCHAR(10)  NOT NULL,  -- SD, HD, UHD
    Max_Screens INT            NOT NULL,
    CONSTRAINT chk_quality CHECK (Video_Quality IN ('SD','HD','UHD')),
    CONSTRAINT chk_screens CHECK (Max_Screens BETWEEN 1 AND 4)
);

-- ============================================================
-- TABLE: Content
-- ============================================================
CREATE TABLE Content (
    Content_ID       INT AUTO_INCREMENT PRIMARY KEY,
    Title            VARCHAR(200)  NOT NULL,
    Genre            VARCHAR(50),
    Language         VARCHAR(30),
    Duration         INT,           -- in minutes
    Release_Date     DATE,
    Age_Rating       VARCHAR(10),
    Poster_Image_URL VARCHAR(500)   -- High-quality poster from TMDB
);

-- ============================================================
-- TABLE: User
-- ============================================================
CREATE TABLE User (
    User_ID           INT AUTO_INCREMENT PRIMARY KEY,
    Name              VARCHAR(100) NOT NULL,
    Email             VARCHAR(150) NOT NULL UNIQUE,
    Phone             VARCHAR(15),
    Password          VARCHAR(255) NOT NULL,
    Registration_Date DATE         NOT NULL DEFAULT (CURDATE())
);

-- ============================================================
-- TABLE: Subscription
-- ============================================================
CREATE TABLE Subscription (
    Subscription_ID INT AUTO_INCREMENT PRIMARY KEY,
    User_ID         INT  NOT NULL,
    Plan_ID         INT  NOT NULL,
    Start_Date      DATE NOT NULL,
    End_Date        DATE NOT NULL,
    Status          ENUM('Active','Inactive','Cancelled') NOT NULL DEFAULT 'Active',
    CONSTRAINT fk_sub_user FOREIGN KEY (User_ID) REFERENCES User(User_ID)
        ON DELETE CASCADE,
    CONSTRAINT fk_sub_plan FOREIGN KEY (Plan_ID) REFERENCES Subscription_Plan(Plan_ID)
        ON DELETE RESTRICT,
    CONSTRAINT chk_dates CHECK (End_Date > Start_Date)
);

-- ============================================================
-- TABLE: Payment
-- ============================================================
CREATE TABLE Payment (
    Payment_ID      INT AUTO_INCREMENT PRIMARY KEY,
    Subscription_ID INT            NOT NULL,
    Payment_Date    DATE           NOT NULL,
    Amount          DECIMAL(8,2)   NOT NULL,
    Payment_Method  VARCHAR(50),
    Payment_Status  ENUM('Pending','Completed','Failed') NOT NULL DEFAULT 'Pending',
    CONSTRAINT fk_pay_sub FOREIGN KEY (Subscription_ID) REFERENCES Subscription(Subscription_ID)
        ON DELETE CASCADE
);

-- ============================================================
-- TABLE: Watch_History
-- ============================================================
CREATE TABLE Watch_History (
    History_ID  INT AUTO_INCREMENT PRIMARY KEY,
    Watch_ID    INT,
    User_ID     INT  NOT NULL,
    Content_ID  INT  NOT NULL,
    Watch_Date  DATE NOT NULL DEFAULT (CURDATE()),
    CONSTRAINT fk_wh_user    FOREIGN KEY (User_ID)    REFERENCES User(User_ID)    ON DELETE CASCADE,
    CONSTRAINT fk_wh_content FOREIGN KEY (Content_ID) REFERENCES Content(Content_ID) ON DELETE CASCADE
);

-- ============================================================
-- TABLE: Watchlist
-- ============================================================
CREATE TABLE Watchlist (
    Watchlist_ID INT AUTO_INCREMENT PRIMARY KEY,
    User_ID      INT NOT NULL,
    Content_ID   INT NOT NULL,
    Added_Date   DATE NOT NULL DEFAULT (CURDATE()),
    CONSTRAINT uq_watchlist_user_content UNIQUE (User_ID, Content_ID),
    CONSTRAINT fk_wl_user    FOREIGN KEY (User_ID) REFERENCES User(User_ID) ON DELETE CASCADE,
    CONSTRAINT fk_wl_content FOREIGN KEY (Content_ID) REFERENCES Content(Content_ID) ON DELETE CASCADE
);

-- ============================================================
-- SAMPLE DATA
-- ============================================================

INSERT INTO Subscription_Plan (Plan_Name, Price, Video_Quality, Max_Screens) VALUES
('Basic',    149.00, 'SD',  1),
('Standard', 499.00, 'HD',  2),
('Premium',  799.00, 'UHD', 4);

INSERT INTO Content (Title, Genre, Language, Duration, Release_Date, Age_Rating) VALUES
('Stranger Things',     'Sci-Fi / Horror',  'English', 50,  '2016-07-15', 'TV-14'),
('Money Heist',         'Thriller',         'Spanish', 45,  '2017-05-02', 'TV-MA'),
('Dark',                'Sci-Fi / Mystery', 'German',  60,  '2017-12-01', 'TV-MA'),
('The Crown',           'Drama',            'English', 58,  '2016-11-04', 'TV-MA'),
('Squid Game',          'Thriller',         'Korean',  55,  '2021-09-17', 'TV-MA'),
('Breaking Bad',        'Crime / Drama',    'English', 47,  '2008-01-20', 'TV-MA'),
('Sacred Games',        'Crime / Thriller', 'Hindi',   50,  '2018-07-06', 'TV-MA'),
('Mirzapur',            'Crime / Action',   'Hindi',   45,  '2018-11-16', 'TV-MA'),
('Wednesday',           'Comedy / Horror',  'English', 48,  '2022-11-23', 'TV-14'),
('The Witcher',         'Fantasy',          'English', 60,  '2019-12-20', 'TV-MA'),
('Inception',           'Sci-Fi / Thriller','English', 148, '2010-07-16', 'PG-13'),
('Parasite',            'Thriller / Drama', 'Korean',  132, '2019-05-30', 'R'),
('RRR',                 'Action / Drama',   'Telugu',  182, '2022-03-25', 'TV-14'),
('The Social Network',  'Drama / Biography','English', 120, '2010-10-01', 'PG-13'),
('Interstellar',        'Sci-Fi',           'English', 169, '2014-11-05', 'PG-13');

INSERT INTO User (Name, Email, Phone, Password, Registration_Date) VALUES
('Arjun Sharma',   'arjun@gmail.com',   '9876543210', SHA2('pass123', 256),  '2023-01-10'),
('Priya Patel',    'priya@gmail.com',   '9123456780', SHA2('pass456', 256),  '2023-03-15'),
('Rohan Mehta',    'rohan@gmail.com',   '9988776655', SHA2('pass789', 256),  '2023-06-20'),
('Sneha Iyer',     'sneha@gmail.com',   '9001234567', SHA2('passabc', 256),  '2023-08-05'),
('Demo User',      'demo@netflix.com',  '9000000000', SHA2('demo123', 256),  '2024-01-01');

INSERT INTO Subscription (User_ID, Plan_ID, Start_Date, End_Date, Status) VALUES
(1, 3, '2024-01-01', '2025-01-01', 'Active'),
(2, 2, '2024-02-01', '2025-02-01', 'Active'),
(3, 1, '2024-03-01', '2024-09-01', 'Inactive'),
(4, 3, '2024-04-01', '2025-04-01', 'Active'),
(5, 2, '2024-01-01', '2025-01-01', 'Active');

INSERT INTO Payment (Subscription_ID, Payment_Date, Amount, Payment_Method, Payment_Status) VALUES
(1, '2024-01-01', 799.00, 'Credit Card', 'Completed'),
(2, '2024-02-01', 499.00, 'UPI',         'Completed'),
(3, '2024-03-01', 149.00, 'Debit Card',  'Completed'),
(4, '2024-04-01', 799.00, 'Net Banking', 'Completed'),
(5, '2024-01-01', 499.00, 'UPI',         'Completed');

INSERT INTO Watch_History (User_ID, Content_ID, Watch_Date) VALUES
(1, 1,  '2024-01-05'),
(1, 5,  '2024-01-10'),
(1, 11, '2024-01-15'),
(2, 2,  '2024-02-05'),
(2, 3,  '2024-02-10'),
(3, 6,  '2024-03-05'),
(4, 7,  '2024-04-05'),
(4, 8,  '2024-04-12'),
(5, 9,  '2024-01-05'),
(5, 4,  '2024-01-12'),
(5, 15, '2024-02-01');

-- ============================================================
-- USEFUL QUERIES (for viva / report)
-- ============================================================

-- 1. List all active subscribers with their plan
-- SELECT u.Name, u.Email, sp.Plan_Name, sp.Price, s.Start_Date, s.End_Date
-- FROM User u
-- JOIN Subscription s ON u.User_ID = s.User_ID
-- JOIN Subscription_Plan sp ON s.Plan_ID = sp.Plan_ID
-- WHERE s.Status = 'Active';

-- 2. Total revenue collected
-- SELECT SUM(Amount) AS Total_Revenue FROM Payment WHERE Payment_Status = 'Completed';

-- 3. Watch history of a specific user
-- SELECT u.Name, c.Title, c.Genre, wh.Watch_Date
-- FROM Watch_History wh
-- JOIN User u ON wh.User_ID = u.User_ID
-- JOIN Content c ON wh.Content_ID = c.Content_ID
-- WHERE u.User_ID = 1;

-- 4. Most watched content
-- SELECT c.Title, COUNT(*) AS Watch_Count
-- FROM Watch_History wh JOIN Content c ON wh.Content_ID = c.Content_ID
-- GROUP BY c.Content_ID ORDER BY Watch_Count DESC LIMIT 5;

-- 5. Users with Premium plan
-- SELECT u.Name, u.Email FROM User u
-- JOIN Subscription s ON u.User_ID = s.User_ID
-- JOIN Subscription_Plan sp ON s.Plan_ID = sp.Plan_ID
-- WHERE sp.Plan_Name = 'Premium' AND s.Status = 'Active';
