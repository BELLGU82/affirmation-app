import { useState, useCallback } from "react";

export interface Affirmation {
  id?: number;
  text: string;
  audio_url?: string;
  background_music_url?: string;
  is_favorite?: boolean;
  focus_area?: string;
  emotional_state?: string;
  tone?: string;
  style?: string;
  generated_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserPreferences {
  focus_areas: string[];
  emotional_state: string;
  preferred_tone: string;
  language: string;
  style: string;
  selected_voice?: string;
  interests?: string[];
}

const DEFAULT_PREFERENCES: UserPreferences = {
  focus_areas: ["mindfulness"],
  emotional_state: "neutral",
  preferred_tone: "gentle",
  language: "en",
  style: "inspirational",
};

export const useAffirmations = () => {
  const [affirmations, setAffirmations] = useState<Affirmation[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPreferences = useCallback(async (): Promise<UserPreferences> => {
    try {
      const userId = "user_123"; // Mock user ID for now
      const response = await fetch(`/api/preferences/${userId}`);
      const data = await response.json();

      if (data.success && data.preferences) {
        return data.preferences;
      }
    } catch (err) {
      console.error("Error loading preferences:", err);
    }

    return DEFAULT_PREFERENCES;
  }, []);

  const generateAffirmations = useCallback(
    async (preferences?: UserPreferences) => {
      setLoading(true);
      setError(null);

      try {
        // If preferences not provided, try to load from API
        let prefs = preferences;
        if (!prefs) {
          prefs = await loadPreferences();
        }

        // Fallback to defaults if still no preferences
        const finalPrefs = prefs || DEFAULT_PREFERENCES;

        // Send preferences including interests if available
        const requestBody = {
          focus_areas: finalPrefs.focus_areas,
          emotional_state: finalPrefs.emotional_state,
          preferred_tone: finalPrefs.preferred_tone,
          language: finalPrefs.language,
          style: finalPrefs.style,
          ...(finalPrefs.interests &&
            finalPrefs.interests.length > 0 && {
              interests: finalPrefs.interests,
            }),
        };

        const response = await fetch("/api/affirmations/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Failed to generate affirmations");
        }

        // Save each affirmation to database and collect the results
        const userId = "user_123"; // Mock user ID for now
        const savedAffirmations: Affirmation[] = [];

        // Get selected voice from preferences (preferred) or localStorage (fallback)
        const selectedVoice =
          finalPrefs.selected_voice ||
          localStorage.getItem("selected_voice") ||
          "sarah";
        // Remove "custom_" prefix if present
        // For custom voices, we'll use default voice "sarah" for now
        // In the future, custom voices can be handled differently
        const voiceName = selectedVoice.startsWith("custom_")
          ? "sarah"
          : selectedVoice;

        for (const text of data.affirmations) {
          const saveResponse = await fetch("/api/affirmations", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              user_id: userId,
              text,
              focus_area: finalPrefs.focus_areas[0],
              emotional_state: finalPrefs.emotional_state,
              tone: finalPrefs.preferred_tone,
              style: finalPrefs.style,
              language: finalPrefs.language,
              voiceName: voiceName, // Only send if not custom voice
            }),
          });

          const saveData = await saveResponse.json();
          if (saveData.success) {
            savedAffirmations.push({
              id: saveData.id,
              text,
              audio_url: saveData.audioUrl || undefined,
              focus_area: finalPrefs.focus_areas[0],
              emotional_state: finalPrefs.emotional_state,
              tone: finalPrefs.preferred_tone,
              style: finalPrefs.style,
              is_favorite: false,
            });
          }
        }

        setAffirmations(savedAffirmations);
        setCurrentIndex(0);
      } catch (err) {
        console.error("Error generating affirmations:", err);
        setError(
          err instanceof Error ? err.message : "Failed to generate affirmations"
        );
        setAffirmations([]);
      } finally {
        setLoading(false);
      }
    },
    [loadPreferences]
  );

  const toggleFavorite = useCallback(
    async (index: number) => {
      const affirmation = affirmations[index];
      if (!affirmation || !affirmation.id) return;

      try {
        const response = await fetch(
          `/api/affirmations/${affirmation.id}/favorite`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              is_favorite: !affirmation.is_favorite,
            }),
          }
        );

        if (response.ok) {
          setAffirmations((prev) =>
            prev.map((aff, i) =>
              i === index ? { ...aff, is_favorite: !aff.is_favorite } : aff
            )
          );
        }
      } catch (err) {
        console.error("Error toggling favorite:", err);
      }
    },
    [affirmations]
  );

  const nextAffirmation = useCallback(() => {
    setCurrentIndex((prev) =>
      prev < affirmations.length - 1 ? prev + 1 : prev
    );
  }, [affirmations.length]);

  const previousAffirmation = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  const selectAffirmation = useCallback(
    (index: number) => {
      if (index >= 0 && index < affirmations.length) {
        setCurrentIndex(index);
      }
    },
    [affirmations.length]
  );

  const setAffirmation = useCallback((affirmation: Affirmation) => {
    // Set a single affirmation as the current one
    // This is useful when navigating from Favorites to Player
    setAffirmations([affirmation]);
    setCurrentIndex(0);
  }, []);

  const loadAffirmations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const userId = "user_123"; // Mock user ID for now
      const response = await fetch(`/api/affirmations/${userId}`);
      const data = await response.json();

      if (data.success && data.affirmations) {
        // Parse affirmations from database
        interface DbAffirmation {
          id?: number;
          text?: string;
          audio_url?: string;
          background_music_url?: string;
          is_favorite?: boolean | number;
          focus_area?: string;
          emotional_state?: string;
          tone?: string;
          style?: string;
          generated_at?: string;
          created_at?: string;
          updated_at?: string;
        }

        const loadedAffirmations: Affirmation[] = (
          data.affirmations as DbAffirmation[]
        ).map((aff) => {
          // Convert storage key to API URL if needed
          let audioUrl = aff.audio_url;
          if (audioUrl && audioUrl.startsWith("affirmations/") && aff.id) {
            audioUrl = `/api/affirmations/${aff.id}/audio`;
          }

          // Convert background music storage key to API URL if needed
          let backgroundMusicUrl = aff.background_music_url;
          if (backgroundMusicUrl) {
            if (
              backgroundMusicUrl.startsWith("background-music/") &&
              !backgroundMusicUrl.startsWith("background-music/custom/")
            ) {
              // Built-in music
              const style = backgroundMusicUrl
                .replace("background-music/", "")
                .replace(".mp3", "");
              backgroundMusicUrl = `/api/background-music/${style}`;
            } else if (
              backgroundMusicUrl.startsWith("background-music/custom/")
            ) {
              // Custom music
              const parts = backgroundMusicUrl
                .replace("background-music/custom/", "")
                .split("/");
              const userId = parts[0];
              const filename = parts[1];
              backgroundMusicUrl = `/api/background-music/custom/${userId}/${filename}`;
            }
          }

          return {
            id: aff.id,
            text: aff.text || "",
            audio_url: audioUrl,
            background_music_url: backgroundMusicUrl,
            is_favorite: Boolean(aff.is_favorite),
            focus_area: aff.focus_area,
            emotional_state: aff.emotional_state,
            tone: aff.tone,
            style: aff.style,
            generated_at: aff.generated_at,
            created_at: aff.created_at,
            updated_at: aff.updated_at,
          };
        });

        setAffirmations(loadedAffirmations);
        if (loadedAffirmations.length > 0) {
          setCurrentIndex(0);
        }
      }
    } catch (err) {
      console.error("Error loading affirmations:", err);
      // Don't set error for initial load - just silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAffirmation = useCallback(async (id: number, text: string) => {
    try {
      // Update the text first
      const response = await fetch(`/api/affirmations/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();
      if (data.success) {
        // Update local state with new text
        setAffirmations((prev) =>
          prev.map((aff) => (aff.id === id ? { ...aff, text } : aff))
        );

        // Regenerate audio with the new text
        try {
          const audioResponse = await fetch(
            `/api/affirmations/${id}/generate-audio`,
            {
              method: "POST",
            }
          );

          const audioData = await audioResponse.json();
          if (audioData.success && audioData.audioUrl) {
            // Reload the affirmation from server to get updated audio_url and background_music_url
            try {
              const reloadResponse = await fetch(`/api/affirmations/user_123`);
              const reloadData = await reloadResponse.json();
              if (reloadData.success && reloadData.affirmations) {
                const updatedAffirmation = reloadData.affirmations.find(
                  (aff: Affirmation) => aff.id === id
                );
                if (updatedAffirmation) {
                  // Convert storage key to API URL if needed
                  let audioUrl = updatedAffirmation.audio_url;
                  if (
                    audioUrl &&
                    audioUrl.startsWith("affirmations/") &&
                    updatedAffirmation.id
                  ) {
                    audioUrl = `/api/affirmations/${updatedAffirmation.id}/audio`;
                  }

                  // Convert background music storage key to API URL if needed
                  let backgroundMusicUrl = updatedAffirmation.background_music_url;
                  if (backgroundMusicUrl) {
                    if (
                      backgroundMusicUrl.startsWith("background-music/") &&
                      !backgroundMusicUrl.startsWith("background-music/custom/")
                    ) {
                      // Built-in music
                      const style = backgroundMusicUrl
                        .replace("background-music/", "")
                        .replace(".mp3", "");
                      backgroundMusicUrl = `/api/background-music/${style}`;
                    } else if (
                      backgroundMusicUrl.startsWith("background-music/custom/")
                    ) {
                      // Custom music
                      const parts = backgroundMusicUrl
                        .replace("background-music/custom/", "")
                        .split("/");
                      const userId = parts[0];
                      const filename = parts[1];
                      backgroundMusicUrl = `/api/background-music/custom/${userId}/${filename}`;
                    }
                  }

                  // Update local state with new text, audio URL, and background music URL
                  setAffirmations((prev) =>
                    prev.map((aff) =>
                      aff.id === id
                        ? {
                            ...aff,
                            text,
                            audio_url: audioUrl,
                            background_music_url: backgroundMusicUrl,
                          }
                        : aff
                    )
                  );
                }
              }
            } catch (reloadErr) {
              console.error("Error reloading affirmation:", reloadErr);
              // Fallback: just update with the audio URL we got
              setAffirmations((prev) =>
                prev.map((aff) =>
                  aff.id === id
                    ? { ...aff, text, audio_url: audioData.audioUrl }
                    : aff
                )
              );
            }
          }
        } catch (audioErr) {
          console.error("Error generating audio:", audioErr);
          // Don't throw - text update succeeded, audio generation failed
        }
      } else {
        throw new Error(data.error || "Failed to update affirmation");
      }
    } catch (err) {
      console.error("Error updating affirmation:", err);
      throw err;
    }
  }, []);

  const deleteAffirmation = useCallback(
    async (id: number) => {
      try {
        const response = await fetch(`/api/affirmations/${id}`, {
          method: "DELETE",
        });

        const data = await response.json();
        if (data.success) {
          setAffirmations((prev) => {
            const filtered = prev.filter((aff) => aff.id !== id);
            // Adjust current index if needed
            if (currentIndex >= filtered.length && filtered.length > 0) {
              setCurrentIndex(filtered.length - 1);
            } else if (filtered.length === 0) {
              setCurrentIndex(0);
            }
            return filtered;
          });
        } else {
          throw new Error(data.error || "Failed to delete affirmation");
        }
      } catch (err) {
        console.error("Error deleting affirmation:", err);
        throw err;
      }
    },
    [currentIndex]
  );

  const currentAffirmation = affirmations[currentIndex] || null;
  const hasNext = currentIndex < affirmations.length - 1;
  const hasPrevious = currentIndex > 0;

  return {
    affirmations,
    currentAffirmation,
    currentIndex,
    loading,
    error,
    hasNext,
    hasPrevious,
    generateAffirmations,
    loadPreferences,
    loadAffirmations,
    toggleFavorite,
    nextAffirmation,
    previousAffirmation,
    selectAffirmation,
    setAffirmation,
    updateAffirmation,
    deleteAffirmation,
  };
};
