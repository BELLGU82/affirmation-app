import { useEffect } from "react";
import GradientBackground from "@/react-app/components/GradientBackground";
import BottomNavigation from "@/react-app/components/BottomNavigation";
import Button from "@/react-app/components/Button";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Heart,
  Volume2,
  Settings,
  AlertCircle,
} from "lucide-react";
import { useAffirmations } from "@/react-app/hooks/useAffirmations";
import { useAudioPlayer } from "@/react-app/hooks/useAudioPlayer";
import { useAudioSettings } from "@/react-app/hooks/useAudioSettings";

export default function Player() {
  const {
    affirmations,
    currentAffirmation,
    currentIndex,
    hasNext,
    hasPrevious,
    nextAffirmation,
    previousAffirmation,
    toggleFavorite,
    setAffirmation,
    loadAffirmations,
  } = useAffirmations();

  const { settings, updateMasterVolume } = useAudioSettings();

  const {
    isPlaying,
    currentTime,
    duration,
    loading,
    error,
    loadAudio,
    togglePlayback,
    seek,
  } = useAudioPlayer(() => {
    // Auto-advance to next affirmation when current ends
    if (hasNext && settings.autoplay) {
      nextAffirmation();
    }
  });

  // Check for affirmation from localStorage on mount (from Favorites)
  // If no stored affirmation, load from server
  useEffect(() => {
    const storedAffirmation = localStorage.getItem("currentAffirmation");
    if (storedAffirmation) {
      try {
        const affirmation = JSON.parse(storedAffirmation);
        setAffirmation(affirmation);
        localStorage.removeItem("currentAffirmation"); // Clean up
      } catch (err) {
        console.error("Error parsing stored affirmation:", err);
        // Fallback to loading from server
        loadAffirmations();
      }
    } else if (affirmations.length === 0 && !currentAffirmation) {
      // If no stored affirmation and no affirmations loaded, try to load from server
      loadAffirmations();
    }
  }, [
    setAffirmation,
    loadAffirmations,
    affirmations.length,
    currentAffirmation,
  ]);

  // Load audio when affirmation changes
  useEffect(() => {
    if (currentAffirmation) {
      const loadAudioForAffirmation = async () => {
        let audioUrl: string | undefined =
          currentAffirmation.audio_url || undefined;

        // If no audio URL, try to generate it
        if (!audioUrl && currentAffirmation.id) {
          try {
            const response = await fetch(
              `/api/affirmations/${currentAffirmation.id}/generate-audio`,
              {
                method: "POST",
              }
            );

            if (response.ok) {
              const data = await response.json();
              if (data.success && data.audioUrl) {
                audioUrl = data.audioUrl;
                // Update the affirmation in state
                // setAffirmations((prev) =>
                //   prev.map((aff) =>
                //     aff.id === currentAffirmation.id
                //       ? { ...aff, audio_url: audioUrl }
                //       : aff
                //   )
                // );
              }
            }
          } catch (error) {
            console.error("Failed to generate audio:", error);
          }
        }

        const backgroundMusicUrl =
          currentAffirmation.background_music_url || null;
        loadAudio(audioUrl || null, backgroundMusicUrl);
      };

      loadAudioForAffirmation();
    }
  }, [currentAffirmation, loadAudio, affirmations, setAffirmation]);

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mb-6">
        <Play className="w-12 h-12 text-indigo-400" />
      </div>

      <h2 className="text-xl font-bold text-gray-800 mb-3">
        No affirmation selected
      </h2>
      <p className="text-gray-600 mb-8 leading-relaxed">
        Generate your first affirmation to start listening.
      </p>

      <Button onClick={() => (window.location.href = "/home")} size="lg">
        Go to Home
      </Button>
    </div>
  );

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseInt(e.target.value);
    seek(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    updateMasterVolume(newVolume);
  };

  const handleToggleFavorite = async () => {
    if (currentAffirmation) {
      await toggleFavorite(currentIndex);
    }
  };

  if (!currentAffirmation) {
    return (
      <GradientBackground>
        <div className="min-h-screen pb-20">
          <EmptyState />
          <BottomNavigation />
        </div>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <div className="min-h-screen pb-20">
        {/* Header */}
        <div className="px-6 pt-12 pb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Now Playing</h1>
            <Button variant="ghost" size="sm">
              <Settings size={20} />
            </Button>
          </div>
        </div>

        {/* Main Player */}
        <div className="px-6">
          {/* Affirmation Visual */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl shadow-indigo-500/10 border border-gray-200/50 mb-8">
            <div className="text-center">
              {/* Large Audio Visualization */}
              <div className="relative w-48 h-48 mx-auto mb-8">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rounded-full animate-pulse" />
                <div className="absolute inset-4 bg-gradient-to-br from-indigo-500/30 to-purple-600/30 rounded-full animate-pulse delay-150" />
                <div className="absolute inset-8 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-full flex items-center justify-center shadow-2xl shadow-indigo-500/30">
                  <img
                    src="https://mocha-cdn.com/019a3fa6-c7d9-7206-8da1-fb9db5ce726d/record.png"
                    alt="Audio Visualization"
                    className="w-16 h-16 opacity-90"
                  />

                  {/* Play button overlay */}
                  {!isPlaying && (
                    <div className="absolute inset-0 bg-black/20 rounded-full flex items-center justify-center">
                      <Play className="w-8 h-8 text-white" />
                    </div>
                  )}
                </div>
              </div>

              <p className="text-lg text-gray-800 leading-relaxed mb-6 font-medium">
                "{currentAffirmation.text}"
              </p>

              {/* Audio Status */}
              {error && (
                <div className="mb-6 bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center space-x-3">
                  <AlertCircle
                    size={20}
                    className="text-orange-600 flex-shrink-0"
                  />
                  <div className="text-sm text-orange-700">
                    <p className="font-medium">Audio not available</p>
                    <p>{error}</p>
                  </div>
                </div>
              )}

              {/* Progress Bar */}
              <div className="mb-6">
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  disabled={!currentAffirmation?.audio_url || error !== null}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider disabled:opacity-50"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-2">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration || 0)}</span>
                </div>
              </div>

              {/* Playback Controls */}
              <div className="flex items-center justify-center space-x-6 mb-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={previousAffirmation}
                  disabled={!hasPrevious}
                >
                  <SkipBack size={24} />
                </Button>

                <button
                  onClick={togglePlayback}
                  disabled={
                    !currentAffirmation?.audio_url || error !== null || loading
                  }
                  className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-indigo-500/30 hover:shadow-2xl transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : isPlaying ? (
                    <Pause size={28} />
                  ) : (
                    <Play size={28} />
                  )}
                </button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={nextAffirmation}
                  disabled={!hasNext}
                >
                  <SkipForward size={24} />
                </Button>
              </div>

              {/* Volume and Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  <Volume2 size={20} className="text-gray-600" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={settings.masterVolume}
                    onChange={handleVolumeChange}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>

                <button
                  onClick={handleToggleFavorite}
                  className={`w-10 h-10 bg-white/80 border border-gray-200/50 rounded-xl flex items-center justify-center transition-colors ml-4 ${
                    currentAffirmation?.is_favorite
                      ? "text-red-500 bg-red-50"
                      : "text-gray-600 hover:text-red-500 hover:bg-red-50"
                  }`}
                >
                  <Heart
                    size={20}
                    fill={
                      currentAffirmation?.is_favorite ? "currentColor" : "none"
                    }
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Affirmation Details */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
            <h3 className="font-semibold text-gray-800 mb-3">
              About this affirmation
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Focus Area:</span>
                <span className="text-gray-800 capitalize">
                  {currentAffirmation?.focus_area || "General"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tone:</span>
                <span className="text-gray-800 capitalize">
                  {currentAffirmation?.tone || "Gentle"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Generated:</span>
                <span className="text-gray-800">Today</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Position:</span>
                <span className="text-gray-800">
                  {currentIndex + 1} of {affirmations.length}
                </span>
              </div>

              {/* Settings Status */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Autoplay: {settings.autoplay ? "On" : "Off"}</span>
                  <span>
                    Background Music: {settings.backgroundMusic ? "On" : "Off"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <BottomNavigation />
      </div>
    </GradientBackground>
  );
}
