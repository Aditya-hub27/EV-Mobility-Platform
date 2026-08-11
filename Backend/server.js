const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
const PORT = 5000;

// ===============================
// Middleware
// ===============================

app.use(cors());
app.use(express.json());

// ===============================
// MySQL Connection
// ===============================

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "aditya_270905",
  database: "ev_mobility",
});

// ===============================
// Connect to MySQL
// ===============================

db.connect((err) => {
  if (err) {
    console.error("MySQL connection failed:", err.message);
    return;
  }

  console.log("MySQL connected successfully!");
});

// ===============================
// Test Route
// ===============================

app.get("/", (req, res) => {
  res.json({
    message: "EV Mobility Backend is running!",
  });
});
app.get("/api/test", (req, res) => {
  res.json({
    message: "API routes are working!"
  });
});

// ===============================
// API TEST ROUTE
// ===============================

app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "API is working correctly!",
  });
});

// ===============================
// GET ALL CHARGING STATIONS
// ===============================

app.get("/api/charging-stations", (req, res) => {
  const sql = `
    SELECT
      id,
      name,
      location,
      latitude,
      longitude,
      charger_type,
      power_kw,
      status,
      distance_km,
      created_at
    FROM charging_stations
    ORDER BY id ASC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error(
        "Error fetching charging stations:",
        err.message
      );

      return res.status(500).json({
        success: false,
        message: "Failed to fetch charging stations",
        error: err.message,
      });
    }

    res.status(200).json({
      success: true,
      count: results.length,
      stations: results,
    });
  });
});

// ===============================
// GET CHARGING STATION BY ID
// ===============================

app.get("/api/charging-stations/:id", (req, res) => {
  const stationId = req.params.id;

  const sql = `
    SELECT
      id,
      name,
      location,
      latitude,
      longitude,
      charger_type,
      power_kw,
      status,
      distance_km,
      created_at
    FROM charging_stations
    WHERE id = ?
  `;

  db.query(sql, [stationId], (err, results) => {
    if (err) {
      console.error(
        "Error fetching charging station:",
        err.message
      );

      return res.status(500).json({
        success: false,
        message: "Failed to fetch charging station",
        error: err.message,
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Charging station not found",
      });
    }

    res.status(200).json({
      success: true,
      station: results[0],
    });
  });
});

// ===============================
// START SERVER
// ===============================

app.listen(PORT, () => {
  console.log(
    `Backend server running on http://localhost:${PORT}`
  );
});