-- Add new fields to users table
ALTER TABLE users ADD COLUMN age INTEGER;
ALTER TABLE users ADD COLUMN gender TEXT;
ALTER TABLE users ADD COLUMN profession TEXT;

-- Add selected_voice and interests to user_preferences
ALTER TABLE user_preferences ADD COLUMN selected_voice TEXT;
ALTER TABLE user_preferences ADD COLUMN interests TEXT; -- JSON array

