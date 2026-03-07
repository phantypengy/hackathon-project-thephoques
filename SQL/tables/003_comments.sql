DROP TABLE IF EXISTS comments CASCADE;

CREATE TABLE comments (
    id          SERIAL PRIMARY KEY,
    video_id    INTEGER REFERENCES videos(id),
    user_id     INTEGER REFERENCES users(id),
    content     TEXT NOT NULL,
    created_at  TIMESTAMP DEFAULT NOW()
);