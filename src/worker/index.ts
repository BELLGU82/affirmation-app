import { Hono } from "hono";
import { cors } from "hono/cors";
import OpenAI from "openai";
import { GenerateAffirmationRequest } from "@/shared/types";

const app = new Hono<{ Bindings: Env }>();

app.use("*", cors());

// Voice mapping for demo voices
const VOICE_MAPPING: Record<string, string> = {
  sarah: "en-US-Neural2-F", // female, warm
  alex: "en-US-Neural2-D", // male, confident
  maya: "en-US-Neural2-E", // female, gentle
  james: "en-US-Neural2-J", // male, deep
  luna: "en-US-Neural2-I", // female, peaceful
};

// Helper function to select background music based on preferences
function selectBackgroundMusic(
  focusArea: string,
  _emotionalState: string,
  tone: string
): string {
  // Focus Area → Music Style mapping
  const focusAreaMap: Record<string, string[]> = {
    calm: ["ambient/calm", "piano/gentle"],
    anxiety: ["ambient/calm", "piano/gentle"],
    stress: ["ambient/calm", "piano/gentle"],
    energy: ["ambient/energy", "piano/motivating"],
    motivation: ["ambient/energy", "piano/motivating"],
    mindfulness: ["nature/peaceful", "solfeggio/528hz"],
    "self-love": ["nature/peaceful", "solfeggio/528hz"],
  };

  // Emotional Tone → Music selection
  const toneMap: Record<string, string[]> = {
    gratitude: ["piano/gentle"],
    confidence: ["ambient/energy"],
    gentle: ["piano/gentle"],
    empowering: ["ambient/energy"],
    nurturing: ["piano/gentle"],
    motivating: ["piano/motivating"],
    calming: ["ambient/calm"],
  };

  // Try to match by focus area first
  const focusMusic = focusAreaMap[focusArea.toLowerCase()];
  if (focusMusic && focusMusic.length > 0) {
    return focusMusic[0];
  }

  // Then try by tone
  const toneMusic = toneMap[tone.toLowerCase()];
  if (toneMusic && toneMusic.length > 0) {
    return toneMusic[0];
  }

  // Default
  return "ambient/calm";
}

// Google TTS Service
async function generateSpeech(
  text: string,
  voiceName: string,
  language: string = "en",
  env: Env
): Promise<ArrayBuffer> {
  try {
    if (!env.GOOGLE_CLOUD_API_KEY) {
      throw new Error("Google Cloud API key is not configured");
    }

    // Map language code to Google TTS language code
    const languageCode = language === "en" ? "en-US" : language;

    // Use the voice mapping or default voice
    const voiceId = VOICE_MAPPING[voiceName.toLowerCase()] || "en-US-Neural2-F";

    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${env.GOOGLE_CLOUD_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: { text },
          voice: {
            languageCode,
            name: voiceId,
          },
          audioConfig: {
            audioEncoding: "MP3",
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Google TTS API error:", errorText);
      let errorMessage = `Google TTS API failed: ${response.status}`;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error?.message) {
          errorMessage = errorJson.error.message;
        }
      } catch {
        // If parsing fails, use the text as is
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = (await response.json()) as { audioContent?: string };
    if (!data.audioContent) {
      throw new Error("No audio content received from Google TTS");
    }

    // Decode base64 to ArrayBuffer
    try {
      const base64Audio = data.audioContent;
      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes.buffer;
    } catch (decodeError) {
      console.error("Error decoding base64 audio:", decodeError);
      throw new Error("Failed to decode audio content");
    }
  } catch (error: unknown) {
    console.error("Error generating speech:", error);
    throw error;
  }
}

// AI Service for generating affirmations
async function generateAffirmations(
  preferences: {
    focus_areas: string[];
    emotional_state: string;
    preferred_tone: string;
    language: string;
    style: string;
    interests?: string[];
  },
  env: Env
): Promise<string[]> {
  try {
    if (!env.OPENAI_API_KEY) {
      console.error("OpenAI API key not found");
      throw new Error("OpenAI API key is not configured");
    }

    const client = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    });

    const focusAreasText = preferences.focus_areas.join(", ");
    const interestsText =
      preferences.interests && preferences.interests.length > 0
        ? preferences.interests.join(", ")
        : null;

    let prompt = `Generate exactly 5 short, personalized affirmations in ${preferences.language} language.

Context:
- Focus areas: ${focusAreasText}
- Emotional state: ${preferences.emotional_state}
- Preferred tone: ${preferences.preferred_tone}
- Style: ${preferences.style}`;

    if (interestsText) {
      prompt += `\n- Interests: ${interestsText}`;
    }

    prompt += `

Requirements:
- Each affirmation should be 1-2 sentences maximum
- Use a ${preferences.preferred_tone} tone
- Address the focus areas: ${focusAreasText}
- Consider the emotional state: ${preferences.emotional_state}
- Match the ${preferences.style} style`;

    if (interestsText) {
      prompt += `\n- Incorporate interests: ${interestsText}`;
    }

    prompt += `
- Return exactly 5 affirmations, one per line
- Do not include numbers, bullets, or quotation marks
- Make them personal and empowering

Example format:
I am worthy of love and respect
My emotions are valid and I honor them
I choose peace and understanding in this moment
I trust in my ability to navigate challenges
I am exactly where I need to be right now`;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 300,
      temperature: 0.8,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      console.error("No content received from OpenAI");
      return [];
    }

    // Split by newlines and filter out empty lines
    const affirmations = content
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .slice(0, 5); // Ensure we only get 5 affirmations

    if (affirmations.length === 0) {
      throw new Error("OpenAI returned empty response");
    }

    return affirmations;
  } catch (error: unknown) {
    console.error("Error generating affirmations:", error);
    // Re-throw to let the endpoint handle it
    throw error;
  }
}

// Generate affirmations endpoint
app.post("/api/affirmations/generate", async (c) => {
  try {
    const body = await c.req.json();

    // Validate request data
    let validatedData;
    try {
      validatedData = GenerateAffirmationRequest.parse(body);
    } catch (validationError: unknown) {
      console.error("Validation error:", validationError);
      const zodError = validationError as {
        errors?: Array<{ message: string }>;
        message?: string;
      };
      const errorMessage =
        zodError.errors?.map((e) => e.message).join(", ") ||
        zodError.message ||
        "Validation failed";
      return c.json(
        {
          success: false,
          error: `Invalid request data: ${errorMessage}`,
          affirmations: [],
        },
        400
      );
    }

    // Check if OpenAI API key is configured
    if (!c.env.OPENAI_API_KEY) {
      console.error("OpenAI API key not configured");
      return c.json(
        {
          success: false,
          error:
            "OpenAI API key is not configured. Please configure OPENAI_API_KEY in your Cloudflare dashboard.",
          affirmations: [],
        },
        500
      );
    }

    // Generate affirmations
    const affirmations = await generateAffirmations(validatedData, c.env);

    if (affirmations.length === 0) {
      console.error(
        "No affirmations generated - OpenAI API may have failed or returned empty response"
      );
      return c.json(
        {
          success: false,
          error:
            "Failed to generate affirmations. Please try again or check OpenAI API configuration.",
          affirmations: [],
        },
        500
      );
    }

    return c.json({
      success: true,
      affirmations,
    });
  } catch (error: unknown) {
    console.error("API error:", error);

    // Provide more specific error messages
    let errorMessage = "Failed to generate affirmations";
    let statusCode = 500;

    if (error && typeof error === "object") {
      const err = error as { message?: string; name?: string; status?: number };
      if (err.message) {
        errorMessage = err.message;
      } else if (err.name === "ValidationError") {
        errorMessage = "Invalid request data";
        statusCode = 400;
      } else if (err.status === 401 || err.status === 403) {
        errorMessage =
          "OpenAI API authentication failed. Please check your API key.";
        statusCode = err.status;
      } else if (err.status === 429) {
        errorMessage =
          "OpenAI API rate limit exceeded. Please try again later.";
        statusCode = err.status;
      } else if (err.status) {
        statusCode = err.status;
      }
    }

    // Ensure statusCode is a valid HTTP status code
    const validStatusCode =
      statusCode >= 400 && statusCode < 600 ? statusCode : 500;

    return c.json(
      {
        success: false,
        error: errorMessage,
        affirmations: [],
      },
      validStatusCode as 400 | 401 | 403 | 429 | 500
    );
  }
});

// Save affirmation endpoint
app.post("/api/affirmations", async (c) => {
  try {
    const body = await c.req.json();
    const {
      user_id,
      text,
      focus_area,
      emotional_state,
      tone,
      style,
      language,
      voiceName,
    } = body;

    // Save affirmation first
    const result = await c.env.DB.prepare(
      `
      INSERT INTO affirmations (user_id, text, focus_area, emotional_state, tone, style, generated_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `
    )
      .bind(user_id, text, focus_area, emotional_state, tone, style)
      .run();

    const affirmationId = result.meta.last_row_id;

    // Select background music based on preferences
    let backgroundMusicUrl: string | null = null;
    const preferences = await c.env.DB.prepare(
      `
      SELECT focus_areas, emotional_state, preferred_tone, background_music_url
      FROM user_preferences 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT 1
    `
    )
      .bind(user_id)
      .first();

    if (preferences) {
      // Check if user has custom background music
      const customMusicUrl = preferences.background_music_url as string | null;
      if (customMusicUrl) {
        backgroundMusicUrl = customMusicUrl;
      } else {
        // Auto-select based on focus area and tone
        const focusAreas = JSON.parse(
          (preferences.focus_areas as string) || "[]"
        );
        const focusArea = focusAreas[0] || focus_area || "mindfulness";
        const emotionalState =
          (preferences.emotional_state as string) ||
          emotional_state ||
          "neutral";
        const preferredTone =
          (preferences.preferred_tone as string) || tone || "gentle";

        const selectedStyle = selectBackgroundMusic(
          focusArea,
          emotionalState,
          preferredTone
        );
        backgroundMusicUrl = `background-music/${selectedStyle}.mp3`;
      }
    }

    // Generate audio if Google TTS is configured
    let audioUrl: string | null = null;
    if (c.env.GOOGLE_CLOUD_API_KEY && text && voiceName) {
      try {
        const audioBuffer = await generateSpeech(
          text,
          voiceName,
          language || "en",
          c.env
        );

        // Save to R2
        const storageKey = `affirmations/${user_id}/${affirmationId}.mp3`;
        await c.env.R2_BUCKET.put(storageKey, audioBuffer, {
          httpMetadata: {
            contentType: "audio/mpeg",
          },
        });

        // Update audio_url and background_music_url in database
        audioUrl = storageKey;
        await c.env.DB.prepare(
          `
          UPDATE affirmations 
          SET audio_url = ?, background_music_url = ?, updated_at = datetime('now')
          WHERE id = ?
        `
        )
          .bind(audioUrl, backgroundMusicUrl, affirmationId)
          .run();
      } catch (audioError) {
        // Log error but don't fail the affirmation save
        console.error("Error generating audio for affirmation:", audioError);
      }
    }

    return c.json({
      success: true,
      id: affirmationId,
      audioUrl: audioUrl ? `/api/affirmations/${affirmationId}/audio` : null,
    });
  } catch (error) {
    console.error("Error saving affirmation:", error);
    return c.json(
      {
        success: false,
        error: "Failed to save affirmation",
      },
      500
    );
  }
});

// Get user affirmations
app.get("/api/affirmations/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");

    const result = await c.env.DB.prepare(
      `
      SELECT * FROM affirmations 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `
    )
      .bind(userId)
      .all();

    return c.json({
      success: true,
      affirmations: result.results,
    });
  } catch (error) {
    console.error("Error fetching affirmations:", error);
    return c.json(
      {
        success: false,
        error: "Failed to fetch affirmations",
      },
      500
    );
  }
});

// Generate audio for an affirmation
app.post("/api/affirmations/:id/generate-audio", async (c) => {
  try {
    const affirmationId = c.req.param("id");

    // Get affirmation from database
    const affirmation = await c.env.DB.prepare(
      `
      SELECT user_id, text, language, tone FROM affirmations WHERE id = ?
    `
    )
      .bind(affirmationId)
      .first();

    if (!affirmation) {
      return c.json({ error: "Affirmation not found" }, 404);
    }

    const userId = affirmation.user_id as string;
    const text = affirmation.text as string;

    if (!text) {
      return c.json({ error: "Affirmation text is missing" }, 400);
    }

    if (!c.env.GOOGLE_CLOUD_API_KEY) {
      return c.json(
        {
          success: false,
          error: "Google Cloud API key is not configured",
        },
        500
      );
    }

    // Get user preferences for language and selected voice
    const preferences = await c.env.DB.prepare(
      `
      SELECT language, selected_voice FROM user_preferences WHERE user_id = ? ORDER BY created_at DESC LIMIT 1
    `
    )
      .bind(userId)
      .first();

    const language = (preferences?.language as string) || "en";
    const selectedVoice = (preferences?.selected_voice as string) || "sarah";

    // Remove "custom_" prefix if present - use default voice for custom voices
    const voiceName = selectedVoice.startsWith("custom_")
      ? "sarah"
      : selectedVoice;

    console.log(
      `Generating audio for affirmation ${affirmationId} with voice ${voiceName}`
    );

    // Generate audio
    const audioBuffer = await generateSpeech(text, voiceName, language, c.env);

    // Save to R2
    const storageKey = `affirmations/${userId}/${affirmationId}.mp3`;
    await c.env.R2_BUCKET.put(storageKey, audioBuffer, {
      httpMetadata: {
        contentType: "audio/mpeg",
      },
    });

    // Update audio_url in database
    await c.env.DB.prepare(
      `
      UPDATE affirmations 
      SET audio_url = ?, updated_at = datetime('now')
      WHERE id = ?
    `
    )
      .bind(storageKey, affirmationId)
      .run();

    return c.json({
      success: true,
      audioUrl: `/api/affirmations/${affirmationId}/audio`,
    });
  } catch (error: unknown) {
    console.error("Error generating audio for affirmation:", error);
    const errorMessage =
      error && typeof error === "object" && "message" in error
        ? (error as { message: string }).message
        : "Failed to generate audio";
    return c.json(
      {
        success: false,
        error: errorMessage,
      },
      500
    );
  }
});

// Get affirmation audio
app.get("/api/affirmations/:id/audio", async (c) => {
  try {
    const affirmationId = c.req.param("id");

    // Get affirmation from database
    const affirmation = await c.env.DB.prepare(
      `
      SELECT user_id, audio_url FROM affirmations WHERE id = ?
    `
    )
      .bind(affirmationId)
      .first();

    if (!affirmation) {
      return c.json({ error: "Affirmation not found" }, 404);
    }

    // Extract storage key from audio_url or construct it
    const userId = affirmation.user_id as string;
    const audioUrl = affirmation.audio_url as string | null;

    let storageKey: string;
    if (audioUrl && audioUrl.startsWith("affirmations/")) {
      storageKey = audioUrl;
    } else {
      // Fallback: construct storage key
      storageKey = `affirmations/${userId}/${affirmationId}.mp3`;
    }

    // Get file from R2
    let object = await c.env.R2_BUCKET.get(storageKey);

    // If file doesn't exist and we have Google TTS configured, try to generate it
    if (!object && c.env.GOOGLE_CLOUD_API_KEY) {
      console.log(
        `Audio file not found for affirmation ${affirmationId}, generating...`
      );
      try {
        // Get affirmation data to generate audio
        const affirmation = await c.env.DB.prepare(
          `
          SELECT user_id, text FROM affirmations WHERE id = ?
        `
        )
          .bind(affirmationId)
          .first();

        if (affirmation && affirmation.text) {
          const userId = affirmation.user_id as string;
          const text = affirmation.text as string;

          // Get user preferences for language and selected voice
          const preferences = await c.env.DB.prepare(
            `
            SELECT language, selected_voice FROM user_preferences WHERE user_id = ? ORDER BY created_at DESC LIMIT 1
          `
          )
            .bind(userId)
            .first();

          const language = (preferences?.language as string) || "en";
          const selectedVoice =
            (preferences?.selected_voice as string) || "sarah";

          // Remove "custom_" prefix if present - use default voice for custom voices
          const voiceName = selectedVoice.startsWith("custom_")
            ? "sarah"
            : selectedVoice;

          // Generate audio
          const audioBuffer = await generateSpeech(
            text,
            voiceName,
            language,
            c.env
          );

          // Save to R2
          await c.env.R2_BUCKET.put(storageKey, audioBuffer, {
            httpMetadata: {
              contentType: "audio/mpeg",
            },
          });

          // Update audio_url in database
          await c.env.DB.prepare(
            `
            UPDATE affirmations 
            SET audio_url = ?, updated_at = datetime('now')
            WHERE id = ?
          `
          )
            .bind(storageKey, affirmationId)
            .run();

          // Get the file we just created
          object = await c.env.R2_BUCKET.get(storageKey);
        }
      } catch (generateError) {
        console.error("Failed to generate audio on-the-fly:", generateError);
      }
    }

    if (!object) {
      return c.json({ error: "Audio file not found" }, 404);
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("etag", object.httpEtag);
    headers.set("Content-Type", "audio/mpeg");

    return c.body(object.body, { headers });
  } catch (error) {
    console.error("Affirmation audio serve error:", error);
    return c.json({ error: "Failed to serve audio" }, 500);
  }
});

// Toggle favorite
app.patch("/api/affirmations/:id/favorite", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const { is_favorite } = body;

    await c.env.DB.prepare(
      `
      UPDATE affirmations 
      SET is_favorite = ?, updated_at = datetime('now')
      WHERE id = ?
    `
    )
      .bind(is_favorite, id)
      .run();

    return c.json({ success: true });
  } catch (error) {
    console.error("Error updating favorite:", error);
    return c.json(
      {
        success: false,
        error: "Failed to update favorite",
      },
      500
    );
  }
});

// Update affirmation
app.patch("/api/affirmations/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const { text } = body;

    if (!text || text.trim().length === 0) {
      return c.json(
        {
          success: false,
          error: "Text is required",
        },
        400
      );
    }

    await c.env.DB.prepare(
      `
      UPDATE affirmations 
      SET text = ?, updated_at = datetime('now')
      WHERE id = ?
    `
    )
      .bind(text.trim(), id)
      .run();

    return c.json({ success: true });
  } catch (error) {
    console.error("Error updating affirmation:", error);
    return c.json(
      {
        success: false,
        error: "Failed to update affirmation",
      },
      500
    );
  }
});

// Delete affirmation
app.delete("/api/affirmations/:id", async (c) => {
  try {
    const id = c.req.param("id");

    // Get affirmation to check for audio file
    const affirmation = await c.env.DB.prepare(
      `
      SELECT user_id, audio_url FROM affirmations WHERE id = ?
    `
    )
      .bind(id)
      .first();

    if (!affirmation) {
      return c.json(
        {
          success: false,
          error: "Affirmation not found",
        },
        404
      );
    }

    // Delete audio file from R2 if exists
    const audioUrl = affirmation.audio_url as string | null;
    if (audioUrl && audioUrl.startsWith("affirmations/")) {
      try {
        await c.env.R2_BUCKET.delete(audioUrl);
      } catch (r2Error) {
        console.error("Error deleting audio file from R2:", r2Error);
        // Continue with deletion even if R2 delete fails
      }
    }

    // Delete from database
    await c.env.DB.prepare(
      `
      DELETE FROM affirmations WHERE id = ?
    `
    )
      .bind(id)
      .run();

    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting affirmation:", error);
    return c.json(
      {
        success: false,
        error: "Failed to delete affirmation",
      },
      500
    );
  }
});

// Text-to-Speech Preview endpoint (for voice samples)
app.post("/api/text-to-speech/preview", async (c) => {
  try {
    const body = await c.req.json();
    const { text, voiceName, language } = body;

    console.log("TTS Preview request:", { text, voiceName, language });

    if (!text || !voiceName) {
      return c.json(
        {
          success: false,
          error: "Text and voiceName are required",
        },
        400
      );
    }

    if (!c.env.GOOGLE_CLOUD_API_KEY) {
      console.error("Google Cloud API key is missing");
      return c.json(
        {
          success: false,
          error: "Google Cloud API key is not configured",
        },
        500
      );
    }

    console.log("Generating speech with voice:", voiceName);
    const audioBuffer = await generateSpeech(
      text,
      voiceName,
      language || "en",
      c.env
    );
    console.log("Speech generated successfully, size:", audioBuffer.byteLength);

    // Return audio directly as MP3
    return new Response(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error: unknown) {
    console.error("TTS preview error:", error);
    const errorMessage =
      error && typeof error === "object" && "message" in error
        ? (error as { message: string }).message
        : "Failed to generate speech preview";
    return c.json(
      {
        success: false,
        error: errorMessage,
      },
      500
    );
  }
});

// Text-to-Speech endpoint (for generating and saving audio)
app.post("/api/text-to-speech", async (c) => {
  try {
    const body = await c.req.json();
    const { text, voiceName, language, userId, affirmationId } = body;

    if (!text || !voiceName) {
      return c.json(
        {
          success: false,
          error: "Text and voiceName are required",
        },
        400
      );
    }

    if (!userId || !affirmationId) {
      return c.json(
        {
          success: false,
          error: "userId and affirmationId are required",
        },
        400
      );
    }

    if (!c.env.GOOGLE_CLOUD_API_KEY) {
      return c.json(
        {
          success: false,
          error: "Google Cloud API key is not configured",
        },
        500
      );
    }

    const audioBuffer = await generateSpeech(
      text,
      voiceName,
      language || "en",
      c.env
    );

    // Save to R2
    const storageKey = `affirmations/${userId}/${affirmationId}.mp3`;
    await c.env.R2_BUCKET.put(storageKey, audioBuffer, {
      httpMetadata: {
        contentType: "audio/mpeg",
      },
    });

    // Return the storage URL (will be served via /api/affirmations/:id/audio endpoint)
    const audioUrl = `/api/affirmations/${affirmationId}/audio`;

    return c.json({
      success: true,
      audioUrl,
      storageKey,
    });
  } catch (error: unknown) {
    console.error("TTS error:", error);
    const errorMessage =
      error && typeof error === "object" && "message" in error
        ? (error as { message: string }).message
        : "Failed to generate speech";
    return c.json(
      {
        success: false,
        error: errorMessage,
      },
      500
    );
  }
});

// User preferences endpoints
app.get("/api/preferences/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");

    const result = await c.env.DB.prepare(
      `
      SELECT * FROM user_preferences 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT 1
    `
    )
      .bind(userId)
      .first();

    if (!result) {
      return c.json({
        success: true,
        preferences: {
          focus_areas: ["mindfulness"],
          emotional_state: "neutral",
          preferred_tone: "gentle",
          language: "en",
          style: "inspirational",
          selected_voice: "sarah",
          interests: [],
        },
      });
    }

    return c.json({
      success: true,
      preferences: {
        focus_areas: JSON.parse(result.focus_areas as string),
        emotional_state: result.emotional_state,
        preferred_tone: result.preferred_tone,
        language: result.language,
        style: result.style,
        selected_voice: result.selected_voice || "sarah",
        interests: result.interests
          ? JSON.parse(result.interests as string)
          : [],
      },
    });
  } catch (error) {
    console.error("Error fetching preferences:", error);
    return c.json(
      {
        success: false,
        error: "Failed to fetch preferences",
      },
      500
    );
  }
});

app.post("/api/preferences", async (c) => {
  try {
    const body = await c.req.json();
    const {
      user_id,
      focus_areas,
      emotional_state,
      preferred_tone,
      language,
      style,
      selected_voice,
      interests,
    } = body;

    await c.env.DB.prepare(
      `
      INSERT INTO user_preferences 
      (user_id, focus_areas, emotional_state, preferred_tone, language, style, selected_voice, interests)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `
    )
      .bind(
        user_id,
        JSON.stringify(focus_areas),
        emotional_state,
        preferred_tone,
        language,
        style,
        selected_voice || "sarah",
        interests ? JSON.stringify(interests) : null
      )
      .run();

    return c.json({ success: true });
  } catch (error) {
    console.error("Error saving preferences:", error);
    return c.json(
      {
        success: false,
        error: "Failed to save preferences",
      },
      500
    );
  }
});

// User Voice Upload API
app.post("/api/user-voices/upload", async (c) => {
  try {
    const formData = await c.req.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return c.json({ error: "No audio file provided" }, 400);
    }

    // For now, using a mock user ID - in real app this would come from auth
    const userId = "user_123";
    const timestamp = Date.now();
    const originalFilename = audioFile.name;
    const fileExtension = originalFilename.split(".").pop() || "webm";
    const storageKey = `user-voices/${userId}/${timestamp}.${fileExtension}`;

    // Upload to R2
    const arrayBuffer = await audioFile.arrayBuffer();
    await c.env.R2_BUCKET.put(storageKey, arrayBuffer, {
      httpMetadata: {
        contentType: audioFile.type,
      },
    });

    // Save to database
    const result = await c.env.DB.prepare(
      `
      INSERT INTO user_voices (user_id, voice_type, storage_url, original_filename, is_active)
      VALUES (?, ?, ?, ?, ?)
    `
    )
      .bind(userId, "recorded", storageKey, originalFilename, 1)
      .run();

    // Deactivate other voices for this user
    await c.env.DB.prepare(
      `
      UPDATE user_voices SET is_active = 0 WHERE user_id = ? AND id != ?
    `
    )
      .bind(userId, result.meta.last_row_id)
      .run();

    return c.json({
      id: result.meta.last_row_id,
      storage_url: storageKey,
      original_filename: originalFilename,
      voice_type: "recorded",
      is_active: true,
    });
  } catch (error) {
    console.error("Voice upload error:", error);
    return c.json({ error: "Failed to upload voice" }, 500);
  }
});

// Get user voice audio
app.get("/api/user-voices/:id/audio", async (c) => {
  try {
    const voiceId = c.req.param("id");

    // Get voice record from database
    const voice = await c.env.DB.prepare(
      `
      SELECT storage_url FROM user_voices WHERE id = ?
    `
    )
      .bind(voiceId)
      .first();

    if (!voice) {
      return c.json({ error: "Voice not found" }, 404);
    }

    // Get file from R2
    const object = await c.env.R2_BUCKET.get(voice.storage_url as string);

    if (!object) {
      return c.json({ error: "Audio file not found" }, 404);
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("etag", object.httpEtag);

    return c.body(object.body, { headers });
  } catch (error) {
    console.error("Voice serve error:", error);
    return c.json({ error: "Failed to serve audio" }, 500);
  }
});

// Get user voices
app.get("/api/user-voices", async (c) => {
  try {
    // For now, using a mock user ID - in real app this would come from auth
    const userId = "user_123";

    const voices = await c.env.DB.prepare(
      `
      SELECT id, voice_type, original_filename, is_active, created_at
      FROM user_voices 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `
    )
      .bind(userId)
      .all();

    return c.json(voices.results);
  } catch (error) {
    console.error("Get voices error:", error);
    return c.json({ error: "Failed to get voices" }, 500);
  }
});

// Get user profile
app.get("/api/users/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");

    const user = await c.env.DB.prepare(
      `
      SELECT id, email, name, age, gender, profession, is_premium, onboarding_completed, voice_setup_completed, created_at, updated_at
      FROM users 
      WHERE id = ?
    `
    )
      .bind(userId)
      .first();

    if (!user) {
      return c.json(
        {
          success: false,
          error: "User not found",
        },
        404
      );
    }

    return c.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        age: user.age,
        gender: user.gender,
        profession: user.profession,
        is_premium: Boolean(user.is_premium),
        onboarding_completed: Boolean(user.onboarding_completed),
        voice_setup_completed: Boolean(user.voice_setup_completed),
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return c.json(
      {
        success: false,
        error: "Failed to fetch user",
      },
      500
    );
  }
});

// Update user profile
app.patch("/api/users/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const body = await c.req.json();
    const { email, name, age, gender, profession } = body;

    // Build update query dynamically
    const updates: string[] = [];
    const values: (string | number | boolean | null)[] = [];

    if (email !== undefined) {
      updates.push("email = ?");
      values.push(email);
    }

    if (name !== undefined) {
      updates.push("name = ?");
      values.push(name);
    }

    if (age !== undefined) {
      updates.push("age = ?");
      values.push(age === null || age === "" ? null : age);
    }

    if (gender !== undefined) {
      updates.push("gender = ?");
      values.push(gender === null || gender === "" ? null : gender);
    }

    if (profession !== undefined) {
      updates.push("profession = ?");
      values.push(profession === null || profession === "" ? null : profession);
    }

    if (updates.length === 0) {
      return c.json(
        {
          success: false,
          error: "No fields to update",
        },
        400
      );
    }

    updates.push("updated_at = datetime('now')");

    // Add userId at the end for WHERE clause
    values.push(userId);

    await c.env.DB.prepare(
      `
      UPDATE users 
      SET ${updates.join(", ")}
      WHERE id = ?
    `
    )
      .bind(...values)
      .run();

    return c.json({ success: true });
  } catch (error) {
    console.error("Error updating user:", error);
    return c.json(
      {
        success: false,
        error: "Failed to update user",
      },
      500
    );
  }
});

// Mood Tracking endpoints
app.post("/api/mood-tracking", async (c) => {
  try {
    const body = await c.req.json();
    const { user_id, mood_before, mood_after, affirmation_id } = body;

    const result = await c.env.DB.prepare(
      `
      INSERT INTO mood_tracking (user_id, mood_before, mood_after, affirmation_id, tracked_at)
      VALUES (?, ?, ?, ?, datetime('now'))
    `
    )
      .bind(
        user_id,
        mood_before || null,
        mood_after || null,
        affirmation_id || null
      )
      .run();

    return c.json({
      success: true,
      id: result.meta.last_row_id,
    });
  } catch (error) {
    console.error("Error saving mood tracking:", error);
    return c.json(
      {
        success: false,
        error: "Failed to save mood tracking",
      },
      500
    );
  }
});

app.get("/api/mood-tracking/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");

    const result = await c.env.DB.prepare(
      `
      SELECT * FROM mood_tracking 
      WHERE user_id = ? 
      ORDER BY tracked_at DESC
      LIMIT 100
    `
    )
      .bind(userId)
      .all();

    return c.json({
      success: true,
      mood_tracking: result.results,
    });
  } catch (error) {
    console.error("Error fetching mood tracking:", error);
    return c.json(
      {
        success: false,
        error: "Failed to fetch mood tracking",
      },
      500
    );
  }
});

// Clear all data endpoint (for development/testing)
app.delete("/api/clear-all-data", async (c) => {
  try {
    const userId = "user_123"; // Mock user ID for now

    // Delete all affirmations and get their audio URLs before deletion
    const affirmations = await c.env.DB.prepare(
      `SELECT audio_url FROM affirmations WHERE user_id = ?`
    )
      .bind(userId)
      .all();

    // Delete audio files from R2
    for (const aff of affirmations.results as { audio_url?: string }[]) {
      if (aff.audio_url && aff.audio_url.startsWith("affirmations/")) {
        try {
          await c.env.R2_BUCKET.delete(aff.audio_url);
        } catch (error) {
          console.error(`Failed to delete audio file ${aff.audio_url}:`, error);
        }
      }
    }

    // Delete all user voices and get their storage URLs
    const userVoices = await c.env.DB.prepare(
      `SELECT storage_url FROM user_voices WHERE user_id = ?`
    )
      .bind(userId)
      .all();

    // Delete voice files from R2
    for (const voice of userVoices.results as { storage_url?: string }[]) {
      if (voice.storage_url) {
        try {
          await c.env.R2_BUCKET.delete(voice.storage_url);
        } catch (error) {
          console.error(
            `Failed to delete voice file ${voice.storage_url}:`,
            error
          );
        }
      }
    }

    // Delete all data from database tables
    await c.env.DB.prepare(`DELETE FROM mood_tracking WHERE user_id = ?`)
      .bind(userId)
      .run();
    await c.env.DB.prepare(`DELETE FROM affirmations WHERE user_id = ?`)
      .bind(userId)
      .run();
    await c.env.DB.prepare(`DELETE FROM user_preferences WHERE user_id = ?`)
      .bind(userId)
      .run();
    await c.env.DB.prepare(`DELETE FROM user_voices WHERE user_id = ?`)
      .bind(userId)
      .run();

    console.log(`All data cleared for user ${userId}`);

    return c.json({
      success: true,
      message: "All data cleared successfully",
    });
  } catch (error) {
    console.error("Error clearing data:", error);
    return c.json(
      {
        success: false,
        error: "Failed to clear data",
      },
      500
    );
  }
});

// Background Music endpoints
app.get("/api/background-music/styles", async (c) => {
  try {
    const styles = [
      { id: "ambient/calm", name: "Ambient - Calm", category: "ambient" },
      { id: "ambient/energy", name: "Ambient - Energy", category: "ambient" },
      { id: "piano/gentle", name: "Piano - Gentle", category: "piano" },
      { id: "piano/motivating", name: "Piano - Motivating", category: "piano" },
      { id: "nature/peaceful", name: "Nature - Peaceful", category: "nature" },
      {
        id: "solfeggio/528hz",
        name: "Solfeggio - 528Hz",
        category: "solfeggio",
      },
    ];

    return c.json({ success: true, styles });
  } catch (error) {
    console.error("Error fetching music styles:", error);
    return c.json(
      {
        success: false,
        error: "Failed to fetch music styles",
      },
      500
    );
  }
});

// Get background music file
app.get("/api/background-music/:style", async (c) => {
  try {
    const style = c.req.param("style");
    const storageKey = `background-music/${style}.mp3`;

    // Get file from R2
    const object = await c.env.R2_BUCKET.get(storageKey);

    if (!object) {
      return c.json({ error: "Music file not found" }, 404);
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("etag", object.httpEtag);
    headers.set("Content-Type", "audio/mpeg");

    return c.body(object.body, { headers });
  } catch (error) {
    console.error("Error serving background music:", error);
    return c.json({ error: "Failed to serve music" }, 500);
  }
});

// Get custom background music
app.get("/api/background-music/custom/:userId/:filename", async (c) => {
  try {
    const userId = c.req.param("userId");
    const filename = c.req.param("filename");
    const storageKey = `background-music/custom/${userId}/${filename}`;

    // Get file from R2
    const object = await c.env.R2_BUCKET.get(storageKey);

    if (!object) {
      return c.json({ error: "Music file not found" }, 404);
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("etag", object.httpEtag);
    headers.set("Content-Type", "audio/mpeg");

    return c.body(object.body, { headers });
  } catch (error) {
    console.error("Error serving custom background music:", error);
    return c.json({ error: "Failed to serve music" }, 500);
  }
});

// Upload custom background music
app.post("/api/background-music/upload", async (c) => {
  try {
    const formData = await c.req.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return c.json({ error: "No audio file provided" }, 400);
    }

    const userId = "user_123";
    const timestamp = Date.now();
    const originalFilename = audioFile.name;
    const fileExtension = originalFilename.split(".").pop() || "mp3";
    const storageKey = `background-music/custom/${userId}/${timestamp}.${fileExtension}`;

    // Upload to R2
    const arrayBuffer = await audioFile.arrayBuffer();
    await c.env.R2_BUCKET.put(storageKey, arrayBuffer, {
      httpMetadata: {
        contentType: audioFile.type || "audio/mpeg",
      },
    });

    // Update user preferences with custom music URL
    await c.env.DB.prepare(
      `
      UPDATE user_preferences 
      SET background_music_url = ?, updated_at = datetime('now')
      WHERE user_id = ? AND id = (SELECT id FROM user_preferences WHERE user_id = ? ORDER BY created_at DESC LIMIT 1)
    `
    )
      .bind(storageKey, userId, userId)
      .run();

    return c.json({
      success: true,
      storage_url: storageKey,
      audio_url: `/api/background-music/custom/${userId}/${timestamp}.${fileExtension}`,
    });
  } catch (error) {
    console.error("Background music upload error:", error);
    return c.json({ error: "Failed to upload music" }, 500);
  }
});

export default app;
