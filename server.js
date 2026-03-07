const express = require("express");
const cors = require("cors");
const pool = require("./db");
const multer = require("multer");
const path = require("path");
const bcrypt = require("bcrypt");
const session = require("express-session");

const app = express();

app.use(express.static(path.join(__dirname, "HTML-files")));

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);

app.use(express.json());

app.use(
  session({
    secret: "sealio_secret",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }, // 1 day
  }),
);

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
  (req, res, next) => {
    if (!req.session.user) {
      return res.status(401).json({ error: "You must be logged in to upload" });
    }
    next();
  },
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  async (req, res) => {
    const { title, description } = req.body;
    const user_id = req.session.user.id; // comes from session now, not hardcoded!
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

// signup
app.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  console.log("Signup attempt:", username);
  try {
    if (!username || !password) {
      return res.status(400).json({ error: "Please fill in all fields" });
    }
    if (username.length > 20) {
      return res
        .status(400)
        .json({ error: "Username must be 20 characters or less" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters" });
    }
    const hash = await bcrypt.hash(password, 10);
    console.log("Hash generated");
    const result = await pool.query(
      "INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username",
      [username, hash],
    );
    console.log("User created:", result.rows[0]);
    req.session.user = result.rows[0];
    res.json(result.rows[0]);
  } catch (err) {
    console.log("Signup error:", err.message);
    if (err.code === "23505") {
      return res.status(400).json({ error: "Username already taken" });
    }
    res.status(500).json({ error: "Something went wrong, please try again" });
  }
});

// login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid username or password" });
    }
    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: "Invalid username or password" });
    }
    req.session.user = { id: user.id, username: user.username };
    res.json({ id: user.id, username: user.username });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// logout
app.post("/logout", (req, res) => {
  req.session.destroy();
  res.json({ message: "Logged out." });
});

// check who's logged in
app.get("/me", (req, res) => {
  if (req.session.user) {
    res.json(req.session.user);
  } else {
    res.status(401).json({ error: "Not logged in." });
  }
});

app.get("/videos/:id", async (req, res) => {
  const result = await pool.query(
    "SELECT videos.*, users.username FROM videos JOIN users ON videos.user_id = users.id WHERE videos.id = $1",
    [req.params.id],
  );
  res.json(result.rows[0]);
});

// fetch comments for a specific video
app.get("/videos/:id/comments", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT comments.*, users,username FROM comments JOIN users ON comments.user_id = users.id WHERE comments.video_id = $1 ORDER BY comments.created_at DESC",
      [req.params.id],
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// post a comment
app.post("/videos/:id/comments", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "You must be logged in to comment." });
  }
  const { content } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO comments (video_id, user_id, content) VALUES ($1, $2, $3) RETURNING *",
      [req.params.id, req.session.user.id, content],
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// search
app.get("/search", async (req, res) => {
  const { q } = req.query;
  const param = `%${q}%`;
  try {
    const result = await pool.query(
      "SELECT * FROM videos WHERE LOWER(title) LIKE LOWER($1)",
      [param],
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
