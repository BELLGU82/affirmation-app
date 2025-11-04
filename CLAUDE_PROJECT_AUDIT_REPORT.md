# דוח מצב טכני מלא - Mocha Affirm

## AI Positive Affirmations App

**תאריך:** 2025-01-26  
**מצב:** פיתוח פעיל  
**גרסה:** 0.0.0

---

## 1. Executive Summary

### 1.1 סיכום כללי

הפרויקט "Mocha Affirm" הוא אפליקציית אפרמציות מבוססת AI, בנויה על React + Vite עם backend ב-Hono על Cloudflare Workers. האפליקציה מאפשרת למשתמשים ליצור אפרמציות מותאמות אישית, להאזין להן עם קול מותאם, ולנהל את המועדפים.

### 1.2 סטטיסטיקות

- **Routes (Frontend):** 13 routes
- **Pages:** 13 pages
- **Components:** 9 components
- **Hooks:** 7 custom hooks
- **API Endpoints:** 27 endpoints
- **Database Tables:** 4 tables
- **Migrations:** 3 migrations
- **Storage Paths:** 4 main paths (affirmations, user-voices, background-music, custom)

### 1.3 מצב פיתוח

**עובד:**

- ✅ Onboarding flow מלא (Splash → Tutorial → Signup → Questions → Voice Setup)
- ✅ יצירת אפרמציות עם AI (OpenAI GPT-4o-mini)
- ✅ יצירת אודיו אוטומטית (Google Cloud TTS)
- ✅ נגן אודיו עם background music
- ✅ ניהול מועדפים
- ✅ מעקב מצב רוח
- ✅ הגדרות קול ומוזיקה
- ✅ העלאת מוזיקה מותאמת אישית

**חלקי:**

- ⚠️ Authentication - משתמש mock (`user_123`)
- ⚠️ Signup - TODO comment, לא שומר למסד נתונים
- ⚠️ Custom voices - לא מיושמים במלואם (fallback ל-`sarah`)

**שבור/בעיות:**

- ❌ אין שגיאות linting
- ❌ אין שגיאות TypeScript compilation
- ⚠️ פוטנציאלית: queries שמפנים לעמודות שלא קיימות ב-DB ישן (אבל migrations קיימים)

---

## 2. Project Map

### 2.1 מבנה תיקיות

```
src/
├── react-app/          # Frontend React Application
│   ├── App.tsx         # Router setup (13 routes)
│   ├── main.tsx        # React entry point
│   ├── components/     # 9 reusable UI components
│   ├── hooks/          # 7 custom React hooks
│   └── pages/          # 13 route pages
├── shared/
│   └── types.ts        # Zod schemas & TypeScript types
└── worker/
    └── index.ts        # Hono API server (27 endpoints)
```

### 2.2 Routes & Pages

| Route          | Page Component | Purpose                                  | Status |
| -------------- | -------------- | ---------------------------------------- | ------ |
| `/`            | Splash         | Splash screen, auto-navigate to tutorial | ✅     |
| `/tutorial/1`  | Tutorial1      | Tutorial screen 1                        | ✅     |
| `/tutorial/2`  | Tutorial2      | Tutorial screen 2                        | ✅     |
| `/tutorial/3`  | Tutorial3      | Tutorial screen 3                        | ✅     |
| `/signup`      | Signup         | User signup (TODO: not saving to DB)     | ⚠️     |
| `/questions/1` | Questions1     | Focus areas selection                    | ✅     |
| `/questions/2` | Questions2     | Emotional state                          | ✅     |
| `/questions/3` | Questions3     | Preferred tone                           | ✅     |
| `/questions/4` | Questions4     | Style & interests                        | ✅     |
| `/voice-setup` | VoiceSetup     | Voice selection & recording              | ✅     |
| `/home`        | Home           | Main app - generate affirmations         | ✅     |
| `/player`      | Player         | Audio player with controls               | ✅     |
| `/favorites`   | Favorites      | Favorites list with search/filter        | ✅     |
| `/settings`    | Settings       | Settings, profile, preferences           | ✅     |

### 2.3 Components

| Component           | File                      | Purpose                                              | Props                             |
| ------------------- | ------------------------- | ---------------------------------------------------- | --------------------------------- |
| BottomNavigation    | `BottomNavigation.tsx`    | Fixed bottom nav (Home, Player, Favorites, Settings) | -                                 |
| Button              | `Button.tsx`              | Reusable button with variants                        | variant, size, loading, disabled  |
| GeneratingModal     | `GeneratingModal.tsx`     | Loading modal during affirmation generation          | isOpen, onClose                   |
| GradientBackground  | `GradientBackground.tsx`  | Gradient background wrapper                          | children                          |
| MoodTrackingHistory | `MoodTrackingHistory.tsx` | History of mood tracking entries                     | userId                            |
| MoodTrackingModal   | `MoodTrackingModal.tsx`   | Modal for mood selection                             | isOpen, onClose, onSubmit, type   |
| NotificationsModal  | `NotificationsModal.tsx`  | Notification settings modal                          | isOpen, onClose, settings, onSave |
| PaywallModal        | `PaywallModal.tsx`        | Premium upgrade modal                                | isOpen, onClose                   |
| VoiceRecorder       | `VoiceRecorder.tsx`       | Voice recording component                            | onVoiceRecorded, onCancel         |

### 2.4 Hooks

| Hook             | File                  | Purpose                                             | Returns                                                                    |
| ---------------- | --------------------- | --------------------------------------------------- | -------------------------------------------------------------------------- |
| useAffirmations  | `useAffirmations.ts`  | Manage affirmations state & operations              | affirmations, generateAffirmations, loadAffirmations, toggleFavorite, etc. |
| useProfile       | `useProfile.ts`       | Manage user profile & preferences                   | profile, preferences, updateProfile, updatePreferences                     |
| useFavorites     | `useFavorites.ts`     | Manage favorites list                               | favorites, toggleFavorite, playAffirmation, searchQuery, setSearchQuery    |
| useAudioPlayer   | `useAudioPlayer.ts`   | Audio playback control                              | isPlaying, currentTime, duration, loadAudio, togglePlayback, seek          |
| useAudioSettings | `useAudioSettings.ts` | Audio settings (volume, autoplay, background music) | settings, updateAutoplay, updateBackgroundMusic, updateMasterVolume        |
| useVoiceSamples  | `useVoiceSamples.ts`  | Voice sample preview playback                       | playingVoice, playVoiceSample, stopPlayback                                |
| useMoodTracking  | `useMoodTracking.ts`  | Mood tracking operations                            | saveMoodTracking, getMoodHistory                                           |

---

## 3. Functions Map

### 3.1 Frontend Functions

| Function               | File                 | Purpose                                    | Status |
| ---------------------- | -------------------- | ------------------------------------------ | ------ |
| `generateAffirmations` | `useAffirmations.ts` | Generate 5 affirmations via AI             | ✅     |
| `loadAffirmations`     | `useAffirmations.ts` | Load user's affirmations from API          | ✅     |
| `toggleFavorite`       | `useAffirmations.ts` | Toggle favorite status                     | ✅     |
| `updateAffirmation`    | `useAffirmations.ts` | Update affirmation text & regenerate audio | ✅     |
| `deleteAffirmation`    | `useAffirmations.ts` | Delete affirmation & audio file            | ✅     |
| `loadProfile`          | `useProfile.ts`      | Load user profile & preferences            | ✅     |
| `updateProfile`        | `useProfile.ts`      | Update user profile                        | ✅     |
| `updatePreferences`    | `useProfile.ts`      | Update user preferences                    | ✅     |
| `playAffirmation`      | `useFavorites.ts`    | Navigate to player with affirmation        | ✅     |
| `loadAudio`            | `useAudioPlayer.ts`  | Load audio file for playback               | ✅     |
| `togglePlayback`       | `useAudioPlayer.ts`  | Play/pause audio                           | ✅     |
| `saveMoodTracking`     | `useMoodTracking.ts` | Save mood before/after                     | ✅     |
| `getMoodHistory`       | `useMoodTracking.ts` | Get mood tracking history                  | ✅     |

### 3.2 Backend Functions

| Function                | File              | Purpose                                           | Status |
| ----------------------- | ----------------- | ------------------------------------------------- | ------ |
| `generateAffirmations`  | `worker/index.ts` | Generate affirmations via OpenAI                  | ✅     |
| `generateSpeech`        | `worker/index.ts` | Generate audio via Google TTS                     | ✅     |
| `selectBackgroundMusic` | `worker/index.ts` | Auto-select background music based on preferences | ✅     |

---

## 4. Events & State

### 4.1 Events

**Frontend Events:**

- `onClick` - Navigation, button clicks, toggle favorites
- `onChange` - Form inputs, search, filters
- `onSubmit` - Form submissions
- `onClose` - Modal close
- `onVoiceRecorded` - Voice recording complete
- `onTrackEnd` - Audio playback end (auto-advance)

**State Management:**

- **Local State:** `useState` hooks בכל component
- **API State:** Hooks מנהלים state עם API calls
- **localStorage:**
  - `affirm-audio-settings` - Audio settings
  - `notification-settings` - Notification preferences
  - `currentAffirmation` - Temporary storage for player navigation
  - `focus_areas`, `selected_voice`, etc. (onboarding flow)

**No Global State Management:**

- אין Zustand/Redux/Context API
- כל state ניהול מקומי ב-hooks

---

## 5. Types & Interfaces

### 5.1 TypeScript Types (`src/shared/types.ts`)

| Type              | Fields                                                                                                                                                | Notes                             |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| `UserPreferences` | focus_areas, emotional_state, preferred_tone, language, style, selected_voice?, interests?                                                            | ✅ Matches DB                     |
| `Affirmation`     | id, user_id, text, audio_url?, background_music_url?, is_favorite, focus_area?, emotional_state?, tone?, style?, generated_at, created_at, updated_at | ✅ Matches DB                     |
| `MoodTracking`    | id, user_id, mood_before, mood_after?, affirmation_id?, tracked_at, created_at, updated_at                                                            | ✅ Matches DB                     |
| `User`            | id, email?, name?, age?, gender?, profession?, is_premium, onboarding_completed, voice_setup_completed, created_at, updated_at                        | ✅ Matches DB (after migration 3) |

### 5.2 Database Schema Comparison

#### 5.2.1 `users` Table

| Column                | Type                | In Types? | In Migration? | Notes                |
| --------------------- | ------------------- | --------- | ------------- | -------------------- |
| id                    | INTEGER PRIMARY KEY | ✅        | ✅            | Auto-increment       |
| email                 | TEXT                | ✅        | ✅            | Optional             |
| name                  | TEXT                | ✅        | ✅            | Optional             |
| age                   | INTEGER             | ✅        | ✅            | Added in migration 3 |
| gender                | TEXT                | ✅        | ✅            | Added in migration 3 |
| profession            | TEXT                | ✅        | ✅            | Added in migration 3 |
| is_premium            | BOOLEAN             | ✅        | ✅            | Default 0            |
| onboarding_completed  | BOOLEAN             | ✅        | ✅            | Default 0            |
| voice_setup_completed | BOOLEAN             | ✅        | ✅            | Default 0            |
| created_at            | TIMESTAMP           | ✅        | ✅            | Auto                 |
| updated_at            | TIMESTAMP           | ✅        | ✅            | Auto                 |

**Status:** ✅ Perfect match

#### 5.2.2 `user_preferences` Table

| Column               | Type                | In Types? | In Migration? | Notes                                  |
| -------------------- | ------------------- | --------- | ------------- | -------------------------------------- |
| id                   | INTEGER PRIMARY KEY | N/A       | ✅            | Auto-increment                         |
| user_id              | TEXT NOT NULL       | ✅        | ✅            | Required                               |
| focus_areas          | TEXT (JSON)         | ✅        | ✅            | JSON array                             |
| emotional_state      | TEXT                | ✅        | ✅            | Required                               |
| preferred_tone       | TEXT                | ✅        | ✅            | Required                               |
| language             | TEXT                | ✅        | ✅            | Default 'en'                           |
| style                | TEXT                | ✅        | ✅            | Required                               |
| selected_voice       | TEXT                | ✅        | ✅            | Added in migration 3                   |
| interests            | TEXT (JSON)         | ✅        | ✅            | Added in migration 3                   |
| background_music_url | TEXT                | ❌        | ✅            | Added in migration 3, **NOT in types** |
| created_at           | TIMESTAMP           | N/A       | ✅            | Auto                                   |
| updated_at           | TIMESTAMP           | N/A       | ✅            | Auto                                   |

**Status:** ⚠️ **Mismatch:** `background_music_url` exists in DB but not in TypeScript types

#### 5.2.3 `affirmations` Table

| Column               | Type                | In Types? | In Migration? | Notes          |
| -------------------- | ------------------- | --------- | ------------- | -------------- |
| id                   | INTEGER PRIMARY KEY | ✅        | ✅            | Auto-increment |
| user_id              | TEXT NOT NULL       | ✅        | ✅            | Required       |
| text                 | TEXT NOT NULL       | ✅        | ✅            | Required       |
| audio_url            | TEXT                | ✅        | ✅            | Optional       |
| background_music_url | TEXT                | ✅        | ✅            | Optional       |
| is_favorite          | BOOLEAN             | ✅        | ✅            | Default 0      |
| focus_area           | TEXT                | ✅        | ✅            | Optional       |
| emotional_state      | TEXT                | ✅        | ✅            | Optional       |
| tone                 | TEXT                | ✅        | ✅            | Optional       |
| style                | TEXT                | ✅        | ✅            | Optional       |
| generated_at         | TIMESTAMP           | ✅        | ✅            | Auto           |
| created_at           | TIMESTAMP           | ✅        | ✅            | Auto           |
| updated_at           | TIMESTAMP           | ✅        | ✅            | Auto           |

**Status:** ✅ Perfect match

#### 5.2.4 `user_voices` Table

| Column            | Type                | In Types? | In Migration? | Notes                    |
| ----------------- | ------------------- | --------- | ------------- | ------------------------ |
| id                | INTEGER PRIMARY KEY | N/A       | ✅            | Auto-increment           |
| user_id           | TEXT NOT NULL       | N/A       | ✅            | Required                 |
| voice_type        | TEXT NOT NULL       | N/A       | ✅            | 'recorded' or 'uploaded' |
| storage_url       | TEXT NOT NULL       | N/A       | ✅            | Required                 |
| original_filename | TEXT                | N/A       | ✅            | Optional                 |
| duration_seconds  | REAL                | N/A       | ✅            | Optional                 |
| sample_text       | TEXT                | N/A       | ✅            | Optional                 |
| is_active         | BOOLEAN             | N/A       | ✅            | Default 0                |
| created_at        | TIMESTAMP           | N/A       | ✅            | Auto                     |
| updated_at        | TIMESTAMP           | N/A       | ✅            | Auto                     |

**Status:** ⚠️ No TypeScript types for `user_voices` table (used in code but not typed)

#### 5.2.5 `mood_tracking` Table

| Column         | Type                | In Types? | In Migration? | Notes                 |
| -------------- | ------------------- | --------- | ------------- | --------------------- |
| id             | INTEGER PRIMARY KEY | ✅        | ✅            | Auto-increment        |
| user_id        | TEXT NOT NULL       | ✅        | ✅            | Required              |
| mood_before    | TEXT                | ✅        | ✅            | Optional              |
| mood_after     | TEXT                | ✅        | ✅            | Optional              |
| affirmation_id | INTEGER             | ✅        | ✅            | Optional, Foreign key |
| tracked_at     | TIMESTAMP           | ✅        | ✅            | Auto                  |
| created_at     | TIMESTAMP           | ✅        | ✅            | Auto                  |
| updated_at     | TIMESTAMP           | ✅        | ✅            | Auto                  |

**Status:** ✅ Perfect match

### 5.3 Type Mismatches Summary

1. **Missing in Types:**
   - `background_music_url` in `UserPreferences` type (exists in DB)
   - `UserVoice` type (table exists but no TypeScript type)

2. **Potential Issues:**
   - Queries access `background_music_url` from `user_preferences` - זה יעבוד רק אחרי migration 3
   - Queries access `age`, `gender`, `profession` from `users` - זה יעבוד רק אחרי migration 3

---

## 6. API Routes

### 6.1 Affirmations Endpoints

| Route                                  | Method | Handler                        | Request                                                                          | Response                                  | Status |
| -------------------------------------- | ------ | ------------------------------ | -------------------------------------------------------------------------------- | ----------------------------------------- | ------ |
| `/api/affirmations/generate`           | POST   | `generateAffirmations`         | `{focus_areas, emotional_state, preferred_tone, language, style, interests?}`    | `{success, affirmations[]}`               | ✅     |
| `/api/affirmations`                    | POST   | Save affirmation               | `{user_id, text, focus_area, emotional_state, tone, style, language, voiceName}` | `{success, id, audioUrl?}`                | ✅     |
| `/api/affirmations/:userId`            | GET    | Get user affirmations          | -                                                                                | `{success, affirmations[]}`               | ✅     |
| `/api/affirmations/:id/generate-audio` | POST   | Generate audio for affirmation | -                                                                                | `{success, audioUrl, backgroundMusicUrl}` | ✅     |
| `/api/affirmations/:id/audio`          | GET    | Get affirmation audio file     | -                                                                                | Audio file (MP3)                          | ✅     |
| `/api/affirmations/:id/favorite`       | PATCH  | Toggle favorite                | `{is_favorite}`                                                                  | `{success}`                               | ✅     |
| `/api/affirmations/:id`                | PATCH  | Update affirmation             | `{text}`                                                                         | `{success}`                               | ✅     |
| `/api/affirmations/:id`                | DELETE | Delete affirmation             | -                                                                                | `{success}`                               | ✅     |

### 6.2 User Management Endpoints

| Route                | Method | Handler             | Request                                       | Response          | Status |
| -------------------- | ------ | ------------------- | --------------------------------------------- | ----------------- | ------ |
| `/api/users/:userId` | GET    | Get user profile    | -                                             | `{success, user}` | ✅     |
| `/api/users/:userId` | PATCH  | Update user profile | `{email?, name?, age?, gender?, profession?}` | `{success}`       | ✅     |

### 6.3 Preferences Endpoints

| Route                      | Method | Handler              | Request                                                                                                 | Response                 | Status |
| -------------------------- | ------ | -------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------ | ------ |
| `/api/preferences/:userId` | GET    | Get user preferences | -                                                                                                       | `{success, preferences}` | ✅     |
| `/api/preferences`         | POST   | Save preferences     | `{user_id, focus_areas, emotional_state, preferred_tone, language, style, selected_voice?, interests?}` | `{success}`              | ✅     |

### 6.4 Voice Endpoints

| Route                         | Method | Handler                   | Request                                              | Response                                                       | Status |
| ----------------------------- | ------ | ------------------------- | ---------------------------------------------------- | -------------------------------------------------------------- | ------ |
| `/api/user-voices/upload`     | POST   | Upload voice recording    | FormData (audio file)                                | `{id, storage_url, original_filename, voice_type, is_active}`  | ✅     |
| `/api/user-voices/:id/audio`  | GET    | Get voice audio file      | -                                                    | Audio file                                                     | ✅     |
| `/api/user-voices`            | GET    | Get user voices list      | -                                                    | `[{id, voice_type, original_filename, is_active, created_at}]` | ✅     |
| `/api/text-to-speech/preview` | POST   | Preview TTS voice         | `{text, voiceName, language?}`                       | Audio file (MP3)                                               | ✅     |
| `/api/text-to-speech`         | POST   | Generate & save TTS audio | `{text, voiceName, language, userId, affirmationId}` | `{success, audioUrl, storageKey}`                              | ✅     |

### 6.5 Mood Tracking Endpoints

| Route                        | Method | Handler            | Request                                                 | Response                     | Status |
| ---------------------------- | ------ | ------------------ | ------------------------------------------------------- | ---------------------------- | ------ |
| `/api/mood-tracking`         | POST   | Save mood tracking | `{user_id, mood_before?, mood_after?, affirmation_id?}` | `{success, id}`              | ✅     |
| `/api/mood-tracking/:userId` | GET    | Get mood history   | -                                                       | `{success, mood_tracking[]}` | ✅     |

### 6.6 Background Music Endpoints

| Route                                            | Method | Handler                       | Request                 | Response                            | Status |
| ------------------------------------------------ | ------ | ----------------------------- | ----------------------- | ----------------------------------- | ------ |
| `/api/background-music/styles`                   | GET    | Get available music styles    | -                       | `{success, styles[]}`               | ✅     |
| `/api/background-music/:style`                   | GET    | Get built-in music file       | -                       | Audio file (MP3)                    | ✅     |
| `/api/background-music/custom`                   | GET    | Get custom music list         | -                       | `{success, musicFiles[]}`           | ✅     |
| `/api/background-music/custom/:userId/:filename` | GET    | Get custom music file         | -                       | Audio file (MP3)                    | ✅     |
| `/api/background-music/custom/:userId/:filename` | DELETE | Delete custom music           | -                       | `{success}`                         | ✅     |
| `/api/background-music/upload-built-in`          | POST   | Upload built-in music (admin) | FormData (audio, style) | `{success, storage_url, audio_url}` | ✅     |
| `/api/background-music/upload`                   | POST   | Upload custom music           | FormData (audio)        | `{success, storage_url, audio_url}` | ✅     |

### 6.7 Utility Endpoints

| Route                 | Method | Handler                   | Request | Response             | Status |
| --------------------- | ------ | ------------------------- | ------- | -------------------- | ------ |
| `/api/clear-all-data` | DELETE | Clear all user data (dev) | -       | `{success, message}` | ✅     |

### 6.8 API Validation

**Zod Schemas Used:**

- `GenerateAffirmationRequest` - Validates affirmation generation request
- Other endpoints use manual validation or no validation

**Missing Validation:**

- Most endpoints don't use Zod validation
- No validation for user profile updates
- No validation for preferences updates

---

## 7. Database Schema

### 7.1 Complete Schema

#### Table: `users`

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT,
  name TEXT,
  is_premium BOOLEAN DEFAULT 0,
  onboarding_completed BOOLEAN DEFAULT 0,
  voice_setup_completed BOOLEAN DEFAULT 0,
  age INTEGER,              -- Added in migration 3
  gender TEXT,              -- Added in migration 3
  profession TEXT,          -- Added in migration 3
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Indexes:**

- `idx_users_email` on `email`

#### Table: `user_preferences`

```sql
CREATE TABLE user_preferences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  focus_areas TEXT,                    -- JSON array
  emotional_state TEXT,
  preferred_tone TEXT,
  language TEXT DEFAULT 'en',
  style TEXT,
  selected_voice TEXT,                -- Added in migration 3
  interests TEXT,                       -- Added in migration 3 (JSON array)
  background_music_url TEXT,           -- Added in migration 3
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Indexes:**

- `idx_user_preferences_user_id` on `user_id`

#### Table: `affirmations`

```sql
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
```

**Indexes:**

- `idx_affirmations_user_id` on `user_id`
- `idx_affirmations_is_favorite` on `is_favorite`

#### Table: `user_voices`

```sql
CREATE TABLE user_voices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  voice_type TEXT NOT NULL,            -- 'recorded' or 'uploaded'
  storage_url TEXT NOT NULL,
  original_filename TEXT,
  duration_seconds REAL,
  sample_text TEXT,
  is_active BOOLEAN DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Indexes:**

- `idx_user_voices_user_id` on `user_id`
- `idx_user_voices_active` on `(user_id, is_active)`

#### Table: `mood_tracking`

```sql
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
```

**Indexes:**

- `idx_mood_tracking_user_id` on `user_id`

### 7.2 Migration Status

| Migration | File               | Purpose                                                                                                   | Applied? |
| --------- | ------------------ | --------------------------------------------------------------------------------------------------------- | -------- |
| 1         | `migrations/1.sql` | Create core tables (users, user_preferences, affirmations, mood_tracking)                                 | ✅       |
| 2         | `migrations/2.sql` | Create user_voices table                                                                                  | ✅       |
| 3         | `migrations/3.sql` | Add age, gender, profession to users; selected_voice, interests, background_music_url to user_preferences | ✅       |

**Migration Order:** ✅ Correct (1 → 2 → 3)

### 7.3 Potential Schema Issues

1. **Missing Foreign Keys:**
   - `affirmations.user_id` → `users.id` (no FK constraint)
   - `user_preferences.user_id` → `users.id` (no FK constraint)
   - `mood_tracking.affirmation_id` → `affirmations.id` (no FK constraint)
   - `mood_tracking.user_id` → `users.id` (no FK constraint)

2. **Data Type Consistency:**
   - `user_id` is TEXT in all tables (consistent)
   - Boolean values stored as INTEGER (0/1) - handled correctly in code

3. **JSON Fields:**
   - `focus_areas` and `interests` stored as TEXT with JSON.parse/stringify
   - No JSON validation at DB level (SQLite limitation)

---

## 8. Storage & Audio Files

### 8.1 R2 Storage Structure

| Path Pattern                                         | Purpose                     | Example                                              |
| ---------------------------------------------------- | --------------------------- | ---------------------------------------------------- |
| `affirmations/{userId}/{affirmationId}.mp3`          | Generated affirmation audio | `affirmations/user_123/1.mp3`                        |
| `user-voices/{userId}/{timestamp}.{ext}`             | User voice recordings       | `user-voices/user_123/1706208000000.webm`            |
| `background-music/{style}.mp3`                       | Built-in background music   | `background-music/greento-blue.mp3`                  |
| `background-music/custom/{userId}/{timestamp}.{ext}` | Custom uploaded music       | `background-music/custom/user_123/1706208000000.mp3` |

### 8.2 Local Files

**`public/Background-Music/`:**

- `GreentoBlue.mp3` - Built-in music file
- `Idea10.mp3` - Built-in music file

**Scripts:**

- `scripts/upload-music-to-r2.js` - Script to upload music files to R2

### 8.3 Storage Consistency

**Potential Issues:**

1. **Path Conversion:**
   - Frontend converts storage keys to API URLs: `affirmations/...` → `/api/affirmations/:id/audio`
   - Background music paths converted: `background-music/...` → `/api/background-music/:style`
   - Custom music: `background-music/custom/...` → `/api/background-music/custom/:userId/:filename`

2. **File Cleanup:**
   - ✅ Audio files deleted from R2 when affirmation deleted
   - ✅ Voice files deleted from R2 when clearing all data
   - ⚠️ No cleanup for orphaned files (if DB record deleted but R2 file remains)

3. **Missing Files:**
   - Backend generates audio on-the-fly if file missing (good fallback)
   - No validation that R2 files actually exist before serving

---

## 9. Audio System Analysis

### 9.1 Text-to-Speech Flow

```
1. User generates affirmations
   ↓
2. OpenAI generates 5 affirmations
   ↓
3. For each affirmation:
   a. Save to DB (POST /api/affirmations)
   b. Get user preferences (language, selected_voice)
   c. Generate audio via Google TTS (generateSpeech)
   d. Save audio to R2 (affirmations/{userId}/{id}.mp3)
   e. Update DB with audio_url
   f. Auto-select background music based on preferences
   g. Update DB with background_music_url
```

**Voice Selection Logic:**

- Demo voices: `sarah`, `alex`, `maya`, `james`, `luna` → Google TTS Neural2 voices
- Custom voices: `custom_{id}` → Falls back to `sarah` (not implemented)
- Voice mapping in `VOICE_MAPPING` constant

### 9.2 Audio Playback Flow

```
1. User selects affirmation
   ↓
2. Load audio URL (convert storage key to API URL if needed)
   ↓
3. Load background music URL (convert if needed)
   ↓
4. useAudioPlayer.loadAudio(audioUrl, backgroundMusicUrl)
   ↓
5. Create HTMLAudioElement for affirmation audio
   ↓
6. Create HTMLAudioElement for background music (if enabled)
   ↓
7. Play both simultaneously
   ↓
8. Auto-advance to next if autoplay enabled
```

**Volume Control:**

- Master volume: Controls affirmation audio
- Background music volume: Separate control, only if background music enabled
- Both stored in localStorage (`affirm-audio-settings`)

### 9.3 Background Music Selection

**Auto-Selection Logic:**

1. Check if user has custom `background_music_url` in preferences
2. If yes, use custom music
3. If no, use `selectBackgroundMusic()` function:
   - Maps focus areas → music styles
   - Maps emotional tone → music styles
   - Default: `greento-blue`

**Available Styles:**

- `ambient/calm`
- `ambient/energy`
- `piano/gentle`
- `piano/motivating`
- `nature/peaceful`
- `solfeggio/528hz`
- `greento-blue`
- `idea-10`

---

## 10. Errors & Logs

### 10.1 Linting Errors

**Status:** ✅ **No linting errors found**

Checked with `read_lints` - no errors reported.

### 10.2 TypeScript Compilation Errors

**Status:** ✅ **No TypeScript errors**

All files compile successfully with strict mode enabled.

### 10.3 Potential Runtime Errors

1. **Database Errors:**
   - Queries assume migration 3 applied (access `age`, `gender`, `profession`, `selected_voice`, `interests`, `background_music_url`)
   - If migration 3 not applied → `no such column` errors

2. **API Errors:**
   - Missing API keys (`OPENAI_API_KEY`, `GOOGLE_CLOUD_API_KEY`) → Error messages returned
   - Network failures → Handled with try-catch

3. **Storage Errors:**
   - R2 file not found → Backend generates on-the-fly (good fallback)
   - R2 upload failures → Error logged, request fails

4. **Type Errors:**
   - `background_music_url` not in TypeScript types but used in code → TypeScript won't catch this
   - `user_voices` not typed → No type safety for voice operations

### 10.4 Error Handling Patterns

**Backend:**

- ✅ Try-catch blocks around async operations
- Consistent error response format: `{success: false, error: string}`
- Status codes: 200 (success), 400 (validation), 404 (not found), 500 (server error)

**Frontend:**

- ✅ Try-catch in hooks
- Error state management in hooks
- User-friendly error messages displayed in UI

---

## 11. Gaps & Missing Logic

### 11.1 Functional Gaps

1. **Authentication:**
   - ❌ No real authentication system
   - ⚠️ Mock user ID `user_123` hardcoded everywhere
   - ❌ Signup page doesn't save to database (TODO comment)

2. **Custom Voices:**
   - ⚠️ Custom voices uploaded but not used in TTS generation
   - Falls back to `sarah` when custom voice selected
   - No voice cloning or processing

3. **Premium Features:**
   - ⚠️ `is_premium` flag exists but no premium features implemented
   - PaywallModal exists but doesn't do anything

4. **Notifications:**
   - ⚠️ Notification settings saved to localStorage but not implemented
   - No actual notification system

### 11.2 Data Consistency Issues

1. **Missing Validation:**
   - Most API endpoints don't validate input with Zod
   - Only `GenerateAffirmationRequest` uses Zod validation

2. **Missing Foreign Key Constraints:**
   - No referential integrity at DB level
   - Could have orphaned records

3. **Missing Type Safety:**
   - `background_music_url` not in TypeScript types
   - `user_voices` not typed
   - Some API responses not typed

4. **Orphaned Files:**
   - No cleanup for orphaned R2 files
   - If DB record deleted but R2 file not, file remains

### 11.3 Incomplete Features

1. **Signup Flow:**
   - Signup page doesn't create user in database
   - TODO comment in code: `// TODO: Implement signup logic`

2. **Voice Setup:**
   - Voice recording works
   - But custom voices not used in TTS generation

3. **Profile:**
   - Profile editing works
   - But no email verification
   - No password reset

4. **Mood Tracking:**
   - Before/after mood tracking works
   - But no analytics or visualization

### 11.4 Edge Cases Not Handled

1. **Empty States:**
   - ✅ Empty states handled in UI (EmptyState components)

2. **Network Failures:**
   - ✅ Errors displayed to user
   - ⚠️ No retry logic

3. **Large Files:**
   - ⚠️ No file size limits for voice/music uploads
   - Could cause memory issues

4. **Concurrent Requests:**
   - ⚠️ No rate limiting
   - Could overwhelm API

---

## 12. QA Checklist

### 12.1 Regression Tests

- [ ] Test onboarding flow end-to-end
- [ ] Test affirmation generation with different preferences
- [ ] Test audio playback with different voices
- [ ] Test background music selection and playback
- [ ] Test favorites toggle and navigation
- [ ] Test mood tracking before/after
- [ ] Test profile editing
- [ ] Test preferences updates
- [ ] Test voice recording and upload
- [ ] Test custom music upload and playback
- [ ] Test deletion of affirmations and cleanup
- [ ] Test "Clear All Data" functionality

### 12.2 Integration Tests

- [ ] Test API endpoints with real requests
- [ ] Test database queries with actual data
- [ ] Test R2 storage upload/download
- [ ] Test OpenAI API integration
- [ ] Test Google TTS API integration
- [ ] Test error handling for missing API keys
- [ ] Test error handling for network failures

### 12.3 Performance Considerations

- [ ] Test with large number of affirmations (100+)
- [ ] Test audio file sizes and loading times
- [ ] Test background music + affirmation audio simultaneous playback
- [ ] Test search/filter performance with many favorites
- [ ] Test R2 list operations with many files

### 12.4 Security Considerations

- [ ] Add authentication system
- [ ] Add user authorization checks
- [ ] Validate file uploads (size, type)
- [ ] Add rate limiting
- [ ] Sanitize user inputs
- [ ] Add CSRF protection
- [ ] Secure API keys (environment variables)

### 12.5 Data Migration Tests

- [ ] Test migration 1 → 2 → 3 in order
- [ ] Test with existing data
- [ ] Test rollback if migration fails
- [ ] Test with missing columns (backward compatibility)

---

## 13. Recommendations

### 13.1 High Priority

1. **Add TypeScript Types:**
   - Add `background_music_url` to `UserPreferences` type
   - Create `UserVoice` type for voice operations

2. **Implement Authentication:**
   - Replace mock `user_123` with real auth
   - Implement signup endpoint
   - Add user session management

3. **Add Validation:**
   - Use Zod schemas for all API endpoints
   - Validate file uploads (size, type)

4. **Fix Custom Voices:**
   - Implement custom voice usage in TTS generation
   - Or remove custom voice feature if not feasible

### 13.2 Medium Priority

1. **Add Foreign Key Constraints:**
   - Add FK constraints to database schema
   - Or handle orphaned records in code

2. **Add Error Recovery:**
   - Retry logic for failed API calls
   - Better error messages for users

3. **Add File Cleanup:**
   - Periodic cleanup of orphaned R2 files
   - Or add file validation before serving

4. **Add Analytics:**
   - Mood tracking visualization
   - Usage statistics

### 13.3 Low Priority

1. **Add Premium Features:**
   - Implement premium functionality
   - Or remove premium flag if not needed

2. **Add Notifications:**
   - Implement notification system
   - Or remove notification settings if not needed

3. **Add Tests:**
   - Unit tests for hooks
   - Integration tests for API endpoints
   - E2E tests for critical flows

---

## 14. Summary

### 14.1 מה עובד טוב

- ✅ **Architecture:** Clean separation between frontend/backend
- ✅ **Type Safety:** Most types match database schema
- ✅ **Error Handling:** Consistent error handling patterns
- ✅ **Audio System:** Well-designed audio playback with background music
- ✅ **Onboarding:** Complete onboarding flow
- ✅ **UI/UX:** Modern, responsive design with good UX

### 14.2 מה צריך שיפור

- ⚠️ **Authentication:** No real auth system
- ⚠️ **Type Safety:** Missing types for some operations
- ⚠️ **Validation:** Limited input validation
- ⚠️ **Custom Voices:** Not fully implemented
- ⚠️ **Testing:** No automated tests

### 14.3 פערים קריטיים

1. **Database Schema Mismatch:**
   - `background_music_url` exists in DB but not in types

2. **Missing Features:**
   - Signup doesn't save to database
   - Custom voices not used in TTS

3. **Security:**
   - No authentication
   - No authorization checks
   - No rate limiting

---

**סוף הדוח**
