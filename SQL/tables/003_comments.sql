DROP TABLE IF EXISTS comments CASCADE;

CREATE TABLE comments (
    id         SERIAL PRIMARY KEY,
    video_id   INTEGER REFERENCES videos(id) ON DELETE CASCADE,
    user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
    content    TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);