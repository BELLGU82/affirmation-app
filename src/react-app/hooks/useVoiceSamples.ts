import { useState, useRef, useCallback } from "react";

interface VoiceSampleState {
  playingVoice: string | null;
  loading: boolean;
  error: string | null;
}

export const useVoiceSamples = () => {
  const [state, setState] = useState<VoiceSampleState>({
    playingVoice: null,
    loading: false,
    error: null,
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playVoiceSample = useCallback(
    async (voiceId: string, audioUrl: string) => {
      // Stop current audio if playing
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      // If clicking the same voice, toggle off
      if (state.playingVoice === voiceId) {
        setState((prev) => ({ ...prev, playingVoice: null }));
        return;
      }

      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        // Create new audio element if needed
        if (!audioRef.current) {
          audioRef.current = new Audio();
        }

        const audio = audioRef.current;
        audio.src = audioUrl;
        audio.volume = 0.7;

        const handleEnded = () => {
          setState((prev) => ({ ...prev, playingVoice: null }));
          audio.removeEventListener("ended", handleEnded);
        };

        const handleError = () => {
          setState((prev) => ({
            ...prev,
            playingVoice: null,
            loading: false,
            error: "Failed to play voice sample",
          }));
          audio.removeEventListener("error", handleError);
        };

        audio.addEventListener("ended", handleEnded);
        audio.addEventListener("error", handleError);

        // Try to play
        try {
          await audio.play();

          setState((prev) => ({
            ...prev,
            playingVoice: voiceId,
            loading: false,
            error: null,
          }));
        } catch (playError: unknown) {
          // Handle play errors (autoplay restrictions, etc.)
          const err = playError as { name?: string };
          if (err.name === "NotAllowedError") {
            setState((prev) => ({
              ...prev,
              playingVoice: null,
              loading: false,
              error: "Please click to play",
            }));
          } else {
            throw playError;
          }
        }
      } catch (error: unknown) {
        console.error("Voice sample playback failed:", error);

        // Only try to load if audio element exists
        if (audioRef.current) {
          try {
            audioRef.current.load();
          } catch (loadError) {
            // Ignore load errors if audio is not ready
            console.warn("Could not load audio:", loadError);
          }
        }

        // Set error but don't prevent retry
        const err = error as { message?: string };
        setState((prev) => ({
          ...prev,
          playingVoice: null,
          loading: false,
          error:
            err.message ||
            "Failed to play voice sample. The audio file may be unavailable.",
        }));
      }
    },
    [state.playingVoice]
  );

  const stopPlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setState((prev) => ({ ...prev, playingVoice: null }));
  }, []);

  return {
    ...state,
    playVoiceSample,
    stopPlayback,
  };
};
