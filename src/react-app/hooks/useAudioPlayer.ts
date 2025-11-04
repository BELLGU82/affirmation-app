import { useState, useRef, useEffect, useCallback } from "react";
import { useAudioSettings } from "./useAudioSettings";

export interface AudioPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  loading: boolean;
  error: string | null;
}

export const useAudioPlayer = (onTrackEnd?: () => void) => {
  const { settings } = useAudioSettings();
  const [state, setState] = useState<AudioPlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    loading: false,
    error: null,
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null);
  const currentAudioUrl = useRef<string | null>(null);

  // Initialize audio elements
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = "metadata";
    }

    if (!backgroundMusicRef.current) {
      backgroundMusicRef.current = new Audio();
      backgroundMusicRef.current.loop = true;
      backgroundMusicRef.current.preload = "metadata";
    }

    const audio = audioRef.current;

    const handleLoadedMetadata = () => {
      setState((prev) => ({
        ...prev,
        duration: audio.duration || 0,
        loading: false,
      }));
    };

    const handleTimeUpdate = () => {
      setState((prev) => ({
        ...prev,
        currentTime: audio.currentTime,
      }));
    };

    const handleEnded = () => {
      setState((prev) => ({
        ...prev,
        isPlaying: false,
        currentTime: 0,
      }));

      if (onTrackEnd && settings.autoplay) {
        onTrackEnd();
      }
    };

    const handleError = () => {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: "Failed to load audio",
        isPlaying: false,
      }));
    };

    const handleCanPlay = () => {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: null,
      }));
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);
    audio.addEventListener("canplay", handleCanPlay);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("canplay", handleCanPlay);
    };
  }, [onTrackEnd, settings.autoplay]);

  // Update volumes when settings change
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = settings.masterVolume;
    }
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.volume = settings.backgroundMusic
        ? settings.backgroundMusicVolume
        : 0;
    }
  }, [
    settings.masterVolume,
    settings.backgroundMusic,
    settings.backgroundMusicVolume,
  ]);

  const loadAudio = useCallback(
    (audioUrl: string | null, backgroundMusicUrl?: string | null) => {
      if (!audioRef.current) return;

      setState((prev) => ({
        ...prev,
        loading: false,
        error: null,
        isPlaying: false,
      }));

      if (!audioUrl) {
        // No audio URL available - this is expected for new affirmations
        currentAudioUrl.current = null;
        audioRef.current.src = "";
        setState((prev) => ({
          ...prev,
          loading: false,
          error: "Audio will be available soon",
          duration: 0,
          currentTime: 0,
        }));
        return;
      }

      if (audioUrl !== currentAudioUrl.current) {
        setState((prev) => ({
          ...prev,
          loading: true,
          error: null,
          isPlaying: false,
        }));
        currentAudioUrl.current = audioUrl;
        audioRef.current.src = audioUrl;
        audioRef.current.load();
      }

      // Handle background music
      if (backgroundMusicRef.current) {
        if (backgroundMusicUrl && settings.backgroundMusic) {
          backgroundMusicRef.current.src = backgroundMusicUrl;
          backgroundMusicRef.current.load();
        } else {
          backgroundMusicRef.current.src = "";
        }
      }
    },
    [settings.backgroundMusic]
  );

  const play = useCallback(async () => {
    if (!audioRef.current || !currentAudioUrl.current) {
      setState((prev) => ({
        ...prev,
        error: "No audio to play",
      }));
      return;
    }

    try {
      await audioRef.current.play();
      setState((prev) => ({
        ...prev,
        isPlaying: true,
        error: null,
      }));

      // Start background music if enabled
      if (
        backgroundMusicRef.current &&
        backgroundMusicRef.current.src &&
        settings.backgroundMusic
      ) {
        try {
          await backgroundMusicRef.current.play();
        } catch (error) {
          console.warn("Background music failed to play:", error);
        }
      }
    } catch (error) {
      console.error("Audio play failed:", error);
      setState((prev) => ({
        ...prev,
        error: "Failed to play audio",
        isPlaying: false,
      }));
    }
  }, [settings.backgroundMusic]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setState((prev) => ({
        ...prev,
        isPlaying: false,
      }));
    }

    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.pause();
    }
  }, []);

  const seek = useCallback((time: number) => {
    if (audioRef.current && currentAudioUrl.current) {
      audioRef.current.currentTime = time;
      setState((prev) => ({
        ...prev,
        currentTime: time,
      }));
    }
  }, []);

  const togglePlayback = useCallback(() => {
    if (state.isPlaying) {
      pause();
    } else {
      play();
    }
  }, [state.isPlaying, play, pause]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.pause();
        backgroundMusicRef.current.src = "";
      }
    };
  }, []);

  return {
    ...state,
    loadAudio,
    play,
    pause,
    seek,
    togglePlayback,
  };
};
