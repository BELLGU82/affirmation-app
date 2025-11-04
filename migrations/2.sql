
CREATE TABLE user_voices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  voice_type TEXT NOT NULL, -- 'recorded', 'uploaded'
  storage_url TEXT NOT NULL,
  original_filename TEXT,
  duration_seconds REAL,
  sample_text TEXT,
  is_active BOOLEAN DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_voices_user_id ON user_voices(user_id);
CREATE INDEX idx_user_voices_active ON user_voices(user_id, is_active);
