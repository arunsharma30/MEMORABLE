# Memorable — OTT Subscription Management System

A full-stack **Database Management System (DBMS) Mini Project** built as a Netflix-inspired OTT platform. Users can browse content, manage subscriptions, track watch history, and view payment records — all powered by a **MySQL** backend and a **Node.js/Express** REST API.

---

## Project Overview

Memorable is a web-based OTT (Over-The-Top) streaming platform management system that demonstrates core DBMS concepts including:
- Relational database design with ER diagrams
- Foreign key constraints and cascading deletes
- JOIN queries across multiple tables
- REST API integration with a live MySQL database

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript (Vanilla) |
| Backend | Node.js, Express.js |
| Database | MySQL 9.x |
| Fonts | Google Fonts (Bebas Neue, DM Sans) |
| API | REST API with JSON responses |

---

## Project Structure

```
memorable/
│
├── frontend/
│   ├── index.html          # Login & Register page
│   ├── browse.html         # Browse content library
│   ├── subscription.html   # Manage subscription plans
│   ├── history.html        # Watch history
│   └── payments.html       # Payment records
│
├── backend/
│   ├── server.js           # Express server & all API routes
│   ├── schema.sql          # Full database schema + sample data
│   └── package.json        # Node.js dependencies
│
└── README.md
```

---

## Database Schema

The database `netflixdb` contains **6 tables**:

```
Subscription_Plan ◄──── Subscription ────► User
                              │                │
                              ▼                ▼
                           Payment       Watch_History
                                              │
                                              ▼
                                           Content
```

| Table | Description |
|---|---|
| `User` | Stores registered user details |
| `Content` | Movies and series available on the platform |
| `Subscription_Plan` | Available plans (Basic, Standard, Premium) |
| `Subscription` | Links users to their chosen plans |
| `Payment` | Payment records for each subscription |
| `Watch_History` | Tracks which user watched which content |

---

## Setup & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or above)
- [MySQL](https://dev.mysql.com/downloads/) (v8 or above)

### Step 1 — Clone the Repository
```bash
git clone https://github.com/your-username/memorable.git
cd memorable
```

### Step 2 — Setup the Database
Open your MySQL client and run:
```sql
SOURCE schema.sql;
```
This will create the `netflixdb` database and insert all sample data automatically.

### Step 3 — Configure Database Credentials
Open `server.js` and update your MySQL credentials:
```javascript
const db = mysql.createConnection({
  host    : 'localhost',
  user    : 'root',         // your MySQL username
  password: 'yourpassword', // your MySQL password
  database: 'netflixdb'
});
```

### Step 4 — Install Dependencies
```bash
npm install
```

### Step 5 — Start the Server
```bash
node server.js
```

### Step 6 — Open the App
Open your browser and go to:
```
http://localhost:3000/index.html
```

---

## Demo Login

| Field | Value |
|---|---|
| Email | demo@netflix.com |
| Password | demo123 |

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/login` | User login |
| POST | `/api/register` | User registration |
| GET | `/api/content` | Get all content (with filters) |
| GET | `/api/plans` | Get all subscription plans |
| GET | `/api/subscription/:userId` | Get user's current subscription |
| POST | `/api/subscribe` | Subscribe to a plan |
| GET | `/api/history/:userId` | Get watch history |
| POST | `/api/watch` | Add to watch history |
| GET | `/api/payments/:userId` | Get payment history |
| GET | `/api/stats` | Get platform statistics |

---

## Key SQL Queries

**1. All active subscribers with their plan:**
```sql
SELECT u.Name, u.Email, sp.Plan_Name, sp.Price, s.Start_Date, s.End_Date
FROM User u
JOIN Subscription s ON u.User_ID = s.User_ID
JOIN Subscription_Plan sp ON s.Plan_ID = sp.Plan_ID
WHERE s.Status = 'Active';
```

**2. Which users watched a specific title:**
```sql
SELECT u.Name, u.Email, wh.Watch_Date
FROM Watch_History wh
JOIN User u ON wh.User_ID = u.User_ID
JOIN Content c ON wh.Content_ID = c.Content_ID
WHERE c.Title = 'Stranger Things';
```

**3. Most watched content:**
```sql
SELECT c.Title, COUNT(wh.User_ID) AS Total_Viewers
FROM Content c
LEFT JOIN Watch_History wh ON c.Content_ID = wh.Content_ID
GROUP BY c.Content_ID
ORDER BY Total_Viewers DESC;
```

**4. Total revenue collected:**
```sql
SELECT SUM(Amount) AS Total_Revenue
FROM Payment
WHERE Payment_Status = 'Completed';
```

---

## Features

-  User Authentication (Login & Register)
-  Browse content with search, genre & language filters
-  Subscription plan management (Basic / Standard / Premium)
-  Watch history tracking with stats
-  Payment history with transaction details
-  Responsive sidebar navigation
-  Full dark theme UI

---

## Sample Users (Pre-loaded)

| Name | Email | Password |
|---|---|---|
| Demo User | demo@netflix.com | demo123 |
| Arun Sharma | arunsharma@gmail.com | (registered via app) |

---

## Subscription Plans

| Plan | Price | Quality | Screens |
|---|---|---|---|
| Basic | ₹149/year | SD | 1 |
| Standard | ₹499/year | HD | 2 |
| Premium | ₹799/year | UHD | 4 |

---

## Academic Context

This project was developed as a **DBMS Mini Project** to demonstrate:
- ER Diagram to Relational Schema conversion
- Normalization (1NF, 2NF, 3NF)
- DDL commands (CREATE, ALTER, DROP)
- DML commands (INSERT, UPDATE, DELETE, SELECT)
- JOIN operations (INNER JOIN, LEFT JOIN)
- Aggregate functions (COUNT, SUM, AVG)
- Foreign Key Constraints with CASCADE

---

## License

This project is built for educational purposes as part of a DBMS course mini project.

---

> Made with ❤️ | DBMS Mini Project
