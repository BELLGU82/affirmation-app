import { useState, useEffect } from "react";
import GradientBackground from "@/react-app/components/GradientBackground";
import BottomNavigation from "@/react-app/components/BottomNavigation";
import Button from "@/react-app/components/Button";
import NotificationsModal, {
  NotificationSettings,
} from "@/react-app/components/NotificationsModal";
import MoodTrackingHistory from "@/react-app/components/MoodTrackingHistory";
import { useAudioSettings } from "@/react-app/hooks/useAudioSettings";
import { useProfile } from "@/react-app/hooks/useProfile";
import {
  User,
  Volume2,
  Bell,
  Moon,
  Heart,
  Crown,
  HelpCircle,
  Mail,
  Shield,
  ChevronRight,
  LogOut,
  Play,
  Music,
  AlertCircle,
  X,
  Trash2,
  Loader2,
  Mic,
  Pause,
  Plus,
  Check,
} from "lucide-react";
import VoiceRecorder from "@/react-app/components/VoiceRecorder";
import { useVoiceSamples } from "@/react-app/hooks/useVoiceSamples";

export default function Settings() {
  const {
    settings,
    loading,
    updateAutoplay,
    updateBackgroundMusic,
    updateBackgroundMusicVolume,
    updateMasterVolume,
  } = useAudioSettings();

  const {
    profile,
    preferences,
    loading: profileLoading,
    updateProfile,
    updatePreferences,
  } = useProfile();

  // Note: MoodTrackingHistory uses useMoodTracking hook directly, so we don't need it here

  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMoodTracking, setShowMoodTracking] = useState(false);
  const [showVoiceSelection, setShowVoiceSelection] = useState(false);
  const [editedProfile, setEditedProfile] = useState(profile);
  const [editedPreferences, setEditedPreferences] = useState(preferences);
  const [clearingData, setClearingData] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showRecorder, setShowRecorder] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newInterest, setNewInterest] = useState("");
  const [uploadingMusic, setUploadingMusic] = useState(false);
  const [musicUploadSuccess, setMusicUploadSuccess] = useState(false);
  const [customMusicList, setCustomMusicList] = useState<
    Array<{
      filename: string;
      storage_url: string;
      audio_url: string;
      uploaded_at: string | null;
      size: number;
    }>
  >([]);
  const [loadingMusicList, setLoadingMusicList] = useState(false);
  const [deletingMusic, setDeletingMusic] = useState<string | null>(null);

  const {
    playingVoice,
    loading: voiceLoading,
    playVoiceSample,
  } = useVoiceSamples();

  // Load custom music list
  const loadCustomMusicList = async () => {
    setLoadingMusicList(true);
    try {
      const response = await fetch("/api/background-music/custom");
      const data = await response.json();
      console.log("Custom music list response:", data);
      if (data.success && data.musicFiles) {
        setCustomMusicList(data.musicFiles);
        console.log(`Loaded ${data.musicFiles.length} custom music files`);
      } else {
        console.warn("Failed to load custom music list:", data);
        setCustomMusicList([]);
      }
    } catch (error) {
      console.error("Error loading custom music list:", error);
      setCustomMusicList([]);
    } finally {
      setLoadingMusicList(false);
    }
  };

  // Delete custom music
  const handleDeleteMusic = async (filename: string) => {
    setDeletingMusic(filename);
    try {
      const userId = "user_123";
      const response = await fetch(
        `/api/background-music/custom/${userId}/${filename}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        // Reload the list
        await loadCustomMusicList();
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.error || "Failed to delete music file");
      }
    } catch (error) {
      console.error("Error deleting music:", error);
      alert("Error deleting music file. Please try again.");
    } finally {
      setDeletingMusic(null);
    }
  };

  // Load music list when component mounts
  useEffect(() => {
    loadCustomMusicList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Load on mount only

  // Also reload when music is uploaded successfully
  useEffect(() => {
    if (musicUploadSuccess) {
      loadCustomMusicList();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [musicUploadSuccess]);

  // Voice options matching VoiceSetup
  const voiceOptions = [
    {
      id: "sarah",
      name: "Sarah",
      description: "Warm and nurturing",
      gender: "female",
      previewText: "I am worthy of love and respect. My voice matters.",
    },
    {
      id: "alex",
      name: "Alex",
      description: "Confident and clear",
      gender: "male",
      previewText: "I am capable of achieving my goals. I trust my abilities.",
    },
    {
      id: "maya",
      name: "Maya",
      description: "Gentle and soothing",
      gender: "female",
      previewText: "I am gentle with myself. I choose peace and understanding.",
    },
    {
      id: "james",
      name: "James",
      description: "Deep and calming",
      gender: "male",
      previewText: "I am calm and centered. I navigate challenges with wisdom.",
    },
    {
      id: "luna",
      name: "Luna",
      description: "Peaceful and wise",
      gender: "female",
      previewText: "I am peaceful and wise. I trust the journey ahead.",
    },
  ];

  interface CustomVoice {
    id: number;
    voice_type: string;
    original_filename?: string;
    is_active: boolean;
    created_at?: string;
  }

  const [customVoices, setCustomVoices] = useState<CustomVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>(
    preferences.selected_voice || "sarah"
  );

  // Load custom voices on mount
  useEffect(() => {
    const loadCustomVoices = async () => {
      try {
        const response = await fetch("/api/user-voices");
        if (response.ok) {
          const voices = await response.json();
          setCustomVoices(voices);
        }
      } catch (error) {
        console.error("Failed to load custom voices:", error);
      }
    };

    if (showVoiceSelection) {
      loadCustomVoices();
    }
  }, [showVoiceSelection]);

  // Load selected voice from preferences
  useEffect(() => {
    const voice = preferences.selected_voice;
    if (voice) {
      setSelectedVoice(voice);
    }
  }, [preferences]);

  // Notification settings state
  const [notificationSettings, setNotificationSettings] =
    useState<NotificationSettings>({
      dailyReminder: true,
      reminderTime: "09:00",
      newAffirmations: true,
      moodTracking: true,
      weeklySummary: false,
    });

  // Load notification settings from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("notification-settings");
      if (stored) {
        setNotificationSettings(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Error loading notification settings:", error);
    }
  }, []);

  const handleSaveNotifications = (settings: NotificationSettings) => {
    setNotificationSettings(settings);
    try {
      localStorage.setItem("notification-settings", JSON.stringify(settings));
    } catch (error) {
      console.error("Error saving notification settings:", error);
    }
  };
  const handleSaveProfile = async () => {
    try {
      await updateProfile(editedProfile);
      setShowProfileEdit(false);
    } catch (error) {
      console.error("Failed to save profile:", error);
      // Modal stays open on error so user can retry
    }
  };

  const handleSavePreferences = async () => {
    try {
      await updatePreferences(editedPreferences);
      setShowPreferences(false);
    } catch (error) {
      console.error("Failed to save preferences:", error);
      // Modal stays open on error so user can retry
    }
  };

  const handleVoiceRecorded = async (audioBlob: Blob, filename: string) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, filename);

      const response = await fetch("/api/user-voices/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const newVoice = await response.json();
        setCustomVoices((prev) => [...prev, newVoice]);
        setSelectedVoice(`custom_${newVoice.id}`);
        setShowRecorder(false);
      } else {
        console.error("Failed to upload voice");
      }
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveVoiceSelection = async () => {
    try {
      await updatePreferences({
        ...editedPreferences,
        selected_voice: selectedVoice,
      });
      setShowVoiceSelection(false);
    } catch (error) {
      console.error("Failed to save voice selection:", error);
    }
  };

  const handleClearAllData = async () => {
    setClearingData(true);
    try {
      const response = await fetch("/api/clear-all-data", {
        method: "DELETE",
      });

      const data = await response.json();
      if (data.success) {
        // Clear localStorage as well
        localStorage.clear();
        // Reload the page to reset everything
        window.location.reload();
      } else {
        alert("Failed to clear data: " + (data.error || "Unknown error"));
        setClearingData(false);
      }
    } catch (error) {
      console.error("Error clearing data:", error);
      alert("Failed to clear data. Please try again.");
      setClearingData(false);
    }
    setShowClearConfirm(false);
  };

  const otherSettingsGroups = [
    {
      title: "Profile",
      items: [
        {
          icon: User,
          label: "Edit Profile",
          action: () => setShowProfileEdit(true),
        },
        {
          icon: Crown,
          label: "Upgrade to Premium",
          action: () => {},
          highlight: true,
        },
      ],
    },
    {
      title: "Preferences",
      items: [
        {
          icon: Bell,
          label: "Notifications",
          action: () => setShowNotifications(true),
        },
        {
          icon: Moon,
          label: "Focus Areas & Preferences",
          action: () => setShowPreferences(true),
        },
        {
          icon: Volume2,
          label: "Voice Selection",
          action: () => setShowVoiceSelection(true),
        },
        {
          icon: Heart,
          label: "Mood Tracking",
          action: () => setShowMoodTracking(true),
        },
      ],
    },
    {
      title: "Support",
      items: [
        { icon: HelpCircle, label: "Help Center", action: () => {} },
        { icon: Mail, label: "Contact Us", action: () => {} },
        { icon: Shield, label: "Privacy Policy", action: () => {} },
      ],
    },
  ];

  return (
    <GradientBackground>
      <div className="min-h-screen pb-20">
        {/* Header */}
        <div className="px-6 pt-12 pb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-8">Settings</h1>

          {/* Profile Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg shadow-indigo-500/5 border border-gray-200/50 mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-full flex items-center justify-center shadow-lg">
                <img
                  src="/logo.png"
                  alt="Profile"
                  className="w-8 h-8 opacity-90"
                />
              </div>

              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">
                  {profile.name
                    ? `Welcome back, ${profile.name}!`
                    : "Welcome back!"}
                </h3>
                <p className="text-gray-600 text-sm">
                  {profile.is_premium ? "Premium plan" : "Free plan"} • 7 day
                  streak
                </p>
              </div>

              <div className="bg-gradient-to-r from-indigo-100 to-purple-100 px-3 py-1 rounded-lg">
                <span className="text-xs font-medium text-indigo-700">
                  🔥 Streak
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Audio Settings */}
        <div className="px-6 space-y-8">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
              <Volume2 size={20} />
              <span>Audio & Playback</span>
            </h2>

            <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 space-y-6">
              {/* Autoplay Setting */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Play size={16} className="text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">Autoplay Next</h3>
                    <p className="text-sm text-gray-600">
                      Continue to next affirmation automatically
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => updateAutoplay(!settings.autoplay)}
                  disabled={loading}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    settings.autoplay ? "bg-indigo-600" : "bg-gray-300"
                  } ${loading ? "opacity-50" : ""}`}
                >
                  <div
                    className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform ${
                      settings.autoplay ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              {/* Background Music Setting */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Music size={16} className="text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">
                      Background Music
                    </h3>
                    <p className="text-sm text-gray-600">
                      Play ambient music during affirmations
                    </p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    updateBackgroundMusic(!settings.backgroundMusic)
                  }
                  disabled={loading}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    settings.backgroundMusic ? "bg-purple-600" : "bg-gray-300"
                  } ${loading ? "opacity-50" : ""}`}
                >
                  <div
                    className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform ${
                      settings.backgroundMusic
                        ? "translate-x-6"
                        : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              {/* Master Volume */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-800">Master Volume</h3>
                  <span className="text-sm text-gray-600">
                    {Math.round(settings.masterVolume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.masterVolume}
                  onChange={(e) =>
                    updateMasterVolume(parseFloat(e.target.value))
                  }
                  disabled={loading}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider disabled:opacity-50"
                />
              </div>

              {/* Background Music Volume */}
              {settings.backgroundMusic && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-800">
                      Background Music Volume
                    </h3>
                    <span className="text-sm text-gray-600">
                      {Math.round(settings.backgroundMusicVolume * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={settings.backgroundMusicVolume}
                    onChange={(e) =>
                      updateBackgroundMusicVolume(parseFloat(e.target.value))
                    }
                    disabled={loading}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider disabled:opacity-50"
                  />
                </div>
              )}

              {/* Background Music Style Selection */}
              {settings.backgroundMusic && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Music Style
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      defaultValue="auto"
                    >
                      <option value="auto">Auto (based on mood & focus)</option>
                      <option value="ambient/calm">Ambient - Calm</option>
                      <option value="ambient/energy">Ambient - Energy</option>
                      <option value="piano/gentle">Piano - Gentle</option>
                      <option value="piano/motivating">
                        Piano - Motivating
                      </option>
                      <option value="nature/peaceful">Nature - Peaceful</option>
                      <option value="solfeggio/528hz">Solfeggio - 528Hz</option>
                      <option value="custom">Custom Upload</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Music will be selected automatically based on your focus
                      area and emotional state
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Custom Music
                    </label>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setUploadingMusic(true);
                          setMusicUploadSuccess(false);
                          try {
                            const formData = new FormData();
                            formData.append("audio", file);

                            const response = await fetch(
                              "/api/background-music/upload",
                              {
                                method: "POST",
                                body: formData,
                              }
                            );

                            if (response.ok) {
                              const data = await response.json();
                              console.log("Custom music uploaded:", data);

                              // Update preferences with the new background music URL
                              // The API already saves it to user_preferences, but we should refresh
                              // to ensure UI is in sync
                              try {
                                await updatePreferences({
                                  ...editedPreferences,
                                });
                                setMusicUploadSuccess(true);
                                // Reload music list
                                await loadCustomMusicList();

                                // Clear success message after 3 seconds
                                setTimeout(() => {
                                  setMusicUploadSuccess(false);
                                }, 3000);
                              } catch (prefError) {
                                console.error(
                                  "Failed to update preferences:",
                                  prefError
                                );
                              }
                            } else {
                              const errorData = await response
                                .json()
                                .catch(() => ({}));
                              console.error(
                                "Failed to upload music:",
                                errorData.error || "Unknown error"
                              );
                              alert(
                                "Failed to upload music. Please try again."
                              );
                            }
                          } catch (error) {
                            console.error("Error uploading music:", error);
                            alert("Error uploading music. Please try again.");
                          } finally {
                            setUploadingMusic(false);
                            // Reset file input
                            e.target.value = "";
                          }
                        }
                      }}
                      disabled={uploadingMusic}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    {uploadingMusic && (
                      <p className="text-xs text-indigo-600 mt-1 flex items-center gap-2">
                        <Loader2 size={12} className="animate-spin" />
                        Uploading music...
                      </p>
                    )}
                    {musicUploadSuccess && (
                      <p className="text-xs text-green-600 mt-1 flex items-center gap-2">
                        <Check size={12} />
                        Music uploaded successfully! It will be used in new
                        affirmations.
                      </p>
                    )}
                    {!uploadingMusic && !musicUploadSuccess && (
                      <p className="text-xs text-gray-500 mt-1">
                        Upload your own background music file (MP3, WAV, etc.)
                      </p>
                    )}
                  </div>

                  {/* Custom Music List */}
                  {customMusicList.length > 0 && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Custom Music Files ({customMusicList.length})
                      </label>
                      <div className="space-y-2">
                        {customMusicList.map((music) => (
                          <div
                            key={music.filename}
                            className="flex items-center justify-between p-3 bg-white/60 border border-gray-200/50 rounded-lg"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-800 truncate">
                                {music.filename}
                              </p>
                              {music.uploaded_at && (
                                <p className="text-xs text-gray-500">
                                  Uploaded:{" "}
                                  {new Date(music.uploaded_at).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2 ml-3">
                              <button
                                onClick={() => handleDeleteMusic(music.filename)}
                                disabled={deletingMusic === music.filename}
                                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                title="Delete"
                              >
                                {deletingMusic === music.filename ? (
                                  <Loader2 size={16} className="animate-spin" />
                                ) : (
                                  <Trash2 size={16} />
                                )}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {loadingMusicList && (
                    <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                      <Loader2 size={16} className="animate-spin" />
                      Loading music files...
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Other Settings Groups */}
          {otherSettingsGroups.map((group) => (
            <div key={group.title}>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                {group.title}
              </h2>

              <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 overflow-hidden">
                {group.items.map((item, index) => (
                  <button
                    key={item.label}
                    onClick={item.action}
                    className={`w-full p-4 flex items-center space-x-4 text-left hover:bg-white/50 transition-colors ${
                      index !== group.items.length - 1
                        ? "border-b border-gray-200/30"
                        : ""
                    } ${item.highlight ? "bg-gradient-to-r from-indigo-50 to-purple-50" : ""}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        item.highlight
                          ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <item.icon size={18} />
                    </div>

                    <div className="flex-1">
                      <span
                        className={`font-medium ${
                          item.highlight ? "text-indigo-700" : "text-gray-800"
                        }`}
                      >
                        {item.label}
                      </span>
                    </div>

                    <ChevronRight size={16} className="text-gray-400" />
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Danger Zone */}
          <div>
            <h2 className="text-lg font-semibold text-red-600 mb-4">
              Danger Zone
            </h2>
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-red-200/50 overflow-hidden">
              <button
                onClick={() => setShowClearConfirm(true)}
                disabled={clearingData}
                className="w-full p-4 flex items-center space-x-4 text-left hover:bg-red-50/50 transition-colors disabled:opacity-50"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-100 text-red-600">
                  <Trash2 size={18} />
                </div>
                <div className="flex-1">
                  <span className="font-medium text-red-700">
                    Clear All Data
                  </span>
                  <p className="text-xs text-red-600 mt-1">
                    Delete all affirmations, preferences, and voice recordings
                  </p>
                </div>
                {clearingData ? (
                  <Loader2 size={16} className="text-red-600 animate-spin" />
                ) : (
                  <ChevronRight size={16} className="text-red-400" />
                )}
              </button>
            </div>
          </div>

          {/* App Info */}
          <div className="text-center space-y-4 py-8">
            <div className="text-sm text-gray-500">Affirm v1.0.0</div>

            <Button
              variant="ghost"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut size={18} />
              Sign Out
            </Button>
          </div>
        </div>

        <BottomNavigation />
      </div>

      {/* Profile Edit Modal */}
      {showProfileEdit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Edit Profile
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={editedProfile.name || ""}
                  onChange={(e) =>
                    setEditedProfile((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={editedProfile.email || ""}
                  onChange={(e) =>
                    setEditedProfile((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age
                </label>
                <input
                  type="text"
                  value={
                    editedProfile.age !== undefined
                      ? editedProfile.age.toString()
                      : ""
                  }
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    // Allow empty input
                    if (inputValue === "") {
                      setEditedProfile((prev) => ({
                        ...prev,
                        age: undefined,
                      }));
                      return;
                    }
                    // Only allow numeric input (allow typing numbers freely)
                    if (/^\d*$/.test(inputValue)) {
                      const numValue = parseInt(inputValue, 10);
                      // Store the number if it's valid, even if out of range (user might still be typing)
                      if (!isNaN(numValue)) {
                        setEditedProfile((prev) => ({
                          ...prev,
                          age: numValue,
                        }));
                      }
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter your age"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Must be between 13 and 120
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender
                </label>
                <select
                  value={editedProfile.gender || ""}
                  onChange={(e) =>
                    setEditedProfile((prev) => ({
                      ...prev,
                      gender: e.target.value || undefined,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Prefer not to say</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="non-binary">Non-binary</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profession
                </label>
                <input
                  type="text"
                  maxLength={100}
                  value={editedProfile.profession || ""}
                  onChange={(e) =>
                    setEditedProfile((prev) => ({
                      ...prev,
                      profession: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter your profession"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {editedProfile.profession?.length || 0}/100 characters
                </p>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => setShowProfileEdit(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleSaveProfile}
                disabled={profileLoading}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Preferences Modal */}
      {showPreferences && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Preferences
            </h3>

            <div className="space-y-6">
              {/* Focus Areas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Focus Areas
                </label>
                <div className="space-y-2">
                  {[
                    "mindfulness",
                    "confidence",
                    "self-love",
                    "motivation",
                    "anxiety",
                    "stress",
                  ].map((area) => (
                    <label key={area} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editedPreferences.focus_areas.includes(area)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setEditedPreferences((prev) => ({
                              ...prev,
                              focus_areas: [...prev.focus_areas, area],
                            }));
                          } else {
                            setEditedPreferences((prev) => ({
                              ...prev,
                              focus_areas: prev.focus_areas.filter(
                                (a) => a !== area
                              ),
                            }));
                          }
                        }}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 capitalize">
                        {area}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Emotional State */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Emotional State
                </label>
                <select
                  value={editedPreferences.emotional_state}
                  onChange={(e) =>
                    setEditedPreferences((prev) => ({
                      ...prev,
                      emotional_state: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="happy">Happy</option>
                  <option value="neutral">Neutral</option>
                  <option value="stressed">Stressed</option>
                  <option value="anxious">Anxious</option>
                  <option value="sad">Sad</option>
                  <option value="motivated">Motivated</option>
                </select>
              </div>

              {/* Preferred Tone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Tone
                </label>
                <select
                  value={editedPreferences.preferred_tone}
                  onChange={(e) =>
                    setEditedPreferences((prev) => ({
                      ...prev,
                      preferred_tone: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="gentle">Gentle</option>
                  <option value="empowering">Empowering</option>
                  <option value="nurturing">Nurturing</option>
                  <option value="motivating">Motivating</option>
                  <option value="calming">Calming</option>
                </select>
              </div>

              {/* Style */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Style
                </label>
                <select
                  value={editedPreferences.style}
                  onChange={(e) =>
                    setEditedPreferences((prev) => ({
                      ...prev,
                      style: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="inspirational">Inspirational</option>
                  <option value="practical">Practical</option>
                  <option value="spiritual">Spiritual</option>
                  <option value="scientific">Scientific</option>
                  <option value="poetic">Poetic</option>
                </select>
              </div>

              {/* Interests */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Interests
                </label>
                {/* Add new interest input */}
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && newInterest.trim()) {
                        e.preventDefault();
                        const trimmedInterest = newInterest
                          .trim()
                          .toLowerCase();
                        const currentInterests =
                          editedPreferences.interests || [];
                        // Check for duplicates (case-insensitive)
                        if (
                          !currentInterests.some(
                            (i) => i.toLowerCase() === trimmedInterest
                          )
                        ) {
                          setEditedPreferences((prev) => ({
                            ...prev,
                            interests: [...currentInterests, trimmedInterest],
                          }));
                          setNewInterest("");
                        }
                      }
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    placeholder="Add new interest..."
                  />
                  <button
                    onClick={() => {
                      if (newInterest.trim()) {
                        const trimmedInterest = newInterest
                          .trim()
                          .toLowerCase();
                        const currentInterests =
                          editedPreferences.interests || [];
                        // Check for duplicates (case-insensitive)
                        if (
                          !currentInterests.some(
                            (i) => i.toLowerCase() === trimmedInterest
                          )
                        ) {
                          setEditedPreferences((prev) => ({
                            ...prev,
                            interests: [...currentInterests, trimmedInterest],
                          }));
                          setNewInterest("");
                        }
                      }
                    }}
                    disabled={!newInterest.trim()}
                    className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                    title="Add interest"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <div className="space-y-2">
                  {[
                    "technology",
                    "health & wellness",
                    "art & creativity",
                    "music",
                    "sports",
                    "travel",
                    "reading",
                    "cooking",
                    "photography",
                    "nature",
                    "meditation",
                    "fitness",
                  ].map((interest) => (
                    <label key={interest} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={
                          editedPreferences.interests?.includes(interest) ||
                          false
                        }
                        onChange={(e) => {
                          const currentInterests =
                            editedPreferences.interests || [];
                          if (e.target.checked) {
                            setEditedPreferences((prev) => ({
                              ...prev,
                              interests: [...currentInterests, interest],
                            }));
                          } else {
                            setEditedPreferences((prev) => ({
                              ...prev,
                              interests: currentInterests.filter(
                                (i) => i !== interest
                              ),
                            }));
                          }
                        }}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 capitalize">
                        {interest}
                      </span>
                    </label>
                  ))}
                  {/* Custom interests (added by user) */}
                  {editedPreferences.interests
                    ?.filter(
                      (interest) =>
                        ![
                          "technology",
                          "health & wellness",
                          "art & creativity",
                          "music",
                          "sports",
                          "travel",
                          "reading",
                          "cooking",
                          "photography",
                          "nature",
                          "meditation",
                          "fitness",
                        ].includes(interest.toLowerCase())
                    )
                    .map((interest) => (
                      <label key={interest} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={true}
                          onChange={(e) => {
                            const currentInterests =
                              editedPreferences.interests || [];
                            if (!e.target.checked) {
                              setEditedPreferences((prev) => ({
                                ...prev,
                                interests: currentInterests.filter(
                                  (i) => i !== interest
                                ),
                              }));
                            }
                          }}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="ml-2 text-sm text-gray-700 capitalize">
                          {interest}
                        </span>
                      </label>
                    ))}
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => setShowPreferences(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleSavePreferences}
                disabled={profileLoading}
              >
                Save Preferences
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Modal */}
      <NotificationsModal
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        settings={notificationSettings}
        onSave={handleSaveNotifications}
      />

      {/* Mood Tracking History Modal */}
      {showMoodTracking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Heart size={20} className="text-indigo-600" />
                Mood Tracking History
              </h3>
              <button
                onClick={() => setShowMoodTracking(false)}
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <MoodTrackingHistory userId="user_123" />
          </div>
        </div>
      )}

      {/* Voice Selection Modal */}
      {showVoiceSelection && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Volume2 size={20} className="text-indigo-600" />
                Voice Selection
              </h3>
              <button
                onClick={() => setShowVoiceSelection(false)}
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 mb-6">
              {/* Demo Voices */}
              {voiceOptions.map((voice) => (
                <div
                  key={voice.id}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                    selectedVoice === voice.id
                      ? "border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-lg"
                      : "border-gray-200 bg-white/80 backdrop-blur-sm"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setSelectedVoice(voice.id)}
                      className="flex-1 text-left"
                    >
                      <div className="font-medium text-gray-800 mb-1">
                        {voice.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {voice.description}
                      </div>
                    </button>

                    <button
                      onClick={async () => {
                        try {
                          const previewUrl = `/api/text-to-speech/preview`;
                          const response = await fetch(previewUrl, {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                              text: voice.previewText,
                              voiceName: voice.id,
                              language: "en",
                            }),
                          });

                          if (response.ok) {
                            const audioBlob = await response.blob();
                            const blobUrl = URL.createObjectURL(audioBlob);
                            await playVoiceSample(voice.id, blobUrl);
                          } else {
                            console.error("Failed to generate preview");
                          }
                        } catch (error) {
                          console.error("Failed to play voice:", error);
                        }
                      }}
                      disabled={voiceLoading}
                      className="ml-4 w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50"
                      title={
                        playingVoice === voice.id
                          ? "Click to stop"
                          : "Click to preview"
                      }
                    >
                      {voiceLoading && playingVoice === voice.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : playingVoice === voice.id ? (
                        <Pause size={16} />
                      ) : (
                        <Play size={16} />
                      )}
                    </button>
                  </div>
                </div>
              ))}

              {/* Custom voices */}
              {customVoices.map((voice) => (
                <div
                  key={`custom_${voice.id}`}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                    selectedVoice === `custom_${voice.id}`
                      ? "border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg"
                      : "border-gray-200 bg-white/80 backdrop-blur-sm"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setSelectedVoice(`custom_${voice.id}`)}
                      className="flex-1 text-left"
                    >
                      <div className="font-medium text-gray-800 mb-1 flex items-center gap-2">
                        <Mic size={16} className="text-green-600" />
                        My Voice
                      </div>
                      <div className="text-sm text-gray-600">
                        Your personalized voice
                      </div>
                    </button>

                    <button
                      onClick={() =>
                        playVoiceSample(
                          `custom_${voice.id}`,
                          `/api/user-voices/${voice.id}/audio`
                        )
                      }
                      disabled={voiceLoading}
                      className="ml-4 w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50"
                    >
                      {voiceLoading && playingVoice === `custom_${voice.id}` ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : playingVoice === `custom_${voice.id}` ? (
                        <Pause size={16} />
                      ) : (
                        <Play size={16} />
                      )}
                    </button>
                  </div>
                </div>
              ))}

              {/* Add custom voice button */}
              <button
                onClick={() => setShowRecorder(true)}
                disabled={uploading}
                className="w-full p-4 rounded-xl border-2 border-dashed border-gray-300 bg-white/80 backdrop-blur-sm hover:border-indigo-400 hover:bg-indigo-50/50 transition-all duration-300 disabled:opacity-50"
              >
                <div className="flex items-center justify-center gap-3 text-gray-600 hover:text-indigo-600">
                  <Mic size={20} />
                  <span className="font-medium">
                    {uploading ? "Uploading..." : "Record My Voice"}
                  </span>
                </div>
              </button>
            </div>

            <div className="flex space-x-3">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => setShowVoiceSelection(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleSaveVoiceSelection}
                disabled={profileLoading}
              >
                Save Voice
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Voice Recorder Modal */}
      {showRecorder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <VoiceRecorder
            onVoiceRecorded={handleVoiceRecorded}
            onCancel={() => setShowRecorder(false)}
          />
        </div>
      )}

      {/* Clear All Data Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-red-700 flex items-center gap-2">
                <AlertCircle size={20} className="text-red-600" />
                Clear All Data
              </h3>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-gray-700">
                Are you sure you want to delete all your data? This action
                cannot be undone.
              </p>
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-sm text-red-700 font-medium mb-2">
                  This will delete:
                </p>
                <ul className="text-sm text-red-600 space-y-1 list-disc list-inside">
                  <li>All affirmations</li>
                  <li>All voice recordings</li>
                  <li>All preferences</li>
                  <li>All mood tracking data</li>
                  <li>All audio files</li>
                </ul>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => setShowClearConfirm(false)}
                disabled={clearingData}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                onClick={handleClearAllData}
                disabled={clearingData}
              >
                {clearingData ? (
                  <>
                    <Loader2 size={18} className="animate-spin mr-2" />
                    Clearing...
                  </>
                ) : (
                  <>
                    <Trash2 size={18} className="mr-2" />
                    Delete All
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </GradientBackground>
  );
}

