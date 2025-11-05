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
  background_music_url: z.string().optional(),
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

// User Voice Schema
export const UserVoiceSchema = z.object({
  id: z.number(),
  user_id: z.string(),
  voice_type: z.enum(["recorded", "uploaded"]),
  storage_url: z.string(),
  original_filename: z.string().optional(),
  duration_seconds: z.number().optional(),
  sample_text: z.string().optional(),
  is_active: z.boolean().default(false),
  created_at: z.string(),
  updated_at: z.string(),
});

export type UserVoice = z.infer<typeof UserVoiceSchema>;

// API Request/Response Types

// Base API Response Types (must be defined first)
export const ApiSuccessResponse = z.object({
  success: z.literal(true),
});

export const ApiErrorResponse = z.object({
  success: z.literal(false),
  error: z.string(),
});

export const SignupRequest = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address").max(255),
});

export type SignupRequestType = z.infer<typeof SignupRequest>;

export const SignupResponse = z.union([
  z.object({
    success: z.literal(true),
    userId: z.string(),
    user: UserSchema.partial(),
  }),
  ApiErrorResponse,
]);

export type SignupResponseType = z.infer<typeof SignupResponse>;

export const UpdateUserProfileRequest = z.object({
  email: z.string().email("Invalid email address").max(255).optional(),
  name: z.string().min(1).max(100).optional(),
  age: z.number().min(13, "Must be at least 13 years old").max(120, "Invalid age").optional().nullable(),
  gender: z.enum(["female", "male", "non-binary", "prefer-not-to-say"]).optional().nullable(),
  profession: z.string().max(100).optional().nullable(),
});

export type UpdateUserProfileRequestType = z.infer<typeof UpdateUserProfileRequest>;

export const SavePreferencesRequest = z.object({
  user_id: z.string(),
  focus_areas: z.array(z.string()).min(1, "At least one focus area is required"),
  emotional_state: z.string().min(1, "Emotional state is required"),
  preferred_tone: z.string().min(1, "Preferred tone is required"),
  language: z.string().default("en"),
  style: z.string().min(1, "Style is required"),
  selected_voice: z.string().optional(),
  interests: z.array(z.string()).optional(),
});

export type SavePreferencesRequestType = z.infer<typeof SavePreferencesRequest>;

export const SaveAffirmationRequest = z.object({
  user_id: z.string(),
  text: z.string().min(1, "Affirmation text is required").max(500, "Affirmation text too long"),
  focus_area: z.string().optional(),
  emotional_state: z.string().optional(),
  tone: z.string().optional(),
  style: z.string().optional(),
  language: z.string().default("en"),
  voiceName: z.string().default("sarah"),
});

export type SaveAffirmationRequestType = z.infer<typeof SaveAffirmationRequest>;

export const ToggleFavoriteRequest = z.object({
  is_favorite: z.boolean(),
});

export type ToggleFavoriteRequestType = z.infer<typeof ToggleFavoriteRequest>;

export const UpdateAffirmationRequest = z.object({
  text: z.string().min(1, "Affirmation text is required").max(500, "Affirmation text too long"),
});

export type UpdateAffirmationRequestType = z.infer<typeof UpdateAffirmationRequest>;

export const SaveMoodTrackingRequest = z.object({
  user_id: z.string(),
  mood_before: z.string().optional(),
  mood_after: z.string().optional(),
  affirmation_id: z.number().optional(),
});

export type SaveMoodTrackingRequestType = z.infer<typeof SaveMoodTrackingRequest>;

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

// Additional API Response Types
export const SaveAffirmationResponse = z.union([
  z.object({
    success: z.literal(true),
    id: z.number(),
    audioUrl: z.string().optional(),
    backgroundMusicUrl: z.string().optional(),
  }),
  ApiErrorResponse,
]);

export type SaveAffirmationResponseType = z.infer<typeof SaveAffirmationResponse>;

export const UserProfileResponse = z.union([
  z.object({
    success: z.literal(true),
    user: UserSchema,
  }),
  ApiErrorResponse,
]);

export type UserProfileResponseType = z.infer<typeof UserProfileResponse>;

export const PreferencesResponse = z.union([
  z.object({
    success: z.literal(true),
    preferences: UserPreferencesSchema,
  }),
  ApiErrorResponse,
]);

export type PreferencesResponseType = z.infer<typeof PreferencesResponse>;

export const UploadVoiceResponse = z.union([
  z.object({
    success: z.literal(true),
    id: z.number(),
    storage_url: z.string(),
    original_filename: z.string().optional(),
    voice_type: z.enum(["recorded", "uploaded"]),
    is_active: z.boolean(),
  }),
  ApiErrorResponse,
]);

export type UploadVoiceResponseType = z.infer<typeof UploadVoiceResponse>;

export const UserVoicesListResponse = z.union([
  z.object({
    success: z.literal(true),
    voices: z.array(UserVoiceSchema),
  }),
  ApiErrorResponse,
]);

export type UserVoicesListResponseType = z.infer<typeof UserVoicesListResponse>;

export const MoodTrackingResponse = z.union([
  z.object({
    success: z.literal(true),
    id: z.number(),
  }),
  ApiErrorResponse,
]);

export type MoodTrackingResponseType = z.infer<typeof MoodTrackingResponse>;

export const MoodHistoryResponse = z.union([
  z.object({
    success: z.literal(true),
    mood_tracking: z.array(MoodTrackingSchema),
  }),
  ApiErrorResponse,
]);

export type MoodHistoryResponseType = z.infer<typeof MoodHistoryResponse>;

export const AffirmationsListResponse = z.union([
  z.object({
    success: z.literal(true),
    affirmations: z.array(AffirmationSchema),
  }),
  ApiErrorResponse,
]);

export type AffirmationsListResponseType = z.infer<typeof AffirmationsListResponse>;

export const BackgroundMusicStylesResponse = z.union([
  z.object({
    success: z.literal(true),
    styles: z.array(z.string()),
  }),
  ApiErrorResponse,
]);

export type BackgroundMusicStylesResponseType = z.infer<typeof BackgroundMusicStylesResponse>;

export const UploadMusicResponse = z.union([
  z.object({
    success: z.literal(true),
    storage_url: z.string(),
    audio_url: z.string(),
  }),
  ApiErrorResponse,
]);

export type UploadMusicResponseType = z.infer<typeof UploadMusicResponse>;
