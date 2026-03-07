const express = require("express");
const cors = require("cors");
const pool = require("./db");
const multer = require("multer");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// serve uploaded files
app.use("/uploads", express.static("uploads"));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "video") {
      cb(null, "uploads/videos/");
    } else {
      cb(null, "uploads/thumbnails/");
    }
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

app.post(
  "/upload",
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  async (req, res) => {
    const { title, description, user_id } = req.body;
    const video_url = `/uploads/videos/${req.files["video"][0].filename}`;
    const thumbnail_url = `/uploads/thumbnails/${req.files["thumbnail"][0].filename}`;

    try {
      const result = await pool.query(
        "INSERT INTO videos (user_id, title, description, video_url, thumbnail_url) VALUES ($1, $2, $3, $4, $5) RETURNING id, title",
        [user_id, title, description, video_url, thumbnail_url],
      );
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

// create a new user
app.post("/users", async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username",
      [username, password],
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// upload videos
app.post("/videos", async (req, res) => {
  const { user_id, title, description, video_url, thumbnail_url } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO videos (user_id, title, description, video_url, thumbnail_url) VALUES ($1, $2, $3, $4, $5) RETURNING id, title",
      [user_id, title, description, video_url, thumbnail_url],
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// fetch all videos
app.get("/videos", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT videos.*, users.username FROM videos JOIN users ON videos.user_id = users.id",
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
