require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// ✅ Array untuk menyimpan data di memory sesuai ketentuan
let todosArray = [];

// Koneksi database untuk persistensi
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Inisialisasi array dari database saat startup
const initTodosArray = async () => {
  try {
    // Buat tabel jika belum ada
    await pool.query(`
      CREATE TABLE IF NOT EXISTS todos (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        priority VARCHAR(50) DEFAULT 'Medium',
        is_completed BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Load data dari database ke array
    const result = await pool.query("SELECT * FROM todos ORDER BY created_at DESC");
    todosArray = result.rows;
    console.log("Todos array initialized with database data");
  } catch (err) {
    console.error("Failed to initialize todos array:", err);
  }
};

// Jalankan inisialisasi
initTodosArray();

// Get all todos (dari array)
app.get("/todos", (req, res) => {
  try {
    res.json(todosArray);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch todos" });
  }
});

// Get todo by id (dari array)
app.get("/todos/:id", (req, res) => {
  try {
    const todo = todosArray.find(t => t.id === parseInt(req.params.id));
    if (!todo) {
      return res.status(404).json({ error: "Todo not found" });
    }
    res.json(todo);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch todo" });
  }
});

// Create new todo (simpan ke array dan database)
app.post("/todos", async (req, res) => {
  try {
    const { title, description, priority = "Medium" } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    // Simpan ke database
    const result = await pool.query(
      "INSERT INTO todos (title, description, priority) VALUES ($1, $2, $3) RETURNING *",
      [title, description, priority]
    );
    
    // Update array
    const newTodo = result.rows[0];
    todosArray.unshift(newTodo); // Add to beginning for DESC order

    res.status(201).json(newTodo);
  } catch (err) {
    res.status(500).json({ error: "Failed to create todo" });
  }
});

// Update todo (update array dan database)
app.put("/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, priority, is_completed } = req.body;

    // Update database
    const result = await pool.query(
      `UPDATE todos 
       SET title = $1, 
           description = $2, 
           priority = $3, 
           is_completed = $4,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5 
       RETURNING *`,
      [title, description, priority, is_completed, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Todo not found" });
    }

    // Update array
    const todoIndex = todosArray.findIndex(t => t.id === parseInt(id));
    if (todoIndex !== -1) {
      todosArray[todoIndex] = result.rows[0];
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to update todo" });
  }
});

// Toggle completion (update array dan database)
app.patch("/todos/:id/toggle", async (req, res) => {
  try {
    const { id } = req.params;

    // Update database
    const result = await pool.query(
      `UPDATE todos 
       SET is_completed = NOT is_completed,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Todo not found" });
    }

    // Update array
    const todoIndex = todosArray.findIndex(t => t.id === parseInt(id));
    if (todoIndex !== -1) {
      todosArray[todoIndex] = result.rows[0];
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to toggle todo status" });
  }
});

// Delete todo (hapus dari array dan database)
app.delete("/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Delete from database
    const result = await pool.query(
      "DELETE FROM todos WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Todo not found" });
    }

    // Delete from array
    todosArray = todosArray.filter(t => t.id !== parseInt(id));

    res.json({ message: "Todo deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete todo" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});