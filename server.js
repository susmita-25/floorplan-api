const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors({ origin: "http://localhost:3000", methods: "GET,POST,PUT,DELETE" }));
app.use(express.json());

// PostgreSQL Connection
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "floorplan",
  password: "root",
  port: 5432, // Default PostgreSQL port
});

pool.connect()
  .then(() => console.log("✅ PostgreSQL Connected"))
  .catch(err => {
    console.error("❌ PostgreSQL Connection Error:", err);
    process.exit(1);
  });

// 🚀 API Routes

// Get all rooms
app.get('/api/floorplan', async (req, res) => {
  try {
    const result = [
      { name: "Living Room", width: 15, height: 10, dimension: "15X10" },
      {
        name: "Bedroom", width: 8, height: 8, dimension: "8X8",
        accessories: {
          window: [{ name: "Windows", width: 2, height: 2, position: "top-right" },
          { name: "Windows", width: 2, height: 2, position: "bottom-right" },
          { name: "Windows", width: 2, height: 2, position: "top-center" },
         
          ],
          // door: [{ name: "Door", width: 2, height: 2 ,position:"left-center"}],
        }
      },
      {
        name: "Kitchen", width: 6, height: 6, dimension: "6X6",
        accessories: {
          window: [{ name: "Windows", width: 2, height: 2, position: "top-left" },
          { name: "Windows", width: 2, height: 2, position: "left-center" }
          ],
          door: [{ name: "Door", width: 2, height: 2, position: "bottom-left" }],
        }
      },
      { name: "Bath", width: 5, height: 3, dimension: "5X3" },
    ];
    res.json(result);
  } catch (err) {
    console.error("❌ Error fetching rooms:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Add a new room
app.post("/api/floorplan", async (req, res) => {
  try {
    const { name, width, height, x, y } = req.body;
    if (!name || width == null || height == null || x == null || y == null) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const result = await pool.query(
      "INSERT INTO rooms (name, width, height, x, y) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, width, height, x, y]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("❌ Failed to add room:", error);
    res.status(500).json({ error: "Failed to add room" });
  }
});

// Update room position/size
app.put("/api/floorplan/:id", async (req, res) => {
  try {
    const { name, width, height, x, y } = req.body;
    const { id } = req.params;

    const result = await pool.query(
      "UPDATE rooms SET name=$1, width=$2, height=$3, x=$4, y=$5 WHERE id=$6 RETURNING *",
      [name, width, height, x, y, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Room not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("❌ Failed to update room:", error);
    res.status(500).json({ error: "Failed to update room" });
  }
});

// Delete a room
app.delete("/api/floorplan/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM rooms WHERE id=$1 RETURNING *", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Room not found" });
    }

    res.json({ message: "✅ Room deleted successfully" });
  } catch (error) {
    console.error("❌ Failed to delete room:", error);
    res.status(500).json({ error: "Failed to delete room" });
  }
});

// Start Server
const PORT = 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));

