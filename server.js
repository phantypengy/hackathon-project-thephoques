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
    origin: true,
    credentials: true,
  }),
);

app.use(express.json());

app.use(
  session({
    secret: "sealio_secret",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 },
  }),
);

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

const allowedVideoTypes = ["video/mp4", "video/webm", "video/ogg"];
const allowedImageTypes = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "video") {
      if (!allowedVideoTypes.includes(file.mimetype)) {
        return cb(new Error("Only mp4, webm and ogg videos are allowed"));
      }
    }

    if (file.fieldname === "thumbnail") {
      if (!allowedImageTypes.includes(file.mimetype)) {
        return cb(new Error("Only jpg, png, gif and webp images are allowed"));
      }
    }

    cb(null, true);
  },
});

// upload video
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
    const user_id = req.session.user.id;
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

    const result = await pool.query(
      "INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username",
      [username, hash],
    );

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
  req.session.destroy((err) => {
    res.clearCookie("connect.sid");
    res.json({ message: "Logged out" });
  });
});

// check who is logged in
app.get("/me", (req, res) => {
  if (req.session.user) {
    res.json(req.session.user);
  } else {
    res.status(401).json({ error: "Not logged in." });
  }
});

// fetch all videos
app.get("/videos", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT videos.*, users.username FROM videos JOIN users ON videos.user_id = users.id ORDER BY videos.created_at DESC",
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// fetch one video
app.get("/videos/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT videos.*, users.username FROM videos JOIN users ON videos.user_id = users.id WHERE videos.id = $1",
      [req.params.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Video not found." });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// get videos uploaded by logged-in user
app.get("/my-videos", async (req, res) => {
  if (!req.session.user) {
    return res
      .status(401)
      .json({ error: "You must be logged in to view your videos." });
  }

  try {
    const result = await pool.query(
      "SELECT videos.*, users.username FROM videos JOIN users ON videos.user_id = users.id WHERE videos.user_id = $1 ORDER BY videos.created_at DESC",
      [req.session.user.id],
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// delete a video uploaded by the logged-in user
app.delete("/videos/:id", async (req, res) => {
  if (!req.session.user) {
    return res
      .status(401)
      .json({ error: "You must be logged in to delete videos." });
  }

  try {
    const videoCheck = await pool.query(
      "SELECT * FROM videos WHERE id = $1 AND user_id = $2",
      [req.params.id, req.session.user.id],
    );

    if (videoCheck.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Video not found or you do not own it." });
    }

    await pool.query("DELETE FROM comments WHERE video_id = $1", [
      req.params.id,
    ]);
    await pool.query("DELETE FROM watch_later WHERE video_id = $1", [
      req.params.id,
    ]);
    await pool.query("DELETE FROM videos WHERE id = $1 AND user_id = $2", [
      req.params.id,
      req.session.user.id,
    ]);

    res.json({ message: "Video deleted successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// fetch comments for a specific video
app.get("/videos/:id/comments", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT comments.*, users.username FROM comments JOIN users ON comments.user_id = users.id WHERE comments.video_id = $1 ORDER BY comments.created_at DESC",
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

// add video to watch later
app.post("/watch-later/:id", async (req, res) => {
  if (!req.session.user) {
    return res
      .status(401)
      .json({ error: "You must be logged in to save videos." });
  }

  try {
    const result = await pool.query(
      "INSERT INTO watch_later (user_id, video_id) VALUES ($1, $2) RETURNING *",
      [req.session.user.id, req.params.id],
    );

    res.json({
      message: "Video saved to Watch Later",
      item: result.rows[0],
    });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(400).json({ error: "Video already in Watch Later" });
    }

    res.status(500).json({ error: err.message });
  }
});

// get all watch later videos for the logged-in user
app.get("/watch-later", async (req, res) => {
  if (!req.session.user) {
    return res
      .status(401)
      .json({ error: "You must be logged in to view saved videos." });
  }

  try {
    const result = await pool.query(
      `SELECT
         watch_later.video_id,
         watch_later.created_at AS saved_at,
         videos.title,
         videos.description,
         videos.video_url,
         videos.thumbnail_url,
         users.username
       FROM watch_later
       JOIN videos ON watch_later.video_id = videos.id
       JOIN users ON videos.user_id = users.id
       WHERE watch_later.user_id = $1
       ORDER BY watch_later.created_at DESC`,
      [req.session.user.id],
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// check if a specific video is already in watch later
app.get("/watch-later/:id", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ saved: false });
  }

  try {
    const result = await pool.query(
      "SELECT id FROM watch_later WHERE user_id = $1 AND video_id = $2",
      [req.session.user.id, req.params.id],
    );

    res.json({ saved: result.rows.length > 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// remove a video from watch later
app.delete("/watch-later/:id", async (req, res) => {
  if (!req.session.user) {
    return res
      .status(401)
      .json({ error: "You must be logged in to remove saved videos." });
  }

  try {
    const result = await pool.query(
      "DELETE FROM watch_later WHERE user_id = $1 AND video_id = $2 RETURNING *",
      [req.session.user.id, req.params.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Saved video not found." });
    }

    res.json({ message: "Video removed from Watch Later." });
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
      "SELECT videos.*, users.username FROM videos JOIN users ON videos.user_id = users.id WHERE LOWER(videos.title) LIKE LOWER($1) ORDER BY videos.created_at DESC",
      [param],
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});

// likes / dislikes
app.post("/videos/:id/like", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "You must be logged in" });
  }
  const { type } = req.body;
  try {
    const existing = await pool.query(
      "SELECT type FROM likes WHERE user_id = $1 AND video_id = $2",
      [req.session.user.id, req.params.id],
    );

    if (existing.rows.length > 0 && existing.rows[0].type === type) {
      // Same button clicked again - remove the vote
      await pool.query(
        "DELETE FROM likes WHERE user_id = $1 AND video_id = $2",
        [req.session.user.id, req.params.id],
      );
    } else {
      // New vote or switching vote
      await pool.query(
        "INSERT INTO likes (user_id, video_id, type) VALUES ($1, $2, $3) ON CONFLICT (user_id, video_id) DO UPDATE SET type = $3",
        [req.session.user.id, req.params.id, type],
      );
    }

    const counts = await pool.query(
      "SELECT type, COUNT(*) FROM likes WHERE video_id = $1 GROUP BY type",
      [req.params.id],
    );
    res.json(counts.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// fetch likes + dislikes for a video
app.get("/videos/:id/likes", async (req, res) => {
  try {
    const counts = await pool.query(
      "SELECT type, COUNT(*) FROM likes WHERE video_id = $1 GROUP BY type",
      [req.params.id],
    );
    let userVote = null;
    if (req.session.user) {
      const vote = await pool.query(
        "SELECT type FROM likes WHERE user_id = $1 AND video_id = $2",
        [req.session.user.id, req.params.id],
      );
      if (vote.rows.length > 0) userVote = vote.rows[0].type;
    }
    res.json({ counts: counts.rows, userVote });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
