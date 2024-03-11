const express = require("express");
require("dotenv").config();
const connection = require("./db");

const app = express();
app.use(express.json());

// Create users table if it doesn't exist
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    firstName VARCHAR(255),
    age INT,
    city VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(255)
  );
`;
connection.query(createTableQuery, (err) => {
  if (err) {
    console.error("MySQL table creation error:", err);
  } else {
    console.log("Table created or already exists");
  }
});

app.get("/", (req, res) => {
  res.send({ msg: "hello from ankush" });
});

// Route to add a new user
app.post("/adduser", (req, res) => {
  const { firstName, age, city, email, phone } = req.body;

  if (!firstName || !age || !city || !email || !phone) {
    return res.status(400).json({ error: "All fields are required." });
  }

  const query =
    "INSERT INTO users (firstName, age, city, email, phone) VALUES (?, ?, ?, ?, ?)";

  connection.query(
    query,
    [firstName, age, city, email, phone],
    (err, results) => {
      if (err) {
        console.error("MySQL query error:", err);
        res.status(500).send("Internal Server Error");
      } else {
        res.json({
          message: "User added successfully",
          userId: results.insertId,
        });
      }
    }
  );
});

// Route to get all users
app.get("/get-data", (req, res) => {
  const query = "SELECT * FROM users";

  connection.query(query, (err, results) => {
    if (err) {
      console.error("MySQL query error:", err);
      res.status(500).send("Internal Server Error");
    } else {
      res.json(results);
    }
  });
});

// delete

app.delete("/deleteuser/:id", (req, res) => {
  const userId = req.params.id;

  console.log("userId", userId);
  if (!userId) {
    return res.status(400).json({ error: "User ID is required." });
  }
  const deleteQuery = "DELETE FROM users WHERE id = ?";

  connection.query(deleteQuery, [userId], (err, results) => {
    if (err) {
      console.error("MySQL query error:", err);
      res.status(500).send("Internal Server Error");
    } else {
      if (results.affectedRows > 0) {
        res.json({ message: "User deleted successfully" });
      } else {
        res.status(404).json({ error: "User not found" });
      }
    }
  });
});

app.listen(process.env.PORT, async () => {
  try {
    await connection.connect();
    console.log(`server is running on port ${process.env.PORT}`);
    console.log("Connected to MySQL database");
  } catch (err) {
    console.log("something went wrong");
    console.error("MySQL connection error:", err);
  }
});
