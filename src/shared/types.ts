import z from "zod";

// User Preferences Schema
export const UserPreferencesSchema = z.object({
  focus_areas: z.array(z.string()),
  emotional_state: z.string(),
  preferred_tone: z.string(),
  language: z.string().default("en"),
  style: z.string(),
  selected_voice: z.string().optional(),
  interests: z.array(z.string()).optional(),
});

export type UserPreferences = z.infer<typeof UserPreferencesSchema>;

// Affirmation Schema
export const AffirmationSchema = z.object({
  id: z.number(),
  user_id: z.string(),
  text: z.string(),
  audio_url: z.string().optional(),
  background_music_url: z.string().optional(),
  is_favorite: z.boolean().default(false),
  focus_area: z.string().optional(),
  emotional_state: z.string().optional(),
  tone: z.string().optional(),
  style: z.string().optional(),
  generated_at: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Affirmation = z.infer<typeof AffirmationSchema>;

// Mood Tracking Schema
export const MoodTrackingSchema = z.object({
  id: z.number(),
  user_id: z.string(),
  mood_before: z.string(),
  mood_after: z.string().optional(),
  affirmation_id: z.number().optional(),
  tracked_at: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type MoodTracking = z.infer<typeof MoodTrackingSchema>;

// User Schema
export const UserSchema = z.object({
  id: z.number(),
  email: z.string().optional(),
  name: z.string().optional(),
  age: z.number().min(13).max(120).optional(),
  gender: z
    .enum(["female", "male", "non-binary", "prefer-not-to-say"])
    .optional(),
  profession: z.string().max(100).optional(),
  is_premium: z.boolean().default(false),
  onboarding_completed: z.boolean().default(false),
  voice_setup_completed: z.boolean().default(false),
  created_at: z.string(),
  updated_at: z.string(),
});

export type User = z.infer<typeof UserSchema>;

// API Request/Response Types
export const GenerateAffirmationRequest = z.object({
  focus_areas: z.array(z.string()),
  emotional_state: z.string(),
  preferred_tone: z.string(),
  language: z.string().default("en"),
  style: z.string(),
  interests: z.array(z.string()).optional(),
});

export type GenerateAffirmationRequestType = z.infer<
  typeof GenerateAffirmationRequest
>;

export const GenerateAffirmationResponse = z.object({
  success: z.boolean(),
  affirmations: z.array(z.string()).optional(),
  error: z.string().optional(),
});

export type GenerateAffirmationResponseType = z.infer<
  typeof GenerateAffirmationResponse
>;

// Audio Settings Types
export const AudioSettingsSchema = z.object({
  autoplay: z.boolean().default(true),
  backgroundMusic: z.boolean().default(true),
  backgroundMusicVolume: z.number().min(0).max(1).default(0.5),
  masterVolume: z.number().min(0).max(1).default(0.8),
});

export type AudioSettingsType = z.infer<typeof AudioSettingsSchema>;
