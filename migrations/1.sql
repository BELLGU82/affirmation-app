
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT,
  name TEXT,
  is_premium BOOLEAN DEFAULT 0,
  onboarding_completed BOOLEAN DEFAULT 0,
  voice_setup_completed BOOLEAN DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_preferences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  focus_areas TEXT, -- JSON array
  emotional_state TEXT,
  preferred_tone TEXT,
  language TEXT DEFAULT 'en',
  style TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE affirmations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  text TEXT NOT NULL,
  audio_url TEXT,
  background_music_url TEXT,
  is_favorite BOOLEAN DEFAULT 0,
  focus_area TEXT,
  emotional_state TEXT,
  tone TEXT,
  style TEXT,
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE mood_tracking (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  mood_before TEXT,
  mood_after TEXT,
  affirmation_id INTEGER,
  tracked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX idx_affirmations_user_id ON affirmations(user_id);
CREATE INDEX idx_affirmations_is_favorite ON affirmations(is_favorite);
CREATE INDEX idx_mood_tracking_user_id ON mood_tracking(user_id);
