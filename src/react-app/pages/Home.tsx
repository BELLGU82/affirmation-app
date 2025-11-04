import { useState, useEffect } from "react";
import GradientBackground from "@/react-app/components/GradientBackground";
import BottomNavigation from "@/react-app/components/BottomNavigation";
import Button from "@/react-app/components/Button";
import MoodTrackingModal from "@/react-app/components/MoodTrackingModal";
import { Plus, Play, Heart, Sparkles, Loader2, Pencil, Trash2, X, Check } from "lucide-react";
import { useAffirmations } from "@/react-app/hooks/useAffirmations";
import { useMoodTracking } from "@/react-app/hooks/useMoodTracking";

export default function Home() {
  const {
    affirmations,
    currentAffirmation,
    loading,
    error,
    generateAffirmations,
    loadAffirmations,
    selectAffirmation,
    toggleFavorite,
    currentIndex,
    updateAffirmation,
    deleteAffirmation,
  } = useAffirmations();

  // Load existing affirmations on mount to prevent navigation loop
  useEffect(() => {
    loadAffirmations();
  }, [loadAffirmations]);

  const { saveMoodTracking } = useMoodTracking();

  const [showAll, setShowAll] = useState(false);
  const [showMoodBefore, setShowMoodBefore] = useState(false);
  const [pendingGenerate, setPendingGenerate] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState<string>("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const handleGenerateNew = async () => {
    // Show mood before modal first
    setShowMoodBefore(true);
    setPendingGenerate(true);
  };

  const handleMoodBeforeSubmit = async (moodBefore: string) => {
    setShowMoodBefore(false);

    // Save mood before
    try {
      const userId = "user_123";
      await saveMoodTracking({
        user_id: userId,
        mood_before: moodBefore,
      });
    } catch (error) {
      console.error("Failed to save mood before:", error);
    }

    // Generate affirmations
    await generateAffirmations();
    setPendingGenerate(false);
  };

  const handlePlayAudio = async () => {
    // Navigate directly to player page
    window.location.href = "/player";
  };

  const handleToggleFavorite = async () => {
    if (currentAffirmation) {
      await toggleFavorite(currentIndex);
    }
  };

  const handleStartEdit = (affirmation: { id?: number; text: string }) => {
    if (affirmation.id) {
      setEditingId(affirmation.id);
      setEditingText(affirmation.text);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingText("");
  };

  const handleSaveEdit = async () => {
    if (editingId && editingText.trim()) {
      setSaving(true);
      try {
        await updateAffirmation(editingId, editingText.trim());
        setEditingId(null);
        setEditingText("");
      } catch (error) {
        console.error("Failed to update affirmation:", error);
      } finally {
        setSaving(false);
      }
    }
  };

  const handleDeleteClick = (affirmationId?: number) => {
    if (affirmationId) {
      setDeletingId(affirmationId);
    }
  };

  const handleConfirmDelete = async () => {
    if (deletingId) {
      setSaving(true);
      try {
        await deleteAffirmation(deletingId);
        setDeletingId(null);
      } catch (error) {
        console.error("Failed to delete affirmation:", error);
      } finally {
        setSaving(false);
      }
    }
  };

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mb-6">
        <Sparkles className="w-12 h-12 text-indigo-400" />
      </div>

      <h2 className="text-xl font-bold text-gray-800 mb-3">
        Ready for your first affirmation?
      </h2>
      <p className="text-gray-600 mb-8 leading-relaxed">
        Let's create personalized affirmations that resonate with your current
        emotional state.
      </p>

      <Button onClick={handleGenerateNew} size="lg">
        <Plus size={20} />
        Generate My First Set
      </Button>
    </div>
  );

  return (
    <GradientBackground>
      <div className="min-h-screen pb-20">
        {/* Header */}
        <div className="px-6 pt-12 pb-6">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Good morning</h1>
              <p className="text-gray-600">Ready for today's affirmation?</p>
            </div>

            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-full flex items-center justify-center shadow-lg">
              <img
                src="/logo.png"
                alt="Profile"
                className="w-6 h-6 opacity-90"
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        {!currentAffirmation && affirmations.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="px-6">
            {/* Current Affirmation Card */}
            {currentAffirmation && (
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl shadow-indigo-500/10 border border-gray-200/50 mb-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/25">
                    <img
                      src="/logo.png"
                      alt="Microphone"
                      className="w-8 h-8 opacity-90"
                    />
                  </div>

                  <p className="text-lg text-gray-800 leading-relaxed mb-8 font-medium">
                    "{currentAffirmation.text}"
                  </p>

                  <div className="flex justify-center space-x-4">
                    <Button
                      variant="secondary"
                      className="flex-1"
                      onClick={handlePlayAudio}
                    >
                      <Play size={18} />
                      Play Audio
                    </Button>

                    <button
                      onClick={handleToggleFavorite}
                      className={`w-12 h-12 bg-white/80 border border-gray-200/50 rounded-xl flex items-center justify-center transition-colors ${
                        currentAffirmation.is_favorite
                          ? "text-red-500 bg-red-50"
                          : "text-gray-600 hover:text-red-500 hover:bg-red-50"
                      }`}
                    >
                      <Heart
                        size={20}
                        fill={
                          currentAffirmation.is_favorite
                            ? "currentColor"
                            : "none"
                        }
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Affirmation List */}
            {affirmations.length > 1 && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Your Set ({affirmations.length})
                  </h3>
                  <button
                    onClick={() => setShowAll(!showAll)}
                    className="text-indigo-600 text-sm font-medium"
                  >
                    {showAll ? "Show Less" : "Show All"}
                  </button>
                </div>

                <div className="space-y-3">
                  {(showAll ? affirmations : affirmations.slice(0, 3)).map(
                    (affirmation, index) => {
                      const isEditing = editingId === affirmation.id;
                      return (
                        <div
                          key={affirmation.id || index}
                          className={`w-full p-4 rounded-2xl border transition-colors ${
                            index === currentIndex
                              ? "bg-indigo-50 border-indigo-200 text-indigo-800"
                              : "bg-white/60 border-gray-200/50 text-gray-700"
                          }`}
                        >
                          {isEditing ? (
                            <div className="space-y-3">
                              <textarea
                                value={editingText}
                                onChange={(e) => setEditingText(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                                rows={3}
                                autoFocus
                              />
                              <div className="flex justify-end space-x-2">
                                <button
                                  onClick={handleCancelEdit}
                                  disabled={saving}
                                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50"
                                >
                                  <X size={16} />
                                </button>
                                <button
                                  onClick={handleSaveEdit}
                                  disabled={saving || !editingText.trim()}
                                  className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <Check size={16} />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start justify-between gap-3">
                              <button
                                onClick={() => selectAffirmation(index)}
                                className="flex-1 text-left"
                              >
                                <p className="text-sm leading-relaxed">
                                  "{affirmation.text}"
                                </p>
                              </button>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStartEdit(affirmation);
                                  }}
                                  className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                  title="Edit"
                                >
                                  <Pencil size={16} />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteClick(affirmation.id);
                                  }}
                                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            )}

            {/* Generate New Button */}
            <Button
              onClick={handleGenerateNew}
              className="w-full mb-6"
              size="lg"
              disabled={loading || pendingGenerate}
            >
              {loading || pendingGenerate ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Plus size={20} />
                  Generate New Set
                </>
              )}
            </Button>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
                <p className="text-red-700 text-sm font-medium mb-2">
                  Unable to Generate Affirmations
                </p>
                <p className="text-red-600 text-sm">{error}</p>
                {error.includes("OpenAI API key") && (
                  <p className="text-red-500 text-xs mt-2">
                    Please configure OPENAI_API_KEY in .dev.vars file for local
                    development.
                  </p>
                )}
              </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 text-center border border-gray-200/50">
                <div className="text-2xl font-bold text-indigo-600 mb-1">0</div>
                <div className="text-xs text-gray-600">Day Streak</div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 text-center border border-gray-200/50">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {affirmations.filter((aff) => aff.is_favorite).length}
                </div>
                <div className="text-xs text-gray-600">Favorites</div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 text-center border border-gray-200/50">
                <div className="text-2xl font-bold text-pink-600 mb-1">
                  {affirmations.length}
                </div>
                <div className="text-xs text-gray-600">Total</div>
              </div>
            </div>
          </div>
        )}

        <BottomNavigation />
      </div>

      {/* Mood Tracking Modals */}
      <MoodTrackingModal
        isOpen={showMoodBefore}
        onClose={() => {
          setShowMoodBefore(false);
          setPendingGenerate(false);
        }}
        onSubmit={handleMoodBeforeSubmit}
        type="before"
      />

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-red-700 flex items-center gap-2">
                <Trash2 size={20} className="text-red-600" />
                Delete Affirmation
              </h3>
              <button
                onClick={() => setDeletingId(null)}
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
                disabled={saving}
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-gray-700">
                Are you sure you want to delete this affirmation? This action cannot be undone.
              </p>
            </div>

            <div className="flex space-x-3 mt-6">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => setDeletingId(null)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                onClick={handleConfirmDelete}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 size={18} className="animate-spin mr-2" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={18} className="mr-2" />
                    Delete
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
