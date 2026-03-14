DROP TABLE IF EXISTS likes CASCADE;

CREATE TABLE likes (
    id         SERIAL PRIMARY KEY,
    user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
    video_id   INTEGER REFERENCES videos(id) ON DELETE CASCADE,
    type       VARCHAR(10) NOT NULL CHECK (type IN ('like', 'dislike')),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, video_id)
);